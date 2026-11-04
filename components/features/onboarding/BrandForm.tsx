"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Link2, Sparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const brandFormSchema = z.object({
  workspace_name: z
    .string()
    .min(2, "Must be at least 2 characters.")
    .max(50, "Must be under 50 characters."),
  first_name: z
    .string()
    .trim()
    .min(1, "Your first name is required.")
    .max(100, "Must be under 100 characters."),
  last_name: z
    .string()
    .trim()
    .max(100, "Must be under 100 characters.")
    .optional(),
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
      first_name: user?.firstName || "",
      last_name: user?.lastName || "",
    },
  });

  // Clerk's user object can resolve after the form mounts; fill the name once
  // it arrives without clobbering anything the user has already typed.
  useEffect(() => {
    if (!user) return;
    if (!form.getValues("first_name") && user.firstName) {
      form.setValue("first_name", user.firstName);
    }
    if (!form.getValues("last_name") && user.lastName) {
      form.setValue("last_name", user.lastName);
    }
  }, [user, form]);

  const watchedName = form.watch("workspace_name");
  const watchedFirstName = form.watch("first_name");
  const email = user?.primaryEmailAddress?.emailAddress || "your email";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
      <div className="space-y-2">
        <Label
          htmlFor="workspace_name"
          className="text-xs font-bold uppercase tracking-wider text-[#163300]"
        >
          Brand or Workspace Name
        </Label>
        <Input
          id="workspace_name"
          placeholder="e.g. Sarah's Boutique"
          className="h-12 bg-[#f4f5f2] border-[#e8ebe6] text-[#0e0f0c] placeholder:text-[#868685] rounded-xl focus-visible:ring-2 focus-visible:ring-[#9fe870]/50 focus-visible:border-[#163300] focus:bg-white text-sm font-medium transition-all shadow-none"
          autoFocus
          {...form.register("workspace_name")}
        />
        <p className="text-xs font-medium text-[#868685]">
          This will be displayed in your multi-channel broadcast header and studio.
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="first_name"
          className="text-xs font-bold uppercase tracking-wider text-[#163300]"
        >
          Your Name
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="first_name"
            placeholder="First name"
            autoComplete="given-name"
            className="h-12 bg-[#f4f5f2] border-[#e8ebe6] text-[#0e0f0c] placeholder:text-[#868685] rounded-xl focus-visible:ring-2 focus-visible:ring-[#9fe870]/50 focus-visible:border-[#163300] focus:bg-white text-sm font-medium transition-all shadow-none"
            {...form.register("first_name")}
          />
          <Input
            id="last_name"
            placeholder="Last name (optional)"
            autoComplete="family-name"
            className="h-12 bg-[#f4f5f2] border-[#e8ebe6] text-[#0e0f0c] placeholder:text-[#868685] rounded-xl focus-visible:ring-2 focus-visible:ring-[#9fe870]/50 focus-visible:border-[#163300] focus:bg-white text-sm font-medium transition-all shadow-none"
            {...form.register("last_name")}
          />
        </div>
        <p className="text-xs font-medium text-[#868685]">
          Shown on campaign review trails when you sign off for your agency.
        </p>
      </div>

      <AnimatePresence>
        {watchedName.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 rounded-2xl border border-[#e8ebe6] bg-[#f8faf7] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-md bg-[#163300] flex items-center justify-center text-[#9fe870] font-black text-[9px]">
                    OP
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#163300]">
                    Domain Routing
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#163300] bg-[#e2f6d5] border border-[#9fe870]/60 rounded-full px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#163300]" />
                  Instant SSL
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-base font-bold text-[#0e0f0c]">
                  {watchedName}
                </p>
                <p className="text-xs font-mono font-bold text-[#163300] bg-white border border-[#e8ebe6] px-2.5 py-1 rounded-lg inline-block">
                  {watchedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.messagerail.app
                </p>
              </div>

              <div className="pt-2 border-t border-[#e8ebe6] flex items-center justify-between text-[11px] text-[#868685]">
                <span>Administrator account</span>
                <span className="font-semibold text-[#454745]">{email}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        className="w-full h-12 rounded-full bg-[#9fe870] hover:bg-[#8ee05c] text-[#163300] font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
        disabled={isLoading || !watchedName.trim() || !watchedFirstName?.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Provisioning Workspace...
          </>
        ) : (
          <>
            <span>Provision Workspace</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}
