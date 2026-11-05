"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  MessageSquare,
  Send,
  ShieldCheck,
  UserX,
  Users,
} from "lucide-react";
import { apiMessage, apiStatus } from "@/lib/api/axios-error";
import { reviewService, PublicReview, ReviewTrailStage } from "@/lib/services/review.service";

const DECIDABLE_STATUSES = new Set(["draft", "pending_approval", "approved"]);
const SENT_STATUSES = new Set(["scheduled", "processing", "completed", "paused", "cancelled"]);

function trailEntryMeta(stage: ReviewTrailStage) {
  switch (stage) {
    case "submitted":
      return {
        title: "Submitted for internal sign-off",
        tone: "bg-gray-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300",
        Icon: Send,
      };
    case "approved":
      return {
        title: "Signed off by your agency",
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
        Icon: ShieldCheck,
      };
    case "rejected":
      return {
        title: "Not signed off",
        tone: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
        Icon: AlertTriangle,
      };
    case "brand_approved":
      return {
        title: "Approved by brand",
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
        Icon: CheckCircle2,
      };
    default:
      return {
        title: "Changes requested by brand",
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
        Icon: AlertTriangle,
      };
  }
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

export default function ClientReviewPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";

  const [review, setReview] = useState<PublicReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deciding, setDeciding] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [note, setNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const load = async () => {
      try {
        const data = await reviewService.getPublicReview(token);
        if (!cancelled) setReview(data);
      } catch (err: unknown) {
        if (cancelled) return;
        const status = apiStatus(err);
        setError(
          status === 410
            ? "This review link has expired. Ask your agency for a fresh link."
            : status === 404
              ? "This review link is invalid or has been revoked."
              : "We could not load this review. Please try again shortly."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const canDecide = useMemo(() => {
    if (!review) return false;
    return DECIDABLE_STATUSES.has(review.status);
  }, [review]);

  const submitDecision = async (decision: "approve" | "request_changes") => {
    if (!token) return;
    setDeciding(true);
    setActionError(null);
    try {
      const updated = await reviewService.submitDecision(token, decision, note);
      setReview(updated);
      setShowChanges(false);
    } catch (err: unknown) {
      setActionError(
        apiMessage(err, "We could not submit your review. Please try again.")
      );
    } finally {
      setDeciding(false);
    }
  };

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-6 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Review unavailable</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            This review link is missing its token.
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] dark:bg-zinc-950">
        <div className="flex items-center gap-3 text-sm font-semibold text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading review…
        </div>
      </main>
    );
  }

  if (error || !review) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-6 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Review unavailable</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
        </div>
      </main>
    );
  }

  const brandInitial = review.brand.name?.trim().charAt(0).toUpperCase() || "M";
  const decided = review.decision;
  const isReport = SENT_STATUSES.has(review.status);
  const decisionLead =
    review.status === "approved"
      ? "Your agency has already signed off. Approve it to confirm, or request changes before it is scheduled."
      : review.status === "pending_approval"
        ? "Approve to let your agency send this campaign, or ask for changes first."
        : "Approve this campaign as ready to send, or ask for changes first.";

  return (
    <main className="min-h-screen bg-[#f9fafb] px-4 py-8 dark:bg-zinc-950 sm:px-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-3xl space-y-5"
      >
        <header className="flex items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            {review.brand.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.brand.logo_url}
                alt={review.brand.name || "Agency logo"}
                className="h-11 w-11 rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-base font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                {brandInitial}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {isReport ? "Campaign report" : "Campaign review request"}
              </p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {review.brand.name || "Your agency"}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure link
          </span>
        </header>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{review.title}</h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {review.channels.length > 0
                  ? `Sending via ${review.channels.join(", ")}`
                  : "Multi-channel campaign"}
              </p>
            </div>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {review.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
              {review.message_body || "No message content was provided."}
            </p>
            {review.media_url && (
              <a
                href={review.media_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs font-semibold text-emerald-700 underline dark:text-emerald-300"
              >
                View attached media
              </a>
            )}
          </div>

          {review.scheduled_at && (
            <p className="mt-4 flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <Clock className="h-4 w-4" />
              Scheduled for {formatDate(review.scheduled_at)}
            </p>
          )}
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              <Users className="h-4 w-4" /> Will receive
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {review.audience.sendable}
            </p>
            <p className="text-xs text-zinc-500">of {review.audience.total} selected</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              <UserX className="h-4 w-4" /> Opted out
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {review.audience.opted_out}
            </p>
            <p className="text-xs text-zinc-500">always skipped</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              <MessageSquare className="h-4 w-4" /> No consent
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {review.audience.no_consent}
            </p>
            <p className="text-xs text-zinc-500">no recorded opt-in</p>
          </div>
        </section>

        {review.approval_trail.length > 0 && (
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Review trail</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Who prepared this campaign and who signed it off inside your agency.
            </p>
            <ol className="mt-5 space-y-4">
              {review.approval_trail.map((entry, index) => {
                const { title, tone, Icon } = trailEntryMeta(entry.stage);
                return (
                  <li key={`${entry.stage}-${index}`} className="flex gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{title}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {entry.actor}
                        {entry.at ? ` · ${formatDate(entry.at)}` : ""}
                      </p>
                      {entry.note && (
                        <p className="mt-2 whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm text-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-200">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {decided && (
          <section
            className={`rounded-3xl border p-6 shadow-sm ${
              decided.decision === "approved"
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {decided.decision === "approved" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              )}
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {decided.decision === "approved" ? "Campaign approved" : "Changes requested"}
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Submitted {formatDate(decided.decided_at)}
            </p>
            {decided.note && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/70 p-4 text-sm text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
                {decided.note}
              </p>
            )}
            {review.revised_since_decision && canDecide && (
              <p className="mt-3 rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
                Your agency has updated this campaign since this decision. Review the latest version below.
              </p>
            )}
          </section>
        )}

        {canDecide ? (
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {decided ? "Update your decision" : "Your decision"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{decisionLead}</p>

            {actionError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {actionError}
              </div>
            )}

            {showChanges ? (
              <div className="mt-4 space-y-3">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="What should the agency change?"
                  className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm text-zinc-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-emerald-900/40"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => submitDecision("request_changes")}
                    disabled={deciding || note.trim().length === 0}
                    className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deciding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send change request
                  </button>
                  <button
                    onClick={() => setShowChanges(false)}
                    disabled={deciding}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => submitDecision("approve")}
                  disabled={deciding}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deciding ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Approve campaign
                </button>
                <button
                  onClick={() => {
                    setShowChanges(true);
                    setActionError(null);
                  }}
                  disabled={deciding}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Request changes
                </button>
              </div>
            )}
          </section>
        ) : !decided && !isReport ? (
          <section className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            This campaign has moved past brand review, so no action is needed.
          </section>
        ) : null}

        {review.report && (
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Delivery results</h2>
              <a
                href={reviewService.outcomeCsvUrl(token)}
                className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Download className="h-3.5 w-3.5" />
                Download report (CSV)
              </a>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Targets", value: review.report.total_targets },
                { label: "Sent", value: review.report.sent },
                { label: "Delivered", value: review.report.delivered },
                { label: "Failed", value: review.report.failed },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Delivery rate: {review.report.delivery_rate}%
            </p>
          </section>
        )}

        {!review.report && review.status === "scheduled" && (
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Campaign report</h2>
            <div className="mt-3 flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                {review.scheduled_at
                  ? `Scheduled to send ${formatDate(review.scheduled_at)}. `
                  : "Scheduled to send. "}
                Delivery results appear here once it starts sending.
              </p>
            </div>
          </section>
        )}

        <footer className="flex flex-col items-center gap-2 pb-6 pt-2 text-center text-xs text-zinc-400">
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            This link expires {formatDate(review.expires_at)}
          </p>
          <p className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Powered by MessageRail
          </p>
        </footer>
      </motion.div>
    </main>
  );
}
