# Agent Skills via Connectors System

## 🎯 Key Insight

**Agent skills can be distributed as assets through the existing connectors/dataflows marketplace infrastructure.**

Instead of building a separate plugin marketplace, we leverage:
- ✅ **Existing registry system** (`dataflows/registry`)
- ✅ **Proven distribution mechanism** (sources, destinations, enrichments)
- ✅ **Workspace-level registration** (already supports per-workspace components)
- ✅ **Versioning and metadata** (RegistryEntry)
- ✅ **Discovery API** (`GET /workspaces/:workspaceId/data-flows/registry`)

---

## 🏗️ Architecture: Skills as Dataflow Components

### Current Dataflow Components

```go
const (
    DataFlowComponentEnrichment     DataFlowComponent = "enrichment"
    DataFlowComponentSource         DataFlowComponent = "source"
    DataFlowComponentDestination    DataFlowComponent = "destination"
    DataFlowComponentTransformation DataFlowComponent = "transformation"
)
```

### Add New Component Type: **AgentSkill**

```go
const (
    // Existing...
    DataFlowComponentEnrichment     DataFlowComponent = "enrichment"
    DataFlowComponentSource         DataFlowComponent = "source"
    DataFlowComponentDestination    DataFlowComponent = "destination"
    DataFlowComponentTransformation DataFlowComponent = "transformation"
    
    // NEW: Agent skills
    DataFlowComponentAgentSkill     DataFlowComponent = "agentskill"
)
```

---

## 📦 Skill Definition Structure

### Go Type

```go
// SkillDefinition defines an agent skill
type SkillDefinition struct {
    Type           SkillType
    OrganizationID uuid.UUID
    WorkspaceID    uuid.UUID
    MRN            mrn.MRN
    
    RegistryEntry  RegistryEntry
    
    Extensions     map[string][]byte `json:"extensions,omitempty"`
}

// SkillType categorizes skills
type SkillType string

const (
    // Platform skills (Bird operations)
    SkillTypeBirdProjectContext      SkillType = "bird-project-context"
    SkillTypeBirdAudienceCreation    SkillType = "bird-audience-creation"
    SkillTypeBirdTemplateManagement  SkillType = "bird-template-management"
    SkillTypeBirdCampaignDeployment  SkillType = "bird-campaign-deployment"
    SkillTypeBirdDataQueries         SkillType = "bird-data-queries"
    SkillTypeBirdKnowledgebase       SkillType = "bird-knowledgebase"
    SkillTypeBirdSessionTracking     SkillType = "bird-session-tracking"
    SkillTypeBirdTerraformResources  SkillType = "bird-terraform-resources"
    SkillTypeBirdDashboardCreation   SkillType = "bird-dashboard-creation"
    SkillTypeBirdContactManagement   SkillType = "bird-contact-management"
    SkillTypeBirdFlowAutomation      SkillType = "bird-flow-automation"
    SkillTypeBirdPerformanceMetrics  SkillType = "bird-performance-metrics"
    
    // Marketing skills (vertical-specific)
    SkillTypeAudienceSegmentation    SkillType = "audience-segmentation"
    SkillTypeCampaignStrategy        SkillType = "campaign-strategy"
    SkillTypeEmailCopywriting        SkillType = "email-copywriting"
    SkillTypeCampaignTiming          SkillType = "campaign-timing"
    SkillTypePerformanceAnalysis     SkillType = "performance-analysis"
    SkillTypeABTesting               SkillType = "ab-testing"
    SkillTypeCustomerLifecycle       SkillType = "customer-lifecycle"
    SkillTypeBudgetPlanning          SkillType = "budget-planning"
    SkillTypeCompliancePrivacy       SkillType = "compliance-privacy"
    SkillTypeCampaignCalendar        SkillType = "campaign-calendar"
    
    // E-commerce skills
    SkillTypeProductRecommendations  SkillType = "product-recommendations"
    SkillTypeBrowseAbandonment       SkillType = "browse-abandonment"
    SkillTypeCartRecovery            SkillType = "cart-recovery"
    SkillTypePostPurchaseSequences   SkillType = "post-purchase-sequences"
    SkillTypeWinBackCampaigns        SkillType = "win-back-campaigns"
    SkillTypeReviewRequestAutomation SkillType = "review-request-automation"
    
    // SaaS skills
    SkillTypeTrialConversion         SkillType = "trial-conversion"
    SkillTypeFeatureAdoption         SkillType = "feature-adoption"
    SkillTypeUsageBasedCampaigns     SkillType = "usage-based-campaigns"
    SkillTypeUpgradePrompts          SkillType = "upgrade-prompts"
    SkillTypeChurnPrediction         SkillType = "churn-prediction"
    SkillTypeExpansionCampaigns      SkillType = "expansion-campaigns"
    
    // ABM skills
    SkillTypeAccountIdentification   SkillType = "account-identification"
    SkillTypeAccountIntelligence     SkillType = "account-intelligence"
    SkillTypeBuyingCommitteeMapping  SkillType = "buying-committee-mapping"
    SkillTypeAccountScoring          SkillType = "account-scoring"
    SkillTypeOrchestratedPlays       SkillType = "orchestrated-plays"
    SkillTypeAccountEngagementTracking SkillType = "account-engagement-tracking"
)
```

