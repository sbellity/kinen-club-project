# Skills Distribution Strategy

> Simplified approach: Skills bundled in Docker image, dynamically loaded by agent harness

---

## 🎯 Core Concept

**Skills are NOT distributed via the connectors marketplace.** Instead:

1. **Skills are bundled in the `llmchain` Docker image**
2. **Agent harness dynamically loads skills based on project configuration**
3. **Skills follow the same declarative YAML pattern as connector templates**

---

## 📦 Skills as Declarative Templates

### Inspiration: Connector Templates

Connector templates (`apps/connector-templates`) are declarative YAML files that define:
- HTTP actions
- Authentication strategies
- Parameters and schemas
- UI configuration
- Request/response transformations (JSONata)

**Skills follow the same pattern** - they're declarative templates that define agent capabilities.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    llmchain Docker Image                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /app/skills/                                                 │
│  ├── platform/                   ← Platform skills           │
│  │   ├── bird-project-context/                               │
│  │   │   ├── skill.yml          ← Declarative definition    │
│  │   │   ├── prompt.md          ← Prompt template           │
│  │   │   └── examples/          ← Usage examples            │
│  │   ├── bird-audience-creation/                             │
│  │   └── ...                                                  │
│  │                                                             │
│  ├── marketing/                  ← Marketing skills          │
│  │   ├── campaign-strategy/                                  │
│  │   ├── email-copywriting/                                  │
│  │   └── ...                                                  │
│  │                                                             │
│  └── verticals/                  ← Vertical-specific         │
│      ├── ecommerce/                                           │
│      │   ├── cart-recovery/                                  │
│      │   ├── product-recommendations/                        │
│      │   └── ...                                              │
│      ├── saas/                                                │
│      ├── b2b/                                                 │
│      └── ...                                                  │
│                                                               │
│  /app/src/services/skills-loader.ts  ← Skills loader        │
│  /app/src/services/prompt-composer.ts ← Prompt composition   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Project Config      │
              │   (Bird Tasks API)    │
              ├───────────────────────┤
              │ {                     │
              │   "projectId": "...", │
              │   "vertical": "ecomm",│
              │   "enabledSkills": [  │
              │     "platform/*",     │
              │     "marketing/*",    │
              │     "ecommerce/*"     │
              │   ]                   │
              │ }                     │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Agent Harness       │
              │   (Session Runtime)   │
              ├───────────────────────┤
              │ 1. Read project config│
              │ 2. Load matching skills│
              │ 3. Compose system prompt│
              │ 4. Inject into session│
              └───────────────────────┘
```

---

## 📄 Skill Definition Format

### `skill.yml` - Declarative Skill Definition

```yaml
# skills/platform/bird-project-context/skill.yml

slug: bird-project-context
name: Bird Project Context
version: 1.0.0
category: platform
description: Fetch and synthesize project context from Bird Tasks API

# Skill metadata
metadata:
  author: Bird Platform Team
  tags: [platform, context, foundation]
  requiredPermissions: [tasks:read, content:read]

# What this skill does
purpose: |
  Retrieves comprehensive project context including foundation document,
  recent activity, and workspace metadata to inform agent decisions.

# Input requirements
inputs:
  - name: projectId
    type: string
    required: true
    description: Bird project ID

# Output deliverables
outputs:
  - name: foundation.md
    type: markdown
    description: Synthesized foundation document with business context
  
  - name: metadata.json
    type: json
    description: Structured project metadata

# MCP operations this skill uses
mcpOperations:
  - operation: tasks:getProject
    description: Fetch project details
  
  - operation: content:getDocument
    description: Retrieve foundation document
  
  - operation: tasks:listTasks
    description: Get recent activity

# Dependencies on other skills
dependencies: []

# Prompt template reference
promptTemplate: ./prompt.md

# Usage examples
examples:
  - title: Basic project context fetch
    description: Retrieve context for an existing project
    input:
      projectId: proj-abc-123
    expectedOutput:
      foundation.md: "# Foundation Document..."
      metadata.json: '{"company": "...", ...}'
```

---

## 📝 Prompt Template Format

### `prompt.md` - Skill Prompt Template

```markdown
# Bird Project Context Skill

## Your Task

You are fetching comprehensive context for a Bird project to inform strategic decisions.

## Inputs

- **Project ID**: {{inputs.projectId}}

## Steps

1. **Fetch Project Details**
   - Use MCP operation: `tasks:getProject`
   - Path params: `{ id: "{{inputs.projectId}}" }`
   - Extract: name, description, workspaceId, metadata

