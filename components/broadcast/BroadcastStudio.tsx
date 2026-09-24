"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Radio, 
  Share2, 
  AlertCircle, 
  Eye, 
  Clock, 
  CalendarClock,
  ArrowRight,
  RefreshCw,
  Copy,
  PlusCircle,
  ShieldCheck,
  Smartphone,
  X
} from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useContacts } from "@/lib/api/hooks/useContacts";
import { useTelegramDestinations } from "@/lib/api/hooks/useTelegramDestinations";
import { useTenantChannels } from "@/lib/api/hooks/useTenantChannels";
import { useChannelConnection } from "@/lib/api/hooks/useChannelConnection";
import { useCampaigns } from "@/lib/api/hooks/useCampaigns";
import { channelService } from "@/lib/services/channel.service";
import { WhatsAppQRModal } from "@/components/channels/WhatsAppQRModal";
import { TelegramConnectionForm } from "@/components/features/onboarding/TelegramConnectionForm";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import Link from "next/link";
import { BroadcastSubNav } from "./BroadcastSubNav";
import { ChannelPlacement, ChannelPlacementSelector } from "./ChannelPlacementSelector";
import { MediaAssetDropzone } from "./MediaAssetDropzone";
import { AudienceIntelligence } from "./AudienceIntelligence";
import { DevicePreviewSimulator } from "./DevicePreviewSimulator";
import { WhatsAppStoryModal } from "./WhatsAppStoryModal";
import { LiveMissionTracker } from "./LiveMissionTracker";
import { ScheduleCampaignModal } from "./ScheduleCampaignModal";

