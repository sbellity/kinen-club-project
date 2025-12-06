# Round 3: Concrete Shipping Plan

## Previous Round Decisions

From your answers to Rounds 1 & 2:

| Decision | Detail |
|----------|--------|
| **kinen purpose** | User↔AI alignment on design & architecture |
| **beads purpose** | Implementation tracking for agents |
| **Daemon** | Transparent, auto-start, handles indexing + memory consolidation |
| **VSCode** | Expand existing extension: round editor + semantic search |
| **beads integration** | Loose coupling via prompts only — no direct code integration |
| **Search** | CLI + MCP + VSCode, batched indexing, hybrid (FTS + semantic) |
| **Memory consolidation** | On session close + periodic, AI-assisted synthesis |
| **Setup** | Auto-detect project type, start with technical, design for expansion |

---

## Decisions Made in This Round

### D3.1: Files as Truth Architecture

> [!note] Decision
> Primary storage = filesystem (Git-versioned markdown). LanceDB = derived index (ephemeral, rebuildable, NOT versioned).

**Rationale**: Clone repo → rebuild index → fully functional. No binary blobs in Git.

### D3.2: LanceDB for Indexing

> [!note] Decision
> Use LanceDB for hybrid search (FTS + vector) in one embedded database.

**Rationale**: Simpler than SQLite + extensions, native TypeScript SDK, built-in Tantivy for FTS.

### D3.3: Obsidian as Progressive Enhancement

> [!note] Decision
> kinen works standalone with standard markdown. Obsidian users get bonus features (graph view, backlinks, Dataview) for free — no Obsidian dependency.

**Rationale**: Same files work in vim, VSCode, Obsidian. No vendor lock-in.

### D3.4: Two Modes Workflow

> [!note] Decision
> - **Obsidian (mobile + desktop)**: Reading, brainstorming, creative sessions
> - **VSCode/Cursor**: Technical sessions with code, agent-driven work, beads orchestration

**Rationale**: Use the right tool for the job. Same files, synced everywhere.

### D3.5: kinen Builds Own Graph + Query

> [!note] Decision
> kinen indexes wiki-links → edges table, frontmatter → metadata table. Provides CLI/MCP for backlinks, related, queries. Obsidian provides visual alternatives.

