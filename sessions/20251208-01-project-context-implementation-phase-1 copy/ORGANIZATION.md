# Documentation Organization

This document explains how the session artifacts are organized.

## Structure

```
.
├── README.md                          # 👈 START HERE - Main entry point
├── init.md                            # Original session initialization
│
├── 01-overview/                       # High-level architecture
│   ├── README.md                      # Section guide
│   ├── executive-summary.md           # Quick overview (for stakeholders)
│   └── architecture-decision.md       # Complete technical architecture
│
├── 02-architecture/                   # Technical design
│   ├── README.md                      # Section guide
│   ├── acp-integration.md            # ⭐ RECOMMENDED: Agent Client Protocol
│   ├── living-documents.md           # Real-time data hydration
│   ├── dashboard-design.md           # Dashboard as living document
│   ├── terraform-deployment.md       # Campaign deployment strategy
│   └── session-lifecycle.md          # Checkpointing & resumption
│
├── 03-implementation/                 # Implementation guides
│   ├── README.md                      # Section guide
│   ├── backend-foundation.md         # Backend implementation steps
│   ├── s3-storage.md                 # Artifact & checkpoint storage
│   └── component-reuse.md            # Reusing existing UI components
│
├── 04-ui-design/                      # UI/UX design
│   ├── README.md                      # Section guide
│   ├── marketing-focused-ui.md       # Marketing-friendly interface
│   ├── poc-analysis.md               # POC UI comparison
│   └── mvp-roadmap.md                # Phase-by-phase UI plan
│
└── resources/                         # Supporting materials
    ├── README.md                      # Resources guide
    ├── poc-ui/                        # POC UI files
    │   ├── 3.jsx                      # POC React component
    │   ├── run-poc.html              # HTML wrapper
    │   └── README.md                  # How to run POC
    └── reference/                     # Outdated/superseded docs
        ├── MASTER-PLAN.md            # (superseded by architecture-decision.md)
        ├── EXECUTIVE-SUMMARY.md      # (superseded by executive-summary.md)
        └── ... (other reference files)
```

## Quick Navigation

### By Role

**Architects / Tech Leads**
1. [`README.md`](./README.md) - Overview
2. [`01-overview/architecture-decision.md`](./01-overview/architecture-decision.md) - Complete architecture
3. [`02-architecture/acp-integration.md`](./02-architecture/acp-integration.md) - Implementation approach

**Backend Developers**
1. [`02-architecture/acp-integration.md`](./02-architecture/acp-integration.md) - ACP integration
2. [`03-implementation/backend-foundation.md`](./03-implementation/backend-foundation.md) - Implementation steps
3. [`03-implementation/s3-storage.md`](./03-implementation/s3-storage.md) - Storage setup

**Frontend Developers**
1. [`03-implementation/component-reuse.md`](./03-implementation/component-reuse.md) - Existing components
2. [`04-ui-design/marketing-focused-ui.md`](./04-ui-design/marketing-focused-ui.md) - UI design
3. [`04-ui-design/poc-analysis.md`](./04-ui-design/poc-analysis.md) - POC comparison

**Product / UX**
1. [`01-overview/executive-summary.md`](./01-overview/executive-summary.md) - High-level overview
2. [`04-ui-design/marketing-focused-ui.md`](./04-ui-design/marketing-focused-ui.md) - UI design
3. [`04-ui-design/mvp-roadmap.md`](./04-ui-design/mvp-roadmap.md) - Phase planning

**Stakeholders**
1. [`README.md`](./README.md) - Overview
2. [`01-overview/executive-summary.md`](./01-overview/executive-summary.md) - Summary

### By Topic

**Agent Communication**
- [`02-architecture/acp-integration.md`](./02-architecture/acp-integration.md) - ACP protocol (RECOMMENDED)
- [`resources/reference/claude-sdk-lifecycle-hooks.md`](./resources/reference/claude-sdk-lifecycle-hooks.md) - Alternative approach

**Data Freshness**
- [`02-architecture/living-documents.md`](./02-architecture/living-documents.md) - Malloy query hydration
- [`02-architecture/dashboard-design.md`](./02-architecture/dashboard-design.md) - Dashboard implementation

**Deployment**
- [`02-architecture/terraform-deployment.md`](./02-architecture/terraform-deployment.md) - Terraform strategy

**Storage**
- [`03-implementation/s3-storage.md`](./03-implementation/s3-storage.md) - S3 artifacts
- [`02-architecture/session-lifecycle.md`](./02-architecture/session-lifecycle.md) - Checkpointing

**UI**
- [`04-ui-design/marketing-focused-ui.md`](./04-ui-design/marketing-focused-ui.md) - UX design
- [`03-implementation/component-reuse.md`](./03-implementation/component-reuse.md) - Component inventory

## Document Status

### Active (Use These)
All documents in:
- `01-overview/`
- `02-architecture/`
- `03-implementation/`
- `04-ui-design/`

### Reference Only
Documents in:
- `resources/reference/` - Outdated or superseded versions

### POC Materials
- `resources/poc-ui/` - POC UI for reference

## Changes Made

### Consolidation
- **Before**: 19 files in flat `artifacts/` folder
- **After**: 13 active files in organized folders + 8 reference files

### Removed Duplicates
- Removed `artifacts copy/` folder (duplicate)
- Moved outdated files to `resources/reference/`

### Improved Organization
- Created clear folder structure by topic
- Added README.md to each folder
- Created single entry point (main README.md)
- Added navigation guides

### Eliminated Repetition
- Consolidated multiple architecture docs into `architecture-decision.md`
- Consolidated multiple summary docs into `executive-summary.md`
- Kept only one implementation roadmap

## File Count

- **Total markdown files**: 28
- **Active documentation**: 17 (including READMEs)
- **Reference materials**: 8
- **POC resources**: 3

## Maintenance

### Adding New Documents
1. Determine which folder (`01-overview/`, `02-architecture/`, etc.)
2. Add document to appropriate folder
3. Update folder's README.md
4. Update main README.md if major addition

### Updating Documents
1. Update the document
2. Check if other documents reference it
3. Update cross-references if needed

### Deprecating Documents
1. Move to `resources/reference/`
2. Update cross-references
3. Add note in document header: "**Note**: This document has been superseded by [link]"

## Navigation Tips

1. **Always start with main [`README.md`](./README.md)**
2. **Use folder READMEs** for section overviews
3. **Follow cross-references** between documents
4. **Check "Quick Links"** sections in READMEs

## Questions?

If you can't find something:
1. Check main [`README.md`](./README.md)
2. Check folder READMEs
3. Search in `resources/reference/` for older versions
4. Look at this file (ORGANIZATION.md) for structure

---

**Last Updated**: December 8, 2025  
**Session**: 20251208-01-project-context-implementation-phase-1
