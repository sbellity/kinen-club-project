---
artifact_type: agent_handover
track: "1B"
track_name: "Kinen Session/Round Parser"
date: 2025-12-06
---

# Agent Handover: Track 1B - Kinen Session/Round Parser

## Your Mission

Build parsers for **kinen-specific** markdown files (sessions, rounds, artifacts). Extract frontmatter, wiki-links, questions/answers for indexing.

## Context

- **Workspace**: `/Users/sbellity/code/p/kinen-go`
- **Target**: Create `internal/kinen/` package for kinen-specific parsing
- **Issue Tracking**: Use `bd` (beads) for all task tracking
- **Reference**: Look at TS parser `/Users/sbellity/code/kinen/vscode-extension/src/parsers/roundParser.ts`

## What Already Exists (DO NOT REBUILD!)

The existing memory system already handles generic text/messages. You're adding:
- **Kinen-specific** markdown parsing (rounds, artifacts)
- **Wiki-link extraction** for backlinks
- **Session structure understanding** (init.md, rounds/, artifacts/)

## What You'll Build

```
kinen-go/
└── internal/
    └── kinen/                 # NEW package for kinen-specific logic
        ├── parser.go          # Main parser interface
        ├── round.go           # Round file parsing (Q&A format)
        ├── artifact.go        # Artifact file parsing
        ├── wikilinks.go       # [[link]] extraction
        ├── session.go         # Session directory structure
        └── types.go           # Kinen-specific types
```

## Reference: TypeScript Parser

Study the existing TS parser at `/Users/sbellity/code/kinen/vscode-extension/src/parsers/roundParser.ts`:

```typescript
// Key parsing patterns already solved in TypeScript:
export function parseRound(content: string): ParsedRound {
    // 1. Extract frontmatter (YAML between ---)
    // 2. Parse body with marked.lexer
    // 3. Extract title from # heading
    // 4. Extract questions from ### Q* headings
    // 5. Extract answers from > [!note] callouts
    // 6. Extract decisions from frontmatter + callouts
}
```

## Types You'll Implement

```go
// internal/kinen/types.go
package kinen

type ParsedRound struct {
    Path        string
    Frontmatter RoundFrontmatter
    Title       string
    Preamble    string
    Questions   []Question
    WikiLinks   []WikiLink
}

type RoundFrontmatter struct {
    ArtifactType string   `yaml:"artifact_type"`
    Date         string   `yaml:"date"`
    Session      string   `yaml:"session"`
    RoundNumber  int      `yaml:"round_number"`
    Tags         []string `yaml:"tags"`
}

type Question struct {
    ID       string   // "Q3.1"
    Title    string   // "Database Choice"
    Context  string   // Text before options
    Options  []Option
    Answer   string   // Content of > [!note] Answer
    Line     int
}

type Option struct {
    Label string // "A", "B", "C"
    Text  string
}

type WikiLink struct {
    Target  string // [[target]] or [[target|display]]
    Display string
    Line    int
    Context string // ~50 chars around link
}

type ParsedArtifact struct {
    Path        string
    Frontmatter ArtifactFrontmatter
    Title       string
    Sections    []Section
    WikiLinks   []WikiLink
}

type ArtifactFrontmatter struct {
    ArtifactType string   `yaml:"artifact_type"`
    Date         string   `yaml:"date"`
    Session      string   `yaml:"session"`
    Tags         []string `yaml:"tags"`
    Summary      string   `yaml:"summary"`
}
```

## Kinen File Formats

### Round Files (`sessions/*/rounds/*.md`)
```markdown
---
artifact_type: round_exploration
date: 2025-12-06
session: "[[20251206-01-session-name]]"
---

# Round 3: Topic Name

Preamble text...

### Q3.1: First Question

Context for the question.

- **Option A** - Description
- **Option B** - Description

> [!note] Answer
> User's answer here with [[wiki-links]]

### Q3.2: Second Question
...
```

