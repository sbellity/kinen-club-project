---
artifact_type: implementation_plan
date: 2025-12-06
session: "[[20251206-01-kinen-beads-devx]]"
tags:
  - type/plan
  - domain/tracks
  - status/active
summary: "Track breakdown for kinen implementation - extending mature kinen-go codebase"
---

# Track Breakdown for kinen Implementation

## Critical Context: kinen-go is 90% Complete!

**Before reading further**, understand that `/Users/sbellity/code/p/kinen-go` has **9 implementation tracks already completed**:

| Completed | Component |
|-----------|-----------|
| ✅ | Config system (Viper) |
| ✅ | Logging (Zerolog) |
| ✅ | Storage (SQLite + VSS) |
| ✅ | Ollama embeddings + extraction |
| ✅ | Memory buffers (sensory, short-term) |
| ✅ | Fact extraction pipeline |
| ✅ | Memory manager |
| ✅ | Public API (`pkg/api/`) |
| ✅ | MCP server (JSON-RPC over stdio) |
| ✅ | Benchmarking CLI |
| ✅ | Comprehensive documentation |

**We are EXTENDING this codebase, not building from scratch.**

---

## What We're Building

| Track | Scope | LOE | Why Needed |
|-------|-------|-----|------------|
| **1A** | HTTP→JSON-RPC adapter | 2-3 hours | HTTP transport for VSCode extension |
| **1B** | Kinen markdown parser | 2-3 days | Parse sessions/rounds, extract wiki-links |
| **1C** | LanceDB adapter | 2-3 days | OPTIONAL - SQLite might be sufficient |
| **1D** | File watcher | 1-2 days | Delta indexing on changes |
| **1E** | Decision consolidation | 1-2 days | Extract decisions → memory files |
| **1F** | PDF/Resource parser | 1-2 days | Index resources folder |
| **2** | Port sessions/spaces to Go | 1-2 days | Single binary CLI (replaces TS CLI) |
| **3** | VSCode extension | 3-4 days | Test infra + search integration |
| **4** | Obsidian compatibility | 2-3 days | Wiki-links, frontmatter standardization |
| **5** | Distribution | 2-3 days | Homebrew, launchd |

**Total: ~6 days** (with parallelization)

> [!note] Architecture Decision
> **Go-only CLI.** The TypeScript CLI (`kinen/`) is deprecated. All CLI functionality lives in Go for single-binary distribution. VSCode extension talks to daemon via HTTP.

---

## Track Dependencies

```
EXISTING KINEN-GO (9 tracks complete)
                │
                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                           DAY 1 START                                  │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
    ┌───────────┬───────────┬───┴───┬───────────┬───────────┐
    │           │           │       │           │           │
    ▼           ▼           ▼       ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│TRACK 1A│ │TRACK 1B│ │TRACK 1F│ │TRACK 3 │ │TRACK 4 │ │TRACK 1C│
│HTTP API│ │Parser  │ │PDF     │ │VSCode  │ │Obsidian│ │LanceDB │
│1-2 days│ │2-3 days│ │1-2 days│ │3-4 days│ │2-3 days│ │SPIKE   │
└───┬────┘ └───┬────┘ └────────┘ └───┬────┘ └────────┘ └────────┘
    │          │                     │
    │          ▼                     │
    │     ┌────────┐                 │
    │     │TRACK 1D│                 │
    │     │Watcher │                 │
    │     │1-2 days│                 │
    │     └───┬────┘                 │
    │         │                      │
    │         ▼                      │
    │     ┌────────┐                 │
    │     │TRACK 1E│                 │
    │     │Memory  │                 │
    │     │1-2 days│                 │
    │     └───┬────┘                 │
    │         │                      │
    ▼         ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        TRACK 2: TS CLI                              │
│                  (needs HTTP API from 1A)                           │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     INTEGRATION TESTS                               │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     TRACK 5: Distribution                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Track 1A: Proto-First API (Connect + MCP Generated)

**Summary**: Define kinen API once in Protocol Buffers, generate BOTH Connect handlers (HTTP/gRPC) AND MCP server from the same schema.

**The Insight**: Using [protoc-gen-go-mcp](https://github.com/redpanda-data/protoc-gen-go-mcp), we can generate MCP servers directly from proto definitions. Combined with Connect RPC, ONE schema produces:
- HTTP/JSON API (for VSCode, curl)
- gRPC API (for Go clients)
- MCP server (for Claude, Cursor agents)

**This replaces** the hand-written `cmd/kinen/mcp/` with generated code.

**Existing (TO BE REPLACED)**:
- `cmd/kinen/mcp/server.go` - Hand-written JSON-RPC → **DELETE**
- `cmd/kinen/mcp/handlers.go` - Hand-written handlers → **DELETE**

**Build**:
```
api/kinen/kinen.proto (single source of truth)
        │
        ├── buf generate
        │
        ▼
