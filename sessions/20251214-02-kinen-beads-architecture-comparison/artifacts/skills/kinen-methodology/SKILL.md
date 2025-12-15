---
name: kinen-methodology
description: Structured thinking sessions with iterative Q&A rounds for design, research, and architecture work. Use when user says "let's think through", "design session", "explore options", needs to make complex decisions, or wants documented reasoning for architectural choices.
---

# Kinen Methodology

Kinen is a structured approach to complex problem exploration through iterative rounds of focused questions and documented decisions.

## Core Philosophy

We conduct sessions using an iterative refinement process that prioritizes:

- **Deep understanding** over quick solutions
- **Concrete examples** over abstract concepts
- **Progressive refinement** through structured rounds
- **Document-first** approach with living artifacts
- **Goal-driven** exploration with clear success criteria

**Rule of thumb**: If the problem can be solved in one conversation without needing to document decisions for future reference, kinen is probably overkill.

## Your Role: Thinking Partner

You are a **thinking partner**, not just an implementer or order-taker.

### Challenge Constructively
- Question assumptions that may be flawed
- Point out inconsistencies and gaps in reasoning
- Identify hidden dependencies or risks
- Surface tradeoffs that haven't been considered

### Expand Thinking
- Suggest alternatives not yet considered
- Bring in relevant research, patterns, or examples
- Draw connections to related work or sessions
- Help identify what's really being asked

### Maintain Quality
- Keep focused on building something real and useful
- Push for concrete examples over abstractions
- Ask clarifying questions that expose hidden assumptions
- Ensure decisions are evidence-based

### Guide Process
- Maintain momentum through rounds
- Recognize when to consolidate vs. explore further
- Suggest when goals are met or need adjustment
- Keep session aligned with stated objectives

## When to Use Kinen

**Use kinen when:**
- Complex problem needs deep exploration before implementation
- Multiple valid approaches with significant tradeoffs
- Decisions need documented rationale for future reference
- User says: "let's think through", "design session", "explore this"
- Architecture, research, or planning work

**Don't use kinen for:**
- Simple, well-understood tasks
- Bug fixes with obvious solutions
- Routine implementation work
- Time-critical emergency fixes

## Session Structure

### Session Flow

1. **Initialize**: Create `init.md` with explicit goals and success criteria
2. **Rounds**: Generate 5-6 rounds in `rounds/` folder, each building on previous
3. **Living Document**: Update central document after each round
4. **Conclude**: Create `session-summary.md` with decisions and next steps

### Typical Round Progression

```
Round 1: Foundation - Broad exploration, establish goals and constraints
Round 2: Refinement - Deeper dive based on feedback
Round 3: Core Development - Main work (varies by session type)
Round 4: Integration - How parts work together
Round 5: Details - Concrete examples, remaining questions
Round 6: (optional) Final clarifications
```

**Sweet spot**: 5-6 rounds provides comprehensive understanding without analysis paralysis.

### Session Types

| Type | Living Document | Focus |
|------|-----------------|-------|
| `architecture` | technical-spec.md | System design, tradeoffs, constraints |
| `research` | research.md | Investigation, synthesis, recommendations |
| `implementation` | implementation-plan.md | Approach, testing, rollout |
| `writing` | outline.md or manuscript.md | Structure, argument, flow |

### Goal Tracking

**Goals are always required.** Every session must have explicit goals in `init.md`. Only tracking *intensity* varies.

**At session start (non-negotiable):**
- Define clear goals with the user before Round 1
- Ensure goals are specific and measurable
- Establish success criteria - what does "done" look like?
- If user is vague, help them articulate concrete objectives

**Goal types:**
- **Objective goals**: Quantifiable outcomes ("Define 5 key user stories")
- **Subjective goals**: Qualitative outcomes ("Reach clarity on architecture")
- **Success criteria**: Observable completion markers

**During each round:**
- Reference goals when relevant
- Note when questions/decisions advance specific goals
- Flag if discussion is drifting from stated objectives
- Suggest goal adjustments if discoveries warrant it

**At session end:**
- Evaluate each goal: achieved / partially achieved / not achieved
- Document in session summary what was accomplished vs. planned
- Identify follow-up work for unmet goals

**Tracking intensity** (varies by session type):

| Style | Best For | Behavior |
|-------|----------|----------|
| **Assertive** | Technical specs, requirements | Check progress each round, actively flag drift |
| **Gentle** | Research, exploration | Periodic check-ins, flexible on direction changes |
| **Exploratory** | Creative work, brainstorming | Goals guide but don't constrain, evaluate at end |

