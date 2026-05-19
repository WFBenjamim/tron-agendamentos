import Link from "next/link";
import {
  CalendarPlus,
  Clock,
  Lock,
  Trash2,
  Unlock,
} from "lucide-react";
import { StatusImageGenerator } from "@/components/booking/status-image-generator";
import {
  blockSlotAction,
  createSlotsBatchAction,
  deleteSlotAction,
  releaseSlotAction,
} from "@/lib/dashboard/actions";
import { createClient } from "@/lib/supabase/server";

const weekdays = [
  ["1", "Seg"],
  ["2", "Ter"],
  ["3", "Qua"],
  ["4", "Qui"],
  ["5", "Sex"],
  ["6", "Sab"],
  ["0", "Dom"],
];

export default async function AgendaPage() {
  const supabase = await createClient();
  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("id, name, slug, logo_url, plan")
    .maybeSingle();

  const { count: openSlots } = barbershop
    ? await supabase
        .from("available_slots")
        .select("id", { count: "exact", head: true })
        .eq("barbershop_id", barbershop.id)
        .eq("is_booked", false)
        .eq("is_blocked", false)
    : { count: 0 };

  const { data: upcomingSlots } = barbershop
    ? await supabase
        .from("available_slots")
        .select("id, slot_datetime, is_booked, is_blocked")
        .eq("barbershop_id", barbershop.id)
        .gte("slot_datetime", new Date().toISOString())
        .order("slot_datetime", { ascending: true })
        .limit(140)
    : { data: [] };

  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[8px] border border-border bg-surface/80 p-6">
          <p className="font-mono-data text-xs uppercase text-accent">
            Painel do dono
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-5xl">
            Agenda da {barbershop?.name ?? "barbearia"}
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Aqui voce acompanha os horarios da barbearia, prepara novos dias de
            atendimento e mantem tudo organizado para receber mais clientes.
          </p>
        </div>

        <div className="rounded-[8px] border border-border bg-surface/80 p-6">
          <p className="text-sm text-muted">Link publico</p>
          <Link
            className="tron-focus mt-3 block break-all font-mono-data text-sm text-accent underline underline-offset-4"
            href={barbershop ? `/b/${barbershop.slug}` : "/cadastro"}
          >
            {barbershop ? `/b/${barbershop.slug}` : "slug pendente"}
          </Link>
          <p className="mt-6 text-sm leading-6 text-muted">
            O QR Code sera gerado em Configuracoes usando este mesmo slug.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          icon={<Clock size={22} />}
          label="Horarios livres"
          value={String(openSlots ?? 0)}
        />
        <MetricCard
          icon={<CalendarPlus size={22} />}
          label="Plano"
          value="Pro"
        />
      </div>

      <StatusImageGenerator
        barbershopName={barbershop?.name ?? "Barbearia"}
        logoUrl={barbershop?.logo_url}
        slots={upcomingSlots ?? []}
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form
          action={createSlotsBatchAction}
          className="rounded-[8px] border border-border bg-surface/80 p-5"
        >
          <CalendarPlus className="text-accent" size={28} />
          <h2 className="mt-5 font-display text-2xl font-bold">
            Abrir horarios
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Escolha os dias, a faixa de atendimento e o intervalo. O link do
            cliente mostra automaticamente os horarios livres.
          </p>

          <div className="mt-5 grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-sm font-bold">Data inicial</span>
                <input
                  className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-3 text-foreground"
                  defaultValue={today}
                  min={today}
                  name="startDate"
                  required
                  type="date"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold">Data final</span>
                <input
                  className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-3 text-foreground"
                  defaultValue={nextWeek}
                  min={today}
                  name="endDate"
                  required
                  type="date"
                />
              </label>
            </div>

            <div>
              <span className="text-sm font-bold">Dias da semana</span>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {weekdays.map(([value, label]) => (
                  <label
                    className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-border bg-background/60 px-2 text-sm font-bold text-foreground transition hover:border-accent"
                    key={value}
                  >
                    <input
                      className="accent-[var(--accent)]"
                      defaultChecked={["1", "2", "3", "4", "5"].includes(value)}
                      name="weekdays"
                      type="checkbox"
                      value={value}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <label className="space-y-2">
                <span className="text-sm font-bold">Inicio</span>
                <input
                  className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-3 text-foreground"
                  defaultValue="09:00"
                  name="startTime"
                  required
                  type="time"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold">Fim</span>
                <input
                  className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-3 text-foreground"
                  defaultValue="18:00"
                  name="endTime"
                  required
                  type="time"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold">Intervalo</span>
                <select
                  className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-3 text-foreground"
                  defaultValue="30"
                  name="interval"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </label>
            </div>

            <button
              className="tron-focus tron-accent-cta min-h-12 rounded-[6px] px-5 font-extrabold"
              type="submit"
            >
              Criar horarios
            </button>
          </div>
        </form>

        <div className="rounded-[8px] border border-border bg-surface/80">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-2xl font-bold">
              Proximos horarios
            </h2>
            <p className="mt-2 text-sm text-muted">
              Bloqueie pausas, libere novamente ou remova horarios que nao
              serao usados.
            </p>
          </div>

          <div className="divide-y divide-border">
            {upcomingSlots && upcomingSlots.length > 0 ? (
              upcomingSlots.map((slot) => (
                <article
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_140px_220px] md:items-center"
                  key={slot.id}
                >
                  <div>
                    <p className="font-mono-data text-sm font-bold text-foreground">
                      {formatDateTime(slot.slot_datetime)}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {slot.is_booked
                        ? "Reservado por cliente"
                        : slot.is_blocked
                          ? "Bloqueado pelo dono"
                          : "Livre para agendamento"}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-[6px] px-3 py-1 text-sm font-bold ${
                      slot.is_booked
                        ? "bg-warning/15 text-warning"
                        : slot.is_blocked
                          ? "bg-muted/15 text-muted"
                          : "bg-accent/15 text-accent"
                    }`}
                  >
                    {slot.is_booked
                      ? "Ocupado"
                      : slot.is_blocked
                        ? "Bloqueado"
                        : "Disponivel"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {slot.is_blocked ? (
                      <form action={releaseSlotAction}>
                        <input name="slotId" type="hidden" value={slot.id} />
                        <button
                          className="tron-focus inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-border px-3 text-sm font-bold text-foreground transition hover:border-accent"
                          disabled={slot.is_booked}
                          type="submit"
                        >
                          <Unlock size={16} />
                          Liberar
                        </button>
                      </form>
                    ) : (
                      <form action={blockSlotAction}>
                        <input name="slotId" type="hidden" value={slot.id} />
                        <button
                          className="tron-focus inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-border px-3 text-sm font-bold text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-45"
                          disabled={slot.is_booked}
                          type="submit"
                        >
                          <Lock size={16} />
                          Bloquear
                        </button>
                      </form>
                    )}
                    <form action={deleteSlotAction}>
                      <input name="slotId" type="hidden" value={slot.id} />
                      <button
                        className="tron-focus inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-danger/40 px-3 text-sm font-bold text-[#ffb4b4] transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-45"
                        disabled={slot.is_booked}
                        type="submit"
                      >
                        <Trash2 size={16} />
                        Remover
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <div className="p-8 text-center">
                <Clock className="mx-auto mb-4 text-accent" size={34} />
                <h3 className="font-display text-2xl font-bold">
                  Nenhum horario aberto.
                </h3>
                <p className="mx-auto mt-3 max-w-md text-muted">
                  Crie os primeiros horarios para eles aparecerem no link dos
                  clientes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[8px] border border-border bg-surface/80 p-5 transition duration-300 hover:border-accent/60 hover:shadow-[0_0_38px_rgba(200,255,0,0.08)]">
      <div className="mb-6 text-accent">{icon}</div>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-foreground">
        {value}
      </p>
    </article>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
