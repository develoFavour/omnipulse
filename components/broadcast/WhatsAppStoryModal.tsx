"use client";

import { useState } from "react";
import { 
  X, 
  Share2, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  Smartphone, 
  Sparkles,
  Download
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WhatsAppStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageBody: string;
  mediaUrl: string;
  brandName?: string;
}

export function WhatsAppStoryModal({
  isOpen,
  onClose,
  messageBody,
  mediaUrl,
  brandName = "Omnipulse",
}: WhatsAppStoryModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formattedText = messageBody.replace(/\{first_name\}/g, "everyone");

  const handleCopyText = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    toast.success("Story caption copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${brandName} Update`,
          text: formattedText,
          url: mediaUrl || undefined,
        });
        toast.success("Shared via system sheet!");
        onClose();
        return;
      } catch (err) {
        // Fall back to WhatsApp Web link if cancelled or unsupported
      }
    }

    // Direct WhatsApp web/deep-link fallback
    const encoded = encodeURIComponent(formattedText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp to post to Status!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 transition-colors shadow-xs"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 9:16 Story Preview Card (Left on Desktop) */}
        <div className="w-full md:w-[240px] shrink-0 bg-gray-950 p-4 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="relative w-full max-w-[200px] aspect-[9/16] rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-gray-900 flex flex-col justify-between p-3">
            {mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt="Story Creative"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950" />
            )}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            <div className="relative z-10 flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#25D366] flex items-center justify-center text-[9px] font-bold text-white">
                {brandName[0]}
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow">
                {brandName}
              </span>
            </div>

            <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center">
              <p className="text-[10px] font-medium text-white line-clamp-4 leading-tight">
                {formattedText}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-gray-400 mt-2">
            9:16 Vertical Story Asset
          </span>
        </div>

        {/* Instructions & Actions (Right) */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <FaWhatsapp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Publish to WhatsApp Status
                </h3>
                <span className="text-xs font-semibold text-emerald-600">
                  Direct Agency Social Share
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 font-medium leading-relaxed mt-2">
              Meta restricts automated Bot APIs from posting to personal WhatsApp Statuses. Use Omnipulse&apos;s direct share bridge to post your formatted creative directly to WhatsApp Status with 1 click.
            </p>

            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
              <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                Story Caption Ready:
              </div>
              <p className="text-xs text-gray-800 font-mono line-clamp-2">
                {formattedText}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-5 rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-500/20"
            >
              <FaWhatsapp className="h-5 w-5" />
              Launch WhatsApp to Post Status
              <ExternalLink className="h-4 w-4 opacity-80" />
            </button>

            <button
              onClick={handleCopyText}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 py-3 px-5 rounded-xl font-bold text-xs transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-gray-500" />
                  Copy Story Caption & Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
