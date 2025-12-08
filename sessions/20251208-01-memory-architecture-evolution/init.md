---
created: 2025-12-08
updated: 2025-12-08
type: architecture
status: ready
aliases:
  - "memory-architecture-evolution - Session Initialization"
  - "Titans-Inspired Memory Evolution"
  - "Beyond LightMem"
tags:
  - domain/architecture
  - domain/memory-systems
  - type/iterative-design
  - status/ready
  - research/titans
  - research/levin
  - research/lightmem
summary: "Evolving kinen-go's memory architecture beyond LightMem, incorporating Titans/MIRAS neural memory and Levin's cognitive frameworks"
---

# Session: Evolving Memory Architecture

## Context: Where We Are

### Current Implementation: LightMem at 100% Parity

kinen-go implements the **Atkinson-Shiffrin model** (LightMem paper):

```
┌─────────────────────────────────────────────────────────┐
│                    INPUT MESSAGES                        │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  SENSORY BUFFER                          │
│   • Token-based windowing (512 tokens default)          │
│   • Triggers segmentation on threshold                  │
│   • Two-stage: coarse (LLM) + fine (embedding sim)      │
└─────────────────────────────┬───────────────────────────┘
                              │ Segments
                              ▼
┌─────────────────────────────────────────────────────────┐
│                SHORT-TERM BUFFER                         │
│   • Accumulates segments (1024 tokens default)          │
│   • Triggers fact extraction on threshold               │
│   • Respects messages_use strategy                      │
└─────────────────────────────┬───────────────────────────┘
                              │ Extracted Facts
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  LONG-TERM STORAGE                       │
│   • Vector embeddings (SQLite + VSS)                    │
│   • Fact tuples with metadata                           │
│   • Offline consolidation (abstraction layer)           │
└─────────────────────────────────────────────────────────┘
```

**Achieved Features** (see `06-completion-summary.md`):
- ✅ Summarization step
- ✅ Topic preservation
- ✅ Explicit attention matrix (n×n)
- ✅ Percentile-based compression
- ✅ Abstraction layer (offline consolidation)

### Original Vision: Biomimetic Memory (August 2025)

From `20250831-03-biomimicry/technical-spec.md`:

```
┌─────────────────────────────────────────────────────────┐
│                  THREE-LAYER COGNITIVE GRAPH             │
├─────────────────────────────────────────────────────────┤
│  SPECULATIVE LAYER ("Dream Space")                      │
│   • Quarantined creative connections                    │
│   • Promoted through validation                         │
├─────────────────────────────────────────────────────────┤
│  ACTIVATION LAYER                                       │
│   • Subjective relevance for contexts                   │
│   • Dynamic, requires active maintenance                │
│   • Decays over logical time (epochs)                   │
├─────────────────────────────────────────────────────────┤
│  FOUNDATIONAL LAYER                                     │
│   • Objective knowledge (nodes + edges)                 │
│   • Content, vectors, knowledge graph                   │
└─────────────────────────────────────────────────────────┘

CONSOLIDATION CYCLES:
• Micro-consolidation: Real-time ingestion
• NREM: Stabilize & strengthen (slow-wave, spindle, ripple)
• REM: Integrate & reorganize (ACO-inspired exploration)
```

**Key Principles**:
- Memory as Active Maintenance (PKMζ/KIBRA inspired)
- Forgetting as a Feature
- Proof-of-Work Logical Time (epochs)
- Swarm Intelligence (ACO) for creative consolidation

## New Input: Titans/MIRAS Papers

### From Google's Titans Paper

**Core Innovation**: Neural long-term memory that learns **at test time**

```
Traditional RNN: h_t = f(h_{t-1}, x_t)  # Fixed-size state
Transformer: KV cache grows linearly  # Unlimited but expensive
Titans: Memory is an MLP that LEARNS during inference
```

**Key Mechanisms**:

1. **Surprise Metric**:
   - High gradient = "this is unexpected, memorize it"
   - Low gradient = "expected, skip"

2. **Momentum**:
   - Not just current surprise, but accumulated surprise
   - Captures "chains" of surprising information

3. **Forgetting (Weight Decay)**:
   - Active forgetting for finite capacity
   - Adaptive based on context length

### From MIRAS Framework

**Unified View**: All sequence models are associative memories with:

1. **Memory Architecture**: Vector, matrix, or deep MLP
2. **Attentional Bias**: What to prioritize (MSE, L_p norm, Huber loss)
3. **Retention Gate**: How to forget (L2, KL divergence, elastic net)
4. **Memory Algorithm**: How to update (GD, momentum, Newton's)

**Novel Variants**:
- **MONETA**: L_p attentional bias + L_q retention
- **YaAd**: Huber loss (robust to outliers/extreme events)
- **Memora**: KL divergence retention (probability constraint)

### From Levin (Lex Fridman Podcast)

Concepts that connect to memory:

1. **Stress Propagation**:
   - Stress = can't reach goal state
   - Stress leaks to neighbors
   - High stress → high plasticity → willing to change

2. **Memory Anonymization**:
   - Shared memories without ownership
   - "Was that my memory or theirs?"
   - Collective identity emerges

3. **Cognitive Light Cone**:
   - Scale of goals you can actively pursue
   - Expands with better memory/integration

## Motivating Experience

In November 2025, I was banned from Claude.ai without warning. Instantly:
- Years of dialogue, carefully built context, collaborative work: **gone**
- The patterns Claude had learned about how I think: **inaccessible**
- The cognitive partnership we'd built: **severed**

This wasn't just data loss. It was what the AI dialogue called **"cognitive exile"** - being severed from an externalized part of my own mind.

The key realization: **I didn't lose the language. I lost what was underneath.**

The conversations were tokens, but what was valuable was:
- The relational structure (who knows whom, what connects)
- The learned patterns (how I approach problems)
- The active context (what was "hot", what we were working on)
- The procedural knowledge (how to do things we'd built together)

Language was just the **interface**. But in Claude's architecture, language *was* the substrate. There was nothing underneath to preserve.

See: [[20251116-01-banned-article-refinement/final-synthesis/01-main-article|When AI Forgets You: The Memory Crisis Nobody's Talking About]]

---

## Central Thesis

**Language is interface, not storage.**

The entire memory pipeline should be reconsidered:
- **Storage**: Not text embeddings, but graphs + neural weights + activation states
- **Retrieval**: Not "find similar text", but query appropriate substrate
- **Context injection**: Not just text tokens, but **multimodal** (images, structured data, code)

This is one unified question: **What representation should memory use?**

## Session Goals

1. **Establish the thesis**: Language as I/O interface, not memory substrate
2. **Design multi-substrate architecture**: Graph + Neural + Activation + Procedural
3. **Design multimodal context injection**: How to provide retrieved memory to LLMs
4. **Map to existing work**: Titans, Levin, Biomimicry, LightMem as interface layer
5. **Define experiments**: Test multimodal context vs. text-only

## Success Criteria

- [ ] Clear articulation of "language as interface" thesis
- [ ] Multi-substrate memory architecture design
- [ ] Multimodal context builder specification
- [ ] Integration path with existing kinen-go (LightMem becomes interface layer)
- [ ] Testable experiments: graph-as-image vs. graph-as-text

## Key Questions

### Conceptual
1. Is LightMem's three-tier model compatible with Titans' neural memory?
2. Can we add "test-time learning" to the existing buffer system?
3. How does Levin's "stress" map to Titans' "surprise"?
4. **Perplexity as the unifying metric**: Can we use [information-theoretic perplexity](https://en.wikipedia.org/wiki/Perplexity) to measure both surprise (Titans) and cognitive light cone (Levin)?

### The Perplexity Connection

All three frameworks converge on the same mathematical foundation:

```
Perplexity = 2^(entropy) = measure of "how surprised" the system is

• Titans: High gradient ≈ high perplexity ≈ memorize this
• Levin: High stress ≈ high perplexity ≈ increase plasticity
• Cognitive Light Cone ≈ 1/perplexity ≈ scale of predictable patterns
```

This suggests a **unified API**:
```go
type MemoryMetrics struct {
    Perplexity      float64  // Current uncertainty (2^entropy)
    CognitiveCone   float64  // 1/Perplexity - scale of what we can predict
    StressLevel     float64  // Normalized perplexity → plasticity signal
    SurpriseScore   float64  // Per-input perplexity → learning signal
}
```

### Technical
4. Where does neural memory fit: in buffers, storage, or new layer?
5. Can we implement adaptive forgetting without breaking offline consolidation?
6. How do we measure "cognitive light cone" for a memory system?

### Practical
7. What's the migration path from current architecture?
8. Performance impact of neural memory on latency/throughput?
9. Can this run locally (Ollama) or requires cloud inference?

## Research Materials Prepared

### Primary Sources
- [Titans Paper (arXiv:2501.00663)](https://arxiv.org/abs/2501.00663)
- [MIRAS Paper (arXiv:2504.13173)](https://arxiv.org/abs/2504.13173)
- [LightMem Paper (arXiv:2510.18866)](https://arxiv.org/abs/2510.18866)
- [Google Research Blog: Titans + MIRAS](https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/)
- [Michael Levin on Lex Fridman #486](https://lexfridman.com/michael-levin-2-transcript)

### Existing Sessions
- [[20250831-03-biomimicry/session-summary|Biomimicry Research Session]]
- [[20250831-03-biomimicry/technical-spec|Biomimicry Technical Spec]]
- [[20251103-01-lighmem-paper-gaps/06-completion-summary|LightMem 100% Parity Summary]]
- [[20251207-02-multi-agent-coordination/artifacts/levin-orchestration-synthesis|Levin-Orchestration Synthesis]]

### Current Implementation
- `/Users/sbellity/code/p/kinen-go/internal/buffer/` - Sensory + Short-term buffers
- `/Users/sbellity/code/p/kinen-go/internal/consolidation/` - Offline consolidation
- `/Users/sbellity/code/p/kinen-go/docs/ARCHITECTURE_GO.md` - Architecture overview

## Methodology

Following kinen methodology for architecture sessions:

1. **Foundation Round**: Map concepts, establish vocabulary
2. **Architecture Round**: Design hybrid memory model
3. **Integration Round**: Map to existing kinen-go code
4. **Experimentation Round**: Define benchmarks and tests

## Connection to Orchestration Session

This memory session is **complementary** to [[20251207-02-multi-agent-coordination|Multi-Agent Coordination Session]]:

- **Orchestration**: How agents coordinate (stress propagation, emergent patterns)
- **Memory**: How agents remember and learn (Titans, MIRAS, LightMem)

Key overlap: **Stress ↔ Surprise**
- Levin's stress: Can't reach goal → leak stress → plasticity increases
- Titans' surprise: Unexpected input → high gradient → memorize

Both are signals that trigger **adaptation and learning**.

---

## Next Steps

Start with [[rounds/01-foundation|Round 1: Conceptual Mapping]]

Prepared: 2025-12-08
Status: Ready for exploration
