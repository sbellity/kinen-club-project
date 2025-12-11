# Living Documents Concept

## Core Ideas

### 1. Project Metadata as Source of Truth
**Agent retrieves its own context** - Project metadata contains everything agent needs to know:

```typescript
// Project metadata structure
{
  agent: 'marketing-advisor',
  version: '1.0',
  
  // KB linkage
  kbFolderId: 'folder-123',
  kbFolderPath: '/agent-memory/project-abc',
  
  // Foundation tracking
  foundation: {
    documentId: 'doc-456',
    path: '/agent-memory/project-abc/foundation.md',
    lastRefreshedAt: '2024-12-08T10:00:00Z',
    refreshIntervalDays: 30
  },
  
  // Dashboard linkage
  dashboardId: 'dash-789',
  
  // Digest configuration
  digest: {
    enabled: true,
    frequency: 'daily',
    lastRunAt: '2024-12-08T06:00:00Z'
  }
}
```

**Agent workflow**:
1. Receives `projectId` in prompt
2. Calls `tasks:getProject` to get metadata
3. Uses metadata paths to fetch foundation, recent activity, etc.
4. Completely self-contained - no harness fetching needed

---

### 2. Living Documents (Notebook-Style)

**Inspired by**: `nest/websites/web/modules/insights-shared/src/components/notebook`

**Concept**: Foundation documents contain executable code blocks that hydrate with live data when agent reads them.

#### Example Foundation Document

```markdown
---
type: foundation
projectId: proj-abc
refreshedAt: 2024-12-08T10:00:00Z
refreshIntervalDays: 30
version: 1
---

# Workspace Foundation: Acme Corp

## Business Overview
Acme Corp is an e-commerce company selling widgets.

## Audience Analysis

### Contact Statistics

```malloy
-- Live query: hydrated when agent reads this
run: datahub.contacts -> {
  aggregate: 
    total_contacts is count()
    active_30d is count() { where: last_activity > @30 days ago }
  group_by: segment
}
```

**Current snapshot** (as of 2024-12-08):
- Total contacts: 125,430
- Active (30 days): 45,200
- By segment: VIP (5,200), Regular (40,000)

### Key Segments

```malloy
-- Live query: list existing segments
run: datahub.segments -> {
  select:
    name
    description
    contact_count
  where: status = 'active'
}
```

## Channel Inventory

### Email Performance

```malloy
-- Live query: recent email metrics
run: datahub.campaigns -> {
  aggregate:
    campaigns is count()
    avg_open_rate is avg(open_rate)
    avg_click_rate is avg(click_rate)
  where: channel = 'email' and sent_at > @7 days ago
}
```

**Current snapshot**:
- Campaigns sent (7d): 12
- Avg open rate: 24.3%
- Avg click rate: 3.8%
```

#### How It Works

**When agent reads foundation**:

1. **Harness intercepts read request** (MCP tool or file read)
2. **Parses markdown** for code blocks with `malloy` language tag
3. **Executes queries** against DataHub
4. **Injects results** into markdown before returning to agent
5. **Agent sees hydrated document** with current data

**Benefits**:
- Foundation is always fresh (queries run on-demand)
- Agent sees current state, not stale snapshots
- Queries are visible and editable
- Can be rendered in UI for humans too

---

## Architecture Updates

### Harness Responsibilities

```typescript
// New: Living document hydration service
class LivingDocumentService {
  async read(path: string, workspaceId: string): Promise<string> {
    // 1. Fetch raw document from KB
    const raw = await kb.getDocument(path);
    
    // 2. Parse for code blocks
    const blocks = parseCodeBlocks(raw);
    
    // 3. Execute malloy queries
    const results = await Promise.all(
      blocks
        .filter(b => b.language === 'malloy')
        .map(b => executeQuery(b.code, workspaceId))
    );
    
    // 4. Inject results into markdown
    return hydrateDocument(raw, blocks, results);
  }
}
```

### Agent Workflow

```markdown
# Agent prompt (simplified)

You are working on project: {projectName} (ID: {projectId})

To get context:
1. Call tasks:getProject to get metadata
2. Read foundation at path from metadata.foundation.path
   (This will be hydrated with live data automatically)
3. Use the current data to inform your recommendations
```

### MCP Tool Enhancement

```typescript
// Enhance file read tool to hydrate living documents
async function readFile(path: string, context: ToolContext): Promise<string> {
  // Check if this is a living document
  if (path.includes('/agent-memory/') && path.endsWith('.md')) {
    return livingDocService.read(path, context.workspaceId);
  }
  
  // Regular file read
  return fs.readFile(path);
}
```

---

## Implementation Phases

### Phase 1A: Basic Project Context (Current)
- ✅ Whitelist operations
- ✅ Update session API to pass projectId
- ✅ Agent fetches project metadata
- ✅ Agent reads foundation (static)

### Phase 1B: Living Documents (New)
- [ ] Create LivingDocumentService
- [ ] Parse markdown for malloy code blocks
- [ ] Execute queries and inject results
- [ ] Enhance MCP read tool to hydrate
- [ ] Update foundation template with query blocks

### Phase 2: UI Rendering
- [ ] Notebook-style renderer for foundation
- [ ] Show live queries with results
- [ ] Allow editing queries
- [ ] Re-run queries on demand

---

## Example Use Cases

### 1. Foundation Always Fresh
Agent reads foundation → sees current contact count, recent campaigns, latest metrics

### 2. Agent Explores Data
Agent can modify queries in foundation to explore deeper:
```malloy
-- Agent adds filter to explore specific segment
run: datahub.contacts -> {
  aggregate: count()
  where: segment = 'VIP' and last_purchase > @30 days ago
}
```

### 3. Human Collaboration
User opens foundation in UI → sees same hydrated document → can edit queries → agent sees updates

---

## Trade-offs

### Pros
- Foundation always current
- No stale data issues
- Queries are transparent
- Reusable infrastructure (notebook renderer exists)

### Cons
- Adds complexity to harness
- Query execution on every read (caching needed)
- Requires DataHub query permissions
- Agent can't modify queries directly (read-only hydration)

---

## Next Steps

1. **Validate concept**: Test notebook renderer with foundation document
2. **Prototype hydration**: Simple service that executes one query
3. **Integrate with MCP**: Enhance read tool
4. **Update foundation template**: Add query blocks
5. **Performance testing**: Measure query execution overhead

---

## Open Questions

1. **Caching**: How long to cache hydrated documents? (5 min? 1 hour?)
2. **Query failures**: What if query fails? Show error or use cached snapshot?
3. **Permissions**: Should agent be able to write new queries to foundation?
4. **Query variables**: How to pass context (e.g., date ranges) to queries?
5. **Alternative syntax**: Use different marker than `malloy` for agent-specific queries?
