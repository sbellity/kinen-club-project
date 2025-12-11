# Claude Code Session State Checkpointing

## Problem Statement

**Current**: Claude Code sessions are ephemeral
- ❌ Session lost on container restart
- ❌ Can't resume interrupted conversations
- ❌ No conversation history across sessions
- ❌ Agent loses context between sessions

**Goal**: Checkpoint session state to resume conversations seamlessly

---

## What Needs to be Checkpointed?

### 1. **Conversation History**
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

interface ConversationHistory {
  messages: Message[];
  totalTokens: number;
  lastMessageAt: string;
}
```

### 2. **Session Context**
```typescript
interface SessionContext {
  sessionId: string;
  workspaceId: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  
  // Agent state
  agentType: 'marketing-advisor' | 'general';
  systemPrompt: string;
  
  // Working directory
  workingDirectory: string;
  
  // Session metadata
  createdAt: string;
  lastActiveAt: string;
  status: 'active' | 'paused' | 'completed';
}
```

### 3. **Agent Memory** (Short-term)
```typescript
interface AgentMemory {
  // Current focus
  currentTask?: string;
  currentArtifacts?: string[];
  
  // Recent context
  recentFiles: string[];
  recentCommands: string[];
  
  // Intermediate state
  draftArtifacts?: Record<string, string>;
  pendingActions?: string[];
}
```

### 4. **Tool State**
```typescript
interface ToolState {
  // MCP tool cache
  mcpCache?: Record<string, any>;
  
  // Living document cache
  hydratedDocuments?: Record<string, {
    content: string;
    hydratedAt: string;
    ttl: number;
  }>;
  
  // API call history (for rate limiting)
  apiCallHistory?: {
    operation: string;
    timestamp: string;
  }[];
}
```

---

## Architecture

### Option 1: Checkpoint to S3 (Recommended)

```
Every N messages or M minutes:
    ↓
Serialize session state
    ↓
Upload to S3: s3://bird-agent-artifacts/checkpoints/{sessionId}/
    ├── latest.json              # Latest checkpoint
    ├── checkpoint-{timestamp}.json  # Historical checkpoints
    └── conversation.jsonl       # Streaming conversation log
```

**Pros**:
- Durable (survives container restarts)
- Accessible from any instance
- Version history
- Can resume from any checkpoint

**Cons**:
- Network latency
- S3 costs (minimal)

---

### Option 2: Checkpoint to Database

```
PostgreSQL/SQLite:
    sessions
        ├── id
        ├── workspace_id
        ├── project_id
        ├── status
        └── last_checkpoint_at
    
    checkpoints
        ├── id
        ├── session_id
        ├── checkpoint_data (JSONB)
        ├── created_at
        └── is_latest
    
    messages
        ├── id
        ├── session_id
        ├── role
        ├── content
        ├── tool_calls (JSONB)
        └── created_at
```

**Pros**:
- Fast queries
- Structured data
- Easy to search/filter
- Relational integrity

**Cons**:
- Database dependency
- Large JSONB fields
- Harder to version

---

### Option 3: Hybrid (S3 + Database)

```
Database: Metadata + recent messages
S3: Full checkpoints + conversation history
```

**Pros**:
- Fast queries for metadata
- Durable storage for full state
- Best of both worlds

**Cons**:
- Most complex
- Sync overhead

---

## Recommended: Option 1 (S3 Checkpoints)

**Why**: Simple, durable, stateless backend

---

## Implementation Design

### 1. Checkpoint Service

```typescript
// src/services/checkpoint.ts

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

interface Checkpoint {
  version: '1.0';
  sessionId: string;
  timestamp: string;
  
  // Core state
  context: SessionContext;
  conversation: ConversationHistory;
  memory: AgentMemory;
  toolState: ToolState;
  
  // Metadata
  checkpointNumber: number;
  reason: 'periodic' | 'manual' | 'pause' | 'error';
}

