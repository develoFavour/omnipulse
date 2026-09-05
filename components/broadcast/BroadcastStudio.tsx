"use client";

import { useState, useMemo } from "react";
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
  ArrowRight,
  RefreshCw,
  Copy
} from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useContacts } from "@/lib/api/hooks/useContacts";
import { useTelegramDestinations } from "@/lib/api/hooks/useTelegramDestinations";
import { useTenantChannels } from "@/lib/api/hooks/useTenantChannels";
import { useCampaigns } from "@/lib/api/hooks/useCampaigns";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { ChannelPlacement, ChannelPlacementSelector } from "./ChannelPlacementSelector";
import { MediaAssetDropzone } from "./MediaAssetDropzone";
import { AudienceIntelligence } from "./AudienceIntelligence";
import { DevicePreviewSimulator } from "./DevicePreviewSimulator";
import { WhatsAppStoryModal } from "./WhatsAppStoryModal";

export function BroadcastStudio() {
  const { contacts, isLoading: isLoadingContacts } = useContacts();
  const { destinations, isLoading: isLoadingDestinations } = useTelegramDestinations();
  const { channels } = useTenantChannels();
  const { createCampaign, dispatchCampaign, isCreating, isDispatching } = useCampaigns();

  // Campaign State
  const [title, setTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedPlacements, setSelectedPlacements] = useState<ChannelPlacement[]>([
    "telegram_dm",
    "telegram_channel",
  ]);
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<string[]>([]);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [dispatchedCampaignId, setDispatchedCampaignId] = useState<string>("");

  // Channel & Audience Context
  const activeContacts = contacts.filter((c) => c.status === "active");
  const telegramContacts = activeContacts.filter((c) => c.channel === "telegram");
  const whatsappContacts = activeContacts.filter((c) => c.channel === "whatsapp");
  const activeDestinations = destinations.filter((d) => d.status === "active");

  const activeTelegramChannel = channels.find(
    (c) => c.platform_name === "telegram" && c.status === "active"
  );
  const activeWhatsAppChannel = channels.find(
    (c) => c.platform_name === "whatsapp" && c.status === "active"
  );

  const botUsername = activeTelegramChannel?.sender_identity || "@OmnipulsengBot";
  const verifiedWhatsAppName = activeWhatsAppChannel?.sender_identity || "Omnipulse Business";

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

  const isProcessing = isCreating || isDispatching;

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

    // Determine targeted platforms for backend gateway
    const channelsToSend: string[] = [];
    if (isTelegramDM || isTelegramChannel) channelsToSend.push("telegram");
    if (isWhatsAppDM) channelsToSend.push("whatsapp");

    if (channelsToSend.length === 0 && !isWhatsAppStory) {
      toast.error("No active channels selected", {
        description: "Select at least one placement to broadcast.",
      });
      return;
    }

    // If only WhatsApp Story is selected, guide to the story bridge
    if (channelsToSend.length === 0 && isWhatsAppStory) {
      setIsStoryModalOpen(true);
      return;
    }

    if (targetCount === 0 && !isWhatsAppStory) {
      toast.error("No audience targets selected", {
        description: "Your selected placements currently have 0 active recipients.",
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

  const handleResetStudio = () => {
    setTitle("");
    setMessageBody("");
    setMediaUrl("");
    setSelectedPlacements(["telegram_dm", "telegram_channel"]);
    setSelectedDestinationIds([]);
    setDispatched(false);
  };

  // If successfully dispatched, show the mission report view
  if (dispatched) {
    return (
      <div className="max-w-3xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-400">
        <div className="rounded-3xl border border-gray-200/90 bg-white p-10 shadow-xl text-center space-y-8">
          <div className="relative inline-block">
            <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Transmitted to Compliance & Broadcast Queue
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Broadcast Transmitted
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto mt-2 leading-relaxed">
              Campaign <strong className="text-gray-900">&quot;{title}&quot;</strong> has been handed to the compliance pipeline and workers for immediate delivery across {targetCount} touchpoints.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto p-4 bg-gray-50 rounded-2xl border border-gray-200/70 font-mono text-center">
            <div>
              <span className="text-xs font-semibold text-gray-400 block uppercase">Targets</span>
              <span className="text-xl font-bold text-gray-900">{targetCount}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 block uppercase">Channels</span>
              <span className="text-xl font-bold text-gray-900">{selectedPlacements.length}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 block uppercase">Media</span>
              <span className="text-xl font-bold text-emerald-600">{mediaUrl ? "Attached" : "Text"}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={APP_ROUTES.DASHBOARD.ACTIVITY}
              className="px-6 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm transition-all shadow-xs"
            >
              Track in Live Activity Monitor
            </a>

            {isWhatsAppStory && (
              <button
                onClick={() => setIsStoryModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-all shadow-md shadow-emerald-500/20"
              >
                <FaWhatsapp className="h-4 w-4" />
                Post to WhatsApp Story
              </button>
            )}

            <button
              onClick={handleResetStudio}
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/20"
            >
              Compose Another Broadcast
            </button>
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
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto pb-16">
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

          <button
            type="button"
            onClick={handleDispatch}
            disabled={isProcessing || targetCount === 0 && !isWhatsAppStory}
            className={cn(
              "flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md",
              isProcessing
                ? "bg-indigo-400 text-white cursor-wait"
                : targetCount > 0 || isWhatsAppStory
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
            )}
          >
            {isProcessing ? (
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
    </div>
  );
}
