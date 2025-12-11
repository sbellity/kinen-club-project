# Agent Client Protocol (ACP) Integration Strategy

## Problem Statement

**Current approach**: Direct integration with Claude Code SDK
- ❌ Tight coupling to Claude/Anthropic
- ❌ Hard to switch AI providers
- ❌ Custom lifecycle hooks needed
- ❌ Vendor lock-in

**Better approach**: Use Agent Client Protocol (ACP)
- ✅ Standardized protocol for agent communication
- ✅ Provider-agnostic (works with any ACP agent)
- ✅ Built-in lifecycle hooks via protocol
- ✅ No vendor lock-in

**Reference**: https://agentclientprotocol.com/protocol/overview

---

## What is ACP?

### Overview

**Agent Client Protocol** is a standardized JSON-RPC 2.0 protocol for communication between:
- **Clients** (IDEs, UIs, applications) - our Marketing Agent UI
- **Agents** (AI assistants) - Claude Code, or any other ACP-compatible agent

### Key Benefits

1. **Standardized Communication**
   - JSON-RPC 2.0 based
   - Well-defined message flow
   - Request-response and notifications

2. **Provider Agnostic**
   - Works with Claude Code via `claude-code-acp` adapter
   - Could work with GPT-4, Gemini, or any ACP agent
   - Easy to switch providers

3. **Built-in Lifecycle**
   - `session/update` notifications for progress
   - `session/request_permission` for tool approvals
   - `session/cancel` for interruption
   - File system operations
   - Terminal management

4. **Extensibility**
   - Custom methods with `_` prefix
   - Custom capabilities
   - `_meta` fields for custom data

---

## Architecture with ACP

### Current Architecture (Direct Claude SDK)

```
Marketing Agent UI
    ↓ HTTP/SSE
llmchain Backend
    ↓ Direct SDK calls
Claude API
```

**Problems**:
- Tight coupling to Claude
- Custom lifecycle hooks needed
- Hard to add other AI providers

---

### New Architecture (ACP)

```
Marketing Agent UI
    ↓ HTTP/SSE
llmchain Backend (ACP Client)
    ↓ JSON-RPC 2.0 (stdio/HTTP)
ACP Agent (claude-code-acp)
    ↓ Claude SDK
Claude API
```

**Benefits**:
- Loose coupling via protocol
- Built-in lifecycle via ACP
- Easy to swap agents
- Standard tool handling

---

## ACP Message Flow

### 1. **Initialization**

```typescript
// Client → Agent
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-01-01",
    "capabilities": {
      "fs": {
        "readTextFile": true,
        "writeTextFile": true
      },
      "terminal": true,
      "requestPermission": true
    },
    "clientInfo": {
      "name": "marketing-agent",
      "version": "1.0.0"
    }
  }
}

// Agent → Client (response)
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-01-01",
    "capabilities": {
      "loadSession": true,
      "modes": ["agent", "plan", "ask"]
    },
    "agentInfo": {
      "name": "claude-code",
      "version": "0.12.1"
    }
  }
}
```

### 2. **Session Creation**

```typescript
// Client → Agent
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "session/new",
  "params": {
    "workingDirectory": "/sessions/session-123",
    "systemPrompt": "You are a Marketing Advisor...",
    "_meta": {
      "projectId": "project-456",
      "projectName": "VIP Campaign"
    }
  }
}

// Agent → Client (response)
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "sessionId": "acp-session-789"
  }
}
```

### 3. **Prompt Turn**

