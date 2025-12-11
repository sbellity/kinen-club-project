# Master Plan: Marketing Agent with Project Context

## Vision

**Marketing Agent that:**
1. Maintains persistent context across sessions
2. Reads "living documents" with fresh data
3. Generates deployment-ready Terraform configs
4. Tracks campaign performance over time

---

## Three Revolutionary Ideas

### 1. Agent Retrieves Its Own Context
**No harness pre-fetching. Agent is autonomous.**

```
Harness → Passes projectId
Agent → Calls tasks:getProject
Agent → Gets metadata with all paths
Agent → Fetches foundation, tasks, digest
Agent → Uses context to inform work
```

**Why**: Simpler harness, flexible agent, no proxy endpoints

---

### 2. Living Documents (Notebook-Style)
**Foundation and dashboard documents hydrate with live data when read.**

**Foundation Example**:
```markdown
## Contact Statistics

```malloy
run: datahub.contacts -> {
  aggregate: count()
  group_by: segment
}
```

**Current**: 125,430 contacts (45,200 active)
```

**Dashboard Example** (`dashboard.yaml`):
```yaml
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
```

**When agent reads these**:
- Harness intercepts read
- Executes malloy queries
- Injects fresh results
- Agent sees current data

**Why**: No stale data, transparent queries, reuses notebook renderer, no separate dashboard resource

---

### 3. Terraform-Based Deployment
**Agent generates .tf files as session outputs, user deploys via terraform.**

**Session artifacts = Proposed resources** (status: `draft`)

```hcl
# sessions/{sessionId}/artifacts/terraform/main.tf
resource "bird_audience" "vip_customers" {
  name = "VIP Early Access"
  criteria = { ... }
}

resource "bird_campaign" "vip_sequence" {
  audience_id = bird_audience.vip_customers.id
  depends_on = [bird_audience.vip_customers]
}
```

**User workflow**:
1. Agent generates terraform configs in session artifacts
2. User reviews: `terraform plan` (status: `planned`)
3. User deploys: `terraform apply` (status: `deployed`)
4. Resources created in Bird platform (status: `active`)
5. Project metadata tracks deployment history

**Why**: User controls deployment, agent proposes, terraform manages state

---

## Complete Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  - Project selector                                         │
│  - Artifact cards (with terraform configs)                  │
│  - Notebook renderer (for foundation)                       │
│  - Deployment UI (plan/apply)                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Session Service                            │
│  - Creates session with projectId                           │
│  - Injects minimal context in prompt                        │
│  - Living document hydration service                        │
│  - Terraform execution service (Phase 2)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Marketing Agent                             │
│  1. Calls tasks:getProject → gets metadata                  │
│  2. Reads foundation → hydrated with live data              │
│  3. Calls tasks:listTasks → recent activity                 │
│  4. Proposes campaign ideas                                  │
│  5. Generates terraform configs                              │
│  6. Creates artifact blocks for UI                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Bird Platform                              │
│  - Projects (metadata, goals)                               │
│  - Tasks (sessions, artifacts)                              │
│  - Knowledgebase (foundation, learnings)                    │
│  - DataHub (live queries for hydration)                     │
│  - Controlplane Resources (terraform deployment target)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Roadmap (REVISED with Component Reuse)

### Week 1: Backend + Core Integration (16 hours)

#### Backend (8 hours)
- [x] Design complete
- [ ] Whitelist operations (30 min)
- [ ] Update session API (2 hours)
- [ ] Context injection (2 hours)
- [ ] Agent prompt updates (2 hours)
- [ ] Living document hydration (1.5 hours)

#### Frontend Integration (8 hours)
- [ ] Create new app in monorepo (1 hour)
- [ ] Agent chat interface (2 hours) - Custom
- [ ] Project selector (1 hour) - Custom
- [ ] Import campaign components (2 hours) - Reuse existing
- [ ] Import dashboard components (1 hour) - Reuse existing
- [ ] Wire to backend (1 hour)

**Deliverable**: Working agent chat → campaign launch → dashboard

**Key Insight**: Reuse existing components from `websites/web`:
- ✅ Campaign builder: `features/Campaigns/CampaignWizard`
- ✅ Email editor: `features/Studio/TemplateEditorScene`
- ✅ Dashboard: `modules/insights-shared/components/notebook`
- ✅ UI library: `packages/messagebird-boxkit`

