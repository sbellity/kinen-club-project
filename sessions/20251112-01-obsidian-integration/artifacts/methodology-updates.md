---
date: 2025-11-12
artifact_type: methodology_update
aliases:
  - "obsidian-integration - Methodology Updates"
tags:
  - space/p
  - domain/research
  - tech/obsidian
  - tech/kinen
summary: "Updates to kinen methodology for Obsidian integration"
---

# Kinen Methodology Updates for Obsidian

This document captures updates to the kinen methodology to leverage Obsidian features.

---

## File Naming Convention

**Format**: `01-topic-name.md`, `02-next-topic.md`

**Rationale**:
- Numbered prefix maintains sort order
- Descriptive topic name shows in link dropdowns
- Better UX than generic `round-01.md`

**Aliases**: Add aliases in frontmatter for better link display with session prefix:
```yaml
aliases:
  - "session-name - Topic Name"
  - "session-name - Round N"
```

**Convention**: 
- First alias: `"session-name - Descriptive Topic"`
- Second alias: `"session-name - Round N"` (optional)
- Session name prefix helps identify which session when linking across sessions

---

## Linking Conventions

### Links vs Tags

**Links** (explicit relationships):
- Round progression: `rounds/02-topic.md` → `rounds/01-previous-topic.md`
- Cross-session references: When explicitly referencing another session
- Concept definitions: Link to where concept was first defined
- Decision tracking: Link from decision to discussion

**Tags** (themes/categories):
- Domain areas: `#architecture`, `#product-design`
- Session types: `#iterative-design`, `#requirements-refinement`
- Status: `#in-progress`, `#complete`
- Technologies: `#go`, `#typescript`

**Rule**: Links show specific relationships, tags enable discovery and filtering.

---

## Callout Format

**Replace** `>>` markers with Obsidian callouts:
```markdown
> [!note] Answer
> Your response here
```

**Benefits**:
- Better visual distinction
- Native Obsidian feature
- Pre-populated by AI (no typing needed)

**Callout Types**:
- `> [!note]` - General notes
- `> [!question]` - Questions
- `> [!tip]` - Tips/suggestions
- `> [!important]` - Important points
- `> [!warning]` - Warnings/concerns

---

## Session Templates

**Use Templates**: Session type templates ensure consistency:
- `iterative-design-init.md` - Standard round-based sessions
- `technical-spec-init.md` - Technical architecture sessions
- `requirements-refinement-init.md` - Product requirements sessions
- `creative-writing-init.md` - Creative writing sessions

**Template Variables**:
- `{{date}}` - Current date
- `{{session_name}}` - Session name (prompted)
- `{{goals}}` - Session goals (prompted)
- `{{domain_tag}}` - Domain tag (prompted)

---

## Tag System

**Follow Tag Glossary**: Use tags from `tag-glossary.md` for consistency.

**Guidelines**:
- Use 2-4 tags per session
- Always include Domain tag
- Include Session Type tag
- Add Status tag when state changes

**AI Assistants**: Should use tags from glossary for consistency.

---

## Diagram Format

**Mermaid for Technical Diagrams**:
- Native Obsidian support
- Text-based (easy for AI)
- Excellent for flowcharts, sequence diagrams, architecture

**Excalidraw for Freeform**:
- Hand-drawn style
- Good for brainstorming, freeform diagrams

**Canvas for Layouts**:
- Mind maps, freeform layouts
- Visual organization

---

## Session Init UX

**Command Palette**: "Kinen: Create New Session"
- Opens modal form
- Selects template
- Generates folder structure
- Creates files

**Context Menu**: Right-click → "New Kinen Session"
- Same as command palette
- Intuitive for mouse users

---

## Snippets Setup

**Callout Snippets**: Use Obsidian snippets for quick callout insertion:
- `:response` → `> [!note] Answer`
- `:question` → `> [!question]`
- `:tip` → `> [!tip]`

**Setup**: Create snippets in `.obsidian/snippets/` folder.

---

## Cross-Session Discovery

**AI Should**:
- Proactively suggest links to related sessions
- Use semantic search when preparing rounds
- Identify patterns across sessions
- Suggest connections during round creation

**User Should**:
- Review suggested links
- Add explicit links when referencing other sessions
- Use tags for discovery

---

## Methodology Principles (Unchanged)

- Round-based iterative refinement
- Document-first approach
- Progressive refinement
- Concrete over abstract
- Challenge assumptions

---

_These updates enhance the methodology with Obsidian-specific features while maintaining core principles._

