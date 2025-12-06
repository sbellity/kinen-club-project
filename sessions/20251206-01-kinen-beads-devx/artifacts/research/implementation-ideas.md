# Implementation Ideas: Synthesis from kinen-rs & kinen-go

## Overview

This document extracts the best implementation patterns from the Rust and Go implementations, synthesized for the TypeScript-based kinen CLI.

---

## Core Architecture Principle: Files as Truth

**Primary storage = Filesystem (Git-versioned)**
- Rounds, artifacts, resources, memories → Markdown files
- Human-readable, portable, diffable
- Git tracks all changes

**LanceDB = Derived Index (ephemeral, NOT versioned)**
- Fully rebuildable from source artifacts
- Lives in `~/.local/share/kinen/indices/`
- Never committed to Git
- Can be deleted and rebuilt anytime

```
┌─────────────────────────────────────────────────────────────┐
│                    SOURCE OF TRUTH                          │
│                 (Git-versioned files)                       │
├─────────────────────────────────────────────────────────────┤
│  sessions/                                                  │
│  ├── 20251206-01-auth/                                      │
│  │   ├── init.md                                            │
│  │   ├── rounds/01-foundation.md                            │
│  │   ├── artifacts/technical-spec.md                        │
│  │   └── memories/                    ← extracted memories  │
│  └── ...                                                    │
│  resources/                                                 │
│  └── papers/, links.md, ...                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ index build / watch
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    DERIVED INDEX                            │
│              (NOT versioned, rebuildable)                   │
├─────────────────────────────────────────────────────────────┤
│  ~/.local/share/kinen/indices/{space-hash}/                 │
│  ├── chunks.lance/      ← LanceDB: embeddings + FTS         │
│  └── metadata.json      ← Index state, stats                │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- Clone repo → rebuild index → fully functional
- No binary blobs in Git
- Index corruption? Just rebuild
- Works offline, no server dependencies

---

## 1. Storage Layer

### File-First Design

```typescript
// lib/storage/files.ts
export interface FileStore {
  // Read operations (from filesystem)
  readSession(name: string): Promise<Session>;
  readRound(session: string, round: string): Promise<Round>;
  readArtifact(session: string, name: string): Promise<Artifact>;
  listSessions(): Promise<string[]>;
  
  // Write operations (to filesystem)
  writeRound(session: string, round: string, content: string): Promise<void>;
  writeArtifact(session: string, name: string, content: string): Promise<void>;
  writeMemory(session: string, memory: MemoryEntry): Promise<void>;
}

// Memories are also files
// sessions/20251206-01-auth/memories/
//   ├── decision-001.md
//   ├── decision-002.md
//   └── index.json  ← manifest with metadata
```

### LanceDB as Pure Index

LanceDB is ONLY for search acceleration:
- Native FTS (Tantivy)
- Native vector search
- Hybrid search in one query
- TypeScript SDK

```typescript
// lib/index/lance.ts
import * as lancedb from '@lancedb/lancedb';

export class LanceIndex {
  private db: lancedb.Connection;
  
  // Index is derived, can always be rebuilt
  async rebuild(sessionsPath: string): Promise<void> {
    // 1. Delete existing index
    await this.drop();
    
    // 2. Scan all markdown files
    const files = await glob(`${sessionsPath}/**/*.md`);
    
    // 3. Chunk and embed each file
    for (const file of files) {
      const chunks = await chunkMarkdown(await readFile(file));
      const embeddings = await embed(chunks.map(c => c.content));
      await this.insert(chunks, embeddings, file);
    }
  }
  
  // Search is read-only on the index
  async search(query: string, options: SearchOptions): Promise<SearchResult[]> {
    // ...
  }
}
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

### Core Principle: Memories are Files Too

Memories are extracted from sessions and stored as markdown files:

```
sessions/20251206-01-auth/
├── init.md
├── rounds/
├── artifacts/
└── memories/                    ← NEW: extracted memories
    ├── decisions.md             ← All decisions from this session
    ├── insights.md              ← Synthesized insights
    └── manifest.json            ← Metadata for indexing
```

**Why files?**
- Git-versioned like everything else
- Human-readable and editable
- Can be referenced, linked, discussed
- Index is just for search, not storage

### Memory File Format

```markdown
<!-- memories/decisions.md -->
# Decisions from 20251206-01-auth

## D1: Use OAuth2 with PKCE for mobile

**Source**: Round 2, Q2.3
**Confidence**: 0.9
**Tags**: auth, mobile, security

We decided to use OAuth2 with PKCE for the mobile app authentication
because it provides better security for public clients without requiring
a client secret.

---

## D2: LanceDB for hybrid search

**Source**: Round 3, Q3.1
**Confidence**: 0.85
**Tags**: search, database, architecture

LanceDB chosen over SQLite+extensions because it provides native hybrid
search (FTS + vector) in one package with a simpler API.
```

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

### Recommendation: Session-End Extraction to Files

