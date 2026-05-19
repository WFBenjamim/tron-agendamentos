"use client";

import { Download, Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type StatusSlot = {
  id: string;
  slot_datetime: string;
  is_booked: boolean;
  is_blocked: boolean;
};

type StatusImageGeneratorProps = {
  barbershopName: string;
  logoUrl?: string | null;
  slots: StatusSlot[];
};

const canvasWidth = 1080;
const canvasHeight = 1920;

export function StatusImageGenerator({
  barbershopName,
  logoUrl,
  slots,
}: StatusImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dates = useMemo(() => {
    const uniqueDates = Array.from(
      new Set(slots.map((slot) => dateKey(slot.slot_datetime))),
    );
    return uniqueDates.length > 0 ? uniqueDates : [dateKey(new Date())];
  }, [slots]);
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  const selectedSlots = slots.filter(
    (slot) => dateKey(slot.slot_datetime) === selectedDate,
  );

  useEffect(() => {
    void drawStatusImage({
      canvas: canvasRef.current,
      barbershopName,
      logoUrl,
      selectedDate,
      slots: selectedSlots,
      withLogo: true,
    });
  }, [barbershopName, logoUrl, selectedDate, selectedSlots]);

  async function handleGenerate() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    await drawStatusImage({
      canvas,
      barbershopName,
      logoUrl,
      selectedDate,
      slots: selectedSlots,
      withLogo: true,
    });

    let url = "";
    try {
      url = canvas.toDataURL("image/png");
    } catch {
      await drawStatusImage({
        canvas,
        barbershopName,
        logoUrl: null,
        selectedDate,
        slots: selectedSlots,
        withLogo: false,
      });
      url = canvas.toDataURL("image/png");
    }

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `agenda-${selectedDate}.png`;
    anchor.click();
  }

  return (
    <section className="rounded-[8px] border border-border bg-surface/80 p-5">
      <ImageIcon className="text-accent" size={28} />
      <h2 className="mt-5 font-display text-2xl font-bold">
        Imagem para status
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        Gere uma arte vertical com a logo da barbearia e os horarios livres e
        marcados do dia.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <select
          className="tron-focus min-h-12 rounded-[6px] border border-border bg-background/60 px-3 text-foreground"
          onChange={(event) => setSelectedDate(event.target.value)}
          value={selectedDate}
        >
          {dates.map((date) => (
            <option key={date} value={date}>
              {formatLongDate(date)}
            </option>
          ))}
        </select>
        <button
          className="tron-focus tron-accent-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] px-5 font-extrabold"
          onClick={handleGenerate}
          type="button"
        >
          <Download size={18} />
          Gerar PNG
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-[8px] border border-border bg-background/60 p-3">
        <canvas
          aria-label="Previa da imagem de status"
          className="mx-auto block h-auto max-h-[440px] w-auto max-w-full rounded-[6px]"
          height={canvasHeight}
          ref={canvasRef}
          width={canvasWidth}
        />
        <button
          className="tron-focus mt-3 min-h-11 w-full rounded-[6px] border border-border px-4 text-sm font-bold text-foreground transition hover:border-accent"
          onClick={() =>
            drawStatusImage({
              canvas: canvasRef.current,
              barbershopName,
              logoUrl,
              selectedDate,
              slots: selectedSlots,
              withLogo: true,
            })
          }
          type="button"
        >
          Atualizar previa
        </button>
      </div>
    </section>
  );
}

