import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, type Wallet as WalletType, type Transaction } from "@/lib/api";

export const Route = createFileRoute("/dashboard/wallet")({
  head: () => ({ meta: [{ title: "Wallet — LockPay" }] }),
  component: Wallet,
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay) {
    return `Today, ${d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diff < oneDay * 2) {
    return "Yesterday";
  } else {
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  }
}

function Wallet() {
  const { data: wallet, isLoading: isWalletLoading } = useQuery<WalletType | undefined>({
    queryKey: ["wallet"],
    queryFn: api.getCurrentWallet,
  });

  const { data: transactions, isLoading: isTxnsLoading } = useQuery<Transaction[] | undefined>({
    queryKey: ["transactions"],
    queryFn: api.getCurrentWalletTransactions,
  });

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
      <p className="text-slate-400 mb-8">Settled payouts and platform-fee history. Money never sits here mid-deal — that's what virtual accounts are for.</p>

      {isWalletLoading ? (
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-surface border border-border-glow rounded-2xl animate-pulse">
              <div className="h-3 bg-slate-700 rounded w-24 mb-3"></div>
              <div className="h-8 bg-slate-700 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <Stat label="Available balance" value={formatCurrency(wallet?.balance || 0)} />
          <Stat label="Withdrawn (30d)" value="₦0.00" />
          <Stat label="Platform fees (30d)" value="₦0.00" />
        </div>
      )}

      <div className="bg-surface border border-border-glow rounded-2xl">
        <p className="px-6 py-4 border-b border-border-glow text-xs font-bold uppercase tracking-widest text-slate-400">Transaction History</p>
        {isTxnsLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-48 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-64"></div>
              </div>
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="divide-y divide-border-glow">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-bold text-white">{tx.type || "Transaction"}</p>
                  <p className="text-xs text-slate-500">{tx.description || ""} · {formatDate(tx.created_at)}</p>
                </div>
                <p className={`font-mono-tight font-bold ${tx.amount >= 0 ? "text-brand-primary" : "text-slate-400"}`}>
                  {tx.amount >= 0 ? "+" : ""}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400">
            No transactions yet.
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 bg-surface border border-border-glow rounded-2xl">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{label}</p>
      <p className="text-3xl font-bold text-white mt-3 font-mono-tight">{value}</p>
    </div>
  );
}
