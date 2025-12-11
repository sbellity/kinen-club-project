# Bird-MCP Integration: Current State Analysis

## Executive Summary

The bird-mcp integration underwent a significant change from a generic `invoke_operation`/`batch_invoke` pattern to **native operation-specific tools**. However, documentation is inconsistent, leaving stale references that confuse both agents and developers.

---

## Architecture Overview

### New Pattern (Current)

Each whitelisted Bird API operation is exposed as a **separate MCP tool**:

```
x-operationName: "datahub.explorer:runQuery"
         ↓ (transformation)
Tool name: "mcp__bird-mcp__bird_datahub_explorer_run_query"
```

**Transformation rules** (in `operationToToolName()`):
1. Add `bird_` prefix
2. Replace `.` with `_`
3. Replace `:` with `_`
4. Convert camelCase to snake_case
5. Lowercase everything

### Old Pattern (Deprecated)

```typescript
// DEPRECATED - Generic invoke
mcp__bird-mcp__invoke_operation({
  operation: "datahub.explorer:runQuery",
  body: { modelName: "crm.contact", ... }
})

// DEPRECATED - Batch invoke
mcp__bird-mcp__batch_invoke({
  operations: [
    { id: "1", operation: "listCatalogs" },
    { id: "2", operation: "listModels", body: { catalogId: "..." } }
  ]
})
```

---

## Current Tool Inventory

### Meta Tools (for discovery/validation)

| Tool | Purpose | Status |
|------|---------|--------|
| `mcp__bird-mcp__list_operations` | List all available operations | ✅ Active |
| `mcp__bird-mcp__show_schema` | Get operation schema | ✅ Active |
| `mcp__bird-mcp__validate_artifact` | Validate JSON against schema | ✅ Active |

### Native Operation Tools

| Operation (x-operationName) | Tool Name | Category |
|-----------------------------|-----------|----------|
| `datahub.explorer:runQuery` | `bird_datahub_explorer_run_query` | Analytics |
| `datahub.models:listModels` | `bird_datahub_models_list_models` | Analytics |
| `datahub.models:getModel` | `bird_datahub_models_get_model` | Analytics |
| `datahub.catalogs:listCatalogs` | `bird_datahub_catalogs_list_catalogs` | Analytics |
| `datahub.catalogs:getCatalog` | `bird_datahub_catalogs_get_catalog` | Analytics |
| `data.entities:countEntities` | `bird_data_entities_count_entities` | Contacts |
| `data.entities:searchEntities` | `bird_data_entities_search_entities` | Contacts |
| `data.audiences:listAudiences` | `bird_data_audiences_list_audiences` | Audiences |
| `data.audiences:getAudience` | `bird_data_audiences_get_audience` | Audiences |
| `data.audiences:estimateAudienceSize` | `bird_data_audiences_estimate_audience_size` | Audiences |
| `contacts.lists:listLists` | `bird_contacts_lists_list_lists` | CRM |
| `contacts.lists:getList` | `bird_contacts_lists_get_list` | CRM |
| `contacts.schema:listAttributes` | `bird_contacts_schema_list_attributes` | CRM |
| `aitools.workflows:segmentBuilder` | `bird_aitools_workflows_segment_builder` | AI Tools |
| `campaigns:listCampaigns` | `bird_campaigns_list_campaigns` | Campaigns |
| `campaigns:getCampaign` | `bird_campaigns_get_campaign` | Campaigns |
| `content.projects:listProjects` | `bird_content_projects_list_projects` | Content |
| `content.projects:getProject` | `bird_content_projects_get_project` | Content |
| `channels:listChannels` | `bird_channels_list_channels` | Channels |
| `channels:getChannel` | `bird_channels_get_channel` | Channels |
| `channels.platforms:listPlatforms` | `bird_channels_platforms_list_platforms` | Channels |
| `brands:listBrands` | `bird_brands_list_brands` | Brands |
| `brands:getBrand` | `bird_brands_get_brand` | Brands |
| `content:listFolders` | `bird_content_list_folders` | Knowledge |
| `content:listDocuments` | `bird_content_list_documents` | Knowledge |
| `content:searchContent` | `bird_content_search_content` | Knowledge |
| `tasks:listProjects` | `bird_tasks_list_projects` | Tasks |
| `tasks:getProject` | `bird_tasks_get_project` | Tasks |
| `tasks:listTasks` | `bird_tasks_list_tasks` | Tasks |

