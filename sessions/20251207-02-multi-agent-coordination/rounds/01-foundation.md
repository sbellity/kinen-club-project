---
date: 2025-12-07
started_at: 2025-12-07T17:45:00+01:00
artifact_type: round_foundation
aliases:
  - "multi-agent-coordination - Foundation"
  - "multi-agent-coordination - Round 1"
tags:
  - space/work
  - domain/architecture
  - domain/devx
  - type/iterative-design
  - status/seed
  - topic/coordination
  - topic/multi-agent
kinen_round: 1
kinen_status: seed
summary: "Establish foundation for autonomous multi-agent coordination system"
session: "[[20251207-02-multi-agent-coordination]]"
---

# Round 01: Foundation - Multi-Agent Coordination

> [!info] Session Seed
> This is a prepared foundation round based on coordination pain points observed during the Dec 6-7 kinen-beads-devx implementation session. See `artifacts/session-analysis.md` for detailed data.

## Previous Round Summary

N/A - This is the foundation round.

**Context from Dec 6-7 Session**:
- ~8 hours implementation session with 6 parallel agent tracks
- ~5 hours (62%) were pure coordination overhead
- Key bottleneck: human relaying information between agents

## This Round Focus

- Understand coordination bottlenecks and their root causes
- Establish vision for autonomous agent execution
- Identify minimum viable coordination protocol
- Define authority boundaries for agents vs. human
- Set success criteria for measuring improvement

---

## Questions

### Q1.1: Where Should Human Remain in the Loop?

**Context**: Currently human handles all coordination. We need to decide what truly requires human judgment vs. what can be delegated to agents or a coordinator agent.

- [ ] **Option A: Full delegation after spec**
  - Human provides spec + constraints upfront
  - Agents handle ALL execution decisions autonomously
  - Human reviews final output only
  - **Pros**: Maximum autonomy, minimal human time, agents can work 24/7
  - **Cons**: Risk of wrong decisions compounding, harder to course-correct mid-stream

- [ ] **Option B: Architectural decisions only**
  - Agents handle implementation details freely
  - Human decides: breaking changes, new dependencies, architecture deviations
  - Escalation path for uncertainty
  - **Pros**: Safety on big decisions, agents still autonomous on most work
  - **Cons**: Still requires human polling for escalations, potential blocking

- [ ] **Option C: Approval checkpoints**
  - Agents work in phases, human approves between phases
  - Similar to PR review but at higher level (track completion)
  - **Pros**: Natural review points, catch issues early, clear handoff
  - **Cons**: Blocking if human unavailable, slower iteration

- [ ] **Option D: Trust gradient**
  - Start conservative, increase agent autonomy over time
  - Track agent decision quality, expand authority as trust builds
  - **Pros**: Safe ramp-up, learns what works
  - **Cons**: Slower initial progress, needs tracking mechanism

**Questions**:
1. Which option aligns with how you want to work?
2. What decisions do you absolutely want to make yourself?
3. How much risk tolerance for agent autonomy?

> [!note] Answer
>

---

### Q1.2: How Should Agents Communicate?

**Context**: Agent 1C was blocked for hours waiting for architectural guidance. There was no protocol for async Q&A between agents—all communication routed through human.

- [ ] **Option A: Beads-based messaging**
  - New issue types: `question`, `answer`, `discovery`, `handover`
  - Agents poll beads for messages periodically
  - Git-synced, auditable, uses existing tool
  - **Pros**: No new infrastructure, persistent, auditable
  - **Cons**: Polling-based (5-10 min latency), no real-time notification

- [ ] **Option B: Shared context files**
  - `/context/tracks/*.md` updated by agents as they work
  - Other agents read context when starting or resuming work
  - **Pros**: Persistent, searchable, markdown-based, easy to review
  - **Cons**: Potential write conflicts, passive (must be actively read)

- [ ] **Option C: Coordinator agent as hub**
  - All communication routes through a dedicated coordinator agent
  - Coordinator maintains full context, routes messages, answers questions
  - **Pros**: Single source of truth, can make decisions, always available
  - **Cons**: Coordinator becomes single point of failure, more complex