2. **Retrieve Foundation Document**
   - If project has `metadata.foundationDocumentId`:
     - Use MCP operation: `content:getDocument`
     - Path params: `{ id: "{{metadata.foundationDocumentId}}" }`
   - If not found:
     - Inform user: "No foundation document found. Would you like to create one?"

3. **Get Recent Activity**
   - Use MCP operation: `tasks:listTasks`
   - Body: `{ projectId: "{{inputs.projectId}}", limit: 5, sort: "createdAt:desc" }`
   - Extract: recent campaigns, initiatives, learnings

4. **Synthesize Foundation**
   - Combine all information into a coherent foundation document
   - Include:
     - Business context (company, industry, vertical)
     - Customer base (size, segments, characteristics)
     - Performance metrics (email/SMS rates, engagement)
     - Recent activity and learnings
     - Strategic priorities

## Output Format

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
**Key Segments**: {{segments}}

## Performance Metrics

**Email Open Rate**: {{emailOpenRate}}%
**Email Click Rate**: {{emailClickRate}}%
**SMS Click Rate**: {{smsClickRate}}%

## Recent Activity

{{recentCampaigns}}

## Strategic Priorities

{{priorities}}
```

### metadata.json

```json
{
  "projectId": "{{inputs.projectId}}",
  "projectName": "{{projectName}}",
  "workspaceId": "{{workspaceId}}",
  "lastUpdated": "{{timestamp}}",
  "foundation": {
    "company": "...",
    "industry": "...",
    "vertical": "...",
    "contactCount": 0,
    "activeContacts": 0
  },
  "metrics": {
    "emailOpenRate": 0.0,
    "emailClickRate": 0.0,
    "smsClickRate": 0.0
  }
}
```

## Error Handling

- **Project not found**: "Project {{projectId}} not found. Please verify the ID."
- **No foundation**: "No foundation document exists. Create one with the 'foundation-builder' skill."
- **API errors**: "Failed to fetch {{resource}}: {{error}}. Retrying..."

## Best Practices

- Always verify project exists before fetching details
- Cache foundation document to avoid repeated API calls
- Update foundation when significant changes occur
- Include timestamp for freshness tracking
```

---

## 🔧 Skills Loader Service

```typescript
// src/services/skills-loader.ts

import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';

export interface Skill {
  slug: string;
  name: string;
  version: string;
  category: 'platform' | 'marketing' | 'ecommerce' | 'saas' | 'b2b' | 'abm';
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
  examples: SkillExample[];
}

export class SkillsLoader {
  private skillsPath = path.join(__dirname, '../../skills');
  private cache = new Map<string, Skill>();
  
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
      
      const skillDirs = await fs.readdir(categoryPath);
      
      for (const skillDir of skillDirs) {
        const skillPath = path.join(categoryPath, skillDir);
        const skill = await this.loadSkill(skillPath);
        
        if (skill) {
          skills.push(skill);
          this.cache.set(skill.slug, skill);
        }
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
  async getSkillsForProject(projectConfig: ProjectConfig): Promise<Skill[]> {
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

---

## 🎨 Prompt Composer Service

```typescript
// src/services/prompt-composer.ts

import { SkillsLoader, Skill } from './skills-loader';

export class PromptComposer {
  constructor(private skillsLoader: SkillsLoader) {}
  
  /**
   * Compose system prompt for agent session
   */
  async composeSystemPrompt(
    agentRole: string,
    projectConfig: ProjectConfig,
    baseSystemPrompt: string
  ): Promise<string> {
    // Load skills for this project
    const skills = await this.skillsLoader.getSkillsForProject(projectConfig);
    
    // Load agent role definition
    const agentDef = await this.loadAgentDefinition(agentRole);
    
    // Compose prompt
    const sections = [
      baseSystemPrompt,
      this.formatAgentRole(agentDef),
      this.formatSkillsSection(skills),
      this.formatProjectContext(projectConfig)
    ];
    
    return sections.join('\n\n---\n\n');
  }
  
  private formatSkillsSection(skills: Skill[]): string {
    return `
## Available Skills

You have access to the following skills. Use them to accomplish your tasks.

${skills.map(skill => `
### ${skill.name} (\`${skill.slug}\`)

**Purpose**: ${skill.purpose}

**Inputs**:
${skill.inputs.map(i => `- \`${i.name}\` (${i.type}${i.required ? ', required' : ''}): ${i.description}`).join('\n')}

**Outputs**:
${skill.outputs.map(o => `- \`${o.name}\` (${o.type}): ${o.description}`).join('\n')}

**Usage**:
${skill.promptTemplate}

---
`).join('\n')}
`;
  }
  
