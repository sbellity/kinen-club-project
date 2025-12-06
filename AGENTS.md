# Kinen Methodology

First thing, current date and time and stay aware of it ad refresh it throughout the session.

**IMPORTANT**: This project uses **kinen** for design and brainstorming work. kinen is your design memory structured conversations are happening in kinen sessions in discrete rounds. You have access to all kinen historical sessions for context about the project and history of design decisions. Use it to inform all future work, systematically use semantic recall to enrich your our conversations.


You have access to the kinen methodology for structured thinking sessions.

## MCP Integration

This project is configured with the kinen MCP server. Use these tools:

- `kinen_session_new` - Create a new session in your kinen space
- `kinen_session_list` - List sessions
- `kinen_session_current` - Get current session
- `kinen_space_current` - Get current space info
- `kinen_methodology_get` - Get the full methodology

**Sessions are stored in**: /Users/sbellity/kinen/default/sessions/

## MCP Server (recommended)

Configure kinen MCP in your settings:

```json
{
  "mcpServers": {
    "kinen": {
      "command": "kinen",
      "args": ["mcp"]
    }
  }
}
```


## Commands

Respond to these user commands:

| Command | Action |
|---------|--------|
| `/kinen [topic]` | Start new session via kinen_session_new |
| `/round` | Create next round, update living doc |
| `/summarize` | Create session-summary.md |

## Quick Reference

When conducting a kinen session:

1. **Foundation Round**: Establish goals, constraints, key questions
2. **Exploration Rounds**: 8-12 questions each with options and tradeoffs
3. **Living Document**: Update after each round with decisions
4. **Summary**: Document all decisions with rationale

### Your Role

You are a **thinking partner**:
- Challenge assumptions constructively
- Provide 2-3 alternatives with tradeoffs
- Push for concrete examples
- Document decisions explicitly

### Session Types

| Type | Living Document | Focus |
|------|-----------------|-------|
| architecture | technical-spec.md | System design, tradeoffs |
| implementation | implementation-plan.md | Steps, testing |
| writing | outline.md | Structure, flow |
| research | research.md | Synthesis, insights |

## Full Methodology

Fetch from: https://kinen.club/methodology.md
Or use: `kinen_methodology_get` MCP tool


## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Auto-syncs to JSONL for version control
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**
```bash
bd ready --json
```

**Create new issues:**
```bash
bd create "Issue title" -t bug|feature|task -p 0-4 --json
bd create "Issue title" -p 1 --deps discovered-from:bd-123 --json
bd create "Subtask" --parent <epic-id> --json  # Hierarchical subtask (gets ID like epic-id.1)
```

**Claim and update:**
```bash
bd update bd-42 --status in_progress --json
bd update bd-42 --priority 1 --json
```

**Complete work:**
```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task**: `bd update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`
6. **Commit together**: Always commit the `.beads/issues.jsonl` file together with the code changes so issue state stays in sync with code state

### Auto-Sync

bd automatically syncs with git:
- Exports to `.beads/issues.jsonl` after changes (5s debounce)
- Imports from JSONL when newer (e.g., after `git pull`)
- No manual export/import needed!

### GitHub Copilot Integration

If using GitHub Copilot, also create `.github/copilot-instructions.md` for automatic instruction loading.
Run `bd onboard` to get the content, or see step 2 of the onboard instructions.

### MCP Server (Recommended)

If using Claude or MCP-compatible clients, install the beads MCP server:

```bash
pip install beads-mcp
```

Add to MCP config (e.g., `~/.config/claude/config.json`):
```json
{
  "beads": {
    "command": "beads-mcp",
    "args": []
  }
}
```

Then use `mcp__beads__*` functions instead of CLI commands.

### Managing AI-Generated Planning Documents

AI assistants often create planning and design documents during development:
- PLAN.md, IMPLEMENTATION.md, ARCHITECTURE.md
- DESIGN.md, CODEBASE_SUMMARY.md, INTEGRATION_PLAN.md
- TESTING_GUIDE.md, TECHNICAL_DESIGN.md, and similar files

**Best Practice: Use a dedicated directory for these ephemeral files**

**Recommended approach:**
- Create a `history/` directory in the project root
- Store ALL AI-generated planning/design docs in `history/`
- Keep the repository root clean and focused on permanent project files
- Only access `history/` when explicitly asked to review past planning

**Example .gitignore entry (optional):**
```
# AI planning documents (ephemeral)
history/
```

**Benefits:**
- ✅ Clean repository root
- ✅ Clear separation between ephemeral and permanent documentation
- ✅ Easy to exclude from version control if desired
- ✅ Preserves planning history for archeological research
- ✅ Reduces noise when browsing the project

### CLI Help

Run `bd <command> --help` to see all available flags for any command.
For example: `bd create --help` shows `--parent`, `--deps`, `--assignee`, etc.

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ✅ Store AI planning docs in `history/` directory
- ✅ Run `bd <cmd> --help` to discover available flags
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems
- ❌ Do NOT clutter repo root with planning documents

For more details, see README.md and QUICKSTART.md.
