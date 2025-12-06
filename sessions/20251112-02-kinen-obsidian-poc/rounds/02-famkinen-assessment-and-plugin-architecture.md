---
date: 2025-11-12
artifact_type: round_exploration
aliases:
  - "kinen-obsidian-poc - Famkinen Assessment and Plugin Architecture"
  - "kinen-obsidian-poc - Round 2"
tags:
  - space/p
  - domain/code-implementation
  - type/iterative-design
  - tech/obsidian
  - tech/kinen
  - tech/fam
summary: "Deep dive into famkinen current state, obsidian plugin architecture, and concrete integration strategy"
---

# Round 2: Famkinen Assessment & Plugin Architecture

> [!info] Building on Round 1
> Round 1 established our hybrid vertical slice approach and identified famkinen as our backend at `~/code/p/famkinen`. This round dives deep into famkinen's current state and designs the Obsidian plugin integration.

---

## Overview

Based on Round 1 responses, I've reviewed famkinen's codebase. This round covers:
1. Famkinen's current implementation state
2. Gaps we need to fill for Obsidian integration
3. Obsidian plugin architecture and best practices
4. Concrete integration strategy
5. Track structure for organizing work

---

## Part A: Famkinen Current State Assessment

### A1. What's Already Built (✅ Complete)

From reviewing `IMPLEMENTATION_STATUS.md` and the codebase:

**Track 1: Core Types & Repository** ✅
- Domain types defined (`internal/fam/*.go`)
- SQLite repository with Goose migrations
- Content-addressable blob storage
- ~90% test coverage

**Track 2: Runtime & Sandboxing** ✅
- Docker runtime
- Git and local filesystem resources
- Resource constraints enforcement

**Track 3: ACP Integration** ✅
- Stdio-based ACP client using official SDK
- Agent registry
- Prompt building
- Example agent configs

**Track 4: Orchestrator** ✅
- LLM-powered decision engine
- Methodology template parser
- Phase tracking
- 74.6% test coverage

**Track 5: Session Manager** ✅ (~95%)
- Session CRUD operations
- Lifecycle management (Start, Pause, Resume)
- Turn execution engine
- State machine enforcement
- Feedback management
- Export functionality
- **Email collaboration** (interesting!)

**Track 6: UI** ⚠️ (~85%)
- ✅ Config system (100%)
- ⚠️ CLI commands (~40%) - core session commands work
- ✅ TUI Dashboard (~90%)
- ✅ Web UI (~95%)

---

### A2. Key Insights from Famkinen Architecture

**Q2.1: Storage Model**

Famkinen currently uses:
- **SQLite** (via `internal/repository/sqlite.go`) for sessions, turns, artifacts
- **Content-addressable blob storage** (`internal/repository/blobs.go`) - SHA256 hashing
- **Goose migrations** for schema evolution

For Obsidian integration, we need to adapt the Repository interface to use:
- **Obsidian vault (filesystem)** as primary storage
- **In-memory SQLite** for transient agent execution state
- **Content-addressable blobs** can stay the same approach

**Key Question**: The current `Repository` interface in `internal/fam/interfaces.go` defines methods like `SaveSession`, `GetSession`, etc. Do we:

**Option A**: Create a new `ObsidianRepository` implementing the same `Repository` interface, but reading/writing markdown files in vault?

**Option B**: Create a `HybridRepository` that uses both filesystem (for kinen sessions) and SQLite (for FAM agent state)?

**Option C**: Extend the existing SQLite repository with an optional filesystem backend via configuration?

Which approach aligns best with famkinen's architecture?

> [!note] Answer
> I think Option B is the way to go. please write a new track in famkinen's docs/implementation describing in details this approach, that will be handled by another agent in parallel to our work.

---

### A3. API Surface for Obsidian Plugin

**Q2.2: Existing HTTP API**

From `internal/api/server.go` and `internal/api/handlers/`, famkinen has an HTTP API server.

Current endpoints (from handlers):
- Session management (`handlers/session.go`)
- Probably workspace, agent handlers too

For Obsidian integration, we need endpoints like:
```
POST   /api/sessions              - Create session (generate init.md)
POST   /api/sessions/:id/rounds   - Generate next round
GET    /api/sessions/:id          - Get session status
GET    /api/sessions/:id/rounds/:num - Get round content
POST   /api/sessions/:id/feedback - Submit user feedback
```

