"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html lang="en" className="h-full antialiased">
			<body className="min-h-full bg-[#f9fafb] text-zinc-900">
				<main className="flex min-h-screen items-center justify-center px-6 py-16">
					<div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
							MessageRail
						</p>
						<h1 className="mt-4 text-2xl font-semibold text-zinc-900">
							Something went wrong
						</h1>
						<p className="mt-3 text-sm leading-6 text-zinc-600">
							The page could not finish loading. Your data is safe — retry, and if it
							keeps happening we have already been notified.
						</p>
						{error.digest ? (
							<p className="mt-3 text-xs text-zinc-400">
								Reference: <span className="font-mono">{error.digest}</span>
							</p>
						) : null}
						<div className="mt-6 flex flex-col gap-2">
							<button
								type="button"
								onClick={reset}
								className="w-full rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
							>
								Try again
							</button>
							<Link
								href="/"
								className="w-full rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
							>
								Back to dashboard
							</Link>
						</div>
					</div>
				</main>
			</body>
		</html>
	);
}
