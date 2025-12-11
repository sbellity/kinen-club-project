# Session Outputs → Deployable Resources

## Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Session with Agent                            │
│                                                                  │
│  User: "Help me create a VIP campaign"                          │
│                                                                  │
│  Agent:                                                          │
│  1. Analyzes workspace (foundation)                             │
│  2. Proposes campaign strategy                                  │
│  3. Refines through Q&A                                         │
│  4. Generates artifacts                                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Session outputs
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              Session Artifacts (in session dir)                  │
│                                                                  │
│  sessions/{sessionId}/artifacts/                                │
│  ├── campaign-plan.md          # Human-readable strategy        │
│  ├── dashboard.yaml            # Performance tracking           │
│  └── terraform/                # DEPLOYABLE RESOURCES            │
│      ├── main.tf               # Resource definitions           │
│      ├── variables.tf          # Configuration                  │
│      ├── outputs.tf            # Resource IDs after deploy      │
│      ├── templates/            # Email templates                │
│      │   ├── vip-welcome.html                                   │
│      │   └── vip-followup.html                                  │
│      └── README.md             # Deployment instructions        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ User reviews
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    terraform plan                                │
│                                                                  │
│  $ cd sessions/{sessionId}/artifacts/terraform                  │
│  $ terraform plan                                               │
│                                                                  │
│  Terraform will perform the following actions:                  │
│                                                                  │
│  # bird_audience.vip_customers will be created                  │
│  + resource "bird_audience" "vip_customers" {                   │
│      + id       = (known after apply)                           │
│      + name     = "VIP Early Access"                            │
│      + size     = (known after apply)                           │
│    }                                                            │
│                                                                  │
│  # bird_campaign.vip_sequence will be created                   │
│  + resource "bird_campaign" "vip_sequence" {                    │
│      + id          = (known after apply)                        │
│      + audience_id = bird_audience.vip_customers.id             │
│    }                                                            │
│                                                                  │
│  Plan: 3 to add, 0 to change, 0 to destroy.                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ User accepts
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    terraform apply                               │
│                                                                  │
│  $ terraform apply                                              │
│                                                                  │
│  bird_audience.vip_customers: Creating...                       │
│  bird_audience.vip_customers: Creation complete [id=aud-123]    │
│  bird_campaign.vip_sequence: Creating...                        │
│  bird_campaign.vip_sequence: Creation complete [id=cmp-789]     │
│                                                                  │
│  Apply complete! Resources: 3 added, 0 changed, 0 destroyed.    │
│                                                                  │
│  Outputs:                                                       │
│  audience_id = "aud-123"                                        │
│  campaign_id = "cmp-789"                                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Resources created
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Bird Platform Resources                        │
│                                                                  │
│  ✅ Audience: VIP Early Access (aud-123)                        │
│  ✅ Template: Welcome Email (tpl-456)                           │
│  ✅ Campaign: VIP Sequence (cmp-789)                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Track deployment
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Project Metadata Updated                        │
│                                                                  │
│  project.metadata.deployments.push({                            │
│    sessionId: '{sessionId}',                                    │
│    artifactPath: 'sessions/{id}/artifacts/terraform',           │
│    deployedAt: '2024-12-08T10:00:00Z',                          │
│    resources: [                                                 │
│      { type: 'bird_audience', id: 'aud-123' },                  │
│      { type: 'bird_campaign', id: 'cmp-789' }                   │
│    ],                                                           │
│    status: 'active'                                             │
│  })                                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Next session
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              Agent References Deployed Resources                 │
│                                                                  │
│  Agent reads project metadata:                                  │
│  "I see you deployed VIP campaign (cmp-789) from session X"    │
│                                                                  │
│  Agent reads dashboard (hydrated with live data):               │
│  "Campaign is performing well: 38% open rate (target 35%)"     │
│                                                                  │
│  Agent proposes next steps:                                     │
│  "Should we create a follow-up campaign for clickers?"         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### 1. Session Artifacts = Proposed Resources

**Artifacts in session directory are proposals**, not deployed resources:

```
sessions/{sessionId}/artifacts/
├── terraform/              # PROPOSED resources
│   ├── main.tf            # What COULD be created
│   ├── variables.tf       # Configuration options
│   └── README.md          # How to deploy
```

**Status**: `draft` - not yet deployed

### 2. User Acceptance = Deployment

**User reviews and deploys**:

```bash
# Review what will be created
terraform plan

# Accept and deploy
terraform apply
```