---

## MCP Directives

Native tools require these directives (underscore prefix):

| Directive | Required | Type | Purpose |
|-----------|----------|------|---------|
| `_agent` | ✅ | string | Agent identity for tracking |
| `_intent` | ✅ | string | Human-readable purpose |
| `_select` | ❌ | string | JSONata expression for response transformation |

**Example:**
```typescript
mcp__bird-mcp__bird_datahub_catalogs_list_catalogs({
  _agent: "research-analyst",
  _intent: "Discover available data catalogs"
})
```

---

## Known Issues

### 1. Naming Confusion Between Tool Names and Operation Names

**Problem:** `show_schema` expects **operation names** (e.g., `aitools.workflows:segmentBuilder`), but agents see **tool names** (e.g., `mcp__bird-mcp__bird_aitools_workflows_segment_builder`) and incorrectly reverse-engineer them.

**Evidence from mcp.log:**
```
Error: operation 'bird.aitools.workflows:segment_builder' not found
💡 Did you mean: aitools.workflows:segmentBuilder
```

**Root cause:** The transformation is one-way. Agents guess incorrectly.

### 2. Stale Documentation References

Files still referencing deprecated `invoke_operation`/`batch_invoke`:

| File | Issue |
|------|-------|
| `plugins/session-analytics/skills/agent-optimization/SKILL.md` | Uses `invoke_operation`, `batch_invoke` examples |
| `plugins/session-analytics/skills/session-analysis/SKILL.md` | MCP log format shows `invoke_operation` |
| `plugins/session-analytics/skills/session-debugger/SKILL.md` | Suggests `batch_invoke` for rate limits |
| `README.md` | Mentions `batch_invoke` in traced tools |
| `EXPERIMENTS.md` | Documents `batch_invoke` optimization |
| `public/index.html` | UI references `batch_invoke` |

### 3. Inconsistent Documentation Quality

**Good (up-to-date):**
- `plugins/bird-platform/operations/*.md` - Correct native tool syntax
- `plugins/bird-platform/agents/*.md` - Correct patterns
- `plugins/bird-marketing/agents/*.md` - Correct patterns

**Outdated:**
- `plugins/session-analytics/skills/*.md` - Old patterns
- Root-level docs (`README.md`, `EXPERIMENTS.md`) - Mixed

---

## File Inventory by Status

### ✅ Up-to-date (32 files using native tools)

```
src/services/session.ts
src/platform/tools/index.ts
src/agents/marketing.ts
plugins/bird-platform/operations/*.md (6 files)
plugins/bird-platform/agents/*.md (3 files)
plugins/bird-platform/skills/*/SKILL.md (9 files)
plugins/bird-platform/reference/*.md (4 files)
plugins/bird-platform/task-guides/*.md (7 files)
plugins/bird-marketing/agents/*.md (4 files)
plugins/bird-marketing/skills/*/SKILL.md (partial)
docs/sandboxing.md
```

### ❌ Outdated (8 files with deprecated patterns)

```
plugins/session-analytics/skills/agent-optimization/SKILL.md
plugins/session-analytics/skills/session-analysis/SKILL.md
plugins/session-analytics/skills/session-analysis/scripts/analyze-sessions.ts
plugins/session-analytics/skills/session-debugger/SKILL.md
README.md
EXPERIMENTS.md
public/index.html
```

### ⚠️ Partial (reference both patterns)

```
packages/bird-mcp/src/index.ts (comment mentions invoke_operation)
```
