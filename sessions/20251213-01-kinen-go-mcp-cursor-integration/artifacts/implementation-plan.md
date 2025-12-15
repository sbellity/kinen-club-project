---
created: 2025-12-13T17:26:03
status: active
last_updated: Round 02
---

# kinen-go MCP + Cursor Integration — Implementation Plan

## Overview

Upgrade kinen-go to be a **full-featured MCP server** usable in Cursor as the primary interface for kinen sessions. Add **memory ingestion + recall** so past session insights flow into new sessions. Automation behaviors (commit, recall, finalize) will be driven by **Claude skills**, not hardcoded in tools.

## Scope

### In Scope (MVP)
- Full CRUD for sessions/rounds/artifacts via MCP
- `kinen mcp` as the canonical, stable entrypoint
- Git integration (commit, status, log) as tools
- Memory ingestion at question/answer granularity
- Search/recall from past sessions
- CLI, MCP, and daemon share the same capabilities
- Daemon auto-launches from CLI/MCP if not running

### Automation via Claude Skills (not hardcoded)
- `FinalizeRound` → auto-commit behavior
- `CreateSession` → auto-recall related work
- Round processing → look for priors

### Deferred (v2)
- Cross-vault recall
- Advanced ranking/boosting policies
- Obsidian/VSCode "related" sidebar (extension work)

## Decisions from Rounds 1 & 2

| Topic | Decision | Source |
|-------|----------|--------|
| Scope | Full CRUD - go all-in | R1 Q1.1 |
| Entrypoint | `kinen mcp` canonical | R1 Q1.2 |
| Session store | Filesystem is truth, DB for indices | R1 Q1.3 |
| Ingestion unit | Question/answer granularity | R1 Q1.4 |
| Indexing | CLI + MCP + daemon (same capabilities) | R1 Q1.8 |
| MCP tools | Start with proposed list | R2 Q2.1 |
| Automations | Claude skills, not hardcoded | R2 Q2.1, Q2.5 |
| Proto | All APIs go in proto | R2 Q2.2 |
| MCP wiring | `internal/mcpserver/` package, deprecate `cmd/kinen/mcp/` | R2 Q2.3 |
| Parser | Use existing, make resilient, consider small LLM for edge cases | R2 Q2.4 |
| Daemon | Auto-launch, health endpoint, MVP scope | R2 Q2.6 |
| Recall | Init searches for related; skills define behavior; frontmatter links | R2 Q2.7 |
| Architecture | Service layer calls interface, server injects FSRepository | R2 Q2.10 |

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           Cursor / IDE                                │
│                    (Claude skills drive automation)                   │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ stdio (MCP)
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         kinen mcp                                     │
│              (internal/mcpserver/ - thin wrapper)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Session Ops │  │  Git Ops    │  │ Memory Ops  │  │ Space/Config│  │
│  │ Create/List │  │ Commit/Log  │  │ Search/Index│  │ Switch/Get  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         │                │                │                │          │
│         ▼                ▼                ▼                ▼          │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                    Service Layer (interfaces)                 │    │
│  │   SessionRepository | MemoryService | SpaceRepository | Git  │    │
│  └──────────────────────────────────────────────────────────────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼─────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────┐ ┌─────────────┐ ┌───────────────┐ ┌─────────────────┐
│ FSRepository    │ │ Git exec    │ │ SQLite + VSS  │ │ ~/.config/kinen │
│ sessions/       │ │             │ │ memories.db   │ │ config.yml      │
│ rounds/         │ │             │ │               │ │                 │
│ artifacts/      │ │             │ │               │ │                 │
└─────────────────┘ └─────────────┘ └───────────────┘ └─────────────────┘
          ▲
          │ watches
┌─────────────────┐
│ kinen-daemon    │
│ (auto-launched) │
│ - file watcher  │
│ - auto-index    │
│ - health endpoint│
└─────────────────┘
```

## Proto Additions Required

Add to `api/kinen/kinen.proto`:

```protobuf
// Session CRUD
rpc CreateSession(CreateSessionRequest) returns (CreateSessionResponse);

// Round operations
rpc FinalizeRound(FinalizeRoundRequest) returns (FinalizeRoundResponse);

// Artifact operations
rpc UpdateArtifact(UpdateArtifactRequest) returns (UpdateArtifactResponse);

