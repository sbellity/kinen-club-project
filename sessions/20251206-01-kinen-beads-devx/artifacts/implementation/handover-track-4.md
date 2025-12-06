---
artifact_type: agent_handover
track: "4"
track_name: "Obsidian Compatibility"
date: 2025-12-06
epic_id: kinen-9zl
---

# Agent Handover: Track 4 - Obsidian Compatibility

> [!warning] MANDATORY: Beads Status Updates
> **You MUST update beads** — chat is NOT a communication channel!
> 
> 1. **Start**: `bd update kinen-9zl --status in_progress --notes "Starting Track 4"`
> 2. **Every 30-60 min**: `bd update TASK_ID --notes "Progress: [status]"`
> 3. **When blocked**: `bd create "BLOCKED [4]: [issue]" -t task -p 0 --assignee coordinator \
  --deps discovered-from:kinen-9zl`
> 4. **Before ending**: Update ALL tasks with current status
> 
> **See `collaboration.md` for full protocol.**

## Your Mission

Ensure all kinen-generated files work perfectly in Obsidian with proper wiki-links, frontmatter, and callouts.

## Context

- **Workspace**: `/Users/sbellity/code/p/kinen-go` (Go package)
- **Dependencies**: None - fully independent
- **Scope**: File format changes, templates, migration
- **Note**: kinen-go currently parses markdown files (`internal/kinen/`). File generation may need to be added (see Track 2) or may already exist in MCP handlers.

## Development Workflow

```bash
# Navigate to workspace
cd /Users/sbellity/code/p/kinen-go

# Build and test
make check    # Fast syntax/type checking (recommended)
make build    # Build the project
make test     # Run all tests

# Run commands
go run ./cmd/kinen init --obsidian --space /path/to/space
go run ./cmd/kinen cli migrate --space /path/to/space --dry-run

# See AGENTS.md in kinen-go for full development commands
```

## What You'll Do

1. **Audit existing code**: Review `internal/kinen/` for any file generation code
2. **Update file generators**: Ensure all markdown generation uses wiki-links
3. **Standardize frontmatter**: Update `RoundFrontmatter` and `ArtifactFrontmatter` types to match schema
4. **Validate callouts**: Ensure `> [!note]` format is used consistently
5. **Add `kinen init --obsidian`**: Create command to set up Obsidian config
6. **Create migration script**: `cmd/kinen/commands/migrate.go` to update legacy files

## Wiki-Link Standards

### Before (current)
```markdown
See the technical spec for details.
Related: 20251203-01-kinen-resources-and-indexing
```

### After (your changes)
```markdown
See [[artifacts/technical-spec]] for details.
Related: [[20251203-01-kinen-resources-and-indexing]]
```

## Files to Update

### Existing Code to Review

- **Frontmatter parsing**: `internal/kinen/frontmatter.go` - Already parses frontmatter
- **Types**: `internal/kinen/types.go` - Defines `RoundFrontmatter` and `ArtifactFrontmatter`
- **MCP handlers**: `cmd/kinen/mcp/` - May generate files via MCP server
- **Track 2**: Check if session/round creation exists in Go CLI port

### Session Init (New or Update)

If file generation doesn't exist yet, create in `internal/kinen/writer.go` or similar:

```go
// internal/kinen/writer.go
package kinen

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
	"gopkg.in/yaml.v3"
)

// WriteSessionInit creates an init.md file for a new session
func WriteSessionInit(sessionPath, name, sessionType string, relatedSessions []string) error {
	date := time.Now().Format("2006-01-02")
	slug := filepath.Base(sessionPath)
	
	frontmatter := map[string]interface{}{
		"artifact_type": "session_init",
		"date":          date,
		"type":          sessionType,
		"status":        "active",
		"tags": []string{
			fmt.Sprintf("session/%s", sessionType),
			"status/active",
		},
		"aliases": []string{slug},
	}
	
	var relatedLinks []string
	for _, s := range relatedSessions {
		relatedLinks = append(relatedLinks, fmt.Sprintf("- [[%s]]", s))
	}
	
	content := fmt.Sprintf(`---
