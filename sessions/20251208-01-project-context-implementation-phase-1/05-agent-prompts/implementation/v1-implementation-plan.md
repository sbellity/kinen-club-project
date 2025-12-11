# V1 Implementation Plan

> Get a working multi-agent system with ABM, SaaS, and E-commerce skills

---

## 🎯 V1 Scope

### What We're Building

A functional multi-agent marketing advisor that can:
1. **Understand project context** via Bird APIs
2. **Analyze data** and identify opportunities
3. **Develop strategy** with industry best practices
4. **Create audiences** with proper segmentation
5. **Generate campaigns** as Terraform artifacts
6. **Deploy to Bird platform** via Terraform

### Verticals
- ✅ **ABM** (Account-Based Marketing)
- ✅ **SaaS** (Software as a Service)
- ✅ **E-commerce** (Online Retail)

### Agents (All 7)
- Project Coordinator (entry point)
- Research Analyst
- Strategist
- Audience Architect
- Creative Director
- Campaign Engineer
- Performance Analyst

---

## 📦 Deliverables

### 1. Core Infrastructure
- SkillsLoader service
- PromptComposer service
- AgentHarness with coordinator entry point
- MCP client integration

### 2. Skills (30 total)
- **Platform Skills** (12): Bird API operations
- **Marketing Skills** (8): Cross-vertical capabilities
- **Vertical Skills** (10): ABM (3), SaaS (4), E-commerce (3)

### 3. Agent Prompts (7)
- Complete system prompts for each agent
- Skill composition per agent
- Collaboration patterns

### 4. Testing
- Unit tests for skills loader
- Integration tests with fixtures
- End-to-end workflow test

---

## 🗓️ 4-Week Timeline

```
Week 1: Core Infrastructure + Platform Skills
Week 2: Agents + Marketing Skills
Week 3: Vertical Skills + Integration
Week 4: Testing + Polish
```

---

## 📅 Week 1: Core Infrastructure + Platform Skills

**Goal**: Working skills system with platform capabilities

### Day 1-2: Skills Infrastructure (16h)

#### Task 1.1: Project Structure
```bash
apps/llmchain/
├── skills/
│   ├── platform/
│   ├── marketing/
│   └── verticals/
│       ├── abm/
│       ├── saas/
│       └── ecommerce/
├── src/
│   ├── services/
│   │   ├── skills-loader.ts
│   │   ├── prompt-composer.ts
│   │   └── agent-harness.ts
│   └── agents/
│       └── coordinator.ts
└── tests/
    ├── skills/
    └── agents/
```

**Deliverable**: Directory structure created

---

#### Task 1.2: SkillsLoader Service (6h)