For MVP, extract decisions at session end and write to files:

```typescript
// lib/memory/consolidate.ts
export interface MemoryEntry {
  id: string;
  content: string;
  type: 'decision' | 'pattern' | 'insight';
  sourceSession: string;
  sourceRound?: string;
  confidence: number;
  tags: string[];
  createdAt: Date;
}

export async function consolidateSession(sessionPath: string): Promise<void> {
  // 1. Read all rounds
  const rounds = await readRounds(sessionPath);
  
  // 2. Extract decisions (look for decision markers in rounds)
  const decisions = extractDecisions(rounds);
  
  // 3. Write to memories/ directory (FILES, not database)
  const memoriesDir = path.join(sessionPath, 'memories');
  await ensureDir(memoriesDir);
  
  // Write decisions.md
  const decisionsContent = formatDecisionsMarkdown(decisions);
  await writeFile(path.join(memoriesDir, 'decisions.md'), decisionsContent);
  
  // Write manifest for indexing metadata
  const manifest = {
    session: path.basename(sessionPath),
    extracted_at: new Date().toISOString(),
    counts: { decisions: decisions.length }
  };
  await writeFile(path.join(memoriesDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  
  // 4. Trigger index update (async, non-blocking)
  indexQueue.add(memoriesDir);
}

function formatDecisionsMarkdown(decisions: MemoryEntry[]): string {
  return `# Decisions\n\n${decisions.map(d => `
## ${d.id}: ${d.content.split('\n')[0]}

**Source**: ${d.sourceRound || 'Session'}
**Confidence**: ${d.confidence}
**Tags**: ${d.tags.join(', ')}

${d.content}

---
`).join('\n')}`;
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

### What Gets Versioned vs Ignored

```gitignore
# .gitignore - Index is NEVER versioned
# (add to space root)

# LanceDB index (derived, rebuildable)
.lance/
*.lance/

# Daemon state
.kinen/daemon.pid
.kinen/daemon.sock
```

### Unified Config Schema

```yaml
# ~/.config/kinen/config.yml (global)
# or .kinen/config.yml (per-space)

# Space settings
space:
  default: personal
  
# Index settings (derived, not versioned)
index:
  path: ~/.local/share/kinen/indices  # Outside project!
  embedding_model: nomic-embed-text
  embedding_provider: ollama
  chunk_size: 512
  chunk_overlap: 50

# Search settings
search:
  default_mode: hybrid
  default_limit: 10
  context_chunks: 2

# Consolidation settings (output = markdown files)
consolidation:
  on_session_close: true
  extract_decisions: true
  confidence_threshold: 0.7
  output_format: markdown  # Always files!

# Daemon settings
daemon:
  auto_start: true
  idle_shutdown_minutes: 10
  watch_debounce_ms: 1000
```

### File Structure Summary

```
space-root/                    ← Git repo
├── .kinen/
│   └── config.yml             ← Space config (versioned)
├── sessions/                  ← Source of truth (versioned)
│   └── 2024xxxx-*/
│       ├── init.md
│       ├── rounds/
│       ├── artifacts/
│       └── memories/          ← Extracted memories (versioned)
├── resources/                 ← Reference materials (versioned)
└── .gitignore                 ← Excludes index

~/.local/share/kinen/          ← System location
└── indices/
    └── {space-hash}/          ← Derived index (NOT versioned)
        ├── chunks.lance/
        └── metadata.json
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

---

## 11. Obsidian Integration

### Core Principle: kinen space = Obsidian vault

No translation layer — the same files work in both.

### Wiki-Links in kinen Content

```typescript
// lib/markdown/wikilinks.ts
const WIKILINK_REGEX = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;

export function parseWikiLinks(content: string): WikiLink[] {
  const links: WikiLink[] = [];
  let match;
  while ((match = WIKILINK_REGEX.exec(content)) !== null) {
    links.push({
      target: match[1],
      display: match[3] || match[1],
      position: match.index
    });
  }
  return links;
}

export function renderWikiLink(target: string, display?: string): string {
  return display ? `[[${target}|${display}]]` : `[[${target}]]`;
}
```

### Standardized Frontmatter

```typescript
// lib/frontmatter/schemas.ts
export interface SessionFrontmatter {
  type: 'kinen-session';
  status: 'active' | 'completed' | 'archived';
  created: string;  // ISO date
  topic: string;
  session_type: 'architecture' | 'implementation' | 'research' | 'writing';
  goals: string[];
  tags: string[];
  related_sessions: string[];  // Wiki-links
}

export interface RoundFrontmatter {
  type: 'kinen-round';
  session: string;  // Wiki-link
  round_number: number;
  focus: string;
  status: 'draft' | 'in-progress' | 'answered';
  questions: number;
  answered: number;
}

