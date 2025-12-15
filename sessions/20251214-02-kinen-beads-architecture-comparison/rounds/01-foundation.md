---
date: 2025-12-14
started_at: 2025-12-14T10:22
artifact_type: round
kinen_session: 20251214-02-kinen-beads-architecture-comparison
kinen_round: 1
status: completed
aliases:
  - Round 01 Foundation
tags:
  - kinen
  - beads
  - architecture
summary: Foundation round exploring key architectural patterns from beads applicable to kinen
---

# Round 01: Foundation

## Round Goal

Establish foundational understanding of beads patterns and determine which are most applicable to kinen's use case.

## Context from Beads Exploration

We've reviewed the beads codebase and identified these key patterns:

1. **Three-Layer Data Model**: SQLite (fast) → JSONL (git-tracked) → Remote
2. **CLI + Hooks**: `bd prime` injects context (~1-2k tokens), hooks auto-refresh
3. **Skills Structure**: `skills/beads/SKILL.md` with `references/` subdirectory
4. **Session Handoff**: Structured notes (COMPLETED/IN_PROGRESS/NEXT)
5. **Daemon Architecture**: Per-workspace, RPC via Unix socket, graceful fallback
6. **MCP as Alternative**: Recommended only when CLI unavailable

---

## Question 1: Data Model Alignment

**Beads uses**: SQLite (local, gitignored) → JSONL (git-tracked) → Git remote

**Kinen currently uses**: Markdown (git-tracked) + Memory DB (SQLite+LanceDB, gitignored)

### Analysis

| Aspect | Beads | Kinen | Compatibility |
|--------|-------|-------|---------------|
| Source of truth | JSONL | Markdown | ✅ Both git-tracked |
| Fast queries | SQLite | SQLite+LanceDB | ✅ Similar |
| Sync direction | DB → JSONL | Markdown → DB | ⚠️ Inverted |
| Entity type | Issues (structured) | Sessions (documents) | ⚠️ Different |

**Key insight**: Kinen's markdown-first approach is fundamentally different. Sessions are documents, not database records. The memory DB is an *index* of content, not the source of truth.

### Options

**A) Adopt beads pattern fully** - Add session metadata JSONL layer
- Pros: Proven pattern, enables structured queries
- Cons: Adds complexity, duplicates frontmatter

**B) Keep markdown-first, add structured cache** - SQLite caches parsed frontmatter
- Pros: Simpler, maintains document focus
- Cons: Cache invalidation complexity

**C) Status quo with improvements** - Keep current architecture, focus on sync reliability
- Pros: Minimal change
- Cons: Misses optimization opportunities

### Your Choice

> [Answer here]
> Keep document first focus. DB is for index indeed, source of truth is files committed to git. DB is fully rebuildable from files.

---

## Question 2: Context Injection (`kinen prime`)

**Beads has**: `bd prime` outputs ~1-2k tokens of workflow context, auto-injected via SessionStart hook

### What `kinen prime` could output

```markdown
# Kinen Session Active

Current space: kinen-club-project
Current session: 20251214-02-kinen-beads-architecture-comparison
Session type: architecture
Status: active (Round 1)

## Recent Decisions
- [From Round 1] Decided to...
- [From init] Goal is to...

## Quick Reference
- `kinen session list` - List sessions
- `kinen session show <id>` - Show session details
- `kinen search "<query>"` - Semantic search across sessions
- `kinen recall "<query>"` - Recall relevant past context

## Methodology Reminder
- Each round: 8-12 focused questions with options
- Living document updated after each round
- Final summary captures all decisions
```

### Options

**A) Implement `kinen prime` with hooks** - Full beads pattern
- Pros: Context survives compaction, automatic refresh
- Cons: Hook system complexity

**B) Implement `kinen prime` only** - Manual invocation, no hooks
- Pros: Simpler, still useful
- Cons: Agents must remember to call it

**C) Rely on MCP context** - MCP tools provide context
- Pros: Already implemented
- Cons: Higher token overhead (tool schemas)

**D) Hybrid** - `kinen prime` for CLI, MCP for Claude Desktop
- Pros: Best of both
- Cons: Two paths to maintain

### Your Choice

> [Answer here]
> Can't we rely on skills and commands instead ?
> Maybe I am missing something please advise

---

## Question 3: Skills Structure for Kinen

**Beads has**:
```
skills/
└── beads/
    ├── SKILL.md              # Main skill definition
    └── references/
        ├── WORKFLOWS.md
        ├── BOUNDARIES.md
        ├── CLI_REFERENCE.md
        └── ...
```

### Proposed Kinen Structure

```
skills/
└── kinen/
    ├── SKILL.md              # Main: When to use kinen, core workflow
    └── references/
        ├── METHODOLOGY.md    # Full methodology reference
        ├── SESSION_WORKFLOW.md # Session lifecycle
        ├── ROUND_STRUCTURE.md  # How to run rounds
        ├── MEMORY_RECALL.md    # Using memory/search
        └── CLI_REFERENCE.md    # Command reference
```

### Options

**A) Create skills structure now** - Part of this session's deliverables
- Pros: Immediate value for Claude integration
- Cons: Scope expansion

