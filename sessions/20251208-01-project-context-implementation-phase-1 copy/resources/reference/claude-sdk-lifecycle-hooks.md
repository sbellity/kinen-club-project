# Claude SDK Turn Lifecycle Hooks

## Problem Statement

**Goal**: Hook into Claude Code's turn lifecycle to:
- Intercept artifact writes
- Checkpoint conversation state
- Track tool usage
- Monitor token consumption
- Capture errors

**Question**: Does Claude's SDK expose lifecycle hooks?

---

## Claude SDK Architecture

### Current SDK (Anthropic SDK)

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await client.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 8192,
  system: systemPrompt,
  messages: conversationHistory,
  tools: toolDefinitions,
  stream: true,
});
```

**What's exposed**:
- ✅ Streaming responses
- ✅ Tool use events
- ✅ Content blocks
- ✅ Token usage (in response)
- ❌ No lifecycle hooks
- ❌ No middleware system
- ❌ No interceptors

---

## Available Hooks (Via Streaming)

### 1. **Stream Events**

The SDK exposes these event types when streaming:

```typescript
for await (const event of response) {
  switch (event.type) {
    case 'message_start':
      // Message begins
      // event.message.usage: { input_tokens, output_tokens }
      break;
      
    case 'content_block_start':
      // New content block (text or tool_use)
      // event.content_block: { type: 'text' | 'tool_use', ... }
      break;
      
    case 'content_block_delta':
      // Incremental content
      // event.delta: { type: 'text_delta', text: '...' }
      // OR event.delta: { type: 'input_json_delta', partial_json: '...' }
      break;
      
    case 'content_block_stop':
      // Content block complete
      // event.index: number
      break;
      
    case 'message_delta':
      // Message metadata update
      // event.delta: { stop_reason: 'end_turn' | 'tool_use' | ... }
      // event.usage: { output_tokens }
      break;
      
    case 'message_stop':
      // Message complete
      break;
      
    case 'error':
      // Error occurred
      // event.error: { type, message }
      break;
  }
}
```

### 2. **Tool Use Detection**

```typescript
for await (const event of response) {
  if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
    const toolCall = event.content_block;
    console.log('Tool called:', toolCall.name);
    
    // Hook: Before tool execution
    await onToolCallStart(toolCall);
  }
  
  if (event.type === 'content_block_stop' && event.index === toolBlockIndex) {
    // Hook: After tool execution
    await onToolCallComplete(toolCall, toolResult);
  }
}
```

---

## Building a Lifecycle Hook System

Since Claude SDK doesn't have built-in hooks, we can build our own wrapper:

### 1. **Agent Runner with Hooks**

```typescript
// src/services/agent-runner-with-hooks.ts

type LifecycleHook = 
  | 'beforeTurn'
  | 'afterTurn'
  | 'beforeToolCall'
  | 'afterToolCall'
  | 'onArtifactWrite'
  | 'onCheckpoint'
  | 'onError';

interface HookContext {
  sessionId: string;
  turnNumber: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ToolCallContext extends HookContext {
  toolName: string;
  toolInput: any;
  toolOutput?: any;
}

interface ArtifactContext extends HookContext {
  artifactPath: string;
  artifactContent: string;
  artifactType: string;
}

export class AgentRunnerWithHooks {
  private hooks: Map<LifecycleHook, Array<(ctx: any) => Promise<void>>> = new Map();
  private claude: Anthropic;

  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Register lifecycle hook
   */
  on(hook: LifecycleHook, handler: (ctx: any) => Promise<void>): void {
    if (!this.hooks.has(hook)) {
      this.hooks.set(hook, []);
    }
    this.hooks.get(hook)!.push(handler);
  }

  /**
   * Trigger hook
   */
  private async triggerHook(hook: LifecycleHook, context: any): Promise<void> {
    const handlers = this.hooks.get(hook) || [];
    await Promise.all(handlers.map(handler => handler(context)));
  }

  /**
   * Run agent with lifecycle hooks
   */
  async runAgent(
    sessionId: string,
    userMessage: string,
    conversationHistory: Message[],
    systemPrompt: string
  ): Promise<AgentResponse> {
    const turnNumber = conversationHistory.length + 1;
    const startTime = Date.now();

    // Hook: Before turn
    await this.triggerHook('beforeTurn', {
      sessionId,
      turnNumber,
      timestamp: new Date().toISOString(),
      userMessage,
    });

    try {
      const messages = [...conversationHistory, { role: 'user', content: userMessage }];
      
      const response = await this.claude.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 8192,
        system: systemPrompt,
        messages,
        tools: this.getToolDefinitions(),
        stream: true,
      });

