"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, ExternalLink, Loader2, Radio, RefreshCw, Plus, CheckCircle2, ShieldCheck, Key } from "lucide-react";
import { useTenantChannels } from "@/lib/api/hooks/useTenantChannels";
import { useTelegramDestinations } from "@/lib/api/hooks/useTelegramDestinations";
import { useChannelConnection } from "@/lib/api/hooks/useChannelConnection";
import { toast } from "sonner";

function botUsername(senderIdentity?: string) {
  if (!senderIdentity) return "";
  return senderIdentity.startsWith("@") ? senderIdentity.slice(1) : senderIdentity;
}

export default function ConnectionsPage() {
  const { channels, loading: loadingChannels, refetch: refetchChannels } = useTenantChannels();
  const { destinations, isLoading: loadingDestinations, refetch: refetchDestinations } = useTelegramDestinations();
  const { connectTelegram, loading: isConnecting } = useChannelConnection();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [botTokenInput, setBotTokenInput] = useState("");

  const telegramChannel = channels.find((channel) => channel.platform_name === "telegram" && channel.status === "active");
  const username = botUsername(telegramChannel?.sender_identity);
  const addBotUrl = username ? `https://t.me/${username}?startgroup=omnipulse` : "https://t.me/BotFather";

  const handleConnectTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botTokenInput.trim()) {
      return toast.error("Please enter a valid Telegram Bot Token");
    }

    try {
      await connectTelegram(botTokenInput.trim());
      toast.success("Telegram Bot connected & webhook registered!");
      setBotTokenInput("");
      setShowConfigModal(false);
      refetchChannels();
      refetchDestinations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Failed to configure Telegram Bot");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-6xl mx-auto pt-4 pb-12"
    >
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading">
            Connections
          </h1>
          <p className="mt-2 text-gray-500 font-medium">
            Manage connected messaging platforms and discovered broadcast destinations.
          </p>
        </div>
        <button
          onClick={() => setShowConfigModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-md"
        >
          <Plus className="h-4 w-4" />
          {telegramChannel ? "Update Bot Token" : "Connect Telegram Bot"}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        
        {/* Telegram Channel Card */}
        <div className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100 shadow-sm">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Telegram Bot</h2>
                  <p className="text-xs text-gray-500 font-medium">Primary sender for private and group broadcasts</p>
                </div>
              </div>
              {telegramChannel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active
                </span>
              )}
            </div>

            {loadingChannels ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-6"><Loader2 className="h-4 w-4 animate-spin" /> Loading channel configuration...</div>
            ) : telegramChannel ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Connected Bot</p>
                  <p className="text-base font-bold text-gray-900">{telegramChannel.sender_identity}</p>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-1">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    Webhook Registration
                  </div>
                  <p className="text-xs text-indigo-700/80 font-medium">
                    Webhooks route events from Telegram to OmniPulse for zero-data-entry group discovery.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 font-medium">
                No Telegram bot connected yet. Click "Connect Telegram Bot" above to set up your bot token and register your webhook URL!
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
            {telegramChannel && (
              <a
                href={addBotUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-white hover:bg-sky-600 transition-colors shadow-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Add Bot to Group Chat
              </a>
            )}
            <button
              onClick={() => setShowConfigModal(true)}
              className="w-full text-center text-xs font-bold text-gray-500 hover:text-indigo-600 transition-colors py-1"
            >
              {telegramChannel ? "Re-configure Bot Token / Webhook" : "Enter Bot Token"}
            </button>
          </div>
        </div>

        {/* Telegram Groups & Channels Panel */}
        <div className="lg:col-span-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Discovered Groups & Channels</h2>
              <p className="text-xs text-gray-500 font-medium">Auto-discovered targets available in Broadcast Studio</p>
            </div>
            <button 
              onClick={() => refetchDestinations()} 
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
              Refresh
            </button>
          </div>

          {loadingDestinations ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center"><Loader2 className="h-5 w-5 animate-spin text-indigo-600" /> Loading discovered destinations...</div>
          ) : destinations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
              <Radio className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-900 mb-1">No Telegram destinations yet</p>
              <p className="text-xs font-medium text-gray-500 max-w-sm mx-auto">
                Add your bot to a Telegram group or channel as an admin, then send a message there to trigger real-time discovery.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Destination Name</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {destinations.map((destination) => (
                    <tr key={destination.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-gray-900">{destination.title}</td>
                      <td className="px-4 py-3.5 capitalize font-medium text-gray-500">{destination.type}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 capitalize">
                          {destination.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Configure Bot Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Key className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Configure Telegram Bot</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectTelegram} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Bot Token (from @BotFather)
                </label>
                <input
                  type="password"
                  value={botTokenInput}
                  onChange={(e) => setBotTokenInput(e.target.value)}
                  placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQ..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 font-mono font-medium focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  Entering your token will verify the bot with Telegram and automatically register your webhook URL.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {isConnecting ? "Saving & Registering..." : "Save & Register Webhook"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
