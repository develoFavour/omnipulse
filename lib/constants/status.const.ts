import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export type DeliveryStatus = "delivered" | "pending" | "failed" | "scheduled";

export const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  delivered: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Delivered" },
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10", label: "In Progress" },
  failed: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Failed" },
  scheduled: { icon: Clock, color: "text-indigo-400", bg: "bg-indigo-400/10", label: "Scheduled" },
};
