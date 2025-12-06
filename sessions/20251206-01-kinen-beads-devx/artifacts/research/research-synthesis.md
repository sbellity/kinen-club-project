# Research Synthesis: Kinen's Scientific Foundations

## Executive Summary

Kinen draws from three major research domains to create a unique approach to knowledge management and cognitive augmentation:

1. **Neuroscience & Sleep Research** — Memory consolidation as multi-phase orchestration
2. **Free Energy Principle (FEP)** — Unified theoretical framework for learning and behavior
3. **Cognitive Architectures** — Multi-layer knowledge representation

This synthesis distills months of research into actionable design principles.

---

## 1. The Biomimetic Foundation

### Key Insight: Memory is Active Maintenance

From Todd Sacktor's research on the PKMζ/KIBRA protein complex:

> "Long-term memories are not stored passively. They require a continuous 'molecular handshake' to resist a natural tendency toward decay. **Forgetting is the default; remembering is an active process.**"

**Design Principle**: Knowledge in Kinen has "health" that naturally decays. The system must actively maintain important information.

### Sleep Consolidation Phases

Research reveals memory consolidation is a precise, multi-phase orchestration:

| Phase | Brain Activity | Function | Kinen Equivalent |
|-------|---------------|----------|------------------|
| **Slow-Wave** | Delta oscillations | Broad topic identification | Schema detection |
| **Spindle** | Sleep spindles | Memory reactivation | Cued retrieval |
| **Ripple** | Sharp wave-ripples | High-speed replay (20:1 compression) | Connection strengthening |
| **REM** | Theta waves | Creative integration | Serendipitous discovery |

### Synaptic Tagging and Capture (STC)

A weak but potentially important memory gets a temporary "tag" (2-3 hours). If a strong learning event occurs nearby, the weak memory gets strengthened.

**Design Principle**: Low-confidence inferred connections get "consolidation tags." If related high-importance events occur, these connections are strengthened.

---

## 2. Free Energy Principle (FEP)

### Core Concept

From Karl Friston's framework:

> "Living systems minimize variational free energy by updating their internal models to better predict observations."

**Variational Free Energy = Complexity - Accuracy**

- **Complexity**: Divergence between current beliefs and prior knowledge
- **Accuracy**: How well the model predicts observations

### FEP as Design Philosophy (Not Strict Math)

Key decision from research sessions:

> "FEP will serve as a **normative principle and guiding heuristics**, not a strict mathematical implementation. Existing, efficient algorithms will act as 'amortized inference engines' approximating FEP's goals."

### Precision as Dynamic Weighting

Precision (confidence) dynamically modulates:
- Belief updates
- Memory decay rates
- Consolidation priority
- Retrieval ranking

**Design Principle**: Every piece of knowledge has a precision score derived from:
- Source reliability
- Recency
- User feedback
- Consistency with established knowledge

### Logical Clock as Free Energy Reduction

Kinen's internal time advances based on **accumulated surprisal** (prediction error), not wall-clock time.

**Design Principle**: Consolidation triggers when accumulated surprisal exceeds a threshold, making the system's rhythm adaptive to its learning needs.

---

## 3. Multi-Layer Cognitive Architecture

### The Cognitive Graph (Three Layers)

| Layer | Purpose | Contents |
|-------|---------|----------|
| **Content Store** | Ground truth | Raw documents, immutable |
| **Vector Store** | Semantic search | Multi-perspective embeddings |
| **Knowledge Graph** | Relationships | Nodes, edges, confidence scores |

### Multiple Perspective Spaces

Inspired by the MemInsight paper:

| Perspective | Query Lens | Example Use |
|-------------|-----------|-------------|
| `general` | Default semantic | "Find relevant documents" |
| `causal` | Cause-effect | "Why did X happen?" |
| `methodological` | How-to | "How to implement X?" |
| `temporal` | Time-based | "What happened before Y?" |

**Design Principle**: Generate multiple embeddings per chunk, each from a different perspective.

### Node & Edge Ontology

**Nodes** (Schema.org + Kinen extensions):
- `Document`, `Chunk`, `Artifact`
- `Session`, `Concept`, `User`
- `AmplificationFeedback`

**Edges**:
- `HAS_CHUNK`, `CREATED_IN`, `REFERENCES`
- `IMPLIES`, `CONTRADICTS`, `BUILDS_ON`

**Edge Confidence Scores**:
- Explicit user-created: 0.95
- Explicit citation: 0.85
- Inferred semantic: similarity_score × 0.7
- Scores evolve based on feedback and time-decay

---

## 4. Consolidation Mechanisms

