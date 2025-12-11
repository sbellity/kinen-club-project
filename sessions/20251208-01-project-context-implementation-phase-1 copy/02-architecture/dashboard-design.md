# Dashboard as Living Document

## Core Concept

**Dashboard is a YAML/JSON document in KB that gets hydrated with live data.**

No separate Bird dashboard resource. Just a structured document with Malloy queries that execute when read.

---

## Dashboard Document Structure

### Location
```
/agent-memory/project-{id}/dashboard.yaml
```

### Format

```yaml
---
type: dashboard
projectId: proj-abc
title: VIP Campaign Performance
description: Tracks VIP campaign metrics and performance
createdAt: 2024-12-08T10:00:00Z
updatedAt: 2024-12-08T15:30:00Z
createdBy: agent
---

# VIP Campaign Performance Dashboard

## Overview
Tracking performance for VIP Early Access campaign launched Dec 12, 2024.

## Key Metrics

### Total Reach
**Target**: 1,200 contacts

```malloy
run: datahub.campaigns -> {
  aggregate: total_sent is sum(sent_count)
  where: campaign_id = 'cmp-789'
}
```

### Open Rate
**Target**: 35%

```malloy
run: datahub.campaigns -> {
  aggregate: 
    opens is sum(opens)
    sent is sum(sent)
    rate is opens / sent * 100
  where: campaign_id = 'cmp-789'
}
```

### Click Rate
**Target**: 10%

```malloy
run: datahub.campaigns -> {
  aggregate:
    clicks is sum(clicks)
    sent is sum(sent)
    rate is clicks / sent * 100
  where: campaign_id = 'cmp-789'
}
```

### Revenue Impact
**Target**: $15K-25K MRR

```malloy
run: datahub.revenue -> {
  aggregate: total_mrr is sum(mrr_change)
  where: 
    source_campaign = 'cmp-789'
    and date >= @2024-12-12
}
```

## Performance Over Time

```malloy
run: datahub.campaigns -> {
  group_by: date is sent_at.day
  aggregate:
    sent is sum(sent_count)
    opens is sum(opens)
    clicks is sum(clicks)
    open_rate is sum(opens) / sum(sent_count) * 100
    click_rate is sum(clicks) / sum(sent_count) * 100
  where: campaign_id = 'cmp-789'
  order_by: date
}
```

## Segment Breakdown

```malloy
run: datahub.campaigns -> {
  group_by: segment
  aggregate:
    contacts is count()
    opens is sum(opens)
    clicks is sum(clicks)
    open_rate is sum(opens) / count() * 100
  where: campaign_id = 'cmp-789'
  order_by: open_rate desc
}
```

## A/B Test Results

```malloy
run: datahub.campaigns -> {
  group_by: variant
  aggregate:
    sent is sum(sent_count)
    opens is sum(opens)
    clicks is sum(clicks)
    open_rate is sum(opens) / sum(sent_count) * 100
    click_rate is sum(clicks) / sum(sent_count) * 100
  where: 
    campaign_id = 'cmp-789'
    and email_number = 1
}
```

## Alerts

- 🔴 Open rate < 25% by Day 3
- 🟡 Click rate < 8% by Day 5
- 🟢 All metrics on track

## Next Actions

Based on current performance:
1. If exceeding targets → Expand to similar segments
2. If underperforming → Analyze non-openers, adjust messaging
3. If A/B winner clear → Apply winner to remaining sends
```

---

## How It Works

### 1. Agent Creates Dashboard

```markdown
User: "Create a dashboard to track this campaign"

Agent:
1. Generates dashboard.yaml with relevant queries
2. Writes to KB at /agent-memory/project-{id}/dashboard.yaml
3. Updates project metadata with dashboard path
4. Responds: "Dashboard created! View at {path}"
```

### 2. Agent/User Reads Dashboard

```markdown
User: "Show me campaign performance"

Agent:
1. Reads dashboard.yaml from KB
2. Harness intercepts read
3. Executes all malloy queries
4. Injects results into markdown
5. Agent sees hydrated document with current data
6. Formats as readable summary for user
```

### 3. Agent Updates Dashboard

```markdown
User: "Add revenue tracking to the dashboard"

Agent:
1. Reads current dashboard.yaml
2. Adds new metric section with malloy query
3. Writes updated dashboard back to KB
4. Responds: "Added revenue tracking metric"
```

### 4. Frontend Renders Dashboard