      let assistantMessage = '';
      const toolCalls: ToolCall[] = [];
      let currentToolCall: any = null;

      for await (const event of response) {
        switch (event.type) {
          case 'content_block_start':
            if (event.content_block.type === 'tool_use') {
              currentToolCall = event.content_block;
              
              // Hook: Before tool call
              await this.triggerHook('beforeToolCall', {
                sessionId,
                turnNumber,
                timestamp: new Date().toISOString(),
                toolName: currentToolCall.name,
                toolInput: currentToolCall.input,
              });
            }
            break;

          case 'content_block_delta':
            if (event.delta.type === 'text_delta') {
              assistantMessage += event.delta.text;
            }
            break;

          case 'content_block_stop':
            if (currentToolCall) {
              toolCalls.push(currentToolCall);
              
              // Execute tool
              const toolResult = await this.executeTool(
                currentToolCall.name,
                currentToolCall.input
              );

              // Hook: After tool call
              await this.triggerHook('afterToolCall', {
                sessionId,
                turnNumber,
                timestamp: new Date().toISOString(),
                toolName: currentToolCall.name,
                toolInput: currentToolCall.input,
                toolOutput: toolResult,
              });

              // Hook: On artifact write (if tool writes artifact)
              if (this.isArtifactWriteTool(currentToolCall.name)) {
                await this.triggerHook('onArtifactWrite', {
                  sessionId,
                  turnNumber,
                  timestamp: new Date().toISOString(),
                  artifactPath: currentToolCall.input.path,
                  artifactContent: currentToolCall.input.content,
                  artifactType: this.getArtifactType(currentToolCall.input.path),
                });
              }

              currentToolCall = null;
            }
            break;

          case 'message_stop':
            // Hook: After turn
            await this.triggerHook('afterTurn', {
              sessionId,
              turnNumber,
              timestamp: new Date().toISOString(),
              assistantMessage,
              toolCalls,
              duration: Date.now() - startTime,
            });
            break;
        }
      }

      return { assistantMessage, toolCalls };

    } catch (err) {
      // Hook: On error
      await this.triggerHook('onError', {
        sessionId,
        turnNumber,
        timestamp: new Date().toISOString(),
        error: err,
      });
      
      throw err;
    }
  }

  private async executeTool(toolName: string, input: any): Promise<any> {
    // Tool execution logic
    return {};
  }

  private isArtifactWriteTool(toolName: string): boolean {
    return ['write_artifact', 'Write', 'StrReplace'].includes(toolName);
  }

  private getArtifactType(path: string): string {
    if (path.endsWith('.tf')) return 'terraform';
    if (path.endsWith('.yaml') || path.endsWith('.yml')) return 'dashboard';
    if (path.endsWith('.md')) return 'markdown';
    return 'unknown';
  }

  private getToolDefinitions(): any[] {
    // Return tool definitions
    return [];
  }
}
```

---

## Usage: Registering Hooks

### 1. **Checkpoint on Every Turn**

```typescript
// src/index.ts

const agentRunner = new AgentRunnerWithHooks();
const checkpointService = new CheckpointService();

