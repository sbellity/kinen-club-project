#!/bin/bash
# enrich-beads.sh - Add proper references and context to beads issues
# Run from kinen workspace root

set -e

SESSION="sessions/20251206-01-kinen-beads-devx"
IMPL="$SESSION/artifacts/implementation"
RESEARCH="$SESSION/artifacts/research"

echo "🔗 Enriching beads issues with proper documentation references..."

# Helper function
update_issue() {
  local id="$1"
  local design="$2"
  local acceptance="$3"
  echo "  → Updating $id"
  bd update "$id" --design "$design" --acceptance "$acceptance" 2>/dev/null || echo "    (failed: $id)"
}

# ============================================================
# TRACK EPICS - Full context
# ============================================================

echo ""
echo "📦 Updating Track Epics..."

bd update kinen-0ed \
  --title "TRACK-1A: Proto-First API (Connect + MCP)" \
  --design "One proto → HTTP + gRPC + MCP. Use Connect RPC + protoc-gen-go-mcp. Deletes hand-written cmd/kinen/mcp/ (~300 lines). Schema IS the API contract." \
  --acceptance "HTTP works; gRPC works; MCP works (generated); Old MCP code deleted; All from same proto" \
  --notes "Handover: $IMPL/handover-track-1a.md | https://connectrpc.com | https://github.com/redpanda-data/protoc-gen-go-mcp | ~4.5 hours LOE"

bd update kinen-2w9 \
  --design "Parse kinen markdown (frontmatter, wiki-links, callouts). Semantic chunking: 1 chunk per question in rounds. Use goldmark for base parsing." \
  --acceptance "Parse init.md frontmatter; Extract all [[wiki-links]] with line numbers; Parse round questions and answers" \
  --notes "Handover: $IMPL/handover-track-1b.md | See $RESEARCH/obsidian-integration.md for format details"

bd update kinen-vp0 \
  --design "SPIKE FIRST - Compare LanceDB vs existing SQLite+VSS. May not be needed since kinen-go already has working search." \
  --acceptance "Spike document comparing performance; Decision made on whether to proceed" \
  --notes "Handover: $IMPL/handover-track-1c.md | UDP-2 blocks this track"

bd update kinen-ner \
  --design "Use fsnotify to watch sessions/. 500ms debounce. Delta indexing via content hash comparison." \
  --acceptance "Daemon detects file changes within 1s; Only changed files re-indexed; Works with 1000+ files" \
  --notes "Handover: $IMPL/handover-track-1d.md"

bd update kinen-ea7 \
  --design "Extract decisions from > [!note] Answer/Decision callouts. Write to memories/ folder with frontmatter + [[wiki-links]] to source." \
  --acceptance "Decisions extracted from rounds; Memory files have correct frontmatter; Wiki-links resolve" \
  --notes "Handover: $IMPL/handover-track-1e.md | UDP-4 for format approval"

bd update kinen-5iv \
  --design "Use pdfcpu for text extraction. Scan resources/ folder for PDFs, web clips, notes." \
  --acceptance "PDFs extracted to searchable text; resources/index.md generated; Integrated with main index" \
  --notes "Handover: $IMPL/handover-track-1f.md"

bd update kinen-sqc \
  --title "TRACK-2: Port Sessions/Spaces to Go CLI" \
  --design "Port session and space management from TypeScript to Go. Single binary does everything. Reference: kinen/src/lib/sessions.ts, spaces.ts" \
  --acceptance "kinen session new works; kinen session list works; kinen space switch works; All commands in one binary" \
  --notes "Handover: $IMPL/handover-track-2.md | TS CLI deprecated after this | Depends on Track 1B for parser"

bd update kinen-q7o \
  --design "Add vitest + @vscode/test-electron for testing. Fix roundEditor bugs. Add search command palette." \
  --acceptance "Test infrastructure runs in CI; roundEditor renders correctly; Search via Cmd+Shift+K (or alternative)" \
  --notes "Handover: $IMPL/handover-track-3.md | Extension at: vscode-extension/"