**Status**: `draft` → `deployed`

### 3. Deployed Resources = Bird Platform State

**After deployment, resources exist in Bird**:

```
Bird Platform:
├── Audiences
│   └── aud-123 (VIP Early Access)
├── Templates
│   └── tpl-456 (Welcome Email)
└── Campaigns
    └── cmp-789 (VIP Sequence)
```

**Status**: `deployed` → `active`

### 4. Project Metadata = Deployment History

**Project tracks what was deployed from which session**:

```typescript
project.metadata.deployments = [
  {
    sessionId: 'sess-001',
    artifactPath: 'sessions/sess-001/artifacts/terraform',
    deployedAt: '2024-12-08T10:00:00Z',
    deployedBy: 'user@example.com',
    resources: [
      { type: 'bird_audience', id: 'aud-123', name: 'vip_customers' },
      { type: 'bird_template', id: 'tpl-456', name: 'vip_welcome' },
      { type: 'bird_campaign', id: 'cmp-789', name: 'vip_sequence' }
    ],
    terraformState: 'sessions/sess-001/artifacts/terraform/terraform.tfstate',
    status: 'active'
  }
]
```

---

## Artifact Lifecycle

### Stage 1: Draft (Session Output)

```
Agent generates terraform configs
↓
Artifacts written to session directory
↓
Status: draft
```

**Location**: `sessions/{sessionId}/artifacts/terraform/`

**Agent can**:
- Generate configs
- Update configs
- Delete configs

**User can**:
- Review configs
- Edit configs
- Run `terraform plan`

### Stage 2: Planned (User Reviewed)

```
User runs terraform plan
↓
Terraform validates configs
↓
Shows what will be created
↓
Status: planned
```

**User sees**:
- What resources will be created
- Dependencies
- Estimated impact

**User decides**:
- Accept (run `terraform apply`)
- Reject (delete/modify configs)
- Defer (come back later)

### Stage 3: Deployed (Resources Created)

```
User runs terraform apply
↓
Terraform creates resources in Bird
↓
Returns resource IDs
↓
Status: deployed
```

**Result**:
- Resources exist in Bird platform
- Terraform state file created
- Resource IDs captured
- Project metadata updated

### Stage 4: Active (Resources Running)

```
Resources deployed
↓
Campaign running
↓
Dashboard tracking performance
↓
Status: active
```

**Agent can**:
- Read dashboard (live metrics)
- Reference resource IDs
- Propose optimizations
- Suggest follow-ups

### Stage 5: Completed (Campaign Finished)

```
Campaign completes
↓
Final metrics captured
↓
Learnings documented
↓
Status: completed
```

**Agent can**:
- Generate campaign summary
- Update project learnings
- Archive dashboard snapshot
- Propose next campaigns

---

## Session Artifact Format

### Artifact Block in Session Output

```html
<artifact 
  type="terraform-plan" 
  id="vip-campaign" 
  status="draft"
  path="artifacts/terraform"
>
name: VIP Campaign Deployment
description: Creates audience, templates, and campaign sequence

resources:
  - bird_audience.vip_customers (1,200 contacts)
  - bird_template.vip_welcome
  - bird_template.vip_followup
  - bird_campaign.vip_sequence (5 emails, 21 days)

estimated_impact:
  reach: 1,200 contacts
  expected_revenue: $15K-25K MRR
  
deployment:
  terraform_version: 1.0
  provider_version: 1.0
  status: draft
  deployed_at: null
  deployed_by: null
  resource_ids: null
</artifact>
```

### After Deployment

```html
<artifact 
  type="terraform-plan" 
  id="vip-campaign" 
  status="deployed"
  path="artifacts/terraform"
>
name: VIP Campaign Deployment
description: Creates audience, templates, and campaign sequence

resources:
  - bird_audience.vip_customers (1,245 contacts) ✅
  - bird_template.vip_welcome ✅
  - bird_template.vip_followup ✅
  - bird_campaign.vip_sequence (5 emails, 21 days) ✅

actual_impact:
  reach: 1,245 contacts
  open_rate: 38% (target: 35%)
  click_rate: 12% (target: 10%)
  
deployment:
  terraform_version: 1.0
  provider_version: 1.0
  status: deployed
  deployed_at: 2024-12-08T10:00:00Z
  deployed_by: user@example.com
  resource_ids:
    audience: aud-123
    template_welcome: tpl-456
    template_followup: tpl-457
    campaign: cmp-789
</artifact>
```

---

## UI Flow

