---
date: 2025-12-13
started_at: 2025-12-13T18:32:21
artifact_type: round
kinen_session: 20251213-01-kinen-go-mcp-cursor-integration
kinen_round: 2
status: complete
ended_at: 2025-12-14T09:05:48
aliases:
  - "kinen-go-mcp-cursor-integration - Technical Design"
  - "kinen-go-mcp-cursor-integration - Round 2"
tags:
  - space/work
  - domain/kinen
  - domain/devx
  - type/iterative-design
  - tech/go
  - tech/mcp
summary: "Design MCP tool surface, proto changes, and memory ingestion pipeline"
---

# Round 02: Technical Design — MCP Surface + Memory Pipeline

> [!info] Building on
> This round builds on [[rounds/01-foundation|Round 1: Foundation]] decisions.
> Also references the TypeScript implementation at `/Users/sbellity/code/kinen-club/kinen/src/mcp.ts`.

## Previous Round Summary

Key decisions from Round 1:
- **Full CRUD scope** — go all-in; we're not far
- **`kinen mcp`** as canonical entrypoint
- **Filesystem is source of truth**; DB for indices
- **Question/answer granularity** for memory ingestion
- **CLI + MCP + daemon** should expose the same capabilities
- **Auto-commit after rounds**; `FinalizeRound` creates summary
- Defer: auto-daemon, cross-vault, advanced ranking

You pointed to the TS implementation—I've extracted the patterns (tools, prompts, resources, git integration).

## This Round Focus

- Finalize the **MCP tool surface** for Go implementation
- Design the **proto additions** needed (RPCs + messages)
- Define the **question/answer extraction pipeline** for memory ingestion
- Identify the **smallest code changes** to unblock Phase A/B/C

---

## Questions

### Q2.1: What's the final MCP tool list for Go v1?

Based on TS impl + your feedback, here's a proposed surface:

**Session Ops**

| Tool | Description |
|------|-------------|
| `kinen_session_new` | Create session folder + init.md |
| `kinen_session_list` | List sessions (limit, recent first) |
| `kinen_session_current` | Get most recent session |
| `kinen_session_find` | Find by name query |
| `kinen_session_get` | Get full session (rounds, artifacts, metadata) |

**Round Ops**

| Tool | Description |
|------|-------------|
| `kinen_round_list` | List rounds in a session |
| `kinen_round_get` | Get parsed round content |
| `kinen_round_finalize` | Create round summary, update living doc |

**Artifact Ops**

| Tool | Description |
|------|-------------|
| `kinen_artifact_get` | Get parsed artifact |
| `kinen_artifact_update` | Update artifact content (append/replace section) |

**Git Ops**

| Tool | Description |
|------|-------------|
| `kinen_commit` | Commit session changes (auto-message from round/topic) |
| `kinen_git_status` | Git status of current space |
| `kinen_git_log` | Recent commits |

**Space/Config**

| Tool | Description |
|------|-------------|
| `kinen_space_list` | List spaces |
| `kinen_space_current` | Get current space |
| `kinen_space_switch` | Switch to different space |
| `kinen_config_get` | Get config value |
| `kinen_config_set` | Set config value |

**Memory/Recall**

| Tool | Description |
|------|-------------|
| `kinen_search` | Search memories |
| `kinen_index_session` | Index a session into memory |
| `kinen_recall_for_session` | Get relevant memories for a new session |

**Methodology**

| Tool | Description |
|------|-------------|
| `kinen_methodology_get` | Get methodology content |

**Questions**:
1. Anything to add or remove?
2. Should `kinen_round_finalize` also trigger `kinen_commit`?
3. Should `kinen_recall_for_session` be automatic when creating a session?

> [!note] Answer
>1. Let's start with that
>2. yes but I think we weill handle this behaviour with Claude skills and not hardcode this in the tool https://code.claude.com/docs/en/skills
>3. Same thing that will be documentedin a skill

---

### Q2.2: Which proto changes are needed?

**Current proto** (`api/kinen/kinen.proto`) has:
- Search, AddMemory, GetStats, ListMemories, GetMemory, Export, LoadData, Health
- GetRound, ListRounds, GetSession, ListSessions, GetArtifact

**Missing for full CRUD**:
1. `CreateSession(name, type)` → `Session`
2. `FinalizeRound(session_path, round_number)` → `FinalizeRoundResponse`
3. `UpdateArtifact(path, section, content)` → `UpdateArtifactResponse`
4. Git ops: `Commit`, `GitStatus`, `GitLog`
5. Space ops: `SwitchSpace`, `RegisterSpace`
6. Config ops: `GetConfig`, `SetConfig`
7. Memory ops: `IndexSession(session_path)`

**Question**: Should we add all of these to proto, or handle some in Go code only (bypassing proto)?

> [!note] Answer
>Yes. Protos define the api of the system so if those are exposed then proto it is.

---

### Q2.3: How should `kinen mcp` be wired?

**Current state**:
- `cmd/kinen/mcp/main.go` works (separate binary)
- `cmd/kinen/main.go` → `runMCP()` prints error and exits

**Proposed fix**:
```go
// cmd/kinen/main.go
func runMCP() {
    // Reuse same logic as cmd/kinen/mcp/main.go
    // Either:
    // A) Import a shared mcpserver.Serve() function
    // B) Inline the same setup here
}
```

**Questions**:
1. Create a shared `internal/mcpserver/` package?
2. Or just duplicate the ~50 lines in both places?
3. Should we deprecate `cmd/kinen/mcp/` once `kinen mcp` works?

> [!note] Answer
>1. Yes create mcpserver package if necessary but it should just ba e very thing wrapper, right ?
>2. Deprecate cmd/kinen/mcp/

---

### Q2.4: Question/Answer extraction pipeline