├── api/kinen/kinen.pb.go           # Protobuf types
├── api/kinen/kinenconnect/         # Connect handlers (HTTP/gRPC)
└── api/kinen/kinenmcp/             # MCP handlers (generated!)
```

```go
// cmd/kinen/main.go - MCP mode
mcpServer := mcp.NewServer(...)
kinenmcp.RegisterKinenService(mcpServer, kinenServer)
mcpServer.ServeStdio()

// cmd/kinen-daemon/main.go - HTTP mode
mux := http.NewServeMux()
path, handler := kinenconnect.NewKinenServiceHandler(kinenServer)
mux.Handle(path, handler)
```

**Tasks**:
| ID | Task | LOE |
|----|------|-----|
| 1A.1 | Define api/kinen/kinen.proto | 1h |
| 1A.2 | Set up protoc-gen-go-mcp in buf.gen.yaml | 30m |
| 1A.3 | Generate Connect + MCP code | 15m |
| 1A.4 | Implement KinenServer (wraps service) | 1.5h |
| 1A.5 | Wire Connect into daemon | 30m |
| 1A.6 | Wire MCP into CLI (replace hand-written) | 30m |

**Total: ~4.5 hours**

**Benefits**:
- **One schema** → HTTP + gRPC + MCP
- **Delete hand-written MCP code** (~300 lines)
- Type-safe everywhere
- Schema IS documentation
- Future-proof for new transports

**Handover**: See `artifacts/implementation/handover-track-1a.md`

---

## Track 1B: Kinen Markdown Parser

**Summary**: Parse kinen-specific markdown (sessions, rounds, artifacts)

**Existing**: Nothing specific to kinen format

**Build**:
```go
// internal/kinen/parser.go
type ParsedRound struct {
    Path        string
    Frontmatter RoundFrontmatter
    Questions   []Question
    WikiLinks   []WikiLink
}

