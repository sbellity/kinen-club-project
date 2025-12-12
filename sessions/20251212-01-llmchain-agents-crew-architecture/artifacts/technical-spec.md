# LLMChain Agents Crew Architecture

**Status**: Draft  
**Version**: 0.2  
**Last Updated**: 2024-12-12  
**Round**: 2

---

## 1. Overview

### 1.1 Problem Statement (from Round 1)

| Issue | Evidence | Priority |
|-------|----------|----------|
| No autonomous session achieves quality of human-guided | `cc-1` was manual | Critical |
| Agents frequently miss context, don't produce requested artifacts | Session analysis | Critical |
| Predictable errors repeat (predicate schema, entityType) | mcp.log patterns | High |
| Instruction priority conflicts | CONTRADICTORY-INSTRUCTIONS.md | High |
| Long unexplainable traces | User feedback | Medium |
| Sessions too slow for realistic use | User feedback | Medium |

### 1.2 Goals (from User Answers)

**Priority Order**: Reliability → Speed → Composability

**Agent Responsibilities**:
1. Know what user wants (alignment)
2. Have clarity of execution path (planning)
3. Track what it's doing and has to do (task management)
4. Surface progress explicitly to user (observability)

**Constraints**:
- No hardcoded workflows - agents should plan autonomously
- Declarative skill composition
- User intervention points without forcing questions
- Correctness first, then latency

### 1.3 Non-Goals

- Full autonomy without user oversight
- Optimizing for cost (acceptable increase for quality)
- Complex multi-agent coordination (unless single-agent quality is solved first)

---

## 2. Architecture

### 2.1 The "Aware Agent" Model

```
┌─────────────────────────────────────────────────────────┐
│                    AWARE AGENT                          │
├─────────────────────────────────────────────────────────┤
│ KNOWS:                                                  │
│ • What user wants (alignment check at start)            │
│ • What it has to do (explicit task list)                │
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

### 2.2 Orchestration Decision

**Current State**: Multi-agent via Task was attempted but:
- MCP tool inheritance was broken (reported as fixed)
- Task delegation is opaque
- Single-agent with good prompts may be sufficient

**Direction**: Focus on **single agent done well** before adding multi-agent complexity.

### 2.3 Key Components (TBD in Round 3)

| Component | Purpose | Status |
|-----------|---------|--------|
| Alignment Protocol | Gain clarity before expensive work | Exploring |
| Task Tracking | Explicit task list (beads integration?) | Proposed |
| Declarative Skills | Trigger-based skill composition | Proposed |
| Execution Narrative | Explainable progress | Proposed |
| Instruction Hierarchy | Resolve conflicting instructions | Exploring |

---

## 3. Round 1 Decisions

### 3.1 Confirmed

- [x] MCP tool inheritance is fixed (user confirmed)
- [x] Reliability is top priority, then speed
- [x] User intervention is essential
- [x] Partial output is useful for course correction
- [x] Current observability is insufficient

### 3.2 Open Questions (Round 2)

- [ ] Confidence-based alignment vs. always-ask
- [ ] Beads integration specifics
- [ ] Skill trigger mechanism
- [ ] Goal-driven vs. instruction-driven execution
- [ ] Cost/time budgets and gates
- [ ] Instruction precedence rules

---

## 4. Implementation Plan

*To be developed after Round 2 responses*

---

## 5. Open Questions

From Round 1 analysis:
1. Why do agents ignore documentation and invent formats?
2. How to make execution predictable and reproducible?
3. What's the right balance of autonomy vs. checkpoints?
4. Should we invest in multi-agent or perfect single-agent first?

---

## Appendix

### A. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-12-12 | Focus on single-agent quality first | Multi-agent adds complexity to system that doesn't work well yet |
| 2024-12-12 | Reliability > Speed > Cost | User priority |
| 2024-12-12 | Explore beads for task tracking | User suggestion |

### B. Session Evidence

| Session | Errors | Key Learning |
|---------|--------|--------------|
| `019b0e65` | 16 | Predicate schema invented, not read from docs |
| `019b0e93` | 7 | Improvement possible but schema issue persists |
| `019b0fb2` | Few | Rounds pattern helps alignment |
| `cc-1` | 0 | Human guidance makes the difference |

### C. References

- `plugins/bird-platform/agents/marketing-agent.md`
- `plugins/bird-platform/agents/research-analyst.md`
- `src/services/session.ts`
- `sessions/*/SESSION-ANALYSIS.md`
