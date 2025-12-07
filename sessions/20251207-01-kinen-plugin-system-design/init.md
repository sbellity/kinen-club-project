---
created: 2025-12-07T16:29:00+01:00
type: architecture
status: in-progress
---

# Session: Kinen Plugin System Design

## Goal

Design an extensible plugin/feature package system for kinen session types that allows:
- User-defined custom session types
- Session-specific artifact templates
- Session-specific methodology/prompt extensions
- AI agent behavior customization per session type

## Success Criteria

- Clear architectural decision on plugin mechanism (proto annotations vs feature packages)
- Design supports future extensibility without breaking changes
- Maintains type safety and developer experience
- Enables user customization without recompiling kinen

## Constraints

- Must work with existing Repository pattern in `internal/spaces`
- Must be compatible with proto-first API design
- Should minimize complexity for simple use cases
- Must support both filesystem and potential future backends (cloud, DB)

## Key Questions

1. Should session type metadata live in proto (annotations) or external configs (feature packages)?
2. How do plugins/features get discovered and loaded?
3. Where should artifact templates be stored (embed in binary, filesystem, remote)?
4. How do custom prompts integrate with the base kinen methodology?
5. What's the UX for users creating custom session types?
6. Should this be hot-reloadable or require restart?

## Context

### Current Implementation

Session types are hardcoded in `internal/spaces/repository_fs.go`:

```go
func getArtifactName(st kinenapi.SessionType) string {
    switch st {
    case kinenapi.SessionType_SESSION_TYPE_ARCHITECTURE:
        return "technical-spec.md"
    case kinenapi.SessionType_SESSION_TYPE_IMPLEMENTATION:
        return "implementation-plan.md"
    case kinenapi.SessionType_SESSION_TYPE_WRITING:
        return "outline.md"
    case kinenapi.SessionType_SESSION_TYPE_RESEARCH:
        return "research.md"
    default:
        return "spec.md"
    }
}
```

**Problems:**
- No extensibility without code changes
- Templates are embedded in code (hard to customize)
- No way to add session-specific AI prompts
- Each new session type requires proto + code changes

### Option 1: Proto Annotations

```protobuf
enum SessionType {
  SESSION_TYPE_ARCHITECTURE = 1 [
    (artifact_file) = "technical-spec.md",
    (prompt_extension) = "architecture-prompts.md"
  ];
  SESSION_TYPE_IMPLEMENTATION = 2 [
    (artifact_file) = "implementation-plan.md",
    (prompt_extension) = "implementation-prompts.md"
  ];
  // ...
}
```

**Pros:**
- Single source of truth
- Type-safe code generation
- Available across all languages

**Cons:**
- Proto becomes overloaded with implementation details
- Less flexible (requires recompilation)
- Users can't add custom session types without forking

### Option 2: Feature Package System

```
~/.config/kinen/session-types/
├── architecture/
│   ├── config.yaml           # Metadata
│   ├── artifact.tmpl.md      # Template
│   └── prompts.md            # AI agent instructions
├── implementation/
│   ├── config.yaml
│   ├── artifact.tmpl.md
│   └── prompts.md
└── my-custom-type/           # User-defined!
    ├── config.yaml
    ├── artifact.tmpl.md
    └── prompts.md
```

**Pros:**
- Fully extensible by users
- No recompilation needed
- Templates and prompts co-located
- Natural plugin architecture for future enhancements

**Cons:**
- More complex implementation
- Discovery/loading mechanism needed
- Validation and error handling complexity
- Type safety concerns (dynamic types)

## Related Work

- **Track kinen-dq4**: Design kinen plugin/feature package system for session types (beads epic)
- **Current implementation**: `internal/spaces/repository_fs.go`
- **Proto definitions**: `api/kinen/kinen.proto`
- **Repository pattern**: `internal/spaces/repository.go`

## Notes

This design emerged from refactoring the `session` package to use proto-first types and Repository pattern. While cleaning up hardcoded session type logic, we identified the tension between:
1. Type safety and single source of truth (proto)
2. User extensibility and flexibility (plugins)

The plugin architecture could also enable:
- Custom round formats per session type
- Session-specific memory consolidation strategies
- Different artifact structures (e.g., ADR format, RFC format)
- Integration with external tools (Obsidian plugins, IDE extensions)
