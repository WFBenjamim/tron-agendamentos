import { notFound } from "next/navigation";
import { PublicBookingFlow } from "@/components/booking/public-booking-flow";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 60;

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("id, name, custom_message")
    .eq("slug", slug)
    .maybeSingle();

  if (!barbershop) {
    notFound();
  }

  const { data: slots } = await supabase
    .from("available_slots")
    .select("id, slot_datetime, is_booked, is_blocked")
    .eq("barbershop_id", barbershop.id)
    .gte("slot_datetime", new Date().toISOString())
    .lte(
      "slot_datetime",
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    )
    .order("slot_datetime", { ascending: true });

  return (
    <main className="min-h-svh px-5 py-8">
      <section className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <p className="font-display text-xl font-bold uppercase tracking-normal">
            Tron Agendamento
          </p>
          <h1 className="mt-6 font-display text-4xl font-bold text-foreground">
            {barbershop.name}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted">
            {barbershop.custom_message ??
              "Escolha o melhor horario e confirme seu atendimento em poucos segundos."}
          </p>
        </header>

        <PublicBookingFlow slug={slug} slots={slots ?? []} />
      </section>
    </main>
  );
}
