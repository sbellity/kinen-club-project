# Obsidian Integration Research

## Prior Work Reference

**IMPORTANT**: This builds on extensive prior research (now imported into this space):
- [[20251112-01-obsidian-integration]] — 5-round exploration session (COMPLETE)
- [[20251112-02-kinen-obsidian-poc]] — POC implementation session (in progress)

**Key artifacts from prior sessions**:
- [[20251112-01-obsidian-integration/artifacts/plugin-integration-spec|plugin-integration-spec.md]] — Complete FAM + Obsidian plugin architecture
- [[20251112-01-obsidian-integration/artifacts/methodology-obsidian|methodology-obsidian.md]] — Updated methodology for Obsidian (agent system prompt)
- [[20251112-01-obsidian-integration/artifacts/tag-glossary|tag-glossary.md]] — Comprehensive tag system with prefixes
- [[20251112-01-obsidian-integration/artifacts/session-templates/|session-templates/]] — Templates for different session types

---

## Design Philosophy: Obsidian as Enhancement, Not Dependency

### Core Principle

**kinen works perfectly standalone** — Obsidian is a bonus, not a requirement.

```
┌─────────────────────────────────────────────────────────────────┐
│                     KINEN CORE                                  │
│        (works with any editor: vim, VSCode, Obsidian)           │
├─────────────────────────────────────────────────────────────────┤
│  • Markdown files (human-readable, Git-friendly)                │
│  • Wiki-links [[...]] (universal markdown extension)            │
│  • YAML frontmatter (standard metadata)                         │
│  • CLI + MCP tools (editor-agnostic)                            │
│  • Daemon with HTTP API (any client can use)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ If user opens in Obsidian...
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OBSIDIAN BONUS FEATURES                       │
│              (automatic, zero configuration)                    │
├─────────────────────────────────────────────────────────────────┤
│  • Graph View → kinen sessions become visible knowledge graph   │
│  • Backlinks → see what references each decision                │
│  • Dataview → query decisions, patterns across sessions         │
│  • Canvas → visual session planning                             │
│  • Callouts → pretty rendering of answers                       │
│  • Templater → advanced round/session creation                  │
└─────────────────────────────────────────────────────────────────┘
```

### What This Means in Practice

| Feature | Without Obsidian | With Obsidian |
|---------|------------------|---------------|
| **Session files** | ✅ Plain markdown, any editor | ✅ Same files, prettier rendering |
| **Wiki-links** | ✅ Work in VSCode, GitHub | ✅ + clickable navigation + backlinks |
| **Frontmatter** | ✅ Readable YAML | ✅ + native Properties UI |
| **Search** | ✅ CLI `kinen search` | ✅ + plugin integration |
| **Graph view** | ❌ Not available | ✅ Free with Obsidian |
| **Dataview queries** | ❌ Not available | ✅ Free with Obsidian |
| **Callouts** | ✅ Render as blockquotes | ✅ + colored boxes |

**Key insight**: We don't build Obsidian-specific features. We build **standard markdown features that Obsidian happens to enhance**.

---

## Two Modes: Mobile Thinking vs Desktop Building

### The Workflow Vision

```
┌─────────────────────────────────────────────────────────────────┐
│                    OBSIDIAN (Mobile + Desktop)                  │
│                 "Thinking mode" — on the go                     │
├─────────────────────────────────────────────────────────────────┤
│  📱 Mobile: Read past sessions, brainstorm, capture ideas       │
│  💻 Desktop: Review sessions, explore graph, light editing      │
│                                                                  │
│  Best for:                                                       │
│  • Reading/reviewing past sessions                              │
│  • Pure brainstorming (no code needed)                          │
│  • Creative writing sessions                                     │
│  • Quick idea capture on the go                                  │
│  • Exploring connections via graph view                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Same files, synced
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VSCODE + CURSOR                              │
│              "Building mode" — at the desk                      │
├─────────────────────────────────────────────────────────────────┤
│  🔧 Technical sessions with code access                         │
│  🤖 Agent-driven work orchestrated with beads                   │
│  🧪 Hybrid design/research POC with implementation              │
│                                                                  │
│  Best for:                                                       │
│  • Architecture sessions that reference codebase                │
│  • Implementation planning → beads issues                       │
│  • Agent-assisted coding with context from sessions             │
│  • Technical specs that need code examples                      │
└─────────────────────────────────────────────────────────────────┘
```