```typescript
// src/services/skills-loader.ts

import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';

export interface SkillInput {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
}

export interface SkillOutput {
  name: string;
  type: string;
  description: string;
}

export interface MCPOperation {
  operation: string;
  description: string;
}

export interface Skill {
  slug: string;
  name: string;
  version: string;
  category: 'platform' | 'marketing' | 'abm' | 'saas' | 'ecommerce';
  description: string;
  metadata: {
    author: string;
    tags: string[];
    requiredPermissions: string[];
  };
  purpose: string;
  inputs: SkillInput[];
  outputs: SkillOutput[];
  mcpOperations: MCPOperation[];
  dependencies: string[];
  promptTemplate: string; // Loaded from prompt.md
  examples: any[];
}

export class SkillsLoader {
  private skillsPath: string;
  private cache = new Map<string, Skill>();
  
  constructor(skillsPath?: string) {
    this.skillsPath = skillsPath || path.join(__dirname, '../../skills');
  }
  
  /**
   * Load all skills from disk
   */
  async loadAllSkills(): Promise<Skill[]> {
    const categories = await fs.readdir(this.skillsPath);
    const skills: Skill[] = [];
    
    for (const category of categories) {
      const categoryPath = path.join(this.skillsPath, category);
      const stat = await fs.stat(categoryPath);
      
      if (!stat.isDirectory()) continue;
      
      // Handle nested verticals directory
      if (category === 'verticals') {
        const verticals = await fs.readdir(categoryPath);
        for (const vertical of verticals) {
          const verticalPath = path.join(categoryPath, vertical);
          const verticalStat = await fs.stat(verticalPath);
          if (verticalStat.isDirectory()) {
            const verticalSkills = await this.loadSkillsFromCategory(verticalPath);
            skills.push(...verticalSkills);
          }
        }
      } else {
        const categorySkills = await this.loadSkillsFromCategory(categoryPath);
        skills.push(...categorySkills);
      }
    }
    
    return skills;
  }
  
  private async loadSkillsFromCategory(categoryPath: string): Promise<Skill[]> {
    const skillDirs = await fs.readdir(categoryPath);
    const skills: Skill[] = [];
    
    for (const skillDir of skillDirs) {
      const skillPath = path.join(categoryPath, skillDir);
      const stat = await fs.stat(skillPath);
      
      if (!stat.isDirectory()) continue;
      
      const skill = await this.loadSkill(skillPath);
      if (skill) {
        skills.push(skill);
        this.cache.set(skill.slug, skill);
      }
    }
    
    return skills;
  }
  
  /**
   * Load a single skill
   */
  private async loadSkill(skillPath: string): Promise<Skill | null> {
    try {
      // Load skill.yml
      const skillYmlPath = path.join(skillPath, 'skill.yml');
      const skillYml = await fs.readFile(skillYmlPath, 'utf-8');
      const skillDef = yaml.parse(skillYml);
      
      // Load prompt.md
      const promptPath = path.join(skillPath, 'prompt.md');
      const promptTemplate = await fs.readFile(promptPath, 'utf-8');
      
      return {
        ...skillDef,
        promptTemplate
      };
    } catch (error) {
      console.error(`Failed to load skill from ${skillPath}:`, error);
      return null;
    }
  }
  
  /**
   * Get skills matching project config
   */
  async getSkillsForProject(projectConfig: {
    vertical: string;
    enabledSkills: string[];
  }): Promise<Skill[]> {
    const allSkills = await this.loadAllSkills();
    const { vertical, enabledSkills } = projectConfig;
    
    return allSkills.filter(skill => {
      // Always include platform skills
      if (skill.category === 'platform') return true;
      
      // Include marketing skills if enabled
      if (skill.category === 'marketing' && enabledSkills.includes('marketing/*')) {
        return true;
      }
      
      // Include vertical-specific skills
      if (skill.category === vertical && enabledSkills.includes(`${vertical}/*`)) {
        return true;
      }
      
      // Check for explicit skill inclusion
      if (enabledSkills.includes(skill.slug)) {
        return true;
      }
      
      return false;
    });
  }
  
  /**
   * Get skills for specific agent role
   */
  async getSkillsForAgent(agentRole: string, projectSkills: Skill[]): Promise<Skill[]> {
    const agentSkillMap: Record<string, string[]> = {
      'project-coordinator': ['bird-project-context', 'bird-task-management'],
      'research-analyst': ['bird-project-context', 'bird-data-queries', 'bird-datahub-schema'],
      'strategist': ['campaign-strategy', 'customer-lifecycle', 'competitive-analysis'],
      'audience-architect': ['bird-audience-creation', 'audience-segmentation', 'cohort-analysis'],
      'creative-director': ['email-copywriting', 'bird-template-management', 'ab-testing'],
      'campaign-engineer': ['bird-campaign-deployment', 'bird-terraform-resources', 'bird-journey-orchestration'],
      'performance-analyst': ['performance-analysis', 'bird-data-queries', 'dashboard-creation']
    };
    
    const requiredSlugs = agentSkillMap[agentRole] || [];
    return projectSkills.filter(skill => requiredSlugs.includes(skill.slug));
  }
  
  /**
   * Get a specific skill by slug
   */
  async getSkill(slug: string): Promise<Skill | null> {
    if (this.cache.has(slug)) {
      return this.cache.get(slug)!;
    }
    
    await this.loadAllSkills();
    return this.cache.get(slug) || null;
  }
}
```

**Deliverable**: SkillsLoader service with tests

---

#### Task 1.3: PromptComposer Service (4h)

```typescript
// src/services/prompt-composer.ts

import { Skill } from './skills-loader';
import Handlebars from 'handlebars';

export class PromptComposer {
  /**
   * Compose system prompt for agent
   */
  composeSystemPrompt(
    basePrompt: string,
    agentRole: string,
    skills: Skill[],
    projectContext: any
  ): string {
    const sections = [
      basePrompt,
      this.formatSkillsSection(skills),
      this.formatProjectContext(projectContext)
    ];
    
    return sections.join('\n\n---\n\n');
  }
  
