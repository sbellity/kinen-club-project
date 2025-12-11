# Architecture Summary: Project Context Integration

## Core Principles

### 1. Agent Autonomy
**Agent retrieves its own context** - no harness pre-fetching.

- Harness passes minimal context: `projectId`, `projectName`
- Agent calls `tasks:getProject` to get metadata
- Metadata contains paths to everything agent needs
- Agent decides what to fetch and when

### 2. Metadata as Source of Truth
**Project metadata tells agent where everything lives**:

```typescript
project.metadata = {
  agent: 'marketing-advisor',
  kbFolderPath: '/agent-memory/project-{id}',
  foundation: {
    documentId: 'doc-123',
    path: '/agent-memory/project-{id}/foundation.md',
    lastRefreshedAt: '2024-12-08T10:00:00Z'
  },
  dashboardId: 'dash-456',
  digest: { enabled: true, frequency: 'daily' }
}
```

### 3. Living Documents (Phase 1B)
**Foundation documents hydrate with live data** when agent reads them.

- Markdown contains `malloy` code blocks
- Harness executes queries on read
- Agent sees current data, not stale snapshots
- Reuses existing notebook renderer infrastructure

---

## Data Flow

```
┌─────────────┐
│   Frontend  │
│             │
│ User selects│
│ project     │
└──────┬──────┘
       │
       │ POST /api/session
       │ { projectId, projectName, prompt }
       ▼
┌─────────────────────────────────────────┐
│         Session Service (Harness)        │
│                                          │
│ 1. Create session directory             │
│ 2. Write metadata.json with projectId   │
│ 3. Inject minimal prompt:               │
│    "You're working on {projectName}"    │
│    "Get context via tasks:getProject"   │
└──────┬──────────────────────────────────┘
       │
       │ Start agent
       ▼
┌─────────────────────────────────────────┐
│              Agent (Claude)              │
│                                          │
│ 1. Calls tasks:getProject               │
│    → Gets metadata with paths           │
│                                          │
│ 2. Reads foundation document            │
│    → Harness hydrates with live data    │
│                                          │
│ 3. Calls tasks:listTasks                │
│    → Gets recent activity               │
│                                          │
│ 4. Uses context to inform work          │
└──────┬──────────────────────────────────┘
       │
       │ MCP operations
       ▼
┌─────────────────────────────────────────┐
│           Bird Platform                  │
│                                          │
│ - Projects (metadata)                   │
│ - Tasks (sessions)                      │
│ - Knowledgebase (foundation, learnings) │
│ - DataHub (live queries)                │
└─────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1A: Basic Context (8 hours)
**Goal**: Agent can retrieve project context

1. **Whitelist operations** (30 min)
   - Add tasks:*, content:* to config/bird-operations.yaml

2. **Update session API** (2 hours)
   - Add projectId, projectName to CreateSessionOptions
   - Pass to getAgentPrompt()
   - Write to session metadata.json

3. **Minimal context injection** (2 hours)
   - Update getAgentPrompt() to include project info
   - Add instructions for agent to fetch metadata

4. **Agent prompt updates** (2 hours)
   - Add "Project Context Integration" section
   - Document MCP operations for context fetching
   - Add artifact format examples

5. **Testing** (2 hours)
   - Manual session with projectId
   - Verify agent fetches metadata
   - Check agent reads foundation

### Phase 1B: Living Documents (8 hours)
**Goal**: Foundation hydrates with live data

1. **LivingDocumentService** (3 hours)
   - Parse markdown for malloy blocks
   - Execute queries via DataHub
   - Inject results into markdown

2. **MCP tool enhancement** (2 hours)
   - Detect living documents on read
   - Call hydration service
   - Return hydrated content

3. **Foundation template** (2 hours)
   - Add malloy query blocks
   - Document query patterns
   - Test with real workspace

4. **Caching** (1 hour)
   - Cache hydrated documents (5 min TTL)
   - Handle query failures gracefully

### Phase 1C: Frontend (12 hours)
**Goal**: UI for project selection

1. **Project selector** (4 hours)
   - List projects via MCP
   - Show open tasks
   - Resume task flow

2. **Create project modal** (3 hours)
   - Simple form
   - Call tasks:createProject via backend
   - Initialize KB folder

3. **Artifact rendering** (3 hours)
   - Parse <artifact> tags
   - Render as cards
   - Show status badges

4. **Notebook renderer** (2 hours)
   - Reuse existing notebook component
   - Render foundation with live queries
   - Show query results

---

## Key Benefits

### 1. Simplicity
- No proxy endpoints
- No complex context preparation
- Agent is self-contained

### 2. Flexibility
- Agent decides what context it needs
- Can fetch more data as needed
- Adapts to different project types

### 3. Freshness
- Living documents always current
- No stale data issues
- Queries run on-demand

### 4. Reusability
- Notebook renderer already exists
- MCP infrastructure in place
- Patterns applicable to other agents

---

## Trade-offs

### Pros
✅ Simpler harness code
✅ Agent has full control
✅ Always-fresh data
✅ Transparent queries
✅ Reuses existing UI

### Cons
❌ Adds 1-2s latency (agent MCP calls)
❌ Uses tokens for context fetching
❌ Query execution overhead
❌ Caching complexity
❌ Agent might skip steps (needs clear instructions)

---

## Open Questions

1. **Project creation**: Should frontend call MCP directly or via backend endpoint?
2. **Task creation**: Harness creates task or agent creates it?
3. **Query caching**: 5 min TTL? Invalidation strategy?
4. **Query failures**: Show error or fallback to cached snapshot?
5. **Frontend MCP access**: Can frontend call MCP directly for project list?

---

## Artifact Deployment: Terraform Approach

### The Brilliant Idea
**Agent generates Terraform configs → User deploys → Bird platform executes**

Instead of agent directly creating resources, agent generates `.tf` files:
- Leverages existing Bird Terraform Provider
- Leverages existing Controlplane Resources API
- Built-in dependency tracking
- Plan → Apply workflow (user reviews before deploying)
- State management (what's deployed, what changed)

### Example Flow

```
Agent creates:
  session/artifacts/terraform/
    ├── main.tf              # Resource definitions
    ├── variables.tf         # Parameters
    ├── outputs.tf           # Resource IDs
    ├── templates/           # Email templates
    └── README.md            # Deployment guide

