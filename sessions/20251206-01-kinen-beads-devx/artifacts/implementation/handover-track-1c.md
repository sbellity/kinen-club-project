---
artifact_type: agent_handover
track: "1C"
track_name: "LanceDB Storage"
date: 2025-12-06
epic_id: kinen-vp0
---

# Agent Handover: Track 1C - LanceDB Storage

> [!warning] MANDATORY: Beads Status Updates
> **You MUST update beads** — chat is NOT a communication channel!
> 
> 1. **Start**: `bd update kinen-vp0 --status in_progress --notes "Starting Track 1C"`
> 2. **Every 30-60 min**: `bd update TASK_ID --notes "Progress: [status]"`
> 3. **When blocked**: `bd create "BLOCKED [1C]: [issue]" -t task -p 0 --assignee coordinator \
  --deps discovered-from:kinen-vp0`
> 4. **Before ending**: Update ALL tasks with current status
> 
> **See `collaboration.md` for full protocol.**

## Your Mission

Implement the storage layer using LanceDB for hybrid search (vector + full-text). This is the foundation other tracks build upon.

## ⚠️ CRITICAL: START WITH SPIKE

**Your FIRST task is a spike to validate lancedb-go works.** If it doesn't, we have fallback options.

```bash
# Create spike first
bd create "1C.0: LanceDB Go spike" -t task -p 0 \
  --acceptance "Validate lancedb-go client: connect, insert, search"
```

## Context

- **Workspace**: `/Users/sbellity/code/p/kinen-go`
- **Target**: Create `internal/storage/lancedb/` package
- **Issue Tracking**: Use `bd` (beads) for all task tracking

## What Already Exists

```
kinen-go/
└── internal/storage/
    ├── interface.go       # ✅ Existing Storage interface
    ├── factory.go         # ✅ Storage factory
    ├── sqlite/            # ✅ SQLite implementation (reference)
    └── memory/            # ✅ In-memory implementation (testing)
```

## What You'll Build

```
kinen-go/
└── internal/storage/
    └── lancedb/
        ├── storage.go     # Main implementation
        ├── chunks.go      # Chunks table
        ├── edges.go       # Graph edges table
        ├── metadata.go    # Metadata table
        ├── search.go      # Hybrid search logic
        └── storage_test.go
```

## Interface You Must Implement

```go
// internal/storage/interface.go (already exists, you implement it)
package storage

type Storage interface {
    // Chunks
    InsertChunks(ctx context.Context, chunks []Chunk) error
    SearchChunks(ctx context.Context, query SearchQuery) ([]ChunkResult, error)
    DeleteChunksByPath(ctx context.Context, path string) error
    GetChunksByPath(ctx context.Context, path string) ([]Chunk, error)
    
    // Edges (graph)
    InsertEdges(ctx context.Context, edges []Edge) error
    GetBacklinks(ctx context.Context, targetPath string) ([]Edge, error)
    GetOutlinks(ctx context.Context, sourcePath string) ([]Edge, error)
    DeleteEdgesBySource(ctx context.Context, sourcePath string) error
    
    // Metadata
    InsertMetadata(ctx context.Context, meta []Metadata) error
    QueryMetadata(ctx context.Context, query MetadataQuery) ([]Metadata, error)
    
    // Stats
    GetStats(ctx context.Context) (*StorageStats, error)
    
    // Lifecycle
    Close() error
}

type Chunk struct {
    ID        string                 `json:"id"`
    Path      string                 `json:"path"`
    Content   string                 `json:"content"`
    Embedding []float32              `json:"embedding"`
    Type      string                 `json:"type"` // round, artifact, memory, resource
    Session   string                 `json:"session"`
    StartLine int                    `json:"start_line"`
    EndLine   int                    `json:"end_line"`
    Metadata  map[string]interface{} `json:"metadata"`
    CreatedAt time.Time              `json:"created_at"`
}

type Edge struct {
    ID         string `json:"id"`
    SourcePath string `json:"source_path"`
    TargetPath string `json:"target_path"`
    Context    string `json:"context"`
    Line       int    `json:"line"`
}

type SearchQuery struct {
    Text      string                 // For FTS
    Embedding []float32              // For vector search
    Limit     int
    Filters   map[string]interface{} // type, session, etc.
    Mode      string                 // "hybrid", "fts", "vector"
}

type ChunkResult struct {
    Chunk
    Score     float64
    MatchType string // "fts", "vector", "both"
}

type StorageStats struct {
    ChunkCount    int
    EdgeCount     int
    MetadataCount int
    LastUpdated   time.Time
}
```

## LanceDB Spike (Task 1C.0)

Create a minimal test to validate:

```go
// cmd/lancedb-spike/main.go
package main

import (
    "fmt"
    "github.com/lancedb/lancedb-go" // or whatever the import path is
)

func main() {
    // 1. Connect to database
    db, err := lancedb.Connect("/tmp/test-lance")
    if err != nil {
        panic(err)
    }
    defer db.Close()
    
    // 2. Create table with schema
    schema := []lancedb.Field{
        {Name: "id", Type: lancedb.String},
        {Name: "content", Type: lancedb.String},
        {Name: "embedding", Type: lancedb.Vector(384)},
    }
    
    table, err := db.CreateTable("test", schema)
    if err != nil {
        panic(err)
    }
    
    // 3. Insert data
    data := []map[string]interface{}{
        {"id": "1", "content": "hello world", "embedding": make([]float32, 384)},
    }
    err = table.Add(data)
    if err != nil {
        panic(err)
    }
    
    // 4. Vector search
    queryVec := make([]float32, 384)
    results, err := table.Search(queryVec).Limit(5).Execute()
    if err != nil {
        panic(err)
    }
    
    fmt.Printf("Results: %d\n", len(results))
    
    // 5. Full-text search (if supported)
    // ...
    
    fmt.Println("✅ LanceDB spike passed!")
}
```