export class CheckpointService {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.bucket = process.env.ARTIFACT_BUCKET || 'bird-agent-artifacts';
  }

  /**
   * Save checkpoint to S3
   */
  async saveCheckpoint(
    sessionId: string,
    checkpoint: Checkpoint
  ): Promise<string> {
    const timestamp = new Date().toISOString();
    
    // Save versioned checkpoint
    const versionedKey = `checkpoints/${sessionId}/checkpoint-${timestamp}.json`;
    await this.uploadCheckpoint(versionedKey, checkpoint);
    
    // Update latest checkpoint
    const latestKey = `checkpoints/${sessionId}/latest.json`;
    await this.uploadCheckpoint(latestKey, checkpoint);
    
    return versionedKey;
  }

  /**
   * Load latest checkpoint
   */
  async loadCheckpoint(sessionId: string): Promise<Checkpoint | null> {
    const key = `checkpoints/${sessionId}/latest.json`;
    
    try {
      const response = await this.s3.send(new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }));
      
      const data = await this.streamToString(response.Body as Readable);
      return JSON.parse(data);
    } catch (err) {
      if (err.name === 'NoSuchKey') {
        return null;
      }
      throw err;
    }
  }

  /**
   * List all checkpoints for session
   */
  async listCheckpoints(sessionId: string): Promise<string[]> {
    const response = await this.s3.send(new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: `checkpoints/${sessionId}/checkpoint-`,
    }));
    
    return response.Contents?.map(obj => obj.Key!) || [];
  }

  /**
   * Load specific checkpoint by timestamp
   */
  async loadCheckpointByTimestamp(
    sessionId: string,
    timestamp: string
  ): Promise<Checkpoint> {
    const key = `checkpoints/${sessionId}/checkpoint-${timestamp}.json`;
    
    const response = await this.s3.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
    
    const data = await this.streamToString(response.Body as Readable);
    return JSON.parse(data);
  }

  /**
   * Append message to conversation log (streaming)
   */
  async appendMessage(
    sessionId: string,
    message: Message
  ): Promise<void> {
    const key = `checkpoints/${sessionId}/conversation.jsonl`;
    
    // Read existing log
    let existingLog = '';
    try {
      const response = await this.s3.send(new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }));
      existingLog = await this.streamToString(response.Body as Readable);
    } catch (err) {
      // File doesn't exist yet, that's ok
    }
    
    // Append new message
    const newLine = JSON.stringify(message) + '\n';
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: existingLog + newLine,
      ContentType: 'application/x-ndjson',
    }));
  }

  /**
   * Load conversation log
   */
  async loadConversationLog(sessionId: string): Promise<Message[]> {
    const key = `checkpoints/${sessionId}/conversation.jsonl`;
    
    try {
      const response = await this.s3.send(new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }));
      
      const data = await this.streamToString(response.Body as Readable);
      return data
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (err) {
      return [];
    }
  }

  private async uploadCheckpoint(key: string, checkpoint: Checkpoint): Promise<void> {
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: JSON.stringify(checkpoint, null, 2),
      ContentType: 'application/json',
      Metadata: {
        sessionId: checkpoint.sessionId,
        timestamp: checkpoint.timestamp,
        checkpointNumber: String(checkpoint.checkpointNumber),
      },
    }));
  }

  private async streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf-8');
  }
}
```

---

### 2. Session Service Integration

```typescript
// src/services/session.ts (enhanced)

import { CheckpointService } from './checkpoint';

export class SessionService {
  private checkpoint: CheckpointService;
  private sessions: Map<string, SessionState> = new Map();

  constructor() {
    this.checkpoint = new CheckpointService();
  }

  /**
   * Create new session
   */
  async createSession(
    workspaceId: string,
    projectId?: string
  ): Promise<Session> {
    const sessionId = generateId();
    
    const context: SessionContext = {
      sessionId,
      workspaceId,
      projectId,
      agentType: 'marketing-advisor',
      systemPrompt: this.getAgentPrompt(workspaceId, projectId),
      workingDirectory: `/sessions/${sessionId}`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      status: 'active',
    };

    const state: SessionState = {
      context,
      conversation: { messages: [], totalTokens: 0, lastMessageAt: '' },
      memory: { recentFiles: [], recentCommands: [] },
      toolState: {},
    };

    this.sessions.set(sessionId, state);

    // Save initial checkpoint
    await this.saveCheckpoint(sessionId, 'initial');

    return { sessionId, workspaceId, projectId };
  }

