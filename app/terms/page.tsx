import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertOctagon, Scale, ShieldAlert, Ban } from "lucide-react";

export const metadata = {
  title: "Terms of Service & Anti-Spam Policy | MessageRail",
  description: "Terms of Service, Acceptable Use Policy, and Anti-Spam requirements for MessageRail workspaces.",
};

export default function TermsPage() {
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
            <Scale className="w-3.5 h-3.5" />
            <span>Legal & Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading leading-tight">
            Terms of Service<span className="text-[#9fe870]">.</span>
          </h1>
          <p className="mt-3 text-sm text-[#454745]">
            Last updated: {lastUpdated} · Governs use of the MessageRail platform, APIs, and client workspaces.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-14 space-y-12 leading-relaxed text-[#454745]">
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading">
            1. Acceptance of Terms
          </h2>
          <p className="text-sm sm:text-base">
            By creating an account, accessing, or using MessageRail (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you are registering an agency or organization account, you represent that you have authority to bind that entity.
          </p>
        </section>

        {/* Section 2: Anti-Spam Policy */}
        <section id="anti-spam" className="space-y-4 pt-4">
          <div className="rounded-2xl border-2 border-emerald-800/20 bg-[#f8faf7] p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-[#163300]">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h2 className="text-xl font-black uppercase tracking-tight font-heading">
                2. Strict Anti-Spam & Opt-In Policy
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#163300] font-medium">
              MessageRail is designed exclusively for compliant, permission-based customer engagement. We maintain a zero-tolerance policy for unsolicited bulk messaging (&quot;spam&quot;).
            </p>
            <div className="space-y-3 pt-2 text-sm text-[#454745]">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Affirmative Consent:</strong> You may only dispatch campaigns to recipients who have explicitly opted in to receive messages from the specific brand or client represented in the campaign.</span>
              </div>
              <div className="flex items-start gap-2">
                <Ban className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span><strong>No Purchased or Scraped Lists:</strong> Importing, uploading, or routing messages to third-party lists, purchased contact databases, or scraped phone numbers/handles is strictly forbidden.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Mandatory Opt-Out Mechanism:</strong> All marketing campaigns must include clear instructions for the recipient to opt out (e.g. &quot;Reply STOP to unsubscribe&quot;).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Immediate Suppression:</strong> Once an opt-out is received, MessageRail automatically flags the contact as suppressed and you may not override or re-message that recipient without renewed consent.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Platform Rules */}
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-[#163300]" />
            3. Third-Party Platform Compliance
          </h2>
          <p className="text-sm sm:text-base">
            You agree to comply with all policies set forth by the messaging platforms integrated into your workspace:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
            <li>
              <strong>Meta WhatsApp Business Messaging Policy:</strong> Adhere to template pre-approval rules for business-initiated chats, quality rating thresholds, and customer service window limitations.
            </li>
            <li>
              <strong>Telegram Terms of Service & Bot Policy:</strong> Abide by Telegram limits on group invites, broadcast rate caps, and acceptable content standards.
            </li>
          </ul>
        </section>

        {/* Section 4: Prohibited Content */}
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading">
            4. Prohibited Uses & Content
          </h2>
          <p className="text-sm sm:text-base">
            You may not use MessageRail to transmit:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
            <li>Phishing campaigns, malware, or deceptive financial schemes.</li>
            <li>Unsolicited promotions for adult services, unregulated drugs, or illegal goods.</li>
            <li>Hate speech, harassment, or defamatory material.</li>
            <li>Content that infringes on third-party intellectual property rights.</li>
          </ul>
        </section>

        {/* Section 5: Account Suspension */}
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading">
            5. Monitoring & Suspension on Abuse
          </h2>
          <p className="text-sm sm:text-base">
            To safeguard system deliverability and sender reputation across our platform, MessageRail reserves the right to immediately suspend or terminate any workspace exhibiting:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
            <li>Excessive spam complaints or user block rates reported by Meta or Telegram.</li>
            <li>High delivery failure rates indicative of invalid or scraped phone number lists.</li>
            <li>Attempts to circumvent rate limits or automated opt-out suppression lists.</li>
          </ul>
        </section>

        {/* Section 6: Limitation of Liability */}
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading">
            6. Limitation of Liability & Deliverability Disclaimers
          </h2>
          <p className="text-sm sm:text-base">
            MessageRail routes messages using destination APIs provided by Meta and Telegram. While our platform is engineered to pace transmissions safely, actual message delivery depends upon destination network conditions, recipient device connectivity, and destination platform account standing. MessageRail is not liable for upstream account actions taken by Meta or Telegram against your connected numbers or bot accounts.
          </p>
        </section>

        {/* Contact Us */}
        <section className="pt-6 border-t border-[#e8ebe6] space-y-2">
          <h2 className="text-lg font-bold text-[#0e0f0c]">Legal & Compliance Inquiries</h2>
          <p className="text-sm">
            For questions regarding these terms, report violations, or request acceptable-use clarifications:
          </p>
          <p className="text-sm font-mono font-bold text-[#163300]">legal@messagerail.com</p>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e8ebe6] bg-white py-8 px-4 text-center text-xs text-[#868685]">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <span>© {new Date().getFullYear()} MessageRail Inc.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#163300]">Privacy</Link>
            <Link href="/security" className="hover:text-[#163300]">Security</Link>
            <Link href="/get-started" className="hover:text-[#163300]">Overview</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
