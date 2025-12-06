---
date: 2025-12-03
started_at: 2025-12-03T09:17:00+01:00
artifact_type: round_exploration
kinen_round: 1
kinen_status: in-progress
summary: "Establishing foundation for resources directory and indexing system"
---




- Clarify the core use cases and user stories
- Understand document format requirements
- Explore search type needs (full-text vs semantic)
- Validate technology direction




## Questions

### Q1.1: What is "upib support"?

**Context**: You mentioned "ideally upib support is a must" - I want to make sure I understand what you need.
Did you mean:
- **EPUB** - E-book format for documentation?
- **UPnP** - Universal Plug and Play for device discovery?
- Something else entirely?

> [!note] Answer
> Typo - meant **EPUB** (e-book format)

---

### Q1.2: Primary Use Cases for Resources

**Context**: Understanding how you'll actually use the resources directory helps determine what features matter most.
**Possible use cases**:
**A. Reference documentation** - API docs, library references, specs you consult during sessions
- Implies: PDF/HTML support, quick search, maybe bookmarking
**B. Research materials** - Papers, articles, reports that inform decisions
- Implies: PDF extraction, citation tracking, annotations
**C. Project context** - Design docs, requirements, existing specs from your org
- Implies: Various formats (docx, pdf, md), version awareness
**D. Training data / examples** - Code samples, templates, patterns to reference
- Implies: Code-aware parsing, syntax highlighting in search
**Questions**:
1. Which of these (A-D) are your primary use cases?
2. Are there other use cases I'm missing?
3. Do you need to organize resources into subdirectories (e.g., `resources/papers/`, `resources/specs/`)?

> [!note] Answer
> All of those are good examples.
> Good idea about datasets, we might need to index them differently than normal docs
> yes let's organize in subdirectories
> we can imagine that depending on the space template (if we introduce spaces with different templates to implement different flavors of the methodology, the resources directory might be organized differently.... technial projects will use differnt types of resources than creative writing projects for example)

---

### Q1.3: Document Formats Priority

**Context**: Different formats require different extraction strategies. PDF is notoriously tricky.
**Format tiers**:
| Tier | Formats | Extraction Complexity |
|------|---------|----------------------|
| 1 - Easy | Markdown, plain text, JSON, YAML | Trivial |
| 2 - Medium | HTML, EPUB | Moderate, good libraries exist |
| 3 - Hard | PDF, DOCX, PPTX | Requires heavy dependencies or external tools |
| 4 - Very Hard | Scanned PDFs (OCR) | Requires ML models or cloud services |
**Questions**:
1. Which formats are must-have vs nice-to-have?
2. Do you have scanned PDFs that would need OCR?
3. Are you okay with PDF extraction being "best effort" (may miss complex layouts)?

> [!note] Answer
> PDF is an aboslute necessity
> scanned PDFs not so much
> we don't really care about layout the idea is to index them for fulltext and semantic search

---

### Q1.4: Search Type - Full-Text vs Semantic