### Sync Strategy

**Files live in one place**, synced to both:

```
~/kinen/default/                    # The actual files
├── sessions/
├── resources/
└── .kinen/

Synced via:
├── iCloud (for Obsidian mobile)    # Or Obsidian Sync
├── Git (for version control)       # Primary source of truth
└── Local filesystem (VSCode)       # Direct access
```

**Workflow example**:

1. **Morning commute** (Obsidian mobile)
   - Review yesterday's session
   - Jot down new ideas in a brainstorming session
   - Read related past sessions via graph

2. **At desk** (VSCode/Cursor)
   - Continue the session with code context
   - Agent generates implementation plan
   - Create beads issues for the work
   - Agents implement, tracked via beads

3. **Evening review** (Obsidian mobile)
   - Read what was accomplished
   - Capture thoughts for tomorrow

### What Each Tool Provides

| Capability | Obsidian Mobile | VSCode/Cursor |
|------------|-----------------|---------------|
| **Read sessions** | ✅ Beautiful | ✅ Good |
| **Edit sessions** | ✅ Good | ✅ Good |
| **Graph view** | ✅ Native | ❌ |
| **Code access** | ❌ | ✅ Full IDE |
| **Agent assistance** | ❌ | ✅ Cursor/Copilot |
| **beads integration** | ❌ | ✅ MCP tools |
| **Semantic search** | ✅ via daemon API | ✅ via daemon API |
| **Offline** | ✅ | ✅ |

### Session Types by Tool

| Session Type | Best Tool | Why |
|--------------|-----------|-----|
| **Brainstorming** | Obsidian (mobile OK) | Pure thinking, no code |
| **Creative writing** | Obsidian | Focused writing environment |
| **Architecture review** | Either | Depends if code needed |
| **Technical spec** | VSCode | Code examples, agent help |
| **Implementation plan** | VSCode | Creates beads issues |
| **Research synthesis** | Obsidian | Reading/connecting ideas |
| **POC with code** | VSCode | Agents do implementation |

---

## Executive Summary

Obsidian is **perfectly aligned** with kinen's core architecture:
- **Files as truth** ✅ Local markdown, Git-friendly
- **Human-readable** ✅ Plain text, no proprietary formats
- **Bidirectional linking** ✅ `[[wiki-links]]` for knowledge graphs
- **Extensible** ✅ 2,600+ plugins, custom development API

**Recommendation**: Build kinen with standard markdown conventions that Obsidian naturally enhances. No Obsidian dependency, but Obsidian users get bonus features for free.

---

## Key Decisions from Prior Sessions (November 2025)

These decisions were already made in the `20251112-01-obsidian-integration` session:

### Architecture Decisions

| Decision | Detail | Rationale |
|----------|--------|-----------|
| **Vault = Workspace** | One Obsidian vault = one kinen space | Direct mapping, no translation |
| **Hybrid Storage** | Vault (primary) + SQLite (transient) + DuckDB (queries) | Best of all worlds |
| **Rehydration** | Can rebuild state from vault files | Loss of DB is not catastrophic |
| **HTTP API** | Plugin ↔ daemon via localhost:8080 | Simple, language-agnostic |
| **No context switching** | Entire workflow within Obsidian | Critical UX requirement |

### Convention Decisions

| Decision | Format | Example |
|----------|--------|---------|
| **Callout format** | `> [!note] Answer` | Replaces `>>` markers |
| **File naming** | `NN-topic-name.md` | `01-linking-conventions.md` |
| **Tag prefixes** | `domain/`, `type/`, `status/`, `tech/` | `#domain/architecture` |
| **Aliases** | Session-prefixed | `"session-name - Round 1"` |
| **Pre-populated callouts** | AI creates empty blocks | User just types inside |

### Plugin Architecture (from prior spec)

