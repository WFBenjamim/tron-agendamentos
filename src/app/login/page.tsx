import { AuthCard } from "@/components/auth/auth-card";
import { loginAction } from "@/lib/auth/actions";

export default function LoginPage() {
  return <AuthCard action={loginAction} mode="login" />;
}