**Key Questions**:
1. Does the current API already support these workflows?
2. Do we need to add new endpoints specific to kinen sessions?
3. Should we create a separate `/api/kinen/*` namespace?

I should review the existing API handlers. What do they currently support?

> [!note] Answer
> please see implem to answer your questions
> those sessions should be kinen sessions and in our hybrid approach actually create the files in our Vault
> and leverate frontmatter of the yml files for storing relevant metadata 

---

### A4. Methodology Templates

**Q2.3: Methodology System**

From `templates/methodologies/` and `internal/orchestrator/methodology.go`, famkinen supports methodology templates.

For kinen sessions, we need a methodology template that:
- Generates rounds based on previous rounds and user feedback
- Pre-populates callouts in markdown
- Follows the kinen round-based pattern
- Uses prompts from our methodology-obsidian.md

**Key Questions**:
1. What format are methodology templates? (Looking at `templates/methodologies/` - only one file there)
2. How does the orchestrator load and execute methodologies?
3. Can we create a `kinen-iterative-design` methodology template?
4. Does the methodology system support the concept of "rounds" vs "turns"?

From the architecture: **Turns** are agent executions in FAM. For kinen, each **round** might be multiple **turns** (orchestrator plans, agent generates, etc.). Or is one round = one turn?

> [!note] Answer
> This is still TBD I think please dig deeper and advise on recommended architecture (or expore alternatives if you are unsure)

---

## Part B: Obsidian Plugin Architecture

### B1. Obsidian Plugin Development

**Q2.4: Plugin Structure & Tooling**

From research on Obsidian plugin development:

**Standard Structure**:
```
plugins/obsidian/
├── manifest.json           # Plugin metadata
├── main.ts                 # Entry point
├── styles.css             # Custom styles
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── esbuild.config.mjs     # Build config
└── src/
    ├── plugin.ts          # Main plugin class
    ├── settings.ts        # Settings panel
    ├── commands.ts        # Command definitions
    ├── ui/                # UI components
    ├── api/               # FAM API client
    └── types.ts           # TypeScript types
```

**Build System**:
- Most Obsidian plugins use **esbuild** (fast, simple)
- Alternative: **Webpack** or **Rollup** (more features, slower)

**Development Workflow**:
- Plugin installed in `.obsidian/plugins/` in vault
- Hot reload: Watch mode with auto-copy to vault
- Use community plugin template as starting point

**Recommendation**: 
- Use official Obsidian plugin template: https://github.com/obsidianmd/obsidian-sample-plugin
- esbuild for fast builds
- TypeScript for type safety
- Hot reload setup for dev

Agree with this approach?

> [!note] Answer
> yes

---

### B2. Plugin Architecture Design

**Q2.5: Component Structure**

```
KinenPlugin (main.ts)
├── Settings (settings.ts)
│   ├── FAM API URL (default: http://localhost:8080)
│   ├── Current vault path
│   └── Session templates location
│
├── API Client (api/client.ts)
│   ├── createSession()
│   ├── generateRound()
│   ├── submitFeedback()
│   └── getSessionStatus()
│
├── Commands (commands.ts)
│   ├── "Kinen: Create New Session"
│   ├── "Kinen: Generate Next Round"
│   ├── "Kinen: Mark Round Complete"
│   └── "Kinen: Show Session Status"
│
├── UI Components (ui/)
│   ├── SessionCreationModal
│   ├── StatusBarButton
│   └── ProgressNotification
│
└── File Operations (vault.ts)
    ├── createSessionFolder()
    ├── writeMarkdownFile()
    └── detectCurrentSession()
```

**Q2.6: State Management**

Where should the plugin store state?
- Current active session ID
- FAM connection status
- User preferences

**Option A**: Obsidian's plugin data (JSON file in `.obsidian/plugins/kinen/data.json`)
**Option B**: In-memory only (reload from vault on startup)
**Option C**: Ask FAM daemon (plugin is stateless)

Recommendation: **Option A** for settings, **Option C** for session state (source of truth is FAM).

> [!note] Answer
> idea: let's maybe explore https://connectrpc.com/ for our RPC api ? that will give a bit more structure to our APIs and allow us to codegen clients (here for typescript ?)
> Let's go with your recommendation A+C



