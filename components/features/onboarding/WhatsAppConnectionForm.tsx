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
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Meta WhatsApp Cloud API Setup</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Connect your WhatsApp Business Account via Meta&apos;s official Cloud API. You&apos;ll need credentials from the
              Meta Developer Console.
            </p>
          </div>
        </div>

        <div className="space-y-2 ml-[52px]">
          <p className="text-xs font-bold text-zinc-300">Quick Setup Steps:</p>
          <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside">
            <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-medium">developers.facebook.com</a> and create a Meta App</li>
            <li>Add the <strong className="text-zinc-300">WhatsApp</strong> product to your app</li>
            <li>From the API Setup page, copy your <strong className="text-zinc-300">Phone Number ID</strong> and <strong className="text-zinc-300">Permanent Access Token</strong></li>
            <li>Choose a <strong className="text-zinc-300">Verify Token</strong> (any secure passphrase you pick)</li>
            <li>Paste all three below and click <strong className="text-zinc-300">Save & Register</strong></li>
          </ol>
        </div>

        <a
          href="https://developers.facebook.com/apps/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 ml-[52px] text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open Meta Developer Console
        </a>
      </div>

      {/* Credentials Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone_number_id" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Phone Number ID
          </Label>
          <Input
            id="phone_number_id"
            placeholder="e.g. 115552648411001"
            className="h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500 font-mono text-sm"
            {...form.register("phone_number_id")}
            disabled={isLoading}
          />
          {form.formState.errors.phone_number_id && (
            <p className="text-xs text-red-400">{form.formState.errors.phone_number_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="access_token" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Permanent Access Token
          </Label>
          <Input
            id="access_token"
            type="password"
            placeholder="EAAG..."
            className="h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500 font-mono text-sm"
            {...form.register("access_token")}
            disabled={isLoading}
          />
          {form.formState.errors.access_token && (
            <p className="text-xs text-red-400">{form.formState.errors.access_token.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="verify_token" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Webhook Verify Token
          </Label>
          <Input
            id="verify_token"
            placeholder="e.g. omnipulse_whatsapp_secret"
            className="h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500 font-mono text-sm"
            {...form.register("verify_token")}
            disabled={isLoading}
          />
          <p className="text-xs text-zinc-500">
            You choose this token. It must match the value you enter in Meta&apos;s webhook configuration.
          </p>
          {form.formState.errors.verify_token && (
            <p className="text-xs text-red-400">{form.formState.errors.verify_token.message}</p>
          )}
        </div>

        {/* Info about webhook URL */}
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 flex gap-3">
          <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs text-sky-200 leading-relaxed">
            <p className="font-bold text-sky-100 mb-1">After saving, configure your Meta webhook:</p>
            <p>In the Meta Developer Console, set your Webhook URL to your OmniPulse public URL and paste the verify token you entered above.</p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          {onClose && (
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!form.formState.isValid || isLoading}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
            {isLoading ? "Verifying & Saving..." : "Save & Register Webhook"}
          </Button>
        </div>

        <p className="text-xs text-zinc-500 text-center">
          🔒 Credentials are encrypted and stored securely. Only used for outbound message delivery.
        </p>
      </form>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-200">Connection Failed</p>
              <p className="text-xs text-red-300 mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