- [ ] **Option D: Hybrid approach**
  - Agents update shared context (Option B)
  - Coordinator monitors context and intervenes when needed
  - Beads for formal questions and handovers
  - **Pros**: Resilient, best of both approaches
  - **Cons**: More components to build and maintain

**Questions**:
1. Is polling latency (5-10 min) acceptable, or do we need real-time?
2. Should agents be peers or have a hierarchical coordinator?
3. How important is auditability of agent communication?

> [!note] Answer
>

---

### Q1.3: What's the Minimum Viable Protocol?

**Context**: We could build elaborate tooling, but what's the simplest thing that could work? Need to balance iteration speed with problem severity.

- [ ] **Option A: Conventions only (no tooling)**
  - Document patterns for question/answer/handover in AGENTS.md
  - Agents follow conventions through prompt engineering
  - Test with one implementation session
  - **Pros**: Zero development, immediate testing, learns what matters
  - **Cons**: Manual adherence, may not be followed consistently

- [ ] **Option B: Handover template enforcement**
  - Structured handover format with mandatory fields
  - Validation before accepting "done" status
  - Checklist in beads issue or separate artifact
  - **Pros**: Addresses quality variance immediately, easy to implement
  - **Cons**: Still doesn't solve blocking questions during work

- [ ] **Option C: Beads protocol extensions**
  - Add question/answer/discovery issue types to beads
  - Build tooling for creating and querying these
  - **Pros**: Extends existing tool, formal protocol
  - **Cons**: Requires beads changes, still polling-based

- [ ] **Option D: Full coordinator from start**
  - Skip incremental, build the coordinator agent
  - Has context, answers questions, merges work
  - **Pros**: Solves problem completely, dog-food kinen
  - **Cons**: Large upfront investment (2-4 weeks), may over-engineer

**Questions**:
1. Should we iterate toward the solution or build it directly?
2. What's the single pain point to solve first?
3. How much time are you willing to invest in coordination tooling?

> [!note] Answer
>

---

### Q1.4: What Questions Can a Coordinator Auto-Answer?

**Context**: Many blocking questions from Dec 6-7 had clear answers in the architectural context. Agent 1C asked about interface design—the answer was in the technical spec. A coordinator agent needs defined authority.

**Examples from this session**:
- "Interface design: add to Storage interface vs separate interface?" → Answer existed in design docs
- "Should I implement interfaces first or start with SQLite?" → Standard practice, no ambiguity
- "What do edges/metadata look like?" → Defined in technical spec

- [ ] **Option A: Conservative (escalate most)**
  - Coordinator only answers: "where is X in codebase?", factual lookups
  - Escalates: any design decision, even small ones
  - **Pros**: Safe, human maintains control, low risk of wrong answers
  - **Cons**: Still lots of human involvement, agents still block

- [ ] **Option B: Moderate (answer within spec)**
  - Coordinator answers: implementation details within established spec
  - Escalates: spec changes, breaking changes, new patterns
  - **Pros**: Balance of autonomy and safety
  - **Cons**: "Within spec" can be ambiguous, gray areas

- [ ] **Option C: Aggressive (answer everything possible)**
  - Coordinator answers: anything with clear rationale from context
  - Escalates: only true judgment calls with no clear answer
  - **Pros**: Maximum unblocking, fastest agent progress
  - **Cons**: May make decisions human would disagree with

**Questions**:
1. Which authority level feels right for your working style?
2. What's the cost of a wrong coordinator decision?
3. Should authority increase over time as trust builds?

> [!note] Answer
>

---

### Q1.5: How Do We Handle Blocking Questions?

**Context**: When Agent 1C hit a question, it stopped completely and waited. No timeout, no workaround, no escalation—just blocked indefinitely until human noticed.

- [ ] **Option A: Timeout with best guess**
  - Agent waits N minutes for answer
  - If no answer, makes best guess and documents it
  - Continues with flag for review
  - **Pros**: Never fully blocked, work continues
  - **Cons**: May make wrong decisions, needs review

