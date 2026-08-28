"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants/routes.const";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get("redirect_url");
  const redirectUrl =
    requestedRedirect && requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : APP_ROUTES.DASHBOARD.BASE;

  return (
    <SignIn
      path={APP_ROUTES.AUTH.SIGN_IN}
      routing="path"
      signUpUrl={APP_ROUTES.AUTH.SIGN_UP}
      forceRedirectUrl={redirectUrl}
      fallbackRedirectUrl={redirectUrl}
    />
  );
}
