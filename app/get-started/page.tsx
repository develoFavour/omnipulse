import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Users,
  Layers,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";

export const metadata = {
  title: "Get Started with MessageRail | Platform Overview & Guide",
  description: "Learn who MessageRail is built for, how onboarding works, channel connections, compliance safeguards, and how to get started.",
};

export default function GetStartedOverviewPage() {
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
              Start Free Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero / Overview ── */}
      <section className="pt-20 pb-16 px-4 sm:px-6 bg-[#f4f5f2] border-b border-[#e8ebe6]">
        <div className="max-w-[900px] mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e2f6d5] border border-[#9fe870]/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#163300]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Overview & Onboarding Guide</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase text-[#0e0f0c] tracking-tight font-heading leading-[0.98]">
            Plan. Route. Deliver<span className="text-[#9fe870]">.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#454745] max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about setting up MessageRail for your agency, connecting channels, and orchestrating compliant multi-channel campaigns.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#163300] px-8 py-3.5 text-sm font-black text-[#9fe870] hover:bg-[#1f4700] transition-all shadow-md"
            >
              Open Free Workspace <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-full border border-[#163300]/30 px-6 py-3.5 text-sm font-bold text-[#163300] hover:bg-white transition-all"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Main Guide ── */}
      <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-16 space-y-20">
        {/* Section 1: Who it is for */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#163300]">
              Audience & Use Cases
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#0e0f0c] font-heading">
              Who Is MessageRail Built For?
            </h2>
            <p className="text-sm sm:text-base text-[#454745]">
              MessageRail is purpose-built for teams that need to coordinate outreach across multiple clients or channels without risking account bans or juggling disparate browser extensions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-[#e8ebe6] bg-white p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#e2f6d5] text-[#163300] flex items-center justify-center font-bold">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#0e0f0c] text-base">Growth & Marketing Agencies</h3>
              <p className="text-xs text-[#454745] leading-relaxed">
                Manage campaigns for multiple client brands in isolated workspaces with dedicated credentials and separated subscriber databases.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8ebe6] bg-white p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#e2f6d5] text-[#163300] flex items-center justify-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#0e0f0c] text-base">Community & Brand Operators</h3>
              <p className="text-xs text-[#454745] leading-relaxed">
                Publish announcements to Telegram channels while sending personalized direct updates to VIP WhatsApp subscribers simultaneously.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8ebe6] bg-white p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#e2f6d5] text-[#163300] flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#0e0f0c] text-base">Compliance-Conscious Teams</h3>
              <p className="text-xs text-[#454745] leading-relaxed">
                Teams requiring strict opt-in consent records, automatic STOP opt-out suppression, and rate-safe sending to protect sender numbers.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: How Onboarding Works */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#163300]">
              The Core Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#0e0f0c] font-heading">
              The 4-Step Onboarding Process
            </h2>
            <p className="text-sm sm:text-base text-[#454745]">
              Get your first campaign ready in under five minutes without complex infrastructure setup:
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Create Your Workspace",
                desc: "Set your workspace name and invite your team. Each workspace is isolated so client data never mixes.",
              },
              {
                step: "02",
                title: "Connect Your Messaging Channels",
                desc: "Link your verified provider credentials or bot tokens with guided setup. New providers can be added anytime.",
              },
              {
                step: "03",
                title: "Capture or Import Opted-In Contacts",
                desc: "Contacts who send /start to your bot or message your WhatsApp are automatically captured and tagged in real time.",
              },
              {
                step: "04",
                title: "Compose, Preview & Deliver",
                desc: "Write your message with dynamic {{first_name}} variables, preview live on phone simulators, and schedule rate-safe delivery.",
              },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-[#e8ebe6] bg-white p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#163300] text-[#9fe870] font-black flex items-center justify-center text-sm shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-[#0e0f0c] text-sm sm:text-base">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-[#454745] mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Supported Channels */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#163300]">
              Channel Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#0e0f0c] font-heading">
              Supported Channels & Roadmap
            </h2>
            <p className="text-sm sm:text-base text-[#454745]">
              We clearly distinguish between features available in production today and those in active development:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border-2 border-[#163300]/20 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                    <FaWhatsapp className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-[#0e0f0c]">WhatsApp Business API</h3>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                  Available Now
                </span>
              </div>
              <ul className="space-y-2 text-xs text-[#454745]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span>Direct Meta Cloud API integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span>Connect your own verified business phone number</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span>Template variables and 24-hour service window handling</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-[#163300]/20 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#229ED9] flex items-center justify-center text-white">
                    <FaTelegram className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-[#0e0f0c]">Telegram Bot API</h3>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                  Available Now
                </span>
              </div>
              <ul className="space-y-2 text-xs text-[#454745]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span>Native BotFather integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span>Broadcast to channels, supergroups, and 1:1 subscribers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span>Automatic member discovery and chat ID registration</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: What "Compliant" Means */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#163300]">
              Anti-Spam & Delivery Health
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#0e0f0c] font-heading">
              What Does &quot;Compliant&quot; Mean at MessageRail?
            </h2>
            <p className="text-sm sm:text-base text-[#454745]">
              We prioritize your sender reputation and platform standing above raw blasting speed:
            </p>
          </div>

          <div className="rounded-2xl bg-[#f4f5f2] border border-[#e8ebe6] p-6 space-y-4 text-sm text-[#454745]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="font-bold text-[#0e0f0c]">✓ Opt-In Consent Tracking</p>
                <p className="text-xs text-gray-600">Every recipient must have affirmative opt-in consent. Purchased and scraped lists are strictly forbidden.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#0e0f0c]">✓ Automatic Opt-Out Suppression</p>
                <p className="text-xs text-gray-600">Inbound &quot;STOP&quot; replies flag contacts immediately, preventing accidental future messages.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#0e0f0c]">✓ Rate-Safe Pacing</p>
                <p className="text-xs text-gray-600">Dispatches are paced in accordance with Meta and Telegram limits so numbers avoid rate-limit locks.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#0e0f0c]">✓ 24-Hour WhatsApp Service Windows</p>
                <p className="text-xs text-gray-600">Respects customer service window rules to keep your WhatsApp Business account in high standing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: FAQ */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#163300]">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#0e0f0c] font-heading">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 text-sm text-[#454745]">
            <div className="rounded-2xl border border-[#e8ebe6] bg-white p-5 space-y-1.5">
              <h3 className="font-bold text-[#0e0f0c] flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#163300]" />
                Can I connect my own WhatsApp number?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Yes. You connect your own Meta Business Account and WhatsApp Phone Number ID. You maintain full ownership of your phone number and sender identity.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8ebe6] bg-white p-5 space-y-1.5">
              <h3 className="font-bold text-[#0e0f0c] flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#163300]" />
                Is there a free tier to test the platform?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Yes! You can register a free account, create your first workspace, connect test channels, and test the entire drafting and delivery workflow without entering a credit card.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8ebe6] bg-white p-5 space-y-1.5">
              <h3 className="font-bold text-[#0e0f0c] flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#163300]" />
                How are multiple client accounts managed?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Each client operates in an isolated workspace. Each workspace has its own channel credentials, recipient lists, campaign logs, and team member permissions.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="rounded-3xl bg-[#163300] text-white p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="max-w-md mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black uppercase font-heading text-[#9fe870]">
              Ready to Deliver?
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Open your free workspace today and start managing compliant multi-channel campaigns.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9fe870] px-8 py-3.5 text-sm font-black text-[#163300] hover:brightness-105 transition-all shadow-md"
            >
              Start Free Workspace <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e8ebe6] bg-white py-8 px-4 text-center text-xs text-[#868685]">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <span>© {new Date().getFullYear()} MessageRail Inc.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#163300]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#163300]">Terms</Link>
            <Link href="/security" className="hover:text-[#163300]">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
