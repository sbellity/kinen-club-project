---
date: 2025-12-14
started_at: 2025-12-14T10:29
artifact_type: session-init
kinen_session: 20251214-02-kinen-beads-architecture-comparison
status: active
current_round: 4
aliases:
  - Kinen-Beads Architecture Comparison
tags:
  - kinen
  - beads
  - architecture
  - comparative-analysis
summary: Comparative analysis of kinen and beads architectures to identify patterns and improvements for kinen
---

# Kinen-Beads Architecture Comparison

## Goal

Conduct a deep comparative analysis of kinen and beads architectures to:
1. Identify patterns from beads that can improve kinen
2. Understand architectural similarities and differences
3. Define concrete improvements for kinen based on learnings
4. **Design `skills/kinen/` structure based on beads patterns**
5. Create an action plan for implementing the best patterns

## Success Criteria

- [ ] Clear understanding of beads' three-layer data model and applicability to kinen
- [ ] Decision on CLI + Hooks vs MCP-first approach for kinen
- [ ] Skills folder structure defined for kinen
- [ ] Session handoff pattern adapted for kinen methodology
- [ ] **`skills/kinen/SKILL.md` drafted with methodology overview**
- [ ] **`references/` structure defined with key documents identified**
- [ ] Prioritized list of improvements with implementation plan

> **Note**: This session merges [[20251214-01-kinen-methodology-skills]] which focused on Claude skills. That session is now archived.

## Context

### Background

We've been developing kinen-go as tooling for the kinen methodology. Recently, we explored the beads codebase (a mature issue tracker for AI-supervised workflows) and identified several architectural patterns worth adopting.

### Related Sessions

- [[20251213-01-kinen-go-mcp-cursor-integration]] - MCP integration work in progress
- [[20251214-01-kinen-methodology-skills]] - **MERGED INTO THIS SESSION**
- [[20251206-01-kinen-beads-devx]] - Earlier exploration of kinen + beads integration

### Key Resources

- Beads codebase: `/Users/sbellity/code/gh/beads/`
- Kinen-go codebase: `/Users/sbellity/code/p/kinen-go/`
- Beads AGENTS.md, SKILL.md, ARCHITECTURE.md
- Beads MCP implementation: `integrations/beads-mcp/`

## Key Questions for This Session

### Architecture (Round 1)
1. **Data Model**: Should kinen adopt beads' three-layer model (SQLite + JSONL + Git)?
2. **Context Injection**: Should kinen implement `kinen prime` command for hooks?
3. **Session Handoff**: How do we adapt beads' notes pattern for kinen rounds?
4. **Daemon Design**: What can we learn from beads' per-workspace daemon?
5. **MCP vs CLI**: What's the right balance for kinen's use case?

### Skills Structure (Round 1 continued)
6. **Skills Content**: What should `skills/kinen/SKILL.md` contain?
7. **References Structure**: What `references/` docs are needed?
8. **Skills vs Prime**: How do skills relate to `kinen prime`?
9. **Skill Granularity**: One comprehensive skill or multiple focused skills?

## Session Type

Architecture / Comparative Analysis

## Living Document

→ [[artifacts/architecture-comparison.md]]
