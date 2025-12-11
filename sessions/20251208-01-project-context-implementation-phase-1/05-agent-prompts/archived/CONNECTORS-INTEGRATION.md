# Connectors Integration Guide

> How to integrate skills with the connectors marketplace

---

## 🎯 Overview

Skills are distributed as **dataflow components** through the existing connectors registry system (`apps/connectors/dataflows/registry`).

**Benefits**:
- ✅ Reuse existing infrastructure
- ✅ Workspace-level isolation
- ✅ Versioning built-in
- ✅ Proven distribution mechanism

---

## 🔧 Implementation Steps

### Step 1: Add Skill Component Type

```go
// apps/connectors/dataflows/types/registry.go

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

### Step 2: Define SkillDefinition

```go
// apps/connectors/dataflows/types/registry.go

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
    // Platform skills
    SkillTypeBirdProjectContext      SkillType = "bird-project-context"
    SkillTypeBirdAudienceCreation    SkillType = "bird-audience-creation"
    // ... add all skill types
)
```

### Step 3: Extend RegistryEntry

```go
// apps/connectors/dataflows/types/registry.go

type RegistryEntry struct {
    Name        string
    DisplayName string
    Description string
    Category    string
    IconURL     string
    Version     string
    Author      string
    Tags        []string
    
    // NEW: Skill-specific fields
    Spec        SkillSpec        `json:"spec,omitempty"`
    PromptTemplate string        `json:"promptTemplate,omitempty"`
    Examples    []SkillExample   `json:"examples,omitempty"`
}

type SkillSpec struct {
    Purpose      string
    Inputs       []SkillInput
    Outputs      []SkillOutput
    Dependencies []SkillDependency
    AllowedTools []string
}

type SkillInput struct {
    Name        string
    Type        string
    Description string
    Required    bool
    Default     interface{}
}

type SkillOutput struct {
    Name        string
    Type        string
    Description string
    Format      string
}

type SkillDependency struct {
    SkillType   SkillType
    Version     string
    Optional    bool
}

type SkillExample struct {
    Title       string
    Description string
    Input       map[string]interface{}
    Output      map[string]interface{}
}
```

### Step 4: Create Skills Directory

```bash
cd apps/connectors/dataflows/registry
mkdir -p skills/{platform,marketing,ecommerce,saas,abm}
```

### Step 5: Implement First Skill

```go
// apps/connectors/dataflows/registry/skills/platform/bird-project-context/skill.go

package birdprojectcontext

import (
    "context"
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
                },
                AllowedTools: []string{
                    "mcp__nest-api__invoke_operation",
                },
            },
            PromptTemplate: loadPromptTemplate(),
            Examples:       loadExamples(),
        },
    }
}

func loadPromptTemplate() string {
    // Load from prompt.md file
    return `...`
}

func loadExamples() []types.SkillExample {
    // Load from examples/*.yml
    return []types.SkillExample{...}
}
```

### Step 6: Register Skills in Factory

```go
// apps/connectors/dataflows/registry/skills.go

package registry

import (
    "github.com/messagebird-dev/connectors/dataflows/registry/skills/platform/birdprojectcontext"
    "github.com/messagebird-dev/connectors/dataflows/types"
    "github.com/messagebird-dev/commonlib/uuid"
)

func staticSkills(organizationID, workspaceID uuid.UUID) []types.SkillDefinition {
    return []types.SkillDefinition{
        // Platform skills
        birdprojectcontext.NewSkillDefinition(organizationID, workspaceID),
        birdaudiencecreation.NewSkillDefinition(organizationID, workspaceID),
        // ... more skills
    }
}
```

### Step 7: Update Registry Service

```go
// apps/connectors/dataflows/registry/service.go

func (s *Service) Registry(ctx context.Context, organizationID, workspaceID uuid.UUID, options ListOptions) (Registry, error) {
    // ... existing code
    
    // Add skills to registry
    skills := staticSkills(organizationID, workspaceID)
    
    return &WorkspaceRegistry{
        Sources:      sources,
        Destinations: destinations,
        Enrichments:  enrichments,
        Skills:       skills, // NEW
    }, nil
}
```

### Step 8: Update API Response

```go
// apps/connectors/openapi/registry.yml

components:
  schemas:
    Registry:
      type: object
      properties:
        sources:
          type: array
          items:
            $ref: '#/components/schemas/SourceDefinition'
        destinations:
          type: array
          items:
            $ref: '#/components/schemas/DestinationDefinition'
        enrichments:
          type: array
          items:
            $ref: '#/components/schemas/EnrichmentDefinition'
        skills:  # NEW
          type: array
          items:
            $ref: '#/components/schemas/SkillDefinition'
```

---

## 🔌 llmchain Integration

### Step 1: Create SkillsService

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
  examples: SkillExample[];
}

export class SkillsService {
  constructor(private birdAPI: BirdAPIClient) {}
  
  /**
   * Get all available skills for workspace
   */
  async getAvailableSkills(workspaceId: string): Promise<Skill[]> {
    const registry = await this.birdAPI.get(
      `/workspaces/${workspaceId}/data-flows/registry`
    );
    return registry.skills || [];
  }
  
  /**
   * Get skills for specific project
   */
  async getProjectSkills(projectId: string): Promise<Skill[]> {
    const project = await this.birdAPI.invoke('tasks:getProject', {
      pathParams: { projectId }
    });
    
    const enabledSkills = project.metadata?.enabledSkills || [];
    const allSkills = await this.getAvailableSkills(project.workspaceId);
    
    return allSkills.filter(skill => 
      enabledSkills.includes(skill.type)
    );
  }
  
  /**
   * Compose agent prompt with skills
   */
  async composeAgentPrompt(
    agentRole: string,
    projectId: string
  ): Promise<string> {
    const agent = await this.getAgentDefinition(agentRole);
    const skills = await this.getProjectSkills(projectId);
    const agentSkills = skills.filter(skill =>
      agent.skills.includes(skill.type)
    );
    
    return `
