import { TransmissionItem, FeatureItem, PipelineStep, ComparisonRow, BenchmarkStat } from './types';

export const TRANSMISSIONS: TransmissionItem[] = [
  { text: "Payment of ₦25,000 received via WhatsApp DM link", latency: "Paid", channel: "Paystack Commerce" },
  { text: "Brand approved 'Q4 VIP Flash Drop' via Review Link", latency: "Approved", channel: "Client Portal" },
  { text: "WhatsApp update → +234 802 345 6789 delivered", latency: "Delivered", channel: "WhatsApp API" },
  { text: "Published to Telegram 'VIP Announcements' Channel", latency: "Delivered", channel: "@MessageRailBot" },
  { text: "New subscriber opted in from broadcast reply", latency: "Captured", channel: "Audience Sync" },
  { text: "Campaign generated ₦1,450,000 in verified sales", latency: "Attributed", channel: "Revenue Engine" },
];

export const NAV_LINKS = [
  { label: "Studio", href: "#engine" },
  { label: "Revenue Loop", href: "#workflow" },
  { label: "Channels", href: "#channels" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Pricing", href: "#pricing" },
  { label: "Overview", href: "/get-started" },
] as const;

export const TRUST_BADGES = [
  "Separate workspace per client",
  "WhatsApp + Telegram inbox",
  "1-Click Brand Review Links",
  "In-Chat Paystack Checkout",
  "Live Revenue Attribution",
  "Battle-Tested Playbooks",
] as const;

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    step: "01",
    tag: "APPROVE",
    title: "1-Click Client Review & Sign-Off",
    body: "Send a secure, tokenized review link to brand stakeholders. Clients review live phone simulations and approve copy in one tap without account logins.",
    tags: ["Brand review portal", "Zero client friction"],
  },
  {
    step: "02",
    tag: "DISPATCH",
    title: "Omnichannel Campaign Broadcast",
    body: "Dispatch across WhatsApp and Telegram simultaneously with human-speed rate limiting, NDPA compliance, and 1-click conversion playbooks.",
    tags: ["Simultaneous reach", "Rate-safe pacing"],
  },
  {
    step: "03",
    tag: "CONVERSE",
    title: "Unified Two-Way Inbox & AI",
    body: "Answer incoming replies instantly in a shared team inbox. Backed by workspace-specific knowledge bases and automated AI closing.",
    tags: ["Shared inbox", "AI assistant context"],
  },
  {
    step: "04",
    tag: "COLLECT",
    title: "In-Chat Conversational Commerce",
    body: "Drop 1-click Paystack checkout links inside conversations. Customers pay via Bank Transfer, Card, or USSD without leaving chat.",
    tags: ["Paystack checkout", "Auto customer tagging"],
  },
  {
    step: "05",
    tag: "PROVE",
    title: "Verified Brand Outcome & ROI Reports",
    body: "Show clients exact proof of value: live delivery rates, read receipts, and verified revenue attributed directly to the campaign.",
    tags: ["Verified ROI proof", "Retainer retention"],
  },
];

