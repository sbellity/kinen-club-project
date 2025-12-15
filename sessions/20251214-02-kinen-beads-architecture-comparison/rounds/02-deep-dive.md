---
date: 2025-12-14
started_at: 2025-12-14T11:30
artifact_type: round
kinen_session: 20251214-02-kinen-beads-architecture-comparison
kinen_round: 2
status: completed
aliases:
  - Round 02 Deep Dive
tags:
  - kinen
  - skills
  - plugin
  - architecture
summary: Deep dive into skills vs prime distinction, daemon architecture, SKILL.md content, and cross-editor compatibility
---

# Round 02: Deep Dive

## Round Goal

Resolve the open questions from Round 1:
1. Clarify skills vs `kinen prime` distinction (Q2)
2. Design cross-space daemon architecture (Q6)
3. Recommend SKILL.md content (Q7)
4. Define cross-editor plugin strategy (Q9)

## Decisions Carried Forward

From Round 1:
- **Document-first**: Files are source of truth, DB is rebuildable index
- **Parallel CLI/MCP**: Both thin wrappers on connect RPC
- **Trust methodology**: Session handoff via rounds + living doc (not task tracking)
- **Full references**: 6 reference files for skills
- **Plugin approach**: Skills + commands + hooks, cross-editor compatible

---

## Question 1: Skills vs Prime - The Distinction

You asked: "Can't we rely on skills and commands instead of `kinen prime`?"

**Great question.** Let me clarify the conceptual difference:

### What Each Does

| Concept | Loaded When | Contains | Token Cost |
|---------|-------------|----------|------------|
| **Skills** | Claude decides (based on task) | Methodology docs | ~500-2000 tokens when read |
| **Commands** | User types `/kinen` | Action triggers | Varies |
| **Prime** | Session start (hook) | Current state | ~500-1500 tokens always |

### The Gap Skills/Commands Don't Fill

Skills tell Claude **how to use kinen**. But they don't tell Claude:
- Which session is active
- What round you're on
- Recent decisions made
- Current working context

**Example scenario**: You're in Round 3 of a session. You ask Claude: "Continue with the next question."

- **Without prime**: Claude doesn't know you're in Round 3 or what session
- **With skills only**: Claude knows kinen methodology but not your current state
- **With prime**: Claude knows: session X, round 3, last decision was Y

### Options

**A) Skills + Commands + State Command** (lightweight prime alternative)
- Skills for methodology
- `/kinen status` command shows current state
- User explicitly runs `/kinen status` when needed
- Cons: Manual, user must remember

**B) Skills + Commands + Auto-State Hook** (Claude Code only)
- Skills for methodology
- Hook auto-injects state at session start
- Cons: Claude Code only (Cursor doesn't have hooks)

**C) Skills + Commands + MCP Context**
- Skills for methodology
- MCP `kinen_context_get` tool returns current state
- Claude calls it when needed (model-invoked)
- Cons: Tool call overhead, not guaranteed to be called

**D) Skills + Prime Command (cross-editor)**
- Skills for methodology
- `kinen prime` CLI outputs state (works in any editor)
- Agent instructions tell it to run `kinen prime` at session start
- Pros: Universal, explicit
- Cons: Requires agent configuration

### Recommendation

**D) Skills + Prime Command** is the most universal approach.

```bash
# In AGENTS.md or agent config:
# "At session start, run: kinen prime"

$ kinen prime
# Kinen Context
Space: kinen-club-project
Session: 20251214-02-kinen-beads-architecture-comparison (active)
Round: 2 of ?
Last updated: 2025-12-14T11:30

## Recent Decisions
- Document-first architecture
- Parallel CLI/MCP
- Plugin approach for skills

## Commands
kinen session show    # Session details
kinen round new       # Start next round
kinen search "query"  # Search memory
```

### Your Choice

> [Answer here]

---

## Question 2: Cross-Space Daemon Architecture

You want a daemon that "works across spaces" for a UI spanning multiple spaces.

### Architecture Options

**Option A: Per-Space Daemons (beads pattern)**
```
~/.kinen/
├── spaces/
│   ├── space-1/.kinen/daemon.sock
│   └── space-2/.kinen/daemon.sock
└── config.yaml
```
- Each space has its own daemon
- UI must connect to multiple daemons
- Simpler isolation, harder coordination

**Option B: Single Global Daemon**
```
~/.kinen/
├── daemon.sock        # Global daemon
├── spaces.yaml        # Space registry
└── spaces/
    ├── space-1/
    └── space-2/
```
- One daemon manages all spaces
- UI connects once, queries across spaces
- Complex daemon, simpler clients
- Can aggregate search across spaces

**Option C: Hub + Per-Space Workers**
```
~/.kinen/
├── hub.sock           # Central coordinator
├── spaces/
│   ├── space-1/worker.sock
│   └── space-2/worker.sock
```
- Hub handles routing, workers do work
- UI connects to hub only
- Best scalability, most complex

