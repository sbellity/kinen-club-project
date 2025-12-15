---
date: 2025-12-14
started_at: 2025-12-14T09:05:48
artifact_type: round
kinen_session: 20251213-01-kinen-go-mcp-cursor-integration
kinen_round: 3
status: complete
ended_at: 2025-12-14T09:18:50
aliases:
  - "kinen-go-mcp-cursor-integration - Implementation Spec"
  - "kinen-go-mcp-cursor-integration - Round 3"
tags:
  - space/work
  - domain/kinen
  - domain/devx
  - type/iterative-design
  - tech/go
  - tech/mcp
summary: "Finalize implementation spec for agent execution; explore Claude skills approach"
---

# Round 03: Implementation Spec — Agent-Ready Plan + Claude Skills

> [!info] Building on
> This round builds on [[rounds/02-technical-design|Round 2: Technical Design]] decisions.
> Implementation plan updated in [[artifacts/implementation-plan|Implementation Plan]].

## Previous Round Summary

Key decisions from Round 2:
- **MCP tools**: Start with proposed list; automations via Claude skills
- **Proto**: All APIs defined in proto
- **MCP wiring**: Create `internal/mcpserver/` package, deprecate `cmd/kinen/mcp/`
- **Parser**: Use existing, make resilient, consider small LLM for edge cases
- **Automations**: Claude skills approach instead of hardcoding
- **Daemon**: Auto-launch from CLI/MCP, health endpoint
- **Recall**: Init searches for related; skills define behavior; frontmatter links
- **Architecture**: Service layer calls interface, server injects FSRepository

## This Round Focus

- Finalize the **implementation spec** so an agent can execute it
- Explore the **Claude skills** approach for automation
- Define **acceptance criteria** for MVP
- Prepare **agent prompt** for implementation

---

## Questions

### Q3.1: Is the implementation plan complete enough for an agent?

I've updated `artifacts/implementation-plan.md` with:
- 7 implementation tasks with "done when" criteria
- Architecture diagram
- Proto additions required
- MCP tool surface

**Review the plan**: Does it have everything needed for an agent to implement?

**Missing pieces I can think of**:
- Specific file paths to modify
- Test file locations
- Import statements needed
- Error handling patterns

> [!note] Answer
>You can write those as general guidelines in the AGENTS.md file since they are mostly that instead of being specific to this implementation plan I guess ?

---

### Q3.2: What's the priority order for implementation tasks?

Current order in plan:
1. Wire `kinen mcp` entrypoint
2. Fix session operations (FSRepository)
3. Add proto RPCs + regenerate
4. Implement session CRUD
5. Implement git operations
6. Implement memory ingestion
7. Daemon auto-launch

**Questions**:
1. Is this the right order?
2. Should we batch some tasks?
3. Any task we should skip for now?

> [!note] Answer
>I'll you decide that

---

### Q3.3: Claude Skills — What format should we use?

You mentioned using Claude skills for automation behaviors. I looked at the docs.

**Skill structure** (from claude code docs):
```
skills/
  kinen-session-init/
    SKILL.md          # Main skill definition
    examples/         # Example conversations
    reference/        # Reference docs (methodology, etc.)
```

**Proposed kinen skills**:

1. **kinen-session-init**: Search for related concepts, inject into init.md
2. **kinen-round-processing**: Look for priors, add related links
3. **kinen-round-finalize**: Update living doc, commit

**Questions**:
1. Does this structure make sense?
2. Should skills live in the kinen-go repo or a separate skills repo?
3. Should we create skills now or after core implementation?

> [!note] Answer
>We will do a separate session on developing Kinen methodology as skills. You can init a new session for it already, we can work on it while another agent works on this implementation plan.

---

### Q3.4: How should we test the MCP integration?

**Options**:

- [ ] **Option A: Manual testing in Cursor**
  - Configure kinen MCP in Cursor
  - Call tools manually
  - Verify responses

- [ ] **Option B: Integration tests**
  - Go tests that start MCP server
  - Send tool calls programmatically
  - Assert on responses

- [x] **Option C: Both** ✅ 2025-12-14
  - Integration tests for CI
  - Manual smoke test in Cursor