---

### Week 2: Polish & Testing (8 hours)

- [ ] Error handling (2 hours)
- [ ] Loading states (1 hour)
- [ ] Mobile responsive (2 hours)
- [ ] User testing (2 hours)
- [ ] Bug fixes (1 hour)

**Deliverable**: Production-ready Phase 1

---

### Week 3: Terraform Deployment (8 hours)

- [ ] Agent terraform generation (2 hours)
- [ ] Backend terraform executor (2 hours)
- [ ] Frontend deployment UI (2 hours)
- [ ] Progress streaming (1 hour)
- [ ] Testing (1 hour)

**Deliverable**: One-click deployment

---

### Week 4: Advanced Features (8 hours)

**Already built, just integrate**:
- [ ] Visual email editor (2 hours) - From Studio
- [ ] Journey rules (2 hours) - From Journeys
- [ ] Journey templates (1 hour) - 14 templates exist!
- [ ] Advanced metrics (2 hours) - From Campaigns
- [ ] Testing (1 hour)

**Deliverable**: Feature-complete system

**Total: 40 hours = 1 week of focused work (or 4 weeks part-time)**

---

## Data Structures

### Project Metadata

```typescript
project.metadata = {
  agent: 'marketing-advisor',
  version: '1.0',
  
  // KB linkage
  kbFolderId: 'folder-123',
  kbFolderPath: '/agent-memory/project-abc',
  
  // Foundation
  foundation: {
    documentId: 'doc-456',
    path: '/agent-memory/project-abc/foundation.md',
    lastRefreshedAt: '2024-12-08T10:00:00Z',
    refreshIntervalDays: 30
  },
  
  // Dashboard (living document, not a Bird resource)
  dashboard: {
    documentId: 'doc-dashboard-789',
    path: '/agent-memory/project-abc/dashboard.yaml',
    lastRefreshedAt: '2024-12-08T15:30:00Z'
  },
  
  // Digest (reads dashboard to generate summary)
  digest: {
    enabled: true,
    frequency: 'daily',
    lastRunAt: '2024-12-08T06:00:00Z',
    dashboardPath: '/agent-memory/project-abc/dashboard.yaml'
  },
  
  // Deployments (tracks session outputs that became resources)
  deployments: [
    {
      sessionId: 'sess-001',
      artifactPath: 'sessions/sess-001/artifacts/terraform',
      terraformState: 'sessions/sess-001/artifacts/terraform/terraform.tfstate',
      deployedAt: '2024-12-08T10:00:00Z',
      deployedBy: 'user@example.com',
      resources: [
        { type: 'bird_audience', id: 'aud-123', name: 'vip_early_access' },
        { type: 'bird_template', id: 'tpl-456', name: 'vip_welcome' },
        { type: 'bird_campaign', id: 'cmp-789', name: 'vip_sequence' }
      ],
      status: 'active'  // draft → planned → deployed → active → completed
    }
  ]
}
```
yes
### Session Directory Structure

```
session-{id}/
├── metadata.json              # Session metadata (projectId, etc.)
├── brief.md                   # User's initial prompt
├── AGENT.md                   # Agent instructions
├── artifacts/
│   ├── foundation.md          # Workspace analysis (if generated)
│   ├── dashboard.yaml         # Performance dashboard (NEW)
│   ├── campaign-plan.md       # Campaign strategy (human-readable)
│   ├── terraform/             # PROPOSED RESOURCES (session output)
│   │   ├── main.tf            # Resource definitions (status: draft)
│   │   ├── variables.tf       # Configuration
│   │   ├── outputs.tf         # Resource IDs (after deployment)
│   │   ├── terraform.tfstate  # State (after deployment)
│   │   ├── templates/         # Email templates
│   │   │   ├── email-1.html
│   │   │   └── email-2.html
│   │   └── README.md          # Deployment instructions
│   └── INDEX.md               # Artifact index
├── rounds/
│   └── 01-intent.md           # Session rounds
└── mcp.log                    # MCP operation log

# After user deploys:
# - terraform.tfstate created (resource IDs)
# - Project metadata updated (deployment history)
# - Resources exist in Bird platform
```

