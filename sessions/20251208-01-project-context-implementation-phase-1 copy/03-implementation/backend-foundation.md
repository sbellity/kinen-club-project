# Round 1: Backend Foundation

## Goal

Implement the backend foundation for project context integration:
1. Whitelist Bird operations
2. Update session API to pass project context
3. Agent retrieves its own context from project metadata
4. Update agent prompt with project instructions

**Key Architectural Decisions**:
- Agent retrieves its own context (no harness fetching)
- Project metadata is source of truth
- Foundation documents can be "living docs" (Phase 1B)

## Current State Analysis

Before we start, let's understand the current architecture:

### Existing Files to Examine
- `config/bird-operations.yaml` - Current whitelisted operations
- `src/server.ts` - API endpoint definitions
- `src/services/session.ts` - Session management logic
- `src/services/agent-runner.ts` - Agent execution
- `plugins/bird-marketing/agents/marketing-advisor.md` - Agent prompt

### Questions to Answer
1. How are current API endpoints structured?
2. How does session creation work today?
3. How is context currently passed to the agent?
4. What's the MCP integration pattern?

---

## Implementation Plan

### Step 1: Whitelist Bird Operations (~30 min)

Add to `config/bird-operations.yaml`:
```yaml
# Projects & Tasks
- "tasks:listProjects"
- "tasks:getProject"
- "tasks:updateProject"
- "tasks:listTasks"
- "tasks:createTask"
- "tasks:getTask"
- "tasks:updateTask"
- "tasks:createComment"

# Knowledgebase
- "content:createFolder"
- "content:listFolders"
- "content:createDocument"
- "content:updateDocument"
- "content:listDocuments"
- "content:searchContent"
```

**Note**: `tasks:createProject` NOT included - project creation by harness only.

### Step 2: Update Session API (~2 hours)

**SIMPLIFIED**: No proxy endpoints needed. Agent calls MCP directly.

#### POST /api/session (Update)
Add project context parameters.

**Request**:
```typescript
{
  prompt: string;
  projectId?: string;  // NEW - pass to agent
  projectName?: string; // NEW - for display
  taskId?: string;     // NEW - for resuming
}
```

**Response**:
```typescript
{
  sessionId: string;
  streamUrl: string;
}
```

**Changes in `src/services/session.ts`**:
1. Update `CreateSessionOptions` interface to include `projectId`, `projectName`, `taskId`
2. Pass these to `getAgentPrompt()` method
3. Update `initializeSessionDirectory()` to write project metadata

### Step 3: Minimal Context Injection (~2 hours)

**Philosophy**: Harness provides minimal context, agent fetches details via MCP.

**Update `getAgentPrompt()` in `src/services/session.ts`**:

```typescript
private getAgentPrompt(
  workspaceId: string, 
  sessionDir: string,
  projectId?: string,
  projectName?: string,
  taskId?: string
): string {
  let prompt = `You are a Marketing Advisor. Working directory: ${sessionDir}

cd ${sessionDir} && read AGENT.md

Follow AGENT.md exactly. Reference docs: FOUNDATION-SKILL.md, API-REFERENCE.md`;

  // Add project context if provided
  if (projectId) {
    prompt = `---
PROJECT CONTEXT
---
You are working on project: ${projectName || projectId}
Project ID: ${projectId}
${taskId ? `Task ID: ${taskId} (resuming)` : '(new session)'}

Before starting, gather project context using MCP:
1. tasks:getProject - Get full project details and goals
2. content:searchContent - Search for foundation at /agent-memory/project-${projectId}/foundation.md
3. tasks:listTasks - Get recent activity (last 5 tasks)

Use this context to align your recommendations with project goals.
---

${prompt}`;
  }

  return prompt;
}
```

**Write project metadata to session directory**:
```typescript
// In initializeSessionDirectory()
if (projectId) {
  metadata.projectId = projectId;
  metadata.projectName = projectName;
  metadata.taskId = taskId;
}
```

**Note**: Agent will call `tasks:getProject` to get full metadata including:
- KB folder path
- Foundation document path
- Dashboard ID
- Digest configuration

This metadata tells agent where to find everything it needs.

### Step 4: Agent Prompt Updates (~2 hours)

Add to `plugins/bird-marketing/agents/marketing-advisor.md`:

