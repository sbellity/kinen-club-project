# S3 Artifact Storage Strategy

## Problem Statement

**Current**: Session artifacts stored in Docker mounted volume
- ✅ Simple, fast local access
- ❌ Not persistent across container restarts
- ❌ Not accessible from other services
- ❌ No backup/versioning
- ❌ Limited to single instance

**Goal**: Use S3 for durable, distributed artifact storage

---

## Architecture Options

### Option 1: S3 Only (Recommended)

**All artifacts in S3, no local storage**

```
Agent writes artifact
    ↓
Backend uploads to S3
    ↓
S3: s3://bird-agent-artifacts/
    └── sessions/
        └── {sessionId}/
            ├── metadata.json
            ├── artifacts/
            │   ├── campaign-001.tf
            │   ├── dashboard.yaml
            │   └── email-template.html
            └── logs/
                └── agent.log
```

**Pros**:
- Durable (99.999999999% durability)
- Accessible from anywhere
- Versioning built-in
- No local disk management
- Multi-instance ready

**Cons**:
- Network latency for reads/writes
- S3 costs (minimal for artifacts)
- Requires AWS credentials

---

### Option 2: Hybrid (Local + S3)

**Write locally, sync to S3 asynchronously**

```
Agent writes artifact
    ↓
Local: /sessions/{sessionId}/artifacts/
    ↓ (async background sync)
S3: s3://bird-agent-artifacts/sessions/{sessionId}/
```

**Pros**:
- Fast local access during session
- Durable backup in S3
- Best of both worlds

**Cons**:
- More complex
- Sync delays
- Potential inconsistency

---

### Option 3: S3 with Local Cache

**Read from S3, cache locally, write to both**

```
Read request
    ↓
Check local cache
    ↓ (miss)
Fetch from S3
    ↓
Cache locally
    ↓
Return to agent

Write request
    ↓
Write to local cache
    ↓ (parallel)
Upload to S3
```

**Pros**:
- Fast reads (cached)
- Durable writes (S3)
- Cache invalidation control

**Cons**:
- Most complex
- Cache management overhead

---

## Recommended: Option 1 (S3 Only)

**Why**:
1. **Simplicity** - Single source of truth
2. **Durability** - Never lose artifacts
3. **Scalability** - Multi-instance ready
4. **Versioning** - Built-in with S3
5. **Performance** - S3 latency acceptable for artifacts

**When to use hybrid**: If agent reads/writes artifacts frequently during session (e.g., iterative refinement)

---

## Implementation Design

### 1. S3 Bucket Structure

```
s3://bird-agent-artifacts/
├── sessions/
│   └── {sessionId}/
│       ├── metadata.json              # Session info
│       ├── artifacts/
│       │   ├── terraform/
│       │   │   ├── main.tf
│       │   │   ├── variables.tf
│       │   │   └── README.md
│       │   ├── dashboard.yaml         # Living document
│       │   ├── foundation.md          # Living document
│       │   └── email-templates/
│       │       └── welcome.html
│       └── logs/
│           └── agent-{timestamp}.log
├── projects/
│   └── {projectId}/
│       ├── foundation.md              # Project foundation
│       ├── dashboard.yaml             # Project dashboard
│       └── learnings/
│           └── {date}-learning.md
└── templates/
    ├── foundation-template.md
    └── dashboard-template.yaml
```

### 2. Service Architecture

