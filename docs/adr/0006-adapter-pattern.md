# ADR-006: Adapter Pattern for IndexWorker Integration

## Status
**Accepted** (Dec 7, 2025)

## Context
`IndexWorker` needs:
1. A `Parser` to extract content from files
2. A `Storage` to persist indexed content

These should work with both the daemon (long-running) and CLI (one-shot).

## Decision
**Create adapter types** (`SessionParser`, `StorageAdapter`) that wrap `MemoryService` and implement the interfaces `IndexWorker` expects.

## Rationale
- **Decoupling**: IndexWorker doesn't depend on MemoryService directly
- **Testability**: Can provide mock adapters in tests
- **Flexibility**: Daemon and CLI can share same IndexWorker code
- **Single Responsibility**: Adapters handle translation only

## Implementation
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

## Consequences

### Positive
- Clean separation of concerns
- IndexWorker reusable in multiple contexts
- Easy to test with mock adapters

### Negative
- Two extra files to maintain
- Some duplication of parsing logic

## Related Decisions
- [ADR-007: On-Demand IndexWorker](0007-on-demand-indexworker.md)


