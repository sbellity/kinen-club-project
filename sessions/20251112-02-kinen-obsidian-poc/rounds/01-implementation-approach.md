---
date: 2025-11-12
artifact_type: round_exploration
aliases:
  - "kinen-obsidian-poc - Implementation Approach"
  - "kinen-obsidian-poc - Round 1"
tags:
  - space/p
  - domain/code-implementation
  - type/iterative-design
  - tech/obsidian
  - tech/kinen
  - tech/fam
summary: "Initial exploration of implementation approach, architecture decisions, and development environment setup for Kinen Obsidian Plugin POC"
---

# Round 1: Implementation Approach & Architecture Decisions

> [!info] Building on
> This round builds on the comprehensive specifications from [[20251112-01-obsidian-integration/session-summary|Obsidian Integration Session]]

---

## Overview

Before diving into implementation, let's establish the foundation: development approach, architecture decisions, and environment setup. This round will clarify how we'll build the POC and what decisions we need to make upfront.

---

## 1. Development Approach & Priorities

**Q1.1: Implementation Strategy**

The POC spec outlines 3 phases, but we need to decide on the actual development approach:

**Option A: Sequential Phases**
- Complete Phase 1 fully before starting Phase 2
- Pros: Clear milestones, easier to test incrementally
- Cons: Slower to see end-to-end workflow

**Option B: Vertical Slices**
- Build minimal end-to-end workflow first (create session → generate round), then enhance
- Pros: Faster to validate core concept, can test workflow early
- Cons: May need refactoring as features are added

**Option C: Hybrid**
- Build minimal vertical slice first, then fill in phases systematically
- Pros: Early validation + structured development
- Cons: Requires careful planning

Which approach aligns better with your goals? Should we prioritize seeing the workflow work end-to-end quickly, or building solid foundations first?

> [!note] Answer
> Option C I guess. Although I am not sure I see concretely what it changes...

---

## 2. FAM Backend Architecture

**Q1.2: FAM Core Integration**

The POC spec assumes FAM Core exists. What's the current state?

- Does FAM Core already exist? If so, what's its current architecture?
- Do we need to build FAM Core from scratch for this POC?
- Should we build a minimal FAM Core just for this POC, or integrate with existing FAM?
- What's the relationship between FAM and kinen? Is FAM a general orchestration platform that kinen uses?

Understanding this will determine whether we're building:
- A) A standalone system (FAM + Plugin)
- B) An integration layer (Plugin → existing FAM)
- C) A kinen-specific backend (not general FAM)

> [!note] Answer
> Let's use ~/code/p/famkinen it's still WIP but should be close to useable. 
> Let's review famkinen public API and see what we need for the obsidian integration exactly and write QA/Integration tests if they are missing for those features in priority
> We also need to look into the store interface specifically and see how we can adapt it to use filesystem + in-memory sqlite database as discussed earlier. 
> This famkinen specific track can be performed in parallel (see docs/implementation folder in famkinen repo to see how we organize dev in tracks there, please feel free to add new tracks that we will pass to our implementer)



---

## 3. Storage Model Implementation

**Q1.3: Hybrid Storage Details**

The spec calls for hybrid storage (vault + SQLite + DuckDB). Let's clarify the implementation:

**Obsidian Vault (Primary)**:
- How do we detect the vault path? (Plugin provides it? Config file? Environment variable?)
- File watching: Should FAM watch for file changes, or only read on demand?
- Concurrency: How do we handle simultaneous edits (user + FAM)?

**In-Memory SQLite (Transient)**:
- What exactly goes in SQLite? (Agent state? Turn tracking? Session metadata?)
- Checkpointing: How often? On every operation or periodic?
- Rehydration: How do we rebuild SQLite state from vault files on startup?

**DuckDB (Queries)**:
- When do we build embeddings? (On file write? Background job? On-demand?)
- What embedding model? (OpenAI? Local? Configurable?)
- How do we keep embeddings in sync with vault changes?

Which of these needs the most clarification before we start coding?

> [!note] Answer
> Maybe we don't need duckdb... let's see how far we can go with just sqlite
> Config for storage (in our case obsidian vault path) should be defined in famkinen config

---

## 4. LLM Integration

**Q1.4: LLM Client & API**

Round generation requires LLM calls. What's the plan?

- Which LLM provider? (OpenAI? Anthropic? Local model?)
- How do we handle API keys? (Config file? Environment variables? Plugin settings?)
- What's the prompt structure for round generation?
- Do we need streaming responses for progress indicators?
- Error handling: What happens if LLM call fails? (Retry? Fallback? User notification?)

Should we start with a simple LLM integration and enhance later, or build a robust abstraction from the start?

> [!note] Answer
> See famkinen existing llm integrations and even more advances ACP backed coding agents integration
> Get familiar with famkinen architecture (also see design session here in our Obsidian vault that was the genesis of that famkinen implem)

---

## 5. Development Environment

**Q1.5: Setup & Tooling**

What's the development environment setup?

