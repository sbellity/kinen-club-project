---
artifact_type: agent_handover
track: "4"
track_name: "Obsidian Compatibility"
date: 2025-12-06
---

# Agent Handover: Track 4 - Obsidian Compatibility

## Your Mission

Ensure all kinen-generated files work perfectly in Obsidian with proper wiki-links, frontmatter, and callouts.

## Context

- **Workspace**: `/Users/sbellity/code/kinen/kinen` (TypeScript package)
- **Dependencies**: None - fully independent
- **Scope**: File format changes, templates, migration

## What You'll Do

1. Update all code that generates markdown to use wiki-links
2. Standardize frontmatter schema across all file types
3. Ensure callout format is Obsidian-compatible
4. Add `kinen init --obsidian` for power users
5. Create migration script for legacy files

## Wiki-Link Standards

### Before (current)
```markdown
See the technical spec for details.
Related: 20251203-01-kinen-resources-and-indexing
```

### After (your changes)
```markdown
See [[artifacts/technical-spec]] for details.
Related: [[20251203-01-kinen-resources-and-indexing]]
```

## Files to Update

### Session Init (`src/lib/sessions.ts`)

```typescript
// When creating init.md
const initContent = `---
artifact_type: session_init
date: ${date}
type: ${type}
status: active
tags:
  - session/${type}
  - status/active
aliases:
  - ${slug}
---

# ${name}

## Goals

...

## Related Sessions

${relatedSessions.map(s => `- [[${s}]]`).join('\n')}
`;
```

### Round Template

```markdown
---
artifact_type: round_exploration
date: 2025-12-06
session: "[[20251206-01-session-name]]"
round_number: 1
status: in_progress
tags:
  - round/exploration
  - status/in-progress
---

# Round 1: Foundation

## Previous Decisions

From [[rounds/00-foundation]] we established:
- ...

### Q1.1: First Question

Context text with [[wiki-links]] to relevant content.

**Options:**
- [ ] **Option A** - Description
- [ ] **Option B** - Description

> [!note] Answer
> User's answer here
```

### Artifact Template

```markdown
---
artifact_type: technical_spec
date: 2025-12-06
session: "[[20251206-01-session-name]]"
tags:
  - artifact/spec
  - tech/lancedb
summary: "Technical specification for..."
---

# Technical Specification

## Overview

Content with [[wiki-links]]...

## See Also

- [[rounds/01-foundation]] - Initial decisions
- [[artifacts/implementation-ideas]] - Related ideas
```

## Frontmatter Schema

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `artifact_type` | ✅ | string | session_init, round_exploration, technical_spec, decision, etc. |
| `date` | ✅ | string | ISO 8601 date |
| `session` | ✅* | wiki-link | Parent session (*except for init.md) |
| `tags` | ✅ | array | Prefixed tags |
| `summary` | ✅ | string | One-line description |
| `status` | optional | string | active, complete, archived |
| `aliases` | optional | array | Alternative names |

### Tag Prefixes

- `session/` - Session type (architecture, implementation, etc.)
- `round/` - Round type (foundation, exploration, etc.)
- `artifact/` - Artifact type (spec, plan, etc.)
- `tech/` - Technology (lancedb, obsidian, etc.)
- `domain/` - Domain (storage, search, etc.)
- `status/` - Status (active, complete, etc.)
- `decision/` - Decision category

## Tasks

| Task | Description | Acceptance |
|------|-------------|------------|
| `4.1` | Wiki-links in generated content | All generated files use `[[links]]` |
| `4.2` | Frontmatter standardization | All files have required fields |
| `4.3` | Callout format validation | `> [!note]` renders correctly |
| `4.4` | `kinen init --obsidian` | Creates .obsidian/ with config |
| `4.5` | Legacy migration script | Updates old files to new format |

## `kinen init --obsidian`

Creates Obsidian-specific config:

```
.obsidian/
├── app.json              # Core settings
├── appearance.json       # Theme settings
└── snippets/
    └── kinen.css         # Custom styles for callouts
```

### app.json

```json
{
  "useMarkdownLinks": false,
  "newLinkFormat": "relative",
  "showFrontmatter": true
}
```

### kinen.css

```css
/* Custom callout for decisions */
.callout[data-callout="decision"] {
  --callout-color: 139, 92, 246;
  --callout-icon: lucide-check-circle;
}

/* Kinen question styling */
.markdown-preview-view h3:has(+ .callout) {
  border-left: 3px solid var(--interactive-accent);
  padding-left: 1em;
}
```

## Migration Script

```typescript
// src/commands/migrate.ts
export async function migrate(spacePath: string, dryRun = true): Promise<void> {
  const files = glob.sync('**/*.md', { cwd: spacePath });
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(spacePath, file), 'utf8');
    const updated = migrateContent(content, file);
    
    if (content !== updated) {
      if (dryRun) {
        console.log(`Would update: ${file}`);
      } else {
        fs.writeFileSync(path.join(spacePath, file), updated);
        console.log(`Updated: ${file}`);
      }
    }
  }
}

function migrateContent(content: string, filePath: string): string {
  // 1. Add missing frontmatter fields
  // 2. Convert plain text references to wiki-links
  // 3. Fix callout format if needed
  return content;
}
```

## Success Criteria

```bash
# Open space in Obsidian
# 1. Graph view shows connections
# 2. Backlinks panel works
# 3. Callouts render correctly
# 4. No "unresolved link" warnings

# Validation script
cd /Users/sbellity/code/kinen
for f in sessions/**/*.md; do
  # Check frontmatter
  head -20 "$f" | grep -q "artifact_type:" || echo "Missing artifact_type: $f"
  # Check for wiki-links in non-init files
  if [[ "$f" != *"init.md" ]]; then
    grep -q "\[\[" "$f" || echo "No wiki-links: $f"
  fi
done
```

## Notes

- Wiki-links use relative paths from space root
- `[[session-name]]` resolves to `sessions/session-name/init.md`
- `[[rounds/01-foundation]]` resolves to current session
- Callouts: `> [!note]`, `> [!warning]`, `> [!decision]`
- Test in Obsidian after changes!

Good luck! 🚀

