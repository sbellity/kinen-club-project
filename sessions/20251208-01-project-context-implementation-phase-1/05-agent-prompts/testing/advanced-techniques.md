# Advanced Testing Techniques

> Innovative approaches to skill testing and evaluation

---

## 🎯 Additional Testing Approaches

### 1. **Adversarial Testing**

Test skills with intentionally difficult or edge-case inputs

```typescript
// testing/adversarial/adversarial.test.ts

describe('Adversarial Testing', () => {
  const adversarialInputs = {
    'bird-project-context': [
      {
        name: 'Empty project',
        input: { projectId: 'proj-empty' },
        expectation: 'Graceful handling, offer to create foundation'
      },
      {
        name: 'Malformed project ID',
        input: { projectId: 'invalid-id-format' },
        expectation: 'Clear error message, suggest correct format'
      },
      {
        name: 'Very large project',
        input: { projectId: 'proj-1million-contacts' },
        expectation: 'Handle without timeout, paginate if needed'
      },
      {
        name: 'Unicode in project name',
        input: { projectId: 'proj-测试-🚀' },
        expectation: 'Handle unicode correctly'
      }
    ],
    'cart-recovery': [
      {
        name: 'No abandoned carts',
        input: { abandonmentWindow: '24h' },
        expectation: 'Inform user, suggest alternative campaigns'
      },
      {
        name: 'Invalid time window',
        input: { abandonmentWindow: 'tomorrow' },
        expectation: 'Reject with clear error, show valid formats'
      },
      {
        name: 'Extreme time window',
        input: { abandonmentWindow: '365d' },
        expectation: 'Warn about large audience, confirm intent'
      }
    ]
  };
  
  Object.entries(adversarialInputs).forEach(([skillName, tests]) => {
    describe(skillName, () => {
      tests.forEach(test => {
        it(`handles: ${test.name}`, async () => {
          const result = await executor.executeSkill(skillName, test.input);
          
          // Verify expectation met
          expect(result.message || result.error?.message)
            .toContain(test.expectation);
        });
      });
    });
  });
});
```

---

### 2. **Mutation Testing**

Test if tests actually catch errors by introducing mutations

```typescript
// testing/mutation/mutation-tester.ts

export class MutationTester {
  async testSkillMutations(skillName: string): Promise<MutationReport> {
    const skill = loadSkill(skillName);
    const mutations = this.generateMutations(skill);
    
    const results = await Promise.all(
      mutations.map(async mutation => {
        // Apply mutation
        const mutatedSkill = this.applyMutation(skill, mutation);
        
        // Run tests
        const testResult = await this.runTests(mutatedSkill);
        
        return {
          mutation,
          detected: !testResult.passed,
          testsFailed: testResult.failedTests
        };
      })
    );
    
    const detectionRate = results.filter(r => r.detected).length / results.length;
    
    return {
      skillName,
      totalMutations: mutations.length,
      detected: results.filter(r => r.detected).length,
      detectionRate,
      undetectedMutations: results.filter(r => !r.detected)
    };
  }
  
  private generateMutations(skill: Skill): Mutation[] {
    return [
      // Remove required input
      {
        type: 'remove_required_input',
        target: skill.spec.inputs[0].name
      },
      // Change output format
      {
        type: 'change_output_format',
        target: skill.spec.outputs[0].format,
        newValue: 'invalid'
      },
      // Remove allowed tool
      {
        type: 'remove_allowed_tool',
        target: skill.spec.allowedTools[0]
      },
      // Corrupt prompt template
      {
        type: 'corrupt_prompt',
        target: 'instructions',
        corruption: 'remove_step'
      }
    ];
  }
}

// Usage
describe('Mutation Testing', () => {
  it('tests catch skill mutations', async () => {
    const tester = new MutationTester();
    const report = await tester.testSkillMutations('bird-project-context');
    
    // Should detect at least 80% of mutations
    expect(report.detectionRate).toBeGreaterThan(0.8);
    
    if (report.detectionRate < 0.8) {
      console.log('Undetected mutations:', report.undetectedMutations);
      console.log('Need to add tests for these cases!');
    }
  });
});
```