---

## Part C: Integration Strategy

### C1. End-to-End Workflow

**Q2.7: Session Creation Flow**

Let's map the complete flow:

```
1. User: Command palette → "Kinen: Create New Session"
   ↓
2. Plugin: Show modal (name, type, goals, domain tag)
   ↓
3. User: Fill form, click Create
   ↓
4. Plugin: Call FAM API: POST /api/kinen/sessions
   {
     "name": "Session Name",
     "type": "iterative-design",
     "vault_path": "/path/to/vault",
     "domain_tag": "domain/architecture",
     "goals": ["Goal 1", "Goal 2"],
     "success_criteria": ["Criteria 1"]
   }
   ↓
5. FAM: 
   - Create session in repository
   - Use ObsidianRepository to write files
   - Generate init.md from template
   - Create folder structure
   - Return session ID and paths
   ↓
6. Plugin:
   - Open init.md in editor
   - Show success notification
   - Update status bar
```

**Key Question**: At step 5, does FAM:
- **A)** Write files directly to vault (FAM needs vault path in config)
- **B)** Return markdown content, plugin writes files (FAM is storage-agnostic)
- **C)** Hybrid: FAM writes via Repository, plugin just opens files

Recommendation: **Option A** - FAM owns the vault storage, plugin is just UI.

> [!note] Answer
> Option A

---

### C2. Round Generation Flow

**Q2.8: Round Generation Workflow**

```
1. User: Finishes responding to Round N callouts
   ↓
2. User: Click status bar "Ready for Round N+1" OR Command palette
   ↓
3. Plugin: Call FAM API: POST /api/kinen/sessions/:id/rounds
   {
     "previous_round": "rounds/0N-topic-name.md",
     "context": "..." // Optional: extract user responses from callouts
   }
   ↓
4. FAM:
   - Orchestrator analyzes previous rounds
   - Extracts user responses from callouts
   - Generates next round using LLM
   - Creates markdown file with pre-populated callouts
   - Returns round file path
   ↓
5. Plugin:
   - Open new round file in editor
   - Show "Round N+1 generated" notification
```

**Key Questions**:
1. Should plugin extract callout responses and send to FAM? Or should FAM read the vault files directly?
2. How does FAM know which callouts contain user responses vs AI questions?
3. Should we use a special marker in callouts? (e.g., `> [!note] Answer` is standard, `> [!note] Question` for AI)

Recommendation: FAM reads vault files directly (ObsidianRepository), plugin just triggers generation.

> [!note] Answer
> FAM should read the vault files directly
> Plugin will basically say, process round and include an optional user prompt
> We can have in the template definition a strategy for defining how to parse answers for Kinen
> Right now LLMs are basically doing it itself with just a rough indication but that would indeed be interesting for famkinen to be able to parse/extract them programmatically (although not necessarily a absolutely immediate requirement... but might be worth it if trivial to do)

---

### C3. Obsidian <-> FAM Communication

**Q2.9: Plugin-Daemon Communication**

**Architecture**:
```
┌────────────────────────────────────┐
│   Obsidian Plugin (TypeScript)    │
│   - UI Layer                       │
│   - Command handlers               │
│   - File watching (optional)       │
└──────────────┬─────────────────────┘
               │ HTTP REST API
               │ (localhost:8080)
               ▼
┌────────────────────────────────────┐
│   FAM Daemon (Go)                  │
│   - HTTP API Server                │
│   - Kinen endpoints                │
│   - Session Manager                │
│   - Orchestrator                   │
└──────────────┬─────────────────────┘
               │ Repository Interface
               ▼
┌────────────────────────────────────┐
│   ObsidianRepository               │
│   - Reads/writes vault markdown    │
│   - Parses frontmatter             │
│   - Manages session file structure │
└────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────┐
│   Obsidian Vault (Filesystem)     │
│   - kinen/sessions/*/init.md       │
│   - kinen/sessions/*/rounds/*.md   │
│   - kinen/sessions/*/artifacts/    │
└────────────────────────────────────┘
```

**Key Questions**:
1. Should FAM daemon start automatically? Or user starts manually?
2. How does plugin detect if FAM is running? (Health check endpoint)
3. What happens if FAM is not running? (Show error, offer to start?)
4. Should we support remote FAM (different machine)? Or always localhost?

