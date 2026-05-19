"use client";

import { motion } from "framer-motion";
import { useActionState, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { bookAppointmentAction } from "@/lib/booking/actions";
import { bookingInitialState } from "@/lib/booking/types";

type PublicSlot = {
  id: string;
  slot_datetime: string;
  is_booked: boolean;
  is_blocked: boolean;
};

export function PublicBookingFlow({
  slug,
  slots,
}: {
  slug: string;
  slots: PublicSlot[];
}) {
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    slots[0] ? toDateKey(slots[0].slot_datetime) : toDateKey(new Date()),
  );
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [state, formAction, pending] = useActionState(
    bookAppointmentAction,
    bookingInitialState,
  );

  const dates = useMemo(() => {
    const availableDates = Array.from(
      new Set(slots.map((slot) => toDateKey(slot.slot_datetime))),
    );
    return availableDates.slice(0, 30);
  }, [slots]);

  const daySlots = slots.filter(
    (slot) => toDateKey(slot.slot_datetime) === selectedDate,
  );

  if (state.status === "success") {
    return (
      <motion.section
        animate={{ opacity: 1, x: 0 }}
        className="rounded-[8px] border border-border bg-surface/85 p-6 text-center"
        initial={{ opacity: 0, x: 30 }}
      >
        <CheckCircle2 className="mx-auto text-accent" size={46} />
        <h2 className="mt-5 font-display text-3xl font-bold">
          Horario confirmado.
        </h2>
        <p className="mt-3 text-muted">{state.summary}</p>
        <p className="mt-6 leading-7 text-muted">
          Voce ja pode fechar esta tela. Qualquer mudanca, fale diretamente com
          a barbearia pelo WhatsApp.
        </p>
      </motion.section>
    );
  }

  return (
    <motion.section
      animate={{ opacity: 1, x: 0 }}
      className="overflow-hidden rounded-[8px] border border-border bg-surface/85"
      initial={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="border-b border-border p-5">
        <h2 className="font-display text-2xl font-bold">Escolha o dia</h2>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {dates.length > 0 ? (
            dates.map((date) => (
              <button
                className={`tron-focus min-h-12 rounded-[6px] border px-3 text-sm font-bold transition ${
                  selectedDate === date
                    ? "tron-accent-cta border-transparent"
                    : "border-border bg-background/60 text-foreground hover:border-accent"
                }`}
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedSlotId("");
                }}
                type="button"
              >
                {formatDateLabel(date)}
              </button>
            ))
          ) : (
            <p className="col-span-full text-muted">
              Nao ha horarios disponiveis nos proximos dias.
            </p>
          )}
        </div>
      </div>

      <form action={formAction} className="space-y-6 p-5">
        <input name="slug" type="hidden" value={slug} />
        <input name="slotId" type="hidden" value={selectedSlotId} />

        <div>
          <h3 className="font-display text-xl font-bold">Horarios do dia</h3>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {daySlots.length > 0 ? (
              daySlots.map((slot) => {
                const unavailable = slot.is_booked || slot.is_blocked;
                const selected = selectedSlotId === slot.id;

                return (
                  <button
                    className={`tron-focus min-h-12 rounded-[6px] border font-mono-data text-base font-bold transition ${
                      selected
                        ? "tron-accent-cta border-transparent"
                        : unavailable
                          ? "cursor-not-allowed border-border bg-surface-2 text-muted/60"
                          : "border-border bg-background/60 text-foreground hover:border-accent"
                    }`}
                    disabled={unavailable}
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    type="button"
                  >
                    {formatTime(slot.slot_datetime)}
                  </button>
                );
              })
            ) : (
              <p className="col-span-full text-muted">
                Nenhum horario cadastrado para este dia.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-bold">Nome</span>
            <input
              className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-4 text-base text-foreground placeholder:text-muted"
              name="name"
              placeholder="Seu nome"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold">WhatsApp</span>
            <input
              className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-4 text-base text-foreground placeholder:text-muted"
              name="whatsapp"
              placeholder="(00) 00000-0000"
              required
            />
          </label>
        </div>

        {state.status === "error" ? (
          <p className="rounded-[6px] border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-[#ffb4b4]">
            {state.message}
          </p>
        ) : null}

        <button
          className="tron-focus tron-accent-cta flex min-h-12 w-full items-center justify-center gap-2 rounded-[6px] px-5 font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending || !selectedSlotId}
          type="submit"
        >
          {pending ? "Confirmando..." : "Confirmar horario"}
          <ArrowRight size={18} />
        </button>
      </form>
    </motion.section>
  );
}

function toDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
