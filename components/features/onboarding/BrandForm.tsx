"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Link2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const brandFormSchema = z.object({
  workspace_name: z
    .string()
    .min(2, "Must be at least 2 characters.")
    .max(50, "Must be under 50 characters."),
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

interface BrandFormProps {
  onSubmit: (data: BrandFormValues) => void;
  isLoading?: boolean;
}

export function BrandForm({ onSubmit, isLoading }: BrandFormProps) {
  const { user } = useUser();
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      workspace_name: "",
    },
  });

  const watchedName = form.watch("workspace_name");
  const email = user?.primaryEmailAddress?.emailAddress || "your email";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-3">
        <Label htmlFor="workspace_name" className="text-sm font-medium text-white">
          Brand Name
        </Label>
        <Input
          id="workspace_name"
          placeholder="e.g. Sarah's Boutique"
          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20 transition-colors backdrop-blur-sm"
          autoFocus
          {...form.register("workspace_name")}
        />
        <p className="text-xs text-zinc-500">
          This will be displayed in your workspace and broadcasts.
        </p>
      </div>

      <AnimatePresence>
        {watchedName.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-4 h-4 text-zinc-500" />
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                  Live Preview
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">
                  {watchedName}
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  {watchedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.omnipulse.app
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-[11px] text-zinc-500">
                  Connected with <span className="text-zinc-400">{email}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-medium shadow-none h-12 transition-colors active:scale-[0.98]"
        disabled={isLoading || !watchedName.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating workspace...
          </>
        ) : (
          <>
            Continue to Channels
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}