  /**
   * Resume existing session
   */
  async resumeSession(sessionId: string): Promise<Session> {
    // Load latest checkpoint
    const checkpoint = await this.checkpoint.loadCheckpoint(sessionId);
    
    if (!checkpoint) {
      throw new Error(`No checkpoint found for session ${sessionId}`);
    }

    // Restore session state
    const state: SessionState = {
      context: checkpoint.context,
      conversation: checkpoint.conversation,
      memory: checkpoint.memory,
      toolState: checkpoint.toolState,
    };

    // Update last active time
    state.context.lastActiveAt = new Date().toISOString();
    state.context.status = 'active';

    this.sessions.set(sessionId, state);

    return {
      sessionId,
      workspaceId: state.context.workspaceId,
      projectId: state.context.projectId,
      resumed: true,
      lastActiveAt: checkpoint.timestamp,
      messageCount: state.conversation.messages.length,
    };
  }

  /**
   * Add message to session
   */
  async addMessage(
    sessionId: string,
    message: Message
  ): Promise<void> {
    const state = this.sessions.get(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Add to conversation
    state.conversation.messages.push(message);
    state.conversation.lastMessageAt = message.timestamp;
    state.context.lastActiveAt = message.timestamp;

    // Append to streaming log
    await this.checkpoint.appendMessage(sessionId, message);

    // Checkpoint periodically
    if (this.shouldCheckpoint(state)) {
      await this.saveCheckpoint(sessionId, 'periodic');
    }
  }

  /**
   * Save checkpoint
   */
  async saveCheckpoint(
    sessionId: string,
    reason: 'periodic' | 'manual' | 'pause' | 'error'
  ): Promise<void> {
    const state = this.sessions.get(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const checkpoint: Checkpoint = {
      version: '1.0',
      sessionId,
      timestamp: new Date().toISOString(),
      context: state.context,
      conversation: state.conversation,
      memory: state.memory,
      toolState: state.toolState,
      checkpointNumber: state.conversation.messages.length,
      reason,
    };

    await this.checkpoint.saveCheckpoint(sessionId, checkpoint);
  }

  /**
   * Determine if checkpoint is needed
   */
  private shouldCheckpoint(state: SessionState): boolean {
    const messagesSinceLastCheckpoint = 
      state.conversation.messages.length % 10 === 0;
    
    const timeSinceLastCheckpoint = 
      Date.now() - new Date(state.context.lastActiveAt).getTime() > 5 * 60 * 1000;

    return messagesSinceLastCheckpoint || timeSinceLastCheckpoint;
  }

  /**
   * Pause session (explicit checkpoint)
   */
  async pauseSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    state.context.status = 'paused';
    await this.saveCheckpoint(sessionId, 'pause');
  }

  /**
   * Get session summary (for UI)
   */
  async getSessionSummary(sessionId: string): Promise<SessionSummary> {
    const checkpoint = await this.checkpoint.loadCheckpoint(sessionId);
    
    if (!checkpoint) {
      throw new Error(`No checkpoint found for session ${sessionId}`);
    }

    return {
      sessionId,
      projectId: checkpoint.context.projectId,
      projectName: checkpoint.context.projectName,
      status: checkpoint.context.status,
      messageCount: checkpoint.conversation.messages.length,
      createdAt: checkpoint.context.createdAt,
      lastActiveAt: checkpoint.context.lastActiveAt,
      lastMessage: checkpoint.conversation.messages[checkpoint.conversation.messages.length - 1]?.content,
    };
  }

  /**
   * List resumable sessions for project
   */
  async listResumableSessions(projectId: string): Promise<SessionSummary[]> {
    // This would query S3 or database for sessions with this projectId
    // For now, simplified implementation
    const sessions: SessionSummary[] = [];
    
    // In production, you'd list all checkpoint files and parse metadata
    // Or use a database index
    
    return sessions;
  }
}
```

---

### 3. Agent Runner Integration

```typescript
// src/services/agent-runner.ts (enhanced)

export class AgentRunner {
  private session: SessionService;

  async runAgent(
    sessionId: string,
    userMessage: string,
    stream: boolean = true
  ): Promise<AgentResponse> {
    // Load session state (from memory or checkpoint)
    const state = await this.session.getOrResumeSession(sessionId);

    // Add user message
    await this.session.addMessage(sessionId, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    });

    // Build messages array for Claude
    const messages = this.buildMessagesArray(state);

    try {
      // Call Claude API
      const response = await this.claude.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 8192,
        system: state.context.systemPrompt,
        messages,
        stream,
      });

      // Process response
      let assistantMessage = '';
      const toolCalls: ToolCall[] = [];