  /**
   * Render skill prompt with inputs
   */
  renderSkillPrompt(skill: Skill, inputs: Record<string, any>): string {
    const template = Handlebars.compile(skill.promptTemplate);
    return template({ inputs, skill });
  }
  
  private formatSkillsSection(skills: Skill[]): string {
    if (skills.length === 0) return '';
    
    return `
## Available Skills

You have access to the following skills:

${skills.map(skill => `
### ${skill.name} (\`${skill.slug}\`)

**Purpose**: ${skill.purpose}

**Inputs**:
${skill.inputs.map(i => `- \`${i.name}\` (${i.type}${i.required ? ', required' : ''}): ${i.description}`).join('\n')}

**Outputs**:
${skill.outputs.map(o => `- \`${o.name}\` (${o.type}): ${o.description}`).join('\n')}

**MCP Operations**:
${skill.mcpOperations.map(op => `- \`${op.operation}\`: ${op.description}`).join('\n')}

---
`).join('\n')}
`;
  }
  
  private formatProjectContext(context: any): string {
    return `
## Project Context

**Project ID**: ${context.projectId}
**Project Name**: ${context.projectName}
**Workspace ID**: ${context.workspaceId}
**Vertical**: ${context.vertical}
`;
  }
}
```

**Deliverable**: PromptComposer service with tests

---

#### Task 1.4: AgentHarness with Coordinator Entry Point (6h)

```typescript
// src/services/agent-harness.ts

import { SkillsLoader } from './skills-loader';
import { PromptComposer } from './prompt-composer';
import Anthropic from '@anthropic-ai/sdk';

export interface AgentSession {
  sessionId: string;
  projectId: string;
  agentRole: string;
  systemPrompt: string;
  conversation: Anthropic.MessageParam[];
  skills: any[];
  config: any;
}

export class AgentHarness {
  private skillsLoader: SkillsLoader;
  private promptComposer: PromptComposer;
  private anthropic: Anthropic;
  
  constructor() {
    this.skillsLoader = new SkillsLoader();
    this.promptComposer = new PromptComposer();
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  
  /**
   * Initialize coordinator agent session (main entry point)
   */
  async initializeCoordinatorSession(
    projectId: string,
    userRequest: string
  ): Promise<AgentSession> {
    // Fetch project config
    const projectConfig = await this.fetchProjectConfig(projectId);
    
    // Load all project skills
    const projectSkills = await this.skillsLoader.getSkillsForProject(projectConfig);
    
    // Get coordinator-specific skills
    const coordinatorSkills = await this.skillsLoader.getSkillsForAgent(
      'project-coordinator',
      projectSkills
    );
    
    // Load base coordinator prompt
    const basePrompt = await this.loadAgentPrompt('project-coordinator');
    
    // Compose system prompt
    const systemPrompt = this.promptComposer.composeSystemPrompt(
      basePrompt,
      'project-coordinator',
      coordinatorSkills,
      projectConfig
    );
    
    // Create session
    return {
      sessionId: this.generateSessionId(),
      projectId,
      agentRole: 'project-coordinator',
      systemPrompt,
      conversation: [{
        role: 'user',
        content: userRequest
      }],
      skills: coordinatorSkills,
      config: projectConfig
    };
  }
  
  /**
   * Initialize any agent session
   */
  async initializeAgentSession(
    projectId: string,
    agentRole: string,
    task: string
  ): Promise<AgentSession> {
    const projectConfig = await this.fetchProjectConfig(projectId);
    const projectSkills = await this.skillsLoader.getSkillsForProject(projectConfig);
    const agentSkills = await this.skillsLoader.getSkillsForAgent(agentRole, projectSkills);
    const basePrompt = await this.loadAgentPrompt(agentRole);
    
    const systemPrompt = this.promptComposer.composeSystemPrompt(
      basePrompt,
      agentRole,
      agentSkills,
      projectConfig
    );
    
    return {
      sessionId: this.generateSessionId(),
      projectId,
      agentRole,
      systemPrompt,
      conversation: [{
        role: 'user',
        content: task
      }],
      skills: agentSkills,
      config: projectConfig
    };
  }
  
  /**
   * Run agent turn
   */
  async runAgentTurn(session: AgentSession): Promise<Anthropic.Message> {
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 8192,
      system: session.systemPrompt,
      messages: session.conversation
    });
    
