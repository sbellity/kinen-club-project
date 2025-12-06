---
artifact_type: protocol
date: 2025-12-06
session: "[[20251206-01-kinen-beads-devx]]"
tags:
  - type/protocol
  - domain/coordination
---

# Agent Collaboration Protocol

This document defines how agents collaborate on the kinen project using **beads** for coordination.

## Overview

Multiple agents work on parallel tracks. A **coordinator** (human or agent) monitors beads and answers questions. All communication happens through beads issues — not chat, not files, not comments.

```
Agent 1 (Track 1A) ──┐
Agent 2 (Track 1B) ──┼──> beads <──> Coordinator
Agent 3 (Track 3)  ──┤
Agent 4 (Track 4)  ──┘
```

## Core Principles

1. **Beads is the single source of truth** for task status and communication
2. **Chat is NOT a communication channel** — if it's not in beads, it didn't happen
3. **Async-first**: Don't wait for responses — continue with other tasks
4. **Link everything**: Every issue links to its parent track via `--deps`
5. **Be specific**: Include file paths, error messages, options considered
6. **Propose, don't just ask**: Offer 2-3 options with trade-offs

## ⚠️ CRITICAL: Mandatory Status Updates

**Every agent MUST update beads:**

1. **When starting work** — Claim the task
2. **Every 30-60 minutes** — Progress update
3. **When blocked** — Create BLOCKED issue immediately
4. **When completing a task** — Close with summary
5. **Before ending session** — Status update on all in-progress work

**Failure to update beads = invisible work = coordination failure.**

The chat window is for the agent's internal reasoning only. The coordinator and other agents can ONLY see beads.

## Issue Types for Collaboration

### 1. BLOCKED — You Cannot Continue

When you're stuck and cannot make progress:

```bash
bd create "BLOCKED [TRACK]: Brief description" \
  -t task -p 0 \
  --assignee coordinator \
  --deps discovered-from:EPIC_ID \
  --notes "What I tried:
- Attempted X, got error Y
- Tried Z, but it conflicts with...

What I need:
- Clarification on API design
- Decision on approach A vs B

Files involved:
- path/to/file.go:123"
```

**Priority 0** — Assigned to `coordinator`. Response ASAP.

### 2. QUESTION — You Need Information

When you need clarification but can continue other work:

```bash
bd create "QUESTION [TRACK]: What is the expected behavior for X?" \
  -t task -p 1 \
  --assignee coordinator \
  --deps discovered-from:EPIC_ID \
  --notes "Context:
- Working on feature Y
- Found two possible interpretations

Options I see:
A) Do this (pros: simple, cons: less flexible)
B) Do that (pros: extensible, cons: more complex)

My recommendation: B, because..."
```

**Priority 1** — Assigned to `coordinator`. Response within 1-2 hours.

### 3. DECISION — You Need Authorization

When you've identified a significant choice that affects the project:

```bash
bd create "DECISION [TRACK]: Should we use X or Y for Z?" \
  -t task -p 1 \
  --assignee coordinator \
  --deps discovered-from:EPIC_ID \
  --notes "Trade-off analysis:

Option A: Use X
  + Simpler implementation
  + Better performance
  - Less flexible
  - Doesn't support future feature F

Option B: Use Y
  + More flexible
  + Supports F
  - More complex
  - Slightly slower

Recommendation: A, unless F is important.

Waiting for decision before proceeding with [specific task]."
```

### 4. DISCOVERY — You Found Something Important

When you discover something that affects other tracks or the overall plan:

```bash
bd create "DISCOVERY [TRACK]: Found that X requires Y" \
  -t task -p 2 \
  --assignee coordinator \
  --deps discovered-from:EPIC_ID \
  --notes "While working on [task], discovered:

- The existing code in path/to/file.go already does X
- This affects Track N because...
- Recommendation: [adjust plan / no change needed]"
```

### 5. PROGRESS — Status Update (Optional)

For significant milestones:

```bash
bd update TASK_ID \
  --notes "Progress update:
- Completed: A, B, C
- In progress: D
- Remaining: E, F
- ETA: ~2 hours"
```

## Track Epic IDs

Always link issues to your track epic:

