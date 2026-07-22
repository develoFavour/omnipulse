import { SignUp } from "@clerk/nextjs";
import { APP_ROUTES } from "@/lib/constants/routes.const";

export default function SignUpPage() {
  return (
    <SignUp
      path={APP_ROUTES.AUTH.SIGN_UP}
      routing="path"
      signInUrl={APP_ROUTES.AUTH.SIGN_IN}
      fallbackRedirectUrl={APP_ROUTES.ONBOARDING.BRAND}
    />
  );
}