Recommendation: 
- User starts FAM daemon manually (`fam daemon start`)
- Plugin checks health at `/api/health` on startup
- Localhost only for POC
- Show clear error if daemon not running

> [!note] Answer
> - daemon: Let's let the user start fam manually for now. I think we will distribute it as a Mac app later. but that can be manual via cli now.
> - health: yes plugin should call health check
> - if no fam running, then yes the plugin should show errors or at least say that the subsystem is not available
> - remote fam: YES !!

---

## Part D: Repository Integration

### D1. ObsidianRepository Implementation

**Q2.10: Filesystem Backend**

We need to implement `internal/repository/obsidian.go` that:

```go
// ObsidianRepository implements Repository interface
// but stores sessions as markdown files in Obsidian vault
type ObsidianRepository struct {
    vaultPath string      // From config
    inMemDB   *sql.DB     // In-memory SQLite for transient state
    blobStore BlobStore   // Content-addressable storage (can reuse)
}

func (r *ObsidianRepository) SaveSession(ctx context.Context, session *Session) error {
    // 1. Write init.md with frontmatter
    // 2. Create session folder structure
    // 3. Store transient state in in-memory SQLite
    // 4. Return nil if success
}

func (r *ObsidianRepository) GetSession(ctx context.Context, id string) (*Session, error) {
    // 1. Find session folder by ID
    // 2. Parse init.md frontmatter
    // 3. Reconstruct Session object
    // 4. Check in-memory SQLite for transient state
    // 5. Return Session
}

func (r *ObsidianRepository) SaveTurn(ctx context.Context, turn *Turn) error {
    // 1. Write rounds/NN-topic-name.md
    // 2. Pre-populate callouts
    // 3. Update session state
}

func (r *ObsidianRepository) GetTurn(ctx context.Context, sessionID string, turnNum int) (*Turn, error) {
    // 1. Read rounds/NN-*.md
    // 2. Parse frontmatter and content
    // 3. Extract callout responses
    // 4. Return Turn
}
```

**Key Challenges**:
1. **Frontmatter parsing**: Need robust YAML parser
2. **Callout parsing**: Regex to find `> [!note] Answer` blocks
3. **File naming**: Map turn number to round filename
4. **Concurrency**: Handle simultaneous edits (user + FAM)
5. **Transient state**: What goes in SQLite vs markdown?

**Transient State** (in-memory SQLite):
- Agent execution state during turn
- Orchestrator decision-making state
- Temporary data that doesn't belong in markdown

**Persistent State** (markdown in vault):
- Session metadata (init.md frontmatter)
- Round content and user responses
- Artifacts
- All user-visible content

Agree with this split?

> [!note] Answer
> That's a good start. Let's give this task to another agent. Write implementation specs in famkinen/docs/implementation as a task and indicate clearly how to test and how to validate successful implementation

---

### D2. Markdown File Structure

**Q2.11: File Format Conventions**

For famkinen to read/write vault files correctly, we need to establish conventions:

**Init File** (`init.md`):
```yaml
---
date: 2025-11-12
artifact_type: session_init
fam_session_id: sess-001        # FAM internal ID
fam_status: in-progress         # FAM session status
fam_current_round: 2            # Current round number
tags:
  - space/p
  - domain/architecture
  - type/iterative-design
  - status/in-progress
summary: "Session description"
---

# Session Name

## Session Goals
...
```

**Round File** (`rounds/01-topic-name.md`):
```yaml
---
date: 2025-11-12
artifact_type: round_exploration
fam_round_number: 1             # Maps to Turn in FAM
fam_turn_id: turn-001-1         # FAM turn ID
fam_status: complete            # Turn status
tags:
  - space/p
  - domain/architecture
summary: "Round description"
---

# Round 1: Topic Name

## Q1.1: Question

Context...

> [!note] Answer
> User response here
>
```

**Key Questions**:
1. Do we add `fam_*` fields to frontmatter for FAM tracking?
2. Or keep FAM state separate (in-memory SQLite only)?
3. How do we detect which file is which? (artifact_type? fam_session_id?)
4. What if user manually edits frontmatter?