### 1. Session View (Agent Working)

```
┌─────────────────────────────────────────────────────────────┐
│  Session: VIP Campaign Planning                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Agent: Based on your workspace analysis, I recommend...    │
│                                                             │
│  [Agent messages...]                                        │
│                                                             │
│  Agent: I've created a deployment plan for you:             │
│                                                             │
│  📦 VIP Campaign Deployment                        [draft]  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Creates audience, templates, and campaign sequence   │   │
│  │                                                      │   │
│  │ Resources:                                           │   │
│  │ • bird_audience.vip_customers (1,200 contacts)       │   │
│  │ • bird_template.vip_welcome                          │   │
│  │ • bird_campaign.vip_sequence                         │   │
│  │                                                      │   │
│  │ Expected Impact: $15K-25K MRR                        │   │
│  │                                                      │   │
│  │ [View Plan] [Download Files] [Review & Deploy]       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Review & Deploy Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Review Deployment Plan                              [X]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Terraform Plan Output:                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Terraform will perform the following actions:        │   │
│  │                                                      │   │
│  │ # bird_audience.vip_customers will be created        │   │
│  │ + resource "bird_audience" "vip_customers" {         │   │
│  │     + id       = (known after apply)                 │   │
│  │     + name     = "VIP Early Access"                  │   │
│  │     + size     = (known after apply)                 │   │
│  │   }                                                  │   │
│  │                                                      │   │
│  │ Plan: 3 to add, 0 to change, 0 to destroy.           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️  This will create real resources in your workspace      │
│                                                             │
│  [Cancel] [Download Config] [Deploy]                        │
└─────────────────────────────────────────────────────────────┘
```

### 3. Deployment Progress

```
┌─────────────────────────────────────────────────────────────┐
│  Deploying VIP Campaign...                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ bird_audience.vip_customers created (aud-123)           │
│  ✅ bird_template.vip_welcome created (tpl-456)             │
│  ⏳ bird_campaign.vip_sequence creating...                  │
│                                                             │
│  [View Logs]                                                │
└─────────────────────────────────────────────────────────────┘
```

### 4. Deployment Complete

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ Deployment Complete                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Successfully deployed 3 resources:                         │
│  • Audience: VIP Early Access (aud-123)                     │
│  • Template: Welcome Email (tpl-456)                        │
│  • Campaign: VIP Sequence (cmp-789)                         │
│                                                             │
│  Campaign Status: Scheduled for Dec 12, 10:00 AM            │
│                                                             │
│  [View in Bird] [View Dashboard] [Continue Session]         │
└─────────────────────────────────────────────────────────────┘
```

### 5. Next Session (References Deployed Resources)

```
┌─────────────────────────────────────────────────────────────┐
│  New Session: Campaign Optimization                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Agent: I see your VIP campaign (cmp-789) is active.        │
│                                                             │
│  📊 Current Performance:                                    │
│  • Open rate: 38% (target: 35%) 🟢                          │
│  • Click rate: 12% (target: 10%) 🟢                         │
│  • Status: Exceeding expectations                           │
│                                                             │
│  Would you like to:                                         │
│  1. Create follow-up campaign for clickers                  │
│  2. Expand to similar segments                              │
│  3. Analyze non-openers for re-engagement                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Project View (Deployment History)

```
┌─────────────────────────────────────────────────────────────┐
│  Project: Special Offers Marketing                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Deployments:                                               │
│                                                             │
│  📦 VIP Campaign Deployment                      [active]   │
│  ├─ Session: sess-001 (Dec 8, 2024)                         │
│  ├─ Resources: 3 created                                    │
│  ├─ Status: Active since Dec 12                             │
│  └─ [View Resources] [View Dashboard] [View Session]        │
│                                                             │
│  📦 Holiday Campaign                            [completed] │
│  ├─ Session: sess-002 (Nov 15, 2024)                       │
│  ├─ Resources: 5 created                                    │
│  ├─ Status: Completed Dec 1                                │
│  └─ [View Results] [View Session]                          │
│                                                              │
│  [New Session]                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

**The flow is**:

1. **Agent generates** terraform configs as session artifacts (draft)
2. **User reviews** terraform plan
3. **User deploys** via terraform apply (deployed)
4. **Resources created** in Bird platform (active)
5. **Project tracks** deployment history
6. **Agent references** deployed resources in future sessions

**Session artifacts are proposals that become resources when user accepts them.**

This gives user full control while leveraging agent intelligence for planning and generation.