User reviews:
  terraform plan
  → Shows: 1 audience, 2 templates, 1 campaign to create
  → Estimates: 1,200 contacts, $15K-25K revenue

User deploys:
  terraform apply
  → Creates resources in order
  → Tracks dependencies
  → Returns resource IDs

Agent references:
  "Your VIP campaign (cmp-789) is active"
  "Open rate: 38% (exceeding 35% target)"
```

### Benefits
- ✅ No new APIs to build (reuse terraform provider)
- ✅ Dependency tracking automatic
- ✅ User reviews before deployment
- ✅ Idempotent (safe to re-run)
- ✅ Rollback support (terraform destroy)
- ✅ State management built-in

See `terraform-deployment-concept.md` for full details.

---

## Next Steps

**Immediate** (Phase 1A):
1. Start with Step 1: Whitelist operations
2. Test agent can call tasks:getProject
3. Verify metadata structure in Bird

**Near-term** (Phase 1B):
1. Prototype living document hydration
2. Test with one malloy query
3. Measure performance impact

**Near-term** (Phase 1C):
1. Agent generates simple terraform configs
2. User manually runs terraform commands
3. Track deployments in project metadata

**Future** (Phase 2+):
1. Integrated terraform execution in backend
2. Frontend deployment UI with plan/apply
3. Dashboard creation by agent
4. Daily digest automation
5. Cross-project learning
