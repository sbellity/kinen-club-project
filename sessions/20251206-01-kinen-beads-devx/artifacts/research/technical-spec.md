---
created: 2025-12-06T11:42:48.413Z
status: draft
last_updated: Round 01
---

# kinen-beads-devx - Technical Specification

## Overview

Design a cohesive developer experience combining **kinen** (structured thinking + design memory) and **beads** (issue tracking) with:
- Clear separation of responsibilities
- Unified VSCode extension
- Background daemon for indexing and coordination
- Semantic search across sessions

## Decisions

| Decision | Round | Rationale |
|----------|-------|-----------|
| kinen = design-time, beads = execution-time | R1 | Clear mental model separation |
| Daemon needed for indexing/coordination | R1 | Background memory consolidation, file watching |
| LanceDB for index storage | Prior session | Native hybrid search, embedded |
| `all-MiniLM-L6-v2` embedding model | Prior session | Local, fast, good quality |
| Per-space indices at `~/.local/share/kinen/` | Prior session | Portable via git origin hash |
| Hybrid search (FTS + semantic) | Prior session | Both precision and discovery |
| Situated chunks in search results | Prior session | Include N chunks context |

## Architecture

### Core Principle: Files as Truth

**PRIMARY STORAGE** = Filesystem (Git-versioned markdown)
- Sessions, rounds, artifacts, memories → Markdown files
- Human-readable, diffable, portable
- Git is the version control layer

**DERIVED INDEX** = LanceDB (ephemeral, rebuildable)
- Built from source files
- Lives outside project (`~/.local/share/kinen/indices/`)
- Never committed to Git
- Can be deleted and rebuilt anytime

```
┌─────────────────────────────────────────────────────────────────┐
│              SOURCE OF TRUTH (Git-versioned)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  space-root/                                                     │
│  ├── sessions/                                                   │
│  │   └── 20251206-01-auth/                                      │
│  │       ├── init.md                                            │
│  │       ├── rounds/01-foundation.md                            │
│  │       ├── artifacts/technical-spec.md                        │
│  │       └── memories/decisions.md   ← extracted, versioned     │
│  └── resources/                                                  │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ watch + index (daemon)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               DERIVED INDEX (NOT versioned)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ~/.local/share/kinen/indices/{space-hash}/                      │
│  ├── chunks.lance/     ← LanceDB: embeddings + FTS               │
│  └── metadata.json     ← Index state                             │
│                                                                  │
│  Benefits:                                                       │
│  • Clone repo → rebuild index → fully functional                 │
│  • No binary blobs in Git                                        │
│  • Index corruption? Just rebuild                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Developer Workflow                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   DESIGN TIME (kinen)              EXECUTION TIME (beads)        │
│   ┌─────────────────┐              ┌─────────────────┐          │
│   │ Sessions (files)│   handoff    │ Issues (files)  │          │
│   │ ├── Rounds      │ ──────────►  │ ├── Tasks       │          │
│   │ ├── Artifacts   │              │ ├── Bugs        │          │
│   │ └── Memories    │              │ └── Deps        │          │
│   └────────┬────────┘              └────────┬────────┘          │
│            │                                │                    │
│            │   Both file-based, Git-versioned                   │
│            └───────────┬────────────────────┘                    │
│                        │                                         │
│                        ▼                                         │
│            ┌───────────────────────┐                            │
│            │    kinen-daemon       │                            │
│            │  ├── File watcher     │                            │
│            │  ├── Index builder    │ ← builds derived index     │
│            │  ├── Memory extractor │ ← writes memory files      │
│            │  └── Search server    │                            │
│            └───────────┬───────────┘                            │
│                        │                                         │
│                        ▼                                         │
│            ┌───────────────────────┐                            │
│            │  Derived Index        │ (rebuildable)              │
│            │  ~/.local/share/kinen │                            │
│            │  └── indices/{hash}/  │                            │
│            └───────────────────────┘                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Daemon Responsibilities

| Function | Trigger | Output |
|----------|---------|--------|
| **File watching** | Session/round changes | Index updates |
| **Memory consolidation** | Session close | Cross-session insights |
| **Semantic indexing** | New content | Embeddings in LanceDB |
| **Coordination** | Concurrent access | Prevent race conditions |
| **Auto-commit** | Round completion | Git commits to space |

### Index Architecture (from prior session)

```
~/.local/share/kinen/indices/{origin-hash}/
├── lance/              # LanceDB hybrid search
│   ├── chunks.lance    # Content chunks + embeddings
│   └── edges.lance     # Wiki-link graph
└── meta.json           # Space metadata, last update
```

### Handoff: kinen → beads

```
Session ends
    │
    ▼
