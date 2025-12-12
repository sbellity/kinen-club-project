# Round 2: Interaction Fundamentals

## Previous Round Summary

Key insights from your answers:

| Theme | Your Position |
|-------|---------------|
| **Priority** | Reliability → Speed → Composability |
| **Agent responsibility** | Know what user wants, clarity of execution, track tasks, surface progress |
| **Workflow constraints** | Don't hardcode - agents should plan autonomously based on goals |
| **Skill composition** | Declarative - add skills without workflow changes |
| **User intervention** | Essential - user should course-correct, but agent shouldn't over-ask |
| **Task tracking** | Maybe explicit tool like beads? |
| **MCP inheritance** | Apparently fixed, but delegation is opaque |

**The fundamental question you raised**:
> "Agents main responsibility should maybe to make sure that it knows what user wants, that he has clarity of execution path, and that he keeps track of what he is doing and has to do and can surface that explicitly to the user."

This round explores **how to implement that**.

---

## This Round Focus

1. **Agent-User Alignment Model** - How agent gains clarity before acting
2. **Task Tracking & Progress** - Explicit tracking with tools like beads
3. **Declarative Skills** - Composing capabilities without workflow spaghetti
4. **Explainable Execution** - Making behavior predictable and debuggable

---

## Questions

### Q2.1: The Alignment Protocol

**Context**: You said agents need alignment before committing expensive work. How should this work?

**Current Pattern** (from sessions with `rounds/`):
```
User: "Run winback campaigns for churned enterprise customers"
        ↓
Agent: Creates rounds/01-foundation.md with clarifying questions
        ↓
User: Answers questions
        ↓
Agent: Proceeds with execution
```

**Problem**: This is rigid - agent always asks questions even when unnecessary.

**Proposed: Confidence-Based Alignment**

```
User Request → Agent Analyzes
                    ↓
            ┌───────────────────────┐
            │ Do I have clarity on: │
            │ • Target definition?  │
            │ • Success criteria?   │
            │ • Constraints?        │
            │ • Available data?     │
            └───────────────────────┘
                    ↓
        High confidence → Execute directly
        Low confidence  → Ask specific questions
        Mixed           → State assumptions, ask to confirm
```

**Example Behaviors**:

| Request | Confidence | Agent Response |
|---------|------------|----------------|
| "Run winback for churned enterprise" | Low | "I need to clarify: How do you define 'enterprise'? ACV threshold? Company size?" |
| "Run winback for churned customers with ACV > $100k in last 3 years" | High | "I'll target [criteria]. Creating segment now." |
| "Improve our email engagement" | Very Low | "This is broad. Let me discover your data first, then I'll propose specific options." |

**Questions for you**:
1. Is confidence-based alignment the right model?
2. What signals should drive confidence? (Specificity of request? Data availability? Past session patterns?)
3. Should agent state assumptions even when confident? ("I'll do X unless you say otherwise")
4. How do you feel about "proceed and report" vs. "ask then proceed"?

---

### Q2.2: Explicit Task Tracking with Beads

**Context**: You mentioned beads might help. Let's explore this.

**Current State**: Agent has implicit task tracking:
- `PROJECT.md` (when used) tracks progress
- Artifacts indicate completion
- No explicit "here's my plan, here's what's done"

**Proposed: Beads Integration**

```typescript
// Agent starts session
bd create --title "Winback Campaign for Churned Enterprise" --type epic

// Agent breaks down into tasks
bd create --title "Discover churned enterprise contacts" --deps EPIC-1
bd create --title "Build audience segment" --deps TASK-1
bd create --title "Create email content" --deps TASK-2
bd create --title "Configure campaign in Bird" --deps TASK-3

// As agent works
bd update TASK-1 --status in_progress
// ... does work ...
bd update TASK-1 --status completed --notes "Found 382 contacts via opportunitySummary"

// User can see at any time
bd list --status open  // What's left
bd show EPIC-1         // Full picture
```

**Benefits**:
- Explicit plan visible to user
- Dependencies tracked
- Progress surfaced
- User can intervene on specific tasks
- Agent has clarity on what it committed to

**Challenges**:
- Overhead of creating/updating tasks
- Agent might not use it consistently
- Need to decide granularity (too fine = noise, too coarse = no visibility)

**Questions for you**:
1. Does this match your mental model for beads integration?
2. What granularity feels right? (Phase-level? Task-level? Sub-task?)
3. Should the agent be required to create tasks before executing?
4. How should blocked tasks surface to user? (Interrupt? End of turn summary?)

---

### Q2.3: Declarative Skills Architecture

**Context**: You want to add skills declaratively without defining workflows.

**Current State**: Skills are markdown files with instructions:
```
plugins/bird-marketing/skills/campaign-strategy/SKILL.md
plugins/bird-platform/skills/bird-data-queries/SKILL.md
```

**Problem**: Agent doesn't reliably know which skills to use when.

