# Kinen Mobile — Technical Specification

**Status**: Draft
**Last Updated**: 2025-12-15

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐
│  Telegram Bot   │     │ Obsidian Plugin │
│  (Capture Mode) │     │  (Session Mode) │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │   ┌───────────────┐   │
         └──►│   kinen-go    │◄──┘
             │   (Backend)   │
             └───────┬───────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐           ┌─────▼─────┐
    │ Sessions │           │  LLM API  │
    │(Markdown)│           │ (Claude)  │
    └──────────┘           └───────────┘
```

---

## Component 1: Telegram Bot

### Purpose
- Voice capture on-the-go
- Quick text input
- Push notifications for session updates
- Lightweight Q&A interaction

### Tech Stack
- **Language**: Go
- **Framework**: `go-telegram-bot-api/v5`
- **Transcription**: Whisper API (OpenAI)
- **LLM**: Claude API
- **Hosting**: Fly.io / Railway

### Key Features
1. `/start [topic]` — Begin new session
2. `/continue` — Resume active session
3. `/search [query]` — Search memory
4. Voice → Transcribe → Process
5. Option buttons for quick selection

### Data Flow
```
Voice message
     ↓
Whisper API (transcription)
     ↓
kinen-go (fetch context)
     ↓
Claude API (with methodology prompt)
     ↓
Response to user
     ↓
Save to session (if structured)
```

---

## Component 2: Obsidian Plugin

### Purpose
- Full session experience on mobile
- Artifact reading and editing
- Structured round interaction
- Seamless desktop/mobile parity

### Tech Stack
- **Language**: TypeScript
- **Framework**: Obsidian Plugin API
- **Backend**: kinen-go (HTTP/gRPC)

### Key Features
1. Sidebar chat panel
2. Round creation wizard
3. Voice input (if possible)
4. Session browser
5. Living document auto-update

### UI Concept
```
┌──────────────────────────────────┐
│ Session: mobile-exploration      │
├──────────────────────────────────┤
│ 📄 Round 01 ✅                   │
│ 📄 Round 02 (in progress)        │
├──────────────────────────────────┤
│ 🤖 Assistant                     │
│ ─────────────────────────────────│
│ Q2: Primary mobile use case?     │
│                                  │
│ [A] Voice capture                │
│ [B] Full sessions                │
│ [C] Review only                  │
├──────────────────────────────────┤
│ 💬 Type or speak...        [🎤]  │
└──────────────────────────────────┘
```

---

## Component 3: kinen-go Extensions

### Required Endpoints

```protobuf
// New RPCs needed
rpc StartMobileSession(StartMobileSessionRequest) returns (Session);
rpc ProcessVoiceInput(VoiceInputRequest) returns (AssistantResponse);
rpc QuickCapture(CaptureRequest) returns (CaptureResponse);
rpc GetActiveSession(GetActiveSessionRequest) returns (Session);
rpc SendNotification(NotificationRequest) returns (Empty);
```

### LLM Integration
- Add Claude API client to kinen-go
- Methodology prompt management
- Context assembly (recent sessions, memory search)

---

## MVP Roadmap

### Phase 1: Telegram Bot (Week 1)
- [ ] Bot scaffold with voice support
- [ ] Whisper integration
- [ ] Basic Claude conversation
- [ ] Session context fetching

### Phase 2: kinen-go Extensions (Week 1-2)
- [ ] HTTP endpoints for mobile
- [ ] Claude API integration
- [ ] Quick capture storage

### Phase 3: Obsidian Plugin (Week 2-3)
- [ ] Plugin scaffold
- [ ] Chat panel UI
- [ ] kinen-go integration
- [ ] Mobile testing

---

## Open Questions

1. **Voice in Obsidian**: Does Obsidian API support audio recording?
2. **Notification strategy**: How to notify when session needs attention?
3. **Sync conflicts**: How to handle simultaneous mobile/desktop edits?
4. **Auth for hosted kinen-go**: API keys? OAuth?

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-15 | Hybrid approach (Telegram + Obsidian) | Different use cases need different UX |
| 2025-12-15 | Build Telegram first | Lower effort, validates mobile value |
