---
date: 2025-12-14
started_at: 2025-12-14T13:00
artifact_type: round
kinen_session: 20251214-02-kinen-beads-architecture-comparison
kinen_round: 4
status: completed
aliases:
  - "kinen-beads-architecture-comparison - Round 04 Drafting"
tags:
  - kinen
  - skills
  - implementation
summary: Draft SKILL.md and key reference files based on decisions from Rounds 1-3
---

# Round 04: Drafting

## Round Goal

Based on all decisions, create first drafts of:
1. `skills/kinen-methodology/SKILL.md` (~400-500 lines)
2. Key reference files (2-3)
3. Editor setup templates

## Decisions Summary

### Architecture
- **Document-first**: Files are source of truth, DB is rebuildable index
- **HTTP daemon**: Cross-platform, debuggable, multi-space
- **Parallel CLI/MCP**: Both thin wrappers on connect RPC

### Skills Strategy
- **Single source of truth**: SKILL.md generates editor configs
- **Native hooks**: Claude Code gets SessionStart + PreCompact
- **Tiered context**: Prime for hooks, status for rules, MCP as fallback
- **Single skill**: `kinen-methodology` includes memory recall
- **Future**: Separate skill for background consolidation agents

### File Structure (Recommended)

```
skills/
└── kinen-methodology/
    ├── SKILL.md              # ~400-500 lines
    └── references/
        ├── METHODOLOGY.md    # Full methodology
        ├── SESSION_TYPES.md  # When to use each type
        ├── ROUND_STRUCTURE.md # How to run rounds
        ├── MEMORY_RECALL.md  # Search and recall
        ├── CLI_REFERENCE.md  # Commands
        └── HANDOFF.md        # Session handoff
```

---

## Clarification: Q1 Setup Commands

You said:
> - we should NOT repeat ourselves, single source of truth
> - we should hook into those editors as natively as possible

### Recommended Approach: Single Source + Native Generation

```
SKILL.md (source of truth)
    │
    ├── kinen setup claude → SessionStart + PreCompact hooks
    │                        (inject kinen prime automatically)
    │
    ├── kinen setup cursor → .cursor/rules/kinen.mdc
    │                        (generated from SKILL.md sections)
    │
    └── kinen setup aider  → .aider.conf.yml
                            (generated from SKILL.md sections)
```

**How it works:**

1. **SKILL.md** is the canonical documentation
2. `kinen setup <editor>` reads SKILL.md and generates appropriate config
3. Claude Code gets **hooks** (not just static text)
4. Cursor/Aider get **rules** (extracted from SKILL.md)

**No duplication**: The generator extracts relevant sections from SKILL.md rather than maintaining separate files.

### Does this match your intent?

**A) Yes, proceed with this approach**
**B) Different interpretation** - [explain]

> [Answer here]
> A

---

## Clarification: Q5 File Structure

You asked for advice. Here's my recommendation:

### Why Option A (Single Skill)?

| Factor | Single Skill (A) | Two Skills (B) | Minimal (C) |
|--------|------------------|----------------|-------------|
| Coherence | ✅ One workflow | ⚠️ Split context | ⚠️ Fragmented |
| Claude loading | ✅ Loads once | ⚠️ May load both | ✅ Quick load |
| Maintenance | ✅ One place | ⚠️ Two places | ⚠️ Hidden complexity |
| User mental model | ✅ "kinen skill" | ⚠️ "which skill?" | ✅ Simple |

**Recommendation**: **Option A** because:
1. Kinen methodology is one coherent workflow
2. Memory recall is integral to sessions (not separate)
3. Easier for users to understand "one skill = one tool"
4. Progressive disclosure to references handles size

**Future consolidation skill** can be added later as `kinen-consolidation/` when background agents are implemented.

### Confirm?

**A) Yes, proceed with Option A (Single Skill)**
**B) Prefer Option B (Two Skills)**
**C) Prefer Option C (Minimal)**

> [Answer here]
> A

---

## Question 1: SKILL.md Structure Review

Here's the proposed structure for `skills/kinen-methodology/SKILL.md`:

```markdown
---
name: kinen-methodology
description: Structured thinking sessions with iterative rounds for design,
  research, and architecture work. Use when exploring complex topics, making
  architectural decisions, or conducting research that benefits from
  structured Q&A format with documented decisions.
---

# Kinen Methodology

## Overview (~50 lines)
- What kinen is: structured thinking sessions
- When to use vs TodoWrite vs beads
- Core concepts: spaces, sessions, rounds, artifacts

## Session Start Protocol (~80 lines)
- Detecting when to suggest kinen session
- Creating new sessions (types, naming)
- Resuming existing sessions
- Loading context (kinen prime / kinen status)

## Round Workflow (~100 lines)
- Round structure: goal, questions, decisions
- Question format: options, tradeoffs, recommendations
- Recording decisions in answers
- Updating living document after round
- When to create next round vs summarize

## Memory and Recall (~60 lines)
- Using kinen search for past context
- Semantic vs keyword search
- Incorporating relevant history
- Cross-session pattern recognition

## Integration Patterns (~60 lines)
- Session outputs as deliverables
- Artifact management
- Git workflow with sessions
- Coordinating with other tools

## Common Session Patterns (~50 lines)
- Architecture sessions
- Research sessions
- Writing sessions
- Implementation planning

## Quick Reference (~30 lines)
- Essential commands table
- Pointers to references/

## Troubleshooting (~40 lines)
- Common issues and solutions
- When NOT to use kinen

TOTAL: ~470 lines
```

