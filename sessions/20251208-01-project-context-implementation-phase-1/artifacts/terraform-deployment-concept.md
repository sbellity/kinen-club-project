# Terraform-Based Artifact Deployment

## The Brilliant Idea

**Agent creates campaign plans → User deploys via Terraform → Bird platform executes**

This leverages existing infrastructure instead of reinventing the wheel:
- ✅ Bird Terraform Provider already exists
- ✅ Controlplane Resources API already exists  
- ✅ Dependency tracking built-in (Terraform graph)
- ✅ Plan → Apply workflow (user reviews before deploying)
- ✅ State management (what's deployed, what changed)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Marketing Agent                             │
│                                                                  │
│  Agent analyzes workspace, proposes campaign ideas:             │
│  - Audience segments                                            │
│  - Email templates                                              │
│  - Campaign sequences                                           │
│  - A/B tests                                                    │
│  - Holdout groups                                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Generates artifacts
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Terraform Configuration                        │
│                                                                  │
│  main.tf:                                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ resource "bird_audience" "vip_customers" {                │  │
│  │   name = "VIP Early Access"                               │  │
│  │   criteria = {                                            │  │
│  │     field = "customer_tier"                               │  │
│  │     operator = "equals"                                   │  │
│  │     value = "vip"                                         │  │
│  │   }                                                       │  │
│  │ }                                                         │  │
│  │                                                           │  │
│  │ resource "bird_template" "welcome_email" {                │  │
│  │   name = "VIP Welcome"                                    │  │
│  │   channel = "email"                                       │  │
│  │   subject = "Welcome to VIP Program"                      │  │
│  │   body = file("templates/vip-welcome.html")              │  │
│  │   depends_on = [bird_audience.vip_customers]             │  │
│  │ }                                                         │  │
│  │                                                           │  │
│  │ resource "bird_campaign" "vip_sequence" {                 │  │
│  │   name = "VIP Onboarding Sequence"                        │  │
│  │   audience_id = bird_audience.vip_customers.id           │  │
│  │   template_ids = [bird_template.welcome_email.id]        │  │
│  │   schedule = { ... }                                      │  │
│  │   depends_on = [                                          │  │
│  │     bird_audience.vip_customers,                          │  │
│  │     bird_template.welcome_email                           │  │
│  │   ]                                                       │  │
│  │ }                                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ User reviews plan
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    terraform plan                                │
│                                                                  │
│  Terraform will perform the following actions:                  │
│                                                                  │
│  # bird_audience.vip_customers will be created                  │
│  + resource "bird_audience" "vip_customers" {                   │
│      + id       = (known after apply)                           │
│      + name     = "VIP Early Access"                            │
│      + criteria = {...}                                         │
│      + size     = (known after apply)                           │
│    }                                                            │
│                                                                  │
│  # bird_template.welcome_email will be created                  │
│  + resource "bird_template" "welcome_email" {                   │
│      + id      = (known after apply)                            │
│      + name    = "VIP Welcome"                                  │
│      + channel = "email"                                        │
│    }                                                            │
│                                                                  │
│  Plan: 3 to add, 0 to change, 0 to destroy.                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ User approves
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    terraform apply                               │
│                                                                  │
│  bird_audience.vip_customers: Creating...                       │
│  bird_audience.vip_customers: Creation complete [id=aud-123]    │
│  bird_template.welcome_email: Creating...                       │
│  bird_template.welcome_email: Creation complete [id=tpl-456]    │
│  bird_campaign.vip_sequence: Creating...                        │
│  bird_campaign.vip_sequence: Creation complete [id=cmp-789]     │
│                                                                  │
│  Apply complete! Resources: 3 added, 0 changed, 0 destroyed.    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Terraform calls Controlplane API
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              Bird Platform (Controlplane Resources)              │
│                                                                  │
│  - Creates audience segment                                     │
│  - Creates email template                                       │
│  - Creates campaign with dependencies                           │
│  - Tracks resource graph                                        │
│  - Manages state                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## How It Works

### 1. Agent Generates Terraform Config

Agent creates `.tf` files in session artifacts:

```
session-{id}/
├── artifacts/
│   ├── campaign-plan.md          # Human-readable plan
│   ├── terraform/
│   │   ├── main.tf               # Resource definitions
│   │   ├── variables.tf          # Configurable parameters
│   │   ├── outputs.tf            # Resource IDs after creation
│   │   ├── templates/
│   │   │   ├── vip-welcome.html  # Email templates
│   │   │   └── vip-followup.html
│   │   └── README.md             # Deployment instructions
```

### 2. Agent Prompt Instructions

```markdown
## Artifact Creation

When creating campaign artifacts, generate Terraform configuration files:

1. **Create main.tf** with resource definitions:
   ```hcl
   resource "bird_audience" "segment_name" {
     name = "Segment Name"
     description = "What this segment represents"
     criteria = {
       # Segment criteria
     }
   }
   ```

2. **Use dependency tracking**:
   ```hcl
   resource "bird_campaign" "campaign_name" {
     audience_id = bird_audience.segment_name.id
     depends_on = [bird_audience.segment_name]
   }
   ```

3. **Include deployment guide** in README.md:
   - Prerequisites
   - terraform init/plan/apply steps
   - Expected outputs
   - Validation steps

4. **Embed in artifact blocks** for UI rendering:
   ```html
   <artifact type="terraform-plan" id="vip-campaign" status="draft">
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
   </artifact>
   ```
```

### 3. UI Deployment Flow

**Frontend renders artifact card**:

```
┌─────────────────────────────────────────────────────────────┐
│ 📦 VIP Campaign Deployment                          [draft] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Creates audience, templates, and campaign sequence          │
│                                                              │
│ Resources:                                                   │
│ • bird_audience.vip_customers (1,200 contacts)              │
│ • bird_template.welcome_email                               │
│ • bird_template.followup_email                              │
│ • bird_campaign.vip_sequence (5 emails, 21 days)            │
│                                                              │
│ Expected Impact:                                             │
│ • Reach: 1,200 contacts                                     │
│ • Revenue: $15K-25K MRR                                     │
│                                                              │
│ [View Plan] [Download Files] [Deploy]                       │
└─────────────────────────────────────────────────────────────┘
```

**User clicks "View Plan"**:
- Shows `terraform plan` output
- Lists all resources to be created
- Shows dependencies
- Estimates impact

**User clicks "Deploy"**:
1. Backend runs `terraform apply` with workspace credentials
2. Streams progress to frontend
3. Shows resource creation status
4. Returns resource IDs
5. Updates artifact status to "deployed"

---

## Implementation Details

### Backend: Terraform Execution Service

```typescript
// src/services/terraform-executor.ts

interface TerraformPlan {
  sessionId: string;
  artifactId: string;
  workspaceId: string;
  configPath: string;  // Path to .tf files
}

interface TerraformApplyResult {
  success: boolean;
  resources: Array<{
    type: string;
    name: string;
    id: string;
    status: 'created' | 'updated' | 'failed';
  }>;
  outputs: Record<string, any>;
  errors?: string[];
}

class TerraformExecutor {
  async plan(options: TerraformPlan): Promise<string> {
    // 1. Set environment variables
    process.env.BIRD_WORKSPACE = options.workspaceId;
    process.env.BIRD_ACCESS_TOKEN = getWorkspaceToken(options.workspaceId);
    
    // 2. Run terraform init
    await exec('terraform init', { cwd: options.configPath });
    
    // 3. Run terraform plan
    const planOutput = await exec('terraform plan -no-color', { 
      cwd: options.configPath 
    });
    
    return planOutput;
  }
  
  async apply(options: TerraformPlan): Promise<TerraformApplyResult> {
    // 1. Run terraform apply with auto-approve
    const applyOutput = await exec('terraform apply -auto-approve -json', {
      cwd: options.configPath
    });
    
    // 2. Parse JSON output stream
    const resources = parseApplyOutput(applyOutput);
    
    // 3. Get outputs
    const outputs = await exec('terraform output -json', {
      cwd: options.configPath
    });
    
    return {
      success: true,
      resources,
      outputs: JSON.parse(outputs)
    };
  }
  
  async destroy(options: TerraformPlan): Promise<void> {
    // For cleanup/rollback
    await exec('terraform destroy -auto-approve', {
      cwd: options.configPath
    });
  }
}
```

### API Endpoints

```typescript
// POST /api/sessions/:sessionId/artifacts/:artifactId/plan
// Returns terraform plan output
router.post('/api/sessions/:sessionId/artifacts/:artifactId/plan', async (req, res) => {
  const { sessionId, artifactId } = req.params;
  const { workspaceId } = req.body;
  
  const configPath = `./sessions/${sessionId}/artifacts/terraform`;
  
  const plan = await terraformExecutor.plan({
    sessionId,
    artifactId,
    workspaceId,
    configPath
  });
  
  res.json({ plan });
});

// POST /api/sessions/:sessionId/artifacts/:artifactId/deploy
// Executes terraform apply
router.post('/api/sessions/:sessionId/artifacts/:artifactId/deploy', async (req, res) => {
  const { sessionId, artifactId } = req.params;
  const { workspaceId } = req.body;
  
  const configPath = `./sessions/${sessionId}/artifacts/terraform`;
  
  // Stream progress via SSE
  res.setHeader('Content-Type', 'text/event-stream');
  
  const result = await terraformExecutor.apply({
    sessionId,
    artifactId,
    workspaceId,
    configPath
  });
  
  // Update artifact status
  await updateArtifactStatus(sessionId, artifactId, 'deployed', result);
  
  res.write(`data: ${JSON.stringify(result)}\n\n`);
  res.end();
});
```

---

## Benefits

### 1. **Dependency Tracking Built-In**
Terraform automatically handles:
- Resource creation order
- Dependency resolution
- Circular dependency detection
- Parallel resource creation (where possible)

### 2. **Plan → Apply Workflow**
User can:
- Review what will be created
- Understand impact before deploying
- Approve or reject
- No surprises

### 3. **State Management**
Terraform tracks:
- What resources exist
- What changed
- Resource IDs and relationships
- Can update/destroy resources

### 4. **Idempotency**
- Running apply multiple times is safe
- Only creates what doesn't exist
- Updates what changed
- No duplicate resources

### 5. **Rollback Support**
- `terraform destroy` removes all resources
- Can target specific resources
- Clean cleanup on failure

### 6. **Reusable Infrastructure**
- Terraform provider already exists
- Controlplane Resources API already exists
- No new APIs to build
- Standard tooling

---

## Example: Agent-Generated Terraform

### Agent Output

```hcl
# main.tf - Generated by Marketing Agent

terraform {
  required_providers {
    bird = {
      source = "messagebird/bird"
      version = "~> 1.0"
    }
  }
}

provider "bird" {
  workspace = var.workspace_id
  # access_token from environment
}

# Audience: VIP Early Access
resource "bird_audience" "vip_early_access" {
  name = "VIP Early Access"
  description = "High-value customers for early product access"
  
  criteria = {
    rules = [
      {
        field = "customer_tier"
        operator = "equals"
        value = "vip"
      },
      {
        field = "engagement_score"
        operator = "greater_than"
        value = 75
      }
    ]
    logic = "AND"
  }
  
  tags = ["campaign:vip-launch", "agent:generated"]
}

# Email Template: Welcome
resource "bird_template" "vip_welcome" {
  name = "VIP Welcome Email"
  channel = "email"
  
  subject = "🎁 You're Invited: VIP Early Access"
  preview_text = "You're first in line for our newest features"
  
  body = templatefile("${path.module}/templates/vip-welcome.html", {
    cta_url = var.early_access_url
  })
  
  tags = ["campaign:vip-launch", "agent:generated"]
}

# Email Template: Follow-up
resource "bird_template" "vip_followup" {
  name = "VIP Follow-up Email"
  channel = "email"
  
  subject = "How's your VIP experience going?"
  preview_text = "We'd love your feedback"
  
  body = templatefile("${path.module}/templates/vip-followup.html", {
    feedback_url = var.feedback_url
  })
  
  tags = ["campaign:vip-launch", "agent:generated"]
}

# Campaign: VIP Sequence
resource "bird_campaign" "vip_sequence" {
  name = "VIP Early Access Sequence"
  type = "marketing"
  
  audience_id = bird_audience.vip_early_access.id
  
  messages = [
    {
      template_id = bird_template.vip_welcome.id
      delay_hours = 0  # Send immediately
    },
    {
      template_id = bird_template.vip_followup.id
      delay_hours = 72  # 3 days later
    }
  ]
  
  schedule = {
    start_date = var.launch_date
    timezone = "America/New_York"
  }
  
  ab_test = {
    enabled = true
    split_percent = 50
    metric = "click_rate"
    duration_hours = 24
  }
  
  holdout = {
    enabled = true
    percent = 5
  }
  
  tags = ["campaign:vip-launch", "agent:generated"]
  
  depends_on = [
    bird_audience.vip_early_access,
    bird_template.vip_welcome,
    bird_template.vip_followup
  ]
}

# Outputs
output "audience_id" {
  value = bird_audience.vip_early_access.id
  description = "ID of the VIP audience segment"
}

output "audience_size" {
  value = bird_audience.vip_early_access.size
  description = "Number of contacts in VIP segment"
}

output "campaign_id" {
  value = bird_campaign.vip_sequence.id
  description = "ID of the VIP campaign"
}

output "template_ids" {
  value = {
    welcome = bird_template.vip_welcome.id
    followup = bird_template.vip_followup.id
  }
  description = "IDs of email templates"
}
```

### variables.tf

```hcl
variable "workspace_id" {
  description = "Bird workspace ID"
  type = string
}

variable "launch_date" {
  description = "Campaign launch date (ISO 8601)"
  type = string
  default = "2024-12-12T10:00:00Z"
}

variable "early_access_url" {
  description = "URL for early access signup"
  type = string
  default = "https://bird.com/vip-early-access"
}

variable "feedback_url" {
  description = "URL for feedback form"
  type = string
  default = "https://bird.com/vip-feedback"
}
```

### README.md

```markdown
# VIP Early Access Campaign Deployment

## Overview
This Terraform configuration deploys a VIP early access campaign including:
- Audience segment (VIP customers with high engagement)
- Email templates (welcome + follow-up)
- Campaign sequence (2 emails, 3 days apart)
- A/B testing (50/50 split)
- Holdout group (5%)

## Prerequisites
- Terraform >= 1.0
- Bird workspace access token
- Bird Terraform provider installed

## Deployment Steps

### 1. Initialize Terraform
```bash
cd artifacts/terraform
terraform init
```

### 2. Review Plan
```bash
export BIRD_WORKSPACE="your-workspace-id"
export BIRD_ACCESS_TOKEN="your-access-token"

terraform plan
```

Expected output:
- 1 audience to create (VIP Early Access)
- 2 templates to create (welcome, follow-up)
- 1 campaign to create (VIP Sequence)

### 3. Deploy
```bash
terraform apply
```

Review the plan and type `yes` to confirm.

### 4. Verify
```bash
terraform output
```

Should show:
- audience_id
- audience_size (~1,200 contacts)
- campaign_id
- template_ids

## Expected Impact
- Reach: 1,200 VIP customers
- Expected open rate: 35%+
- Expected click rate: 10%+
- Estimated revenue: $15K-25K MRR

## Rollback
To remove all resources:
```bash
terraform destroy
```

## Monitoring
After deployment, monitor:
- Campaign delivery status
- Email open/click rates
- Feature activation metrics
```

---

## Integration with Project Context

### Project Metadata Tracks Deployments

```typescript
project.metadata = {
  // ... existing fields
  
  deployments: [
    {
      artifactId: 'vip-campaign',
      terraformState: '/sessions/{id}/artifacts/terraform/terraform.tfstate',
      deployedAt: '2024-12-08T10:00:00Z',
      deployedBy: 'user@example.com',
      resources: [
        { type: 'bird_audience', id: 'aud-123', name: 'vip_early_access' },
        { type: 'bird_template', id: 'tpl-456', name: 'vip_welcome' },
        { type: 'bird_campaign', id: 'cmp-789', name: 'vip_sequence' }
      ],
      status: 'active'
    }
  ]
}
```

### Agent Can Reference Deployed Resources

```markdown
## Session Context

Your previous session deployed:
- Audience: VIP Early Access (aud-123) - 1,245 contacts
- Campaign: VIP Sequence (cmp-789) - Active since Dec 12

Current performance:
- Open rate: 38% (target: 35%)
- Click rate: 12% (target: 10%)
- Status: ✅ Exceeding expectations

You can:
1. Create follow-up campaigns targeting clickers
2. Analyze non-openers for re-engagement
3. Expand to similar segments
```

---

## Next Steps

### Phase 1: Basic Terraform Generation
1. Agent generates simple .tf files
2. User manually runs terraform commands
3. Agent tracks deployment in project metadata

### Phase 2: Integrated Deployment
1. Backend terraform execution service
2. API endpoints for plan/apply
3. Frontend deployment UI

### Phase 3: Advanced Features
1. Terraform state management
2. Resource updates (not just creation)
3. Drift detection
4. Automated rollback on failure

---

## Open Questions

1. **Terraform binary**: Bundle with llmchain or require user installation?
2. **State storage**: Local files or remote backend (S3, etc.)?
3. **Credentials**: How to securely pass workspace tokens to terraform?
4. **Validation**: Should agent validate terraform syntax before generating?
5. **Versioning**: How to handle terraform provider version updates?