```typescript
// src/services/artifact-storage.ts

import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

interface ArtifactMetadata {
  sessionId: string;
  projectId?: string;
  artifactType: 'terraform' | 'dashboard' | 'foundation' | 'template' | 'log';
  createdAt: string;
  version?: number;
}

export class ArtifactStorageService {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucket = process.env.ARTIFACT_BUCKET || 'bird-agent-artifacts';
  }

  /**
   * Upload artifact to S3
   */
  async uploadArtifact(
    sessionId: string,
    path: string,
    content: string | Buffer,
    metadata?: ArtifactMetadata
  ): Promise<string> {
    const key = `sessions/${sessionId}/${path}`;
    
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: content,
      ContentType: this.getContentType(path),
      Metadata: metadata ? this.serializeMetadata(metadata) : undefined,
    }));

    return `s3://${this.bucket}/${key}`;
  }

  /**
   * Download artifact from S3
   */
  async downloadArtifact(sessionId: string, path: string): Promise<string> {
    const key = `sessions/${sessionId}/${path}`;
    
    const response = await this.s3.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));

    return await this.streamToString(response.Body as Readable);
  }

  /**
   * List artifacts for session
   */
  async listArtifacts(sessionId: string, prefix?: string): Promise<string[]> {
    const listPrefix = prefix 
      ? `sessions/${sessionId}/${prefix}`
      : `sessions/${sessionId}/`;

    const response = await this.s3.send(new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: listPrefix,
    }));

    return response.Contents?.map(obj => obj.Key!) || [];
  }

  /**
   * Delete artifact from S3
   */
  async deleteArtifact(sessionId: string, path: string): Promise<void> {
    const key = `sessions/${sessionId}/${path}`;
    
    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }

  /**
   * Get signed URL for direct access (e.g., for frontend)
   */
  async getSignedUrl(sessionId: string, path: string, expiresIn = 3600): Promise<string> {
    const key = `sessions/${sessionId}/${path}`;
    
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3, command, { expiresIn });
  }

  // Helper methods
  private getContentType(path: string): string {
    if (path.endsWith('.tf')) return 'text/plain';
    if (path.endsWith('.yaml') || path.endsWith('.yml')) return 'application/yaml';
    if (path.endsWith('.md')) return 'text/markdown';
    if (path.endsWith('.json')) return 'application/json';
    if (path.endsWith('.html')) return 'text/html';
    return 'application/octet-stream';
  }

  private serializeMetadata(metadata: ArtifactMetadata): Record<string, string> {
    return Object.entries(metadata).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>);
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

### 3. Integration with Session Service

```typescript
// src/services/session.ts (updated)

import { ArtifactStorageService } from './artifact-storage';

export class SessionService {
  private artifactStorage: ArtifactStorageService;

  constructor() {
    this.artifactStorage = new ArtifactStorageService();
  }

  async createSession(workspaceId: string, projectId?: string): Promise<Session> {
    const sessionId = generateId();
    
    // Create session metadata in S3
    await this.artifactStorage.uploadArtifact(
      sessionId,
      'metadata.json',
      JSON.stringify({
        sessionId,
        workspaceId,
        projectId,
        createdAt: new Date().toISOString(),
      })
    );

    // Create session directory structure
    await this.createSessionStructure(sessionId);

    return { sessionId, workspaceId, projectId };
  }

  private async createSessionStructure(sessionId: string): Promise<void> {
    // Create placeholder files to establish directory structure
    const placeholders = [
      'artifacts/.gitkeep',
      'artifacts/terraform/.gitkeep',
      'logs/.gitkeep',
    ];

    await Promise.all(
      placeholders.map(path =>
        this.artifactStorage.uploadArtifact(sessionId, path, '')
      )
    );
  }

  async saveArtifact(
    sessionId: string,
    artifactPath: string,
    content: string
  ): Promise<string> {
    return await this.artifactStorage.uploadArtifact(
      sessionId,
      `artifacts/${artifactPath}`,
      content
    );
  }

  async getArtifact(sessionId: string, artifactPath: string): Promise<string> {
    return await this.artifactStorage.downloadArtifact(
      sessionId,
      `artifacts/${artifactPath}`
    );
  }

  async listArtifacts(sessionId: string): Promise<string[]> {
    return await this.artifactStorage.listArtifacts(sessionId, 'artifacts/');
  }
}
```

### 4. Agent Integration

**Agent writes artifacts via MCP tool**:

```typescript
// src/mcp/tools/write-artifact.ts

export const writeArtifactTool = {
  name: 'write_artifact',
  description: 'Write artifact to session storage (S3)',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Artifact path (e.g., terraform/main.tf)' },
      content: { type: 'string', description: 'Artifact content' },
      metadata: { 
        type: 'object',
        description: 'Optional metadata',
        properties: {
          artifactType: { type: 'string' },
          version: { type: 'number' },
        },
      },
    },
    required: ['path', 'content'],
  },
};

export async function handleWriteArtifact(
  sessionId: string,
  args: { path: string; content: string; metadata?: ArtifactMetadata }
): Promise<{ success: boolean; s3Uri: string }> {
  const storage = new ArtifactStorageService();
  
  const s3Uri = await storage.uploadArtifact(
    sessionId,
    args.path,
    args.content,
    args.metadata
  );

  return { success: true, s3Uri };
}
```

