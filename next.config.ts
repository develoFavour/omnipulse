import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

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
