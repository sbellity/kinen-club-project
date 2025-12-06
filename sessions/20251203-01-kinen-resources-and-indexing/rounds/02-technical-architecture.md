---
date: 2025-12-03
started_at: 2025-12-03T09:45:00+01:00
artifact_type: round_exploration
kinen_round: 2
kinen_status: in-progress
summary: "Deep dive into database technology, chunking, embedding, and graph indexing"
---





Key decisions from Round 1:
- **EPUB support** confirmed (was typo for "upib")
- **All use cases** are valid: reference docs, research, project context, datasets
- **Subdirectory organization** for resources, potentially template-dependent
- **PDF is must-have**, scanned PDFs not needed, layout not important
- **Hybrid search** (Option C) - both full-text and semantic
- **Per-space indices** (Option A), federation later via kinen tool
- **Graph indexing** for Obsidian-style wiki links between documents
- **Local embedding model** preferred
- **Lean approach** with focused libraries, but open to mastra.ai for memory system later
- **Situated chunks** - search results include context (N chunks before/after)
- **Inspired by ck** (BeaconBay/ck) for search UX




**sqlite-vec** is a SQLite extension by Alex Garcia that adds vector search:
- Native SQLite extension (loads via `db.loadExtension()`)
- Works with `better-sqlite3` in Node.js
- Supports L2 distance, cosine similarity, inner product
- Stores vectors as BLOB (compact)
- Can be combined with FTS5 for hybrid search

```typescript
// Example usage
import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';

const db = new Database('index.db');
sqliteVec.load(db);

// Create vector table
db.exec(`
  CREATE VIRTUAL TABLE chunks_vec USING vec0(
    embedding float[384]  -- for all-MiniLM-L6-v2
  );
`);

// FTS5 for full-text
db.exec(`
  CREATE VIRTUAL TABLE chunks_fts USING fts5(
    content, 
    content='chunks'
  );
`);
```

**Pros**: Single file, battle-tested SQLite, small footprint, works offline
**Cons**: Need to manage two virtual tables, manual hybrid ranking


LanceDB is an embedded vector database with native hybrid search:
- **Full-text search**: Built-in via Tantivy (Rust FTS engine) - added in 2024
- **Hybrid search**: Native support with reranking (RRF, linear combination)
- **Embedded**: No separate process, stores data in Lance format
- **Auto-embeddings**: Can use built-in embedding functions

```typescript
import * as lancedb from '@lancedb/lancedb';
import { EmbeddingFunction, register } from '@lancedb/lancedb/embedding';

// Connect (creates directory if needed)
const db = await lancedb.connect('~/.local/share/kinen/indices/abc123');

// Create table with FTS index
const table = await db.createTable('chunks', data);
await table.createIndex('content', { config: lancedb.Index.fts() });

// Hybrid search
const results = await table
  .search('authentication flow')
  .select(['content', 'metadata', 'path'])
  .limit(10)
  .toArray();
```

**Pros**: Native hybrid search, single DB, modern columnar format, good TS support
**Cons**: Larger dependency (~50MB native binaries), newer (less battle-tested)


**Not recommended** - requires running as a server process, which violates the "no background process" constraint.


For local embeddings (no API calls):

| Model | Dimensions | Size | Quality | Speed |
|-------|-----------|------|---------|-------|
| all-MiniLM-L6-v2 | 384 | 23MB | Good | Fast |
| bge-small-en-v1.5 | 384 | 33MB | Better | Fast |
| nomic-embed-text-v1 | 768 | 137MB | Best | Slower |

**Libraries for local inference**:
- `@xenova/transformers` - ONNX runtime, works in Node.js
- LanceDB built-in embedding functions (wraps transformers)


`ck` (BeaconBay/ck) is a Rust-based semantic code search tool with excellent UX:

**Key features to borrow**:
1. **Automatic indexing** - builds/updates index transparently on first search
2. **Chunk-level caching** - only re-embeds changed chunks (hash-based invalidation)
3. **Hybrid search with RRF** - Reciprocal Rank Fusion for combining FTS + vector results
4. **MCP server mode** - `ck --serve` for AI agent integration
5. **Configurable snippets** - `--snippet-length`, `--top-k`, `--threshold`
6. **JSONL output** - structured output for programmatic use
7. **`.ckignore` file** - separate from `.gitignore` for search-specific exclusions

