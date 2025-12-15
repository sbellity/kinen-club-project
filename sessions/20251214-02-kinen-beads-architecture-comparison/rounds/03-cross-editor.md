---
date: 2025-12-14
started_at: 2025-12-14T12:15
artifact_type: round
kinen_session: 20251214-02-kinen-beads-architecture-comparison
kinen_round: 3
status: completed
aliases:
  - Round 03 Cross-Editor Strategy
tags:
  - kinen
  - skills
  - mcp
  - cross-editor
summary: Deep dive into cross-editor compatibility strategy based on beads patterns
---

# Round 03: Cross-Editor Strategy

## Round Goal

Design kinen's cross-editor integration strategy based on beads patterns.

## Decisions from Round 2

- **Daemon**: HTTP service (cross-platform, debuggable, UI-ready)
- **SKILL.md**: ~500 lines, progressive disclosure
- **No beads coupling**: Keep kinen generic
- **Direct LLM**: Deferred

## Your Question: MCP over HTTP

> "Do you know if all agents like Claude Code or Cursor now support the MCP over HTTP protocol?"

### Current MCP Transport Status

| Platform | Transport | Notes |
|----------|-----------|-------|
| Claude Desktop | **stdio** | Local process communication |
| Claude Code | **stdio** | Local process, supports hooks |
| Cursor | **stdio** | MCP support via stdio |
| Anthropic API | **HTTP/SSE** | Streamable HTTP transport |

**MCP Transports** (from MCP spec):
1. **stdio** - Process-based, local only
2. **HTTP + SSE** - Streamable, remote possible
3. **WebSocket** - Bidirectional (proposed)

**Key insight**: Most desktop IDEs (Claude Code, Cursor) use **stdio** for MCP - they spawn a local process. Your HTTP daemon wouldn't communicate via MCP protocol directly; instead:

```
IDE → MCP stdio → kinen-mcp-server → HTTP → kinen-daemon
```

The `kinen mcp serve` command would be a stdio MCP server that internally calls your HTTP daemon.

---

## How Beads Handles Cross-Editor

Based on the beads codebase:

### Editor-Specific Setup Commands

```bash
bd setup claude   # Install hooks in ~/.claude/settings.json
bd setup cursor   # Create .cursor/rules/beads.mdc
bd setup aider    # Create .aider.conf.yml
```

### What Each Creates

**Claude Code** (hooks-based):
```json
// ~/.claude/settings.json
{
  "hooks": {
    "SessionStart": ["bd prime"],
    "PreCompact": ["bd prime"]
  }
}
```
→ Auto-injects context at session start and before compaction

**Cursor** (rules-based):
```markdown
// .cursor/rules/beads.mdc
# Beads Issue Tracking

This project uses bd for issue tracking.

## Core Rules
- Track ALL work in bd
- Use `bd ready` to find work
- Use `bd create` to track issues

## Quick Reference
bd prime    # Load workflow context
bd ready    # Show ready issues
...
```
→ Static rules, agent reads on demand

**Aider** (config-based):
```yaml
# .aider.conf.yml
# bd workflow instructions
```
→ Similar to Cursor, static reference

### Key Pattern

**CLI is the universal interface.**

| Editor | Integration Method | Context Injection |
|--------|-------------------|-------------------|
| Claude Code | Hooks | Automatic (`bd prime`) |
| Cursor | Rules file | On-demand (read rules) |
| Aider | Config file | On-demand (read config) |
| Any shell | AGENTS.md | Manual (`bd prime`) |

---

## Question 1: Kinen Setup Commands

Should kinen follow the same pattern?

### Proposed Commands

```bash
kinen setup claude   # Install hooks
kinen setup cursor   # Create .cursor/rules/kinen.mdc
kinen setup aider    # Create .aider.conf.yml
kinen setup generic  # Create AGENTS.md section
```

### Options

**A) Follow beads exactly** - Same setup pattern, same file locations
```bash
kinen setup claude   # ~/.claude/settings.json hooks
kinen setup cursor   # .cursor/rules/kinen.mdc
```

**B) Unified config + setup** - Single source, generate for each
```bash
kinen setup --all    # Generate all from KINEN_GUIDE.md
kinen setup cursor   # Generate Cursor rules from guide
```

**C) MCP-first, setup secondary** - MCP works everywhere, setup for optimization
```bash
kinen mcp serve      # Primary interface (stdio)
kinen setup claude   # Optional: add hooks for auto-context
```

**D) Skills as source of truth** - Skills repo generates configs
```
skills/kinen/SKILL.md → generate → .cursor/rules/kinen.mdc
                                → .aider.conf.yml
                                → hooks config
```

### Your Choice

> [Answer here]
> I am not sure I fully understand the subtleties of the alternatives you present. but for me the general rules are that:
>- we should NOT repeat ourselves, single source of truth
>- we should hook into those editors as natively as possible to produce the best results. For the example the PreCompact hook seems to be essential for long running sessions where otherwise the skills or context would eaily drift and be forgotten as the agents compact the context.

---

## Question 2: MCP Architecture

Given your choice of HTTP daemon, here's how the pieces fit:

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        kinen-daemon                          │
│                    (HTTP on localhost:7777)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Spaces Manager                                       │   │
│  │  ├── Space 1 (kinen-club-project)                    │   │
│  │  │   ├── Sessions index (SQLite)                     │   │
│  │  │   └── Memory index (LanceDB)                      │   │
│  │  └── Space 2 (kinen-go)                              │   │
│  │      ├── Sessions index                              │   │
│  │      └── Memory index                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ▲              ▲              ▲
         │              │              │
    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
    │  CLI    │    │  MCP    │    │  Web UI │
    │ kinen   │    │ Server  │    │ (future)│
    │ session │    │ (stdio) │    │         │
    └─────────┘    └────┬────┘    └─────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
    │ Claude  │    │ Cursor  │    │ Claude  │
    │  Code   │    │         │    │ Desktop │
    └─────────┘    └─────────┘    └─────────┘
