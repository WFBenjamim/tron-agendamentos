import { Banknote, Plus, TrendingUp, WalletCards } from "lucide-react";
import { createTransactionAction } from "@/lib/dashboard/actions";
import { createClient } from "@/lib/supabase/server";

const categories = [
  "Corte",
  "Barba",
  "Combo",
  "Produto vendido",
  "Aluguel",
  "Material",
  "Outros",
];

export default async function FinancePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: barbershop } = await supabase
    .from("barbershops")
    .select("id")
    .maybeSingle();

  const { data: transactions } = barbershop
    ? await supabase
        .from("transactions")
        .select("id, amount, type, description, category, transaction_date")
        .eq("barbershop_id", barbershop.id)
        .order("transaction_date", { ascending: false })
        .limit(12)
    : { data: [] };

  const income =
    transactions
      ?.filter((item) => item.type === "income")
      .reduce((total, item) => total + Number(item.amount), 0) ?? 0;
  const expenses =
    transactions
      ?.filter((item) => item.type === "expense")
      .reduce((total, item) => total + Number(item.amount), 0) ?? 0;
  const balance = income - expenses;

  return (
    <section className="space-y-6">
      <header className="rounded-[8px] border border-border bg-surface/80 p-6">
        <p className="font-mono-data text-xs uppercase text-accent">
          Financeiro
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold">
          Caixa claro, decisao rapida.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Registre entradas e saidas para enxergar o resultado da barbearia sem
          planilha complicada.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={<TrendingUp />} label="Entradas" value={formatMoney(income)} />
        <Metric icon={<WalletCards />} label="Saidas" value={formatMoney(expenses)} />
        <Metric icon={<Banknote />} label="Saldo" value={formatMoney(balance)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[8px] border border-border bg-surface/80">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-2xl font-bold">
              Ultimos lancamentos
            </h2>
          </div>
          <div className="divide-y divide-border">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <article
                  className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_140px_120px]"
                  key={transaction.id}
                >
                  <div>
                    <p className="font-bold">{transaction.category}</p>
                    <p className="mt-1 text-sm text-muted">
                      {transaction.description || "Sem descricao"}
                    </p>
                  </div>
                  <p className="font-mono-data text-sm text-muted">
                    {formatDate(transaction.transaction_date)}
                  </p>
                  <p
                    className={`font-mono-data text-sm font-bold ${
                      transaction.type === "income"
                        ? "text-success"
                        : "text-[#ffb4b4]"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatMoney(Number(transaction.amount))}
                  </p>
                </article>
              ))
            ) : (
              <div className="p-8 text-center text-muted">
                Nenhum lancamento registrado ainda.
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-[8px] border border-border bg-surface/80 p-5">
          <Plus className="text-accent" size={28} />
          <h2 className="mt-5 font-display text-2xl font-bold">
            Novo lancamento
          </h2>
          <form action={createTransactionAction} className="mt-5 space-y-3">
            <input
              className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-4 text-foreground"
              min="0"
              name="amount"
              placeholder="Valor"
              required
              step="0.01"
              type="number"
            />
            <select
              className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-4 text-foreground"
              name="type"
            >
              <option value="income">Entrada</option>
              <option value="expense">Saida</option>
            </select>
            <select
              className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-4 text-foreground"
              name="category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-4 text-foreground"
              defaultValue={today}
              name="transactionDate"
              required
              type="date"
            />
            <input
              className="tron-focus min-h-12 w-full rounded-[6px] border border-border bg-background/60 px-4 text-foreground placeholder:text-muted"
              name="description"
              placeholder="Descricao"
            />
            <button
              className="tron-focus tron-accent-cta min-h-12 w-full rounded-[6px] px-5 font-extrabold"
              type="submit"
            >
              Salvar lancamento
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[8px] border border-border bg-surface/80 p-5">
      <div className="mb-5 text-accent">{icon}</div>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-mono-data text-2xl font-bold">{value}</p>
    </article>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(`${value}T12:00:00`));
}
