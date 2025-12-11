# Marketing Agent System - Architecture

> Complete system architecture specification

---

## 🎯 Overview

A **multi-agent marketing system** where 7 specialized AI agents collaborate to plan, execute, and optimize marketing campaigns. Skills are distributed via the existing connectors marketplace, enabling modular, vertical-specific capabilities.

---

## 🏗️ Three-Layer Architecture

### Layer 1: Agents (7 Specialized Roles)

Multi-agent team modeling a real marketing organization:

| Agent | Phase | Key Deliverables |
|-------|-------|------------------|
| **Research Analyst** | Ideation | foundation.md, data-model.md, events-catalog.md, baseline-metrics.yaml |
| **Strategist** | Ideation → Planning | strategic-brief.md, brand-guidelines.md, campaign-roadmap.md |
| **Audience Architect** | Planning | audience-specs.yaml, audience.tf |
| **Creative Director** | Planning → Implementation | content-brief.md, copy-variants.md, template.tf |
| **Campaign Engineer** | Implementation | campaign.tf, flows.tf, deployment-plan.md |
| **Performance Analyst** | Operation → Learning | dashboard.yaml, performance-report.md, optimization-recommendations.md |
| **Project Coordinator** | All Phases | project-status.md, session-log.md, learnings.md |

**See**: [`agents/README.md`](./agents/README.md) for detailed specifications

---

### Layer 2: Skills (40+ Modular Capabilities)

Skills distributed via **existing connectors marketplace** (`apps/connectors`):

#### Platform Skills (12) - Bird Operations
```
bird-project-context          bird-audience-creation
bird-template-management      bird-campaign-deployment
bird-data-queries             bird-knowledgebase
bird-session-tracking         bird-terraform-resources
bird-dashboard-creation       bird-contact-management
bird-flow-automation          bird-performance-metrics
```

#### Marketing Skills (10) - Marketing Expertise
```
audience-segmentation         campaign-strategy
email-copywriting             campaign-timing
performance-analysis          ab-testing
customer-lifecycle            budget-planning
compliance-privacy            campaign-calendar
```

#### Vertical Skills (18+) - Industry-Specific

**E-commerce (6)**:
```
product-recommendations       browse-abandonment
cart-recovery                 post-purchase-sequences
win-back-campaigns            review-request-automation
```

**SaaS (6)**:
```
trial-conversion              feature-adoption
usage-based-campaigns         upgrade-prompts
churn-prediction              expansion-campaigns
```

**ABM (6)**:
```
account-identification        account-intelligence
buying-committee-mapping      account-scoring
orchestrated-plays            account-engagement-tracking
```

**See**: [`skills/README.md`](./skills/README.md) for detailed specifications

---

### Layer 3: Infrastructure

- **Bird Platform APIs** - Via MCP (Model Context Protocol)
- **Connectors Registry** - Skill distribution (`apps/connectors/dataflows/registry/skills/`)
- **S3 Storage** - Artifacts, checkpoints, Terraform state
- **ACP Protocol** - Agent communication (Agent Client Protocol)

**See**: [`implementation/connectors-integration.md`](./implementation/connectors-integration.md)

---

## 🔄 Project Lifecycle

### Phase 1: Ideation (Week 1)
**Goal**: Discover context and define strategy

```
Research Analyst
  ├─ Discover workspace data model
  ├─ Identify events and metrics
  ├─ Research business context
  └─ Calculate baseline performance
  → Deliverables: foundation.md, data-model.md, baseline-metrics.yaml

Strategist
  ├─ Analyze foundation
  ├─ Apply frameworks (5S, AIDA, etc.)
  ├─ Define priorities and KPIs
  └─ Create campaign roadmap
  → Deliverables: strategic-brief.md, brand-guidelines.md, campaign-roadmap.md

Project Coordinator
  └─ Present to human for approval
```

### Phase 2: Design / Planning (Week 2)
**Goal**: Design audiences and content

```
Audience Architect
  ├─ Translate strategy to criteria
  ├─ Design segmentation logic
  ├─ Estimate audience sizes
  └─ Generate Terraform configs
  → Deliverables: audience-specs.yaml, audience.tf

Creative Director
  ├─ Develop content strategy
  ├─ Write copy variants
  ├─ Design A/B tests
  └─ Create templates
  → Deliverables: content-brief.md, template.tf

Project Coordinator
  └─ Review for quality and brand compliance
```

