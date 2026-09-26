"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Tag,
  Copy,
  Trash2,
  Edit3,
  Eye,
  Rocket,
  ArrowRight,
  CheckCircle2,
  X,
  Loader2,
  Layers,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTemplates } from "@/lib/api/hooks/useTemplates";
import { TEMPLATE_CATEGORIES } from "@/components/broadcast/TemplatePickerModal";
import { MessageTemplate } from "@/lib/services/template.service";
import { APP_ROUTES } from "@/lib/constants/routes.const";

const SAMPLE_CONTACT = {
  first_name: "Sarah",
  phone: "+1 (555) 382-9102",
  company: "Apex Media",
};

export default function TemplatesPage() {
  const router = useRouter();
  const { templates: dbTemplates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useTemplates();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("promotions");
  const [formBody, setFormBody] = useState("");
  const [formMediaUrl, setFormMediaUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview Simulator Modal State
  const [previewTemplate, setPreviewTemplate] = useState<{
    id?: string;
    title: string;
    body: string;
    category: string;
    media_url?: string;
  } | null>(null);

  // Textarea ref for inserting tokens at cursor
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredTemplates = useMemo(() => {
    return dbTemplates.filter((t) => {
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
  }, [dbTemplates, selectedCategory, searchQuery]);

  const getCategoryBadge = (category: string) => {
    const found = TEMPLATE_CATEGORIES.find((c) => c.id === category);
    return found ? found.color : "bg-gray-100 text-gray-700";
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormTitle("");
    setFormCategory("promotions");
    setFormBody("");
    setFormMediaUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormTitle(template.title);
    setFormCategory(template.category);
    setFormBody(template.body);
    setFormMediaUrl(template.media_url || "");
    setIsModalOpen(true);
  };

  const handleDuplicate = async (t: { title: string; category: string; body: string; media_url?: string }) => {
    try {
      await createTemplate({
        title: `${t.title} (Copy)`,
        category: t.category,
        body: t.body,
        media_url: t.media_url,
      });
      toast.success("Template duplicated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to duplicate template");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteTemplate(id);
      toast.success("Template deleted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete template");
    }
  };

  const handleUseTemplate = (template: { id?: string; title: string; body: string; media_url?: string }) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "omnipulse_active_template",
        JSON.stringify({
          id: template.id,
          title: template.title,
          body: template.body,
          media_url: template.media_url,
        })
      );
    }
    const query = template.id ? `?templateId=${encodeURIComponent(template.id)}` : "";
    router.push(`${APP_ROUTES.DASHBOARD.BROADCAST}${query}`);
  };

  const handleInsertVariable = (variableToken: string) => {
    if (!textareaRef.current) {
      setFormBody((prev) => `${prev} {{${variableToken}}}`);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formBody;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const tokenString = `{{${variableToken}}}`;
    setFormBody(`${before}${tokenString}${after}`);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tokenString.length, start + tokenString.length);
    }, 10);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Please provide a template title");
      return;
    }
    if (!formBody.trim()) {
      toast.error("Please provide message body content");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, {
          title: formTitle.trim(),
          category: formCategory,
          body: formBody.trim(),
          media_url: formMediaUrl.trim() || undefined,
        });
        toast.success("Template updated successfully!");
      } else {
        await createTemplate({
          title: formTitle.trim(),
          category: formCategory,
          body: formBody.trim(),
          media_url: formMediaUrl.trim() || undefined,
        });
        toast.success("New template saved to your library!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to replace tokens for preview simulator
  const renderPreviewContent = (rawBody: string) => {
    return rawBody
      .replace(/\{\{first_name\}\}/g, SAMPLE_CONTACT.first_name)
      .replace(/\{first_name\}/g, SAMPLE_CONTACT.first_name)
      .replace(/\{\{phone\}\}/g, SAMPLE_CONTACT.phone)
      .replace(/\{phone\}/g, SAMPLE_CONTACT.phone)
      .replace(/\{\{company\}\}/g, SAMPLE_CONTACT.company)
      .replace(/\{username\}/g, "@sarah_apex");
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            <span>Campaigns</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">Template Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-heading">
            Message Template Library
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Save, categorize, and deploy high-converting omnichannel copy with dynamic variables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={APP_ROUTES.DASHBOARD.BROADCAST}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-all shadow-xs"
          >
            <Rocket className="h-4 w-4 text-indigo-600" />
            Go to Broadcast Studio
          </Link>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Templates</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">{dbTemplates.length}</div>
          <p className="text-xs text-gray-500 mt-1">Ready for 1-click broadcast insertion</p>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Variables</span>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {new Set(dbTemplates.flatMap((t) => t.variables || [])).size}
          </div>
          <p className="text-xs text-gray-500 mt-1">Dynamic placeholders in use</p>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Categories</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">{TEMPLATE_CATEGORIES.length - 1}</div>
          <p className="text-xs text-gray-500 mt-1">Promotions, onboarding, notices & more</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates or variables..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
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
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium text-gray-500">Loading template library...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No matching templates</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-5">
            We couldn't find any templates matching your search criteria.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              layout
              className="group relative flex flex-col justify-between p-5 rounded-3xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Header Row: Category Badge & Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg",
                      getCategoryBadge(template.category)
                    )}
                  >
                    {template.category}
                  </span>

                  <span className="text-[10px] font-mono text-gray-400">
                    {template.variables?.length || 0} vars
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {template.title}
                </h3>

                {/* Body Preview */}
                <div className="relative bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-600 whitespace-pre-line line-clamp-5 leading-relaxed font-sans">
                    {template.body}
                  </p>
                </div>

                {/* Variable Pills */}
                <div className="flex flex-wrap items-center gap-1">
                  {template.variables && template.variables.length > 0 ? (
                    template.variables.map((v) => (
                      <span
                        key={v}
                        className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100"
                      >
                        &#123;&#123;{v}&#125;&#125;
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-gray-400">No variables</span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewTemplate({
                        id: template.id,
                        title: template.title,
                        body: template.body,
                        category: template.category,
                        media_url: template.media_url,
                      })
                    }
                    title="Preview with sample recipient data"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(template)}
                    title="Duplicate template"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(template)}
                    title="Edit template"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(template.id, template.title)}
                    title="Delete template"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleUseTemplate(template)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-semibold text-xs transition-all shadow-2xs cursor-pointer"
                >
                  Use Template
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Template Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      {editingTemplate ? "Edit Message Template" : "Create Message Template"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Set up reusable copy and insert dynamic tokens like &#123;&#123;first_name&#125;&#125;.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveTemplate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Template Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. VIP Early Bird 20% Promo"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TEMPLATE_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormCategory(cat.id)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all border",
                          formCategory === cat.id
                            ? "bg-indigo-600 text-white border-transparent shadow-xs"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Body & Variable Tokens */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Message Body <span className="text-rose-500">*</span>
                    </label>

                    {/* Quick Variable Inserters */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-gray-400 font-medium">Insert:</span>
                      <button
                        type="button"
                        onClick={() => handleInsertVariable("first_name")}
                        className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-mono font-bold transition-colors border border-indigo-100"
                      >
                        +&#123;&#123;first_name&#125;&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertVariable("phone")}
                        className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-mono font-bold transition-colors"
                      >
                        +&#123;&#123;phone&#125;&#125;
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={textareaRef}
                    required
                    rows={6}
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    placeholder="Hello {{first_name}}, we're thrilled to introduce our new offering..."
                    className="w-full p-3.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 transition-all placeholder:text-gray-400 font-normal leading-relaxed resize-none shadow-inner"
                  />
                  <span className="text-[11px] text-gray-400 block mt-1">
                    Variables enclosed in <code>&#123;&#123;...&#125;&#125;</code> will be automatically replaced with contact data upon dispatch.
                  </span>
                </div>

                {/* Media URL (Optional) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Media URL <span className="text-gray-400 text-[10px] normal-case">(optional image/banner)</span>
                  </label>
                  <input
                    type="url"
                    value={formMediaUrl}
                    onChange={(e) => setFormMediaUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../banner.jpg"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {editingTemplate ? "Update Template" : "Save to Library"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Preview Simulator Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewTemplate(null)}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900">Simulated Contact View</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="h-7 w-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sample contact pill */}
              <div className="bg-indigo-50/70 border border-indigo-100 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Sample Recipient:</span>
                <span className="font-bold text-indigo-700">Sarah (Apex Media)</span>
              </div>

              {/* Mobile Message Bubble */}
              <div className="bg-[#E7FFDB] rounded-2xl rounded-tl-xs p-4 shadow-xs border border-emerald-100 space-y-2">
                {previewTemplate.media_url && (
                  <div className="rounded-xl overflow-hidden mb-2 border border-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewTemplate.media_url}
                      alt="Banner"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-900 leading-relaxed whitespace-pre-line font-sans">
                  {renderPreviewContent(previewTemplate.body)}
                </p>
                <div className="text-right text-[10px] text-gray-400 font-mono">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ✓✓
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (previewTemplate) {
                      handleUseTemplate(previewTemplate);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  Use This Template
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
