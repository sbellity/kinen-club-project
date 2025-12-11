# Skill Specifications

> Modular capabilities bundled in Docker image, dynamically loaded by agent harness

---

## 📦 Skill Categories

### Platform Skills (12)
Bird platform operations - reusable across all verticals

### Marketing Skills (10)
Marketing expertise - cross-vertical capabilities

### Vertical Skills (18+)
Industry-specific - E-commerce, SaaS, ABM, Retail, etc.

---

## 🔧 Skill Structure

Every skill includes:

```
skill-name/
├── skill.yml         # Declarative skill definition (YAML)
├── prompt.md         # Agent prompt template
├── README.md         # Documentation
└── examples/         # Usage examples
    ├── basic.yml
    └── advanced.yml
```

**Note**: Skills follow the same declarative YAML pattern as connector templates (`apps/connector-templates`)

---

## 📋 Skill Specification Format

```yaml
# skill.yml
slug: cart-recovery
name: Cart Recovery
displayName: Cart Recovery
category: ecommerce
version: 1.0.0
author: Bird
tags: [ecommerce, cart, abandonment, recovery]

purpose: |
  Create automated cart abandonment campaigns with product
  recommendations and dynamic incentives.

inputs:
  - name: abandonmentWindow
    type: string
    description: Time window for cart abandonment (e.g., "24h")
    required: true
    default: "24h"
  
  - name: incentiveStrategy
    type: string
    description: Discount, free shipping, or urgency
    required: false
    enum: [discount, free_shipping, urgency, none]

outputs:
  - name: audience.tf
    type: file
    description: Terraform config for abandoned cart segment
    format: terraform
  
  - name: template.tf
    type: file
    description: Email template with cart items
    format: terraform
  
  - name: campaign.tf
    type: file
    description: Automated campaign configuration
    format: terraform

dependencies:
  - skill: bird-audience-creation
    version: ^1.0.0
    required: true
  
  - skill: bird-template-management
    version: ^1.0.0
    required: true
  
  - skill: product-recommendations
    version: ^1.0.0
    required: false

allowedTools:
  - mcp__nest-api__invoke_operation
  - mcp__nest-api__batch_invoke

promptTemplate: |
  # Cart Recovery Skill
  
  Create an abandoned cart recovery campaign.
  
  ## Inputs
  - Abandonment window: {{abandonmentWindow}}
  - Incentive strategy: {{incentiveStrategy}}
  
  ## Steps
  1. Create audience segment for abandoned carts
  2. Design email template with cart items
  3. Add product recommendations
  4. Configure automated campaign
  5. Generate Terraform configs
  
  ## Output Format
  Generate three Terraform files:
  - audience.tf
  - template.tf
  - campaign.tf

examples:
  - title: Basic Cart Recovery
    description: Simple 24h cart abandonment campaign
    input:
      abandonmentWindow: "24h"
      incentiveStrategy: "none"
  
  - title: Cart Recovery with Discount
    description: Cart abandonment with 10% discount incentive
    input:
      abandonmentWindow: "24h"
      incentiveStrategy: "discount"
```

---

## 📦 Platform Skills (12)

### bird-project-context
**Purpose**: Fetch project metadata, foundation documents, and recent activity  
**Category**: Platform  
**Outputs**: foundation.md, metadata.json, recentActivity.json

### bird-audience-creation
**Purpose**: Create audience segments using segmentBuilder API  
**Category**: Platform  
**Outputs**: audience.tf

### bird-template-management
**Purpose**: Create and manage email/SMS templates  
**Category**: Platform  
**Outputs**: template.tf

### bird-campaign-deployment
**Purpose**: Deploy campaigns with scheduling and targeting  
**Category**: Platform  
**Outputs**: campaign.tf

### bird-data-queries
**Purpose**: Query DataHub using Malloy for analytics  
**Category**: Platform  
**Outputs**: query results (JSON/CSV)

### bird-knowledgebase
**Purpose**: Store and retrieve documents in Knowledgebase  
**Category**: Platform  
**Outputs**: document URLs

### bird-session-tracking
**Purpose**: Track agent sessions using Tasks API  
**Category**: Platform  
**Outputs**: task updates

### bird-terraform-resources
**Purpose**: Generate Terraform configurations  
**Category**: Platform  
**Outputs**: *.tf files

### bird-dashboard-creation
**Purpose**: Create dashboard.yaml with Malloy queries  
**Category**: Platform  
**Outputs**: dashboard.yaml