```
┌─────────────────────────────────────────────────────────┐
│              Obsidian Vault (Kinen Sessions)            │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Kinen Obsidian Plugin (TypeScript)          │  │
│  │  - Session management UI                          │  │
│  │  - Round creation/editing                         │  │
│  │  - Callout helpers                                │  │
│  │  - Dashboard generation                           │  │
│  │  - Status bar integration                         │  │
│  └───────────────────┬──────────────────────────────┘  │
│                      │ HTTP API (localhost:8080)        │
└──────────────────────┼──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│           Kinen Daemon (TypeScript/Go)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Orchestrator (LLM-powered)                │  │
│  │  - Creates rounds based on methodology            │  │
│  │  - Suggests links to related sessions             │  │
│  │  - Extracts decisions from rounds                 │  │
│  │  - Generates cross-session insights               │  │
│  │  - Semantic search orchestration                  │  │
│  └───────────────────┬──────────────────────────────┘  │
│  ┌───────────────────▼──────────────────────────────┐  │
│  │    Storage Layer                                  │  │
│  │  - Reads/writes Obsidian vault files              │  │
│  │  - LanceDB for embeddings/FTS (instead of DuckDB) │  │
│  │  - Checkpointing to temp folder                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Note**: Prior spec used DuckDB for queries/indexing. We're now recommending **LanceDB** for simpler hybrid search.

---

## Obsidian Core Features (Relevant to kinen)

### 1. Local-First Markdown Storage

Obsidian operates on a folder of plain `.md` files called a "vault". This is exactly kinen's model.

```
obsidian-vault/       ←→  kinen-space/
├── Daily notes/           ├── sessions/
├── Projects/              ├── resources/
├── Templates/             └── .kinen/
└── .obsidian/                 config.yml
    └── plugins/
```

**Key insight**: A kinen space IS an Obsidian vault. No translation needed.

### 2. Wiki-Links & Backlinks

Obsidian's `[[wiki-link]]` syntax creates bidirectional connections:

```markdown
## Decision: Use LanceDB

We chose [[LanceDB]] because of [[hybrid-search]] capabilities.
See also: [[20251203-01-kinen-resources-indexing]]
```

Obsidian automatically:
- Tracks all outgoing links
- Generates backlinks (what links TO this note)
- Shows "unlinked mentions" (text that matches but isn't linked)

**kinen opportunity**: Use wiki-links extensively in rounds and artifacts.

### 3. Graph View

Visual representation of all connections between notes. Shows:
- Local graph (neighbors of current note)
- Global graph (entire vault)
- Filtering by tags, folders, link depth

**kinen opportunity**: Sessions, decisions, and artifacts become visible as a connected knowledge graph without any extra work.

### 4. Properties (YAML Frontmatter)

Obsidian 1.4+ has native support for structured metadata:

```yaml
---
type: decision
session: 20251206-01-kinen-beads-devx
round: 3
confidence: 0.9
tags:
  - architecture
  - database
related:
  - "[[LanceDB]]"
  - "[[hybrid-search]]"
---
```

Properties are:
- Searchable via Obsidian's search
- Queryable via Dataview plugin
- Editable via a nice UI in Obsidian

**kinen opportunity**: Standardize frontmatter for sessions, rounds, decisions, and memories.

### 5. Canvas (Infinite Visual Thinking)

Obsidian Canvas provides spatial organization:
- Infinite 2D canvas
- Embed notes, images, links, text cards
- Group and connect items visually
- Stored as JSON, but human-readable

**kinen opportunity**: Session planning, architecture visualization, decision maps.

### 6. Dataview Plugin

SQL-like queries across your vault:

```dataview
TABLE type, confidence, session
FROM "sessions"
WHERE type = "decision"
SORT confidence DESC
```

Or inline queries:

```markdown
Decisions from this session: `= this.file.inlinks.file.name`
```

**kinen opportunity**: Dynamic dashboards showing:
- All decisions across sessions
- Sessions by topic
- Unresolved questions
- Cross-session patterns

### 7. Templater Plugin

Advanced templates with JavaScript:

```markdown
<%* 
const sessionName = await tp.system.prompt("Session name?");
const today = tp.date.now("YYYYMMDD");
const nn = await getNextSessionNumber(today);
-%>
# Session: <% sessionName %>
Created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
```

**kinen opportunity**: Integrate with existing kinen session/round creation.

### 8. Callout Format (Critical UX Decision)

**Source**: Prior session decided to replace `>>` markers with Obsidian callouts.

**Format**:
```markdown
> [!note] Answer
> Your response here
```

**Why this matters**:
- Non-technical users don't need to learn any syntax
- AI pre-populates empty callouts — user just types inside
- Renders beautifully in Obsidian
- Portable to other markdown editors

**Pre-population example**:
```markdown
### Q2.3: Authentication Flow