// Hook: Checkpoint after every turn
agentRunner.on('afterTurn', async (ctx) => {
  console.log(`Turn ${ctx.turnNumber} complete, checkpointing...`);
  
  await checkpointService.saveCheckpoint(ctx.sessionId, {
    version: '1.0',
    sessionId: ctx.sessionId,
    timestamp: ctx.timestamp,
    context: await getSessionContext(ctx.sessionId),
    conversation: await getConversationHistory(ctx.sessionId),
    memory: await getAgentMemory(ctx.sessionId),
    toolState: {},
    checkpointNumber: ctx.turnNumber,
    reason: 'periodic',
  });
});
```

### 2. **Upload Artifacts to S3**

```typescript
// Hook: Upload artifacts to S3
agentRunner.on('onArtifactWrite', async (ctx: ArtifactContext) => {
  console.log(`Artifact written: ${ctx.artifactPath}`);
  
  const artifactStorage = new ArtifactStorageService();
  
  await artifactStorage.uploadArtifact(
    ctx.sessionId,
    ctx.artifactPath,
    ctx.artifactContent,
    {
      sessionId: ctx.sessionId,
      artifactType: ctx.artifactType,
      createdAt: ctx.timestamp,
    }
  );
  
  console.log(`Artifact uploaded to S3: ${ctx.artifactPath}`);
});
```

### 3. **Track Tool Usage**

```typescript
// Hook: Track tool usage analytics
agentRunner.on('afterToolCall', async (ctx: ToolCallContext) => {
  const analytics = new AnalyticsService();
  
  await analytics.trackToolUsage({
    sessionId: ctx.sessionId,
    toolName: ctx.toolName,
    timestamp: ctx.timestamp,
    success: ctx.toolOutput?.success ?? true,
    duration: ctx.metadata?.duration,
  });
});
```

### 4. **Monitor Token Usage**

```typescript
// Hook: Monitor token consumption
agentRunner.on('afterTurn', async (ctx) => {
  const tokenUsage = ctx.metadata?.tokenUsage;
  
  if (tokenUsage) {
    console.log(`Tokens used: ${tokenUsage.input_tokens} in, ${tokenUsage.output_tokens} out`);
    
    // Alert if approaching limit
    if (tokenUsage.output_tokens > 7000) {
      console.warn('Approaching token limit!');
    }
  }
});
```

### 5. **Error Recovery**

```typescript
// Hook: Save error checkpoint for recovery
agentRunner.on('onError', async (ctx) => {
  console.error(`Error in session ${ctx.sessionId}:`, ctx.error);
  
  // Save error checkpoint
  await checkpointService.saveCheckpoint(ctx.sessionId, {
    version: '1.0',
    sessionId: ctx.sessionId,
    timestamp: ctx.timestamp,
    context: await getSessionContext(ctx.sessionId),
    conversation: await getConversationHistory(ctx.sessionId),
    memory: await getAgentMemory(ctx.sessionId),
    toolState: {},
    checkpointNumber: ctx.turnNumber,
    reason: 'error',
  });
  
  // Send alert
  await alertService.sendAlert({
    type: 'agent_error',
    sessionId: ctx.sessionId,
    error: ctx.error.message,
  });
});
```

---

## Advanced: Tool Interceptor Pattern

### Intercept Specific Tools

```typescript
// src/services/tool-interceptor.ts

interface ToolInterceptor {
  toolName: string;
  before?: (input: any, ctx: HookContext) => Promise<any>;
  after?: (output: any, input: any, ctx: HookContext) => Promise<any>;
}

export class ToolInterceptorService {
  private interceptors: Map<string, ToolInterceptor> = new Map();

  register(interceptor: ToolInterceptor): void {
    this.interceptors.set(interceptor.toolName, interceptor);
  }

  async executeTool(
    toolName: string,
    input: any,
    ctx: HookContext
  ): Promise<any> {
    const interceptor = this.interceptors.get(toolName);

    // Before hook
    if (interceptor?.before) {
      input = await interceptor.before(input, ctx);
    }

    // Execute tool
    const output = await this.executeToolImpl(toolName, input);

    // After hook
    if (interceptor?.after) {
      await interceptor.after(output, input, ctx);
    }

    return output;
  }

  private async executeToolImpl(toolName: string, input: any): Promise<any> {
    // Actual tool execution
    return {};
  }
}
```

### Example: Intercept Write Tool

```typescript
// Intercept Write tool to upload to S3
const toolInterceptor = new ToolInterceptorService();

toolInterceptor.register({
  toolName: 'Write',
  after: async (output, input, ctx) => {
    // Upload to S3 after write
    const artifactStorage = new ArtifactStorageService();
    
    await artifactStorage.uploadArtifact(
      ctx.sessionId,
      input.path,
      input.contents,
      {
        sessionId: ctx.sessionId,
        artifactType: getArtifactType(input.path),
        createdAt: ctx.timestamp,
      }
    );
    
    console.log(`File ${input.path} written and uploaded to S3`);
  },
});
```

### Example: Intercept MCP Tool Calls

```typescript
// Intercept MCP tool calls to cache results
toolInterceptor.register({
  toolName: 'mcp__nest-api__invoke_operation',
  before: async (input, ctx) => {
    // Check cache
    const cached = await cache.get(`mcp:${input.operation}:${JSON.stringify(input.body)}`);
    if (cached) {
      console.log(`Cache hit for ${input.operation}`);
      return { ...input, _cached: true, _cachedResult: cached };
    }
    return input;
  },
  after: async (output, input, ctx) => {
    // Cache result
    if (!input._cached) {
      await cache.set(
        `mcp:${input.operation}:${JSON.stringify(input.body)}`,
        output,
        { ttl: 300 } // 5 minutes
      );
    }
  },
});
```

---

## Complete Integration Example

```typescript
// src/services/agent-service.ts

