# ADR-004: Separate Storage Interfaces for Different Concerns

## Status
**Accepted** (Dec 7, 2025)

## Context
Storage needs include:
1. **Documents/Chunks**: Primary content with embeddings for vector search
2. **Edges**: Wiki-link relationships between documents
3. **Metadata**: Index state, file hashes, configuration

Initial design combined all in one `Storage` interface.

## Decision
**Create separate interfaces**: `Storage` (documents), `EdgeStorage` (relationships), `MetadataStorage` (key-value).

## Rationale
- **Interface Segregation Principle**: Clients depend only on what they need
- **Different query patterns**: Documents need vector search, edges need graph queries
- **Simpler implementations**: Each interface is smaller and focused
- **Independent backends**: Edges could be SQLite while documents use LanceDB

## Implementation
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

## Consequences

### Positive
- Cleaner implementations
- Can mix backends (SQLite edges + LanceDB vectors)
- Easier to understand each interface

### Negative
- Three interfaces to implement per backend
- More files to maintain

## Related Decisions
- [ADR-008: Dual Backend](0008-dual-backend.md)


