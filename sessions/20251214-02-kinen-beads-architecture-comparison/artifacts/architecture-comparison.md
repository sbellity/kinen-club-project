---
date: 2025-12-14
started_at: 2025-12-14T10:29
artifact_type: technical-spec
kinen_session: 20251214-02-kinen-beads-architecture-comparison
status: draft
last_updated: init
aliases:
  - Kinen-Beads Architecture Comparison
tags:
  - kinen
  - beads
  - architecture
summary: Comparative analysis of kinen and beads architectures with recommendations
---

# Kinen-Beads Architecture Comparison

## Executive Summary

*To be completed after rounds*

## Architectural Comparison

### Beads Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLI Layer                                 │
│  bd create, list, update, close, ready, show, dep, sync, ...    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               v
┌─────────────────────────────────────────────────────────────────┐
│                     SQLite Database                              │
│                     (.beads/beads.db)                            │
│  - Local working copy (gitignored)                               │
│  - Fast queries, indexes, foreign keys                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │ auto-sync (5s debounce)
                               v
┌─────────────────────────────────────────────────────────────────┐
│                       JSONL File                                 │
│                   (.beads/issues.jsonl)                          │
│  - Git-tracked source of truth                                   │
│  - One JSON line per entity                                      │
│  - Merge-friendly                                                │
└──────────────────────────────┬──────────────────────────────────┘
                               │ git push/pull
                               v
┌─────────────────────────────────────────────────────────────────┐
│                     Remote Repository                            │
└─────────────────────────────────────────────────────────────────┘
```

### Current Kinen Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLI / MCP Layer                              │
│  kinen session, search, recall, index, ...                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              v                                  v
┌──────────────────────────┐      ┌──────────────────────────┐
│   Markdown Files         │      │   Memory Database        │
│   (sessions/, rounds/)   │      │   (SQLite + LanceDB)     │
│   - Git-tracked          │      │   - Embeddings           │
│   - Source of truth      │      │   - Semantic search      │
└──────────────────────────┘      └──────────────────────────┘
```

## Key Patterns from Beads

### 1. Three-Layer Data Model

| Aspect | Beads | Kinen (Current) | Recommendation |
|--------|-------|-----------------|----------------|
| Source of truth | JSONL (git-tracked) | Markdown (git-tracked) | Keep markdown |
| Fast queries | SQLite (gitignored) | Memory DB | Consider SQLite for session metadata |
| Sync mechanism | Auto-export/import | Manual indexing | Add auto-sync |

### 2. Context Injection (`bd prime`)

| Aspect | Beads | Kinen | Recommendation |
|--------|-------|-------|----------------|
| Command | `bd prime` | None | Add `kinen prime` |
| Output | ~1-2k tokens | N/A | Session context + methodology |
| Hooks | SessionStart, PreCompact | None | Implement hooks |

### 3. Skills Structure

| Aspect | Beads | Kinen | Recommendation |
|--------|-------|-------|----------------|
| Location | `skills/beads/` | None | Create `skills/kinen/` |
| Main file | `SKILL.md` (~645 lines) | N/A | Create SKILL.md |
| References | 7 files in `references/` | N/A | Create essential refs |

**Beads References**:
- BOUNDARIES.md (470 lines) - When to use bd vs TodoWrite
- WORKFLOWS.md (549 lines) - Step-by-step workflows
- CLI_REFERENCE.md (560 lines) - Command reference
- DEPENDENCIES.md (748 lines) - Dependency patterns
- ISSUE_CREATION.md (140 lines) - Issue quality
- RESUMABILITY.md (208 lines) - Making issues resumable
- STATIC_DATA.md (55 lines) - Alternative uses

### 4. Session Handoff

| Aspect | Beads | Kinen | Recommendation |
|--------|-------|-------|----------------|
| Format | COMPLETED/IN_PROGRESS/NEXT | Q&A in rounds | Add handoff frontmatter |
| Location | Issue notes field | init.md | Add `handoff:` section |
| Survives compaction | Yes | Partially | Strengthen with explicit format |

### 5. Daemon Architecture

| Aspect | Beads | Kinen | Recommendation |
|--------|-------|-------|----------------|
| Scope | Per-workspace | Planned | Implement per-space |
| Communication | Unix socket RPC | HTTP (planned) | Consider socket for speed |
| Fallback | Direct DB access | N/A | Implement graceful fallback |

## Decisions

*To be filled during rounds*

### Round 1: Foundation

#### Architecture Decisions
- Q1 Data Model: **Document-first** - DB is index only, files committed to git are source of truth. DB fully rebuildable from files.
- Q2 Context Injection: **TBD** - Need to clarify skills vs prime (Round 2 Q1 unanswered)
- Q3 Skills Structure: **A** - Explore skills as part of this session
- Q4 Session Handoff: **Trust methodology** - Kinen is about ideas/thinking → produces plans for beads. Not task management.
- Q5 MCP vs CLI: **C (Parallel)** - Both equally supported via thin wrappers on connect RPC
- Q6 Daemon Design: **D (HTTP Service)** - Cross-platform, debuggable, UI-ready