```typescript
// Dashboard view component
const DashboardView = ({ projectId }) => {
  const { dashboard } = useProjectDashboard(projectId);
  
  return (
    <NotebookRenderer
      markdown={dashboard.content}  // YAML with malloy queries
      workspaceId={workspaceId}
      model={model}
      useQueryHook={useQueryHook}
    />
  );
};
```

The notebook renderer:
- Parses markdown
- Finds malloy code blocks
- Executes queries
- Renders results as tables/charts
- Shows live data

---

## Benefits

### 1. Version Controlled
- Dashboard is just a file in KB
- Can track changes over time
- Can revert to previous versions
- Can diff changes

### 2. Agent Can Modify
- Agent can add new metrics
- Agent can update queries
- Agent can adjust targets
- No API calls needed

### 3. Portable
- Copy dashboard to another project
- Share dashboard templates
- Export as markdown

### 4. Always Fresh
- Queries execute on read
- No stale data
- No cache invalidation issues

### 5. Simple Architecture
- No separate dashboard resource
- No dashboard API
- Reuses notebook renderer
- Reuses living document hydration

### 6. Human Readable
- YAML/Markdown format
- Can edit manually if needed
- Clear structure
- Self-documenting

---

## Project Metadata

```typescript
project.metadata = {
  agent: 'marketing-advisor',
  version: '1.0',
  
  kbFolderPath: '/agent-memory/project-abc',
  
  foundation: {
    documentId: 'doc-foundation-456',
    path: '/agent-memory/project-abc/foundation.md',
    lastRefreshedAt: '2024-12-08T10:00:00Z',
    refreshIntervalDays: 30
  },
  
  // Dashboard is just another living document
  dashboard: {
    documentId: 'doc-dashboard-789',
    path: '/agent-memory/project-abc/dashboard.yaml',
    lastRefreshedAt: '2024-12-08T15:30:00Z'
  },
  
  digest: {
    enabled: true,
    frequency: 'daily',
    lastRunAt: '2024-12-08T06:00:00Z',
    // Digest reads dashboard to generate summary
    dashboardPath: '/agent-memory/project-abc/dashboard.yaml'
  }
}
```

---

## Digest Generation

Daily digest job:

```typescript
async function generateDigest(projectId: string): Promise<string> {
  // 1. Get project metadata
  const project = await getProject(projectId);
  
  // 2. Read dashboard (hydrated with live data)
  const dashboard = await readLivingDocument(
    project.metadata.dashboard.path,
    workspaceId
  );
  
  // 3. Parse results from hydrated queries
  const metrics = parseDashboardMetrics(dashboard);
  
  // 4. Generate summary
  const digest = `
# Daily Digest - ${new Date().toLocaleDateString()}

## ${project.name}

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
${metrics.map(m => 
  `| ${m.name} | ${m.current} | ${m.target} | ${m.status}`
).join('\n')}

**Key Insights**:
${generateInsights(metrics)}

**Recommendations**:
${generateRecommendations(metrics)}
  `;
  
  // 5. Store digest in KB
  await writeDocument(
    `/agent-memory/project-${projectId}/digests/${date}.md`,
    digest
  );
  
  // 6. Post as task comment
  await createComment(projectId, digest);
  
  return digest;
}
```

---

## Agent Prompt Instructions

```markdown
## Dashboard Management

### Creating a Dashboard

When user requests performance tracking:

1. **Create dashboard.yaml** in KB:
   ```
   /agent-memory/project-{projectId}/dashboard.yaml
   ```

2. **Include these sections**:
   - Overview (campaign description)
   - Key Metrics (with targets and malloy queries)
   - Performance Over Time (time series query)
   - Segment Breakdown (if relevant)
   - A/B Test Results (if applicable)
   - Alerts (thresholds for notifications)
   - Next Actions (recommendations based on performance)

3. **Use malloy queries** for all metrics:
   ```malloy
   run: datahub.campaigns -> {
     aggregate: metric_name is calculation
     where: campaign_id = '{id}'
   }
   ```

4. **Set realistic targets** based on:
   - Project goals from description
   - Historical performance
   - Industry benchmarks

5. **Update project metadata**:
   ```
   mcp__nest-api__invoke_operation {
     "operation": "tasks:updateProject",
     "pathParams": { "id": "{projectId}" },
     "body": {
       "metadata": {
         "dashboard": {
           "documentId": "{docId}",
           "path": "/agent-memory/project-{id}/dashboard.yaml",
           "lastRefreshedAt": "{timestamp}"
         }
       }
     }
   }
   ```

### Reading Dashboard

When user asks for performance:

1. **Get dashboard path** from project metadata
2. **Read dashboard** (will be hydrated automatically)
3. **Parse results** from malloy query outputs
4. **Format as summary** for user:
   - Table of metrics vs targets
   - Status indicators (🟢🟡🔴)
   - Key insights
   - Recommendations

### Updating Dashboard

When adding new metrics:

1. **Read current dashboard**
2. **Add new section** with malloy query
3. **Write back to KB**
4. **Inform user** of changes

### Dashboard Templates

For common campaign types:

**Email Campaign Dashboard**:
- Sent, Opens, Clicks, Unsubscribes
- Open rate, Click rate, Unsubscribe rate
- Performance over time
- Device breakdown
- Link performance

**Multi-Channel Campaign Dashboard**:
- Per-channel metrics
- Cross-channel attribution
- Channel performance comparison
- Optimal send times

**Revenue Campaign Dashboard**:
- Revenue impact
- ROI calculation
- Customer lifetime value
- Conversion funnel
```