**Concepts to adopt**:
- Delta indexing with content hashing
- Configurable context windows (N chunks before/after)
- Search modes: `--sem` (semantic), `--hybrid`, plain (grep-like)
- Score display with `--scores` flag




## Questions

### Q2.1: Database Technology Decision

**Context**: Based on research, here are the refined options:
**Option A: SQLite + sqlite-vec + FTS5**
- **Pros**: Minimal footprint (~5MB), battle-tested, single file, full control
- **Cons**: Manual hybrid search implementation, two virtual tables to sync
- **Risk**: sqlite-vec is newer, less ecosystem support
**Option B: LanceDB**
- **Pros**: Native hybrid search, single API, built-in embedding support, modern architecture
- **Cons**: Larger binary (~50MB), newer project, Lance format less transparent than SQLite
- **Risk**: Dependency on LanceDB team for maintenance
**Hybrid consideration**: We could use SQLite for metadata/graph/FTS and LanceDB only for vectors. But this adds complexity.
**My recommendation**: LanceDB feels like the better fit because:
1. Native hybrid search reduces code we need to write
2. Built-in embedding functions simplify the pipeline
3. Single database = simpler mental model
4. Actively maintained with good TypeScript support
**Questions**:
1. Are you comfortable with LanceDB as the primary choice?
2. Or would you prefer the more conservative SQLite + sqlite-vec approach?
3. Should we prototype both to compare?

> [!note] Answer
> Yes let's give LanceDB a go 

---

### Q2.2: Graph Storage for Wiki Links

**Context**: You want to index Obsidian-style links (`[[path|display]]`) as a graph.
**Options for graph storage**:
**Option A: Store edges in the same DB (LanceDB/SQLite)**
```typescript
// Edges table
interface Edge {
source_path: string;  // e.g., "sessions/auth/rounds/01-foundation.md"
target_path: string;  // e.g., "sessions/auth/artifacts/technical-spec.md"
link_text: string;    // The display text
context: string;      // Surrounding text for context
}
```
- Query: "What links to this document?" / "What does this link to?"
- Simple JOIN queries
**Option B: Separate graph DB (like embedded Neo4j or ArangoDB)**
- Overkill for this use case
- Heavy dependencies
**Option C: In-memory graph built at query time**
- Load edges from DB into memory when needed
- Use a lightweight graph library (`graphology`)
- Good for small-to-medium spaces
**My recommendation**: Option A (edges in same DB) with Option C as query-time optimization.
**Questions**:
1. What graph queries do you envision? (e.g., "find all related documents within 2 hops")
2. Is a simple "links to/from" enough, or do you need path-finding?
3. Should the graph be queryable via MCP tools?

> [!note] Answer
>

---

### Q2.3: Chunking Strategy

**Context**: Documents need to be split into chunks for embedding. Strategy matters for search quality.
**Options**:
**Option A: Fixed-size chunks** (e.g., 512 tokens with 50 token overlap)
- Simple, predictable
- May split mid-sentence/paragraph
**Option B: Semantic chunking** (by section/paragraph)
- Respects document structure
- Varying chunk sizes (harder to manage)
**Option C: Hybrid** - Semantic boundaries, then split large sections
- Best of both worlds
- More complex implementation
**For markdown documents** (rounds, artifacts):
- Natural boundaries: headings, paragraphs
- Frontmatter as separate metadata chunk
**For PDFs**:
- Page boundaries are natural but arbitrary
- Paragraphs are better but harder to detect
**My recommendation**: Option C (hybrid) for markdown, Option A for PDFs.
**Additional considerations**:
- Store chunk boundaries (start_line, end_line) for "situated chunks"
- Keep parent document reference for context retrieval
- Hash chunks for delta indexing (like ck does)
**Questions**:
1. What's your preferred chunk size for semantic search? (256, 512, 1024 tokens?)
2. Should frontmatter be searchable as content or just metadata?
3. For "situated chunks", how many context chunks before/after? (default: 2?)

> [!note] Answer
>

---

### Q2.4: Embedding Model Selection

