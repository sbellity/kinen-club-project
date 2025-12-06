---
created: 2025-12-06T11:42:48.412Z
completed: 2025-12-06
type: architecture
status: complete
summary: "Designed kinen+beads DevX, discovered kinen-go maturity, produced implementation tracks"
---

# Session: kinen-beads-devx

## Goal

Design a cohesive developer experience combining **kinen** (structured thinking methodology) and **beads** (issue tracking) into a seamless workflow. Define clear responsibilities, collaboration patterns, and tooling integration.

## Success Criteria

- [x] Clear separation of responsibilities between kinen and beads
- [x] Defined handoff points between design (kinen) → execution (beads)
- [x] VSCode extension design that surfaces both systems naturally
- [x] Default prompts/rules for setting up a kinen space in any project
- [x] Documentation for the combined workflow

> [!note] Outcome
> All criteria met. Additionally: discovered kinen-go maturity (9 tracks complete), produced 10 implementation track handover prompts, and set up 54 beads issues for implementation tracking.

## Constraints

- Both tools already exist and work independently
- MCP integration available for both (kinen MCP, beads MCP)
- VSCode extension exists for kinen (needs improvement)
- Must feel like one coherent system, not two bolted together

## Key Questions

1. What is the natural boundary between design work (kinen) and execution tracking (beads)?
2. How should sessions create/link to issues, and vice versa?
3. What does the ideal VSCode experience look like?
4. What prompts/rules should be included by default when setting up a space?

## Notes

- kinen: methodology for structured thinking through rounds
- beads (bd): Git-backed issue tracker with dependency awareness
- Both have MCP servers for AI assistant integration
- Current setup: kinen space at ~/code/kinen, beads at same location
