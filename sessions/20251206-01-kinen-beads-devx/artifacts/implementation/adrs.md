---
artifact_type: adr-collection
date: 2025-12-07
session: 20251206-01-kinen-beads-devx
tags: [adr, architecture, decisions]
summary: Architecture Decision Records from the Dec 6-7 2025 implementation session
---

# Architecture Decision Records

This document captures the architectural decisions made during the `20251206-01-kinen-beads-devx` implementation session.

---

## ADR-001: Files as Source of Truth

### Status
**Accepted** (Dec 6, 2025)

### Context
We need to determine the primary storage mechanism for kinen. Options considered:
1. Database-first (SQLite or LanceDB as primary)
2. Files-first (Markdown files as primary, database as derived index)
3. Hybrid (some data in files, some in database)

### Decision
**Markdown files on the filesystem are the source of truth.** All databases (SQLite, LanceDB) are derived indices that can be rebuilt from files at any time.

### Rationale
- **Git versioning**: Files can be version-controlled, branched, merged
- **Portability**: Clone the repo → you have everything
- **Tool agnostic**: Works with vim, VSCode, Obsidian, any text editor
- **Human readable**: No binary formats, easy to debug
- **Recovery**: If database corrupts, rebuild from files

### Consequences
- **Positive**: Clone-and-go workflow, no database migrations to manage
- **Positive**: All content is human-readable and diffable
- **Negative**: Index rebuild required on first run
- **Negative**: File watching needed for live updates
- **Negative**: Slight performance overhead vs. database-first

