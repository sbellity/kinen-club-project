---
date: 2025-11-12
artifact_type: technical_spec
aliases:
  - "obsidian-integration - Plugin Integration Spec"
tags:
  - space/p
  - domain/research
  - tech/obsidian
  - tech/fam
  - tech/kinen
summary: "Detailed specification for Obsidian plugin + FAM/Kinen integration"
---

# Kinen Obsidian Plugin + FAM Integration Specification

## Overview

This specification defines how the Kinen Obsidian plugin integrates with FAM (Fam of Agents Multitasking) to provide native Obsidian support for kinen sessions.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Obsidian Vault (Kinen Sessions)            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Kinen Obsidian Plugin (TypeScript)          │  │
│  │  - Session management UI                          │  │
│  │  - Round creation/editing                         │  │
│  │  - Callout helpers                                │  │
│  │  - Dashboard generation                           │  │
│  │  - Status bar integration                         │  │
│  └───────────────────┬──────────────────────────────┘  │
│                      │ HTTP API (localhost:8080)         │
└──────────────────────┼──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│           FAM Core Daemon (Go)                          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Orchestrator (LLM-powered)                │  │
│  │  - Creates rounds based on methodology            │  │
│  │  - Suggests links to related sessions             │  │
│  │  - Extracts decisions from rounds                 │  │
│  │  - Generates cross-session insights               │  │
│  │  - Semantic search orchestration                  │  │
│  └───────────────────┬──────────────────────────────┘  │
│                      │                                   │
│  ┌───────────────────▼──────────────────────────────┐  │
│  │    Repository (Obsidian Backend + In-Memory DB)   │  │
│  │  - Reads/writes Obsidian vault files              │  │
│  │  - In-memory SQLite for transient state           │  │
│  │  - DuckDB for queries/indexing                     │  │
│  │  - Checkpointing to temp folder                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Design Decisions

### 1. Vault = Workspace

- One Obsidian vault = one FAM workspace
- All kinen sessions live in vault
- FAM manages vault as primary storage
- Vault path configured in FAM settings

### 2. Hybrid Storage Model

**Obsidian Vault** (Primary):
- Session files (`init.md`, `rounds/*.md`, `artifacts/*.md`)
- All markdown content
- Frontmatter metadata
- Version control friendly

**In-Memory SQLite** (Transient):
- Agent execution state
- Turn execution state
- Workspace management state
- Checkpointed to `.fam/temp/` for graceful restart

**DuckDB** (Queries/Indexing):
- Semantic search embeddings
- Cross-session queries
- Analytics and insights
- File-based (`.fam/duckdb/fam.db`)

### 3. Rehydration Strategy

- FAM can fully rehydrate from vault files
- Loss of DB state is not a problem (reconstruct from files)
- Turn execution state encoded in session file metadata
- On startup: Scan vault → rebuild in-memory state

### 4. State Encoding

**Session Metadata** (in `init.md` frontmatter):
```yaml
---
fam_session_id: sess-001
fam_status: in-progress
fam_current_round: 3
fam_last_turn: 2025-11-12T10:30:00Z
---
```

**Round Metadata** (in `round-XX.md` frontmatter):
```yaml
---
fam_round_number: 3
fam_status: complete
fam_completed_at: 2025-11-12T10:30:00Z
---
```

---

## API Specification

### Base URL

```
http://localhost:8080/api
```

### Endpoints

#### Session Management

**Create Session**
```
POST /sessions
Content-Type: application/json

{
  "name": "Session Name",
  "type": "iterative-design",
  "domain_tag": "architecture",
  "goals": ["Goal 1", "Goal 2"],
  "success_criteria": ["Criteria 1"],
  "vault_path": "/path/to/vault"
}

Response:
{
  "session_id": "sess-001",
  "session_path": "sessions/20251112-01-session-name",
  "init_file": "sessions/20251112-01-session-name/init.md"
}
```

**List Sessions**
```
GET /sessions?status=in-progress&tag=architecture

Response:
{
  "sessions": [
    {
      "session_id": "sess-001",
      "name": "Session Name",
      "status": "in-progress",
      "current_round": 3,
      "path": "sessions/20251112-01-session-name"
    }
  ]
}
```