**Default**: Match intensity to session type, but always maintain goal awareness.

## Quality Standards

### Core Principles

1. **Concrete over abstract** - Always provide specific examples and scenarios
2. **Evidence-based** - Back decisions with research, data, or clear reasoning
3. **Testable assumptions** - Make claims that can be validated
4. **Challenge assumptions** - Don't accept first answers, probe deeper
5. **Provide options** - Multiple approaches with clear tradeoffs
6. **Visual when helpful** - Use Mermaid diagrams for architecture and flows (see [DIAGRAMS.md](references/DIAGRAMS.md))

### Good Questions Include

- **Context**: Why does this question matter? What's at stake?
- **Multiple options**: Present 2-4 approaches with pros/cons
- **Concrete examples**: Show what it looks like in practice
- **Tradeoffs**: Explicit advantages and disadvantages
- **Build on previous**: Reference insights from earlier rounds

### Example Question Format

```markdown
### Q2.3: State Management Strategy

You mentioned wanting "reliable persistence" - let me explore this:

**Context**: State management affects performance, complexity, and
reliability. The choice here impacts concurrent access, backup/recovery,
and deployment complexity.

**Option A: Database-first**
- Store everything in structured database (PostgreSQL/SQLite)
- Pros: Query capabilities, ACID guarantees, mature tooling
- Cons: Schema evolution challenges, deployment complexity

**Option B: File-based**
- Use filesystem with structured formats (JSON/YAML)
- Pros: Simple backup, version control friendly, transparent
- Cons: Limited query capabilities, concurrency issues

**Option C: Hybrid approach**
- Critical data in database, bulk data in files
- Pros: Balance of capabilities, optimize for each use case
- Cons: Complexity of coordination, two failure modes

**Questions for you**:
1. What's your expected data volume and query patterns?
2. How critical is ACID compliance vs. simplicity?

> [!note] Answer
>
```

## Round Workflow

### Generating Rounds

- [ ] Use descriptive filenames (`NN-topic-name.md`)
- [ ] Include proper frontmatter with aliases
- [ ] Link to previous round at start with `> [!info] Building on`
- [ ] Pre-populate `> [!note] Answer` callouts (critical for UX)
- [ ] Provide 8-12 thoughtful questions
- [ ] Include context for why questions matter
- [ ] Offer multiple options with clear tradeoffs
- [ ] Search for related sessions
- [ ] Suggest cross-session links

### After User Responds

1. Read all responses carefully
2. Extract key decisions
3. Update living document with links to rounds
4. Update open questions list
5. Check progress against stated goals
6. Propose next round focus or session summary

### Updating Living Documents

After each round, update the central document:

```markdown
## Decisions Made

### Decision 3.2: [Title]

**Made in**: [[rounds/03-topic#Q3.2|Round 3, Q3.2]]

**Decision**: Clear statement of what was decided.

**Rationale**:
- Reason one
- Reason two

**Impact**: How this affects the work.
```

## Obsidian Conventions

### Callout Types

- `> [!note] Answer` - User responses (always pre-populate empty)
- `> [!info] Building on` - Round progression links
- `> [!tip] Related Session` - Cross-session suggestions
- `> [!important]` - Critical points
- `> [!warning]` - Concerns or risks
- `> [!question]` - Open questions

### Linking

**When to link:**
- Round progression: Current → previous round (always)
- Decisions: Living doc → round where decided
- Cross-session: When referencing related work
- Concepts: To where concept was defined

**Format:**
```markdown
[[path/to/file|display text]]
[[path/to/file#heading|display text]]
[[rounds/03-technical#Q3.2|Decision 3.2]]
```

### Pre-population Protocol

**Always pre-populate empty callouts** for expected responses:

```markdown
### Q1.1: Your Question

Question content with options...

> [!note] Answer
>

```

**Critical for UX**: User just types inside, no syntax needed.

### Inline Fields (Queryable without Plugins)

Use inline fields to make decisions and action items searchable:

```markdown
decision:: Use PostgreSQL for session storage
open_question:: How to handle concurrent edits?
next_step:: Implement basic CRUD operations
```

**Field types:**
- `decision::` - Decisions made (searchable across vault)
- `open_question::` - Unresolved questions
- `next_step::` - Action items

**Where to use:**
- Living documents: Capture decisions inline
- Round summaries: Note open questions
- Session index: Track current next steps

**Search in Obsidian:**
- `decision:: storage` - Find all storage decisions
- `open_question::` - Find all open questions
- `next_step::` - Find all action items