**FAM Backend**:
- Go version? (Latest stable?)
- Dependencies: Standard library only, or specific packages? (Which HTTP framework? SQLite library?)
- Testing: Unit tests? Integration tests? How do we test vault interactions?
- Build: Single binary? Or separate components?

**Obsidian Plugin**:
- Obsidian version? (Latest? Specific version?)
- Plugin template: Use official Obsidian plugin template?
- Build tool: TypeScript compiler? Webpack? Rollup?
- Development: Hot reload? How do we test plugin during development?

**Integration Testing**:
- How do we test plugin ↔ FAM communication?
- Mock Obsidian API for unit tests?
- End-to-end testing strategy?

What's the fastest way to get a development environment running?

> [!note] Answer
> Fam Backend, once again implem is here: ~/code/p/famkinen please get familiar with it we will need you to have a good understanding
> Obsidian, yes let's use latest version of course
> Plugin & tooling: I let you advise based on best practices. explore and let me know.


---

## 6. Project Structure

**Q1.6: Code Organization**

How should we organize the codebase?

**Option A: Monorepo**
```
kinen-obsidian-poc/
  fam-backend/     # Go code
  obsidian-plugin/ # TypeScript code
  docs/            # Documentation
  tests/           # Integration tests
```

**Option B: Separate Repos**
- `kinen-fam-backend` (Go)
- `kinen-obsidian-plugin` (TypeScript)

**Option C: Integrated**
- Single repo with both, but clear separation

Also:
- Where do session templates live? (In plugin? Separate templates folder?)
- Where do we store test vaults? (In repo? Separate location?)
- Documentation location? (In repo? Separate docs repo?)

What structure makes sense for this POC?

> [!note] Answer
> - famkinen repo is here ~/code/p/famkinen
> - obsidian plugin should be under ~/code/p/famkinen/plugins/obsidian
> - Session templates should be in $FAM_HOME I guess ? We can start with templates in repo also if you think it's easier to distribute and version maybe (for managed templates ?)
> - docs should be in famkinen repo

---

## 7. MVP Scope

**Q1.7: Minimum Viable POC**

What's the absolute minimum we need to validate the concept?

**Core Workflow**:
1. Create session (plugin → FAM → vault files)
2. Generate Round 1 (FAM → vault file with callouts)
3. User responds in callouts
4. Generate Round 2 (FAM reads Round 1, generates Round 2)

**Can we skip for MVP?**:
- Semantic search? (Can add later)
- Link suggestions? (Can add later)
- Dashboard generation? (Can add later)
- Decision extraction? (Can add later)
- Cross-session analysis? (Can add later)

What's the minimal feature set that proves the concept works?

> [!note] Answer
> Yes let's focus on core workflow for now

---

## 8. Testing Strategy

**Q1.8: Validation Approach**

How do we validate the POC works?

**Manual Testing**:
- Create test sessions
- Generate rounds
- Test workflow end-to-end
- Test with non-technical user (wife for creative writing)

**Automated Testing**:
- Unit tests for FAM backend?
- Unit tests for plugin?
- Integration tests for API?
- End-to-end tests for workflow?

**Success Metrics**:
- Can create session without leaving Obsidian? ✅
- Can generate rounds? ✅
- Callouts work correctly? ✅
- No context switching required? ✅

What's the testing approach that gives us confidence without slowing development?

> [!note] Answer
> I need you to be autonomous in implem and use full e2e tests autonomously wherever possible

---

## 9. Risk Areas

**Q1.9: Potential Challenges**

What are the biggest risks or unknowns?

**Technical Risks**:
- Obsidian plugin API limitations?
- File system concurrency issues?
- LLM API reliability?
- Performance with large vaults?

**UX Risks**:
- Callout editing experience?
- Plugin discoverability?
- Error messages and user feedback?
- Workflow complexity?

**Integration Risks**:
- Plugin ↔ FAM communication reliability?
- State synchronization?
- Error handling across boundaries?

Which risks should we address first, and which can we handle as they come up?

> [!note] Answer
> Let's reassess those once we have a POC going, too early to worry about those now

---

## 10. Next Steps

**Q1.10: Implementation Order**

Based on your answers above, what should we tackle first?

**Immediate Next Steps**:
1. Set up development environment?
2. Build minimal FAM backend?
3. Create basic plugin structure?
4. Implement session creation workflow?
5. Something else?

What's the first concrete task we should start with?

> [!note] Answer
> - Set dev env (where I can easily load and reload the plugin in my running Obsidian instance)
> - Setup skeleton for obsidian plugin in famkinen repo 
> - assess where we stand on actual famkinen implementation and see where we have gaps either in feature and/or in actual working implem

---

## Summary

This round establishes the foundation for implementation. After your responses, I'll:
- Create a concrete implementation plan based on your priorities
- Set up the development environment structure
- Begin Round 2 with detailed technical decisions
- Start building the first components

**Key Decisions Needed**:
- Development approach (sequential vs vertical slices)
- FAM Core integration strategy
- Storage model implementation details
- LLM provider and integration
- Project structure and organization
- MVP scope definition

---

**Ready for your responses!** 🚀