### RegistryEntry Extension

```go
// RegistryEntry already exists in connectors
type RegistryEntry struct {
    Name        string
    DisplayName string
    Description string
    Category    string
    IconURL     string
    Version     string
    Author      string
    Tags        []string
    
    // Spec defines the skill's interface
    Spec        SkillSpec
    
    // Documentation
    Documentation string
    Examples      []SkillExample
}

// SkillSpec defines the skill's interface
type SkillSpec struct {
    // What the skill does
    Purpose     string
    
    // Required inputs
    Inputs      []SkillInput
    
    // Expected outputs
    Outputs     []SkillOutput
    
    // Dependencies on other skills
    Dependencies []SkillDependency
    
    // Allowed MCP tools
    AllowedTools []string
    
    // Prompt template
    PromptTemplate string
}

// SkillInput defines an input parameter
type SkillInput struct {
    Name        string
    Type        string // "string", "object", "array"
    Description string
    Required    bool
    Default     interface{}
}

// SkillOutput defines an output
type SkillOutput struct {
    Name        string
    Type        string
    Description string
    Format      string // "markdown", "yaml", "json", "terraform"
}

// SkillDependency defines a dependency
type SkillDependency struct {
    SkillType   SkillType
    Version     string
    Optional    bool
}

// SkillExample provides usage examples
type SkillExample struct {
    Title       string
    Description string
    Input       map[string]interface{}
    Output      map[string]interface{}
}
```

---

## 🗂️ File Structure in Connectors

### Add Skills Registry

```
apps/connectors/dataflows/registry/
├── sources/           # Existing
├── destinations/      # Existing
├── enrichment/        # Existing
└── skills/            # NEW
    ├── platform/      # Platform skills
    │   ├── bird-project-context/
    │   │   ├── skill.go
    │   │   ├── spec.yml
    │   │   ├── prompt.md
    │   │   └── examples/
    │   │       ├── basic.yml
    │   │       └── advanced.yml
    │   ├── bird-audience-creation/
    │   │   ├── skill.go
    │   │   ├── spec.yml
    │   │   ├── prompt.md
    │   │   └── examples/
    │   └── ...
    ├── marketing/     # Marketing skills
    │   ├── audience-segmentation/
    │   │   ├── skill.go
    │   │   ├── spec.yml
    │   │   ├── prompt.md
    │   │   └── examples/
    │   ├── campaign-strategy/
    │   │   ├── skill.go
    │   │   ├── spec.yml
    │   │   ├── prompt.md
    │   │   └── examples/
    │   └── ...
    ├── ecommerce/     # E-commerce skills
    │   ├── cart-recovery/
    │   ├── product-recommendations/
    │   └── ...
    ├── saas/          # SaaS skills
    │   ├── trial-conversion/
    │   ├── feature-adoption/
    │   └── ...
    └── abm/           # ABM skills
        ├── account-identification/
        ├── orchestrated-plays/
        └── ...
```

### Example: Skill Implementation

