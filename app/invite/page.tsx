"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  Crown,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  LogIn,
  Sparkles,
} from "lucide-react";
import { teamService, InvitationPreview } from "@/lib/services/team.service";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { toast } from "sonner";
import Link from "next/link";

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided in the URL.");
      setLoading(false);
      return;
    }

    const loadPreview = async () => {
      try {
        const data = await teamService.previewInvitation(token);
        setPreview(data);
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            "This invitation link is invalid, expired, or has already been used."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [token]);

  const handleAccept = async () => {
    if (!isSignedIn) {
      // Redirect to sign in with return url
      const returnUrl = encodeURIComponent(`/invite?token=${token}`);
      router.push(`${APP_ROUTES.AUTH.SIGN_IN}?redirect_url=${returnUrl}`);
      return;
    }

    setAccepting(true);
    try {
      const res = await teamService.acceptInvitation(token);
      toast.success(res.message || "Welcome to your new workspace!");
      router.push(APP_ROUTES.DASHBOARD.BASE);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to accept invitation");
      setAccepting(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    const normalized = (role || "").toLowerCase();
    switch (normalized) {
      case "owner":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            Owner
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            <Shield className="h-3.5 w-3.5 text-indigo-400" />
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-300 border border-zinc-500/20">
            <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
            {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Member"}
          </span>
        );
    }
  };

  if (loading || !isAuthLoaded) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium text-zinc-400">Verifying invitation credentials...</p>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-500/20 bg-zinc-900/80 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Invitation Unavailable</h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">{error}</p>
        <Link
          href={APP_ROUTES.AUTH.SIGN_IN}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
        >
          Return to Omnipulse
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-2xl backdrop-blur-2xl"
    >
      {/* Top Graphic Header */}
      <div className="relative border-b border-zinc-800/80 bg-gradient-to-br from-indigo-950/60 via-zinc-900 to-zinc-900 p-8 text-center overflow-hidden">
        <div className="absolute -top-12 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-inner">
          <Users className="h-7 w-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-3">
          <Sparkles className="h-3 w-3" />
          Workspace Invitation
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight">
          Join {preview.workspace_name}
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Invited by <strong className="text-zinc-200">{preview.inviter_email}</strong>
        </p>
      </div>

      {/* Body Details */}
      <div className="p-8 space-y-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Assigned Role</span>
            {getRoleBadge(preview.role)}
          </div>
          <div className="flex items-center justify-between text-xs border-t border-zinc-800/60 pt-3">
            <span className="text-zinc-400">Invited Recipient</span>
            <span className="font-mono text-zinc-200 text-xs">{preview.invited_email}</span>
          </div>
          <div className="flex items-center justify-between text-xs border-t border-zinc-800/60 pt-3">
            <span className="text-zinc-400">Expiration</span>
            <span className="text-zinc-300">
              {new Date(preview.expires_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* User state message */}
        {isSignedIn ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="text-xs text-zinc-300 leading-snug">
              Signed in as <strong className="text-white">{user?.primaryEmailAddress?.emailAddress}</strong>. Clicking accept will attach this account to <strong>{preview.workspace_name}</strong>.
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 flex items-center gap-3">
            <LogIn className="h-5 w-5 text-indigo-400 shrink-0" />
            <div className="text-xs text-zinc-300 leading-snug">
              You will be prompted to sign in or create your Omnipulse account to claim this membership.
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all disabled:opacity-50"
        >
          {accepting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining Workspace...
            </>
          ) : isSignedIn ? (
            <>
              Accept &amp; Join Workspace
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Sign In to Accept Invitation
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-zinc-500">
          By accepting, you agree to collaborate in accordance with the workspace's assigned permission tier.
        </p>
      </div>
    </motion.div>
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        }
      >
        <InviteContent />
      </Suspense>
    </div>
  );
}