What authentication approach should we use for the mobile app?

**Options**:
- A) OAuth2 with PKCE
- B) Magic links
- C) Traditional password

> [!note] Answer
> 

---
```

User just clicks inside and types — no special syntax needed.

### 9. URI Scheme

Obsidian registers `obsidian://` URLs for external integration:

```
obsidian://open?vault=kinen&file=sessions/20251206-01/rounds/01-foundation
obsidian://search?vault=kinen&query=tag:decision
obsidian://new?vault=kinen&name=sessions/new-session/init&content=...
```

**kinen opportunity**: CLI and VSCode can deep-link directly into Obsidian.

---

## Integration Strategies

### Strategy 1: Progressive Enhancement (Recommended)

**kinen is editor-agnostic** — Obsidian features "light up" automatically.

```
~/kinen-space/                      # Just a kinen space
├── .kinen/
│   └── config.yml                  # kinen config
├── sessions/
│   └── 20251206-01-devx/
│       ├── init.md                 # Standard markdown + frontmatter
│       ├── rounds/
│       ├── artifacts/
│       └── memories/
├── resources/
└── README.md

# User can open this folder in:
# - vim/neovim        → works fine
# - VSCode            → works fine, kinen extension adds features
# - Obsidian          → graph view, dataview, backlinks "just work"
# - Any markdown app  → works fine
```

**How it works**:
1. **kinen generates standard markdown** with wiki-links, frontmatter, callouts
2. **These are universal conventions** — not Obsidian-specific
3. **Obsidian recognizes them** and provides enhanced UX
4. **Other editors** still work, just without the extras

**No `.obsidian/` folder by default** — user adds it themselves if they want Obsidian.

### Strategy 2: Optional Obsidian Setup

For users who explicitly want Obsidian features:

```bash
kinen init --obsidian    # Adds .obsidian/ with recommended config
```

Creates:
```
.obsidian/
├── app.json             # Basic Obsidian settings
├── community-plugins.json
├── templates/           # kinen templates for Templater
└── snippets/            # CSS for kinen callouts
```

**This is opt-in** — kinen works perfectly without it.

### Strategy 3: Obsidian Plugin (Future, Optional)

Develop a native Obsidian plugin that provides:

1. **Commands**:
   - `kinen: New Session` — create session with template
   - `kinen: New Round` — create next round
   - `kinen: Summarize Session` — generate summary
   - `kinen: Search` — semantic search across sessions

2. **Views**:
   - Session sidebar (like VSCode extension)
   - Decision timeline
   - Memory dashboard

3. **Integration**:
   - Talk to kinen daemon via HTTP/WebSocket
   - Trigger indexing on file changes
   - Show search results inline

**Plugin architecture**:

```typescript
// obsidian-plugin/main.ts
import { Plugin, WorkspaceLeaf } from 'obsidian';

export default class KinenPlugin extends Plugin {
  async onload() {
    // Register commands
    this.addCommand({
      id: 'new-session',
      name: 'New Session',
      callback: () => this.createSession()
    });
    
    // Register view
    this.registerView(
      'kinen-sessions',
      (leaf: WorkspaceLeaf) => new SessionsView(leaf, this)
    );
    
    // Connect to daemon
    this.daemon = await connectToDaemon();
  }
  
  async createSession() {
    const name = await this.promptForName();
    await this.daemon.createSession(name);
    // Open init.md
  }
  
  async semanticSearch(query: string) {
    return await this.daemon.search(query);
  }
}
```

### Strategy 3: Dataview-First Approach

Instead of building custom views, leverage Dataview heavily:

**Dashboard note** (`_dashboard.md`):

