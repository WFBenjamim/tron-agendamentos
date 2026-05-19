import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Scissors } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  ["Agenda", "/dashboard/agenda"],
  ["Agendamentos", "/dashboard/agendamentos"],
  ["Clientes", "/dashboard/clientes"],
  ["Financeiro", "/dashboard/financeiro"],
  ["Configuracoes", "/dashboard/configuracoes"],
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("name, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-border bg-background/82 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link className="flex items-center gap-3" href="/dashboard/agenda">
            <span className="tron-accent-cta grid size-10 place-items-center rounded-[6px]">
              <Scissors size={20} />
            </span>
            <span>
              <span className="block font-display text-lg font-bold uppercase leading-none">
                Tron
              </span>
              <span className="text-xs text-muted">
                {barbershop?.name ?? "Barbearia"}
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map(([label, href]) => (
              <Link
                className="tron-focus rounded-[6px] px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-foreground"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </div>

          <form action={signOutAction}>
            <button
              className="tron-focus inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-border px-3 text-sm font-bold text-foreground transition hover:border-accent"
              type="submit"
            >
              <LogOut size={16} />
              Sair
            </button>
          </form>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">{children}</div>
    </main>
  );
}