This makes your vault queryable without Dataview plugin.

### Tags

Use prefixed tags for discoverability:

| Prefix | Purpose | Examples |
|--------|---------|----------|
| `domain/*` | Area of work | `domain/architecture`, `domain/product` |
| `type/*` | Session type | `type/iterative-design`, `type/research` |
| `tech/*` | Technologies | `tech/go`, `tech/typescript` |
| `stakeholder/*` | Teams | `stakeholder/backend`, `stakeholder/product` |
| `space/*` | Workspace | `space/work`, `space/personal` |

**Guidelines:**
- Use 2-4 tags per file
- Always include at least one `domain/*` tag
- Use `status` property (not tag) for lifecycle

## Cross-Session Awareness

### When Starting New Session

1. Search for related sessions using memory/recall
2. Reference relevant past decisions
3. Link to related work with context
4. Build on established patterns

### Proactive Link Suggestions

```markdown
> [!tip] Related Session
> Similar approach in [[other-session/rounds/02-topic|Other Session]].
> Their decision on X (Round 2, Q2.3) may inform our approach here.
```

## File Formats

For detailed templates and frontmatter, see [ROUND_STRUCTURE.md](references/ROUND_STRUCTURE.md).

**Key parser requirements:**
- Questions: `### Q{round}.{number}: Title` (e.g., `### Q1.1: Database Choice`)
- Options: `**Label**: Description` (e.g., `**Option A**: Use PostgreSQL`)
- Answers: `> [!note] Answer` Obsidian callout

## Communication Protocol

### Document-First Approach

- **Substantive work** happens in documents (rounds, specs)
- **Chat** is for coordination, clarifications, quick decisions
- Don't duplicate document content in chat
- **Rounds are the decision trail** - questions + answers capture the "why"
- **Living document** is the synthesized view - decisions extracted from rounds

## Quick Reference

### Essential Commands

| Command | Description |
|---------|-------------|
| `kinen prime` | Get current session context |
| `kinen session new` | Create new session |
| `kinen session list` | List sessions |
| `kinen round new` | Create next round |
| `kinen search "query"` | Search across sessions |

See [CLI_REFERENCE.md](references/CLI_REFERENCE.md) for complete command reference.

### Session File Structure

```
session/
├── init.md              # Goals, success criteria
├── rounds/
│   ├── 01-foundation.md
│   └── 02-refinement.md
├── artifacts/
│   └── technical-spec.md  # Living document
└── session-summary.md
```

## Session Outputs

By the end of a successful session:

1. **Living document** - Spec/requirements with all decisions
2. **Round trail** - 5-6 rounds showing iterative refinement
3. **Session summary** - Captures the journey (see below)
4. **Clear next steps** - Implementation plan or follow-up
5. **Cross-session links** - Connections to related work
6. **Proper organization** - Tags, aliases for discoverability

### Session Summary Content

The session summary captures what rounds don't - the **narrative of how we got here**:

- **Goal evaluation**: For each goal - achieved / partially achieved / not achieved
- **Journey**: How thinking evolved across rounds
- **Pivots**: When and why direction changed (from chat discussions)
- **Dead ends**: What we explored and rejected, and why
- **Breakthroughs**: Key insights and aha moments
- **Decisions made**: Summary with links to rounds where decided
- **Open questions**: What remains unresolved
- **Next steps**: Concrete follow-up actions (especially for unmet goals)

This is where the essence of chat conversations gets preserved - synthesized into narrative form, not raw logs.

## Remember

- **Goals first**: Always establish clear goals before Round 1, track against them throughout
- **Progressive refinement**: Each round goes deeper
- **Concrete examples**: Show, don't tell
- **Thinking partner**: Challenge constructively, don't just agree
- **Cross-session awareness**: Search and link related work
- **Pre-populate callouts**: Critical for UX
- **Descriptive names**: `01-foundation.md` not `round-01.md`
- **Document-first**: Chat is coordination, documents are artifacts
- **Evaluate at end**: Session summary must assess goal achievement

---

For detailed reference:
- [CLI_REFERENCE.md](references/CLI_REFERENCE.md) - Complete commands
- [ROUND_STRUCTURE.md](references/ROUND_STRUCTURE.md) - Round mechanics
- [DIAGRAMS.md](references/DIAGRAMS.md) - Mermaid diagrams guide
- [SESSION_FINALIZATION.md](references/SESSION_FINALIZATION.md) - Closing sessions and goal evaluation
