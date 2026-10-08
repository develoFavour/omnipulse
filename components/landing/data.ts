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
  { label: "Overview", href: "/get-started" },
] as const;

export const TRUST_BADGES = [
  "Direct WhatsApp Cloud API",
  "Native Telegram Integration",
  "Opted-In Consent Safeguards",
  "Multi-Client Isolated Workspaces",
] as const;

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    step: "01",
    tag: "CAPTURE",
    title: "Zero-Friction Inbound Capture",
    body: "Subscribers join when they tap /start on Telegram or reply on WhatsApp. MessageRail logs opt-in, tags audience interests, and organizes contacts without manual spreadsheets.",
    tags: ["Automated tagging", "No manual spreadsheets"],
  },
  {
    step: "02",
    tag: "COMPOSE",
    title: "Multi-Channel Creative Studio",
    body: "Draft message copy with dynamic personalizations like {{first_name}}. Preview live mobile layouts across device simulators before sending.",
    tags: ["Dynamic personalization", "Live mobile preview"],
  },
  {
    step: "03",
    tag: "DELIVER",
    title: "Compliant Routing & Live Tracking",
    body: "Automated rate pacing prevents platform throttling and protects sender reputation. Monitor real-time delivery status and receipts on an interactive dashboard.",
    tags: ["Rate-safe pacing", "Live delivery status"],
  },
];

export const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: "broadcast",
    tag: "CAMPAIGN STUDIO",
    headline: "Compose Once. Deliver Across Multiple Channels Simultaneously.",
    body: "Stop drafting copy twice. Use a unified message studio with dynamic variables, channel toggles, and native phone simulators to engage opted-in audiences across all your platforms.",
    stats: [
      { value: "2 channels", label: "Simultaneous Reach" },
      { value: "Live", label: "Delivery Tracking" },
    ],
  },
  {
    id: "flywheel",
    tag: "INBOUND AUDIENCE SYNC",
    headline: "Turn Inbound Inquiries Into Segmented Client Audiences.",
    body: "Every incoming conversation automatically captures subscriber details. Attach client tags, segment by campaign source, and keep contact lists updated without human intervention.",
    stats: [
      { value: "0", label: "Manual Spreadsheets" },
      { value: "100%", label: "Automated Tagging" },
    ],
  },
  {
    id: "telemetry",
    tag: "DELIVERY MONITORING",
    headline: "Live Delivery Tracking. Transparent Status Codes.",
    body: "Watch campaign delivery status update in real time. Inspect platform-level status codes, automatic rate-safe pacing, and verified delivery receipts without guesswork.",
    stats: [
      { value: "Real-time", label: "Status Receipts" },
      { value: "Rate-safe", label: "Delivery Pacing" },
    ],
  },
  {
    id: "rbac",
    tag: "AGENCY MULTI-TENANCY",
    headline: "Workspace Isolation Built for Client-Facing Agencies.",
    body: "Invite team members with role-based access control. Separate bot credentials, subscriber lists, and campaign history cleanly across every client brand.",
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