      if (stream) {
        for await (const chunk of response) {
          // Handle streaming chunks
          if (chunk.type === 'content_block_delta') {
            assistantMessage += chunk.delta.text;
          } else if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
            toolCalls.push(chunk.content_block);
          }
        }
      } else {
        assistantMessage = response.content[0].text;
        toolCalls.push(...response.content.filter(c => c.type === 'tool_use'));
      }

      // Add assistant message
      await this.session.addMessage(sessionId, {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date().toISOString(),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      });

      return { message: assistantMessage, toolCalls };

    } catch (err) {
      // Save error checkpoint
      await this.session.saveCheckpoint(sessionId, 'error');
      throw err;
    }
  }

  private buildMessagesArray(state: SessionState): Message[] {
    // Return recent messages (last N or within token limit)
    const maxMessages = 50;
    const messages = state.conversation.messages.slice(-maxMessages);
    
    return messages;
  }
}
```

---

### 4. API Endpoints

```typescript
// src/routes/session.ts

router.post('/api/session', async (req, res) => {
  const { workspaceId, projectId, prompt } = req.body;
  
  const session = await sessionService.createSession(workspaceId, projectId);
  
  res.json(session);
});

router.post('/api/session/:sessionId/resume', async (req, res) => {
  const { sessionId } = req.params;
  
  const session = await sessionService.resumeSession(sessionId);
  
  res.json(session);
});

router.post('/api/session/:sessionId/pause', async (req, res) => {
  const { sessionId } = req.params;
  
  await sessionService.pauseSession(sessionId);
  
  res.json({ success: true });
});

router.get('/api/session/:sessionId/summary', async (req, res) => {
  const { sessionId } = req.params;
  
  const summary = await sessionService.getSessionSummary(sessionId);
  
  res.json(summary);
});

router.get('/api/sessions', async (req, res) => {
  const { projectId } = req.query;
  
  const sessions = await sessionService.listResumableSessions(projectId as string);
  
  res.json({ sessions });
});

router.get('/api/session/:sessionId/checkpoints', async (req, res) => {
  const { sessionId } = req.params;
  
  const checkpoints = await checkpointService.listCheckpoints(sessionId);
  
  res.json({ checkpoints });
});

router.post('/api/session/:sessionId/restore', async (req, res) => {
  const { sessionId } = req.params;
  const { timestamp } = req.body;
  
  const checkpoint = await checkpointService.loadCheckpointByTimestamp(sessionId, timestamp);
  const session = await sessionService.restoreFromCheckpoint(checkpoint);
  
  res.json(session);
});
```

---

### 5. Frontend Integration

```typescript
// apps/marketing-agent/src/hooks/useSession.ts

export function useSession(projectId?: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resumableSessions, setResumableSessions] = useState<SessionSummary[]>([]);

  // Load resumable sessions on mount
  useEffect(() => {
    if (projectId) {
      loadResumableSessions();
    }
  }, [projectId]);

  async function loadResumableSessions() {
    const response = await fetch(`/api/sessions?projectId=${projectId}`);
    const data = await response.json();
    setResumableSessions(data.sessions);
  }

  async function createSession() {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, projectId }),
    });
    const data = await response.json();
    setSessionId(data.sessionId);
    return data;
  }

  async function resumeSession(sessionId: string) {
    const response = await fetch(`/api/session/${sessionId}/resume`, {
      method: 'POST',
    });
    const data = await response.json();
    setSessionId(data.sessionId);
    return data;
  }

  async function pauseSession() {
    if (!sessionId) return;
    
    await fetch(`/api/session/${sessionId}/pause`, {
      method: 'POST',
    });
  }

  return {
    sessionId,
    resumableSessions,
    createSession,
    resumeSession,
    pauseSession,
  };
}
```

```typescript
// apps/marketing-agent/src/components/SessionSelector.tsx

