"use server";

import { createPublicClient } from "@/lib/supabase/public";
import type { BookingState } from "@/lib/booking/types";

export async function bookAppointmentAction(
  _previousState: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const slug = String(formData.get("slug") ?? "");
  const slotId = String(formData.get("slotId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();

  if (!slug || !slotId || !name || !whatsapp) {
    return {
      status: "error",
      message: "Preencha nome, WhatsApp e escolha um horario.",
    };
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("create_public_appointment", {
    p_slug: slug,
    p_slot_id: slotId,
    p_client_name: name,
    p_whatsapp: whatsapp,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message === "SLOT_UNAVAILABLE"
          ? "Esse horario acabou de ser reservado. Escolha outro horario."
          : "Nao foi possivel confirmar agora. Tente novamente.",
    };
  }

  const appointment = Array.isArray(data) ? data[0] : data;
  const date = appointment?.slot_datetime
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(appointment.slot_datetime))
    : "horario escolhido";

  return {
    status: "success",
    message: "Agendamento confirmado.",
    summary: `${appointment?.barbershop_name ?? "Barbearia"} - ${date}`,
  };
}
