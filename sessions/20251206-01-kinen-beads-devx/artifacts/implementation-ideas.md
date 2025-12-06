# Implementation Ideas: Synthesis from kinen-rs & kinen-go

## Overview

This document extracts the best implementation patterns from the Rust and Go implementations, synthesized for the TypeScript-based kinen CLI.

---

## 1. Storage Layer

### From kinen-rs: Clean Abstractions

```rust
// Repository trait pattern
#[async_trait]
pub trait DocumentRepository: Send + Sync {
    async fn create(&self, doc: &Document) -> Result<()>;
    async fn get(&self, id: &str) -> Result<Option<Document>>;
    async fn search(&self, query: &SearchQuery) -> Result<Vec<SearchResult>>;
}
```

**Carry forward:**
- Repository pattern for data access
- Trait-based design for swappable backends
- Space-based multi-tenancy (all queries scoped by space_id)

### From kinen-go: SQLite + VSS

```go
// Registration pattern for storage backends
func init() {
    storage.RegisterStorage("sqlite", func(cfg StorageConfig) (Storage, error) {
        return NewSQLiteStorage(cfg.SQLitePath, cfg.EmbeddingDims, cfg.SQLiteVSS)
    })
}
```

**Carry forward:**
- Factory pattern for storage creation
- SQLite as default (portable, no server)
- Vector support via extension (sqlite-vss or LanceDB)

### Recommendation: LanceDB

LanceDB provides both features in one package:
- Native FTS (Tantivy)
- Native vector search
- Single database to manage
- TypeScript SDK

```typescript
// Simplified implementation
import * as lancedb from '@lancedb/lancedb';

const db = await lancedb.connect('~/.local/share/kinen/indices/default');
const table = await db.openTable('chunks');

// Hybrid search in one call
const results = await table.search(query).limit(10).toArray();
```

---

## 2. Embedding Pipeline

### From kinen-go: Local Inference

```go
type MLConfig struct {
    EmbedderProvider  string // "ollama" | "grpc" | "openai"
    OllamaEndpoint    string
    OllamaEmbedModel  string // "nomic-embed-text"
}
```

**Carry forward:**
- Ollama for local, free embeddings
- Provider abstraction for flexibility
- Batch embedding support

### Recommendation: Ollama Default

```typescript
// lib/index/embedder.ts
import Ollama from 'ollama';

export class OllamaEmbedder {
  private client: Ollama;
  private model = 'nomic-embed-text';
  
  async embed(texts: string[]): Promise<number[][]> {
    const results = await Promise.all(
      texts.map(text => 
        this.client.embeddings({ model: this.model, prompt: text })
      )
    );
    return results.map(r => r.embedding);
  }
  
  async health(): Promise<boolean> {
    try {
      await this.client.list();
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## 3. Chunking Strategy

### From kinen-go: Token-Based Buffers

```go
type SensoryBuffer struct {
    maxTokens    int
    tokenCounter *TokenCounter
    buffer       []Message
}

// Only count user messages for thresholds
func (b *SensoryBuffer) AddMessages(msgs []Message) []Segment {
    for _, msg := range msgs {
        if msg.Role == "user" {
            b.tokenCount += b.tokenCounter.Count(msg.Content)
        }
        b.buffer = append(b.buffer, msg)
        
        if b.ShouldTrigger() {
            return b.CutMessages()
        }
    }
    return nil
}
```

### From kinen-rs: Content-Aware Chunking

```rust
// Semantic chunking for markdown
fn chunk_markdown(content: &str, max_tokens: usize) -> Vec<Chunk> {
    let sections = split_by_headings(content);
    
    sections.flat_map(|section| {
        if token_count(&section) > max_tokens {
            split_by_paragraphs(section, max_tokens)
        } else {
            vec![section]
        }
    }).collect()
}
```

### Recommendation: Hybrid Chunking

```typescript
// lib/index/chunker.ts
export interface Chunk {
  id: string;
  content: string;
  startLine: number;
  endLine: number;
  heading?: string;
  documentPath: string;
}

export function chunkMarkdown(
  content: string, 
  path: string,
  options: { maxTokens?: number; overlap?: number } = {}
): Chunk[] {
  const { maxTokens = 512, overlap = 50 } = options;
  
  // 1. Split by headings
  const sections = splitByHeadings(content);
  
  // 2. For each section, split by paragraphs if too long
  return sections.flatMap(section => {
    if (estimateTokens(section.content) > maxTokens) {
      return splitByParagraphs(section, maxTokens, overlap);
    }
    return [section];
  });
}
```

---

## 4. Search Architecture

### From kinen-rs: Hybrid Strategies

```rust
pub enum SearchStrategy {
    FtsOnly,           // Pure text search
    VectorOnly,        // Pure semantic
    KeywordFirst,      // FTS primary, vector fallback
    SemanticReranking, // FTS candidates, reranked by vector
    RRF,               // Reciprocal Rank Fusion
}
```

### From kinen-go: Configurable Retrieval

```go
type Config struct {
    IndexStrategy    string // "embedding" | "context" | "hybrid"
    RetrieveStrategy string // "embedding" | "context" | "hybrid"
}
```

### Recommendation: RRF Default

```typescript
// lib/index/search.ts
export interface SearchResult {
  chunk: Chunk;
  source: { path: string; type: string; session?: string };
  score: number;
  matchType: 'fts' | 'vector' | 'hybrid';
}

