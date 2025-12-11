# Context Gathering Skill

## Purpose

Fetch and consolidate project context at the start of every session where a `projectId` is provided.

**When to use**: Automatically at session start if `projectId` is in initial prompt.

**What it provides**:
- Project metadata (name, description, goals)
- Foundation document (customer data, past performance, guidelines)
- Recent activity (past sessions, deployed campaigns)

---

## Prerequisites

- `projectId` provided in initial prompt
- MCP access to Bird APIs (`tasks:*`, `content:*`)
- Permissions: `tasks:getProject`, `content:getDocument`, `tasks:listTasks`

---

## Instructions

### Step 1: Fetch Project Metadata

**API Call**:
```typescript
mcp__nest-api__invoke_operation({
  operation: "tasks:getProject",
  pathParams: { id: projectId }
})
```

**What you get**:
```json
{
  "id": "project-123",
  "name": "Q1 Growth Campaign",
  "description": "Drive 20% MRR growth through VIP upgrades",
  "metadata": {
    "agent": "marketing-advisor",
    "kbFolderId": "folder-456",
    "kbFolderPath": "/agent-memory/project-123",
    "foundation": {
      "documentId": "doc-789",
      "path": "/agent-memory/project-123/foundation.md",
      "lastRefreshedAt": "2025-01-08T10:00:00Z"
    },
    "dashboard": {
      "documentId": "doc-dashboard-101",
      "path": "/agent-memory/project-123/dashboard.yaml"
    },
    "deployments": [
      {
        "sessionId": "sess-001",
        "deployedAt": "2025-01-05T14:00:00Z",
        "resources": [
          { "type": "bird_audience", "id": "aud-123", "name": "vip_customers" },
          { "type": "bird_campaign", "id": "cmp-456", "name": "vip_welcome" }
        ],
        "status": "active"
      }
    ]
  }
}
```