artifact_type: session_init
date: %s
type: %s
status: active
tags:
  - session/%s
  - status/active
aliases:
  - %s
---

# %s

## Goals

...

## Related Sessions

%s
`, date, sessionType, sessionType, slug, name, 
		fmt.Sprintf("%s\n", relatedLinks))
	
	return os.WriteFile(filepath.Join(sessionPath, "init.md"), []byte(content), 0644)
}
```

### Round Template

```markdown
---
artifact_type: round_exploration
date: 2025-12-06
session: "[[20251206-01-session-name]]"
round_number: 1
status: in_progress
tags:
  - round/exploration
  - status/in-progress
---

# Round 1: Foundation

## Previous Decisions

From [[rounds/00-foundation]] we established:
- ...

### Q1.1: First Question

Context text with [[wiki-links]] to relevant content.

**Options:**
- [ ] **Option A** - Description
- [ ] **Option B** - Description

> [!note] Answer
> User's answer here
```

### Artifact Template

```markdown
---
artifact_type: technical_spec
date: 2025-12-06
session: "[[20251206-01-session-name]]"
tags:
  - artifact/spec
  - tech/lancedb
summary: "Technical specification for..."
---

# Technical Specification

## Overview

Content with [[wiki-links]]...

## See Also

- [[rounds/01-foundation]] - Initial decisions
- [[artifacts/implementation-ideas]] - Related ideas
```

## Frontmatter Schema

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `artifact_type` | ✅ | string | session_init, round_exploration, technical_spec, decision, etc. |
| `date` | ✅ | string | ISO 8601 date |
| `session` | ✅* | wiki-link | Parent session (*except for init.md) |
| `tags` | ✅ | array | Prefixed tags |
| `summary` | ✅ | string | One-line description |
| `status` | optional | string | active, complete, archived |
| `aliases` | optional | array | Alternative names |

### Tag Prefixes

- `session/` - Session type (architecture, implementation, etc.)
- `round/` - Round type (foundation, exploration, etc.)
- `artifact/` - Artifact type (spec, plan, etc.)
- `tech/` - Technology (lancedb, obsidian, etc.)
- `domain/` - Domain (storage, search, etc.)
- `status/` - Status (active, complete, etc.)
- `decision/` - Decision category

## Tasks

| Task | Description | Acceptance |
|------|-------------|------------|
| `4.1` | Wiki-links in generated content | All generated files use `[[links]]` |
| `4.2` | Frontmatter standardization | All files have required fields |
| `4.3` | Callout format validation | `> [!note]` renders correctly |
| `4.4` | `kinen init --obsidian` | Creates .obsidian/ with config |
| `4.5` | Legacy migration script | Updates old files to new format |

## `kinen init --obsidian`

Add command to `cmd/kinen/commands/init.go`:

```go
// cmd/kinen/commands/init.go
package commands

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
)

func RunInit(args []string) int {
	fs := flag.NewFlagSet("init", flag.ExitOnError)
	obsidian := fs.Bool("obsidian", false, "Create Obsidian configuration")
	spacePath := fs.String("space", ".", "Path to kinen space")
	fs.Parse(args)
	
	if *obsidian {
		return createObsidianConfig(*spacePath)
	}
	
	fmt.Println("Usage: kinen init --obsidian [--space <path>]")
	return 1
}

func createObsidianConfig(spacePath string) int {
	obsidianDir := filepath.Join(spacePath, ".obsidian")
	if err := os.MkdirAll(obsidianDir, 0755); err != nil {
		fmt.Fprintf(os.Stderr, "error: failed to create .obsidian directory: %v\n", err)
		return 1
	}
	
	// Create app.json
	appConfig := map[string]interface{}{
		"useMarkdownLinks": false,
		"newLinkFormat":    "relative",
		"showFrontmatter":  true,
	}
	
	appJSON, _ := json.MarshalIndent(appConfig, "", "  ")
	appPath := filepath.Join(obsidianDir, "app.json")
	if err := os.WriteFile(appPath, appJSON, 0644); err != nil {
		fmt.Fprintf(os.Stderr, "error: failed to write app.json: %v\n", err)
		return 1
	}
	
	// Create snippets directory
	snippetsDir := filepath.Join(obsidianDir, "snippets")
	if err := os.MkdirAll(snippetsDir, 0755); err != nil {
		fmt.Fprintf(os.Stderr, "error: failed to create snippets directory: %v\n", err)
		return 1
	}
	
	// Create kinen.css
	cssContent := `/* Custom callout for decisions */