**B) Create in skills session** - [[20251214-01-kinen-methodology-skills]] handles this
- Pros: Focused scope
- Cons: Delays integration

**C) Embed in AGENTS.md** - No separate skills, just project docs
- Pros: Simpler
- Cons: Misses Claude-specific optimization

### Your Choice

> [Answer here
A I think it makes sense to explore skills during this session.

---

## Question 4: Session Handoff Pattern

**Beads uses** notes field with structured format:
```
COMPLETED: Specific deliverables
IN PROGRESS: Current state + next step
NEXT: Immediate action
BLOCKER: What's preventing progress
KEY DECISION: Important context
```

**Kinen currently uses**: Q&A in rounds, living document, session summary

### Analysis

Kinen already captures similar information differently:
- **COMPLETED** → Decisions in previous rounds
- **IN PROGRESS** → Current round's questions
- **NEXT** → Upcoming questions / next round
- **KEY DECISION** → Recorded in living document

### Options

**A) Add explicit handoff section to init.md**
```yaml
---
handoff:
  completed:
    - "Decided on three-layer model approach"
  in_progress: "Exploring skills structure"
  next: "Define CLI commands"
  blockers: []
---
```

**B) Use living document summary** - Each round adds summary section
- Current pattern, perhaps formalize

**C) Create session-state.yml** - Separate machine-readable state file
- Easy to parse, harder to maintain

**D) Trust the methodology** - Rounds + living doc are sufficient
- Beads pattern is for different use case (issues vs sessions)

### Your Choice

> [Answer here]
> Kinen is really about developing ideas and thinking. Most of the time, the outcome of kinen sessions will be to produce implementation plans that can be translated into beads epics or issues. While I am not excluding the possibility of adding issues/tasks management capabilities to Kinen that shold not be its primary focus.
> Not sure if it answers your question but I think it provides context to reframe it.

---

## Question 5: MCP vs CLI Balance

**Beads recommends CLI + Hooks** because:
- 10-50x less context overhead than MCP tool schemas
- Universal across editors
- Hooks automate context injection

**Kinen's situation is different**:
- MCP already implemented
- Session creation is heavier than issue creation
- Memory search benefits from native tool integration

### Options

**A) CLI-first like beads** - Add `kinen prime`, deprecate MCP focus
- Pros: Proven efficient pattern
- Cons: Rework existing MCP investment

**B) MCP-first, CLI secondary** - Current approach
- Pros: Native tool integration, already built
- Cons: Higher context overhead

**C) Parallel paths** - Both equally supported
- Pros: Flexibility
- Cons: Maintenance burden

**D) MCP for creation, CLI for queries** - Hybrid by operation type
- Pros: Optimizes for each use case
- Cons: Confusing UX

### Your Choice

> [Answer here]
> C - I don't think there is much overhead or at least there should not be in implementation
> Our kinen public API is defined in the protos and cli and mcp should only be thin mechanical wrappers on top using connect RPC

---

## Question 6: Daemon Design

**Beads daemon**:
- Per-workspace
- RPC via Unix socket (`.beads/bd.sock`)
- 5-second debounce for sync
- Fallback to direct DB if daemon unavailable

**Kinen daemon considerations**:
- Per-space (maps to workspace)
- Memory indexing in background
- Health endpoint for MCP server
- Auto-start from CLI/MCP

### Options

**A) Full beads pattern** - Unix socket RPC, auto-sync
- Pros: Proven, fast
- Cons: Complex, may be overkill

**B) HTTP daemon** - Simple HTTP server for health + indexing
- Pros: Easier debugging, cross-platform
- Cons: Slightly higher latency

**C) No daemon, on-demand** - Index when requested
- Pros: Simple
- Cons: Slower searches, no background work

**D) Hybrid** - HTTP for API, background goroutine for indexing
- Pros: Balance of features
- Cons: Still complex

### Your Choice

> [Answer here]
> Let's explore a bit more pros and cons of those questions. I think I like the approach where the daemon works across spaces because it will also allow us to have a ui that will span across multiple spaces configured on the machine...

---

---

## Question 7: Skills Content (SKILL.md)

### Claude Skills Best Practices (from official docs)

> **Key constraints from [Claude Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)**:
> - `name`: max 64 chars, lowercase letters/numbers/hyphens only
> - `description`: max 1024 chars, must include WHAT it does AND WHEN to use it
> - **Body under 500 lines** for optimal performance
> - Write descriptions in **third person** ("Processes...", not "I help with...")
> - Progressive disclosure: SKILL.md points to reference files, loaded only when needed
> - Keep references **one level deep** from SKILL.md
> - **Concise is key**: Only add context Claude doesn't already have

**Beads `SKILL.md`** is ~645 lines (exceeds 500 line recommendation) covering:
- Overview and when to use
- Session start protocol
- Progress checkpointing (compaction survival)
- Core operations (ready, create, update, close)
- Issue lifecycle workflow
- Integration with TodoWrite
- Common patterns
- Troubleshooting

### What should `skills/kinen/SKILL.md` contain?