export class AgentService {
  private agentRunner: AgentRunnerWithHooks;
  private checkpointService: CheckpointService;
  private artifactStorage: ArtifactStorageService;
  private toolInterceptor: ToolInterceptorService;

  constructor() {
    this.agentRunner = new AgentRunnerWithHooks();
    this.checkpointService = new CheckpointService();
    this.artifactStorage = new ArtifactStorageService();
    this.toolInterceptor = new ToolInterceptorService();

    this.setupHooks();
    this.setupInterceptors();
  }

  private setupHooks(): void {
    // 1. Checkpoint after every turn
    this.agentRunner.on('afterTurn', async (ctx) => {
      if (ctx.turnNumber % 5 === 0) {
        await this.checkpointService.saveCheckpoint(ctx.sessionId, {
          version: '1.0',
          sessionId: ctx.sessionId,
          timestamp: ctx.timestamp,
          context: await this.getSessionContext(ctx.sessionId),
          conversation: await this.getConversationHistory(ctx.sessionId),
          memory: await this.getAgentMemory(ctx.sessionId),
          toolState: {},
          checkpointNumber: ctx.turnNumber,
          reason: 'periodic',
        });
      }
    });

    // 2. Upload artifacts to S3
    this.agentRunner.on('onArtifactWrite', async (ctx: ArtifactContext) => {
      await this.artifactStorage.uploadArtifact(
        ctx.sessionId,
        ctx.artifactPath,
        ctx.artifactContent,
        {
          sessionId: ctx.sessionId,
          artifactType: ctx.artifactType,
          createdAt: ctx.timestamp,
        }
      );
    });

    // 3. Track analytics
    this.agentRunner.on('afterToolCall', async (ctx: ToolCallContext) => {
      await this.trackToolUsage(ctx);
    });

    // 4. Error recovery
    this.agentRunner.on('onError', async (ctx) => {
      await this.handleError(ctx);
    });
  }

  private setupInterceptors(): void {
    // Intercept Write tool
    this.toolInterceptor.register({
      toolName: 'Write',
      after: async (output, input, ctx) => {
        await this.artifactStorage.uploadArtifact(
          ctx.sessionId,
          input.path,
          input.contents
        );
      },
    });

    // Intercept StrReplace tool
    this.toolInterceptor.register({
      toolName: 'StrReplace',
      after: async (output, input, ctx) => {
        // Read updated file and upload
        const content = await fs.promises.readFile(input.file_path, 'utf-8');
        await this.artifactStorage.uploadArtifact(
          ctx.sessionId,
          input.file_path,
          content
        );
      },
    });

    // Intercept MCP calls
    this.toolInterceptor.register({
      toolName: 'mcp__nest-api__invoke_operation',
      before: async (input, ctx) => {
        // Add session context
        return {
          ...input,
          headers: {
            'X-Session-Id': ctx.sessionId,
            'X-Turn-Number': ctx.turnNumber,
          },
        };
      },
    });
  }

  async runAgent(
    sessionId: string,
    userMessage: string
  ): Promise<AgentResponse> {
    const conversationHistory = await this.getConversationHistory(sessionId);
    const systemPrompt = await this.getSystemPrompt(sessionId);

    return await this.agentRunner.runAgent(
      sessionId,
      userMessage,
      conversationHistory,
      systemPrompt
    );
  }

  private async getSessionContext(sessionId: string): Promise<SessionContext> {
    // Implementation
    return {} as SessionContext;
  }

  private async getConversationHistory(sessionId: string): Promise<Message[]> {
    // Implementation
    return [];
  }

  private async getAgentMemory(sessionId: string): Promise<AgentMemory> {
    // Implementation
    return {} as AgentMemory;
  }

  private async getSystemPrompt(sessionId: string): Promise<string> {
    // Implementation
    return '';
  }

  private async trackToolUsage(ctx: ToolCallContext): Promise<void> {
    // Implementation
  }

  private async handleError(ctx: any): Promise<void> {
    // Implementation
  }
}
```

---

## Alternative: Proxy Pattern

### Wrap Claude SDK with Proxy

```typescript
// src/services/claude-proxy.ts

export class ClaudeProxy {
  private client: Anthropic;
  private hooks: Map<string, Array<Function>> = new Map();

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  on(event: string, handler: Function): void {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event)!.push(handler);
  }

  private async emit(event: string, data: any): Promise<void> {
    const handlers = this.hooks.get(event) || [];
    await Promise.all(handlers.map(h => h(data)));
  }

  async messages.create(params: any): Promise<any> {
    // Before request
    await this.emit('beforeRequest', { params });

    try {
      const response = await this.client.messages.create(params);

      // After request
      await this.emit('afterRequest', { params, response });

      return response;
    } catch (err) {
      // On error
      await this.emit('error', { params, error: err });
      throw err;
    }
  }
}

