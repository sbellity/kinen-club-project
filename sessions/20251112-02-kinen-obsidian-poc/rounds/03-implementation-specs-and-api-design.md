---
date: 2025-11-12
artifact_type: round_exploration
aliases:
  - "kinen-obsidian-poc - Implementation Specs and API Design"
  - "kinen-obsidian-poc - Round 3"
tags:
  - space/p
  - domain/code-implementation
  - type/iterative-design
  - tech/obsidian
  - tech/kinen
  - tech/fam
summary: "Concrete implementation specifications, ConnectRPC exploration, and parallel work organization"
---

# Round 3: Implementation Specs & API Design

> [!info] Building on Round 2
> Round 2 established our architecture: HybridRepository, ConnectRPC for API, remote FAM support, and parallel work streams. This round creates concrete implementation specs and gets us started.

---

## Overview

Based on Round 2 responses, this round:
1. Creates Track 14 implementation spec for FAM backend team
2. Explores ConnectRPC and designs API contract
3. Defines plugin development environment setup
4. Establishes clear handoff points for parallel work

---

## Part A: Track 16 Implementation Specification

I'll create a comprehensive implementation spec in `famkinen/docs/implementation/track-16-obsidian/` that another agent can use to implement the FAM backend side.

**Q3.1: Track 16 Spec Scope**

The spec should cover:

1. **HybridRepository Implementation**
   - `internal/repository/hybrid.go` - Combines filesystem + in-memory SQLite
   - Markdown file reading/writing
   - Frontmatter parsing (YAML)
   - Callout extraction
   - Conflict resolution strategies

2. **Vault Backend**
   - `internal/repository/vault/` package
   - File operations (create, read, update)
   - Session folder structure management
   - Round file generation
   - Template rendering

3. **Kinen Methodology**
   - `templates/methodologies/kinen-iterative-design.md`
   - Prompt engineering for round generation
   - Context building from previous rounds
   - Callout pre-population

4. **Testing Strategy**
   - Unit tests for HybridRepository
   - Integration tests with actual vault
   - Test fixtures (sample sessions)
   - Validation criteria

Should I create this as:
- **Option A**: Single comprehensive spec file (`track-16-obsidian/SPEC.md`)
- **Option B**: Multiple files (SPEC.md, IMPLEMENTATION.md, TESTING.md)
- **Option C**: Phase-based files (phase-1.md, phase-2.md, phase-3.md)

Recommendation: **Option C** - Matches famkinen's existing track pattern and breaks work into digestible phases.

> [!note] Answer
> Option C please, guide as much as possible and ask implementer to keep track of progress
>

---

## Part B: ConnectRPC Exploration

**Q3.2: ConnectRPC vs REST**

You mentioned exploring ConnectRPC. Let me analyze:

**ConnectRPC Benefits**:
- ✅ Protocol Buffers for type safety
- ✅ Auto-generated TypeScript client
- ✅ Streaming support (for progress updates)
- ✅ Works over HTTP/1.1 and HTTP/2
- ✅ Compatible with gRPC and standard HTTP
- ✅ Simple to use, good for TypeScript/Go

**For our use case**:
- Plugin → FAM: Structured requests (CreateSession, GenerateRound)
- FAM → Plugin: Streaming progress updates (round generation status)
- Type safety: TypeScript plugin gets generated types from proto definitions

**Trade-offs**:
- **Pro**: Better DX, type safety, streaming
- **Con**: Adds dependency, more complexity than simple REST
- **Pro**: But famkinen can expose both (ConnectRPC + REST HTTP API via same server)

**Recommendation**: 
- Use ConnectRPC for kinen-specific endpoints
- Keep existing REST endpoints for general FAM API
- Generate TypeScript client for plugin

**Implementation Path**:
```
1. Define .proto files for kinen API
2. Generate Go server stubs
3. Generate TypeScript client
4. Implement handlers in famkinen
5. Use generated client in plugin
```

Should we proceed with ConnectRPC? Or stick with REST + manual TypeScript client?

> [!note] Answer
> Let's keep rest for now (POC). We will probably move to ConnectRPC as an alternative later

---

### B2. API Contract Definition

**Q3.3: Kinen API Design**

Regardless of REST vs ConnectRPC, we need to define the API contract.

**Core Operations**:

```protobuf
// kinen.proto (if using ConnectRPC)

service KinenService {
  // Session Management
  rpc CreateSession(CreateSessionRequest) returns (CreateSessionResponse);
  rpc GetSession(GetSessionRequest) returns (GetSessionResponse);
  rpc ListSessions(ListSessionsRequest) returns (ListSessionsResponse);
  
  // Round Generation
  rpc GenerateRound(GenerateRoundRequest) returns (stream GenerateRoundProgress);
  rpc GetRound(GetRoundRequest) returns (GetRoundResponse);
  
  // Feedback & Status
  rpc SubmitFeedback(SubmitFeedbackRequest) returns (SubmitFeedbackResponse);
  rpc GetSessionStatus(GetSessionStatusRequest) returns (GetSessionStatusResponse);
  
  // Health
  rpc Health(HealthRequest) returns (HealthResponse);
}

message CreateSessionRequest {
  string name = 1;
  string type = 2;  // iterative-design, technical-spec, etc.
  string vault_path = 3;
  repeated string goals = 4;
  repeated string success_criteria = 5;
  map<string, string> metadata = 6;  // domain_tag, space_tag, etc.
}

message CreateSessionResponse {
  string session_id = 1;
  string session_path = 2;  // Relative to vault root
  string init_file_path = 3;
}

message GenerateRoundRequest {
  string session_id = 1;
  string user_prompt = 2;  // Optional: Additional user guidance
  bool include_previous = 3;  // Auto-extract from previous round?
}

message GenerateRoundProgress {
  enum Stage {
    ANALYZING = 0;
    GENERATING = 1;
    WRITING = 2;
    COMPLETE = 3;
    ERROR = 4;
  }
  Stage stage = 1;
  string message = 2;
  int32 round_number = 3;
  string round_file_path = 4;
}
```

**REST Alternative** (if not using ConnectRPC):
```
POST   /api/kinen/sessions
GET    /api/kinen/sessions/:id
GET    /api/kinen/sessions
POST   /api/kinen/sessions/:id/rounds      (returns SSE stream for progress)
GET    /api/kinen/sessions/:id/rounds/:num
POST   /api/kinen/sessions/:id/feedback
GET    /api/kinen/sessions/:id/status
GET    /api/health
```

Should I proceed to define the complete API spec (all messages/endpoints)?

> [!note] Answer
> API should already exist in Kinen and is specified. Please see if we have gaps, no need to reinvent it

---

## Part C: Remote FAM Support

**Q3.4: Remote FAM Architecture**

You emphasized remote FAM support. Let's design this properly:

**Use Cases**:
1. **Local Development**: FAM on localhost, Obsidian on same machine
2. **Remote Server**: FAM on powerful server, Obsidian on laptop
3. **Shared FAM**: Multiple users connecting to same FAM instance
4. **Docker/Cloud**: FAM running in container/cloud

**Plugin Configuration**:
```typescript
interface KinenSettings {
  famApiUrl: string;         // http://localhost:8080 or https://fam.example.com
  famApiToken?: string;      // Optional: Auth token for remote FAM
  vaultPath: string;         // Absolute path to vault
  syncEnabled: boolean;      // Should vault sync with FAM?
}
```

**Challenges with Remote FAM**:
1. **Vault Access**: How does remote FAM write to local vault?
   - **Option A**: Plugin uploads vault changes via API (bidirectional sync)
   - **Option B**: Vault is on shared filesystem (NFS, SMB)
   - **Option C**: FAM returns file content, plugin writes locally

2. **Authentication**: How to secure remote FAM?
   - API tokens
   - OAuth
   - SSH tunneling

3. **Sync Strategy**: How to handle concurrent edits?
   - Optimistic locking
   - Conflict detection
   - Last-write-wins with timestamps

**Recommendation for POC**:
- Support both local and remote FAM
- For remote: **Option C** - FAM returns content, plugin writes
- For local: **Option A** (Round 2 decision) - FAM writes directly
- Detect mode based on `vault_path` in config (if remote FAM, vault path is local to plugin)

**Architecture**:
```
Local Mode:
  Plugin → FAM (localhost:8080) → Vault (direct write)

Remote Mode:
  Plugin → FAM (remote:8080) → Returns content
  Plugin → Vault (local write)
```

How should we handle this? Start with local-only and add remote later? Or design for both now?

> [!note] Answer
> Let's revisit this later, not needed for POC
---

## Part D: Plugin Development Environment

**Q3.5: Plugin Setup**

Now let's get concrete on the Obsidian plugin setup.

**Directory Structure**:
```
famkinen/
├── plugins/
│   └── obsidian/
│       ├── manifest.json
│       ├── package.json
│       ├── tsconfig.json
│       ├── esbuild.config.mjs
│       ├── .gitignore
│       ├── README.md
│       ├── src/
│       │   ├── main.ts
│       │   ├── settings.ts
│       │   ├── commands.ts
│       │   ├── api/
│       │   │   ├── client.ts
│       │   │   ├── types.ts          # Generated from proto?
│       │   │   └── errors.ts
│       │   ├── ui/
│       │   │   ├── SessionModal.ts
│       │   │   ├── StatusBar.ts
│       │   │   └── Notifications.ts
│       │   └── utils/
│       │       ├── vault.ts
│       │       └── markdown.ts
│       └── test/
│           └── ...
```

**Development Workflow**:
```bash
# In plugins/obsidian/
npm install
npm run dev        # Watch mode, auto-rebuild

# Symlink to test vault
ln -s $(pwd) ~/Documents/TestVault/.obsidian/plugins/kinen

# In Obsidian: Reload plugin after changes
```