**Agent reads artifacts**:

```typescript
// src/mcp/tools/read-artifact.ts

export const readArtifactTool = {
  name: 'read_artifact',
  description: 'Read artifact from session storage (S3)',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Artifact path' },
    },
    required: ['path'],
  },
};

export async function handleReadArtifact(
  sessionId: string,
  args: { path: string }
): Promise<{ content: string }> {
  const storage = new ArtifactStorageService();
  
  const content = await storage.downloadArtifact(sessionId, args.path);

  return { content };
}
```

---

## Environment Configuration

```bash
# .env

# S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
ARTIFACT_BUCKET=bird-agent-artifacts

# Optional: Use local S3 (MinIO) for development
S3_ENDPOINT=http://localhost:9000  # MinIO endpoint
S3_FORCE_PATH_STYLE=true           # For MinIO compatibility
```

---

## Docker Compose Updates

```yaml
# docker-compose.yml

services:
  llmchain:
    image: llmchain:latest
    environment:
      - AWS_REGION=${AWS_REGION}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - ARTIFACT_BUCKET=${ARTIFACT_BUCKET}
    # No volume mount needed for artifacts!
    # volumes:
    #   - ./sessions:/app/sessions  # ❌ Remove this

  # Optional: Local S3 for development
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio-data:/data

volumes:
  minio-data:
```

---

## S3 Bucket Configuration

### Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAgentAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/llmchain-agent-role"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::bird-agent-artifacts/*",
        "arn:aws:s3:::bird-agent-artifacts"
      ]
    }
  ]
}
```

### Lifecycle Policy

```json
{
  "Rules": [
    {
      "Id": "DeleteOldLogs",
      "Status": "Enabled",
      "Prefix": "sessions/*/logs/",
      "Expiration": {
        "Days": 30
      }
    },
    {
      "Id": "ArchiveOldSessions",
      "Status": "Enabled",
      "Prefix": "sessions/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

### Versioning

```bash
# Enable versioning for artifact history
aws s3api put-bucket-versioning \
  --bucket bird-agent-artifacts \
  --versioning-configuration Status=Enabled
```

---

## Hybrid Approach (If Needed)

**Use case**: Agent iterates on artifacts during session, needs fast local access

```typescript
// src/services/hybrid-storage.ts

export class HybridStorageService {
  private s3: ArtifactStorageService;
  private localPath: string;

  constructor() {
    this.s3 = new ArtifactStorageService();
    this.localPath = process.env.LOCAL_ARTIFACT_PATH || '/tmp/artifacts';
  }

  /**
   * Write to local, sync to S3 in background
   */
  async writeArtifact(sessionId: string, path: string, content: string): Promise<void> {
    // Write locally first (fast)
    const localFile = `${this.localPath}/${sessionId}/${path}`;
    await fs.promises.mkdir(dirname(localFile), { recursive: true });
    await fs.promises.writeFile(localFile, content);

    // Sync to S3 asynchronously (don't await)
    this.syncToS3(sessionId, path, content).catch(err => {
      console.error('S3 sync failed:', err);
      // Could retry or queue for later
    });
  }

  /**
   * Read from local cache, fallback to S3
   */
  async readArtifact(sessionId: string, path: string): Promise<string> {
    const localFile = `${this.localPath}/${sessionId}/${path}`;
    
    // Try local first
    try {
      return await fs.promises.readFile(localFile, 'utf-8');
    } catch (err) {
      // Fallback to S3
      const content = await this.s3.downloadArtifact(sessionId, path);
      
      // Cache locally for next time
      await fs.promises.mkdir(dirname(localFile), { recursive: true });
      await fs.promises.writeFile(localFile, content);
      
      return content;
    }
  }

  /**
   * Background sync to S3
   */
  private async syncToS3(sessionId: string, path: string, content: string): Promise<void> {
    await this.s3.uploadArtifact(sessionId, path, content);
  }

  /**
   * Sync entire session to S3 (call at session end)
   */
  async syncSession(sessionId: string): Promise<void> {
    const localDir = `${this.localPath}/${sessionId}`;
    const files = await this.getAllFiles(localDir);

    await Promise.all(
      files.map(async file => {
        const relativePath = file.replace(`${localDir}/`, '');
        const content = await fs.promises.readFile(file, 'utf-8');
        await this.s3.uploadArtifact(sessionId, relativePath, content);
      })
    );
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(entry => {
        const path = `${dir}/${entry.name}`;
        return entry.isDirectory() ? this.getAllFiles(path) : path;
      })
    );
    return files.flat();
  }
}
```

---

## Migration Strategy

### Phase 1: Add S3 Support (Backward Compatible)

```typescript
// Support both local and S3
const storage = process.env.USE_S3 === 'true'
  ? new ArtifactStorageService()
  : new LocalStorageService();
```

### Phase 2: Migrate Existing Sessions

```typescript
// scripts/migrate-to-s3.ts

async function migrateToS3() {
  const localStorage = new LocalStorageService();
  const s3Storage = new ArtifactStorageService();

  const sessions = await localStorage.listSessions();

  for (const sessionId of sessions) {
    console.log(`Migrating session ${sessionId}...`);
    
    const artifacts = await localStorage.listArtifacts(sessionId);
    
    for (const artifactPath of artifacts) {
      const content = await localStorage.readArtifact(sessionId, artifactPath);
      await s3Storage.uploadArtifact(sessionId, artifactPath, content);
    }
  }

  console.log('Migration complete!');
}
```

### Phase 3: Remove Local Storage

```typescript
// Remove local storage code
// Update docker-compose.yml (remove volume mount)
// Update environment variables
```

---

## Cost Estimation

### S3 Storage Costs

**Assumptions**:
- 1,000 sessions/month
- 10 artifacts/session
- 50 KB/artifact average
- Total: 500 MB/month

**Costs**:
- Storage: $0.023/GB = $0.01/month
- PUT requests: 10,000 × $0.005/1000 = $0.05/month
- GET requests: 50,000 × $0.0004/1000 = $0.02/month

**Total: ~$0.08/month** (negligible!)

### Comparison

| Storage | Cost/Month | Durability | Multi-Instance | Backup |
|---------|-----------|------------|----------------|--------|
| Local Volume | $0 | Low | No | Manual |
| S3 Standard | $0.08 | 99.999999999% | Yes | Built-in |
| S3 IA | $0.03 | 99.999999999% | Yes | Built-in |

**Recommendation**: Use S3 Standard, incredibly cheap for this use case

---

## Testing

### Unit Tests

```typescript
// src/services/artifact-storage.test.ts

describe('ArtifactStorageService', () => {
  let storage: ArtifactStorageService;
  let mockS3: jest.Mocked<S3Client>;

  beforeEach(() => {
    mockS3 = {
      send: jest.fn(),
    } as any;
    storage = new ArtifactStorageService();
    (storage as any).s3 = mockS3;
  });

  it('uploads artifact to S3', async () => {
    mockS3.send.mockResolvedValue({});

    const uri = await storage.uploadArtifact(
      'session-123',
      'terraform/main.tf',
      'resource "aws_s3_bucket" "example" {}'
    );

    expect(uri).toBe('s3://bird-agent-artifacts/sessions/session-123/terraform/main.tf');
    expect(mockS3.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: 'bird-agent-artifacts',
          Key: 'sessions/session-123/terraform/main.tf',
        }),
      })
    );
  });

  it('downloads artifact from S3', async () => {
    const mockStream = Readable.from(['test content']);
    mockS3.send.mockResolvedValue({ Body: mockStream });

    const content = await storage.downloadArtifact('session-123', 'terraform/main.tf');

    expect(content).toBe('test content');
  });
});
```

### Integration Tests

```typescript
// tests/integration/s3-storage.test.ts

describe('S3 Storage Integration', () => {
  it('writes and reads artifact', async () => {
    const storage = new ArtifactStorageService();
    const sessionId = `test-${Date.now()}`;
    const content = 'test artifact content';

    // Write
    await storage.uploadArtifact(sessionId, 'test.txt', content);

    // Read
    const retrieved = await storage.downloadArtifact(sessionId, 'test.txt');
    expect(retrieved).toBe(content);

    // Cleanup
    await storage.deleteArtifact(sessionId, 'test.txt');
  });
});
```

---

## Monitoring & Observability

### CloudWatch Metrics

```typescript
// src/services/artifact-storage.ts (enhanced)

import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

export class ArtifactStorageService {
  private cloudwatch: CloudWatchClient;

  async uploadArtifact(...args): Promise<string> {
    const startTime = Date.now();
    
    try {
      const result = await this.s3.send(...);
      
      // Record success metric
      await this.recordMetric('ArtifactUploadSuccess', 1);
      await this.recordMetric('ArtifactUploadLatency', Date.now() - startTime);
      
      return result;
    } catch (err) {
      // Record failure metric
      await this.recordMetric('ArtifactUploadFailure', 1);
      throw err;
    }
  }

  private async recordMetric(name: string, value: number): Promise<void> {
    await this.cloudwatch.send(new PutMetricDataCommand({
      Namespace: 'LLMChain/Artifacts',
      MetricData: [{
        MetricName: name,
        Value: value,
        Unit: name.includes('Latency') ? 'Milliseconds' : 'Count',
        Timestamp: new Date(),
      }],
    }));
  }
}
```

### Logging

```typescript
// Add structured logging
import { logger } from './logger';

async uploadArtifact(...): Promise<string> {
  logger.info('Uploading artifact', {
    sessionId,
    path,
    size: content.length,
  });

  try {
    const uri = await this.s3.send(...);
    
    logger.info('Artifact uploaded', {
      sessionId,
      path,
      uri,
      duration: Date.now() - startTime,
    });
    
    return uri;
  } catch (err) {
    logger.error('Artifact upload failed', {
      sessionId,
      path,
      error: err.message,
    });
    throw err;
  }
}
```

---

## Security Considerations

### 1. **IAM Permissions** (Principle of Least Privilege)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::bird-agent-artifacts/sessions/${aws:userid}/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::bird-agent-artifacts",
      "Condition": {
        "StringLike": {
          "s3:prefix": "sessions/${aws:userid}/*"
        }
      }
    }
  ]
}
```

### 2. **Encryption at Rest**

```typescript
await this.s3.send(new PutObjectCommand({
  Bucket: this.bucket,
  Key: key,
  Body: content,
  ServerSideEncryption: 'AES256',  // or 'aws:kms' for KMS
}));
```

### 3. **Encryption in Transit**

```typescript
// Always use HTTPS
const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: 'https://s3.amazonaws.com',  // Explicit HTTPS
});
```

### 4. **Access Logging**

```bash
# Enable S3 access logging
aws s3api put-bucket-logging \
  --bucket bird-agent-artifacts \
  --bucket-logging-status '{
    "LoggingEnabled": {
      "TargetBucket": "bird-agent-logs",
      "TargetPrefix": "s3-access/"
    }
  }'
