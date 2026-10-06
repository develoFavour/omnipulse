/**
 * OmniPulse "Wise" Design System — Auth Appearance
 * 
 * Synchronized with the landing page aesthetic:
 * - Canvas: Clean Linen / Fog (#fafbf8 / #ffffff)
 * - Forest Ink: #163300 (Deep rich moss green for typography & primary accents)
 * - Lime Voltage: #9fe870 (High-energy electric lime for pills & CTAs)
 * - Linen Mist: #e2f6d5 / #f4f5f2 (Subtle surface backgrounds)
 * - Borders: #e8ebe6 (Precise 1px hairline borders)
 */

export const clerkBrandAppearance = {
  variables: {
    colorPrimary: "#163300",
    colorText: "#0e0f0c",
    colorTextSecondary: "#454745",
    colorBackground: "#ffffff",
    colorInputBackground: "#f4f5f2",
    colorInputText: "#0e0f0c",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-sans), sans-serif",
    fontSize: "14px",
    colorDanger: "#cb272f",
    colorSuccess: "#054d28",
  },
  elements: {
    // Root & Card container - transparent to sit seamlessly in our architectural card
    rootBox: "w-full",
    card: "!bg-transparent !shadow-none !border-0 !p-0 w-full",
    cardBox: "!shadow-none !border-0 w-full",

    // Header Typography (Matches Hero Section font-heading & display bold)
    headerTitle:
      "!font-heading !font-black !text-2xl !tracking-tight !text-[#163300] !uppercase !text-center",
    headerSubtitle:
      "!text-xs !font-medium !text-[#454745] !text-center !mt-1.5 !leading-relaxed",

    // Social Login Buttons (Google, etc.) - clean pill with border
    socialButtonsBlockButton:
      "!rounded-full !border !border-[#e8ebe6] hover:!border-[#163300]/40 hover:!bg-[#f4f5f2] !text-[#0e0f0c] !font-bold !text-xs !py-3 !transition-all !shadow-none",
    socialButtonsBlockButtonText: "!font-bold !text-xs !text-[#0e0f0c]",
    socialButtonsProviderIcon: "!w-4 !h-4 !mr-2",

    // Divider
    dividerLine: "!bg-[#e8ebe6]",
    dividerText:
      "!text-[11px] !font-bold !text-[#868685] !uppercase !tracking-wider",

    // Form Field Labels
    formFieldLabel:
      "!text-xs !font-bold !uppercase !tracking-wider !text-[#163300] !mb-1.5",

    // Form Inputs - crisp linen input with focus border
    formFieldInput:
      "!rounded-xl !border !border-[#e8ebe6] !bg-[#f4f5f2] focus:!border-[#163300] focus:!bg-white focus:!ring-2 focus:!ring-[#9fe870]/50 !text-sm !text-[#0e0f0c] placeholder:!text-[#868685] !py-3 !px-4 !font-medium transition-all !shadow-none outline-none",
    formFieldInputShowPasswordButton:
      "!text-[#454745] hover:!text-[#163300] !transition-colors",

    // Primary CTA Button - Signature Wise Lime Voltage Pill Button
    formButtonPrimary:
      "!rounded-full !bg-[#9fe870] hover:!bg-[#8ee05c] !text-[#163300] !font-black !text-xs !uppercase !tracking-wider !py-3.5 !shadow-sm hover:!shadow-md !transition-all active:!scale-[0.98]",

    // Footer Links & Actions
    footer: "!bg-transparent !mt-4",
    footerAction: "!mt-2",
    footerActionText: "!text-xs !font-medium !text-[#454745]",
    footerActionLink:
      "!text-xs !font-bold !text-[#163300] hover:!text-[#054d28] hover:!underline !underline-offset-4 !transition-colors",

    // Identity Preview
    identityPreview:
      "!rounded-xl !border !border-[#e8ebe6] !bg-[#f4f5f2]",
    identityPreviewText: "!text-xs !font-medium !text-[#0e0f0c]",
    identityPreviewEditButton:
      "!text-xs !font-bold !text-[#163300] hover:!underline",

    // Feedback & Alerts
    formFieldError: "!text-xs !font-semibold !text-[#cb272f] !mt-1",
    alert:
      "!rounded-xl !border !border-red-200 !bg-red-50 !text-[#cb272f] !text-xs",
    alertText: "!text-xs !font-medium !text-[#cb272f]",

    // Internal containers
    main: "!bg-transparent",
    form: "!bg-transparent",
    footerPages: "!bg-transparent",
    badge:
      "!bg-[#e2f6d5] !text-[#163300] !font-bold !text-xs !rounded-full !border !border-[#9fe870]/70",
  },
} as const;
