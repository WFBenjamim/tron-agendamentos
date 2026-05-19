"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getOwnerBarbershopId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessao expirada.");
  }

  const { data, error } = await supabase
    .from("barbershops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (error || !data) {
    throw new Error("Barbearia nao encontrada.");
  }

  return { supabase, barbershopId: data.id };
}

export async function createSlotsBatchAction(formData: FormData) {
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const interval = Number(formData.get("interval") ?? 30);
  const weekdays = formData.getAll("weekdays").map((day) => Number(day));

  if (
    !startDate ||
    !endDate ||
    !startTime ||
    !endTime ||
    !interval ||
    weekdays.length === 0
  ) {
    return;
  }

  const { supabase, barbershopId } = await getOwnerBarbershopId();
  const rows: { barbershop_id: string; slot_datetime: string }[] = [];
  const cursor = new Date(`${startDate}T12:00:00-03:00`);
  const lastDay = new Date(`${endDate}T12:00:00-03:00`);

  while (cursor <= lastDay) {
    if (weekdays.includes(cursor.getDay())) {
      const day = cursor.toISOString().slice(0, 10);
      const currentMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);

      for (
        let minutes = currentMinutes;
        minutes < endMinutes;
        minutes += interval
      ) {
        rows.push({
          barbershop_id: barbershopId,
          slot_datetime: `${day}T${minutesToTime(minutes)}:00-03:00`,
        });
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  if (rows.length > 0) {
    await supabase
      .from("available_slots")
      .upsert(rows, {
        onConflict: "barbershop_id,slot_datetime",
        ignoreDuplicates: true,
      });
  }

  revalidatePath("/dashboard/agenda");
}

export async function blockSlotAction(formData: FormData) {
  const slotId = String(formData.get("slotId") ?? "");

  if (!slotId) {
    return;
  }

  const { supabase, barbershopId } = await getOwnerBarbershopId();

  await supabase
    .from("available_slots")
    .update({ is_blocked: true })
    .eq("id", slotId)
    .eq("barbershop_id", barbershopId)
    .eq("is_booked", false);

  revalidatePath("/dashboard/agenda");
}

export async function releaseSlotAction(formData: FormData) {
  const slotId = String(formData.get("slotId") ?? "");

  if (!slotId) {
    return;
  }

  const { supabase, barbershopId } = await getOwnerBarbershopId();

  await supabase
    .from("available_slots")
    .update({ is_blocked: false })
    .eq("id", slotId)
    .eq("barbershop_id", barbershopId)
    .eq("is_booked", false);

  revalidatePath("/dashboard/agenda");
}

export async function deleteSlotAction(formData: FormData) {
  const slotId = String(formData.get("slotId") ?? "");

  if (!slotId) {
    return;
  }

  const { supabase, barbershopId } = await getOwnerBarbershopId();

  await supabase
    .from("available_slots")
    .delete()
    .eq("id", slotId)
    .eq("barbershop_id", barbershopId)
    .eq("is_booked", false);

  revalidatePath("/dashboard/agenda");
}

export async function cancelAppointmentAction(formData: FormData) {
  const appointmentId = String(formData.get("appointmentId") ?? "");
  const slotId = String(formData.get("slotId") ?? "");

  if (!appointmentId || !slotId) {
    return;
  }

  const { supabase, barbershopId } = await getOwnerBarbershopId();

  await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId)
    .eq("barbershop_id", barbershopId);

  await supabase
    .from("available_slots")
    .update({ is_booked: false })
    .eq("id", slotId)
    .eq("barbershop_id", barbershopId);

  revalidatePath("/dashboard/agendamentos");
  revalidatePath("/dashboard/agenda");
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export async function markAppointmentDoneAction(formData: FormData) {
  const appointmentId = String(formData.get("appointmentId") ?? "");

  if (!appointmentId) {
    return;
  }

  const { supabase, barbershopId } = await getOwnerBarbershopId();

  await supabase
    .from("appointments")
    .update({ status: "done" })
    .eq("id", appointmentId)
    .eq("barbershop_id", barbershopId);

  revalidatePath("/dashboard/agendamentos");
}

export async function enqueueMessageAction(formData: FormData) {
  const message = String(formData.get("message") ?? "").trim();

  if (!message) {
    return;
  }

  const { supabase, barbershopId } = await getOwnerBarbershopId();
  const { data: clients } = await supabase
    .from("clients")
    .select("id")
    .eq("barbershop_id", barbershopId);

  const rows =
    clients?.map((client) => ({
      barbershop_id: barbershopId,
      client_id: client.id,
      message,
      type: "promo",
      status: "pending",
      scheduled_at: new Date().toISOString(),
    })) ?? [];

  if (rows.length > 0) {
    // TODO: WhatsApp integration
    await supabase.from("notification_queue").insert(rows);
  }

  revalidatePath("/dashboard/clientes");
}

export async function createTransactionAction(formData: FormData) {
  const amount = Number(formData.get("amount") ?? 0);
  const type = String(formData.get("type") ?? "income");
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const transactionDate = String(formData.get("transactionDate") ?? "");

  if (!amount || !category || !transactionDate) {
    return;
  }

  const { supabase, barbershopId } = await getOwnerBarbershopId();

  await supabase.from("transactions").insert({
    barbershop_id: barbershopId,
    amount,
    type,
    category,
    description,
    transaction_date: transactionDate,
  });

  revalidatePath("/dashboard/financeiro");
}

export async function updateSettingsAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const customMessage = String(formData.get("customMessage") ?? "").trim();
  const whatsappNumber = String(formData.get("whatsappNumber") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const logoFile = formData.get("logoFile");

  if (!name) {
    return;
  }

  const { supabase, barbershopId } = await getOwnerBarbershopId();
  let finalLogoUrl = logoUrl || null;

  if (logoFile instanceof File && logoFile.size > 0) {
    const extension = logoFile.name.split(".").pop() || "png";
    const safeExtension = extension.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const path = `${barbershopId}/${Date.now()}.${safeExtension || "png"}`;
    const { error: uploadError } = await supabase.storage
      .from("barbershop-logos")
      .upload(path, logoFile, {
        upsert: true,
        contentType: logoFile.type || "image/png",
      });

    if (!uploadError) {
      const { data } = supabase.storage
        .from("barbershop-logos")
        .getPublicUrl(path);
      finalLogoUrl = data.publicUrl;
    }
  }

  await supabase
    .from("barbershops")
    .update({
      name,
      custom_message: customMessage,
      whatsapp_number: whatsappNumber,
      logo_url: finalLogoUrl,
    })
    .eq("id", barbershopId);

  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard/agenda");
}
