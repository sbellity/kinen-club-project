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

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Developer Workflow                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   DESIGN TIME (kinen)              EXECUTION TIME (beads)        │
│   ┌─────────────────┐              ┌─────────────────┐          │
│   │ Sessions        │   handoff    │ Issues          │          │
│   │ ├── Rounds      │ ──────────►  │ ├── Tasks       │          │
│   │ └── Artifacts   │              │ ├── Bugs        │          │
│   └────────┬────────┘              │ └── Deps        │          │
│            │                       └────────┬────────┘          │
│            │                                │                    │
│            └───────────┬────────────────────┘                    │
│                        │                                         │
│                        ▼                                         │
│            ┌───────────────────────┐                            │
│            │    kinen-daemon       │                            │
│            │  ├── File watcher     │                            │
│            │  ├── Index manager    │                            │
│            │  ├── Memory consolidation                          │
│            │  └── Coordination     │                            │
│            └───────────┬───────────┘                            │
│                        │                                         │
│                        ▼                                         │
│            ┌───────────────────────┐                            │
│            │  ~/.local/share/kinen │                            │
│            │  └── indices/         │                            │
│            │      └── {hash}/      │                            │
│            │          ├── lance/   │  (LanceDB)                 │
│            │          └── meta.json│                            │
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

### Memory Entry (consolidated)

```typescript
interface MemoryEntry {
  id: string;
  type: 'decision' | 'pattern' | 'insight';
  content: string;
  source_sessions: string[];
  created_at: Date;
  confidence: number;
  embedding: number[];
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

## References

- [[sessions/20251203-01-kinen-resources-and-indexing/init|Prior session: Resources & Indexing]]
- [BeaconBay/ck](https://github.com/BeaconBay/ck) - Semantic search UX inspiration
- [LanceDB docs](https://lancedb.github.io/lancedb/)
