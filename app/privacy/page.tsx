import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, RefreshCw, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | MessageRail",
  description: "How MessageRail handles client data, subscriber information, opt-in consent, and GDPR compliance.",
};

export default function PrivacyPage() {
  const lastUpdated = "October 8, 2026";

  return (
    <div className="min-h-screen bg-[#fcfdfa] text-[#0e0f0c] selection:bg-[#9fe870] selection:text-[#163300]">
      {/* ── Navigation Header ── */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#e8ebe6]">
        <div className="max-w-[1100px] mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-full bg-[#163300] flex items-center justify-center text-[#9fe870] font-black text-sm transition-transform group-hover:scale-105">
              MR
            </div>
            <span className="text-xl font-black tracking-tight text-[#0e0f0c] font-heading">
              MessageRail<span className="text-[#9fe870]">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#163300] hover:text-[#054d28] hover:underline underline-offset-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full bg-[#163300] px-4 py-2 text-xs font-bold text-[#9fe870] hover:bg-[#054d28] transition-all"
            >
              Open Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero / Title ── */}
      <section className="pt-16 pb-12 px-4 sm:px-6 bg-[#f4f5f2] border-b border-[#e8ebe6]">
        <div className="max-w-[800px] mx-auto text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/70 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#163300] mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Trust & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading leading-tight">
            Privacy Policy<span className="text-[#9fe870]">.</span>
          </h1>
          <p className="mt-3 text-sm text-[#454745]">
            Last updated: {lastUpdated} · Effective immediately for all MessageRail workspaces and clients.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-14 space-y-12 leading-relaxed text-[#454745]">
        {/* Intro */}
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#163300]" />
            1. Overview & Roles
          </h2>
          <p className="text-sm sm:text-base">
            MessageRail Inc. (&quot;MessageRail&quot;, &quot;we&quot;, &quot;us&quot;) provides a multi-channel campaign operations workspace for teams and agencies managing compliant multi-channel communications.
          </p>
          <p className="text-sm sm:text-base">
            Under international privacy frameworks including the General Data Protection Regulation (GDPR) and UK GDPR:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
            <li>
              <strong>Data Controller:</strong> Your organization is the Data Controller for all customer, subscriber, and contact data you import, capture, or communicate with via MessageRail.
            </li>
            <li>
              <strong>Data Processor:</strong> MessageRail acts strictly as a Data Processor, executing campaign dispatch, message formatting, and delivery monitoring on your behalf.
            </li>
          </ul>
        </section>

        {/* What Information We Collect */}
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#163300]" />
            2. Information We Process
          </h2>
          <div className="rounded-2xl border border-[#e8ebe6] bg-white p-5 space-y-3 text-sm">
            <h3 className="font-bold text-[#0e0f0c]">A. Workspace Account Information</h3>
            <p>
              When you create an account, we collect your name, business email address, company or agency name, and workspace credentials via our authentication provider (Clerk).
            </p>

            <h3 className="font-bold text-[#0e0f0c] pt-2">B. Channel Credentials</h3>
            <p>
              To route campaigns, we store your connected Telegram bot authorization tokens and Meta WhatsApp Business API access tokens and Phone Number IDs. These tokens are stored securely in encrypted databases and are never used outside your workspace&apos;s explicit campaign requests.
            </p>

            <h3 className="font-bold text-[#0e0f0c] pt-2">C. Recipient & Audience Data</h3>
            <p>
              We process phone numbers, Telegram user IDs, dynamic tokens (e.g. first names), and tag assignments solely for the purpose of dispatching campaigns and recording delivery receipts.
            </p>
          </div>
        </section>

        {/* Multi-Tenant Isolation */}
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#163300]" />
            3. Multi-Client Tenant Isolation
          </h2>
          <p className="text-sm sm:text-base">
            For agencies managing outreach for multiple independent clients:
          </p>
          <div className="rounded-2xl bg-[#f4f5f2] border border-[#e8ebe6] p-5 space-y-2 text-sm">
            <p className="font-semibold text-[#0e0f0c]">
              ✓ Strict Workspace Partitioning
            </p>
            <p>
              Every client workspace operates with strict relational tenant isolation. Subscriber lists, campaign templates, bot credentials, and delivery logs in Client A&apos;s workspace cannot be queried or viewed from Client B&apos;s workspace.
            </p>
          </div>
        </section>

        {/* Opt-In & Opt-Out */}
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#163300]" />
            4. Consent, Opt-In & Opt-Out Handling
          </h2>
          <p className="text-sm sm:text-base">
            MessageRail enforces compliant messaging standards:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
            <li>
              <strong>Verified Opt-In Required:</strong> Users are prohibited from sending messages to recipients who have not provided affirmative opt-in consent to receive communications from that brand.
            </li>
            <li>
              <strong>Automated Opt-Out Processing:</strong> Inbound opt-out keywords (such as &quot;STOP&quot;, &quot;UNSUBSCRIBE&quot;) trigger automated suppression flags preventing further automated campaign dispatches to that recipient.
            </li>
            <li>
              <strong>24-Hour WhatsApp Service Windows:</strong> In accordance with Meta&apos;s WhatsApp Business Messaging Policy, free-form non-template messages are restricted to active 24-hour customer care windows.
            </li>
          </ul>
        </section>

        {/* Third-Party Service Providers */}
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading">
            5. Sub-Processors & Platforms
          </h2>
          <p className="text-sm sm:text-base">
            To provide message delivery, MessageRail routes messages directly through the destination platforms:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
            <li><strong>Meta Cloud API (WhatsApp):</strong> For delivering verified WhatsApp Business messages.</li>
            <li><strong>Telegram Bot API:</strong> For broadcasting to Telegram channels, supergroups, and 1:1 bots.</li>
            <li><strong>Neon Database:</strong> For encrypted Postgres storage of campaign and recipient metadata.</li>
            <li><strong>Clerk:</strong> For workspace authentication and multi-factor session security.</li>
          </ul>
        </section>

        {/* Data Retention & Deletion */}
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading">
            6. Data Retention & Your Rights
          </h2>
          <p className="text-sm sm:text-base">
            You maintain full ownership of your data. You may at any time:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
            <li>Export your audience records, tags, and campaign metrics in CSV format.</li>
            <li>Delete audience cohorts, contacts, or entire client workspaces directly from the settings console.</li>
            <li>Revoke connected channel tokens and provider integrations instantly, cutting off all messaging access.</li>
          </ul>
        </section>

        {/* Contact Us */}
        <section className="pt-6 border-t border-[#e8ebe6] space-y-2">
          <h2 className="text-lg font-bold text-[#0e0f0c]">Questions & Data Protection Inquiries</h2>
          <p className="text-sm">
            For questions regarding this Privacy Policy or data processing agreements (DPA) for your agency, please contact our team at:
          </p>
          <p className="text-sm font-mono font-bold text-[#163300]">privacy@messagerail.com</p>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e8ebe6] bg-white py-8 px-4 text-center text-xs text-[#868685]">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <span>© {new Date().getFullYear()} MessageRail Inc.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-[#163300]">Terms</Link>
            <Link href="/security" className="hover:text-[#163300]">Security</Link>
            <Link href="/get-started" className="hover:text-[#163300]">Overview</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
