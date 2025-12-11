# Implementation

Step-by-step implementation guides.

## Documents

### [`backend-foundation.md`](./backend-foundation.md)
**Backend implementation steps**

- Whitelist Bird operations
- Update session API for projectId
- Context injection in prompt
- Agent prompt updates
- Living document hydration service

**Read this if**: You're implementing the backend

---

### [`s3-storage.md`](./s3-storage.md)
**Artifact and checkpoint storage**

- S3 bucket structure
- ArtifactStorageService implementation
- Upload/download/list operations
- Cost estimation (~$0.05/month)
- Security considerations

**Read this if**: You're setting up storage

---

### [`component-reuse.md`](./component-reuse.md)
**Reusing existing UI components**

- Complete inventory of existing components
- Campaign builder, email editor, journey editor
- Dashboard (notebook renderer)
- UI library (boxkit)
- Integration strategy
- 83% time savings

**Read this if**: You're building the frontend

---

## Implementation Order

### Week 1: Backend + Core Integration (16 hours)

**Backend (8 hours)**:
1. Install `@zed-industries/claude-code-acp`
2. Implement `ACPClient` (see `../02-architecture/acp-integration.md`)
3. Implement `ACPSessionService`
4. Implement `CheckpointService` (see `s3-storage.md`)
5. Implement `ArtifactStorageService` (see `s3-storage.md`)
6. Update agent prompt (see `backend-foundation.md`)

**Frontend (8 hours)**:
1. Create new app in monorepo
2. Build agent chat interface (custom)
3. Build project selector (custom)
4. Import campaign components (see `component-reuse.md`)
5. Import dashboard components (see `component-reuse.md`)
6. Wire to backend

---

## Quick Links

- **Backend**: Start with `backend-foundation.md` + `../02-architecture/acp-integration.md`
- **Storage**: Focus on `s3-storage.md`
- **Frontend**: Focus on `component-reuse.md`