```go
// apps/connectors/dataflows/registry/skills/platform/bird-project-context/skill.go
package birdprojectcontext

import (
    "context"
    "github.com/messagebird-dev/connectors/dataflows/types"
    "github.com/messagebird-dev/commonlib/uuid"
)

// Skill implements the bird-project-context skill
type Skill struct {
    organizationID uuid.UUID
    workspaceID    uuid.UUID
    definition     types.SkillDefinition
}

// NewSkillDefinition creates the skill definition
func NewSkillDefinition(organizationID, workspaceID uuid.UUID) types.SkillDefinition {
    return types.SkillDefinition{
        Type:           types.SkillTypeBirdProjectContext,
        OrganizationID: organizationID,
        WorkspaceID:    workspaceID,
        RegistryEntry: types.RegistryEntry{
            Name:        "bird-project-context",
            DisplayName: "Bird Project Context",
            Description: "Fetch Bird project metadata, foundation documents, and recent activity",
            Category:    "platform",
            IconURL:     "https://cdn.bird.com/icons/skills/project-context.svg",
            Version:     "1.0.0",
            Author:      "Bird",
            Tags:        []string{"platform", "context", "project"},
            Spec: types.SkillSpec{
                Purpose: "Gather project context to establish session baseline",
                Inputs: []types.SkillInput{
                    {
                        Name:        "projectId",
                        Type:        "string",
                        Description: "Bird project ID",
                        Required:    true,
                    },
                },
                Outputs: []types.SkillOutput{
                    {
                        Name:        "foundation",
                        Type:        "object",
                        Description: "Foundation document with business context",
                        Format:      "markdown",
                    },
                    {
                        Name:        "metadata",
                        Type:        "object",
                        Description: "Project metadata",
                        Format:      "json",
                    },
                    {
                        Name:        "recentActivity",
                        Type:        "array",
                        Description: "Recent session activity",
                        Format:      "json",
                    },
                },
                AllowedTools: []string{
                    "mcp__nest-api__invoke_operation",
                },
                PromptTemplate: loadPromptTemplate(),
            },
            Documentation: loadDocumentation(),
            Examples:      loadExamples(),
        },
    }
}

func loadPromptTemplate() string {
    // Load from prompt.md
    return `...`
}

func loadDocumentation() string {
    // Load from README.md
    return `...`
}

func loadExamples() []types.SkillExample {
    // Load from examples/*.yml
    return []types.SkillExample{...}
}
```

---

## 🔌 Integration with llmchain

### 1. Skills Service in llmchain

```typescript
// apps/llmchain/src/services/skills.ts

import { BirdAPIClient } from './bird-api';

export interface Skill {
  type: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  version: string;
  spec: SkillSpec;
  promptTemplate: string;
  documentation: string;
  examples: SkillExample[];
}

export interface SkillSpec {
  purpose: string;
  inputs: SkillInput[];
  outputs: SkillOutput[];
  dependencies: SkillDependency[];
  allowedTools: string[];
  promptTemplate: string;
}

export class SkillsService {
  constructor(private birdAPI: BirdAPIClient) {}
  
  /**
   * Get all available skills for a workspace
   */
  async getAvailableSkills(workspaceId: string): Promise<Skill[]> {
    // Call connectors registry API
    const registry = await this.birdAPI.get(
      `/workspaces/${workspaceId}/data-flows/registry`
    );
    
    // Extract skills from registry
    return registry.skills || [];
  }
  
  /**
   * Get skills for a specific project
   */
  async getProjectSkills(projectId: string): Promise<Skill[]> {
    // Get project metadata to determine which skills are enabled
    const project = await this.birdAPI.invoke('tasks:getProject', {
      pathParams: { projectId }
    });
    
    // Get enabled skill types from project metadata
    const enabledSkills = project.metadata?.enabledSkills || [];
    
    // Fetch skill definitions
    const allSkills = await this.getAvailableSkills(project.workspaceId);
    
    // Filter to enabled skills
    return allSkills.filter(skill => 
      enabledSkills.includes(skill.type)
    );
  }
  
  /**
   * Register a skill for a workspace
   */
  async registerSkill(workspaceId: string, skillType: string): Promise<void> {
    await this.birdAPI.post(
      `/workspaces/${workspaceId}/data-flows/registry/skills`,
      { skillType }
    );
  }
  
  /**
   * Get skill prompt template
   */
  async getSkillPrompt(skillType: string): Promise<string> {
    const skills = await this.getAvailableSkills(this.workspaceId);
    const skill = skills.find(s => s.type === skillType);
    return skill?.promptTemplate || '';
  }
  
  /**
   * Compose agent prompt with skills
   */
  async composeAgentPrompt(
    agentRole: string,
    projectId: string
  ): Promise<string> {
    // Get agent definition
    const agent = await this.getAgentDefinition(agentRole);
    
    // Get skills for this agent
    const skills = await this.getProjectSkills(projectId);
    const agentSkills = skills.filter(skill =>
      agent.skills.includes(skill.type)
    );
    
    // Compose prompt
    return `
