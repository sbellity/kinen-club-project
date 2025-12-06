# Round 2: Daemon Architecture & Integration

## Previous Round Summary

From Round 1 and the imported **20251203-01-kinen-resources-and-indexing** session:

- **Mental model**: kinen = design-time (uncertain, exploring), beads = execution-time (clear, executing)
- **Daemon confirmed**: Needed for file watching, indexing, memory consolidation, coordination
- **Technology stack**: LanceDB + `all-MiniLM-L6-v2` (local embeddings)
- **Index location**: `~/.local/share/kinen/indices/{origin-hash}/`
- **Hybrid search**: Full-text + semantic with situated chunks

## This Round Focus

- Daemon architecture and lifecycle
- VSCode extension design (unified or separate?)
- Integration points between kinen and beads
- Default setup prompts and rules

---

## Questions

### Q2.1: Daemon Scope — kinen-only or Shared?

**Context**: beads already has daemon capabilities. Should the kinen daemon be independent or shared?

**Option A: Separate daemons**
```
kinen-daemon          beads-daemon
├── File watching     ├── DB sync
├── Indexing          ├── JSONL export
├── Memory            └── Git hooks
└── Search
```
- **Pros**: Clear separation, independent evolution, simpler to reason about
- **Cons**: Two processes, potential coordination issues, more memory

**Option B: Unified daemon**
```
dev-daemon (shared)
├── kinen: indexing, memory, search
├── beads: sync, export
└── shared: file watching, coordination
```
- **Pros**: Single process, shared file watching, unified coordination
- **Cons**: Coupling between systems, more complex codebase

**Option C: kinen daemon with beads hooks**
```
kinen-daemon
├── Core: indexing, memory, search
├── Extension point: on_session_end → suggest beads issues
└── beads remains independent CLI
```
- **Pros**: kinen gains memory, beads stays simple, loose coupling
- **Cons**: beads doesn't benefit from shared daemon

**Questions**:
1. How tightly coupled should kinen and beads be?
2. Is reducing from two processes to one worth the complexity?
3. Should the daemon be a shared infrastructure layer?

---

### Q2.2: Daemon Lifecycle

**Context**: How does the daemon start, run, and stop?

**Option A: Manual start (like databases)**
```bash
kinen daemon start    # Explicit start
kinen daemon stop     # Explicit stop
kinen daemon status   # Check if running
```
- User controls when daemon runs
- Must remember to start it

**Option B: Auto-start on first use**
```bash
kinen search "auth"   # Auto-starts daemon if not running
# Daemon stays running in background
```
- Transparent to user
- May surprise users ("what's this process?")

**Option C: On-demand with idle shutdown**
```bash
kinen search "auth"   # Starts daemon
# Daemon shuts down after 10 min idle
```
- Balance of convenience and resource usage
- Complexity in idle detection

**Option D: Socket activation (systemd-style)**
- Daemon starts when socket is accessed
- OS-level integration
- Most complex, most elegant

**Questions**:
1. What's your preference for daemon lifecycle?
2. Should there be a "server mode" for continuous operation?
3. How important is the daemon being invisible to users?

---

### Q2.3: Index Update Strategy

**Context**: When and how should the index be updated?

**Triggers**:
| Event | Action |
|-------|--------|
| File created | Index new document |
| File modified | Re-index changed chunks (delta) |
| File deleted | Remove from index |
| Session closed | Consolidate memory |
| Explicit rebuild | Full re-index |

**Delta indexing** (from ck):
- Hash each chunk: `blake3(content + path + chunk_index)`
- Only re-embed changed chunks
- Significant speedup for large spaces

**Debouncing**:
- Don't index on every keystroke
- Wait for file save + N seconds idle
- Or batch updates every M seconds

**Questions**:
1. How aggressive should indexing be? (real-time vs batched)
2. Should there be a "pause indexing" command for intensive work?
3. What's an acceptable delay between file change and searchability?

---

### Q2.4: Memory Consolidation Design

**Context**: This is the unique value-add — turning session history into retrievable memory.

**What gets consolidated**:
1. **Decisions** — Explicit choices made in sessions
2. **Patterns** — Recurring themes across sessions ("user prefers X over Y")
3. **Insights** — Synthesized learnings ("Auth is always complex in this codebase")

**When consolidation runs**:
- **Session close**: Extract decisions from all rounds
- **Periodic (daily)**: Cross-session pattern detection
- **On-demand**: User requests synthesis

**Consolidation pipeline**:
```
Rounds → Extract decisions → Cluster similar → Generate insights
                                    ↓
                            Store as MemoryEntry
                                    ↓
                            Embed for semantic search
```

**Questions**:
1. Should consolidation be automatic or user-triggered?
2. How much should the AI synthesize vs just extract verbatim?
3. Should users be able to edit/delete memory entries?
4. How do you handle conflicting decisions across sessions?

---

### Q2.5: VSCode Extension Architecture

**Context**: There's an existing kinen VSCode extension. How should it evolve?

**Current state** (vscode-extension/):
- Session tree view
- Round navigation
- Decision tracking
- Artifacts view

**Option A: Expand kinen extension**
- Add beads integration as a panel
- Single extension, two systems
- Shared state management

**Option B: Separate extensions, shared backend**
- kinen extension for sessions
- beads extension for issues
- Both talk to kinen-daemon for coordination

**Option C: New unified "Dev Workspace" extension**
- Fresh start with combined UX
- Sessions and issues side-by-side
- Semantic search across both

**Proposed UI structure** (Option A or C):