| Track | Epic ID | Name |
|-------|---------|------|
| 1A | `kinen-0ed` | Proto-First API |
| 1B | `kinen-2w9` | Kinen Parser |
| 1C | `kinen-vp0` | LanceDB (Optional) |
| 1D | `kinen-ner` | File Watcher |
| 1E | `kinen-ea7` | Decision Consolidation |
| 1F | `kinen-5iv` | PDF Parser |
| 2 | `kinen-sqc` | Go CLI Port |
| 3 | `kinen-q7o` | VSCode Extension |
| 4 | `kinen-9zl` | Obsidian Compatibility |
| 5 | `kinen-08r` | Distribution |

## Workflow

### Starting Work (MANDATORY)

```bash
# 1. Check what's ready
bd ready

# 2. Claim a task — THIS IS REQUIRED
bd update TASK_ID --status in_progress --notes "Starting work on this task"

# 3. Read the handover document
cat artifacts/implementation/handover-track-XX.md
```

### During Work (MANDATORY)

```bash
# Update status every 30-60 minutes — THIS IS REQUIRED
bd update TASK_ID --notes "Progress: [what you did]
- Completed: [list]
- In progress: [current focus]
- Next: [what's coming]
- ETA: [estimate]"

# If blocked, create blocker IMMEDIATELY (don't wait)
bd create "BLOCKED [TRACK]: ..." -t task -p 0 --deps discovered-from:EPIC_ID

# If you discover new work needed
bd create "New task discovered" -t task -p 2 --deps discovered-from:TASK_ID
```

### Completing Work (MANDATORY)

```bash
# 1. Mark task complete with summary — THIS IS REQUIRED
bd close TASK_ID --reason "Completed:
- Implemented: [what]
- Files changed: [list]
- Tests: [pass/fail/added]
- Notes: [anything important]"

# 2. Check for dependent tasks that are now unblocked
bd ready

# 3. Pick up next task or update status
bd update NEXT_TASK_ID --status in_progress
```

### Ending Session (MANDATORY)

**Before you stop working**, you MUST:

```bash
# Update ALL in-progress tasks with current status
bd update TASK_ID --notes "Session ending. Status:
- Completed: [what got done]
- In progress: [current state]
- Next steps: [what to do next]
- Blockers: [any blockers]
- Files touched: [list of files]"

# If task is complete, close it
bd close TASK_ID --reason "Completed: [summary]"

# If blocked, create blocker
bd create "BLOCKED [TRACK]: [issue]" -t task -p 0 --deps discovered-from:EPIC_ID
```

**An agent that ends without beads updates has failed the collaboration protocol.**

## Coordinator Responsibilities

The coordinator:

1. **Monitors** issues assigned to `coordinator`
2. **Responds** within 1-2 hours for P0/P1 issues
3. **Updates** issues with answers/decisions
4. **Closes** resolved questions
5. **Adjusts** plan if discoveries require it

### Coordinator Monitoring Command

```bash
# See all issues assigned to coordinator
bd list --assignee coordinator

# See open issues needing response
bd list --assignee coordinator --status open

# See blocked agents (P0)
bd list --assignee coordinator --priority 0
```

### Responding to Issues

```bash
# Answer a question
bd update ISSUE_ID \
  --notes "ANSWER: Go with option B because [reasoning].

Additional context:
- [relevant info]
- [links to docs]"

# Then close it
bd close ISSUE_ID --reason "Answered"
```

## Best Practices

### DO