- [ ] **Option B: Timeout with partial completion**
  - Agent waits N minutes for answer
  - If no answer, completes what it can and stops cleanly
  - Handover documents: "blocked on X, completed Y"
  - **Pros**: No wrong guesses, clear state
  - **Cons**: Partial work may be less useful

- [ ] **Option C: Parallel work queue**
  - Agent has multiple tasks
  - If blocked on task A, switches to task B
  - Returns to A when unblocked
  - **Pros**: Always making progress on something
  - **Cons**: Context switching overhead, more complex agent

- [ ] **Option D: Escalation ladder**
  - 10 min: check for answer
  - 30 min: increase urgency, notify coordinator
  - 60 min: create blocking issue, mark track blocked
  - **Pros**: Graduated response, visibility into blockage
  - **Cons**: Still ultimately blocks if no answer

**Questions**:
1. What should an agent do when blocked?
2. Is "best guess and continue" acceptable?
3. How long is acceptable blocking time?

> [!note] Answer
>

---

### Q1.6: How Do We Prevent Workspace Fragmentation?

**Context**: Agents created issues in wrong beads workspace (`kinen-go/.beads` instead of `kinen/.beads`), causing invisible communication—Agent 1C couldn't see answers that existed.

- [ ] **Option A: Explicit workspace in every command**
  - Always pass `--workspace /path/to/root`
  - Include in all agent prompts and handovers
  - **Pros**: Unambiguous, works immediately
  - **Cons**: Verbose, easy to forget, clutters commands

- [ ] **Option B: Workspace discovery with validation**
  - Walk up from cwd to find `.beads/`
  - Warn if multiple found, require confirmation
  - **Pros**: Automatic for simple cases, catches mistakes
  - **Cons**: Still can create in wrong place if not careful

- [ ] **Option C: Agent onboarding protocol**
  - First thing agent does: verify workspace with `bd where-am-i`
  - Part of handover prompt template, validated before work starts
  - **Pros**: Process-based solution, teaches good habits
  - **Cons**: Relies on agent compliance, can be skipped

- [ ] **Option D: Single beads per repository (enforced)**
  - Lint/CI check: only one `.beads/` allowed per repo
  - Fail if multiple found, require cleanup
  - **Pros**: Prevents problem entirely, clear error
  - **Cons**: May break legitimate multi-workspace use cases

**Questions**:
1. Was the fragmentation a tooling problem or a process problem?
2. Should we enforce single workspace or handle multiple gracefully?
3. How do we ensure agents know the right workspace from the start?

> [!note] Answer
>

---

### Q1.7: What Should Handovers Include?

**Context**: Handover quality varied wildly. Some agents provided detailed file lists, build verification, context. Others said "Done. Check the code." This caused significant time loss for next agent or human reviewer.

- [ ] **Option A: Minimal checklist**
  - Status (complete/partial/blocked)
  - Files changed
  - Build passed (yes/no)
  - **Pros**: Fast to produce, easy to validate
  - **Cons**: Missing context, "why" lost

- [ ] **Option B: Structured template (moderate)**
  - Status, files changed, build verification
  - Key decisions made with rationale
  - Blockers and discovered issues
  - Next steps for continuation
  - **Pros**: Captures essential context, standardized
  - **Cons**: Takes time to write, may be skipped under pressure

- [ ] **Option C: Comprehensive documentation**
  - Everything in Option B, plus:
  - Architectural changes explained
  - Test coverage details
  - Performance considerations
  - Security review
  - **Pros**: Complete record, nothing lost
  - **Cons**: Overhead may slow agents, diminishing returns

**Questions**:
1. What information do you need to review agent work efficiently?
2. What's caused the most confusion when reviewing completed tracks?
3. Should handover quality be validated before marking complete?

**Related Work**: See `artifacts/technical-spec.md` for proposed handover template.

> [!note] Answer
>

---

### Q1.8: How Do We Track Cross-Track Context?

**Context**: Agent 2 didn't know about FileWatcher implementation from Track 1D. Led to confusion about gaps. Each agent had partial view of the system being built.