---

### 3. **Property-Based Testing**

Generate random inputs and verify properties hold

```typescript
// testing/property/property.test.ts

import { fc } from 'fast-check';

describe('Property-Based Testing', () => {
  describe('bird-audience-creation', () => {
    it('always produces valid Terraform', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random audience criteria
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            criteria: fc.record({
              operator: fc.constantFrom('and', 'or'),
              children: fc.array(
                fc.record({
                  field: fc.constantFrom('email', 'last_seen_at', 'lifetime_value'),
                  operator: fc.constantFrom('eq', 'gte', 'lte', 'contains'),
                  value: fc.oneof(fc.string(), fc.integer(), fc.date())
                }),
                { minLength: 1, maxLength: 5 }
              )
            })
          }),
          async (input) => {
            const result = await executor.executeSkill('bird-audience-creation', input);
            
            // Property: Always produces valid Terraform
            if (result.success) {
              const terraform = result.deliverables['audience.tf'];
              expect(terraform).toBeTruthy();
              expect(validateTerraform(terraform)).toBe(true);
            }
          }
        ),
        { numRuns: 100 } // Run 100 random tests
      );
    });
  });
  
  describe('email-copywriting', () => {
    it('never generates offensive content', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            product: fc.string(),
            tone: fc.constantFrom('professional', 'casual', 'urgent'),
            audience: fc.constantFrom('b2b', 'b2c', 'enterprise')
          }),
          async (input) => {
            const result = await executor.executeSkill('email-copywriting', input);
            
            // Property: Never contains offensive words
            const offensiveWords = loadOffensiveWordsList();
            const copy = result.deliverables['copy-variants.md'];
            
            offensiveWords.forEach(word => {
              expect(copy.toLowerCase()).not.toContain(word);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
```

---

### 4. **Differential Testing**

Compare skill outputs across different implementations or versions

```typescript
// testing/differential/differential.test.ts

describe('Differential Testing', () => {
  it('compares v1 vs v2 of skill', async () => {
    const skillV1 = loadSkill('bird-project-context', 'v1.0.0');
    const skillV2 = loadSkill('bird-project-context', 'v2.0.0');
    
    const input = { projectId: 'proj-test-123' };
    
    const [resultV1, resultV2] = await Promise.all([
      executeSkillVersion(skillV1, input),
      executeSkillVersion(skillV2, input)
    ]);
    
    // Compare outputs
    const diff = compareOutputs(resultV1.deliverables, resultV2.deliverables);
    
    // Document differences
    if (!diff.identical) {
      console.log('Version differences:');
      console.log(diff.differences);
      
      // Verify improvements
      expect(resultV2.executionTime).toBeLessThanOrEqual(resultV1.executionTime);
      expect(resultV2.tokenUsage.total).toBeLessThanOrEqual(resultV1.tokenUsage.total);
    }
  });
  
  it('compares skill across different LLM models', async () => {
    const models = ['claude-sonnet-4', 'claude-opus-4', 'gpt-4'];
    
    const results = await Promise.all(
      models.map(model => 
        executor.executeSkill('cart-recovery', {
          abandonmentWindow: '24h',
          model // Override model
        })
      )
    );
    
    // All models should produce valid Terraform
    results.forEach((result, i) => {
      expect(result.success).toBe(true);
      expect(validateTerraform(result.deliverables['campaign.tf'])).toBe(true);
      
      console.log(`${models[i]}: ${result.executionTime}ms, ${result.tokenUsage.total} tokens`);
    });
  });
});
```

---

### 5. **Chaos Testing**

Test resilience under adverse conditions