**Context**: Local embedding is preferred. Options:
| Model | Dim | Size | Notes |
|-------|-----|------|-------|
| all-MiniLM-L6-v2 | 384 | 23MB | Industry standard, fast, good quality |
| bge-small-en-v1.5 | 384 | 33MB | Slightly better quality, still fast |
| nomic-embed-text-v1 | 768 | 137MB | Best quality, supports 8K context |
**Implementation options**:
**Option A: @xenova/transformers**
- Pure JS ONNX runtime
- Works in Node.js without native dependencies
- Slight cold-start latency (~2s first load)
**Option B: LanceDB built-in embeddings**
- Wraps transformers internally
- Cleaner API: just specify model name
- Less control over batching
**My recommendation**: Start with LanceDB built-in using `all-MiniLM-L6-v2`, upgrade model later if needed.
**Questions**:
1. Is cold-start latency (~2s) acceptable for CLI/MCP?
2. Do you anticipate needing longer context (8K) for some documents?
3. Should we support switching models later (requires re-indexing)?

> [!note] Answer
>

---

### Q2.5: Index Lifecycle & Delta Updates

**Context**: Following ck's approach - automatic indexing with smart updates.
**Proposed behavior**:
1. **First search**: Build full index (show progress)
2. **Subsequent searches**: Check for changes, update only modified chunks
3. **Explicit rebuild**: `kinen index rebuild` for full refresh
**Change detection**:
- Hash each chunk: `blake3(content + path + chunk_index)`
- Store hash in index
- On update: compare hashes, re-embed only changed chunks
**Index metadata** (`~/.local/share/kinen/indices/{origin-hash}/meta.json`):
```json
{
"space_origin": "git@github.com:user/space.git",
"space_name": "my-space",
"created_at": "2025-12-03T09:00:00Z",
"last_updated": "2025-12-03T09:30:00Z",
"model": "all-MiniLM-L6-v2",
"chunks_count": 1234,
"documents_count": 56
}
```
**Questions**:
1. Should indexing be fully automatic (on first search) or require explicit `kinen index init`?
2. How aggressive should garbage collection be? (remove orphaned chunks immediately or batch?)
3. Should we track index version for schema migrations?

> [!note] Answer
>

---

### Q2.6: Resources Directory Structure

**Context**: You want subdirectories, potentially template-dependent.
**Proposed default structure**:
```
resources/
├── .resources.yml          # Optional manifest with custom metadata
├── docs/                   # Documentation, specs
├── papers/                 # Research papers
├── examples/               # Code samples, templates
└── data/                   # Datasets (special indexing)
```
**Template variations** (future):
- **Technical**: `resources/{docs,apis,architecture,diagrams}/`
- **Creative writing**: `resources/{research,character-notes,worldbuilding}/`
- **Research**: `resources/{papers,datasets,notes}/`
**The `.resources.yml` manifest** (optional):
```yaml
resources:
- path: papers/attention-is-all-you-need.pdf
tags: [ml, transformers, foundational]
notes: "The original transformer paper"
- path: docs/api-spec.md
tags: [api, reference]
```
**Questions**:
1. Should the manifest be optional (pure filesystem) or encouraged?
2. Should we auto-create the default subdirectories on space init?
3. How should datasets be indexed differently? (sample rows? schema only?)

> [!note] Answer
>

---

### Q2.7: Search Result Format

**Context**: You want "situated chunks" with configurable context.
**Proposed result structure**:
```typescript
interface SearchResult {
// The matching chunk
chunk: {
content: string;
start_line: number;
end_line: number;
};
// Source document
source: {
path: string;           // "sessions/auth/rounds/01-foundation.md"
type: 'round' | 'artifact' | 'resource';
title: string;
metadata: Record<string, unknown>;  // Frontmatter, PDF metadata, etc.
};
// Context (configurable)
context: {
before: string[];       // Previous N chunks
after: string[];        // Next N chunks
};
// Relevance
score: number;
match_type: 'semantic' | 'fulltext' | 'hybrid';
}
```
**CLI output modes** (inspired by ck):
- Default: Pretty-printed with highlights
- `--json`: Full structured output
- `--jsonl`: One result per line (for piping)
- `--paths-only`: Just file paths (like `grep -l`)
**Questions**:
1. Is this result structure what you had in mind?
2. What should the default context window be? (N=2 chunks before/after?)
3. Should semantic and full-text scores be shown separately or just combined?

