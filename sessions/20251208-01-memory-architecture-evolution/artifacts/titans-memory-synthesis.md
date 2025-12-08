---
date: 2025-12-08
artifact_type: research
aliases:
  - "memory-architecture-evolution - Titans Memory Synthesis"
tags:
  - domain/architecture
  - domain/memory-systems
  - research/titans
  - research/levin
  - type/synthesis
summary: "Deep synthesis of Titans/MIRAS neural memory with existing kinen-go architecture, biomimicry foundations, and Levin's cognitive frameworks"
---

# Titans-Memory Synthesis: Toward Neural Memory for Kinen

**Purpose**: Bridge Google's Titans/MIRAS research to kinen-go's existing LightMem implementation, finding enhancement paths that preserve what works while adding neural memory capabilities.

---

## Part 1: Core Concepts from Titans/MIRAS

### 1.1 The Fundamental Shift

**Traditional sequence models** (RNNs, Transformers):
- Memory is passive storage
- Write = append data
- Read = retrieve by similarity/position
- Capacity is fixed or grows linearly

**Titans' innovation**:
- Memory is an **active learner**
- Write = gradient-based update (learning)
- Read = forward pass through neural network
- Capacity determined by **what you've learned**, not what you've stored

```
Traditional: Memory[key] = value
Titans:      Memory.learn(key, value)  # Memory parameters change
```

### 1.2 The Surprise Metric & Perplexity Connection

> "The model memorizes tokens that violate the expectation of the objective (i.e., being surprising to the memory)."

**Mathematical formulation**:
```
surprise(x_t) = ||∇_W L(M(W, k_t), v_t)||

where:
  W = memory parameters (MLP weights)
  k_t = key (embedding of input)
  v_t = value (what should be retrieved)
  L = loss function (typically MSE)
  M = memory forward pass
```

**Interpretation**:
- High gradient = big difference between what memory predicts and what's true
- High gradient = "this is surprising, I should memorize it"
- Low gradient = "I already know this, skip"

### 1.3 The Perplexity Foundation

