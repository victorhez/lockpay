import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldCheck, LockKeyhole, Activity, Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Overview — LockPay" }] }),
  component: Overview,
});

const stats = [
  { label: "Locked in escrow", value: "₦12,450,000", delta: "+₦2.1M this week", icon: LockKeyhole, tint: "text-brand-primary" },
  { label: "Released (30d)", value: "₦38,900,000", delta: "+18%", icon: ShieldCheck, tint: "text-emerald-400" },
  { label: "Active deals", value: "23", delta: "4 awaiting funding", icon: Activity, tint: "text-info" },
];

const recent = [
  { ref: "LP-9981-L", type: "Land Settlement · Epe 1-acre", party: "Adekunle C.", amt: "₦5,000,000", status: "Awaiting Funding", tint: "bg-warn/15 text-warn" },
  { ref: "LP-9982-H", type: "House Deposit · Ikorodu 2BR", party: "Prime Assets Ltd", amt: "₦450,000", status: "Locked", tint: "bg-brand-primary/15 text-brand-primary" },
  { ref: "LP-9983-C", type: "USDT OTC Swap", party: "@crypto_king", amt: "₦1,200,000", status: "Delivered", tint: "bg-info/15 text-info" },
  { ref: "LP-9984-F", type: "Web App · Sprint 3", party: "ada.codes", amt: "₦620,000", status: "Released", tint: "bg-emerald-500/15 text-emerald-400" },
  { ref: "LP-9985-M", type: "MacBook Pro M3", party: "@oluwatobi_stores", amt: "₦1,450,000", status: "Disputed", tint: "bg-danger/15 text-danger" },
];

function Overview() {
  return (
    <div className="p-10">
      <header className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-2">Dashboard</p>
          <h1 className="text-3xl font-bold text-white">Good evening, Chika.</h1>
          <p className="text-slate-400 mt-1">Here's what your vault looks like right now.</p>
        </div>
        <Link to="/dashboard/new" className="inline-flex items-center gap-2 px-5 py-3 bg-brand-primary text-brand-bg font-bold rounded-xl">
          <Plus className="size-4" /> New escrow
        </Link>
      </header>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="p-6 bg-surface border border-border-glow rounded-2xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{s.label}</p>
              <s.icon className={`size-4 ${s.tint}`} />
            </div>
            <p className="text-3xl font-bold text-white mt-3 font-mono-tight">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border-glow rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-glow">
          <h2 className="font-bold text-white">Recent deals</h2>
          <Link to="/dashboard/deals" className="text-xs font-bold text-brand-primary uppercase tracking-widest inline-flex items-center gap-1">
            View all <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500 uppercase tracking-wider bg-brand-bg/40">
            <tr>
              <th className="px-6 py-3 font-semibold">Ref</th>
              <th className="px-6 py-3 font-semibold">Counterparty</th>
              <th className="px-6 py-3 font-semibold">Amount</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border-glow">
            {recent.map((r) => (
              <tr key={r.ref} className="hover:bg-brand-bg/40">
                <td className="px-6 py-4">
                  <div className="font-mono-tight text-white">{r.ref}</div>
                  <div className="text-[10px] text-slate-500">{r.type}</div>
                </td>
                <td className="px-6 py-4 text-slate-300">{r.party}</td>
                <td className="px-6 py-4 font-mono-tight">{r.amt}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded font-bold uppercase text-[10px] ${r.tint}`}>{r.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to="/dashboard/deals/$id"
                    params={{ id: r.ref }}
                    className="text-xs font-bold text-brand-primary"
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