// Usage
const claude = new ClaudeProxy();

claude.on('beforeRequest', async ({ params }) => {
  console.log('Sending request to Claude...');
});

claude.on('afterRequest', async ({ response }) => {
  console.log('Response received:', response.usage);
});
```

---

## Monitoring & Observability

### 1. **Token Usage Tracking**

```typescript
agentRunner.on('afterTurn', async (ctx) => {
  const usage = ctx.metadata?.tokenUsage;
  
  // Log to monitoring service
  await monitoring.recordMetric('agent.tokens.input', usage.input_tokens);
  await monitoring.recordMetric('agent.tokens.output', usage.output_tokens);
  
  // Alert if high usage
  if (usage.output_tokens > 7000) {
    await alerting.send({
      type: 'high_token_usage',
      sessionId: ctx.sessionId,
      tokens: usage.output_tokens,
    });
  }
});
```

### 2. **Performance Tracking**

```typescript
agentRunner.on('afterTurn', async (ctx) => {
  await monitoring.recordMetric('agent.turn.duration', ctx.duration);
  await monitoring.recordMetric('agent.turn.tool_calls', ctx.toolCalls.length);
});
```

### 3. **Error Tracking**

```typescript
agentRunner.on('onError', async (ctx) => {
  await errorTracking.captureException(ctx.error, {
    sessionId: ctx.sessionId,
    turnNumber: ctx.turnNumber,
    context: ctx.metadata,
  });
});
```

---

## Testing

```typescript
// tests/agent-hooks.test.ts

describe('AgentRunnerWithHooks', () => {
  it('triggers beforeTurn hook', async () => {
    const agentRunner = new AgentRunnerWithHooks();
    const mockHook = jest.fn();
    
    agentRunner.on('beforeTurn', mockHook);
    
    await agentRunner.runAgent('session-1', 'Hello', [], 'System prompt');
    
    expect(mockHook).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'session-1',
        userMessage: 'Hello',
      })
    );
  });

  it('triggers onArtifactWrite hook', async () => {
    const agentRunner = new AgentRunnerWithHooks();
    const mockHook = jest.fn();
    
    agentRunner.on('onArtifactWrite', mockHook);
    
    // Simulate agent writing artifact
    await agentRunner.runAgent('session-1', 'Create a campaign', [], 'System prompt');
    
    expect(mockHook).toHaveBeenCalledWith(
      expect.objectContaining({
        artifactPath: expect.any(String),
        artifactContent: expect.any(String),
      })
    );
  });
});
```

---

## Summary

### What Claude SDK Provides

| Feature | Available | How |
|---------|-----------|-----|
| Streaming | ✅ | `stream: true` |
| Event types | ✅ | `message_start`, `content_block_*`, etc. |
| Tool use detection | ✅ | `content_block.type === 'tool_use'` |
| Token usage | ✅ | `event.usage` |
| **Lifecycle hooks** | ❌ | Not built-in |
| **Middleware** | ❌ | Not built-in |
| **Interceptors** | ❌ | Not built-in |

### What We Can Build

| Feature | Implementation | Effort |
|---------|---------------|--------|
| Turn lifecycle hooks | Wrapper class | 2 hours |
| Tool interceptors | Proxy pattern | 2 hours |
| Artifact tracking | Hook on tool calls | 1 hour |
| Checkpointing | Hook on afterTurn | 1 hour |
| Error recovery | Hook on error | 1 hour |
| Analytics | Hook on all events | 1 hour |

**Total: 8 hours to build complete hook system**

---

## Recommendation

**Build `AgentRunnerWithHooks` wrapper**

### Why:
1. ✅ **Full control** - Hook into any lifecycle event
2. ✅ **Flexible** - Add hooks as needed
3. ✅ **Testable** - Easy to mock and test
4. ✅ **Maintainable** - Clean separation of concerns
5. ✅ **Composable** - Combine multiple hooks

### Key Hooks to Implement:
- `beforeTurn` - Prepare context
- `afterTurn` - Checkpoint state
- `beforeToolCall` - Validate input
- `afterToolCall` - Track usage
- `onArtifactWrite` - Upload to S3
- `onError` - Error recovery

**This gives you complete control over the agent lifecycle!** 🎯
