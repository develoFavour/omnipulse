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

export const metadata: Metadata = {
	title: "OmniPulse | Unified Communication",
	description: "The multi-channel command center for your business.",
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