### Your Feedback

**A) Structure looks good, proceed**
**B) Add section**: [what?]
**C) Remove section**: [what?]
**D) Reorder/restructure**: [how?]

> [Answer here]
> please check what would be missing from the [[kinen/docs/methodology-obsidian|methodology-obsidian]]

---

## Question 2: Reference Files Priority

Which reference files should we draft in this session?

### All Proposed References

1. `METHODOLOGY.md` - Full methodology from methodology-obsidian.md
2. `SESSION_TYPES.md` - Architecture, research, writing, implementation
3. `ROUND_STRUCTURE.md` - Detailed round mechanics
4. `MEMORY_RECALL.md` - Search patterns and examples
5. `CLI_REFERENCE.md` - All commands with examples
6. `HANDOFF.md` - Session handoff patterns

### Recommendation

Draft these 3 first (most impactful):

1. **CLI_REFERENCE.md** - Agents need this immediately
2. **ROUND_STRUCTURE.md** - Core workflow details
3. **SESSION_TYPES.md** - When to use which type

### Your Choice

**A) Accept recommendation (CLI, ROUND, SESSION_TYPES)**
**B) Different priority**: [which 3?]
**C) More references**: [which ones to add?]
**D) Fewer references**: Start with just CLI_REFERENCE.md

> [Answer here]
> i have no idea, you decide based on your research on best practices

---

## Question 3: SKILL.md Description

The `description` field is critical for skill discovery. Here's a draft:

### Current Draft (248 chars)

```yaml
description: Structured thinking sessions with iterative rounds for design,
  research, and architecture work. Use when exploring complex topics, making
  architectural decisions, or conducting research that benefits from
  structured Q&A format with documented decisions.
```

### Alternative Options

**B) Shorter, action-focused (180 chars)**
```yaml
description: Run structured thinking sessions with iterative Q&A rounds.
  Use for design decisions, research synthesis, and architecture exploration
  that needs documented reasoning.
```

**C) Trigger-focused (210 chars)**
```yaml
description: Structured brainstorming and decision-making sessions. Use when
  user says "let's think through", "design session", "explore options", or
  needs to document complex decision rationale.
```

**D) Comprehensive (320 chars)**
```yaml
description: Structured thinking methodology for complex problem exploration.
  Creates sessions with iterative rounds of focused questions, options analysis,
  and documented decisions. Use for architecture design, research synthesis,
  writing projects, and implementation planning. Produces living documents
  with decision history.
```

### Your Choice

**A) Keep current draft**
**B) Shorter, action-focused**
**C) Trigger-focused**
**D) Comprehensive**

> [Answer here]
> please advise, I don't know

---

## Question 4: Prime Output Format

What should `kinen prime` output look like?

### Option A: Minimal (~300 tokens)

```markdown
# Kinen Context

**Space**: kinen-club-project
**Session**: 20251214-02-kinen-beads-architecture-comparison (active)
**Round**: 4 of ?
**Type**: architecture

## Recent Decisions
- Document-first architecture
- HTTP daemon design
- Tiered context injection

## Commands
kinen session show | kinen round new | kinen search "query"
```

### Option B: Rich (~600 tokens)

```markdown
# Kinen Session Active

## Current State
- **Space**: kinen-club-project
- **Session**: 20251214-02-kinen-beads-architecture-comparison
- **Status**: Active (Round 4)
- **Type**: Architecture session
- **Living Doc**: artifacts/architecture-comparison.md

## Round 4: Drafting
Goal: Create first drafts of SKILL.md and references

## Key Decisions So Far
1. Document-first: Files are source of truth, DB is index
2. HTTP daemon: Cross-platform, multi-space capable
3. Tiered context: Hooks for Claude Code, rules for Cursor
4. Single skill: kinen-methodology with references/

## Available Commands
| Command | Description |
|---------|-------------|
| kinen session show | Current session details |
| kinen round new | Create next round |
| kinen search "q" | Search memory |
| kinen status | Quick context check |

## Methodology Reminder
- Rounds: 8-12 focused questions with options
- Always update living document after decisions
- Create session summary when complete
```

### Option C: Adaptive

```bash
kinen prime           # Rich output (default)
kinen prime --brief   # Minimal output
kinen prime --json    # Machine-readable
```

### Your Choice

**A) Minimal** - Less context, faster
**B) Rich** - More helpful, higher cost
**C) Adaptive** - User/agent chooses

> [Answer here]
> You are asking those questions but I have no answers for you. I would prefer if you came up with a way to test and iterate based on measured results rather than ask me... I just don't know what works best. We can start with documented best practices and take it from there

---

## Summary

After this round, we should have:

1. ✅ Confirmed setup approach (single source + native generation)
2. ✅ Confirmed file structure (single skill)
3. ✅ SKILL.md structure approved
4. ✅ Priority references chosen
5. ✅ Description finalized
6. ✅ Prime output format chosen

Then we proceed to **actual drafting** in Round 5 (or within this round if time permits).
