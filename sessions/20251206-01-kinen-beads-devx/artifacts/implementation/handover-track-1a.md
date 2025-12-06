---
artifact_type: agent_handover
track: "1A"
track_name: "Proto-First API (Connect + MCP)"
date: 2025-12-06
epic_id: kinen-0ed
---

# Agent Handover: Track 1A - Proto-First API

> [!warning] MANDATORY: Beads Status Updates
> **You MUST update beads** — chat is NOT a communication channel!
> 
> 1. **Start**: `bd update kinen-0ed --status in_progress --notes "Starting Track 1A"`
> 2. **Every 30-60 min**: `bd update TASK_ID --notes "Progress: [status]"`
> 3. **When blocked**: `bd create "BLOCKED [1A]: [issue]" -t task -p 0 --deps discovered-from:kinen-0ed`
> 4. **Before ending**: Update ALL tasks with current status
> 
> **See `collaboration.md` for full protocol.**

## Your Mission

Define the kinen API once in Protocol Buffers. Generate BOTH:
- **Connect handlers** (HTTP/gRPC) for VSCode extension, curl, Go clients
- **MCP handlers** for Claude Desktop, Cursor, AI agents

One schema, multiple transports. Zero hand-written boilerplate.

## The Elegant Architecture

```
api/kinen/kinen.proto (SINGLE SOURCE OF TRUTH)
        │
        ├── protoc-gen-go          → kinen.pb.go (types)
        ├── protoc-gen-connect-go  → kinenconnect/ (HTTP/gRPC)
        └── protoc-gen-go-mcp      → kinenmcp/ (MCP server)
```

**This REPLACES the hand-written MCP server** at `cmd/kinen/mcp/`.

## Context

