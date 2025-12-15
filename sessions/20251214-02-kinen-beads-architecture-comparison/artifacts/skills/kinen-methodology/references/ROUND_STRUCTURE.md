# Round Structure Reference

Detailed guide for creating and running kinen rounds.

## Round File Format

### Frontmatter

```yaml
---
date: 2025-12-14
started_at: 2025-12-14T10:30
ended_at: 2025-12-14T11:45
artifact_type: round
kinen_session: 20251214-02-session-name
kinen_round: 1
status: in-progress
aliases:
  - "session-name - Round 01 Foundation"
tags:
  - domain/architecture
  - type/iterative-design
summary: "What this round explores"
---
```

**Required fields (parsed by kinen-go):**
- `artifact_type`: `round`, `round_foundation`, `round_exploration`, or `round_synthesis`
- `date`: YYYY-MM-DD format
- `kinen_session`: Session folder slug (e.g., `20251214-02-session-name`)
- `kinen_round`: Integer (1, 2, 3...)
- `status`: `in-progress` | `paused` | `blocked` | `complete`

**Optional fields:**
- `started_at`: ISO 8601 timestamp (e.g., `2025-12-14T10:30`)
- `ended_at`: ISO 8601 timestamp
- `aliases`: List of alternative names for wiki-linking
- `tags`: List with prefixes (`domain/*`, `type/*`, `tech/*`, etc.)
- `summary`: Brief description

### File Naming

Format: `NN-descriptive-topic.md`

Examples:
- `01-foundation.md`
- `02-technical-approach.md`
- `03-integration-patterns.md`

**Rationale:**
- Number prefix maintains sort order
- Descriptive name shows in link dropdowns
- Better than generic `round-01.md`

## Round Content Structure

### 1. Title

```markdown
# Round N: Descriptive Topic Name
```

### 2. Building On (for rounds 2+)

```markdown
> [!info] Building on
> This round builds on [[rounds/01-foundation|Round 1: Foundation]]
```

### 3. Previous Round Summary (for rounds 2+)

```markdown
## Previous Round Summary

Key decisions from Round 1:
- Decision one with rationale
- Decision two with context
- Open question carried forward
```

### 4. Round Goal

```markdown
## Round Goal

What we'll achieve this round:
- Specific objective one
- Specific objective two
```

### 5. Questions Section

```markdown
## Questions

### Q1.1: Question Title

Context explaining why this matters and what we're deciding...

**Option A**: Description
- Pros: Clear benefit
- Cons: Clear drawback

**Option B**: Description
- Pros: Different benefit
- Cons: Different drawback

**Option C**: Alternative approach
- Pros: ...
- Cons: ...

### Your Choice

> [Answer here]

---

### Q1.2: Next Question

More context...

### Your Choice

> [Answer here]
```

### 6. Summary (filled after answers)

```markdown
## Summary

Key decisions this round:
- Decision 1: What was decided and why
- Decision 2: What was decided and why

**Open questions:**
- Question for next round

**Next steps:**
- What happens next
```

## Question Design

### Good Questions Have

1. **Clear context**: Why this decision matters
2. **Concrete options**: 2-4 distinct approaches
3. **Tradeoffs**: Pros and cons for each option
4. **Scope**: Focused enough to answer
5. **Impact**: Clear what depends on decision

### Question Format

**IMPORTANT**: Questions must match the parser regex: `^(Q[\d.]+):\s*(.+)$`

```markdown
### Q1.1: Descriptive Title

Context explaining why this matters, what constraints exist,
and what depends on this decision.

**Option A**: Description of approach
- Pros: Benefit one, benefit two
- Cons: Drawback one, drawback two

**Option B**: Description of alternative
- Pros: Different benefits
- Cons: Different drawbacks

**Recommendation**: [Optional] Your suggestion with rationale.

> [!note] Answer
> [User's response here]
```

**Parser requirements:**
- Heading must be H3 (`###`) with format `Q{N}.{M}: Title`
- Options must match: `**Label**: Text` or `**Label** - Text`
- Answers must use Obsidian callout: `> [!note] Answer`

### Question Numbering

Format: `QN.M` where:
- N = round number
- M = question number within round

Examples: Q1.1, Q1.2, Q2.1, Q3.5

## Number of Questions

### Guidelines

- **Minimum**: 5 questions (too few = shallow exploration)
- **Target**: 8-12 questions (thorough without overwhelming)
- **Maximum**: 15 questions (split into two rounds if more)

### Adjust Based On

- **Complexity**: More complex topics need more questions
- **User energy**: Read engagement, adjust pace
- **Progress**: If stuck, fewer deeper questions
- **Time**: Shorter rounds if time-constrained