bd update kinen-9zl \
  --design "Ensure kinen files work in Obsidian without modification. Wiki-links, frontmatter, callouts all render correctly." \
  --acceptance "Files open in Obsidian; [[links]] navigable; Graph view shows connections; Callouts render" \
  --notes "Handover: $IMPL/handover-track-4.md | See $RESEARCH/obsidian-integration.md"

bd update kinen-08r \
  --design "Cross-compile Go daemon. Create Homebrew formula. Add launchd service for auto-start." \
  --acceptance "brew install sbellity/tap/kinen works; brew services start kinen works; Binary runs on Intel + Apple Silicon" \
  --notes "Handover: $IMPL/handover-track-5.md"

# ============================================================
# TRACK 1A TASKS - Proto-First API (Connect + MCP)
# ============================================================

echo ""
echo "📝 Updating Track 1A tasks (Connect + MCP generated)..."

bd update kinen-hvy \
  --title "1A.1: Define api/kinen/kinen.proto" \
  --design "Create proto with KinenService: Search, AddMemory, GetStats, ListMemories, GetMemory, Export, LoadData, Health. Follow api/mlservice/ pattern." \
  --acceptance "Proto compiles; All methods defined with request/response types; Follows project conventions"

bd update kinen-9qv \
  --title "1A.2: Setup protoc-gen-go-mcp + buf.gen.yaml" \
  --design "Install protoc-gen-go-mcp, add to buf.gen.yaml alongside protoc-gen-connect-go" \
  --acceptance "buf generate produces kinenconnect/ AND kinenmcp/ directories"

bd update kinen-61q \
  --title "1A.3: Implement KinenServer" \
  --design "Create internal/server/kinen_server.go implementing Connect interface. Same server works for both Connect and MCP." \
  --acceptance "All methods implemented; Maps proto types to service types; Error handling correct"

bd update kinen-a8p \
  --title "1A.4: Wire Connect into daemon" \
  --design "Create cmd/kinen-daemon/main.go with Connect handler, h2c for gRPC, graceful shutdown" \
  --acceptance "Daemon starts on :7319; HTTP and gRPC both work; Clean shutdown"

# Reopen one task for MCP wiring
bd update kinen-9z6 \
  --title "1A.5: Wire generated MCP into CLI" \
  --design "Update cmd/kinen/mcp.go to use kinenmcp.ForwardToKinenServiceHandler(). DELETE old hand-written cmd/kinen/mcp/handlers.go" \
  --acceptance "MCP works with generated handlers; Old ~300 lines of hand-written code deleted"

bd close kinen-xi9 --reason "Merged into daemon main.go (1A.4)"

# ============================================================
# TRACK 1B TASKS
# ============================================================

echo ""
echo "📝 Updating Track 1B tasks..."

bd update kinen-h2z \
  --design "Extract YAML between --- markers. Parse to map[string]interface{}. Handle missing frontmatter." \
  --acceptance "Parses standard kinen frontmatter (created, type, status, tags); Returns nil for files without frontmatter"

bd update kinen-fnu \
  --design "Regex: \\[\\[([^\\]|]+)(\\|[^\\]]+)?\\]\\]. Return target, display text, line number, surrounding context." \
  --acceptance "Extracts [[link]], [[link|display]], [[folder/link]]; Provides line numbers; Works with 100+ links per file"

bd update kinen-0hj \
  --design "Parse ### Q* headers as questions. Parse > [!note] Answer as responses. Maintain Q&A pairs." \
  --acceptance "Extracts question text; Pairs with answer callout; Returns structured Round{Questions[]}"

bd update kinen-5dd \
  --design "Parse ## headers as sections. Extract content between headers." \
  --acceptance "Returns Artifact{Sections[]} with heading + content pairs"

bd update kinen-jqm \
  --design "Walk session directory. Find init.md, rounds/*.md, artifacts/**/*.md. Return Session struct." \
  --acceptance "Finds all session files; Sorts rounds by number; Handles nested artifact folders"

# ============================================================
# TRACK 1D TASKS
# ============================================================

echo ""
echo "📝 Updating Track 1D tasks..."

bd update kinen-t5o \
  --design "Use fsnotify. Watch sessions/ recursively. Report create/modify/delete events." \
  --acceptance "Detects new files; Detects modifications; Handles directory creation"