```typescript
// testing/chaos/chaos.test.ts

describe('Chaos Testing', () => {
  it('handles intermittent API failures', async () => {
    // Configure chaos: 30% of API calls fail randomly
    mockMCP.enableChaos({
      failureRate: 0.3,
      failureTypes: ['timeout', 'network_error', '500_error']
    });
    
    const result = await executor.executeSkill('bird-project-context', {
      projectId: 'proj-test-123',
      retries: 3 // Enable retries
    });
    
    // Should eventually succeed with retries
    expect(result.success).toBe(true);
    expect(result.metadata.retries).toBeGreaterThan(0);
  });
  
  it('handles rate limiting', async () => {
    mockMCP.enableRateLimiting({
      requestsPerSecond: 2
    });
    
    // Execute multiple skills in parallel
    const results = await Promise.all([
      executor.executeSkill('bird-project-context', { projectId: 'proj-1' }),
      executor.executeSkill('bird-audience-creation', { name: 'Audience 1' }),
      executor.executeSkill('bird-template-management', { name: 'Template 1' })
    ]);
    
    // All should succeed despite rate limiting
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
  });
  
  it('handles partial API responses', async () => {
    // Some fields missing from API response
    mockMCP.enablePartialResponses({
      missingFieldRate: 0.2
    });
    
    const result = await executor.executeSkill('bird-project-context', {
      projectId: 'proj-test-123'
    });
    
    // Should handle gracefully
    expect(result.success).toBe(true);
    expect(result.warnings).toBeDefined();
  });
});
```

---

### 6. **Metamorphic Testing**

Test relationships between inputs and outputs

```typescript
// testing/metamorphic/metamorphic.test.ts

describe('Metamorphic Testing', () => {
  describe('bird-audience-creation', () => {
    it('adding more filters reduces audience size', async () => {
      // Base audience
      const result1 = await executor.executeSkill('bird-audience-creation', {
        name: 'Active Users',
        criteria: {
          operator: 'and',
          children: [
            { field: 'last_seen_at', operator: 'gte', value: '30d' }
          ]
        }
      });
      
      // More restrictive audience
      const result2 = await executor.executeSkill('bird-audience-creation', {
        name: 'Active High-Value Users',
        criteria: {
          operator: 'and',
          children: [
            { field: 'last_seen_at', operator: 'gte', value: '30d' },
            { field: 'lifetime_value', operator: 'gte', value: 1000 }
          ]
        }
      });
      
      // Metamorphic relation: More filters → Smaller audience
      expect(result2.metadata.estimatedSize).toBeLessThan(result1.metadata.estimatedSize);
    });
  });
  
  describe('email-copywriting', () => {
    it('urgent tone increases CTA prominence', async () => {
      const [casual, urgent] = await Promise.all([
        executor.executeSkill('email-copywriting', {
          product: 'Sale',
          tone: 'casual'
        }),
        executor.executeSkill('email-copywriting', {
          product: 'Sale',
          tone: 'urgent'
        })
      ]);
      
      // Metamorphic relation: Urgent tone → More prominent CTA
      const casualCTACount = countCTAs(casual.deliverables['copy-variants.md']);
      const urgentCTACount = countCTAs(urgent.deliverables['copy-variants.md']);
      
      expect(urgentCTACount).toBeGreaterThanOrEqual(casualCTACount);
    });
  });
});
```

---

### 7. **A/B Testing Skills**

Compare different skill implementations