```markdown
# kinen Dashboard

## Active Sessions
```dataview
TABLE status, file.cday as "Started"
FROM "sessions"
WHERE contains(file.name, "init")
SORT file.cday DESC
LIMIT 5
```

## Recent Decisions
```dataview
TABLE confidence, session, round
FROM "sessions"
WHERE type = "decision"
SORT file.mday DESC
LIMIT 10
```

## Open Questions
```dataview
LIST
FROM "sessions"
WHERE type = "question" AND status != "answered"
```
```

**Benefits**:
- No plugin maintenance
- Users can customize dashboards
- Portable (just markdown files)

---

## Recommended Frontmatter Schemas

**Source**: `20251112-01-obsidian-integration/artifacts/methodology-obsidian.md`

### Session init.md

```yaml
---
date: 2025-12-06T11:42:00Z          # ISO 8601 with time
artifact_type: session_init
aliases:
  - "session-name - Session Initialization"
tags:
  - space/p                          # Always include space
  - domain/architecture              # Domain tag (required)
  - type/iterative-design            # Session type
  - status/in-progress               # Current status
  - tech/kinen                       # Technologies involved
fam_session_id: sess-001             # For daemon coordination
fam_status: in-progress
fam_current_round: 0
summary: "Session description"       # Quoted if contains colons
---
```

### Round file

```yaml
---
date: 2025-12-06T12:30:00Z
artifact_type: round_exploration
aliases:
  - "session-name - Topic Name"
  - "session-name - Round 1"
tags:
  - space/p
  - round-01
fam_round_number: 1
fam_status: in-progress
summary: "Round description"
---
```

### Decision/Memory

```yaml
---
date: 2025-12-06T14:00:00Z
artifact_type: decision
aliases:
  - "session-name - Decision D3.1"
tags:
  - space/p
  - domain/architecture
  - tech/lancedb
id: D3.1
session: "[[20251206-01-kinen-beads-devx]]"
round: 3
confidence: 0.9
related:
  - "[[hybrid-search]]"
  - "[[semantic-search]]"
supersedes: null
superseded_by: null
summary: "Use LanceDB for hybrid search indexing"
---

# D3.1: Use LanceDB for Indexing

We decided to use LanceDB because...
```

### Tag Prefixes (from tag-glossary.md)

| Prefix | Purpose | Examples |
|--------|---------|----------|
| `space/` | Which workspace | `space/p`, `space/nest` |
| `domain/` | Area of work | `domain/architecture`, `domain/research` |
| `type/` | Session type | `type/iterative-design`, `type/technical-spec` |
| `status/` | Current state | `status/in-progress`, `status/complete` |
| `stakeholder/` | Who's involved | `stakeholder/backend`, `stakeholder/product` |
| `tech/` | Technologies | `tech/go`, `tech/typescript`, `tech/obsidian` |

---

## Key Obsidian Plugins to Leverage

### Must-Have

| Plugin | Purpose |
|--------|---------|
| **Dataview** | Query across sessions, build dashboards |
| **Templater** | Session/round templates with logic |
| **Graph Analysis** | Enhanced graph metrics and clustering |
| **Backlinks in document** | Show backlinks inline |

### Nice-to-Have

| Plugin | Purpose |
|--------|---------|
| **Canvas** | Visual session planning |
| **Excalidraw** | Architecture diagrams |
| **Tasks** | Track action items from sessions |
| **Calendar** | Timeline view of sessions |
| **Outliner** | Better list editing for rounds |
| **Various Complements** | Autocomplete for wiki-links |

### AI/Search Plugins (Alternatives to kinen search)

| Plugin | How it works |
|--------|--------------|
| **Smart Connections** | Local embeddings, semantic search, AI chat |
| **Copilot** | LLM integration with vault context |
| **Omnisearch** | Enhanced full-text search |

**Consideration**: Should kinen's search be a standalone daemon OR an Obsidian plugin? Could be both — daemon for CLI/MCP, plugin uses same API.

---

## Implementation Plan: Obsidian as Progressive Enhancement

### Phase 1: Standard Markdown That Obsidian Loves (Week 1)

**No Obsidian dependency** — just good markdown conventions:

1. **Wiki-links everywhere**
   - `[[session-name]]` links in generated content
   - Works in: GitHub, VSCode, Obsidian, any wiki-link aware editor
   - kinen daemon indexes these for its own graph/search

