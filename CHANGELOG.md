# Changelog

All notable changes to kinen will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### API (`api/kinen/kinen.proto`)
- **Session Management**
  - `GetSession` RPC - Get session details by name
  - `ListSessions` RPC - List all sessions in current space
  - `Session` message with id, name, type, path, created_at, modified_at
  - `SessionType` enum: architecture, implementation, writing, research
  - `RoundInfo` message with number, title, filename, line_count

- **Space Management**
  - `GetCurrentSpace` RPC - Get active space
  - `ListSpaces` RPC - List all registered spaces
  - `Space` message with name, path, is_current

- **Parsing**
  - `ParseRound` RPC - Parse round markdown file
  - `ParseArtifact` RPC - Parse artifact markdown file
  - `ParsedRound` message with questions, options, answers
  - `ParsedArtifact` message with sections, frontmatter, wiki-links
  - `Question`, `Option`, `Answer`, `Section` messages

- **Indexing**
  - `IndexBuild` RPC - Trigger index build (incremental or full)
  - `IndexStatus` RPC - Get index statistics
  - `IndexBuildRequest` with `full` flag
  - `IndexBuildResponse` with files_processed, files_changed, status
  - `IndexStatusRequest` / `IndexStatusResponse` with document counts

- **Search**
  - `Search` RPC - Semantic search across memories
  - `SearchRequest` with query, limit, min_score, filter
  - `SearchResponse` with results array
  - `SearchResult` with content, source, score, category

#### CLI (`cmd/kinen/`)
- **Space Commands** (`kinen space`)
  - `kinen space list` - List all registered spaces
  - `kinen space current` - Show current space
  - `kinen space switch <name>` - Switch to a different space
  - `kinen space register <name> <path>` - Register a new space
  - `kinen space unregister <name>` - Remove a space registration

- **Session Commands** (`kinen session`)
  - `kinen session new <name>` - Create new session
  - `kinen session list` - List sessions in current space
  - `kinen session current` - Show current session
  - `kinen session round new` - Create new round in current session
  - Flags: `--type` (architecture|implementation|writing|research)

- **Index Commands** (`kinen index`)
  - `kinen index build` - Incremental index build
  - `kinen index build --full` - Full rebuild (clears all hashes)
  - `kinen index status` - Show index statistics

#### Storage (`internal/storage/`)
- **EdgeStorage Interface** (`edges.go`)
  - `AddEdge(ctx, edge)` - Store wiki-link relationship
  - `GetEdges(ctx, sourceID)` - Get outgoing links
  - `GetBacklinks(ctx, targetID)` - Get incoming links
  - `DeleteEdges(ctx, sourceID)` - Remove all edges for source

- **MetadataStorage Interface** (`metadata.go`)
  - `SetMetadata(ctx, key, value)` - Store key-value pair
  - `GetMetadata(ctx, key)` - Retrieve value
  - `DeleteMetadata(ctx, key)` - Remove entry

- **SQLite Implementations** (`sqlite/`)
  - `sqlite/edges.go` - EdgeStorage with indexed tables
  - `sqlite/metadata.go` - MetadataStorage with JSON value column

- **DualStorage Wrapper** (`dual/storage.go`)
  - Writes to both primary and secondary backends
  - Reads from primary by default
  - Optional comparison mode for A/B testing

- **Factory Pattern** (`factory.go`)
  - `RegisterEdgeStorage(name, constructor)`
  - `RegisterMetadataStorage(name, constructor)`
  - `NewEdgeStorage(name, path)`
  - `NewMetadataStorage(name, path)`

#### FileWatcher (`internal/watcher/`)
- **FileWatcher** (`watcher.go`)
  - Recursive directory watching via fsnotify
  - `.gitignore` pattern support
  - Events channel for file changes

- **Debouncer** (`debouncer.go`)
  - 500ms default debounce window
  - Coalesces rapid file changes
  - Prevents index thrashing

- **DeltaTracker** (`delta.go`)
  - Content-hash based change detection
  - `HasChanged(path, content)` - Check if file changed
  - `ClearAll()` - Reset for full reindex
  - In-memory hash map (future: persistent)

- **IndexWorker** (`worker.go`)
  - Processes file events from debouncer
  - Calls parser and storage adapters
  - Progress callback for status reporting

