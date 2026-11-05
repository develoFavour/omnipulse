export interface BrandReviewFields {
  latest_review_decision?: string;
  latest_review_at?: string;
  content_revised_at?: string;
}

// A decision made before the last edit describes a version the brand can no
// longer see, so it must not be presented as the current state.
export function brandReviewIsCurrent(campaign: BrandReviewFields): boolean {
  if (!campaign.latest_review_decision) return false;
  if (!campaign.latest_review_at || !campaign.content_revised_at) return true;
  return (
    new Date(campaign.latest_review_at).getTime() >=
    new Date(campaign.content_revised_at).getTime()
  );
}

export function brandChangesOutstanding(campaign: BrandReviewFields): boolean {
  return (
    campaign.latest_review_decision === "changes_requested" &&
    brandReviewIsCurrent(campaign)
  );
}

export function brandReviewPending(campaign: BrandReviewFields): boolean {
  return !!campaign.latest_review_decision && !brandReviewIsCurrent(campaign);
}
