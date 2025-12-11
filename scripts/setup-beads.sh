#!/bin/bash
# Setup beads issues for kinen implementation tracks
# Run from /Users/sbellity/code/kinen

set -e

cd /Users/sbellity/code/kinen

echo "=== Resetting beads database ==="
rm -rf .beads/
bd init --prefix kinen

echo ""
echo "=== Creating Track Epics ==="

# Track 1A: HTTP API (extends existing kinen-go)
bd create "TRACK-1A: HTTP API Wrapper" \
  -t epic -p 1 \
  --description "HTTP API wrapper for existing kinen-go service. Thin layer ~300-500 lines. See artifacts/handover-track-1a.md"

# Track 1B: Kinen Parser
bd create "TRACK-1B: Kinen Session/Round Parser" \
  -t epic -p 1 \
  --description "Parse kinen markdown (sessions/rounds/artifacts), extract wiki-links. See artifacts/handover-track-1b.md"

# Track 1C: LanceDB (optional spike)
bd create "TRACK-1C: LanceDB Storage (OPTIONAL)" \
  -t epic -p 3 \
  --description "SPIKE FIRST! Alternative storage to SQLite+VSS. May not be needed. See artifacts/handover-track-1c.md"

# Track 1D: File Watcher
bd create "TRACK-1D: File Watcher + Delta Index" \
  -t epic -p 2 \
  --description "Watch sessions/ for file changes, trigger incremental re-indexing. See artifacts/handover-track-1d.md"

# Track 1E: Memory Consolidation
bd create "TRACK-1E: Decision Consolidation" \
  -t epic -p 2 \
  --description "Extract decisions from rounds → memory files with wiki-links. See artifacts/handover-track-1e.md"

# Track 1F: PDF/Resources
bd create "TRACK-1F: PDF + Resources Parser" \
  -t epic -p 2 \
  --description "Parse PDFs and resources folder for indexing. See artifacts/handover-track-1f.md"

# Track 2: TS CLI
bd create "TRACK-2: TypeScript CLI Daemon Client" \
  -t epic -p 1 \
  --description "Update kinen TS CLI to talk to Go daemon via HTTP. See artifacts/handover-track-2.md"

# Track 3: VSCode Extension
bd create "TRACK-3: VSCode Extension" \
  -t epic -p 1 \
  --description "Add test infrastructure, fix bugs, add search integration. See artifacts/handover-track-3.md"

# Track 4: Obsidian Compatibility
bd create "TRACK-4: Obsidian Compatibility" \
  -t epic -p 2 \
  --description "Ensure kinen files work in Obsidian (wiki-links, frontmatter, callouts). See artifacts/handover-track-4.md"

# Track 5: Distribution
bd create "TRACK-5: Distribution" \
  -t epic -p 3 \
  --description "Package daemon for Homebrew, launchd, Mac app. See artifacts/handover-track-5.md"

echo ""
echo "=== Creating Track 1A Tasks ==="

bd create "1A.1: Chi router + main.go" \
  -t task -p 1 \
  --description "Set up Chi router with CORS, logging middleware. Entry point for daemon."

bd create "1A.2: Health endpoint" \
  -t task -p 1 \
  --description "GET /api/v1/health - check Ollama, storage, return status"

bd create "1A.3: Search + AddMemory handlers" \
  -t task -p 1 \
  --description "POST /api/v1/search and /api/v1/memory/add wrapping svc.Search(), svc.AddMemory()"

bd create "1A.4: Stats + List + Get handlers" \
  -t task -p 1 \
  --description "GET /api/v1/stats, /api/v1/memories, /api/v1/memories/{id}"

bd create "1A.5: Export + LoadData handlers" \
  -t task -p 2 \
  --description "POST /api/v1/export and /api/v1/data/load"

bd create "1A.6: Daemon lifecycle" \
  -t task -p 1 \
  --description "SIGTERM/SIGINT handling, graceful shutdown"

echo ""
echo "=== Creating Track 1B Tasks ==="

bd create "1B.1: Frontmatter parser" \
  -t task -p 1 \
  --description "Extract YAML frontmatter from kinen markdown files"

bd create "1B.2: Wiki-link extractor" \
  -t task -p 1 \
  --description "Extract [[wiki-links]] with display text, line numbers, context"

bd create "1B.3: Round parser" \
  -t task -p 1 \
  --description "Parse round files: questions (### Q*), options, answers (> [!note])"

bd create "1B.4: Artifact parser" \
  -t task -p 2 \
  --description "Parse artifact files: sections (##), content"

bd create "1B.5: Session scanner" \
  -t task -p 2 \
  --description "Scan session directory structure (init.md, rounds/, artifacts/)"

echo ""
echo "=== Creating Track 1D Tasks ==="

bd create "1D.1: fsnotify watcher" \
  -t task -p 1 \
  --description "Watch sessions/ recursively with fsnotify"

