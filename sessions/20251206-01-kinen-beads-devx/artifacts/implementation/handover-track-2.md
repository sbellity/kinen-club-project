---
artifact_type: agent_handover
track: "2"
track_name: "Port Sessions/Spaces to Go"
date: 2025-12-06
epic_id: kinen-sqc
---

# Agent Handover: Track 2 - Port Sessions/Spaces to Go

> [!warning] MANDATORY: Beads Status Updates
> **You MUST update beads** — chat is NOT a communication channel!
> 
> 1. **Start**: `bd update kinen-sqc --status in_progress --notes "Starting Track 2"`
> 2. **Every 30-60 min**: `bd update TASK_ID --notes "Progress: [status]"`
> 3. **When blocked**: `bd create "BLOCKED [2]: [issue]" -t task -p 0 --assignee coordinator \
  --deps discovered-from:kinen-sqc`
> 4. **Before ending**: Update ALL tasks with current status
> 
> **See `collaboration.md` for full protocol.**

## Your Mission

Port session and space management from the TypeScript CLI to Go. After this, we have ONE binary that does everything:

```bash
kinen session new "topic"    # Create session
kinen session list           # List sessions
kinen space switch default   # Switch space
kinen search "query"         # Search memories
kinen mcp                    # MCP server
kinen daemon                 # HTTP API server
```

## Context

- **Target**: `/Users/sbellity/code/p/kinen-go`
- **Reference**: `/Users/sbellity/code/kinen/kinen/src/` (TypeScript to port)
- **Depends on**: Track 1B (parser) for reading existing sessions

## What Already Exists in kinen-go

```
kinen-go/
├── cmd/kinen/
│   ├── main.go              # ✅ CLI entry with Cobra
│   └── mcp/                  # ✅ MCP server
├── pkg/
│   ├── api/                  # ✅ Public API
│   └── service/              # ✅ Memory service
└── internal/
    ├── config/               # ✅ Config (Viper)
    └── ...                   # ✅ All memory infrastructure
```

**Missing**: Session/space management commands

## What to Port from TypeScript

Review these files in `/Users/sbellity/code/kinen/kinen/src/`:

| TS File | What to Port |
|---------|--------------|
| `lib/sessions.ts` | `createSession()`, `listSessions()`, `getCurrentSession()` |
| `lib/spaces.ts` | `listSpaces()`, `switchSpace()`, `getCurrentSpace()` |
| `lib/config.ts` | Space path resolution, config structure |
| `commands/session.ts` | CLI commands for sessions |
| `commands/space.ts` | CLI commands for spaces |

## Implementation

### 1. Session Types + Logic

```go
// internal/kinen/sessions.go
package kinen

import (
    "os"
    "path/filepath"
    "time"
    "gopkg.in/yaml.v3"
)

type Session struct {
    Name      string    `yaml:"name"`
    Path      string    `yaml:"-"`
    Type      string    `yaml:"type"`      // architecture, implementation, research, writing
    Status    string    `yaml:"status"`    // in-progress, complete
    Created   time.Time `yaml:"created"`
    Completed time.Time `yaml:"completed,omitempty"`
}

type SessionInit struct {
    Created time.Time `yaml:"created"`
    Type    string    `yaml:"type"`
    Status  string    `yaml:"status"`
}

func CreateSession(spacePath, name, sessionType string) (*Session, error) {
    // Generate folder name: YYYYMMDD-NN-slug
    datePrefix := time.Now().Format("20060102")
    slug := slugify(name)
    
    // Find next sequence number for today
    existing, _ := filepath.Glob(filepath.Join(spacePath, "sessions", datePrefix+"-*"))
    seq := len(existing) + 1
    
    folderName := fmt.Sprintf("%s-%02d-%s", datePrefix, seq, slug)
    sessionPath := filepath.Join(spacePath, "sessions", folderName)
    
    // Create directories
    os.MkdirAll(filepath.Join(sessionPath, "rounds"), 0755)
    os.MkdirAll(filepath.Join(sessionPath, "artifacts"), 0755)
    
    // Create init.md
    init := SessionInit{
        Created: time.Now(),
        Type:    sessionType,
        Status:  "in-progress",
    }
    // ... write init.md with frontmatter
    
    return &Session{Name: name, Path: sessionPath, Type: sessionType, Created: time.Now()}, nil
}

func ListSessions(spacePath string) ([]Session, error) {
    // Scan sessions/ directory
    // Parse init.md frontmatter from each
    // Sort by created date descending
}

func GetCurrentSession(spacePath string) (*Session, error) {
    // Find most recent in-progress session
}
```

### 2. Space Types + Logic

```go
// internal/kinen/spaces.go
package kinen

type Space struct {
    Name string
    Path string
}

func ListSpaces(configPath string) ([]Space, error) {
    // Read ~/.kinen/config.yml
    // Return list of configured spaces
}

func GetCurrentSpace() (*Space, error) {
    // Read current space from config or env
}

func SwitchSpace(name string) error {
    // Update current space in config
}
```