**Proposed: Skill Manifest with Triggers**

```yaml
# SKILL.md frontmatter
---
name: campaign-strategy
description: Create strategic brief for marketing campaigns
triggers:
  - keywords: [campaign, strategy, plan, roadmap]
  - when_artifact_exists: foundation.md
  - when_task_type: campaign
provides:
  - artifact: strategic-brief.md
  - decisions: [target_audience, channel_mix, timeline, success_metrics]
requires:
  - artifact: foundation.md  # or inline discovery
  - context: [brand_info, available_channels]
estimated_cost: medium  # tokens/time
---
```

**Agent Skill Selection Flow**:
```
User Request → Parse intent
                   ↓
            Match triggers across skills
                   ↓
            Build execution plan:
              1. foundation (required by strategy)
              2. strategy (matched keyword "campaign")
              3. audience (required by campaign)
                   ↓
            Execute or surface plan to user
```

**Questions for you**:
1. Does trigger-based skill matching make sense?
2. What triggers would be most reliable? (Keywords? Artifact dependencies? Explicit user requests?)
3. Should agent explain which skills it's using? ("I'll use campaign-strategy skill to create your brief")
4. How do we handle skill conflicts? (Two skills both claim to handle "campaign")

---

### Q2.4: Goal-Driven vs. Instruction-Driven

**Context**: You said agents should be "goal-driven" and plan autonomously.

**Current State**: Agents are instruction-driven
```markdown
# marketing-agent.md
## Workflow
1. First do discovery
2. Then create foundation
3. Then strategy
4. Then segments
5. Then content
```

**Problem**: This is rigid. Agent follows steps even when they don't apply.

**Proposed: Goal + Constraints Model**

```yaml
# Agent receives
goal: "Create winback campaign for churned enterprise customers"
constraints:
  - must_use_existing_segments: false
  - channel: email
  - timeline: Q1 2025
success_criteria:
  - audience_segment_created: true
  - content_variants: >= 2
  - campaign_configured: true

# Agent plans
plan:
  - task: discover_churned_enterprise
    reason: "Need to understand data before segmentation"
  - task: build_segment
    reason: "Goal requires audience segment"
  - task: create_content
    reason: "Goal requires campaign content"
  # Note: skipped "foundation" because goal is specific enough
```

**Agent becomes planner, not follower**:
- Given a goal, agent decides what tasks are needed
- Agent can skip steps that don't apply
- Agent can add steps based on discovered needs
- Plan is explicit and reviewable

**Questions for you**:
1. Is goal + constraints + success criteria the right framing?
2. Should agent surface its plan before executing? (Or just do it?)
3. How much autonomy in skipping "standard" steps?
4. What if agent's plan is wrong? How does user course-correct?

---

### Q2.5: The "Expensive Action" Gate

**Context**: You said agent should be aware that tasks are expensive and manage time.

**Observed Patterns** (from sessions):
- Discovery phase: Fast, cheap (API calls)
- Segment building: Slow (segmentBuilder has latency)
- Content creation: Medium (LLM-heavy)
- Multi-step campaigns: Very slow (compounding)

**Proposed: Cost-Aware Execution**

```typescript
// Agent categorizes actions
const ACTION_COSTS = {
  api_call: 'cheap',      // < 2s, < $0.01
  discovery: 'cheap',     // < 5s, < $0.05
  segment_build: 'medium', // 10-30s, < $0.10
  content_gen: 'medium',  // 5-15s, < $0.20
  full_campaign: 'expensive', // 2-5min, < $1.00
};

// Before expensive actions
if (action.cost === 'expensive') {
  await confirmWithUser(`About to ${action.description}. This will take ~${action.estimate}. Proceed?`);
}
```

**Alternative: Budget Model**
```
Session starts with budget: { time: 5min, cost: $1.00, user_confirmations: 3 }
Agent tracks spend: { time: 2min, cost: $0.30, user_confirmations: 1 }
When approaching limit: "I'm at 80% of time budget. Should I continue or checkpoint?"
```

**Questions for you**:
1. Should agent ask before expensive actions, or just surface cost after?
2. Is time budget or cost budget more meaningful for users?
3. Should there be a "fast mode" where agent doesn't pause?
4. How do you balance speed (no interruptions) vs. control (user approval)?

---

### Q2.6: Explainable Execution

**Context**: You said current traces are "long unexplainable behaviors."

**Current State**: 
- OpenTelemetry spans for tools
- mcp.log with raw tool calls
- session.log with events
- No summary view

**Proposed: Execution Narrative**