```typescript
// Client → Agent
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "session/prompt",
  "params": {
    "sessionId": "acp-session-789",
    "prompt": {
      "type": "user",
      "text": "Create a VIP campaign targeting high-value customers"
    }
  }
}

// Agent → Client (notification - streaming)
{
  "jsonrpc": "2.0",
  "method": "session/update",
  "params": {
    "sessionId": "acp-session-789",
    "update": {
      "type": "message",
      "role": "assistant",
      "content": {
        "type": "text",
        "text": "I'll help you create a VIP campaign..."
      }
    }
  }
}

// Agent → Client (notification - tool call)
{
  "jsonrpc": "2.0",
  "method": "session/update",
  "params": {
    "sessionId": "acp-session-789",
    "update": {
      "type": "tool_call",
      "id": "tool-1",
      "name": "mcp__nest-api__invoke_operation",
      "input": {
        "operation": "data.audiences:createAudience",
        "body": { /* ... */ }
      }
    }
  }
}

// Agent → Client (request permission)
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "session/request_permission",
  "params": {
    "sessionId": "acp-session-789",
    "permission": {
      "type": "tool_call",
      "toolCall": {
        "id": "tool-1",
        "name": "mcp__nest-api__invoke_operation",
        "input": { /* ... */ }
      }
    }
  }
}

// Client → Agent (grant permission)
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "granted": true
  }
}

// Agent → Client (tool result)
{
  "jsonrpc": "2.0",
  "method": "session/update",
  "params": {
    "sessionId": "acp-session-789",
    "update": {
      "type": "tool_result",
      "id": "tool-1",
      "result": { /* ... */ }
    }
  }
}

// Agent → Client (response - turn complete)
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "stopReason": "end_turn",
    "usage": {
      "inputTokens": 1234,
      "outputTokens": 567
    }
  }
}
```

### 4. **Session Resume (with Checkpointing)**

```typescript
// Client → Agent
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "session/load",
  "params": {
    "sessionId": "acp-session-789",
    "checkpoint": {
      // Load from S3 checkpoint
      "conversationHistory": [ /* ... */ ],
      "workingDirectory": "/sessions/session-123",
      "_meta": {
        "projectId": "project-456",
        "lastActiveAt": "2025-01-08T12:00:00Z"
      }
    }
  }
}
```

---

## Implementation Design

### 1. **ACP Client Service**