### Phase 3: Implementation (Week 2-3)
**Goal**: Assemble and prepare deployment

```
Campaign Engineer
  ├─ Combine audiences + templates
  ├─ Configure campaign settings
  ├─ Set up flows/journeys
  └─ Generate complete Terraform
  → Deliverables: campaign.tf, flows.tf, deployment-plan.md

Project Coordinator
  ├─ Final review and validation
  └─ Present to human for approval
```

### Phase 4: Operation (Week 3-6)
**Goal**: Deploy and monitor

```
Campaign Engineer
  └─ Deploy (terraform apply)

Performance Analyst
  ├─ Create live dashboard
  ├─ Monitor metrics
  ├─ Analyze A/B tests
  └─ Recommend optimizations
  → Deliverables: dashboard.yaml, performance-report.md (ongoing)

Project Coordinator
  └─ Coordinate adjustments with human approval
```

### Phase 5: Learning (Week 6+)
**Goal**: Analyze and document

```
Performance Analyst
  ├─ Final analysis
  ├─ Compare to benchmarks
  └─ Document outcomes
  → Deliverables: final-performance-report.md

Strategist
  ├─ Extract learnings
  ├─ Update best practices
  └─ Refine strategy
  → Deliverables: learnings.md

Project Coordinator
  └─ Update foundation with insights
  → Deliverables: updated-foundation.md
```

---

## 🔌 Skills Distribution via Connectors

### Key Innovation
**Leverage existing connectors marketplace** - no new infrastructure needed.

### Implementation

```go
// Add to apps/connectors/dataflows/types/registry.go
const (
    DataFlowComponentAgentSkill DataFlowComponent = "agentskill"
)

type SkillDefinition struct {
    Type           SkillType
    OrganizationID uuid.UUID
    WorkspaceID    uuid.UUID
    MRN            mrn.MRN
    RegistryEntry  RegistryEntry
    Extensions     map[string][]byte
}
```

### File Structure

```
apps/connectors/dataflows/registry/
└── skills/
    ├── platform/
    │   ├── bird-project-context/
    │   │   ├── skill.go
    │   │   ├── spec.yml
    │   │   ├── prompt.md
    │   │   └── examples/
    │   └── ...
    ├── marketing/
    │   ├── audience-segmentation/
    │   └── ...
    ├── ecommerce/
    ├── saas/
    └── abm/
```

### Discovery API

```bash
# Get available skills
GET /workspaces/:workspaceId/data-flows/registry

Response:
{
  "skills": [
    {
      "type": "cart-recovery",
      "name": "cart-recovery",
      "displayName": "Cart Recovery",
      "category": "ecommerce",
      "version": "1.0.0",
      "spec": {
        "purpose": "...",
        "inputs": [...],
        "outputs": [...],
        "dependencies": [...],
        "allowedTools": [...]
      },
      "promptTemplate": "...",
      "examples": [...]
    }
  ]
}
```

### Project Skill Management

```typescript
// llmchain integration
class SkillsService {
  // Get skills for project
  async getProjectSkills(projectId: string): Promise<Skill[]>
  
  // Enable skills based on vertical
  async autoEnableSkills(projectId: string): Promise<string[]>
  
  // Compose agent prompt with skills
  async composeAgentPrompt(
    agentRole: string,
    projectId: string
  ): Promise<string>
}
```

**See**: [`implementation/connectors-integration.md`](./implementation/connectors-integration.md) for complete details

---

## 🎨 User Experience

### 1. Project Creation

```
User creates project
  ↓
Select business type: B2B | B2C | E-commerce | SaaS
Select industry: Retail | Finance | Healthcare | etc.
  ↓
System auto-enables skills:
  • Platform skills (12) - always enabled
  • Marketing skills (10) - always enabled
  • Vertical skills (6-18) - based on business type
  ↓
User can customize skill selection
  ↓
Project created with enabled skills
```

### 2. Campaign Creation

```
User: "Create Black Friday campaign"
  ↓
Project Coordinator orchestrates:
  ├─ Research Analyst: Discover data
  ├─ Strategist: Define strategy
  ├─ Audience Architect: Create segments
  ├─ Creative Director: Write copy
  ├─ Campaign Engineer: Assemble campaign
  └─ Present options to human
  ↓
Human approves Option B
  ↓
Campaign Engineer: Deploy
Performance Analyst: Monitor
  ↓
Results: 18% open, 3.2% click, $45K revenue
  ↓
Performance Analyst: Analyze
Strategist: Extract learnings
Project Coordinator: Update foundation
```