Recommendation: Add `fam_*` fields for round-tripping, but make them optional. FAM can reconstruct from file structure if missing.

> [!note] Answer
> Why would be need to have props prefixed with fam_ ? I don't think it's necessary honestly
> Let's use good naming but no need to bloat the frontmatter 
> If user edits the frontmatter, let's use graceful resolution mechanism (also taking into account possible conflicts with state of the in-memory db). Fam could also store snapshots and history of changes in frontmatter of the artifacts, and we can use conflict resolution rules and/or heuristics...

---

## Part E: Implementation Tracks

### E1. Track Organization

**Q2.12: Implementation Tracks**

Following famkinen's pattern (`docs/implementation/track-*`), I propose:

**Track 16: Obsidian Integration**

**Phase 1: Foundation** (Days 1-3)
- `track-16-obsidian/phase-1-foundation.md`
  - Setup plugin skeleton in `famkinen/plugins/obsidian/`
  - Implement ObsidianRepository basic structure
  - Add `/api/kinen/*` endpoints
  - Get "hello world" working (plugin calls FAM, FAM responds)

**Phase 2: Core Workflow** (Days 4-8)
- `track-16-obsidian/phase-2-core-workflow.md`
  - Session creation end-to-end
  - Round generation with callouts
  - ObsidianRepository read/write
  - Frontmatter parsing
  - Basic error handling

**Phase 3: Enhanced Features** (Days 9-12)
- `track-16-obsidian/phase-3-enhanced.md`
  - Status bar integration
  - Progress notifications
  - Session status tracking
  - File watching (optional)

**Phase 4: Polish & Testing** (Days 13-15)
- `track-16-obsidian/phase-4-polish.md`
  - E2E tests
  - Error handling
  - User documentation
  - Demo video

Should we create this track structure in famkinen repo?

> [!note] Answer
> yes please (also see my comments in previous questions)

---

### E2. Parallel Work Streams

**Q2.13: What Can Be Done in Parallel?**

**Stream A: FAM Backend** (famkinen repo)
- Implement ObsidianRepository
- Add kinen-specific API endpoints
- Create kinen methodology template
- Write integration tests

**Stream B: Obsidian Plugin** (famkinen/plugins/obsidian/)
- Setup plugin skeleton
- Implement UI (modals, commands)
- API client
- Development environment

**Stream C: Documentation**
- Track 14 implementation guide
- Plugin installation guide
- User guide for kinen + Obsidian
- Demo scenarios

These can largely be done in parallel once interfaces are defined. 

**Key Synchronization Point**: API contract (`/api/kinen/*` endpoints)

Should we define API contract first in Round 3?

> [!note] Answer
> yes, although I think that the current famkinen api should mostly work for us already. Let me know if you see gaps 

---

## Part F: Next Steps

### F1. Immediate Actions

**Q2.14: First Concrete Tasks**

Based on your answers, here's what I propose to tackle next:

**Immediate (This Round)**:
1. Define API contract for plugin <-> FAM communication
2. Design ObsidianRepository interface specifics
3. Create track structure in famkinen repo

**Round 3**:
1. Setup plugin development environment
2. Create plugin skeleton with hot reload
3. Implement basic FAM API client in plugin
4. Test "hello world" connection

**Round 4**:
1. Implement ObsidianRepository basics
2. Create first kinen API endpoint
3. Test session creation end-to-end

What should we prioritize first?

> [!note] Answer
> I want to make sure we have the spec for the fam implementer team to work on the track
> We will work in parallel you and me on the Obsidian plugin here

---

## Summary

This round clarified:
1. ✅ Famkinen's current state (Tracks 1-5 complete, Track 6 mostly done)
2. ✅ Key integration points (Repository, API, Plugin)
3. ✅ Architecture patterns (ObsidianRepository, API layer, Plugin structure)
4. ✅ Track organization approach

**Key Decisions Needed**:
- Repository implementation strategy (ObsidianRepository vs Hybrid)
- API design (existing endpoints vs new `/api/kinen/*`)
- Plugin state management approach
- Markdown file conventions (fam_* frontmatter fields)
- Track structure and parallel work organization

**Next Round**: Based on your responses, Round 3 will provide concrete implementation details and get us started with code.

---

**Ready for your responses!** 🚀