${agent.systemPrompt}

## Available Skills

${agentSkills.map(skill => `
### ${skill.displayName}

${skill.description}

**Purpose**: ${skill.spec.purpose}

${skill.promptTemplate}

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

### Step 2: Auto-Enable Skills

```typescript
// apps/llmchain/src/services/project-skills.ts

export class ProjectSkillsService {
  /**
   * Auto-detect and enable skills based on vertical
   */
  async autoEnableSkills(projectId: string): Promise<string[]> {
    const project = await this.getProject(projectId);
    const foundation = await this.getFoundation(projectId);
    
    // Detect vertical
    const vertical = this.detectVertical(foundation);
    
    // Get recommended skills
    const recommendedSkills = this.getRecommendedSkills(vertical);
    
    // Enable skills
    await this.enableSkills(projectId, recommendedSkills);
    
    return recommendedSkills;
  }
  
  private detectVertical(foundation: any): string {
    const content = foundation.content.toLowerCase();
    
    if (content.includes('saas')) return 'saas';
    if (content.includes('ecommerce')) return 'ecommerce';
    if (content.includes('b2b')) return 'b2b';
    if (content.includes('retail')) return 'retail';
    
    return 'b2c';
  }
  
  private getRecommendedSkills(vertical: string): string[] {
    const baseSkills = [
      // Platform (12)
      'bird-project-context',
      'bird-audience-creation',
      // ... all platform skills
      
      // Marketing (10)
      'audience-segmentation',
      'campaign-strategy',
      // ... all marketing skills
    ];
    
    const verticalSkills: Record<string, string[]> = {
      ecommerce: [
        'product-recommendations',
        'cart-recovery',
        // ... e-commerce skills
      ],
      saas: [
        'trial-conversion',
        'feature-adoption',
        // ... saas skills
      ],
      // ... more verticals
    };
    
    return [
      ...baseSkills,
      ...(verticalSkills[vertical] || [])
    ];
  }
}
```

---

## 📡 API Endpoints

### Get Registry (includes skills)

```bash
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

### Enable Skills for Project

```bash
POST /workspaces/:workspaceId/projects/:projectId/skills

Request:
{
  "skills": [
    "bird-project-context",
    "cart-recovery",
    "product-recommendations"
  ]
}

Response:
{
  "projectId": "proj-123",
  "enabledSkills": [
    "bird-project-context",
    "bird-audience-creation",  // auto-added dependency
    "cart-recovery",
    "product-recommendations"
  ]
}
```

---

## 🧪 Testing

### Unit Test: Skill Definition

```go
func TestBirdProjectContextSkill(t *testing.T) {
    orgID := uuid.New()
    workspaceID := uuid.New()
    
    skill := birdprojectcontext.NewSkillDefinition(orgID, workspaceID)
    
    assert.Equal(t, types.SkillTypeBirdProjectContext, skill.Type)
    assert.Equal(t, "bird-project-context", skill.RegistryEntry.Name)
    assert.NotEmpty(t, skill.RegistryEntry.Spec.PromptTemplate)
    assert.Greater(t, len(skill.RegistryEntry.Examples), 0)
}
```

### Integration Test: Registry API

```go
func TestRegistryIncludesSkills(t *testing.T) {
    registry, err := registryService.Registry(ctx, orgID, workspaceID, ListOptions{})
    require.NoError(t, err)
    
    assert.Greater(t, len(registry.Skills), 0)
    
    // Find bird-project-context skill
    var found bool
    for _, skill := range registry.Skills {
        if skill.RegistryEntry.Name == "bird-project-context" {
            found = true
            break
        }
    }
    assert.True(t, found, "bird-project-context skill should be in registry")
}
```

---

## 📋 Migration Checklist

### Phase 1: Core Infrastructure
- [ ] Add SkillDefinition type
- [ ] Extend RegistryEntry
- [ ] Create skills directory structure
- [ ] Update registry service
- [ ] Update API schema

### Phase 2: First Skills
- [ ] Implement bird-project-context
- [ ] Implement bird-audience-creation
- [ ] Test registry API
- [ ] Verify skill discovery

### Phase 3: llmchain Integration
- [ ] Create SkillsService
- [ ] Implement skill discovery
- [ ] Implement prompt composition
- [ ] Test end-to-end

### Phase 4: All Skills
- [ ] Implement remaining platform skills (10)
- [ ] Implement marketing skills (10)
- [ ] Implement vertical skills (18+)
- [ ] Create examples for all

---

## 🎯 Next Steps

1. **Review integration approach** - Validate technical design
2. **Implement core infrastructure** - Add types and registry updates
3. **Create first skill** - bird-project-context as proof of concept
4. **Test discovery** - Verify registry API returns skills
5. **Integrate with llmchain** - Build SkillsService
6. **Roll out remaining skills** - Platform → Marketing → Vertical