export async function search(
  query: string,
  options: { 
    mode?: 'hybrid' | 'fts' | 'vector';
    limit?: number;
    contextChunks?: number;
  } = {}
): Promise<SearchResult[]> {
  const { mode = 'hybrid', limit = 10, contextChunks = 2 } = options;
  
  if (mode === 'fts') {
    return ftsSearch(query, limit);
  }
  
  if (mode === 'vector') {
    const embedding = await embed([query]);
    return vectorSearch(embedding[0], limit);
  }
  
  // Hybrid: RRF fusion
  const [ftsResults, vecResults] = await Promise.all([
    ftsSearch(query, limit * 2),
    vectorSearch(await embed([query]).then(e => e[0]), limit * 2)
  ]);
  
  return reciprocalRankFusion(ftsResults, vecResults, limit);
}

function reciprocalRankFusion(
  fts: SearchResult[], 
  vec: SearchResult[], 
  limit: number,
  k = 60
): SearchResult[] {
  const scores = new Map<string, number>();
  
  fts.forEach((r, i) => {
    const prev = scores.get(r.chunk.id) || 0;
    scores.set(r.chunk.id, prev + 1 / (k + i));
  });
  
  vec.forEach((r, i) => {
    const prev = scores.get(r.chunk.id) || 0;
    scores.set(r.chunk.id, prev + 1 / (k + i));
  });
  
  // Sort by RRF score, return top limit
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, score]) => ({
      ...findChunk(id, fts, vec),
      score,
      matchType: 'hybrid'
    }));
}
```

---

## 5. Memory Consolidation

### From kinen-rs: FEP-Inspired Design

```rust
// Logical clock based on accumulated surprisal
struct FEPLogicalClock {
    epoch: u64,
    accumulated_surprisal: f64,
    threshold: f64,
}

impl FEPLogicalClock {
    fn observe(&mut self, prediction_error: f64, precision: f64) {
        self.accumulated_surprisal += precision * prediction_error.powi(2);
        
        if self.accumulated_surprisal > self.threshold {
            self.epoch += 1;
            self.accumulated_surprisal = 0.0;
            self.trigger_consolidation();
        }
    }
}
```

### From kinen-go: Fact Extraction

```go
type ExtractRequest struct {
    Segments []Segment
    Strategy string  // "user_only" | "assistant_only" | "hybrid"
}

type Fact struct {
    SourceID   int
    Fact       string
    Confidence float64
    Category   string
}
```

### Recommendation: Session-End Extraction

For MVP, simplify to session-end extraction:

```typescript
// lib/memory/consolidate.ts
export interface MemoryEntry {
  id: string;
  content: string;
  type: 'decision' | 'pattern' | 'insight';
  sourceSession: string;
  sourceRound?: string;
  confidence: number;
  embedding?: number[];
  createdAt: Date;
}

export async function consolidateSession(sessionPath: string): Promise<MemoryEntry[]> {
  // 1. Read all rounds
  const rounds = await readRounds(sessionPath);
  
  // 2. Extract decisions (look for decision markers in rounds)
  const decisions = extractDecisions(rounds);
  
  // 3. Generate embeddings
  const embeddings = await embed(decisions.map(d => d.content));
  
  // 4. Create memory entries
  return decisions.map((d, i) => ({
    id: generateId(),
    content: d.content,
    type: 'decision',
    sourceSession: path.basename(sessionPath),
    sourceRound: d.round,
    confidence: 0.85, // Explicit decisions get high confidence
    embedding: embeddings[i],
    createdAt: new Date()
  }));
}
```

---

## 6. Daemon Architecture

### From kinen-go: Pipeline Manager

```go
type Manager struct {
    config          *config.Config
    normalizer      NormalizerInterface
    compressor      CompressorInterface
    segmenter       SegmenterInterface
    embedder        EmbedderInterface
    extractor       ExtractorInterface
    storage         StorageInterface
}
```

### Recommendation: File-Watching Daemon

```typescript
// lib/daemon/index.ts
import { watch } from 'fs';
import { EventEmitter } from 'events';

export class KinenDaemon extends EventEmitter {
  private watcher?: ReturnType<typeof watch>;
  private indexQueue = new Set<string>();
  private processInterval?: NodeJS.Timeout;
  private idleTimeout?: NodeJS.Timeout;
  
