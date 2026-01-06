---
date: 2026-01-06
started_at: 2026-01-06T10:00:00
kinen_session: 20260106-01-skill-learning-system
artifact_type: session_init
status: in-progress
aliases:
  - "skill-learning-system - Session Initialization"
tags:
  - space/nest
  - domain/architecture
  - type/technical-architecture
  - tech/typescript
summary: "Exploring skill learning system for llmchain - procedural memory capture from agent experience"
---

# Session: Skill Learning System for llmchain

## Session Goals

1. **Understand the gap**: Define what procedural memory/skill learning means in the context of llmchain's existing architecture
2. **Design architecture**: Create a coherent design for capturing, storing, and retrieving learned skills
3. **Define integration points**: How learned skills integrate with existing static skills and memory systems
4. **Prototype approach**: Outline concrete implementation steps for a first iteration

## Success Criteria

- [ ] Clear distinction between static skills vs learned skills
- [ ] Database schema for learned skills defined
- [ ] Skill learning flow documented (trigger → capture → store → retrieve)
- [ ] Integration with existing `@bird-ai/memory` and skill runtime designed
- [ ] UX considerations for skill confirmation and management addressed

## Methodology

This session uses **technical-architecture** methodology with round-based exploration.

## Context

### Problem Statement

llmchain has a solid two-tier skill system for **static skills** (defined at build time), but no mechanism for agents to **learn from experience** and capture procedural knowledge that persists across sessions.

### References

- [Letta Skills Documentation](https://docs.letta.com/letta-code/skills/) - Agent Skills standard for portable, on-demand knowledge
- [Agent Skill Learning paper](https://arxiv.org/pdf/2511.22074) - Research on procedural memory for AI agents

### Current State

**Existing skill system** (`packages/ai-tool/src/skills/`):
- Static skills defined in `definitions/` as SKILL.md files
- Two-tier: Tier 1 (metadata for discovery) + Tier 2 (full instructions on activation)
- Tool gating: skills unlock specific tools
- Reference resources: skills can include additional docs

**Existing memory system** (`packages/memory/`):
- Session context (cross-agent contributions)
- Session artifacts (created artifact registry)
- Scratchpad (per-agent working memory)
- Previous queries (session query history)

**Gap**: No procedural memory that persists beyond sessions.

## Key Documents

- [[rounds/01-foundation|Round 1: Foundation]]
- [[artifacts/technical-spec|Technical Specification]] (living document)

## Next Steps

Start with [[rounds/01-foundation|Round 1: Foundation]]
