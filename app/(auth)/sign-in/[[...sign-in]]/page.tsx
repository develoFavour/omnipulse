import { SignIn } from "@clerk/nextjs";
import { APP_ROUTES } from "@/lib/constants/routes.const";

export default function SignInPage() {
  return (
    <SignIn
      path={APP_ROUTES.AUTH.SIGN_IN}
      routing="path"
      signUpUrl={APP_ROUTES.AUTH.SIGN_UP}
      fallbackRedirectUrl={APP_ROUTES.DASHBOARD.BASE}
    />
  );
}
