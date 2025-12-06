---
date: 2025-12-03
created: 2025-12-03T09:16:39+01:00
artifact_type: session_init
aliases:
  - "kinen-resources-indexing - Session Init"
tags:
  - space/work
  - domain/architecture
  - type/iterative-design
  - tech/typescript
  - status/in-progress
---

# Session: Kinen Resources & Indexing

## Goal

Add two major capabilities to the kinen tool:

1. **Resources Directory** - Support for a `resources/` directory in kinen spaces where users can add PDFs, documents, and documentation useful in the context of a space
2. **Indexing System** - Build a local index of the space covering rounds, artifacts, and resources with full metadata for easy retrieval

## Success Criteria

- [ ] Resources directory structure defined and documented
- [ ] Index storage location and schema designed (`~/.local/share/kinen`)
- [ ] Space identification via git origin (portable across folder moves)
- [ ] Full rebuild capability from space contents
- [ ] Metadata indexing for rounds and artifacts
- [ ] Technology choice finalized (SQLite vs LanceDB vs other)
- [ ] Framework decision (mastra.ai vs alternatives vs custom)
- [ ] MCP tools designed for index access
- [ ] CLI commands designed for index management

## Constraints

- Index must be local to machine (not in git repo)
- Index must be rebuildable from scratch at any time
- Spaces identified by git origin URL (not filesystem path)
- Should work offline
- Minimal dependencies preferred
- TypeScript/Node.js ecosystem (current kinen stack)

## Key Questions

1. What document formats need to be supported for resources? (PDF, markdown, docx, etc.)
2. What kind of search is needed? (full-text, semantic/vector, or both?)
3. Should the index support cross-space queries?
4. What metadata should be indexed for each content type?
5. How should PDF/document extraction work?

## Notes

### Initial thoughts from user:
- Technology options mentioned: SQLite or LanceDB
- Framework suggestion: mastra.ai
- "upib support" mentioned - need to clarify (UPnP? EPUB?)

### Current kinen structure:
- Spaces have `sessions/` with rounds and artifacts
- Config lives in `~/.config/kinen/`
- Spaces registered by name with filesystem path
- Git integration already exists for commits

### Relevant existing code:
- `kinen/src/lib/spaces.ts` - Space management
- `kinen/src/lib/sessions.ts` - Session/round management
- `kinen/src/lib/git.ts` - Git operations
- `kinen/src/lib/config.ts` - Configuration system