## Example Round Progression

### Round 1: Foundation

**Purpose**: Establish the problem space.

**Focus areas**:
- Core requirements and constraints
- Stakeholders and their needs
- Key tensions and tradeoffs
- Terminology and concepts
- Success criteria

**Question types**:
- "What are the must-have requirements?"
- "Who are the key stakeholders?"
- "What constraints do we face?"
- "How will we measure success?"

### Round 2: Refinement

**Purpose**: Go deeper based on Round 1.

**Focus areas**:
- Dive into interesting areas from R1
- Resolve ambiguities
- Challenge assumptions
- Explore alternatives

**Question types**:
- "You mentioned X - let's explore that deeper..."
- "What if we relaxed constraint Y?"
- "How does Z interact with W?"

### Round 3: Technical

**Purpose**: Concrete technical decisions.

**Focus areas**:
- Architecture choices
- Implementation approaches
- Data models
- APIs and interfaces
- Technology selection

**Question types**:
- "Which architecture pattern fits?"
- "How should we structure the data?"
- "What's the API contract?"

### Round 4: Integration

**Purpose**: How pieces work together.

**Focus areas**:
- Component interactions
- Edge cases
- Error handling
- User flows
- Cross-cutting concerns

**Question types**:
- "What happens when X fails?"
- "How do A and B communicate?"
- "What's the user experience for edge case Y?"

### Round 5: Details

**Purpose**: Finalization.

**Focus areas**:
- Remaining open questions
- Implementation priorities
- Risk mitigation
- Concrete examples
- Next steps

**Question types**:
- "What's the priority order?"
- "Can you walk through example Z?"
- "What risks should we mitigate?"

### Round 6: (Optional)

**Purpose**: Final clarifications if needed.

Only create if:
- Major questions remain
- New information emerged
- Stakeholder feedback requires revision

## Processing User Answers

### After Each Answer

1. **Acknowledge** the decision
2. **Note implications** for other questions
3. **Update mental model** of the solution

### After All Answers

1. **Synthesize** key decisions
2. **Identify patterns** across answers
3. **Update living document**
4. **Note open questions** for next round
5. **Propose next round focus**

### Updating Living Document

Extract from round:
```markdown
### Decision: [Topic]

**Made in**: [[rounds/02-refinement#Q2.3|Round 2, Q2.3]]

**Decision**: Clear statement of what was decided.

**Rationale**: Why this choice over alternatives.

**Impact**: What this affects going forward.
```

## Tips for Effective Rounds

### Do

- Pre-populate answer blocks
- Provide concrete options
- Include examples where helpful
- Link to previous rounds
- Challenge assumptions
- Reference related sessions

### Don't

- Ask yes/no questions (get reasoning)
- Present only one option
- Skip context
- Assume answers
- Over-load with questions
- Forget to update living doc

## Template Files

### Round 1 Template

```markdown
---
date: 2025-12-14
started_at: 2025-12-14T10:30
artifact_type: round
kinen_session: 20251214-02-my-session
kinen_round: 1
status: in-progress
aliases:
  - "my-session - Round 01 Foundation"
tags:
  - domain/architecture
summary: "Foundation round establishing goals and constraints"
---

# Round 1: Foundation

## Round Goal

Establish the foundation for this session:
- Define core requirements
- Identify key constraints
- Establish terminology
- Set success criteria

## Questions

### Q1.1: Core Problem

What problem are we solving?

> [!note] Answer
>

### Q1.2: Requirements

What are the must-have requirements?

**Option A**: Minimal viable
- Pros: Faster, simpler
- Cons: May not meet all needs

**Option B**: Comprehensive
- Pros: Complete solution
- Cons: More complex, longer

> [!note] Answer
>

[... more questions ...]

## Summary

[Fill after answers]
```

### Round 2+ Template

```markdown
---
date: 2025-12-14
started_at: 2025-12-14T14:00
artifact_type: round
kinen_session: 20251214-02-my-session
kinen_round: 2
status: in-progress
aliases:
  - "my-session - Round 02 Refinement"
tags:
  - domain/architecture
summary: "What this round explores"
---

# Round 2: Refinement

> [!info] Building on
> This round builds on [[rounds/01-foundation|Round 1: Foundation]]

## Previous Round Summary

Key decisions from Round 1:
- Decision one
- Decision two

## Round Goal

What we'll explore this round.

## Questions

### Q2.1: First Question

Context for this question...

**Option A**: First approach
- Pros: ...
- Cons: ...

**Option B**: Second approach
- Pros: ...
- Cons: ...

> [!note] Answer
>

## Summary

[Fill after answers]
```
