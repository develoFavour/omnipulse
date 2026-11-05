import type { ErrorEvent } from "@sentry/nextjs";

// Recipient routing values are phone numbers or Telegram chat IDs. They can
// leak into error messages, so they are redacted before leaving the browser.
const PHONE = /\+?\d{9,15}/g;
const EMAIL = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;
const TOKEN_PATH = /\/(review|invitations)\/[^/?#]+/g;

export function scrubText(value: string): string {
	return value
		.replace(TOKEN_PATH, "/$1/[redacted]")
		.replace(EMAIL, "[email]")
		.replace(PHONE, "[recipient]");
}

export function scrubEvent(event: ErrorEvent): ErrorEvent {
	if (event.message) event.message = scrubText(event.message);

	for (const exception of event.exception?.values ?? []) {
		if (exception.value) exception.value = scrubText(exception.value);
	}

	for (const breadcrumb of event.breadcrumbs ?? []) {
		if (breadcrumb.message) breadcrumb.message = scrubText(breadcrumb.message);
		if (breadcrumb.data) {
			for (const [key, value] of Object.entries(breadcrumb.data)) {
				if (typeof value === "string") breadcrumb.data[key] = scrubText(value);
			}
		}
	}

	// Request payloads can carry message copy, consent notes, and credentials.
	if (event.request) {
		delete event.request.data;
		delete event.request.cookies;
		delete event.request.query_string;
		if (event.request.url) event.request.url = scrubText(event.request.url);
		for (const header of [
			"authorization",
			"cookie",
			"x-api-key",
			"x-telegram-bot-api-secret-token",
			"x-hub-signature-256",
		]) {
			delete event.request.headers?.[header];
		}
	}

	if (event.user) {
		event.user.email = undefined;
		event.user.ip_address = undefined;
		event.user.username = undefined;
	}

	return event;
}

export function sentryOptions(dsn: string | undefined, environment: string | undefined) {
	return {
		dsn,
		environment: environment ?? process.env.NODE_ENV,
		// Error monitoring only: no performance spans, session replay, or PII.
		sendDefaultPII: false,
		tracesSampleRate: 0,
		replaysSessionSampleRate: 0,
		replaysOnErrorSampleRate: 0,
		beforeSend: scrubEvent,
	};
}
