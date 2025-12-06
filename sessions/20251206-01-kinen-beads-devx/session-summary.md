---
artifact_type: session_summary
date: 2025-12-06
session: "[[20251206-01-kinen-beads-devx]]"
status: complete
tags:
  - type/summary
  - domain/devx
  - domain/architecture
---

# Session Summary: kinen-beads-devx

## Session Goal

Design a cohesive developer experience combining **kinen** (structured thinking methodology) and **beads** (issue tracking) into a seamless workflow for design-time exploration and execution-time tracking.

## Key Decisions

### D1: Mental Model Separation

| Aspect | kinen | beads |
|--------|-------|-------|
| **Purpose** | User ↔ AI alignment on design | Implementation tracking for agents |
| **When** | Uncertain, exploring | Clear, executing |
| **Output** | Documents, decisions, artifacts | Completed work items |
| **Users** | Human designer + AI thinking partner | AI agents coordinating work |

### D2: Files as Truth Architecture

> Primary storage = filesystem (Git-versioned markdown). Index = derived (ephemeral, rebuildable).

- Clone repo → rebuild index → fully functional
- No binary blobs in Git
- Index lives in `~/.local/share/kinen/indices/{space-hash}/`

### D3: Daemon Architecture

- **Transparent**: Auto-starts on first CLI/MCP call
- **Responsibilities**: File watching, indexing, memory consolidation, search
- **HTTP API**: Exposes search, backlinks, queries to CLI/MCP/VSCode
- **Language**: Go (leveraging existing kinen-go, 9 tracks complete!)

### D4: LanceDB for Indexing

- Hybrid search (FTS + vector) in one embedded database
- Tables: chunks (content + embeddings), edges (wiki-links), metadata (frontmatter)
- Simpler than SQLite + extensions, native hybrid search

### D5: Obsidian as Progressive Enhancement

- kinen works standalone with standard markdown
- Wiki-links `[[link]]`, frontmatter YAML, callout format `> [!note]`
- Obsidian users get bonus features (graph view, backlinks) for free
- Same files work in vim, VSCode, Obsidian

### D6: Two Modes Workflow

| Mode | Tool | Use Case |
|------|------|----------|
| **Thinking** | Obsidian (mobile + desktop) | Reading, brainstorming, creative sessions |
| **Building** | VSCode/Cursor | Technical sessions with code, agent-driven work |

### D7: kinen Builds Own Graph + Query

- Indexes wiki-links → edges table, frontmatter → metadata table
- Provides CLI/MCP for backlinks, related, queries
- Works without Obsidian; semantic search is ours

### D8: Consolidation Writes to Files

- Memory consolidation outputs markdown with wiki-links + structured frontmatter
- NOT just database entries — files ARE the knowledge graph
- Idempotent extraction from rounds to `memories/` folder

## Critical Discovery: kinen-go is 90% Complete!

After deep review of `/Users/sbellity/code/p/kinen-go`:

| Already Complete | Status |
|------------------|--------|
| Config system (Viper) | ✅ |
| Logging (Zerolog) | ✅ |
| Storage (SQLite + VSS) | ✅ |
| Ollama embeddings + extraction | ✅ |
| Memory buffers (sensory, short-term) | ✅ |
| Fact extraction pipeline | ✅ |
| Public API (`pkg/api/`) | ✅ |
| MCP server (JSON-RPC over stdio) | ✅ |
| Benchmarking CLI | ✅ |

**We're extending a mature codebase, not building from scratch.**

## Implementation Tracks

| Track | Scope | LOE |
|-------|-------|-----|
| **1A** | Proto-First API (Connect + MCP generated) | 4-5 hours |
| **1B** | Kinen markdown parser (sessions/rounds/wiki-links) | 2-3 days |
| **1C** | LanceDB adapter (OPTIONAL - spike first) | 2-3 days |
| **1D** | File watcher (delta indexing) | 1-2 days |
| **1E** | Decision consolidation (rounds → memory files) | 1-2 days |
| **1F** | PDF/Resource parser | 1-2 days |
| **2** | Port sessions/spaces to Go CLI | 1-2 days |
| **3** | VSCode extension (tests + search) | 3-4 days |
| **4** | Obsidian compatibility | 2-3 days |
| **5** | Distribution (Homebrew, launchd) | 2-3 days |

**Total: ~6 days** with parallel execution

> [!note] Architecture Decisions
> - **Track 1A**: One proto → HTTP + gRPC + MCP. Using [Connect RPC](https://connectrpc.com/) + [protoc-gen-go-mcp](https://github.com/redpanda-data/protoc-gen-go-mcp). Deletes hand-written MCP server.
> - **Track 2**: Go-only CLI. TypeScript CLI deprecated. Single binary does everything.
> - **VSCode**: Uses generated TypeScript client from Connect proto.

## Artifacts Produced

### Implementation (actionable)

- `implementation/track-breakdown.md` — Master plan with all tracks
- `implementation/handover-track-*.md` — Per-track agent prompts (10 files)

### Research (background)

- `research/technical-spec.md` — Architecture details
- `research/research-synthesis.md` — Insights from kinen-go/kinen-rs review
- `research/obsidian-integration.md` — Obsidian feature deep-dive
- `research/implementation-ideas.md` — Concrete implementation approaches
- `research/kinen-club-content.md` — Content for kinen.club

## beads Setup

54 issues created via `scripts/setup-beads.sh`:
- 10 track epics
- 39 implementation tasks
- 5 user decision points (UDPs)

Run `bd ready` to see actionable items.

## User Decision Points

| UDP | Decision | When |
|-----|----------|------|
| **UDP-1** | Approve implementation plan | ✅ Done (this session) |
| **UDP-2** | LanceDB vs SQLite | After spike |
| **UDP-3** | CLI UX approval | After Track 2 |
| **UDP-4** | Memory extraction approval | After Track 1E |
| **UDP-5** | Final acceptance | Before release |

## Next Steps

1. **Start implementation session** — New kinen session for actual coding
2. **Assign tracks to agents** — Use handover prompts
3. **Track 1A first** — HTTP API enables other tracks
4. **Parallel tracks**: 1B, 1F, 3, 4 can start Day 1

## Session Statistics

- **Rounds**: 3 (Foundation, Daemon & Integration, Shipping Plan)
- **Duration**: ~4 hours
- **Key pivot**: Discovered kinen-go maturity → reduced scope from 14 to 7 days
- **Research imported**: 2 past sessions, 2 implementation codebases

## Closing Notes

This session successfully:
1. Clarified the kinen ↔ beads separation of concerns
2. Designed a file-first, index-derived architecture
3. Discovered significant existing work in kinen-go
4. Produced comprehensive implementation tracks with handover prompts
5. Set up beads for implementation tracking

Ready to ship! 🚀

