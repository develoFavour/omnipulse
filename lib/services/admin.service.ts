import { http } from "@/lib/api/http";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

// Mirrors the JSON contract in omnipulse/apps/api-gateway/internal/domain/admin.go.
// Amounts are integer minor units (cents / kobo), same as subscriptions.amount.

export interface PlatformAdminMe {
	platform_admin: boolean;
}

export interface AdminWorkspaceSummary {
	total: number;
	new_in_window: number;
	new_previous_window: number;
	onboarded: number;
}

export interface AdminUserSummary {
	total: number;
	new_in_window: number;
	new_previous_window: number;
}

export interface AdminMessageSummary {
	successful: number;
	failed: number;
	delivery_rate: number;
	previous_successful: number;
}

export interface AdminChannelSummary {
	active_connections: number;
	workspaces_with_channel: number;
	by_platform: Record<string, number>;
}

export interface AdminCurrencyRevenue {
	currency: string;
	monthly_recurring: number;
	paying_workspaces: number;
}

export interface AdminRevenueSummary {
	by_currency: AdminCurrencyRevenue[];
	by_plan: Record<string, number>;
	by_status: Record<string, number>;
}

export interface AdminAttention {
	past_due_subscriptions: number;
	stuck_campaigns: number;
	degraded_channels: number;
}

export interface AdminOverview {
	window_days: number;
	generated_at: string;
	workspaces: AdminWorkspaceSummary;
	users: AdminUserSummary;
	messages: AdminMessageSummary;
	channels: AdminChannelSummary;
	revenue: AdminRevenueSummary;
	attention: AdminAttention;
}

export interface AdminGrowthPoint {
	date: string;
	new_workspaces: number;
	new_users: number;
}

export interface AdminFunnelStep {
	key: string;
	label: string;
	workspaces: number;
}

export interface AdminGrowth {
	window_days: number;
	generated_at: string;
	workspaces_total: number;
	series: AdminGrowthPoint[];
	funnel: AdminFunnelStep[];
}

export interface AdminPlanSlice {
	plan_tier: string;
	status: string;
	currency: string;
	workspaces: number;
	monthly_equivalent: number;
}

export interface AdminRenewal {
	tenant_id: string;
	company_name: string;
	plan_tier: string;
	currency: string;
	billing_cycle: string;
	amount: number;
	renews_at: string | null;
}

export interface AdminCancellation {
	tenant_id: string;
	company_name: string;
	plan_tier: string;
	currency: string;
	amount: number;
	cancelled_at: string;
}

export interface AdminRevenue {
	window_days: number;
	generated_at: string;
	summary: AdminRevenueSummary;
	slices: AdminPlanSlice[];
	renewals_due: AdminRenewal[];
	recent_cancellations: AdminCancellation[];
}

export interface AdminHeartbeat {
	service: string;
	healthy: boolean;
	last_beat: string;
	age_seconds: number;
	stale_after_seconds: number;
}

export interface AdminConsumer {
	service: string;
	exists: boolean;
	pending: number;
	ack_pending: number;
	delivered: number;
}

export interface AdminQueueDepth {
	status: string;
	dispatches: number;
	oldest_at: string | null;
}

export interface AdminStuckCampaign {
	campaign_id: string;
	tenant_id: string;
	company_name: string;
	title: string;
	total_targets: number;
	updated_at: string;
}

export interface AdminFailureBucket {
	platform: string;
	failed: number;
	total: number;
	delivery_rate: number;
}

export interface AdminFailureCode {
	code: string;
	count: number;
}

export interface AdminChannelCount {
	platform: string;
	status: string;
	health: string;
	count: number;
}

export interface AdminPastDue {
	tenant_id: string;
	company_name: string;
	plan_tier: string;
	currency: string;
	amount: number;
	updated_at: string;
}

export interface AdminHealth {
	generated_at: string;
	status: "healthy" | "degraded";
	heartbeats: AdminHeartbeat[];
	consumers: AdminConsumer[];
	queue: AdminQueueDepth[];
	stuck_campaigns: AdminStuckCampaign[];
	failures_by_platform: AdminFailureBucket[];
	top_failure_codes: AdminFailureCode[];
	channels: AdminChannelCount[];
	past_due: AdminPastDue[];
}

export interface AdminWorkspaceRow {
	id: string;
	company_name: string;
	created_at: string;
	onboarding_completed: boolean;
	plan_tier: string;
	subscription_status: string;
	currency: string;
	amount: number;
	members: number;
	contacts: number;
	campaigns: number;
	active_channels: number;
	last_activity_at: string;
}

export interface AdminWorkspaceList {
	data: AdminWorkspaceRow[];
	total: number;
	page: number;
	page_size: number;
	total_pages: number;
}

export interface AdminSubscription {
	plan_tier: string;
	billing_cycle: string;
	currency: string;
	amount: number;
	status: string;
	provider: string;
	current_period_start: string | null;
	current_period_end: string | null;
	monthly_message_limit: number;
	contacts_limit: number;
	channels_limit: number;
}

export interface AdminMemberRow {
	user_id: string;
	email: string;
	name: string;
	role: string;
	joined_at: string;
}

export interface AdminChannelRow {
	platform: string;
	status: string;
	health: string;
	account_identity: string;
	last_heartbeat_at: string | null;
	last_successful_at: string | null;
	last_error: string;
	created_at: string;
}

export interface AdminCampaignRow {
	id: string;
	title: string;
	status: string;
	total_targets: number;
	processed_targets: number;
	created_at: string;
}

export interface AdminDeliverySummary {
	total: number;
	delivered: number;
	failed: number;
	delivery_rate: number;
}

export interface AdminConsentSummary {
	contacts: number;
	opted_out: number;
	granted_events: number;
	revoked_events: number;
}

export interface AdminWorkspaceDetail {
	workspace: AdminWorkspaceRow;
	subscription: AdminSubscription | null;
	members: AdminMemberRow[];
	channels: AdminChannelRow[];
	recent_campaigns: AdminCampaignRow[];
	deliveries: AdminDeliverySummary;
	consent: AdminConsentSummary;
}

export interface AdminWorkspaceQuery {
	q?: string;
	page?: number;
	page_size?: number;
	sort?: string;
	direction?: "asc" | "desc";
}

class AdminService {
	me(): Promise<PlatformAdminMe> {
		return http.get<PlatformAdminMe>(ENDPOINTS.ADMIN.ME);
	}

	overview(days = 30): Promise<AdminOverview> {
		return http.get<AdminOverview>(ENDPOINTS.ADMIN.OVERVIEW(days));
	}

	growth(days = 30): Promise<AdminGrowth> {
		return http.get<AdminGrowth>(ENDPOINTS.ADMIN.GROWTH(days));
	}

	revenue(days = 30): Promise<AdminRevenue> {
		return http.get<AdminRevenue>(ENDPOINTS.ADMIN.REVENUE(days));
	}

	health(): Promise<AdminHealth> {
		return http.get<AdminHealth>(ENDPOINTS.ADMIN.HEALTH);
	}

	workspaces(query: AdminWorkspaceQuery = {}): Promise<AdminWorkspaceList> {
		return http.get<AdminWorkspaceList>(ENDPOINTS.ADMIN.WORKSPACES, query);
	}

	workspace(id: string): Promise<AdminWorkspaceDetail> {
		return http.get<AdminWorkspaceDetail>(ENDPOINTS.ADMIN.WORKSPACE(id));
	}
}

export const adminService = new AdminService();