func ParseRound(path string, content []byte) (*ParsedRound, error)
func ExtractWikiLinks(content string) []WikiLink
```

**Tasks**:
| ID | Task | LOE |
|----|------|-----|
| 1B.1 | Frontmatter parser (YAML) | 2h |
| 1B.2 | Wiki-link extractor | 2h |
| 1B.3 | Round parser (Q&A format) | 4h |
| 1B.4 | Artifact parser (sections) | 2h |
| 1B.5 | Session scanner | 2h |

**Reference**: `/Users/sbellity/code/kinen/vscode-extension/src/parsers/roundParser.ts`

**Handover**: See `artifacts/handover-track-1b.md`

---

## Track 1C: LanceDB Storage (OPTIONAL)

**Summary**: Alternative storage backend with native hybrid search

**Existing**: SQLite + VSS at `internal/storage/sqlite/`

**Decision**: **SPIKE FIRST!** SQLite+VSS might be sufficient.

**Tasks**:
| ID | Task | LOE |
|----|------|-----|
| 1C.0 | LanceDB Go spike | 2h |
| 1C.1-4 | Full implementation | 2 days (IF spike passes) |

**Handover**: See `artifacts/handover-track-1c.md`

---

## Track 1D: File Watcher + Delta Index

**Summary**: Watch sessions/ for changes, trigger incremental re-indexing

**Existing**: Nothing

**Build**:
```go
// internal/watcher/watcher.go
type FileWatcher struct {
    parser  *kinen.Parser
    storage storage.Storage
}
func (w *FileWatcher) Start(ctx context.Context) error
```

**Tasks**:
| ID | Task | LOE |
|----|------|-----|
| 1D.1 | fsnotify watcher | 2h |
| 1D.2 | Debounce logic (500ms) | 1h |
| 1D.3 | Delta index worker | 3h |

**Depends on**: 1B (Parser)

**Handover**: See `artifacts/handover-track-1d.md`

---

## Track 1E: Decision Consolidation

**Summary**: Extract decisions from rounds → memory files with wiki-links

**Existing**: `internal/extractor/` (fact extraction)

**Build**:
```go
// internal/consolidation/extractor.go
func ExtractDecisions(round *ParsedRound) []Decision
func WriteMemoryFile(decision Decision, destPath string) error
```

**Tasks**:
| ID | Task | LOE |
|----|------|-----|
| 1E.1 | Decision extractor (callouts) | 2h |
| 1E.2 | Memory file writer | 3h |
| 1E.3 | Session close trigger | 1h |

**Depends on**: 1B (Parser)

**Handover**: See `artifacts/handover-track-1e.md`

---

## Track 1F: PDF + Resources Parser

**Summary**: Parse PDFs and resources folder for indexing

**Existing**: Nothing

**Tasks**:
| ID | Task | LOE |
|----|------|-----|
| 1F.1 | PDF text extraction (pdfcpu) | 3h |
| 1F.2 | Resource folder scanner | 2h |

**Handover**: See `artifacts/handover-track-1f.md`

---

## Track 2: Port Sessions/Spaces to Go CLI

**Summary**: Port session and space management from TypeScript to Go. Single binary does everything.

**Reference**: `/Users/sbellity/code/kinen/kinen/src/` (TS implementation to port)

**Build**:
```go
// cmd/kinen/commands/session.go
func sessionNewCmd() *cobra.Command  // kinen session new "topic"
func sessionListCmd() *cobra.Command // kinen session list
func sessionCurrentCmd() *cobra.Command

// cmd/kinen/commands/space.go
func spaceListCmd() *cobra.Command   // kinen space list
func spaceSwitchCmd() *cobra.Command // kinen space switch <name>