```typescript
// src/services/acp-client.ts

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

interface ACPRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: any;
}

interface ACPResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface ACPNotification {
  jsonrpc: '2.0';
  method: string;
  params: any;
}

export class ACPClient extends EventEmitter {
  private agent: ChildProcess;
  private requestId = 0;
  private pendingRequests: Map<number, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = new Map();

  constructor(
    private agentCommand: string = 'claude-code-acp',
    private agentArgs: string[] = []
  ) {
    super();
  }

  /**
   * Start ACP agent process
   */
  async start(): Promise<void> {
    this.agent = spawn(this.agentCommand, this.agentArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      },
    });

    // Handle stdout (JSON-RPC messages)
    let buffer = '';
    this.agent.stdout?.on('data', (chunk) => {
      buffer += chunk.toString();
      
      // Parse line-delimited JSON
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            this.handleMessage(message);
          } catch (err) {
            console.error('Failed to parse ACP message:', err);
          }
        }
      }
    });

    // Handle stderr (logs)
    this.agent.stderr?.on('data', (chunk) => {
      console.error('ACP agent stderr:', chunk.toString());
    });

    // Handle exit
    this.agent.on('exit', (code) => {
      console.log(`ACP agent exited with code ${code}`);
      this.emit('exit', code);
    });

    // Initialize protocol
    await this.initialize();
  }

  /**
   * Stop ACP agent process
   */
  async stop(): Promise<void> {
    this.agent.kill();
  }

  /**
   * Send JSON-RPC request
   */
  private async sendRequest(method: string, params?: any): Promise<any> {
    const id = ++this.requestId;
    
    const request: ACPRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      this.agent.stdin?.write(JSON.stringify(request) + '\n');
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request ${id} timed out`));
        }
      }, 30000);
    });
  }

  /**
   * Send JSON-RPC notification (no response expected)
   */
  private sendNotification(method: string, params: any): void {
    const notification: ACPNotification = {
      jsonrpc: '2.0',
      method,
      params,
    };

    this.agent.stdin?.write(JSON.stringify(notification) + '\n');
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: ACPResponse | ACPNotification): void {
    // Response to request
    if ('id' in message) {
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        this.pendingRequests.delete(message.id);
        
        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result);
        }
      }
    }
    // Notification
    else if ('method' in message) {
      this.emit('notification', message.method, message.params);
      
      // Emit specific event for this notification
      this.emit(message.method, message.params);
    }
  }

  /**
   * Initialize protocol
   */
  async initialize(): Promise<void> {
    const result = await this.sendRequest('initialize', {
      protocolVersion: '2025-01-01',
      capabilities: {
        fs: {
          readTextFile: true,
          writeTextFile: true,
        },
        terminal: true,
        requestPermission: true,
      },
      clientInfo: {
        name: 'marketing-agent',
        version: '1.0.0',
      },
    });

    console.log('ACP initialized:', result);
  }

  /**
   * Create new session
   */
  async createSession(
    workingDirectory: string,
    systemPrompt: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const result = await this.sendRequest('session/new', {
      workingDirectory,
      systemPrompt,
      _meta: metadata,
    });

    return result.sessionId;
  }

  /**
   * Load existing session
   */
  async loadSession(
    sessionId: string,
    checkpoint: any
  ): Promise<void> {
    await this.sendRequest('session/load', {
      sessionId,
      checkpoint,
    });
  }

  /**
   * Send prompt to agent
   */
  async sendPrompt(
    sessionId: string,
    prompt: string
  ): Promise<{ stopReason: string; usage: any }> {
    return await this.sendRequest('session/prompt', {
      sessionId,
      prompt: {
        type: 'user',
        text: prompt,
      },
    });
  }

  /**
   * Cancel ongoing operation
   */
  cancelSession(sessionId: string): void {
    this.sendNotification('session/cancel', { sessionId });
  }

  /**
   * Respond to permission request
   */
  async grantPermission(requestId: number, granted: boolean): Promise<void> {
    // This is a response to a request, so we need to send a response
    const response: ACPResponse = {
      jsonrpc: '2.0',
      id: requestId,
      result: { granted },
    };

    this.agent.stdin?.write(JSON.stringify(response) + '\n');
  }
}
```

---

### 2. **Session Service with ACP**

```typescript
// src/services/session-acp.ts

import { ACPClient } from './acp-client';
import { CheckpointService } from './checkpoint';
import { ArtifactStorageService } from './artifact-storage';

export class ACPSessionService {
  private acpClient: ACPClient;
  private checkpoint: CheckpointService;
  private artifactStorage: ArtifactStorageService;
  private sessions: Map<string, {
    acpSessionId: string;
    workingDirectory: string;
    projectId?: string;
  }> = new Map();

  constructor() {
    this.acpClient = new ACPClient();
    this.checkpoint = new CheckpointService();
    this.artifactStorage = new ArtifactStorageService();

    this.setupACPListeners();
  }

  async start(): Promise<void> {
    await this.acpClient.start();
  }

  async stop(): Promise<void> {
    await this.acpClient.stop();
  }

  /**
   * Setup ACP event listeners
   */
  private setupACPListeners(): void {
    // Listen for session updates (streaming)
    this.acpClient.on('session/update', (params) => {
      this.handleSessionUpdate(params);
    });

    // Listen for permission requests
    this.acpClient.on('session/request_permission', async (params) => {
      await this.handlePermissionRequest(params);
    });
  }

  /**
   * Create new session
   */
  async createSession(
    sessionId: string,
    workspaceId: string,
    projectId?: string,
    projectName?: string
  ): Promise<string> {
    const workingDirectory = `/sessions/${sessionId}`;
    const systemPrompt = this.getSystemPrompt(projectId, projectName);

    const acpSessionId = await this.acpClient.createSession(
      workingDirectory,
      systemPrompt,
      {
        sessionId,
        workspaceId,
        projectId,
        projectName,
      }
    );

    this.sessions.set(sessionId, {
      acpSessionId,
      workingDirectory,
      projectId,
    });

    return acpSessionId;
  }