**Option D: No Daemon, HTTP Service**
```
~/.kinen/
├── spaces/
│   ├── space-1/
│   └── space-2/
└── service running on localhost:7777
```
- HTTP server (like ollama pattern)
- Cross-platform, easy debugging
- REST API for all operations
- Can be packaged as app

### Feature Comparison

| Feature | A: Per-Space | B: Global | C: Hub+Workers | D: HTTP |
|---------|-------------|-----------|----------------|---------|
| Cross-space search | ❌ | ✅ | ✅ | ✅ |
| Multi-space UI | Hard | Easy | Easy | Easy |
| Isolation | ✅ | ❌ | ✅ | ❌ |
| Complexity | Low | Medium | High | Low |
| Cross-platform | Unix only | Unix only | Unix only | ✅ |
| Debuggable | Hard | Hard | Hard | Easy |

### Recommendation

**Option D (HTTP Service)** because:
1. Cross-platform (Windows/Mac/Linux)
2. Easy debugging (curl, browser)
3. Natural fit for future web UI
4. Ollama-like pattern is proven
5. Can still be auto-started by CLI

### Your Choice

> [Answer here]
> Yes yes, I Let’s do option D with the HTTP Service. Do you know if all agents like Claude code or cursor now support the mcp over HTTP  protocol ?

---

## Question 3: SKILL.md Content Recommendation

You asked for advice on SKILL.md content. Here's my recommendation:

### Recommendation: Option A (Comprehensive, ~400-500 lines)

**Rationale**:
1. **Under 500 line limit** - Fits Claude's optimal range
2. **One skill, not split** - Kinen methodology is one coherent workflow
3. **Progressive disclosure** - Details in references/
4. **Beads pattern works** - Similar scope to beads (issues ≈ sessions)

### Proposed SKILL.md Structure

```markdown
---
name: kinen-methodology
description: Structured thinking sessions with iterative rounds for design, research, and architecture work. Use when exploring complex topics, making architectural decisions, or conducting research that benefits from structured Q&A format with documented decisions.
---

# Kinen Methodology

## Overview (~50 lines)
- What kinen is and when to use it
- Comparison: kinen vs TodoWrite vs beads
- Core concepts: spaces, sessions, rounds, artifacts

## Session Start Protocol (~80 lines)
- When to suggest a kinen session
- Creating a new session
- Resuming an existing session
- Getting current context (`kinen prime`)

## Round Workflow (~100 lines)
- Round structure (goal, questions, decisions)
- Question format (options, tradeoffs)
- Recording decisions
- Updating living document
- When to end a round

## Memory and Recall (~60 lines)
- Using `kinen search`
- Semantic vs keyword search
- Incorporating past context
- Cross-session insights

## Integration Patterns (~80 lines)
- Kinen → beads handoff
- Session outputs as implementation plans
- Artifact management
- Git workflow

## Common Patterns (~50 lines)
- Architecture session
- Research session
- Writing session
- Implementation planning session

## Quick Reference (~30 lines)
- Essential commands
- Links to references/

## Troubleshooting (~50 lines)
- Common issues
- When to NOT use kinen

TOTAL: ~500 lines
```

### Do you agree with this structure?

**A) Yes, proceed with this structure**
**B) Shorter** - Cut to ~300 lines, more in references
**C) Different focus** - Propose changes
**D) Split into multiple skills** - Despite recommendation

### Your Choice

> [Answer here]
> Yes works for me. Although we might add a separate skill for the backround (or different of background) memory consolidation mechanisms

---

## Question 4: Cross-Editor Plugin Strategy

You want the plugin approach to work with:
1. Claude Code
2. Cursor
3. Future: Direct LLM invocation

### Platform Capabilities

| Platform | Skills | Commands | Hooks | MCP |
|----------|--------|----------|-------|-----|
| Claude Code | ✅ | ✅ `/cmd` | ✅ | ✅ |
| Cursor | ❌ | ❌ | ❌ | ✅ |
| Direct LLM | Manual | N/A | N/A | Possible |

**Key insight**: MCP is the only universal interface.

### Strategy Options

**A) Claude Code Plugin + MCP for others**
```
kinen-plugin/                    # Claude Code specific
├── .claude-plugin/plugin.json
├── skills/kinen/SKILL.md
├── commands/
│   ├── session.md
│   └── round.md
└── hooks/hooks.json

# For Cursor/others: MCP server only
kinen mcp serve
```
- Best UX for Claude Code users
- MCP fallback for others
- Two systems to maintain

**B) MCP-First with Skills as Documentation**
```
# Primary: MCP server (universal)
kinen mcp serve

# Documentation (works everywhere, loaded differently)
skills/kinen/SKILL.md           # Claude Code auto-loads
.cursor/KINEN.md                # Cursor rules (manual load)
AGENTS.md                       # Generic agent instructions
```
- MCP tools work everywhere
- Documentation adapts to platform
- One MCP implementation, many doc formats