```markdown
# Session Progress (auto-updated)

## Current Status: Executing Task 2/4

### Task 1: Discovery ✅ (completed in 45s)
- Scanned 4 catalogs: bird:crm, bird:messaging, bird:web, ws:default
- Found 382 churned enterprise contacts via opportunitySummary view
- Key fields: companyDomain, totalContractValue, closeDate

### Task 2: Build Segment 🔄 (in progress)
- Using segmentBuilder to create predicate
- Criteria: closeDate >= 3 years, TCV > $100k, stage = "Closed Lost"
- Waiting for API response...

### Task 3: Create Content ⏳ (pending)
### Task 4: Configure Campaign ⏳ (pending)

## Decisions Made
- Using opportunitySummary view (has 96.6% companyDomain fill rate)
- Targeting all churned contacts (not filtering by recent activity)

## Questions for You
- None currently. Will ask if segmentBuilder returns unexpected results.
```

**This could be**:
- A live-updating artifact in session directory
- Streamed to UI via SSE events
- Queryable via a tool ("What have you done so far?")

**Questions for you**:
1. Does this narrative format match what you'd want to see?
2. Should it be real-time (streaming) or checkpoint-based (after each task)?
3. Where should this live? (UI panel? Artifact file? Both?)
4. Should user be able to intervene mid-execution from this view?

---

### Q2.7: Instruction Loading Problem

**Context**: You said "it's difficult to control which instructions are loaded by which agents."

**Current State** (from codebase):
```
Instructions come from:
1. plugins/*/agents/*.md       - Agent definitions
2. plugins/*/skills/*.md       - Skill instructions
3. session/CLAUDE.md           - Runtime injected
4. Initial prompt              - From session.ts
5. Artifacts read during session - Context from prior work
```

**Problem**: Priority/override behavior is unclear. Agent might follow outdated instruction from one source while ignoring newer instruction from another.

**Proposed: Explicit Instruction Hierarchy**

```yaml
# Instruction precedence (highest to lowest)
1. user_message        # Current turn's request
2. session_context     # CLAUDE.md + brief.md
3. active_skill        # Currently executing skill
4. agent_definition    # Base agent personality
5. platform_knowledge  # Concepts, operations docs

# Conflict resolution
rule: later_overrides_earlier  # Or: specific_overrides_general
logging: log_when_instruction_overridden
```

**Implementation Options**:

**Option A: Instruction Compiler**
- At session start, compile all instructions into single prompt
- Resolve conflicts explicitly
- Agent sees unified instructions

**Option B: Layered Context**
- Agent definition is always-loaded base
- Skills add context when triggered
- User messages override both

**Option C: Explicit Scoping**
```markdown
# SKILL.md
---
scope: replaces_section("workflow")  # This skill's workflow replaces agent's default
---
```

**Questions for you**:
1. Which instruction sources conflict most in practice?
2. Should agent be aware of where instructions came from? ("My agent definition says X but skill says Y")
3. Would explicit precedence rules help, or add complexity?
4. Is the goal "predictable behavior" or "flexible interpretation"?

---

## Summary

This round explored the **fundamentals of agent interaction**:

| Topic | Key Question |
|-------|-------------|
| **Alignment** | Confidence-based vs. always-ask vs. proceed-and-report |
| **Task Tracking** | Beads integration - granularity and enforcement |
| **Skills** | Declarative triggers vs. hardcoded workflows |
| **Goal-Driven** | Agent as planner, not instruction follower |
| **Cost Gates** | When to pause for user confirmation |
| **Explainability** | Narrative progress vs. raw traces |
| **Instructions** | Hierarchy and conflict resolution |

## Synthesis: The "Aware Agent" Model

Based on your answers from Round 1, here's an emerging model:

```
┌─────────────────────────────────────────────────────────┐
│                    AWARE AGENT                          │
├─────────────────────────────────────────────────────────┤
│ KNOWS:                                                  │
│ • What user wants (alignment check at start)            │
│ • What it has to do (explicit task list via beads)      │
│ • What it's currently doing (progress tracking)         │
│ • What it has done (artifact trail)                     │
│ • How expensive actions are (cost awareness)            │
│                                                         │
│ SURFACES:                                               │
│ • Plan before execution (or assumptions if confident)   │
│ • Progress during execution                             │
│ • Decisions made and why                                │
│ • Questions when blocked (not routinely)                │
│ • Completion with summary                               │
│                                                         │
│ LETS USER:                                              │
│ • Intervene at any point                                │
│ • Course-correct tasks                                  │
│ • Skip or add steps                                     │
│ • See exactly what happened                             │
└─────────────────────────────────────────────────────────┘
```

**Does this model resonate?** Round 3 could dive into implementation specifics.

---

## Next Round Preview

Depending on your answers:

**If alignment model is priority**: Deep dive on confidence scoring, assumption surfacing, clarification UX

**If task tracking is priority**: Beads integration spec, task lifecycle, dependency handling

**If skills architecture is priority**: Trigger system design, skill composition, conflict resolution

**If execution model is priority**: Goal→plan→execute pipeline, cost gates, progress streaming

---

**Answer the questions that matter most.** I'll shape Round 3 based on where you want to go deep.