  /**
   * Resume session from checkpoint
   */
  async resumeSession(sessionId: string): Promise<string> {
    // Load checkpoint from S3
    const checkpoint = await this.checkpoint.loadCheckpoint(sessionId);
    
    if (!checkpoint) {
      throw new Error(`No checkpoint found for session ${sessionId}`);
    }

    const workingDirectory = `/sessions/${sessionId}`;
    const systemPrompt = this.getSystemPrompt(
      checkpoint.context.projectId,
      checkpoint.context.projectName
    );

    // Create new ACP session with checkpoint data
    const acpSessionId = await this.acpClient.createSession(
      workingDirectory,
      systemPrompt,
      {
        sessionId,
        workspaceId: checkpoint.context.workspaceId,
        projectId: checkpoint.context.projectId,
        projectName: checkpoint.context.projectName,
      }
    );

    // Load conversation history
    await this.acpClient.loadSession(acpSessionId, {
      conversationHistory: checkpoint.conversation.messages,
      workingDirectory,
      _meta: {
        lastActiveAt: checkpoint.context.lastActiveAt,
        turnNumber: checkpoint.checkpointNumber,
      },
    });

    this.sessions.set(sessionId, {
      acpSessionId,
      workingDirectory,
      projectId: checkpoint.context.projectId,
    });

    return acpSessionId;
  }

  /**
   * Send prompt to agent
   */
  async sendPrompt(
    sessionId: string,
    prompt: string,
    onUpdate?: (update: any) => void
  ): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Set up update listener for this prompt
    if (onUpdate) {
      const listener = (params: any) => {
        if (params.sessionId === session.acpSessionId) {
          onUpdate(params.update);
        }
      };
      this.acpClient.on('session/update', listener);
      
      // Clean up listener after prompt completes
      // (would need more sophisticated cleanup in production)
    }

    // Send prompt
    const result = await this.acpClient.sendPrompt(session.acpSessionId, prompt);

    // Checkpoint after turn
    await this.checkpointSession(sessionId);

    return result;
  }

  /**
   * Handle session update notification
   */
  private async handleSessionUpdate(params: any): void {
    const { sessionId, update } = params;

    // Find our session ID from ACP session ID
    const sessionEntry = Array.from(this.sessions.entries())
      .find(([_, s]) => s.acpSessionId === sessionId);
    
    if (!sessionEntry) return;
    
    const [ourSessionId] = sessionEntry;

    // Handle different update types
    switch (update.type) {
      case 'message':
        // Stream message to client
        this.emit('message', ourSessionId, update);
        break;

      case 'tool_call':
        // Track tool call
        console.log(`Tool call: ${update.name}`);
        break;

      case 'tool_result':
        // Handle tool result
        // If it's a write operation, upload to S3
        if (this.isFileWrite(update)) {
          await this.uploadArtifact(ourSessionId, update);
        }
        break;
    }
  }

  /**
   * Handle permission request
   */
  private async handlePermissionRequest(params: any): Promise<void> {
    const { sessionId, permission } = params;

    // Auto-approve for now (could add UI approval later)
    const granted = true;

    await this.acpClient.grantPermission(params.id, granted);
  }

  /**
   * Checkpoint session
   */
  private async checkpointSession(sessionId: string): Promise<void> {
    // Get conversation history from ACP
    // (would need to track this ourselves or query agent)
    
    const checkpoint = {
      version: '1.0',
      sessionId,
      timestamp: new Date().toISOString(),
      // ... other checkpoint data
    };

    await this.checkpoint.saveCheckpoint(sessionId, checkpoint);
  }

  /**
   * Check if update is a file write
   */
  private isFileWrite(update: any): boolean {
    return update.name === 'fs/write_text_file' || 
           update.name === 'Write' ||
           update.name === 'StrReplace';
  }

  /**
   * Upload artifact to S3
   */
  private async uploadArtifact(sessionId: string, update: any): Promise<void> {
    const path = update.input?.path || update.input?.file_path;
    const content = update.result?.content || update.input?.contents;

    if (path && content) {
      await this.artifactStorage.uploadArtifact(sessionId, path, content);
    }
  }

  private getSystemPrompt(projectId?: string, projectName?: string): string {
    // Build system prompt
    return `You are a Marketing Advisor...`;
  }
}
```

---

### 3. **API Routes with ACP**

```typescript
// src/routes/session-acp.ts

