# Multi-Agent Coordination - Technical Spec

**Status**: Draft - Living Document
**Last Updated**: 2024-12-07

## Overview

A protocol and tooling system enabling autonomous multi-agent software development with minimal human coordination.

---

## Current State (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│                         HUMAN COORDINATOR                        │
│   (bottleneck - relays context, answers questions, merges)      │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ Agent 1 │         │ Agent 2 │         │ Agent 3 │
   │ Track A │         │ Track B │         │ Track C │
   └────┬────┘         └────┬────┘         └────┬────┘
        │                    │                    │
        │ question           │ blocked           │ done?
        │────────────────────┼────────────────────│
        │      (via human)   │    (via human)    │
        ▼                    ▼                    ▼
   ┌─────────────────────────────────────────────────┐
   │                    BEADS DB                      │
   │  (issues tracked but no agent-to-agent comms)   │
   └─────────────────────────────────────────────────┘
```

### Pain Points

1. Human is single point of contact for all coordination
2. Agents can't communicate directly
3. No standard for handover quality
4. Context lost between agent invocations
5. No automated completion detection

---

## Target State (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│                       HUMAN PRINCIPAL                            │
│        (strategy, vision, spec - reviews escalations)           │
└────────────────────────────┬────────────────────────────────────┘
                             │ spec + high-level decisions
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COORDINATOR AGENT                             │
│   - Holds architectural context                                  │
│   - Creates/assigns tracks                                       │
│   - Answers 80% of questions autonomously                        │
│   - Escalates true decisions to human                            │
│   - Merges completed work                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ Agent 1 │◄───────►│ Agent 2 │◄───────►│ Agent 3 │
   │ Track A │         │ Track B │         │ Track C │
   └────┬────┘         └────┬────┘         └────┬────┘
        │                    │                    │
        │   (via beads)      │    (via beads)    │
        ▼                    ▼                    ▼
   ┌─────────────────────────────────────────────────┐
   │                    BEADS DB                      │
   │  + question/answer issue types                  │
   │  + handover issues with structured format       │
   │  + discovery issues for cross-track context     │
   └──────────────────────┬──────────────────────────┘
                          │
                          ▼
   ┌─────────────────────────────────────────────────┐
   │              SHARED CONTEXT STORE                │
   │  /context/architecture.md                       │
   │  /context/decisions.md                          │
   │  /context/tracks/*.md                           │
   └─────────────────────────────────────────────────┘
```

---

## Beads Protocol Extensions

### New Issue Types

```yaml
# Question - blocks work until answered
type: question
fields:
  - blocking_task: <issue-id>  # What this question blocks
  - category: [architecture|implementation|tooling|clarification]
  - urgency: [blocking|important|nice-to-have]
  - context: <markdown>        # What agent knows/tried
  
# Answer - unblocks question
type: answer  
fields:
  - answers: <question-id>     # Links to question
  - decision: <markdown>       # The answer
  - rationale: <markdown>      # Why this answer
  - alternatives_considered: <markdown>  # Other options

# Handover - completion report
type: handover
fields:
  - completes: <issue-id>      # What task this completes
  - status: [complete|partial|blocked]
  - changes: [<file-path>...]  # Files modified
  - verified: [build|test|lint]  # What passed
  - discoveries: [<issue-id>...] # Issues found
  - blockers: [<issue-id>...]  # If partial/blocked
  - context: <markdown>        # Key decisions, gotchas
  - next_steps: <markdown>     # For next agent

# Discovery - cross-track information
type: discovery
fields:
  - found_by: <agent-id>
  - relevant_to: [<issue-id>...] # What tracks should know
  - finding: <markdown>
  - action_needed: [none|investigate|fix|discuss]
```

### Workflow Conventions

```
AGENT LIFECYCLE:

1. STARTUP
   - Read assigned task from beads
   - Query: bd list --assignee=<self> --status=in_progress
   - Read /context/architecture.md for system understanding
   - Read relevant track context files

2. WORKING
   - If blocked on question:
     a. Create question issue: bd create "Q: <summary>" -t question --deps blocks:<my-task>
     b. Check if answer exists every 5 minutes
     c. If answer found, continue
     d. If no answer after 30 min, escalate urgency
   
   - If discover something relevant to other tracks:
     a. Create discovery issue: bd create "Discovery: <summary>" -t discovery
     b. Tag relevant tracks in relevant_to field
   
   - Update track context file with progress

3. COMPLETION
   - Create handover issue with full context
   - Update task status to closed
   - Update /context/tracks/<track>.md with final state

COORDINATOR LIFECYCLE:

1. MONITORING (every 5 minutes)
   - Query: bd list --type=question --status=open
   - For each question:
     a. Can I answer from context? → Create answer
     b. Need human decision? → Escalate (update urgency, notify)
   
   - Query: bd list --type=handover --status=open
   - For each handover:
     a. Review changes
     b. Run verification (build, test)
     c. Merge or request fixes
     d. Close handover issue

2. CONTEXT MAINTENANCE
   - Update /context/decisions.md with new ADRs
   - Update /context/architecture.md if system changes
   - Ensure all agents have consistent view
```

---

## Context Store Structure

