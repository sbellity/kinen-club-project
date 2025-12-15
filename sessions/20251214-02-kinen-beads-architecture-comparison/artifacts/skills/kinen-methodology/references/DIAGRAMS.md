# Diagrams Reference

Guide for creating visual diagrams in kinen sessions.

## When to Use Diagrams

Diagrams are especially valuable in:
- **Architecture sessions**: System components and relationships
- **Integration sessions**: How parts connect
- **Complex flows**: User journeys, data flows, state machines

**Rule**: If you're explaining relationships between more than 3 things, consider a diagram.

## Mermaid (Primary)

Mermaid is the preferred format - native Obsidian support, text-based, version-control friendly.

### Flowcharts / Architecture

```mermaid
graph TB
    A[User Session] --> B[Session Manager]
    B --> C[Knowledge Graph]
    B --> D[Artifact Store]
    C --> E[Search Index]
```

**Syntax:**
````markdown
```mermaid
graph TB
    A[Component A] --> B[Component B]
    B --> C[Component C]
    C --> D[Component D]
```
````

**Direction options:**
- `TB` - Top to bottom
- `BT` - Bottom to top
- `LR` - Left to right
- `RL` - Right to left

### Sequence Diagrams

Show interactions over time:

```mermaid
sequenceDiagram
    participant U as User
    participant S as Session
    participant M as Memory
    U->>S: Start session
    S->>M: Search related
    M-->>S: Related sessions
    S-->>U: Context loaded
```

**Syntax:**
````markdown
```mermaid
sequenceDiagram
    participant A as Actor A
    participant B as Actor B
    A->>B: Request
    B-->>A: Response
```
````

### State Diagrams

Show state machines and transitions:

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> InProgress: Start
    InProgress --> Paused: Pause
    Paused --> InProgress: Resume
    InProgress --> Complete: Finish
    Complete --> [*]
```

**Syntax:**
````markdown
```mermaid
stateDiagram-v2
    [*] --> State1
    State1 --> State2: Trigger
    State2 --> [*]
```
````

### Entity Relationship Diagrams

Show data models:

```mermaid
erDiagram
    SESSION ||--o{ ROUND : contains
    SESSION ||--|| INIT : has
    SESSION ||--o{ ARTIFACT : produces
    ROUND ||--o{ QUESTION : contains
    QUESTION ||--o| ANSWER : has
```

**Syntax:**
````markdown
```mermaid
erDiagram
    ENTITY1 ||--o{ ENTITY2 : relationship
    ENTITY2 ||--|| ENTITY3 : relationship
```
````

**Relationship notation:**
- `||--||` - One to one
- `||--o{` - One to many
- `o{--o{` - Many to many

### Class Diagrams

Show structure and relationships:

```mermaid
classDiagram
    class Session {
        +String id
        +String name
        +Status status
        +start()
        +close()
    }
    class Round {
        +Int number
        +Question[] questions
        +generate()
    }
    Session "1" --> "*" Round
```

**Syntax:**
````markdown
```mermaid
classDiagram
    class ClassName {
        +Type attribute
        +method()
    }
```
````

## Diagram Best Practices

### Do

- **Keep it simple**: 5-10 nodes maximum
- **Label clearly**: Use descriptive names
- **Show flow direction**: Make relationships clear
- **Use appropriate type**: Flowchart for architecture, sequence for interactions
- **Include in questions**: Diagrams help explain options
- **Design for print**: Diagrams should fit and be readable on A4/letter paper

### Don't

- **Overcrowd**: Split complex diagrams into multiple
- **Use colors excessively**: Obsidian themes vary
- **Forget context**: Always explain what the diagram shows
- **Make it the only explanation**: Diagrams supplement text
- **Use extreme horizontal layouts**: Wide `LR` diagrams don't print well - prefer `TB` (top-bottom) for complex flows

### In Round Questions

Use diagrams to clarify options:

```markdown
### Q2.3: Architecture Pattern

**Option A: Layered**

```mermaid
graph TB
    UI --> Service
    Service --> Repository
    Repository --> Database
```

- Pros: Clear separation, testable
- Cons: Can be rigid

**Option B: Event-driven**

```mermaid
graph LR
    Producer --> Queue
    Queue --> Consumer1
    Queue --> Consumer2
```

- Pros: Decoupled, scalable
- Cons: Complexity, debugging harder

> [!note] Answer
>
```

## Alternative Formats

### Excalidraw

For freeform, hand-drawn style diagrams:
- Brainstorming sessions
- Concept sketches
- Quick visual explanations

**Usage**: Create `.excalidraw` file in artifacts folder, link from documents.

### Obsidian Canvas

For spatial organization:
- Mind maps
- Relationship mapping
- Visual session overviews

**Usage**: Create `.canvas` file, useful for complex session navigation.

## Quick Reference

| Diagram Type | Use For | Mermaid Keyword |
|--------------|---------|-----------------|
| Flowchart | Architecture, processes | `graph` |
| Sequence | Interactions over time | `sequenceDiagram` |
| State | State machines | `stateDiagram-v2` |
| ER | Data models | `erDiagram` |
| Class | Object structure | `classDiagram` |

## Tips for AI Assistants

When generating diagrams:

1. **Match complexity to need**: Simple question → simple diagram
2. **Use consistent naming**: Match diagram labels to discussion terms
3. **Provide text explanation**: Diagram + explanation, not diagram alone
4. **Check rendering**: Mermaid syntax is strict, verify it renders
5. **Consider session type**: Architecture sessions need more diagrams than research