import { Router } from 'express';
import { ACPSessionService } from '../services/session-acp';

const router = Router();
const sessionService = new ACPSessionService();

// Start ACP client
sessionService.start();

router.post('/api/session', async (req, res) => {
  const { workspaceId, projectId, projectName } = req.body;
  
  const sessionId = generateId();
  const acpSessionId = await sessionService.createSession(
    sessionId,
    workspaceId,
    projectId,
    projectName
  );

  res.json({ sessionId, acpSessionId });
});

router.post('/api/session/:sessionId/resume', async (req, res) => {
  const { sessionId } = req.params;
  
  const acpSessionId = await sessionService.resumeSession(sessionId);

  res.json({ sessionId, acpSessionId, resumed: true });
});

router.post('/api/session/:sessionId/prompt', async (req, res) => {
  const { sessionId } = req.params;
  const { prompt } = req.body;

  // Set up SSE for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const result = await sessionService.sendPrompt(
      sessionId,
      prompt,
      (update) => {
        // Stream updates to client
        res.write(`data: ${JSON.stringify(update)}\n\n`);
      }
    );

    // Send final result
    res.write(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
    res.end();
  }
});

export default router;
```

---

## Benefits of ACP Integration

### 1. **No Vendor Lock-in**

```typescript
// Easy to switch agents
const acpClient = new ACPClient(
  process.env.AGENT_COMMAND || 'claude-code-acp'
);

// Could use:
// - 'claude-code-acp' (Claude)
// - 'gpt-4-acp' (OpenAI - if adapter exists)
// - 'gemini-acp' (Google - if adapter exists)
// - Custom agent
```

### 2. **Built-in Lifecycle Hooks**

```typescript
// No need to build custom hooks!
acpClient.on('session/update', (params) => {
  // Handle all updates: messages, tool calls, results
});

acpClient.on('session/request_permission', (params) => {
  // Handle permission requests
});
```

### 3. **Standard Tool Handling**

```typescript
// ACP handles tool calls automatically
// No need to implement tool execution
// Agent manages tool lifecycle
```

### 4. **File System Operations**

```typescript
// ACP provides fs methods
// Client implements:
// - fs/read_text_file
// - fs/write_text_file

// Agent calls these via protocol
// We can intercept and upload to S3
```

### 5. **Terminal Management**

```typescript
// ACP provides terminal methods
// - terminal/create
// - terminal/output
// - terminal/kill

// Useful for running terraform, etc.
```

---

## Migration Path

### Phase 1: Add ACP Support (Parallel)

```typescript
// Keep existing direct Claude integration
// Add new ACP integration
// Run both in parallel
// Feature flag to switch

const useACP = process.env.USE_ACP === 'true';

