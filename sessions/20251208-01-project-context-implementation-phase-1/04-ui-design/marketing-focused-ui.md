# Marketing-Focused UI (No Technical Jargon)

## Design Principle

**Marketers shouldn't see terraform, resources, or technical terms.**

They should see:
- ✅ Campaigns, audiences, emails
- ✅ Expected results and impact
- ✅ Simple "Launch Campaign" button
- ❌ NOT: terraform, resources, apply, state

---

## UI Flow

### 1. Session View (Agent Proposes Campaign)

```
┌─────────────────────────────────────────────────────────────┐
│  💬 VIP Campaign Planning                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Agent: Based on your workspace, I recommend a VIP early   │
│  access campaign targeting high-value customers...          │
│                                                             │
│  [Agent conversation with Q&A...]                           │
│                                                             │
│  Agent: Perfect! I've prepared your campaign. Here's what  │
│  I'll create when you're ready:                            │
│                                                             │
│  🎯 VIP Early Access Campaign                     [Ready]  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📊 Audience: VIP Customers                           │   │
│  │    1,200 contacts matching your criteria             │   │
│  │                                                      │   │
│  │ 📧 Emails: 2-email sequence                          │   │
│  │    • Welcome to VIP Program                          │   │
│  │    • Follow-up after 3 days                          │   │
│  │                                                      │   │
│  │ 📅 Launch: Dec 12 @ 10:00 AM                         │   │
│  │    A/B testing enabled                               │   │
│  │                                                      │   │
│  │ 💰 Expected: $15K-25K revenue                        │   │
│  │                                                      │   │
│  │ [Preview Campaign] [Launch Campaign]                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Campaign Preview (Marketing Details)

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 VIP Early Access Campaign Preview               [X]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 WHO: Your Audience                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ VIP Early Access Audience                            │   │
│  │ ~1,200 contacts                                      │   │
│  │                                                      │   │
│  │ Targeting customers who:                             │   │
│  │ ✓ Are VIP tier                                      │   │
│  │ ✓ Have engagement score above 75                    │   │
│  │ ✓ Were active in last 30 days                       │   │
│  │                                                      │   │
│  │ Holdout: 60 contacts (5%) for comparison            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  📧 WHAT: Your Emails                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Email 1: Welcome to VIP Program                      │   │
│  │ ├─ Subject: 🎁 You're Invited: VIP Early Access     │   │
│  │ ├─ Preview: You're first in line...                 │   │
│  │ ├─ A/B Test: 2 subject line variants                │   │
│  │ └─ Send: Dec 12 @ 10:00 AM                          │   │
│  │                                                      │   │
│  │ Email 2: How's Your Experience?                      │   │
│  │ ├─ Subject: We'd love your feedback                 │   │
│  │ ├─ Preview: Share your thoughts...                  │   │
│  │ └─ Send: 3 days after Email 1                       │   │
│  │                                                      │   │
│  │ [Preview Email 1] [Preview Email 2]                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  📅 WHEN: Campaign Timeline                                 │
│  • Launch: Dec 12, 2024 @ 10:00 AM ET                      │
│  • Duration: 3 days                                         │
│  • A/B test winner selected after 24 hours                 │
│                                                             │
│  💰 WHY: Expected Results                                   │
│  • Open rate: 35%+ (420+ contacts)                         │
│  • Click rate: 10%+ (120+ contacts)                        │
│  • Revenue impact: $15K-25K MRR                            │
│  • ROI: 4-5x campaign cost                                 │
│                                                             │
│  ⚠️  Ready to launch? This will:                           │
│  • Create the audience in your workspace                   │
│  • Set up the email templates                              │
│  • Schedule the campaign to start Dec 12                   │
│                                                             │
│  [Back] [Save Draft] [Launch Campaign]                      │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Launching (Progress Indicator)

```
┌─────────────────────────────────────────────────────────────┐
│  🚀 Launching Your Campaign...                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Creating audience: VIP Early Access                     │
│     1,245 contacts matched your criteria                    │
│                                                             │
│  ✅ Setting up email: Welcome to VIP Program                │
│     Template ready with A/B test variants                   │
│                                                             │
│  ✅ Setting up email: How's Your Experience?                │
│     Template ready for follow-up                            │
│                                                             │
│  ⏳ Scheduling campaign...                                  │
│     First email will send Dec 12 @ 10:00 AM                │
│                                                             │
│  Almost there...                                            │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Campaign Launched (Success)

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ Your Campaign is Live!                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎉 VIP Early Access Campaign                              │
│                                                             │
│  ✅ Audience: 1,245 VIP customers                           │
│  ✅ Emails: 2-email sequence ready                          │
│  ✅ Schedule: First email Dec 12 @ 10:00 AM                 │
│  ✅ Status: Scheduled                                       │
│                                                             │
│  📈 What Happens Next:                                      │
│  • Your first email will send automatically on Dec 12      │
│  • A/B test will run for 24 hours                          │
│  • Winner variant will be used for remaining sends         │
│  • I'll send you daily performance updates                 │
│                                                             │
│  📊 Track Performance:                                      │
│  • Real-time dashboard is ready                            │
│  • Daily digest emails enabled                             │
│  • Ask me anytime for updates                              │
│                                                             │
│  [View Campaign in Bird] [See Dashboard] [Ask Agent]        │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Performance Check (Next Session)

