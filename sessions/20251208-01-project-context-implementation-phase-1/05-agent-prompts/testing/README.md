# Skill Testing & Evaluation System

> Comprehensive testing framework with fixtures, live mode, and LLM-as-a-judge

---

## 🎯 Overview

A multi-layered testing system for validating skill quality, correctness, and effectiveness:

1. **Unit Tests** - Test individual skill components with fixtures
2. **Integration Tests** - Test skills with mocked MCP responses
3. **Live Tests** - Test skills against real workspace
4. **LLM-as-a-Judge** - Evaluate skill quality and suggest improvements
5. **Regression Tests** - Ensure skills don't degrade over time
6. **Performance Tests** - Measure skill execution time and token usage

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING SYSTEM                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Unit Tests      │    │ Integration Tests│    │   Live Tests     │
│  (Fast)          │───►│  (Fixtures)      │───►│  (Real Data)     │
│  • Syntax        │    │  • Mock MCP      │    │  • Real MCP      │
│  • Structure     │    │  • Scenarios     │    │  • Real Workspace│
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                                          │
                                                          ▼
                        ┌─────────────────────────────────────────┐
                        │        LLM-as-a-Judge                   │
                        │  • Quality assessment                   │
                        │  • Improvement suggestions              │
                        │  • Comparative analysis                 │
                        └─────────────────────────────────────────┘
                                          │
                                          ▼
                        ┌─────────────────────────────────────────┐
                        │        Regression Suite                 │
                        │  • Historical baselines                 │
                        │  • Performance tracking                 │
                        │  • Quality trends                       │
                        └─────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
testing/
├── README.md                          # This file
├── fixtures/                          # Mock MCP responses
│   ├── bird-project-context/
│   │   ├── success.json              # Successful API responses
│   │   ├── empty-project.json        # Edge case: empty project
│   │   ├── missing-foundation.json   # Edge case: no foundation
│   │   └── error-responses.json      # Error scenarios
│   ├── bird-audience-creation/
│   │   └── ...
│   └── ...
├── scenarios/                         # Test scenarios
│   ├── ecommerce-fashion-retailer.json
│   ├── saas-project-management.json
│   ├── b2b-enterprise-software.json
│   └── ...
├── unit/                              # Unit tests
│   ├── skill-syntax.test.ts
│   ├── skill-structure.test.ts
│   └── prompt-validation.test.ts
├── integration/                       # Integration tests
│   ├── skill-execution.test.ts
│   ├── skill-composition.test.ts
│   └── mcp-mocking.test.ts
├── live/                              # Live tests
│   ├── live-workspace.test.ts
│   └── end-to-end.test.ts
├── evaluation/                        # LLM-as-a-judge
│   ├── skill-evaluator.ts
│   ├── evaluation-prompts.md
│   ├── rubrics/
│   │   ├── clarity.yaml
│   │   ├── completeness.yaml
│   │   ├── correctness.yaml
│   │   └── effectiveness.yaml
│   └── reports/
│       └── .gitkeep
├── regression/                        # Regression tests
│   ├── baselines/
│   │   └── skill-outputs/
│   └── regression.test.ts
└── performance/                       # Performance tests
    ├── token-usage.test.ts
    └── execution-time.test.ts
```

---

## 🧪 1. Unit Tests

### Purpose
Validate skill structure and syntax without executing

### Example: Skill Structure Test

```typescript
// testing/unit/skill-structure.test.ts

import { describe, it, expect } from 'vitest';
import { loadSkill } from '../utils/skill-loader';

