import { AuthCard } from "@/components/auth/auth-card";
import { signupAction } from "@/lib/auth/actions";

export default function CadastroPage() {
  return <AuthCard action={signupAction} mode="signup" />;
}
