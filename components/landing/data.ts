import { TransmissionItem, FeatureItem, PipelineStep, ComparisonRow, BenchmarkStat } from './types';

export const TRANSMISSIONS: TransmissionItem[] = [
  { text: "WhatsApp update → +1 (555) 912-8821 delivered", latency: "Delivered", channel: "WhatsApp Cloud API" },
  { text: "Published to Telegram 'VIP Announcements' Channel", latency: "Delivered", channel: "@MessageRailBot" },
  { text: "New opted-in subscriber tagged from WhatsApp reply", latency: "Captured", channel: "Audience Sync" },
  { text: "WhatsApp update → +44 7700 900142 delivered", latency: "Delivered", channel: "WhatsApp Cloud API" },
  { text: "Scheduled 3 client campaigns for 11:00 AM", latency: "Queued", channel: "Campaign Manager" },
];

export const NAV_LINKS = [
  { label: "Studio", href: "#engine" },
  { label: "How It Works", href: "#workflow" },
  { label: "Channels", href: "#channels" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Pricing", href: "#pricing" },
  { label: "Overview", href: "/get-started" },
] as const;

export const TRUST_BADGES = [
  "Separate workspace per client",
  "WhatsApp + Telegram inbox",
  "Campaigns and conversations together",
  "Team assignments and visibility",
] as const;

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    step: "01",
    tag: "CAPTURE",
    title: "Bring Every Client Conversation Together",
    body: "Capture WhatsApp and Telegram replies in the right client workspace, keep contact context attached, and stop losing conversations across separate tools.",
    tags: ["Unified inbox", "Client context"],
  },
  {
    step: "02",
    tag: "COMPOSE",
    title: "Build Campaigns Without Starting Over",
    body: "Create client-ready broadcasts with reusable templates, audience targeting, and personalisation from one campaign workspace.",
    tags: ["Reusable templates", "Audience targeting"],
  },
  {
    step: "03",
    tag: "DELIVER",
    title: "Know What Happened After Send",
    body: "Track delivery status, replies, and conversations that need attention so your team can report clearly and follow up quickly.",
    tags: ["Delivery visibility", "Follow-up clarity"],
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
    id: "flywheel",
    tag: "INBOUND AUDIENCE SYNC",
    headline: "Keep Every Client’s Audience and Conversation Together.",
    body: "Bring replies, contacts, tags, and campaign context into one client workspace so your team can act without searching through disconnected tools.",
    stats: [
      { value: "0", label: "Manual Spreadsheets" },
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
  { value: 0, suffix: " spreadsheets", label: "Zero Manual Imports", color: "text-white" },
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Multi-Channel Simultaneous Reach",
    omni: "✓ Unified multi-channel routing in one workspace",
    legacy: "✕ Disconnected single-channel bots",
  },
  {
    feature: "Inbound Audience Capture",
    omni: "✓ Automatic capture from /start and replies",
    legacy: "✕ Manual CSV exports & messy imports",
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