**Context**: This is a fundamental architecture decision that affects everything.
**Option A: Full-text search only (SQLite FTS5)**
- **How it works**: Keyword matching with ranking
- **Pros**: Simple, fast, no external dependencies, small index size, works offline
- **Cons**: Misses semantic similarity ("authentication" won't match "login")
- **Best for**: Known-item search, exact phrase lookup
**Option B: Semantic/vector search only (LanceDB or similar)**
- **How it works**: Embeddings capture meaning, find similar content
- **Pros**: Understands synonyms and concepts, great for "find related" queries
- **Cons**: Requires embedding model (local or API), larger index, slower indexing
- **Best for**: Discovery, "find documents about X"
**Option C: Hybrid (both)**
- **How it works**: Full-text for exact matches, vector for semantic
- **Pros**: Best of both worlds
- **Cons**: More complexity, two indices to maintain, larger storage
- **Best for**: Production-grade search experience
**Questions**:
1. How important is semantic search to you? (e.g., "find all docs about deployment" matching "rollout", "release", "ship")
2. Are you okay with requiring an embedding model (local like `all-MiniLM-L6-v2` or API like OpenAI)?
3. What's your tolerance for index size? (vector indices can be 10-100x larger)

> [!note] Answer
> Option C !
> we need both
> my understanding is that LanceDB is supporting a lot already and does not need to run as a separate process
> We can explore other options... sqlite with vector and fts extensions
> or ChromaDB or others... let's do a bit of research
>
> about embedding model ideally local (I think LanceDB does do it as well, please check)
>

---

### Q1.5: Index Scope - Per-Space vs Cross-Space

**Context**: You mentioned identifying spaces by git origin. Should the index support queries across multiple spaces?
**Option A: Per-space indices only**
- Each space has its own index in `~/.local/share/kinen/indices/{origin-hash}/`
- Simpler, clear boundaries, faster queries
- Can't search across spaces
**Option B: Global index with space filtering**
- Single index containing all spaces
- Can query "across all my spaces" or filter to one
- More complex, potential for larger queries
**Option C: Per-space with optional federation**
- Default is per-space
- CLI command to search across spaces when needed
- Balance of simplicity and capability
**Questions**:
1. Do you need to search across spaces? (e.g., "find all my auth-related sessions")
2. How many spaces do you typically work with?

> [!note] Answer
> Option A, indices are per space
> We can start designing Federation but I think it needs to be federated by the kinen tool itself, spaces should be independent.
>
> How many spaces, probably a handful for personal use (mixed personal and work stuff)

---

### Q1.6: Metadata to Index

**Context**: Beyond content, what metadata matters for retrieval?
**For rounds**:
- Session name, round number, date
- Status (in-progress, complete)
- Type (architecture, implementation, etc.)
- Tags from frontmatter
- Links to other rounds/artifacts
**For artifacts**:
- Artifact type (technical-spec, implementation-plan, etc.)
- Last updated, created date
- Status
- Related session
**For resources**:
- Filename, path within resources/
- File type, size, modified date
- Extracted title (from PDF metadata or first heading)
- Custom tags/labels?
**Questions**:
1. What metadata do you most often want to filter/sort by?
2. Should resources support custom metadata (e.g., a `resources.yml` manifest)?
3. Do you want to track "last accessed" or "access count"?

> [!note] Answer
> yes to all
>
> we also adopted Obsidian linking style, would be good to extract and index all edges (links between sessions  and artifacts and across sessions) and represent them as a graph in our index 

---

### Q1.7: Technology Direction - Database

**Context**: You mentioned SQLite or LanceDB. Let me expand the options.
**Option A: SQLite + FTS5**
- **What**: Relational DB with built-in full-text search
- **Pros**: Battle-tested, zero dependencies, great TypeScript support (`better-sqlite3`), tiny footprint
- **Cons**: No native vector search (would need extension like `sqlite-vec`)
- **Best for**: Full-text search, structured metadata queries
**Option B: LanceDB**
- **What**: Embedded vector database (Rust-based, JS bindings)
- **Pros**: Native vector search, columnar storage, good for ML workflows
- **Cons**: Newer, heavier dependency, less TypeScript ecosystem experience
- **Best for**: Semantic search, embedding-centric workflows
**Option C: SQLite + LanceDB hybrid**
- **What**: SQLite for metadata/full-text, LanceDB for vectors
- **Pros**: Best of both, can use each for what it's good at
- **Cons**: Two databases to manage, sync complexity
**Option D: Meilisearch (embedded)**
- **What**: Full-text search engine with basic vector support
- **Pros**: Great search UX out of the box, typo tolerance
- **Cons**: Heavier, runs as separate process
**My initial lean**: SQLite + FTS5 for v1, with optional LanceDB addon for semantic search later.
**Questions**:
1. Do you have a strong preference?
2. How important is "zero external dependencies"?
3. Is running a background process acceptable, or must it be embedded?

> [!note] Answer
> I don't have a strong preference
> no background process ideally unless there is a very good reason
> sqlite-vec extension is perfectly acceptable as a dependency
>
> please research more for next round
>
>

---

### Q1.8: Technology Direction - Framework

**Context**: You mentioned mastra.ai. Let me assess it and alternatives.
**Option A: mastra.ai**
- **What**: TypeScript AI agent framework with RAG capabilities
- **Pros**: Unified vector store abstraction, workflow support, AI-native
- **Cons**: Heavy framework for just indexing, might be overkill, adds significant dependency
- **Best for**: If you're building AI agents on top of the index
**Option B: LlamaIndex.TS**
- **What**: Data framework for LLM applications
- **Pros**: Great document loaders, chunking strategies, retrieval patterns
- **Cons**: Large dependency tree, oriented toward LLM pipelines
- **Best for**: RAG-heavy applications
**Option C: Custom with focused libraries**
- **What**: Compose from: `pdf-parse`, `better-sqlite3`, `@lancedb/lancedb`, etc.
- **Pros**: Minimal dependencies, full control, smaller footprint
- **Cons**: More code to write and maintain
- **Best for**: Tight integration with existing kinen architecture
**Option D: Langchain.js**
- **What**: Popular LLM framework
- **Pros**: Huge ecosystem, many integrations
- **Cons**: Known for bloat and complexity, frequent breaking changes
- **Best for**: Rapid prototyping with many LLM providers
**My initial lean**: Option C (custom with focused libraries) - kinen is already lean, adding a heavy framework feels counter to its philosophy.
**Questions**:
1. What attracted you to mastra.ai specifically?
2. Are you planning to build AI agents/workflows on top of this index?
3. How important is staying lean vs having a batteries-included framework?

> [!note] Answer
> 1. their memory system that I would like to integrate maybe at some point, but we can also build our own
> 2. yes possibly
> 3. I would rather stay lean but I don't want to reinvent the world either.

---

### Q1.9: MCP Tool Design

**Context**: Kinen already has MCP tools. The index should expose search capabilities to AI assistants.
**Potential tools**:
```typescript
// Search across the space
kinen_search({ query: "authentication flow", type?: "rounds" | "artifacts" | "resources" })
// Get context for current session
kinen_context({ session?: string }) // Returns related rounds, artifacts, resources
// Index management
kinen_index_rebuild()
kinen_index_status()
```
**Questions**:
1. What search operations do you imagine using from Claude/AI assistants?
2. Should search results return full content or just metadata + snippets?
3. Any other tools you'd want?

> [!note] Answer
> Semantic search across sessions for semantic recall
>
> search results should return situated chunks (chunk + metadata about the resource or artifact it was extracted from + N chunks around -- before / after and configurable)

---

### Q1.10: CLI Commands

**Context**: For human users, what CLI commands make sense?
**Potential commands**:
```bash
kinen search "authentication" --type rounds
kinen search "deployment strategy" --semantic  # if vector search enabled
kinen index rebuild                # Full rebuild
kinen index status                 # Show index stats
kinen index add <file>             # Index specific file
kinen resources add <file>         # Copy file to resources/
kinen resources list               # List indexed resources
kinen resources open <query>       # Open matching resource
```
**Questions**:
1. What commands would you use most often?
2. Should `kinen search` be the primary interface, or integrated into other commands?
3. Any other CLI workflows you envision?
This round establishes the foundation by clarifying:
- Document format requirements
- Search type (full-text vs semantic)
- Technology choices (database and framework)
- Index scope and metadata
- Tool/CLI interface design
Your answers will shape the technical architecture in Round 2.
**Next**: [[rounds/02-architecture|Round 02 - Technical Architecture]]

> [!note] Answer
> yea kinen search looks good, maybe for search you can take some inspiration from https://github.com/BeaconBay/ck/

---
