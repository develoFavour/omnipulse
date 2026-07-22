"use client";

import { motion } from "framer-motion";
import { Users, Webhook, CheckCircle2, Copy } from "lucide-react";
import { useContacts } from "@/lib/api/hooks/useContacts";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { webhookService } from "@/lib/services/webhook.service";
import { getPlatformIcon } from "@/lib/utils/platform.utils";
import { toast } from "sonner";

export default function AudiencePage() {
  const { contacts, isLoading, refetch } = useContacts();
  const tenant = useAppStore((state) => state.tenant);
  const [isSimulating, setIsSimulating] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const webhookUrl = tenant 
    ? `${apiUrl}/api/v1/webhooks/telegram/${tenant.id}`
    : "Loading...";

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

      // In a real app this hits the public gateway URL, but here we can just post directly to our backend
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
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading">
          Audience Directory
        </h1>
        <p className="mt-2 text-gray-500 font-medium">
          Manage your contacts across all channels.
        </p>
      </div>

      {/* Flywheel Webhook Card */}
      <div className="mb-10 rounded-3xl border border-indigo-100 bg-indigo-50 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Webhook className="w-32 h-32 text-indigo-900" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm border border-indigo-100">
              <Webhook className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-indigo-900">The Zero-Data-Entry Flywheel</h2>
          </div>
          <p className="text-sm font-medium text-indigo-700/80 mb-6 max-w-2xl">
            When users interact with your connected Telegram bots or WhatsApp numbers, their profiles are automatically synced here in real-time. Connect this webhook URL to your Telegram Bot.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-inner w-full">
              <code className="text-sm text-indigo-600 font-mono font-bold select-all truncate mr-4">
                {webhookUrl}
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  toast.success("Webhook URL copied to clipboard");
                }}
                className="text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={handleSimulateWebhook}
              disabled={isSimulating || !tenant}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
            >
              <Webhook className="h-4 w-4" />
              {isSimulating ? "Simulating..." : "Simulate Inbound Message"}
            </button>
          </div>
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
