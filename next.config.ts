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

export default withSentryConfig(nextConfig, {
	silent: true,
	telemetry: false,
	// Source maps upload only when an auth token is configured; otherwise the
	// build would fail on a missing token in local and preview environments.
	sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