**Rationale**: Works without Obsidian. Semantic search is ours (Obsidian doesn't have it).

### D3.6: Consolidation Writes to Files

> [!note] Decision
> Memory consolidation outputs markdown files with wiki-links and structured frontmatter — NOT just database entries. Index is derived from files.

**Rationale**: Files ARE the knowledge graph. Obsidian shows backlinks from same wiki-links.

### D3.7: Embedding Model

> [!note] Decision
> Start with `all-MiniLM-L6-v2` via `@xenova/transformers`. Configurable for future upgrade.

**Rationale**: Fast, good quality, small (23MB), local inference.

### D3.8: Chunking Strategy

> [!note] Decision
> Semantic chunking for kinen content: 1 chunk per question in rounds, 1 chunk per section in artifacts. Fall back to fixed-size for large sections.

**Rationale**: Preserves kinen structure, keeps Q&A pairs together.

---

## Final Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOURCE OF TRUTH                              │
│                 (Git-versioned markdown)                        │
├─────────────────────────────────────────────────────────────────┤
│  sessions/                                                      │
│  ├── 20251206-01-devx/                                         │
│  │   ├── init.md              ← frontmatter + wiki-links       │
│  │   ├── rounds/*.md          ← questions with [[links]]       │
│  │   ├── artifacts/*.md       ← specs with [[links]]           │
│  │   └── memories/*.md        ← extracted decisions/insights   │
│  └── resources/                                                 │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ daemon watches + indexes
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    KINEN DAEMON                                 │
│              (TypeScript, auto-start, background)               │
├─────────────────────────────────────────────────────────────────┤
│  File Watcher → Parse wiki-links → Index to LanceDB            │
│                                                                 │
│  LanceDB Tables:                                                │
│  ├── chunks (content + embeddings)  → semantic search          │
│  ├── edges (wiki-link graph)        → backlinks, related       │
│  └── metadata (frontmatter)         → structured queries       │
│                                                                 │
│  HTTP API (localhost:8080):                                     │
│  ├── POST /search          → hybrid search                     │
│  ├── GET /backlinks/:path  → what links to this                │
│  ├── GET /related/:path    → semantically similar              │
│  └── POST /query           → frontmatter queries               │
└─────────────────────────────────────────────────────────────────┘
              │                              │
       CLI / MCP                      Obsidian Plugin (optional)
              │                              │
     kinen search                     Uses same API
     kinen backlinks                  + Native visual:
     kinen related                    • Graph View
     kinen query                      • Backlinks panel
```

---

## Implementation Plan

### Phase 1: Index & Search (Week 1)

**Goal**: `kinen search` working via CLI and MCP

| Task | Description | Est |
|------|-------------|-----|
| **LanceDB setup** | Connect, create tables, basic CRUD | 2h |
| **Wiki-link parser** | Extract [[links]] from markdown | 2h |
| **Frontmatter parser** | Extract YAML metadata | 1h |
| **Chunker** | Semantic chunking for kinen files | 3h |
| **Embedder** | @xenova/transformers integration | 2h |
| **Index builder** | Full rebuild from files | 3h |
| **CLI search** | `kinen search` command | 2h |
| **MCP tool** | `kinen_search` MCP tool | 2h |

**Deliverables**:
- `kinen index build` — rebuild index
- `kinen index status` — show stats
- `kinen search "query"` — hybrid search
- `kinen_search` MCP tool

### Phase 2: Graph & Queries (Week 2)

**Goal**: Backlinks, related sessions, structured queries

| Task | Description | Est |
|------|-------------|-----|
| **Edges table** | Store wiki-link relationships | 2h |
| **Backlinks** | Query edges table | 2h |
| **Related** | Semantic similarity on chunks | 2h |
| **Query** | Frontmatter queries | 2h |
| **CLI commands** | backlinks, related, query | 3h |
| **MCP tools** | kinen_backlinks, kinen_related | 2h |

**Deliverables**:
- `kinen backlinks session-name`
- `kinen related session-name`
- `kinen query "type=decision AND confidence>0.8"`

### Phase 3: Daemon & File Watching (Week 2-3)

**Goal**: Background indexing, auto-start

| Task | Description | Est |
|------|-------------|-----|
| **File watcher** | Watch sessions/ for changes | 3h |
| **Delta indexing** | Only re-index changed files | 3h |
| **Daemon lifecycle** | Auto-start, idle shutdown | 2h |
| **HTTP API** | Expose search/backlinks/etc | 3h |
| **CLI integration** | CLI talks to daemon | 2h |

**Deliverables**:
- Daemon auto-starts on first `kinen search`
- Indexes updated within seconds of file save
- HTTP API for external clients

### Phase 4: Memory Consolidation (Week 3)

**Goal**: Extract decisions to files with wiki-links

| Task | Description | Est |
|------|-------------|-----|
| **Decision extractor** | Parse rounds for decisions | 3h |
| **Memory file writer** | Write markdown with frontmatter + links | 2h |
| **Session close hook** | Trigger consolidation | 2h |
| **kinen recall** | Search memories specifically | 2h |

**Deliverables**:
- `kinen summarize` — extract decisions from session
- `memories/` folder with decision files
- Decisions have wiki-links to source rounds

### Phase 5: Obsidian Compatibility (Week 3-4)

**Goal**: kinen files work great in Obsidian

| Task | Description | Est |
|------|-------------|-----|
| **Wiki-links in output** | All generated content uses [[links]] | 2h |
| **Rich frontmatter** | artifact_type, tags, related | 2h |
| **Callout format** | Use `> [!note]` for answers | 1h |
| **`kinen init --obsidian`** | Optional .obsidian/ setup | 2h |
| **Dashboard templates** | Dataview queries as markdown | 2h |

**Deliverables**:
- Open any kinen space in Obsidian → graph/backlinks work
- `kinen init --obsidian` for power users

### Phase 6: VSCode Extension (Week 4)

**Goal**: Search + improved round editor

| Task | Description | Est |
|------|-------------|-----|
| **Search palette** | Quick search UI | 4h |
| **Results preview** | Show search results inline | 2h |
| **Status bar** | Index status, current session | 2h |
| **Round editor** | Better Q&A highlighting | 3h |

---

## beads Issues to Create

```bash
# Phase 1: Index & Search
bd create "LanceDB integration and table setup" -t feature -p 1
bd create "Wiki-link parser for markdown files" -t task -p 1
bd create "Semantic chunker for kinen sessions" -t task -p 1
bd create "Embeddings via @xenova/transformers" -t task -p 1
bd create "CLI kinen search command" -t feature -p 1
bd create "MCP kinen_search tool" -t feature -p 1

# Phase 2: Graph & Queries
bd create "Wiki-link edges table and backlinks" -t feature -p 2
bd create "Semantic similarity for related sessions" -t feature -p 2
bd create "Frontmatter query support" -t feature -p 2

# Phase 3: Daemon
bd create "File watcher for sessions directory" -t feature -p 2
bd create "Delta indexing for changed files" -t task -p 2
bd create "Daemon auto-start and lifecycle" -t feature -p 2

# Phase 4: Memory Consolidation
bd create "Decision extraction from rounds" -t feature -p 2
bd create "Memory file writer with wiki-links" -t task -p 2

# Phase 5: Obsidian
bd create "Wiki-links in all generated content" -t task -p 3
bd create "kinen init --obsidian flag" -t feature -p 3

# Phase 6: VSCode
bd create "VSCode search palette" -t feature -p 3
bd create "VSCode round editor improvements" -t feature -p 3
```

---

## Success Criteria

### MVP (End of Week 2)
- [ ] `kinen search "query"` returns relevant results
- [ ] `kinen backlinks session` shows what links to it
- [ ] MCP tools work for AI agents
- [ ] Index rebuilds from files in < 30s for 100 sessions

### Full (End of Week 4)
- [ ] Daemon auto-starts, indexes on file change
- [ ] Memory consolidation extracts decisions to files
- [ ] Obsidian users see graph/backlinks without config
- [ ] VSCode search palette works

---

## Parallelization Strategy

### Dependency Graph

```
                    ┌─────────────────┐
                    │   Week 1 Start  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ WORKSTREAM A  │   │ WORKSTREAM B  │   │ WORKSTREAM C  │
│   Indexing    │   │   Interfaces  │   │   Obsidian    │
│   (backend)   │   │   (CLI/MCP)   │   │   (files)     │
└───────┬───────┘   └───────┬───────┘   └───────────────┘
        │                   │                    │
        │                   │                    │ Independent!
        │                   │                    ▼
        │                   │           Wiki-links in output
        │                   │           Frontmatter schemas
        │                   │           Callout format
        │                   │           --obsidian flag
        │                   │
        │                   │ Can mock index
        │                   ▼
        │           CLI command structure
        │           MCP tool definitions
        │           HTTP API design
        │                   │
        │                   │
        ▼                   │
LanceDB setup              │
Parsers (parallel):        │
├── Wiki-link parser       │
├── Frontmatter parser     │
└── Chunker                │
Embedder                   │
        │                   │
        └───────┬───────────┘
                │
                ▼
        Index builder
        (needs all above)
                │
                ▼
        CLI + MCP integration
        (real backend)
                │
                ▼
        ┌───────────────┐
        │   Week 2-3    │
        └───────┬───────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
   Daemon          VSCode Extension
   (file watch)    (can start on UI)
        │               │
        └───────┬───────┘
                │
                ▼
        Memory Consolidation
        (needs daemon + parsers)
```

### Seven Parallel Workstreams

| Workstream | Focus | Language | Can Start | Blocks On |
|------------|-------|----------|-----------|-----------|
| **A: Indexing Core** | LanceDB, embedder, index builder | Go | Day 1 | Nothing |
| **B: Interfaces** | CLI, MCP tools, HTTP client | TypeScript | Day 1 | HTTP API (F) |
| **C: Obsidian** | File formats, wiki-links, frontmatter | Markdown | Day 1 | Nothing |
| **D: Memory** | Decision extraction, consolidation | Go | Day 1 | A complete |
| **E: Resources** | PDF parsing, web clips | Go | Day 1 | Merges into A |
| **F: Go Daemon** | HTTP API, distribution, Mac app | Go | Day 1 | Nothing |
| **G: VSCode Extension** | Test infra, bug fixes, search integration | TypeScript | Day 1 | F.2 for search |

### Workstream A: Indexing Backend

**Can parallelize internally:**

```
Agent 1                    Agent 2                    Agent 3
─────────                  ─────────                  ─────────
LanceDB setup              Wiki-link parser           Chunker
Table schemas              Regex + AST                Markdown-aware
CRUD operations            Extract [[links]]          Split by headers
                           ↓                          ↓
                           ├──────────────────────────┤
                           │      Index Builder       │
                           │   (needs all 3 above)    │
                           └──────────────────────────┘
```

**Tasks (can run in parallel):**
- [ ] LanceDB connection + table setup
- [ ] Wiki-link parser (regex extraction)
- [ ] Frontmatter parser (yaml)
- [ ] Semantic chunker
- [ ] Embedder (@xenova/transformers)

**Merge point**: Index builder needs all above

### Workstream B: Interfaces

**Can start with mocks:**

```typescript
// Can define CLI structure before backend exists
export const searchCommand = {
  name: 'search',
  args: '<query>',
  options: ['--fts', '--vector', '--json'],
  handler: async (query, opts) => {
    // Start with mock, replace with real
    const results = await searchService.search(query, opts);
    // ...
  }
};
```

**Tasks (parallel to A):**
- [ ] CLI command structure (search, backlinks, related, query)
- [ ] MCP tool definitions (schemas, handlers)
- [ ] HTTP API routes (OpenAPI spec)
- [ ] Output formatters (CLI pretty print, JSON)

**Merge point**: Wire up real backend when A is ready

### Workstream C: Obsidian Compatibility

**Completely independent:**

- [ ] Update session template with wiki-links
- [ ] Update round template with frontmatter
- [ ] Add callout format to generated content
- [ ] Create `kinen init --obsidian` command
- [ ] Write Dataview dashboard templates

**No dependencies** — just file format changes

### Week 1 Parallel Execution

```
┌─────────────────────────────────────────────────────────────────┐
│                         WEEK 1                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Day 1-2         Day 2-3         Day 3-4         Day 4-5       │
│  ───────         ───────         ───────         ───────       │
│                                                                 │
│  Agent A1:       Agent A2:       Agent A3:       ALL:          │
│  LanceDB         Wiki-link       Chunker         Index         │
│  setup           parser                          builder       │
│                                                                 │
│  Agent B:        Agent B:        Agent B:        Agent B:      │
│  CLI struct      MCP tools       HTTP API        Integration   │
│  (mock)          (mock)          (spec)          (real)        │
│                                                                 │
│  Agent C:        Agent C:        Agent C:        Agent C:      │
│  Wiki-links      Frontmatter     Callouts        --obsidian    │
│  in templates    schemas                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Workstream Definitions with DoD

### 🔴 User Decision Points

These are moments where I (user) must intervene:

| Point | When | Decision Needed |
|-------|------|-----------------|
| **UDP-1** | Before starting | Approve this plan, allocate agents |
| **UDP-2** | After Workstream A complete | Review index quality, approve schema |
| **UDP-3** | After CLI working | Test search quality, approve UX |
| **UDP-4** | After memory consolidation | Review extracted decisions, approve format |
| **UDP-5** | Before release | Final acceptance testing |

Everything else: **agents execute autonomously**.

---

## Workstream A: Indexing Backend

### A.1: LanceDB Setup

**Description**: Initialize LanceDB connection and create table schemas.

**Definition of Done**:
- [ ] LanceDB database created at `~/.local/share/kinen/indices/{space-hash}/`
- [ ] Tables created: `chunks`, `edges`, `metadata`
- [ ] CRUD operations working: insert, query, delete
- [ ] All tests pass

**Success Measurement** (agent can verify):
```bash
# Test script agents must run
npm test -- --grep "lancedb"

# Expected: All tests pass
# Verify manually:
# 1. Insert 100 test records
# 2. Query returns correct results
# 3. Delete cleans up
# 4. Database file exists at expected path
```

**Acceptance Criteria**:
```typescript
// This test must pass
describe('LanceDB', () => {
  it('creates database at correct path', async () => {
    const db = await initLanceDB('test-space');
    expect(fs.existsSync(db.path)).toBe(true);
  });
  
  it('inserts and retrieves chunks', async () => {
    await db.chunks.insert({ id: '1', content: 'test', embedding: [...] });
    const result = await db.chunks.get('1');
    expect(result.content).toBe('test');
  });
});
```

**No user decision needed** — pure technical task.

---

### A.2: Wiki-Link Parser

**Description**: Extract `[[wiki-links]]` from markdown content.

**Definition of Done**:
- [ ] Parses `[[simple-link]]`
- [ ] Parses `[[link|display text]]`
- [ ] Parses `[[link#heading]]`
- [ ] Parses `[[link#heading|display]]`
- [ ] Returns source line number
- [ ] Handles edge cases (code blocks, escaped)
- [ ] All tests pass

**Success Measurement**:
```typescript
// Agent runs these tests
describe('WikiLinkParser', () => {
  it('extracts simple links', () => {
    const result = parseWikiLinks('See [[my-note]] for details');
    expect(result).toEqual([{ target: 'my-note', display: 'my-note', line: 1 }]);
  });
  
  it('extracts links with display text', () => {
    const result = parseWikiLinks('See [[my-note|click here]]');
    expect(result).toEqual([{ target: 'my-note', display: 'click here', line: 1 }]);
  });
  
  it('ignores links in code blocks', () => {
    const result = parseWikiLinks('```\n[[not-a-link]]\n```');
    expect(result).toEqual([]);
  });
  
  // Must have 100% test coverage on parser
});
```

**Quality Gate**: Parse 10 real kinen session files, verify all links extracted correctly.

**No user decision needed**.

---

### A.3: Frontmatter Parser

**Description**: Extract YAML frontmatter from markdown files.

**Definition of Done**:
- [ ] Parses standard YAML frontmatter
- [ ] Extracts all fields as typed values
- [ ] Handles lists, nested objects
- [ ] Returns null for files without frontmatter
- [ ] All tests pass

**Success Measurement**:
```typescript
describe('FrontmatterParser', () => {
  it('extracts typed fields', () => {
    const md = `---
artifact_type: decision
confidence: 0.9
tags:
  - architecture
  - lancedb
---
# Content`;
    const fm = parseFrontmatter(md);
    expect(fm.artifact_type).toBe('decision');
    expect(fm.confidence).toBe(0.9);
    expect(fm.tags).toEqual(['architecture', 'lancedb']);
  });
});
```

**No user decision needed**.

---

### A.4: Semantic Chunker

**Description**: Split markdown into searchable chunks preserving kinen structure.

**Definition of Done**:
- [ ] Chunks rounds by question (`## Q*.*`)
- [ ] Chunks artifacts by section (`##`)
- [ ] Keeps chunk size under 512 tokens
- [ ] Preserves line numbers for navigation
- [ ] Handles large sections (falls back to paragraph split)
- [ ] All tests pass

**Success Measurement**:
```typescript
describe('Chunker', () => {
  it('chunks round by questions', () => {
    const round = `## Q3.1: First Question\nContent...\n## Q3.2: Second\nMore...`;
    const chunks = chunkMarkdown(round, 'round');
    expect(chunks.length).toBe(2);
    expect(chunks[0].content).toContain('Q3.1');
  });
  
  it('respects token limit', () => {
    const longSection = 'word '.repeat(1000);
    const chunks = chunkMarkdown(longSection, 'artifact');
    chunks.forEach(c => expect(tokenCount(c.content)).toBeLessThan(512));
  });
});
```

**Quality Gate**: Chunk 5 real sessions, manually verify chunks are semantically coherent.

**🔴 User review suggested** (UDP-2): Agent presents sample chunks for approval.

---

### A.5: Embedder Integration

**Description**: Generate embeddings using local model.

**Definition of Done**:
- [ ] Loads `all-MiniLM-L6-v2` via `@xenova/transformers`
- [ ] Generates 384-dim embeddings
- [ ] Batch embedding support (≤32 texts)
- [ ] Caches model after first load
- [ ] All tests pass

**Success Measurement**:
```typescript
describe('Embedder', () => {
  it('generates correct dimensions', async () => {
    const embedding = await embed('test text');
    expect(embedding.length).toBe(384);
  });
  
  it('similar texts have high cosine similarity', async () => {
    const e1 = await embed('authentication flow');
    const e2 = await embed('auth process');
    const e3 = await embed('database schema');
    expect(cosineSimilarity(e1, e2)).toBeGreaterThan(0.7);
    expect(cosineSimilarity(e1, e3)).toBeLessThan(0.5);
  });
  
  it('batches efficiently', async () => {
    const texts = Array(100).fill('test');
    const start = Date.now();
    await embedBatch(texts);
    expect(Date.now() - start).toBeLessThan(5000); // <5s for 100
  });
});
```

**No user decision needed**.

---

### A.6: Index Builder

**Description**: Build complete index from session files.

**Definition of Done**:
- [ ] Scans all `.md` files in sessions/
- [ ] Parses frontmatter, wiki-links, chunks
- [ ] Generates embeddings for all chunks
- [ ] Stores in LanceDB tables
- [ ] Creates edges from wiki-links
- [ ] Reports progress during build
- [ ] Completes in <30s for 100 sessions
- [ ] All tests pass

**Success Measurement**:
```bash
# Agent runs full index build
kinen index build --verbose

# Expected output:
# Scanning sessions... 47 files found
# Parsing... 47/47
# Chunking... 234 chunks
# Embedding... 234/234
# Storing... done
# Index built in 12.3s

# Verify:
kinen index status
# Expected: Shows chunk count, edge count, last updated
```

**Quality Gate**:
```bash
# Search must return relevant results
kinen search "authentication" --json | jq '.results[0].score'
# Expected: > 0.5
```

**🔴 User review** (UDP-2): User tests search with real queries, approves quality.

---

## Workstream B: Interfaces

### B.1: CLI Command Structure

**Description**: Implement CLI commands (can use mocks initially).

**Definition of Done**:
- [ ] `kinen index build` — triggers index build
- [ ] `kinen index status` — shows index stats
- [ ] `kinen search <query>` — hybrid search
- [ ] `kinen search --fts` — full-text only
- [ ] `kinen search --vector` — semantic only
- [ ] `kinen search --json` — JSON output
- [ ] `kinen backlinks <path>` — show incoming links
- [ ] `kinen related <path>` — semantically similar
- [ ] Help text for all commands
- [ ] All tests pass

**Success Measurement**:
```bash
# Agent runs CLI tests
kinen --help                    # Shows all commands
kinen search --help             # Shows options
kinen search "test" --json      # Valid JSON output
kinen search "test" 2>&1        # No errors, formatted output
```

**🔴 User review** (UDP-3): User tests CLI UX, approves output format.

---

### B.2: MCP Tool Definitions

**Description**: Implement MCP tools for AI agents.

**Definition of Done**:
- [ ] `kinen_search` tool with schema
- [ ] `kinen_backlinks` tool with schema
- [ ] `kinen_related` tool with schema
- [ ] `kinen_index_status` tool
- [ ] All return proper JSON
- [ ] Error handling for invalid inputs
- [ ] All tests pass

**Success Measurement**:
```typescript
// MCP tool test
describe('kinen_search MCP', () => {
  it('returns search results', async () => {
    const result = await mcpHandler('kinen_search', { query: 'auth' });
    expect(result.results).toBeInstanceOf(Array);
    expect(result.results[0]).toHaveProperty('path');
    expect(result.results[0]).toHaveProperty('score');
  });
  
  it('handles empty results', async () => {
    const result = await mcpHandler('kinen_search', { query: 'xyznonexistent' });
    expect(result.results).toEqual([]);
  });
});
```

**No user decision needed** — follows CLI behavior.

---

## Workstream C: Obsidian Compatibility

### C.1: Wiki-Links in Generated Content

**Description**: Update all kinen output to use wiki-links.

**Definition of Done**:
- [ ] Session init.md references related sessions with `[[...]]`
- [ ] Rounds link to previous rounds with `[[...]]`
- [ ] Artifacts link to source rounds
- [ ] Memory files link to source sessions/rounds
- [ ] All tests pass

**Success Measurement**:
```bash
# Generate a new session
kinen session new "test-session"

# Verify wiki-links present
grep -r "\[\[" sessions/$(date +%Y%m%d)*/
# Expected: Multiple matches

# Open in Obsidian, verify links are clickable
```

**Quality Gate**: Open 3 generated files in Obsidian, verify all links resolve.

**No user decision needed**.

---

### C.2: Frontmatter Schema Updates

**Description**: Standardize frontmatter across all generated files.

**Definition of Done**:
- [ ] `artifact_type` field in all files
- [ ] `tags` array with prefixes (`domain/`, `type/`, etc.)
- [ ] `date` in ISO 8601 format
- [ ] `session` wiki-link for rounds/artifacts
- [ ] `summary` field
- [ ] All tests pass

**Success Measurement**:
```bash
# Validate frontmatter in generated files
for f in sessions/**/*.md; do
  yq '.artifact_type' "$f" || echo "FAIL: $f missing artifact_type"
  yq '.tags' "$f" || echo "FAIL: $f missing tags"
done
```

**No user decision needed**.

---

### C.3: `kinen init --obsidian`

**Description**: Optional Obsidian setup for power users.

**Definition of Done**:
- [ ] Creates `.obsidian/` directory
- [ ] Includes `app.json` with recommended settings
- [ ] Includes templates for Templater (if present)
- [ ] Includes CSS snippets for kinen callouts
- [ ] Idempotent (can run multiple times safely)
- [ ] All tests pass

**Success Measurement**:
```bash
# Run init with obsidian flag
kinen init --obsidian

# Verify structure
ls -la .obsidian/
# Expected: app.json, templates/, snippets/

# Run again (idempotent)
kinen init --obsidian
# Expected: No errors, no duplicates
```

**No user decision needed**.

---

## Workstream F: Go Daemon & Distribution

### Architecture: Hybrid TypeScript/Go

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interfaces                           │
├────────────────┬─────────────────┬──────────────────────────┤
│   kinen CLI    │   MCP Server    │   VSCode Extension       │
│   (TypeScript) │   (TypeScript)  │   (TypeScript)           │
├────────────────┴─────────────────┴──────────────────────────┤
│                  HTTP/Unix Socket                            │
├─────────────────────────────────────────────────────────────┤
│                 kinen-daemon (Go)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Indexer  │ │ Search   │ │ Memory   │ │ File Watcher   │  │
│  │          │ │          │ │ Consol.  │ │                │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│         LanceDB (embedded)  │  Ollama (local)               │
└─────────────────────────────────────────────────────────────┘
```

### F.1: Go Daemon Core

**Description**: Adapt kinen-go to be a daemon with HTTP API.

**Components to Port from kinen-go**:

| Component | kinen-go Location | Adaptation |
|-----------|-------------------|------------|
| **Config** | `internal/config/` | ✅ Use as-is |
| **Logger** | `internal/logger/` | ✅ Use as-is |
| **Buffer** | `internal/buffer/` | ✅ Use sensory + shortterm |
| **Processor** | `internal/processor/` | ✅ Normalizer |
| **Extractor** | `internal/extractor/` | ✅ Fact extraction |
| **ML/Ollama** | `internal/ml/ollama/` | ✅ Embedder, extractor |
| **Storage** | `internal/storage/sqlite/` | 🔄 Replace with LanceDB |
| **Memory** | `internal/memory/` | ✅ Manager, types |

**New Components to Add**:

| Component | Description |
|-----------|-------------|
| **HTTP Server** | Chi/Fiber router, JSON API |
| **File Watcher** | fsnotify-based, debounced |
| **Index Builder** | MD parser, chunker, LanceDB writer |
| **PDF Parser** | pdfcpu or pdftotext wrapper |
| **Unix Socket** | For local CLI communication |

**Definition of Done**:
- [ ] HTTP server starts on configurable port
- [ ] Unix socket for local CLI
- [ ] File watcher monitors space directory
- [ ] Graceful shutdown with signal handling
- [ ] All tests pass

---

### F.2: HTTP API Design

**Base URL**: `http://localhost:7319` (or Unix socket)

#### Index Operations

```http
POST /api/v1/index/build
Content-Type: application/json

{
  "space": "/path/to/space",
  "force": false
}

Response: { "status": "ok", "chunks": 1234, "duration_ms": 5678 }
```

```http
GET /api/v1/index/status?space=/path/to/space

Response: {
  "space": "/path/to/space",
  "chunks": 1234,
  "last_indexed": "2025-12-06T10:00:00Z",
  "stale_files": ["rounds/01.md"]
}
```

#### Search Operations

```http
POST /api/v1/search
Content-Type: application/json

{
  "query": "Free Energy Principle",
  "space": "/path/to/space",
  "limit": 10,
  "filters": {
    "type": ["round", "artifact"],
    "session": "20251206-01-*"
  }
}

Response: {
  "results": [
    {
      "path": "sessions/20251206-01/rounds/02.md",
      "chunk": "The Free Energy Principle suggests...",
      "score": 0.89,
      "type": "round",
      "metadata": { "session": "20251206-01-kinen-beads-devx" }
    }
  ],
  "total": 42,
  "query_time_ms": 23
}
```

#### Graph Operations

```http
GET /api/v1/backlinks?path=sessions/20251206-01/rounds/01.md

Response: {
  "path": "sessions/20251206-01/rounds/01.md",
  "backlinks": [
    { "from": "memories/daemon-architecture.md", "context": "As decided in [[01-foundation]]..." }
  ]
}
```

```http
GET /api/v1/links?path=sessions/20251206-01/rounds/01.md

Response: {
  "path": "sessions/20251206-01/rounds/01.md",
  "links": [
    { "to": "artifacts/technical-spec.md", "text": "technical-spec" }
  ]
}
```

#### Memory Operations

```http
POST /api/v1/memory/consolidate
Content-Type: application/json

{
  "session": "20251206-01-kinen-beads-devx",
  "dry_run": true
}

Response: {
  "decisions": [
    {
      "text": "Use LanceDB for indexing",
      "source": "rounds/02.md",
      "confidence": 0.92,
      "would_create": "memories/lancedb-decision.md"
    }
  ]
}
```

#### Daemon Control

```http
GET /api/v1/health

Response: { "status": "ok", "version": "0.1.0", "uptime_seconds": 3600 }
```

```http
POST /api/v1/config/reload

Response: { "status": "ok" }
```

---

### F.3: Distribution - Homebrew

**Definition of Done**:
- [ ] Cross-compile for darwin-arm64, darwin-amd64, linux-amd64
- [ ] Create release tarball with checksums
- [ ] Write Homebrew formula
- [ ] Test `brew install kinen-daemon`
- [ ] Document launchd setup

**Homebrew Formula**:
```ruby
class KinenDaemon < Formula
  desc "Background daemon for kinen semantic search and memory"
  homepage "https://kinen.club"
  version "0.1.0"
  
  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/sbellity/kinen/releases/download/v#{version}/kinen-daemon-darwin-arm64.tar.gz"
      sha256 "..."
    else
      url "https://github.com/sbellity/kinen/releases/download/v#{version}/kinen-daemon-darwin-amd64.tar.gz"
      sha256 "..."
    end
  end
  
  def install
    bin.install "kinen-daemon"
  end
  
  service do
    run [opt_bin/"kinen-daemon", "--config", etc/"kinen/config.yaml"]
    keep_alive true
    log_path var/"log/kinen-daemon.log"
    error_log_path var/"log/kinen-daemon.log"
  end
  
  def post_install
    (etc/"kinen").mkpath
    (var/"log").mkpath
  end
  
  test do
    system "#{bin}/kinen-daemon", "--version"
  end
end
```

**launchd plist** (auto-generated by brew):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>club.kinen.daemon</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/kinen-daemon</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

---

### F.4: Distribution - Mac App (Menu Bar)

**Description**: Lightweight menu bar app for non-technical users.

**Tech Stack**:
- **Wails v2** — Go backend + web frontend
- **Svelte/Solid** — Minimal UI framework
- **~25MB app bundle**

**Features**:
- Menu bar icon with status indicator
- Quick search popup (Cmd+Shift+K)
- Settings UI (space path, Ollama endpoint)
- Index status and manual rebuild trigger
- Auto-start on login

**Definition of Done**:
- [ ] Wails project scaffolded
- [ ] Menu bar icon with dropdown
- [ ] Search popup window
- [ ] Settings persistence
- [ ] DMG installer creation
- [ ] Code signing (optional)

**Implementation Priority**: P2 (after daemon is stable)

---

### F.5: TypeScript CLI HTTP Client

**Description**: Update kinen TS CLI to talk to Go daemon via HTTP.

**Changes to kinen/src/**:

```typescript
// lib/daemon-client.ts
export class DaemonClient {
  constructor(
    private baseUrl: string = 'http://localhost:7319',
    private socketPath?: string
  ) {}

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const res = await fetch(`${this.baseUrl}/api/v1/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, ...options })
    });
    return res.json();
  }

  async buildIndex(space: string, force = false): Promise<IndexStatus> {
    const res = await fetch(`${this.baseUrl}/api/v1/index/build`, {
      method: 'POST',
      body: JSON.stringify({ space, force })
    });
    return res.json();
  }

  async getBacklinks(path: string): Promise<Backlink[]> {
    const res = await fetch(`${this.baseUrl}/api/v1/backlinks?path=${encodeURIComponent(path)}`);
    return res.json();
  }

  async health(): Promise<HealthStatus> {
    const res = await fetch(`${this.baseUrl}/api/v1/health`);
    return res.json();
  }
}
```

**CLI Commands Update**:
```typescript
// commands/search.ts
import { DaemonClient } from '../lib/daemon-client';

export const search = async (query: string, options: SearchOptions) => {
  const client = new DaemonClient();
  
  // Check daemon health, start if needed
  try {
    await client.health();
  } catch {
    console.log('Starting kinen daemon...');
    spawn('kinen-daemon', [], { detached: true, stdio: 'ignore' });
    await waitForDaemon();
  }
  
  const results = await client.search(query, options);
  // ... format and display
};
```

**Definition of Done**:
- [ ] DaemonClient class with all API methods
- [ ] CLI commands use DaemonClient
- [ ] Auto-start daemon if not running
- [ ] Graceful fallback if daemon unavailable
- [ ] MCP tools use DaemonClient

---

## Appendix: kinen-go Porting Plan

### Components to Port Directly

These components from `/Users/sbellity/code/p/kinen-go/internal/` can be used with minimal changes:

| Component | Files | Status | Changes Needed |
|-----------|-------|--------|----------------|
| **config/** | config.go, ml.go, storage.go | ✅ Ready | Add HTTP server config |
| **logger/** | logger.go | ✅ Ready | None |
| **errors/** | errors.go | ✅ Ready | None |
| **processor/** | normalizer.go | ✅ Ready | None |
| **buffer/** | sensory.go, shortterm.go, interface.go | ✅ Ready | None |
| **memory/** | manager.go, types.go | ✅ Ready | Add consolidation hooks |
| **extractor/** | fact.go | ✅ Ready | None |
| **ml/ollama/** | client.go, embedder.go, extractor.go | ✅ Ready | None |
| **ml/interface.go** | Embedder, Extractor interfaces | ✅ Ready | None |

### Components to Replace

| kinen-go | Replace With | Rationale |
|----------|--------------|-----------|
| **storage/sqlite/** | LanceDB | Native hybrid search, simpler |
| **ml/grpc/** | Not needed | Ollama handles compression |

### New Components to Create

| Component | Description | Depends On |
|-----------|-------------|------------|
| **http/** | Chi router, JSON API handlers | config |
| **watcher/** | fsnotify file watcher, debounced | - |
| **index/** | Markdown parser, chunker, LanceDB writer | storage |
| **pdf/** | PDF text extraction (pdfcpu) | - |
| **graph/** | Wiki-link parser, backlink index | storage |

### Suggested Go Module Structure

```
kinen-daemon/
├── cmd/
│   └── kinen-daemon/
│       └── main.go              # Entry point
│
├── internal/
│   ├── config/                  # 🔄 Port from kinen-go
│   ├── logger/                  # 🔄 Port from kinen-go
│   ├── errors/                  # 🔄 Port from kinen-go
│   ├── processor/               # 🔄 Port from kinen-go
│   ├── buffer/                  # 🔄 Port from kinen-go
│   ├── memory/                  # 🔄 Port from kinen-go
│   ├── extractor/               # 🔄 Port from kinen-go
│   │
│   ├── ml/                      # 🔄 Port ollama/ only
│   │   ├── interface.go
│   │   └── ollama/
│   │       ├── client.go
│   │       ├── embedder.go
│   │       └── extractor.go
│   │
│   ├── storage/                 # 🆕 New implementation
│   │   ├── interface.go
│   │   └── lancedb/
│   │       └── storage.go       # LanceDB client
│   │
│   ├── index/                   # 🆕 New
│   │   ├── builder.go           # Index build orchestrator
│   │   ├── chunker.go           # Markdown chunking
│   │   └── parser.go            # Markdown + frontmatter
│   │
│   ├── graph/                   # 🆕 New
│   │   ├── links.go             # Wiki-link extraction
│   │   └── backlinks.go         # Reverse index
│   │
│   ├── pdf/                     # 🆕 New
│   │   └── parser.go            # PDF text extraction
│   │
│   ├── watcher/                 # 🆕 New
│   │   └── watcher.go           # File system watcher
│   │
│   └── http/                    # 🆕 New
│       ├── server.go            # Chi router
│       ├── handlers/
│       │   ├── search.go
│       │   ├── index.go
│       │   ├── graph.go
│       │   └── memory.go
│       └── middleware/
│           ├── logging.go
│           └── cors.go
│
├── pkg/
│   └── api/
│       └── types.go             # Public API types (for TS client)
│
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

### Dependencies to Add

```go
// go.mod additions
require (
    // HTTP
    github.com/go-chi/chi/v5 v5.0.11
    github.com/go-chi/cors v1.2.1
    
    // LanceDB
    github.com/lancedb/lancedb-go v0.0.1  // or use Python bridge
    
    // File watching
    github.com/fsnotify/fsnotify v1.7.0
    
    // PDF parsing
    github.com/pdfcpu/pdfcpu v0.6.0
    
    // Keep from kinen-go
    github.com/rs/zerolog v1.31.0
    github.com/spf13/viper v1.18.2
    github.com/stretchr/testify v1.8.4
)
```

### LanceDB Go Integration

> **Note**: LanceDB Go client is less mature than Node.js/Python. Options:
> 1. **lancedb-go** — Native Go client (experimental)
> 2. **CGO + Python** — Embed Python runtime
> 3. **HTTP proxy** — Separate LanceDB service

**Recommendation**: Start with **lancedb-go** (option 1), fall back to HTTP proxy if needed.

```go
// internal/storage/lancedb/storage.go
package lancedb

import (
    "github.com/lancedb/lancedb-go"
)

type Storage struct {
    db    *lancedb.Database
    table *lancedb.Table
}

func New(path string) (*Storage, error) {
    db, err := lancedb.Connect(path)
    if err != nil {
        return nil, err
    }
    
    // Create or open table
    table, err := db.OpenTable("chunks")
    if err != nil {
        // Create with schema
        table, err = db.CreateTable("chunks", schema)
    }
    
    return &Storage{db: db, table: table}, nil
}

func (s *Storage) Search(ctx context.Context, query []float32, limit int) ([]Chunk, error) {
    results, err := s.table.Search(query).
        Limit(limit).
        MetricType(lancedb.Cosine).
        Execute()
    // ...
}
```

---

## Workstream E: Resources & PDF Parsing

### E.1: PDF Parser

**Description**: Extract text from PDF files for indexing.

**Definition of Done**:
- [ ] Parses PDF to text using `pdf-parse` or `pdfjs-dist`
- [ ] Handles multi-page documents
- [ ] Extracts metadata (title, author, date)
- [ ] Chunks by page or semantic sections
- [ ] Handles scanned PDFs gracefully (skip or OCR fallback)
- [ ] All tests pass

**Success Measurement**:
```typescript
describe('PDFParser', () => {
  it('extracts text from PDF', async () => {
    const text = await parsePDF('resources/papers/test.pdf');
    expect(text.length).toBeGreaterThan(100);
    expect(text).toContain('expected content');
  });
  
  it('extracts metadata', async () => {
    const { metadata } = await parsePDF('resources/papers/test.pdf');
    expect(metadata.title).toBeDefined();
  });
  
  it('chunks by page', async () => {
    const chunks = await chunkPDF('resources/papers/multipage.pdf');
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach(c => expect(c.page).toBeDefined());
  });
});
```

**No user decision needed**.

---

### E.2: Resource Folder Structure

**Description**: Set up resources/ folder with proper organization.

**Definition of Done**:
- [ ] Create `resources/` at space root
- [ ] Create `resources/papers/` for PDFs
- [ ] Create `resources/links.md` for web links
- [ ] Create `resources/index.md` as TOC
- [ ] Add sample PDFs for testing
- [ ] Document resource conventions

**Folder Structure**:
```
resources/
├── index.md                    # TOC with descriptions
├── links.md                    # Curated web links
├── papers/
│   ├── friston-fep-2010.pdf   # Free Energy Principle
│   ├── lancedb-docs.pdf       # Or web clip
│   └── ...
└── notes/
    ├── fep-summary.md         # Human notes on papers
    └── ...
```

**No user decision needed**.

---

### E.3: Resource Indexer Integration

**Description**: Integrate PDF parsing into main index builder.

**Definition of Done**:
- [ ] Index builder scans `resources/` folder
- [ ] PDF files are parsed and chunked
- [ ] Chunks stored with `type: "resource"`
- [ ] Metadata includes source PDF path
- [ ] Resources appear in search results
- [ ] All tests pass

**Success Measurement**:
```bash
# After adding PDFs and rebuilding index
kinen index build

# Search should find PDF content
kinen search "Free Energy Principle" --json | jq '.results[0].type'
# PASS: Returns "resource"

kinen search "Free Energy Principle" --json | jq '.results[0].path'
# PASS: Contains "resources/papers/"
```

**No user decision needed**.

---

### E.4: Web Clipper Support (Optional)

**Description**: Support markdown files clipped from web.

**Definition of Done**:
- [ ] Recognizes web clip frontmatter (URL, date clipped)
- [ ] Indexes clipped content
- [ ] Preserves source URL in metadata
- [ ] All tests pass

**Frontmatter for Web Clips**:
```yaml
---
artifact_type: web_clip
source_url: https://lancedb.github.io/lancedb/
clipped_at: 2025-12-06
tags:
  - tech/lancedb
  - domain/database
---
```

**No user decision needed**.

---

## Workstream G: VSCode Extension

### Current State

The VSCode extension at `/Users/sbellity/code/kinen/vscode-extension` is **70% complete**:

| Feature | Status |
|---------|--------|
| Session Explorer | ✅ Complete |
| Round Editor (webview) | ⚠️ Buggy, needs fixes |
| Decision Tracker | ✅ Complete |
| Artifacts Tree | ✅ Complete |
| Status Bar | ✅ Complete |
| Round Parser | ✅ Complete |
| **Search Integration** | ❌ Missing |
| **Backlinks View** | ❌ Missing |
| **Test Infrastructure** | ❌ Missing |

---

### G.0: Test Infrastructure Setup

**Description**: Set up autonomous testing so agents can iterate without human intervention.

**Definition of Done**:
- [ ] Unit test framework (Vitest) configured
- [ ] Integration tests with `@vscode/test-electron`
- [ ] Webview/React tests with Testing Library
- [ ] Test fixtures (valid, malformed, edge-case rounds)
- [ ] CI workflow for GitHub Actions
- [ ] All existing code has basic test coverage
- [ ] `npm test` runs all tests headlessly

**Test Structure**:
```
vscode-extension/
├── test/
│   ├── unit/
│   │   ├── roundParser.test.ts
│   │   ├── sessions.test.ts
│   │   └── config.test.ts
│   ├── integration/
│   │   ├── extension.test.ts
│   │   └── commands.test.ts
│   ├── webview/
│   │   ├── App.test.tsx
│   │   └── Question.test.tsx
│   └── fixtures/
│       ├── valid-round.md
│       ├── malformed-round.md
│       └── edge-cases/
├── vitest.config.ts
└── .vscode-test.mjs
```

**Package.json Scripts**:
```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "vitest run test/unit",
    "test:integration": "vscode-test",
    "test:webview": "vitest run test/webview",
    "test:all": "npm run test:unit && npm run test:webview && npm run test:integration"
  }
}
```

**Success Measurement**:
```bash
# Agent runs these commands
cd vscode-extension
npm run test:unit      # PASS: Exit 0
npm run test:webview   # PASS: Exit 0
npm run build          # PASS: No TS errors
npx vsce package       # PASS: Creates .vsix
```

**No user decision needed** — pure infrastructure.

---

### G.0.1: Fix RoundEditor Bugs

**Description**: Debug and fix the roundEditor webview so it displays and functions correctly.

**Definition of Done**:
- [ ] RoundEditor opens without errors
- [ ] Questions display correctly
- [ ] Options render with proper styling
- [ ] Answers can be typed and saved
- [ ] Callout format (`> [!note] Answer`) works
- [ ] Integration tests verify all functionality
- [ ] All tests pass

**Debug Strategy for Agents**:
```bash
# 1. Check console for errors
cd vscode-extension
npm run build 2>&1 | grep -i error

# 2. Run parser tests on real rounds
node -e "
const fs = require('fs');
const {parseRound} = require('./dist/parsers/roundParser');
const content = fs.readFileSync('../sessions/20251206-01-kinen-beads-devx/rounds/01-foundation.md', 'utf8');
const parsed = parseRound(content);
console.log(JSON.stringify(parsed, null, 2));
"

# 3. Check webview HTML generation
# Look for issues in roundEditor.ts getHtml()

# 4. Run integration test
npm run test:integration -- --grep "round editor"
```

**Success Measurement**:
```typescript
// test/integration/roundEditor.test.ts
test('RoundEditor opens and displays questions', async () => {
  const uri = vscode.Uri.file(testRoundPath);
  await vscode.commands.executeCommand('vscode.openWith', uri, 'kinen.roundEditor');
  
  // Webview should be created
  const panels = vscode.window.visibleTextEditors;
  // Assert webview exists and has content
});
```

**No user decision needed** — agents can iterate until tests pass.

---

### G.1: Daemon Client

**Description**: HTTP client to communicate with Go daemon.

**Definition of Done**:
- [ ] `DaemonClient` class in `src/lib/daemonClient.ts`
- [ ] Methods: `search()`, `backlinks()`, `related()`, `indexStatus()`, `health()`
- [ ] Auto-reconnect on daemon restart
- [ ] Graceful handling when daemon is unavailable
- [ ] Unit tests with mocked HTTP
- [ ] All tests pass

**Implementation**:
```typescript
// src/lib/daemonClient.ts
export class DaemonClient {
  private baseUrl: string;
  
  constructor(baseUrl = 'http://localhost:7319') {
    this.baseUrl = baseUrl;
  }

  async health(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const res = await fetch(`${this.baseUrl}/api/v1/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, ...options })
    });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    const data = await res.json();
    return data.results;
  }

  async backlinks(path: string): Promise<BacklinkResult[]> {
    const res = await fetch(`${this.baseUrl}/api/v1/backlinks?path=${encodeURIComponent(path)}`);
    if (!res.ok) throw new Error(`Backlinks failed: ${res.status}`);
    const data = await res.json();
    return data.backlinks;
  }

  async indexStatus(): Promise<IndexStatus> {
    const res = await fetch(`${this.baseUrl}/api/v1/index/status`);
    if (!res.ok) throw new Error(`Index status failed: ${res.status}`);
    return res.json();
  }
}
```

**Success Measurement**:
```typescript
// test/unit/daemonClient.test.ts
describe('DaemonClient', () => {
  it('returns false for health when daemon unavailable', async () => {
    const client = new DaemonClient('http://localhost:99999');
    expect(await client.health()).toBe(false);
  });

  it('searches when daemon available', async () => {
    // Mock server or use nock
    const client = new DaemonClient();
    const results = await client.search('test');
    expect(Array.isArray(results)).toBe(true);
  });
});
```

**No user decision needed**.

---

### G.2: Search Command Palette

**Description**: Add `Kinen: Search` command with QuickPick UI.

**Definition of Done**:
- [ ] Command registered: `kinen.search`
- [ ] Keyboard shortcut: `Cmd+Shift+K` (Mac), `Ctrl+Shift+K` (Win/Linux)
- [ ] QuickPick shows search results with preview
- [ ] Selecting result opens file at correct line
- [ ] Shows "Daemon unavailable" if daemon not running
- [ ] Integration tests verify command works
- [ ] All tests pass

**Implementation**:
```typescript
// Add to extension.ts
vscode.commands.registerCommand('kinen.search', async () => {
  const daemon = new DaemonClient();
  
  if (!await daemon.health()) {
    vscode.window.showWarningMessage('Kinen daemon not running. Start with: kinen-daemon');
    return;
  }

  const query = await vscode.window.showInputBox({
    prompt: 'Search kinen sessions',
    placeHolder: 'e.g., authentication design decisions'
  });
  
  if (!query) return;

  const results = await daemon.search(query);
  
  const items = results.map(r => ({
    label: r.path.split('/').pop() || r.path,
    description: `${r.session} | Score: ${(r.score * 100).toFixed(0)}%`,
    detail: r.chunk.substring(0, 200) + '...',
    result: r
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: `${results.length} results for "${query}"`,
    matchOnDescription: true,
    matchOnDetail: true
  });

  if (selected) {
    const uri = vscode.Uri.file(selected.result.path);
    await vscode.window.showTextDocument(uri);
  }
});
```

**Keybinding in `package.json`**:
```json
{
  "contributes": {
    "keybindings": [{
      "command": "kinen.search",
      "key": "ctrl+shift+k",
      "mac": "cmd+shift+k"
    }]
  }
}
```

**🔴 User review suggested**: Agent shows UX, user provides feedback.

---

### G.3: Backlinks Tree Provider

**Description**: Sidebar view showing backlinks for current file.

**Definition of Done**:
- [ ] New tree provider: `BacklinksTreeProvider`
- [ ] Shows backlinks for currently open file
- [ ] Updates when active editor changes
- [ ] Clicking backlink opens source file
- [ ] Shows "No backlinks" when empty
- [ ] All tests pass

**Implementation**:
```typescript
// src/providers/backlinksTree.ts
export class BacklinksTreeProvider implements vscode.TreeDataProvider<BacklinkItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  
  private daemon: DaemonClient;
  private currentPath: string | null = null;

  constructor() {
    this.daemon = new DaemonClient();
    
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor?.document.uri.scheme === 'file') {
        this.currentPath = editor.document.uri.fsPath;
        this._onDidChangeTreeData.fire();
      }
    });
  }

  async getChildren(): Promise<BacklinkItem[]> {
    if (!this.currentPath) return [];
    
    try {
      const backlinks = await this.daemon.backlinks(this.currentPath);
      return backlinks.map(b => new BacklinkItem(b));
    } catch {
      return [];
    }
  }
}
```

**No user decision needed**.

---

### G.4: Index Status in Status Bar

**Description**: Update status bar to show index status.

**Definition of Done**:
- [ ] Status bar shows: `Kinen: space | 234 chunks | ●`
- [ ] Green dot = indexed and fresh
- [ ] Yellow dot = index stale (files changed)
- [ ] Red dot = daemon unavailable
- [ ] Clicking opens index status details
- [ ] All tests pass

**No user decision needed**.

---

### G.5: Search Results View (Optional)

**Description**: Rich webview for search results with preview.

**Priority**: P3 (nice to have)

**Definition of Done**:
- [ ] Webview panel for search results
- [ ] Shows snippet with highlighted query terms
- [ ] Filter by session, type, date
- [ ] Preview pane for selected result
- [ ] All tests pass

**🔴 User decision**: Is QuickPick (G.2) enough, or do we need this?

---

## Workstream G Invariants

```bash
# G-INV-1: Extension builds without errors
cd vscode-extension && npm run build
# PASS: Exit 0, no errors

# G-INV-2: Unit tests pass
cd vscode-extension && npm run test:unit
# PASS: Exit 0

# G-INV-3: Integration tests pass (headless VSCode)
cd vscode-extension && xvfb-run -a npm run test:integration
# PASS: Exit 0

# G-INV-4: Extension packages successfully
cd vscode-extension && npx vsce package --no-dependencies
# PASS: Creates .vsix file

# G-INV-5: RoundEditor displays questions
# (Verified by integration test)
npm run test:integration -- --grep "RoundEditor"
# PASS: Test passes

# G-INV-6: Search command works (when daemon running)
# (Verified by integration test)
npm run test:integration -- --grep "search command"
# PASS: Test passes

# G-INV-7: Parser handles all fixture files without exceptions
for f in test/fixtures/*.md; do
  node -e "require('./dist/parsers/roundParser').parseRound(require('fs').readFileSync('$f', 'utf8'))" || exit 1
done
# PASS: All files parse
```

---

## Workstream D: Memory Consolidation

### D.1: Decision Extractor

**Description**: Extract decisions from completed rounds.

**Definition of Done**:
- [ ] Identifies decision markers in rounds (callouts, explicit "Decision:" text)
- [ ] Extracts decision content
- [ ] Identifies source round and question
- [ ] Assigns confidence based on explicitness
- [ ] All tests pass

**Success Measurement**:
```typescript
describe('DecisionExtractor', () => {
  it('extracts callout decisions', () => {
    const round = `
## Q3.1: Database Choice
> [!note] Decision
> Use LanceDB for hybrid search.
`;
    const decisions = extractDecisions(round);
    expect(decisions.length).toBe(1);
    expect(decisions[0].content).toContain('LanceDB');
    expect(decisions[0].source_question).toBe('Q3.1');
  });
});
```

**🔴 User review** (UDP-4): User reviews sample extractions, approves quality.

---

### D.2: Memory File Writer

**Description**: Write extracted decisions as markdown files.

**Definition of Done**:
- [ ] Creates `memories/` directory in session
- [ ] Writes one file per decision
- [ ] Includes frontmatter with all required fields
- [ ] Includes wiki-links to source round
- [ ] File naming: `D{round}.{num}-{slug}.md`
- [ ] All tests pass

**Success Measurement**:
```bash
# Run summarize on a session
kinen summarize sessions/20251206-01-kinen-beads-devx

# Verify files created
ls sessions/20251206-01-kinen-beads-devx/memories/
# Expected: D3.1-use-lancedb.md, D3.2-files-as-truth.md, etc.

# Verify frontmatter
head -20 sessions/*/memories/D3.1*.md
# Expected: artifact_type: decision, session: [[...]], etc.

# Verify wiki-links
grep "\[\[" sessions/*/memories/*.md
# Expected: Links to source rounds
```

**🔴 User review** (UDP-4): User reviews generated memory files.

---

## Success Invariants (Testable Against This Space)

**Test Corpus**: This kinen space at `/Users/sbellity/code/kinen`

Current sessions:
- `20251206-01-kinen-beads-devx` (this session)
- `20251203-01-kinen-resources-and-indexing`
- `20251112-01-obsidian-integration`
- `20251112-02-kinen-obsidian-poc`

### Invariant Set A: Indexing

```bash
# A-INV-1: Index builds without errors
kinen index build
# PASS: Exit code 0, no errors in stderr

# A-INV-2: Index contains expected chunk count
kinen index status --json | jq '.chunk_count'
# PASS: >= 200 chunks (we have ~50 files × ~4 chunks each)

# A-INV-3: Index contains expected session count
kinen index status --json | jq '.session_count'
# PASS: >= 4 sessions

# A-INV-4: Index rebuild is idempotent
kinen index build && kinen index status --json > /tmp/s1.json
kinen index build && kinen index status --json > /tmp/s2.json
diff /tmp/s1.json /tmp/s2.json
# PASS: No difference (same counts)
```

### Invariant Set B: Search Quality

```bash
# B-INV-1: Semantic search for "LanceDB" returns relevant results
kinen search "LanceDB database choice" --json | jq '.results[0].path'
# PASS: Contains "technical-spec" or "03-shipping-plan" or "resources-and-indexing"

# B-INV-2: Semantic search for "Obsidian" returns obsidian-related content
kinen search "Obsidian integration graph view" --json | jq '.results | length'
# PASS: >= 3 results

# B-INV-3: Semantic search for "wiki-links" finds relevant discussions
kinen search "wiki-links backlinks" --json | jq '.results[0].session'
# PASS: Contains "obsidian-integration" or "kinen-beads-devx"

# B-INV-4: FTS search for exact term works
kinen search "all-MiniLM-L6-v2" --fts --json | jq '.results | length'
# PASS: >= 1 result (we mention this exact model)

# B-INV-5: Search returns scores in valid range
kinen search "authentication" --json | jq '.results[].score' | while read score; do
  [ "$score" -ge 0 ] && [ "$score" -le 1 ] || echo "FAIL: score $score out of range"
done
# PASS: All scores between 0 and 1

# B-INV-6: Empty query returns error, not crash
kinen search "" 2>&1
# PASS: Returns error message, exit code non-zero, no crash

# B-INV-7: Nonsense query returns empty results, not error
kinen search "xyzzy flurble grommet" --json | jq '.results | length'
# PASS: Returns 0, exit code 0
```

### Invariant Set C: Wiki-Link Graph

```bash
# C-INV-1: Wiki-links are extracted from files
kinen index status --json | jq '.edge_count'
# PASS: >= 20 edges (we have many [[links]] in our files)

# C-INV-2: Backlinks for technical-spec returns inbound links
kinen backlinks "sessions/20251206-01-kinen-beads-devx/artifacts/technical-spec.md" --json | jq '.links | length'
# PASS: >= 1 (rounds reference technical-spec)

# C-INV-3: Related sessions returns semantically similar content
kinen related "sessions/20251206-01-kinen-beads-devx" --json | jq '.results[0].session'
# PASS: Returns "20251203-01-kinen-resources-and-indexing" or "20251112-01-obsidian-integration"
# (these are semantically related to our current session)

# C-INV-4: Cross-session links are captured
kinen backlinks "sessions/20251112-01-obsidian-integration" --json | jq '.links[].source_session' | grep "20251206"
# PASS: Our current session links to the imported obsidian session
```

### Invariant Set D: Frontmatter & Metadata

```bash
# D-INV-1: All session init.md files have artifact_type
for f in sessions/*/init.md; do
  grep -q "artifact_type:" "$f" || echo "FAIL: $f missing artifact_type"
done
# PASS: No failures

# D-INV-2: Metadata query returns typed results
kinen query "artifact_type = 'round_exploration'" --json | jq '.results | length'
# PASS: >= 10 (we have many round files)

# D-INV-3: Tag query works
kinen query "tags contains 'tech/lancedb'" --json | jq '.results | length'
# PASS: >= 1 (files tagged with lancedb)

# D-INV-4: Date filtering works
kinen query "date >= '2025-12-06'" --json | jq '.results | length'
# PASS: >= 5 (today's session files)
```

### Invariant Set E: CLI Interface

```bash
# E-INV-1: Help is available for all commands
kinen --help | grep -q "search" && echo "PASS" || echo "FAIL"
kinen search --help | grep -q "query" && echo "PASS" || echo "FAIL"
kinen backlinks --help | grep -q "path" && echo "PASS" || echo "FAIL"

# E-INV-2: JSON output is valid JSON
kinen search "test" --json | jq . > /dev/null
# PASS: Exit code 0

# E-INV-3: Human output is readable (not JSON)
kinen search "test" | grep -q "results" || grep -q "Found"
# PASS: Human-readable output

# E-INV-4: Error messages are helpful
kinen search 2>&1 | grep -qi "query\|required\|missing"
# PASS: Error mentions what's missing
```

### Invariant Set F: MCP Tools

```typescript
// F-INV-1: kinen_search returns expected structure
const result = await mcp.call('kinen_search', { query: 'LanceDB' });
assert(Array.isArray(result.results));
assert(result.results[0].path);
assert(result.results[0].score >= 0);

// F-INV-2: kinen_backlinks returns links
const backlinks = await mcp.call('kinen_backlinks', { 
  path: 'sessions/20251206-01-kinen-beads-devx/artifacts/technical-spec.md' 
});
assert(Array.isArray(backlinks.links));

// F-INV-3: kinen_index_status returns stats
const status = await mcp.call('kinen_index_status', {});
assert(status.chunk_count > 0);
assert(status.session_count >= 4);
```

### Invariant Set G: Memory Consolidation

```bash
# G-INV-1: Summarize extracts decisions from this session
kinen summarize "sessions/20251206-01-kinen-beads-devx"
ls sessions/20251206-01-kinen-beads-devx/memories/
# PASS: memories/ folder exists with D3.*.md files

# G-INV-2: Decision files have proper structure
for f in sessions/20251206-01-kinen-beads-devx/memories/D*.md; do
  grep -q "artifact_type: decision" "$f" || echo "FAIL: $f missing artifact_type"
  grep -q "\[\[rounds/" "$f" || echo "FAIL: $f missing source link"
done
# PASS: All decision files have required fields

# G-INV-3: Extracted decisions are indexed
kinen index build
kinen query "artifact_type = 'decision'" --json | jq '.results | length'
# PASS: >= 5 (we made 8 decisions in round 3)

# G-INV-4: Decisions are searchable
kinen search "files as truth architecture decision" --json | jq '.results[0].type'
# PASS: Returns "decision"
```

### Invariant Set H: Obsidian Compatibility

```bash
# H-INV-1: Wiki-links in generated content
grep -r "\[\[" sessions/20251206-01-kinen-beads-devx/rounds/ | wc -l
# PASS: >= 10 wiki-links

# H-INV-2: Frontmatter is valid YAML
for f in sessions/**/*.md; do
  head -50 "$f" | grep -q "^---" && python3 -c "import yaml; yaml.safe_load(open('$f').read().split('---')[1])" || echo "WARN: $f"
done
# PASS: No YAML parse errors

# H-INV-3: Callout syntax is correct
grep -r ">\s*\[!" sessions/20251206-01-kinen-beads-devx/rounds/ | head -5
# PASS: Callouts use > [!note] format

# H-INV-4: Files open in Obsidian without errors
# (Manual test: open space in Obsidian, check console for errors)
# PASS: No errors in Obsidian console
```

### Invariant Set K: Go Daemon & HTTP API

```bash
# K-INV-1: Daemon starts and responds to health check
kinen-daemon --version
# PASS: Prints version

curl -s http://localhost:7319/api/v1/health | jq '.status'
# PASS: "ok"

# K-INV-2: Search API returns results
curl -s -X POST http://localhost:7319/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "LanceDB", "space": "'"$PWD"'"}' | jq '.results | length'
# PASS: >= 1

# K-INV-3: Index build API works
curl -s -X POST http://localhost:7319/api/v1/index/build \
  -H "Content-Type: application/json" \
  -d '{"space": "'"$PWD"'", "force": false}' | jq '.status'
# PASS: "ok"

# K-INV-4: Backlinks API returns results
curl -s "http://localhost:7319/api/v1/backlinks?path=sessions/20251206-01-kinen-beads-devx/rounds/01-foundation.md" | jq '.backlinks'
# PASS: Array (may be empty)

# K-INV-5: TypeScript CLI connects to daemon
kinen search "memory consolidation" --json | jq '.daemon_connected'
# PASS: true

# K-INV-6: Daemon binary is standalone (no external deps)
otool -L $(which kinen-daemon) | grep -v /usr/lib | grep -v /System
# PASS: No output (only system libs)

# K-INV-7: Binary size is reasonable
ls -lh $(which kinen-daemon) | awk '{print $5}'
# PASS: < 50MB
```

---

### Invariant Set L: Distribution

```bash
# L-INV-1: Homebrew formula installs
brew install kinen-daemon --dry-run 2>&1 | grep -i error
# PASS: No output

# L-INV-2: launchd service can be loaded
launchctl list | grep kinen
# PASS: Shows club.kinen.daemon (after brew services start)

# L-INV-3: Cross-platform builds succeed
GOOS=darwin GOARCH=arm64 go build -o /tmp/kinen-darwin-arm64 ./cmd/kinen-daemon
GOOS=darwin GOARCH=amd64 go build -o /tmp/kinen-darwin-amd64 ./cmd/kinen-daemon
GOOS=linux GOARCH=amd64 go build -o /tmp/kinen-linux-amd64 ./cmd/kinen-daemon
# PASS: All three succeed

# L-INV-4: Release tarball contains correct files
tar -tzf kinen-daemon-darwin-arm64.tar.gz
# PASS: Contains kinen-daemon, README, LICENSE
```

---

### Invariant Set J: Resources & PDFs

```bash
# J-INV-1: Resources folder exists and is indexed
ls resources/papers/*.pdf | wc -l
# PASS: >= 1 PDF file

# J-INV-2: PDF content is searchable
kinen search "Free Energy Principle" --json | jq '.results[0].path'
# PASS: Contains "resources/" (finds PDF content)

# J-INV-3: Resource chunks have correct type
kinen search "minimizing surprise" --json | jq '.results[] | select(.type == "resource")'
# PASS: Returns resource-type results

# J-INV-4: PDF metadata is captured
kinen query "artifact_type = 'resource'" --json | jq '.results | length'
# PASS: >= number of PDFs indexed

# J-INV-5: Multi-page PDF creates multiple chunks
kinen index status --json | jq '.resource_chunk_count'
# PASS: > number of PDF files (multi-page = multiple chunks)
```

---

### Invariant Set M: VSCode Extension

```bash
# M-INV-1: Extension builds without errors
cd vscode-extension && npm run build
# PASS: Exit 0, no TypeScript errors

# M-INV-2: Unit tests pass
cd vscode-extension && npm run test:unit
# PASS: Exit 0, all tests green

# M-INV-3: Integration tests pass (headless VSCode)
cd vscode-extension && xvfb-run -a npm run test:integration
# PASS: Exit 0 (Linux), or just `npm run test:integration` on Mac

# M-INV-4: Extension packages successfully
cd vscode-extension && npx vsce package --no-dependencies
# PASS: Creates .vsix file without errors

# M-INV-5: Parser handles real rounds without exceptions
cd vscode-extension && node -e "
const fs = require('fs');
const {parseRound} = require('./dist/parsers/roundParser');
const files = [
  '../sessions/20251206-01-kinen-beads-devx/rounds/01-foundation.md',
  '../sessions/20251206-01-kinen-beads-devx/rounds/02-daemon-and-integration.md',
  '../sessions/20251206-01-kinen-beads-devx/rounds/03-shipping-plan.md'
];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const parsed = parseRound(content);
  console.log(f + ': ' + parsed.questions.length + ' questions');
});
"
# PASS: All files parse, shows question counts

# M-INV-6: RoundEditor integration test passes
cd vscode-extension && npm run test:integration -- --grep "RoundEditor"
# PASS: RoundEditor test passes

# M-INV-7: Search command integration test passes (when daemon running)
cd vscode-extension && npm run test:integration -- --grep "search"
# PASS: Search command test passes
```

---

### Invariant Set I: Performance

```bash
# I-INV-1: Index build completes in reasonable time
time kinen index build
# PASS: < 30 seconds for this space

# I-INV-2: Search responds quickly
time kinen search "authentication"
# PASS: < 500ms

# I-INV-3: Backlinks query is fast
time kinen backlinks "sessions/20251206-01-kinen-beads-devx"
# PASS: < 100ms

# I-INV-4: Memory usage is reasonable
# (Monitor during index build)
# PASS: < 500MB peak memory
```

---

## Validation Script

Agents should run this script after each workstream:

```bash
#!/bin/bash
# validate-kinen.sh - Run all invariant checks

set -e
SPACE="/Users/sbellity/code/kinen"
cd "$SPACE"

echo "=== Invariant Validation for kinen ==="
echo "Space: $SPACE"
echo "Date: $(date)"
echo ""

PASS=0
FAIL=0

check() {
  local name="$1"
  shift
  if "$@" > /dev/null 2>&1; then
    echo "✅ $name"
    ((PASS++))
  else
    echo "❌ $name"
    ((FAIL++))
  fi
}

# A: Indexing
echo ""
echo "=== A: Indexing ==="
check "A-INV-1: Index builds" kinen index build
check "A-INV-2: Chunk count >= 200" [ $(kinen index status --json | jq '.chunk_count') -ge 200 ]
check "A-INV-3: Session count >= 4" [ $(kinen index status --json | jq '.session_count') -ge 4 ]

# B: Search
echo ""
echo "=== B: Search ==="
check "B-INV-1: LanceDB search relevant" kinen search "LanceDB" --json | jq -e '.results[0]'
check "B-INV-2: Obsidian search >= 3" [ $(kinen search "Obsidian" --json | jq '.results | length') -ge 3 ]
check "B-INV-4: FTS exact match" [ $(kinen search "all-MiniLM-L6-v2" --fts --json | jq '.results | length') -ge 1 ]
check "B-INV-7: Nonsense returns empty" [ $(kinen search "xyzzy flurble" --json | jq '.results | length') -eq 0 ]

# C: Graph
echo ""
echo "=== C: Graph ==="
check "C-INV-1: Edge count >= 20" [ $(kinen index status --json | jq '.edge_count') -ge 20 ]
check "C-INV-2: Backlinks work" kinen backlinks "sessions/20251206-01-kinen-beads-devx/artifacts/technical-spec.md" --json | jq -e '.links'

# D: Metadata
echo ""
echo "=== D: Metadata ==="
check "D-INV-2: Query by type" [ $(kinen query "artifact_type = 'round_exploration'" --json | jq '.results | length') -ge 5 ]

# E: CLI
echo ""
echo "=== E: CLI ==="
check "E-INV-1: Help available" kinen --help | grep -q "search"
check "E-INV-2: JSON valid" kinen search "test" --json | jq . > /dev/null

# Summary
echo ""
echo "=== Summary ==="
echo "Passed: $PASS"
echo "Failed: $FAIL"
[ $FAIL -eq 0 ] && echo "🎉 All invariants satisfied!" || echo "⚠️ Some invariants failed"
exit $FAIL
```

---

## Quality Gates Summary (Updated)

| Gate | Invariants Required | Who Runs |
|------|--------------------:|----------|
| **QG-A** | A-INV-1,2,3,4 | Agent (after A.6) |
| **QG-B** | B-INV-1,2,3,4,5,6,7 | Agent (after A.6) |
| **QG-C** | C-INV-1,2,3,4 | Agent (after A.6) |
| **QG-D** | D-INV-1,2,3,4 | Agent (after B.1) |
| **QG-E** | E-INV-1,2,3,4 | Agent (after B.1) |
| **QG-F** | F-INV-1,2,3 | Agent (after B.2) |
| **QG-G** | G-INV-1,2,3,4 | Agent + User (after D.2) |
| **QG-H** | H-INV-1,2,3 | Agent (after C.*) |
| **QG-I** | I-INV-1,2,3,4 | Agent (before release) |
| **QG-M** | M-INV-1,2,3,4,5,6,7 | Agent (after G.0.1) |

**Agent autonomy**: If all invariants pass, agent can proceed. No user needed until UDP points.

### VSCode Extension: Fully Autonomous Testing

Workstream G is designed for **fully autonomous agent iteration**:

```
┌─────────────────────────────────────────────────────────────┐
│  Agent Working on VSCode Extension (G.0.1)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Make code change                                        │
│          │                                                  │
│          ▼                                                  │
│  2. npm run build                                           │
│          │                                                  │
│          ├── Error? → Read error, fix, goto 1              │
│          │                                                  │
│          ▼                                                  │
│  3. npm run test:unit                                       │
│          │                                                  │
│          ├── Fail? → Read failure, fix, goto 1             │
│          │                                                  │
│          ▼                                                  │
│  4. npm run test:integration                                │
│          │                                                  │
│          ├── Fail? → Read failure, fix, goto 1             │
│          │                                                  │
│          ▼                                                  │
│  5. All pass? → Task complete ✅                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key**: Agent never needs user to "visually check" — tests verify everything.

---

## Agent Autonomy Levels

| Task | Agent Can Complete Without User |
|------|--------------------------------|
| A.1 LanceDB setup | ✅ Yes |
| A.2 Wiki-link parser | ✅ Yes |
| A.3 Frontmatter parser | ✅ Yes |
| A.4 Chunker | ⚠️ Show samples, continue if reasonable |
| A.5 Embedder | ✅ Yes |
| A.6 Index builder | ⚠️ User tests search quality |
| B.1 CLI structure | ⚠️ User approves UX |
| B.2 MCP tools | ✅ Yes (follows CLI) |
| C.* Obsidian | ✅ Yes |
| D.* Memory | ⚠️ User reviews extractions |
| **G.0 Test infra** | ✅ Yes (pure infrastructure) |
| **G.0.1 Fix roundEditor** | ✅ Yes (tests verify) |
| **G.1 Daemon client** | ✅ Yes (unit tests verify) |
| **G.2 Search palette** | ⚠️ User approves UX |
| **G.3 Backlinks view** | ✅ Yes |
| **G.4 Status bar** | ✅ Yes |

---

## User Decision Points (Detailed)

### UDP-1: Plan Approval (NOW)
**Question**: Approve this plan and allocate resources?
**Options**: 
- A) Start with 3 parallel agents
- B) Start with 1 agent (sequential)
- C) Modify plan first

### UDP-2: Index Quality Review
**When**: After A.6 complete
**What user does**: 
```bash
kinen search "authentication"
kinen search "how we decided on lancedb"
kinen search "obsidian integration"
```
**Decision**: Is search quality acceptable? (Yes/No/Iterate)

### UDP-3: CLI UX Review
**When**: After B.1 complete
**What user does**: Use CLI for 10 minutes
**Decision**: Is output format acceptable? (Yes/No/Iterate)

### UDP-4: Memory Quality Review
**When**: After D.2 complete
**What user does**: Read 5 generated memory files
**Decision**: Are extractions accurate? (Yes/No/Iterate)

### UDP-5: Final Acceptance
**When**: All workstreams complete
**What user does**: Full workflow test
**Decision**: Ship it? (Yes/No)

---

## beads Issues to Create

```bash
# Workstream A
bd create "A.1: LanceDB setup and table schemas" -t task -p 1 \
  --acceptance "All unit tests pass, CRUD operations work"
  
bd create "A.2: Wiki-link parser" -t task -p 1 \
  --acceptance "Extracts all link formats, ignores code blocks, 100% test coverage"
  
bd create "A.3: Frontmatter parser" -t task -p 1 \
  --acceptance "Parses YAML, returns typed values, handles edge cases"
  
bd create "A.4: Semantic chunker" -t task -p 1 \
  --acceptance "Chunks by question/section, respects token limit, preserves line numbers"
  
bd create "A.5: Embedder integration" -t task -p 1 \
  --acceptance "384-dim embeddings, <5s for 100 texts, similar texts have high similarity"
  
bd create "A.6: Index builder" -t task -p 1 \
  --deps "A.1,A.2,A.3,A.4,A.5" \
  --acceptance "<30s for 100 sessions, search returns relevant results"

# Workstream B
bd create "B.1: CLI command structure" -t task -p 1 \
  --acceptance "All commands work, help text present, JSON output valid"
  
bd create "B.2: MCP tool definitions" -t task -p 1 \
  --deps "B.1" \
  --acceptance "All tools return proper JSON, error handling works"

# Workstream C
bd create "C.1: Wiki-links in generated content" -t task -p 2 \
  --acceptance "All generated files contain [[links]], links resolve in Obsidian"
  
bd create "C.2: Frontmatter schema updates" -t task -p 2 \
  --acceptance "All files have artifact_type, tags, date, summary"
  
bd create "C.3: kinen init --obsidian" -t task -p 3 \
  --acceptance "Creates .obsidian/, idempotent, includes templates"

# Workstream D
bd create "D.1: Decision extractor" -t task -p 2 \
  --deps "A.3" \
  --acceptance "Extracts callout decisions, identifies source Q, assigns confidence"
  
bd create "D.2: Memory file writer" -t task -p 2 \
  --deps "D.1,C.1,C.2" \
  --acceptance "Creates memories/ folder, proper frontmatter, wiki-links to source"

# Workstream E (parallel, independent)
bd create "E.1: PDF parser" -t task -p 2 \
  --acceptance "Extracts text, metadata, chunks by page, handles edge cases"

bd create "E.2: Resources folder structure" -t task -p 2 \
  --acceptance "Creates resources/, papers/, links.md, index.md, sample PDFs"

bd create "E.3: Resource indexer integration" -t task -p 2 \
  --deps "A.6,E.1" \
  --acceptance "PDFs indexed, searchable, type='resource', path includes resources/"

bd create "E.4: Web clipper support" -t task -p 3 \
  --acceptance "Web clip frontmatter recognized, source_url preserved"

# Workstream F: Go Daemon & Distribution
bd create "F.1: Go daemon core" -t task -p 1 \
  --acceptance "HTTP server on :7319, Unix socket, file watcher, graceful shutdown"

bd create "F.2: HTTP API - Search endpoint" -t task -p 1 \
  --deps "A.2,F.1" \
  --acceptance "POST /api/v1/search returns results with scores, filters work"

bd create "F.3: HTTP API - Index endpoints" -t task -p 1 \
  --deps "A.6,F.1" \
  --acceptance "POST /build, GET /status work, returns chunk count"

bd create "F.4: HTTP API - Graph endpoints" -t task -p 2 \
  --deps "A.4,F.1" \
  --acceptance "GET /backlinks and /links return correct data"

bd create "F.5: HTTP API - Memory endpoints" -t task -p 2 \
  --deps "D.1,F.1" \
  --acceptance "POST /memory/consolidate extracts decisions"

bd create "F.6: TS CLI daemon client" -t task -p 1 \
  --deps "F.2" \
  --acceptance "DaemonClient class, auto-start daemon, all CLI commands work"

bd create "F.7: Homebrew formula" -t task -p 2 \
  --deps "F.1" \
  --acceptance "brew install works, launchd service configurable"

bd create "F.8: Cross-platform builds" -t task -p 2 \
  --deps "F.1" \
  --acceptance "darwin-arm64, darwin-amd64, linux-amd64 all build, <50MB each"

bd create "F.9: Mac menu bar app" -t task -p 3 \
  --deps "F.2,F.3" \
  --acceptance "Wails app, menu bar icon, search popup, settings UI"

# Workstream G: VSCode Extension (can run in parallel, autonomous testing)
bd create "G.0: VSCode test infrastructure" -t task -p 1 \
  --acceptance "Vitest for unit, @vscode/test-electron for integration, fixtures, CI workflow, npm test passes"

bd create "G.0.1: Fix roundEditor bugs" -t task -p 1 \
  --deps "G.0" \
  --acceptance "RoundEditor opens, displays questions, saves answers - verified by integration tests"

bd create "G.1: VSCode daemon client" -t task -p 2 \
  --deps "G.0,F.2" \
  --acceptance "DaemonClient class, health/search/backlinks/indexStatus methods, unit tests pass"

bd create "G.2: Search command palette" -t task -p 2 \
  --deps "G.1" \
  --acceptance "Cmd+Shift+K opens search, QuickPick results, opens file on select, integration test passes"

bd create "G.3: Backlinks tree provider" -t task -p 3 \
  --deps "G.1" \
  --acceptance "Sidebar shows backlinks for current file, updates on editor change"

bd create "G.4: Index status in status bar" -t task -p 3 \
  --deps "G.1" \
  --acceptance "Shows chunk count, freshness indicator (green/yellow/red)"

bd create "G.5: Rich search results view" -t task -p 4 \
  --deps "G.2" \
  --acceptance "Webview with previews, filters, highlighted terms (optional enhancement)"
```

---

*UDP-1: Ready to approve this plan?*
