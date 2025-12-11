# Reference Materials

> Supporting documentation and frameworks

---

## 📚 Contents

### [`skills-framework.md`](./skills-framework.md)
**Modular skills approach inspired by awesome-claude-skills**

Key concepts:
- Modular skill structure
- Dynamic skill loading
- Skill categories and composition
- Consistent skill format
- Testing strategies

**Use this for**: Understanding how to structure and compose skills

---

## 🎯 Frameworks & Methodologies

### Marketing Frameworks

#### 5S Digital Marketing Model
```
Sell   - Drive revenue (conversions, purchases, upsells)
Serve  - Retain customers (loyalty, satisfaction, reduce churn)
Speak  - Build awareness (multi-channel presence, brand messaging)
Save   - Improve efficiency (segmentation, automation, cost optimization)
Sizzle - Differentiate (engagement, memorable experiences)
```

#### AIDA Model
```
Attention  - Capture interest
Interest   - Build curiosity
Desire     - Create want
Action     - Drive conversion
```

#### Customer Lifecycle
```
Acquisition → Activation → Retention → Revenue → Referral
```

---

## 📊 Benchmarks

### Email Marketing
```yaml
B2B:
  open_rate: 20-25%
  click_rate: 3-5%
  conversion: 2-4%

B2C:
  open_rate: 15-20%
  click_rate: 2-3%
  conversion: 1-2%

E-commerce:
  open_rate: 15-18%
  click_rate: 2-3%
  conversion: 1-3%
```

### SMS Marketing
```yaml
All Verticals:
  delivery_rate: 95%+
  open_rate: 90%+
  click_rate: 5-10%
  conversion: 2-5%
```

---

## 🔧 Technical Patterns

### Living Documents
Documents with embedded queries that hydrate on read:

```markdown
# Foundation Document

## Customer Base

Total Contacts: {{malloy: SELECT COUNT(*) FROM contacts}}

## Recent Performance

{{malloy:
  SELECT
    campaign_name,
    sent_count,
    open_rate,
    click_rate
  FROM campaigns
  WHERE sent_at > now() - interval '30 days'
  ORDER BY sent_at DESC
  LIMIT 5
}}
```

### Terraform Patterns
Standard structure for Bird resources:

```hcl
# audience.tf
resource "bird_audience" "high_value_customers" {
  name = "High Value Customers"
  entity_type = "contact"
  
  query = {
    operator = "and"
    children = [
      {
        field = "lifetime_value"
        operator = "gte"
        value = 1000
      }
    ]
  }
}

# template.tf
resource "bird_template" "welcome_email" {
  name = "Welcome Email"
  supported_platforms = ["email"]
  
  generic_content = [{
    locale = "en"
    subject = "Welcome to {{company_name}}!"
    body = file("${path.module}/templates/welcome.html")
  }]
}

# campaign.tf
resource "bird_campaign" "welcome_campaign" {
  name = "Welcome Campaign"
  type = "broadcast"
  
  audience_id = bird_audience.high_value_customers.id
  template_id = bird_template.welcome_email.id
  
  schedule = {
    send_at = "2024-12-10T10:00:00Z"
  }
}
```

---

## 🎨 Design Patterns

### Agent Collaboration
```
Research Analyst → Strategist
  Handoff: foundation.md, data-model.md
  
Strategist → Audience Architect + Creative Director
  Handoff: strategic-brief.md, brand-guidelines.md
  
Audience Architect + Creative Director → Campaign Engineer
  Handoff: audience.tf, template.tf
  
Campaign Engineer → Performance Analyst
  Handoff: Deployed campaign, dashboard requirements
```

### Skill Composition
```yaml
# cart-recovery skill depends on:
dependencies:
  - bird-audience-creation  # Required
  - bird-template-management # Required
  - product-recommendations  # Optional

# When agent uses cart-recovery:
# 1. System ensures dependencies available
# 2. Agent prompt includes all dependent skill prompts
# 3. Agent can call dependent skills
```

---

## 📖 External References

### Bird Platform
- [Bird API Documentation](https://bird.com/docs)
- [Malloy Query Language](https://malloydata.github.io/documentation/)
- [Bird Terraform Provider](https://registry.terraform.io/providers/bird/bird)

### Agent Development
- [Agent Client Protocol](https://agentclientprotocol.com)
- [Anthropic Skills Spec](https://github.com/VoltAgent/awesome-claude-skills)
- [Model Context Protocol](https://modelcontextprotocol.io)

### Marketing
- [5S Digital Marketing](https://www.smartinsights.com/digital-marketing-strategy/)
- [AIDA Model](https://en.wikipedia.org/wiki/AIDA_(marketing))
- [Customer Lifecycle](https://www.optimove.com/resources/learning-center/customer-lifecycle)

---

## 🔍 Glossary

### Terms

**Agent** - Specialized AI assistant with specific role and responsibilities

**Skill** - Modular capability that can be loaded dynamically

**Deliverable** - Specific output produced by an agent (file, document, config)

**Living Document** - Document with embedded queries that hydrate with live data

**Terraform** - Infrastructure-as-code tool for managing Bird resources

**MCP** - Model Context Protocol for tool access

**ACP** - Agent Client Protocol for agent communication

**Bird Tasks API** - Project and session management

**Bird Content API** - Knowledgebase document storage

**DataHub** - Bird's data warehouse (Malloy queries)

---

## Next Steps

1. **Review skills-framework.md** - Understand modular approach
2. **Study frameworks** - 5S, AIDA, Customer Lifecycle
3. **Reference benchmarks** - Set realistic targets
4. **Apply patterns** - Use proven approaches