export function SessionSelector({ projectId, onSessionSelected }) {
  const { resumableSessions, createSession, resumeSession } = useSession(projectId);

  return (
    <div>
      <h2>Resume Previous Session</h2>
      
      {resumableSessions.length > 0 ? (
        <div className="space-y-2">
          {resumableSessions.map(session => (
            <Card key={session.sessionId} onClick={() => resumeSession(session.sessionId)}>
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Session {session.sessionId.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    {session.messageCount} messages
                  </p>
                  <p className="text-sm text-gray-400">
                    Last active: {formatDistanceToNow(new Date(session.lastActiveAt))} ago
                  </p>
                </div>
                <Button variant="ghost">Resume</Button>
              </div>
              {session.lastMessage && (
                <p className="text-sm mt-2 text-gray-600 truncate">
                  {session.lastMessage}
                </p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No previous sessions</p>
      )}

      <Button onClick={createSession} className="mt-4">
        Start New Session
      </Button>
    </div>
  );
}
```

---

## Checkpoint Strategy

### When to Checkpoint?

1. **Periodic** (every N messages)
   - Every 10 messages
   - Ensures regular backups

2. **Time-based** (every M minutes)
   - Every 5 minutes of activity
   - Protects against long-running sessions

3. **Explicit** (user action)
   - User clicks "Pause"
   - User closes tab/window

4. **Error** (on failure)
   - API error
   - Tool execution failure
   - Ensures recovery point

5. **Milestone** (important events)
   - Campaign created
   - Terraform deployed
   - Artifact generated

### Checkpoint Retention

```typescript
// Lifecycle policy
{
  "Rules": [
    {
      "Id": "DeleteOldCheckpoints",
      "Status": "Enabled",
      "Prefix": "checkpoints/",
      "Expiration": {
        "Days": 30  // Keep checkpoints for 30 days
      },
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 7  // Keep old versions for 7 days
      }
    }
  ]
}
```

---

## Resume Flow

### User Experience

```
1. User opens app
   ↓
2. Show: "Resume previous session?" with preview
   ↓
3. User clicks "Resume"
   ↓
4. Load checkpoint from S3
   ↓
5. Restore conversation history
   ↓
6. Show: "Welcome back! We left off discussing..."
   ↓
7. User continues conversation
```

### Technical Flow

```typescript
// Resume session
async function resumeSession(sessionId: string) {
  // 1. Load latest checkpoint
  const checkpoint = await checkpointService.loadCheckpoint(sessionId);
  
  // 2. Restore session state
  const state = {
    context: checkpoint.context,
    conversation: checkpoint.conversation,
    memory: checkpoint.memory,
    toolState: checkpoint.toolState,
  };
  
  // 3. Rebuild system prompt with context
  const systemPrompt = buildSystemPrompt(state.context);
  
  // 4. Load conversation history
  const messages = state.conversation.messages;
  
  // 5. Send resume message to agent
  const resumePrompt = `
You are resuming a previous session.

Session context:
- Project: ${state.context.projectName}
- Last active: ${state.context.lastActiveAt}
- Messages: ${messages.length}

Recent conversation:
${messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

Please acknowledge that you remember the context and ask the user how you can help continue.
  `;
  
  // 6. Get agent response
  const response = await agentRunner.runAgent(sessionId, resumePrompt);
  
  return { state, response };
}
```

---

## Advanced Features

### 1. **Conversation Branching**

```typescript
// Create branch from checkpoint
async function branchSession(
  sessionId: string,
  checkpointTimestamp: string
): Promise<string> {
  // Load specific checkpoint
  const checkpoint = await checkpointService.loadCheckpointByTimestamp(
    sessionId,
    checkpointTimestamp
  );
  
  // Create new session with same state
  const newSessionId = generateId();
  const newCheckpoint = {
    ...checkpoint,
    sessionId: newSessionId,
    timestamp: new Date().toISOString(),
    parentSessionId: sessionId,
    branchPoint: checkpointTimestamp,
  };
  
  await checkpointService.saveCheckpoint(newSessionId, newCheckpoint);
  
  return newSessionId;
}
```

### 2. **Conversation Search**

```typescript
// Search across all conversations
async function searchConversations(
  query: string,
  projectId?: string
): Promise<SearchResult[]> {
  // Load all conversation logs
  const sessions = await listSessions(projectId);
  
  const results: SearchResult[] = [];
  
  for (const sessionId of sessions) {
    const messages = await checkpointService.loadConversationLog(sessionId);
    
    for (const message of messages) {
      if (message.content.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          sessionId,
          message,
          context: messages.slice(
            Math.max(0, messages.indexOf(message) - 2),
            messages.indexOf(message) + 3
          ),
        });
      }
    }
  }
  
  return results;
}
```

### 3. **Session Analytics**

```typescript
// Analyze session patterns
async function analyzeSession(sessionId: string): Promise<SessionAnalytics> {
  const checkpoint = await checkpointService.loadCheckpoint(sessionId);
  
  const messages = checkpoint.conversation.messages;
  
  return {
    totalMessages: messages.length,
    userMessages: messages.filter(m => m.role === 'user').length,
    assistantMessages: messages.filter(m => m.role === 'assistant').length,
    averageMessageLength: messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length,
    toolCallsCount: messages.filter(m => m.toolCalls).length,
    duration: new Date(checkpoint.timestamp).getTime() - new Date(checkpoint.context.createdAt).getTime(),
    artifactsGenerated: checkpoint.memory.currentArtifacts?.length || 0,
  };
}
```

---

## S3 Structure (Complete)

```
s3://bird-agent-artifacts/
├── sessions/
│   └── {sessionId}/
│       ├── metadata.json
│       ├── artifacts/
│       │   └── ... (from previous doc)
│       └── logs/
│           └── agent.log
├── checkpoints/
│   └── {sessionId}/
│       ├── latest.json                    # Latest checkpoint
│       ├── checkpoint-{timestamp}.json    # Historical checkpoints
│       └── conversation.jsonl             # Streaming conversation log
├── projects/
│   └── {projectId}/
│       ├── foundation.md
│       ├── dashboard.yaml
│       └── sessions/
│           └── session-index.json         # List of sessions for this project
└── templates/
    ├── foundation-template.md
    └── dashboard-template.yaml
```

---

## Cost Estimation

### S3 Storage

**Per session**:
- Checkpoint: ~50 KB (conversation history)
- Conversation log: ~10 KB per 100 messages
- Total: ~60 KB per session

**1,000 sessions/month**:
- Storage: 60 MB × $0.023/GB = $0.001/month
- PUT requests: 10,000 × $0.005/1000 = $0.05/month
- GET requests: 5,000 × $0.0004/1000 = $0.002/month

**Total: ~$0.05/month** (negligible!)

---

## Implementation Checklist

- [ ] Implement `CheckpointService`
- [ ] Update `SessionService` with checkpoint support
- [ ] Add checkpoint triggers (periodic, time-based, explicit)
- [ ] Implement resume flow
- [ ] Add API endpoints (resume, pause, list)
- [ ] Update frontend with session selector
- [ ] Add conversation.jsonl streaming
- [ ] Implement checkpoint retention policy
- [ ] Add monitoring (checkpoint success/failure)
- [ ] Write tests (unit + integration)
- [ ] Document for team

**Estimated time: 6 hours**

---

## Testing

```typescript
// tests/checkpoint.test.ts

describe('CheckpointService', () => {
  it('saves and loads checkpoint', async () => {
    const checkpoint: Checkpoint = {
      version: '1.0',
      sessionId: 'test-session',
      timestamp: new Date().toISOString(),
      context: { /* ... */ },
      conversation: { messages: [], totalTokens: 0, lastMessageAt: '' },
      memory: { recentFiles: [], recentCommands: [] },
      toolState: {},
      checkpointNumber: 0,
      reason: 'manual',
    };

    await checkpointService.saveCheckpoint('test-session', checkpoint);
    const loaded = await checkpointService.loadCheckpoint('test-session');

    expect(loaded).toEqual(checkpoint);
  });

  it('resumes session from checkpoint', async () => {
    // Create session
    const session = await sessionService.createSession('workspace-1', 'project-1');
    
    // Add messages
    await sessionService.addMessage(session.sessionId, {
      role: 'user',
      content: 'Hello',
      timestamp: new Date().toISOString(),
    });
    
    // Save checkpoint
    await sessionService.saveCheckpoint(session.sessionId, 'manual');
    
    // Resume session
    const resumed = await sessionService.resumeSession(session.sessionId);
    
    expect(resumed.sessionId).toBe(session.sessionId);
    expect(resumed.resumed).toBe(true);
    expect(resumed.messageCount).toBe(1);
  });
});
```

---

## Recommendation

**Use S3 checkpoints with streaming conversation log**

### Why:
1. ✅ **Durable** - Survives container restarts
2. ✅ **Simple** - No database dependency
3. ✅ **Cheap** - ~$0.05/month
4. ✅ **Scalable** - Works across instances
5. ✅ **Versioned** - Can restore from any point
6. ✅ **Fast resume** - Load latest checkpoint in <100ms

### Checkpoint Strategy:
- Every 10 messages
- Every 5 minutes
- On pause/error
- On milestone events

**This enables seamless session resumption!** 🎉