---

## 🎯 Key Design Principles

### 1. Modularity
- Skills distributed independently
- Users select only what they need
- Easy to add new verticals
- Third-party contributions possible

### 2. Reusability
- Platform skills work across all verticals
- Marketing skills apply to all industries
- Vertical skills compose with platform skills
- Skills can depend on other skills

### 3. Clear Responsibilities
- Each agent has specific role
- Specific deliverables per phase
- Smooth handoffs between agents
- Human-in-the-loop at key gates

### 4. Complete Lifecycle
- Ideation (discovery & strategy)
- Planning (design & specification)
- Implementation (build & review)
- Operation (deploy & monitor)
- Learning (analyze & document)

### 5. Leverage Existing Infrastructure
- Connectors registry for skills
- Bird APIs via MCP
- S3 for storage
- ACP for communication

---

## 📊 Example: E-commerce Fashion Retailer

### Project Setup
```yaml
project:
  name: "Fashion Retailer Marketing"
  businessType: "ecommerce"
  industry: "retail"
  enabledSkills: 32
    # Platform (12) + Marketing (10) + E-commerce (6) + Retail (4)
```

### Black Friday Campaign
```
Week 1: Ideation
  Research Analyst → foundation.md (50K contacts, 15% open, 2% click)
  Strategist → strategic-brief.md (seasonal urgency strategy)

Week 2: Planning
  Audience Architect → audience.tf (3 segments: past purchasers, high-value, engaged)
  Creative Director → template.tf (3 A/B variants with product focus)

Week 2-3: Implementation
  Campaign Engineer → campaign.tf + deployment-plan.md
  Human Approval ✅

Week 3-6: Operation
  Campaign Engineer → Deploy
  Performance Analyst → dashboard.yaml (live monitoring)
  Results: 18% open, 3.2% click, $45K revenue

Week 6+: Learning
  Performance Analyst → final-performance-report.md (above benchmark)
  Strategist → learnings.md (urgency + product focus works)
  Project Coordinator → updated-foundation.md
```

---

## 🚀 Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)
- Add skills to connectors registry
- Implement SkillDefinition types
- Create SkillsService in llmchain
- Build skill discovery API

### Phase 2: Platform Skills (Week 3)
- Implement 12 platform skills
- Create skill specs and prompts
- Add documentation and examples

### Phase 3: Core Agents (Week 4-5)
- Implement Research Analyst
- Implement Strategist
- Implement Project Coordinator
- Test agent collaboration

### Phase 4: Execution Agents (Week 6-7)
- Implement Audience Architect
- Implement Creative Director
- Implement Campaign Engineer
- Test full workflow

### Phase 5: Analysis Agent (Week 8)
- Implement Performance Analyst
- Create dashboard templates
- Test monitoring and optimization

### Phase 6: Marketing Skills (Week 9)
- Implement 10 marketing skills
- Create skill specs and prompts
- Add documentation and examples

### Phase 7: Vertical Skills (Week 10-11)
- Implement E-commerce skills (6)
- Implement SaaS skills (6)
- Implement ABM skills (6)
- Create vertical-specific examples

### Phase 8: UI & Marketplace (Week 12)
- Skill marketplace UI
- Project skill selection
- Agent workflow UI
- Performance dashboards

**Total: 12 weeks (3 months)**

---

## 📋 Success Metrics

### Agent Performance
- Response time < 30s per agent action
- Accuracy 95%+ valid outputs
- Collaboration 100% successful handoffs
- Human approval clear recommendations

### Skill Adoption
- Platform skills 100% adoption
- Marketing skills 80%+ adoption
- Vertical skills 60%+ adoption (relevant projects)

### Campaign Quality
- Brand compliance 100% adherence
- A/B testing 80%+ campaigns tested
- Performance meet/exceed benchmarks
- Deployment < 5min from approval

### User Satisfaction
- Clarity: non-technical language
- Options: 2-3 choices with recommendation
- Transparency: clear reasoning
- Control: human approval required

---

## 📚 Next Steps

1. **Review architecture** - Validate approach
2. **Read agent specs** - [`agents/README.md`](./agents/README.md)
3. **Read skill specs** - [`skills/README.md`](./skills/README.md)
4. **Read implementation** - [`implementation/`](./implementation/)
5. **Start building** - Phase 1 (Core Infrastructure)

---

**This architecture is production-ready and leverages existing infrastructure!** 🚀