### bird-contact-management
**Purpose**: Query and manage contacts  
**Category**: Platform  
**Outputs**: contact data (JSON)

### bird-flow-automation
**Purpose**: Create automated workflows using Flows  
**Category**: Platform  
**Outputs**: flows.tf

### bird-performance-metrics
**Purpose**: Fetch campaign performance metrics  
**Category**: Platform  
**Outputs**: metrics.json

---

## 🎯 Marketing Skills (10)

### audience-segmentation
**Purpose**: Design audience segmentation strategies  
**Category**: Marketing  
**Outputs**: audience-specs.yaml, segmentation-logic.md

### campaign-strategy
**Purpose**: Develop campaign strategies using frameworks  
**Category**: Marketing  
**Outputs**: strategic-brief.md

### email-copywriting
**Purpose**: Write email subject lines, body copy, and CTAs  
**Category**: Marketing  
**Outputs**: copy-variants.md

### campaign-timing
**Purpose**: Optimize send times based on data  
**Category**: Marketing  
**Outputs**: timing-recommendations.yaml

### performance-analysis
**Purpose**: Analyze campaign performance and trends  
**Category**: Marketing  
**Outputs**: performance-report.md

### ab-testing
**Purpose**: Design and analyze A/B tests  
**Category**: Marketing  
**Outputs**: ab-test-results.yaml

### customer-lifecycle
**Purpose**: Map customer lifecycle stages  
**Category**: Marketing  
**Outputs**: lifecycle-map.yaml

### budget-planning
**Purpose**: Plan campaign budgets and ROI  
**Category**: Marketing  
**Outputs**: budget-plan.yaml

### compliance-privacy
**Purpose**: Ensure compliance with regulations  
**Category**: Marketing  
**Outputs**: compliance-checklist.md

### campaign-calendar
**Purpose**: Manage campaign calendar and coordination  
**Category**: Marketing  
**Outputs**: campaign-calendar.yaml

---

## 🛒 E-commerce Skills (6)

### product-recommendations
**Purpose**: AI-powered product suggestions  
**Category**: E-commerce  
**Outputs**: recommendations.json

### browse-abandonment
**Purpose**: Recover browsing sessions  
**Category**: E-commerce  
**Outputs**: audience.tf, template.tf, campaign.tf

### cart-recovery
**Purpose**: Abandoned cart campaigns  
**Category**: E-commerce  
**Outputs**: audience.tf, template.tf, campaign.tf

### post-purchase-sequences
**Purpose**: Order confirmation and upsells  
**Category**: E-commerce  
**Outputs**: flows.tf

### win-back-campaigns
**Purpose**: Re-engage dormant customers  
**Category**: E-commerce  
**Outputs**: audience.tf, template.tf, campaign.tf

### review-request-automation
**Purpose**: Automated review requests  
**Category**: E-commerce  
**Outputs**: flows.tf

---

## 💼 SaaS Skills (6)

### trial-conversion
**Purpose**: Convert trial users to paid  
**Category**: SaaS  
**Outputs**: flows.tf

### feature-adoption
**Purpose**: Drive feature usage  
**Category**: SaaS  
**Outputs**: audience.tf, template.tf, campaign.tf

### usage-based-campaigns
**Purpose**: Campaigns based on product usage  
**Category**: SaaS  
**Outputs**: audience.tf, template.tf, campaign.tf

### upgrade-prompts
**Purpose**: Encourage plan upgrades  
**Category**: SaaS  
**Outputs**: flows.tf

### churn-prediction
**Purpose**: Identify at-risk customers  
**Category**: SaaS  
**Outputs**: audience.tf, churn-score.json

### expansion-campaigns
**Purpose**: Upsell and cross-sell  
**Category**: SaaS  
**Outputs**: audience.tf, template.tf, campaign.tf

---

## 🎯 ABM Skills (6)

### account-identification
**Purpose**: Identify target accounts  
**Category**: ABM  
**Outputs**: accounts.json

### account-intelligence
**Purpose**: Research account context  
**Category**: ABM  
**Outputs**: account-profiles.json

### buying-committee-mapping
**Purpose**: Map decision-makers  
**Category**: ABM  
**Outputs**: committee-map.yaml

### account-scoring
**Purpose**: Score account engagement  
**Category**: ABM  
**Outputs**: account-scores.json