describe('Skill Structure Validation', () => {
  const skills = [
    'bird-project-context',
    'bird-audience-creation',
    'cart-recovery',
    // ... all skills
  ];
  
  skills.forEach(skillName => {
    describe(`${skillName}`, () => {
      let skill: Skill;
      
      beforeAll(() => {
        skill = loadSkill(skillName);
      });
      
      it('has valid metadata', () => {
        expect(skill.name).toBe(skillName);
        expect(skill.displayName).toBeTruthy();
        expect(skill.description).toBeTruthy();
        expect(skill.category).toMatch(/platform|marketing|ecommerce|saas|abm/);
        expect(skill.version).toMatch(/^\d+\.\d+\.\d+$/);
      });
      
      it('has valid spec', () => {
        expect(skill.spec.purpose).toBeTruthy();
        expect(Array.isArray(skill.spec.inputs)).toBe(true);
        expect(Array.isArray(skill.spec.outputs)).toBe(true);
        expect(Array.isArray(skill.spec.allowedTools)).toBe(true);
      });
      
      it('has prompt template', () => {
        expect(skill.promptTemplate).toBeTruthy();
        expect(skill.promptTemplate.length).toBeGreaterThan(100);
      });
      
      it('has examples', () => {
        expect(Array.isArray(skill.examples)).toBe(true);
        expect(skill.examples.length).toBeGreaterThan(0);
        
        skill.examples.forEach(example => {
          expect(example.title).toBeTruthy();
          expect(example.description).toBeTruthy();
          expect(example.input).toBeDefined();
        });
      });
      
      it('has valid dependencies', () => {
        skill.spec.dependencies?.forEach(dep => {
          expect(dep.skillType).toBeTruthy();
          expect(dep.version).toMatch(/^[\^~]?\d+\.\d+\.\d+$/);
        });
      });
      
      it('allowed tools are valid MCP operations', () => {
        const validTools = [
          'mcp__nest-api__invoke_operation',
          'mcp__nest-api__batch_invoke',
          'mcp__nest-api__show_schema',
        ];
        
        skill.spec.allowedTools.forEach(tool => {
          expect(validTools).toContain(tool);
        });
      });
    });
  });
});
```

---

## 🔌 2. Integration Tests with Fixtures

### Purpose
Test skill execution with mocked MCP responses

### Fixture Structure

```json
// testing/fixtures/bird-project-context/success.json
{
  "scenario": "successful_project_fetch",
  "description": "Project with complete foundation and recent activity",
  "mocks": {
    "tasks:getProject": {
      "request": {
        "operation": "tasks:getProject",
        "pathParams": { "id": "proj-test-123" }
      },
      "response": {
        "id": "proj-test-123",
        "name": "Fashion Retailer Marketing",
        "description": "E-commerce marketing campaigns",
        "workspaceId": "ws-456",
        "metadata": {
          "foundationDocumentId": "doc-789",
          "kbPath": "/agent-memory/project-proj-test-123/",
          "dashboardId": "dash-101"
        }
      }
    },
    "content:getDocument": {
      "request": {
        "operation": "content:getDocument",
        "pathParams": { "id": "doc-789" }
      },
      "response": {
        "id": "doc-789",
        "title": "Foundation Document",
        "content": "# Foundation\n\n## Business Context\n\nCompany: Fashion Retailer Inc.\nIndustry: E-commerce (Fashion)\nTarget: B2C\n\n## Customer Base\n\nTotal Contacts: 50,000\nActive (30d): 12,000\n\n## Performance\n\nEmail Open Rate: 18%\nEmail Click Rate: 2.1%\nSMS Click Rate: 8%"
      }
    },
    "tasks:listTasks": {
      "request": {
        "operation": "tasks:listTasks",
        "body": {
          "projectId": "proj-test-123",
          "limit": 5
        }
      },
      "response": {
        "tasks": [
          {
            "id": "task-001",
            "title": "Black Friday Campaign",
            "status": "completed",
            "createdAt": "2024-11-15T10:00:00Z"
          }
        ]
      }
    }
  },
  "expectedOutput": {
    "foundation": {
      "company": "Fashion Retailer Inc.",
      "industry": "E-commerce (Fashion)",
      "vertical": "B2C",
      "contactCount": 50000,
      "activeContacts": 12000
    },
    "metrics": {
      "emailOpenRate": 0.18,
      "emailClickRate": 0.021,
      "smsClickRate": 0.08
    },
    "recentActivity": [
      {
        "id": "task-001",
        "title": "Black Friday Campaign",
        "status": "completed"
      }
    ]
  }
}
```

### Integration Test

```typescript
// testing/integration/skill-execution.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { SkillExecutor } from '../utils/skill-executor';
import { MockMCPServer } from '../utils/mock-mcp-server';
import { loadFixture } from '../utils/fixture-loader';