```markdown
## Project Context Integration

When you receive a project context (projectId in your initial prompt), you are working 
within a persistent project with goals, history, and learnings.

### Gathering Project Context

At session start, if projectId is provided, you MUST:

1. **Fetch project details**:
   ```
   mcp__nest-api__invoke_operation {
     "operation": "tasks:getProject",
     "pathParams": { "id": "{projectId}" }
   }
   ```
   This gives you: name, description (goals), stage, metadata

2. **Search for foundation document**:
   ```
   mcp__nest-api__invoke_operation {
     "operation": "content:searchContent",
     "body": {
       "query": "foundation",
       "path": "/agent-memory/project-{projectId}/"
     }
   }
   ```
   This gives you: workspace analysis, audiences, channels, assets

3. **Get recent activity**:
   ```
   mcp__nest-api__invoke_operation {
     "operation": "tasks:listTasks",
     "body": {
       "projectId": "{projectId}",
       "limit": 5,
       "orderBy": "updatedAt",
       "orderDirection": "desc"
     }
   }
   ```
   This shows: what was worked on recently

### Using Project Context

Once you have context:
- **Align with goals**: Reference project description when making recommendations
- **Build on previous work**: Don't recreate what exists
- **Learn from history**: Check what worked/didn't work in past tasks

### Session Management

Each session is tracked as a Task in the project:

1. **Create task** (if new session):
   ```
   mcp__nest-api__invoke_operation {
     "operation": "tasks:createTask",
     "body": {
       "projectId": "{projectId}",
       "name": "{refined goal from Q&A}",
       "description": "{detailed description}",
       "application": "marketing-agent"
     }
   }
   ```

2. **Update task description** after Q&A rounds:
   ```
   mcp__nest-api__invoke_operation {
     "operation": "tasks:updateTask",
     "pathParams": { "id": "{taskId}" },
     "body": {
       "description": "{refined goal}"
     }
   }
   ```

3. **Log key decisions** as comments:
   ```
   mcp__nest-api__invoke_operation {
     "operation": "tasks:createComment",
     "body": {
       "taskId": "{taskId}",
       "content": "Decision: [what] because [why]"
     }
   }
   ```

### Artifact Format

When creating deliverables, embed them in your response using this format:

<artifact 
  type="segment|template|campaign|audience"
  id="{local-id}"
  status="draft"
>
name: Artifact Name
description: What this does

# YAML content
criteria:
  - field: customer_tier
    operator: equals
    value: vip
</artifact>

Valid types: segment, template, campaign, audience
Valid statuses: draft, created, published

The UI will parse these blocks and render them as interactive cards.

### Memory & Learning

After completing a session:
1. Create session summary document in KB at `/agent-memory/project-{id}/sessions/{taskId}.md`
2. Update project description if goals/metrics changed
3. Add to learnings documents if discovered reusable patterns

### Foundation Refresh

If foundation document is old (check frontmatter date):
1. Inform user: "Your workspace foundation is X days old"
2. Offer to refresh: "Should I update it with current data?"
3. If yes, run foundation discovery and update KB document
```

---

## Testing Plan

### Manual Testing Steps

1. **Whitelist validation**:
   - Restart server
   - Check logs for MCP initialization
   - Verify operations available via agent

2. **Session with project context**:
   ```bash
   # Start session with project
   curl -X POST http://localhost:3000/api/session \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {token}" \
     -d '{
       "workspaceId": "{workspaceId}",
       "prompt": "Help me plan a campaign",
       "projectId": "{projectId}",
       "projectName": "Special Offers"
     }'
   ```

3. **Verify context injection**:
   - Check session directory: `sessions/{sessionId}/metadata.json`
   - Should contain projectId, projectName
   - Check agent receives project context in initial prompt

4. **Agent MCP calls**:
   - Watch logs for agent calling `tasks:getProject`
   - Verify agent fetches foundation from KB
   - Check agent lists recent tasks
   - Verify agent creates task for session

5. **Artifact rendering**:
   - Agent creates artifact with `<artifact>` tags
   - Verify tags appear in response
   - Frontend should parse and render (Phase 1B)

---

## Open Items

1. **Error Handling**: What if project doesn't exist? Agent should handle gracefully
2. **Migration**: Existing sessions without projects should still work (projectId optional)
3. **Observability**: MCP logging already exists, should capture all operations
4. **Frontend**: How does frontend get list of projects? (Phase 1B question)
5. **Task Creation**: Should harness create task, or let agent do it?

---

## Next Steps

After this round:
1. Review implementation with user
2. Address any issues/questions
3. Move to Round 2: Frontend Integration