export const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: "broadcast",
    tag: "CAMPAIGN STUDIO",
    headline: "Launch Client Campaigns Without Switching Tools.",
    body: "Create one campaign, select the client audience, and coordinate delivery across WhatsApp and Telegram from the workspace your team already shares.",
    stats: [
      { value: "2 channels", label: "Simultaneous Reach" },
      { value: "Live", label: "Delivery Tracking" },
    ],
  },
  {
    id: "commerce",
    tag: "CONVERSATIONAL COMMERCE & CHECKOUT",
    headline: "Turn WhatsApp & Telegram Chats Directly into Bank Alerts.",
    body: "Close sales without sending customers away to slow websites or manual bank account numbers. Drop 1-click Paystack checkout links inside conversations, collect payments via Transfer, Card, or USSD, and automatically attribute revenue to the broadcast that started the chat.",
    stats: [
      { value: "1-Click", label: "Paystack Link In-Chat" },
      { value: "100%", label: "Automated ROI Attribution" },
    ],
  },
  {
    id: "review_portal",
    tag: "CLIENT CAMPAIGN REVIEW PORTAL",
    headline: "Client Sign-Off and Revisions Without Account Friction.",
    body: "Stop sending messy screenshots and draft docs over personal WhatsApp. Generate secure, tokenized review pages where brand CMOs review simulation previews, request copy tweaks, or approve broadcasts in seconds.",
    stats: [
      { value: "Zero Login", label: "Secure Token Access" },
      { value: "Live", label: "Simulator Previews" },
    ],
  },
  {
    id: "playbooks",
    tag: "HIGH-CONVERSION CAMPAIGN PLAYBOOKS",
    headline: "Launch In 60 Seconds with Battle-Tested Industry Blueprints.",
    body: "Kill the blank slate. Access pre-built playbooks for Flash Drops, DM Order Closers, VIP Early Access, Event Reminders, and NDPA/GDPR Opt-in Reconfirmations, ready to dispatch with one click.",
    stats: [
      { value: "10+", label: "Battle-Tested Playbooks" },
      { value: "60s", label: "Time to First Broadcast" },
    ],
  },
  {
    id: "flywheel",
    tag: "INBOUND AUDIENCE SYNC",
    headline: "Keep Every Client’s Audience and Conversation Together.",
    body: "Bring replies, contacts, tags, and campaign context into one client workspace so your team can act without searching through disconnected tools.",
    stats: [
      { value: "1-click", label: "Consent-Aware Import" },
      { value: "100%", label: "Automated Tagging" },
    ],
  },
  {
    id: "telemetry",
    tag: "DELIVERY MONITORING",
    headline: "Know Which Client Conversations Need Attention.",
    body: "See delivery activity, inbound replies, assignments, and escalations in one place so client follow-up does not depend on scattered updates.",
    stats: [
      { value: "Real-time", label: "Status Receipts" },
      { value: "Rate-safe", label: "Delivery Pacing" },
    ],
  },
  {
    id: "rbac",
    tag: "AGENCY MULTI-TENANCY",
    headline: "Give Your Team the Right Client Workspace.",
    body: "Keep client channels, contacts, campaigns, and conversation history separated while your team collaborates with clear roles and ownership.",
    stats: [
      { value: "3", label: "Role Levels (Owner/Admin/Member)" },
      { value: "Unlimited", label: "Isolated Workspaces" },
    ],
  },
];

export const BENCHMARK_STATS: BenchmarkStat[] = [
  { value: 2, suffix: " channels", label: "Simultaneous Reach", color: "text-[#9fe870]" },
  { value: 100, suffix: "%", label: "Opt-In Focused", color: "text-white" },
  { value: 3, suffix: " roles", label: "Team Permission Levels", color: "text-[#9fe870]" },
  { value: 0, suffix: " spreadsheets", label: "Live Audience Sync", color: "text-white" },
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Multi-Channel Simultaneous Reach",
    omni: "✓ Unified multi-channel routing in one workspace",
    legacy: "✕ Disconnected single-channel bots",
  },
  {
    feature: "Client Campaign Sign-Off",
    omni: "✓ Public 1-click token review link with live device simulator",
    legacy: "✕ Messy Google Docs, screenshots & email threads",
  },
  {
    feature: "Conversational Commerce",
    omni: "✓ 1-Click Paystack checkout (Card, Transfer, USSD) with automated revenue attribution",
    legacy: "✕ Manually typing bank numbers with zero tracking",
  },
  {
    feature: "Campaign Playbooks",
    omni: "✓ 1-Click proven industry playbooks (Flash Drops, DM Closers, Event Reminders)",
    legacy: "✕ Blank text box with zero conversion guidance",
  },
  {
    feature: "Inbound Audience Capture",
    omni: "✓ Automatic capture from /start and replies, plus consent-aware imports",
    legacy: "✕ Spreadsheet imports with no consent trail",
  },
  {
    feature: "Multi-Client Workspace Isolation",
    omni: "✓ Separate credentials & lists per client",
    legacy: "✕ Mixed client accounts and shared passwords",
  },
  {
    feature: "Personalized Message Variables",
    omni: "✓ Dynamic {{first_name}} and custom tokens",
    legacy: "✕ Generic copy with no personalization",
  },
  {
    feature: "Delivery Visibility & Compliance",
    omni: "✓ Live status tracking + rate-safe pacing",
    legacy: "✕ Blind sending with high ban risk",
  },
];
