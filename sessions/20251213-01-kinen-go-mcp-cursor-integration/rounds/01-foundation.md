---
date: 2025-12-13
started_at: 2025-12-13T17:26:03
artifact_type: round
kinen_session: 20251213-01-kinen-go-mcp-cursor-integration
kinen_round: 1
status: in-progress
aliases:
  - "kinen-go-mcp-cursor-integration - Foundation"
  - "kinen-go-mcp-cursor-integration - Round 1"
tags:
  - space/work
  - domain/kinen
  - domain/devx
  - type/iterative-design
  - tech/go
  - tech/mcp
summary: "Clarify scope, options, and data flow for MCP-first sessions and memory recall"
---

# Round 01: Foundation — MCP-First Sessions + Memory Recall

> [!info] Building on
> Related prior work:
> - [[20251203-01-kinen-resources-and-indexing|Resources & Indexing]] (index design + MCP tools)
> - [[20251208-01-memory-architecture-evolution|Memory Architecture Evolution]] (multi-substrate memory thinking)
> - [[20251207-02-multi-agent-coordination|Multi-Agent Coordination]] (context drift + retrieval discipline)

## Previous Round Summary

N/A — this is the foundation round.

## This Round Focus

- Decide the **minimum viable MCP surface** for Cursor
- Define the **end-to-end data flow** (files → memory → retrieval → new rounds)
- Choose between a few implementation **options with clear tradeoffs**
- Produce a **clear, phased implementation plan** in `artifacts/implementation-plan.md`

---

## Questions

### Q1.1: What is the “v1” scope for Cursor integration?

**Context**: We can get value quickly by making MCP a *read surface* first, or go all-in with write ops.

- [ ] **Option A: Read-only sessions + memory search (recommended v1)**
  - MCP: list/get sessions, get rounds/artifacts, search memory
  - Write operations stay manual (Obsidian / CLI)
  - **Pros**: Low risk, small surface area, fast to stabilize
  - **Cons**: Not yet “sessions fully driven from Cursor”

- [ ] **Option B: Read + create session/round (MVP write)**
  - Add MCP tools to create new session folder + Round 1 scaffold
  - **Pros**: Feels native in Cursor; less manual friction
  - **Cons**: Needs more validation/guardrails (filesystem safety, naming)

- [x] **Option C: Full CRUD (ambitious)** ✅ 2025-12-13
  - Update artifacts, append round answers, etc.
  - **Pros**: True Cursor-native workflow
  - **Cons**: Bigger correctness surface; more failure modes

> [!note] Answer
> I think we are actually not too far. The real value of the MCP tool is anyway to actualyl work on sessions and for that we need to the wholt thing.

---

### Q1.2: How should Cursor start the MCP server?

**Context**: “It works when I run it” isn’t enough—Cursor needs a stable, deterministic invocation.

- [x] **Option A: `kinen mcp` (single canonical entrypoint)** ✅ 2025-12-13
  - Cursor config calls `kinen mcp`
  - **Pros**: Great DX; one command; aligns with user expectation
  - **Cons**: Requires wiring/refactor in kinen-go CLI

- [ ] **Option B: `go run ./cmd/kinen/mcp` (dev-only)**
  - **Pros**: Immediate for hacking
  - **Cons**: Not stable for daily use; depends on Go toolchain + repo layout

- [ ] **Option C: `kinen-mcp` separate binary**
  - **Pros**: Minimal coupling; explicit
  - **Cons**: More distribution complexity

> [!note] Answer
>

---

### Q1.3: What is the canonical “session store”?

**Context**: Session methods should return real data, not stubs. We need the source of truth.

- [x] **Option A: Filesystem (Obsidian vault) is source of truth** ✅ 2025-12-13
  - kinen-go reads (and later writes) the `sessions/` directory
  - **Pros**: Transparent, git-friendly, matches existing methodology
  - **Cons**: Needs careful path validation + conventions enforcement

- [ ] **Option B: DB-backed session store (future)**
  - Files become view / export
  - **Pros**: Strong queries + consistency
  - **Cons**: Big migration; not needed for v1

> [!note] Answer
>Filesystem first. We use DB for indices.

---

### Q1.4: What should be the unit of “memory ingestion” for past sessions?

**Context**: kinen-go memory currently ingests “messages” and extracts facts. Session markdown isn’t messages by default.

- [ ] **Option A: Ingest at file granularity**
  - Each round/artifact becomes a “document message” payload
  - **Pros**: Simple; preserves context; fewer ingestion events
  - **Cons**: Fact extraction may be noisier on long docs