**A) Comprehensive but within limits** (~400-500 lines)
```yaml
---
name: kinen-methodology
description: Structured thinking sessions with iterative rounds for design, research, and architecture work. Use when exploring complex topics, making architectural decisions, or conducting research that benefits from structured Q&A format.
---
```
Content:
- Overview and when to use kinen (vs TodoWrite, vs beads)
- Session start protocol
- Round progression workflow
- Core operations (brief - details in references/)
- Common patterns (research, architecture, implementation)
- Quick troubleshooting

**B) Minimal SKILL.md** (~200 lines) + heavy references/
```yaml
---
name: kinen-methodology
description: Structured thinking sessions with iterative rounds. Use for design, research, architecture, and complex problem exploration requiring documented decision-making.
---
```
Content:
- Brief overview
- Quick start checklist
- Pointers to `references/` for everything else

**C) Split into multiple skills** (following Claude's "keep skills focused" advice)
```
skills/
├── kinen-session-management/SKILL.md  # Session lifecycle
├── kinen-round-processing/SKILL.md    # Running rounds
└── kinen-memory-recall/SKILL.md       # Search and context
```

### Your Choice

> [Answer here]
> I don't know, please advise

---

## Question 8: References Structure

**Beads has these references**:
- `BOUNDARIES.md` - When to use bd vs TodoWrite (470 lines)
- `WORKFLOWS.md` - Step-by-step workflows with checklists (549 lines)
- `CLI_REFERENCE.md` - Complete command reference (560 lines)
- `DEPENDENCIES.md` - Dependency patterns (748 lines)
- `ISSUE_CREATION.md` - Issue quality guidelines (140 lines)
- `RESUMABILITY.md` - Making issues resumable (208 lines)
- `STATIC_DATA.md` - Alternative use cases (55 lines)

### What references does kinen need?

| Proposed Reference | Maps to Beads | Content |
|-------------------|---------------|---------|
| `METHODOLOGY.md` | (unique) | Full methodology reference |
| `SESSION_TYPES.md` | BOUNDARIES.md | When to use each session type |
| `ROUND_STRUCTURE.md` | WORKFLOWS.md | How to run rounds, question format |
| `MEMORY_RECALL.md` | (unique) | Using memory/search effectively |
| `CLI_REFERENCE.md` | CLI_REFERENCE.md | Command reference |
| `HANDOFF.md` | RESUMABILITY.md | Session handoff patterns |

### Options

**A) Full set** - All six references above
**B) Essential only** - METHODOLOGY.md, ROUND_STRUCTURE.md, CLI_REFERENCE.md
**C) Consolidate** - Put everything in expanded SKILL.md (~1000+ lines)
**D) Different structure** - Your proposal

### Your Choice

> [Answer here]
> Let's start with A

---

## Question 9: Skills vs `kinen prime`

### How Claude Skills Actually Work

From [Claude Code Skills docs](https://code.claude.com/docs/en/skills):
> Skills are **model-invoked**—Claude autonomously decides when to use them based on your request and the Skill's description. This is different from slash commands, which are **user-invoked**.

From [Claude Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices):
> At startup, only the **metadata (name and description)** from all Skills is pre-loaded. Claude reads SKILL.md only when the Skill becomes relevant, and reads additional files only as needed.

**Key insight**: Skills are NOT automation triggers. They're documentation that Claude loads when relevant.

### Beads' Decision

Beads chose `bd prime` over Claude Skills because:
- Skills are Claude-specific (not editor-agnostic)
- `bd prime` works across all editors
- Less maintenance burden
- Simpler mental model

**However**, beads still maintains `skills/beads/` as Claude-compatible documentation for Claude Code users.

### For kinen, what's the relationship?

**A) Skills as methodology documentation** (beads pattern)
- Skills teach Claude the kinen methodology
- `kinen prime` injects current session context
- Clear separation: skills = "how to", prime = "where we are"

**B) Skills only, no prime**
- Skills handle everything
- Simpler (one system)
- But: no runtime context injection

**C) Prime only, no skills**
- `kinen prime` outputs methodology + context
- Works across all editors
- But: more tokens injected upfront

**D) Plugin approach** (from [Claude Code Plugins](https://code.claude.com/docs/en/plugins))
- Package skills + commands + hooks as a plugin
- `/kinen` slash command for explicit invocation
- Skills for autonomous discovery
- Hooks for automation (session start, etc.)

### Your Choice

> [Answer here]
> I think the Plugin approach makes sense. It has to work well with other agents than claude code though. Let's explore how it would work with claude code, cursor and if we want to have a small agent thing in Kinen itself that would invoke LLMs directly (for later)

---

## Summary

After this round, we should have decisions on:

### Architecture
1. **Data model** - Keep markdown-first or add structured layer?
2. **Context injection** - Implement `kinen prime` and/or hooks?
3. **Session handoff** - Add explicit format or trust methodology?
4. **MCP vs CLI** - Which is primary interface?
5. **Daemon design** - What architecture for background services?

### Skills
6. **Skills content** - What goes in SKILL.md?
7. **References structure** - What reference docs are needed?
8. **Skills vs prime** - Documentation, automation, or both?

These decisions will inform the implementation plan in Round 2.