bd update kinen-dkv \
  --design "Accumulate events for 500ms before processing. Deduplicate rapid changes to same file." \
  --acceptance "Single file saved 10 times triggers 1 index; Configurable debounce time"

bd update kinen-6v6 \
  --design "Hash content with blake3. Compare to stored hash. Only re-embed if changed." \
  --acceptance "Unchanged files skipped; Changed files re-indexed; Hash stored in index"

# ============================================================
# TRACK 1E TASKS
# ============================================================

echo ""
echo "📝 Updating Track 1E tasks..."

bd update kinen-eqn \
  --design "Scan rounds for > [!note] Answer and > [!note] Decision callouts. Extract content + metadata." \
  --acceptance "Finds all decision callouts; Extracts decision text; Links to source round + question"

bd update kinen-s67 \
  --design "Write to memories/YYYY-MM-DD-slug.md with frontmatter (type, source, confidence) and [[wiki-links]]." \
  --acceptance "Creates valid markdown; Frontmatter parses correctly; Wiki-links point to source rounds"

bd update kinen-jxs \
  --design "Hook into session summarize command. Run extraction after session-summary.md created." \
  --acceptance "Automatic extraction on summarize; Manual trigger via CLI; Idempotent (safe to re-run)"

# ============================================================
# TRACK 1F TASKS
# ============================================================

echo ""
echo "📝 Updating Track 1F tasks..."

bd update kinen-bid \
  --design "Use pdfcpu or similar. Extract plain text preserving paragraph breaks. Handle scanned PDFs gracefully (skip or OCR)." \
  --acceptance "Extracts text from standard PDFs; Returns error for scanned/image PDFs; UTF-8 output"

bd update kinen-8jm \
  --design "Walk resources/ folder. Find PDFs, .md notes, .txt files. Return Resource{path, type, content}." \
  --acceptance "Finds all resource files; Classifies by type; Returns content or extraction error"

# ============================================================
# TRACK 2 TASKS - Port Sessions/Spaces to Go
# ============================================================

echo ""
echo "📝 Updating Track 2 tasks (Go CLI port)..."

bd update kinen-v13 \
  --title "2.1: Space management in Go" \
  --design "internal/kinen/spaces.go: ListSpaces(), GetCurrentSpace(), SwitchSpace(). Read ~/.kinen/config.yml" \
  --acceptance "kinen space list works; kinen space switch works; kinen space current works"

bd update kinen-1wq \
  --title "2.2: Session management in Go" \
  --design "internal/kinen/sessions.go: CreateSession(), ListSessions(), GetCurrentSession(). Generate YYYYMMDD-NN-slug folders." \
  --acceptance "kinen session new creates folder + init.md; kinen session list shows sessions; kinen session current works"

bd update kinen-oit \
  --title "2.3: Round creation in Go" \
  --design "kinen round new: Creates next round in current session (01-foundation.md, 02-*.md, etc.)" \
  --acceptance "kinen round new creates round file; Increments round number; Opens in editor (optional)"

bd update kinen-mts \
  --title "2.4: Search command in Go" \
  --design "kinen search 'query' --limit N --json. Wraps existing pkg/service.Search(). No new logic, just CLI." \
  --acceptance "kinen search returns results from memory service; --json flag works"

bd update kinen-5gz \
  --title "2.5: Index commands in Go" \
  --design "kinen index build, kinen index status. Trigger reindex, show stats." \
  --acceptance "kinen index build works; kinen index status shows counts"

bd update kinen-fgb \
  --title "2.6: Wire commands into main.go" \
  --design "Add all new commands to cmd/kinen/main.go. Follow existing Cobra patterns." \
  --acceptance "All commands accessible via kinen CLI; Help text correct"

# ============================================================
# TRACK 3 TASKS
# ============================================================

echo ""
echo "📝 Updating Track 3 tasks..."

bd update kinen-pun \
  --design "vitest for unit tests, @vscode/test-electron for integration. Fixtures in test/fixtures/." \
  --acceptance "npm test runs all tests; Tests run in CI; Coverage reported"

bd update kinen-brd \
  --design "Debug roundEditor webview. Check message passing, state hydration, render lifecycle." \
  --acceptance "roundEditor opens without errors; Content displays correctly; Edits save"

