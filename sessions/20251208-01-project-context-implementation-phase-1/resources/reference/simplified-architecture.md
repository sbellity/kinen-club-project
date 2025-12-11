# Simplified Architecture: Project Context Integration

## Key Design Decision

**Agent calls MCP directly. No proxy endpoints needed.**

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                │
│  - User selects project (or creates new)                        │
│  - Passes projectId + projectName to session API                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Session Service (Harness)                    │
│  - Creates session directory                                    │
│  - Writes project metadata to metadata.json                     │
│  - Injects minimal context into agent prompt:                   │
│    * projectId                                                  │
│    * projectName                                                │
│    * Instructions to fetch details via MCP                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Agent (Claude)                             │
│  - Reads project context from prompt                            │
│  - Calls MCP operations directly:                               │
│    * tasks:getProject - Get goals/description                   │
│    * content:searchContent - Get foundation                     │
│    * tasks:listTasks - Get recent activity                      │
│    * tasks:createTask - Create task for session                 │
│    * tasks:updateTask - Update task description                 │
│    * tasks:createComment - Log decisions                        │
│  - Uses context to inform recommendations                       │
│  - Creates artifacts with <artifact> tags                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Bird Platform                               │
│  - Projects: Store goals, metadata                              │
│  - Tasks: Track sessions                                        │
│  - Knowledgebase: Store foundation, learnings                   │
└─────────────────────────────────────────────────────────────────┘
```

## What Gets Implemented

### Phase 1A: Backend (This Round)

1. **Whitelist operations** in `config/bird-operations.yaml`
2. **Update session API** to accept `projectId`, `projectName`, `taskId`
3. **Inject minimal context** in `getAgentPrompt()`
4. **Update agent prompt** with MCP instructions

### Phase 1B: Frontend (Next Round)

1. **Project selector** - List projects, show open tasks
2. **Create project modal** - Simple form
3. **Artifact rendering** - Parse `<artifact>` tags

## Benefits of This Approach

1. **Simpler**: No proxy endpoints to maintain
2. **Flexible**: Agent decides what context it needs
3. **Faster**: No upfront context fetching delay
4. **Debuggable**: All MCP calls visible in logs
5. **Scalable**: Agent can fetch more context as needed

## Trade-offs

1. **Latency**: Agent makes MCP calls (adds 1-2 seconds)
2. **Tokens**: Context fetching uses tokens
3. **Reliability**: Agent might skip steps (mitigated by clear instructions)

## Implementation Estimate

- **Step 1**: Whitelist operations - 30 min
- **Step 2**: Update session API - 2 hours
- **Step 3**: Context injection - 2 hours
- **Step 4**: Agent prompt updates - 2 hours
- **Testing**: 2 hours

**Total: ~8 hours for Phase 1A**

## Next Steps

After Phase 1A is complete:
1. Test with real Bird workspace
2. Verify agent follows instructions
3. Move to Phase 1B (Frontend)
