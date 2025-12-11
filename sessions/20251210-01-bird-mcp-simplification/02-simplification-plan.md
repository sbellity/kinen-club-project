# Bird-MCP Simplification Plan

## Goals

1. **Remove all deprecated references** to `invoke_operation` and `batch_invoke`
2. **Simplify naming** to reduce agent confusion
3. **Consolidate documentation** into fewer, clearer files
4. **Improve discoverability** so agents know how to use tools correctly

---

## Phase 1: Clean Up Stale References (Quick Wins)

### 1.1 Update Session Analytics Skills

**Files to update:**
- `plugins/session-analytics/skills/agent-optimization/SKILL.md`
- `plugins/session-analytics/skills/session-analysis/SKILL.md`
- `plugins/session-analytics/skills/session-debugger/SKILL.md`

**Changes:**
- Replace `invoke_operation` → native tool examples
- Replace `batch_invoke` → "call multiple tools in parallel (Claude handles this automatically)"
- Update MCP log format examples

### 1.2 Update Root Documentation

**Files to update:**
- `README.md` - Remove `batch_invoke` mention
- `EXPERIMENTS.md` - Add note that batch_invoke is deprecated, or move to archive

### 1.3 Update UI

**Files to update:**
- `public/index.html` - Update batch_invoke references in the tool display logic

### 1.4 Update Analysis Scripts

**Files to update:**
- `plugins/session-analytics/skills/session-analysis/scripts/analyze-sessions.ts`
- `scripts/analyze-sessions.ts`

**Changes:**
- Update regex patterns to match new tool naming
- Handle both old and new patterns for backward compatibility with old logs

---

## Phase 2: Simplify Naming (Medium Effort)

### Problem Statement

Current tool names are verbose:
```
mcp__bird-mcp__bird_datahub_explorer_run_query
```

This creates confusion because:
1. `mcp__bird-mcp__` is MCP namespace prefix (automatic)
2. `bird_` is added by our code (redundant with server name)
3. Agents see `bird_` and think it should be `bird.` in operation names

### Option A: Remove `bird_` Prefix (Recommended)

Change tool naming from:
```
bird_datahub_explorer_run_query
```
to:
```
datahub_explorer_run_query
```

**Pros:**
- Cleaner names
- Less confusion with operation names
- Tool names directly map to operation names (just replace `_` with `.` and `:`)

**Cons:**
- Breaking change for existing prompts/docs
- Need to update all references

**Implementation:**
```typescript
// In packages/bird-mcp/src/index.ts
function operationToToolName(xOperationName: string): string {
  return xOperationName
    .replace(/\./g, '_')
    .replace(/:/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
}
```

### Option B: Add Reverse Lookup Helper

Keep names as-is but add a helper that converts tool names back to operation names:

```typescript
function toolNameToOperation(toolName: string): string {
  // bird_datahub_explorer_run_query → datahub.explorer:runQuery
  // This is complex due to snake_case → camelCase ambiguity
}
```

