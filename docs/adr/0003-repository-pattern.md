# ADR-003: Repository Pattern for Filesystem Operations

## Status
**Accepted** (Dec 7, 2025)

## Context
Session and Space management involves many filesystem operations:
- Reading/writing YAML config files
- Creating directory structures
- Scanning for sessions
- Parsing markdown files

Initially, these operations were scattered across multiple files with repeated code.

## Decision
**Abstract filesystem operations behind a `Repository` interface.** Implement `FSRepository` for actual filesystem access.

## Rationale
- **Single Responsibility**: Repository handles all file I/O
- **Testability**: Can mock filesystem for unit tests
- **Consistency**: All file operations follow same patterns
- **Future backends**: Could add cloud storage, database backing

## Implementation
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

## Consequences

### Positive
- Clean separation of concerns
- Easier to test business logic
- Consistent error handling

### Negative
- Extra abstraction layer
- Interface changes affect all callers

## Related Decisions
- [ADR-002: Proto-First API](0002-proto-first-api.md)


