"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Sparkles,
  FileText,
  Tag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useTemplates } from "@/lib/api/hooks/useTemplates";
import { MessageTemplate } from "@/lib/services/template.service";
import { cn } from "@/lib/utils";

export interface StarterPlaybook {
  title: string;
  category: "commerce" | "promotions" | "reminders" | "re_engagement" | "urgent";
  body: string;
  variables: string[];
  badge?: string;
  media_url?: string;
  recommendedThrottle?: string;
}

export const STARTER_PLAYBOOKS: StarterPlaybook[] = [
  {
    title: "⚡ 24-Hour Flash Sale & Exclusive Voucher",
    category: "promotions",
    badge: "🔥 High Conversion",
    recommendedThrottle: "Human Speed (1 msg / 4s)",
    body: "Hey {first_name}! ⚡ For the next 24 hours only, get 25% off our entire catalog with private code FLASH25.\n\nShop the private vault here: https://messagerail.link/flash\n\nStock is strictly limited. Reply to this chat if you have any questions!\n\nReply STOP to unsubscribe.",
    variables: ["first_name"],
  },
  {
    title: "💬 Order Hold & Instant Checkout Closer",
    category: "commerce",
    badge: "⚡ Revenue Closer",
    recommendedThrottle: "Direct Send",
    body: "Hi {first_name}! 👋 We’ve reserved the item you inquired about for the next 4 hours so it doesn't sell out.\n\nComplete your checkout securely via Card, Bank Transfer, or USSD using this direct link:\nhttps://messagerail.link/pay\n\nOnce completed, reply \"PAID\" here and our dispatch team will assign your tracking number immediately!",
    variables: ["first_name"],
  },
  {
    title: "⭐ VIP Private Drop — 48H Advance Access",
    category: "promotions",
    badge: "⭐ VIP Retention",
    recommendedThrottle: "Safe Pace (1 msg / 5s)",
    body: "Hello {first_name}, as one of our top-tier VIP clients, you get exclusive private access to our upcoming release 48 hours before the public.\n\nExplore the secret catalog & reserve your pieces:\nhttps://messagerail.link/vip-access\n\nNeed personal concierge styling? Reply directly to this chat!",
    variables: ["first_name"],
  },
  {
    title: "⏰ Live Masterclass / Event Starts in 1 Hour",
    category: "reminders",
    badge: "📢 85% Attendance",
    recommendedThrottle: "Burst (1 msg / 2s)",
    body: "Quick heads-up {first_name}: Our live session begins in exactly 60 minutes! 🎙️\n\nGrab your notepad, test your audio, and enter the live room here:\nhttps://messagerail.link/live-room\n\nSee you inside!",
    variables: ["first_name"],
  },
  {
    title: "🙏 Special Service & Gathering Invitation",
    category: "reminders",
    badge: "🤝 Community",
    recommendedThrottle: "Safe Pace (1 msg / 4s)",
    body: "Hello {first_name}! We warmly invite you to join us this Sunday for our gathering at 9:00 AM.\n\n📍 In-Person: Main Auditorium\n🌐 Live Stream: https://messagerail.link/live\n\nInvite your family and friends—we look forward to welcoming you!",
    variables: ["first_name"],
  },
  {
    title: "🔥 Restock Alert: Limited Inventory Remaining",
    category: "commerce",
    badge: "⚡ Urgency Scarcity",
    recommendedThrottle: "Human Speed (1 msg / 4s)",
    body: "Great news {first_name}! 🎉 The item you were eyeing is officially BACK IN STOCK, but we only received a shipment of 35 units.\n\nClaim yours before it sells out again: https://messagerail.link/restock\n\nExpress dispatch guaranteed on all orders placed today!",
    variables: ["first_name"],
  },
  {
    title: "💔 We Miss You — Exclusive Comeback Credit",
    category: "re_engagement",
    badge: "🎯 Win-Back",
    recommendedThrottle: "Safe Pace (1 msg / 6s)",
    body: "Hey {first_name}, we noticed it's been a while! We've made massive upgrades to our products and services and would love to welcome you back.\n\nEnjoy a complimentary credit on your next order with voucher WELCOMEBACK: https://messagerail.link/welcome-back\n\nTell us what you think—we read every reply right here in WhatsApp.",
    variables: ["first_name"],
  },
  {
    title: "🛡️ Verified Consent & VIP Channel Re-Confirmation",
    category: "urgent",
    badge: "🛡️ 100% Compliant",
    recommendedThrottle: "Safe Pace (1 msg / 5s)",
    body: "Hello {first_name}! In accordance with global privacy & NDPA consent standards, we want to make sure you still want to receive our VIP broadcasts and exclusive offers.\n\nIf you love our updates, no action is needed! ✨\nIf you prefer to pause broadcasts, simply reply \"STOP\" at any time to instantly unsubscribe.",
    variables: ["first_name"],
  },
  {
    title: "💰 Payday Weekend Special — 48H Bundle Drop",
    category: "promotions",
    badge: "💳 High Volume",
    recommendedThrottle: "Human Speed (1 msg / 4s)",
    body: "Payday is here {first_name}! 💰 Treat yourself this weekend with our exclusive bundle deals, only available to our private subscriber list.\n\nView the weekend bundles: https://messagerail.link/payday\n\nIncludes free shipping nationwide on orders completed before Sunday midnight!",
    variables: ["first_name"],
  },
  {
    title: "🚀 Major Feature Launch & Agency Case Study",
    category: "promotions",
    badge: "🚀 B2B & SaaS",
    recommendedThrottle: "Human Speed (1 msg / 5s)",
    body: "Hey {first_name}, big news! 🚀 We just rolled out our most requested upgrade, engineered to help you 10x your client results with zero manual friction.\n\nRead the full release notes and see the live demo:\nhttps://messagerail.link/announcement\n\nReply \"DEMO\" to hop on a 5-minute walkthrough with our team.",
    variables: ["first_name"],
  },
];

