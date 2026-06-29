import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/deals")({
  head: () => ({ meta: [{ title: "Deals — LockPay" }] }),
  component: Deals,
});

const ALL = [
  { ref: "LP-9981-L", type: "Land", desc: "Epe 1-acre Settlement", party: "Adekunle C.", amt: "₦5,000,000", status: "Awaiting Funding" },
  { ref: "LP-9982-H", type: "Rentals", desc: "Ikorodu 2BR Apartment", party: "Prime Assets Ltd", amt: "₦450,000", status: "Locked" },
  { ref: "LP-9983-C", type: "Crypto", desc: "USDT OTC Swap", party: "@crypto_king", amt: "₦1,200,000", status: "Delivered" },
  { ref: "LP-9984-F", type: "Freelance", desc: "Web App · Sprint 3", party: "ada.codes", amt: "₦620,000", status: "Released" },
  { ref: "LP-9985-M", type: "Marketplace", desc: "MacBook Pro M3", party: "@oluwatobi_stores", amt: "₦1,450,000", status: "Disputed" },
  { ref: "LP-9986-L", type: "Land", desc: "Lekki Phase 2 Plot", party: "Helix Surveyors", amt: "₦18,000,000", status: "Locked" },
  { ref: "LP-9987-F", type: "Freelance", desc: "Brand identity refresh", party: "yemi.design", amt: "₦340,000", status: "Released" },
];

const STATUSES = ["All", "Awaiting Funding", "Locked", "Delivered", "Released", "Disputed"] as const;

const tintFor = (s: string) => {
  if (s === "Awaiting Funding") return "bg-warn/15 text-warn";
  if (s === "Locked") return "bg-brand-primary/15 text-brand-primary";
  if (s === "Delivered") return "bg-info/15 text-info";
  if (s === "Released") return "bg-emerald-500/15 text-emerald-400";
  if (s === "Disputed") return "bg-danger/15 text-danger";
  return "bg-slate-700/40 text-slate-400";
};

function Deals() {
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("All");
  const rows = filter === "All" ? ALL : ALL.filter((r) => r.status === filter);
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-white mb-2">All deals</h1>
      <p className="text-slate-400 mb-8">Filter, search and dive into every escrow you've ever opened.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors ${filter === s ? "bg-brand-primary text-brand-bg border-brand-primary" : "border-border-glow text-slate-400 hover:text-white"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border-glow rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500 uppercase tracking-wider bg-brand-bg/40">
            <tr>
              <th className="px-6 py-3 font-semibold">Ref / Vertical</th>
              <th className="px-6 py-3 font-semibold">Description</th>
              <th className="px-6 py-3 font-semibold">Counterparty</th>
              <th className="px-6 py-3 font-semibold">Amount</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border-glow">
            {rows.map((r) => (
              <tr key={r.ref} className="hover:bg-brand-bg/40">
                <td className="px-6 py-4">
                  <div className="font-mono-tight text-white">{r.ref}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">{r.type}</div>
                </td>
                <td className="px-6 py-4 text-slate-300">{r.desc}</td>
                <td className="px-6 py-4 text-slate-400">{r.party}</td>
                <td className="px-6 py-4 font-mono-tight">{r.amt}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded font-bold uppercase text-[10px] ${tintFor(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link to="/dashboard/deals/$id" params={{ id: r.ref }} className="text-xs font-bold text-brand-primary">
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
