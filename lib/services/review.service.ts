import { API_BASE_URL, apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export type ReviewDecisionValue = "approved" | "changes_requested";

export interface ReviewLink {
  token: string;
  label: string;
  expires_at: string;
}

export interface ReportEmailResult extends ReviewLink {
  sent_to: string;
}

export interface ReviewLinkRecord {
  id: string;
  campaign_id: string;
  label: string;
  created_by: string;
  expires_at: string;
  revoked_at?: string;
  last_viewed_at?: string;
  created_at: string;
  decision?: ReviewDecisionValue;
}

export interface PublicReviewAudience {
  total: number;
  sendable: number;
  opted_out: number;
  no_consent: number;
}

export interface PublicReviewDecision {
  decision: ReviewDecisionValue;
  note?: string;
  decided_at: string;
}

export interface PublicOutcomeReport {
  campaign_id: string;
  title: string;
  status: string;
  total_targets: number;
  sent: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
  revenue_kobo?: number;
  paid_orders_count?: number;
  generated_at: string;
}

export type ReviewTrailStage =
  | "submitted"
  | "approved"
  | "rejected"
  | "brand_approved"
  | "brand_changes_requested";

export interface PublicReviewTrailEntry {
  stage: ReviewTrailStage;
  actor_role: "operator" | "brand";
  actor: string;
  note?: string;
  at?: string;
}

export interface PublicReview {
  campaign_id: string;
  title: string;
  message_body: string;
  media_url?: string;
  delivery_type: string;
  channels: string[];
  status: string;
  scheduled_at?: string;
  audience: PublicReviewAudience;
  brand: { name: string; logo_url?: string };
  expires_at: string;
  decision?: PublicReviewDecision;
  revised_since_decision?: boolean;
  approval_trail: PublicReviewTrailEntry[];
  report?: PublicOutcomeReport;
}

class ReviewService {
  async createReviewLink(
    campaignId: string,
    payload: { label?: string; expires_in_days?: number }
  ): Promise<ReviewLink> {
    const response = await apiClient.post<ReviewLink>(
      ENDPOINTS.CAMPAIGNS.REVIEW_LINK(campaignId),
      payload
    );
    return response.data;
  }

  async listReviewLinks(campaignId: string): Promise<ReviewLinkRecord[]> {
    const response = await apiClient.get<{ links: ReviewLinkRecord[] }>(
      ENDPOINTS.CAMPAIGNS.REVIEW_LINKS(campaignId)
    );
    return response.data?.links ?? [];
  }

  async revokeReviewLink(campaignId: string, linkId: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.CAMPAIGNS.REVIEW_LINK_BY_ID(campaignId, linkId));
  }

  async emailReport(
    campaignId: string,
    payload: { email: string; name?: string }
  ): Promise<ReportEmailResult> {
    const response = await apiClient.post<ReportEmailResult>(
      ENDPOINTS.CAMPAIGNS.REPORT_EMAIL(campaignId),
      payload
    );
    return response.data;
  }

  async getPublicReview(token: string): Promise<PublicReview> {
    const response = await apiClient.get<PublicReview>(ENDPOINTS.PUBLIC_REVIEWS.BY_TOKEN(token));
    return response.data;
  }

  async submitDecision(
    token: string,
    decision: "approve" | "request_changes",
    note?: string
  ): Promise<PublicReview> {
    const response = await apiClient.post<PublicReview>(
      ENDPOINTS.PUBLIC_REVIEWS.DECISION(token),
      { decision, note: note ?? "" }
    );
    return response.data;
  }

  outcomeCsvUrl(token: string): string {
    return `${API_BASE_URL}${ENDPOINTS.PUBLIC_REVIEWS.OUTCOME_CSV(token)}`;
  }

  reviewUrl(token: string): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/review/${token}`;
  }
}

export const reviewService = new ReviewService();
