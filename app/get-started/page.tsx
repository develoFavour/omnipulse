import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants/routes.const";

export default function GetStartedPage() {
  redirect(APP_ROUTES.AUTH.SIGN_UP);
}
