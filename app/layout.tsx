import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ClerkAuthProvider } from "@/components/providers/ClerkAuthProvider";
import { clerkBrandAppearance } from "@/lib/constants/clerk-theme";
import "./globals.css";

const inter = Inter({
	variable: "--font-sans",
	subsets: ["latin"],
});

const outfit = Outfit({
	variable: "--font-heading",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
});

const siteUrl =
	process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const siteDescription =
	"Plan, route, and deliver compliant multi-channel campaigns across your team. Multi-channel campaign operations for modern teams.";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: "MessageRail | Multi-Channel Campaign Operations",
	description: siteDescription,
	applicationName: "MessageRail",
	icons: {
		icon: "/logos/messagerail-emblem.svg",
		apple: "/logos/messagerail-emblem.svg",
	},
	openGraph: {
		type: "website",
		siteName: "MessageRail",
		url: siteUrl,
		title: "MessageRail | Multi-Channel Campaign Operations",
		description: siteDescription,
		images: [
			{
				url: "/logos/og-image.png",
				width: 1200,
				height: 630,
				alt: "MessageRail",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "MessageRail | Multi-Channel Campaign Operations",
		description: siteDescription,
		images: ["/logos/og-image.png"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col font-sans bg-[#f9fafb] text-zinc-900">
				<ClerkProvider appearance={clerkBrandAppearance as any}>
					<ClerkAuthProvider>
						{children}
						<Toaster />
					</ClerkAuthProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