.callout[data-callout="decision"] {
  --callout-color: 139, 92, 246;
  --callout-icon: lucide-check-circle;
}

/* Kinen question styling */
.markdown-preview-view h3:has(+ .callout) {
  border-left: 3px solid var(--interactive-accent);
  padding-left: 1em;
}
`
	cssPath := filepath.Join(snippetsDir, "kinen.css")
	if err := os.WriteFile(cssPath, []byte(cssContent), 0644); err != nil {
		fmt.Fprintf(os.Stderr, "error: failed to write kinen.css: %v\n", err)
		return 1
	}
	
	fmt.Printf("✅ Created Obsidian configuration in %s\n", obsidianDir)
	return 0
}
```

Creates Obsidian-specific config:

```
.obsidian/
├── app.json              # Core settings
├── appearance.json       # Theme settings (optional)
└── snippets/
    └── kinen.css         # Custom styles for callouts
```

### app.json

```json
{
  "useMarkdownLinks": false,
  "newLinkFormat": "relative",
  "showFrontmatter": true
}
```

### kinen.css

```css
/* Custom callout for decisions */
.callout[data-callout="decision"] {
  --callout-color: 139, 92, 246;
  --callout-icon: lucide-check-circle;
}

/* Kinen question styling */
.markdown-preview-view h3:has(+ .callout) {
  border-left: 3px solid var(--interactive-accent);
  padding-left: 1em;
}
```

## Migration Script

Create `cmd/kinen/commands/migrate.go`:

```go
// cmd/kinen/commands/migrate.go
package commands

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	
	"github.com/sbellity/kinen/internal/kinen"
)

func RunMigrate(spacePath string, dryRun bool) int {
	err := filepath.Walk(spacePath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		
		if !strings.HasSuffix(path, ".md") {
			return nil
		}
		
		content, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		
		updated, changed := migrateContent(string(content), path, spacePath)
		if changed {
			relPath, _ := filepath.Rel(spacePath, path)
			if dryRun {
				fmt.Printf("Would update: %s\n", relPath)
			} else {
				if err := os.WriteFile(path, []byte(updated), 0644); err != nil {
					return fmt.Errorf("failed to write %s: %w", path, err)
				}
				fmt.Printf("Updated: %s\n", relPath)
			}
		}
		
		return nil
	})
	
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: migration failed: %v\n", err)
		return 1
	}
	
	return 0
}

func migrateContent(content, filePath, spacePath string) (string, bool) {
	changed := false
	
	// 1. Parse existing frontmatter (if any)
	fm, rest, err := kinen.ParseFrontmatter(content)
	if err != nil {
		// No frontmatter - add it
		content = addFrontmatter(content, filePath, spacePath)
		changed = true
		rest = content
		fm, rest, _ = kinen.ParseFrontmatter(content)
	}
	
	// 2. Ensure required frontmatter fields
	updated := ensureFrontmatterFields(rest, fm, filePath, spacePath)
	if updated != rest {
		changed = true
		rest = updated
	}
	
	// 3. Convert plain text references to wiki-links
	// Pattern: session names like "20251203-01-kinen-resources-and-indexing"
	sessionPattern := regexp.MustCompile(`\b(\d{8}-\d{2}-[a-z0-9-]+)\b`)
	rest = sessionPattern.ReplaceAllStringFunc(rest, func(match string) string {
		return fmt.Sprintf("[[%s]]", match)
	})
	
	// 4. Fix callout format if needed (ensure Obsidian format)
	calloutPattern := regexp.MustCompile(`> \[!(\w+)\]\s+`)
	rest = calloutPattern.ReplaceAllString(rest, "> [!$1] ")
	
	// Reconstruct with frontmatter
	if changed || rest != content {
		return reconstructWithFrontmatter(fm, rest), true
	}
	
	return content, false
}

func addFrontmatter(content, filePath, spacePath string) string {
	// Determine artifact type from path
	artifactType := "document"
	if strings.Contains(filePath, "rounds/") {
		artifactType = "round_exploration"
	} else if strings.Contains(filePath, "artifacts/") {
		artifactType = "technical_spec"
	} else if strings.HasSuffix(filePath, "init.md") {
		artifactType = "session_init"
	}
	
	// Extract session name from path
	sessionName := extractSessionName(filePath, spacePath)
	
	fm := fmt.Sprintf(`---
