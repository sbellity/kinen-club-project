# ADR-007: On-Demand IndexWorker Creation for CLI

## Status
**Accepted** (Dec 7, 2025)

## Context
`kinen index build` runs as a CLI command, not a daemon. Need to decide how to manage IndexWorker lifecycle.

Options:
1. **Persistent daemon**: CLI sends request to always-running daemon
2. **On-demand**: Create IndexWorker fresh for each CLI invocation
3. **Hybrid**: Start daemon if needed, delegate to it

## Decision
**Create IndexWorker fresh for each `index build` invocation.** No persistent daemon required for manual indexing.

## Rationale
- **Simplicity**: CLI is stateless, easy to understand
- **Resource efficiency**: No background process when not indexing
- **Reliability**: Each run starts clean, no stale state
- **User expectation**: `kinen index build` should just work

## Implementation
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

## Consequences

### Positive
- Simpler architecture
- No daemon dependency for manual tasks
- Predictable behavior

### Negative
- Cold start overhead (~100ms)
- Cannot share state between invocations

## Related Decisions
- [ADR-006: Adapter Pattern](0006-adapter-pattern.md)



