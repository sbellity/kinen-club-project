# Session Finalization Reference

## Why Finalization Matters

Session finalization isn't just closing a file - it's **feeding the memory system**.

The session summary becomes the primary artifact for:
- **Future recall**: What you'll find when searching "how did we decide X?"
- **Cross-session learning**: What other sessions can build on
- **Journey preservation**: The path matters as much as the destination

**Philosophy**: Kinen sessions are nodes in a growing knowledge graph. Each summary should make this session discoverable, linkable, and useful for future thinking.

## When to Close

**Close when:**
- Goals achieved or explicitly deferred with seeds
- Diminishing new insights (questions becoming repetitive)
- Clear next steps identified

**Don't close when:**
- Major goals unaddressed
- User uncertain about direction
- Living document has significant gaps

## The Three Outputs

Every session finalization produces three things:

### 1. Goal Evaluation

For each goal in `init.md`:

| Status | Meaning |
|--------|---------|
| ✅ Achieved | Goal fully met |
| ⚠️ Partial | Progress made, remainder documented |
| ❌ Not achieved | Explained why, seed created for follow-up |
| 🔄 Evolved | Goal changed during session (document original → new) |

**The rule**: Every goal must be accounted for. No silent failures.

### 2. Knowledge Capture

What makes this session valuable to future recall:

- **Decisions**: What was decided, with rationale and links to rounds
- **Journey**: How thinking evolved (started with X, pivoted when Y, landed on Z)
- **Dead ends**: What we tried and rejected - this is valuable knowledge
- **Breakthroughs**: Key insights worth surfacing in search

**The rule**: Capture what you'd want to find when you search for this topic in 6 months.

### 3. Forward Connections

How this session fits in the knowledge graph:

**Backward links** (what this builds on):
```markdown
decision:: Use event sourcing for payment state
related_session:: [[../20251201-auth-design/session-summary|Auth Design]] - auth patterns inform this
```

**Forward links** (what this enables):
```markdown
session_seed:: error-recovery-patterns
seed_type:: deferred_topic
seed_priority:: high
seed_context:: Deferred from Round 4, needs dedicated session
seed_goals:: Define retry strategies, circuit breakers, alerting
```

**The rule**: No session is an island. Link backward, seed forward.

## Session Summary Template

```markdown
---
date: 2025-12-14
artifact_type: session_summary
kinen_session: 20251214-02-session-name
status: complete
aliases:
  - "session-name - Session Summary"
tags:
  - domain/architecture
summary: "One-line description for search results"
---

# Session Summary: [Name]

## Goal Evaluation

| Goal | Status | Notes |
|------|--------|-------|
| Goal 1 | ✅ | How achieved |
| Goal 2 | ⚠️ | What remains (see seed below) |

## Key Decisions

decision:: [Decision 1 - searchable inline field]
**Made in**: [[rounds/02-topic#Q2.3|Round 2, Q2.3]]
**Rationale**: Why this choice over alternatives

decision:: [Decision 2]
**Made in**: [[rounds/03-topic#Q3.1|Round 3, Q3.1]]
**Rationale**: ...

## Journey

- Started with assumption X
- Round 2 revealed Y, which challenged our approach
- Pivoted in Round 3 to Z
- Final synthesis in Round 5

## Dead Ends

- **Approach A**: Rejected because [reason] - would revisit if [condition]
- **Option B**: Didn't pursue because [reason]

## Open Questions

open_question:: [Question that remains unresolved]
open_question:: [Another question for future work]

## Related Sessions

| Session | Relationship |
|---------|--------------|
| [[../prior-session/session-summary\|Prior]] | Built on their auth decisions |
| [[../earlier-session/session-summary\|Earlier]] | Resolved their open question Q3 |

## Session Seeds

### Seed: Error Recovery
session_seed:: error-recovery-patterns
seed_type:: deferred_topic
seed_priority:: high
seed_context:: Deferred from Round 4
seed_goals:: Retry strategies, circuit breakers, alerting

### Seed: Performance
session_seed:: performance-optimization
seed_type:: future_exploration
seed_priority:: medium
seed_context:: Emerged from Round 5 discussion

## Next Steps

next_step:: [Immediate action]
next_step:: [Short-term follow-up]

## Artifacts

- [[artifacts/technical-spec.md|Technical Spec]] - living document
- [[rounds/|All rounds]]
```

## Inline Fields Reference

These fields are searchable across your vault and parseable by kinen:

| Field | Purpose | Example |
|-------|---------|---------|
| `decision::` | Key decisions (searchable) | `decision:: Use PostgreSQL for sessions` |
| `open_question::` | Unresolved questions | `open_question:: How to handle failover?` |
| `next_step::` | Action items | `next_step:: Set up test environment` |
| `session_seed::` | Follow-up session identifier | `session_seed:: error-recovery` |
| `seed_type::` | Seed category | `deferred_topic` / `future_exploration` |
| `seed_priority::` | Importance | `high` / `medium` / `low` |
| `seed_context::` | Why this seed exists | `Deferred from Round 4` |
| `seed_goals::` | Suggested goals | `Retry strategies, circuit breakers` |
| `related_session::` | Link to related work | `[[../other-session|Other]]` |

## Checklist

Before marking complete:

**Evaluate**
- [ ] Every goal from init.md has a status
- [ ] Partial/unmet goals have seeds or next steps

**Capture**
- [ ] Key decisions documented with `decision::` fields
- [ ] Journey narrative explains how you got here
- [ ] Dead ends recorded (valuable for future)
- [ ] Living document fully updated

**Connect**
- [ ] Related prior sessions linked
- [ ] Deferred topics captured as seeds
- [ ] Backlinks added to prior sessions if this resolves their questions
- [ ] init.md status updated to `complete`

## Example

```markdown
# Session Summary: Payment Architecture

## Goal Evaluation

| Goal | Status | Notes |
|------|--------|-------|
| Define payment flow | ✅ | Complete in technical-spec.md |
| Choose provider | ✅ | Stripe (Round 3) |
| Error handling | ⚠️ | Basic design done, see seed |

## Key Decisions

decision:: Use Stripe for payment processing
**Made in**: [[rounds/03-provider#Q3.2|Round 3, Q3.2]]
**Rationale**: Best API, team familiarity, webhook support

decision:: Event sourcing for payment state
**Made in**: [[rounds/04-architecture#Q4.1|Round 4, Q4.1]]
**Rationale**: Auditability, replay capability

## Journey

Started assuming PayPal (existing relationship). Round 2 revealed webhook limitations incompatible with event-driven goals. Round 3 systematic comparison led to Stripe. Round 4 designed architecture leveraging Stripe's strengths.

## Dead Ends

- **PayPal**: Rejected due to webhook delivery guarantees
- **Build custom**: Too much scope for timeline

## Related Sessions

| Session | Relationship |
|---------|--------------|
| [[../auth-design/session-summary\|Auth]] | Token patterns reused |
| [[../data-model/session-summary\|Data Model]] | Entity relationships |

## Session Seeds

### Seed: Error Recovery
session_seed:: payment-error-recovery
seed_type:: deferred_topic
seed_priority:: high
seed_context:: Deferred from Round 4 - retry logic needs dedicated exploration
seed_goals:: Define retry strategies, circuit breaker patterns, alerting thresholds

## Next Steps

next_step:: Set up Stripe test account
next_step:: Implement basic checkout flow
next_step:: Schedule error recovery session (seed: payment-error-recovery)
```