  async start(sessionsPath: string): Promise<void> {
    // Watch for file changes
    this.watcher = watch(sessionsPath, { recursive: true }, (event, filename) => {
      if (filename?.endsWith('.md')) {
        this.indexQueue.add(path.join(sessionsPath, filename));
        this.resetIdleTimer();
      }
    });
    
    // Process queue periodically
    this.processInterval = setInterval(() => this.processQueue(), 5000);
    
    // Start idle timer
    this.resetIdleTimer();
    
    this.emit('started');
  }
  
  private async processQueue(): Promise<void> {
    if (this.indexQueue.size === 0) return;
    
    for (const filePath of this.indexQueue) {
      await this.indexFile(filePath);
      this.indexQueue.delete(filePath);
    }
    
    this.emit('indexed', { count: this.indexQueue.size });
  }
  
  private resetIdleTimer(): void {
    if (this.idleTimeout) clearTimeout(this.idleTimeout);
    
    // Shutdown after 10 minutes idle
    this.idleTimeout = setTimeout(() => {
      this.stop();
    }, 10 * 60 * 1000);
  }
  
  async stop(): Promise<void> {
    this.watcher?.close();
    if (this.processInterval) clearInterval(this.processInterval);
    if (this.idleTimeout) clearTimeout(this.idleTimeout);
    this.emit('stopped');
  }
}
```

---

## 7. MCP Integration

### From kinen-rs: Tool Schema

```rust
pub struct SearchTool {
    name: "kinen_search",
    description: "Search across kinen sessions",
    input_schema: SearchInput {
        query: String,
        strategy: Option<SearchStrategy>,
        limit: Option<usize>,
    }
}
```

### Recommendation: Current + Search Tools

Existing kinen MCP tools plus:

```typescript
// Add to mcp.ts
{
  name: 'kinen_search',
  description: 'Search across sessions using hybrid FTS + semantic search',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      mode: { type: 'string', enum: ['hybrid', 'fts', 'semantic'] },
      type: { type: 'string', enum: ['rounds', 'artifacts', 'resources', 'all'] },
      session: { type: 'string' },
      limit: { type: 'number', default: 10 },
      context_chunks: { type: 'number', default: 2 }
    },
    required: ['query']
  }
},
{
  name: 'kinen_recall',
  description: 'Search consolidated memories from past sessions',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      type: { type: 'string', enum: ['decision', 'pattern', 'insight', 'all'] },
      limit: { type: 'number', default: 5 }
    },
    required: ['query']
  }
},
{
  name: 'kinen_context',
  description: 'Get related sessions and memories for current work',
  inputSchema: {
    type: 'object',
    properties: {
      session: { type: 'string' },
      depth: { type: 'number', default: 1 }
    }
  }
}
```

---

## 8. CLI Commands

### Synthesis from Both Implementations

```bash
# Search (from both)
kinen search "authentication flow"
kinen search "auth" --type rounds
kinen search "deployment" --semantic
kinen search "api design" --json

# Index management (from kinen-rs)
kinen index status
kinen index rebuild
kinen index rebuild --session auth-design

# Recall (from kinen-go memory system)
kinen recall "authentication"
kinen memories list
kinen memories show <id>

# Daemon (new)
kinen daemon start
kinen daemon stop
kinen daemon status

# Resources (from prior session)
kinen resources add paper.pdf
kinen resources list
kinen resources search "transformers"
```

---

## 9. Configuration

### Unified Config Schema

```yaml
# ~/.config/kinen/config.yml

# Space settings
space:
  default: personal
  
# Index settings
index:
  path: ~/.local/share/kinen/indices
  embedding_model: nomic-embed-text
  embedding_provider: ollama
  chunk_size: 512
  chunk_overlap: 50

# Search settings
search:
  default_mode: hybrid
  default_limit: 10
  context_chunks: 2

# Consolidation settings
consolidation:
  on_session_close: true
  extract_decisions: true
  confidence_threshold: 0.7

# Daemon settings
daemon:
  auto_start: true
  idle_shutdown_minutes: 10
  watch_debounce_ms: 1000
```

---

## 10. Implementation Priority

Based on both implementations, recommended order:

### Week 1: Core Search
- [ ] LanceDB integration
- [ ] Markdown chunking
- [ ] Ollama embeddings
- [ ] `kinen search` CLI
- [ ] `kinen_search` MCP tool

### Week 2: Background Indexing
- [ ] File watcher daemon
- [ ] Delta indexing (content hash)
- [ ] Auto-start on first search
- [ ] `kinen daemon` commands

### Week 3: Memory Consolidation
- [ ] Decision extraction
- [ ] Memory entries table
- [ ] `kinen recall` CLI
- [ ] Session-end trigger

### Week 4: Integration
- [ ] VSCode extension updates
- [ ] beads issue linking
- [ ] Combined status views
- [ ] Documentation

---

## References

- kinen-rs: `/Users/sbellity/code/p/kinen-rs`
- kinen-go: `/Users/sbellity/code/p/kinen-go`
- Research sessions: `/Users/sbellity/code/p/kinen-rs/research/sessions/`