> [!note] Answer
>

---

### Q2.8: MCP Tools Design

**Context**: Building on Round 1 feedback and ck inspiration.
**Proposed MCP tools**:
```typescript
// Primary search tool
kinen_search({
query: string,
mode?: 'hybrid' | 'semantic' | 'fulltext',  // default: hybrid
type?: 'rounds' | 'artifacts' | 'resources' | 'all',
session?: string,           // Filter to specific session
top_k?: number,             // default: 10
threshold?: number,         // minimum score (0-1)
context_chunks?: number,    // default: 2 (before + after)
})
// Get related content for current work
kinen_context({
path?: string,              // Current document path
session?: string,           // Current session name
depth?: number,             // Graph traversal depth (default: 1)
})
// Index management
kinen_index_status()          // Stats, last updated, health
kinen_index_rebuild({
force?: boolean,            // Rebuild even if up-to-date
})
// Graph queries (new)
kinen_links({
path: string,               // Document to query
direction?: 'incoming' | 'outgoing' | 'both',
})
```
**Questions**:
1. Is this the right set of tools?
2. Should `kinen_search` auto-rebuild stale indices or require explicit rebuild?
3. Any other tools you'd want exposed to AI assistants?

> [!note] Answer
>

---

### Q2.9: CLI Commands Design

**Context**: Inspired by ck's UX, adapted for kinen.
**Proposed commands**:
```bash
kinen search "query"                    # Hybrid search (default)
kinen search "query" --semantic         # Semantic only
kinen search "query" --fulltext         # Full-text only
kinen search "query" --type rounds      # Filter by type
kinen search "query" --session auth     # Filter by session
kinen search "query" --json             # JSON output
kinen search "query" --context 3        # 3 chunks before/after
kinen index status                      # Show stats
kinen index rebuild                     # Full rebuild
kinen index rebuild --force             # Force even if fresh
kinen resources add <file>              # Copy to resources/
kinen resources add <file> --to docs    # Copy to resources/docs/
kinen resources list                    # List all resources
kinen resources search "query"          # Search resources only
kinen graph show <path>                 # Show links for document
kinen graph orphans                     # Find unlinked documents
```
**Questions**:
1. Does this command structure feel right?
2. Should there be a TUI mode like ck has (`kinen search --tui`)?
3. Any other commands you'd want?

> [!note] Answer
>

---

### Q2.10: Implementation Phases

**Context**: Breaking this into manageable phases.
**Phase 1: Core indexing (MVP)**
- [ ] LanceDB integration with hybrid search
- [ ] Markdown chunking (rounds, artifacts)
- [ ] Basic metadata extraction (frontmatter)
- [ ] `kinen search` CLI command
- [ ] `kinen_search` MCP tool
- [ ] Index stored in `~/.local/share/kinen/indices/{origin-hash}/`
**Phase 2: Resources & PDF**
- [ ] Resources directory support
- [ ] PDF extraction with `pdf-parse`
- [ ] EPUB extraction
- [ ] `kinen resources` CLI commands
**Phase 3: Graph & Links**
- [ ] Wiki link extraction
- [ ] Edge storage and querying
- [ ] `kinen graph` CLI commands
- [ ] `kinen_links` MCP tool
**Phase 4: Polish & Advanced**
- [ ] Delta indexing with content hashing
- [ ] `.kinenignore` file support
- [ ] TUI mode (optional)
- [ ] Cross-space federation
**Questions**:
1. Does this phasing make sense?
2. What's the priority order? (I assumed MVP first)
3. Any must-have features I've pushed too late?
This round refined the technical architecture based on research:
**Key proposals**:
- **LanceDB** as primary database (native hybrid search, built-in embeddings)
- **all-MiniLM-L6-v2** as default embedding model
- **Hybrid chunking** (semantic for markdown, fixed for PDF)
- **Graph edges** stored in same DB
- **Situated chunks** with configurable context window
- **ck-inspired UX** for CLI and MCP tools
- **4-phase implementation** plan
Your answers will finalize the architecture for implementation planning in Round 3.
**Next**: [[rounds/03-implementation-plan|Round 03 - Implementation Plan]]

> [!note] Answer
>

---


















