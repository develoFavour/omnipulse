// lib/constants/endpoint.const.ts

const API_VERSION = "/api/v1";

export const ENDPOINTS = {
	// Auth & Identity
	AUTH: {
		SYNC: `${API_VERSION}/auth/sync`,
	},

	// Onboarding
	ONBOARDING: {
		BRAND: `${API_VERSION}/onboarding/brand`,
		COMPLETE: `${API_VERSION}/onboarding/complete`,
	},

	// Channels
	CHANNELS: {
		BASE: `${API_VERSION}/channels`,
		DISCONNECT: (platform: string) => `${API_VERSION}/channels/${platform}`,
	},

	// Contacts
	CONTACTS: {
		BASE: `${API_VERSION}/contacts`,
		BY_ID: (id: string) => `${API_VERSION}/contacts/${id}`,
	},

	// Campaigns
	CAMPAIGNS: {
		BASE: `${API_VERSION}/campaigns`,
		BY_ID: (id: string) => `${API_VERSION}/campaigns/${id}`,
		DISPATCH: (id: string) => `${API_VERSION}/campaigns/${id}/dispatch`,
		STATS: (id: string) => `${API_VERSION}/campaigns/${id}/stats`,
	},

	// Dashboard
	DASHBOARD: {
		STATS: `${API_VERSION}/dashboard/stats`,
		DELIVERIES: `${API_VERSION}/deliveries`,
	},

	// Telegram destinations
	TELEGRAM: {
		DESTINATIONS: `${API_VERSION}/telegram/destinations`,
	},

	// WhatsApp Embedded Signup (1-Click OAuth)
	WHATSAPP: {
		OAUTH_CONFIG: `${API_VERSION}/channels/whatsapp/oauth/config`,
		OAUTH_CALLBACK: `${API_VERSION}/channels/whatsapp/oauth/callback`,
	},

	// Webhooks (Inbound Event Flywheel)
	WEBHOOKS: {
		TELEGRAM: (tenantId: string) =>
			`${API_VERSION}/webhooks/telegram/${tenantId}`,
	},
} as const;
