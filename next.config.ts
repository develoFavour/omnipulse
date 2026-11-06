import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "0" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/connections/invite",
        destination: "/invite",
        permanent: false,
      },
      {
        source: "/connections/settings",
        destination: "/settings",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

const sentryUploadConfigured = Boolean(
	process.env.SENTRY_AUTH_TOKEN &&
		process.env.SENTRY_ORG &&
		process.env.SENTRY_PROJECT,
);

export default withSentryConfig(nextConfig, {
	silent: true,
	telemetry: false,
	// Source maps upload only when auth token, org, and project are all set;
	// otherwise the build stays offline instead of failing on a missing value.
	sourcemaps: { disable: !sentryUploadConfigured },
});
