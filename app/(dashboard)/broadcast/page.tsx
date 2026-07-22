"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Megaphone,
  Send,
  Users,
  CheckCircle2,
  Loader2,
  Sparkles,
  MessageSquareText,
  Radio,
  ChevronRight,
  ChevronLeft,
  Settings2,
  Eye,
  Rocket
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useContacts } from "@/lib/api/hooks/useContacts";
import { useCampaigns } from "@/lib/api/hooks/useCampaigns";
import { useTelegramDestinations } from "@/lib/api/hooks/useTelegramDestinations";
import { APP_ROUTES } from "@/lib/constants/routes.const";

type ContactTargetMode = "all" | "telegram" | "whatsapp" | "none";
type Step = 1 | 2 | 3 | 4;

const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
};

export default function BroadcastPage() {
  const { contacts, isLoading: isLoadingContacts } = useContacts();
  const { destinations, isLoading: isLoadingDestinations } = useTelegramDestinations();
  const { createCampaign, dispatchCampaign, isCreating, isDispatching } = useCampaigns();

  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [contactTargetMode, setContactTargetMode] = useState<ContactTargetMode>("all");
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<string[]>([]);
  const [dispatched, setDispatched] = useState(false);

  const activeContacts = contacts.filter((c) => c.status === "active");
  const telegramContacts = activeContacts.filter((c) => c.channel === "telegram");
  const whatsappContacts = activeContacts.filter((c) => c.channel === "whatsapp");
  const activeDestinations = destinations.filter((d) => d.status === "active");

  const selectedChannels = useMemo(() => {
    if (contactTargetMode === "all") return ["telegram", "whatsapp"];
    if (contactTargetMode === "none") return [];
    return [contactTargetMode];
  }, [contactTargetMode]);

  const contactTargetCount =
    contactTargetMode === "telegram"
      ? telegramContacts.length
      : contactTargetMode === "whatsapp"
        ? whatsappContacts.length
        : contactTargetMode === "none"
          ? 0
          : activeContacts.length;

  const destinationTargetCount = selectedDestinationIds.length;
  const targetCount = contactTargetCount + destinationTargetCount;
  const previewName = telegramContacts[0]?.first_name || activeDestinations[0]?.title || "Alex";
  const previewMessage = messageBody.replace(/\{first_name\}/g, previewName);
  const isProcessing = isCreating || isDispatching;

  const toggleDestination = (id: string) => {
    setSelectedDestinationIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!title.trim()) return toast.error("Please provide a campaign title");
      if (!messageBody.trim()) return toast.error("Message body cannot be empty");
      setStep(2);
    } else if (step === 2) {
      if (targetCount === 0) return toast.error("Select at least one audience target");
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleDispatch = async () => {
    try {
      const campaign = await createCampaign({
        title: title.trim(),
        message_body: messageBody.trim(),
        delivery_type: "direct_message",
        selected_channels: JSON.stringify(selectedChannels),
        selected_telegram_destination_ids: JSON.stringify(selectedDestinationIds),
      });

      await dispatchCampaign(campaign.id);
      setDispatched(true);
      setStep(4);
      toast.success(`Campaign successfully dispatched!`);
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || "Failed to dispatch campaign. Check your setup and try again.";
      toast.error(errMsg);
    }
  };

  const resetFlow = () => {
    setTitle("");
    setMessageBody("");
    setContactTargetMode("all");
    setSelectedDestinationIds([]);
    setDispatched(false);
    setStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-4">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 font-heading tracking-tight">Broadcast Studio</h1>
        <p className="text-gray-500 text-lg">Compose, target, and dispatch omnichannel messages seamlessly.</p>
      </div>

      {/* Progress Indicator */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-12 relative max-w-2xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          
          {[
            { num: 1, label: "Compose", icon: MessageSquareText },
            { num: 2, label: "Audience", icon: Users },
            { num: 3, label: "Review", icon: Eye }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-3 bg-[#f9fafb] px-4 relative z-10">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border-4 transition-all duration-300 shadow-sm bg-white", 
                step === s.num 
                  ? "border-indigo-600 text-indigo-600 scale-110" 
                  : step > s.num 
                    ? "border-indigo-600 bg-indigo-600 text-white" 
                    : "border-gray-200 text-gray-400"
              )}>
                {step > s.num ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={cn(
                "text-sm font-bold transition-colors", 
                step >= s.num ? "text-gray-900" : "text-gray-400"
              )}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={slideUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Campaign Title</label>
                    <input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder='e.g. "Q3 Product Launch Notification"' 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 font-medium placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:bg-white outline-none transition-all text-lg shadow-inner" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold text-gray-900">Message Body</label>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
                        <Sparkles className="h-3.5 w-3.5" />
                        Type {"{first_name}"} to personalize
                      </div>
                    </div>
                    <textarea 
                      value={messageBody} 
                      onChange={(e) => setMessageBody(e.target.value)} 
                      rows={6} 
                      placeholder="Hey {first_name}! We are excited to announce..." 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 font-medium placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:bg-white outline-none transition-all resize-none shadow-inner" 
                    />
                    <div className="flex justify-end mt-2"><span className="text-xs text-gray-400 font-mono font-medium">{messageBody.length} chars</span></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleNext} className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3.5 rounded-xl font-bold transition-all shadow-md">
                  Continue to Audience <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={slideUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600"><Users className="h-5 w-5" /></div>
                    <h2 className="text-lg font-bold text-gray-900">Private Contacts</h2>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Send direct messages to individual subscribers in your workspace.</p>
                  
                  <div className="space-y-3 flex-grow">
                    {[
                      { mode: "all" as ContactTargetMode, label: "All Opt-in Contacts", count: activeContacts.length },
                      { mode: "telegram" as ContactTargetMode, label: "Telegram DMs", count: telegramContacts.length },
                      { mode: "whatsapp" as ContactTargetMode, label: "WhatsApp Subscribers", count: whatsappContacts.length },
                      { mode: "none" as ContactTargetMode, label: "Do not message contacts", count: 0 },
                    ].map((opt) => (
                      <button 
                        key={opt.mode} 
                        onClick={() => setContactTargetMode(opt.mode)} 
                        disabled={opt.mode !== "none" && opt.count === 0} 
                        className={cn(
                          "w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-200", 
                          contactTargetMode === opt.mode 
                            ? "border-emerald-500 bg-emerald-50 shadow-sm" 
                            : "border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200", 
                          opt.mode !== "none" && opt.count === 0 && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span className={cn(
                          "font-bold", 
                          contactTargetMode === opt.mode ? "text-emerald-700" : "text-gray-700"
                        )}>{opt.label}</span>
                        {opt.mode !== "none" && (
                          <span className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-mono font-bold",
                            contactTargetMode === opt.mode ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                          )}>{opt.count}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600"><Megaphone className="h-5 w-5" /></div>
                    <h2 className="text-lg font-bold text-gray-900">Telegram Groups</h2>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Broadcast to entire groups or channels where your bot is an admin.</p>
                  
                  <div className="space-y-3 flex-grow max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoadingDestinations ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-indigo-500 animate-spin" /></div>
                    ) : activeDestinations.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <p className="text-sm font-semibold text-gray-500">No destinations discovered yet.</p>
                      </div>
                    ) : (
                      activeDestinations.map((dest) => {
                        const selected = selectedDestinationIds.includes(dest.id);
                        return (
                          <button 
                            key={dest.id} 
                            onClick={() => toggleDestination(dest.id)} 
                            className={cn(
                              "w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-200", 
                              selected ? "border-cyan-500 bg-cyan-50 shadow-sm" : "border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200"
                            )}
                          >
                            <div>
                              <div className={cn(
                                "font-bold mb-1", 
                                selected ? "text-cyan-800" : "text-gray-900"
                              )}>{dest.title}</div>
                              <div className="text-xs font-semibold text-gray-500 capitalize">{dest.type}</div>
                            </div>
                            <div className={cn(
                              "h-6 w-6 rounded-full border flex items-center justify-center transition-all", 
                              selected ? "border-cyan-600 bg-cyan-600 text-white shadow-inner" : "border-gray-300 bg-white"
                            )}>
                              {selected && <CheckCircle2 className="h-4 w-4" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 px-4 py-2 transition-colors">
                  <ChevronLeft className="h-5 w-5" /> Back
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={targetCount === 0} 
                  className={cn(
                    "flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all shadow-md", 
                    targetCount > 0 ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  )}
                >
                  Review Broadcast <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={slideUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-white p-10 shadow-sm">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2 font-heading tracking-tight">Ready for Liftoff</h2>
                  <p className="text-gray-500 font-medium">Review your campaign details before dispatching to the network.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Summary Stats */}
                  <div className="space-y-6">
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 shadow-inner">
                      <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Campaign</div>
                      <div className="text-lg font-bold text-gray-900">{title}</div>
                    </div>
                    
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 space-y-4 shadow-inner">
                      <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Targeting</div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <span className="text-gray-600 text-sm font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-gray-400" /> Private Contacts</span>
                        <span className="text-gray-900 font-mono font-bold">{contactTargetCount}</span>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <span className="text-gray-600 text-sm font-semibold flex items-center gap-2"><Megaphone className="h-4 w-4 text-gray-400" /> Groups/Channels</span>
                        <span className="text-gray-900 font-mono font-bold">{destinationTargetCount}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-indigo-600 font-bold text-sm flex items-center gap-2"><Rocket className="h-4 w-4" /> Total Dispatch</span>
                        <span className="text-2xl font-extrabold text-indigo-700">{targetCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden flex flex-col">
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                        <Radio className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">Device Preview</div>
                        <div className="text-xs font-semibold text-gray-500">How it looks on destination</div>
                      </div>
                    </div>
                    <div className="p-6 flex-grow bg-gradient-to-b from-gray-100 to-gray-50 flex items-start">
                      <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
                        <p className="text-[15px] font-medium text-gray-800 whitespace-pre-wrap leading-relaxed relative z-10">{previewMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <button onClick={handleBack} disabled={isProcessing} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 px-4 py-2 transition-colors disabled:opacity-50">
                  <ChevronLeft className="h-5 w-5" /> Modify Details
                </button>
                <button onClick={handleDispatch} disabled={isProcessing} className="group relative flex items-center gap-3 bg-[#c8ff55] text-[#0f172a] px-10 py-4 rounded-xl font-extrabold text-lg transition-all hover:scale-[1.02] hover:bg-[#bbf044] shadow-lg shadow-[#c8ff55]/20 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-wait">
                  {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                  <span>{isProcessing ? "Transmitting..." : "Launch Broadcast"}</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && dispatched && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, type: "spring", bounce: 0.4 }} className="py-12">
              <div className="max-w-xl mx-auto text-center space-y-8 bg-white p-12 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full blur-2xl animate-pulse" />
                  <div className="relative h-24 w-24 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 border-4 border-white">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Mission Accomplished</h2>
                  <p className="text-gray-500 text-lg font-medium">
                    Campaign <span className="text-gray-900 font-bold">"{title}"</span> is now in the hands of the compliance engine. Once approved, it will be dispatched to {targetCount} destinations.
                  </p>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href={APP_ROUTES.DASHBOARD.ACTIVITY} className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 font-bold hover:bg-gray-50 transition-colors shadow-sm">
                    Track Progress
                  </a>
                  <button onClick={resetFlow} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-md">
                    Start Another
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