**Input**: Round markdown file with structure like:
```markdown
### Q1.1: Question Title

Context text...

- [ ] Option A
- [x] Option B ✅

> [!note] Answer
> User's answer here
```

**Output**: Memory records with:
- `id`: `<session>/<round>/Q1.1`
- `content`: Question title + answer text
- `category`: `decision` or `insight`
- `metadata`: `{session, round, question_id, tags, ...}`

**Pipeline options**:

- [x] **Option A: Leverage existing parser** ✅ 2025-12-14
  - `internal/parser/round.go` already extracts `Question` structs
  - Add a function to convert `ParsedRound` → `[]MemoryInput`
  - **Pros**: Reuse existing code
  - **Cons**: Parser may need tweaks for edge cases

- [ ] **Option B: Dedicated ingestion parser**
  - New `internal/ingestion/session_parser.go`
  - Purpose-built for memory extraction
  - **Pros**: Optimized for ingestion; clean separation
  - **Cons**: More code to maintain

**Questions**:
1. Which approach?
2. Should we also ingest the round "Summary" section?
3. What about init.md goals and living doc decisions?

> [!note] Answer
>Use existing parser, that's what it's here for. Make it resilient to edge cases. Also might be useful to do a call to a small and fast llm to do this instead of chasing edge cases ?

---

### Q2.5: Auto-commit behavior

The TS impl has `kinen_commit` with:
- `session`: which session to commit
- `round`: round number for auto-message
- `topic`: topic for auto-message
- `message`: custom message (overrides auto)
- `all`: commit all changes, not just session

**Auto-message format** (proposed):
```
kinen(<session>): <action> <round/topic>

Examples:
kinen(memory-architecture): complete round 01
kinen(mcp-integration): update implementation plan
```

**Questions**:
1. Should `FinalizeRound` automatically call commit?
2. What should the auto-message format be?
3. Should we support `--all` (commit entire space)?

> [!note] Answer
>We are going to explore the idea of driving this through Claude like skills instead of hardcoding those automations. What do you think ?

---

### Q2.6: What's the daemon's role in this architecture?

You mentioned the daemon should handle indexing in the background. Current state:
- `cmd/kinen-daemon/main.go` exists but is minimal
- File watcher exists in `internal/watcher/`

**Proposed daemon responsibilities**:
1. Watch space for file changes
2. Auto-index new/updated rounds into memory
3. Keep memory index fresh

**Questions**:
1. Should MCP/CLI auto-launch daemon if not running?
2. Should daemon expose a health endpoint?
3. What's the minimum viable daemon for v1?

> [!note] Answer
>1. yes
>2. yes
>3. I want to use kinen, I think the MVP is what we have discussed so far.

---

### Q2.7: Memory retrieval for new sessions

When starting a new session, we want to surface relevant prior work.

**Proposed flow**:
1. User calls `kinen_session_new(name, type)`
2. System runs semantic search with name/type as query
3. Top N results (e.g., 5) are returned with session + round paths
4. These are injected into `init.md` as "Related Work" section

**Alternative**: Manual recall with `kinen_recall_for_session(query, limit)`

**Questions**:
1. Should recall be automatic on session creation?
2. What should the output format be? (links? summaries? both?)
3. How many results is useful without being noisy?

> [!note] Answer
>I think on session init, the init step should search for related concepts and ideas and surface them in the init.md
>Skill for round processing will tell the agent to look for priors, methodology should define the behaviour, user should be able to refine the skill or indicate in his prompt.
>The obsidian and / or VSCode extension could also show a "related" section in the sidebars, depending on the current round / current question (as defined in session/round state but also maybe cursor or scroll position on the doc)
>Output should be summary, links, whatever seems relevant. That should be delegated to a model/subagent responsible for doing this. Also the agent that prepares the round can prepare links for related section (maybe in frontmatter of the round?)

---

### Q2.8: What's the Phase A checklist?

Proposed **Phase A: MCP boot** done criteria:

- [x] `kinen mcp` starts MCP server over stdio (no error exit) ✅ 2025-12-14
- [x] Cursor can connect and call `Health` ✅ 2025-12-14
- [x] `ListSessions` returns real session data (fix stub) ✅ 2025-12-14
- [x] `GetSession` returns real session metadata + paths ✅ 2025-12-14

**Question**: Is this the right definition of "Phase A done"?

> [!note] Answer
>We already discussed, we can phase it if you want but ultimately the MVP is the fully functioning thing where we can run this specific session in Cursor

---

### Q2.9: What's blocking us from starting Phase A right now?

Based on my earlier analysis:

1. `cmd/kinen/main.go` line 162-203: `runMCP()` exits instead of serving
2. `internal/server/kinen_server.go` line 456-458: `ListSessions` returns `nil` sessions
3. Need to wire `FSRepository` into `KinenServer` for session ops

**Estimated effort**: ~2-3 hours for Phase A.

**Question**: Should we start coding Phase A now, or complete Round 2 questions first?

> [!note] Answer
>Here I am, completing Round 2. Let's get a solid plan first and then we will launch an agent for implem.

---

### Q2.10: Any other technical concerns?

**Known issues from earlier exploration**:
- `internal/session` package doesn't exist (functions called in `kinen_server.go` are stubs)
- Need to verify `FSRepository` works correctly for current space

**Question**: Anything else you're aware of that might block implementation?

> [!note] Answer
>FSRepository is an implem of an interface. Service layer should call interface, concrete server must inject FSRepository.

---

## Summary

After your answers, I will:
1. Update `artifacts/implementation-plan.md` with technical decisions
2. If you say "start coding", begin Phase A implementation
3. Otherwise, continue to Round 3 with deeper technical design

---

*Please respond inside the `> [!note] Answer` callouts. Skip questions that don't resonate.*