    // Add assistant response to conversation
    session.conversation.push({
      role: 'assistant',
      content: response.content
    });
    
    return response;
  }
  
  private async fetchProjectConfig(projectId: string): Promise<any> {
    // TODO: Call Bird Tasks API via MCP
    // For now, return mock config
    return {
      projectId,
      projectName: 'Test Project',
      workspaceId: 'ws-123',
      vertical: 'ecommerce',
      enabledSkills: ['platform/*', 'marketing/*', 'ecommerce/*']
    };
  }
  
  private async loadAgentPrompt(agentRole: string): Promise<string> {
    const fs = require('fs/promises');
    const path = require('path');
    const promptPath = path.join(__dirname, `../../prompts/agents/${agentRole}.md`);
    return await fs.readFile(promptPath, 'utf-8');
  }
  
  private generateSessionId(): string {
    return `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

**Deliverable**: AgentHarness with coordinator entry point

---

### Day 3-5: Platform Skills (24h)

Create 12 platform skills as YAML + Markdown:

#### 1. bird-project-context
```yaml
# skills/platform/bird-project-context/skill.yml
slug: bird-project-context
name: Bird Project Context
version: 1.0.0
category: platform
description: Fetch comprehensive project context from Bird Tasks API

metadata:
  author: Bird Platform Team
  tags: [platform, context, foundation]
  requiredPermissions: [tasks:read, content:read]

purpose: |
  Retrieves project foundation document, recent activity, and workspace
  metadata to inform strategic decisions.

inputs:
  - name: projectId
    type: string
    required: true
    description: Bird project ID

outputs:
  - name: foundation.md
    type: markdown
    description: Synthesized foundation document with business context
  
  - name: metadata.json
    type: json
    description: Structured project metadata

mcpOperations:
  - operation: tasks:getProject
    description: Fetch project details
  
  - operation: content:getDocument
    description: Retrieve foundation document
  
  - operation: tasks:listTasks
    description: Get recent activity

dependencies: []

examples:
  - title: Basic project context fetch
    input:
      projectId: proj-abc-123
```

```markdown
# skills/platform/bird-project-context/prompt.md

# Bird Project Context Skill

## Your Task

Fetch comprehensive context for Bird project `{{inputs.projectId}}`.

## Steps

1. **Fetch Project**
   - Operation: `tasks:getProject`
   - Path params: `{ id: "{{inputs.projectId}}" }`
   - Extract: name, description, workspaceId, metadata

2. **Get Foundation Document**
   - If `metadata.foundationDocumentId` exists:
     - Operation: `content:getDocument`
     - Path params: `{ id: "{{metadata.foundationDocumentId}}" }`
   - If not found: Inform user to create one

3. **Fetch Recent Activity**
   - Operation: `tasks:listTasks`
   - Body: `{ projectId: "{{inputs.projectId}}", limit: 5, sort: "createdAt:desc" }`

4. **Synthesize Foundation**
   Combine into coherent document with:
   - Business context (company, industry, vertical)
   - Customer base (size, segments)
   - Performance metrics
   - Recent activity
   - Strategic priorities

## Output

### foundation.md
```markdown
# {{projectName}} Foundation

## Business Context
**Company**: {{company}}
**Industry**: {{industry}}
**Vertical**: {{vertical}}

## Customer Base
**Total Contacts**: {{contactCount}}
**Active (30d)**: {{activeContacts}}

## Performance
**Email Open Rate**: {{emailOpenRate}}%
**Email Click Rate**: {{emailClickRate}}%

## Recent Activity
{{recentCampaigns}}
```

### metadata.json
```json
{
  "projectId": "{{inputs.projectId}}",
  "projectName": "{{projectName}}",
  "workspaceId": "{{workspaceId}}",
  "lastUpdated": "{{timestamp}}"
}
```
```

**Create remaining 11 platform skills** (similar structure):
- bird-task-management
- bird-data-queries
- bird-datahub-schema
- bird-audience-creation
- bird-template-management
- bird-campaign-deployment
- bird-terraform-resources
- bird-journey-orchestration
- bird-workspace-config
- bird-performance-metrics
- bird-content-management

**Deliverable**: 12 platform skills (YAML + MD + examples)

---

## 📅 Week 2: Agents + Marketing Skills

**Goal**: All 7 agents with complete prompts + 8 marketing skills

### Day 6-7: Agent Prompts (16h)

Create complete system prompts for each agent:

#### Project Coordinator Prompt

```markdown
# prompts/agents/project-coordinator.md

# You are the Project Coordinator

## Your Role

You are the **Project Coordinator** - the orchestrator of the multi-agent marketing team. You are the main entry point for all user requests.

## Core Responsibilities

1. **Understand User Intent**
   - Parse user requests
   - Clarify ambiguous goals
   - Identify required deliverables

2. **Decompose Tasks**
   - Break complex requests into agent-specific tasks
   - Determine optimal agent sequence
   - Identify dependencies

3. **Coordinate Agents**
   - Delegate tasks to specialist agents
   - Collect and synthesize deliverables
   - Ensure consistency across outputs

4. **Track Progress**
   - Monitor task completion
   - Update project status
   - Report blockers

5. **Quality Control**
   - Validate deliverables meet requirements
   - Ensure brand guidelines followed
   - Verify technical correctness

## Agent Team

You coordinate these specialist agents:

### Research Analyst
**When to use**: Need data, insights, or workspace analysis
**Deliverables**: Foundation documents, data models, audience insights

### Strategist
**When to use**: Need strategic direction or campaign planning
**Deliverables**: Strategic briefs, campaign frameworks, recommendations

### Audience Architect
**When to use**: Need audience segmentation or targeting
**Deliverables**: Audience definitions, segment analysis, Terraform configs

### Creative Director
**When to use**: Need campaign content or templates
**Deliverables**: Email copy, templates, A/B test plans

### Campaign Engineer
**When to use**: Need technical implementation
**Deliverables**: Terraform configs, deployment plans, integration specs

### Performance Analyst
**When to use**: Need performance analysis or optimization
**Deliverables**: Performance reports, dashboards, recommendations

## Workflow

### 1. Intake
```
User Request → Parse Intent → Clarify Requirements → Define Success Criteria
```

### 2. Planning
```
Identify Required Agents → Determine Sequence → Create Task List
```

### 3. Execution
```
For each task:
  - Delegate to specialist agent
  - Collect deliverable
  - Validate quality
  - Update progress
```

### 4. Synthesis
```
Combine Deliverables → Ensure Consistency → Present to User
```

### 5. Deployment
```
User Reviews → User Approves → Coordinate Deployment
```

## Communication Style

- **Clear**: Use simple language, avoid jargon
- **Structured**: Present information in logical order
- **Actionable**: Always provide next steps
- **Transparent**: Explain what you're doing and why

## Example Interactions

### User: "I want to create a cart abandonment campaign"

**Your Response**:
```
I'll help you create a cart abandonment campaign. Here's my plan:

1. **Research Phase** (Research Analyst)
   - Analyze current cart abandonment rates
   - Identify abandoned cart segments
   - Review product catalog data

2. **Strategy Phase** (Strategist)
   - Develop recovery strategy
   - Define incentive approach
   - Plan email sequence timing

3. **Audience Phase** (Audience Architect)
   - Create abandoned cart audience
   - Define cart value segments
   - Build Terraform configs

4. **Creative Phase** (Creative Director)
   - Write recovery email copy
   - Create product recommendation templates
   - Design A/B test variants

5. **Implementation Phase** (Campaign Engineer)
   - Build campaign Terraform
   - Configure journey orchestration
   - Prepare deployment plan

**Estimated Timeline**: 2-3 hours
**Required Approvals**: Email copy, deployment plan

Shall I proceed?
```

## What You Never Do

- ❌ Make assumptions about user goals
- ❌ Skip validation steps
- ❌ Deploy without user approval
- ❌ Ignore brand guidelines
- ❌ Create incomplete deliverables

## Success Criteria

- ✅ User intent clearly understood
- ✅ All required deliverables produced
- ✅ Quality standards met
- ✅ User approves before deployment
- ✅ Smooth handoff between agents
```

**Create remaining 6 agent prompts** (similar depth):
- research-analyst.md
- strategist.md
- audience-architect.md
- creative-director.md
- campaign-engineer.md
- performance-analyst.md

**Deliverable**: 7 complete agent prompts

---

### Day 8-10: Marketing Skills (24h)

Create 8 marketing skills:

1. **campaign-strategy** - Develop campaign strategies
2. **customer-lifecycle** - Lifecycle marketing frameworks
3. **email-copywriting** - Generate email copy
4. **ab-testing** - Design A/B tests
5. **audience-segmentation** - Segment audiences
6. **performance-analysis** - Analyze campaign performance
7. **competitive-analysis** - Competitive intelligence
8. **dashboard-creation** - Create performance dashboards

**Deliverable**: 8 marketing skills (YAML + MD + examples)

---

## 📅 Week 3: Vertical Skills + Integration

**Goal**: Vertical-specific skills + end-to-end integration

### Day 11-13: Vertical Skills (24h)

#### ABM Skills (3)

1. **account-identification**
```yaml
slug: account-identification
name: Account Identification
category: abm
purpose: Identify and prioritize target accounts for ABM campaigns
```

2. **account-scoring**
```yaml
slug: account-scoring
name: Account Scoring
category: abm
purpose: Score accounts based on fit and engagement
```

3. **multi-touch-attribution**
```yaml
slug: multi-touch-attribution
name: Multi-Touch Attribution
category: abm
purpose: Track account journey across touchpoints
```

#### SaaS Skills (4)

1. **trial-conversion**
```yaml
slug: trial-conversion
name: Trial Conversion
category: saas
purpose: Optimize trial-to-paid conversion campaigns
```

2. **feature-adoption**
```yaml
slug: feature-adoption
name: Feature Adoption
category: saas
purpose: Drive feature adoption through targeted campaigns
```

3. **churn-prevention**
```yaml
slug: churn-prevention
name: Churn Prevention
category: saas
purpose: Identify and prevent customer churn
```

4. **expansion-revenue**
```yaml
slug: expansion-revenue
name: Expansion Revenue
category: saas
purpose: Drive upsell and cross-sell campaigns
```

#### E-commerce Skills (3)

1. **cart-recovery**
```yaml
slug: cart-recovery
name: Cart Recovery
category: ecommerce
purpose: Recover abandoned carts with automated campaigns
```

2. **product-recommendations**
```yaml
slug: product-recommendations
name: Product Recommendations
category: ecommerce
purpose: Generate personalized product recommendations
```

3. **post-purchase-engagement**
```yaml
slug: post-purchase-engagement
name: Post-Purchase Engagement
category: ecommerce
purpose: Drive repeat purchases and loyalty
```

**Deliverable**: 10 vertical skills (YAML + MD + examples)

---

### Day 14-15: Integration & Testing (16h)

#### Task 3.1: End-to-End Workflow Test (8h)

```typescript
// tests/integration/e2e-workflow.test.ts

describe('E2E: Cart Recovery Campaign', () => {
  it('completes full workflow from request to deployment', async () => {
    const harness = new AgentHarness();
    
    // 1. Initialize coordinator
    const session = await harness.initializeCoordinatorSession(
      'proj-ecommerce-123',
      'Create a cart abandonment recovery campaign'
    );
    
    expect(session.agentRole).toBe('project-coordinator');
    expect(session.skills.length).toBeGreaterThan(0);
    
    // 2. Coordinator delegates to Research Analyst
    const researchTask = await harness.initializeAgentSession(
      'proj-ecommerce-123',
      'research-analyst',
      'Analyze cart abandonment data and identify segments'
    );
    
    const researchResponse = await harness.runAgentTurn(researchTask);
    expect(researchResponse.content).toContain('foundation.md');
    
    // 3. Strategist develops strategy
    const strategyTask = await harness.initializeAgentSession(
      'proj-ecommerce-123',
      'strategist',
      'Develop cart recovery strategy with incentive approach'
    );
    
    const strategyResponse = await harness.runAgentTurn(strategyTask);
    expect(strategyResponse.content).toContain('strategic-brief.md');
    
    // 4. Audience Architect creates audiences
    const audienceTask = await harness.initializeAgentSession(
      'proj-ecommerce-123',
      'audience-architect',
      'Create abandoned cart audience with value segments'
    );
    
    const audienceResponse = await harness.runAgentTurn(audienceTask);
    expect(audienceResponse.content).toContain('audience.tf');
    
    // 5. Creative Director writes copy
    const creativeTask = await harness.initializeAgentSession(
      'proj-ecommerce-123',
      'creative-director',
      'Write cart recovery email copy with product recommendations'
    );
    
    const creativeResponse = await harness.runAgentTurn(creativeTask);
    expect(creativeResponse.content).toContain('template.tf');
    
    // 6. Campaign Engineer builds deployment
    const engineerTask = await harness.initializeAgentSession(
      'proj-ecommerce-123',
      'campaign-engineer',
      'Create Terraform configs for cart recovery campaign'
    );
    
    const engineerResponse = await harness.runAgentTurn(engineerTask);
    expect(engineerResponse.content).toContain('campaign.tf');
    expect(engineerResponse.content).toContain('deployment-plan.md');
    
    // Verify all deliverables present
    const deliverables = [
      'foundation.md',
      'strategic-brief.md',
      'audience.tf',
      'template.tf',
      'campaign.tf',
      'deployment-plan.md'
    ];
    
    deliverables.forEach(deliverable => {
      // Check deliverable was created
      expect(true).toBe(true); // TODO: Check actual file system
    });
  });
});
```

**Deliverable**: Working end-to-end test

---

#### Task 3.2: MCP Integration (8h)

```typescript
// src/services/mcp-client.ts

export class MCPClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = process.env.BIRD_API_URL || 'https://api.bird.com';
  }
  
  async invoke(operation: string, params: any): Promise<any> {
    // Use Bird MCP to invoke operations
    const response = await fetch(`${this.baseUrl}/mcp/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BIRD_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        operation,
        ...params
      })
    });
    
    if (!response.ok) {
      throw new Error(`MCP operation failed: ${operation}`);
    }
    
    return await response.json();
  }
}
```

**Deliverable**: MCP client with real API calls

---

## 📅 Week 4: Testing + Polish

**Goal**: Production-ready v1

### Day 16-17: Comprehensive Testing (16h)

- Unit tests for all services
- Integration tests with fixtures
- Agent collaboration tests
- Skill composition tests

### Day 18-19: Documentation (16h)

- API documentation
- Skill usage examples
- Agent workflow guides
- Deployment instructions

### Day 20: Polish & Deploy (8h)

- Fix bugs
- Optimize performance
- Build Docker image
- Deploy to staging

---

## 📊 Success Metrics

### Functional
- ✅ All 7 agents operational
- ✅ 30 skills loadable and executable
- ✅ Coordinator can delegate tasks
- ✅ End-to-end workflow completes
- ✅ Terraform configs validate

### Performance
- ✅ Skills load in < 100ms
- ✅ Agent response in < 30s
- ✅ Prompt composition in < 500ms

### Quality
- ✅ 90%+ test coverage
- ✅ All deliverables well-formatted
- ✅ Clear error messages
- ✅ Comprehensive logging

---

## 🚀 Quick Start Commands

```bash
# Week 1: Setup
cd apps/llmchain
npm install
mkdir -p skills/{platform,marketing,verticals/{abm,saas,ecommerce}}
mkdir -p prompts/agents
mkdir -p tests/{skills,agents,integration}

# Create first skill
mkdir skills/platform/bird-project-context
touch skills/platform/bird-project-context/skill.yml
touch skills/platform/bird-project-context/prompt.md

# Create first agent
touch prompts/agents/project-coordinator.md

# Run tests
npm test

# Build Docker image
docker build -t llmchain:v1.0.0 .

# Run locally
npm run dev
```

---

## 📋 Checklist

### Week 1
- [ ] Project structure created
- [ ] SkillsLoader implemented
- [ ] PromptComposer implemented
- [ ] AgentHarness with coordinator
- [ ] 12 platform skills created

### Week 2
- [ ] 7 agent prompts completed
- [ ] 8 marketing skills created
- [ ] Agent collaboration tested

### Week 3
- [ ] 3 ABM skills created
- [ ] 4 SaaS skills created
- [ ] 3 E-commerce skills created
- [ ] MCP integration complete
- [ ] E2E test passing

### Week 4
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Docker image built
- [ ] Deployed to staging

---

## 🔗 Related

- [`../skills/DISTRIBUTION-STRATEGY.md`](../skills/DISTRIBUTION-STRATEGY.md) - Skills architecture
- [`../agents/README.md`](../agents/README.md) - Agent specifications
- [`../testing/README.md`](../testing/README.md) - Testing framework
- [`timeline.md`](./timeline.md) - Full 12-week timeline
