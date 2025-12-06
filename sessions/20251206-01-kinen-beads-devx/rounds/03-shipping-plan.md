# Round 3: Concrete Shipping Plan

## Research Synthesis

### From kinen-rs (Rust)

**Key innovations:**
- **Clean architecture**: Interface layer (CLI/MCP/HTTP) → Service layer → Domain → Storage
- **Hybrid search**: FTS + vector with multiple strategies (keyword-first, semantic reranking, RRF)
- **Space-based multi-tenancy**: All data scoped by space_id
- **Memory consolidation**: FEP-inspired phases (micro, NREM, REM consolidation)
- **Research notes**: LLM-generated digests linked via knowledge graph

**What worked:**
- Repository pattern with clear interfaces
- SQLite + FTS5 + vector (sqlite-vec)
- Modular crates for different concerns

**What was over-engineered:**
- Too many crates (15+)
- Complex FEP-based consolidation before basic search worked
- Multiple backend abstractions before shipping one

### From kinen-go (Go + lightmem)

**Key innovations:**
- **Two-stage buffering**: Sensory → Short-term → Long-term (mirrors cognitive model)
- **Pipeline architecture**: Normalize → Compress → Segment → Buffer → Extract → Embed → Store
- **Local ML inference**: Ollama for embeddings + extraction
- **Fact extraction**: Extract discrete facts from conversation segments
- **Memory entries**: Rich schema with categories, timestamps, hit counts

**What worked:**
- Clear pipeline stages
- Token-based thresholds for processing
- Factory pattern for swappable backends
- SQLite + sqlite-vss (simpler than LanceDB)

**What was over-engineered:**
- gRPC service for compression (could be optional)
- Complex segmentation before basic flow worked

### Decision Matrix

| Capability | kinen-rs | kinen-go | **Recommendation** |
|------------|----------|----------|-------------------|
| Language | Rust | Go | **TypeScript** (matches existing kinen CLI) |
| Vector DB | SQLite + sqlite-vec | SQLite + sqlite-vss | **SQLite + better-sqlite3-vec** |
| Embeddings | External | Ollama | **Ollama** (local, free) |
| Search | FTS5 + vector hybrid | Vector only | **Hybrid** (FTS5 + vector) |
| Buffering | None | Two-stage | **Simplified** (session-based) |
| Consolidation | FEP complex | None | **Session-end extraction** |

---

## Shipping Philosophy

> **"Make it work, make it right, make it fast"**

The prior implementations got stuck in "make it right" before "make it work" shipped.

### What We're NOT Building (Yet)

- ❌ Multi-backend storage abstraction
- ❌ gRPC services
- ❌ Complex FEP consolidation
- ❌ Real-time streaming indexing
- ❌ Cross-space federation
- ❌ Research notes generation

### What We ARE Shipping

- ✅ SQLite-based index that works
- ✅ Hybrid search (FTS + vector) that finds things
- ✅ Session indexing on close
- ✅ `kinen search` CLI command
- ✅ `kinen_search` MCP tool
- ✅ Simple daemon for file watching

---

## Phase 1: Working Search (1 week)

**Goal**: `kinen search "auth"` returns relevant chunks from sessions.

### Components

```
kinen/src/
├── lib/
│   ├── index/
│   │   ├── db.ts          # SQLite + sqlite-vec setup
│   │   ├── chunker.ts     # Markdown → chunks
│   │   ├── embedder.ts    # Ollama embedding client
│   │   └── search.ts      # Hybrid search (FTS + vector)
│   └── ...existing...
├── commands/
│   ├── search.ts          # CLI: kinen search
│   └── index.ts           # CLI: kinen index rebuild/status
└── mcp.ts                 # Add kinen_search tool
```

### Database Schema (SQLite)