bd create "1D.2: Debounce logic" \
  -t task -p 1 \
  --description "500ms debounce for rapid file changes"

bd create "1D.3: Delta index worker" \
  -t task -p 1 \
  --description "Re-index only changed files in background"

echo ""
echo "=== Creating Track 1E Tasks ==="

bd create "1E.1: Decision extractor" \
  -t task -p 1 \
  --description "Extract decisions from > [!note] Answer/Decision callouts"

bd create "1E.2: Memory file writer" \
  -t task -p 1 \
  --description "Write decisions to memories/ folder with frontmatter + wiki-links"

bd create "1E.3: Session close trigger" \
  -t task -p 2 \
  --description "Trigger consolidation when session is summarized/closed"

echo ""
echo "=== Creating Track 1F Tasks ==="

bd create "1F.1: PDF text extraction" \
  -t task -p 2 \
  --description "Extract text from PDFs using pdfcpu"

bd create "1F.2: Resource scanner" \
  -t task -p 2 \
  --description "Scan resources/ folder for PDFs, web clips, notes"

echo ""
echo "=== Creating Track 2 Tasks ==="

bd create "2.1: DaemonClient class" \
  -t task -p 1 \
  --description "TypeScript HTTP client for Go daemon (fetch-based)"

bd create "2.2: CLI search command" \
  -t task -p 1 \
  --description "kinen search command using daemon"

bd create "2.3: CLI backlinks command" \
  -t task -p 2 \
  --description "kinen backlinks command using daemon"

bd create "2.4: CLI index commands" \
  -t task -p 2 \
  --description "kinen index build, kinen index status"

bd create "2.5: MCP tool updates" \
  -t task -p 1 \
  --description "Update kinen_search etc to use daemon"

bd create "2.6: Auto-start daemon" \
  -t task -p 2 \
  --description "Auto-start daemon if not running on first CLI call"

echo ""
echo "=== Creating Track 3 Tasks ==="

bd create "3.0: Test infrastructure" \
  -t task -p 0 \
  --description "Set up vitest + vscode-test + fixtures for autonomous agent testing"

bd create "3.1: Fix roundEditor bugs" \
  -t task -p 1 \
  --description "Debug and fix roundEditor webview issues"

bd create "3.2: DaemonClient for VSCode" \
  -t task -p 1 \
  --description "HTTP client to talk to Go daemon from VSCode"

bd create "3.3: Search command palette" \
  -t task -p 1 \
  --description "Cmd+Shift+K search via daemon"

bd create "3.4: Backlinks view" \
  -t task -p 2 \
  --description "Tree view showing incoming wiki-links"

echo ""
echo "=== Creating Track 4 Tasks ==="

bd create "4.1: Wiki-links in generated content" \
  -t task -p 1 \
  --description "All generated files use [[wiki-links]]"

bd create "4.2: Frontmatter standardization" \
  -t task -p 1 \
  --description "Standardize frontmatter schema across all file types"

bd create "4.3: Callout format validation" \
  -t task -p 2 \
  --description "Ensure > [!note] renders correctly in Obsidian"

bd create "4.4: kinen init --obsidian" \
  -t task -p 2 \
  --description "Create .obsidian/ config for power users"

bd create "4.5: Legacy migration script" \
  -t task -p 3 \
  --description "Migrate old files to new wiki-link format"

echo ""
echo "=== Creating Track 5 Tasks ==="

bd create "5.1: Cross-platform builds" \
  -t task -p 2 \
  --description "Build darwin-arm64, darwin-amd64, linux-amd64"

bd create "5.2: Homebrew formula" \
  -t task -p 2 \
  --description "Create homebrew-kinen tap with formula"

bd create "5.3: launchd service" \
  -t task -p 2 \
  --description "brew services start kinen-daemon support"

bd create "5.4: Release automation" \
  -t task -p 3 \
  --description "GitHub Actions for releases"

echo ""
echo "=== Creating User Decision Points ==="

bd create "UDP-1: Approve implementation plan" \
  -t task -p 0 \
  --description "USER DECISION: Review and approve track breakdown before agents start"

bd create "UDP-2: LanceDB spike decision" \
  -t task -p 1 \
  --description "USER DECISION: After spike, decide if LanceDB needed or SQLite+VSS sufficient"

bd create "UDP-3: Search UX approval" \
  -t task -p 2 \
  --description "USER DECISION: Test search quality, approve UX before release"

bd create "UDP-4: Memory extraction approval" \
  -t task -p 2 \
  --description "USER DECISION: Review extracted memories, approve format"

bd create "UDP-5: Final acceptance" \
  -t task -p 1 \
  --description "USER DECISION: Full workflow test before release"

echo ""
echo "=== Done! ==="
bd stats
echo ""
echo "View ready tasks with: bd ready"
echo "View all tasks with: bd list"