${agent.systemPrompt}

## Available Skills

${agentSkills.map(skill => `
### ${skill.displayName}

${skill.description}

**Purpose**: ${skill.spec.purpose}

**Usage**:
${skill.promptTemplate}

**Inputs**:
${skill.spec.inputs.map(i => `- ${i.name}: ${i.description}`).join('\n')}

**Outputs**:
${skill.spec.outputs.map(o => `- ${o.name}: ${o.description}`).join('\n')}

**Allowed Tools**: ${skill.spec.allowedTools.join(', ')}

**Examples**:
${skill.examples.map(ex => `
#### ${ex.title}
${ex.description}
\`\`\`yaml
${JSON.stringify(ex.input, null, 2)}
\`\`\`
`).join('\n')}
`).join('\n\n')}
`;
  }
}
```

### 2. Project Skill Management

```typescript
// apps/llmchain/src/services/project-skills.ts

export class ProjectSkillsService {
  /**
   * Enable skills for a project
   */
  async enableSkills(
    projectId: string,
    skillTypes: string[]
  ): Promise<void> {
    // Update project metadata
    await this.birdAPI.invoke('tasks:updateProject', {
      pathParams: { projectId },
      body: {
        metadata: {
          enabledSkills: skillTypes
        }
      }
    });
  }
  
  /**
   * Auto-detect and enable skills based on project type
   */
  async autoEnableSkills(projectId: string): Promise<string[]> {
    const project = await this.getProject(projectId);
    const foundation = await this.getFoundation(projectId);
    
    // Detect vertical from foundation
    const vertical = this.detectVertical(foundation);
    
    // Get recommended skills for vertical
    const recommendedSkills = this.getRecommendedSkills(vertical);
    
    // Enable skills
    await this.enableSkills(projectId, recommendedSkills);
    
    return recommendedSkills;
  }
  
  private detectVertical(foundation: any): string {
    // Analyze foundation to detect vertical
    // B2B, B2C, E-commerce, SaaS, etc.
    
    const content = foundation.content.toLowerCase();
    
    if (content.includes('saas') || content.includes('software as a service')) {
      return 'saas';
    }
    if (content.includes('ecommerce') || content.includes('e-commerce') || content.includes('online store')) {
      return 'ecommerce';
    }
    if (content.includes('b2b') || content.includes('enterprise')) {
      return 'b2b';
    }
    if (content.includes('retail') || content.includes('fashion')) {
      return 'retail';
    }
    
    return 'b2c'; // default
  }
  
