import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type Deal } from "@/lib/api";

export const Route = createFileRoute("/dashboard/deals")({
  head: () => ({ meta: [{ title: "Deals — LockPay" }] }),
  component: Deals,
});

const STATUSES = ["All", "Awaiting Funding", "Locked", "Delivered", "Released", "Disputed"] as const;

const tintFor = (s: string) => {
  if (s === "Awaiting Funding") return "bg-warn/15 text-warn";
  if (s === "Locked") return "bg-brand-primary/15 text-brand-primary";
  if (s === "Delivered") return "bg-info/15 text-info";
  if (s === "Released") return "bg-emerald-500/15 text-emerald-400";
  if (s === "Disputed") return "bg-danger/15 text-danger";
  return "bg-slate-700/40 text-slate-400";
};

const mapStatusToDisplay = (status: string) => {
  switch (status) {
    case "created": return "Awaiting Funding";
    case "funded": return "Locked";
    case "condition_pending": return "Delivered";
    case "released": return "Released";
    case "disputed": return "Disputed";
    case "refunded": return "Refunded";
    case "expired": return "Expired";
    default: return status;
  }
};

function Deals() {
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("All");
  
  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["deals"],
    queryFn: api.getDeals,
  });

  const rows = deals.filter((deal: any) => {
    if (filter === "All") return true;
    return mapStatusToDisplay(deal.status) === filter;
  });

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
        {isLoading ? (
          <div className="p-10 text-center text-slate-400">Loading deals...</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No deals yet. Create your first one!</div>
        ) : (
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
              {rows.map((deal: any) => (
                <tr key={deal.id} className="hover:bg-brand-bg/40">
                  <td className="px-6 py-4">
                    <div className="font-mono-tight text-white">{deal.id}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">{deal.vertical}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{deal.title}</td>
                  <td className="px-6 py-4 text-slate-400">Counterparty</td>
                  <td className="px-6 py-4 font-mono-tight">₦{deal.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded font-bold uppercase text-[10px] ${tintFor(mapStatusToDisplay(deal.status))}`}>{mapStatusToDisplay(deal.status)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to="/dashboard/deals/$id" params={{ id: deal.id }} className="text-xs font-bold text-brand-primary">
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
