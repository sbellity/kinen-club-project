# Archived Documents

> Historical documents from the design process - kept for reference

These documents contain valuable thinking and exploration but have been superseded by the consolidated specification.

**Latest addition (Dec 8, 2024)**: Connectors integration documents - superseded by simpler Docker-bundled skills approach.

## Superseded By

All content from these files has been consolidated into:
- **[`../INDEX.md`](../INDEX.md)** - Entry point
- **[`../ARCHITECTURE.md`](../ARCHITECTURE.md)** - Complete architecture
- **[`../agents/README.md`](../agents/README.md)** - Agent specifications
- **[`../skills/README.md`](../skills/README.md)** - Skill specifications
- **[`../skills/DISTRIBUTION-STRATEGY.md`](../skills/DISTRIBUTION-STRATEGY.md)** - Skills distribution
- **[`../implementation/README.md`](../implementation/README.md)** - Implementation guide

## Files

### Connectors Integration (Dec 8, 2024)
- `CONNECTORS-INTEGRATION.md` - Misunderstood connectors as skill distribution (superseded by DISTRIBUTION-STRATEGY.md)
- `connectors-integration.md` - Detailed connectors integration guide (superseded by DISTRIBUTION-STRATEGY.md)

**Why archived**: Connectors are a declarative framework for runtime-deployed integrations (like Anthropic, OpenAI), not a distribution mechanism for agent skills. Skills are now bundled in Docker image.

### Agent Design
- `AGENT-ROLES-ARCHITECTURE.md` - Initial 6-agent design (superseded by 7-agent design in agents/README.md)
- `REFINED-AGENT-ROLES.md` - Refined 7-agent design with lifecycle (consolidated into agents/README.md)

### Plugin & Skills
- `MARKETPLACE-ARCHITECTURE.md` - Plugin marketplace concept (consolidated into ARCHITECTURE.md)
- `PLUGIN-ORGANIZATION-PLAN.md` - Plugin structure (superseded by Docker-bundled approach)
- `SKILLS-LIBRARY-PLAN.md` - Skills library plan (consolidated into skills/README.md)
- `skills-framework.md` - Skills framework (consolidated into skills/README.md)

### Implementation
- `IMPLEMENTATION-PLAN.md` - Implementation timeline (extracted to implementation/timeline.md)
- `VISUAL-SUMMARY.md` - Visual diagrams (key content in ARCHITECTURE.md)
- `FINAL-ARCHITECTURE-SUMMARY.md` - Architecture summary (superseded by ARCHITECTURE.md)

### Prompts
- `system-prompt.md` - Base system prompt (moved to prompts/system-prompt.md)

## Why Archived?

These documents were created during the iterative design process and contain:
- ✅ Valuable thinking and exploration
- ✅ Alternative approaches considered
- ✅ Detailed rationale for decisions
- ❌ Redundant information
- ❌ Outdated approaches
- ❌ Overlapping content

The consolidated spec provides:
- ✅ Single source of truth
- ✅ Clear entry point
- ✅ Sharp, focused documents
- ✅ No duplication
- ✅ Easy to navigate

## If You Need Details

If you need more context on any decision, these archived documents provide the full design history.
