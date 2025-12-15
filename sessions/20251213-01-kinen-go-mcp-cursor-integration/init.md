---
date: 2025-12-13
started_at: 2025-12-13T17:26:03
artifact_type: session_init
kinen_session: 20251213-01-kinen-go-mcp-cursor-integration
status: in-progress
aliases:
  - "kinen-go-mcp-cursor-integration - Session Init"
  - "kinen-go MCP in Cursor"
tags:
  - space/work
  - domain/kinen
  - domain/devx
  - type/iterative-design
  - tech/go
  - tech/mcp
summary: "Design implementation plan for using kinen-go MCP as primary session interface in Cursor, and leveraging kinen memory for cross-session recall"
---

# Session: kinen-go MCP + Cursor Integration (and Memory Recall)

## Goal

Make **kinen-go** usable as a first-class **MCP server in Cursor**, so we can:

1. Use **sessions/rounds/artifacts** via MCP as the main workflow surface
2. Use **kinen memory** to recall insights from past sessions and inject them into new sessions

## Success Criteria

- [ ] Cursor can start `kinen mcp` (stdio) reliably
- [ ] MCP session surface is correct and complete for *read-path* usage:
  - [ ] List sessions
  - [ ] Get session (title + round/artifact paths)
  - [ ] Get round / list rounds
  - [ ] Get artifact
- [ ] Memory recall loop works end-to-end:
  - [ ] Past session content can be ingested into memory with strong metadata
  - [ ] Querying memory returns relevant prior insights for a new session
- [ ] Clear implementation plan captured in `artifacts/implementation-plan.md`

## Constraints

- Avoid breaking existing kinen-go CLI behavior
- Prefer minimal surface area first (read-path + recall) before write operations
- No "fake" health/stats: status and metrics must reflect real underlying dependencies/data

## Key Questions

1. Should MCP be *read-only* for sessions initially, or include create/update operations?
2. What is the canonical pipeline from "markdown session files" → "memory entries"?
3. How should we scope recall for a given session (space, tags, time window, project)?
4. Where should indexing live (in-memory, SQLite, LanceDB, existing storage)?

## Key Documents

- Methodology reference (core): `/Users/sbellity/Library/Mobile Documents/iCloud~md~obsidian/Documents/kinen/docs/system-prompt-core.md`
- Existing related sessions:
  - [[20251203-01-kinen-resources-and-indexing]]
  - [[20251208-01-memory-architecture-evolution]]
  - [[20251207-02-multi-agent-coordination]]

## Next Steps

Start with [[rounds/01-foundation|Round 1: Foundation - Surfaces, Data Flow, Options]]