// Git operations
rpc Commit(CommitRequest) returns (CommitResponse);
rpc GitStatus(GitStatusRequest) returns (GitStatusResponse);
rpc GitLog(GitLogRequest) returns (GitLogResponse);

// Space operations
rpc SwitchSpace(SwitchSpaceRequest) returns (SwitchSpaceResponse);
rpc RegisterSpace(RegisterSpaceRequest) returns (RegisterSpaceResponse);

// Config operations
rpc GetConfig(GetConfigRequest) returns (GetConfigResponse);
rpc SetConfig(SetConfigRequest) returns (SetConfigResponse);

// Memory operations
rpc IndexSession(IndexSessionRequest) returns (IndexSessionResponse);
```

## MCP Tool Surface (v1)

**Session Ops**: `kinen_session_new`, `kinen_session_list`, `kinen_session_current`, `kinen_session_find`, `kinen_session_get`

**Round Ops**: `kinen_round_list`, `kinen_round_get`, `kinen_round_finalize`

**Artifact Ops**: `kinen_artifact_get`, `kinen_artifact_update`

**Git Ops**: `kinen_commit`, `kinen_git_status`, `kinen_git_log`

**Space/Config**: `kinen_space_list`, `kinen_space_current`, `kinen_space_switch`, `kinen_config_get`, `kinen_config_set`

**Memory/Recall**: `kinen_search`, `kinen_index_session`, `kinen_recall_for_session`

**Methodology**: `kinen_methodology_get`

## Implementation Tasks

### Task 1: Wire `kinen mcp` entrypoint
- Create `internal/mcpserver/server.go` with `Serve()` function
- Update `cmd/kinen/main.go` `runMCP()` to call `mcpserver.Serve()`
- Deprecate/remove `cmd/kinen/mcp/`
- **Done when**: `kinen mcp` starts and serves over stdio

### Task 2: Fix session operations (use FSRepository)
- Inject `spaces.Repository` interface into `KinenServer`
- Update `ListSessions` to call `repository.ListSessions()`
- Update `GetSession` to return real `Session` objects
- **Done when**: `ListSessions` and `GetSession` return real data

### Task 3: Add proto RPCs + regenerate
- Add missing RPCs to `api/kinen/kinen.proto`
- Run `buf generate` to regenerate Go code
- Implement handlers in `KinenServer`
- **Done when**: All tools have corresponding RPCs

### Task 4: Implement session CRUD
- `CreateSession`: create folder, init.md, living doc
- `FinalizeRound`: create round summary section
- `UpdateArtifact`: append/replace section in artifact
- **Done when**: Can create session and finalize rounds via MCP

### Task 5: Implement git operations
- `Commit`: stage session files, commit with auto-message
- `GitStatus`: return staged/unstaged/untracked
- `GitLog`: return recent commits
- **Done when**: Can commit session changes via MCP

### Task 6: Implement memory ingestion
- Add function to convert `ParsedRound` → `[]MemoryInput`
- Use existing parser, make resilient to edge cases
- Consider small LLM call for complex extraction
- **Done when**: Can index a session into memory

### Task 7: Daemon auto-launch
- Add daemon health check to MCP/CLI startup
- Auto-launch daemon if not running
- Daemon watches space and auto-indexes
- **Done when**: Daemon starts automatically and indexes

## Testing Strategy

1. **Unit**: Parser edge cases, FSRepository operations
2. **Integration**: MCP tool calls → filesystem changes
3. **E2E acceptance test**:
   - Cursor starts `kinen mcp`
   - List sessions from vault
   - Get session and read round
   - Index round into memory
   - Search returns relevant snippet

## Claude Skills Approach

Instead of hardcoding automation behaviors (auto-commit, auto-recall), these will be defined as **Claude skills** that the agent follows:

- **Session Init Skill**: Search for related concepts, inject into init.md
- **Round Processing Skill**: Look for priors, add related links to frontmatter
- **Round Finalize Skill**: Commit after finalizing, update living doc

See: https://code.claude.com/docs/en/skills

## Beads Setup

After installing beads, run:
```bash
cd /Users/sbellity/code/p/kinen-go
bd init
./scripts/create-beads-issues.sh
```

This creates an epic with 8 subtasks matching the implementation plan.

## Open Questions

- [ ] Exact skill format for kinen workflows → see session [[20251214-01-kinen-methodology-skills]]
- [ ] How to surface related content in Obsidian/VSCode sidebars (extension work)
- [ ] Small LLM for parser edge cases - which model? when to call?
