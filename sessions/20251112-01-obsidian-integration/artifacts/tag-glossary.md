---
date: 2025-11-12
artifact_type: reference
aliases:
  - "obsidian-integration - Tag Glossary"
tags:
  - space/p
  - domain/research
  - tech/kinen
summary: "Comprehensive tag glossary for kinen sessions with usage guidelines"
---

# Kinen Tag Glossary

This document defines standard tags for kinen sessions. Tags help discover related sessions and filter by category.

**Important**: Tags use forward slash (`/`) for hierarchical organization, which works with Obsidian's nested tag support. Colons (`:`) are not valid in Obsidian tags.

**Usage Guidelines**:
- Use 2-5 tags per session (don't over-tag)
- Always include at least one Domain tag
- Always include Space tag (which space this session belongs to)
- Include Session Type tag
- Add Status tag when session state changes
- Use Stakeholder tags when relevant
- Use Technology tags for technical sessions

---

## Domain Tags

**What area of work** - Prefix: `domain/`

- `#domain/architecture` - System design, technical architecture, system design sessions
- `#domain/product-design` - Product requirements, user experience, feature design
- `#domain/research` - Research and analysis sessions, literature reviews
- `#domain/creative-writing` - Creative writing, storytelling, narrative work
- `#domain/code-implementation` - Code implementation, programming sessions
- `#domain/business-strategy` - Business planning, strategy, decision-making
- `#domain/datahub` - DataHub platform specific work
- `#domain/accounting` - Accounting system work
- `#domain/charging` - Charging/billing system work
- `#domain/invoicing` - Invoicing system work

---

## Session Type Tags

**Methodology pattern** - Prefix: `type/`

- `#type/iterative-design` - Turn-based iterative refinement (most common)
- `#type/requirements-refinement` - Requirements gathering and refinement
- `#type/research-design` - Research followed by design
- `#type/phased-analysis` - Multi-phase analysis
- `#type/simple-task` - Single-goal, straightforward tasks
- `#type/creative-writing` - Creative writing sessions
- `#type/technical-spec` - Technical specification sessions
- `#type/architecture-review` - Architecture review and analysis

---

## Status Tags

**Session state** - Prefix: `status/`

- `#status/in-progress` - Active session, work ongoing
- `#status/complete` - Completed session, goals achieved
- `#status/paused` - Temporarily paused, will resume
- `#status/blocked` - Blocked waiting on something
- `#status/archived` - Archived, no longer active

---

## Space Tags

**Which space/organization** - Prefix: `space/`

- `#space/p` - Personal space (personal projects, creative work, research)
- `#space/nest` - Nest workspace (work-related sessions, technical architecture, business)

**Usage**: Always include a space tag to organize sessions by workspace. Helps filter and discover sessions within a specific context.

---

## Stakeholder Tags

**Who's involved** - Prefix: `stakeholder/`

- `#stakeholder/backend` - Backend engineering focus
- `#stakeholder/frontend` - Frontend engineering focus
- `#stakeholder/product` - Product management focus
- `#stakeholder/design` - Design focus
- `#stakeholder/devops` - DevOps/infrastructure focus

---

## Technology Tags

**Technologies involved** - Prefix: `tech/`

- `#tech/go` - Go language
- `#tech/typescript` - TypeScript
- `#tech/rust` - Rust language
- `#tech/datahub` - DataHub platform
- `#tech/obsidian` - Obsidian tooling
- `#tech/fam` - FAM (Fam of Agents Multitasking)
- `#tech/kinen` - Kinen methodology/tooling

---

## Tag Management

### Obsidian Tag Features

- **Tag Pane**: Shows all tags in sidebar - helps discover related sessions
- **Tag Autocomplete**: When typing `#`, Obsidian suggests existing tags
- **Tag Wrangler Plugin**: Can rename tags across all files, merge tags, etc.

### Best Practices

1. **Consistency**: Use tags from this glossary when possible
2. **Curate**: Review tags periodically, merge duplicates
3. **Document**: Add new tags to this glossary when needed
4. **Assistants**: AI assistants should use tags from this glossary for consistency

---

## Tag Examples

**Architecture Session (Nest workspace)**:
```yaml
tags:
  - space/p
  - space/nest
  - domain/architecture
  - type/iterative-design
  - status/in-progress
  - stakeholder/backend
  - tech/go
```

**Product Design Session (Nest workspace)**:
```yaml
tags:
  - space/p
  - space/nest
  - domain/product-design
  - type/requirements-refinement
  - status/in-progress
  - stakeholder/product
```

**Creative Writing Session (Personal space)**:
```yaml
tags:
  - space/p
  - space/p
  - domain/creative-writing
  - type/creative-writing
  - status/in-progress
```

**Research Session (Personal space)**:
```yaml
tags:
  - space/p
  - space/p
  - domain/research
  - type/research-design
  - status/complete
```

---

## Adding New Tags

When adding new tags:
1. Add to appropriate category in this glossary
2. Document what the tag means
3. Provide example usage
4. Update this document

---

_This glossary should be curated together by users and assistants to maintain consistency._