```
┌─────────────────────────────────────────────┐
│ Activity Bar: 🎯 Kinen                       │
├─────────────────────────────────────────────┤
│ ▼ CURRENT SESSION                           │
│   20251206-01-kinen-beads-devx              │
│   ├─ Status: In Progress                    │
│   ├─ Rounds: 2/6                            │
│   └─ [New Round] [Summarize]                │
│                                             │
│ ▼ RELATED CONTEXT (semantic)                │
│   └─ 📎 20251203-01-resources-indexing      │
│      "LanceDB decision, hybrid search..."   │
│                                             │
│ ▼ READY ISSUES (beads)                      │
│   ├─ 🟢 kinen-abc: High priority            │
│   └─ 🟡 kinen-def: Medium priority          │
│                                             │
│ ▼ SESSION HISTORY                           │
│   ├─ 20251203-01-resources...               │
│   └─ 20251201-02-auth-design                │
└─────────────────────────────────────────────┘
```

**Questions**:
1. Expand existing extension or start fresh?
2. How prominent should beads integration be?
3. Should semantic search be in sidebar or command palette?
4. What's the most important action to optimize for?

---

### Q2.6: Default Setup Prompts

**Context**: When running `kinen setup` in a new project, what should be created?

**Current**: Creates `.cursorrules` and/or `CLAUDE.md`

**Proposed default files**:

**1. `.cursorrules` (or `.kinen/rules.md`)**
```markdown
# Kinen + Beads Workflow

This project uses:
- **kinen** for design sessions (structured thinking)
- **beads** (bd) for issue tracking

## When to Use Which

| Situation | Tool |
|-----------|------|
| Uncertain, need to explore | kinen session |
| Clear task, ready to execute | beads issue |
| Found work during execution | beads discovered-from |

## Commands

- `/kinen [topic]` — Start design session
- `bd ready` — See available work
- `bd create "title"` — Track new work

## Semantic Recall

The AI can search past sessions:
- "How did we handle auth before?"
- "What patterns have we established?"

[Full methodology](https://kinen.club/methodology.md)
```

**2. `AGENTS.md`**
- Combined instructions for AI agents
- beads workflow (already exists)
- kinen methodology reference
- Project-specific context

**3. `.kinen/config.yml`**
```yaml
space:
  name: my-project
  type: technical  # or creative, research

index:
  auto_update: true
  embedding_model: all-MiniLM-L6-v2

consolidation:
  on_session_close: true
  extract_decisions: true
```

**Questions**:
1. Should `kinen setup` auto-detect project type?
2. Should it also run `bd init` if beads isn't set up?
3. How much should be pre-filled vs left as templates?
4. Should there be different templates for different project types?

---

### Q2.7: kinen ↔ beads Integration Points

**Context**: Where exactly do the two systems touch?

**Integration points**:

| Point | Direction | Data Flow |
|-------|-----------|-----------|
| Session → Issues | kinen → beads | Decisions become trackable work |
| Issue → Session | beads → kinen | Complex issue triggers design session |
| Context sharing | bidirectional | AI sees both session history and issue state |
| Status bar | display | Combined "current session + ready issues" |

**Automatic suggestions**:
```
Session summary includes:
┌─────────────────────────────────────────────┐
│ 📋 Suggested Issues                          │
├─────────────────────────────────────────────┤
│ From Decision D2.3:                         │
│   "Implement LanceDB integration"           │
│   [Create Issue] [Skip]                     │
│                                             │
│ From Decision D2.5:                         │
│   "Add file watching to daemon"             │
│   [Create Issue] [Skip]                     │
└─────────────────────────────────────────────┘
```

**Issue back-reference**:
```bash
bd show kinen-abc
# Shows: Source: session/20251206-01-auth, Decision D3.2
```

**Questions**:
1. How automatic should issue creation be?
2. Should issues always link back to source sessions?
3. Should "complex issue" detection suggest starting a kinen session?
4. How do you envision using both tools in a typical workday?

---

### Q2.8: Search UX

**Context**: Semantic search is the killer feature for memory. How should it feel?

**CLI interface** (inspired by ck):
```bash
# Basic search
kinen search "authentication flow"

# With filters
kinen search "auth" --type rounds --session auth-redesign

# Semantic only
kinen search "how we handle user login" --semantic

# Show scores
kinen search "deployment" --scores

# JSON output for scripting
kinen search "api design" --json
```

**MCP tool**:
```typescript
kinen_search({
  query: "authentication",
  mode: "hybrid",
  top_k: 10,
  context_chunks: 2,  // before + after
})
```

**VSCode**:
- `Cmd+Shift+K` → Kinen search palette
- Type query, see results with previews
- Click to open source document

**Questions**:
1. What search UX do you prefer? (CLI, VSCode, both?)
2. Should search results show relevance scores by default?
3. How many context chunks (before/after) by default?
4. Should there be a "search history" feature?

---

## Summary

This round explores:

1. **Daemon scope** — Shared with beads or independent?
2. **Lifecycle** — Manual, auto-start, or on-demand?
3. **Index updates** — Real-time vs batched, delta strategy
4. **Memory consolidation** — Automatic vs triggered, edit capability
5. **VSCode** — Expand existing or build new unified extension?
6. **Default setup** — What prompts and config to create
7. **Integration** — How kinen and beads connect
8. **Search UX** — CLI, MCP, VSCode palette

**Key architectural decisions needed**:
- Daemon independence vs coupling
- Level of automation in consolidation
- VSCode strategy

**Next round preview**: Based on your responses, we'll dive into implementation details — specific code structure, API design, and phased rollout plan.

---

*Please respond to the questions that matter most. Your answers will shape the implementation.*