artifact_type: %s
date: %s
session: "[[%s]]"
tags: []
---

`, artifactType, time.Now().Format("2006-01-02"), sessionName)
	
	return fm + content
}

func ensureFrontmatterFields(content string, fm *kinen.RoundFrontmatter, filePath, spacePath string) string {
	// Implementation: ensure all required fields are present
	// This is a placeholder - implement based on frontmatter schema
	return content
}

func reconstructWithFrontmatter(fm *kinen.RoundFrontmatter, content string) string {
	// Serialize frontmatter back to YAML and prepend to content
	// Use yaml.Marshal or similar
	return content // Placeholder
}

func extractSessionName(filePath, spacePath string) string {
	rel, _ := filepath.Rel(spacePath, filePath)
	parts := strings.Split(rel, string(filepath.Separator))
	if len(parts) > 0 {
		return parts[0]
	}
	return "unknown"
}
```

## Success Criteria

```bash
# Open space in Obsidian
# 1. Graph view shows connections
# 2. Backlinks panel works
# 3. Callouts render correctly
# 4. No "unresolved link" warnings

# Validation script
cd /Users/sbellity/code/kinen
for f in sessions/**/*.md; do
  # Check frontmatter
  head -20 "$f" | grep -q "artifact_type:" || echo "Missing artifact_type: $f"
  # Check for wiki-links in non-init files
  if [[ "$f" != *"init.md" ]]; then
    grep -q "\[\[" "$f" || echo "No wiki-links: $f"
  fi
done
```

## Notes

- **Codebase**: kinen-go is in `/Users/sbellity/code/p/kinen-go`
- **Existing parsers**: `internal/kinen/frontmatter.go` already parses frontmatter
- **Types**: `internal/kinen/types.go` defines frontmatter structs - may need updates
- **Wiki-links**: Use relative paths from space root
- **Link resolution**: 
  - `[[session-name]]` → `sessions/session-name/init.md`
  - `[[rounds/01-foundation]]` → current session's rounds directory
- **Callouts**: `> [!note]`, `> [!warning]`, `> [!decision]` format
- **Testing**: Open space in Obsidian after changes to verify links and callouts work
- **Track 2 dependency**: Check if session/round creation exists in Go CLI port

## Questions & Blockers

**Use beads to communicate questions and blockers.** A coordinator will monitor and respond.

```bash
# When blocked
bd create "BLOCKED [4]: [describe issue]" -t task -p 0 \
  --assignee coordinator \
  --deps discovered-from:kinen-9zl --notes "Context: [details]"

# When you have a question
bd create "QUESTION [4]: [your question]" -t task -p 1 \
  --assignee coordinator \
  --deps discovered-from:kinen-9zl --notes "Options: [A, B, C]"
```

Good luck! 🚀