**Chunking strategy**: One chunk per question (### Q*)

### Artifact Files (`sessions/*/artifacts/*.md`)
```markdown
---
artifact_type: technical_spec
date: 2025-12-06
session: "[[20251206-01-session-name]]"
tags:
  - tech/lancedb
  - domain/storage
---

# Technical Spec

## Section One

Content with [[wiki-links]]...

## Section Two
...
```

**Chunking strategy**: One chunk per section (##)

### Memory Files (`sessions/*/memories/*.md`)
```markdown
---
artifact_type: decision
date: 2025-12-06
source: "[[rounds/03-shipping-plan]]"
confidence: 0.92
tags:
  - decision/architecture
---

# Use LanceDB for Indexing

Decision content...

## Rationale
...
```

**Chunking strategy**: Whole file as one chunk (small files)

## Tasks

| Task | Description | Acceptance |
|------|-------------|------------|
| `1B.1` | Markdown parser | Goldmark setup, AST traversal |
| `1B.2` | Frontmatter parser | YAML extraction, typed values |
| `1B.3` | Wiki-link extractor | Regex, context capture, line numbers |
| `1B.4` | Semantic chunker | By question for rounds, by section for artifacts |
| `1B.5` | Index builder | Orchestrates parse → chunk → return |

## Wiki-Link Patterns

```go
// Must handle all these formats:
var wikiLinkPatterns = []string{
    `[[simple-link]]`,
    `[[link|display text]]`,
    `[[folder/link]]`,
    `[[link#heading]]`,
    `[[link#heading|display]]`,
}

// Must NOT match inside code blocks:
// ```
// [[not-a-link]]
// ```
```

## Chunking Rules

1. **Rounds**: Split at `### Q*` headings
   - Each chunk includes question + context + options + answer
   - Chunk type: "question"

2. **Artifacts**: Split at `##` headings
   - Each chunk is one section
   - Chunk type: "section"
   - If section > 512 tokens, split at paragraphs

3. **Memories**: Single chunk per file
   - Chunk type: "decision"

4. **All files**: 
   - Maximum chunk size: 512 tokens
   - Include 2 lines overlap between chunks
   - Preserve line numbers for navigation

## Dependencies

- **You provide to others**: Parser interface, ParsedDocument type
- **You need from others**: 
  - Track 1C will consume your chunks
  - Track 1D will call your parser on file changes

## Test Data

Use the actual kinen space at `/Users/sbellity/code/kinen/sessions/`:

```bash
# Test parsing a real round
go test ./internal/index -run TestParseRound -v

# Should successfully parse:
# - 20251206-01-kinen-beads-devx/rounds/01-foundation.md
# - 20251206-01-kinen-beads-devx/rounds/02-daemon-and-integration.md
# - 20251206-01-kinen-beads-devx/rounds/03-shipping-plan.md
```

## Test Commands

```bash
# Build
go build ./internal/index/...

# Run tests
go test ./internal/index/... -v

# Benchmark parsing
go test ./internal/index/... -bench=.
```

## Success Criteria

```go
// These tests must pass
func TestParseRound(t *testing.T) {
    content := readFile("testdata/sample-round.md")
    doc, err := parser.Parse("rounds/01.md", content)
    
    assert.NoError(t, err)
    assert.Equal(t, "round", doc.Type)
    assert.GreaterOrEqual(t, len(doc.Chunks), 3) // At least 3 questions
    assert.GreaterOrEqual(t, len(doc.WikiLinks), 1)
}

func TestWikiLinkExtraction(t *testing.T) {
    content := []byte(`See [[my-note|click here]] for details.`)
    links := extractWikiLinks(content)
    
    assert.Len(t, links, 1)
    assert.Equal(t, "my-note", links[0].Target)
    assert.Equal(t, "click here", links[0].Display)
}

func TestChunkerRespectsTokenLimit(t *testing.T) {
    longContent := strings.Repeat("word ", 1000)
    chunks := chunker.Chunk(longContent, "section")
    
    for _, c := range chunks {
        assert.LessOrEqual(t, tokenCount(c.Content), 512)
    }
}
```

## Libraries to Use

```go
import (
    "github.com/yuin/goldmark"          // Markdown parsing
    "github.com/yuin/goldmark/ast"
    "gopkg.in/yaml.v3"                  // Frontmatter
    "github.com/pkoukk/tiktoken-go"     // Token counting
)
```

## Notes

- Goldmark is already a dependency in kinen-go
- Be careful with code blocks - don't extract wiki-links from them
- Line numbers are 1-indexed
- Context around wiki-links should be ~50 chars before and after

## Questions?

If blocked, create a beads issue:
```bash
bd create "Blocked: Need clarification on X" -t task -p 0 --labels "blocked"
```

Good luck! 🚀

