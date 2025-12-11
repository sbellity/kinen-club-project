# Architecture

Technical architecture and design patterns.

## Documents

### [`acp-integration.md`](./acp-integration.md) ⭐ **RECOMMENDED**
**Agent Client Protocol integration**

- Why ACP over direct Claude SDK
- Complete ACP message flow
- Implementation guide with code examples
- ACPClient and ACPSessionService design
- Benefits and comparison

**Read this if**: You're implementing the backend

---

### [`living-documents.md`](./living-documents.md)
**Real-time data hydration**

- Concept: Documents with embedded Malloy queries
- How queries execute on read
- Harness intercept mechanism
- Foundation and dashboard examples
- Benefits and trade-offs

**Read this if**: You need to understand data freshness

---

### [`dashboard-design.md`](./dashboard-design.md)
**Dashboard as living document**

- Dashboard as YAML (not Bird resource)
- Malloy queries for metrics
- Hydration on read
- Frontend rendering with notebook renderer
- Digest generation

**Read this if**: You're implementing dashboards

---

### [`terraform-deployment.md`](./terraform-deployment.md)
**Campaign deployment strategy**

- Agent generates `.tf` files
- User reviews plan
- User deploys via terraform
- State management
- Resource tracking

**Read this if**: You're implementing deployment

---

### [`session-lifecycle.md`](./session-lifecycle.md)
**Session checkpointing and resumption**

- What gets checkpointed
- S3 checkpoint structure
- Resume flow
- Automatic checkpointing triggers
- Conversation branching

**Read this if**: You're implementing session management

---

## Implementation Order

1. **Start**: `acp-integration.md` - Core communication
2. **Then**: `session-lifecycle.md` - Session management
3. **Then**: `living-documents.md` - Data hydration
4. **Then**: `terraform-deployment.md` - Deployment
5. **Finally**: `dashboard-design.md` - Dashboards

---

## Quick Links

- **Backend Developers**: Start with `acp-integration.md`
- **Data Engineers**: Focus on `living-documents.md`
- **DevOps**: Focus on `terraform-deployment.md`
