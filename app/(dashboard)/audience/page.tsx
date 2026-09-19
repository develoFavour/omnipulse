"use client";

import { motion } from "framer-motion";
import { Users, Webhook, CheckCircle2, Copy, RefreshCw, Loader2, ExternalLink, Bot, Tag as TagIcon, Plus, X, Filter, Trash2 } from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { useContacts } from "@/lib/api/hooks/useContacts";
import { useTenantChannels } from "@/lib/api/hooks/useTenantChannels";
import { useTags } from "@/lib/api/hooks/useTags";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { webhookService } from "@/lib/services/webhook.service";
import { channelService } from "@/lib/services/channel.service";
import { getPlatformIcon } from "@/lib/utils/platform.utils";
import { toast } from "sonner";

const TAG_COLOR_PRESETS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Rose
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#ec4899", // Pink
];

export default function AudiencePage() {
  const { contacts, isLoading, refetch } = useContacts();
  const { channels } = useTenantChannels();
  const { tags, createTag, deleteTag, tagContact, untagContact } = useTags();
  const tenant = useAppStore((state) => state.tenant);

  const [isSimulating, setIsSimulating] = useState(false);
  const [isSyncingWA, setIsSyncingWA] = useState(false);
  const [isSyncingTG, setIsSyncingTG] = useState(false);
  const [showWebhookDetails, setShowWebhookDetails] = useState(false);

  // Tag filter & modal state
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLOR_PRESETS[0]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [activeTagDropdownContactId, setActiveTagDropdownContactId] = useState<string | null>(null);

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
  const webhookUrl = tenant 
    ? `${apiUrl}/api/v1/webhooks/telegram/${tenant.id}`
    : "Loading...";

  const handleSyncWhatsApp = async () => {
    setIsSyncingWA(true);
    try {
      const res = await channelService.syncWhatsAppContacts();
      await refetch();
      toast.success(res.message || "WhatsApp contacts synced!", {
        description: `Imported ${res.synced_count} contacts to your Audience directory.`,
      });
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || "Failed to sync WhatsApp contacts";
      toast.error(msg, {
        description: "Ensure your WhatsApp is connected under Channels & Connections.",
      });
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
        toast.success("Telegram Contacts Synced!", {
          description: res.message || `Imported ${res.synced_count} new contact(s). Total: ${res.total_count}.`,
        });
      } else if ((res.total_count ?? 0) > 0) {
        toast.success("Telegram Directory Up to Date", {
          description: res.message || `All ${res.total_count} Telegram contact(s) are already synced in your directory.`,
        });
      } else {
        toast.info("No Telegram Contacts Yet", {
          description: res.message || "Users must open your bot and tap Start to be automatically registered.",
          action: (res.bot_link || botLink) ? {
            label: "Open Bot",
            onClick: () => window.open(res.bot_link || botLink!, "_blank"),
          } : undefined,
        });
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || "Failed to sync Telegram contacts";
      toast.error(msg, {
        description: "Ensure your Telegram bot is connected under Channels & Connections.",
      });
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
      toast.success("Inbound Contact Captured!", {
        description: `Registered @${payload.message.from.username} via simulated Telegram webhook.`,
      });
    } catch (error: any) {
      toast.error("Webhook Simulation Failed", {
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCreateNewTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsCreatingTag(true);
    try {
      await createTag(newTagName.trim(), newTagColor);
      setNewTagName("");
      setShowCreateTagModal(false);
      toast.success(`Tag "${newTagName}" created successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleToggleContactTag = async (contactId: string, tagId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        await untagContact(contactId, tagId);
        toast.success("Tag removed from contact");
      } else {
        await tagContact(contactId, tagId);
        toast.success("Tag added to contact");
      }
      await refetch();
    } catch (err: any) {
      toast.error("Failed to update contact tag");
    }
  };

  // Filter contacts by tag if selected
  const filteredContacts = selectedTagId
    ? contacts.filter((c) => c.tags?.some((t) => t.id === selectedTagId))
    : contacts;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto pb-12"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading">
            Audience Directory
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Manage your synchronized audience across WhatsApp, Telegram, and segmented tags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncWhatsApp}
            disabled={isSyncingWA}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm shadow-emerald-200 disabled:opacity-50"
          >
            {isSyncingWA ? <Loader2 className="h-4 w-4 animate-spin" /> : <FaWhatsapp className="h-4 w-4" />}
            Sync WhatsApp
          </button>

          <button
            onClick={handleSyncTelegram}
            disabled={isSyncingTG}
            className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm shadow-sky-200 disabled:opacity-50"
          >
            {isSyncingTG ? <Loader2 className="h-4 w-4 animate-spin" /> : <FaTelegram className="h-4 w-4" />}
            Sync Telegram
          </button>

          <button
            onClick={() => refetch()}
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 hover:bg-gray-50 transition-colors shadow-xs"
            title="Refresh list"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Inbound Auto-Sync Card */}
      <div className="mb-8 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Webhook className="w-36 h-36 text-indigo-900" />
        </div>
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  Zero-Data-Entry Contact Capture
                </h2>
                <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Automated Inbound Webhook Flywheel
                </p>
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
                <a
                  href={botLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-[#0088cc] hover:bg-[#0077b5] px-3.5 py-2 text-xs font-bold text-white transition-all shadow-sm shadow-sky-200"
                >
                  <FaTelegram className="h-3.5 w-3.5" />
                  Test Bot ({botUsername})
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </a>

                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(botLink);
                    toast.success("Bot link copied to clipboard!");
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 transition-all shadow-xs"
                >
                  <Copy className="h-3.5 w-3.5 text-gray-500" />
                  Copy Bot Link
                </button>
              </>
            )}

            <button
              onClick={handleSimulateWebhook}
              disabled={isSimulating || !tenant}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-sm shadow-indigo-200 disabled:opacity-50"
            >
              <Webhook className="h-3.5 w-3.5" />
              {isSimulating ? "Simulating..." : "Simulate Inbound Contact"}
            </button>

            <button
              onClick={() => setShowWebhookDetails(!showWebhookDetails)}
              className="text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors ml-auto py-1"
            >
              {showWebhookDetails ? "Hide Webhook URL" : "Show Advanced Webhook URL"}
            </button>
          </div>

          {showWebhookDetails && (
            <div className="mt-3 pt-3 border-t border-indigo-100 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-inner w-full">
                <code className="text-xs text-indigo-600 font-mono font-bold select-all truncate mr-2">
                  {webhookUrl}
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    toast.success("Webhook URL copied");
                  }}
                  className="text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audience Tag Manager & Segmentation Filter Bar */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-gray-900">Audience Segmentation Tags</h3>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-100">
              {tags.length} tags
            </span>
          </div>

          <button
            onClick={() => setShowCreateTagModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 px-3 py-1.5 text-xs font-bold text-white transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Tag
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedTagId(null)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              selectedTagId === null
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter className="h-3 w-3" />
            All Contacts ({contacts.length})
          </button>

          {tags.map((tag) => {
            const isSelected = selectedTagId === tag.id;
            return (
              <div
                key={tag.id}
                className="group relative flex items-center"
              >
                <button
                  onClick={() => setSelectedTagId(isSelected ? null : tag.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
                    isSelected
                      ? "text-white shadow-xs border-transparent"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                  }`}
                  style={{
                    backgroundColor: isSelected ? tag.color : undefined,
                    borderColor: isSelected ? tag.color : undefined,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: isSelected ? "#ffffff" : tag.color }}
                  />
                  <span>{tag.name}</span>
                  {tag.contact_count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tag.contact_count}
                    </span>
                  )}
                </button>

                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm(`Delete tag "${tag.name}"? This will untag all associated contacts.`)) {
                      await deleteTag(tag.id);
                      if (selectedTagId === tag.id) setSelectedTagId(null);
                      toast.success(`Tag "${tag.name}" deleted.`);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-1 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                  title="Delete tag"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Tag Modal */}
      {showCreateTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">Create Audience Tag</h3>
              </div>
              <button
                onClick={() => setShowCreateTagModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTag}>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tag Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP, Product Launch, Beta Tester"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tag Color
                </label>
                <div className="flex items-center gap-2">
                  {TAG_COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTagColor(c)}
                      className={`h-7 w-7 rounded-full transition-transform ${
                        newTagColor === c ? "ring-2 ring-offset-2 ring-indigo-600 scale-110" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTagModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTag || !newTagName.trim()}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm disabled:opacity-50"
                >
                  {isCreatingTag ? "Creating..." : "Save Tag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contacts Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">
              {selectedTagId ? "Segmented Contacts" : "Synced Contacts"}
            </h3>
            {selectedTagId && (
              <span className="text-xs font-medium text-gray-500">
                (Filtered by tag)
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
            <Users className="h-3.5 w-3.5 text-gray-500" />
            {filteredContacts.length} Displayed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Routing ID</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Loading contacts...
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-900 font-bold mb-1">
                      {selectedTagId ? "No contacts have this tag yet." : "No contacts synced yet."}
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      {selectedTagId ? "Assign this tag to contacts using the '+ Tag' action below." : "Sync contacts via WhatsApp or Telegram above."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const contactTags = contact.tags || [];
                  const isDropdownOpen = activeTagDropdownContactId === contact.id;

                  return (
                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 capitalize border border-blue-100">
                          {getPlatformIcon(contact.channel)} {contact.channel}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-medium text-gray-500">
                        {contact.routing_value}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-1.5 relative">
                          {contactTags.map((t) => (
                            <span
                              key={t.id}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold text-white shadow-xs"
                              style={{ backgroundColor: t.color }}
                            >
                              {t.name}
                              <button
                                onClick={() => handleToggleContactTag(contact.id, t.id, true)}
                                className="hover:opacity-75 transition-opacity"
                                title="Remove tag"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          ))}

                          {/* Tag Assigner Popover Button */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveTagDropdownContactId(isDropdownOpen ? null : contact.id)}
                              className="rounded-md border border-dashed border-gray-300 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                              title="Add tag"
                            >
                              + Tag
                            </button>

                            {isDropdownOpen && (
                              <div className="absolute left-0 top-full mt-1.5 z-40 w-44 rounded-xl bg-white p-2 shadow-xl border border-gray-100 text-xs">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
                                  Assign Tag
                                </div>
                                {tags.length === 0 ? (
                                  <div className="p-2 text-gray-400 text-[11px]">
                                    No tags created yet.
                                  </div>
                                ) : (
                                  <div className="space-y-1 max-h-36 overflow-y-auto">
                                    {tags.map((tag) => {
                                      const isAssigned = contactTags.some((t) => t.id === tag.id);
                                      return (
                                        <button
                                          key={tag.id}
                                          onClick={async () => {
                                            await handleToggleContactTag(contact.id, tag.id, isAssigned);
                                            setActiveTagDropdownContactId(null);
                                          }}
                                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors ${
                                            isAssigned ? "bg-indigo-50 text-indigo-900 font-bold" : "hover:bg-gray-50 text-gray-700"
                                          }`}
                                        >
                                          <span className="flex items-center gap-1.5 truncate">
                                            <span
                                              className="h-2 w-2 rounded-full shrink-0"
                                              style={{ backgroundColor: tag.color }}
                                            />
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
                      <td className="px-6 py-4 capitalize font-medium text-gray-600">
                        {contact.source.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="capitalize">{contact.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
