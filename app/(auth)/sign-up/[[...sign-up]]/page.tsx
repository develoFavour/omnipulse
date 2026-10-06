import { SignUp } from "@clerk/nextjs";
import { APP_ROUTES } from "@/lib/constants/routes.const";
import { clerkBrandAppearance } from "@/lib/constants/clerk-theme";

export default function SignUpPage() {
  return (
    <SignUp
      path={APP_ROUTES.AUTH.SIGN_UP}
      routing="path"
      signInUrl={APP_ROUTES.AUTH.SIGN_IN}
      fallbackRedirectUrl={APP_ROUTES.ONBOARDING.BRAND}
      appearance={clerkBrandAppearance as any}
    />
  );
}