> [!note] Answer
>Both. Would be good to implement an "in memory" session repo for tests ? Could just be a pluggable in memory FS to the FS repo maybe instead of rewriting the repo

---

### Q3.5: What's the MVP acceptance test?

Proposed acceptance test (from Round 2):

1. ✅ Cursor starts `kinen mcp`
2. ✅ Tool call lists sessions from vault
3. ✅ Tool call fetches session and reads round
4. ✅ Index round into memory
5. ✅ Search returns relevant snippet

**Additional criteria for "fully functioning"**:
- [x] Can create new session via MCP ✅ 2025-12-14
- [x] Can finalize round via MCP ✅ 2025-12-14
- [x] Can commit changes via MCP ✅ 2025-12-14
- [x] Daemon auto-starts and indexes ✅ 2025-12-14

Is this the right definition of MVP done?

> [!note] Answer
>Yes

---

### Q3.6: Agent prompt — What instructions should we give?

When we launch an agent for implementation, what should the prompt include?

**Draft prompt structure**:
```
You are implementing kinen-go MCP integration.

## Context
- kinen-go is at /Users/sbellity/code/p/kinen-go
- Implementation plan: [link to implementation-plan.md]
- Methodology: [link to methodology-obsidian.md]

## Tasks
[List of tasks from implementation plan]

## Constraints
- Don't break existing CLI behavior
- Use FSRepository for session operations
- All APIs go in proto
- Follow existing code patterns

## Testing
- Run tests before committing
- Manual smoke test in Cursor
```

**Questions**:
1. What else should the prompt include?
2. Should we use beads for task tracking?
3. Should agent commit after each task or batch?

> [!note] Answer
>Yes use beads, you can create the doc/script that will create the beads
>Batch commit after each functional piece complete. No more than a handful of commit for this whole plan.

---

### Q3.7: Kinen config — Which space should be default?

For this implementation, we need kinen-go to know which space to use.

**Current config** (`~/.config/kinen/config.yml`):
```yaml
spaces:
  default: kinen-club-project
  registered:
    kinen-club-project:
      path: /Users/sbellity/Library/Mobile Documents/iCloud~md~obsidian/Documents/kinen-club-project
```

**Questions**:
1. Is this config correct?
2. Should we verify FSRepository reads this correctly?
3. Any path issues with iCloud paths?

> [!note] Answer
>Not sure what you mean exactly. That I will configure once we have something functional. For the tests they should happen in a sandboxed, in memory space I guess. The real user tests yes I will set them up to use the kinen-club space

---

### Q3.8: Should we do a quick "proof of concept" first?

Before full implementation, we could do a quick PoC:
1. Just wire `kinen mcp` to actually serve
2. Just fix `ListSessions` to return real data
3. Test in Cursor

This would prove the integration works before investing in full CRUD.

**Questions**:
1. Worth doing a PoC first?
2. Or go straight to full implementation?

> [!note] Answer
>As you want, you tell me

---

### Q3.9: What's the timeline expectation?

**Rough estimates**:
- Task 1 (wire mcp): 1 hour
- Task 2 (fix sessions): 1-2 hours
- Task 3 (proto + regen): 2 hours
- Task 4 (session CRUD): 3-4 hours
- Task 5 (git ops): 2 hours
- Task 6 (memory ingestion): 3-4 hours
- Task 7 (daemon): 2-3 hours

**Total**: ~15-18 hours

**Questions**:
1. Does this estimate seem reasonable?
2. Any tasks that might take longer?
3. Should we timebox to avoid scope creep?

> [!note] Answer
>I think those sound like a plan where a human would do the implem. With a coding agent I expect this to be done in minutes.

---

### Q3.10: Ready to launch implementation?

After this round:
1. I'll finalize the implementation plan
2. Create agent prompt
3. You can launch agent to implement

**Question**: Ready to proceed with implementation after this round?

> [!note] Answer
>YES

---

## Summary

After your answers, I will:
1. Finalize `artifacts/implementation-plan.md` with any adjustments
2. Create agent prompt for implementation
3. Optionally create initial Claude skill templates

---

*Please respond inside the `> [!note] Answer` callouts. Skip questions that don't resonate.*