- ✅ Update beads every 30-60 minutes
- ✅ Create issues immediately when blocked (don't wait)
- ✅ Include file paths and line numbers
- ✅ Propose options with trade-offs
- ✅ Link to parent track epic
- ✅ Update task status regularly
- ✅ Close tasks when complete with summary
- ✅ Update beads BEFORE ending your session

### DON'T

- ❌ Use chat as your only output (coordinator can't see it!)
- ❌ End session without beads update
- ❌ Wait silently when blocked
- ❌ Ask vague questions ("what should I do?")
- ❌ Create issues without context
- ❌ Forget to link to track epic
- ❌ Leave tasks in_progress when actually blocked
- ❌ Close without explanation
- ❌ Assume anyone saw your chat messages

## Protocol Violations

If an agent fails to update beads:

1. **Work is invisible** — Coordinator doesn't know what happened
2. **Duplicated effort** — Another agent might redo the same work
3. **Blocked downstream** — Dependent tasks can't start
4. **Lost context** — Next session won't know where to continue

**The coordinator will:**
- Check beads for status, not chat history
- Assume no progress if no beads update
- Potentially reassign tasks with no status

## Example Conversation Flow

```
Agent (Track 1A):
  bd create "QUESTION [1A]: Should proto use int32 or int64 for limit?" \
    -t task -p 1 --deps discovered-from:kinen-0ed \
    --notes "Context: Defining SearchRequest.limit
    
    Options:
    A) int32 - simpler, matches Go int
    B) int64 - future-proof, matches some DBs
    
    Recommendation: int32, we won't have >2B results"

Coordinator:
  bd update kinen-xxx \
    --notes "ANSWER: Use int32. You're right, we won't exceed 2B.
    Also use int32 for offset. Consistency > future-proofing here."
  
  bd close kinen-xxx --reason "Answered: use int32"

Agent:
  # Sees answer, continues work
  bd update kinen-61q --notes "Proceeding with int32 per decision"
```

## Monitoring Commands

```bash
# See all questions/blockers
bd list --status open | grep -E "BLOCKED|QUESTION|DECISION"

# See what's ready to work on
bd ready

# See what's in progress
bd list --status in_progress

# See recent activity
bd list --limit 20
```

## Emergency Protocol

If something is **critically broken** (tests failing, build broken, data loss risk):

```bash
bd create "EMERGENCY: [description]" \
  -t bug -p 0 \
  --notes "CRITICAL: [what happened]
  
Impact: [what's broken]
Immediate action needed: [what to do]
I am: [stopping work / continuing with workaround]"
```

The coordinator will respond immediately to P0 bugs.

---

## Human Relay Protocol

When a human is relaying between the coordinator agent and worker agents (via separate chat sessions), use these templates:

### Starting an Agent Session

Paste this opener to any agent starting work:

```
You're working on Track [X]. Your epic is [kinen-XXX].

BEFORE doing anything:
1. Run: bd show [kinen-XXX]
2. Read the notes field - coordinator left instructions
3. Check your subtasks: bd list --status open | grep [epic-id]

Work until blocked or done. Update beads status every 30-60 min.
Questions go in beads (--assignee coordinator), not chat.

Read collaboration.md for the full protocol:
cat sessions/20251206-01-kinen-beads-devx/artifacts/implementation/collaboration.md
```

### When Agent Asks a Question in Chat

Redirect to beads:

```
Don't ask me - I'm just the relay. Create a beads issue:

bd create "QUESTION [Track]: [your question]" -t task -p 1 \
  --assignee coordinator \
  --deps discovered-from:[your-epic-id] \
  --description "[full context]"

I'll get you an answer from the coordinator.
```

### When Agent Says "Done" or "Blocked"

Verify in beads:

```
Did you update beads? Show me:
bd show [task-id]

I need to see status=closed (if done) or a BLOCKED issue (if stuck).
No beads update = it didn't happen.
```

### When Agent Ends Session Without Update

Remind them:

```
STOP. Before ending, you MUST update beads:

bd update [task-id] --notes "Session ending. Status:
- Completed: [what]
- In progress: [state]  
- Next steps: [what]
- Files: [list]"

Or if done:
bd close [task-id] --reason "[summary]"

This is mandatory per collaboration protocol.
```

### Checking Progress (Ask Coordinator)

When you need a status update, ask the coordinator agent:

```
Check all agent progress
```

The coordinator will query beads and provide a summary.

### Quick Reference for Human Relay

| Situation | Your Response |
|-----------|---------------|
| Agent asks question | "Put it in beads with --assignee coordinator" |
| Agent says done | "Show me the bd close command you ran" |
| Agent is stuck | "Create BLOCKED issue in beads" |
| Agent ends without update | "STOP. Update beads first." |
| You need status | Ask coordinator "check progress" |
| Starting new agent | Paste the opener template |

---

**Remember**: Beads is how we communicate. If it's not in beads, it didn't happen.