```
┌─────────────────────────────────────────────────────────────┐
│  💬 VIP Campaign Performance                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Agent: Your VIP campaign launched yesterday! Here's how   │
│  it's performing:                                           │
│                                                             │
│  📊 Performance Summary (Last 24 hours)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📧 Sent: 1,245 emails                                │   │
│  │ 📬 Opened: 473 (38%) 🟢 Above target (35%)           │   │
│  │ 👆 Clicked: 149 (12%) 🟢 Above target (10%)          │   │
│  │ 💰 Revenue: $18K 🟢 On track for $15-25K goal        │   │
│  │ 📈 Trend: Performance improving                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  🎯 A/B Test Results                                        │
│  Winner: "Exclusive Benefits" subject line                  │
│  • 42% open rate vs 34% for "Speed & Ease"                 │
│  • 15% higher click rate                                    │
│  • Now using winner for all future sends                    │
│                                                             │
│  💡 What You Should Do Next:                                │
│                                                             │
│  1. 🎯 Follow up with clickers (149 people)                │
│     They're engaged - time to convert!                      │
│     [Create Follow-up Campaign]                             │
│                                                             │
│  2. 🔄 Re-engage non-openers (772 people)                  │
│     Try different messaging or timing                       │
│     [Create Re-engagement Campaign]                         │
│                                                             │
│  3. 📈 Expand to similar segments                           │
│     You have 3,400 contacts with similar profiles          │
│     [Find Similar Audiences]                                │
│                                                             │
│  What would you like to work on?                            │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. Campaign Library (Project View)

```
┌─────────────────────────────────────────────────────────────┐
│  📁 Special Offers Project                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Your Campaigns:                                            │
│                                                             │
│  🟢 VIP Early Access                            [Active]   │
│  ├─ Launched: Dec 12, 2024                                 │
│  ├─ Audience: 1,245 VIP customers                          │
│  ├─ Performance: 38% open, 12% click 🟢                    │
│  ├─ Revenue: $18K (target: $15-25K)                        │
│  └─ [View Dashboard] [Optimize] [Pause]                    │
│                                                             │
│  ⚪ Holiday Promotion                        [Completed]   │
│  ├─ Ran: Nov 15 - Dec 1, 2024                             │
│  ├─ Audience: 5,200 customers                              │
│  ├─ Performance: 42% open, 15% click 🟢                    │
│  ├─ Revenue: $125K (target: $100K)                         │
│  └─ [View Results] [Replicate]                             │
│                                                             │
│  📝 Black Friday Sequence                       [Draft]    │
│  ├─ Created: Dec 5, 2024                                   │
│  ├─ Audience: 8,500 contacts                               │
│  ├─ Status: Ready to launch                                │
│  └─ [Preview] [Launch] [Edit]                              │
│                                                             │
│  [+ New Campaign] [View All]                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Key UI Principles

### ✅ DO Use Marketing Language