Consolidation extracts:
├── Decisions (→ technical-spec.md)
├── Action items (→ suggested beads issues)
└── Patterns (→ memory index)
    │
    ▼
User confirms issue creation:
  bd create "Implement OAuth2" \
    --deps discovered-from:session/20251206-01-auth
```

## Components

### 1. kinen-daemon

```typescript
interface KinenDaemon {
  // Lifecycle
  start(): Promise<void>;
  stop(): Promise<void>;
  status(): DaemonStatus;
  
  // File watching
  watchSpace(space: Space): void;
  onFileChange(path: string, type: 'create' | 'modify' | 'delete'): void;
  
  // Indexing
  indexDocument(path: string): Promise<void>;
  rebuildIndex(space: Space): Promise<void>;
  
  // Search
  search(query: SearchQuery): Promise<SearchResult[]>;
  
  // Memory
  consolidateSession(session: Session): Promise<Insights>;
  getRelatedSessions(query: string): Promise<Session[]>;
  
  // Coordination
  acquireLock(resource: string): Promise<Lock>;
  releaseLock(lock: Lock): void;
}
```

### 2. VSCode Extension (unified)

```
┌──────────────────────────────────────────┐
│ Explorer Sidebar                          │
├──────────────────────────────────────────┤
│ ▼ KINEN SESSIONS                         │
│   └─ 20251206-01-devx (current)          │
│      ├─ 📄 init.md                       │
│      ├─ 📁 rounds/                       │
│      │  └─ 01-foundation.md              │
│      └─ 📁 artifacts/                    │
│                                          │
│ ▼ BEADS ISSUES                           │
│   ├─ 🔴 kinen-abc: Fix duplicate sessions│
│   └─ 🟡 kinen-def: Add daemon            │
│                                          │
│ ▼ RELATED (from semantic search)         │
│   └─ 20251203-01-resources-indexing      │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Status Bar                               │
├──────────────────────────────────────────┤
│ 🎯 kinen: devx-session │ 📋 bd: 2 ready  │
└──────────────────────────────────────────┘
```

### 3. MCP Tools (combined)

| Tool | Purpose |
|------|---------|
| `kinen_search` | Semantic search across sessions |
| `kinen_context` | Get related sessions for current work |
| `kinen_session_*` | Session management |
| `kinen_daemon_status` | Check daemon health |
| `beads_*` | Issue tracking (existing) |

### 4. Default Prompts (`kinen setup`)

Creates in any project:
- `.cursorrules` — Methodology + beads workflow
- `AGENTS.md` — Combined instructions for AI agents
- `.kinen/config.yml` — Space configuration

## Data Model

### Search Result (situated chunk)

```typescript
interface SearchResult {
  chunk: {
    content: string;
    start_line?: number;
    end_line?: number;
  };
  source: {
    path: string;
    type: 'round' | 'artifact' | 'resource';
    session?: string;
    title: string;
    metadata: Record<string, unknown>;
  };
  context: {
    before: string[];  // N chunks before
    after: string[];   // N chunks after
  };
  score: number;
  match_type: 'semantic' | 'fulltext' | 'hybrid';
}
```

### Memory Entry (as files)

Memories are markdown files in `session/memories/`, NOT database records:

```
sessions/20251206-01-auth/memories/
├── decisions.md      ← Extracted decisions
├── insights.md       ← Synthesized insights
└── manifest.json     ← Metadata for indexing

# decisions.md format:
## D1: Use OAuth2 with PKCE

**Source**: Round 2, Q2.3
**Confidence**: 0.9
**Tags**: auth, mobile, security