describe('Skill Execution with Fixtures', () => {
  let executor: SkillExecutor;
  let mockMCP: MockMCPServer;
  
  beforeEach(() => {
    mockMCP = new MockMCPServer();
    executor = new SkillExecutor({ mcpServer: mockMCP });
  });
  
  describe('bird-project-context', () => {
    it('successfully fetches project context', async () => {
      // Load fixture
      const fixture = loadFixture('bird-project-context/success.json');
      
      // Configure mocks
      mockMCP.loadFixture(fixture);
      
      // Execute skill
      const result = await executor.executeSkill('bird-project-context', {
        projectId: 'proj-test-123'
      });
      
      // Verify output
      expect(result.success).toBe(true);
      expect(result.deliverables).toHaveProperty('foundation.md');
      expect(result.deliverables).toHaveProperty('metadata.json');
      
      // Verify content matches expected
      const foundation = result.deliverables['foundation.md'];
      expect(foundation).toContain('Fashion Retailer Inc.');
      expect(foundation).toContain('50,000');
      
      // Verify API calls made
      expect(mockMCP.calls).toHaveLength(3);
      expect(mockMCP.calls[0].operation).toBe('tasks:getProject');
      expect(mockMCP.calls[1].operation).toBe('content:getDocument');
      expect(mockMCP.calls[2].operation).toBe('tasks:listTasks');
    });
    
    it('handles missing foundation document', async () => {
      const fixture = loadFixture('bird-project-context/missing-foundation.json');
      mockMCP.loadFixture(fixture);
      
      const result = await executor.executeSkill('bird-project-context', {
        projectId: 'proj-test-123'
      });
      
      // Should offer to create foundation
      expect(result.success).toBe(true);
      expect(result.message).toContain('No foundation document found');
      expect(result.suggestions).toContain('create foundation');
    });
    
    it('handles API errors gracefully', async () => {
      const fixture = loadFixture('bird-project-context/error-responses.json');
      mockMCP.loadFixture(fixture);
      
      const result = await executor.executeSkill('bird-project-context', {
        projectId: 'proj-invalid'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.error.message).toContain('Project not found');
      expect(result.suggestions).toContain('create a project first');
    });
  });
  
  describe('cart-recovery (skill composition)', () => {
    it('successfully composes dependent skills', async () => {
      const fixture = loadFixture('cart-recovery/success.json');
      mockMCP.loadFixture(fixture);
      
      const result = await executor.executeSkill('cart-recovery', {
        abandonmentWindow: '24h',
        incentiveStrategy: 'discount'
      });
      
      expect(result.success).toBe(true);
      
      // Verify dependent skills were called
      expect(mockMCP.getCallsForSkill('bird-audience-creation')).toHaveLength(1);
      expect(mockMCP.getCallsForSkill('bird-template-management')).toHaveLength(1);
      
      // Verify deliverables
      expect(result.deliverables).toHaveProperty('audience.tf');
      expect(result.deliverables).toHaveProperty('template.tf');
      expect(result.deliverables).toHaveProperty('campaign.tf');
    });
  });
});
```

---

## 🌐 3. Live Tests

### Purpose
Test skills against real workspace with real data

### Configuration

```typescript
// testing/live/config.ts

export const liveTestConfig = {
  enabled: process.env.ENABLE_LIVE_TESTS === 'true',
  workspaceId: process.env.TEST_WORKSPACE_ID,
  apiUrl: process.env.BIRD_API_URL,
  accessToken: process.env.BIRD_ACCESS_TOKEN,
  
  // Test project (created once, reused)
  testProject: {
    id: process.env.TEST_PROJECT_ID,
    name: 'Skill Testing Project',
    description: 'Automated skill testing'
  },
  
  // Cleanup after tests
  cleanup: process.env.CLEANUP_AFTER_TESTS !== 'false',
};
```

### Live Test

```typescript
// testing/live/live-workspace.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SkillExecutor } from '../utils/skill-executor';
import { BirdAPIClient } from '../../src/services/bird-api';
import { liveTestConfig } from './config';

describe.skipIf(!liveTestConfig.enabled)('Live Workspace Tests', () => {
  let executor: SkillExecutor;
  let birdAPI: BirdAPIClient;
  let testProjectId: string;
  
  beforeAll(async () => {
    birdAPI = new BirdAPIClient(liveTestConfig);
    executor = new SkillExecutor({ 
      mcpServer: birdAPI,
      mode: 'live'
    });
    
    // Create or get test project
    testProjectId = await setupTestProject(birdAPI);
  });
  
  afterAll(async () => {
    if (liveTestConfig.cleanup) {
      await cleanupTestProject(birdAPI, testProjectId);
    }
  });
  
  describe('bird-project-context (live)', () => {
    it('fetches real project data', async () => {
      const result = await executor.executeSkill('bird-project-context', {
        projectId: testProjectId
      });
      
      expect(result.success).toBe(true);
      expect(result.deliverables).toHaveProperty('foundation.md');
      
      // Verify real data structure
      const foundation = result.deliverables['foundation.md'];
      expect(foundation).toBeTruthy();
      expect(foundation.length).toBeGreaterThan(100);
    }, 30000); // 30s timeout for live API
  });
  
  describe('bird-audience-creation (live)', () => {
    it('creates real audience', async () => {
      const result = await executor.executeSkill('bird-audience-creation', {
        name: 'Test Audience - Active Users',
        criteria: {
          operator: 'and',
          children: [
            {
              field: 'last_seen_at',
              operator: 'gte',
              value: '30d'
            }
          ]
        }
      });
      
      expect(result.success).toBe(true);
      expect(result.deliverables).toHaveProperty('audience.tf');
      
      // Verify audience was created
      const audienceId = result.metadata.audienceId;
      const audience = await birdAPI.invoke('audiences:getAudience', {
        pathParams: { id: audienceId }
      });
      
      expect(audience.name).toBe('Test Audience - Active Users');
    }, 30000);
  });
});
```

---

## 🤖 4. LLM-as-a-Judge Evaluation

### Purpose
Use LLM to evaluate skill quality and suggest improvements

### Evaluation Rubrics

```yaml
# testing/evaluation/rubrics/clarity.yaml
name: Clarity
description: How clear and understandable is the skill?
criteria:
  - name: Instructions Clarity
    weight: 0.3
    description: Are the instructions clear and unambiguous?
    scale:
      1: Very unclear, confusing
      2: Somewhat unclear
      3: Moderately clear
      4: Clear
      5: Exceptionally clear
  
  - name: Example Quality
    weight: 0.3
    description: Are examples helpful and illustrative?
    scale:
      1: No examples or very poor
      2: Minimal examples
      3: Adequate examples
      4: Good examples
      5: Excellent, comprehensive examples
  
  - name: Language Simplicity
    weight: 0.2
    description: Is the language simple and accessible?
    scale:
      1: Very complex, jargon-heavy
      2: Somewhat complex
      3: Moderately simple
      4: Simple
      5: Very simple and accessible
  
  - name: Structure
    weight: 0.2
    description: Is the skill well-structured?
    scale:
      1: Very poorly structured
      2: Poorly structured
      3: Adequately structured
      4: Well structured
      5: Excellently structured
```

### Evaluator Implementation

```typescript
// testing/evaluation/skill-evaluator.ts

import Anthropic from '@anthropic-ai/sdk';
import { loadRubric } from './rubric-loader';
import { loadSkill } from '../utils/skill-loader';

export class SkillEvaluator {
  private anthropic: Anthropic;
  
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  
  async evaluateSkill(skillName: string): Promise<SkillEvaluation> {
    const skill = loadSkill(skillName);
    const rubrics = [
      loadRubric('clarity'),
      loadRubric('completeness'),
      loadRubric('correctness'),
      loadRubric('effectiveness')
    ];
    
    const evaluations = await Promise.all(
      rubrics.map(rubric => this.evaluateAgainstRubric(skill, rubric))
    );
    
    const overallScore = this.calculateOverallScore(evaluations);
    const suggestions = await this.generateImprovements(skill, evaluations);
    
    return {
      skillName,
      timestamp: new Date().toISOString(),
      rubrics: evaluations,
      overallScore,
      suggestions,
      pass: overallScore >= 3.5 // Threshold
    };
  }
  
  private async evaluateAgainstRubric(
    skill: Skill,
    rubric: Rubric
  ): Promise<RubricEvaluation> {
    const prompt = `
You are an expert evaluator of AI agent skills. Evaluate the following skill against the provided rubric.

## Skill to Evaluate

**Name**: ${skill.name}
**Description**: ${skill.description}
**Category**: ${skill.category}

**Purpose**: ${skill.spec.purpose}

**Inputs**:
${JSON.stringify(skill.spec.inputs, null, 2)}

**Outputs**:
${JSON.stringify(skill.spec.outputs, null, 2)}

**Prompt Template**:
${skill.promptTemplate}

**Examples**:
${JSON.stringify(skill.examples, null, 2)}

## Rubric: ${rubric.name}

${rubric.description}

### Criteria

${rubric.criteria.map(c => `
**${c.name}** (weight: ${c.weight})
${c.description}

Scale:
${Object.entries(c.scale).map(([score, desc]) => `${score}: ${desc}`).join('\n')}
`).join('\n\n')}

## Your Task

Evaluate this skill against each criterion. For each criterion:
1. Provide a score (1-5)
2. Explain your reasoning
3. Provide specific examples from the skill

Return your evaluation in JSON format:
{
  "criteria": [
    {
      "name": "criterion name",
      "score": 1-5,
      "reasoning": "your explanation",
      "examples": ["specific examples from the skill"]
    }
  ]
}
`;
    
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const evaluation = JSON.parse(response.content[0].text);
    
    return {
      rubricName: rubric.name,
      criteria: evaluation.criteria,
      score: this.calculateRubricScore(evaluation.criteria, rubric)
    };
  }
  
  private async generateImprovements(
    skill: Skill,
    evaluations: RubricEvaluation[]
  ): Promise<string[]> {
    // Find low-scoring criteria
    const weaknesses = evaluations.flatMap(e => 
      e.criteria.filter(c => c.score < 3)
    );
    
    if (weaknesses.length === 0) {
      return ['Skill is high quality, no major improvements needed'];
    }
    
    const prompt = `
You are an expert at improving AI agent skills. Based on the evaluation results, suggest specific, actionable improvements.

## Skill

**Name**: ${skill.name}
**Current Prompt**:
${skill.promptTemplate}

## Weaknesses Identified

${weaknesses.map(w => `
**${w.name}**: Score ${w.score}/5
Reasoning: ${w.reasoning}
Examples: ${w.examples.join(', ')}
`).join('\n\n')}

## Your Task

Provide 3-5 specific, actionable improvements to address these weaknesses.
Each improvement should:
1. Be concrete and specific
2. Show exactly what to change
3. Explain why it will help

Format as a JSON array of strings.
`;
    
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    return JSON.parse(response.content[0].text);
  }
  
  async compareSkills(
    skillName1: string,
    skillName2: string
  ): Promise<SkillComparison> {
    const [eval1, eval2] = await Promise.all([
      this.evaluateSkill(skillName1),
      this.evaluateSkill(skillName2)
    ]);
    
    const prompt = `
Compare these two skills and identify which is better and why.

## Skill 1: ${skillName1}
Overall Score: ${eval1.overallScore}
Rubric Scores:
${eval1.rubrics.map(r => `- ${r.rubricName}: ${r.score}`).join('\n')}

## Skill 2: ${skillName2}
Overall Score: ${eval2.overallScore}
Rubric Scores:
${eval2.rubrics.map(r => `- ${r.rubricName}: ${r.score}`).join('\n')}

Provide a comparison analysis including:
1. Which skill is better overall
2. Specific strengths of each
3. Specific weaknesses of each
4. Recommendations for the weaker skill
`;
    
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    return {
      skill1: eval1,
      skill2: eval2,
      analysis: response.content[0].text
    };
  }
}
```

### Evaluation Test

```typescript
// testing/evaluation/evaluation.test.ts

import { describe, it, expect } from 'vitest';
import { SkillEvaluator } from './skill-evaluator';

describe('LLM-as-a-Judge Evaluation', () => {
  const evaluator = new SkillEvaluator();
  
  it('evaluates skill quality', async () => {
    const evaluation = await evaluator.evaluateSkill('bird-project-context');
    
    expect(evaluation.skillName).toBe('bird-project-context');
    expect(evaluation.overallScore).toBeGreaterThan(0);
    expect(evaluation.overallScore).toBeLessThanOrEqual(5);
    expect(evaluation.rubrics).toHaveLength(4);
    expect(Array.isArray(evaluation.suggestions)).toBe(true);
    
    // Save report
    await saveEvaluationReport(evaluation);
  }, 60000); // 60s timeout for LLM
  
  it('compares two skills', async () => {
    const comparison = await evaluator.compareSkills(
      'bird-project-context',
      'bird-audience-creation'
    );
    
    expect(comparison.skill1).toBeDefined();
    expect(comparison.skill2).toBeDefined();
    expect(comparison.analysis).toBeTruthy();
    
    // Save comparison report
    await saveComparisonReport(comparison);
  }, 120000);
  
  it('generates actionable improvements', async () => {
    const evaluation = await evaluator.evaluateSkill('cart-recovery');
    
    expect(evaluation.suggestions.length).toBeGreaterThan(0);
    
    evaluation.suggestions.forEach(suggestion => {
      expect(suggestion).toBeTruthy();
      expect(suggestion.length).toBeGreaterThan(20);
    });
  }, 60000);
});
```

---

## 📊 5. Regression Tests

### Purpose
Ensure skills don't degrade over time

### Baseline Creation

```typescript
// testing/regression/create-baseline.ts

import { SkillExecutor } from '../utils/skill-executor';
import { loadFixture } from '../utils/fixture-loader';
import { saveBaseline } from './baseline-manager';

export async function createBaseline(skillName: string) {
  const executor = new SkillExecutor({ mode: 'fixture' });
  const fixture = loadFixture(`${skillName}/success.json`);
  
  const result = await executor.executeSkill(skillName, fixture.input);
  
  const baseline = {
    skillName,
    version: getSkillVersion(skillName),
    timestamp: new Date().toISOString(),
    fixture: fixture.scenario,
    output: result.deliverables,
    metadata: {
      apiCalls: result.apiCalls,
      executionTime: result.executionTime,
      tokenUsage: result.tokenUsage
    }
  };
  
  await saveBaseline(baseline);
  console.log(`✅ Baseline created for ${skillName}`);
}
```

### Regression Test

```typescript
// testing/regression/regression.test.ts

import { describe, it, expect } from 'vitest';
import { SkillExecutor } from '../utils/skill-executor';
import { loadBaseline } from './baseline-manager';
import { compareOutputs } from './output-comparator';

describe('Regression Tests', () => {
  const skills = ['bird-project-context', 'cart-recovery', /* ... */];
  
  skills.forEach(skillName => {
    it(`${skillName} produces consistent output`, async () => {
      const baseline = loadBaseline(skillName);
      const executor = new SkillExecutor({ mode: 'fixture' });
      
      const result = await executor.executeSkill(
        skillName,
        baseline.fixture.input
      );
      
      // Compare outputs
      const comparison = compareOutputs(
        baseline.output,
        result.deliverables
      );
      
      expect(comparison.identical).toBe(true);
      
      if (!comparison.identical) {
        console.log('Differences found:');
        console.log(comparison.differences);
      }
      
      // Performance shouldn't degrade
      expect(result.executionTime).toBeLessThanOrEqual(
        baseline.metadata.executionTime * 1.2 // 20% tolerance
      );
    });
  });
});
```

---

## ⚡ 6. Performance Tests

### Purpose
Measure and track performance metrics

```typescript
// testing/performance/token-usage.test.ts

import { describe, it, expect } from 'vitest';
import { SkillExecutor } from '../utils/skill-executor';
import { trackMetrics } from './metrics-tracker';

describe('Performance: Token Usage', () => {
  const executor = new SkillExecutor({ mode: 'fixture', trackTokens: true });
  
  it('bird-project-context uses reasonable tokens', async () => {
    const result = await executor.executeSkill('bird-project-context', {
      projectId: 'proj-test-123'
    });
    
    expect(result.tokenUsage.input).toBeLessThan(2000);
    expect(result.tokenUsage.output).toBeLessThan(1000);
    expect(result.tokenUsage.total).toBeLessThan(3000);
    
    await trackMetrics('bird-project-context', {
      tokenUsage: result.tokenUsage,
      timestamp: new Date()
    });
  });
  
  it('cart-recovery (complex skill) uses reasonable tokens', async () => {
    const result = await executor.executeSkill('cart-recovery', {
      abandonmentWindow: '24h',
      incentiveStrategy: 'discount'
    });
    
    // Complex skill with dependencies can use more
    expect(result.tokenUsage.total).toBeLessThan(8000);
    
    await trackMetrics('cart-recovery', {
      tokenUsage: result.tokenUsage,
      timestamp: new Date()
    });
  });
});
```

---

## 🎯 7. Test Scenarios

### Purpose
Realistic end-to-end scenarios for different verticals

```json
// testing/scenarios/ecommerce-fashion-retailer.json
{
  "name": "E-commerce Fashion Retailer",
  "description": "Complete workflow for fashion e-commerce company",
  "vertical": "ecommerce",
  "industry": "retail",
  "workspace": {
    "contacts": 50000,
    "channels": ["email", "sms"],
    "recentCampaigns": 12,
    "avgOpenRate": 0.18,
    "avgClickRate": 0.021
  },
  "workflow": [
    {
      "phase": "ideation",
      "agent": "research-analyst",
      "skills": ["bird-project-context", "bird-data-queries"],
      "expectedDeliverables": ["foundation.md", "data-model.md"]
    },
    {
      "phase": "ideation",
      "agent": "strategist",
      "skills": ["campaign-strategy", "customer-lifecycle"],
      "expectedDeliverables": ["strategic-brief.md"]
    },
    {
      "phase": "planning",
      "agent": "audience-architect",
      "skills": ["bird-audience-creation", "audience-segmentation"],
      "expectedDeliverables": ["audience.tf"]
    },
    {
      "phase": "planning",
      "agent": "creative-director",
      "skills": ["email-copywriting", "product-recommendations"],
      "expectedDeliverables": ["template.tf"]
    },
    {
      "phase": "implementation",
      "agent": "campaign-engineer",
      "skills": ["bird-campaign-deployment", "bird-terraform-resources"],
      "expectedDeliverables": ["campaign.tf", "deployment-plan.md"]
    }
  ],
  "successCriteria": {
    "allDeliverablesProduced": true,
    "terraformValid": true,
    "executionTime": "<5min",
    "qualityScore": ">4.0"
  }
}
```

---

## 🚀 Running Tests

### Commands

```bash
# Unit tests (fast)
npm test -- unit

# Integration tests with fixtures
npm test -- integration

# Live tests (requires credentials)
ENABLE_LIVE_TESTS=true npm test -- live

# LLM evaluation
npm run evaluate:skills

# Regression tests
npm test -- regression

# Performance tests
npm test -- performance

# All tests
npm test

# Generate coverage report
npm run test:coverage

# Watch mode
npm test -- --watch
```

### CI/CD Integration

```yaml
# .github/workflows/test-skills.yml
name: Test Skills

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- unit
  
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- integration
  
  llm-evaluation:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run evaluate:skills
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - uses: actions/upload-artifact@v3
        with:
          name: evaluation-reports
          path: testing/evaluation/reports/
  
  regression-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- regression
```

---

## 📋 Next Steps

1. **Set up testing infrastructure** - Install dependencies, create directories
2. **Create fixtures** - Mock MCP responses for all skills
3. **Write unit tests** - Validate skill structure
4. **Write integration tests** - Test with fixtures
5. **Set up LLM evaluator** - Configure Anthropic API
6. **Create baselines** - Generate regression baselines
7. **Run evaluation** - Evaluate all skills
8. **Iterate** - Improve skills based on feedback

---

## 🔗 Related

- [`../skills/README.md`](../skills/README.md) - Skill specifications
- [`../prompts/README.md`](../prompts/README.md) - Prompt engineering
- [`../implementation/README.md`](../implementation/README.md) - Implementation guide