| Instead of... | Say... |
|---------------|--------|
| "terraform resource" | "campaign" |
| "apply changes" | "launch campaign" |
| "resource created" | "campaign is live" |
| "terraform plan" | "preview campaign" |
| "deployment" | "launch" |
| "artifact" | "campaign plan" |
| "state file" | (don't mention) |
| "resource ID" | (show in URL only) |

### ✅ DO Show Marketing Metrics

- Audience size and criteria
- Email subject lines and preview text
- Expected open/click rates
- Revenue impact
- A/B test details
- Campaign timeline

### ✅ DO Use Visual Indicators

- 🟢 Green for good performance
- 🟡 Yellow for needs attention
- 🔴 Red for issues
- ✅ Checkmarks for completed steps
- ⏳ Loading for in-progress
- 📊 📧 📅 💰 Icons for context

### ❌ DON'T Show Technical Details

- Terraform commands
- Resource types (bird_audience, bird_campaign)
- JSON/YAML syntax
- API endpoints
- Resource IDs (unless copying)
- Error stack traces

---

## Error Handling (Marketing-Friendly)

### ❌ Bad Error Message

```
Error: Failed to create resource bird_audience.vip_customers
│ 
│   on main.tf line 12, in resource "bird_audience" "vip_customers":
│   12: resource "bird_audience" "vip_customers" {
│ 
│ Provider returned status code 400: Invalid criteria
```

### ✅ Good Error Message

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  Couldn't Create Your Audience                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  There's an issue with your audience criteria:             │
│                                                             │
│  The field "customer_tier" doesn't exist in your workspace │
│                                                             │
│  💡 What to do:                                            │
│  • Check if you have a "customer_tier" field set up       │
│  • Or I can help you use a different field                │
│                                                             │
│  [Let Agent Fix It] [Choose Different Criteria]             │
└─────────────────────────────────────────────────────────────┘
```

---

## Behind the Scenes (Hidden from User)

While user sees marketing UI, backend does:

```typescript
// User clicks "Launch Campaign"
async function launchCampaign(campaignPlan) {
  // Show: "🚀 Launching Your Campaign..."
  
  // Behind scenes: Run terraform
  const terraformPath = `sessions/${sessionId}/artifacts/terraform`;
  
  // Show: "✅ Creating audience: VIP Early Access"
  await exec('terraform apply -auto-approve', { cwd: terraformPath });
  
  // Show: "✅ Setting up email: Welcome to VIP Program"
  // (terraform creates template)
  
  // Show: "✅ Scheduling campaign..."
  // (terraform creates campaign)
  
  // Show: "✅ Your Campaign is Live!"
  return {
    status: 'launched',
    audienceSize: 1245,
    campaignId: 'cmp-789',  // From terraform output
    scheduledFor: '2024-12-12T10:00:00Z'
  };
}
```

**User never sees**: terraform, apply, resources, state
**User only sees**: Progress, results, next steps

---

## Mobile-Friendly Considerations

### Campaign Card (Mobile)

```
┌─────────────────────────────┐
│ 🎯 VIP Early Access         │
│                      [Active]│
├─────────────────────────────┤
│ 📊 1,245 customers          │
│ 📧 2 emails                 │
│ 📅 Dec 12 @ 10:00 AM        │
│                             │
│ Performance:                │
│ Opens: 38% 🟢              │
│ Clicks: 12% 🟢             │
│ Revenue: $18K 🟢           │
│                             │
│ [View] [Optimize]           │
└─────────────────────────────┘
```

### Quick Actions

```
┌─────────────────────────────┐
│ Quick Actions               │
├─────────────────────────────┤
│ 📊 View Performance         │
│ 🎯 Create Follow-up         │
│ ⏸️  Pause Campaign          │
│ 📈 View Dashboard           │
│ 💬 Ask Agent                │
└─────────────────────────────┘
```

---

## Summary

**Marketing-focused UI hides technical complexity:**

✅ **User sees**: Campaigns, audiences, emails, results
✅ **User actions**: Preview, Launch, View, Optimize
✅ **User gets**: Performance data, recommendations, next steps

❌ **User never sees**: Terraform, resources, state, technical errors
❌ **User never does**: Run commands, edit configs, debug

**Backend handles all technical details transparently.**