export interface DecisionFrontmatter {
  type: 'decision';
  id: string;
  session: string;  // Wiki-link
  round: number;
  confidence: number;
  tags: string[];
  related: string[];  // Wiki-links
  supersedes?: string;
  superseded_by?: string;
}
```

### URI Deep-Linking

```typescript
// lib/obsidian/uri.ts
export function obsidianUri(vault: string, action: ObsidianAction): string {
  const base = 'obsidian://';
  
  switch (action.type) {
    case 'open':
      return `${base}open?vault=${encodeURIComponent(vault)}&file=${encodeURIComponent(action.file)}`;
    
    case 'search':
      return `${base}search?vault=${encodeURIComponent(vault)}&query=${encodeURIComponent(action.query)}`;
    
    case 'new':
      return `${base}new?vault=${encodeURIComponent(vault)}&name=${encodeURIComponent(action.name)}&content=${encodeURIComponent(action.content)}`;
  }
}

// Usage:
const uri = obsidianUri('kinen', { 
  type: 'open', 
  file: 'sessions/20251206-01-devx/rounds/01-foundation.md' 
});
// Opens file in Obsidian
await exec(`open "${uri}"`);
```

### Dataview Dashboard Templates

```typescript
// templates/obsidian/dashboard.md
export const dashboardTemplate = `
# kinen Dashboard

## Active Sessions
\`\`\`dataview
TABLE status, file.cday as "Started"
FROM "sessions"
WHERE contains(file.name, "init") AND status = "active"
SORT file.cday DESC
\`\`\`

## Recent Decisions
\`\`\`dataview
TABLE confidence, session, round
FROM "sessions"
WHERE type = "decision"
SORT file.mday DESC
LIMIT 10
\`\`\`

## Unresolved Questions
\`\`\`dataview
LIST
FROM "sessions"
WHERE type = "question" AND status != "answered"
\`\`\`
`;
```

### Obsidian Plugin Structure

```typescript
// obsidian-plugin/main.ts
import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';

export default class KinenPlugin extends Plugin {
  private daemon: KinenDaemonClient;
  
  async onload() {
    // Connect to kinen daemon
    this.daemon = await KinenDaemonClient.connect();
    
    // Register commands
    this.addCommand({
      id: 'kinen-new-session',
      name: 'New Session',
      callback: () => this.newSession()
    });
    
    this.addCommand({
      id: 'kinen-new-round',
      name: 'New Round',
      callback: () => this.newRound()
    });
    
    this.addCommand({
      id: 'kinen-search',
      name: 'Semantic Search',
      callback: () => this.openSearch()
    });
    
    // Register view
    this.registerView(
      'kinen-sessions-view',
      (leaf) => new SessionsView(leaf, this)
    );
    
    // Add ribbon icon
    this.addRibbonIcon('brain', 'kinen', () => {
      this.activateView();
    });
  }
  
  async newSession() {
    const modal = new NewSessionModal(this.app);
    const { name, type } = await modal.open();
    
    const session = await this.daemon.createSession(name, type);
    
    // Open init.md in editor
    const file = this.app.vault.getAbstractFileByPath(
      `sessions/${session.dirname}/init.md`
    );
    if (file instanceof TFile) {
      await this.app.workspace.getLeaf().openFile(file);
    }
  }
  
  async semanticSearch(query: string) {
    return await this.daemon.search({
      query,
      mode: 'hybrid',
      limit: 20
    });
  }
}
```

---

## 12. Implementation Priority (Updated)

With Obsidian integration, recommended order:

### Week 1: Core Search + Obsidian Compatibility
- [ ] LanceDB integration
- [ ] Markdown chunking with wiki-link awareness
- [ ] Ollama embeddings
- [ ] `kinen search` CLI
- [ ] `kinen_search` MCP tool
- [ ] **Frontmatter standardization** (Obsidian Properties compatible)
- [ ] **Wiki-link support** in generated content

### Week 2: Background Indexing + Obsidian Setup
- [ ] File watcher daemon
- [ ] Delta indexing (content hash)
- [ ] Auto-start on first search
- [ ] `kinen daemon` commands
- [ ] **`kinen init --obsidian`** — creates `.obsidian/` config
- [ ] **Dataview dashboard templates**

### Week 3: Memory Consolidation
- [ ] Decision extraction to files
- [ ] Memory entries as markdown
- [ ] `kinen recall` CLI
- [ ] Session-end trigger
- [ ] **Frontmatter for decisions** (queryable in Dataview)

### Week 4: Editors Integration
- [ ] VSCode extension updates (search, status)
- [ ] **Obsidian plugin** (basic: commands, search)
- [ ] URI deep-linking from CLI
- [ ] Documentation

---

## References

- kinen-rs: `/Users/sbellity/code/p/kinen-rs`
- kinen-go: `/Users/sbellity/code/p/kinen-go`
- Research sessions: `/Users/sbellity/code/p/kinen-rs/research/sessions/`
- [[obsidian-integration|Obsidian Integration Research]]
- [Obsidian Plugin API](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Dataview Documentation](https://blacksmithgu.github.io/obsidian-dataview/)