We decided to use OAuth2 with PKCE...
```

TypeScript interface (for indexing/search):

```typescript
interface MemoryEntry {
  id: string;
  type: 'decision' | 'pattern' | 'insight';
  content: string;
  sourceSession: string;
  sourceRound?: string;
  confidence: number;
  tags: string[];
  // Note: embedding is computed at index time, not stored in file
}
```

## Open Questions

1. Should daemon be shared between kinen and beads, or separate?
2. How aggressive should memory consolidation be?
3. Should consolidated insights be editable by user?
4. VSCode: one extension or two with shared state?
5. Default context window size (N chunks)?

## Implementation Phases

### Phase 1: Daemon Foundation
- [ ] Basic daemon with file watching
- [ ] LanceDB integration
- [ ] Simple text search (no embeddings yet)
- [ ] `kinen daemon start/stop/status`

### Phase 2: Semantic Search
- [ ] Embedding generation (local model)
- [ ] Hybrid search (FTS + vector)
- [ ] `kinen search` CLI and MCP tool
- [ ] Situated chunks in results

### Phase 3: VSCode Integration
- [ ] Unified extension with kinen + beads
- [ ] Session tree with related content
- [ ] Status bar integration
- [ ] Search panel

### Phase 4: Memory & Consolidation
- [ ] Session-end consolidation
- [ ] Cross-session pattern detection
- [ ] Memory entries storage
- [ ] `kinen recall` command

### Phase 5: kinen ↔ beads Integration
- [ ] Auto-suggest issues from sessions
- [ ] Link issues to source sessions
- [ ] Combined status view

## Multi-Tool Workflow: Obsidian + VSCode

### Two Modes of Working

| Mode | Tool | Use Case |
|------|------|----------|
| **Thinking** | Obsidian (mobile + desktop) | Reading, brainstorming, creative, on-the-go |
| **Building** | VSCode/Cursor | Technical, code, agents, beads orchestration |

### Same Files, Different Views

```
kinen-space/                        # Single source of truth
├── sessions/                       # Synced everywhere
│   └── ...
└── .kinen/

↓ Synced via iCloud/Git ↓

📱 Obsidian Mobile    💻 Obsidian Desktop    🔧 VSCode/Cursor
├── Read sessions     ├── Read + edit        ├── Technical sessions
├── Brainstorm        ├── Graph view         ├── Code context
├── Quick capture     ├── Dataview           ├── Agent assistance
└── Review            └── Light editing      └── beads → issues
```

## kinen vs Obsidian: Build Our Own, Obsidian Provides Visual Layer

### Architecture Decision

**kinen builds its own capabilities in LanceDB** — Obsidian provides visual alternatives.

```
┌─────────────────────────────────────────────────────────────────┐
│                    KINEN DAEMON (LanceDB)                       │
│              Builds its own index from markdown files           │
├─────────────────────────────────────────────────────────────────┤
│  • Chunks + embeddings        → Semantic search                 │
│  • Wiki-link edges            → Graph traversal, backlinks      │
│  • Frontmatter index          → Structured queries              │
│  • Full-text index            → Keyword search                  │
└─────────────────────────────────────────────────────────────────┘
              │                                    │
       CLI / MCP                            HTTP API
              │                                    │
┌─────────────┴─────────────┐          ┌──────────┴──────────┐
│       KINEN CLI/MCP        │          │   OBSIDIAN PLUGIN   │
│                            │          │   (optional)        │
│  kinen search "auth"       │          │   Uses same API     │
│  kinen backlinks session   │          │                     │
│  kinen related session     │          │   + Native Obsidian │
│  kinen graph               │          │   • Graph View      │
│  kinen query "type=dec"    │          │   • Backlinks panel │
│                            │          │   • Dataview        │
└────────────────────────────┘          └─────────────────────┘
```

### Feature Mapping: kinen CLI vs Obsidian

| Feature | kinen CLI/MCP | Obsidian Native |
|---------|---------------|-----------------|
| **Semantic search** | `kinen search "how we handle auth"` | ❌ (needs our plugin) |
| **Keyword search** | `kinen search --fts "OAuth"` | ✅ Built-in search |
| **Backlinks** | `kinen backlinks session-name` | ✅ Backlinks panel |
| **Graph traversal** | `kinen related session-name` | ✅ Graph view (visual) |
| **Structured queries** | `kinen query "type=decision"` | ✅ Dataview plugin |
| **Wiki-link completion** | ❌ (editor feature) | ✅ Native |

### What kinen Indexes in LanceDB

```sql
-- Chunks table (semantic search)
chunks (
  id: String,              -- blake3 hash
  content: String,         -- chunk text
  embedding: Vec<f32>,     -- 384 dims
  path: String,            -- file path
  session: String,
  type: String,            -- round, artifact, decision, etc.
  line_start: Int,
  line_end: Int
)