async function drawStatusImage({
  canvas,
  barbershopName,
  logoUrl,
  selectedDate,
  slots,
  withLogo,
}: {
  canvas: HTMLCanvasElement | null;
  barbershopName: string;
  logoUrl?: string | null;
  selectedDate: string;
  slots: StatusSlot[];
  withLogo: boolean;
}) {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  const gradient = context.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  gradient.addColorStop(0, "#0c0c0e");
  gradient.addColorStop(0.62, "#111114");
  gradient.addColorStop(1, "#182000");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  context.fillStyle = "rgba(186, 255, 0, 0.08)";
  context.beginPath();
  context.arc(940, 170, 360, 0, Math.PI * 2);
  context.fill();

  if (withLogo && logoUrl) {
    const logo = await loadImage(logoUrl);
    if (logo) {
      context.save();
      roundedRect(context, 80, 92, 148, 148, 28);
      context.clip();
      context.drawImage(logo, 80, 92, 148, 148);
      context.restore();
    } else {
      drawInitials(context, barbershopName);
    }
  } else {
    drawInitials(context, barbershopName);
  }

  context.fillStyle = "#f0ede8";
  context.font = "700 54px Syne, Arial, sans-serif";
  context.fillText(barbershopName, 260, 142);
  context.fillStyle = "#baff00";
  context.font = "700 28px Geist Mono, monospace";
  context.fillText("AGENDA DO DIA", 260, 194);

  context.fillStyle = "#f0ede8";
  context.font = "700 82px Syne, Arial, sans-serif";
  context.fillText(formatLongDate(selectedDate), 80, 365);

  context.fillStyle = "#9b9baa";
  context.font = "400 34px DM Sans, Arial, sans-serif";
  context.fillText("Horarios livres e marcados para hoje.", 80, 425);

  const available = slots.filter((slot) => !slot.is_booked && !slot.is_blocked);
  const booked = slots.filter((slot) => slot.is_booked);
  const blocked = slots.filter((slot) => slot.is_blocked);
  drawSummary(context, available.length, booked.length, blocked.length);

  const list = slots.slice(0, 18);
  let y = 660;

  if (list.length === 0) {
    context.fillStyle = "#f0ede8";
    context.font = "700 46px Syne, Arial, sans-serif";
    context.fillText("Sem horarios abertos", 80, y);
    context.fillStyle = "#9b9baa";
    context.font = "400 30px DM Sans, Arial, sans-serif";
    context.fillText("Fale com a barbearia para consultar a agenda.", 80, y + 58);
  } else {
    for (const slot of list) {
      drawSlotRow(context, slot, y);
      y += 84;
    }
  }

  context.fillStyle = "#baff00";
  context.font = "700 30px DM Sans, Arial, sans-serif";
  context.fillText("Agende pelo link da barbearia", 80, 1760);
  context.fillStyle = "#f0ede8";
  context.font = "700 42px Syne, Arial, sans-serif";
  context.fillText("TRON AGENDAMENTO", 80, 1820);
}

function drawInitials(context: CanvasRenderingContext2D, name: string) {
  roundedRect(context, 80, 92, 148, 148, 28);
  context.fillStyle = "#baff00";
  context.fill();
  context.fillStyle = "#08090a";
  context.font = "800 54px Syne, Arial, sans-serif";
  context.textAlign = "center";
  context.fillText(getInitials(name), 154, 180);
  context.textAlign = "start";
}

function drawSummary(
  context: CanvasRenderingContext2D,
  available: number,
  booked: number,
  blocked: number,
) {
  const items = [
    ["Livres", available, "#baff00"],
    ["Marcados", booked, "#eab308"],
    ["Fechados", blocked, "#8b8b98"],
  ] as const;

  items.forEach(([label, value, color], index) => {
    const x = 80 + index * 315;
    roundedRect(context, x, 500, 285, 98, 18);
    context.fillStyle = "rgba(20, 20, 24, 0.92)";
    context.fill();
    context.strokeStyle = "rgba(255, 255, 255, 0.12)";
    context.stroke();
    context.fillStyle = color;
    context.font = "800 38px Geist Mono, monospace";
    context.fillText(String(value).padStart(2, "0"), x + 26, 558);
    context.fillStyle = "#f0ede8";
    context.font = "700 24px DM Sans, Arial, sans-serif";
    context.fillText(label, x + 98, 557);
  });
}

function drawSlotRow(context: CanvasRenderingContext2D, slot: StatusSlot, y: number) {
  const status = slot.is_booked
    ? ["Marcado", "#eab308"]
    : slot.is_blocked
      ? ["Fechado", "#8b8b98"]
      : ["Disponivel", "#baff00"];

  roundedRect(context, 80, y, 920, 64, 16);
  context.fillStyle = "rgba(20, 20, 24, 0.9)";
  context.fill();
  context.strokeStyle = "rgba(255, 255, 255, 0.1)";
  context.stroke();
  context.fillStyle = "#f0ede8";
  context.font = "800 34px Geist Mono, monospace";
  context.fillText(formatTime(slot.slot_datetime), 116, y + 43);
  context.fillStyle = status[1];
  context.font = "800 28px DM Sans, Arial, sans-serif";
  context.textAlign = "right";
  context.fillText(status[0], 954, y + 42);
  context.textAlign = "start";
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function dateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