**C) CLI-First with Agent Instructions**
```
# Universal: CLI commands
kinen prime                      # Context injection
kinen session new               # Create session
kinen round new                 # Create round

# Agent instructions in:
AGENTS.md                       # "Use kinen CLI commands..."
.cursor/rules                   # Cursor-specific rules
skills/kinen/SKILL.md           # Claude Code skill
```
- Simplest implementation (just CLI)
- Works with any agent that can run shell commands
- No MCP required (but can add later)

**D) Tiered Approach**
```
Tier 1: CLI (universal baseline)
  - Works with any agent
  - `kinen prime`, `kinen session`, etc.

Tier 2: MCP (enhanced integration)
  - Native tool calls
  - Memory search as tool
  - For Claude Desktop, Cursor

Tier 3: Claude Code Plugin (full experience)
  - Skills + Commands + Hooks
  - Best UX, Claude-specific
```
- Progressive enhancement
- Users get what their platform supports
- Clear upgrade path

### Recommendation

**D) Tiered Approach** because:
1. CLI works everywhere today
2. MCP adds value where supported
3. Claude Code plugin provides best-in-class UX
4. Future direct LLM can use CLI/MCP

### Implementation Priority

```
Phase 1 (Now): CLI + Documentation
  - kinen CLI already works
  - Create skills/kinen/SKILL.md
  - Create AGENTS.md
  - Create .cursor/rules

Phase 2 (Next): MCP Enhancement
  - Already have kinen MCP
  - Ensure tools expose full functionality
  - Add context_get tool

Phase 3 (Later): Claude Code Plugin
  - Package as plugin
  - Add commands (user-invoked)
  - Add hooks (session start)
```

### Your Choice

> [Answer here]
> Let’s have another look at how beads supports those different integrations

---

## Question 5: Direct LLM Invocation (Future)

You mentioned wanting "a small agent thing in Kinen itself that would invoke LLMs directly."

### Use Cases

What would this enable?

**A) Autonomous session summarization**
- Kinen daemon runs LLM to create summaries
- No human in the loop
- Background processing

**B) Memory enrichment**
- Extract facts from sessions automatically
- Tag and categorize content
- Build knowledge graph

**C) Interactive CLI**
- `kinen chat` - Direct LLM interaction with kinen context
- No IDE needed
- Terminal-native workflow

**D) All of the above**

### Implementation Considerations

```go
// pkg/llm/client.go
type LLMClient interface {
    Complete(ctx context.Context, prompt string) (string, error)
    CompleteWithTools(ctx context.Context, prompt string, tools []Tool) (Response, error)
}

// Implementations
type OllamaClient struct { ... }
type OpenAIClient struct { ... }
type AnthropicClient struct { ... }
```

### Questions for Future Round

1. Which use cases are highest priority?
2. Which LLM providers to support first?
3. Where does this fit in architecture (daemon? standalone?)

### Your Choice (for now)

**A) Defer to future session** - Focus on skills/plugin now
**B) Explore briefly** - Quick brainstorm, then park
**C) Add to scope** - Include in this session's deliverables

> [Answer here]
> We can defer to future session

---

## Question 6: SKILL.md - Integration with TodoWrite and Beads

You clarified: Kinen outputs → beads epics/issues. Kinen is not task management.

### Should SKILL.md cover this handoff?

**A) Yes, explicit section**
```markdown
## Handoff to Beads

When a kinen session produces an implementation plan:
1. Extract actionable items from living document
2. Create beads epic for the work
3. Link session artifacts to epic
4. Close kinen session

Example:
- Kinen session: "20251214-02-kinen-beads-architecture"
- Output: architecture-comparison.md with decisions
- Beads epic: "Implement kinen skills structure"
- Beads issues: One per implementation task
```

**B) Brief mention only**
```markdown
## Integration
Kinen sessions often produce implementation plans.
Use beads for task tracking. See AGENTS.md for workflow.
```

**C) No mention** - Keep skills focused on kinen only

### Your Choice

> [Answer here]
> C. Let's not build any adherence to beads at all. I just happen to use it but might not be the right choice for any kinen user.

---

## Summary

### Questions This Round

1. **Skills vs Prime**: How to inject current session state?
2. **Daemon Architecture**: Per-space, global, hub, or HTTP?
3. **SKILL.md Content**: ~500 lines comprehensive structure?
4. **Cross-Editor Strategy**: Tiered CLI→MCP→Plugin approach?
5. **Direct LLM**: Defer or explore?
6. **Beads Integration**: Cover in SKILL.md?

### After This Round

We should have:
- Clear architecture for daemon
- SKILL.md structure approved
- Cross-editor strategy defined
- Scope clarified (what's in/out)

Ready to finalize and create implementation plan in Round 3.
