import Link from "next/link";
import { ArrowRight, CalendarDays, MessageCircle, Sparkles } from "lucide-react";

const benefits = [
  {
    title: "Agende sem complicacao",
    text: "Seu cliente escolhe o melhor horario em poucos toques, direto pelo link da sua barbearia.",
    icon: CalendarDays,
  },
  {
    title: "Mais tempo para atender",
    text: "Menos mensagens repetidas, menos confusao na agenda e mais foco nos cortes do dia.",
    icon: Sparkles,
  },
  {
    title: "Pensado para WhatsApp",
    text: "Compartilhe seu link com facilidade e deixe seus clientes sempre perto da sua agenda.",
    icon: MessageCircle,
  },
];

export default function Home() {
  return (
    <main className="min-h-svh px-5 py-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-[8px] border border-border bg-surface/70 px-4 py-3 backdrop-blur">
        <Link className="font-display text-lg font-bold uppercase" href="/">
          Tron Agendamento
        </Link>
        <div className="flex items-center gap-2">
          <Link
            className="tron-focus hidden rounded-[6px] px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground sm:inline-flex"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="tron-focus tron-accent-cta inline-flex min-h-11 items-center gap-2 rounded-[6px] px-4 py-2 text-sm font-extrabold transition"
            href="/cadastro"
          >
            Comecar
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-end gap-10 pb-16 pt-24 lg:min-h-[78svh] lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-5 font-mono-data text-sm uppercase text-accent">
            Sistema de agenda para barbearias
          </p>
          <h1 className="font-display max-w-4xl text-6xl font-bold leading-[0.9] text-foreground sm:text-7xl lg:text-8xl">
            O horario certo, no corte certo.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">
            O sistema mais pratico do mercado para sua barbearia receber
            agendamentos, organizar o dia e vender mais sem perder tempo no
            celular.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              className="tron-focus tron-accent-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] px-6 font-extrabold transition"
              href="/cadastro"
            >
              Criar minha barbearia
              <ArrowRight size={18} />
            </Link>
            <Link
              className="tron-focus inline-flex min-h-12 items-center justify-center rounded-[6px] border border-border px-6 font-bold text-foreground transition hover:border-accent"
              href="/login"
            >
              Ja tenho conta
            </Link>
          </div>
        </div>

        <div className="rounded-[8px] border border-border bg-surface/85 p-4 shadow-2xl shadow-black/30">
          <div className="rounded-[6px] border border-border bg-background/70 p-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-xl font-bold">
                Agenda de hoje
              </span>
              <span className="tron-accent-cta rounded-[6px] px-3 py-1 font-mono-data text-xs font-extrabold">
                +18%
              </span>
            </div>
            <div className="space-y-3">
              {["09:00 Corte social", "10:30 Barba + cabelo", "14:00 Combo"].map(
                (item) => (
                  <div
                    className="flex min-h-14 items-center justify-between rounded-[6px] border border-border bg-surface px-4"
                    key={item}
                  >
                    <span className="font-mono-data text-sm text-foreground">
                      {item}
                    </span>
                    <span className="size-2 rounded-full bg-accent" />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 pb-20 md:grid-cols-3">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <article
              className="rounded-[8px] border border-border bg-surface/75 p-6 transition duration-300 hover:border-accent/60 hover:shadow-[0_0_40px_rgba(200,255,0,0.08)]"
              key={benefit.title}
            >
              <Icon className="mb-8 text-accent" size={26} />
              <h2 className="font-display text-2xl font-bold">
                {benefit.title}
              </h2>
              <p className="mt-4 leading-7 text-muted">{benefit.text}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