  private getRecommendedSkills(vertical: string): string[] {
    const baseSkills = [
      // Platform skills (always enabled)
      'bird-project-context',
      'bird-audience-creation',
      'bird-template-management',
      'bird-campaign-deployment',
      'bird-data-queries',
      'bird-knowledgebase',
      'bird-session-tracking',
      'bird-terraform-resources',
      'bird-dashboard-creation',
      'bird-performance-metrics',
      
      // Core marketing skills
      'audience-segmentation',
      'campaign-strategy',
      'email-copywriting',
      'campaign-timing',
      'performance-analysis',
      'ab-testing',
      'customer-lifecycle',
    ];
    
    const verticalSkills: Record<string, string[]> = {
      ecommerce: [
        'product-recommendations',
        'browse-abandonment',
        'cart-recovery',
        'post-purchase-sequences',
        'win-back-campaigns',
        'review-request-automation',
      ],
      saas: [
        'trial-conversion',
        'feature-adoption',
        'usage-based-campaigns',
        'upgrade-prompts',
        'churn-prediction',
        'expansion-campaigns',
      ],
      b2b: [
        'lead-scoring',
        'account-based-marketing',
        'sales-pipeline-integration',
        'multi-touch-attribution',
        'content-syndication',
      ],
      abm: [
        'account-identification',
        'account-intelligence',
        'buying-committee-mapping',
        'account-scoring',
        'orchestrated-plays',
        'account-engagement-tracking',
      ],
    };
    
    return [
      ...baseSkills,
      ...(verticalSkills[vertical] || [])
    ];
  }
}
```

---

## 🎨 User Experience: Skill Marketplace

### 1. Project Setup: Skill Selection

```
┌─────────────────────────────────────────────────────────────┐
│  Create New Project                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Project Name: Fashion Retailer Marketing                    │
│                                                              │
│  Business Type:                                              │
│  ⚪ B2B        ⚪ B2C        ⚫ E-commerce    ⚪ SaaS         │
│                                                              │
│  Industry:                                                   │
│  ⚫ Retail     ⚪ Finance    ⚪ Healthcare   ⚪ Travel        │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  📦 Recommended Skills (18 selected)                         │
│                                                              │
│  ✅ Platform Skills (12)                                     │
│  ✅ Marketing Skills (10)                                    │
│  ✅ E-commerce Skills (6)                                    │
│  ✅ Retail Skills (4)                                        │
│                                                              │
│  [Customize Skills]  [Create Project]                       │
└─────────────────────────────────────────────────────────────┘
```

### 2. Skill Customization

```
┌─────────────────────────────────────────────────────────────┐
│  Customize Skills                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 Search skills...                                         │
│                                                              │
│  Filter: ☑ Platform  ☑ Marketing  ☑ E-commerce  ☐ SaaS     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ bird-project-context                    Platform │  │
│  │  Fetch project metadata and foundation documents     │  │
│  │  Required • Always enabled                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ cart-recovery                         E-commerce │  │
│  │  Recover abandoned carts with personalized campaigns │  │
│  │  Recommended for E-commerce                           │  │
│  │  [View Details]  [Disable]                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ☐ trial-conversion                              SaaS│  │
│  │  Convert trial users to paid customers               │  │
│  │  Not recommended for your vertical                    │  │
│  │  [View Details]  [Enable]                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  18 skills selected                                          │
│                                                              │
│  [Cancel]  [Save]                                            │
└─────────────────────────────────────────────────────────────┘
```

### 3. Skill Detail View

```
┌─────────────────────────────────────────────────────────────┐
│  cart-recovery                                    E-commerce │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📝 Description                                              │
│  Recover abandoned carts with personalized campaigns that   │
│  remind customers of items left behind and incentivize      │
│  completion.                                                 │
│                                                              │
│  🎯 Purpose                                                  │
│  Create automated cart abandonment campaigns with product   │
│  recommendations and dynamic incentives.                     │
│                                                              │
│  📥 Inputs                                                   │
│  • abandonmentWindow: Time window for cart abandonment      │
│  • incentiveStrategy: Discount, free shipping, or urgency   │
│  • productData: Product catalog for recommendations         │
│                                                              │
│  📤 Outputs                                                  │
│  • audience.tf: Terraform config for abandoned cart segment │
│  • template.tf: Email template with cart items              │
│  • campaign.tf: Automated campaign configuration            │
│                                                              │
│  🔗 Dependencies                                             │
│  • bird-audience-creation (required)                         │
│  • bird-template-management (required)                       │
│  • product-recommendations (optional)                        │
│                                                              │
│  🛠️ Allowed Tools                                            │
│  • mcp__nest-api__invoke_operation                           │
│  • mcp__nest-api__batch_invoke                               │
│                                                              │
│  📊 Usage                                                    │
│  • 234 projects using this skill                            │
│  • Average recovery rate: 8.2%                              │
│  • Last updated: 3 days ago                                 │
│                                                              │
│  [View Examples]  [View Documentation]  [Enable]            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Workflow: Skill Distribution

### 1. Skill Development

```bash
# Developer creates new skill
cd apps/connectors/dataflows/registry/skills/ecommerce/

# Create skill directory
mkdir cart-recovery
cd cart-recovery

# Create skill files
touch skill.go spec.yml prompt.md README.md
mkdir examples
touch examples/basic.yml examples/advanced.yml

# Implement skill
# - skill.go: Go implementation
# - spec.yml: Skill specification
# - prompt.md: Agent prompt template
# - README.md: Documentation
# - examples/*.yml: Usage examples

# Test skill
go test ./...

# Register skill in factory
# apps/connectors/dataflows/registry/skills.go
```

### 2. Skill Registration

```go
// apps/connectors/dataflows/registry/skills.go

func staticSkills(organizationID, workspaceID uuid.UUID) []types.SkillDefinition {
    return []types.SkillDefinition{
        // Platform skills
        birdprojectcontext.NewSkillDefinition(organizationID, workspaceID),
        birdaudiencecreation.NewSkillDefinition(organizationID, workspaceID),
        // ... more platform skills
        
        // Marketing skills
        audiencesegmentation.NewSkillDefinition(organizationID, workspaceID),
        campaignstrategy.NewSkillDefinition(organizationID, workspaceID),
        // ... more marketing skills
        
        // E-commerce skills
        cartrecovery.NewSkillDefinition(organizationID, workspaceID),
        productrecommendations.NewSkillDefinition(organizationID, workspaceID),
        // ... more e-commerce skills
    }
}
```