2. **Rich frontmatter**
   - All kinen files get proper YAML frontmatter
   - Include `artifact_type`, `tags`, `related`, `summary`
   - Standard YAML — readable by any tool

3. **Callout syntax for answers**
   - Use `> [!note] Answer` format
   - Renders as blockquote in basic editors
   - Renders as colored callout in Obsidian

4. **No `.obsidian/` by default**
   - kinen works without Obsidian
   - User opens folder in Obsidian if they want → features "light up"

### Phase 2: Optional Obsidian Enhancements (Week 2)

**Opt-in** for users who want Obsidian-specific features:

1. **`kinen init --obsidian` flag**
   - Creates `.obsidian/` with recommended settings
   - Adds Templater templates for rounds/sessions
   - Includes CSS snippets for kinen styling

2. **Dataview dashboard templates**
   - Ship as markdown files (work without Dataview, just show code blocks)
   - Users with Dataview see live queries
   - Include: `_dashboard.md`, `_decisions.md`, `_patterns.md`

3. **URI scheme support**
   - `kinen open session-name` detects Obsidian and uses `obsidian://`
   - Falls back to system default editor if no Obsidian

### Phase 3: Obsidian Plugin (Future, Optional)

**Only if there's demand** — core features work without it:

1. **Commands** (nice-to-have)
   - New session, new round via Command Palette
   - Semantic search with inline results

2. **Views** (nice-to-have)
   - Sessions sidebar
   - Decision timeline

3. **Daemon integration** (nice-to-have)
   - HTTP client to kinen daemon
   - Real-time search

**Key point**: The plugin is a convenience, not a necessity. All functionality available via CLI/MCP.

---

## Comparison: Obsidian vs VSCode — Complementary, Not Competing

| Aspect | Obsidian | VSCode/Cursor |
|--------|----------|---------------|
| **Primary use** | Thinking, reading, brainstorming | Building, coding, agent work |
| **Mobile** | ✅ Excellent app | ❌ Not practical |
| **Graph view** | ✅ Native | ❌ |
| **Code access** | ❌ | ✅ Full IDE |
| **Agent orchestration** | ❌ | ✅ Cursor agents + beads |
| **beads integration** | ❌ | ✅ Via MCP |
| **Offline** | ✅ | ✅ |
| **Best for sessions** | Brainstorming, creative, research | Technical, implementation, POC |

**Strategy**: Build for both, but different features:

| Tool | kinen Features |
|------|----------------|
| **Obsidian** | Read sessions, graph view, light editing, mobile access |
| **VSCode** | Technical sessions, code context, agent work, beads orchestration |
| **CLI/MCP** | Shared: search, session management, daemon (editor-agnostic) |

**Recommendation**: 
- **Obsidian** = consumption + light creation (mobile-friendly)
- **VSCode** = production + technical work (agent-driven)
- **Daemon** = shared backend (works with both)

---

## Sample kinen + Obsidian Workflow

### 1. Start Session

```bash
kinen session new "Auth redesign"
# Creates: sessions/20251206-02-auth-redesign/init.md
# Opens in Obsidian via URI scheme
```

In Obsidian, user sees:
- Session init.md with frontmatter
- Template-generated structure
- Wiki-links to related sessions

### 2. Create Rounds

In Obsidian (via Templater or plugin):
- `Cmd+P` → "kinen: New Round"
- Prompts for focus
- Creates `rounds/01-foundation.md` with template

### 3. Review in Graph

Open Graph View:
- Session as node
- Rounds as connected nodes
- Links to other sessions visible
- Decisions highlighted

### 4. Query Decisions

Open dashboard note:
```dataview
TABLE confidence, session
FROM "sessions" 
WHERE type = "decision" AND session = this.file.link
```

### 5. Semantic Search

`Cmd+P` → "kinen: Search"
- Query: "how we handle auth"
- Results from daemon's LanceDB index
- Click to navigate to source

---

## Open Questions

1. **Should kinen daemon BE an Obsidian plugin?**
   - Pro: Single integration point, access to Obsidian APIs
   - Con: Requires Obsidian running, less portable