### Artifact Format

```html
<artifact 
  type="terraform-plan" 
  id="vip-campaign" 
  status="draft|planned|deployed"
  terraform-path="artifacts/terraform"
>
name: VIP Campaign Deployment
description: Creates audience, templates, and campaign sequence

resources:
  - bird_audience.vip_customers (1,200 contacts)
  - bird_template.welcome_email
  - bird_template.followup_email
  - bird_campaign.vip_sequence (5 emails, 21 days)

estimated_impact:
  reach: 1,200 contacts
  expected_revenue: $15K-25K MRR
  
deployment:
  terraform_version: 1.0
  provider_version: 1.0
  last_plan: 2024-12-08T10:00:00Z
  deployed_at: null
  deployed_by: null
</artifact>
```

---

## Success Metrics

### Phase 1 Success
- ✅ Agent retrieves project context automatically
- ✅ Foundation shows current data (not stale)
- ✅ Agent generates valid terraform configs
- ✅ User can deploy via terraform CLI
- ✅ UI shows projects and artifacts

### Phase 2 Success
- ✅ One-click deployment from UI
- ✅ Real-time deployment progress
- ✅ Resource IDs tracked in metadata
- ✅ Agent references deployed resources
- ✅ Agent creates dashboard.yaml documents

### Phase 3 Success
- ✅ Dashboard hydrates with live data
- ✅ Daily digests run automatically (read dashboard)
- ✅ Resource updates work
- ✅ Drift detection alerts user
- ✅ Dashboard alerts trigger on thresholds

---

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Context fetching** | Agent does it | Simpler harness, flexible agent |
| **Foundation freshness** | Living documents | No stale data, transparent queries |
| **Dashboard** | Living document (YAML) | No separate resource, version controlled |
| **Artifact deployment** | Terraform | Reuses infrastructure, dependency tracking |
| **Project creation** | Harness, not LLM | Security, control |
| **Task creation** | Agent via MCP | Flexibility, agent autonomy |
| **Endpoint strategy** | Minimal/none | Agent uses MCP directly |
| **State management** | Terraform | Built-in, proven |
| **Deployment approval** | User reviews plan | Safety, transparency |
| **Digest generation** | Reads dashboard | Always current, no separate queries |

---

## Open Questions

1. **Terraform binary**: Bundle or require installation?
2. **State storage**: Local or remote backend?
3. **Credentials**: How to pass tokens securely?
4. **Query caching**: TTL for hydrated documents?
5. **Frontend MCP**: Can frontend call MCP for project list?
6. **Task naming**: What should initial task name be?
7. **Foundation timing**: Generate on project creation or first session?

---

## References

- **Design session**: `scratch/20251204-01-project-context-marketing-agent/`
- **Architecture summary**: `artifacts/architecture-summary.md`
- **Living documents**: `artifacts/living-documents-concept.md`
- **Dashboard as living doc**: `artifacts/dashboard-as-living-doc.md`
- **Terraform deployment**: `artifacts/terraform-deployment-concept.md`
- **Session outputs to resources**: `artifacts/session-outputs-to-resources.md`
- **Marketing-focused UI**: `artifacts/marketing-focused-ui.md` ⭐
- **Reusable components**: `artifacts/REUSABLE-COMPONENTS-ANALYSIS.md` 🎯
- **Final roadmap**: `artifacts/FINAL-IMPLEMENTATION-ROADMAP.md` 🚀
- **Executive summary**: `artifacts/EXECUTIVE-SUMMARY.md` 📊
- **S3 artifact storage**: `artifacts/s3-artifact-storage.md` 💾
- **Session checkpointing**: `artifacts/session-checkpointing.md` 🔄
- **Claude SDK hooks**: `artifacts/claude-sdk-lifecycle-hooks.md` 🪝
- **ACP integration** (RECOMMENDED): `artifacts/acp-integration-strategy.md` ⭐⭐⭐
- **Implementation round**: `rounds/01-backend-foundation.md`

---

## Next Action

**Start Phase 1A: Whitelist operations**

```bash
cd /Users/sbellity/code/nest/apps/llmchain
code config/bird-operations.yaml
```

Add operations, test, iterate.

Let's build this! 🚀