### Stage 1: Micro-Consolidation (Reflex)

**Trigger**: Real-time, on artifact creation

**Process**:
1. Save to Content Store
2. Content-aware chunking
3. Generate embeddings (all perspectives)
4. Create nodes and structural edges
5. Add positional indexes

### Stage 2: NREM Consolidation (Stabilize & Strengthen)

**Trigger**: Session completion or inactivity

**Goal**: Increase memory "frequency" by creating strong, explicit links

**Tasks**:
- Intra-session linking
- Concept linking to existing nodes
- Contradiction detection (NLI model)
- Confidence scoring

### Stage 3: REM Consolidation (Integrate & Reorganize)

**Trigger**: Long system idle periods

**Goal**: Reduce noise by pruning spurious connections, discover novel links

**Tasks**:
- Global similarity search
- Edge weight recalibration (from feedback)
- Structural pruning (remove weak edges)
- Emergent concept detection
- Creative exploration (high-temperature LLM)

---

## 5. Retrieval Pipeline

### Intent-Driven Search

Adapt retrieval strategy based on user intent:

| Intent | Strategy |
|--------|----------|
| `Fact Check` | Prioritize graph precision |
| `Find Analogy` | Cross-perspective vector search |
| `Explore Topic` | Graph traversal + serendipity |
| `Continue Work` | Session-aware retrieval |

### Multi-Step Process

1. **Seeding**: Weighted hybrid vector (70% current chunk, 30% full artifact)
2. **Expansion**: Parallel searches across perspectives
3. **Fusion**: Reciprocal Rank Fusion (RRF)
4. **Traversal**: Follow graph edges from top candidates
5. **Scoring**: Path-based reasoning (content + graph path features)
6. **Assembly**: Structure into context packet

---

## 6. Key Algorithms & Libraries

### From kinen-rs (Rust)

| Component | Technology | Status |
|-----------|------------|--------|
| Search | SQLite FTS5 + sqlite-vec | Implemented |
| Embeddings | External (Ollama/API) | Implemented |
| Storage | SQLx + SQLite | Implemented |
| NLI | Pre-trained model | Designed |
| Topic Modeling | BERTopic/HDBSCAN | Designed |
| Graph Exploration | Max-Min Ant System (MMAS) | Designed |

### From kinen-go (Go)

| Component | Technology | Status |
|-----------|------------|--------|
| Memory Pipeline | Normalize → Compress → Segment → Extract → Embed → Store | Implemented |
| Buffering | Two-stage (Sensory → Short-term) | Implemented |
| Embeddings | Ollama (nomic-embed-text) | Implemented |
| Storage | SQLite + sqlite-vss | Implemented |
| Extraction | Ollama (structured output) | Implemented |

---

## 7. Insights for kinen.club

### What Makes Kinen Different

1. **Biomimetic Design**: Not just bio-inspired metaphors, but neuroscience-based algorithms
2. **Active Forgetting**: System knows what to forget, not just what to remember
3. **Multi-Phase Consolidation**: Knowledge improves through "sleep" cycles
4. **Precision-Weighted Learning**: Not all information is equally trustworthy
5. **Serendipitous Discovery**: Built-in mechanisms for creative exploration

### Product Positioning

> "Kinen is a **second brain** that actually works like a brain — it sleeps, it forgets, and it makes unexpected connections."

### Target Users

1. **Researchers** — Building knowledge over months/years
2. **AI Developers** — Context for AI assistants
3. **Knowledge Workers** — Complex decision-making with historical context

---

## 8. Open Research Questions

1. **Optimal consolidation triggers**: When exactly should NREM/REM cycles run?
2. **Precision calculation**: How to weight source, recency, feedback, consistency?
3. **Creative exploration bounds**: How much serendipity is useful vs. noise?
4. **Cross-space querying**: How to federate across multiple kinen spaces?
5. **Multi-agent memory**: How do multiple agents share a knowledge base?

---

## References

### Papers (from /research/papers/)
- H-MEM: Hierarchical Memory for Long-Context Language Modeling
- A-MEM: Adaptive Memory for LLM Agents
- MemGPT: Memory-Enhanced Language Models
- GraphRAG: Graph-based Retrieval Augmented Generation
- CoALA: Cognitive Architecture for Language Agents
- ExpeL: Experiential Learning for Language Agents

### Previous Sessions
- `20250831-02-brain`: Core architecture design
- `20250831-03-biomimicry`: Neuroscience-inspired design
- `20250831-04-integration`: FEP integration
- `20250903-01-planning`: Requirements and roadmap

