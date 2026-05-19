import { MessageCircle, Search, Users } from "lucide-react";
import { enqueueMessageAction } from "@/lib/dashboard/actions";
import { createClient } from "@/lib/supabase/server";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("id")
    .maybeSingle();

  const { data: clients } = barbershop
    ? await supabase
        .from("clients")
        .select("id, name, whatsapp, first_seen_at, last_seen_at")
        .eq("barbershop_id", barbershop.id)
        .order("last_seen_at", { ascending: false })
    : { data: [] };

  return (
    <section className="space-y-6">
      <header className="rounded-[8px] border border-border bg-surface/80 p-6">
        <p className="font-mono-data text-xs uppercase text-accent">Clientes</p>
        <h1 className="mt-3 font-display text-4xl font-bold">
          Sua base ficando mais forte.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Acompanhe quem ja marcou horario e prepare campanhas simples para
          trazer o cliente de volta.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[8px] border border-border bg-surface/80">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4 text-muted">
            <Search size={18} />
            <span className="text-sm">Busca visual por nome ou WhatsApp</span>
          </div>

          <div className="divide-y divide-border">
            {clients && clients.length > 0 ? (
              clients.map((client) => (
                <article
                  className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_180px_180px]"
                  key={client.id}
                >
                  <div>
                    <p className="font-bold">{client.name}</p>
                    <p className="mt-1 font-mono-data text-sm text-muted">
                      {client.whatsapp}
                    </p>
                  </div>
                  <SmallDate label="Primeiro contato" value={client.first_seen_at} />
                  <SmallDate label="Ultima visita" value={client.last_seen_at} />
                </article>
              ))
            ) : (
              <div className="grid min-h-64 place-items-center p-8 text-center">
                <Users className="mb-4 text-accent" size={34} />
                <h2 className="font-display text-2xl font-bold">
                  Nenhum cliente cadastrado ainda.
                </h2>
                <p className="mt-3 max-w-md text-muted">
                  Assim que alguem agendar pelo link, a lista aparece aqui.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-[8px] border border-border bg-surface/80 p-5">
          <MessageCircle className="text-accent" size={28} />
          <h2 className="mt-5 font-display text-2xl font-bold">
            Mensagem para todos
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Ideal para avisar promocao, horario livre ou campanha da semana.
          </p>
          <form action={enqueueMessageAction} className="mt-5 space-y-3">
            <textarea
              className="tron-focus min-h-32 w-full resize-none rounded-[6px] border border-border bg-background/60 px-4 py-3 text-foreground placeholder:text-muted"
              name="message"
              placeholder="Ex: Sexta tem horario especial para corte + barba."
              required
            />
            <button
              className="tron-focus tron-accent-cta min-h-12 w-full rounded-[6px] px-5 font-extrabold"
              type="submit"
            >
              Preparar envio
            </button>
          </form>
          <p className="mt-4 text-xs leading-5 text-muted">
            Integracao com WhatsApp em breve. Por enquanto, as mensagens ficam
            organizadas para envio.
          </p>
        </aside>
      </div>
    </section>
  );
}

function SmallDate({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-mono-data text-sm text-foreground">
        {formatDate(value)}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}
