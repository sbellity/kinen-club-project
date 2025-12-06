---
artifact_type: agent_handover
track: "1A"
track_name: "HTTP API + Daemon Shell"
date: 2025-12-06
---

# Agent Handover: Track 1A - HTTP API + Daemon Shell

## Your Mission

Add an HTTP API layer to the **existing, mature kinen-go codebase** (9 tracks already complete!). You're wrapping existing functionality, NOT building from scratch.

## Context

- **Workspace**: `/Users/sbellity/code/p/kinen-go` (MATURE codebase!)
- **Target**: Create `cmd/kinen-daemon/` with HTTP server
- **Issue Tracking**: Use `bd` (beads) for all task tracking

## ⚠️ CRITICAL: Read These First!

Before writing ANY code, read:
1. `/Users/sbellity/code/p/kinen-go/docs/API.md` - Full API reference
2. `/Users/sbellity/code/p/kinen-go/docs/ARCHITECTURE_GO.md` - Architecture
3. `/Users/sbellity/code/p/kinen-go/pkg/service/` - Service layer you'll wrap
4. `/Users/sbellity/code/p/kinen-go/cmd/kinen/mcp/` - Existing MCP server (reference)

## What Already Exists (DO NOT REBUILD!)

```
kinen-go/
├── pkg/
│   ├── api/
│   │   ├── client.go          # ✅ Public Client interface
│   │   ├── types.go           # ✅ Public types (MemoryEntry, Filters, etc.)
│   │   ├── options.go         # ✅ WithLogger, options pattern
│   │   └── convert.go         # ✅ Internal→Public type conversion
│   └── service/
│       ├── service.go         # ✅ MemoryService wrapper
│       ├── memory.go          # ✅ Search, AddMemory, LoadData, etc.
│       └── export.go          # ✅ Export functionality
├── internal/
│   ├── config/                # ✅ Config system (Viper)
│   ├── logger/                # ✅ Logging (Zerolog)
│   ├── storage/sqlite/        # ✅ SQLite+VSS storage
│   ├── ml/ollama/             # ✅ Ollama embeddings + extraction
│   ├── memorymanager/         # ✅ Full memory pipeline
│   └── ...                    # ✅ Many more complete packages
└── cmd/kinen/mcp/
    ├── server.go              # ✅ MCP server (JSON-RPC over stdio)
    └── handlers.go            # ✅ Tool handlers (REFERENCE!)
```

**The memory system is COMPLETE. You are adding HTTP transport only.**

## What You'll Build (Small!)

```
kinen-go/
└── cmd/kinen-daemon/
    ├── main.go              # Entry point (similar to cmd/kinen/)
    └── handlers.go          # HTTP handlers wrapping service
```

**That's it!** ~300-500 lines of code. The handlers just call existing `pkg/service` methods.

## Implementation Approach

### Step 1: Look at Existing MCP Server

The MCP server at `cmd/kinen/mcp/handlers.go` shows EXACTLY how to call the service:

```go
// EXISTING CODE - handlers.go
func (s *Server) handleSearch(ctx context.Context, params json.RawMessage) (interface{}, error) {
    // Parse args...
    opts := service.SearchOptions{
        Limit:      args.Limit,
        MinScore:   args.MinScore,
        Categories: args.Categories,
        Since:      sinceTime,
        Until:      untilTime,
    }
    
    results, err := s.svc.Search(ctx, args.Query, opts)  // ← USE THIS!
    // ...
}
```

### Step 2: Create HTTP Handlers

Your HTTP handlers are THIN wrappers around the same service calls:

```go
// cmd/kinen-daemon/handlers.go
func SearchHandler(svc *service.MemoryService) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var req SearchRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
        
        opts := service.SearchOptions{
            Limit:    req.Limit,
            MinScore: req.MinScore,
        }
        
        results, err := svc.Search(r.Context(), req.Query, opts)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        json.NewEncoder(w).Encode(SearchResponse{Results: results})
    }
}
```

### Step 3: Wire Up Router

```go
// cmd/kinen-daemon/main.go
func main() {
    cfg, _ := config.Load(configPath)
    log := logger.New(cfg.Logger)
    
    client, _ := api.New(cfg, api.WithLogger(log))
    svc := service.NewMemoryService(client)
    
    r := chi.NewRouter()
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    r.Use(cors.Handler(cors.Options{AllowedOrigins: []string{"*"}}))
    
    r.Get("/api/v1/health", HealthHandler())
    r.Post("/api/v1/search", SearchHandler(svc))
    r.Post("/api/v1/memory/add", AddMemoryHandler(svc))
    r.Get("/api/v1/stats", StatsHandler(svc))
    r.Get("/api/v1/memories", ListMemoriesHandler(svc))
    r.Get("/api/v1/memories/{id}", GetMemoryHandler(svc))
    r.Post("/api/v1/export", ExportHandler(svc))
    
    http.ListenAndServe(":7319", r)
}
```

## Endpoints (Map to Existing Service Methods)

| Endpoint | HTTP | Service Method |
|----------|------|----------------|
| `/api/v1/health` | GET | new (check Ollama, storage) |
| `/api/v1/search` | POST | `svc.Search()` |
| `/api/v1/memory/add` | POST | `svc.AddMemory()` |
| `/api/v1/stats` | GET | `svc.GetStats()` |
| `/api/v1/memories` | GET | `svc.ListMemories()` |
| `/api/v1/memories/{id}` | GET | `svc.GetMemory()` |
| `/api/v1/export` | POST | `svc.Export()` |
| `/api/v1/data/load` | POST | `svc.LoadData()` |

## Tasks

| Task | Description | LOE |
|------|-------------|-----|
| `1A.1` | main.go with Chi router | 1h |
| `1A.2` | Health endpoint | 30m |
| `1A.3` | Search/AddMemory handlers | 1h |
| `1A.4` | Stats/List/Get handlers | 1h |
| `1A.5` | Export/LoadData handlers | 30m |
| `1A.6` | Daemon lifecycle (signals) | 30m |

**Total LOE: ~5 hours**

## Test Commands

```bash
# Build
cd /Users/sbellity/code/p/kinen-go
go build -o kinen-daemon ./cmd/kinen-daemon

# Run (use existing config from docs/examples/)
./kinen-daemon --config config.yaml

# Test health
curl http://localhost:7319/api/v1/health

# Test search
curl -X POST http://localhost:7319/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "limit": 5}'
```

## Success Criteria

```bash
# All must pass
curl -s http://localhost:7319/api/v1/health | jq '.status'
# → "ok"

curl -s -X POST http://localhost:7319/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "limit": 5}' | jq '.results'
# → Array (may be empty)

# Graceful shutdown
kill -TERM $(pgrep kinen-daemon)
# → Clean exit, no panic
```

## Key Files to Study

1. **`cmd/kinen/mcp/handlers.go`** - COPY THIS PATTERN for HTTP
2. **`pkg/service/memory.go`** - Service methods you're wrapping
3. **`pkg/api/client.go`** - Client interface
4. **`internal/config/config.go`** - Config loading

## Notes

- Use `github.com/go-chi/chi/v5` for routing (add to go.mod)
- Use existing `internal/logger` for logging
- Port 7319 (kinen in phone keypad)
- This should be ~300-500 lines of code MAX

## Questions?

If blocked, create a beads issue:
```bash
bd create "Blocked: Need clarification on X" -t task -p 0 --labels "blocked"
```

Good luck! 🚀