### Related Decisions
- [[#ADR-006 Adapter Pattern for IndexWorker]]
- [[#ADR-008 Dual Backend for A-B Comparison]]

---

## ADR-002: Proto-First API Design

### Status
**Accepted** (Dec 7, 2025)

### Context
kinen exposes functionality through multiple interfaces:
- CLI commands
- HTTP/Connect RPC API
- MCP (Model Context Protocol) for AI tools

We need consistent types across all interfaces.

### Decision
**ALL domain types must be defined in `api/kinen/kinen.proto`**. Generated Go types are used throughout the codebase. No local struct definitions for domain types.

### Rationale
- **Single source of truth**: One place to update types
- **Automatic serialization**: Protobuf handles JSON, gRPC, binary
- **Language agnostic**: Can generate TypeScript, Python, Rust clients
- **Tooling**: buf lint, breaking change detection
- **Documentation**: Proto comments become API docs

### Consequences
- **Positive**: Consistency across CLI, HTTP, MCP
- **Positive**: Client code generation is free
- **Negative**: Proto file must be regenerated on changes
- **Negative**: Some Go idioms (interfaces, methods) harder to express
- **Negative**: Initial learning curve for proto syntax

### Implementation
```protobuf
// api/kinen/kinen.proto
message Session {
  string id = 1;
  string name = 2;
  SessionType type = 3;
  string path = 4;
  google.protobuf.Timestamp created_at = 5;
}

enum SessionType {
  SESSION_TYPE_UNSPECIFIED = 0;
  SESSION_TYPE_ARCHITECTURE = 1;
  SESSION_TYPE_IMPLEMENTATION = 2;
  SESSION_TYPE_WRITING = 3;
  SESSION_TYPE_RESEARCH = 4;
}
```

### Related Decisions
- [[#ADR-001 Files as Source of Truth]]
- [[#ADR-003 Repository Pattern for Filesystem]]

---

## ADR-003: Repository Pattern for Filesystem Operations

### Status
**Accepted** (Dec 7, 2025)

### Context
Session and Space management involves many filesystem operations:
- Reading/writing YAML config files
- Creating directory structures
- Scanning for sessions
- Parsing markdown files

Initially, these operations were scattered across multiple files with repeated code.

### Decision
**Abstract filesystem operations behind a `Repository` interface.** Implement `FSRepository` for actual filesystem access.

### Rationale
- **Single Responsibility**: Repository handles all file I/O
- **Testability**: Can mock filesystem for unit tests
- **Consistency**: All file operations follow same patterns
- **Future backends**: Could add cloud storage, database backing

### Implementation
```go
// internal/spaces/repository.go
type Repository interface {
    // Space operations
    ListSpaces(ctx context.Context) ([]*kinenapi.Space, error)
    GetSpace(ctx context.Context, name string) (*kinenapi.Space, error)
    GetCurrentSpace(ctx context.Context) (*kinenapi.Space, error)
    SwitchSpace(ctx context.Context, name string) error
    RegisterSpace(ctx context.Context, name, path string) error
    UnregisterSpace(ctx context.Context, name string) error
    
    // Session operations
    ListSessions(ctx context.Context) ([]*kinenapi.Session, error)
    GetSession(ctx context.Context, name string) (*kinenapi.Session, error)
    CreateSession(ctx context.Context, req CreateSessionRequest) (*kinenapi.Session, error)
    GetCurrentSession(ctx context.Context) (*kinenapi.Session, error)
    GetSessionRounds(ctx context.Context, sessionName string) ([]*kinenapi.RoundInfo, error)
}
```

### Consequences
- **Positive**: Clean separation of concerns
- **Positive**: Easier to test business logic
- **Positive**: Consistent error handling
- **Negative**: Extra abstraction layer
- **Negative**: Interface changes affect all callers

### Related Decisions
- [[#ADR-002 Proto-First API Design]]

---

## ADR-004: Separate Storage Interfaces for Different Concerns

### Status
**Accepted** (Dec 7, 2025)

### Context
Storage needs include:
1. **Documents/Chunks**: Primary content with embeddings for vector search
2. **Edges**: Wiki-link relationships between documents
3. **Metadata**: Index state, file hashes, configuration

Initial design combined all in one `Storage` interface.

### Decision
**Create separate interfaces**: `Storage` (documents), `EdgeStorage` (relationships), `MetadataStorage` (key-value).

### Rationale
- **Interface Segregation Principle**: Clients depend only on what they need
- **Different query patterns**: Documents need vector search, edges need graph queries
- **Simpler implementations**: Each interface is smaller and focused
- **Independent backends**: Edges could be SQLite while documents use LanceDB

### Implementation
```go
// internal/storage/edges.go
type EdgeStorage interface {
    AddEdge(ctx context.Context, edge Edge) error
    GetEdges(ctx context.Context, sourceID string) ([]Edge, error)
    GetBacklinks(ctx context.Context, targetID string) ([]Edge, error)
    DeleteEdges(ctx context.Context, sourceID string) error
    Close() error
}

// internal/storage/metadata.go
type MetadataStorage interface {
    SetMetadata(ctx context.Context, key string, value interface{}) error
    GetMetadata(ctx context.Context, key string) (interface{}, error)
    DeleteMetadata(ctx context.Context, key string) error
    Close() error
}
```

### Consequences
- **Positive**: Cleaner implementations
- **Positive**: Can mix backends (SQLite edges + LanceDB vectors)
- **Positive**: Easier to understand each interface
- **Negative**: Three interfaces to implement per backend
- **Negative**: More files to maintain

### Related Decisions
- [[#ADR-008 Dual Backend for A-B Comparison]]

---

## ADR-005: Use pdfcpu via CLI Instead of Library

### Status
**Accepted** (Dec 6, 2025)

### Context
Need to extract text from PDF files in resource folders. Options:
1. pdfcpu Go library (direct API calls)
2. pdfcpu CLI via exec.Command
3. Alternative library (pdftotext, etc.)

### Decision
**Use `exec.Command` to call pdfcpu CLI binary** instead of the Go library.

### Rationale
- **Library API mismatch**: pdfcpu Go API doesn't match documentation
- **CLI is stable**: Command-line interface is well-documented and works
- **Maintenance**: CLI updates without code changes
- **Fallback**: If CLI fails, can shell out to other tools

### Implementation
```go
func ExtractPDFText(path string) (string, error) {
    cmd := exec.Command("pdfcpu", "content", "extract", "-p", "all", path)
    output, err := cmd.Output()
    if err != nil {
        return "", fmt.Errorf("pdfcpu extract failed: %w", err)
    }
    return string(output), nil
}
```

### Consequences
- **Positive**: Works immediately with stable API
- **Positive**: Can swap to different tool easily
- **Negative**: Requires pdfcpu binary installed
- **Negative**: Subprocess overhead (~10ms per PDF)
- **Negative**: Error messages less structured

### Alternatives Considered
- **pdftotext**: Unix-only, less cross-platform
- **pdf.js**: JavaScript, would need Node runtime
- **Apache PDFBox**: Java, heavy dependency

---

## ADR-006: Adapter Pattern for IndexWorker Integration

### Status
**Accepted** (Dec 7, 2025)

### Context
`IndexWorker` needs:
1. A `Parser` to extract content from files
2. A `Storage` to persist indexed content

These should work with both the daemon (long-running) and CLI (one-shot).

### Decision
**Create adapter types** (`SessionParser`, `StorageAdapter`) that wrap `MemoryService` and implement the interfaces `IndexWorker` expects.

### Rationale
- **Decoupling**: IndexWorker doesn't depend on MemoryService directly
- **Testability**: Can provide mock adapters in tests
- **Flexibility**: Daemon and CLI can share same IndexWorker code
- **Single Responsibility**: Adapters handle translation only

### Implementation
```go
// internal/server/adapters.go
type sessionParser struct {
    log logger.Logger
}

func (p *sessionParser) ParseFile(ctx context.Context, path string) ([]interface{}, error) {
    // Read file, parse based on type, return entries
}

type storageAdapter struct {
    svc *service.MemoryService
    log logger.Logger
}

func (s *storageAdapter) Insert(ctx context.Context, entries []interface{}) error {
    // Convert entries to messages, call svc.AddMemory
}
```

### Consequences
- **Positive**: Clean separation of concerns
- **Positive**: IndexWorker reusable in multiple contexts
- **Negative**: Two extra files to maintain
- **Negative**: Some duplication of parsing logic

### Related Decisions
- [[#ADR-007 On-Demand IndexWorker for CLI]]

---

## ADR-007: On-Demand IndexWorker Creation for CLI

### Status
**Accepted** (Dec 7, 2025)

### Context
`kinen index build` runs as a CLI command, not a daemon. Need to decide how to manage IndexWorker lifecycle.

Options:
1. **Persistent daemon**: CLI sends request to always-running daemon
2. **On-demand**: Create IndexWorker fresh for each CLI invocation
3. **Hybrid**: Start daemon if needed, delegate to it

### Decision
**Create IndexWorker fresh for each `index build` invocation.** No persistent daemon required for manual indexing.

### Rationale
- **Simplicity**: CLI is stateless, easy to understand
- **Resource efficiency**: No background process when not indexing
- **Reliability**: Each run starts clean, no stale state
- **User expectation**: `kinen index build` should just work

### Implementation
```go
// In kinen_server.go IndexBuild handler
func (s *KinenServer) IndexBuild(ctx context.Context, req *connect.Request[kinenapi.IndexBuildRequest]) (*connect.Response[kinenapi.IndexBuildResponse], error) {
    // Create fresh components
    tracker := watcher.NewDeltaTracker()
    parser := NewSessionParser(log)
    storage := NewStorageAdapter(s.svc, log)
    worker := watcher.NewIndexWorker(tracker, storage, parser, onUpdate)
    
    // Process files
    worker.Start(ctx)
    defer worker.Close()
    
    // Walk directory and process
    // ...
}
```

### Consequences
- **Positive**: Simpler architecture
- **Positive**: No daemon dependency for manual tasks
- **Negative**: Cold start overhead (~100ms)
- **Negative**: Cannot share state between invocations

### Related Decisions
- [[#ADR-006 Adapter Pattern for IndexWorker Integration]]

---

## ADR-008: Dual Backend Storage for A/B Comparison

### Status
**Accepted** (Dec 7, 2025)

### Context
We have two potential search backends:
1. **SQLite + FTS5**: Existing, working, fast keyword search
2. **LanceDB**: Vector search, hybrid capabilities

Need to compare search quality before fully committing to LanceDB.

### Decision
**Implement `DualStorage` wrapper** that writes to both backends and reads from primary, with optional comparison mode.

### Rationale
- **Safe migration**: No data loss during transition
- **Quality comparison**: Can run same queries against both
- **Rollback**: Switch primary without data migration
- **Transparency**: Appears as single storage to callers

### Implementation
```go
// internal/storage/dual/storage.go
type DualStorage struct {
    primary   storage.Storage
    secondary storage.Storage
    compare   bool // If true, compare results from both
}

func (d *DualStorage) Insert(ctx context.Context, doc Document) error {
    // Write to both
    if err := d.primary.Insert(ctx, doc); err != nil {
        return err
    }
    if err := d.secondary.Insert(ctx, doc); err != nil {
        log.Warn("secondary insert failed", "error", err)
    }
    return nil
}

func (d *DualStorage) Search(ctx context.Context, query SearchQuery) ([]Result, error) {
    results := d.primary.Search(ctx, query)
    
    if d.compare {
        secondary := d.secondary.Search(ctx, query)
        log.Info("search comparison", "primary", len(results), "secondary", len(secondary))
        // Could merge with RRF here
    }
    
    return results, nil
}
```

### Consequences
- **Positive**: Risk-free backend comparison
- **Positive**: Easy rollback if LanceDB underperforms
- **Positive**: Can gradually shift traffic
- **Negative**: 2x write cost
- **Negative**: Comparison mode has overhead
- **Negative**: More complex than single backend

### Related Decisions
- [[#ADR-004 Separate Storage Interfaces]]
- [[#ADR-001 Files as Source of Truth]]

---

## ADR-009: beads for Agent Coordination Protocol

### Status
**Accepted** (Dec 6, 2025)

### Context
Multiple AI agents working in parallel need coordination:
- Track progress
- Ask questions
- Report blockers
- Hand off work

Options:
1. **Shared document**: Single markdown file for all coordination
2. **Chat**: Real-time conversation between agents
3. **Issue tracker**: Structured issue-based coordination

### Decision
**Use beads issue tracking** with a specific protocol:
- Questions go in issues with `QUESTION [Track]:` prefix
- Answers updated in issue notes
- Blockers use `BLOCKED [Track]:` prefix
- Completion closes issues

### Rationale
- **Structured**: Each issue has clear status
- **Async**: Agents don't need real-time communication
- **Traceable**: Full history of decisions
- **Git-friendly**: JSONL syncs with code

### Implementation
```bash
# Agent asks question
bd create "QUESTION [2]: How should index commands work?" -p 1

# Coordinator answers (updates notes)
bd update kinen-xxx --notes "ANSWER: Create IndexWorker on-demand..."

# Agent unblocked, closes question
bd close kinen-xxx --reason "Answered, proceeding"
```

### Consequences
- **Positive**: Clear audit trail
- **Positive**: Agents can work independently
- **Positive**: Easy to review decisions later
- **Negative**: Some overhead in issue management
- **Negative**: Coordinator can become bottleneck

---

## Decision Log

| # | Decision | Date | Status |
|---|----------|------|--------|
| ADR-001 | Files as Source of Truth | Dec 6 | Accepted |
| ADR-002 | Proto-First API Design | Dec 7 | Accepted |
| ADR-003 | Repository Pattern | Dec 7 | Accepted |
| ADR-004 | Separate Storage Interfaces | Dec 7 | Accepted |
| ADR-005 | pdfcpu via CLI | Dec 6 | Accepted |
| ADR-006 | Adapter Pattern | Dec 7 | Accepted |
| ADR-007 | On-Demand IndexWorker | Dec 7 | Accepted |
| ADR-008 | Dual Backend Storage | Dec 7 | Accepted |
| ADR-009 | beads Coordination Protocol | Dec 6 | Accepted |

---

*Generated: Dec 7, 2025 17:30 CET*
*Session: 20251206-01-kinen-beads-devx*