export function BroadcastStudio() {
  const { contacts, isLoading: isLoadingContacts, refetch: refetchContacts } = useContacts();
  const { destinations, isLoading: isLoadingDestinations, refetch: refetchDestinations } = useTelegramDestinations();
  const { channels, loading: loadingChannels, refetch: refetchChannels } = useTenantChannels();
  const { connectTelegram, loading: isConnectingTelegram } = useChannelConnection();
  const { createCampaign, dispatchCampaign, scheduleCampaign, isCreating, isDispatching, isScheduling } = useCampaigns();

  // Campaign State
  const [title, setTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedPlacements, setSelectedPlacements] = useState<ChannelPlacement[]>([
    "telegram_dm",
    "telegram_channel",
  ]);
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<string[]>([]);
  // Contact-specific targeting: empty array = send to all eligible contacts
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [dispatchedCampaignId, setDispatchedCampaignId] = useState<string>("");

  // Scheduling state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<string>(""); // datetime-local value
  const [scheduledConfirmed, setScheduledConfirmed] = useState(false);
  const [scheduledCampaignTitle, setScheduledCampaignTitle] = useState("");

  // In-Studio Connection & Sync Modals
  const [isWhatsAppQRModalOpen, setIsWhatsAppQRModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isSyncingWhatsApp, setIsSyncingWhatsApp] = useState(false);
  const [isSyncingTelegram, setIsSyncingTelegram] = useState(false);

  // Channel & Audience Context
  const activeContacts = contacts.filter((c) => c.status === "active");
  const telegramContacts = activeContacts.filter((c) => c.channel === "telegram");
  const whatsappContacts = activeContacts.filter((c) => c.channel === "whatsapp");
  const activeDestinations = destinations.filter((d) => d.status === "active");

  const isTelegramConnected = !!channels.find(
    (c) => c.platform_name === "telegram" && c.status === "active"
  );
  const activeTelegramChannel = channels.find(
    (c) => c.platform_name === "telegram" && c.status === "active"
  );
  const isWhatsAppConnected = !!channels.find(
    (c) => c.platform_name === "whatsapp" && c.status === "active"
  );
  const activeWhatsAppChannel = channels.find(
    (c) => c.platform_name === "whatsapp" && c.status === "active"
  );

  const botUsername = activeTelegramChannel?.sender_identity || "@OmnipulsengBot";
  const verifiedWhatsAppName = activeWhatsAppChannel?.sender_identity || "Omnipulse Business";

  // Automatically enable WhatsApp DM if WhatsApp channel is connected
  useEffect(() => {
    if (isWhatsAppConnected && !selectedPlacements.includes("whatsapp_dm")) {
      setSelectedPlacements((prev) => [...prev, "whatsapp_dm"]);
    }
  }, [isWhatsAppConnected]);

  // Contact Sync Handlers
  const handleSyncWhatsApp = async () => {
    setIsSyncingWhatsApp(true);
    try {
      const res = await channelService.syncWhatsAppContacts();
      await refetchContacts();
      toast.success(res.message || "WhatsApp contacts synced!", {
        description: `Imported ${res.synced_count} contacts to your Audience directory.`,
      });
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || "Failed to sync WhatsApp contacts";
      toast.error(msg, {
        description: "Ensure your WhatsApp is linked and active.",
      });
    } finally {
      setIsSyncingWhatsApp(false);
    }
  };

  const handleSyncTelegram = async () => {
    setIsSyncingTelegram(true);
    try {
      const res = await channelService.syncTelegramContacts();
      await refetchContacts();
      toast.success(res.message || "Telegram contacts synced!", {
        description: `Imported ${res.synced_count} contacts to your Audience directory.`,
      });
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || "Failed to sync Telegram contacts";
      toast.error(msg);
    } finally {
      setIsSyncingTelegram(false);
    }
  };

  const handleTelegramSubmit = async (token: string) => {
    await connectTelegram(token);
    toast.success("Telegram Bot linked successfully!");
    setIsTelegramModalOpen(false);
    await refetchChannels();
    await refetchDestinations();
  };

  // Target Calculations
  const isTelegramDM = selectedPlacements.includes("telegram_dm");
  const isTelegramChannel = selectedPlacements.includes("telegram_channel");
  const isWhatsAppDM = selectedPlacements.includes("whatsapp_dm");
  const isWhatsAppStory = selectedPlacements.includes("whatsapp_story");

  const targetContacts = useMemo(() => {
    return activeContacts.filter((c) => {
      if (isTelegramDM && c.channel === "telegram") return true;
      if (isWhatsAppDM && c.channel === "whatsapp") return true;
      return false;
    });
  }, [activeContacts, isTelegramDM, isWhatsAppDM]);

  const targetCount = useMemo(() => {
    let count = targetContacts.length;
    if (isTelegramChannel) {
      count += selectedDestinationIds.length;
    }
    return count;
  }, [targetContacts.length, isTelegramChannel, selectedDestinationIds.length]);

  const isProcessing = isCreating || isDispatching || isScheduling;

  // Human-readable summary of active placements for the schedule modal
  const channelsSummary = useMemo(() => {
    const parts: string[] = [];
    if (isTelegramDM) parts.push("Telegram DM");
    if (isTelegramChannel) parts.push(`Telegram Channels (${selectedDestinationIds.length})`);
    if (isWhatsAppDM) parts.push("WhatsApp DM");
    if (isWhatsAppStory) parts.push("WhatsApp Story");
    return parts.length > 0 ? parts.join(" · ") : "No channels selected";
  }, [isTelegramDM, isTelegramChannel, isWhatsAppDM, isWhatsAppStory, selectedDestinationIds.length]);

  // Placement Handlers
  const handleTogglePlacement = (placement: ChannelPlacement) => {
    setSelectedPlacements((current) => {
      if (current.includes(placement)) {
        if (current.length === 1) {
          toast.info("Select at least one placement");
          return current;
        }
        return current.filter((p) => p !== placement);
      }
      return [...current, placement];
    });
  };

  const handleToggleDestination = (id: string) => {
    setSelectedDestinationIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleSelectAllDestinations = () => {
    setSelectedDestinationIds(activeDestinations.map((d) => d.id));
  };

  const handleDeselectAllDestinations = () => {
    setSelectedDestinationIds([]);
  };

  const handleInsertToken = (token: string) => {
    setMessageBody((prev) => `${prev}${token} `);
  };

  // Contact targeting handlers
  // eligibleContacts: contacts valid for currently selected private-DM placements
  const eligibleContacts = activeContacts.filter((c) => {
    if (isTelegramDM && c.channel === "telegram") return true;
    if (isWhatsAppDM && c.channel === "whatsapp") return true;
    return false;
  });

  const handleToggleContact = (id: string) => {
    setSelectedContactIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleSelectAllContacts = () => {
    setSelectedContactIds(eligibleContacts.map((c) => c.id));
  };

  const handleDeselectAllContacts = () => {
    setSelectedContactIds([]);
  };

  // Dispatch Handler
  const handleDispatch = async () => {
    if (!title.trim()) {
      toast.error("Campaign Title is required", {
        description: "Please provide a name for this broadcast campaign.",
      });
      return;
    }

    if (!messageBody.trim()) {
      toast.error("Message content is empty", {
        description: "Please compose your message before dispatching.",
      });
      return;
    }

    // Determine targeted platforms for private contacts
    const channelsToSend: string[] = [];
    if (isTelegramDM) channelsToSend.push("telegram");
    if (isWhatsAppDM) channelsToSend.push("whatsapp");

    const hasDestinationTargets = isTelegramChannel && selectedDestinationIds.length > 0;
    const hasContactTargets = channelsToSend.length > 0 && targetContacts.length > 0;

    if (!hasContactTargets && !hasDestinationTargets && !isWhatsAppStory) {
      toast.error("No audience targets selected", {
        description: "Select private contacts, community groups, or WhatsApp Story to broadcast.",
      });
      return;
    }

    // If only WhatsApp Story is selected, guide to the story bridge
    if (!hasContactTargets && !hasDestinationTargets && isWhatsAppStory) {
      setIsStoryModalOpen(true);
      return;
    }

    try {
      const campaign = await createCampaign({
        title: title.trim(),
        message_body: messageBody.trim(),
        delivery_type: "direct_message",
        selected_channels: JSON.stringify(channelsToSend),
        selected_telegram_destination_ids: JSON.stringify(selectedDestinationIds),
        // Pass hand-picked contact IDs (empty array means "all eligible contacts")
        selected_contact_ids: JSON.stringify(selectedContactIds),
        media_url: mediaUrl || undefined,
      });

      await dispatchCampaign(campaign.id);
      setDispatchedCampaignId(campaign.id);
      setDispatched(true);
      toast.success("Broadcast dispatched successfully!");

      // If user also targeted WhatsApp Story, prompt them to post it
      if (isWhatsAppStory) {
        setTimeout(() => setIsStoryModalOpen(true), 800);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to dispatch broadcast";
      toast.error(msg);
    }
  };

  const handleSchedule = async () => {
    if (!title.trim()) {
      toast.error("Campaign Title is required", {
        description: "Please provide a name for this broadcast campaign.",
      });
      return;
    }

    if (!messageBody.trim()) {
      toast.error("Message content is empty", {
        description: "Please compose your message before scheduling.",
      });
      return;
    }

    if (!scheduledAt) {
      toast.error("Schedule time required", {
        description: "Please select a date and time to schedule this campaign.",
      });
      return;
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      toast.error("Invalid schedule time", {
        description: "The scheduled time must be at least 2 minutes in the future.",
      });
      return;
    }

    const channelsToSend: string[] = [];
    if (isTelegramDM) channelsToSend.push("telegram");
    if (isWhatsAppDM) channelsToSend.push("whatsapp");

    const hasDestinationTargets = isTelegramChannel && selectedDestinationIds.length > 0;
    const hasContactTargets = channelsToSend.length > 0 && targetContacts.length > 0;

    if (!hasContactTargets && !hasDestinationTargets && !isWhatsAppStory) {
      toast.error("No audience targets selected", {
        description: "Select private contacts, community groups, or WhatsApp Story to schedule.",
      });
      return;
    }

    try {
      const campaign = await createCampaign({
        title: title.trim(),
        message_body: messageBody.trim(),
        delivery_type: "direct_message",
        selected_channels: JSON.stringify(channelsToSend),
        selected_telegram_destination_ids: JSON.stringify(selectedDestinationIds),
        selected_contact_ids: JSON.stringify(selectedContactIds),
        media_url: mediaUrl || undefined,
      });

      await scheduleCampaign(campaign.id, scheduledDate);
      setScheduledCampaignTitle(title.trim());
      setScheduledConfirmed(true);
      setIsScheduleModalOpen(false);
      toast.success("Campaign scheduled!", {
        description: `Will dispatch at ${scheduledDate.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to schedule campaign";
      toast.error(msg);
    }
  };

  const handleResetStudio = () => {
    setTitle("");
    setMessageBody("");
    setMediaUrl("");
    setSelectedPlacements(["telegram_dm", "telegram_channel"]);
    setSelectedDestinationIds([]);
    setSelectedContactIds([]);
    setDispatched(false);
    setIsScheduleModalOpen(false);
    setScheduledAt("");
    setScheduledConfirmed(false);
    setScheduledCampaignTitle("");
  };

  // If successfully dispatched, show the live mission control tracker
  if (dispatched && dispatchedCampaignId) {
    return (
      <>
        <LiveMissionTracker
          campaignId={dispatchedCampaignId}
          campaignTitle={title}
          initialTargetCount={targetCount}
          selectedPlacements={selectedPlacements}
          mediaUrl={mediaUrl}
          isWhatsAppStory={isWhatsAppStory}
          onReset={handleResetStudio}
          onOpenStoryModal={() => setIsStoryModalOpen(true)}
        />

        {/* WhatsApp Story Bridge Modal */}
        <WhatsAppStoryModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          messageBody={messageBody}
          mediaUrl={mediaUrl}
          brandName={verifiedWhatsAppName}
        />
      </>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto pb-16">
      {/* Sub-Navigation Switcher */}
      <BroadcastSubNav />

      {/* Studio Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            <span>Campaigns</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">Broadcast Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-heading">
            Omnichannel Broadcast Studio
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Agency-grade multi-channel distribution engine with live native simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isWhatsAppStory && (
            <button
              type="button"
              onClick={() => setIsStoryModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80 px-4 py-2.5 text-xs font-bold text-emerald-800 transition-all"
            >
              <Share2 className="h-3.5 w-3.5 text-emerald-600" />
              Preview Story Share
            </button>
          )}

          {/* Schedule for Later — opens modal */}
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            title="Schedule for later"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-xs text-gray-500 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all"
          >
            <CalendarClock className="h-4 w-4" />
            Schedule
          </button>

          {/* Primary Launch Button */}
          <button
            type="button"
            onClick={handleDispatch}
            disabled={isDispatching || isCreating || (targetCount === 0 && !isWhatsAppStory)}
            className={cn(
              "flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md",
              isDispatching || isCreating
                ? "bg-indigo-400 text-white cursor-wait"
                : targetCount > 0 || isWhatsAppStory
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
            )}
          >
            {isDispatching || isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Transmitting...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Launch Broadcast ({targetCount})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scheduled Confirmation Banner */}
      <AnimatePresence>
        {scheduledConfirmed && (
          <motion.div
            key="schedule-confirmed"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  &ldquo;{scheduledCampaignTitle}&rdquo; is scheduled!
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Will dispatch at{" "}
                  {scheduledAt && new Date(scheduledAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}{" "}
                  ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={APP_ROUTES.DASHBOARD.SCHEDULED}
                className="text-emerald-800 hover:text-emerald-950 font-bold text-xs bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg px-3 py-1.5 transition-all inline-flex items-center gap-1.5"
              >
                <CalendarClock className="h-3.5 w-3.5" />
                View in Scheduled Queue →
              </Link>
              <button
                type="button"
                onClick={handleResetStudio}
                className="text-emerald-700 hover:text-emerald-900 font-bold text-xs border border-emerald-300 rounded-lg px-3 py-1.5 hover:bg-emerald-100 transition-all"
              >
                New Campaign
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Channel Pipeline Status Ribbon */}
      <div className="mb-6 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-indigo-600" />
            Active Channels:
          </span>

          {/* Telegram Status Badge */}
          {isTelegramConnected ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800">
              <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
              <FaTelegram className="h-3.5 w-3.5 text-[#0088cc]" />
              <span>Telegram Bot:</span>
              <span className="font-mono text-sky-900">{botUsername}</span>
              <span className="text-sky-600 text-[11px] font-normal">({activeDestinations.length} groups)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              <FaTelegram className="h-3.5 w-3.5 text-gray-400" />
              <span>Telegram: Not Linked</span>
              <button
                type="button"
                onClick={() => setIsTelegramModalOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline ml-1 cursor-pointer"
              >
                + Connect Bot
              </button>
            </div>
          )}

          {/* WhatsApp Status Badge */}
          {isWhatsAppConnected ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <FaWhatsapp className="h-3.5 w-3.5 text-[#25D366]" />
              <span>WhatsApp:</span>
              <span className="font-mono text-emerald-900">{verifiedWhatsAppName}</span>
              <span className="text-emerald-600 text-[11px] font-normal">({whatsappContacts.length} contacts)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              <FaWhatsapp className="h-3.5 w-3.5 text-gray-400" />
              <span>WhatsApp: Not Linked</span>
              <button
                type="button"
                onClick={() => setIsWhatsAppQRModalOpen(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 underline ml-1 cursor-pointer"
              >
                + Link WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Quick Sync Shortcut */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <button
            type="button"
            disabled={isSyncingWhatsApp || isSyncingTelegram}
            onClick={async () => {
              if (isWhatsAppConnected) await handleSyncWhatsApp();
              if (isTelegramConnected) await handleSyncTelegram();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={cn("h-3 w-3", (isSyncingWhatsApp || isSyncingTelegram) && "animate-spin")} />
            Sync Audience
          </button>
        </div>
      </div>

      {/* 2-Column Split Studio Layout (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Composer & Targeting Controls (7 of 12 columns = ~58%) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Campaign Metadata */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Campaign Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Strategic Growth Update & Feature Announcement"
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all shadow-inner"
              />
            </div>

            {/* Placements Selector Component */}
            <ChannelPlacementSelector
              selectedPlacements={selectedPlacements}
              onTogglePlacement={handleTogglePlacement}
              telegramContactCount={telegramContacts.length}
              whatsappContactCount={whatsappContacts.length}
              telegramDestinationCount={activeDestinations.length}
              isTelegramConnected={isTelegramConnected}
              isWhatsAppConnected={isWhatsAppConnected}
              telegramSender={botUsername}
              whatsappSender={verifiedWhatsAppName}
              onConnectTelegram={() => setIsTelegramModalOpen(true)}
              onConnectWhatsApp={() => setIsWhatsAppQRModalOpen(true)}
              onSyncWhatsApp={handleSyncWhatsApp}
              onSyncTelegram={handleSyncTelegram}
              isSyncingWhatsApp={isSyncingWhatsApp}
              isSyncingTelegram={isSyncingTelegram}
            />
          </div>

          {/* Card 2: Message & Creative Composer */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Message Body
                </label>

                {/* Variable Token Insertion Chips */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 font-medium">Insert:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertToken("{first_name}")}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-mono font-bold transition-colors border border-indigo-100"
                    title="Insert recipient first name"
                  >
                    <Sparkles className="h-3 w-3" />
                    {"{first_name}"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertToken("{username}")}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-mono font-bold transition-colors"
                    title="Insert recipient username"
                  >
                    {"{username}"}
                  </button>
                </div>
              </div>

              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={6}
                placeholder="Hey {first_name}! We are excited to announce our newest agency update..."
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-4 text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all resize-none shadow-inner leading-relaxed"
              />

              <div className="flex items-center justify-between mt-1.5 px-1">
                <span className="text-[11px] text-gray-400">
                  Tip: Use clear call-to-actions and concise paragraphs for mobile readability.
                </span>
                <span className="text-xs font-mono text-gray-500 font-medium">
                  {messageBody.length} chars
                </span>
              </div>
            </div>

            {/* Media Asset Dropzone (Cloudinary / CDN) */}
            <MediaAssetDropzone
              mediaUrl={mediaUrl}
              onMediaChange={setMediaUrl}
            />
          </div>

          {/* Card 3: Audience Intelligence & Targeting Context */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
            <AudienceIntelligence
              selectedPlacements={selectedPlacements}
              contacts={contacts}
              destinations={activeDestinations}
              selectedDestinationIds={selectedDestinationIds}
              onToggleDestination={handleToggleDestination}
              onSelectAllDestinations={handleSelectAllDestinations}
              onDeselectAllDestinations={handleDeselectAllDestinations}
              selectedContactIds={selectedContactIds}
              onToggleContact={handleToggleContact}
              onSelectAllContacts={handleSelectAllContacts}
              onDeselectAllContacts={handleDeselectAllContacts}
            />
          </div>
        </div>

        {/* Right Column: Live Mobile Device Simulator (5 of 12 columns = ~42%) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <DevicePreviewSimulator
              messageBody={messageBody}
              mediaUrl={mediaUrl}
              selectedPlacements={selectedPlacements}
              botUsername={botUsername}
              verifiedWhatsAppName={verifiedWhatsAppName}
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Story Bridge Modal */}
      <WhatsAppStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        messageBody={messageBody}
        mediaUrl={mediaUrl}
        brandName={verifiedWhatsAppName}
      />

      {/* Campaign Scheduler Modal */}
      <ScheduleCampaignModal
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        campaignTitle={title}
        targetCount={targetCount}
        channelsSummary={channelsSummary}
        scheduledAt={scheduledAt}
        onScheduledAtChange={setScheduledAt}
        isScheduling={isScheduling || isCreating}
        onConfirm={handleSchedule}
      />

      {/* In-Studio WhatsApp QR Modal */}
      <WhatsAppQRModal
        isOpen={isWhatsAppQRModalOpen}
        onClose={() => setIsWhatsAppQRModalOpen(false)}
        onConnected={async (phone, name) => {
          toast.success("WhatsApp connected!", {
            description: `${name || phone} is now linked and active for broadcasts.`,
          });
          setIsWhatsAppQRModalOpen(false);
          await refetchChannels();
        }}
      />

      {/* In-Studio Telegram Bot Modal */}
      <AnimatePresence>
        {isTelegramModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center">
                    <FaTelegram className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Connect Telegram Bot
                    </h3>
                    <p className="text-xs text-gray-500">
                      Enter your bot token from @BotFather
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTelegramModalOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 font-bold"
                >
                  ✕
                </button>
              </div>

              <TelegramConnectionForm
                onSubmit={handleTelegramSubmit}
                isLoading={isConnectingTelegram}
                onClose={() => setIsTelegramModalOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
