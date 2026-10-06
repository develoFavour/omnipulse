import { TransmissionItem, FeatureItem, PipelineStep, ComparisonRow, BenchmarkStat } from './types';

export const TRANSMISSIONS: TransmissionItem[] = [
  { text: "WhatsApp DM → +1 (555) 912-8821 delivered", latency: "74ms", channel: "Meta Cloud API" },
  { text: "Mirrored to Telegram 'VIP Growth' Channel", latency: "48ms", channel: "@OmniPulseBot" },
  { text: "Inbound webhook: Captured new contact @sarah_media", latency: "31ms", channel: "Webhook Flywheel" },
  { text: "WhatsApp DM → +44 7700 900142 delivered", latency: "89ms", channel: "Meta Cloud API" },
  { text: "Dispatched to 6 Telegram Subscriber Cohorts", latency: "52ms", channel: "@OmniPulseBot" },
];

export const NAV_LINKS = [
  { label: "Studio", href: "#engine" },
  { label: "Architecture", href: "#architecture" },
  { label: "Connectors", href: "#channels" },
  { label: "Performance", href: "#benchmark" },
] as const;

export const TRUST_BADGES = [
  "Official Meta Cloud API",
  "High-Speed Telegram BotFather",
  "Brevo Transactional Invites",
  "Neon Postgres Multi-Tenant Core",
] as const;

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    step: "01",
    tag: "INGESTION",
    title: "Zero-Data-Entry Capture",
    body: "Inbound contacts indexed instantaneously as users tap /start. Segment automatically using color tags — no CSV exports ever.",
    tags: ["Real-time webhook sync", "Zero manual CSVs"],
  },
  {
    step: "02",
    tag: "COMPOSITION",
    title: "Dynamic Token Assembly",
    body: "Craft templates with instant dynamic placeholder injection. Preview natively in WhatsApp and Telegram simulators before broadcasting.",
    tags: ["Variable tokens", "Mobile simulator preview"],
  },
  {
    step: "03",
    tag: "DISPATCH",
    title: "Parallel Mission Transmission",
    body: "Go worker pools blast both platforms concurrently at 1,200 msgs/min with automated backoff that protects sender health.",
    tags: ["1,200+ msgs/min", "Live retry telemetry"],
  },
];

export const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: "broadcast",
    tag: "BROADCAST STUDIO",
    headline: "Compose Once. Deliver Across WhatsApp & Telegram Concurrently.",
    body: "Stop drafting copy twice. Use our unified message studio with variable substitution, channel toggle switches, and native mobile preview wrappers.",
    stats: [
      { value: "1,200/m", label: "Max Throughput" },
      { value: "< 120ms", label: "Dispatch Latency" },
    ],
  },
  {
    id: "flywheel",
    tag: "INBOUND FLYWHEEL",
    headline: "Turn Telegram /start & WhatsApp Replies into Segmented Audiences.",
    body: "Every incoming message triggers the OmniPulse ingestion flywheel. Automatically attach metadata, tag by campaign source, and route without human intervention.",
    stats: [
      { value: "0", label: "Manual CSVs" },
      { value: "100%", label: "Automated Tagging" },
    ],
  },
  {
    id: "telemetry",
    tag: "MISSION TELEMETRY",
    headline: "Live Telemetry. Zero Silent Deliverability Failures.",
    body: "Watch transmissions stream in real time. Inspect platform-level error codes, automatic exponential retries, and confirmed read receipts on an interactive timeline.",
    stats: [
      { value: "99.8%", label: "Delivery Rate" },
      { value: "3x", label: "Automated Retries" },
    ],
  },
  {
    id: "rbac",
    tag: "AGENCY MULTI-TENANCY",
    headline: "Workspace Isolation Built for Modern Growth Agencies.",
    body: "Invite team members with role-based access control. Separate bot credentials, subscriber lists, and campaign history cleanly across clients.",
    stats: [
      { value: "3", label: "Role Levels (Owner/Admin/Member)" },
      { value: "∞", label: "Isolated Workspaces" },
    ],
  },
];

export const BENCHMARK_STATS: BenchmarkStat[] = [
  { value: 120, prefix: "<", suffix: "ms", label: "Routing Latency", color: "text-[#9fe870]" },
  { value: 99, suffix: ".8%", label: "Verified Delivery", color: "text-white" },
  { value: 100, suffix: "k+", label: "Daily Quota", color: "text-[#9fe870]" },
  { value: 0, suffix: "%", label: "Data Leakage", color: "text-white" },
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Parallel Multi-Channel Blast",
    omni: "✓ Unified WhatsApp & Telegram simultaneously",
    legacy: "✕ Separate tools, double drafting effort",
  },
  {
    feature: "Inbound Contact Capture",
    omni: "✓ Automated real-time webhook flywheel",
    legacy: "✕ Manual CSV exports & imports",
  },
  {
    feature: "Agency Team Multi-Tenancy",
    omni: "✓ Workspace isolation + RBAC (Owner/Admin/Member)",
    legacy: "✕ Shared single-login credentials",
  },
  {
    feature: "Message Variable Substitution",
    omni: "✓ Real-time {{first_name}} & {{company}} tokens",
    legacy: "✕ Static copy or brittle mail-merge scripts",
  },
  {
    feature: "Delivery Telemetry & Mission Tracking",
    omni: "✓ Live Mission Control with instant retry logs",
    legacy: "✕ Silent failures with no audit trail",
  },
];
