---
artifact_type: resource_index
date: 2025-12-06
tags:
  - space/kinen
  - type/index
summary: "Index of reference materials for kinen development"
---

# Resources Index

Reference materials, papers, and documentation for kinen development.

## Papers

| Paper | Topic | Status | Source |
|-------|-------|--------|--------|
| [[papers/friston-fep-2010\|Free Energy Principle]] | Biomimetic memory, active inference | 📥 To add | [Nature](https://www.nature.com/articles/nrn2787) |
| [[papers/memory-consolidation\|Memory Consolidation]] | Sleep-based consolidation research | 📥 To add | Various |
| [[papers/zettelkasten-luhmann\|Zettelkasten Method]] | Note-taking methodology | 📥 To add | [zettelkasten.de](https://zettelkasten.de) |
| [[papers/walker-sleep-2017\|Why We Sleep]] | Sleep & memory science | 📥 To add | Book excerpts |
| [[papers/active-inference\|Active Inference]] | Decision-making framework | 📥 To add | [Wikipedia](https://en.wikipedia.org/wiki/Free_energy_principle#Active_inference) |

### Priority Papers to Find

1. **Friston, K. (2010)**. "The free-energy principle: a unified brain theory?" *Nature Reviews Neuroscience* — Core FEP paper, foundational for kinen-memory design
2. **Walker, M. (2017)**. "Why We Sleep" — Memory consolidation during NREM/REM stages
3. **Luhmann, N.** — Original Zettelkasten papers (if available in English)
4. **Diekelmann & Born (2010)**. "The memory function of sleep" — Consolidation mechanisms

## Documentation

| Resource | Description | Type |
|----------|-------------|------|
| [[notes/lancedb-docs\|LanceDB Documentation]] | Vector database, hybrid search | Web clip |
| [[notes/obsidian-plugin-api\|Obsidian Plugin API]] | Plugin development reference | Web clip |
| [[notes/dataview-docs\|Dataview Documentation]] | Query language for Obsidian | Web clip |

## Key Concepts

- **Free Energy Principle (FEP)**: Framework from neuroscience for understanding how systems minimize "surprise" — relevant to memory consolidation
- **Zettelkasten**: Atomic note-taking method with heavy linking — inspiration for kinen's wiki-link approach
- **Hybrid Search**: Combining FTS and vector search for comprehensive retrieval

## Adding Resources

### PDFs
1. Add PDF to `papers/` folder
2. Run `kinen index build` to index content
3. Optionally add notes in `notes/` folder

### Web Clips
1. Create markdown file in `notes/` with frontmatter:
   ```yaml
   ---
   artifact_type: web_clip
   source_url: https://example.com
   clipped_at: 2025-12-06
   tags: [tech/example]
   ---
   ```
2. Paste clipped content
3. Run `kinen index build`

## See Also

- [[20251203-01-kinen-resources-and-indexing]] — Session on resource indexing design
- [[20251206-01-kinen-beads-devx/artifacts/research-synthesis]] — Synthesis of prior research

