import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/wallet")({
  head: () => ({ meta: [{ title: "Wallet — LockPay" }] }),
  component: Wallet,
});

const txns = [
  { t: "Payout · Web App Sprint 3", d: "Released to ada.codes", amt: "+₦601,400", when: "Today, 14:02" },
  { t: "Platform fee · LP-9984-F", d: "3% fee on released deal", amt: "−₦18,600", when: "Today, 14:02" },
  { t: "Payout · Brand identity refresh", d: "Released to yemi.design", amt: "+₦329,800", when: "Yesterday" },
];

function Wallet() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
      <p className="text-slate-400 mb-8">Settled payouts and platform-fee history. Money never sits here mid-deal — that's what virtual accounts are for.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <Stat label="Available balance" value="₦2,148,200" />
        <Stat label="Withdrawn (30d)" value="₦11,420,000" />
        <Stat label="Platform fees (30d)" value="₦419,600" />
      </div>

      <div className="bg-surface border border-border-glow rounded-2xl divide-y divide-border-glow">
        {txns.map((t) => (
          <div key={t.t + t.when} className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-white">{t.t}</p>
              <p className="text-xs text-slate-500">{t.d} · {t.when}</p>
            </div>
            <p className={`font-mono-tight font-bold ${t.amt.startsWith("+") ? "text-brand-primary" : "text-slate-400"}`}>{t.amt}</p>
          </div>
        ))}
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
