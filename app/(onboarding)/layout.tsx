export default function OnboardingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-[#fafbf8] text-[#0e0f0c] selection:bg-[#9fe870] selection:text-[#163300]">
			{children}
		</div>
	);
}