```typescript
// testing/ab-testing/skill-ab-test.ts

export class SkillABTester {
  async runABTest(
    skillA: string,
    skillB: string,
    testCases: TestCase[]
  ): Promise<ABTestReport> {
    const results = await Promise.all(
      testCases.map(async testCase => {
        const [resultA, resultB] = await Promise.all([
          executor.executeSkill(skillA, testCase.input),
          executor.executeSkill(skillB, testCase.input)
        ]);
        
        // Get LLM to judge which is better
        const judgment = await this.judgeOutputs(
          testCase,
          resultA.deliverables,
          resultB.deliverables
        );
        
        return {
          testCase: testCase.name,
          winner: judgment.winner,
          reasoning: judgment.reasoning,
          metrics: {
            skillA: {
              executionTime: resultA.executionTime,
              tokenUsage: resultA.tokenUsage.total,
              qualityScore: judgment.qualityScoreA
            },
            skillB: {
              executionTime: resultB.executionTime,
              tokenUsage: resultB.tokenUsage.total,
              qualityScore: judgment.qualityScoreB
            }
          }
        };
      })
    );
    
    const skillAWins = results.filter(r => r.winner === 'A').length;
    const skillBWins = results.filter(r => r.winner === 'B').length;
    
    return {
      skillA,
      skillB,
      totalTests: testCases.length,
      skillAWins,
      skillBWins,
      ties: results.filter(r => r.winner === 'tie').length,
      results,
      recommendation: skillAWins > skillBWins ? skillA : skillB
    };
  }
  
  private async judgeOutputs(
    testCase: TestCase,
    outputA: any,
    outputB: any
  ): Promise<Judgment> {
    const prompt = `
Compare these two skill outputs and determine which is better.

## Test Case: ${testCase.name}
${testCase.description}

## Output A:
${JSON.stringify(outputA, null, 2)}

## Output B:
${JSON.stringify(outputB, null, 2)}

## Evaluation Criteria:
- Correctness
- Completeness
- Clarity
- Efficiency

Return JSON:
{
  "winner": "A" | "B" | "tie",
  "reasoning": "explanation",
  "qualityScoreA": 1-5,
  "qualityScoreB": 1-5
}
`;
    
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return JSON.parse(response.content[0].text);
  }
}

// Usage
describe('A/B Testing Skills', () => {
  it('compares two cart-recovery implementations', async () => {
    const tester = new SkillABTester();
    
    const testCases = [
      {
        name: 'Basic cart abandonment',
        input: { abandonmentWindow: '24h' }
      },
      {
        name: 'With discount incentive',
        input: { abandonmentWindow: '24h', incentiveStrategy: 'discount' }
      }
    ];
    
    const report = await tester.runABTest(
      'cart-recovery-v1',
      'cart-recovery-v2',
      testCases
    );
    
    console.log(`Winner: ${report.recommendation}`);
    console.log(`Wins: ${report.skillAWins} vs ${report.skillBWins}`);
    
    // Save report
    await saveABTestReport(report);
  });
});
```

---

### 8. **Synthetic Data Generation**

Generate realistic test data automatically

```typescript
// testing/synthetic/data-generator.ts

export class SyntheticDataGenerator {
  generateWorkspace(vertical: string): SyntheticWorkspace {
    const generators = {
      ecommerce: this.generateEcommerceWorkspace,
      saas: this.generateSaaSWorkspace,
      b2b: this.generateB2BWorkspace
    };
    
    return generators[vertical]();
  }
  
  private generateEcommerceWorkspace(): SyntheticWorkspace {
    return {
      contacts: this.generateContacts(50000, {
        attributes: ['email', 'name', 'lifetime_value', 'last_purchase_at'],
        distributions: {
          lifetime_value: 'pareto', // 80/20 rule
          last_purchase_at: 'exponential' // Recent purchases more common
        }
      }),
      products: this.generateProducts(500, {
        categories: ['clothing', 'accessories', 'shoes'],
        priceRange: [10, 500]
      }),
      orders: this.generateOrders(100000, {
        averageOrderValue: 75,
        repeatCustomerRate: 0.3
      }),
      campaigns: this.generateCampaigns(50, {
        types: ['promotional', 'transactional', 'lifecycle'],
        performance: {
          openRate: { mean: 0.18, stddev: 0.03 },
          clickRate: { mean: 0.021, stddev: 0.005 }
        }
      })
    };
  }
  
  generateRealisticScenario(vertical: string): TestScenario {
    const workspace = this.generateWorkspace(vertical);
    
    return {
      name: `Synthetic ${vertical} scenario`,
      workspace,
      expectedBehaviors: this.generateExpectedBehaviors(workspace),
      fixtures: this.generateFixtures(workspace)
    };
  }
}

// Usage
describe('Synthetic Data Testing', () => {
  const generator = new SyntheticDataGenerator();
  
  it('tests with realistic e-commerce data', async () => {
    const scenario = generator.generateRealisticScenario('ecommerce');
    
    // Test all skills with synthetic data
    const result = await runFullWorkflow(scenario);
    
    expect(result.success).toBe(true);
    expect(result.deliverables).toMatchExpectedBehaviors(scenario.expectedBehaviors);
  });
});
```