-- Edges table (wiki-link graph)
edges (
  source_path: String,     -- file containing the link
  target_path: String,     -- file being linked to
  link_text: String,       -- [[this text]]
  context: String,         -- surrounding text
  line_number: Int
)

-- Metadata table (frontmatter index)
metadata (
  path: String,
  artifact_type: String,
  tags: List<String>,
  session: String,
  status: String,
  confidence: Float,
  date: Timestamp,
  -- ... all frontmatter fields
)
```

### Example: Backlinks

**kinen CLI** (works without Obsidian):
```bash
$ kinen backlinks 20251206-01-kinen-beads-devx

Files that link to this session:

  sessions/20251203-01-resources-indexing/rounds/02-technical.md:45
    "See also [[20251206-01-kinen-beads-devx]] for the final architecture"

  sessions/20251112-01-obsidian-integration/session-summary.md:12
    "This work continued in [[20251206-01-kinen-beads-devx]]"
```

**Obsidian** (same data, visual):
- Open file → Backlinks panel shows same links
- Click to navigate

### Example: Related Sessions

**kinen CLI** (semantic similarity via embeddings):
```bash
$ kinen related 20251206-01-kinen-beads-devx --limit 5

Related sessions (by semantic similarity):

  0.92  20251112-01-obsidian-integration
        "Obsidian integration, plugin architecture"
  
  0.87  20251203-01-kinen-resources-indexing
        "LanceDB, hybrid search, chunking strategy"
  
  0.73  20251112-02-kinen-obsidian-poc
        "POC implementation, FAM integration"
```

**Obsidian** (visual):
- Graph view shows connected sessions
- Local graph centered on current note

### Example: Structured Queries

**kinen CLI** (SQL-like on frontmatter):
```bash
$ kinen query "artifact_type = 'decision' AND confidence > 0.8" --format table

| Session                    | Decision | Confidence |
|----------------------------|----------|------------|
| 20251206-01-kinen-beads    | D3.1     | 0.9        |
| 20251112-01-obsidian       | D2.3     | 0.85       |
```

**Obsidian Dataview** (same query, different syntax):
```dataview
TABLE confidence, session
FROM "sessions"
WHERE artifact_type = "decision" AND confidence > 0.8
```

### Critical: Consolidation Writes to Files, Not Just Index

**The files ARE the knowledge graph.** kinen consolidation must write:

1. **Wiki-links in content** — so Obsidian shows backlinks automatically
2. **Structured frontmatter** — so both kinen and Dataview can query
3. **Memory files** — decisions, insights, patterns as markdown

**Example: Decision Extraction**

When kinen extracts a decision from a round, it writes a file:

```markdown
<!-- sessions/20251206-01-devx/memories/D3.1-use-lancedb.md -->
---
artifact_type: decision
id: D3.1
date: 2025-12-06T14:00:00Z
session: "[[20251206-01-kinen-beads-devx]]"
source_round: "[[rounds/03-shipping-plan]]"
source_question: Q3.1
confidence: 0.9
tags:
  - domain/architecture
  - tech/lancedb
  - tech/search
related:
  - "[[hybrid-search]]"
  - "[[semantic-search]]"
supersedes: null
summary: "Use LanceDB for hybrid search indexing"
---

# D3.1: Use LanceDB for Indexing

