import { CalendarCheck, Check, X } from "lucide-react";
import {
  cancelAppointmentAction,
  markAppointmentDoneAction,
} from "@/lib/dashboard/actions";
import { createClient } from "@/lib/supabase/server";

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("id")
    .maybeSingle();

  const { data: appointments } = barbershop
    ? await supabase
        .from("appointments")
        .select(
          "id, status, slot_id, created_at, clients(name, whatsapp), available_slots(slot_datetime)",
        )
        .eq("barbershop_id", barbershop.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section className="space-y-6">
      <header className="rounded-[8px] border border-border bg-surface/80 p-6">
        <p className="font-mono-data text-xs uppercase text-accent">
          Agendamentos
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold">
          Tudo que entrou pela agenda.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Veja quem marcou, acompanhe os horarios e resolva cancelamentos sem
          baguncar o atendimento do dia.
        </p>
      </header>

      <div className="rounded-[8px] border border-border bg-surface/80">
        <div className="grid grid-cols-[1fr_160px_160px_210px] gap-4 border-b border-border px-5 py-4 text-sm font-bold text-muted max-lg:hidden">
          <span>Cliente</span>
          <span>Horario</span>
          <span>Status</span>
          <span>Acoes</span>
        </div>

        <div className="divide-y divide-border">
          {appointments && appointments.length > 0 ? (
            appointments.map((appointment) => {
              const client = firstRelation(appointment.clients);
              const slot = firstRelation(appointment.available_slots);

              return (
                <article
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_160px_160px_210px] lg:items-center"
                  key={appointment.id}
                >
                  <div>
                    <p className="font-bold text-foreground">
                      {client?.name ?? "Cliente"}
                    </p>
                    <p className="mt-1 font-mono-data text-sm text-muted">
                      {client?.whatsapp ?? "WhatsApp nao informado"}
                    </p>
                  </div>
                  <p className="font-mono-data text-sm text-foreground">
                    {slot?.slot_datetime
                      ? formatDateTime(slot.slot_datetime)
                      : "Sem horario"}
                  </p>
                  <span className="w-fit rounded-[6px] border border-border px-3 py-1 text-sm font-bold text-muted">
                    {statusLabel(appointment.status)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <form action={markAppointmentDoneAction}>
                      <input
                        name="appointmentId"
                        type="hidden"
                        value={appointment.id}
                      />
                      <button
                        className="tron-focus inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-border px-3 text-sm font-bold text-foreground transition hover:border-accent"
                        type="submit"
                      >
                        <Check size={16} />
                        Feito
                      </button>
                    </form>
                    <form action={cancelAppointmentAction}>
                      <input
                        name="appointmentId"
                        type="hidden"
                        value={appointment.id}
                      />
                      <input
                        name="slotId"
                        type="hidden"
                        value={appointment.slot_id}
                      />
                      <button
                        className="tron-focus inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-danger/40 px-3 text-sm font-bold text-[#ffb4b4] transition hover:bg-danger/10"
                        type="submit"
                      >
                        <X size={16} />
                        Cancelar
                      </button>
                    </form>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="grid min-h-64 place-items-center p-8 text-center">
              <CalendarCheck className="mb-4 text-accent" size={34} />
              <h2 className="font-display text-2xl font-bold">
                Nenhum agendamento por enquanto.
              </h2>
              <p className="mt-3 max-w-md text-muted">
                Quando seus clientes marcarem pelo link, eles aparecem aqui.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function firstRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    confirmed: "Confirmado",
    cancelled: "Cancelado",
    done: "Realizado",
  };

  return labels[status] ?? status;
}
