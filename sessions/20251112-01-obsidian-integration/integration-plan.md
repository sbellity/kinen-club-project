---
date: 2025-11-12T11:20:32Z
artifact_type: living_document
aliases:
  - "obsidian-integration - Integration Plan"
tags:
  - space/p
  - domain/research
  - type/iterative-design
  - status/complete
  - tech/obsidian
  - tech/kinen
  - tech/fam
status: complete
summary: "Living document capturing decisions and requirements for Obsidian integration with kinen methodology - COMPLETE"
---

# Obsidian Integration Plan

This document evolved through each round, capturing clarified decisions and requirements.

## Current State

**Status**: ✅ **COMPLETE** - All 5 rounds completed, comprehensive artifacts created, ready for POC

**Key Insights from Round 1**:
- Cross-session knowledge discovery is CORE to kinen philosophy
- Non-technical user adoption is primary motivation
- Better UX for markdown editing and responses needed
- Linking and plugin ecosystem are key advantages
- Data portability and ownership very important
- Success criteria: Daily use + wife can use for creative writing/research

## Decisions Made

### From Round 1

1. **Hybrid Links + Tags**: Need both, with clear conventions (to be defined in Round 2)
2. **Graph View**: Aligns with kinen philosophy, worth exploring
3. **Callout Format**: Will experiment with callouts/blockquotes instead of `>>` markers
4. **Methodology Adaptation**: Exploring Option B (Obsidian-native structure)
5. **AI Integration**: Open to kinen plugin and FAM integration within Obsidian
6. **Annotation Format**: Prefer callouts/blockquotes for responses
7. **Cross-Session Linking**: AI should proactively suggest links and references
8. **Semantic Search**: Important feature, need to explore plugin options
9. **Mobile Access**: Benefit of Obsidian (mobile apps available)
10. **Version Control**: User's choice, not kinen's concern

## Open Questions

### ✅ All Resolved (Round 3-5)

1. ✅ **File Naming**: `01-topic-name.md` format + aliases with session prefix
2. ✅ **Tag Glossary**: Created with prefixes (`domain/`, `type/`, `status/`, etc.)
3. ✅ **Session Templates**: 3 templates created (iterative-design, technical-spec, creative-writing)
4. ✅ **Semantic Search**: Kinen-orchestrated (FAM analyzes vault, provides API)
5. ✅ **Plugin Architecture**: FAM + Obsidian plugin integration (Option C)
6. ✅ **FAM Backend**: Hybrid approach (vault + in-memory SQLite + DuckDB)
7. ✅ **Diagrams**: Mermaid for technical, Excalidraw for freeform
8. ✅ **Callout UX**: Pre-population + plugin command
9. ✅ **Workflow**: Status bar button + command palette

## Requirements

### Identified So Far

1. **Non-Technical User Support**:
   - Better markdown editing UX (live preview, visual editor)
   - Simplified workflow (no manual file creation)
   - Clear visual distinction for responses (callouts)
   - Guided workflow (plugin enforces methodology)

2. **Cross-Session Discovery**:
   - Semantic search capability
   - Graph view for visualizing connections
   - Proactive link suggestions from AI
   - Tag-based filtering

3. **Data Ownership**:
   - Local markdown files (no lock-in)
   - User controls backup/version control
   - Portable across tools

4. **Mobile Support**:
   - Obsidian mobile apps available
   - Sync solution (user's choice)

## Methodology Adjustments

### Proposed (To Be Validated)

1. **Linking Requirements**: 
   - Rounds should explicitly link to previous rounds
   - Cross-session links when concepts referenced
   - AI should proactively suggest links

2. **Callout Format**:
   - Replace `>>` markers with Obsidian callouts
   - Standardize on callout type for user responses
   - Experiment in Round 2

3. **Structure Adaptation**:
   - Explore link-centric organization (Option B)
   - Consider MOC (Map of Content) pattern for cross-session organization
   - Maintain folder structure but enhance with links

4. **Template System**:
   - Use Templater plugin for session initialization
   - Pre-populate frontmatter and structure
   - Reduce manual setup

5. **Dashboard/Overview**:
   - Auto-generate session dashboards (Dataview plugin)
   - Track progress, decisions, open questions
   - Show related sessions

### From Round 3 (Proposed)

1. **File Naming Convention**:
   - Use `01-topic-name.md` format (numbered prefix + descriptive topic)
   - Better for Obsidian link dropdowns
   - Maintains sort order

2. **Tag System**:
   - Curated tag glossary with categories (Domain, Session Type, Status, Stakeholder, Technology)
   - Tag Wrangler plugin for management
   - Methodology guidance on tag usage

3. **Session Templates**:
   - Base template + type-specific templates (iterative-design, creative-writing, etc.)
   - Use Templater plugin for variables
   - Users can create custom templates

4. **Semantic Search**:
   - Option A: Local plugin with embeddings + DuckDB
   - Option B: Kinen-orchestrated (FAM analyzes vault, provides API)
   - Prefer Option B (leverages kinen infrastructure)

5. **Kinen Plugin Architecture**:
   - Obsidian plugin (UI layer) + FAM Core (orchestration)
   - FAM uses Obsidian vault as backend (or hybrid with SQLite)
   - Features: Session management, round interaction, AI integration, dashboard generation

6. **FAM + Obsidian Backend**:
   - Explore replacing SQLite with Obsidian vault + DuckDB
   - Or hybrid: SQLite for FAM core, Obsidian vault for kinen sessions
   - Benefits: Portable, version-control friendly

7. **Callout UX**:
   - Pre-populate empty callouts in round files
   - Plugin helper for adding more callouts
   - Addresses discoverability issue

8. **Workflow**:
   - Status bar button: "Ready for Round N"
   - Command palette: "Kinen: Generate Next Round"
   - Auto-detection: FAM watches for changes

## Final Decisions (Round 5)

1. ✅ **Terminology**: Keep "rounds" (methodology concept) vs "turns" (FAM execution concept)
2. ✅ **Tag Prefixes**: Confirmed as Obsidian best practice
3. ✅ **Plugin Focus**: Simple approach - pre-populated callouts + plugin command
4. ✅ **File Naming**: All rounds updated with aliases, moved to `rounds/` folder
5. ✅ **Snippets**: Handle in Kinen plugin (avoid external plugin dependency)
6. ✅ **POC Planning**: Complete implementation plan ready

## Session Outcomes

### Artifacts Created
1. ✅ **Tag Glossary** (`artifacts/tag-glossary.md`) - Comprehensive tag system
2. ✅ **Plugin Integration Spec** (`artifacts/plugin-integration-spec.md`) - Architecture spec
3. ✅ **Methodology Updates** (`artifacts/methodology-updates.md`) - Obsidian-specific guidance
4. ✅ **Session Templates** (`artifacts/session-templates/`) - 3 type-specific templates
5. ✅ **POC Plugin Spec** (`artifacts/poc-plugin-spec.md`) - Complete POC implementation spec
6. ✅ **Obsidian Methodology** (`artifacts/methodology-obsidian.md`) - Updated methodology for agents
7. ✅ **Session Summary** (`session-summary.md`) - Complete session summary

### Next Steps
- **POC Implementation**: Ready to begin using complete specs
- **Validation**: Test workflow end-to-end in Obsidian
- **Iteration**: Refine based on POC feedback