---

## Example: Complete Dashboard Lifecycle

### 1. Campaign Planning

```
User: "I want to launch a VIP campaign"

Agent: 
- Proposes campaign strategy
- Generates terraform configs
- Creates dashboard.yaml with planned metrics
```

### 2. Campaign Launch

```
User: "Deploy the campaign"

User runs: terraform apply

Agent:
- Updates dashboard with actual campaign IDs
- Sets initial targets
```

### 3. Daily Monitoring

```
Cron job runs daily digest:
- Reads dashboard (hydrated with live data)
- Generates summary
- Posts to project comments
```

### 4. Mid-Campaign Optimization

```
User: "How's the campaign performing?"

Agent:
- Reads dashboard
- Shows current metrics vs targets
- Identifies: "Open rate 38% (target 35%) 🟢"
- Recommends: "Expand to similar segments"
```

### 5. Campaign Completion

```
User: "Campaign finished, what did we learn?"

Agent:
- Reads final dashboard data
- Generates campaign summary
- Updates project learnings
- Archives dashboard snapshot
```

---

## Comparison: Dashboard Resource vs Living Document

| Aspect | Dashboard Resource | Living Document |
|--------|-------------------|-----------------|
| **Storage** | Bird database | KB document |
| **Updates** | API calls | File writes |
| **Versioning** | Manual | Git-based |
| **Portability** | Export required | Copy file |
| **Editing** | API only | Text editor |
| **Agent Access** | API calls | File read/write |
| **Human Access** | UI only | Any text editor |
| **Query Execution** | On demand | On read |
| **Caching** | Complex | Simple (TTL) |
| **Sharing** | Permissions | File sharing |

**Winner**: Living Document ✅

---

## Implementation Checklist

- [ ] Update living document service to handle YAML
- [ ] Add dashboard template to agent prompt
- [ ] Update project metadata schema
- [ ] Frontend dashboard view component
- [ ] Digest generation service
- [ ] Dashboard CRUD operations in agent prompt
- [ ] Example dashboards for common campaigns

---

## Future Enhancements

### 1. Dashboard Templates
Pre-built dashboards for common scenarios:
- Email campaign
- Multi-channel campaign
- Revenue campaign
- Engagement campaign

### 2. Dashboard Sharing
Share dashboard between projects:
```bash
cp /agent-memory/project-a/dashboard.yaml \
   /agent-memory/project-b/dashboard.yaml
```

### 3. Dashboard Alerts
Agent monitors dashboard and alerts on thresholds:
```yaml
alerts:
  - metric: open_rate
    threshold: 25
    operator: less_than
    action: notify_user
```

### 4. Dashboard Snapshots
Archive dashboard state at key moments:
```
/agent-memory/project-{id}/dashboards/
  ├── dashboard.yaml              # Current
  ├── snapshots/
  │   ├── 2024-12-12-launch.yaml  # Launch day
  │   ├── 2024-12-19-midpoint.yaml
  │   └── 2024-01-02-complete.yaml
```

### 5. Dashboard Comparison
Compare performance across campaigns:
```malloy
-- Compare this campaign to previous ones
run: datahub.campaigns -> {
  group_by: campaign_id
  aggregate:
    open_rate is avg(open_rate)
    click_rate is avg(click_rate)
  where: project_id = '{projectId}'
}
```

---

## Conclusion

**Dashboard as living document is superior because:**

✅ Simpler architecture (no new resources)
✅ Version controlled (git-based)
✅ Agent-friendly (file operations)
✅ Human-readable (YAML/Markdown)
✅ Always fresh (queries on read)
✅ Portable (copy files)
✅ Reuses infrastructure (notebook renderer)

**No separate Bird dashboard resource needed!**