#### Parser (`internal/parser/`)
- **Frontmatter Parser** (`frontmatter.go`)
  - YAML frontmatter extraction
  - Generic map[string]interface{} output
  - Validation against schemas

- **Wiki-Link Extractor** (`wikilinks.go`)
  - Regex-based `[[link]]` extraction
  - `[[link|alias]]` support
  - Context snippet (±50 chars)
  - Line number tracking

- **Round Parser** (`round.go`)
  - Question extraction (### headers)
  - Option parsing (bullet points)
  - Answer extraction (`> [!note] Answer` callouts)
  - Decision parsing (`> [!note] Decision` callouts)

- **Callout Parser** (`callout.go`)
  - Obsidian-style callout support
  - Types: note, warning, info, question, answer, decision
  - Nested content preservation

#### Consolidation (`internal/consolidation/`)
- **Decision Extractor** (`extractor.go`)
  - Finds decision callouts in rounds
  - Extracts rationale and consequences
  - Wiki-link preservation

- **Memory Writer** (`writer.go`)
  - Generates markdown memory files
  - Proper frontmatter (type, date, source)
  - Wiki-links to source documents

#### Server (`internal/server/`)
- **KinenServer Updates** (`kinen_server.go`)
  - All new RPC implementations
  - Repository pattern integration
  - On-demand IndexWorker for build command

- **Adapters** (`adapters.go`)
  - `SessionParser` - Implements watcher.Parser
  - `StorageAdapter` - Implements watcher.Storage
  - Bridges MemoryService to IndexWorker

#### Spaces (`internal/spaces/`)
- **Repository Interface** (`repository.go`)
  - Complete space/session abstraction
  - Context-aware methods

- **Filesystem Implementation** (`repository_fs.go`)
  - YAML config management
  - Directory structure creation
  - Session scanning and parsing

- **Tests** (`repository_fs_test.go`)
  - Comprehensive test coverage
  - Temp directory isolation

#### Resources (`internal/resources/`)
- **PDF Extractor** (`pdf.go`)
  - pdfcpu CLI integration
  - Text extraction with page markers

- **Resource Scanner** (`scanner.go`)
  - Recursive directory walking
  - Type classification (pdf, markdown, text)

- **Web Clip Parser** (`webclip.go`)
  - URL source extraction from frontmatter
  - Content parsing

#### Daemon (`cmd/kinen-daemon/`)
- **FileWatcher Integration**
  - Automatic startup with daemon
  - Watches current space's sessions/
  - Debounced event processing
  - Graceful shutdown handling

#### Distribution
- **Cross-Platform Builds**
  - darwin-amd64, darwin-arm64
  - linux-amd64, linux-arm64
  - windows-amd64

- **Homebrew Formula**
  - `brew install sbellity/tap/kinen`
  - Auto-update on release

### Changed

#### Architecture
- **Domain Types**: All moved to proto definitions (proto-first)
- **Package Structure**: 
  - `internal/kinen/` → split into `parser/`, `consolidation/`, `spaces/`
  - Better separation of concerns

#### API
- **GetSessionResponse**: Now returns full `Session` message (was just name/path)
- **ListSessionsResponse**: Now returns `[]Session` (was `[]string`)

### Removed

#### Files
- `internal/kinen/frontmatter.go` → `internal/parser/frontmatter.go`
- `internal/kinen/round.go` → `internal/parser/round.go`
- `internal/kinen/validation.go` → `internal/parser/validation.go`
- `internal/spaces/sessions.go` → merged into `repository_fs.go`
- `internal/spaces/spaces.go` → merged into `repository_fs.go`

### Fixed

#### Bugs
- MCP handler wiring (wrong function names)
- pdfcpu API calls (switched to CLI)
- Session type enum generation

### Security

- No security-related changes in this release

---

## Migration Guide

### For Users Upgrading from TypeScript kinen

1. **Install Go binary**:
   ```bash
   brew install sbellity/tap/kinen
   ```

2. **Register existing space**:
   ```bash
   kinen space register myspace /path/to/kinen/folder
   kinen space switch myspace
   ```

3. **Build index**:
   ```bash
   kinen index build --full
   ```

4. **Start daemon** (optional, for background indexing):
   ```bash
   kinen daemon start
   ```

### Breaking Changes

- TypeScript CLI is deprecated
- Config file location changed to `~/.config/kinen/config.yml`
- Session type values are now lowercase (architecture, not Architecture)