**Source**: [[rounds/03-shipping-plan#Q3.1|Round 3, Q3.1]]

## Decision

We decided to use LanceDB because it provides native hybrid search 
(FTS + vector) in one embedded database.

## Rationale

- Simpler than SQLite + extensions
- Native TypeScript SDK
- Built-in Tantivy for FTS
- No server to manage

## Related Decisions

- See also [[D2.3-daemon-architecture]] for how search fits into daemon
- Supersedes earlier consideration of [[DuckDB]]

## Context

This decision was made in [[20251206-01-kinen-beads-devx]] after 
reviewing [[20251203-01-kinen-resources-and-indexing]] and prior 
implementations in [[kinen-rs]] and [[kinen-go]].
```

**What this achieves:**

| In File | kinen Index | Obsidian |
|---------|-------------|----------|
| `session: "[[...]]"` | Parsed → edges table | Backlink to session |
| `source_round: "[[...]]"` | Parsed → edges table | Backlink to round |
| `related: [...]` | Parsed → edges table | Graph connections |
| `confidence: 0.9` | Indexed → metadata table | Dataview queryable |
| `tags: [...]` | Indexed → metadata table | Tag search |
| Body wiki-links | Parsed → edges table | Clickable + backlinks |

### Consolidation Pipeline: Files First

```
Round completed
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONSOLIDATION                                │
│                                                                  │
│  1. Extract decisions, insights, patterns from round            │
│  2. WRITE as markdown files with:                               │
│     • Wiki-links to sources [[round]], [[session]]              │
│     • Structured frontmatter (type, confidence, tags)           │
│     • Related links to other decisions [[D2.3]]                 │
│  3. Files are committed to Git                                  │
└─────────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INDEXING (derived)                           │
│                                                                  │
│  1. Daemon watches for file changes                             │
│  2. Parses wiki-links → edges table                             │
│  3. Parses frontmatter → metadata table                         │
│  4. Chunks content → embeddings table                           │
│  5. Index is fully rebuildable from files                       │
└─────────────────────────────────────────────────────────────────┘
```

### Why Build Our Own?

1. **Works without Obsidian** — CLI, MCP, VSCode all functional
2. **Semantic search** — Obsidian doesn't have this natively
3. **Consistent API** — Same features across all interfaces
4. **Portable** — Index can be rebuilt from files anywhere
5. **Agent-friendly** — MCP tools work for AI assistants
6. **Files ARE the graph** — Wiki-links in content, not just database

### When to Use Obsidian Features?

| Use Case | Use kinen | Use Obsidian |
|----------|-----------|--------------|
| Find sessions about a topic | `kinen search` (semantic) | Graph exploration |
| See what links to a file | `kinen backlinks` | Backlinks panel |
| Query by metadata | `kinen query` | Dataview |
| Visual exploration | ❌ | Graph view |
| Quick navigation | ❌ | Wiki-link clicking |

**Rule**: kinen for programmatic/agent access, Obsidian for visual/human exploration.

## Obsidian as Progressive Enhancement

### Core Principle: kinen space = Obsidian vault (optional)

A kinen space CAN BE opened as an Obsidian vault. No translation, no dependency — same files.

```
kinen-space/                        = Obsidian vault
├── .obsidian/                      # Obsidian config (optional)
│   ├── plugins/kinen-obsidian/     # kinen plugin
│   └── templates/                  # Session/round templates
├── .kinen/
│   └── config.yml
├── sessions/
│   └── YYYYMMDD-NN-topic/
│       ├── init.md                 # With frontmatter
│       ├── rounds/                 # Wiki-linked
│       ├── artifacts/
│       └── memories/               # Extracted decisions
└── resources/
```

### Obsidian Features to Leverage

| Feature | kinen Use |
|---------|-----------|
| **Wiki-links** | `[[session-name]]` for cross-references |
| **Graph View** | Visualize session/decision relationships |
| **Properties** | Structured frontmatter for decisions, rounds |
| **Dataview** | Query decisions, build dashboards |
| **Canvas** | Visual session planning |
| **Templater** | Session/round creation |
| **URI scheme** | Deep-link from CLI: `obsidian://open?vault=kinen&file=...` |

### Frontmatter Standard

All kinen files include structured YAML frontmatter:

```yaml
---
type: kinen-session | kinen-round | decision | insight
session: "[[20251206-01-kinen-beads-devx]]"
status: active | completed
confidence: 0.9
tags: [architecture, database]
related:
  - "[[LanceDB]]"
  - "[[hybrid-search]]"
---
```

### Integration Phases

1. **Obsidian-ready** — kinen files work in Obsidian out of the box
2. **Dataview queries** — Pre-built dashboards as templates
3. **Obsidian plugin** — Native commands, views, daemon integration

## References

- [[sessions/20251203-01-kinen-resources-and-indexing/init|Prior session: Resources & Indexing]]
- [[obsidian-integration|Obsidian Integration Research]]
- [BeaconBay/ck](https://github.com/BeaconBay/ck) - Semantic search UX inspiration
- [LanceDB docs](https://lancedb.github.io/lancedb/)
- [Obsidian Plugin API](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Dataview Documentation](https://blacksmithgu.github.io/obsidian-dataview/)
