import { Settings } from "lucide-react";
import { PublicLinkCard } from "@/components/booking/public-link-card";
import { updateSettingsAction } from "@/lib/dashboard/actions";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: barbershop } = await supabase
    .from("barbershops")
    .select(
      "name, slug, custom_message, whatsapp_number, logo_url, plan, plan_expires_at",
    )
    .maybeSingle();

  const publicUrl = barbershop
    ? `http://localhost:3000/b/${barbershop.slug}`
    : "http://localhost:3000/b/sua-barbearia";

  return (
    <section className="space-y-6">
      <header className="rounded-[8px] border border-border bg-surface/80 p-6">
        <p className="font-mono-data text-xs uppercase text-accent">
          Configuracoes
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold">
          Deixe sua pagina com a cara da barbearia.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Ajuste nome, mensagem para clientes, WhatsApp e compartilhe seu QR
          Code de agendamento.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <form
          action={updateSettingsAction}
          className="rounded-[8px] border border-border bg-surface/80 p-5"
          encType="multipart/form-data"
        >
          <Settings className="text-accent" size={28} />
          <h2 className="mt-5 font-display text-2xl font-bold">
            Dados da barbearia
          </h2>

          <div className="mt-5 grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-bold">Nome</span>
              <input
                className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-4 text-foreground"
                defaultValue={barbershop?.name ?? ""}
                name="name"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Mensagem da pagina publica</span>
              <textarea
                className="tron-focus min-h-32 w-full resize-none rounded-[6px] border border-border bg-background/60 px-4 py-3 text-foreground"
                defaultValue={barbershop?.custom_message ?? ""}
                name="customMessage"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">WhatsApp da barbearia</span>
              <input
                className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-4 text-foreground"
                defaultValue={barbershop?.whatsapp_number ?? ""}
                name="whatsappNumber"
                placeholder="(00) 00000-0000"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Logo da barbearia</span>
              <input
                accept="image/png,image/jpeg,image/webp"
                className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-4 py-3 text-foreground file:mr-4 file:rounded-[6px] file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-bold file:text-[#08090a]"
                name="logoFile"
                type="file"
              />
              <span className="block text-xs leading-5 text-muted">
                Envie um PNG, JPG ou WebP. Essa logo aparece no QR Code visual
                e na imagem para status.
              </span>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold">Ou use uma URL da logo</span>
              <input
                className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-4 text-foreground placeholder:text-muted"
                defaultValue={barbershop?.logo_url ?? ""}
                name="logoUrl"
                placeholder="https://.../logo.png"
                type="url"
              />
              <span className="block text-xs leading-5 text-muted">
                Se voce enviar um arquivo acima, ele substitui esta URL.
              </span>
            </label>
            <div className="rounded-[6px] border border-border bg-background/50 p-4">
              <p className="text-sm text-muted">Assinatura</p>
              <p className="mt-2 font-display text-2xl font-bold">
                Plano Pro
              </p>
            </div>
            <button
              className="tron-focus tron-accent-cta min-h-12 rounded-[6px] px-5 font-extrabold"
              type="submit"
            >
              Salvar configuracoes
            </button>
          </div>
        </form>

        <PublicLinkCard publicUrl={publicUrl} />
      </div>
    </section>
  );
}
