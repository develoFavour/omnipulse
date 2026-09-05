"use client";

import { motion } from "framer-motion";
import { Users, Webhook, CheckCircle2, Copy, RefreshCw, Loader2, ExternalLink, Bot } from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { useContacts } from "@/lib/api/hooks/useContacts";
import { useTenantChannels } from "@/lib/api/hooks/useTenantChannels";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { webhookService } from "@/lib/services/webhook.service";
import { channelService } from "@/lib/services/channel.service";
import { getPlatformIcon } from "@/lib/utils/platform.utils";
import { toast } from "sonner";

export default function AudiencePage() {
  const { contacts, isLoading, refetch } = useContacts();
  const { channels } = useTenantChannels();
  const tenant = useAppStore((state) => state.tenant);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSyncingWA, setIsSyncingWA] = useState(false);
  const [isSyncingTG, setIsSyncingTG] = useState(false);
  const [showWebhookDetails, setShowWebhookDetails] = useState(false);

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
      toast.success(res.message || "WhatsApp contacts synced!", {
        description: `Imported ${res.synced_count} contacts to your Audience directory.`,
      });
      refetch();
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
      if (res.synced_count > 0) {
        toast.success(res.message || "Telegram contacts synced!", {
          description: `Imported ${res.synced_count} contacts to your Audience directory.`,
        });
        refetch();
      } else {
        toast.info("Telegram Bot Sync Complete", {
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
      // Simulate Telegram webhook payload
      const payload = {
        update_id: Math.floor(Math.random() * 1000000),
        message: {
          from: {
            id: Math.floor(Math.random() * 1000000000),
            first_name: "TestUser_" + Math.floor(Math.random() * 1000),
            last_name: "Smith",
            username: "testuser"
          },
          chat: {
            id: Math.floor(Math.random() * 1000000000),
          },
          text: "/start"
        }
      };

      await webhookService.simulateTelegramWebhook(tenant.id, payload);
      toast.success("Simulated inbound message from Telegram!");
      refetch();
    } catch (error) {
      toast.error("Failed to simulate webhook");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-6xl mx-auto pt-4 pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading">
            Audience Directory
          </h1>
          <p className="mt-2 text-gray-500 font-medium">
            Manage your audience and sync contacts across all channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncWhatsApp}
            disabled={isSyncingWA}
            className="flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] px-5 py-3 text-sm font-bold text-white transition-all shadow-sm disabled:opacity-50"
          >
            {isSyncingWA ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing WhatsApp...
              </>
            ) : (
              <>
                <FaWhatsapp className="h-4 w-4" />
                Sync WhatsApp Contacts
              </>
            )}
          </button>

          <button
            onClick={handleSyncTelegram}
            disabled={isSyncingTG}
            className="flex items-center gap-2 rounded-xl bg-[#0088cc] hover:bg-[#006da3] px-5 py-3 text-sm font-bold text-white transition-all shadow-sm disabled:opacity-50"
          >
            {isSyncingTG ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing Telegram...
              </>
            ) : (
              <>
                <FaTelegram className="h-4 w-4" />
                Sync Telegram Contacts
              </>
            )}
          </button>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition-all"
            title="Refresh Directory"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Inbound Auto-Sync Flywheel Card */}
      <div className="mb-10 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 p-7 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Webhook className="w-36 h-36 text-indigo-900" />
        </div>
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Zero-Data-Entry Contact Capture
                </h2>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Automated Inbound Webhook Flywheel
                </p>
              </div>
            </div>

            {activeTelegramChannel && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Bot: {botUsername}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-gray-600 mb-6 max-w-3xl leading-relaxed">
            Your connected Telegram bot automatically synchronizes contacts the instant a user taps <strong className="text-gray-900">Start</strong> or sends a message. No manual data entry or technical webhook configuration required.
          </p>
          
          <div className="flex flex-wrap items-center gap-3">
            {botLink && (
              <>
                <a
                  href={botLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] px-5 py-3 text-sm font-bold text-white transition-all shadow-sm shadow-sky-200"
                >
                  <FaTelegram className="h-4 w-4" />
                  Test Bot ({botUsername})
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </a>

                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(botLink);
                    toast.success("Bot link copied to clipboard!", {
                      description: "Share this link with your audience to automatically grow your contacts.",
                    });
                  }}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 transition-all shadow-xs"
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                  Share Bot Link
                </button>
              </>
            )}

            <button
              onClick={handleSimulateWebhook}
              disabled={isSimulating || !tenant}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-3 text-sm font-bold text-white transition-all shadow-sm shadow-indigo-200 disabled:opacity-50"
            >
              <Webhook className="h-4 w-4" />
              {isSimulating ? "Simulating..." : "Simulate Inbound Contact"}
            </button>

            <button
              onClick={() => setShowWebhookDetails(!showWebhookDetails)}
              className="text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors ml-auto py-2"
            >
              {showWebhookDetails ? "Hide Webhook Details" : "Show Advanced Webhook URL"}
            </button>
          </div>

          {showWebhookDetails && (
            <div className="mt-4 pt-4 border-t border-indigo-100 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-inner w-full">
                <code className="text-xs text-indigo-600 font-mono font-bold select-all truncate mr-3">
                  {webhookUrl}
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    toast.success("Webhook URL copied to clipboard");
                  }}
                  className="text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
                  title="Copy URL"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                (Registered automatically with Telegram)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <h3 className="text-base font-bold text-gray-900">Synced Contacts</h3>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
            <Users className="h-3.5 w-3.5 text-gray-500" />
            {contacts.length} Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Routing ID</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Loading contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-900 font-bold mb-2">No contacts synced yet.</p>
                    <p className="text-sm font-medium text-gray-500">Simulate an inbound message above to see the flywheel in action.</p>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
