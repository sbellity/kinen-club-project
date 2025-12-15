# Kinen CLI Reference

Commands relevant for AI agents during kinen sessions.

> **Note**: Installation commands (`setup`, `daemon`, `models`, `init`) are not included here - they're user-facing, one-time operations.

## Global Options

```bash
--json          # Machine-readable JSON output (where supported)
--help          # Show help
```

## Session Commands

### kinen session new

Create a new session.

```bash
kinen session new <name> --type architecture
kinen session new "api-design" --type research
```

**Options:**
| Flag | Description | Values |
|------|-------------|--------|
| `--type` | Session type | architecture, research, implementation, writing (default: architecture) |

### kinen session list

List sessions.

```bash
kinen session list
kinen session list --limit 10
```

**Options:**
| Flag | Description | Values |
|------|-------------|--------|
| `--limit` | Max results (default: 10) | integer |

### kinen session current

Show current session.

```bash
kinen session current
```

## Space Commands

### kinen space list

List configured spaces.

```bash
kinen space list
```

### kinen space current

Show current active space.

```bash
kinen space current
```

### kinen space switch

Switch active space.

```bash
kinen space switch <space-name>
```

## Memory Commands

### kinen search

Semantic search across sessions.

```bash
kinen search "authentication patterns"
kinen search "caching decisions" --limit 5
```

**Options:**
| Flag | Description |
|------|-------------|
| `--limit` | Max results (default: 10) |

**Use**: Find related prior work, past decisions, similar patterns.

### kinen list

List memories.

```bash
kinen list
kinen list --limit 20
```

### kinen show

Show memory details.

```bash
kinen show <id>
```

### kinen stats

Show statistics.

```bash
kinen stats
```

## MCP Tools

When using kinen via MCP (in Cursor, Claude Code, etc.), these tools are available:

### Memory & Search
- `kinen_search` - Search across all sessions and memories
- `kinen_list_memories` - List memories
- `kinen_get_memory` - Get memory details
- `kinen_get_stats` - Get statistics

### Session Management
- `kinen_create_session` - Create new session
- `kinen_list_sessions` - List sessions
- `kinen_get_session` - Get session details
- `kinen_index_session` - Index session into memory

### Round & Artifact Operations
- `kinen_get_round` - Get round content (parsed)
- `kinen_list_rounds` - List rounds in session
- `kinen_finalize_round` - Finalize a round
- `kinen_get_artifact` - Get artifact content
- `kinen_update_artifact` - Update artifact

### Git Operations
- `kinen_commit` - Commit session changes
- `kinen_git_status` - Get git status
- `kinen_git_log` - Get git log

### Space Management
- `kinen_switch_space` - Switch active space
- `kinen_register_space` - Register new space

## Common Workflows

### Start New Session

```bash
kinen space current                 # Check current space
kinen session new "topic" --type architecture
```

### Find Related Work

```bash
kinen search "related topic"
kinen search "specific decision" --limit 5
```

### Check Session Context

```bash
kinen session current
kinen session list
```

### Switch Context

```bash
kinen space list
kinen space switch <space-name>
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