**Get Session**
```
GET /sessions/:id

Response:
{
  "session_id": "sess-001",
  "name": "Session Name",
  "status": "in-progress",
  "current_round": 3,
  "rounds": [
    {"number": 1, "file": "rounds/01-linking-conventions.md", "status": "complete"},
    {"number": 2, "file": "rounds/02-methodology.md", "status": "complete"},
    {"number": 3, "file": "rounds/03-proposals.md", "status": "in-progress"}
  ],
  "artifacts": ["integration-plan.md"]
}
```

#### Round Management

**Generate Next Round**
```
POST /sessions/:id/rounds
Content-Type: application/json

{
  "methodology": "iterative-design",
  "previous_rounds": ["rounds/01-linking.md", "rounds/02-methodology.md"]
}

Response:
{
  "round_number": 3,
  "round_file": "rounds/03-concrete-proposals.md",
  "status": "generated"
}
```

**Mark Round Complete**
```
POST /sessions/:id/rounds/:round_number/complete

Response:
{
  "round_number": 3,
  "status": "complete",
  "next_round_ready": true
}
```

#### Link Suggestions

**Suggest Links**
```
GET /sessions/:id/links?round=3

Response:
{
  "suggested_links": [
    {
      "text": "linking conventions",
      "target": "sessions/20251111-01-datahub/rounds/01-linking.md",
      "reason": "Similar topic discussed in previous session"
    }
  ]
}
```

#### Semantic Search

**Semantic Search**
```
POST /search/semantic
Content-Type: application/json

{
  "query": "Sessions about charging architecture",
  "limit": 10
}

Response:
{
  "results": [
    {
      "session_id": "sess-002",
      "session_name": "Charging Architecture",
      "file": "sessions/20251111-02-charging/README.md",
      "relevance": 0.95,
      "excerpt": "..."
    }
  ]
}
```

#### Dashboard Generation

**Generate Dashboard**
```
GET /sessions/:id/dashboard

Response:
{
  "dashboard_content": "# Session Dashboard\n\n...",
  "dashboard_file": "artifacts/dashboard.md"
}
```

---

## Plugin Features

### 1. Session Management

**Create Session**:
- Command: "Kinen: Create New Session"
- Modal form with:
  - Session name
  - Session type (dropdown)
  - Domain tag (dropdown)
  - Goals (textarea)
  - Success criteria (textarea)
- Generates folder structure + files

**View Sessions**:
- Command: "Kinen: List Sessions"
- Shows all sessions with status
- Click to open session

### 2. Round Interaction

**Pre-populate Callouts**:
- When generating rounds, pre-populate `> [!note] Answer` blocks
- User just types inside

**Mark Complete**:
- Status bar button: "Ready for Round N"
- Command: "Kinen: Mark Round Complete"
- Updates metadata, triggers next round generation

### 3. AI Integration

**Generate Next Round**:
- Button: "Generate Next Round"
- Calls FAM API
- Shows progress indicator
- Opens generated round file

**Suggest Links**:
- Button: "Suggest Links"
- Calls FAM API for semantic search
- Inserts links into current round

**Extract Decisions**:
- Button: "Extract Decisions"
- Calls FAM API to extract decisions from rounds
- Updates living documents

### 4. Dashboard Generation

**Auto-generate Dashboard**:
- Uses Dataview plugin queries
- Shows:
  - Progress (rounds completed)
  - Decisions made
  - Open questions
  - Related sessions
- Updates automatically

---

## Implementation Phases

### Phase 1: Basic Integration
- FAM daemon with HTTP API
- Plugin: Session creation, round generation
- Basic file operations

### Phase 2: Enhanced Features
- Link suggestions
- Semantic search
- Dashboard generation

### Phase 3: Advanced Features
- Cross-session analysis
- Methodology enforcement
- Template system integration

---

## Error Handling

**FAM Not Running**:
- Plugin shows error: "FAM daemon not running"
- Button: "Start FAM" (if available)

**API Errors**:
- Show user-friendly error messages
- Log errors for debugging
- Retry logic for transient errors

**File Conflicts**:
- Detect concurrent edits
- Show conflict resolution UI
- Merge strategies

---

## Security Considerations

- HTTP API only on localhost
- No external network access
- File operations scoped to vault
- User confirmation for destructive operations

---

## Testing Strategy

- Unit tests for plugin functions
- Integration tests for API
- End-to-end tests for workflows
- User acceptance testing

---

_This specification should be updated as implementation progresses._

