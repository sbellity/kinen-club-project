# Session Preparation

## My Role: The Bridge

**You**: Focus on behaviors, outcomes, and architectural intent.
**Me**: Focus on the math, algorithms, and implementation details.
**Together**: We define the *paradigm*.

---

## Recommended Reading

### Essential (Read Before Session)

1. **Extended Mind Thesis** - Clark & Chalmers (1998)
   - https://consc.net/papers/extended.html
   - The philosophical foundation for "cognitive exile"
   - Key insight: Cognitive processes extend beyond the brain into tools, notes, devices
   - **Why it matters**: Your ban experience is a case study in extended mind severing

2. **Titans Paper** - Section 2.1-2.3 (Memory as learned function)
   - https://arxiv.org/abs/2501.00663
   - Focus on: How surprise (gradient magnitude) drives memorization
   - Skip: The detailed architecture comparisons
   - **Why it matters**: Shows memory can be weights, not tokens

3. **Michael Levin Interview** - Timestamps 1:30:00-2:15:00
   - https://lexfridman.com/michael-levin-2-transcript
   - Focus on: Cognitive light cone, stress propagation, pattern space
   - **Why it matters**: Biological inspiration for multi-scale memory

### Useful Background (Skim)

4. **Knowledge Graph Embedding Survey**
   - https://arxiv.org/abs/2002.00388
   - Just the intro + Section 2 (what KG embeddings are)
   - **Why it matters**: Understanding graph-as-substrate options

5. **Multimodal LLMs: What They Actually Understand**
   - GPT-4V system card: https://openai.com/research/gpt-4v-system-card
   - Claude 3 vision: https://www.anthropic.com/news/claude-3-family
   - **Why it matters**: Knowing what visual context LLMs can process

---

## Novel Insights I'm Bringing

### 1. Memory as Executable, Not Static

**Traditional view**: Memory = stored data you retrieve
**New view**: Memory = learned functions that compute answers

Titans' key insight isn't that they store more—it's that memory is **predictive**. The weights don't contain facts; they contain the ability to **generate** facts.

```
OLD: Store "Paris is the capital of France" → Retrieve when asked
NEW: Learn pattern (city, country) → Predict capital when given country
```

**Implication**: Procedural memory isn't a special case—all memory should be executable.

---

### 2. Substrates as Compression Schemes

Each substrate is a different **compression** of experience:

| Substrate | Compression Type | What's Preserved | What's Lost |
|-----------|-----------------|------------------|-------------|
| **Graph** | Sparse relational | Structure, connections | Nuance, uncertainty |
| **Neural** | Dense pattern | Regularities, predictions | Interpretability |
| **Activation** | Temporal | Recency, relevance | History |
| **Procedural** | Behavioral | What worked | Why it worked |
| **Language** | Human-interface | Communicability | Precision |

**Implication**: No single substrate is "right." The question is which compression preserves what you need.

---

### 3. The Perplexity Gradient

Not binary "memorize or don't"—a continuous gradient:

```
Perplexity = 0.1 (very confident)
  → Don't store (already know this)
  → High weight in retrieval
  → Stable activation

Perplexity = 0.5 (uncertain)
  → Maybe store (learning opportunity)
  → Medium weight in retrieval
  → Moderate activation boost

Perplexity = 0.9 (very surprised)
  → Definitely store (novel information)
  → Low weight until confirmed
  → High activation (attention signal)
```

**Implication**: Perplexity drives not just *what* to store but *where* and *how confidently* to retrieve.

---

### 8. Fractal Memory (Scale-Free Cognition)

**The Insight**: The "Experience → Surprise → Compression → Structure" loop is universal, appearing at every scale of organization.

| Scale | Substrate | Input | Surprise Signal | Adaptation |
|-------|-----------|-------|-----------------|------------|
| **Micro** | Neural Weights | Tokens | Gradient / Loss | Weight Update |
| **Meso** | Personal Knowledge | Daily Work | Insight / Confusion | New Note / Link |
| **Macro** | Organization/Economy | Market Signals | Profit Loss / Disruption | New Team / Capability |

**Connection to Your Work**:
This directly links to your **Theoretical Framework** ([[20251116-01-orchestrator-prototype/src/portfolio/THEORETICAL_FRAMEWORK.md]]) where agents build "Skills" (Computational Artifacts) to reduce future costs.
- **Skill Formation** in the economy = **Weight Update** in the brain.
- Both are **investments in prediction** to reduce future energy/token expenditure.

**Implication for Architecture**:
We don't need separate systems for "hot weights" and "long-term docs" and "team processes." We need **one recursive architecture** that handles "crystallization" of patterns at different time scales.

---

## Questions I Want to Explore

1. **Is text embedding a substrate or interface?**
   - Currently: It's both (store + retrieve)
   - Proposal: It's just interface (language → substrates → language)
   - But: Vector similarity is useful for some queries

2. **What's the minimum viable architecture?**
   - Full: Graph + Neural + Activation + Procedural + Language
   - Minimum: Graph + Activation + Language?
   - Question: Can neural be optional? Procedural?

3. **How does this integrate with existing kinen-go?**
   - LightMem becomes the language interface layer
   - But: Where do the other substrates live?
   - Incremental path vs. rebuild?

4. **What experiments would validate this?**
   - A/B: Graph-as-image vs. graph-as-text
   - Measure: Token efficiency, answer quality, retrieval precision
   - Baseline: Current LightMem

---

## Mindset for Tomorrow

**Not designing a system. Designing a paradigm.**

The question isn't "how do we add Titans to kinen-go."
It's "what would memory architecture look like if we designed it from first principles, knowing what we know now?"

Your ban experience isn't just motivation—it's **evidence** that the current paradigm is broken.
