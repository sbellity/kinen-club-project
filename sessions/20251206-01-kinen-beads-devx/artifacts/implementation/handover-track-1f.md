---
artifact_type: agent_handover
track: "1F"
track_name: "PDF + Resources"
date: 2025-12-06
epic_id: kinen-5iv
---

# Agent Handover: Track 1F - PDF + Resources

> [!warning] MANDATORY: Beads Status Updates
> **You MUST update beads** — chat is NOT a communication channel!
> 
> 1. **Start**: `bd update kinen-5iv --status in_progress --notes "Starting Track 1F"`
> 2. **Every 30-60 min**: `bd update TASK_ID --notes "Progress: [status]"`
> 3. **When blocked**: `bd create "BLOCKED [1F]: [issue]" -t task -p 0 --assignee coordinator \
  --deps discovered-from:kinen-5iv`
> 4. **Before ending**: Update ALL tasks with current status
> 
> **See `collaboration.md` for full protocol.**

## Your Mission

Parse PDF files and web clips in the `resources/` folder for indexing alongside session content.

## Context

- **Workspace**: `/Users/sbellity/code/p/kinen-go`
- **Target**: Create `internal/resources/` package
- **Independent**: Can start Day 1

## What You'll Build

```
kinen-go/
└── internal/
    └── resources/
        ├── pdf.go           # PDF text extraction
        ├── scanner.go       # Scan resources folder
        ├── webclip.go       # Web clip frontmatter
        └── types.go
```

## Interface

```go
package resources

type ResourceParser interface {
    Parse(path string) (*ParsedResource, error)
    SupportedExtensions() []string
}

type ParsedResource struct {
    Path      string
    Type      string // "pdf", "webclip", "note"
    Title     string
    Content   string
    Chunks    []ResourceChunk
    Metadata  map[string]interface{}
    SourceURL string // For web clips
}

type ResourceChunk struct {
    Content string
    Page    int    // For PDFs
    Section string // For web clips
}
```

## Resources Folder Structure

```
resources/
├── index.md              # TOC (markdown, index normally)
├── links.md              # Curated links (markdown)
├── papers/
│   ├── friston-fep.pdf   # PDF → extract text
│   └── walker-sleep.pdf
└── notes/
    ├── lancedb-docs.md   # Web clip with source_url
    └── obsidian-api.md
```

## PDF Parsing

Use `pdfcpu` for text extraction:

```go
import "github.com/pdfcpu/pdfcpu/pkg/api"

func ParsePDF(path string) (*ParsedResource, error) {
    // Extract text from all pages
    text, err := api.ExtractText(path, nil)
    if err != nil {
        return nil, err
    }
    
    // Chunk by page
    chunks := chunkByPage(text)
    
    return &ParsedResource{
        Path:    path,
        Type:    "pdf",
        Content: text,
        Chunks:  chunks,
    }, nil
}
```

## Web Clip Format

```markdown
---
artifact_type: web_clip
source_url: https://lancedb.github.io/lancedb/
clipped_at: 2025-12-06
tags:
  - tech/lancedb
---

# LanceDB Documentation

Content clipped from web...
```

## Tasks

| Task | Description | Acceptance |
|------|-------------|------------|
| `1F.1` | pdfcpu integration | Extract text from PDF |
| `1F.2` | Resource scanner | Scan resources/ recursively |
| `1F.3` | Web clip parser | Parse frontmatter, extract source_url |
| `1F.4` | Index builder hook | Resources appear in search results |

## Success Criteria

```bash
# Add a PDF to resources
cp paper.pdf /path/to/space/resources/papers/

# Rebuild index
curl -X POST http://localhost:7319/api/v1/index/build \
  -d '{"space": "/path/to/space", "force": true}'

# Search should find PDF content
curl -X POST http://localhost:7319/api/v1/search \
  -d '{"query": "content from PDF"}' | jq '.results[0].type'
# → "resource"
```

## Notes

- Skip scanned PDFs (no text layer) - log warning
- Chunk PDFs by page (natural boundaries)
- Preserve source_url for web clips
- Resources get `type: "resource"` in index

## Questions & Blockers

**Use beads to communicate questions and blockers.** A coordinator will monitor and respond.

```bash
# When blocked
bd create "BLOCKED [1F]: [describe issue]" -t task -p 0 \
  --assignee coordinator \
  --deps discovered-from:kinen-5iv --notes "Context: [details]"

# When you have a question
bd create "QUESTION [1F]: [your question]" -t task -p 1 \
  --assignee coordinator \
  --deps discovered-from:kinen-5iv --notes "Options: [A, B, C]"
```

Good luck! 🚀