- [ ] **Option A: Shared context file**
  - Single `/context/current-state.md` updated by all agents
  - Documents: what's built, what's in progress, known gaps
  - **Pros**: Single source of truth, always current
  - **Cons**: Write conflicts possible, needs discipline

- [ ] **Option B: Track status in beads**
  - Each track has issue with running notes field
  - Agents update notes with progress and discoveries
  - **Pros**: Uses existing tool, linked to work items
  - **Cons**: Scattered across issues, hard to get overview

- [ ] **Option C: Discovery issues**
  - When agent finds something relevant to other tracks, create discovery issue
  - Tag relevant tracks, describe finding
  - **Pros**: Explicit notification, permanent record
  - **Cons**: May create noise, needs triage

- [ ] **Option D: Coordinator maintains context**
  - Coordinator reads all track outputs
  - Synthesizes into unified view
  - Pushes relevant context to agents when they start
  - **Pros**: Agents don't need to coordinate, always fresh context
  - **Cons**: Depends on coordinator quality, single point of failure

**Questions**:
1. How should agents learn about work happening in parallel tracks?
2. Is push (coordinator tells them) or pull (agents read context) better?
3. What level of cross-track awareness do agents need?

> [!note] Answer
>

---

### Q1.9: How Do We Verify Agent Work?

**Context**: After agents said "done," human had to manually verify: Did it build? Do tests pass? Does it actually work? Is the code quality acceptable?

- [ ] **Option A: Self-reported verification**
  - Agent runs build/test before declaring done
  - Reports results in handover
  - Trust but verify occasionally
  - **Pros**: Fast, minimal overhead
  - **Cons**: Agent may miss issues, no independent check

- [ ] **Option B: Automated CI gate**
  - Agent work triggers CI
  - Must pass before marking complete
  - Standard tests + linting
  - **Pros**: Objective, consistent, catches regressions
  - **Cons**: Setup overhead, may slow iteration

- [ ] **Option C: Coordinator review**
  - Coordinator agent reviews completed work
  - Checks code quality, adherence to spec, tests
  - Either approves or requests changes
  - **Pros**: Deeper review, catches semantic issues
  - **Cons**: Coordinator becomes bottleneck, adds latency

- [ ] **Option D: Human spot-checks**
  - Most work auto-approved after CI
  - Human reviews sample of completed tracks
  - Full review only for critical paths
  - **Pros**: Efficient human time, maintains oversight
  - **Cons**: Issues may slip through, inconsistent

**Questions**:
1. What level of verification gives you confidence in agent work?
2. Should all work be reviewed or only critical paths?
3. Who should review: human, coordinator agent, or CI only?

> [!note] Answer
>

---

### Q1.10: What Does Success Look Like?

**Context**: Need measurable criteria to know if the coordination system is working.

**Current State (from Dec 6-7)**:
- ~50 human coordination messages per session
- Agent blocking time: hours
- Variable handover quality
- Frequent context loss between agents

**Proposed Targets**:

| Metric | Current | Target |
|--------|---------|--------|
| Human coordination messages | ~50 | <10 |
| Agent blocking time (avg) | hours | <30 min |
| Handover completeness | variable | 100% template |
| Context loss incidents | common | rare |
| Time to first escalation | immediate | only true decisions |

**Questions**:
1. Are these the right metrics?
2. What timeframe is realistic for achieving targets?
3. What would make you say "this is working"?
4. What's the most important metric to optimize first?

> [!note] Answer
>

---

## Summary

This foundation establishes:

1. **The problem**: Human coordination as bottleneck (~62% of session time)
2. **Key decisions needed**: Authority delegation, communication protocol, MVP scope
3. **Specific pain points**: Blocking questions, workspace fragmentation, handover quality, context loss
4. **Success criteria**: <10 human messages, <30 min blocking, 100% template compliance

**Pre-Session Materials**:
- `artifacts/technical-spec.md` - Protocol design draft with beads extensions
- `artifacts/session-analysis.md` - Quantified coordination overhead from Dec 6-7

**Next**: [[rounds/02-protocol-design|Round 02 - Protocol Design]]

---

*Please respond inside the `> [!note] Answer` callouts. Skip questions that don't resonate.*
