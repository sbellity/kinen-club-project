# ADR-002: Proto-First API Design

## Status
**Accepted** (Dec 7, 2025)

## Context
kinen exposes functionality through multiple interfaces:
- CLI commands
- HTTP/Connect RPC API
- MCP (Model Context Protocol) for AI tools

We need consistent types across all interfaces.

## Decision
**ALL domain types must be defined in `api/kinen/kinen.proto`**. Generated Go types are used throughout the codebase. No local struct definitions for domain types.

## Rationale
- **Single source of truth**: One place to update types
- **Automatic serialization**: Protobuf handles JSON, gRPC, binary
- **Language agnostic**: Can generate TypeScript, Python, Rust clients
- **Tooling**: buf lint, breaking change detection
- **Documentation**: Proto comments become API docs

## Implementation
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

## Consequences

### Positive
- Consistency across CLI, HTTP, MCP
- Client code generation is free
- Breaking changes detected automatically

### Negative
- Proto file must be regenerated on changes
- Some Go idioms (interfaces, methods) harder to express
- Initial learning curve for proto syntax

## Related Decisions
- [ADR-001: Files as Source of Truth](0001-files-as-source-of-truth.md)
- [ADR-003: Repository Pattern](0003-repository-pattern.md)