```sql
-- Chunks table with FTS5
CREATE TABLE chunks (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL,
  path TEXT NOT NULL,           -- e.g., sessions/20251206-01-auth/rounds/01.md
  content TEXT NOT NULL,
  chunk_index INTEGER,
  start_line INTEGER,
  end_line INTEGER,
  document_type TEXT,           -- round | artifact | resource
  session_name TEXT,
  created_at TEXT,
  content_hash TEXT             -- For delta updates
);

CREATE VIRTUAL TABLE chunks_fts USING fts5(
  content,
  content='chunks',
  content_rowid='rowid'
);

-- Vector table (sqlite-vec)
CREATE VIRTUAL TABLE chunks_vec USING vec0(
  id TEXT PRIMARY KEY,
  embedding float[384]          -- all-MiniLM-L6-v2
);

-- Edges table (wiki links)
CREATE TABLE edges (
  source_path TEXT,
  target_path TEXT,
  link_text TEXT,
  PRIMARY KEY (source_path, target_path)
);
```

### Embedder (Ollama)

```typescript
// lib/index/embedder.ts
import Ollama from 'ollama';

const MODEL = 'nomic-embed-text';  // or all-minilm

export async function embed(texts: string[]): Promise<number[][]> {
  const ollama = new Ollama();
  const results = await Promise.all(
    texts.map(text => ollama.embeddings({ model: MODEL, prompt: text }))
  );
  return results.map(r => r.embedding);
}
```

### Chunker (Markdown)

```typescript
// lib/index/chunker.ts
export interface Chunk {
  content: string;
  startLine: number;
  endLine: number;
  heading?: string;
}

export function chunkMarkdown(content: string, maxTokens = 512): Chunk[] {
  // Split by headings, then by size
  // Preserve heading context in each chunk
}
```

### Search (Hybrid)

```typescript
// lib/index/search.ts
export interface SearchResult {
  chunk: { content: string; startLine: number; endLine: number };
  source: { path: string; type: string; session?: string };
  score: number;
  matchType: 'fts' | 'vector' | 'hybrid';
}

export async function search(
  query: string,
  options: { mode?: 'hybrid' | 'fts' | 'vector'; limit?: number }
): Promise<SearchResult[]> {
  // 1. FTS search with BM25
  const ftsResults = await ftsSearch(query, options.limit * 2);
  
  // 2. Vector search
  const queryEmbedding = await embed([query]);
  const vecResults = await vectorSearch(queryEmbedding[0], options.limit * 2);
  
  // 3. RRF fusion
  return reciprocalRankFusion(ftsResults, vecResults, options.limit);
}
```

### CLI Commands

```bash
# Search
kinen search "authentication flow"
kinen search "auth" --type rounds
kinen search "deployment" --semantic

# Index management
kinen index status              # Show stats
kinen index rebuild             # Full rebuild
kinen index rebuild --session auth-design  # Single session
```

### MCP Tool

```typescript
// Add to mcp.ts
{
  name: 'kinen_search',
  description: 'Search across kinen sessions using hybrid FTS + semantic search',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      mode: { type: 'string', enum: ['hybrid', 'fts', 'semantic'] },
      type: { type: 'string', enum: ['rounds', 'artifacts', 'resources', 'all'] },
      session: { type: 'string', description: 'Filter to specific session' },
      limit: { type: 'number', default: 10 },
      context_chunks: { type: 'number', default: 2 }
    },
    required: ['query']
  }
}
```

### Dependencies

```json
{
  "dependencies": {
    "better-sqlite3": "^11.0.0",
    "sqlite-vec": "^0.1.0",
    "ollama": "^0.5.0"
  }
}
```

### Acceptance Criteria

- [ ] `kinen search "auth"` returns relevant results
- [ ] Results include source path, line numbers, score
- [ ] FTS finds exact matches
- [ ] Vector finds semantically similar content
- [ ] Index survives restart (persistent SQLite)
- [ ] `kinen index rebuild` works
- [ ] MCP tool works in Cursor

---

## Phase 2: Background Daemon (1 week)

**Goal**: Index stays up-to-date automatically.

### Daemon Design