// Backwards-compatibility alias
export const STARTER_TEMPLATES = STARTER_PLAYBOOKS;

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All Playbooks", color: "bg-gray-100 text-gray-700" },
  { id: "commerce", label: "Conversational & DMs", color: "bg-emerald-100 text-emerald-800" },
  { id: "promotions", label: "Flash Drops & Sales", color: "bg-[#e2f6d5] text-[#163300]" },
  { id: "reminders", label: "Events & Gatherings", color: "bg-sky-100 text-sky-800" },
  { id: "re_engagement", label: "Retention & Winback", color: "bg-amber-100 text-amber-800" },
  { id: "urgent", label: "Compliance & Notices", color: "bg-rose-100 text-rose-800" },
];

export interface QuickPlaybookShortcut {
  label: string;
  icon: string;
  title: string;
  body: string;
}

export const QUICK_PLAYBOOK_SHORTCUTS: QuickPlaybookShortcut[] = [
  {
    label: "Flash Deal",
    icon: "⚡",
    title: "⚡ 24-Hour Flash Sale & Exclusive Voucher",
    body: "Hey {first_name}! ⚡ For the next 24 hours only, get 25% off our entire catalog with private code FLASH25.\n\nShop the private vault here: https://messagerail.link/flash\n\nStock is strictly limited. Reply to this chat if you have any questions!\n\nReply STOP to unsubscribe.",
  },
  {
    label: "DM Closer & Payment",
    icon: "💬",
    title: "💬 Order Hold & Instant Checkout Closer",
    body: "Hi {first_name}! 👋 We’ve reserved the item you inquired about for the next 4 hours so it doesn't sell out.\n\nComplete your checkout securely via Card, Bank Transfer, or USSD using this direct link:\nhttps://messagerail.link/pay\n\nOnce completed, reply \"PAID\" here and our dispatch team will assign your tracking number immediately!",
  },
  {
    label: "VIP Early Access",
    icon: "⭐",
    title: "⭐ VIP Private Drop — 48H Advance Access",
    body: "Hello {first_name}, as one of our top-tier VIP clients, you get exclusive private access to our upcoming release 48 hours before the public.\n\nExplore the secret catalog & reserve your pieces:\nhttps://messagerail.link/vip-access\n\nNeed personal concierge styling? Reply directly to this chat!",
  },
  {
    label: "Event in 1 Hour",
    icon: "⏰",
    title: "⏰ Live Masterclass / Event Starts in 1 Hour",
    body: "Quick heads-up {first_name}: Our live session begins in exactly 60 minutes! 🎙️\n\nGrab your notepad, test your audio, and enter the live room here:\nhttps://messagerail.link/live-room\n\nSee you inside!",
  },
  {
    label: "Opt-in Reconfirm",
    icon: "🛡️",
    title: "🛡️ Verified Consent & VIP Channel Re-Confirmation",
    body: "Hello {first_name}! In accordance with global privacy & NDPA consent standards, we want to make sure you still want to receive our VIP broadcasts and exclusive offers.\n\nIf you love our updates, no action is needed! ✨\nIf you prefer to pause broadcasts, simply reply \"STOP\" at any time to instantly unsubscribe.",
  },
];

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: { title: string; body: string; media_url?: string }) => void;
}

