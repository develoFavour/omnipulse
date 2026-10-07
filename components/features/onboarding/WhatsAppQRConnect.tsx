"use client";

import { useEffect } from "react";
import { useWhatsAppQR } from "@/lib/api/hooks/useWhatsAppQR";
import { QRCodeSVG } from "qrcode.react";
import { MessageCircle, CheckCircle2, RefreshCw, Smartphone, WifiOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppQRConnectProps {
  onSuccess?: (phone: string, name: string) => void;
  onClose?: () => void;
}

export function WhatsAppQRConnect({ onSuccess, onClose }: WhatsAppQRConnectProps) {
  const {
    qrCode,
    status,
    connectedPhone,
    connectedName,
    error,
    requestQR,
    disconnect,
    stopPolling,
  } = useWhatsAppQR({
    onConnected: (phone, name) => {
      onSuccess?.(phone, name);
    },
  });

  useEffect(() => {
    if (status === "idle" || status === "error") {
      void requestQR();
    }
    return () => {
      stopPolling();
    };
  }, [status, requestQR, stopPolling]);

  return (
    <div className="space-y-6">
      {status === "connected" ? (
        /* ✅ Connected State */
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#e2f6d5] border border-[#9fe870] flex items-center justify-center text-[#163300] shadow-[0_0_25px_rgba(159,232,112,0.4)] animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-xl font-heading font-black text-[#163300] uppercase tracking-tight">
              WhatsApp Linked Successfully!
            </h4>
            <p className="text-xs font-semibold text-[#454745] mt-1">
              {connectedName || "Device"}{" "}
              {connectedPhone && (
                <span className="font-mono text-[#163300] bg-[#f4f5f2] border border-[#e8ebe6] px-2 py-0.5 rounded-md ml-1 font-bold">
                  {connectedPhone}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full max-w-xs pt-2">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full bg-[#9fe870] hover:bg-[#8ee05c] text-[#163300] font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md"
            >
              Done
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void disconnect()}
              className="h-11 rounded-full border-[#e8ebe6] hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[#868685] font-bold text-xs uppercase tracking-wider"
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : status === "loading_qr" ? (
        /* ⏳ Loading QR State */
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="w-56 h-56 rounded-3xl bg-[#f8faf7] border border-[#e8ebe6] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#163300] animate-spin" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#163300]">
            Generating Multi-Device QR Code...
          </p>
        </div>
      ) : status === "error" ? (
        /* ❌ Error State */
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <div className="w-56 h-56 rounded-3xl bg-red-50 border border-red-200 flex flex-col items-center justify-center gap-3 px-4">
            <WifiOff className="w-10 h-10 text-red-500" />
            <p className="text-xs font-medium text-red-600">
              {error || "Failed to initialize WhatsApp pairing socket."}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => void requestQR()}
            className="rounded-full bg-[#163300] hover:bg-[#054d28] text-[#9fe870] font-bold text-xs uppercase px-6 h-10 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : (
        /* 📱 QR Code Pairing View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* QR Display */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative p-4 rounded-3xl bg-white border border-[#e8ebe6] shadow-sm">
              <div className="w-52 h-52 flex items-center justify-center">
                {qrCode ? (
                  <QRCodeSVG
                    value={qrCode}
                    size={208}
                    bgColor="#ffffff"
                    fgColor="#163300"
                    level="M"
                    className="w-full h-full"
                  />
                ) : (
                  <Loader2 className="w-7 h-7 text-[#163300] animate-spin" />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void requestQR()}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#163300] hover:text-[#054d28] hover:underline transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Pairing QR Code</span>
            </button>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#163300] bg-[#e2f6d5] border border-[#9fe870]/70 px-2.5 py-0.5 rounded-full inline-block">
                Scan With Phone
              </span>
              <h4 className="text-sm font-bold text-[#0e0f0c]">
                How to link your WhatsApp:
              </h4>
            </div>

            <div className="space-y-2.5">
              {[
                { step: "01", text: "Open WhatsApp on your mobile phone" },
                { step: "02", text: "Tap Settings or ⋮ Menu → Linked Devices" },
                { step: "03", text: 'Tap "Link a Device" and scan this QR code' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#f4f5f2] border border-[#e8ebe6] text-[#163300] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <span className="text-xs font-medium text-[#454745] leading-snug">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#e8ebe6] flex items-center gap-2 text-xs font-semibold text-[#868685]">
              <Smartphone className="w-3.5 h-3.5 text-[#163300]" />
              <span>Listening for scan...</span>
              <span className="w-2 h-2 rounded-full bg-[#9fe870] animate-pulse ml-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