```

---

## Recommendation

**Use Option 1: S3 Only**

### Why:
1. ✅ **Simplest** - Single source of truth
2. ✅ **Most durable** - 99.999999999% durability
3. ✅ **Cheapest** - ~$0.08/month
4. ✅ **Scalable** - Multi-instance ready
5. ✅ **Versioning** - Built-in history
6. ✅ **No disk management** - No volume mounts

### When to use Hybrid:
- Agent writes/reads artifacts **frequently** during session (>100 ops)
- Latency is critical (<10ms required)
- Network is unreliable

**For most use cases, S3-only is perfect!**

---

## Implementation Checklist

- [ ] Create S3 bucket (`bird-agent-artifacts`)
- [ ] Configure bucket policy (IAM permissions)
- [ ] Enable versioning
- [ ] Set lifecycle policy (archive old sessions)
- [ ] Implement `ArtifactStorageService`
- [ ] Update `SessionService` to use S3
- [ ] Add MCP tools (`write_artifact`, `read_artifact`)
- [ ] Update agent prompt (artifact storage instructions)
- [ ] Remove volume mount from docker-compose
- [ ] Add environment variables (AWS credentials)
- [ ] Write tests (unit + integration)
- [ ] Set up monitoring (CloudWatch metrics)
- [ ] Document for team

**Estimated time: 4 hours**
