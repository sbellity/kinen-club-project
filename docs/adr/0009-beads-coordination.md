# ADR-009: beads for Agent Coordination Protocol

## Status
**Accepted** (Dec 6, 2025)

## Context
Multiple AI agents working in parallel need coordination:
- Track progress
- Ask questions
- Report blockers
- Hand off work

Options:
1. **Shared document**: Single markdown file for all coordination
2. **Chat**: Real-time conversation between agents
3. **Issue tracker**: Structured issue-based coordination

## Decision
**Use beads issue tracking** with a specific protocol:
- Questions go in issues with `QUESTION [Track]:` prefix
- Answers updated in issue notes
- Blockers use `BLOCKED [Track]:` prefix
- Completion closes issues

## Rationale
- **Structured**: Each issue has clear status
- **Async**: Agents don't need real-time communication
- **Traceable**: Full history of decisions
- **Git-friendly**: JSONL syncs with code

## Implementation
```bash
# Agent asks question
bd create "QUESTION [2]: How should index commands work?" -p 1

# Coordinator answers (updates notes)
bd update kinen-xxx --notes "ANSWER: Create IndexWorker on-demand..."

# Agent unblocked, closes question
bd close kinen-xxx --reason "Answered, proceeding"
```

## Consequences

### Positive
- Clear audit trail
- Agents can work independently
- Easy to review decisions later
- Issues sync with git

### Negative
- Some overhead in issue management
- Coordinator can become bottleneck
- Requires agents to follow protocol



