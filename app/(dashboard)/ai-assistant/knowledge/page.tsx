"use client";

import Link from "next/link";
import { ArrowLeft, Library } from "lucide-react";
import { KnowledgeLibrary } from "@/components/features/ai/KnowledgeLibrary";

export default function AIAssistantKnowledgePage() {
	return (
		<main className="mx-auto max-w-6xl space-y-6 p-6 lg:p-10">
			<Link href="/ai-assistant" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
				<ArrowLeft className="h-4 w-4" /> AI Assistant
			</Link>
			<header>
				<div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
					<Library className="h-6 w-6" />
				</div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">Knowledge library</h1>
				<p className="mt-1 text-sm text-gray-600">Search and manage the approved answers available to your assistant.</p>
			</header>
			<KnowledgeLibrary />
		</main>
	);
}