### 3. Skill Discovery (API)

```bash
# Get all available skills for workspace
GET /workspaces/:workspaceId/data-flows/registry

Response:
{
  "sources": [...],
  "destinations": [...],
  "enrichments": [...],
  "skills": [
    {
      "type": "cart-recovery",
      "name": "cart-recovery",
      "displayName": "Cart Recovery",
      "description": "Recover abandoned carts...",
      "category": "ecommerce",
      "version": "1.0.0",
      "spec": {
        "purpose": "Create automated cart abandonment campaigns",
        "inputs": [...],
        "outputs": [...],
        "dependencies": [...],
        "allowedTools": [...]
      },
      "promptTemplate": "...",
      "documentation": "...",
      "examples": [...]
    },
    ...
  ]
}
```

### 4. Skill Enablement (API)

```bash
# Enable skills for a project
POST /workspaces/:workspaceId/projects/:projectId/skills

Request:
{
  "skills": [
    "bird-project-context",
    "bird-audience-creation",
    "cart-recovery",
    "product-recommendations"
  ]
}

Response:
{
  "projectId": "proj-123",
  "enabledSkills": [
    "bird-project-context",
    "bird-audience-creation",
    "cart-recovery",
    "product-recommendations"
  ],
  "dependencies": [
    "bird-template-management",
    "bird-campaign-deployment"
  ]
}
```

---

## 🎯 Benefits of Connectors Integration

### ✅ Reuse Existing Infrastructure
- No need to build separate marketplace
- Leverage proven registry system
- Use existing API endpoints
- Workspace-level isolation already built

### ✅ Consistent Distribution
- Same mechanism for all components
- Familiar to developers
- Versioning built-in
- Metadata management included

### ✅ Workspace Isolation
- Skills registered per workspace
- Custom skills possible
- Organization-level sharing
- Access control built-in

### ✅ Extensibility
- Easy to add new skill categories
- Third-party skills possible
- Skill marketplace ready
- Community contributions enabled

### ✅ Developer Experience
- Familiar Go patterns
- Type-safe definitions
- Testing infrastructure
- CI/CD integration

---

## 📋 Implementation Checklist

### Phase 1: Core Infrastructure (Week 1)
- [ ] Add `DataFlowComponentAgentSkill` type
- [ ] Create `SkillDefinition` struct
- [ ] Add skills registry in `dataflows/registry/skills/`
- [ ] Update registry service to include skills
- [ ] Add skills to registry API response

### Phase 2: Platform Skills (Week 2)
- [ ] Implement 12 platform skills
- [ ] Create skill specs (spec.yml)
- [ ] Write prompt templates (prompt.md)
- [ ] Add documentation (README.md)
- [ ] Create examples (examples/*.yml)

### Phase 3: Marketing Skills (Week 3)
- [ ] Implement 10 marketing skills
- [ ] Create skill specs
- [ ] Write prompt templates
- [ ] Add documentation
- [ ] Create examples

### Phase 4: Vertical Skills (Week 4)
- [ ] Implement e-commerce skills (6)
- [ ] Implement SaaS skills (6)
- [ ] Implement ABM skills (6)
- [ ] Create skill specs
- [ ] Write prompt templates

### Phase 5: llmchain Integration (Week 5)
- [ ] Create SkillsService in llmchain
- [ ] Implement skill discovery
- [ ] Implement project skill management
- [ ] Create agent prompt composition
- [ ] Add skill enablement API

### Phase 6: UI (Week 6)
- [ ] Skill marketplace UI
- [ ] Project skill selection
- [ ] Skill detail views
- [ ] Skill enablement flow
- [ ] Skill recommendations

---

## 🚀 Next Steps

1. **Review approach** - Does leveraging connectors make sense?
2. **Define skill schema** - Finalize `SkillDefinition` structure
3. **Start with platform skills** - Implement core 12 skills
4. **Build llmchain integration** - Connect to registry API
5. **Create UI** - Skill marketplace and selection

**Key Questions**:
1. Should skills be workspace-level or organization-level?
2. Do we want to support third-party skill contributions?
3. Should skills be versioned independently?
4. How do we handle skill dependencies and conflicts?