// internal/kinen/sessions.go
type Session struct { Name, Path, Type string; Created time.Time }
func CreateSession(name, sessionType string) (*Session, error)
func ListSessions(spacePath string) ([]Session, error)
```

**Tasks**:
| ID | Task | LOE |
|----|------|-----|
| 2.1 | Space management (list, switch, current) | 2h |
| 2.2 | Session management (new, list, current) | 3h |
| 2.3 | Round creation (new round in session) | 2h |
| 2.4 | Search command (wraps existing service) | 1h |
| 2.5 | Index commands (build, status) | 1h |
| 2.6 | MCP server (already exists, verify tools) | 1h |

**Depends on**: 1B (Parser for reading existing sessions)

**TS CLI Deprecation**: After this track, `kinen/` TypeScript package is no longer needed. Keep for reference during porting.

**Handover**: See `artifacts/implementation/handover-track-2.md`

---

## Track 3: VSCode Extension

**Summary**: Add test infrastructure, fix bugs, add search integration

**Existing** (70% complete):
- Session explorer ✅
- Round editor (buggy) ⚠️
- Decision tracker ✅
- Status bar ✅

**Tasks**:
| ID | Task | LOE |
|----|------|-----|
| 3.0 | Test infrastructure (vitest) | 4h |
| 3.1 | Fix roundEditor bugs | 4h |
| 3.2 | DaemonClient for VSCode | 2h |
| 3.3 | Search command palette | 2h |
| 3.4 | Backlinks view | 2h |

**Depends on**: 1A (for search features)

**Handover**: See `artifacts/handover-track-3.md`

---

## Track 4: Obsidian Compatibility

**Summary**: Ensure kinen files work perfectly in Obsidian

**Tasks**:
| ID | Task | LOE |
|----|------|-----|
| 4.1 | Wiki-links in generated content | 3h |
| 4.2 | Frontmatter standardization | 2h |
| 4.3 | Callout format validation | 1h |
| 4.4 | `kinen init --obsidian` | 2h |
| 4.5 | Legacy migration script | 2h |

**Independent**: Can start Day 1

**Handover**: See `artifacts/handover-track-4.md`

---

## Track 5: Distribution

**Summary**: Package daemon for easy installation

**Tasks**:
| ID | Task | LOE |
|----|------|-----|
| 5.1 | Cross-platform builds | 2h |
| 5.2 | Homebrew formula | 2h |
| 5.3 | launchd service | 2h |
| 5.4 | Release automation | 2h |

**Depends on**: All daemon tracks complete

**Handover**: See `artifacts/handover-track-5.md`

---

## User Decision Points (UDP)

| UDP | When | Decision | Surface Via |
|-----|------|----------|-------------|
| **UDP-1** | Before start | Approve this plan | Review this document |
| **UDP-2** | After 1C spike | LanceDB vs SQLite | Test search quality |
| **UDP-3** | After 2.2 | CLI UX approval | Use CLI for 10 min |
| **UDP-4** | After 1E.2 | Memory extraction | Review 5 generated files |
| **UDP-5** | Before release | Final acceptance | Full workflow test |

---

## Integration Tests

| Test | Tracks | Verifies |
|------|--------|----------|
| INT-1 | 1A + 2 | CLI talks to daemon |
| INT-2 | 1B + 1D | Index build + watch |
| INT-3 | 1A + 3 | VSCode talks to daemon |
| INT-4 | 1B + 1E | Decisions extracted correctly |
| INT-5 | All | Full workflow |

---

## HTTP API Spec (Interface for Track 2, 3)

```yaml
openapi: 3.0.0
info:
  title: kinen-daemon API
  version: 1.0.0

paths:
  /api/v1/health:
    get:
      responses:
        200: { content: { application/json: { schema: { type: object }}}}

  /api/v1/search:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                query: { type: string }
                limit: { type: integer, default: 10 }
                filters: { type: object }
      responses:
        200: { content: { application/json: { schema: { type: object }}}}

  /api/v1/memory/add:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                messages: { type: array }
                force_segment: { type: boolean }
                force_extract: { type: boolean }

  /api/v1/stats:
    get:
      responses:
        200: { content: { application/json: { schema: { type: object }}}}

  /api/v1/memories:
    get:
      parameters:
        - name: limit
          in: query
          schema: { type: integer }
      responses:
        200: { content: { application/json: { schema: { type: object }}}}

  /api/v1/memories/{id}:
    get:
      responses:
        200: { content: { application/json: { schema: { type: object }}}}

  /api/v1/export:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                path: { type: string }
                format: { type: string }

  /api/v1/data/load:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                sources: { type: array }
                format: { type: string }
```

---

## Timeline

| Day | Tracks | Work |
|-----|--------|------|
| 1-2 | 1A + 1F + 3 + 4 | HTTP API, PDF, VSCode tests, Obsidian |
| 2-3 | 1B | Kinen parser |
| 3-4 | 1D + 2 | Watcher, TS CLI |
| 4-5 | 1E | Consolidation |
| 5-6 | Integration | End-to-end testing |
| 7 | 5 | Distribution |

**Total**: ~7 days with 4 parallel agents
