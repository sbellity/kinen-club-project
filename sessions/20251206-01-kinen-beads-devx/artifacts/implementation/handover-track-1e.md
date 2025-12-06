---
artifact_type: agent_handover
track: "1E"
track_name: "Memory Consolidation"
date: 2025-12-06
epic_id: kinen-ea7
---

# Agent Handover: Track 1E - Memory Consolidation

> [!warning] MANDATORY: Beads Status Updates
> **You MUST update beads** — chat is NOT a communication channel!
> 
> 1. **Start**: `bd update kinen-ea7 --status in_progress --notes "Starting Track 1E"`
> 2. **Every 30-60 min**: `bd update TASK_ID --notes "Progress: [status]"`
> 3. **When blocked**: `bd create "BLOCKED [1E]: [issue]" -t task -p 0 --assignee coordinator \
  --deps discovered-from:kinen-ea7`
> 4. **Before ending**: Update ALL tasks with current status
> 
> **See `collaboration.md` for full protocol.**

## Your Mission

Extract decisions from kinen sessions and write them as structured memory files with wiki-links back to source.

## Context

- **Workspace**: `/Users/sbellity/code/p/kinen-go`
- **Target**: Create `internal/consolidation/` package
- **Dependencies**: Track 1B (Parser)

## What You'll Build

```
kinen-go/
└── internal/
    └── consolidation/
        ├── extractor.go     # Extract decisions from rounds
        ├── writer.go        # Write memory files
        ├── types.go         # Decision types
        └── consolidator.go  # Orchestrator
```

## Interface

```go
package consolidation

type Consolidator interface {
    ConsolidateSession(ctx context.Context, sessionPath string, dryRun bool) (*ConsolidateResult, error)
}

type Decision struct {
    ID         string  // D{round}.{num}
    Text       string  // Decision content
    SourcePath string  // Path to source round
    Question   string  // Source question
    Confidence float64 // 0.0-1.0 based on explicitness
}

type ConsolidateResult struct {
    Decisions      []Decision
    FilesCreated   []string // If not dry-run
    Errors         []error
}
```

## Decision Detection

Decisions are marked in rounds with callouts:

```markdown
### Q3.1: Database Choice

> [!note] Answer
> Use LanceDB for hybrid search.

> [!note] Decision
> We will use LanceDB because it supports both vector and full-text search.
```

**Extract pattern**:
```go
// Match: > [!note] Answer or > [!note] Decision
var decisionPattern = regexp.MustCompile(`(?m)^>\s*\[!note\]\s*(Answer|Decision)\s*\n((?:>.*\n?)+)`)
```

## Output Format

Memory files go to `sessions/{session}/memories/`:

```markdown
---
artifact_type: decision
date: 2025-12-06
source_round: "[[rounds/03-shipping-plan]]"
source_question: "Q3.1"
confidence: 0.92
tags:
  - decision/architecture
  - tech/lancedb
---

# D3.1: Use LanceDB for Indexing

Use LanceDB for hybrid search.

## Context

From [[rounds/03-shipping-plan#Q3.1]]:

> Database Choice: We need to choose between SQLite+extensions and LanceDB...

## Rationale

LanceDB supports both vector and full-text search natively...
```

## Tasks

| Task | Description | Acceptance |
|------|-------------|------------|
| `1E.1` | Decision extractor | Parse callouts, extract with context |
| `1E.2` | Memory file writer | Write markdown with frontmatter + links |
| `1E.3` | Session close trigger | Hook into session lifecycle |
| `1E.4` | Dry-run mode | Show what would be created |

## Success Criteria

```bash
# Dry-run consolidation
curl -X POST http://localhost:7319/api/v1/memory/consolidate \
  -d '{"session": "20251206-01-kinen-beads-devx", "dry_run": true}' | jq

# Should show decisions found:
# {
#   "decisions": [
#     { "id": "D3.1", "text": "Use LanceDB...", "confidence": 0.92 },
#     ...
#   ]
# }

# Actual consolidation
curl -X POST http://localhost:7319/api/v1/memory/consolidate \
  -d '{"session": "20251206-01-kinen-beads-devx", "dry_run": false}'

# Verify files created
ls sessions/20251206-01-kinen-beads-devx/memories/
# → D3.1-use-lancedb.md, D3.2-files-as-truth.md, ...
```

## Notes

- Decisions must have wiki-links to source
- Confidence: 1.0 for explicit `[!note] Decision`, 0.8 for `[!note] Answer`
- Skip empty answers
- Idempotent: re-running doesn't create duplicates

## Questions & Blockers

**Use beads to communicate questions and blockers.** A coordinator will monitor and respond.

```bash
# When blocked
bd create "BLOCKED [1E]: [describe issue]" -t task -p 0 \
  --assignee coordinator \
  --deps discovered-from:kinen-ea7 --notes "Context: [details]"

# When you have a question
bd create "QUESTION [1E]: [your question]" -t task -p 1 \
  --assignee coordinator \
  --deps discovered-from:kinen-ea7 --notes "Options: [A, B, C]"
```

Good luck! 🚀