### orchestrated-plays
**Purpose**: Multi-touch ABM campaigns  
**Category**: ABM  
**Outputs**: flows.tf

### account-engagement-tracking
**Purpose**: Track account-level engagement  
**Category**: ABM  
**Outputs**: dashboard.yaml

---

## 🔨 Skill Development

### 1. Create Skill Structure

```bash
cd apps/connectors/dataflows/registry/skills/ecommerce
mkdir cart-recovery
cd cart-recovery
touch skill.go spec.yml prompt.md README.md
mkdir examples
touch examples/basic.yml examples/advanced.yml
```

### 2. Implement skill.go

```go
package cartrecovery

import (
    "github.com/messagebird-dev/connectors/dataflows/types"
    "github.com/messagebird-dev/commonlib/uuid"
)

type Skill struct {
    organizationID uuid.UUID
    workspaceID    uuid.UUID
    definition     types.SkillDefinition
}

func NewSkillDefinition(organizationID, workspaceID uuid.UUID) types.SkillDefinition {
    return types.SkillDefinition{
        Type:           types.SkillTypeCartRecovery,
        OrganizationID: organizationID,
        WorkspaceID:    workspaceID,
        RegistryEntry: types.RegistryEntry{
            Name:        "cart-recovery",
            DisplayName: "Cart Recovery",
            Description: "Recover abandoned carts...",
            Category:    "ecommerce",
            Version:     "1.0.0",
            Spec:        loadSpec(),
            PromptTemplate: loadPromptTemplate(),
            Examples:    loadExamples(),
        },
    }
}
```

### 3. Write spec.yml

See format above

### 4. Write prompt.md

```markdown
# Cart Recovery Skill

Create an abandoned cart recovery campaign.

## Context
You have access to:
- Customer data via bird-contact-management
- Product catalog
- Cart abandonment events

## Steps
1. **Create Audience**: Use bird-audience-creation to segment users who abandoned carts
2. **Design Template**: Use bird-template-management to create email with cart items
3. **Add Recommendations**: Use product-recommendations for additional products
4. **Configure Campaign**: Use bird-campaign-deployment for automation
5. **Generate Terraform**: Use bird-terraform-resources for deployment

## Output Format
Generate three Terraform files...
```

### 5. Test Skill

```go
func TestCartRecoverySkill(t *testing.T) {
    skill := NewSkillDefinition(orgID, workspaceID)
    assert.Equal(t, "cart-recovery", skill.RegistryEntry.Name)
    assert.NotEmpty(t, skill.RegistryEntry.Spec.PromptTemplate)
}
```

### 6. Register Skill

```go
// apps/connectors/dataflows/registry/skills.go
func staticSkills(organizationID, workspaceID uuid.UUID) []types.SkillDefinition {
    return []types.SkillDefinition{
        // ... existing skills
        cartrecovery.NewSkillDefinition(organizationID, workspaceID),
    }
}
```

---

## 📊 Skill Composition

Skills can depend on other skills:

```yaml
# cart-recovery depends on:
dependencies:
  - bird-audience-creation  # Required
  - bird-template-management # Required
  - product-recommendations  # Optional

# When agent uses cart-recovery:
# 1. System ensures dependencies are available
# 2. Agent prompt includes all dependent skill prompts
# 3. Agent can call dependent skills
```

---

## 🎯 Best Practices

### 1. Single Responsibility
Each skill should do ONE thing well

### 2. Clear Inputs/Outputs
Specify exactly what the skill needs and produces

### 3. Composability
Design skills to work with other skills

### 4. Documentation
Include examples and clear explanations

### 5. Versioning
Use semantic versioning for breaking changes

---

## 📦 Distribution

Skills are bundled directly in the `llmchain` Docker image:

- **Bundled**: All skills included in Docker image at build time
- **Location**: `/app/skills/` directory (platform, marketing, verticals)
- **Discovery**: Skills loader scans directory on startup
- **Selection**: Agent harness loads skills based on project config
- **Updates**: New Docker image version = new skills version

**See**: [`DISTRIBUTION-STRATEGY.md`](./DISTRIBUTION-STRATEGY.md) for detailed approach

---

## Next Steps

1. **Review skill specs** - Validate format and structure
2. **Implement platform skills** - Start with bird-project-context
3. **Test skill composition** - Verify dependencies work
4. **Add vertical skills** - E-commerce, SaaS, ABM
5. **Create marketplace UI** - Skill discovery and selection