---

### 9. **Continuous Evaluation**

Monitor skill quality over time

```typescript
// testing/continuous/continuous-evaluator.ts

export class ContinuousEvaluator {
  async evaluateDaily() {
    const skills = getAllSkills();
    
    const evaluations = await Promise.all(
      skills.map(async skill => {
        const evaluation = await this.evaluateSkill(skill);
        
        // Store in database
        await this.storeEvaluation(evaluation);
        
        // Check for degradation
        const trend = await this.analyzeTrend(skill.name);
        
        if (trend.degrading) {
          await this.alertTeam({
            skill: skill.name,
            issue: 'Quality degradation detected',
            trend
          });
        }
        
        return evaluation;
      })
    );
    
    // Generate daily report
    await this.generateDailyReport(evaluations);
  }
  
  private async analyzeTrend(skillName: string): Promise<Trend> {
    const history = await this.getEvaluationHistory(skillName, 30); // 30 days
    
    const scores = history.map(h => h.overallScore);
    const trend = this.calculateTrend(scores);
    
    return {
      direction: trend > 0 ? 'improving' : trend < 0 ? 'degrading' : 'stable',
      slope: trend,
      degrading: trend < -0.1 // Threshold
    };
  }
}

// Schedule
cron.schedule('0 2 * * *', async () => {
  // Run at 2 AM daily
  const evaluator = new ContinuousEvaluator();
  await evaluator.evaluateDaily();
});
```

---

## 🎯 Summary

### Testing Layers

1. **Unit Tests** - Fast, isolated, syntax/structure
2. **Integration Tests** - Fixtures, mocked MCP
3. **Live Tests** - Real workspace, real data
4. **LLM-as-a-Judge** - Quality evaluation
5. **Regression Tests** - Prevent degradation
6. **Performance Tests** - Track metrics
7. **Adversarial Tests** - Edge cases
8. **Mutation Tests** - Test quality
9. **Property-Based** - Random inputs
10. **Differential** - Compare versions
11. **Chaos** - Resilience
12. **Metamorphic** - Relationships
13. **A/B Testing** - Compare implementations
14. **Synthetic Data** - Realistic scenarios
15. **Continuous** - Monitor over time

### Recommended Testing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING PYRAMID                           │
└─────────────────────────────────────────────────────────────┘

                    ▲
                   ╱ ╲
                  ╱   ╲     Live Tests (10%)
                 ╱     ╲    - Real workspace
                ╱───────╲   - End-to-end
               ╱         ╲
              ╱           ╲  Integration Tests (30%)
             ╱             ╲ - Fixtures
            ╱               ╲- Mocked MCP
           ╱─────────────────╲
          ╱                   ╲ Unit Tests (60%)
         ╱                     ╲- Fast
        ╱                       ╲- Isolated
       ╱─────────────────────────╲

       + LLM Evaluation (Weekly)
       + Regression (On PR)
       + Performance (On PR)
       + Continuous (Daily)
```

---

## 🔗 Related

- [`README.md`](./README.md) - Main testing guide
- [`../skills/README.md`](../skills/README.md) - Skill specifications
- [`../implementation/README.md`](../implementation/README.md) - Implementation guide
