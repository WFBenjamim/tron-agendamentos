"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, LockKeyhole, Mail, Scissors, Store } from "lucide-react";
import { authInitialState, type AuthFormState } from "@/lib/auth/types";

type AuthMode = "login" | "signup";

type AuthCardProps = {
  mode: AuthMode;
  action: (
    previousState: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
};

export function AuthCard({ mode, action }: AuthCardProps) {
  const [state, formAction, pending] = useActionState(action, authInitialState);
  const isSignup = mode === "signup";

  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden px-5 py-10">
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 z-30 origin-top bg-accent"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.85, ease: [0.77, 0, 0.175, 1] }}
      />

      <section className="grid w-full max-w-6xl overflow-hidden rounded-[8px] border border-border bg-surface/90 shadow-2xl shadow-black/40 backdrop-blur md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden min-h-[680px] border-r border-border bg-[#101012] p-10 md:flex md:flex-col md:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,255,0,0.14),transparent_22rem)]" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="tron-accent-cta grid size-11 place-items-center rounded-[6px] border border-accent/35">
                <Scissors size={22} />
              </span>
              <span className="font-display text-xl font-bold uppercase tracking-normal">
                Tron Agendamento
              </span>
            </Link>
          </div>

          <div className="relative space-y-8">
            <p className="font-mono-data text-sm uppercase text-accent">
              Sistema para barbearias brasileiras
            </p>
            <h1 className="font-display text-5xl font-bold leading-[0.95] text-foreground">
              Agenda cheia, caixa claro, cliente no horario.
            </h1>
            <p className="max-w-md text-lg leading-8 text-muted">
              Painel para o dono e link publico para o cliente marcar sem
              friccao. Escuro, rapido e feito para operacao diaria.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            {["Simples", "Rapido", "Online"].map((item) => (
              <div
                className="rounded-[6px] border border-border bg-surface-2 p-4 text-center font-mono-data text-sm text-muted"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-8 sm:px-10 md:px-14 md:py-14">
          <div className="mb-10 md:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="tron-accent-cta grid size-10 place-items-center rounded-[6px]">
                <Scissors size={20} />
              </span>
              <span className="font-display text-lg font-bold uppercase">
                Tron Agendamento
              </span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-3 font-mono-data text-xs uppercase text-accent">
              {isSignup ? "Comece no Pro" : "Acesso do dono"}
            </p>
            <h2 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              {isSignup ? "Crie sua barbearia." : "Entre no painel."}
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-muted">
              {isSignup
                ? "Crie seu acesso, escolha o nome do seu link e comece a organizar seus horarios com mais facilidade."
                : "Entre para acompanhar sua agenda, seus clientes e o movimento da barbearia em um painel direto ao ponto."}
            </p>
          </motion.div>

          <form action={formAction} className="mt-10 space-y-4">
            {isSignup ? (
              <>
                <Field
                  icon={<Store size={18} />}
                  label="Nome da barbearia"
                  name="barbershopName"
                  placeholder="Barbearia Central"
                />
                <Field
                  icon={<ArrowRight size={18} />}
                  label="Slug desejado"
                  name="slug"
                  placeholder="barbearia-central"
                />
              </>
            ) : null}

            <Field
              icon={<Mail size={18} />}
              label="E-mail"
              name="email"
              placeholder="voce@barbearia.com"
              type="email"
            />
            <Field
              icon={<LockKeyhole size={18} />}
              label="Senha"
              name="password"
              placeholder="Minimo 6 caracteres"
              type="password"
            />

            {state.status === "error" ? (
              <p className="rounded-[6px] border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-[#ffb4b4]">
                {state.message}
              </p>
            ) : null}

            <button
              className="tron-focus tron-accent-cta group flex min-h-12 w-full items-center justify-center gap-2 rounded-[6px] px-5 font-extrabold transition duration-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              {pending
                ? "Processando..."
                : isSignup
                  ? "Criar barbearia"
                  : "Entrar"}
              <ArrowRight
                className="transition group-hover:translate-x-1"
                size={18}
              />
            </button>
          </form>

          <div className="mt-8 text-sm text-muted">
            {isSignup ? "Ja tem conta?" : "Ainda nao usa o Tron?"}{" "}
            <Link
              className="tron-focus font-bold text-foreground underline decoration-accent underline-offset-4"
              href={isSignup ? "/login" : "/cadastro"}
            >
              {isSignup ? "Entrar" : "Criar cadastro"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  icon,
  label,
  name,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="flex min-h-12 items-center gap-3 rounded-[6px] border border-border bg-background/40 px-4 text-muted transition focus-within:border-accent focus-within:text-accent">
        {icon}
        <input
          className="tron-focus min-h-11 flex-1 bg-transparent text-base text-foreground placeholder:text-muted/70"
          name={name}
          placeholder={placeholder}
          required
          type={type}
        />
      </span>
    </label>
  );
}