```

### Question

Is this architecture correct for your vision?

**A) Yes, this captures it**
**B) Modify** - [describe changes]
**C) Simpler** - No separate daemon, CLI does everything
**D) Different** - [propose alternative]

### Your Choice

> [Answer here]
> I think it makes sense. What do you think ?

---

## Question 3: Context Injection Strategy

From Round 2, you asked if skills + commands can replace `kinen prime`.

### The Three Pieces

| Piece | What It Is | When It's Used |
|-------|------------|----------------|
| **Skills** | Methodology docs | Claude reads when relevant |
| **Commands** | User actions | `/kinen` triggers |
| **Prime** | Current state | Injected at session start |

### Skills Alone Are Insufficient

Skills teach Claude the kinen methodology but don't provide:
- Current session context (which session, which round)
- Recent decisions
- Active space

### Options

**A) Prime command (beads pattern)**
```bash
kinen prime          # Output current context
kinen prime --json   # Machine-readable
```
Used via hooks (Claude Code) or manually (Cursor/Aider)

**B) Status command + manual check**
```bash
kinen status         # Show current state
# User/agent must remember to run it
```

**C) MCP context tool**
```
kinen_context_get()  # MCP tool returns current state
# Claude decides when to call it
```

**D) All three, tiered**
- Claude Code: hooks run `kinen prime`
- Cursor: agent runs `kinen status` per rules
- MCP: `kinen_context_get` as fallback

### My Recommendation

**D) Tiered approach**. Different editors have different capabilities:

```markdown
# Cursor rules (.cursor/rules/kinen.mdc)
At session start, run: `kinen status`
This shows current session/round context.
```

```json
// Claude Code hooks
{
  "hooks": {
    "SessionStart": ["kinen prime"]
  }
}
```

### Your Choice

> [Answer here
D definitely

---

## Question 4: Memory Consolidation Skill

You mentioned:
> "we might add a separate skill for the background (or different of background) memory consolidation mechanisms"

### What Would This Skill Cover?

**A) How memory indexing works** (user-facing)
- How to use `kinen search`
- What gets indexed
- How to improve search results

**B) Memory consolidation mechanics** (agent-facing)
- Background indexing process
- When facts are extracted
- How to trigger re-indexing

**C) Both in one skill** - `kinen-memory/SKILL.md`
```markdown
---
name: kinen-memory
description: Memory and semantic search capabilities for kinen. Use when searching past sessions, recalling context, or understanding memory indexing.
---
```

**D) Part of main skill** - Section in `kinen-methodology/SKILL.md`
- Memory & Recall section
- Reference file `MEMORY_RECALL.md` for details

### Your Choice

> [Answer here]
> Memory recall would be part of the main skill because it would be skills acquired by the agent that is interacting with user
> I was talking about potentially having other agents responsible for performing the memory consolidation tasks in the background, and would need specific skills for hatt.

---

## Question 5: Skills File Structure (Finalization)

Based on decisions so far, here's the proposed structure:

### Option A: Single Skill + References

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

### Option B: Two Skills

```
skills/
├── kinen-methodology/
│   ├── SKILL.md              # ~400 lines (workflow)
│   └── references/
│       ├── METHODOLOGY.md
│       ├── SESSION_TYPES.md
│       ├── ROUND_STRUCTURE.md
│       └── CLI_REFERENCE.md
└── kinen-memory/
    ├── SKILL.md              # ~200 lines (memory)
    └── references/
        ├── MEMORY_RECALL.md
        └── INDEXING.md
```

### Option C: Minimal + Heavy References

```
skills/
└── kinen/
    ├── SKILL.md              # ~200 lines (overview only)
    └── references/
        └── [all docs here]
```

### Your Choice

> [Answer here]
> I don't know can you advise. I don't know what to base decision on.

---

## Question 6: Implementation Deliverables

What should this session produce?

### Options

**A) Design docs only** - Architecture decisions, file structures
- This session's artifacts
- Implementation in separate beads epic

**B) Design + Skeleton** - Create file structure with placeholders
```bash
# Create skills/kinen-methodology/SKILL.md (skeleton)
# Create AGENTS.md kinen section
# Create .cursor/rules template
```

**C) Design + First Draft** - Write actual SKILL.md content
- Draft SKILL.md (~500 lines)
- Draft 2-3 reference files
- Ready for review/iteration

**D) Full Implementation** - Complete skills package
- All files written
- Tested with Claude Code
- PR-ready

### Your Choice

> [Answer here]
> C

---

## Summary

### Questions This Round

1. **Setup commands**: Follow beads pattern? Unified? MCP-first?
2. **MCP architecture**: HTTP daemon + stdio MCP servers + CLI?
3. **Context injection**: Prime command? Status? MCP tool? Tiered?
4. **Memory skill**: Separate? Part of main? Section + reference?
5. **File structure**: Single skill? Two skills? Minimal?
6. **Deliverables**: Design only? Skeleton? Draft? Full?

### After This Round

We should have:
- Complete file structure decided
- Context injection strategy finalized
- Clear deliverables for implementation

Ready to generate implementation plan or start writing!
