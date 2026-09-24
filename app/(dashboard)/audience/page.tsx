"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Webhook, CheckCircle2, Copy, RefreshCw, Loader2, ExternalLink,
  Bot, Tag as TagIcon, Plus, X, Filter, Trash2, Search, ChevronDown,
  CheckSquare, Square, Pencil, Tags, ArrowUpDown,
} from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { useContacts } from "@/lib/api/hooks/useContacts";
import { useTenantChannels } from "@/lib/api/hooks/useTenantChannels";
import { useTags } from "@/lib/api/hooks/useTags";
import { useAppStore } from "@/lib/store";
import { useState, useMemo, useRef, useEffect } from "react";
import { webhookService } from "@/lib/services/webhook.service";
import { channelService } from "@/lib/services/channel.service";
import { getPlatformIcon } from "@/lib/utils/platform.utils";
import { toast } from "sonner";

const TAG_COLOR_PRESETS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#f97316",
];

type SortKey = "name" | "channel" | "source" | "created_at";
type SortDir = "asc" | "desc";

export default function AudiencePage() {
  const { contacts, isLoading, refetch } = useContacts();
  const { channels } = useTenantChannels();
  const { tags, createTag, deleteTag, tagContact, untagContact, bulkTagContacts, updateTag } = useTags();
  const tenant = useAppStore((state) => state.tenant);

  const [isSimulating, setIsSimulating] = useState(false);
  const [isSyncingWA, setIsSyncingWA] = useState(false);
  const [isSyncingTG, setIsSyncingTG] = useState(false);
  const [showWebhookDetails, setShowWebhookDetails] = useState(false);

  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState<{ id: string; name: string; color: string } | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLOR_PRESETS[0]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isSavingTag, setIsSavingTag] = useState(false);
  const [activeTagDropdownContactId, setActiveTagDropdownContactId] = useState<string | null>(null);

  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [isBulkTagging, setIsBulkTagging] = useState(false);
  const [showBulkTagDropdown, setShowBulkTagDropdown] = useState(false);
  const bulkDropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bulkDropdownRef.current && !bulkDropdownRef.current.contains(e.target as Node)) {
        setShowBulkTagDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeTelegramChannel = channels.find(
    (c) => c.platform_name === "telegram" && c.status === "active"
  );
  const botUsername = activeTelegramChannel?.sender_identity;
  const botLink = botUsername
    ? botUsername.startsWith("@")
      ? `https://t.me/${botUsername.slice(1)}`
      : `https://t.me/${botUsername}`
    : null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const webhookUrl = tenant ? `${apiUrl}/api/v1/webhooks/telegram/${tenant.id}` : "Loading...";

  const handleSyncWhatsApp = async () => {
    setIsSyncingWA(true);
    try {
      const res = await channelService.syncWhatsAppContacts();
      await refetch();
      toast.success(res.message || "WhatsApp contacts synced!", {
        description: `Imported ${res.synced_count} contacts.`,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to sync WhatsApp contacts");
    } finally {
      setIsSyncingWA(false);
    }
  };

  const handleSyncTelegram = async () => {
    setIsSyncingTG(true);
    try {
      const res = await channelService.syncTelegramContacts();
      await refetch();
      if (res.synced_count > 0) {
        toast.success("Telegram Contacts Synced!", { description: `Imported ${res.synced_count} new contact(s).` });
      } else if ((res.total_count ?? 0) > 0) {
        toast.success("Telegram Directory Up to Date");
      } else {
        toast.info("No Telegram Contacts Yet", {
          description: "Users must open your bot and tap Start.",
          action: (res.bot_link || botLink) ? { label: "Open Bot", onClick: () => window.open(res.bot_link || botLink!, "_blank") } : undefined,
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to sync Telegram contacts");
    } finally {
      setIsSyncingTG(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!tenant) return;
    setIsSimulating(true);
    try {
      const payload = {
        update_id: Math.floor(Math.random() * 1000000),
        message: {
          from: {
            id: Math.floor(Math.random() * 1000000000),
            first_name: "TestUser_" + Math.floor(Math.random() * 1000),
            username: "tester_" + Math.floor(Math.random() * 1000),
          },
          text: "/start",
          date: Math.floor(Date.now() / 1000),
        },
      };
      await webhookService.simulateTelegramWebhook(tenant.id, payload);
      await refetch();
      toast.success("Inbound Contact Captured!", { description: `Registered @${payload.message.from.username}.` });
    } catch (error: any) {
      toast.error("Webhook Simulation Failed", { description: error.response?.data?.error || error.message });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsCreatingTag(true);
    try {
      await createTag(newTagName.trim(), newTagColor);
      setNewTagName("");
      setShowCreateTagModal(false);
      toast.success(`Tag created!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleSaveEditTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;
    setIsSavingTag(true);
    try {
      await updateTag(editingTag.id, editingTag.name, editingTag.color);
      setEditingTag(null);
      toast.success("Tag updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update tag");
    } finally {
      setIsSavingTag(false);
    }
  };

  const handleToggleContactTag = async (contactId: string, tagId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) await untagContact(contactId, tagId);
      else await tagContact(contactId, tagId);
      await refetch();
    } catch {
      toast.error("Failed to update contact tag");
    }
  };

  const handleBulkTag = async (tagId: string, action: "assign" | "remove") => {
    if (selectedContactIds.size === 0) return;
    setIsBulkTagging(true);
    setShowBulkTagDropdown(false);
    try {
      await bulkTagContacts(tagId, Array.from(selectedContactIds), action);
      await refetch();
      const tag = tags.find((t) => t.id === tagId);
      toast.success(`"${tag?.name}" ${action === "assign" ? "applied to" : "removed from"} ${selectedContactIds.size} contact(s).`);
      setSelectedContactIds(new Set());
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Bulk tag operation failed");
    } finally {
      setIsBulkTagging(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedContactIds.size === filteredContacts.length) setSelectedContactIds(new Set());
    else setSelectedContactIds(new Set(filteredContacts.map((c) => c.id)));
  };

  const filteredContacts = useMemo(() => {
    let result = contacts;
    if (selectedTagId) result = result.filter((c) => c.tags?.some((t) => t.id === selectedTagId));
    if (channelFilter !== "all") result = result.filter((c) => c.channel === channelFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
          c.routing_value.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      const av = sortKey === "name" ? `${a.first_name} ${a.last_name}`.toLowerCase() : ((a as any)[sortKey] ?? "").toLowerCase?.() ?? (a as any)[sortKey] ?? "";
      const bv = sortKey === "name" ? `${b.first_name} ${b.last_name}`.toLowerCase() : ((b as any)[sortKey] ?? "").toLowerCase?.() ?? (b as any)[sortKey] ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [contacts, selectedTagId, channelFilter, searchQuery, sortKey, sortDir]);

  const allChannels = useMemo(() => Array.from(new Set(contacts.map((c) => c.channel))), [contacts]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const allSelected = filteredContacts.length > 0 && selectedContactIds.size === filteredContacts.length;
  const partiallySelected = selectedContactIds.size > 0 && !allSelected;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-7xl mx-auto pb-24">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading">Audience Directory</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage your synchronized audience across WhatsApp, Telegram, and segmented tags.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleSyncWhatsApp} disabled={isSyncingWA} className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm shadow-emerald-200 disabled:opacity-50">
            {isSyncingWA ? <Loader2 className="h-4 w-4 animate-spin" /> : <FaWhatsapp className="h-4 w-4" />}
            Sync WhatsApp
          </button>
          <button onClick={handleSyncTelegram} disabled={isSyncingTG} className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm shadow-sky-200 disabled:opacity-50">
            {isSyncingTG ? <Loader2 className="h-4 w-4 animate-spin" /> : <FaTelegram className="h-4 w-4" />}
            Sync Telegram
          </button>
          <button onClick={() => refetch()} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 hover:bg-gray-50 transition-colors shadow-xs" title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Inbound Auto-Sync Card */}
      <div className="mb-8 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Webhook className="w-36 h-36 text-indigo-900" /></div>
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200"><Bot className="h-5 w-5" /></div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Zero-Data-Entry Contact Capture</h2>
                <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Automated Inbound Webhook Flywheel</p>
              </div>
            </div>
            {activeTelegramChannel && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Bot: {botUsername}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-gray-600 mb-4 max-w-3xl leading-relaxed">
            Your connected Telegram bot automatically synchronizes contacts the instant a user taps <strong className="text-gray-900">Start</strong> or sends a message.
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            {botLink && (
              <>
                <a href={botLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-[#0088cc] hover:bg-[#0077b5] px-3.5 py-2 text-xs font-bold text-white transition-all shadow-sm">
                  <FaTelegram className="h-3.5 w-3.5" />Test Bot ({botUsername})<ExternalLink className="h-3 w-3 opacity-80" />
                </a>
                <button onClick={() => { navigator.clipboard.writeText(botLink); toast.success("Bot link copied!"); }} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 shadow-xs">
                  <Copy className="h-3.5 w-3.5 text-gray-500" />Copy Bot Link
                </button>
              </>
            )}
            <button onClick={handleSimulateWebhook} disabled={isSimulating || !tenant} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-sm disabled:opacity-50">
              <Webhook className="h-3.5 w-3.5" />{isSimulating ? "Simulating..." : "Simulate Inbound Contact"}
            </button>
            <button onClick={() => setShowWebhookDetails(!showWebhookDetails)} className="text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors ml-auto py-1">
              {showWebhookDetails ? "Hide Webhook URL" : "Show Advanced Webhook URL"}
            </button>
          </div>
          {showWebhookDetails && (
            <div className="mt-3 pt-3 border-t border-indigo-100 flex items-center gap-2">
              <div className="flex-1 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-inner">
                <code className="text-xs text-indigo-600 font-mono font-bold select-all truncate mr-2">{webhookUrl}</code>
                <button onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success("Webhook URL copied"); }} className="text-gray-400 hover:text-indigo-600 shrink-0">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tag Shelf */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-gray-900">Audience Segmentation Tags</h3>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-100">{tags.length} tags</span>
          </div>
          <button onClick={() => setShowCreateTagModal(true)} className="flex items-center gap-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 px-3 py-1.5 text-xs font-bold text-white transition-colors shadow-xs">
            <Plus className="h-3.5 w-3.5" />Create Tag
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button onClick={() => setSelectedTagId(null)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${selectedTagId === null ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            <Filter className="h-3 w-3" />All ({contacts.length})
          </button>
          {tags.map((tag) => {
            const isSelected = selectedTagId === tag.id;
            return (
              <div key={tag.id} className="group relative flex items-center gap-0.5">
                <button
                  onClick={() => setSelectedTagId(isSelected ? null : tag.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${isSelected ? "text-white border-transparent" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"}`}
                  style={{ backgroundColor: isSelected ? tag.color : undefined, borderColor: isSelected ? tag.color : undefined }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: isSelected ? "#fff" : tag.color }} />
                  {tag.name}
                  {tag.contact_count !== undefined && (
                    <span className={`text-[10px] px-1.5 rounded-full ${isSelected ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"}`}>{tag.contact_count}</span>
                  )}
                </button>
                <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity ml-0.5">
                  <button onClick={(e) => { e.stopPropagation(); setEditingTag({ id: tag.id, name: tag.name, color: tag.color }); }} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors" title="Edit tag"><Pencil className="h-3 w-3" /></button>
                  <button onClick={async (e) => { e.stopPropagation(); if (confirm(`Delete tag "${tag.name}"?`)) { await deleteTag(tag.id); if (selectedTagId === tag.id) setSelectedTagId(null); toast.success("Tag deleted."); } }} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Delete tag"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            );
          })}
          {tags.length === 0 && <p className="text-xs font-medium text-gray-400 italic">No tags yet — create one to start segmenting your audience.</p>}
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or routing ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs">
          <option value="all">All Channels</option>
          {allChannels.map((ch) => <option key={ch} value={ch} className="capitalize">{ch}</option>)}
        </select>
      </div>

      {/* Contacts Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">{selectedTagId ? "Segmented Contacts" : "Synced Contacts"}</h3>
            {selectedTagId && <span className="text-xs font-medium text-gray-400">(filtered by tag)</span>}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
            <Users className="h-3.5 w-3.5 text-gray-500" />{filteredContacts.length} Displayed
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
              <tr>
                <th className="pl-6 pr-2 py-4 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-indigo-600 transition-colors">
                    {allSelected ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : partiallySelected ? <CheckSquare className="h-4 w-4 text-indigo-400 opacity-60" /> : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-4 py-4">Channel</th>
                <th className="px-4 py-4 cursor-pointer hover:text-gray-700" onClick={() => handleSort("name")}><div className="flex items-center gap-1">Name<ArrowUpDown className="h-3 w-3 opacity-60" /></div></th>
                <th className="px-4 py-4">Routing ID</th>
                <th className="px-4 py-4">Tags</th>
                <th className="px-4 py-4 cursor-pointer hover:text-gray-700" onClick={() => handleSort("source")}><div className="flex items-center gap-1">Source<ArrowUpDown className="h-3 w-3 opacity-60" /></div></th>
                <th className="px-4 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-500" />
                  Loading contacts...
                </td></tr>
              ) : filteredContacts.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center">
                  <Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-900 font-bold mb-1">
                    {selectedTagId ? "No contacts have this tag yet." : searchQuery ? "No contacts match your search." : "No contacts synced yet."}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {selectedTagId ? "Assign this tag via '+ Tag'." : searchQuery ? "Try a different search term." : "Sync contacts via WhatsApp or Telegram above."}
                  </p>
                </td></tr>
              ) : (
                filteredContacts.map((contact) => {
                  const contactTags = contact.tags || [];
                  const isRowSelected = selectedContactIds.has(contact.id);
                  const isDropdownOpen = activeTagDropdownContactId === contact.id;
                  return (
                    <tr key={contact.id} className={`hover:bg-gray-50 transition-colors ${isRowSelected ? "bg-indigo-50/40" : ""}`}>
                      <td className="pl-6 pr-2 py-3.5">
                        <button onClick={() => toggleSelect(contact.id)} className="text-gray-300 hover:text-indigo-600 transition-colors">
                          {isRowSelected ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : <Square className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 capitalize border border-blue-100">
                          {getPlatformIcon(contact.channel)} {contact.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-900">{contact.first_name} {contact.last_name}</td>
                      <td className="px-4 py-3.5 font-mono text-xs font-medium text-gray-400">{contact.routing_value}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5 relative">
                          {contactTags.map((t) => (
                            <span key={t.id} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold text-white shadow-xs" style={{ backgroundColor: t.color }}>
                              {t.name}
                              <button onClick={() => handleToggleContactTag(contact.id, t.id, true)} className="hover:opacity-75 transition-opacity"><X className="h-2.5 w-2.5" /></button>
                            </span>
                          ))}
                          <div className="relative">
                            <button onClick={() => setActiveTagDropdownContactId(isDropdownOpen ? null : contact.id)} className="rounded-md border border-dashed border-gray-300 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors">+ Tag</button>
                            {isDropdownOpen && (
                              <div className="absolute left-0 top-full mt-1.5 z-40 w-48 rounded-xl bg-white p-2 shadow-xl border border-gray-100 text-xs">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">Assign Tag</div>
                                {tags.length === 0 ? <div className="p-2 text-gray-400">No tags yet.</div> : (
                                  <div className="space-y-0.5 max-h-40 overflow-y-auto">
                                    {tags.map((tag) => {
                                      const isAssigned = contactTags.some((t) => t.id === tag.id);
                                      return (
                                        <button key={tag.id} onClick={async () => { await handleToggleContactTag(contact.id, tag.id, isAssigned); setActiveTagDropdownContactId(null); }}
                                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors ${isAssigned ? "bg-indigo-50 text-indigo-900 font-bold" : "hover:bg-gray-50 text-gray-700"}`}>
                                          <span className="flex items-center gap-1.5 truncate">
                                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                                            <span className="truncate">{tag.name}</span>
                                          </span>
                                          {isAssigned && <CheckCircle2 className="h-3 w-3 text-indigo-600 shrink-0" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 capitalize font-medium text-gray-600">{contact.source.replace("_", " ")}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4" /><span className="capitalize">{contact.status}</span></span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedContactIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-gray-900 border border-gray-700 px-5 py-3.5 shadow-2xl shadow-black/30"
          >
            <span className="text-xs font-bold text-white tabular-nums">{selectedContactIds.size} selected</span>
            <div className="h-4 w-px bg-gray-600" />
            <div className="relative" ref={bulkDropdownRef}>
              <button onClick={() => setShowBulkTagDropdown((v) => !v)} disabled={isBulkTagging || tags.length === 0}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white transition-all disabled:opacity-50">
                {isBulkTagging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TagIcon className="h-3.5 w-3.5" />}
                Bulk Tag<ChevronDown className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {showBulkTagDropdown && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full mb-2 left-0 w-56 rounded-xl bg-white border border-gray-200 shadow-2xl p-2 text-xs overflow-hidden">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1.5">Apply Tag</div>
                    <div className="space-y-0.5 max-h-40 overflow-y-auto mb-2">
                      {tags.map((tag) => (
                        <button key={tag.id} onClick={() => handleBulkTag(tag.id, "assign")} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 text-gray-700 font-medium transition-colors">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />{tag.name}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Remove Tag</div>
                      {tags.map((tag) => (
                        <button key={tag.id} onClick={() => handleBulkTag(tag.id, "remove")} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-red-50 text-gray-600 font-medium transition-colors">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0 opacity-50" style={{ backgroundColor: tag.color }} />{tag.name}<X className="h-3 w-3 ml-auto text-red-400" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setSelectedContactIds(new Set())} className="rounded-xl border border-gray-600 px-3 py-2 text-xs font-bold text-gray-300 hover:bg-gray-800 transition-colors">Clear</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Tag Modal */}
      <AnimatePresence>
        {showCreateTagModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center"><TagIcon className="h-4 w-4 text-indigo-600" /></div>
                  <h3 className="text-base font-bold text-gray-900">Create Audience Tag</h3>
                </div>
                <button onClick={() => setShowCreateTagModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateTag}>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Tag Name</label>
                  <input type="text" required autoFocus placeholder="e.g. VIP, Product Launch, Beta Tester" value={newTagName} onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600" />
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tag Color</label>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {TAG_COLOR_PRESETS.map((c) => (
                      <button key={c} type="button" onClick={() => setNewTagColor(c)} className={`h-7 w-7 rounded-full transition-transform ${newTagColor === c ? "ring-2 ring-offset-2 ring-indigo-600 scale-110" : "hover:scale-105"}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preview:</span>
                    <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: newTagColor }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />{newTagName || "Tag Name"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setShowCreateTagModal(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={isCreatingTag || !newTagName.trim()} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm disabled:opacity-50">
                    {isCreatingTag ? "Creating..." : "Save Tag"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Tag Modal */}
      <AnimatePresence>
        {editingTag && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center"><Pencil className="h-4 w-4 text-amber-600" /></div>
                  <h3 className="text-base font-bold text-gray-900">Edit Tag</h3>
                </div>
                <button onClick={() => setEditingTag(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleSaveEditTag}>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Tag Name</label>
                  <input type="text" required autoFocus value={editingTag.name} onChange={(e) => setEditingTag((t) => t ? { ...t, name: e.target.value } : null)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600" />
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tag Color</label>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {TAG_COLOR_PRESETS.map((c) => (
                      <button key={c} type="button" onClick={() => setEditingTag((t) => t ? { ...t, color: c } : null)} className={`h-7 w-7 rounded-full transition-transform ${editingTag.color === c ? "ring-2 ring-offset-2 ring-indigo-600 scale-110" : "hover:scale-105"}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preview:</span>
                    <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: editingTag.color }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />{editingTag.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setEditingTag(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={isSavingTag || !editingTag.name.trim()} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm disabled:opacity-50">
                    {isSavingTag ? "Saving..." : "Update Tag"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