- [x] **Option B: Ingest at section/question granularity** ✅ 2025-12-13
  - Each `Qn.m` and its `Answer` block becomes its own record
  - **Pros**: Higher precision recall; aligns with decision structure
  - **Cons**: More implementation work; more objects to index

- [x] **Option C: Hybrid** ✅ 2025-12-13
  - Round summary + each answered question become records
  - **Pros**: Balance of precision and cost
  - **Cons**: Still more work than A

> [!note] Answer
>

---

### Q1.5: How should recall be scoped when starting a new session/round?

**Context**: Unscoped recall becomes noise. Scoped recall misses key connections. We need a policy.

- [ ] **Option A: Tag-scoped** (domain/type/topic tags drive recall)
- [ ] **Option B: Space-scoped** (current space only)
- [ ] **Option C: Time-scoped** (last N days/weeks)
- [ ] **Option D: Query + curated short list** (manual selection)

> [!note] Answer
>I don't know yet, need to use to understand what makes more sense. We have a bunch of sessions now I would like to leverage them. Maybe we should really embrace more the Obsidian philosophy and also surface connected memories visually, not just on LLM context

---

### Q1.6: What does “good recall output” look like inside kinen rounds?

**Context**: Recall must be *actionable*, not a dump.

- [ ] **Option A: “Related Session” callouts with 3 bullets each**
  - 1 insight, 1 decision, 1 caution

- [ ] **Option B: A “retrieved context” appendix section**
  - Keeps round clean, but still recorded

- [ ] **Option C: Autolink only**
  - Just insert links to relevant sessions without synthesis

> [!note] Answer
>I don't know yet, lets' try to explore this together by leveraging past sessions and adjust.

---

### Q1.7: What’s the minimal “MCP tool surface” we need?

**Context**: We already have proto RPCs for sessions + memory, but we should explicitly choose the minimum set to stabilize.

**Candidate v1 set**:
- Health
- ListSessions
- GetSession
- ListRounds
- GetRound
- GetArtifact
- Search

**Questions**:
1. Anything missing for your daily workflow?
2. Anything we should drop to reduce scope?

> [!note] Answer
>I liked also the idea of assistant doing auto commit after each round
>Also we need a command to finalize a round and create the summary.
>Check our old typescript implem here it has a few nice ideas /Users/sbellity/code/kinen-club/kinen



---

### Q1.8: Where should “indexing sessions into memory” live?

**Context**: We can do indexing via CLI, via MCP, or as a background daemon. Each has different DX.

- [ ] **Option A: CLI command (e.g. `kinen cli index sessions`)**
  - **Pros**: Simple to build + test
  - **Cons**: Not as “Cursor-native”

- [ ] **Option B: MCP tool (e.g. `IndexSpaceSessions`)**
  - **Pros**: Cursor can trigger it; consistent interface
  - **Cons**: Requires adding RPC/tool + regen

- [ ] **Option C: Watcher/daemon (auto-index)**
  - **Pros**: Always fresh
  - **Cons**: More moving parts; harder to debug

> [!note] Answer
>ALL ! I mean CLI and MCP should already expose the exact same commands and features, no? We already have the first draft of a kinen daemon as well that would orchstrate and perform indexing in the background automatically. Cli and MCP would be responsible for lanching the daemin if it's not running I guess ?

---

### Q1.9: What is the acceptance test for v1?

**Context**: We need a concrete end-to-end test that proves this is real (not stubs, not mocks).

Proposed v1 acceptance test:
1. Cursor starts MCP server.
2. Tool call lists sessions from the vault.
3. Tool call fetches a session and reads a specific round.
4. Index (manual or tool) ingests that round into memory.
5. Search returns a relevant snippet when querying for a concept mentioned in that round.

> [!note] Answer
>ok

---

### Q1.10: What should we explicitly defer to v2?

**Context**: Deferring intentionally prevents scope creep.

Candidates to defer:
- Session/round creation via MCP
- Updating artifacts via MCP
- Auto-index daemon
- Cross-vault recall
- Advanced ranking/boosting policies for recall

> [!note] Answer
>- Auto-index daemon (although I think we are almost there already)
>- Cross vault recall is not really a thing for now
>- Advanced ranking/boosting policies for recall - I agree let's do this later, although LanceDB should already do a lot of the heavylifting ?

---

## Summary

After your answers, I will:
- extract decisions into `artifacts/implementation-plan.md`
- propose the Phase A/B/C implementation steps with “done” criteria for each
- identify the smallest set of code changes required in kinen-go to make MCP + sessions + recall real

---

*Please respond inside the `> [!note] Answer` callouts. Skip questions that don’t resonate.*