#### Skills Decisions
- Q7 Skills Content: **A (~500 lines)** - Comprehensive, progressive disclosure to refs. May add separate skill for memory consolidation.
- Q8 References Structure: **A (Full set)** - All 6 reference files
- Q9 Skills vs Prime: **D (Plugin approach)** - Need cross-editor strategy. No beads coupling (C).
- Q10 Direct LLM: **Deferred** - Future session
- Q11 Beads Integration: **C (No mention)** - Keep kinen generic, no adherence to beads

### Round 2: Cross-Editor Deep Dive
**Status**: Completed

Key findings from beads:
- **Claude Code**: Uses hooks (`bd setup claude`) → auto-injects `bd prime`
- **Cursor**: Uses rules file (`.cursor/rules/beads.mdc`) → static CLI reference
- **Aider**: Uses config file (`.aider.conf.yml`) → CLI reference

**Pattern**: Editor-specific config files that reference CLI commands. CLI is the universal interface.

### Round 3: Cross-Editor Strategy
**Status**: Completed

#### Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| Q1 Setup | **Single source + native hooks** | SKILL.md is source of truth, `kinen setup` generates editor-specific configs with native capabilities (hooks for Claude Code, rules for Cursor) |
| Q2 Architecture | **Confirmed** | HTTP daemon + stdio MCP + CLI |
| Q3 Context Injection | **D (Tiered)** | Claude Code: hooks. Cursor: rules. MCP: fallback |
| Q4 Memory Skill | **Main skill + future consolidation skill** | Memory recall in main skill. Separate skill for background consolidation agents (later) |
| Q5 File Structure | **A (Single skill)** | One skill for now, includes memory recall |
| Q6 Deliverables | **C (Design + First Draft)** | Draft SKILL.md and key references |

#### Key Principles (from user)
- **Single source of truth** - No repetition across configs
- **Native editor integration** - Use PreCompact hooks, not just static rules
- **Tiered approach** - Different editors get different capabilities

### Round 4: Drafting
**Status**: Completed

#### Decisions Made (by AI based on best practices)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Description | Trigger-focused | Best practice: include WHEN to use |
| Prime output | Adaptive (brief/full/json) | Flexibility for testing |
| Reference priority | CLI, ROUND, SESSION_TYPES | Most immediately useful |
| SKILL.md structure | ~420 lines | Under 500 limit, comprehensive |

#### Deliverables Created

```
artifacts/skills/kinen-methodology/
├── SKILL.md                    # ~420 lines
└── references/
    ├── CLI_REFERENCE.md        # ~350 lines
    └── ROUND_STRUCTURE.md      # ~380 lines
```

#### Testing Approach

**Iterate based on measured results, not guesswork:**

1. **Deploy to test space**
2. **Run real sessions** with the skill loaded
3. **Measure**: Does Claude invoke the skill when expected?
4. **Measure**: Does Claude follow the methodology?
5. **Iterate**: Adjust description, content based on observations

**Success metrics:**
- Skill triggers on relevant prompts
- Claude follows round structure
- Context survives compaction (with hooks)
- Users find methodology helpful

### Round 2: Implementation Plan

## Action Items

*To be populated based on decisions*

## Claude Skills Official Guidelines

From [Claude Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices):

### SKILL.md Constraints
- `name`: max 64 chars, lowercase letters/numbers/hyphens only
- `description`: max 1024 chars, WHAT it does AND WHEN to use it
- **Body under 500 lines** for optimal performance
- Write descriptions in **third person**
- Progressive disclosure: reference files loaded only when needed
- Keep references **one level deep** from SKILL.md

### Key Principles
1. **Concise is key**: Only add context Claude doesn't already have
2. **Skills are model-invoked**: Claude decides when to use them based on description
3. **Metadata pre-loaded at startup**: Only name/description, not full content
4. **SKILL.md read on-demand**: When skill becomes relevant to task

### Plugin Integration
From [Claude Code Plugins](https://code.claude.com/docs/en/plugins):
- Plugins can bundle Skills, Commands, Hooks, and MCP servers
- Skills in `skills/` directory auto-available when plugin installed
- Commands are user-invoked (`/command`), Skills are model-invoked

## References

- [Beads ARCHITECTURE.md](/Users/sbellity/code/gh/beads/docs/ARCHITECTURE.md)
- [Beads SKILL.md](/Users/sbellity/code/gh/beads/skills/beads/SKILL.md)
- [Beads prime.go](/Users/sbellity/code/gh/beads/cmd/bd/prime.go)
- [Claude Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
