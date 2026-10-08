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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
            <Crown className="h-3.5 w-3.5 text-amber-700" />
            Owner
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e2f6d5] px-2.5 py-1 text-xs font-semibold text-[#163300] border border-[#9fe870]/60">
            <Shield className="h-3.5 w-3.5 text-[#163300]" />
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
            <UserIcon className="h-3.5 w-3.5 text-gray-500" />
            {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Member"}
          </span>
        );
    }
  };

  if (loading || !isAuthLoaded) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#163300]" />
        <p className="text-sm font-medium text-gray-500">Verifying invitation credentials...</p>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Invitation Unavailable</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">{error}</p>
        <Link
          href={APP_ROUTES.AUTH.SIGN_IN}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
    >
      {/* Top Header */}
      <div className="border-b border-gray-200 bg-white px-8 pt-8 pb-6 text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e2f6d5] border border-[#9fe870]/60 text-[#163300]">
          <Users className="h-6 w-6" />
        </div>

        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e2f6d5] px-3 py-0.5 text-xs font-semibold text-[#163300] border border-[#9fe870]/60">
            Workspace Invitation
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Join {preview.workspace_name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Invited by <strong className="font-semibold text-gray-800">{preview.inviter_email}</strong>
        </p>
      </div>

      {/* Body Details */}
      <div className="p-8 space-y-6">
        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-500">Assigned Role</span>
            {getRoleBadge(preview.role)}
          </div>
          <div className="flex items-center justify-between text-xs border-t border-gray-200 pt-3">
            <span className="font-medium text-gray-500">Invited Recipient</span>
            <span className="font-mono font-medium text-gray-800 text-xs">{preview.invited_email}</span>
          </div>
          <div className="flex items-center justify-between text-xs border-t border-gray-200 pt-3">
            <span className="font-medium text-gray-500">Expiration</span>
            <span className="font-medium text-gray-700">
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
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-snug">
              Signed in as <strong className="font-semibold">{user?.primaryEmailAddress?.emailAddress}</strong>. Accepting will attach your account to <strong>{preview.workspace_name}</strong>.
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[#9fe870]/60 bg-[#e2f6d5]/30 p-4 flex items-start gap-3">
            <LogIn className="h-5 w-5 text-[#163300] shrink-0 mt-0.5" />
            <div className="text-xs text-[#163300] leading-snug">
              You will be prompted to sign in or create a MessageRail account to accept this invitation.
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#163300] hover:bg-[#0d2000] px-6 py-3.5 text-sm font-semibold text-[#9fe870] hover:text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#163300] focus:ring-offset-2 disabled:opacity-50"
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

        <p className="text-center text-xs text-gray-400">
          By accepting, you agree to collaborate in accordance with the workspace's assigned permission tier.
        </p>
      </div>
    </motion.div>
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#163300]" />
          </div>
        }
      >
        <InviteContent />
      </Suspense>
    </div>
  );
}