```typescript
// lib/daemon/index.ts
export class KinenDaemon {
  private watcher: FSWatcher;
  private db: Database;
  private indexQueue: Set<string>;
  
  async start(): Promise<void> {
    // Watch sessions directory
    this.watcher = watch(getSessionsPath(), { recursive: true });
    this.watcher.on('change', (path) => this.onFileChange(path));
    
    // Process queue periodically
    setInterval(() => this.processQueue(), 5000);
  }
  
  private async onFileChange(path: string): void {
    if (path.endsWith('.md')) {
      this.indexQueue.add(path);
    }
  }
  
  private async processQueue(): void {
    for (const path of this.indexQueue) {
      await this.indexFile(path);
      this.indexQueue.delete(path);
    }
  }
}
```

### CLI Commands

```bash
kinen daemon start              # Start in background
kinen daemon stop               # Stop daemon
kinen daemon status             # Show status
```

### Auto-Start Strategy

- **Option chosen**: On-demand with idle shutdown
- First `kinen search` auto-starts daemon
- Daemon shuts down after 10 min idle
- User can also manually start for continuous operation

### Acceptance Criteria

- [ ] Daemon starts on first search
- [ ] File changes are detected within 5s
- [ ] Changed files are re-indexed automatically
- [ ] Daemon shuts down after idle period
- [ ] `kinen daemon status` shows index stats

---

## Phase 3: Session-End Consolidation (1 week)

**Goal**: When session closes, extract key decisions into searchable memory.

### Consolidation Pipeline

```
Session closed (session-summary.md created)
    │
    ▼
Extract decisions from all rounds
    │
    ▼
Generate memory entries:
- Decision text
- Source session + round
- Category (architecture, implementation, etc.)
- Confidence score
    │
    ▼
Embed and store in memory table
    │
    ▼
Available via kinen recall
```

### Memory Schema

```sql
CREATE TABLE memories (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT,                    -- decision | pattern | insight
  source_session TEXT,
  source_round TEXT,
  category TEXT,
  confidence REAL,
  embedding BLOB,
  created_at TEXT
);
```

### CLI Commands

```bash
kinen recall "authentication"   # Search memories
kinen memories list             # List recent memories
kinen memories show <id>        # Show memory with source
```

### Acceptance Criteria

- [ ] Session close triggers consolidation
- [ ] Decisions extracted from rounds
- [ ] Memories searchable via `kinen recall`
- [ ] Memory shows source session + round

---

## Phase 4: VSCode + beads Integration (1 week)

**Goal**: Unified devx in VSCode.

### VSCode Extension Updates

- Add semantic search panel
- Show related sessions in sidebar
- beads issues panel alongside sessions
- Status bar: current session + ready issues

### beads Integration

- Session summary suggests issues
- Issues link to source sessions
- `bd show` includes session reference

### Acceptance Criteria

- [ ] VSCode search palette works
- [ ] Related sessions shown in sidebar
- [ ] beads issues visible in extension
- [ ] Issue creation from session decisions

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **1. Working Search** | Week 1 | `kinen search` CLI + MCP |
| **2. Background Daemon** | Week 2 | Auto-indexing, file watching |
| **3. Consolidation** | Week 3 | Session-end memory extraction |
| **4. Integration** | Week 4 | VSCode + beads |

**Total: 4 weeks to shippable product**

---

## Risk Mitigation

### Risk: Ollama not installed

**Mitigation**: 
- Check for Ollama on first use
- Provide clear install instructions
- Fall back to FTS-only search if no embeddings

### Risk: Large spaces slow to index

**Mitigation**:
- Delta indexing via content hash
- Background indexing with progress
- Limit initial index to recent sessions

### Risk: SQLite-vec installation issues

**Mitigation**:
- Document platform-specific install
- Provide pre-built binaries
- Fall back to FTS-only if vec unavailable

---

## What We're Deferring

| Feature | Why Defer | When Later |
|---------|-----------|------------|
| LanceDB | sqlite-vec simpler, works | If scale issues |
| Cross-space search | Per-space first | After basic works |
| Research notes | Core search first | After consolidation |
| Complex FEP consolidation | Simple extraction first | If needed |
| gRPC services | Direct Ollama simpler | If performance issues |

---

## Next Steps

1. **Today**: Create beads issues for Phase 1 tasks
2. **This week**: Ship `kinen search` CLI
3. **Validate**: Does it actually help find things?
4. **Iterate**: Based on real usage

Ready to start implementation?

