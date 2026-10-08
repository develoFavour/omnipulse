import Link from "next/link";
import { ArrowLeft, ShieldCheck, Key, Database, RefreshCw, Lock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Security & Safeguards | MessageRail",
  description: "How MessageRail protects client workspace isolation, token security, encryption, and rate pacing.",
};

export default function SecurityPage() {
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Infrastructure Safeguards</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading leading-tight">
            Security & Safeguards<span className="text-[#9fe870]">.</span>
          </h1>
          <p className="mt-3 text-sm text-[#454745]">
            Last updated: {lastUpdated} · How we safeguard your agency credentials, client databases, and sender reputations.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-14 space-y-12 leading-relaxed text-[#454745]">
        {/* Pillar 1: Tenant Isolation */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#e2f6d5] text-[#163300] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading">
                1. Multi-Client Tenant Isolation
              </h2>
              <span className="text-xs text-gray-500">Zero data bleeding between clients</span>
            </div>
          </div>
          <p className="text-sm sm:text-base">
            For growth marketing agencies managing multiple brands simultaneously, cross-contamination is catastrophic. MessageRail applies strict relational partition keys across every database query.
          </p>
          <div className="rounded-2xl border border-[#e8ebe6] bg-white p-5 space-y-2.5 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#163300] shrink-0 mt-0.5" />
              <span><strong>Tenant-Scoped Queries:</strong> Every database transaction requires an explicit tenant identifier, cryptographically verified from the user session.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#163300] shrink-0 mt-0.5" />
              <span><strong>Segregated Subscriber Catalogs:</strong> Contacts captured for Client A cannot be viewed, exported, or targeted by team members assigned only to Client B.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#163300] shrink-0 mt-0.5" />
              <span><strong>Isolated API Secrets:</strong> Each client workspace maintains dedicated credentials for WhatsApp Phone Number IDs and Telegram bot tokens.</span>
            </div>
          </div>
        </section>

        {/* Pillar 2: Token Security */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#e2f6d5] text-[#163300] flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading">
                2. Credential Encryption & Key Management
              </h2>
              <span className="text-xs text-gray-500">Encrypted in transit and at rest</span>
            </div>
          </div>
          <p className="text-sm sm:text-base">
            Your WhatsApp System User tokens and Telegram bot credentials are encrypted at rest using industry-standard AES-256 encryption. Communications between your browser, our servers, and upstream Meta/Telegram endpoints are strictly transmitted over TLS 1.3.
          </p>
        </section>

        {/* Pillar 3: Rate Pacing & Ban Safeguards */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#e2f6d5] text-[#163300] flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading">
                3. Automated Rate-Pacing Safeguards
              </h2>
              <span className="text-xs text-gray-500">Protecting client sender reputation</span>
            </div>
          </div>
          <p className="text-sm sm:text-base">
            Unregulated message blasts trigger automated account throttling, phone number quality drops, and temporary or permanent bans from upstream messaging providers.
          </p>
          <div className="rounded-2xl bg-[#f4f5f2] border border-[#e8ebe6] p-5 space-y-2 text-sm">
            <p className="font-bold text-[#0e0f0c]">How MessageRail Protects Senders:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#454745]">
              <li><strong>Adaptive Pacing:</strong> Messages are throttled to stay within safe tier boundaries established by destination APIs.</li>
              <li><strong>Backoff Logic:</strong> If an upstream API signals rate saturation (HTTP 429), our dispatcher pauses transmissions and automatically retries with backoff.</li>
              <li><strong>Window Verification:</strong> Messages sent outside the 24-hour customer window on WhatsApp are automatically checked for approved template conformity.</li>
            </ul>
          </div>
        </section>

        {/* Pillar 4: Role-Based Access Control */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#e2f6d5] text-[#163300] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#0e0f0c] font-heading">
                4. Role-Based Access Control (RBAC)
              </h2>
              <span className="text-xs text-gray-500">Owner, Admin, and Member permissions</span>
            </div>
          </div>
          <p className="text-sm sm:text-base">
            Control which team members have authority to launch campaigns, invite collaborators, or modify connected channel credentials. Workspace Owners can restrict bot API keys so campaign copywriters can draft and schedule messages without ever viewing underlying API secrets.
          </p>
        </section>

        {/* Vulnerability Reporting */}
        <section className="pt-6 border-t border-[#e8ebe6] space-y-2">
          <h2 className="text-lg font-bold text-[#0e0f0c]">Responsible Disclosure</h2>
          <p className="text-sm">
            If you believe you have discovered a vulnerability in MessageRail, please report it immediately to our security response team:
          </p>
          <p className="text-sm font-mono font-bold text-[#163300]">security@messagerail.com</p>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e8ebe6] bg-white py-8 px-4 text-center text-xs text-[#868685]">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <span>© {new Date().getFullYear()} MessageRail Inc.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#163300]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#163300]">Terms</Link>
            <Link href="/get-started" className="hover:text-[#163300]">Overview</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