2. **How to handle non-Obsidian users?**
   - CLI and VSCode should work independently
   - Obsidian is optional enhancement, not requirement

3. **Plugin distribution?**
   - Community plugin store (requires review)
   - Direct install via GitHub
   - Part of `kinen setup`?

4. **Dataview vs custom queries?**
   - Dataview is powerful but requires learning
   - Could ship pre-built queries as templates
   - Custom plugin views for non-technical users

---

---

## Synthesis: What's New vs Already Decided

### Already Decided (November 2025 sessions)

| Decision | Status |
|----------|--------|
| Callout format (`> [!note] Answer`) | ✅ Confirmed — universal markdown |
| Tag prefixes (`domain/`, `type/`, etc.) | ✅ Confirmed — in frontmatter |
| File naming (`NN-topic-name.md`) | ✅ Confirmed |
| Aliases with session prefix | ✅ Confirmed — in frontmatter |
| HTTP API for daemon | ✅ Confirmed |
| Pre-populated callouts | ✅ Confirmed |

### Updated in This Session

| Decision | Change | Rationale |
|----------|--------|-----------|
| **DuckDB → LanceDB** | Native hybrid search | Simpler architecture |
| **Files as truth** | Memories as markdown | Git-friendly, editor-agnostic |
| **Go → TypeScript** | Single language | Easier maintenance |
| **FAM → kinen daemon** | Standalone | Not tied to FAM |
| **Obsidian optional** | Progressive enhancement | No vendor lock-in |

### Key Shift: Obsidian as Enhancement

| Before (Nov) | Now |
|--------------|-----|
| Obsidian plugin required for best UX | kinen works perfectly standalone |
| `.obsidian/` created by default | User adds it if they want |
| Obsidian-specific features | Standard markdown that Obsidian enhances |
| Plugin talks to FAM daemon | Daemon is editor-agnostic |

### Still To Explore

| Question | Options |
|----------|---------|
| **Cross-session patterns** | LLM synthesis vs Dataview queries vs both |
| **Memory consolidation UX** | Automatic vs user-triggered |
| **Obsidian plugin** | Build it vs just rely on standard markdown |

---

## Recommended Next Steps

### Immediate (Week 1)

**Focus on standard markdown that works everywhere**:

1. **Wiki-links in kinen output**
   - Session references: `[[20251206-01-auth-redesign]]`
   - Decision references: `[[#D3.1]]`
   - Related sessions in frontmatter

2. **Rich frontmatter**
   - `artifact_type`, `tags`, `related`, `summary`
   - Obsidian Properties will render these nicely
   - Other editors see readable YAML

3. **Callout format**
   - `> [!note] Answer` for responses
   - Renders as blockquote in basic editors
   - Renders as styled box in Obsidian

### Phase 2 (Week 2-3)

**Build the daemon — editor-agnostic**:

1. LanceDB indexing (works standalone)
2. HTTP API for search (any client)
3. CLI `kinen search` (no editor needed)
4. MCP tool `kinen_search` (for AI agents)

### Phase 3 (Week 3-4, Optional)

**Obsidian extras if there's demand**:

1. `kinen init --obsidian` flag
2. Dataview dashboard templates
3. Obsidian plugin (maybe)

**The plugin is NOT required** — all features work via CLI/MCP.

---

## References

### Prior Sessions (Imported)
- [[20251112-01-obsidian-integration/session-summary|20251112-01-obsidian-integration]] — Full 5-round exploration
- [[20251112-02-kinen-obsidian-poc/init|20251112-02-kinen-obsidian-poc]] — POC implementation session
- [[20251203-01-kinen-resources-and-indexing/init|20251203-01-kinen-resources-and-indexing]] — Resources & indexing research

### External
- [Obsidian Help Docs](https://help.obsidian.md/)
- [Obsidian Plugin API](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Dataview Documentation](https://blacksmithgu.github.io/obsidian-dataview/)
- [Templater Documentation](https://silentvoid13.github.io/Templater/)
- [Awesome Obsidian](https://github.com/kmaasrud/awesome-obsidian)
- [Obsidian URI Scheme](https://help.obsidian.md/Extending+Obsidian/Obsidian+URI)

