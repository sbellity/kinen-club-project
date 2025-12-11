import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Check, X, Mail, Zap, Users, Eye, AlertTriangle, CheckCircle, Loader, Play, ArrowLeft, Smartphone, Monitor, Type, MousePointer, BarChart3, Trash2, Plus, Split, GripVertical, List, Heading1, Quote, ShieldCheck, Star, DollarSign, Pause, TrendingUp, Clock, Inbox, LayoutTemplate, Award, Target, Database, Palette, Shield, Copy, Laptop, TestTube, GitBranch, Sliders, Search, FastForward, Ban, Flag, Activity, ChevronRight, Settings, StopCircle, Megaphone, RefreshCw, ExternalLink } from 'lucide-react';

export default function BirdEmailPlatform() {
  const [view, setView] = useState('home');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStage, setBuildStage] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [editingBlock, setEditingBlock] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [previewClient, setPreviewClient] = useState('gmail');
  const [activeTab, setActiveTab] = useState('design');
  const [rightTab, setRightTab] = useState('settings');
  const [activeModal, setActiveModal] = useState(null);
  const [spamScore, setSpamScore] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [testSent, setTestSent] = useState(false);
  const [liveStats, setLiveStats] = useState(null);
  const [aiActions, setAiActions] = useState([]);
  const [editingSubject, setEditingSubject] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [addBlockIdx, setAddBlockIdx] = useState(null);
  const [complianceChecks, setComplianceChecks] = useState({ gdpr: true, canspam: true, unsub: true, address: true, consent: false });
  const [audienceView, setAudienceView] = useState('recipients');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveTab, setLiveTab] = useState('stats');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const messagesEndRef = useRef(null);

  // Journey Rules State
  const [rules, setRules] = useState({
    goal: 'Re-activate churned customers',
    successMetric: 'Login or Purchase',
    maxEmails: 4,
    timeframeDays: 14,
    minGapDays: 2,
    channels: { email: true, sms: false, push: false },
    smsCondition: 'If 2 emails unopened',
    maxPerWeek: 2,
    quietHoursStart: '21:00',
    quietHoursEnd: '08:00',
    noWeekends: false,
    exitConditions: { converts: true, unsubscribes: true, replies: true, noEngagement: false },
    aiAutonomy: { optimizeTiming: true, pickWinners: true, adjustPacing: true, switchChannels: false },
    adCoordination: { meta: true, google: true, linkedin: false, syncFrequency: 'hourly', suppressOnConvert: true, suppressAfterEmail: true, pauseOnHighEngagement: false }
  });

  // Ad Audiences State
  const [adAudiences] = useState([
    { id: 1, name: 'Non-openers', size: 1203, platforms: ['meta', 'google'], lastSync: '12 min ago', status: 'synced' },
    { id: 2, name: 'High-intent', size: 847, platforms: ['meta', 'linkedin'], lastSync: '12 min ago', status: 'synced' },
    { id: 3, name: 'Converters (suppress)', size: 23, platforms: ['meta', 'google'], lastSync: '12 min ago', status: 'synced' },
  ]);

  const mergeFields = [
    { key: 'firstName', label: 'First Name', sample: 'David', source: 'CRM' },
    { key: 'lastName', label: 'Last Name', sample: 'Chen', source: 'CRM' },
    { key: 'companyName', label: 'Company', sample: 'TechFlow Inc', source: 'CRM' },
    { key: 'ltv', label: 'Lifetime Value', sample: '$247,000', source: 'CRM' },
    { key: 'similarCompany', label: 'Similar Company', sample: 'DataFlow', source: 'AI' },
  ];

  const clientStyles = {
    gmail: { name: 'Gmail', radius: '8px', font: 'Google Sans, Arial' },
    outlook: { name: 'Outlook', radius: '0px', font: 'Segoe UI, Arial' },
    apple: { name: 'Apple Mail', radius: '12px', font: '-apple-system, SF Pro' },
  };

  const [segment] = useState({
    name: 'High-Value Churned', size: 2847,
    criteria: [
      { field: 'Status', op: 'equals', value: 'Churned' },
      { field: 'LTV', op: '>', value: '$100,000' },
      { field: 'Churn Date', op: 'within', value: '3 years' },
    ],
    samples: [
      { id: 1, name: 'David Chen', company: 'TechFlow', ltv: '$247K', email: 'd.chen@techflow.io', status: 'active', emailsSent: 2, opened: 1, lastAction: 'Opened Email 1', lastActionTime: '2 hours ago', adImpressions: 8, adClicks: 1, adCost: 1.87 },
      { id: 2, name: 'Sarah Miller', company: 'ShopNow', ltv: '$189K', email: 's.miller@shopnow.com', status: 'waiting', emailsSent: 1, opened: 0, lastAction: 'Received Email 1', lastActionTime: '1 day ago', adImpressions: 12, adClicks: 0, adCost: 2.34 },
      { id: 3, name: 'James Wilson', company: 'PayScale', ltv: '$312K', email: 'j.wilson@payscale.io', status: 'active', emailsSent: 1, opened: 1, lastAction: 'Clicked CTA', lastActionTime: '5 hours ago', adImpressions: 5, adClicks: 2, adCost: 1.12 },
      { id: 4, name: 'Emily Brown', company: 'DataFlow', ltv: '$156K', email: 'e.brown@dataflow.co', status: 'held', emailsSent: 1, opened: 0, lastAction: 'Frequency cap', lastActionTime: 'Resuming Monday', adImpressions: 15, adClicks: 0, adCost: 2.89 },
      { id: 5, name: 'Michael Lee', company: 'CloudBase', ltv: '$523K', email: 'm.lee@cloudbase.io', status: 'flagged', emailsSent: 0, opened: 0, lastAction: 'VIP - Needs approval', lastActionTime: 'Pending', adImpressions: 0, adClicks: 0, adCost: 0 },
    ]
  });

  const customerDetails = {
    1: {
      name: 'David Chen', email: 'd.chen@techflow.io', company: 'TechFlow Inc', ltv: '$247K',
      journeyStatus: 'Active', progress: 50, currentEmail: 2, totalEmails: 4,
      history: [
        { time: 'Today 2:14pm', event: 'Opened Email 1', detail: 'CEO Outreach - Variant A', type: 'email' },
        { time: 'Today 11:30am', event: 'Meta Ad impression', detail: 'Case study creative', type: 'ad' },
        { time: 'Today 10:00am', event: 'Received Email 1', detail: 'AI selected 10am (peak engagement)', type: 'email' },
        { time: 'Yesterday 3pm', event: 'Meta Ad click', detail: 'Brand awareness', type: 'ad' },
        { time: 'Yesterday 9am', event: 'Meta Ad impression', detail: 'Brand awareness', type: 'ad' },
        { time: '2 days ago', event: 'Entered journey', detail: 'Matched segment criteria', type: 'system' },
      ],
      aiPlan: [
        { time: 'Tomorrow 10am', action: 'Email 2 (Product Updates)', reason: 'Opened quickly, accelerating sequence' },
        { time: 'Ongoing', action: 'Continue case study ads (3/wk)', reason: 'High email engagement' },
        { time: 'Day 5', action: 'Email 3 (Case Study)', reason: 'If no conversion' },
      ],
      costs: { email: 0.12, ads: 1.87, total: 1.99 }
    }
  };

  const deliverability = {
    score: 94, inboxRate: 96.2, spamRate: 2.1, bounceRate: 1.7,
    domains: [{ name: 'gmail.com', rate: 97 }, { name: 'outlook.com', rate: 95 }, { name: 'yahoo.com', rate: 93 }],
    auth: [{ name: 'SPF', status: 'pass' }, { name: 'DKIM', status: 'pass' }, { name: 'DMARC', status: 'pass' }]
  };

  const analytics = {
    summary: { sent: 2847, delivered: 2798, opened: 1064, clicked: 287, converted: 23, revenue: 4312000 },
    rates: { delivery: 98.3, open: 38.0, click: 27.0, conversion: 8.0 },
    byDevice: [{ name: 'Desktop', pct: 50 }, { name: 'Mobile', pct: 40 }, { name: 'Tablet', pct: 10 }],
    byClient: [{ name: 'Gmail', pct: 41 }, { name: 'Apple Mail', pct: 27 }, { name: 'Outlook', pct: 20 }, { name: 'Other', pct: 12 }],
    clicks: [{ link: 'Schedule a Call', clicks: 198, pct: 69 }, { link: 'See Features', clicks: 54, pct: 19 }, { link: 'Case Study', clicks: 35, pct: 12 }],
    crossChannel: {
      email: { reached: 4102, engaged: 1847, converted: 23, cost: 487 },
      ads: { reached: 12847, engaged: 1203, converted: 12, cost: 2847 },
      combined: { reached: 14200, engaged: 2891, converted: 31, cost: 3334, revenue: 5800000 }
    }
  };

  const integrations = [
    { id: 'salesforce', name: 'Salesforce', desc: 'CRM sync', connected: true },
    { id: 'hubspot', name: 'HubSpot', desc: 'Marketing automation', connected: false },
    { id: 'shopify', name: 'Shopify', desc: 'E-commerce data', connected: true },
    { id: 'segment', name: 'Segment', desc: 'CDP events', connected: true },
    { id: 'snowflake', name: 'Snowflake', desc: 'Data warehouse', connected: false },
  ];

  const aiDecisions = [
    { type: 'accelerate', count: 312, reason: 'Opened Email 1 within 2 hours', action: 'Sending Email 2 tomorrow instead of Day 3', color: 'green' },
    { type: 'hold', count: 89, reason: 'Already received other campaign this week', action: 'Resuming Monday', color: 'yellow' },
    { type: 'winner', count: null, reason: 'Variant A: 38% vs Variant B: 34% open rate', action: 'All future sends use Variant A (95% confidence)', color: 'blue' },
    { type: 'flag', count: 12, reason: 'VIP accounts (LTV > $500K)', action: 'Awaiting your approval', color: 'orange' },
    { type: 'ads', count: 412, reason: 'Non-openers after 24 hours', action: 'Increased ad frequency for retargeting', color: 'purple' },
  ];

  const createEmails = () => [
    { id: 1, name: 'CEO Outreach', suggested: 'First', condition: null,
      variants: [{
        id: 'a', name: 'Personal Appeal',
        subject: '{{firstName}}, I wanted to reach out personally',
        preheader: 'A lot has changed at Airwallex...',
        from: { name: 'Jack Zhang', email: 'jack@airwallex.com' },
        blocks: [
          { id: 'h1', type: 'header' },
          { id: 'g1', type: 'greeting', text: 'Hi {{firstName}},' },
          { id: 'p1', type: 'text', text: "I noticed {{companyName}} hasn't used Airwallex in a while, and I wanted to reach out personally." },
          { id: 'p2', type: 'text', text: "A lot has changed since you left, and I genuinely think it's worth another look." },
          { id: 'h2', type: 'heading', text: "Here's what's new:" },
          { id: 'l1', type: 'list', items: [
            { bold: 'Instant payouts', text: ' — Same-day settlement in 130+ countries' },
            { bold: 'Smart FX', text: ' — AI-powered rates (avg 23% savings)' },
            { bold: 'ERP integrations', text: ' — NetSuite, SAP, Xero native' },
          ]},
          { id: 'p3', type: 'text', text: 'Would you have 15 minutes this week?' },
          { id: 'c1', type: 'button', text: 'Schedule a Call', url: 'https://airwallex.com/demo' },
          { id: 's1', type: 'signature', name: 'Jack Zhang', title: 'CEO & Co-founder' },
          { id: 'f1', type: 'footer' }
        ],
        metrics: { open: 38, click: 9 }
      }, {
        id: 'b', name: 'Value Proposition',
        subject: '{{firstName}}, save 23% on international payments',
        preheader: 'Smart FX is now live...',
        from: { name: 'Jack Zhang', email: 'jack@airwallex.com' },
        blocks: [
          { id: 'h1', type: 'header' },
          { id: 'g1', type: 'greeting', text: 'Hi {{firstName}},' },
          { id: 'p1', type: 'text', text: "What if you could save 23% on every international payment? That's the average with our new Smart FX." },
          { id: 't1', type: 'stats', items: [{ value: '23%', label: 'Avg savings' }, { value: '130+', label: 'Countries' }, { value: '<1hr', label: 'Settlement' }] },
          { id: 'c1', type: 'button', text: 'Calculate Your Savings', url: 'https://airwallex.com/calc' },
          { id: 's1', type: 'signature', name: 'Jack Zhang', title: 'CEO & Co-founder' },
          { id: 'f1', type: 'footer' }
        ],
        metrics: { open: 34, click: 11 }
      }]
    },
    { id: 2, name: 'Product Updates', suggested: null, condition: 'If no open',
      variants: [{
        id: 'a', name: 'Feature Focused',
        subject: "What's new at Airwallex",
        preheader: 'Instant payouts, Smart FX...',
        from: { name: 'Sarah Chen', email: 'sarah@airwallex.com' },
        blocks: [
          { id: 'h1', type: 'header' },
          { id: 'g1', type: 'greeting', text: 'Hi {{firstName}},' },
          { id: 'p1', type: 'text', text: "I'm Sarah, head of Enterprise. Here are the specifics:" },
          { id: 'f1', type: 'feature', title: 'Instant Payouts', desc: 'Same-day settlement in 130+ countries' },
          { id: 'f2', type: 'feature', title: 'Smart FX', desc: 'AI-powered rates, 23% avg savings' },
          { id: 'c1', type: 'button', text: 'See All Features', url: 'https://airwallex.com/features' },
          { id: 's1', type: 'signature', name: 'Sarah Chen', title: 'Head of Enterprise' },
          { id: 'ft1', type: 'footer' }
        ],
        metrics: { open: 31, click: 8 }
      }]
    },
    { id: 3, name: 'Case Study', suggested: null, condition: 'If engaged',
      variants: [{
        id: 'a', name: 'Social Proof',
        subject: 'How {{similarCompany}} saved $2.1M',
        preheader: 'A story that might resonate...',
        from: { name: 'Sarah Chen', email: 'sarah@airwallex.com' },
        blocks: [
          { id: 'h1', type: 'header' },
          { id: 'g1', type: 'greeting', text: 'Hi {{firstName}},' },
          { id: 'p1', type: 'text', text: "Thought you'd find this interesting:" },
          { id: 'q1', type: 'quote', text: 'Airwallex cut our costs by 73%. The ROI was obvious within the first month.', author: 'Maria Lopez', role: 'CFO, TechFlow' },
          { id: 't1', type: 'stats', items: [{ value: '$2.1M', label: 'Saved' }, { value: '89%', label: 'Faster' }, { value: '4hrs', label: 'Saved/wk' }] },
          { id: 'c1', type: 'button', text: 'Read Case Study', url: 'https://airwallex.com/cases' },
          { id: 's1', type: 'signature', name: 'Sarah Chen', title: 'Head of Enterprise' },
          { id: 'f1', type: 'footer' }
        ],
        metrics: { open: 28, click: 10 }
      }]
    },
    { id: 4, name: 'Final Offer', suggested: 'Last', condition: null,
      variants: [{
        id: 'a', name: 'Limited Time',
        subject: '{{firstName}}, one last thing',
        preheader: 'An offer for 7 days only',
        from: { name: 'Jack Zhang', email: 'jack@airwallex.com' },
        blocks: [
          { id: 'h1', type: 'header' },
          { id: 'g1', type: 'greeting', text: 'Hi {{firstName}},' },
          { id: 'p1', type: 'text', text: "This will be my last note. But before I go:" },
          { id: 'o1', type: 'offer', headline: '3 Months Free', benefits: ['Full platform', 'Dedicated manager', 'Free migration'], expires: '7 days' },
          { id: 'c1', type: 'button', text: 'Claim Offer', url: 'https://airwallex.com/offer' },
          { id: 'p2', type: 'text', text: 'Either way, best wishes to you and the team.', muted: true },
          { id: 's1', type: 'signature', name: 'Jack Zhang', title: 'CEO & Co-founder' },
          { id: 'f1', type: 'footer' }
        ],
        metrics: { open: 32, click: 13 }
      }]
    }
  ];

  const [emails, setEmails] = useState(createEmails);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (view !== 'live' || !liveStats) return;
    const si = setInterval(() => {
      setLiveStats(p => {
        if (!p || p.sent >= segment.size) return p;
        const sent = Math.min(p.sent + Math.floor(Math.random() * 40) + 15, segment.size);
        return { ...p, sent, opened: Math.floor(sent * 0.38), clicked: Math.floor(sent * 0.1), converted: Math.floor(sent * 0.008), adServed: Math.floor(sent * 3.2), adClicks: Math.floor(sent * 0.12) };
      });
    }, 500);
    const ai = setInterval(() => {
      const acts = [
        { text: 'Accelerated 47 recipients - high engagement', c: 'green' },
        { text: 'Synced "Non-openers" audience to Meta (1,203)', c: 'purple' },
        { text: 'Variant A declared winner (95% confidence)', c: 'blue' },
        { text: 'Suppressed ads for 23 converters (saved $47)', c: 'green' },
        { text: 'Held 12 recipients - frequency cap', c: 'yellow' },
      ];
      setAiActions(p => p.length >= 5 ? p : [...p, acts[p.length]]);
    }, 2000);
    return () => { clearInterval(si); clearInterval(ai); };
  }, [view, liveStats, segment.size]);

  const startBuild = () => {
    setView('building');
    setBuildProgress(0);
    const stages = [
      { p: 20, s: 'Analyzing your audience...', d: 800 },
      { p: 40, s: 'Writing email content...', d: 1000 },
      { p: 60, s: 'Creating A/B variants...', d: 800 },
      { p: 80, s: 'Setting up AI rules...', d: 600 },
      { p: 100, s: 'Finalizing...', d: 400 },
    ];
    let delay = 0;
    stages.forEach(st => {
      delay += st.d;
      setTimeout(() => {
        setBuildProgress(st.p);
        setBuildStage(st.s);
        if (st.p === 100) setTimeout(() => {
          setEmails(createEmails());
          setCampaign({ name: 'Win-Back: High-Value Churned' });
          setView('editor');
        }, 400);
      }, delay);
    });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(p => [...p, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      if (input.toLowerCase().match(/churn|win.?back|100k|re.?engage/)) {
        setMessages(p => [...p, { role: 'ai', content: `Building a win-back campaign for high-value churned customers.\n\n**Creating:**\n• 4-email content library\n• AI-optimized timing per recipient\n• A/B variants with auto-winner selection\n• Smart exit conditions` }]);
        setTimeout(startBuild, 800);
      } else {
        setMessages(p => [...p, { role: 'ai', content: `Try describing your campaign goal:\n\n• "Win back churned customers over $100K"\n• "Welcome series for new signups"\n• "Product launch to active customers"` }]);
      }
    }, 500);
  };

  const updateBlock = (blockId, updates) => {
    setEmails(emails.map((e, ei) => ei !== selectedEmail ? e : {
      ...e, variants: e.variants.map((v, vi) => vi !== selectedVariant ? v : {
        ...v, blocks: v.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b)
      })
    }));
  };

  const deleteBlock = (blockId) => {
    setEmails(emails.map((e, ei) => ei !== selectedEmail ? e : {
      ...e, variants: e.variants.map((v, vi) => vi !== selectedVariant ? v : {
        ...v, blocks: v.blocks.filter(b => b.id !== blockId)
      })
    }));
    setEditingBlock(null);
  };

  const addBlock = (type, afterIdx) => {
    const defaults = {
      text: { type: 'text', text: 'Click to edit...' },
      heading: { type: 'heading', text: 'Section Heading' },
      list: { type: 'list', items: [{ bold: 'Item', text: ' — Description' }] },
      button: { type: 'button', text: 'Click Here', url: 'https://' },
      stats: { type: 'stats', items: [{ value: '100', label: 'Metric' }] },
      feature: { type: 'feature', title: 'Feature', desc: 'Description' },
      quote: { type: 'quote', text: 'Quote...', author: 'Name', role: 'Title' },
      offer: { type: 'offer', headline: 'Offer', benefits: ['Benefit'], expires: '7 days' },
    };
    const newBlock = { id: `b${Date.now()}`, ...defaults[type] };
    setEmails(emails.map((e, ei) => ei !== selectedEmail ? e : {
      ...e, variants: e.variants.map((v, vi) => {
        if (vi !== selectedVariant) return v;
        const blocks = [...v.blocks];
        blocks.splice(afterIdx + 1, 0, newBlock);
        return { ...v, blocks };
      })
    }));
    setShowAddBlock(false);
    setEditingBlock(newBlock.id);
  };

  const moveBlock = (from, to) => {
    setEmails(emails.map((e, ei) => ei !== selectedEmail ? e : {
      ...e, variants: e.variants.map((v, vi) => {
        if (vi !== selectedVariant) return v;
        const blocks = [...v.blocks];
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);
        return { ...v, blocks };
      })
    }));
  };

  const runSpamCheck = () => {
    setActiveModal('spam');
    setSpamScore(null);
    setTimeout(() => setSpamScore({
      score: 2.1, status: 'good',
      checks: [
        { name: 'Subject length', pass: true, detail: '48 chars (good)' },
        { name: 'Spam words', pass: true, detail: 'None detected' },
        { name: 'Unsubscribe link', pass: true, detail: 'Present in footer' },
        { name: 'Authentication', pass: true, detail: 'SPF/DKIM/DMARC valid' },
        { name: 'Image ratio', pass: true, detail: '15% (under 40%)' },
      ]
    }), 1000);
  };

  const currentEmail = emails[selectedEmail];
  const currentVariant = currentEmail?.variants[selectedVariant];
  const currentClient = clientStyles[previewClient];

  const replaceMerge = (text) => text?.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const field = mergeFields.find(f => f.key === key);
    return field ? field.sample : `{{${key}}}`;
  });

  const renderBlock = (block, idx) => {
    const isActive = editingBlock === block.id;
    const isEditable = !['header', 'footer', 'signature'].includes(block.type);
    
    const wrapProps = isEditable ? {
      className: `group relative ${isActive ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-white rounded' : ''}`,
      onClick: (e) => { e.stopPropagation(); setEditingBlock(block.id); },
      draggable: !isActive,
      onDragStart: () => setDraggedBlock(idx),
      onDragOver: (e) => e.preventDefault(),
      onDrop: () => { if (draggedBlock !== null && draggedBlock !== idx) moveBlock(draggedBlock, idx); setDraggedBlock(null); }
    } : {};

    const editControls = isActive && isEditable && (
      <div className="absolute -right-10 top-0 flex flex-col gap-1 bg-white shadow-lg rounded-lg p-1 border z-10">
        <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1 hover:bg-red-50 rounded text-red-500"><Trash2 size={12} /></button>
        <button onClick={(e) => { e.stopPropagation(); setAddBlockIdx(idx); setShowAddBlock(true); }} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Plus size={12} /></button>
      </div>
    );

    const dragHandle = isEditable && (
      <div className={`absolute -left-8 top-1/2 -translate-y-1/2 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="p-1 hover:bg-gray-100 rounded cursor-grab"><GripVertical size={12} className="text-gray-400" /></div>
      </div>
    );

    switch (block.type) {
      case 'header':
        return <div key={block.id} className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-200"><div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">A</div><span className="font-semibold text-gray-900 text-sm">Airwallex</span></div>;
      case 'greeting':
        return <div key={block.id} {...wrapProps}>{dragHandle}{isActive ? <input value={block.text} onChange={e => updateBlock(block.id, { text: e.target.value })} className="w-full text-gray-800 text-sm border-b-2 border-violet-400 bg-violet-50 px-1 outline-none" autoFocus /> : <p className="text-gray-800 text-sm mb-2">{replaceMerge(block.text)}</p>}{editControls}</div>;
      case 'text':
        return <div key={block.id} {...wrapProps}>{dragHandle}{isActive ? <textarea value={block.text} onChange={e => updateBlock(block.id, { text: e.target.value })} className="w-full text-gray-700 text-sm border-2 border-violet-400 bg-violet-50 rounded p-2 outline-none resize-none" rows={2} autoFocus /> : <p className={`text-sm mb-2 ${block.muted ? 'text-gray-500' : 'text-gray-700'}`}>{replaceMerge(block.text)}</p>}{editControls}</div>;
      case 'heading':
        return <div key={block.id} {...wrapProps}>{dragHandle}{isActive ? <input value={block.text} onChange={e => updateBlock(block.id, { text: e.target.value })} className="w-full font-semibold text-gray-900 text-sm border-b-2 border-violet-400 bg-violet-50 px-1 outline-none" autoFocus /> : <h3 className="font-semibold text-gray-900 text-sm mb-2 mt-3">{block.text}</h3>}{editControls}</div>;
      case 'list':
        return (
          <div key={block.id} {...wrapProps}>
            {dragHandle}
            <ul className="mb-3 space-y-1 ml-1">
              {block.items.map((item, i) => (
                <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                  <span className="text-violet-600">•</span>
                  {isActive ? (
                    <div className="flex-1 flex gap-1">
                      <input value={item.bold} onChange={e => { const items = [...block.items]; items[i] = { ...items[i], bold: e.target.value }; updateBlock(block.id, { items }); }} className="font-semibold bg-violet-50 border-b border-violet-300 px-1 w-20 text-xs" />
                      <input value={item.text} onChange={e => { const items = [...block.items]; items[i] = { ...items[i], text: e.target.value }; updateBlock(block.id, { items }); }} className="flex-1 bg-violet-50 border-b border-violet-300 px-1 text-xs" />
                    </div>
                  ) : <span><strong className="text-gray-900">{item.bold}</strong>{item.text}</span>}
                </li>
              ))}
            </ul>
            {editControls}
          </div>
        );
      case 'stats':
        return (
          <div key={block.id} {...wrapProps}>
            {dragHandle}
            <div className="grid grid-cols-3 gap-2 my-3 p-3 bg-gray-50 rounded-lg">
              {block.items.map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-lg font-bold text-violet-600">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>
            {editControls}
          </div>
        );
      case 'feature':
        return (
          <div key={block.id} {...wrapProps}>
            {dragHandle}
            <div className="flex gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0"><Zap size={14} className="text-violet-600" /></div>
              <div><div className="font-semibold text-gray-900 text-sm">{block.title}</div><div className="text-xs text-gray-600">{block.desc}</div></div>
            </div>
            {editControls}
          </div>
        );
      case 'quote':
        return (
          <div key={block.id} {...wrapProps}>
            {dragHandle}
            <blockquote className="border-l-4 border-violet-400 pl-3 my-3">
              <p className="italic text-gray-600 text-sm">{block.text}</p>
              <footer className="text-gray-500 mt-1 text-xs">— {block.author}, {block.role}</footer>
            </blockquote>
            {editControls}
          </div>
        );
      case 'offer':
        return (
          <div key={block.id} {...wrapProps}>
            {dragHandle}
            <div className="my-3 bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 rounded-lg p-3">
              <div className="text-center mb-2">
                <div className="text-xl font-bold text-violet-700">{block.headline}</div>
                <div className="text-xs text-gray-500">Expires in {block.expires}</div>
              </div>
              <ul className="space-y-1">
                {block.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-700"><Check size={12} className="text-green-500" />{b}</li>
                ))}
              </ul>
            </div>
            {editControls}
          </div>
        );
      case 'button':
        return (
          <div key={block.id} {...wrapProps}>
            {dragHandle}
            <div className="my-3"><button className="w-full py-2 bg-violet-600 text-white text-sm rounded-lg font-medium">{block.text} →</button></div>
            {editControls}
          </div>
        );
      case 'signature':
        return <div key={block.id} className="mt-4 pt-3 border-t border-gray-100 flex items-start gap-2"><div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-xs">{block.name.split(' ').map(n => n[0]).join('')}</div><div><div className="font-semibold text-gray-900 text-sm">{block.name}</div><div className="text-xs text-gray-500">{block.title}</div><div className="text-xs text-violet-600">Airwallex</div></div></div>;
      case 'footer':
        return <div key={block.id} className="mt-4 pt-3 border-t border-gray-200 text-center text-xs text-gray-400"><p>Airwallex, 15 William St, Melbourne VIC 3000</p><p className="mt-1"><a href="#" className="text-violet-600">Unsubscribe</a> • <a href="#" className="text-violet-600">View online</a></p></div>;
      default: return null;
    }
  };

  // HOME VIEW
  if (view === 'home') {
    return (
      <div className="h-screen bg-gray-950 text-white flex flex-col">
        <div className="h-12 border-b border-gray-800 flex items-center px-4">
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-bold text-xs mr-2">B</div>
          <span className="font-medium text-sm">Bird Email</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-semibold mb-1">Create an email campaign</h1>
            <p className="text-gray-500 text-sm mb-6">AI runs the journey, you set the rules</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setView('prompt')} className="p-5 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-xl border border-violet-500/30 hover:border-violet-500/50 text-left">
                <Sparkles size={20} className="text-violet-400 mb-3" />
                <h3 className="font-medium text-sm mb-1">Describe Campaign</h3>
                <p className="text-xs text-gray-500">AI builds from your goal</p>
              </button>
              <button onClick={() => { setCampaign({ name: 'Win-Back Campaign' }); setEmails(createEmails()); setView('editor'); }} className="p-5 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 text-left">
                <LayoutTemplate size={20} className="text-gray-400 mb-3" />
                <h3 className="font-medium text-sm mb-1">Use Template</h3>
                <p className="text-xs text-gray-500">Pre-built sequences</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PROMPT VIEW
  if (view === 'prompt') {
    return (
      <div className="h-screen bg-gray-950 text-white flex flex-col">
        <div className="h-12 border-b border-gray-800 flex items-center px-4">
          <button onClick={() => setView('home')} className="p-1.5 hover:bg-gray-800 rounded-lg mr-2"><ArrowLeft size={16} /></button>
          <span className="font-medium text-sm">Create Campaign</span>
        </div>
        <div className="flex-1 flex flex-col max-w-xl mx-auto w-full p-4">
          <div className="flex-1 overflow-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Sparkles size={24} className="text-violet-400 mb-3" />
                <h2 className="text-lg font-medium mb-1">Describe your campaign</h2>
                <p className="text-gray-500 text-sm mb-6">I'll create the content, you set the rules</p>
                <div className="w-full space-y-2">
                  {["Win back customers who churned and spent over $100K", "Welcome series for new signups"].map((s, i) => (
                    <button key={i} onClick={() => setInput(s)} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-800 text-left text-sm text-gray-400 hover:border-gray-700">"{s}"</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {messages.map((m, i) => (
                  <div key={i}>{m.role === 'user' ? (
                    <div className="flex justify-end"><div className="bg-violet-600 rounded-xl rounded-br-sm px-3 py-2 max-w-xs text-sm">{m.content}</div></div>
                  ) : (
                    <div className="flex gap-2"><div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shrink-0"><Sparkles size={10} /></div><div className="bg-gray-900 rounded-lg p-3 border border-gray-800 text-sm text-gray-300 whitespace-pre-wrap">{m.content.split('**').map((p, j) => j % 2 ? <strong key={j} className="text-white">{p}</strong> : p)}</div></div>
                  )}</div>
                ))}
                {isTyping && <div className="flex gap-2"><div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center"><Loader size={10} className="animate-spin" /></div><span className="text-sm text-gray-500">Thinking...</span></div>}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <div className="pt-3">
            <div className="flex items-center gap-2 bg-gray-900 rounded-lg border border-gray-800 px-3 py-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Describe your campaign..." className="flex-1 bg-transparent outline-none text-sm" />
              <button onClick={handleSend} className="w-7 h-7 bg-violet-600 hover:bg-violet-500 rounded-lg flex items-center justify-center"><Send size={12} /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BUILDING VIEW
  if (view === 'building') {
    return (
      <div className="h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="w-full max-w-sm px-6 text-center">
          <Sparkles size={24} className="text-violet-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-lg font-medium mb-1">Building your campaign</h2>
          <p className="text-gray-500 text-sm mb-6">{buildStage}</p>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300" style={{ width: `${buildProgress}%` }} /></div>
        </div>
      </div>
    );
  }

  // LIVE VIEW
  if (view === 'live') {
    return (
      <div className="h-screen bg-gray-950 text-white flex flex-col">
        <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setView('editor')} className="p-1.5 hover:bg-gray-800 rounded-lg"><ArrowLeft size={16} /></button>
            <span className="font-medium text-sm">{campaign?.name}</span>
            <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs"><div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />Live</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 border border-gray-700 rounded text-xs flex items-center gap-1 hover:bg-gray-800"><Pause size={12} />Pause All</button>
            <button className="px-2 py-1 border border-gray-700 rounded text-xs flex items-center gap-1 hover:bg-gray-800"><Sliders size={12} />Adjust Rules</button>
            <button className="px-2 py-1 border border-red-700 text-red-400 rounded text-xs flex items-center gap-1 hover:bg-red-900/30"><StopCircle size={12} />Emergency Stop</button>
          </div>
        </div>
        <div className="border-b border-gray-800 px-4">
          <div className="flex gap-1">
            {[
              { id: 'stats', label: 'Stats', icon: BarChart3 },
              { id: 'flow', label: 'Flow', icon: GitBranch },
              { id: 'decisions', label: 'AI Decisions', icon: Sparkles },
              { id: 'ab', label: 'A/B Results', icon: Split },
            ].map(tab => (
              <button key={tab.id} onClick={() => setLiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 ${liveTab === tab.id ? 'border-violet-500 text-white' : 'border-transparent text-gray-500'}`}>
                <tab.icon size={12} />{tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {liveTab === 'stats' && (
              <div>
                <div className="grid grid-cols-5 gap-3 mb-4">
                  <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-xs">Emails Sent</span><Mail size={14} className="text-blue-400" /></div>
                    <div className="text-2xl font-bold text-blue-400">{(liveStats?.sent || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-xs">Ads Served</span><Megaphone size={14} className="text-purple-400" /></div>
                    <div className="text-2xl font-bold text-purple-400">{(liveStats?.adServed || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-xs">Opened</span><Eye size={14} className="text-green-400" /></div>
                    <div className="text-2xl font-bold text-green-400">{(liveStats?.opened || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-xs">Clicked</span><MousePointer size={14} className="text-violet-400" /></div>
                    <div className="text-2xl font-bold text-violet-400">{(liveStats?.clicked || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-1"><span className="text-gray-500 text-xs">Converted</span><DollarSign size={14} className="text-emerald-400" /></div>
                    <div className="text-2xl font-bold text-emerald-400">{(liveStats?.converted || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-3"><Activity size={14} className="text-violet-400" /><h3 className="font-medium text-sm">Live Activity</h3></div>
                    {aiActions.length === 0 ? <div className="flex items-center gap-2 text-gray-500 text-xs"><Loader size={12} className="animate-spin" />Monitoring...</div> : (
                      <div className="space-y-2">{aiActions.map((a, i) => <div key={i} className="flex items-center gap-2 text-xs p-2 bg-gray-800 rounded"><TrendingUp size={12} className={a.c === 'purple' ? 'text-purple-400' : a.c === 'green' ? 'text-green-400' : a.c === 'blue' ? 'text-blue-400' : 'text-yellow-400'} /><span className="text-gray-300">{a.text}</span><span className="ml-auto text-gray-600">just now</span></div>)}</div>
                    )}
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-3"><RefreshCw size={14} className="text-purple-400" /><h3 className="font-medium text-sm">Ad Sync Status</h3></div>
                    <div className="text-xs text-gray-500 mb-3">Last sync: 12 min ago</div>
                    <div className="space-y-2">
                      {adAudiences.map(a => (
                        <div key={a.id} className="flex items-center justify-between p-2 bg-gray-800 rounded text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={12} className="text-green-400" />
                            <span>{a.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <span>{a.size.toLocaleString()}</span>
                            <span>→ {a.platforms.join(', ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {liveTab === 'flow' && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="font-medium text-sm mb-6 text-center">Live Journey Flow</h3>
                <div className="flex flex-col items-center">
                  <div className="bg-gray-800 rounded-lg px-6 py-3 text-center mb-4">
                    <div className="text-2xl font-bold">2,847</div>
                    <div className="text-xs text-gray-500">Entered Journey</div>
                  </div>
                  <div className="w-px h-6 bg-gray-700" />
                  <div className="grid grid-cols-4 gap-4 w-full">
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-blue-400">1,847</div>
                      <div className="text-xs text-gray-400">Email 1 Sent</div>
                      <div className="text-xs text-blue-400 mt-1">847 opened</div>
                    </div>
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-yellow-400">412</div>
                      <div className="text-xs text-gray-400">Waiting</div>
                      <div className="text-xs text-yellow-400 mt-1">Min 24hr gap</div>
                    </div>
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-purple-400">1,203</div>
                      <div className="text-xs text-gray-400">Retargeting</div>
                      <div className="text-xs text-purple-400 mt-1">Non-openers</div>
                    </div>
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-400">31</div>
                      <div className="text-xs text-gray-400">Converted</div>
                      <div className="text-xs text-green-400 mt-1">$5.8M revenue</div>
                    </div>
                  </div>
                  <div className="mt-6 w-full space-y-2">
                    <div className="flex items-center gap-2 text-xs p-2 bg-green-500/10 border border-green-500/20 rounded"><FastForward size={12} className="text-green-400" /><span>AI accelerating 312 high-engagers</span></div>
                    <div className="flex items-center gap-2 text-xs p-2 bg-purple-500/10 border border-purple-500/20 rounded"><Megaphone size={12} className="text-purple-400" /><span>1,203 non-openers in retargeting audiences</span></div>
                    <div className="flex items-center gap-2 text-xs p-2 bg-orange-500/10 border border-orange-500/20 rounded"><Flag size={12} className="text-orange-400" /><span>12 VIPs flagged for review</span><button className="ml-auto text-orange-400 hover:text-orange-300">Review →</button></div>
                  </div>
                </div>
              </div>
            )}
            {liveTab === 'decisions' && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm mb-4">AI Decisions (last hour)</h3>
                {aiDecisions.map((d, i) => (
                  <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${d.type === 'accelerate' ? 'bg-green-500/20' : d.type === 'hold' ? 'bg-yellow-500/20' : d.type === 'winner' ? 'bg-blue-500/20' : d.type === 'ads' ? 'bg-purple-500/20' : 'bg-orange-500/20'}`}>
                        {d.type === 'accelerate' && <FastForward size={14} className="text-green-400" />}
                        {d.type === 'hold' && <Pause size={14} className="text-yellow-400" />}
                        {d.type === 'winner' && <Award size={14} className="text-blue-400" />}
                        {d.type === 'flag' && <Flag size={14} className="text-orange-400" />}
                        {d.type === 'ads' && <Megaphone size={14} className="text-purple-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium text-sm ${d.type === 'accelerate' ? 'text-green-400' : d.type === 'hold' ? 'text-yellow-400' : d.type === 'winner' ? 'text-blue-400' : d.type === 'ads' ? 'text-purple-400' : 'text-orange-400'}`}>
                            {d.type === 'accelerate' && `Accelerated ${d.count} recipients`}
                            {d.type === 'hold' && `Held ${d.count} recipients`}
                            {d.type === 'winner' && 'Declared Variant A winner'}
                            {d.type === 'flag' && `Flagged ${d.count} for review`}
                            {d.type === 'ads' && `Ad audience updated: ${d.count} people`}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Reason: {d.reason}</div>
                        <div className="text-xs text-gray-400">Action: {d.action}</div>
                      </div>
                      {d.type === 'flag' && <button className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded text-xs hover:bg-orange-500/30">Review Now</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {liveTab === 'ab' && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="font-medium text-sm mb-4">A/B Test Results</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Variant A: Personal Appeal</span>
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">WINNER</span>
                    </div>
                    <div className="text-3xl font-bold text-green-400 mb-1">38%</div>
                    <div className="text-xs text-gray-500">Open rate • 847 recipients</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2"><span className="font-medium">Variant B: Value Proposition</span></div>
                    <div className="text-3xl font-bold mb-1">34%</div>
                    <div className="text-xs text-gray-500">Open rate • 823 recipients</div>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-blue-400" />
                    <span>Winner declared at 95% statistical confidence. All future sends will use Variant A.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // EDITOR VIEW
  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col text-sm">
      <div className="h-11 border-b border-gray-800 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('home')} className="p-1 hover:bg-gray-800 rounded"><ArrowLeft size={14} /></button>
          <span className="font-medium">{campaign?.name}</span>
          <span className="text-xs bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded">{emails.length} emails</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setActiveModal('deliverability')} className="px-2 py-1 text-xs border border-gray-800 rounded hover:bg-gray-900 flex items-center gap-1"><Inbox size={12} />Deliver</button>
          <button onClick={runSpamCheck} className="px-2 py-1 text-xs border border-gray-800 rounded hover:bg-gray-900 flex items-center gap-1"><ShieldCheck size={12} />Spam</button>
          <button onClick={() => setActiveModal('test')} className="px-2 py-1 text-xs border border-gray-800 rounded hover:bg-gray-900 flex items-center gap-1"><TestTube size={12} />Test</button>
          <button onClick={() => setActiveModal('launch')} className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-medium flex items-center gap-1"><Play size={12} />Launch</button>
        </div>
      </div>
      <div className="border-b border-gray-800 px-3">
        <div className="flex gap-1">
          {[
            { id: 'design', label: 'Design', icon: Palette },
            { id: 'rules', label: 'Rules', icon: Sliders },
            { id: 'audience', label: 'Audience', icon: Users },
            { id: 'ads', label: 'Ads', icon: Megaphone },
            { id: 'compliance', label: 'Compliance', icon: Shield },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'integrations', label: 'Integrations', icon: Database },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 ${activeTab === tab.id ? 'border-violet-500 text-white' : 'border-transparent text-gray-500'}`}>
              <tab.icon size={12} />{tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {/* DESIGN TAB */}
        {activeTab === 'design' && (
          <>
            <div className="w-52 border-r border-gray-800 flex flex-col">
              <div className="p-2 border-b border-gray-800">
                <div className="flex items-center gap-1.5"><Users size={12} className="text-violet-400" /><span className="font-medium text-xs">{segment.size.toLocaleString()}</span></div>
                <p className="text-xs text-gray-500 truncate">{segment.name}</p>
              </div>
              <div className="p-2 border-b border-gray-800">
                <div className="text-xs text-gray-500 mb-2">CONTENT LIBRARY</div>
                <div className="text-xs text-gray-600">AI selects based on engagement</div>
              </div>
              <div className="flex-1 overflow-auto p-2">
                {emails.map((e, i) => (
                  <div key={e.id}>
                    {i > 0 && (
                      <div className="flex items-center gap-1 py-2 px-2">
                        <div className="border-l border-dashed border-gray-700 h-4 ml-3" />
                        <Sparkles size={10} className="text-violet-400" />
                        <span className="text-xs text-violet-400">AI decides timing</span>
                      </div>
                    )}
                    <button onClick={() => { setSelectedEmail(i); setSelectedVariant(0); setEditingBlock(null); }} className={`w-full p-2 rounded text-left ${selectedEmail === i ? 'bg-violet-500/20 border border-violet-500/50' : 'hover:bg-gray-900 border border-transparent'}`}>
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-gray-500" />
                        <span className="text-xs font-medium truncate">{e.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 ml-5 mt-1">
                        {e.variants.length} variant{e.variants.length > 1 ? 's' : ''}
                        {e.suggested && <span className="text-violet-400 ml-1">• {e.suggested}</span>}
                      </div>
                      {e.condition && (
                        <div className="flex items-center gap-1 ml-5 mt-1">
                          <GitBranch size={10} className="text-yellow-500" />
                          <span className="text-xs text-yellow-500">{e.condition}</span>
                        </div>
                      )}
                    </button>
                  </div>
                ))}
                <button className="w-full mt-2 p-2 border border-dashed border-gray-700 rounded text-xs text-gray-500 hover:border-gray-600 flex items-center justify-center gap-1">
                  <Plus size={12} />Add Email
                </button>
              </div>
              <div className="p-2 border-t border-gray-800">
                <div className="flex items-center gap-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs">
                  <Megaphone size={12} className="text-purple-400" />
                  <div>
                    <div className="text-purple-400">Parallel Ad Layer</div>
                    <div className="text-gray-500">Audiences synced</div>
                  </div>
                  <button onClick={() => setActiveTab('ads')} className="ml-auto text-purple-400">→</button>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-gray-900/30" onClick={() => setEditingBlock(null)}>
              {currentEmail?.variants.length > 1 && (
                <div className="p-2 border-b border-gray-800 flex items-center gap-2">
                  <Split size={12} className="text-gray-500" /><span className="text-xs text-gray-500">A/B:</span>
                  {currentEmail.variants.map((v, i) => (
                    <button key={v.id} onClick={() => { setSelectedVariant(i); setEditingBlock(null); }} className={`px-2 py-0.5 text-xs rounded-full ${selectedVariant === i ? 'bg-violet-600' : 'bg-gray-800 text-gray-400'}`}>{String.fromCharCode(65 + i)}</button>
                  ))}
                  <span className="ml-auto text-xs text-gray-600">{currentVariant?.metrics.open}% predicted open</span>
                </div>
              )}
              <div className="p-2 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {['desktop', 'mobile'].map(d => (
                    <button key={d} onClick={() => setPreviewDevice(d)} className={`p-1 rounded ${previewDevice === d ? 'bg-gray-800' : ''}`}>
                      {d === 'desktop' ? <Monitor size={14} className={previewDevice === d ? 'text-white' : 'text-gray-500'} /> : <Smartphone size={14} className={previewDevice === d ? 'text-white' : 'text-gray-500'} />}
                    </button>
                  ))}
                  <div className="w-px h-4 bg-gray-800 mx-1" />
                  {Object.keys(clientStyles).map(c => (
                    <button key={c} onClick={() => setPreviewClient(c)} className={`px-1.5 py-0.5 rounded text-xs capitalize ${previewClient === c ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 flex justify-center" onClick={e => e.stopPropagation()}>
                <div className={`bg-white rounded-lg shadow-xl ${previewDevice === 'mobile' ? 'w-72' : 'w-full max-w-md'}`} style={{ fontFamily: currentClient?.font }}>
                  <div className="bg-gray-100 p-3 rounded-t-lg border-b" style={{ borderRadius: `${currentClient?.radius} ${currentClient?.radius} 0 0` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-medium text-xs">{currentVariant?.from.name.split(' ').map(n => n[0]).join('')}</div>
                      <div><div className="font-medium text-gray-900 text-xs">{currentVariant?.from.name}</div><div className="text-xs text-gray-500">{currentVariant?.from.email}</div></div>
                    </div>
                    {editingSubject ? (
                      <input value={currentVariant?.subject} onChange={e => setEmails(emails.map((em, ei) => ei !== selectedEmail ? em : { ...em, variants: em.variants.map((v, vi) => vi !== selectedVariant ? v : { ...v, subject: e.target.value }) }))} onBlur={() => setEditingSubject(false)} className="w-full text-xs font-medium text-gray-800 border-b-2 border-violet-400 bg-violet-50 px-1 outline-none" autoFocus />
                    ) : (
                      <div onClick={() => setEditingSubject(true)} className="text-xs font-medium text-gray-800 cursor-text hover:bg-gray-200 px-1 rounded">{replaceMerge(currentVariant?.subject)}</div>
                    )}
                  </div>
                  <div className="p-4 pl-10">{currentVariant?.blocks.map((b, i) => renderBlock(b, i))}</div>
                </div>
              </div>
            </div>
            <div className="w-52 border-l border-gray-800 flex flex-col">
              <div className="flex border-b border-gray-800">
                {['settings', 'merge'].map(t => (
                  <button key={t} onClick={() => setRightTab(t)} className={`flex-1 py-2 text-xs capitalize ${rightTab === t ? 'text-white border-b-2 border-violet-500' : 'text-gray-500'}`}>{t}</button>
                ))}
              </div>
              <div className="flex-1 overflow-auto p-3">
                {rightTab === 'settings' && (
                  <div className="space-y-3">
                    <div><label className="text-xs text-gray-500 block mb-1">From Name</label><input value={currentVariant?.from.name || ''} className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-xs" readOnly /></div>
                    <div><label className="text-xs text-gray-500 block mb-1">From Email</label><input value={currentVariant?.from.email || ''} className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-xs" readOnly /></div>
                    <div className="pt-3 border-t border-gray-800">
                      <h4 className="text-xs font-medium mb-2">Predicted</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-xs text-gray-500">Open</span><span className="text-xs text-green-400">{currentVariant?.metrics.open}%</span></div>
                        <div className="flex justify-between"><span className="text-xs text-gray-500">Click</span><span className="text-xs text-blue-400">{currentVariant?.metrics.click}%</span></div>
                      </div>
                    </div>
                  </div>
                )}
                {rightTab === 'merge' && (
                  <div className="space-y-2">
                    {mergeFields.map(f => (
                      <div key={f.key} className="p-2 bg-gray-900 rounded flex items-center justify-between">
                        <div><code className="text-xs text-violet-400">{`{{${f.key}}}`}</code><div className="text-xs text-gray-500">{f.source}</div></div>
                        <button className="p-1 hover:bg-gray-800 rounded"><Copy size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* RULES TAB */}
        {activeTab === 'rules' && (
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold mb-4">Journey Rules</h2>
              <p className="text-gray-500 text-sm mb-6">Define the contract with AI — what it can and can't do</p>
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Target size={14} className="text-violet-400" />Goal</h3>
                  <div className="space-y-3">
                    <div><label className="text-xs text-gray-500 block mb-1">Campaign Goal</label><input value={rules.goal} onChange={e => setRules({...rules, goal: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" /></div>
                    <div><label className="text-xs text-gray-500 block mb-1">Success = </label><input value={rules.successMetric} onChange={e => setRules({...rules, successMetric: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" /></div>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Settings size={14} className="text-violet-400" />Sequence Limits</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-xs text-gray-500 block mb-1">Max emails</label><input type="number" value={rules.maxEmails} onChange={e => setRules({...rules, maxEmails: parseInt(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" /></div>
                    <div><label className="text-xs text-gray-500 block mb-1">Timeframe (days)</label><input type="number" value={rules.timeframeDays} onChange={e => setRules({...rules, timeframeDays: parseInt(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" /></div>
                    <div><label className="text-xs text-gray-500 block mb-1">Min gap (days)</label><input type="number" value={rules.minGapDays} onChange={e => setRules({...rules, minGapDays: parseInt(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" /></div>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Mail size={14} className="text-violet-400" />Channels</h3>
                  <div className="space-y-2">
                    {[{ id: 'email', label: 'Email (primary)' }, { id: 'sms', label: 'SMS (fallback)' }, { id: 'push', label: 'Push notification' }].map(ch => (
                      <label key={ch.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={rules.channels[ch.id]} onChange={e => setRules({...rules, channels: {...rules.channels, [ch.id]: e.target.checked}})} className="rounded bg-gray-800 border-gray-700" />
                        <span className="text-sm">{ch.label}</span>
                      </label>
                    ))}
                    {rules.channels.sms && (
                      <div className="ml-6"><label className="text-xs text-gray-500 block mb-1">SMS condition</label><input value={rules.smsCondition} onChange={e => setRules({...rules, smsCondition: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs" /></div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Clock size={14} className="text-violet-400" />Frequency Caps</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div><label className="text-xs text-gray-500 block mb-1">Max per week</label><input type="number" value={rules.maxPerWeek} onChange={e => setRules({...rules, maxPerWeek: parseInt(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" /></div>
                    <div><label className="text-xs text-gray-500 block mb-1">Quiet hours</label><div className="flex gap-1"><input type="time" value={rules.quietHoursStart} onChange={e => setRules({...rules, quietHoursStart: e.target.value})} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-2 text-sm" /><input type="time" value={rules.quietHoursEnd} onChange={e => setRules({...rules, quietHoursEnd: e.target.value})} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-2 text-sm" /></div></div>
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={rules.noWeekends} onChange={e => setRules({...rules, noWeekends: e.target.checked})} className="rounded bg-gray-800 border-gray-700" />
                    <span className="text-sm">No weekends</span>
                  </label>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Ban size={14} className="text-violet-400" />Exit Conditions</h3>
                  <div className="space-y-2">
                    {[{ id: 'converts', label: 'Converts (achieves goal)' }, { id: 'unsubscribes', label: 'Unsubscribes' }, { id: 'replies', label: 'Replies to email' }, { id: 'noEngagement', label: 'No engagement after X emails' }].map(ex => (
                      <label key={ex.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={rules.exitConditions[ex.id]} onChange={e => setRules({...rules, exitConditions: {...rules.exitConditions, [ex.id]: e.target.checked}})} className="rounded bg-gray-800 border-gray-700" />
                        <span className="text-sm">{ex.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Sparkles size={14} className="text-violet-400" />AI Autonomy</h3>
                  <p className="text-xs text-gray-500 mb-3">What can AI decide without asking?</p>
                  <div className="space-y-2">
                    {[{ id: 'optimizeTiming', label: 'Optimize send times per person' }, { id: 'pickWinners', label: 'Pick winning A/B variants automatically' }, { id: 'adjustPacing', label: 'Adjust timing based on engagement' }, { id: 'switchChannels', label: 'Switch channels without approval' }].map(ai => (
                      <label key={ai.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={rules.aiAutonomy[ai.id]} onChange={e => setRules({...rules, aiAutonomy: {...rules.aiAutonomy, [ai.id]: e.target.checked}})} className="rounded bg-gray-800 border-gray-700" />
                        <span className="text-sm">{ai.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Megaphone size={14} className="text-purple-400" />Ad Coordination</h3>
                  <p className="text-xs text-gray-500 mb-3">How should ads work alongside email?</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-2">Sync audiences to:</label>
                      <div className="flex gap-2">
                        {[{ id: 'meta', label: 'Meta' }, { id: 'google', label: 'Google' }, { id: 'linkedin', label: 'LinkedIn' }].map(p => (
                          <label key={p.id} className="flex items-center gap-1.5 px-2 py-1 bg-gray-800 rounded">
                            <input type="checkbox" checked={rules.adCoordination[p.id]} onChange={e => setRules({...rules, adCoordination: {...rules.adCoordination, [p.id]: e.target.checked}})} className="rounded bg-gray-700 border-gray-600" />
                            <span className="text-xs">{p.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[{ id: 'suppressOnConvert', label: 'Suppress ads immediately when converted' }, { id: 'suppressAfterEmail', label: 'Suppress ads for 48hrs after email send' }, { id: 'pauseOnHighEngagement', label: 'Pause ads when email engagement is high' }].map(r => (
                        <label key={r.id} className="flex items-center gap-2">
                          <input type="checkbox" checked={rules.adCoordination[r.id]} onChange={e => setRules({...rules, adCoordination: {...rules.adCoordination, [r.id]: e.target.checked}})} className="rounded bg-gray-800 border-gray-700" />
                          <span className="text-sm">{r.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUDIENCE TAB */}
        {activeTab === 'audience' && (
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Audience</h2>
                <div className="flex gap-1">
                  <button onClick={() => { setAudienceView('recipients'); setSelectedCustomer(null); }} className={`px-3 py-1 text-xs rounded ${audienceView === 'recipients' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>Recipients</button>
                  <button onClick={() => setAudienceView('individual')} className={`px-3 py-1 text-xs rounded ${audienceView === 'individual' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>Individual View</button>
                </div>
              </div>
              {audienceView === 'recipients' && !selectedCustomer && (
                <div>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-gray-900 rounded-xl p-3 border border-gray-800"><div className="text-2xl font-bold">{segment.size.toLocaleString()}</div><div className="text-xs text-gray-500">Total</div></div>
                    <div className="bg-gray-900 rounded-xl p-3 border border-gray-800"><div className="text-2xl font-bold text-green-400">1,847</div><div className="text-xs text-gray-500">Active</div></div>
                    <div className="bg-gray-900 rounded-xl p-3 border border-gray-800"><div className="text-2xl font-bold text-yellow-400">89</div><div className="text-xs text-gray-500">Held</div></div>
                    <div className="bg-gray-900 rounded-xl p-3 border border-gray-800"><div className="text-2xl font-bold text-orange-400">12</div><div className="text-xs text-gray-500">Flagged</div></div>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                      <h3 className="font-medium text-sm">Recipients</h3>
                      <div className="relative"><Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" /><input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-gray-800 border border-gray-700 rounded pl-7 pr-3 py-1 text-xs w-48" /></div>
                    </div>
                    <table className="w-full">
                      <thead><tr className="text-xs text-gray-500 border-b border-gray-800"><th className="p-2 text-left font-normal">Name</th><th className="p-2 text-left font-normal">Status</th><th className="p-2 text-left font-normal">Emails</th><th className="p-2 text-left font-normal">Ads</th><th className="p-2 text-left font-normal"></th></tr></thead>
                      <tbody>
                        {segment.samples.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase())).map((s, i) => (
                          <tr key={i} className="border-b border-gray-800/50 text-xs hover:bg-gray-800/30">
                            <td className="p-2"><div className="font-medium">{s.name}</div><div className="text-gray-500">{s.email}</div></td>
                            <td className="p-2"><span className={`px-2 py-0.5 rounded-full text-xs ${s.status === 'active' ? 'bg-green-500/20 text-green-400' : s.status === 'waiting' ? 'bg-blue-500/20 text-blue-400' : s.status === 'held' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-orange-500/20 text-orange-400'}`}>{s.status}</span></td>
                            <td className="p-2">{s.emailsSent} sent • {s.opened} opened</td>
                            <td className="p-2"><span className="text-purple-400">{s.adImpressions} impr</span></td>
                            <td className="p-2"><button onClick={() => { setSelectedCustomer(s); setAudienceView('individual'); }} className="text-violet-400 hover:text-violet-300">View →</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {audienceView === 'individual' && (
                <div>
                  {!selectedCustomer ? (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
                      <Search size={24} className="text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 mb-3">Search for a customer to view their journey</p>
                      <div className="relative max-w-xs mx-auto"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm" /></div>
                      {searchQuery && (
                        <div className="mt-3 space-y-2">
                          {segment.samples.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                            <button key={s.id} onClick={() => setSelectedCustomer(s)} className="w-full p-3 bg-gray-800 rounded-lg text-left hover:bg-gray-750 flex items-center justify-between">
                              <div><div className="font-medium text-sm">{s.name}</div><div className="text-xs text-gray-500">{s.email}</div></div>
                              <ChevronRight size={14} className="text-gray-500" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <button onClick={() => setSelectedCustomer(null)} className="flex items-center gap-1 text-gray-500 text-xs mb-4 hover:text-white"><ArrowLeft size={12} />Back to search</button>
                      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                            <p className="text-gray-500 text-sm">{selectedCustomer.email} • {selectedCustomer.company} • {selectedCustomer.ltv} LTV</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${selectedCustomer.status === 'active' ? 'bg-green-500/20 text-green-400' : selectedCustomer.status === 'held' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-orange-500/20 text-orange-400'}`}>{selectedCustomer.status}</span>
                        </div>
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">Journey Progress</span><span className="text-xs">Email {selectedCustomer.emailsSent} of 4</span></div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-violet-500" style={{ width: `${(selectedCustomer.emailsSent / 4) * 100}%` }} /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 p-2 bg-gray-800 rounded-lg">
                          <div className="text-center"><div className="text-sm font-medium">${((customerDetails[selectedCustomer.id]?.costs?.email || 0.12)).toFixed(2)}</div><div className="text-xs text-gray-500">Email cost</div></div>
                          <div className="text-center"><div className="text-sm font-medium text-purple-400">${((customerDetails[selectedCustomer.id]?.costs?.ads || selectedCustomer.adCost)).toFixed(2)}</div><div className="text-xs text-gray-500">Ad cost</div></div>
                          <div className="text-center"><div className="text-sm font-medium text-green-400">${((customerDetails[selectedCustomer.id]?.costs?.total || (0.12 + selectedCustomer.adCost))).toFixed(2)}</div><div className="text-xs text-gray-500">Total</div></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                          <h4 className="font-medium text-sm mb-3">Touchpoint History</h4>
                          <div className="space-y-3">
                            {(customerDetails[selectedCustomer.id]?.history || [
                              { time: 'Today', event: selectedCustomer.lastAction, detail: '', type: 'email' },
                              { time: 'Yesterday', event: 'Entered journey', detail: 'Matched segment', type: 'system' }
                            ]).map((h, i) => (
                              <div key={i} className="flex gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${h.type === 'ad' ? 'bg-purple-500' : h.type === 'email' ? 'bg-blue-500' : 'bg-gray-500'}`} />
                                <div><div className="text-xs text-gray-500">{h.time}</div><div className="text-sm">{h.event}</div>{h.detail && <div className="text-xs text-gray-500">{h.detail}</div>}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                          <h4 className="font-medium text-sm mb-3 flex items-center gap-2"><Sparkles size={12} className="text-violet-400" />AI Plan</h4>
                          <div className="space-y-3">
                            {(customerDetails[selectedCustomer.id]?.aiPlan || [
                              { time: 'Tomorrow', action: 'Email 2', reason: 'Based on engagement' },
                              { time: 'Ongoing', action: 'Continue ads', reason: 'Retargeting' }
                            ]).map((p, i) => (
                              <div key={i} className="p-2 bg-gray-800 rounded">
                                <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">{p.action}</span><span className="text-xs text-gray-500">{p.time}</span></div>
                                <div className="text-xs text-gray-500">{p.reason}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-2 bg-gray-800 rounded-lg text-xs flex items-center gap-1 hover:bg-gray-700"><Pause size={12} />Pause Journey</button>
                        <button className="px-3 py-2 bg-gray-800 rounded-lg text-xs flex items-center gap-1 hover:bg-gray-700"><FastForward size={12} />Skip to Final Offer</button>
                        <button className="px-3 py-2 bg-red-900/30 text-red-400 rounded-lg text-xs flex items-center gap-1 hover:bg-red-900/50"><Ban size={12} />Remove from Journey</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADS TAB */}
        {activeTab === 'ads' && (
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-lg font-semibold mb-2">Ads</h2>
              <p className="text-gray-500 text-sm mb-6">AI syncs audiences to your ad platforms. You run the campaigns.</p>
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Database size={14} className="text-purple-400" />Connected Platforms</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'meta', name: 'Meta Ads', connected: true },
                      { id: 'google', name: 'Google Ads', connected: true },
                      { id: 'linkedin', name: 'LinkedIn', connected: false },
                    ].map(p => (
                      <div key={p.id} className={`p-3 rounded-lg border ${p.connected ? 'bg-gray-800 border-gray-700' : 'bg-gray-900/50 border-gray-800/50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{p.name}</span>
                          {p.connected ? <CheckCircle size={14} className="text-green-400" /> : <span className="text-xs text-gray-500">Connect →</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm flex items-center gap-2"><Users size={14} className="text-purple-400" />Auto-Synced Audiences</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500"><RefreshCw size={12} />Last sync: 12 min ago</div>
                  </div>
                  <div className="space-y-2">
                    {adAudiences.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle size={14} className="text-green-400" />
                          <div>
                            <div className="font-medium text-sm">{a.name}</div>
                            <div className="text-xs text-gray-500">{a.size.toLocaleString()} people</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {a.platforms.map(p => (
                              <span key={p} className="px-2 py-0.5 bg-gray-700 rounded text-xs capitalize">{p}</span>
                            ))}
                          </div>
                          <button className="p-1 hover:bg-gray-700 rounded"><ExternalLink size={12} className="text-gray-500" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Sparkles size={14} className="text-purple-400" />AI Creative Suggestions</h3>
                  <p className="text-xs text-gray-500 mb-3">Based on your email content, AI recommends these ad creatives:</p>
                  <div className="space-y-2">
                    {[
                      { name: 'Case Study Ad', audience: 'Email openers', reason: 'Reinforce social proof' },
                      { name: 'Final Offer Ad', audience: 'High-intent', reason: 'Match email sequence' },
                      { name: 'Brand Awareness', audience: 'Non-openers', reason: 'Alternative touchpoint' },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{c.name}</div>
                          <div className="text-xs text-gray-500">For: {c.audience} • {c.reason}</div>
                        </div>
                        <button className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30">Generate Brief</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><DollarSign size={14} className="text-purple-400" />Budget Guidance</h3>
                  <p className="text-xs text-gray-500 mb-3">AI recommends based on audience size and goals:</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-gray-800 rounded-lg text-center">
                      <div className="text-lg font-bold text-purple-400">$2,500</div>
                      <div className="text-xs text-gray-500">Suggested total</div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg text-center">
                      <div className="text-lg font-bold">60%</div>
                      <div className="text-xs text-gray-500">Retargeting</div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg text-center">
                      <div className="text-lg font-bold">40%</div>
                      <div className="text-xs text-gray-500">Lookalikes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPLIANCE TAB */}
        {activeTab === 'compliance' && (
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold mb-4">Compliance Checklist</h2>
              <div className="space-y-3">
                {[
                  { id: 'gdpr', label: 'GDPR Consent', desc: 'Valid consent records', region: 'EU', req: true },
                  { id: 'canspam', label: 'CAN-SPAM', desc: 'Physical address included', region: 'US', req: true },
                  { id: 'unsub', label: 'Unsubscribe Link', desc: 'One-click in footer', region: 'Global', req: true },
                  { id: 'address', label: 'Physical Address', desc: 'Company address', region: 'Global', req: true },
                  { id: 'consent', label: 'Consent < 24mo', desc: '847 need re-consent', region: 'EU', req: false },
                ].map(item => (
                  <div key={item.id} className={`p-3 rounded-xl border ${complianceChecks[item.id] ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                    <div className="flex items-start gap-2">
                      <button onClick={() => setComplianceChecks({ ...complianceChecks, [item.id]: !complianceChecks[item.id] })} className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${complianceChecks[item.id] ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                        {complianceChecks[item.id] && <Check size={10} />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.label}</span>
                          {item.req && <span className="text-xs bg-red-500/20 text-red-400 px-1 py-0.5 rounded">Required</span>}
                          <span className="text-xs bg-gray-800 px-1 py-0.5 rounded">{item.region}</span>
                        </div>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-6 gap-3 mb-4">
                {[
                  { label: 'Sent', value: analytics.summary.sent.toLocaleString() },
                  { label: 'Delivered', value: `${analytics.rates.delivery}%` },
                  { label: 'Opened', value: `${analytics.rates.open}%`, c: 'text-green-400' },
                  { label: 'Clicked', value: `${analytics.rates.click}%`, c: 'text-blue-400' },
                  { label: 'Converted', value: analytics.summary.converted, c: 'text-violet-400' },
                  { label: 'Revenue', value: `$${(analytics.summary.revenue / 1000000).toFixed(1)}M`, c: 'text-emerald-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                    <div className={`text-xl font-bold ${s.c || ''}`}>{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-4 mb-4">
                <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><BarChart3 size={14} className="text-purple-400" />Cross-Channel Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-xs text-gray-500"><th className="text-left p-2"></th><th className="text-right p-2">Email</th><th className="text-right p-2">Ads</th><th className="text-right p-2 text-purple-400">Combined</th></tr></thead>
                    <tbody>
                      <tr className="border-t border-gray-800"><td className="p-2">Reached</td><td className="text-right p-2">{analytics.crossChannel.email.reached.toLocaleString()}</td><td className="text-right p-2">{analytics.crossChannel.ads.reached.toLocaleString()}</td><td className="text-right p-2 text-purple-400">~{(analytics.crossChannel.combined.reached / 1000).toFixed(1)}K</td></tr>
                      <tr className="border-t border-gray-800"><td className="p-2">Engaged</td><td className="text-right p-2">{analytics.crossChannel.email.engaged.toLocaleString()}</td><td className="text-right p-2">{analytics.crossChannel.ads.engaged.toLocaleString()}</td><td className="text-right p-2 text-purple-400">{analytics.crossChannel.combined.engaged.toLocaleString()}</td></tr>
                      <tr className="border-t border-gray-800"><td className="p-2">Converted</td><td className="text-right p-2">{analytics.crossChannel.email.converted}</td><td className="text-right p-2">{analytics.crossChannel.ads.converted}</td><td className="text-right p-2 text-purple-400">{analytics.crossChannel.combined.converted}*</td></tr>
                      <tr className="border-t border-gray-800"><td className="p-2">Cost</td><td className="text-right p-2">${analytics.crossChannel.email.cost}</td><td className="text-right p-2">${analytics.crossChannel.ads.cost.toLocaleString()}</td><td className="text-right p-2 text-purple-400">${analytics.crossChannel.combined.cost.toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-xs text-gray-500">*31 unique conversions (some overlap)</div>
                <div className="mt-3 p-3 bg-purple-500/10 rounded-lg">
                  <div className="flex items-center gap-2 text-sm"><Sparkles size={14} className="text-purple-400" /><span>Customers who saw email + ads converted at 2.1x the rate of email-only.</span></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Laptop size={14} />By Device</h3>
                  {analytics.byDevice.map(d => (
                    <div key={d.name} className="mb-2">
                      <div className="flex justify-between mb-1"><span className="text-xs">{d.name}</span><span className="text-xs text-gray-500">{d.pct}%</span></div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-violet-500" style={{ width: `${d.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><Mail size={14} />By Client</h3>
                  {analytics.byClient.map(c => (
                    <div key={c.name} className="mb-2">
                      <div className="flex justify-between mb-1"><span className="text-xs">{c.name}</span><span className="text-xs text-gray-500">{c.pct}%</span></div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${c.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2"><MousePointer size={14} />Click Map</h3>
                  {analytics.clicks.map(l => (
                    <div key={l.link} className="mb-2">
                      <div className="flex justify-between mb-1"><span className="text-xs truncate">{l.link}</span><span className="text-xs text-gray-500">{l.clicks}</span></div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${l.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INTEGRATIONS TAB */}
        {activeTab === 'integrations' && (
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold mb-4">Integrations</h2>
              <div className="space-y-3">
                {integrations.map(int => (
                  <div key={int.id} className={`p-3 rounded-xl border ${int.connected ? 'bg-gray-900 border-gray-800' : 'bg-gray-900/50 border-gray-800/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center"><Database size={18} className="text-gray-400" /></div>
                        <div><div className="font-medium text-sm">{int.name}</div><div className="text-xs text-gray-500">{int.desc}</div></div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${int.connected ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>{int.connected ? 'Connected' : 'Connect'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddBlock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddBlock(false)}>
          <div className="bg-gray-900 rounded-xl p-4 w-64" onClick={e => e.stopPropagation()}>
            <h3 className="font-medium text-sm mb-3">Add Block</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'text', icon: Type, label: 'Text' },
                { type: 'heading', icon: Heading1, label: 'Heading' },
                { type: 'list', icon: List, label: 'List' },
                { type: 'button', icon: MousePointer, label: 'Button' },
                { type: 'stats', icon: BarChart3, label: 'Stats' },
                { type: 'feature', icon: Star, label: 'Feature' },
                { type: 'quote', icon: Quote, label: 'Quote' },
                { type: 'offer', icon: DollarSign, label: 'Offer' },
              ].map(bt => (
                <button key={bt.type} onClick={() => addBlock(bt.type, addBlockIdx)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex flex-col items-center gap-1">
                  <bt.icon size={14} className="text-violet-400" /><span className="text-xs">{bt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeModal === 'test' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setActiveModal(null)}>
          <div className="bg-gray-900 rounded-xl p-5 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-medium mb-1">Send Test</h3>
            <p className="text-xs text-gray-500 mb-3">Preview before launch</p>
            <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm mb-3" />
            {testSent && <div className="flex items-center gap-2 text-green-400 text-xs mb-3"><CheckCircle size={12} />Sent!</div>}
            <div className="flex gap-2">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-2 border border-gray-700 rounded text-sm">Cancel</button>
              <button onClick={() => { setTestSent(true); setTimeout(() => setTestSent(false), 2000); }} className="flex-1 py-2 bg-violet-600 rounded text-sm font-medium">Send</button>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'spam' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setActiveModal(null)}>
          <div className="bg-gray-900 rounded-xl p-5 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-medium mb-3">Spam Check</h3>
            {!spamScore ? <div className="flex justify-center py-6"><Loader size={20} className="animate-spin text-violet-400" /></div> : (
              <div>
                <div className={`text-center p-3 rounded-lg mb-3 ${spamScore.status === 'good' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                  <div className="text-2xl font-bold">{spamScore.score}/10</div>
                  <div className="text-green-400 text-sm">Low risk</div>
                </div>
                <div className="space-y-2">{spamScore.checks.map((c, i) => <div key={i} className="flex items-center gap-2 p-2 bg-gray-800 rounded text-xs">{c.pass ? <CheckCircle size={12} className="text-green-400" /> : <AlertTriangle size={12} className="text-yellow-400" />}<div><div>{c.name}</div><div className="text-gray-500">{c.detail}</div></div></div>)}</div>
              </div>
            )}
          </div>
        </div>
      )}
      {activeModal === 'deliverability' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setActiveModal(null)}>
          <div className="bg-gray-900 rounded-xl p-5 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="font-medium mb-4">Deliverability</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-gray-800 rounded-lg p-2 text-center"><div className="text-xl font-bold text-green-400">{deliverability.score}%</div><div className="text-xs text-gray-500">Health</div></div>
              <div className="bg-gray-800 rounded-lg p-2 text-center"><div className="text-xl font-bold">{deliverability.inboxRate}%</div><div className="text-xs text-gray-500">Inbox</div></div>
              <div className="bg-gray-800 rounded-lg p-2 text-center"><div className="text-xl font-bold text-yellow-400">{deliverability.spamRate}%</div><div className="text-xs text-gray-500">Spam</div></div>
              <div className="bg-gray-800 rounded-lg p-2 text-center"><div className="text-xl font-bold">{deliverability.bounceRate}%</div><div className="text-xs text-gray-500">Bounce</div></div>
            </div>
            <div className="mb-4"><h4 className="text-sm font-medium mb-2">Authentication</h4><div className="flex gap-2">{deliverability.auth.map(a => <div key={a.name} className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full text-xs text-green-400"><CheckCircle size={10} />{a.name}</div>)}</div></div>
            <div><h4 className="text-sm font-medium mb-2">By Domain</h4>{deliverability.domains.map(d => <div key={d.name} className="flex items-center gap-2 py-1"><span className="text-xs w-20">{d.name}</span><div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${d.rate}%` }} /></div><span className="text-xs text-gray-500 w-8">{d.rate}%</span></div>)}</div>
          </div>
        </div>
      )}
      {activeModal === 'launch' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setActiveModal(null)}>
          <div className="bg-gray-900 rounded-xl p-5 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="font-medium mb-4">Launch Campaign</h3>
            <div className="space-y-2 mb-4">
              <div className="p-2 bg-gray-800 rounded-lg flex items-center gap-2"><Users size={14} className="text-violet-400" /><div><div className="font-medium text-sm">{segment.size.toLocaleString()} recipients</div><div className="text-xs text-gray-500">{segment.name}</div></div></div>
              <div className="p-2 bg-gray-800 rounded-lg flex items-center gap-2"><Mail size={14} className="text-blue-400" /><div><div className="font-medium text-sm">{emails.length} email templates</div><div className="text-xs text-gray-500">AI optimizes timing & selection</div></div></div>
              <div className="p-2 bg-gray-800 rounded-lg flex items-center gap-2"><Megaphone size={14} className="text-purple-400" /><div><div className="font-medium text-sm">{adAudiences.length} ad audiences</div><div className="text-xs text-gray-500">Synced to Meta, Google</div></div></div>
            </div>
            <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg mb-4">
              <div className="text-sm font-medium text-violet-400 mb-1">Rules Summary</div>
              <div className="text-xs text-gray-400">Max {rules.maxEmails} emails over {rules.timeframeDays} days • {rules.maxPerWeek}/week cap • Ads synced {rules.adCoordination.syncFrequency}</div>
            </div>
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4 flex items-start gap-2"><AlertTriangle size={14} className="text-yellow-400 mt-0.5" /><span className="text-xs text-yellow-200">AI will begin sending real emails and syncing ad audiences</span></div>
            <div className="flex gap-2">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-2 border border-gray-700 rounded text-sm">Cancel</button>
              <button onClick={() => { setActiveModal(null); setView('live'); setLiveStats({ sent: 0, opened: 0, clicked: 0, converted: 0, adServed: 0, adClicks: 0 }); setAiActions([]); }} className="flex-1 py-2 bg-green-600 rounded text-sm font-medium flex items-center justify-center gap-1"><Play size={12} />Launch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}