```
/context/
├── architecture.md      # Current system design
│   - Component diagram
│   - Key interfaces
│   - Data flow
│
├── decisions.md         # All decisions (ADR index)
│   - Links to /docs/adr/*
│   - Quick reference table
│
├── constraints.md       # Non-negotiables
│   - Tech stack choices
│   - Performance requirements
│   - Security requirements
│
└── tracks/
    ├── track-1-parser.md
    │   - Assigned agent
    │   - Current status
    │   - Files touched
    │   - Key decisions made
    │   - Blockers/questions
    │
    ├── track-2-storage.md
    └── ...
```

### File Locking

To prevent concurrent writes:
```bash
# Before writing context file
flock /context/.lock -c "update_context.sh"

# Or use git-based approach
# Agent creates branch, coordinator merges
```

---

## Coordinator Agent Specification

### Capabilities Required

1. **Full codebase understanding** - Can answer "where is X implemented?"
2. **Architectural context** - Knows design decisions and rationale
3. **Track awareness** - Knows what each track is doing
4. **Question classification** - Can decide: answer vs escalate
5. **Code review** - Can verify handover quality
6. **Merge capability** - Can resolve simple conflicts

### Decision Authority Matrix

| Decision Type | Coordinator Can Decide | Escalate to Human |
|--------------|----------------------|-------------------|
| Interface design within spec | ✓ | |
| Implementation approach | ✓ | |
| Breaking API change | | ✓ |
| New dependency | | ✓ |
| Architecture deviation | | ✓ |
| Bug fix approach | ✓ | |
| Test coverage | ✓ | |
| Performance tradeoff | | ✓ |

### Escalation Protocol

```markdown
## Escalation: [Brief Title]

**From**: Coordinator Agent
**Regarding**: Track [X], Issue [beads-id]
**Urgency**: [blocking|important|advisory]

### Context
[What the agent is trying to do]

### Question
[Specific decision needed]

### Options
1. [Option A] - [pros/cons]
2. [Option B] - [pros/cons]

### Coordinator Recommendation
[If any]

### Impact of Delay
[What happens if not answered within X hours]
```

---

## Implementation Phases

### Phase 1: Beads Conventions (Week 1)
- Document question/answer/handover patterns
- Create issue templates
- Manual adherence (no tooling enforcement)
- Test with one implementation session

### Phase 2: Context Store (Week 2)
- Create /context/ directory structure
- Document update protocols
- Test with coordinator manually updating

### Phase 3: Coordinator Agent MVP (Week 3-4)
- Implement as kinen-go service
- Basic question answering from context
- Handover verification
- Human escalation via beads

### Phase 4: Automation (Week 5+)
- File watcher for context changes
- Automated polling of beads
- Merge automation
- Metrics collection

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Human coordination messages per session | ~50 | <10 |
| Agent blocking time (avg) | ~hours | <30 min |
| Handover completeness | Variable | 100% template |
| Context loss incidents | Common | Rare |
| Time to first escalation | Immediate | Only true decisions |

---

## Open Questions

1. Should coordinator be long-running or invoked per-check?
2. How to handle truly urgent questions (blocking critical path)?
3. What's the authentication model for agents?
4. How do we handle agent failure mid-task?
5. Should we support agent-to-agent direct communication?

---

## Appendix: Examples from Dec 6-7 Session

### Example: Blocking Question (Actual)

Agent 1C created question but got no response because:
1. Question was in wrong beads workspace
2. No notification to coordinator
3. No protocol for coordinator to check for questions

**Proposed solution**:
```bash
# Agent creates question
bd create "Q: Interface design for EdgeStorage" \
  -t question \
  --deps blocks:kinen-1c-task \
  --labels architecture

# Coordinator runs (every 5 min or on notification)
bd list --type=question --status=open

# Coordinator answers
bd create "A: Use separate interface, not Storage" \
  -t answer \
  --deps answers:kinen-q-123 \
  --json
```

### Example: Good Handover (Composite)

```markdown
## Handover: Track 2 - Index Commands

### Status: COMPLETE

### Changes Made
- [x] cmd/kinen/commands/index.go - New file, index subcommands
- [x] internal/server/kinen_server.go - IndexBuild, IndexStatus RPCs
- [x] api/kinen/kinen.proto - Request/response messages
- [x] internal/server/adapters.go - Parser/Storage adapters (moved from server)

### Build Verification
$ make check  # ✓ passed
$ make test   # ✓ passed (new tests in spaces_test.go)

### Discovered Issues
- kinen-xyz: FileWatcher not wired in daemon (created as separate task)

### Key Decisions
- Used on-demand IndexWorker pattern (ADR-0007)
- Adapters bridge MemoryService to watcher interfaces
- Index commands use existing MemoryService, not direct storage

### Next Steps for Integration
1. FileWatcher needs to be wired in cmd/kinen-daemon/main.go
2. Run `make proto` if proto files changed
3. Test: `kinen index status` should show stats
```

### Example: Poor Handover (Actual Pattern)

```markdown
Done with track 3. Check the code.
```

**Why this fails**:
- No files listed
- No verification status
- No context for next agent
- No discoveries documented