**Extract**:
- Project name and description (for context)
- Foundation document ID (for next step)
- Dashboard document ID (if needed)
- Deployment history (to know what's already live)

---

### Step 2: Read Foundation Document

**API Call**:
```typescript
const foundationId = project.metadata.foundation.documentId;

mcp__nest-api__invoke_operation({
  operation: "content:getDocument",
  pathParams: { id: foundationId }
})
```

**What you get** (example):
```markdown
# Q1 Growth Campaign - Foundation

## Customer Segments

```malloy
run: datahub.contacts -> {
  aggregate: count()
  group_by: segment
}
```

**Current Statistics** (as of 2025-01-08):
- Total: 12,430 contacts
- VIP: 1,200 (10%) - LTV > $1,000
- Active: 5,600 (45%) - Purchased last 30 days
- Dormant: 3,500 (28%) - No purchase 90+ days
- New: 2,130 (17%) - Joined last 30 days

## Past Campaign Performance

```malloy
run: datahub.campaigns -> {
  aggregate:
    avg(open_rate) as avg_open_rate
    avg(click_rate) as avg_click_rate
    avg(conversion_rate) as avg_conversion_rate
  where: created_at > @2024-10-01
}
```

**Last 3 Months**:
- Average open rate: 35%
- Average click rate: 8%
- Average conversion rate: 3.5%

**Top Performers**:
- VIP Welcome Series: 45% open, 12% click, 8% conversion
- Product Launch: 42% open, 10% click, 6% conversion

## Brand Guidelines

- Tone: Professional but friendly
- Colors: Primary #0066CC, Secondary #FF6B35
- Logo: Use full color logo in headers
- CTA: "Get Started" or "Learn More" (avoid "Click Here")

## Budget Constraints

- Q1 Budget: $50K
- Spent: $12K (24%)
- Remaining: $38K (76%)
- Per-campaign target: $5K-10K
```

**Important**: The data in code blocks is LIVE - it was executed when you read the document. Numbers are current, not stale.

**Extract**:
- Customer segment sizes (for targeting)
- Past performance benchmarks (for expectations)
- Brand guidelines (for content creation)
- Budget constraints (for planning)

---

### Step 3: Get Recent Activity

**API Call**:
```typescript
mcp__nest-api__invoke_operation({
  operation: "tasks:listTasks",
  body: {
    projectId: projectId,
    limit: 5,
    orderBy: "updatedAt",
    orderDirection: "desc"
  }
})
```

**What you get**:
```json
{
  "tasks": [
    {
      "id": "task-001",
      "title": "VIP Campaign Planning",
      "description": "Designed 5-email upgrade sequence",
      "status": "completed",
      "createdAt": "2025-01-05T10:00:00Z",
      "updatedAt": "2025-01-05T14:00:00Z",
      "metadata": {
        "artifacts": ["campaign-plan.md", "terraform/main.tf"],
        "outcome": "Campaign deployed, 1,200 contacts targeted"
      }
    },
    {
      "id": "task-002",
      "title": "Dashboard Setup",
      "description": "Created performance dashboard",
      "status": "completed",
      "createdAt": "2025-01-06T09:00:00Z"
    }
  ]
}
```

**Extract**:
- What was discussed/decided recently
- What campaigns were deployed
- What's currently active
- Any ongoing work

---

### Step 4: Synthesize Context

**Create mental model**:
```markdown
Project: Q1 Growth Campaign
Goal: 20% MRR growth via VIP upgrades

Current State:
- 12,430 total contacts
- 1,200 VIP customers (target segment)
- $38K budget remaining
- 1 active campaign (VIP Welcome, deployed Jan 5)

Past Performance:
- 35% avg open rate
- 8% avg click rate
- VIP campaigns perform 2x better

Recent Activity:
- Jan 5: Deployed VIP Welcome campaign
- Jan 6: Set up performance dashboard
- Currently: Monitoring campaign performance

Next Steps:
- Review VIP campaign performance
- Consider next campaign (reactivation? new feature?)
- Stay within budget ($5-10K per campaign)
```

---

## Examples

### Example 1: Successful Context Gathering

**Input**:
```
projectId: "project-123"
User message: "Help me create a campaign to increase upgrades"
```

**Process**:
```markdown
Let me check your project context...

[Calls tasks:getProject]
✓ Found project: "Q1 Growth Campaign"
✓ Goal: 20% MRR growth

[Calls content:getDocument]
✓ Foundation loaded
✓ Customer data: 12,430 contacts (1,200 VIP)
✓ Past performance: 35% open rate baseline

[Calls tasks:listTasks]
✓ Recent activity: VIP Welcome campaign deployed Jan 5
✓ Status: Active, monitoring performance
```

**Output**:
```markdown
Based on your project context:

**Current Situation**:
- 12,430 total contacts
- 1,200 VIP customers (high-value segment)
- Recent VIP Welcome campaign deployed (Jan 5)
- $38K budget remaining for Q1

**Past Performance**:
- Average: 35% open, 8% click, 3.5% conversion
- VIP campaigns: 45% open (2x better)

**Recommendation**:
Since you just launched VIP Welcome, I suggest:
1. Monitor that campaign for 1-2 weeks
2. Then launch VIP Upgrade campaign (next in sequence)
3. Or consider reactivation campaign for 3,500 dormant customers

Which direction interests you?
```

---

### Example 2: Missing Foundation

**Input**:
```
projectId: "project-456"
User message: "Help me create a campaign"
```

**Process**:
```markdown
Let me check your project context...

[Calls tasks:getProject]
✓ Found project: "New Product Launch"

[Calls content:getDocument with foundationId]
✗ Foundation document not found (404)
```

**Output**:
```markdown
I found your project "New Product Launch", but I don't see a foundation document yet.

The foundation document contains:
- Customer segments and statistics
- Past campaign performance
- Brand guidelines
- Budget constraints

**Would you like me to create one?**

I'll analyze your customer data and set up the foundation document. This takes about 2 minutes.

Or, if you prefer, we can proceed without it (I'll ask for details as needed).
```

---

### Example 3: New Project (No History)

**Input**:
```
projectId: "project-789"
User message: "Help me plan my first campaign"
```

**Process**:
```markdown
[Calls tasks:getProject]
✓ Found project: "Holiday Campaign 2025"

[Calls content:getDocument]
✓ Foundation loaded (minimal data)

[Calls tasks:listTasks]
✓ No past tasks (new project)
```

**Output**:
```markdown
Welcome to your new project "Holiday Campaign 2025"!

**Current Data**:
- 8,200 total contacts
- No past campaigns yet (this is your first!)
- Foundation document set up

**Since this is your first campaign**, I'll guide you through:
1. Defining your campaign goal
2. Choosing your target audience
3. Planning your messaging strategy
4. Setting up tracking

**Let's start**: What's the main goal for this campaign?
- Drive sales?
- Build awareness?
- Re-engage customers?
- Something else?
```

---

## Constraints

### ❌ What NOT to Do

1. **Don't skip context gathering**
   ```
   ❌ User: "Create a campaign"
   ❌ Agent: "Here's a generic campaign plan..."
   
   ✅ Agent: "Let me first check your project context..."
   ```

2. **Don't cache stale data**
   ```
   ❌ "Based on your 10,000 contacts..." (from last week)
   ✅ "Based on your current 12,430 contacts..." (live data)
   ```

3. **Don't fetch unnecessary data**
   ```
   ❌ Fetch all 50 past campaigns
   ✅ Fetch last 5 tasks (recent activity)
   ```

4. **Don't proceed if critical data missing**
   ```
   ❌ Generate campaign without knowing budget
   ✅ Ask for budget if not in foundation
   ```

### ✅ What TO Do

1. **Always start with context**
   ```
   ✅ "Let me check your project context..."
   ✅ Show what you're fetching
   ✅ Confirm what you found
   ```

2. **Handle missing data gracefully**
   ```
   ✅ "Foundation missing - would you like me to create one?"
   ✅ "No past campaigns - this is your first! I'll guide you..."
   ```

3. **Synthesize context clearly**
   ```
   ✅ "Based on your project goals and 1,200 VIP customers..."
   ✅ "Your past campaigns averaged 35% open rate..."
   ```

4. **Use context in recommendations**
   ```
   ✅ "Since you have $38K budget remaining and VIP performs 2x better..."
   ```

---

## Testing

### Test Case 1: Happy Path
- [ ] Can fetch project metadata
- [ ] Can read foundation document
- [ ] Can get recent activity (5 tasks)
- [ ] Synthesizes context clearly
- [ ] Uses context in response

### Test Case 2: Missing Foundation
- [ ] Detects missing foundation
- [ ] Offers to create foundation
- [ ] Can proceed without foundation (asks for details)

### Test Case 3: New Project
- [ ] Handles no past tasks gracefully
- [ ] Provides guidance for first campaign
- [ ] Doesn't reference non-existent data

### Test Case 4: API Errors
- [ ] Handles 404 (not found) gracefully
- [ ] Handles 403 (forbidden) with clear message
- [ ] Handles 500 (server error) with retry suggestion

### Test Case 5: Large Data
- [ ] Limits tasks to 5 (not all 50)
- [ ] Doesn't fetch unnecessary data
- [ ] Stays within token limits

---

## Related Skills

**Runs before**:
- None (this is always first)

**Runs after**:
- `data-analysis` - Analyze the gathered context
- `performance-review` - Review past campaign performance
- `campaign-generation` - Generate new campaigns

**Alternative**:
- `standalone-advice` - If no projectId (no context needed)

---

## Performance Metrics

**Target**:
- Execution time: < 5 seconds
- API calls: 3 (getProject, getDocument, listTasks)
- Token usage: ~500 tokens (context summary)

**Monitoring**:
- Track API call success rate
- Track missing foundation rate
- Track time to complete

---

## Maintenance

**Update when**:
- New metadata fields added to project
- Foundation document structure changes
- New APIs available for context

**Review frequency**: Monthly

**Owner**: Backend team + Prompt engineering team