From [information theory](https://en.wikipedia.org/wiki/Perplexity), **perplexity** is the mathematical measure of "surprise":

```
Perplexity(p) = 2^H(p) = 2^(-Σ p(x) log₂ p(x))

where H(p) = entropy of distribution p
```

**Key insight**: Perplexity measures "how many equally likely outcomes" the model sees.
- Perplexity of 2 = as uncertain as a coin flip
- Perplexity of 247 = as uncertain as choosing among 247 equally likely words
- Lower perplexity = better prediction = less "surprised"

**The deep connection**:

| Concept | Mathematical Form | What it measures |
|---------|------------------|------------------|
| **Perplexity** | `2^(cross-entropy)` | Model's uncertainty about next token |
| **Titans' Surprise** | `||∇L||` (gradient norm) | How wrong memory's prediction was |
| **Levin's Stress** | `distance(current, goal)` | How far from goal state |

All three are **measures of prediction error** → signals for adaptation:

```
High perplexity   →  High surprise gradient  →  High stress
       ↓                      ↓                      ↓
  Uncertain              Memorize this         Increase plasticity
       ↓                      ↓                      ↓
  Need to learn         Update weights         Ready to change
```

**Practical implication for kinen-go**:

Instead of just gradient magnitude, we could use **perplexity-based surprise**:

```go
func (sd *SurpriseDetector) MeasureSurprise(key, value []float32) float32 {
    // Get probability distribution from neural memory
    probs := sd.neuralMemory.PredictDistribution(key)

    // Calculate cross-entropy (log perplexity)
    crossEntropy := -dotProduct(value, log(probs))

    // Perplexity = 2^crossEntropy
    perplexity := math.Pow(2, crossEntropy)

    // Normalize to 0-1 range for surprise score
    return 1.0 - (1.0 / perplexity)  // High perplexity → high surprise
}
```

This gives us a **principled, information-theoretic measure** of surprise rather than just gradient magnitude.

### 1.4 MIRAS Framework: Four Design Choices

| Choice | What it determines | LightMem | Titans |
|--------|-------------------|----------|--------|
| **Memory Architecture** | Capacity, expressiveness | Vector buffers | Deep MLP |
| **Attentional Bias** | What to prioritize | N/A (buffer thresholds) | MSE, Huber, L_p |
| **Retention Gate** | How to forget | Manual flush | Weight decay, KL |
| **Memory Algorithm** | How to update | Append | GD + momentum |

### 1.5 Three Novel MIRAS Variants

**MONETA** (L_p + L_q norms):
```python
# Uses p-norm for attentional bias, q-norm for retention
# More robust to noise, handles extreme values
A_t = α_t * A_{t-1} - η_t * ∇L_p(W_{t-1}; k_t, v_t)
W_t = A_t / ||A_t||_q^{q-2}
```

**YaAd** (Huber loss - "coping mechanism"):
```python
# Uses Huber loss: behaves like MSE for small errors, L1 for large
# Prevents extreme events from dominating memory
if ||M(k_t) - v_t|| ≤ δ_t:
    W_t = α_t * W_{t-1} - η_t * ∇L_2(W_{t-1}; k_t, v_t)
else:
    W_t = α_t * W_{t-1} - η_t * δ_t * ∇L_1(W_{t-1}; k_t, v_t)
```

**Memora** (KL divergence retention):
```python
# Constrains memory to probability space
# Ensures stable, bounded updates
W_t = Softmax(α_t * log(W_{t-1}) - η_t * ∇L_2(W_{t-1}; k_t, v_t))
```

---

## Part 2: Mapping to Existing Kinen Architecture

### 2.1 Current kinen-go Components

```
┌─────────────────────────────────────────────────────────┐
│               KINEN MEMORY PIPELINE                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  INPUT: []Message                                        │
│     │                                                    │
│     ▼                                                    │
│  ┌──────────────┐                                        │
│  │ NORMALIZER   │  Timestamps, sequencing               │
│  └──────────────┘                                        │
│     │                                                    │
│     ▼                                                    │
│  ┌──────────────┐                                        │
│  │ SENSORY      │  Token windowing, segmentation        │
│  │ BUFFER       │  512 tokens → trigger cut             │
│  └──────────────┘                                        │
│     │ Segments                                           │
│     ▼                                                    │
│  ┌──────────────┐                                        │
│  │ SHORT-TERM   │  Segment accumulation                 │
│  │ BUFFER       │  1024 tokens → trigger extraction     │
│  └──────────────┘                                        │
│     │ Fact batches                                       │
│     ▼                                                    │
│  ┌──────────────┐                                        │
│  │ EXTRACTOR    │  LLM-based fact extraction            │
│  └──────────────┘                                        │
│     │ Facts + embeddings                                 │
│     ▼                                                    │
│  ┌──────────────┐                                        │
│  │ STORAGE      │  SQLite + VSS / Qdrant                │
│  │ (LONG-TERM)  │  Vector similarity search             │
│  └──────────────┘                                        │
│     │                                                    │
│     ▼                                                    │
│  ┌──────────────┐                                        │
│  │ CONSOLIDATION│  Offline: abstraction, pruning        │
│  └──────────────┘                                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Concept Mapping: LightMem ↔ Titans

| LightMem Concept | Titans Equivalent | Gap/Opportunity |
|------------------|-------------------|-----------------|
| Sensory Buffer | Contextual Memory | Sensory is passive; Titans is active |
| Short-Term Buffer | (integrated into Core) | Buffer accumulates; Titans learns |
| Long-Term Storage | Neural Long-Term Memory | Storage retrieves; Titans infers |
| Token threshold trigger | Surprise metric | Threshold is fixed; surprise is adaptive |
| Offline consolidation | Weight decay + momentum | Consolidation is batch; Titans is online |
| Topic segmentation | Attention matrix | Both use embeddings for boundaries |

### 2.3 Where Neural Memory Could Fit

**Option A: Replace Storage Layer**
```
Current:  Storage.Insert(facts) → Store vectors
          Storage.Search(query) → Retrieve by similarity

With Titans: NeuralMemory.Learn(facts) → Update MLP weights
             NeuralMemory.Recall(query) → Forward pass
```

**Option B: Augment Buffers**
```
Current:  SensoryBuffer.Add(msgs) → Accumulate until threshold

With Titans: SensoryBuffer.Add(msgs) →
             For each msg:
               surprise = measure_surprise(msg)
               if surprise > threshold:
                 buffer.remember(msg)  # Neural learning
               else:
                 buffer.append(msg)    # Traditional buffering
```

**Option C: Hybrid Long-Term**
```
Current:  Long-term = Vector storage

Hybrid:   Long-term = Vector storage (explicit facts)
                    + Neural memory (implicit patterns)

Retrieval: combine(
  vector_search(query),
  neural_recall(query)
)
```

---

## Part 3: Connecting to Biomimicry Foundations

### 3.1 From August 2025 Research

The biomimicry session established these principles:

1. **Memory as Active Maintenance** (PKMζ/KIBRA)
   - Knowledge requires continuous effort to persist
   - Decay is natural, maintenance is active

2. **Orchestrated Consolidation** (NREM/REM)
   - NREM: Stabilize and strengthen new knowledge
   - REM: Integrate and creatively reorganize

3. **Three-Layer Cognitive Graph**
   - Foundational: Objective knowledge
   - Activation: Subjective relevance (decays)
   - Speculative: Creative connections (quarantined)

### 3.2 How Titans Aligns with Biomimicry

| Biomimicry Principle | Titans Mechanism | Alignment |
|---------------------|------------------|-----------|
| Active Maintenance | Gradient-based learning | ✅ Perfect - memory learns, doesn't just store |
| Decay is natural | Weight decay | ✅ Perfect - forgetting is built in |
| NREM consolidation | Momentum accumulation | ✅ Momentum = "ripple effect" of learning |
| REM reorganization | ??? | ❓ Gap - Titans doesn't have creative exploration |
| Activation layer | Attentional bias | ✅ What to prioritize changes dynamically |
| Speculative layer | ??? | ❓ Gap - Titans doesn't quarantine speculation |

### 3.3 Gaps to Fill: What Titans Doesn't Have

**1. Creative Consolidation (REM equivalent)**

Titans learns from what it sees. It doesn't:
- Generate speculative connections
- Explore novel paths through memory
- "Dream" about what patterns might exist

**Opportunity**: Add ACO-inspired exploration to neural memory
```python
def rem_cycle(neural_memory):
    # Use high-temperature sampling to generate speculative queries
    for _ in range(exploration_steps):
        random_key = generate_random_key()
        recalled = neural_memory.recall(random_key)
        # Store in speculative layer, don't learn yet
        speculative_layer.add(random_key, recalled)
```

**2. Quarantined Speculation**

Titans treats all learning equally. It doesn't:
- Distinguish confident knowledge from speculation
- Hold uncertain connections in a separate layer
- Require validation before promotion

**Opportunity**: Two-tier neural memory
```python
class HybridNeuralMemory:
    validated: NeuralMemory     # High confidence, main memory
    speculative: NeuralMemory   # Low confidence, quarantined

    def learn(self, key, value, confidence):
        if confidence > threshold:
            self.validated.learn(key, value)
        else:
            self.speculative.learn(key, value)
```

---

## Part 4: Connecting to Levin's Cognitive Frameworks

### 4.1 Stress ↔ Surprise Equivalence

**Levin's Stress**:
- Cell has goal, can't reach it → stressed
- Stress leaks to neighbors
- High stress → high plasticity → willing to change

**Titans' Surprise**:
- Memory has expectation, input violates it → surprised
- Surprise triggers learning
- High surprise → high learning rate → memory changes

**The mapping**:
```
stress(agent) = surprise(memory)
plasticity(agent) = learning_rate(memory)
stress_leak(neighbors) = momentum(memory)
```

### 4.2 Enhanced Memory with Stress Propagation

```python
@dataclass
class StressAwareMemory:
    """Neural memory that propagates 'stress' like Levin's cells"""

    base_memory: NeuralMemory
    stress_level: float = 0.0
    plasticity: float = 0.5
    neighbors: List['StressAwareMemory'] = field(default_factory=list)

    def learn(self, key, value):
        # 1. Calculate surprise (internal stress)
        prediction = self.base_memory.recall(key)
        surprise = self.compute_surprise(prediction, value)

        # 2. Update own stress
        self.stress_level = min(1.0, self.stress_level + surprise)

        # 3. Plasticity increases with stress
        self.plasticity = 0.5 + (self.stress_level * 0.5)

        # 4. Learning rate = plasticity
        self.base_memory.learn(key, value, lr=self.plasticity)

        # 5. Stress leaks to neighbors (momentum effect)
        for neighbor in self.neighbors:
            neighbor.receive_stress(self.stress_level * 0.3)

    def receive_stress(self, external_stress):
        # Can't tell if stress is mine or neighbor's
        self.stress_level = min(1.0, self.stress_level + external_stress)
```

### 4.3 Cognitive Light Cone for Memory

**Levin's definition**: Size of biggest goal you can actively pursue.

**For memory system**: Scale of patterns you can actively maintain.

**Connection to Perplexity**:

The cognitive light cone can be measured as the **inverse of perplexity**:
- Low perplexity = high certainty = larger cognitive light cone
- Memory that predicts well has "expanded" its light cone
- Memory that's constantly surprised has a small light cone

```
Cognitive Light Cone ∝ 1 / Perplexity

A memory with perplexity 2 → can only handle binary choices
A memory with perplexity 247 → handles vocabulary-scale uncertainty
A memory with perplexity ~1 → nearly perfect prediction → huge light cone
```

```
Individual memory: Can recall specific facts (small scale)
Collective memory: Can maintain coherent worldview (large scale)
```

**Measurement**:
```python
def cognitive_light_cone(memory):
    """Measure the 'scale' of what memory can handle"""

    # Test 1: Single fact recall
    single_fact_score = test_single_fact_recall(memory)

    # Test 2: Multi-hop reasoning
    multi_hop_score = test_multi_hop_reasoning(memory)

    # Test 3: Pattern completion
    pattern_score = test_pattern_completion(memory)

    # Test 4: Temporal consistency
    temporal_score = test_temporal_consistency(memory)

    # Light cone = weighted combination
    return weighted_average([
        (single_fact_score, 1),
        (multi_hop_score, 2),    # Harder = worth more
        (pattern_score, 3),
        (temporal_score, 2)
    ])
```

---

## Part 5: Design Proposal - Hybrid Memory Architecture

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID MEMORY SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 SENSORY LAYER (unchanged)                │    │
│  │   Token windowing, coarse segmentation                   │    │
│  │   LightMem: SensoryBuffer                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              ACTIVE LEARNING LAYER (NEW)                 │    │
│  │                                                          │    │
│  │   ┌───────────────────┐    ┌───────────────────┐        │    │
│  │   │   SURPRISE        │    │   STRESS          │        │    │
│  │   │   DETECTOR        │───►│   PROPAGATOR      │        │    │
│  │   │   (Titans)        │    │   (Levin)         │        │    │
│  │   └───────────────────┘    └───────────────────┘        │    │
│  │                                    │                     │    │
│  │                                    ▼                     │    │
│  │                    Plasticity / Learning Rate            │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   LONG-TERM LAYER                        │    │
│  │                                                          │    │
│  │   ┌───────────────────┐    ┌───────────────────┐        │    │
│  │   │   EXPLICIT        │    │   NEURAL          │        │    │
│  │   │   MEMORY          │    │   MEMORY          │        │    │
│  │   │   (Vector DB)     │    │   (MLP/Titans)    │        │    │
│  │   │   - Facts         │    │   - Patterns      │        │    │
│  │   │   - Embeddings    │    │   - Associations  │        │    │
│  │   └───────────────────┘    └───────────────────┘        │    │
│  │              │                      │                    │    │
│  │              └──────────┬───────────┘                    │    │
│  │                         ▼                                │    │
│  │                  RETRIEVAL FUSION                        │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               CONSOLIDATION LAYER                        │    │
│  │                                                          │    │
│  │   ┌───────────────────┐    ┌───────────────────┐        │    │
│  │   │   NREM            │    │   REM             │        │    │
│  │   │   (Strengthen)    │    │   (Explore)       │        │    │
│  │   │   - Ripple replay │    │   - ACO walks     │        │    │
│  │   │   - Weight update │    │   - Speculation   │        │    │
│  │   └───────────────────┘    └───────────────────┘        │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Component Details

**Surprise Detector** (from Titans):
```go
type SurpriseDetector struct {
    neuralMemory *NeuralMemory
}

func (sd *SurpriseDetector) MeasureSurprise(key, value []float32) float32 {
    // Forward pass: what does memory predict?
    predicted := sd.neuralMemory.Recall(key)

    // Compute loss
    loss := mse(predicted, value)

    // Surprise = gradient magnitude (approximated)
    return loss  // Simple version: loss ≈ surprise
}
```

**Stress Propagator** (from Levin):
```go
type StressPropagator struct {
    stressLevel  float32
    plasticity   float32
    neighbors    []*StressPropagator
    leakRate     float32
}

func (sp *StressPropagator) Update(surprise float32) {
    // 1. Own stress increases with surprise
    sp.stressLevel = min(1.0, sp.stressLevel + surprise)

    // 2. Plasticity follows stress
    sp.plasticity = 0.5 + (sp.stressLevel * 0.5)

    // 3. Leak to neighbors
    for _, n := range sp.neighbors {
        n.ReceiveStress(sp.stressLevel * sp.leakRate)
    }

    // 4. Natural decay
    sp.stressLevel *= 0.9
}
```

**Neural Memory** (simplified Titans):
```go
type NeuralMemory struct {
    // Simple version: single layer MLP
    W [][]float32  // Weight matrix
    b []float32    // Bias

    // Momentum (from Titans)
    momentum [][]float32

    // Forgetting (weight decay)
    decayRate float32
}

func (nm *NeuralMemory) Learn(key, value []float32, lr float32) {
    // Forward pass
    predicted := nm.forward(key)

    // Compute gradient (simplified)
    grad := nm.computeGradient(predicted, value, key)

    // Apply momentum
    for i := range nm.momentum {
        for j := range nm.momentum[i] {
            nm.momentum[i][j] = 0.9*nm.momentum[i][j] + grad[i][j]
        }
    }

    // Update with momentum and learning rate
    for i := range nm.W {
        for j := range nm.W[i] {
            // Weight decay (forgetting)
            nm.W[i][j] *= (1.0 - nm.decayRate)
            // Learning update
            nm.W[i][j] -= lr * nm.momentum[i][j]
        }
    }
}
```

### 5.3 Integration with Existing kinen-go

**Phase 1: Add Surprise Detection (minimal change)**
```go
// In internal/buffer/sensory.go

func (sb *SensoryBuffer) AddMessages(msgs []memory.Message) []memory.Segment {
    for _, msg := range msgs {
        // NEW: Measure surprise before adding
        surprise := sb.surpriseDetector.Measure(msg)

        // NEW: Adjust processing based on surprise
        if surprise > sb.highSurpriseThreshold {
            // Force immediate segmentation for surprising content
            segments = append(segments, sb.CutMessages()...)
        }

        // Existing logic continues...
    }
}
```

**Phase 2: Add Neural Memory (parallel to vector storage)**
```go
// In internal/storage/hybrid/storage.go

type HybridStorage struct {
    explicit *sqlite.Storage    // Existing: facts + embeddings
    neural   *NeuralMemory      // NEW: learned patterns
}

func (hs *HybridStorage) Insert(entries []memory.MemoryEntry) error {
    // Store in both
    if err := hs.explicit.Insert(entries); err != nil {
        return err
    }

    // Also learn in neural memory
    for _, entry := range entries {
        hs.neural.Learn(entry.Embedding, entry.Content)
    }
    return nil
}

func (hs *HybridStorage) Search(query []float32, limit int) ([]memory.MemoryEntry, error) {
    // Combine results from both
    explicitResults, _ := hs.explicit.Search(query, limit)
    neuralRecall := hs.neural.Recall(query)

    return fuse(explicitResults, neuralRecall, limit)
}
```

**Phase 3: Add Stress Propagation (future)**
```go
// For multi-agent scenarios - connect memory systems
type StressAwareMemoryCluster struct {
    memories []*StressAwareMemory
}

func (c *StressAwareMemoryCluster) Connect() {
    // Each memory becomes neighbor of others
    for i, m := range c.memories {
        for j, n := range c.memories {
            if i != j {
                m.neighbors = append(m.neighbors, n)
            }
        }
    }
}
```

---

## Part 6: Experimental Validation

### 6.1 Benchmarks

**LongMemEval** (already supported in kinen-go):
- Test: Does surprise-based learning improve recall?
- Hypothesis: High-surprise memories should be retained better

**LoCoMo** (from LightMem paper):
- Test: Does neural memory reduce token usage?
- Hypothesis: Neural compression > explicit storage

### 6.2 New Metrics

**Cognitive Light Cone** (from Levin):
- Measure scale of goals memory can support
- Compare: LightMem baseline vs. Titans-enhanced

**Stress Propagation Efficiency** (from Levin):
- In multi-memory scenarios: Does stress help coordination?
- Measure: Time to converge on shared understanding

### 6.3 A/B Test Design

```go
type Experiment struct {
    baseline   *LightMemStorage     // Current implementation
    treatment  *HybridStorage       // With neural memory
    dataset    *LongMemEvalDataset
}

func (e *Experiment) Run() Results {
    // Same inputs to both
    for _, conversation := range e.dataset.Conversations {
        e.baseline.AddMemory(conversation)
        e.treatment.AddMemory(conversation)
    }

    // Same queries to both
    baselineAccuracy := e.evaluate(e.baseline)
    treatmentAccuracy := e.evaluate(e.treatment)

    return Results{
        BaselineAccuracy:  baselineAccuracy,
        TreatmentAccuracy: treatmentAccuracy,
        TokensBaseline:    e.baseline.TokensUsed(),
        TokensTreatment:   e.treatment.TokensUsed(),
    }
}
```

---

## Part 7: Open Questions

### Technical

1. **Neural memory size**: How many parameters for the MLP? Trade-off: capacity vs. inference cost.

2. **Local inference**: Can this run on Ollama/llama.cpp, or does it need PyTorch?

3. **Persistence**: How do we save/load neural memory weights?

4. **Migration**: How do we migrate existing facts to neural format?

### Conceptual

5. **Surprise calibration**: What's the right threshold for "surprising"?

6. **Forgetting rate**: How fast should neural memory forget?

7. **Speculation handling**: How do we implement the "quarantine" layer?

### Integration

8. **API changes**: Does this require changes to the proto API?

9. **Configuration**: What new config options do users need?

10. **Backwards compatibility**: Can users opt-out of neural memory?

---

## Part 8: Implementation Roadmap

### Phase 1: Minimal (1-2 days)
- [ ] Add surprise detection to sensory buffer
- [ ] Log surprise metrics for analysis
- [ ] No neural memory yet, just measurement

### Phase 2: Neural Memory (3-5 days)
- [ ] Implement simple MLP-based neural memory
- [ ] Run alongside existing vector storage
- [ ] Measure impact on LongMemEval

### Phase 3: Stress Propagation (future)
- [ ] Connect multiple memory systems
- [ ] Implement stress leaking
- [ ] Test in multi-agent scenarios

### Phase 4: Full Consolidation (future)
- [ ] NREM cycle with momentum
- [ ] REM cycle with ACO exploration
- [ ] Speculative layer with promotion

---

## References

### Primary Sources

- **Titans Paper**: [arXiv:2501.00663](https://arxiv.org/abs/2501.00663) - Learning to Memorize at Test Time
- **MIRAS Paper**: [arXiv:2504.13173](https://arxiv.org/abs/2504.13173) - Unified Framework for Sequence Models
- **LightMem Paper**: [arXiv:2510.18866](https://arxiv.org/abs/2510.18866) - Lightweight Memory-Augmented Generation
- **Google Blog**: [Titans + MIRAS](https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/)
- **Levin Podcast**: [Lex Fridman #486](https://lexfridman.com/michael-levin-2-transcript)

### kinen Sessions

- [[20250831-03-biomimicry/technical-spec|Biomimicry Technical Spec]]
- [[20251103-01-lighmem-paper-gaps/06-completion-summary|LightMem Completion Summary]]
- [[20251207-02-multi-agent-coordination/artifacts/levin-orchestration-synthesis|Levin-Orchestration Synthesis]]

### kinen-go Implementation

- `/internal/buffer/sensory.go` - Sensory buffer implementation
- `/internal/buffer/shortterm.go` - Short-term buffer implementation
- `/internal/consolidation/` - Offline consolidation
- `/internal/storage/` - Storage backends

---

## Document History

- **2025-12-08**: Initial synthesis for session preparation
- **Purpose**: Bridge Titans/MIRAS to kinen-go architecture
- **Status**: Ready for session exploration
