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
  Plus,
  Check,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { useTemplates } from "@/lib/api/hooks/useTemplates";
import { MessageTemplate } from "@/lib/services/template.service";
import { cn } from "@/lib/utils";

export const STARTER_TEMPLATES: Omit<MessageTemplate, "id" | "tenant_id" | "created_at" | "updated_at">[] = [
  {
    title: "⚡ Flash 24H Exclusive Deal",
    category: "promotions",
    body: "Hey {{first_name}}! ⚡ For the next 24 hours only, unlock 30% off our premier service bundle with code FLASH30.\n\nClaim your spot here before seats fill up: https://omnipulse.link/flash\n\nReply STOP to opt out.",
    variables: ["first_name"],
  },
  {
    title: "⭐ VIP Early Access Invitation",
    category: "promotions",
    body: "Hello {{first_name}}, as one of our top-tier partners, you get exclusive private access to our upcoming release 48 hours before the public.\n\nExplore the catalog here: https://omnipulse.link/vip-early\n\nNeed assistance? Reply directly to this chat!",
    variables: ["first_name"],
  },
  {
    title: "👋 Welcome to the Community",
    category: "onboarding",
    body: "Hi {{first_name}}! Welcome to our inner circle. 🎉\n\nHere is everything you need to get the most value right away:\n1. Community Guidelines & FAQ\n2. Schedule your 1-on-1 strategy briefing\n\nStay tuned for weekly updates right here on Telegram & WhatsApp!",
    variables: ["first_name"],
  },
  {
    title: "💔 We Miss You — Special Comeback Offer",
    category: "re_engagement",
    body: "Hey {{first_name}}, we noticed it's been a while! We've made huge improvements to our platform and want to welcome you back.\n\nUse voucher WELCOMEBACK for a free credit on your next campaign: https://omnipulse.link/return\n\nLet us know if you need anything!",
    variables: ["first_name"],
  },
  {
    title: "⏰ Event Starts in 1 Hour",
    category: "reminders",
    body: "Quick reminder {{first_name}}: Our live masterclass starts in exactly 60 minutes! 🎙️\n\nHave your questions ready and join the live stream using your secure link:\nhttps://omnipulse.link/room\n\nSee you inside!",
    variables: ["first_name"],
  },
  {
    title: "📢 Important Service Notice",
    category: "urgent",
    body: "Hello {{first_name}}, please note that our service will undergo scheduled maintenance tonight between 2:00 AM and 4:00 AM UTC. No action is required on your part. Thank you for your continued partnership.",
    variables: ["first_name"],
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All Templates", color: "bg-gray-100 text-gray-700" },
  { id: "promotions", label: "Promotions", color: "bg-indigo-100 text-indigo-700" },
  { id: "onboarding", label: "Onboarding", color: "bg-emerald-100 text-emerald-700" },
  { id: "re_engagement", label: "Re-engagement", color: "bg-amber-100 text-amber-700" },
  { id: "reminders", label: "Reminders", color: "bg-sky-100 text-sky-700" },
  { id: "urgent", label: "Urgent & Notices", color: "bg-rose-100 text-rose-700" },
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
  const { templates: dbTemplates, isLoading } = useTemplates();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Merge custom DB templates with starter templates (giving DB templates precedence)
  const allTemplates = useMemo(() => {
    const customList = dbTemplates.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      body: t.body,
      media_url: t.media_url,
      variables: t.variables || [],
      isCustom: true,
    }));

    const starterList = STARTER_TEMPLATES.map((t, index) => ({
      id: `starter_${index}`,
      title: t.title,
      category: t.category,
      body: t.body,
      media_url: t.media_url,
      variables: t.variables || [],
      isCustom: false,
    }));

    return [...customList, ...starterList];
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
                <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-100 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    Template Library
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {filteredTemplates.length} available
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500">
                    Select a high-converting message template to load directly into the Broadcast Studio.
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
                  placeholder="Search templates by title, keywords, or variable..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
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
                          ? "bg-gray-900 text-white shadow-xs"
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
                  <p className="text-sm font-semibold text-gray-700">No templates found</p>
                  <p className="text-xs text-gray-500">Try changing your search query or category filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      layout
                      className="group relative flex flex-col justify-between p-4 rounded-2xl border border-gray-200 hover:border-indigo-400 bg-white hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                              getCategoryBadge(template.category)
                            )}
                          >
                            {template.category}
                          </span>
                          {template.isCustom && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              Custom
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
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
                                className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 truncate"
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-semibold text-xs transition-all shadow-2xs"
                        >
                          Use Template
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
                <Tag className="h-3.5 w-3.5 text-indigo-500" />
                Variables like <code className="text-indigo-600 bg-indigo-50 px-1 rounded">&#123;&#123;first_name&#125;&#125;</code> auto-populate for each contact.
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