bd update kinen-8xf \
  --design "Same DaemonClient as CLI but bundled for VSCode. Handle daemon not running gracefully." \
  --acceptance "Client works in extension context; Shows error if daemon down; Retries on failure"

bd update kinen-6we \
  --design "New keybinding (not Cmd+Shift+K - taken). Quick pick with search input. Results show file + preview." \
  --acceptance "Keybinding triggers search; Results ranked by relevance; Click opens file at match"

bd update kinen-cse \
  --design "Tree view showing files that link to currently open file. Updates on file change." \
  --acceptance "Shows backlinks for current file; Clicking navigates; Empty state when no backlinks"

# ============================================================
# TRACK 4 TASKS
# ============================================================

echo ""
echo "📝 Updating Track 4 tasks..."

bd update kinen-48v \
  --design "Audit all file writers (session, round, artifact, memory). Ensure [[wiki-links]] used for cross-references." \
  --acceptance "All generated files use [[links]]; Links resolve in Obsidian; No broken links"

bd update kinen-ehj \
  --design "Define standard frontmatter keys for each file type. Document in methodology. Validate on write." \
  --acceptance "Schema documented; All files conform; Validation warns on non-standard keys"

bd update kinen-k6h \
  --design "Test > [!note], > [!warning], > [!tip] in Obsidian. Ensure proper rendering with titles." \
  --acceptance "Callouts render with icons; Titles display; Collapsible works"

bd update kinen-1oi \
  --design "Optional command to create .obsidian/ with recommended plugins and settings." \
  --acceptance "Creates valid .obsidian/; Graph view works; Dataview queries work (if plugin installed)"

bd update kinen-3jt \
  --design "Script to convert old format files to new wiki-link format. Backup before migration." \
  --acceptance "Migrates files safely; Reports changes; Reversible via git"

# ============================================================
# TRACK 5 TASKS
# ============================================================

echo ""
echo "📝 Updating Track 5 tasks..."

bd update kinen-w9f \
  --design "Makefile targets for GOOS/GOARCH combinations. Output to dist/ folder." \
  --acceptance "Builds darwin-arm64, darwin-amd64, linux-amd64; Binaries run on target platforms"

bd update kinen-xst \
  --design "Create homebrew-kinen tap repo. Formula downloads binary from GitHub releases." \
  --acceptance "brew tap sbellity/kinen works; brew install kinen works; Binary in PATH"

bd update kinen-3jk \
  --design "plist file for launchd. Install via brew services. Auto-start on login." \
  --acceptance "brew services start kinen works; Daemon survives reboot; Logs to ~/Library/Logs/"

bd update kinen-8rw \
  --design "GitHub Actions workflow. Trigger on tag push. Build all platforms, create release, upload assets." \
  --acceptance "Push tag triggers build; Release created with binaries; Homebrew formula auto-updates"

# ============================================================
# UDPs
# ============================================================

echo ""
echo "🎯 Updating User Decision Points..."

bd update kinen-sb3 \
  --design "Review track breakdown document before agents start implementation." \
  --acceptance "User confirms plan is complete and correct; Any blockers identified" \
  --notes "Review: $IMPL/track-breakdown.md"

bd update kinen-uje \
  --design "After spike, decide if LanceDB provides enough value over existing SQLite+VSS." \
  --acceptance "Decision documented; If yes, Track 1C proceeds; If no, Track 1C cancelled" \
  --notes "Spike results should compare: query speed, embedding storage, hybrid search quality"

bd update kinen-a6a \
  --design "Test search quality and UX before release. Try various queries, check relevance." \
  --acceptance "User confirms search results are useful; UX is acceptable; No blocking issues"

bd update kinen-zsy \
  --design "Review extracted memories. Confirm format, content quality, wiki-link correctness." \
  --acceptance "Memory files are useful; Format matches expectations; Links work"

bd update kinen-ins \
  --design "End-to-end workflow test: session → decisions → memories → search → find decision." \
  --acceptance "Full workflow works; No data loss; Performance acceptable"

echo ""
echo "✅ All issues enriched with documentation references!"
echo ""
echo "📋 Summary:"
bd stats