if (useACP) {
  sessionService = new ACPSessionService();
} else {
  sessionService = new DirectClaudeSessionService();
}
```

### Phase 2: Test & Validate

- Test all features with ACP
- Validate checkpointing works
- Ensure artifact upload works
- Test session resume

### Phase 3: Switch Default

```typescript
// Make ACP the default
const useACP = process.env.USE_ACP !== 'false';
```

### Phase 4: Remove Direct Integration

- Remove direct Claude SDK code
- Keep only ACP integration
- Update documentation

---

## Comparison

| Feature | Direct Claude SDK | ACP Integration |
|---------|------------------|-----------------|
| **Vendor lock-in** | ❌ Tight coupling | ✅ Provider agnostic |
| **Lifecycle hooks** | ❌ Custom implementation | ✅ Built-in protocol |
| **Tool handling** | ❌ Manual | ✅ Automatic |
| **File operations** | ❌ Custom | ✅ Standard protocol |
| **Terminal support** | ❌ Custom | ✅ Built-in |
| **Checkpointing** | ❌ Custom | ✅ session/load support |
| **Permission requests** | ❌ Custom | ✅ Built-in |
| **Streaming** | ✅ SDK streaming | ✅ session/update notifications |
| **Implementation** | 8 hours | 6 hours |
| **Maintenance** | High | Low |

---

## Implementation Checklist

### Backend (6 hours)

- [ ] Install `claude-code-acp` (1 min)
- [ ] Implement `ACPClient` service (2 hours)
- [ ] Implement `ACPSessionService` (2 hours)
- [ ] Update API routes for ACP (1 hour)
- [ ] Add S3 artifact upload on file writes (30 min)
- [ ] Add checkpointing on turn complete (30 min)
- [ ] Testing (1 hour)

### Frontend (No changes!)

- [ ] Frontend works as-is (SSE streaming)
- [ ] No changes needed

---

## Example: Complete Flow

```typescript
// 1. Start ACP client
const acp = new ACPClient('claude-code-acp');
await acp.start();

// 2. Create session
const sessionId = await acp.createSession(
  '/sessions/session-123',
  'You are a Marketing Advisor...',
  { projectId: 'project-456' }
);

// 3. Listen for updates
acp.on('session/update', (params) => {
  if (params.update.type === 'message') {
    console.log('Agent:', params.update.content.text);
  }
  
  if (params.update.type === 'tool_result') {
    // Upload artifact to S3
    uploadToS3(params.update);
  }
});

// 4. Send prompt
const result = await acp.sendPrompt(
  sessionId,
  'Create a VIP campaign'
);

// 5. Checkpoint
await checkpointService.saveCheckpoint(sessionId, {
  // ... checkpoint data
});

// 6. Resume later
const checkpoint = await checkpointService.loadCheckpoint(sessionId);
await acp.loadSession(sessionId, checkpoint);
```

---

## Cost Comparison

| Approach | Implementation | Maintenance | Flexibility |
|----------|---------------|-------------|-------------|
| Direct SDK | 8 hours | High | Low |
| ACP | 6 hours | Low | High |
| **Savings** | **2 hours** | **Significant** | **Much better** |

---

## Recommendation

**Use ACP Integration**

### Why:
1. ✅ **No vendor lock-in** - Can switch AI providers
2. ✅ **Standard protocol** - Well-documented, maintained
3. ✅ **Built-in lifecycle** - No custom hooks needed
4. ✅ **Less code** - Protocol handles complexity
5. ✅ **Future-proof** - Works with any ACP agent
6. ✅ **Faster implementation** - 6 hours vs 8 hours

### When to use Direct SDK:
- Need features not in ACP
- ACP adapter doesn't exist for your provider
- Very simple use case

**For our Marketing Agent: ACP is the clear winner!** 🎯

---

## References

- **ACP Protocol**: https://agentclientprotocol.com/protocol/overview
- **Claude Code ACP Adapter**: https://github.com/zed-industries/claude-code-acp
- **ACP TypeScript Library**: https://agentclientprotocol.com/libraries/typescript

---

## Next Steps

1. **Install adapter**: `npm install @zed-industries/claude-code-acp`
2. **Implement `ACPClient`**: JSON-RPC communication
3. **Implement `ACPSessionService`**: Session management
4. **Test integration**: Create session, send prompt, checkpoint
5. **Update documentation**: ACP architecture

**Estimated: 6 hours total** 🚀
