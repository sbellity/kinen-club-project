# ADR-001: Files as Source of Truth

## Status
**Accepted** (Dec 6, 2025)

## Context
We need to determine the primary storage mechanism for kinen. Options considered:
1. Database-first (SQLite or LanceDB as primary)
2. Files-first (Markdown files as primary, database as derived index)
3. Hybrid (some data in files, some in database)

## Decision
**Markdown files on the filesystem are the source of truth.** All databases (SQLite, LanceDB) are derived indices that can be rebuilt from files at any time.

## Rationale
- **Git versioning**: Files can be version-controlled, branched, merged
- **Portability**: Clone the repo → you have everything
- **Tool agnostic**: Works with vim, VSCode, Obsidian, any text editor
- **Human readable**: No binary formats, easy to debug
- **Recovery**: If database corrupts, rebuild from files

## Consequences

### Positive
- Clone-and-go workflow, no database migrations to manage
- All content is human-readable and diffable
- Works offline, no server dependency

### Negative
- Index rebuild required on first run
- File watching needed for live updates
- Slight performance overhead vs. database-first

## Related Decisions
- [ADR-006: Adapter Pattern](0006-adapter-pattern.md)
- [ADR-008: Dual Backend](0008-dual-backend.md)