- **Workspace**: `/Users/sbellity/code/p/kinen-go`
- **Pattern**: `api/mlservice/` (existing Connect services)
- **New tool**: [protoc-gen-go-mcp](https://github.com/redpanda-data/protoc-gen-go-mcp)
- **Wrap**: `pkg/service/` (existing business logic)

## Step 1: Install protoc-gen-go-mcp

```bash
go install github.com/redpanda-data/protoc-gen-go-mcp/cmd/protoc-gen-go-mcp@latest
```

## Step 2: Define the Proto

Create `api/kinen/kinen.proto`:

```protobuf
syntax = "proto3";

package kinen;

option go_package = "github.com/sbellity/kinen/api/kinen";

// KinenService provides memory management and semantic search
service KinenService {
  // Search memories with hybrid search (FTS + semantic)
  rpc Search(SearchRequest) returns (SearchResponse);
  
  // Add a memory from conversation messages
  rpc AddMemory(AddMemoryRequest) returns (AddMemoryResponse);
  
  // Get statistics about the memory store
  rpc GetStats(StatsRequest) returns (StatsResponse);
  
  // List all memories with optional filters
  rpc ListMemories(ListRequest) returns (ListResponse);
  
  // Get a specific memory by ID
  rpc GetMemory(GetRequest) returns (GetResponse);
  
  // Export memories to JSONL
  rpc Export(ExportRequest) returns (ExportResponse);
  
  // Load data from JSONL
  rpc LoadData(LoadDataRequest) returns (LoadDataResponse);
  
  // Health check
  rpc Health(HealthRequest) returns (HealthResponse);
}

// ============================================================
// Search
// ============================================================

message SearchRequest {
  string query = 1;
  int32 limit = 2;
  float min_score = 3;
  repeated string categories = 4;
  string since = 5;  // ISO timestamp
  string until = 6;  // ISO timestamp
}

message SearchResponse {
  repeated Memory results = 1;
}

// ============================================================
// AddMemory
// ============================================================

message AddMemoryRequest {
  repeated Message messages = 1;
  bool force_segment = 2;
  bool force_extract = 3;
}

message Message {
  string role = 1;     // "user" | "assistant" | "system"
  string content = 2;
}

message AddMemoryResponse {
  int32 memories_added = 1;
  int32 facts_extracted = 2;
}

// ============================================================
// Stats
// ============================================================

message StatsRequest {}

message StatsResponse {
  int32 total_memories = 1;
  int32 total_facts = 2;
  string oldest_memory = 3;
  string newest_memory = 4;
}

// ============================================================
// List / Get
// ============================================================

message ListRequest {
  int32 limit = 1;
  int32 offset = 2;
}

message ListResponse {
  repeated Memory memories = 1;
  int32 total = 2;
}

message GetRequest {
  string id = 1;
}

message GetResponse {
  Memory memory = 1;
}

// ============================================================
// Export / Load
// ============================================================

message ExportRequest {
  string format = 1;  // "jsonl" | "json"
}

message ExportResponse {
  string data = 1;
  int32 count = 2;
}

message LoadDataRequest {
  string data = 1;    // JSONL content
  string format = 2;  // "jsonl"
}

message LoadDataResponse {
  int32 loaded = 1;
}

// ============================================================
// Health
// ============================================================

message HealthRequest {}

message HealthResponse {
  string status = 1;           // "ok" | "degraded" | "error"
  string ollama_status = 2;
  string storage_status = 3;
  string version = 4;
}

// ============================================================
// Shared Types
// ============================================================

message Memory {
  string id = 1;
  string content = 2;
  float score = 3;
  string category = 4;
  string created_at = 5;
  map<string, string> metadata = 6;
}
```

## Step 3: Update buf.gen.yaml

```yaml
version: v2
plugins:
  # Standard protobuf types
  - local: protoc-gen-go
    out: .
    opt: paths=source_relative
  
  # Connect RPC (HTTP/gRPC)
  - local: protoc-gen-connect-go
    out: .
    opt: paths=source_relative
  
  # MCP server generation
  - local: protoc-gen-go-mcp
    out: .
    opt: paths=source_relative
```

## Step 4: Generate Code

```bash
cd /Users/sbellity/code/p/kinen-go
buf generate api/kinen/kinen.proto
```

This creates:
```
api/kinen/
├── kinen.pb.go                    # Protobuf types
├── kinenconnect/
│   └── kinen.connect.go           # Connect handlers
└── kinenmcp/
    └── kinen.pb.mcp.go            # MCP handlers (generated!)
```

## Step 5: Implement KinenServer

Create `internal/server/kinen_server.go`:

```go
package server

import (
    "context"
    
    "connectrpc.com/connect"
    kinenapi "github.com/sbellity/kinen/api/kinen"
    "github.com/sbellity/kinen/pkg/service"
)

// KinenServer implements both Connect and MCP interfaces
type KinenServer struct {
    svc *service.MemoryService
}

func NewKinenServer(svc *service.MemoryService) *KinenServer {
    return &KinenServer{svc: svc}
}

func (s *KinenServer) Search(
    ctx context.Context,
    req *connect.Request[kinenapi.SearchRequest],
) (*connect.Response[kinenapi.SearchResponse], error) {
    opts := service.SearchOptions{
        Limit:    int(req.Msg.Limit),
        MinScore: req.Msg.MinScore,
    }
    
    results, err := s.svc.Search(ctx, req.Msg.Query, opts)
    if err != nil {
        return nil, connect.NewError(connect.CodeInternal, err)
    }
    
    return connect.NewResponse(&kinenapi.SearchResponse{
        Results: mapMemories(results),
    }), nil
}

func (s *KinenServer) Health(
    ctx context.Context,
    req *connect.Request[kinenapi.HealthRequest],
) (*connect.Response[kinenapi.HealthResponse], error) {
    return connect.NewResponse(&kinenapi.HealthResponse{
        Status:        "ok",
        OllamaStatus:  "ok",
        StorageStatus: "ok",
        Version:       "0.1.0",
    }), nil
}

// ... implement other methods similarly
```

## Step 6: Wire Connect into Daemon

Create `cmd/kinen-daemon/main.go`:

```go
package main

import (
    "net/http"
    
    "github.com/sbellity/kinen/api/kinen/kinenconnect"
    "github.com/sbellity/kinen/internal/server"
    "github.com/sbellity/kinen/pkg/service"
    "golang.org/x/net/http2"
    "golang.org/x/net/http2/h2c"
)

func main() {
    // Setup service (same as existing)
    svc := setupService()
    kinenServer := server.NewKinenServer(svc)
    
    // Connect handler (HTTP + gRPC)
    mux := http.NewServeMux()
    path, handler := kinenconnect.NewKinenServiceHandler(kinenServer)
    mux.Handle(path, handler)
    
    // h2c for gRPC without TLS
    h2s := &http2.Server{}
    srv := &http.Server{
        Addr:    ":7319",
        Handler: h2c.NewHandler(mux, h2s),
    }
    
    srv.ListenAndServe()
}
```

## Step 7: Wire MCP into CLI (Replace Hand-Written)

Update `cmd/kinen/mcp.go` to use generated MCP handlers:

```go
package main

import (
    "github.com/mark3labs/mcp-go/server"
    "github.com/sbellity/kinen/api/kinen/kinenmcp"
    kinenserver "github.com/sbellity/kinen/internal/server"
)

func runMCP() {
    svc := setupService()
    kinenServer := kinenserver.NewKinenServer(svc)
    
    // Create MCP server
    mcpServer := server.NewMCPServer("kinen", "0.1.0")
    
    // Register generated handlers (ONE LINE!)
    kinenmcp.ForwardToKinenServiceHandler(mcpServer, kinenServer)
    
    // Serve over stdio
    mcpServer.ServeStdio()
}
```

**Then DELETE the old hand-written code:**
```bash
rm cmd/kinen/mcp/server.go
rm cmd/kinen/mcp/handlers.go
rm cmd/kinen/mcp/schemas.go
```

## Tasks

| Task | Description | LOE |
|------|-------------|-----|
| `1A.1` | Create `api/kinen/kinen.proto` | 1h |
| `1A.2` | Install protoc-gen-go-mcp, update buf.gen.yaml | 30m |
| `1A.3` | Generate Connect + MCP code | 15m |
| `1A.4` | Implement `internal/server/kinen_server.go` | 1.5h |
| `1A.5` | Create `cmd/kinen-daemon/main.go` | 30m |
| `1A.6` | Update MCP command to use generated handlers | 30m |

**Total: ~4.5 hours**

## Test Commands

```bash
# Build
go build -o kinen ./cmd/kinen
go build -o kinen-daemon ./cmd/kinen-daemon

# Test HTTP (Connect protocol)
./kinen-daemon &
curl -X POST http://localhost:7319/kinen.KinenService/Health \
  -H "Content-Type: application/json" -d '{}'

curl -X POST http://localhost:7319/kinen.KinenService/Search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "limit": 5}'

# Test MCP (stdio)
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | ./kinen mcp
```

## Success Criteria

```bash
# HTTP works
curl -s -X POST http://localhost:7319/kinen.KinenService/Health \
  -d '{}' | jq -e '.status == "ok"'

# MCP works (same functionality, generated code)
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"kinen_health"},"id":1}' \
  | ./kinen mcp | jq -e '.result'

# Old MCP code deleted
test ! -f cmd/kinen/mcp/handlers.go
```

## Key Principle

**One schema, zero hand-written transport code.**

The proto file defines the API contract. Everything else is generated:
- Types (protoc-gen-go)
- HTTP/gRPC handlers (protoc-gen-connect-go)
- MCP handlers (protoc-gen-go-mcp)

If you're writing transport boilerplate, you're doing it wrong.

## References

- [Connect RPC Getting Started](https://connectrpc.com/docs/go/getting-started)
- [protoc-gen-go-mcp](https://github.com/redpanda-data/protoc-gen-go-mcp)
- [Redpanda Blog: Turn gRPC into MCP](https://www.redpanda.com/blog/turn-grpc-api-into-mcp-server)

## Questions & Blockers

**Use beads to communicate questions and blockers.** A coordinator will monitor and respond.

### When Blocked

```bash
# Create a blocker issue assigned to coordinator
bd create "BLOCKED [1A]: [describe what's blocking you]" \
  -t task -p 0 \
  --assignee coordinator \
  --deps discovered-from:kinen-0ed \
  --notes "Context: [what you've tried, what you need]"
```

### When You Have a Question

```bash
# Create a question issue assigned to coordinator
bd create "QUESTION [1A]: [your question]" \
  -t task -p 1 \
  --assignee coordinator \
  --deps discovered-from:kinen-0ed \
  --notes "Options I'm considering: [A, B, C]"
```

### When You Need a Decision

```bash
# Create a decision request assigned to coordinator
bd create "DECISION [1A]: [what needs deciding]" \
  -t task -p 1 \
  --assignee coordinator \
  --deps discovered-from:kinen-0ed \
  --notes "Trade-offs: [option A pros/cons, option B pros/cons]"
```

### Best Practices

1. **Be specific** — Include file paths, error messages, code snippets
2. **Show your work** — What did you try? What did you learn?
3. **Propose options** — Don't just ask "what should I do?" — propose 2-3 options with trade-offs
4. **Link to track** — Always use `--deps discovered-from:kinen-0ed` (Track 1A epic)
5. **Check existing issues** — Run `bd list` first to avoid duplicates

### Monitoring

The coordinator monitors beads for:
- Issues with `BLOCKED`, `QUESTION`, `DECISION` in title
- High priority (P0, P1) issues
- Issues linked to track epics

Expect response within 1-2 hours during active development.

**Full protocol**: See `collaboration.md` in this directory.
