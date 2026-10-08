"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2, MessageCircle, ExternalLink, ShieldCheck, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const whatsappSchema = z.object({
  phone_number_id: z.string().min(5, "Phone Number ID is required (from Meta Developer Console)"),
  access_token: z.string().min(10, "Permanent Access Token is required"),
  verify_token: z.string().min(4, "Webhook Verify Token is required (you choose this, any secure string)"),
});

type WhatsAppFormValues = z.infer<typeof whatsappSchema>;

interface WhatsAppConnectionFormProps {
  onSubmit: (credentials: { phone_number_id: string; access_token: string; verify_token: string }) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onClose?: () => void;
}

export function WhatsAppConnectionForm({
  onSubmit,
  isLoading = false,
  error = null,
  onClose,
}: WhatsAppConnectionFormProps) {
  const form = useForm<WhatsAppFormValues>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: { phone_number_id: "", access_token: "", verify_token: "" },
    mode: "onChange",
  });

  const handleSubmit = async (data: WhatsAppFormValues) => {
    try {
      await onSubmit(data);
    } catch {
      // Handled by parent
    }
  };

  return (
    <div className="space-y-6">
      {/* Setup Guide Card */}
      <div className="rounded-2xl border border-[#9fe870]/70 bg-[#e2f6d5]/40 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#163300] text-[#9fe870] flex items-center justify-center shrink-0">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#163300]">Meta WhatsApp Cloud API Configuration</h4>
            <p className="text-xs text-[#454745] mt-1 leading-relaxed">
              Authenticate your official Meta Cloud API application to enable multi-tenant customer delivery.
            </p>
          </div>
        </div>

        <div className="space-y-2 ml-[52px]">
          <p className="text-xs font-bold uppercase tracking-wider text-[#163300]">Setup Sequence:</p>
          <ol className="text-xs text-[#454745] space-y-1.5 list-decimal list-inside font-medium">
            <li>Visit <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-[#163300] underline font-bold">developers.facebook.com</a> and select your Meta App</li>
            <li>Add the <strong>WhatsApp</strong> product to your application</li>
            <li>From the API Setup view, copy your <strong>Phone Number ID</strong> and <strong>Permanent Access Token</strong></li>
            <li>Create a custom <strong>Verify Token</strong> (any secure secret passphrase)</li>
            <li>Paste the values below to activate the webhook listener</li>
          </ol>
        </div>

        <a
          href="https://developers.facebook.com/apps/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 ml-[52px] text-xs font-bold text-[#163300] hover:underline transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Open Meta Developer Console</span>
        </a>
      </div>

      {/* Credentials Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone_number_id" className="text-xs font-bold uppercase tracking-wider text-[#163300]">
            Phone Number ID
          </Label>
          <Input
            id="phone_number_id"
            placeholder="e.g. 115552648411001"
            className="h-11 bg-[#f4f5f2] border-[#e8ebe6] text-[#0e0f0c] placeholder:text-[#868685] rounded-xl focus-visible:ring-2 focus-visible:ring-[#9fe870]/50 focus-visible:border-[#163300] focus:bg-white font-mono text-sm transition-all shadow-none"
            {...form.register("phone_number_id")}
            disabled={isLoading}
          />
          {form.formState.errors.phone_number_id && (
            <p className="text-xs font-semibold text-red-600">{form.formState.errors.phone_number_id.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="access_token" className="text-xs font-bold uppercase tracking-wider text-[#163300]">
            Permanent Access Token
          </Label>
          <Input
            id="access_token"
            type="password"
            placeholder="EAAG..."
            className="h-11 bg-[#f4f5f2] border-[#e8ebe6] text-[#0e0f0c] placeholder:text-[#868685] rounded-xl focus-visible:ring-2 focus-visible:ring-[#9fe870]/50 focus-visible:border-[#163300] focus:bg-white font-mono text-sm transition-all shadow-none"
            {...form.register("access_token")}
            disabled={isLoading}
          />
          {form.formState.errors.access_token && (
            <p className="text-xs font-semibold text-red-600">{form.formState.errors.access_token.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="verify_token" className="text-xs font-bold uppercase tracking-wider text-[#163300]">
            Webhook Verify Token
          </Label>
          <Input
            id="verify_token"
            placeholder="e.g. messagerail_whatsapp_secret"
            className="h-11 bg-[#f4f5f2] border-[#e8ebe6] text-[#0e0f0c] placeholder:text-[#868685] rounded-xl focus-visible:ring-2 focus-visible:ring-[#9fe870]/50 focus-visible:border-[#163300] focus:bg-white font-mono text-sm transition-all shadow-none"
            {...form.register("verify_token")}
            disabled={isLoading}
          />
          <p className="text-xs font-medium text-[#868685]">
            Choose any secure secret passphrase. It must match the verify token configured in Meta&apos;s webhook settings.
          </p>
          {form.formState.errors.verify_token && (
            <p className="text-xs font-semibold text-red-600">{form.formState.errors.verify_token.message}</p>
          )}
        </div>

        {/* Info about webhook URL */}
        <div className="rounded-2xl border border-[#e8ebe6] bg-[#f8faf7] p-4 flex gap-3">
          <Info className="h-4 w-4 text-[#163300] shrink-0 mt-0.5" />
          <div className="text-xs text-[#454745] leading-relaxed">
            <p className="font-bold text-[#163300] mb-0.5">Webhook Endpoint Setup:</p>
            <p>Once registered, configure your Meta Developer Console Webhook URL to your MessageRail domain endpoint and paste the Verify Token above.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-full border-[#e8ebe6] hover:bg-[#f4f5f2] text-[#163300] font-bold text-xs uppercase tracking-wider shadow-none"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!form.formState.isValid || isLoading}
            className="flex-[2] h-11 rounded-full bg-[#9fe870] hover:bg-[#8ee05c] text-[#163300] font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Verifying Pipeline...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                <span>Save & Register Webhook</span>
              </>
            )}
          </Button>
        </div>

        <p className="text-[11px] font-semibold text-[#868685] text-center pt-1">
          🔒 Meta credentials are encrypted via AES-256 and stored in high-security multi-tenant vaults.
        </p>
      </form>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl border border-red-200 bg-red-50 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-700">Connection Failed</p>
              <p className="text-xs font-medium text-red-600 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