export function TemplatePickerModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplatePickerModalProps) {
  const { templates: dbTemplates } = useTemplates();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allTemplates = useMemo(() => {
    const starterFormatted: (Omit<MessageTemplate, "created_at" | "updated_at"> & {
      badge?: string;
      isPlaybook?: boolean;
    })[] = STARTER_PLAYBOOKS.map((p, idx) => ({
      id: `playbook-${idx + 1}`,
      tenant_id: "global",
      title: p.title,
      category: p.category,
      body: p.body,
      variables: p.variables,
      badge: p.badge,
      isPlaybook: true,
    }));

    return [...starterFormatted, ...dbTemplates];
  }, [dbTemplates]);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      const matchesCategory =
        selectedCategory === "all" ||
        t.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [allTemplates, selectedCategory, searchQuery]);

  const getCategoryBadge = (category: string) => {
    const found = TEMPLATE_CATEGORIES.find((c) => c.id === category);
    return found ? found.color : "bg-gray-100 text-gray-700";
  };

  const handleSelect = (tmpl: { title: string; body: string; media_url?: string }) => {
    onSelectTemplate(tmpl);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#163300] flex items-center justify-center shadow-md shadow-[#163300]/10 text-[#9fe870]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    Campaign Playbooks & Templates
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e2f6d5] text-[#163300] border border-[#9fe870]/40">
                      {filteredTemplates.length} available
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500">
                    Battle-tested, high-conversion playbooks designed for immediate launch across global markets.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-100 space-y-3 bg-white">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search playbooks by title, keywords, or variables..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163300]/20 focus:border-[#163300] focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {TEMPLATE_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                        isActive
                          ? "bg-[#163300] text-[#9fe870] shadow-xs font-bold"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
                      )}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No playbooks found</p>
                  <p className="text-xs text-gray-500">Try changing your search query or category filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      layout
                      className="group relative flex flex-col justify-between p-4 rounded-2xl border border-gray-200 hover:border-[#9fe870]/70 bg-white hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                                getCategoryBadge(template.category)
                              )}
                            >
                              {template.category}
                            </span>
                            {"badge" in template && template.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                {template.badge}
                              </span>
                            )}
                          </div>
                          {"isPlaybook" in template && template.isPlaybook ? (
                            <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              Playbook
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-gray-400">
                              Workspace
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#163300] transition-colors line-clamp-1">
                          {template.title}
                        </h3>

                        <p className="text-xs text-gray-600 whitespace-pre-line line-clamp-4 leading-relaxed font-normal bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 font-sans">
                          {template.body}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        {/* Variables Used */}
                        <div className="flex items-center gap-1 overflow-hidden">
                          {template.variables && template.variables.length > 0 ? (
                            template.variables.map((v) => (
                              <span
                                key={v}
                                className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#e2f6d5] text-[#163300] border border-[#9fe870]/30 truncate"
                              >
                                &#123;&#123;{v}&#125;&#125;
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-gray-400 font-medium">Standard text</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleSelect({
                              title: template.title,
                              body: template.body,
                              media_url: template.media_url,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e2f6d5] text-[#163300] hover:bg-[#163300] hover:text-[#9fe870] font-semibold text-xs transition-all shadow-2xs"
                        >
                          Use Playbook
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-[#163300]" />
                Variables like <code className="text-[#163300] bg-[#e2f6d5] px-1 rounded">&#123;first_name&#125;</code> auto-populate for each contact.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
