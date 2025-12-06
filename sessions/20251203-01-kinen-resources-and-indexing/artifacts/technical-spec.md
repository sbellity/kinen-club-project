---
date: 2025-12-03
created: 2025-12-03T09:16:39+01:00
artifact_type: technical_spec
aliases:
  - "kinen-resources-indexing - Technical Spec"
tags:
  - space/work
  - domain/architecture
  - tech/typescript
  - status/draft
last_updated: Round 02
---

# Kinen Resources & Indexing - Technical Specification

## Overview

Add two capabilities to the kinen tool:
1. **Resources directory** - A `resources/` folder in each space for PDFs, documents, and reference materials
2. **Local indexing** - Searchable index of all space content (rounds, artifacts, resources) stored in `~/.local/share/kinen`

## Decisions

| Decision | Round | Rationale |
|----------|-------|-----------|
| EPUB support required | R1 | Clarified typo - "upib" meant EPUB |
| Subdirectory organization for resources | R1 | Different resource types (docs, papers, examples) need organization |
| Template-dependent resource structure | R1 | Technical vs creative projects need different layouts |
| PDF must-have, OCR not needed | R1 | Layout not important, just text extraction for search |
| Hybrid search (FTS + semantic) | R1 | Need both keyword precision and semantic discovery |
| Per-space indices | R1 | Simpler, spaces remain independent |
| Federation via kinen tool (future) | R1 | Can search across spaces when needed |
| Graph indexing for wiki links | R1 | Extract and index Obsidian-style links as edges |
| Local embedding model | R1 | No API dependency, works offline |
| Lean approach with focused libraries | R1 | Avoid heavy frameworks, mastra.ai for memory later |
| Situated chunks in results | R1 | Include N chunks before/after for context |
| ck-inspired UX | R1 | Reference BeaconBay/ck for search CLI patterns |

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                     Kinen Space                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ sessions/│  │artifacts/│  │     resources/       │  │
│  │  rounds/ │  │          │  │  (PDFs, docs, etc.)  │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
└───────┼─────────────┼───────────────────┼──────────────┘
        │             │                   │
        └─────────────┼───────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────┐
        │      Indexing Pipeline          │
        │  - Content extraction           │
        │  - Chunking (semantic/fixed)    │
        │  - Embedding (local model)      │
        │  - FTS indexing                 │
        │  - Link extraction (graph)      │
        └─────────────┬───────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────┐
        │  ~/.local/share/kinen/          │
        │  └── indices/                   │
        │      └── {origin-hash}/         │
        │          ├── lance/             │
        │          └── meta.json          │
        └─────────────────────────────────┘