### 3. CLI Commands

```go
// cmd/kinen/commands/session.go
package commands

import "github.com/spf13/cobra"

func SessionCmd() *cobra.Command {
    cmd := &cobra.Command{
        Use:   "session",
        Short: "Manage kinen sessions",
    }
    cmd.AddCommand(sessionNewCmd())
    cmd.AddCommand(sessionListCmd())
    cmd.AddCommand(sessionCurrentCmd())
    return cmd
}

func sessionNewCmd() *cobra.Command {
    var sessionType string
    cmd := &cobra.Command{
        Use:   "new [name]",
        Short: "Create a new session",
        Args:  cobra.ExactArgs(1),
        RunE: func(cmd *cobra.Command, args []string) error {
            space, _ := kinen.GetCurrentSpace()
            session, err := kinen.CreateSession(space.Path, args[0], sessionType)
            if err != nil {
                return err
            }
            fmt.Printf("Created session: %s\n", session.Path)
            return nil
        },
    }
    cmd.Flags().StringVarP(&sessionType, "type", "t", "architecture", "Session type")
    return cmd
}

// ... similar for list, current
```

### 4. Wire into Main

```go
// cmd/kinen/main.go
func main() {
    rootCmd := &cobra.Command{Use: "kinen"}
    
    // Existing
    rootCmd.AddCommand(mcpCmd())
    rootCmd.AddCommand(daemonCmd())  // Track 1A
    
    // New (this track)
    rootCmd.AddCommand(commands.SessionCmd())
    rootCmd.AddCommand(commands.SpaceCmd())
    rootCmd.AddCommand(commands.SearchCmd())
    rootCmd.AddCommand(commands.IndexCmd())
    
    rootCmd.Execute()
}
```

## Tasks

| Task | Description | LOE |
|------|-------------|-----|
| `2.1` | Space management (internal/kinen/spaces.go) | 2h |
| `2.2` | Session management (internal/kinen/sessions.go) | 3h |
| `2.3` | Round creation (create new round files) | 2h |
| `2.4` | CLI commands (cmd/kinen/commands/) | 2h |
| `2.5` | Search/Index commands (wrap service) | 1h |
| `2.6` | Integration test | 1h |

**Total: ~11 hours (1.5 days)**

## Commands After This Track

```bash
# Space management
kinen space list
kinen space switch <name>
kinen space current

# Session management
kinen session new "topic" --type architecture
kinen session list
kinen session current

# Round management
kinen round new              # Creates next round in current session

# Search (wraps existing service)
kinen search "query" --limit 10 --json

# Index
kinen index build
kinen index status

# Existing
kinen mcp                    # MCP server
kinen daemon                 # HTTP API (Track 1A)
```

## Success Criteria

```bash
# Create session
kinen session new "test-session" --type architecture
ls sessions/  # → Shows new session folder

# List sessions
kinen session list  # → Shows sessions with dates, types, status

# Search
kinen search "test" --json | jq '.results'

# Full workflow
kinen space switch default
kinen session new "my-topic"
kinen round new
# → Created sessions/YYYYMMDD-01-my-topic/rounds/01-foundation.md
```

## Key Files to Study

**TypeScript (what to port):**
1. `kinen/src/lib/sessions.ts` - Session logic
2. `kinen/src/lib/spaces.ts` - Space logic  
3. `kinen/src/commands/session.ts` - CLI structure

**Go (where to add):**
1. `cmd/kinen/main.go` - Entry point
2. `internal/config/config.go` - Config patterns

## Notes

- Use existing config system (Viper)
- Use existing logging (Zerolog)
- Follow existing patterns in cmd/kinen/
- Sessions are just directories + markdown files
- This is mostly file operations, no complex logic

## Questions & Blockers

**Use beads to communicate questions and blockers.** A coordinator will monitor and respond.

### When Blocked

```bash
bd create "BLOCKED [2]: [describe what's blocking you]" \
  -t task -p 0 \
  --assignee coordinator \
  --deps discovered-from:kinen-sqc \
  --notes "Context: [what you've tried, what you need]"
```

### When You Have a Question

```bash
bd create "QUESTION [2]: [your question]" \
  -t task -p 1 \
  --assignee coordinator \
  --deps discovered-from:kinen-sqc \
  --notes "Options I'm considering: [A, B, C]"
```

### Best Practices

1. **Be specific** — Include file paths, error messages, code snippets
2. **Show your work** — What did you try? What did you learn?
3. **Propose options** — Don't just ask "what should I do?" — propose 2-3 options
4. **Link to track** — Always use `--assignee coordinator \
  --deps discovered-from:kinen-sqc` (Track 2 epic)

Expect response within 1-2 hours during active development.