**package.json** essentials:
```json
{
  "name": "obsidian-kinen",
  "version": "0.1.0",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc -noEmit && node esbuild.config.mjs production",
    "proto": "buf generate"  // If using ConnectRPC
  },
  "dependencies": {
    "@connectrpc/connect": "^1.0.0",       // If using ConnectRPC
    "@connectrpc/connect-web": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "obsidian": "latest",
    "typescript": "^5.0.0",
    "esbuild": "^0.19.0",
    "@bufbuild/buf": "^1.0.0"              // If using ConnectRPC
  }
}
```

Should I create this scaffolding now? Or wait for API design to finalize?

> [!note] Answer
> yes, no connect-rpc and no api redesign needed normally

---

## Part E: Track 16 Detailed Specification

**Q3.6: Writing the Track 16 Spec**

I'll now create the Track 16 specification for the FAM backend team. Here's the outline:

**`famkinen/docs/implementation/track-16-obsidian/README.md`**:
- Overview
- Goals
- Architecture
- Dependencies
- Phase breakdown

**Phase 1: HybridRepository Foundation**
- `phase-1-hybrid-repository.md`
  - Implement HybridRepository interface
  - Vault file operations
  - Frontmatter parsing
  - Basic session CRUD
  - Testing approach

**Phase 2: Round Generation**
- `phase-2-round-generation.md`
  - Kinen methodology template
  - Callout generation
  - Context building
  - LLM integration
  - Testing with real scenarios

**Phase 3: API Integration**
- `phase-3-api-integration.md`
  - ConnectRPC setup (or REST)
  - Kinen service implementation
  - Streaming support
  - Error handling
  - E2E tests

**Phase 4: Conflict Resolution & Polish**
- `phase-4-polish.md`
  - Frontmatter conflict resolution
  - Concurrent edit handling
  - Remote FAM support
  - Performance optimization
  - Documentation

**Testing Criteria**:
```
For each phase, implementer must:
1. Write unit tests (>80% coverage)
2. Write integration tests
3. Test with sample vault
4. Document validation steps
5. Create demo scenario
```

Should I proceed to write these spec files now?

> [!note] Answer
> 

---

## Part F: Parallel Work Organization

**Q3.7: Work Stream Coordination**

Based on your response about working in parallel:

**Stream A: FAM Backend** (Another Agent)
- Takes Track 16 spec
- Implements HybridRepository
- Implements API endpoints
- Works in `famkinen/` repo
- Reports progress via Track 16 docs

**Stream B: Obsidian Plugin** (Us, this session)
- Implements plugin UI
- Implements API client
- Works in `famkinen/plugins/obsidian/`
- Tests against FAM backend

**Synchronization Points**:
1. **API Contract** (This round) - Must agree before parallel work
2. **Phase 1 Complete** (Backend) - Plugin can start integration
3. **Phase 2 Complete** (Backend) - Full workflow testable
4. **Phase 4 Complete** (Both) - Ready for POC demo

**Communication**:
- API changes documented in Track 16
- Plugin progress tracked here in this kinen session
- Integration tests verify compatibility

**Proposed Timeline**:
```
Days 1-2:  Define API contract, write Track 16 spec
Days 3-5:  Backend: Phase 1 | Plugin: Setup & scaffolding
Days 6-8:  Backend: Phase 2 | Plugin: UI components & API client
Days 9-11: Backend: Phase 3 | Plugin: Integration & testing
Days 12-15: Backend: Phase 4 | Plugin: Polish & documentation
Day 15:    Integration testing & POC demo
```

Does this timeline and organization work?

> [!note] Answer
> 

---

## Part G: Concrete Next Actions

**Q3.8: What to Do Now**

Based on your responses in this round, here's what I'll do:

**Immediate (End of Round 3)**:
1. Create Track 16 specification files in `famkinen/docs/implementation/track-16-obsidian/`
2. Define complete API contract (proto or REST spec)
3. Create plugin scaffolding in `famkinen/plugins/obsidian/`
4. Write integration test plan

**Round 4 (After your review)**:
1. Start implementing plugin UI components
2. Implement API client (with mocks for testing before backend ready)
3. Create dev environment setup guide
4. Test first complete flow (with mocked FAM responses)

**Questions for Final Decisions**:

1. **ConnectRPC**: Yes or No? (If yes, I'll define .proto files; if no, REST spec)
2. **Remote FAM**: Design for both now, or local-only first?
3. **Track 16 Spec**: Should I write all 4 phase files now, or just overview + Phase 1?
4. **Plugin Scaffolding**: Create now, or wait for API finalization?

What should I prioritize first?

> [!note] Answer
> 

---

## Summary

This round focused on concrete deliverables:

1. ✅ Track 16 spec structure defined
2. ✅ ConnectRPC vs REST explored
3. ✅ API contract outlined
4. ✅ Remote FAM architecture designed
5. ✅ Plugin structure defined
6. ✅ Parallel work organization planned

**Decisions Needed**:
- ConnectRPC yes/no
- Remote FAM: now or later
- Track 16 spec: how much detail now
- Plugin: when to start coding

**Next Round**: Implementation begins! We'll have:
- Track 16 specs written
- API contract finalized
- Plugin scaffolding created
- Clear handoff to backend team

---

**Ready for your responses!** 🚀

