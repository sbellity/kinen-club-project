# Round 01: Foundation

**Goal**: Establish the conceptual foundation and validate the central thesis.

---

## Central Thesis to Validate

**Language is interface, not storage.**

The entire memory pipeline should be reconsidered:
- **Storage**: Not text embeddings, but graphs + neural weights + activation states
- **Retrieval**: Not "find similar text", but query appropriate substrate
- **Context**: Not just text tokens, but multimodal (images, structured data, code)

---

## Opening Questions

### 1. What exactly was lost in the ban?

Concrete decomposition of what "cognitive partnership" actually contained:

| Category | Examples | Current Storage | Lost? |
|----------|----------|-----------------|-------|
| **Facts** | "User works on kinen project" | Token embeddings | Yes |
| **Relations** | "kinen connects to biomimicry, Levin, orchestration" | Implicit in tokens | Yes |
| **Patterns** | "User approaches problems by exploring multiple frameworks" | Learned behavior | Yes |
| **Context** | "We're in the middle of designing memory architecture" | Session state | Yes |
| **Skills** | "How to do kinen sessions together" | Implicit | Yes |

**Question**: Which of these *could* have survived if architecture were different?

---

### 2. What substrates do we actually need?

**Proposed minimal set**:

| Substrate | What it stores | How it stores | Query type |
|-----------|---------------|---------------|------------|
| **Relational (Graph)** | Entities + relationships | Nodes + edges | Pattern matching |
| **Neural (Patterns)** | Learned regularities | Trained weights | Prediction |
| **Activation (Context)** | Current relevance | Decaying scores | Top-K |
| **Procedural (Skills)** | How to do things | Policies/workflows | Situation matching |

**Questions to explore**:
- Is this minimal set sufficient?
- What's the interaction between substrates?
- How does language interface with each?

---

### 3. What's the unifying metric?

**Proposal**: Perplexity as universal measure

```
Perplexity = 2^(entropy) = "how surprised is the system?"

High perplexity → Uncertain → Learn this (Titans)
High perplexity → Stressed → Increase plasticity (Levin)
Low perplexity → Confident → Within cognitive light cone
```

**Questions**:
- Can we measure perplexity at each substrate?
- How does perplexity drive routing between substrates?
- Is perplexity the right signal for forgetting?

---

### 4. What's the input/output interface?

**Current**: Language → tokens → store → retrieve → language
**Proposed**: Language → parse intent → route to substrate → query → render (multimodal) → generate

```
INPUT:
"Remember that kinen connects to biomimicry through the three-layer cognitive graph"

PARSE:
{
  type: "store_relation",
  subject: "kinen",
  predicate: "connects_to",
  object: "biomimicry",
  via: "three-layer cognitive graph"
}

ROUTE:
→ Graph substrate: Add edge (kinen)→[connects_to:via=3-layer-graph]→(biomimicry)
→ Activation: Boost (kinen, biomimicry, cognitive-graph)
→ Neural: Not triggered (no pattern to learn)

OUTPUT:
"Stored the connection between kinen and biomimicry through the three-layer cognitive graph concept."
```

**Questions**:
- How sophisticated does the parser need to be?
- What happens when intent is ambiguous?
- How do we validate that storage happened correctly?

---

### 5. How does multimodal context work?

**Scenario**: User asks "What's the current state of the memory architecture project?"

**Current approach**: Retrieve relevant text chunks → concatenate → send as context

**Proposed approach**:
1. Query graph for project-related nodes → render as image
2. Query activation for "hot" topics → render as heatmap
3. Query neural for predicted next steps → summarize as text
4. Package as multimodal context

**Questions**:
- Which substrates benefit from visual rendering?
- What's the token efficiency gain?
- Does the LLM actually understand graph images better than graph descriptions?

---

## Key Tensions to Resolve

### A. Simplicity vs. Power

LightMem works because it's simple: text in → summarize → embed → retrieve → text out.

Multi-substrate is powerful but complex:
- More failure modes
- Harder to debug
- Requires more infrastructure

**Question**: What's the minimum viable multi-substrate architecture?

---

### B. Local-first vs. Cloud-enhanced

Your experience argues for local-first (can't be revoked).

But:
- Neural training benefits from scale
- Some operations are compute-intensive
- Sync across devices is valuable

**Question**: What must be local vs. can be cloud-augmented?

---

### C. Explicit vs. Learned

Some structure should be explicit (graph: entities, relations).
Some structure should be learned (neural: patterns).

**Question**: Where's the boundary? What should never be learned?

---

## Deliverables from Round 1

By end of round:
- [ ] Validated or refined the "language as interface" thesis
- [ ] Finalized substrate list (add/remove from proposed 4)
- [ ] Agreed on perplexity as unifying metric (or alternative)
- [ ] Sketched the input/output interface
- [ ] Identified minimum viable architecture

---

## Artifacts to Update

After this round, update:
- `artifacts/language-as-interface.md` - refine based on discussion
- `artifacts/titans-memory-synthesis.md` - add substrate mapping
- Create `artifacts/architecture-sketch.md` - initial system design

---

## Time Estimate

~45-60 minutes for thorough exploration of all 5 questions.