**Cons:** Ambiguous (can't reliably reverse snake_case)

### Option C: Include Operation Name in Tool Description

Add the operation name to each tool's description:

```typescript
{
  name: 'bird_datahub_explorer_run_query',
  description: `Run a malloy query

[POST /workspaces/{workspaceId}/datahub/explorer/run-query]

Operation: datahub.explorer:runQuery  // <-- ADD THIS
`
}
```

**Pros:** No breaking changes, agents can see the operation name
**Cons:** Still verbose tool names

### Recommendation: Option A + Option C

1. Remove `bird_` prefix (cleaner names)
2. Include operation name in description (explicit mapping)
3. Update all documentation at once

---

## Phase 3: Consolidate Documentation (Bigger Effort)

### Current Structure (Messy)

```
plugins/bird-platform/
├── operations/           # How to call operations
│   ├── README.md
│   ├── audience-operations.md
│   ├── contact-operations.md
│   ├── content-operations.md
│   ├── datahub-operations.md
│   ├── entity-operations.md
│   └── segment-builder.md
├── reference/            # Duplicate info
│   ├── api-schemas.md
│   ├── malloy-patterns.md
│   ├── predicate-spec.md
│   └── segment-builder.md  # DUPLICATE!
├── task-guides/          # When to use what
│   ├── README.md
│   ├── analyzing-metrics.md
│   ├── building-predicates.md
│   ├── counting-contacts.md
│   ├── creating-audiences.md
│   ├── discovering-schema.md
│   ├── querying-data.md
│   └── searching-contacts.md
└── concepts/             # Background knowledge
    ├── README.md
    ├── channel-benchmarks.md
    ├── channel-economics.md
    ├── event-mrns.md
    ├── malloy-syntax.md
    ├── predicate-schema.md
    └── regional-preferences.md
```

### Problems

1. **Duplication**: `segment-builder.md` exists in both `operations/` and `reference/`
2. **Scattered**: Information about the same topic in multiple places
3. **Too many files**: 20+ files in bird-platform alone
4. **Naming overlap**: `predicate-schema.md` vs `predicate-spec.md`

### Proposed Structure (Simplified)

```
plugins/bird-platform/
├── README.md             # Overview + tool naming rules
├── operations.md         # ALL operations in ONE file (with sections)
├── patterns/             # How to do common tasks
│   ├── data-discovery.md
│   ├── audience-building.md
│   ├── analytics.md
│   └── campaigns.md
└── reference/            # Deep-dive specs (rarely needed)
    ├── predicate-schema.md
    ├── malloy-syntax.md
    └── channel-economics.md
```

**Key changes:**
1. Merge all `operations/*.md` into single `operations.md`
2. Merge `task-guides/` into `patterns/` (fewer, more focused)
3. Remove duplicates
4. Move rarely-used specs to `reference/`

---

## Phase 4: Improve Agent Instructions

### 4.1 Update CLAUDE.md Template

In `src/services/session.ts`, improve the MCP tools section:

```markdown
## MCP Tools

### Calling Bird API Operations

Operations are exposed as native tools. Tool names follow this pattern:
- Operation: `datahub.explorer:runQuery` 
- Tool: `mcp__bird-mcp__bird_datahub_explorer_run_query`

**All tools require:**
- `_agent`: Your agent name (e.g., "research-analyst")
- `_intent`: What you're trying to achieve

**Example:**
```typescript
mcp__bird-mcp__bird_datahub_catalogs_list_catalogs({
  _agent: "research-analyst",
  _intent: "Discover available data catalogs"
})
```

### Meta Tools

- `mcp__bird-mcp__list_operations` - List ALL available operations
- `mcp__bird-mcp__show_schema` - Get schema for an operation
  - **Use the x-operationName format**: `aitools.workflows:segmentBuilder`
  - **NOT the tool name format**

### Finding Operations

1. Call `list_operations` to see all available operations
2. Each operation shows its `xOperationName` and corresponding `tool` name
3. Use `show_schema` with the `xOperationName` (e.g., `datahub.explorer:runQuery`)
```

---

## Implementation Order

| Phase | Task | Effort | Impact |
|-------|------|--------|--------|
| 1.1 | Update session-analytics skills | 1h | Medium |
| 1.2 | Update README.md, EXPERIMENTS.md | 30m | Low |
| 1.3 | Update public/index.html | 30m | Low |
| 1.4 | Update analysis scripts | 1h | Low |
| 2 | Simplify tool naming | 2-3h | High |
| 3 | Consolidate documentation | 4-6h | High |
| 4 | Improve agent instructions | 1h | High |

**Recommended order:** 1 → 4 → 2 → 3

Phase 1 is quick cleanup. Phase 4 helps agents immediately. Phase 2 is the biggest simplification. Phase 3 is polish.

---

## Success Metrics

1. **No more `invoke_operation` in codebase** (except historical logs)
2. **Agent can correctly call `show_schema`** without errors
3. **Single source of truth** for operation documentation
4. **< 10 documentation files** in bird-platform