### If Spike Fails

Fallback options (in order):
1. **HTTP proxy**: Run LanceDB Python, call via HTTP
2. **Use SQLite**: Already implemented, add FTS5
3. **Use Qdrant**: Already supported in kinen-go

Create a beads issue if spike fails:
```bash
bd create "BLOCKED: LanceDB Go client doesn't work" -t bug -p 0 \
  --labels "blocked,spike-failed"
```

## Tasks

| Task | Description | Acceptance |
|------|-------------|------------|
| `1C.0` | LanceDB Go spike | Connect, insert, search works |
| `1C.1` | Chunks table | CRUD + vector search |
| `1C.2` | Edges table | CRUD + backlink queries |
| `1C.3` | Metadata table | CRUD + filtered queries |
| `1C.4` | Hybrid search | RRF fusion of FTS + vector |

## Hybrid Search with RRF

Reciprocal Rank Fusion combines FTS and vector results:

```go
func hybridSearch(ctx context.Context, query SearchQuery) ([]ChunkResult, error) {
    // 1. Get FTS results
    ftsResults, _ := s.ftsSearch(ctx, query.Text, query.Limit*2)
    
    // 2. Get vector results
    vecResults, _ := s.vectorSearch(ctx, query.Embedding, query.Limit*2)
    
    // 3. RRF fusion
    const k = 60 // RRF constant
    scores := make(map[string]float64)
    
    for i, r := range ftsResults {
        scores[r.ID] += 1.0 / float64(k + i + 1)
    }
    for i, r := range vecResults {
        scores[r.ID] += 1.0 / float64(k + i + 1)
    }
    
    // 4. Sort by combined score
    // 5. Return top N
}
```

## Dependencies

- **You provide to others**: Storage interface implementation
- **You need from others**: 
  - Track 1B provides chunks to insert
  - Track 1D uses your storage for index updates

## Test Commands

```bash
# Run spike
go run ./cmd/lancedb-spike

# Run storage tests
go test ./internal/storage/lancedb/... -v

# Benchmark search
go test ./internal/storage/lancedb/... -bench=BenchmarkSearch
```

## Success Criteria

```go
func TestChunksRoundTrip(t *testing.T) {
    storage := lancedb.New("/tmp/test-db")
    defer storage.Close()
    
    chunks := []Chunk{{
        ID:        "1",
        Content:   "test content",
        Embedding: make([]float32, 384),
    }}
    
    err := storage.InsertChunks(ctx, chunks)
    assert.NoError(t, err)
    
    results, err := storage.SearchChunks(ctx, SearchQuery{
        Text:  "test",
        Limit: 10,
    })
    assert.NoError(t, err)
    assert.Len(t, results, 1)
}

func TestBacklinks(t *testing.T) {
    storage := lancedb.New("/tmp/test-db")
    
    edges := []Edge{{
        SourcePath: "a.md",
        TargetPath: "b.md",
        Context:    "See [[b]] for details",
    }}
    
    storage.InsertEdges(ctx, edges)
    
    backlinks, err := storage.GetBacklinks(ctx, "b.md")
    assert.NoError(t, err)
    assert.Len(t, backlinks, 1)
    assert.Equal(t, "a.md", backlinks[0].SourcePath)
}
```

## LanceDB Resources

- Docs: https://lancedb.github.io/lancedb/
- Go client: https://github.com/lancedb/lancedb (check for Go bindings)
- If no Go client: Consider using CGO or HTTP bridge

## Notes

- Embedding dimension: 384 (all-MiniLM-L6-v2)
- Database path: `~/.local/share/kinen/indices/{space-hash}/`
- Use connection pooling if available
- Implement cleanup/vacuum for deleted chunks

## Questions & Blockers

**Use beads to communicate questions and blockers.** A coordinator will monitor and respond.

### When Blocked

```bash
bd create "BLOCKED [1C]: [describe what's blocking you]" \
  -t task -p 0 \
  --assignee coordinator \
  --deps discovered-from:kinen-vp0 \
  --notes "Context: [what you've tried, what you need]"
```

### When You Have a Question

```bash
bd create "QUESTION [1C]: [your question]" \
  -t task -p 1 \
  --assignee coordinator \
  --deps discovered-from:kinen-vp0 \
  --notes "Options I'm considering: [A, B, C]"
```

### Best Practices

1. **Be specific** — Include file paths, error messages, code snippets
2. **Show your work** — What did you try? What did you learn?
3. **Propose options** — Don't just ask "what should I do?" — propose 2-3 options
4. **Link to track** — Always use `--assignee coordinator \
  --deps discovered-from:kinen-vp0` (Track 1C epic)

Expect response within 1-2 hours during active development.

**Full protocol**: See `collaboration.md` in this directory.

Good luck! 🚀