```

### Index Storage

- **Location**: `~/.local/share/kinen/indices/{origin-hash}/`
- **Space ID**: SHA256 hash of git remote origin URL (portable across folder moves)
- **Database**: LanceDB (embedded, native hybrid search)
- **Files**:
  - `lance/` - LanceDB data directory
  - `meta.json` - Index metadata (space info, last rebuild, model version)

### Technology Stack (Proposed)

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Database | LanceDB | Native hybrid search, built-in embeddings |
| Embedding | all-MiniLM-L6-v2 | Good quality, fast, small (23MB) |
| PDF extraction | pdf-parse | Lightweight, text extraction |
| EPUB extraction | epub-parser | Standard library |
| Markdown parsing | remark/unified | Already in ecosystem |
| CLI | commander | Already used in kinen |

## Components

### 1. Content Extractors

| Format | Extractor | Library |
|--------|-----------|---------|
| Markdown | Native | remark |
| Plain text | Native | - |
| PDF | pdf-parse | `pdf-parse` |
| EPUB | epub-parser | `epub-parser` |
| HTML | cheerio | `cheerio` |

### 2. Chunking Strategy

**For markdown** (rounds, artifacts):
- Semantic chunking by headings/paragraphs
- Split large sections at ~512 tokens
- Frontmatter as separate metadata (not content chunk)

**For PDFs/other**:
- Fixed-size chunks (512 tokens, 50 token overlap)
- Page boundaries as hints

**Chunk metadata**:
```typescript
interface Chunk {
  id: string;              // Hash of content + path + index
  content: string;
  path: string;            // Source document path
  chunk_index: number;     // Position in document
  start_line?: number;     // For markdown
  end_line?: number;
  document_type: 'round' | 'artifact' | 'resource';
  embedding: number[];     // 384-dim vector
}
```

### 3. Graph Storage

Wiki links stored as edges in LanceDB:
```typescript
interface Edge {
  source_path: string;
  target_path: string;
  link_text: string;
  context: string;         // Surrounding text
}
```

### 4. Search Engine

**Hybrid search** combining:
- Full-text search via LanceDB's Tantivy integration
- Vector similarity via embeddings
- Reciprocal Rank Fusion (RRF) for combining scores

### 5. MCP Tools

| Tool | Description |
|------|-------------|
| `kinen_search` | Hybrid search with filters and context |
| `kinen_context` | Get related content for current session |
| `kinen_index_status` | Index stats and health |
| `kinen_index_rebuild` | Trigger full rebuild |
| `kinen_links` | Query graph (incoming/outgoing links) |

### 6. CLI Commands

| Command | Description |
|---------|-------------|
| `kinen search <query>` | Hybrid search (default) |
| `kinen search --semantic` | Semantic only |
| `kinen search --fulltext` | Full-text only |
| `kinen index status` | Show index stats |
| `kinen index rebuild` | Rebuild index |
| `kinen resources add <file>` | Add file to resources |
| `kinen resources list` | List resources |
| `kinen graph show <path>` | Show links for document |

## Data Model

### Search Result Structure

```typescript
interface SearchResult {
  chunk: {
    content: string;
    start_line?: number;
    end_line?: number;
  };
  source: {
    path: string;
    type: 'round' | 'artifact' | 'resource';
    title: string;
    metadata: Record<string, unknown>;
  };
  context: {
    before: string[];      // N chunks before
    after: string[];       // N chunks after
  };
  score: number;
  match_type: 'semantic' | 'fulltext' | 'hybrid';
}
```

### Index Metadata

```json
{
  "space_origin": "git@github.com:user/space.git",
  "space_name": "my-space",
  "created_at": "2025-12-03T09:00:00Z",
  "last_updated": "2025-12-03T09:30:00Z",
  "model": "all-MiniLM-L6-v2",
  "model_dimensions": 384,
  "chunks_count": 1234,
  "documents_count": 56,
  "edges_count": 89
}
```

## Resources Directory Structure

**Default layout**:
```
resources/
├── .resources.yml          # Optional manifest with custom metadata
├── docs/                   # Documentation, specs
├── papers/                 # Research papers
├── examples/               # Code samples, templates
└── data/                   # Datasets (special indexing)
```

**Optional manifest** (`.resources.yml`):
```yaml
resources:
  - path: papers/attention-is-all-you-need.pdf
    tags: [ml, transformers, foundational]
    notes: "The original transformer paper"
```

## Implementation Phases

### Phase 1: Core Indexing (MVP)
- LanceDB integration with hybrid search
- Markdown chunking (rounds, artifacts)
- Basic metadata extraction (frontmatter)
- `kinen search` CLI command
- `kinen_search` MCP tool
- Index in `~/.local/share/kinen/indices/{origin-hash}/`

### Phase 2: Resources & PDF
- Resources directory support
- PDF extraction with `pdf-parse`
- EPUB extraction
- `kinen resources` CLI commands

### Phase 3: Graph & Links
- Wiki link extraction
- Edge storage and querying
- `kinen graph` CLI commands
- `kinen_links` MCP tool

### Phase 4: Polish & Advanced
- Delta indexing with content hashing
- `.kinenignore` file support
- TUI mode (optional)
- Cross-space federation

## Open Questions

> [!question] Pending from Round 2
> 1. LanceDB vs SQLite+sqlite-vec final decision?
> 2. Default context window size (N chunks before/after)?
> 3. Frontmatter searchable as content or metadata-only?
> 4. Auto-index on first search or require explicit init?
> 5. TUI mode priority?

## References

- [[rounds/01-foundation|Round 01 - Foundation]]
- [[rounds/02-technical-architecture|Round 02 - Technical Architecture]]
- [BeaconBay/ck](https://github.com/BeaconBay/ck) - Semantic code search tool
- [LanceDB docs](https://lancedb.github.io/lancedb/)
