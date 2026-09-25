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
		SCHEDULE: (id: string) => `${API_VERSION}/campaigns/${id}/schedule`,
		STATS: (id: string) => `${API_VERSION}/campaigns/${id}/stats`,
		DELIVERIES: (id: string) => `${API_VERSION}/campaigns/${id}/deliveries`,
	},

	// Dashboard
	DASHBOARD: {
		STATS: `${API_VERSION}/dashboard/stats`,
		DELIVERIES: `${API_VERSION}/deliveries`,
	},

	// Telegram destinations
	TELEGRAM: {
		DESTINATIONS: `${API_VERSION}/telegram/destinations`,
		SYNC_CONTACTS: `${API_VERSION}/channels/telegram/sync-contacts`,
	},

	// WhatsApp Multi-Device QR Connection
	WHATSAPP: {
		OAUTH_CONFIG: `${API_VERSION}/channels/whatsapp/oauth/config`,
		OAUTH_CALLBACK: `${API_VERSION}/channels/whatsapp/oauth/callback`,
		QR: `${API_VERSION}/channels/whatsapp/qr`,
		STATUS: `${API_VERSION}/channels/whatsapp/status`,
		DISCONNECT: `${API_VERSION}/channels/whatsapp/disconnect`,
		SYNC_CONTACTS: `${API_VERSION}/channels/whatsapp/sync-contacts`,
	},

	// Webhooks (Inbound Event Flywheel)
	WEBHOOKS: {
		TELEGRAM: (tenantId: string) =>
			`${API_VERSION}/webhooks/telegram/${tenantId}`,
	},

	// Media Storage (Cloudinary Upload Pipeline)
	MEDIA: {
		UPLOAD: `${API_VERSION}/media/upload`,
	},

	// Audience Tags & Segmentation
	TAGS: {
		BASE: `${API_VERSION}/tags`,
		BY_ID: (id: string) => `${API_VERSION}/tags/${id}`,
		BULK_ASSIGN: (tagId: string) => `${API_VERSION}/tags/${tagId}/bulk-assign`,
		ASSIGN_CONTACT: (contactId: string) => `${API_VERSION}/contacts/${contactId}/tags`,
		REMOVE_CONTACT: (contactId: string, tagId: string) => `${API_VERSION}/contacts/${contactId}/tags/${tagId}`,
	},

	// Message Templates Library
	TEMPLATES: {
		BASE: `${API_VERSION}/templates`,
		BY_ID: (id: string) => `${API_VERSION}/templates/${id}`,
	},
} as const;