  private formatAgentRole(agentDef: any): string {
    return `
## Your Role: ${agentDef.name}

${agentDef.description}

**Responsibilities**:
${agentDef.responsibilities.map((r: string) => `- ${r}`).join('\n')}

**Primary Deliverables**:
${agentDef.deliverables.map((d: string) => `- ${d}`).join('\n')}

**What You Never Do**:
${agentDef.neverDo.map((n: string) => `- ${n}`).join('\n')}
`;
  }
  
  private formatProjectContext(config: ProjectConfig): string {
    return `
## Project Context

**Project ID**: ${config.projectId}
**Vertical**: ${config.vertical}
**Workspace ID**: ${config.workspaceId}
`;
  }
}
```

---

## 🚀 Agent Harness Integration

```typescript
// src/services/agent-harness.ts

import { SkillsLoader } from './skills-loader';
import { PromptComposer } from './prompt-composer';

export class AgentHarness {
  private skillsLoader: SkillsLoader;
  private promptComposer: PromptComposer;
  
  constructor() {
    this.skillsLoader = new SkillsLoader();
    this.promptComposer = new PromptComposer(this.skillsLoader);
  }
  
  /**
   * Initialize agent session
   */
  async initializeSession(
    projectId: string,
    agentRole: string = 'research-analyst'
  ): Promise<AgentSession> {
    // Fetch project config from Bird Tasks API
    const projectConfig = await this.fetchProjectConfig(projectId);
    
    // Load base system prompt
    const baseSystemPrompt = await this.loadBaseSystemPrompt();
    
    // Compose full system prompt with skills
    const systemPrompt = await this.promptComposer.composeSystemPrompt(
      agentRole,
      projectConfig,
      baseSystemPrompt
    );
    
    // Create session
    return {
      sessionId: generateSessionId(),
      projectId,
      agentRole,
      systemPrompt,
      skills: await this.skillsLoader.getSkillsForProject(projectConfig),
      config: projectConfig
    };
  }
  
  private async fetchProjectConfig(projectId: string): Promise<ProjectConfig> {
    // Call Bird Tasks API via MCP
    const project = await this.birdAPI.invoke('tasks:getProject', {
      pathParams: { id: projectId }
    });
    
    return {
      projectId: project.id,
      projectName: project.name,
      workspaceId: project.workspaceId,
      vertical: project.metadata?.vertical || 'general',
      enabledSkills: project.metadata?.enabledSkills || [
        'platform/*',
        'marketing/*'
      ]
    };
  }
}
```

---

## 📦 Docker Image Build

```dockerfile
# Dockerfile

FROM node:20-alpine

WORKDIR /app

# Copy application
COPY package*.json ./
COPY src/ ./src/
COPY skills/ ./skills/          # ← Bundle all skills

# Install dependencies
RUN npm ci --production

# Build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 🎯 Project Configuration

### Stored in Bird Tasks API

```json
{
  "id": "proj-abc-123",
  "name": "Fashion Retailer Marketing",
  "workspaceId": "ws-456",
  "metadata": {
    "vertical": "ecommerce",
    "enabledSkills": [
      "platform/*",           // All platform skills
      "marketing/*",          // All marketing skills
      "ecommerce/*",          // All e-commerce skills
      "cart-recovery",        // Specific skill
      "product-recommendations"
    ],
    "agentRoles": [
      "research-analyst",
      "strategist",
      "audience-architect",
      "creative-director"
    ]
  }
}
```

---

## ✅ Benefits of This Approach

1. **Simple**: Skills bundled in Docker image, no complex distribution
2. **Fast**: No network calls to fetch skills, instant loading
3. **Declarative**: YAML-based like connector templates
4. **Flexible**: Project config controls which skills are enabled
5. **Versioned**: Docker image version = skills version
6. **Testable**: Skills on disk, easy to test
7. **Portable**: Works in any environment (local, cloud, edge)

---

## 🔄 Skill Updates

### Development Workflow

1. **Create/Update Skill**
   - Edit `skills/category/skill-name/skill.yml`
   - Edit `skills/category/skill-name/prompt.md`
   - Add examples

2. **Test Locally**
   - Run tests with new skill
   - Validate with LLM-as-a-judge

3. **Build Docker Image**
   - `docker build -t llmchain:v1.2.0 .`
   - New image includes updated skills

4. **Deploy**
   - Push image to registry
   - Update deployment to use new image
   - All sessions get new skills on next restart

---

## 🔗 Related

- [`skills/README.md`](./README.md) - Skills library
- [`../agents/README.md`](../agents/README.md) - Agent roles
- [`../prompts/README.md`](../prompts/README.md) - Prompt engineering
- [`../testing/README.md`](../testing/README.md) - Testing framework
