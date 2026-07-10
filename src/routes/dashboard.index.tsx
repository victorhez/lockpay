import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldCheck, LockKeyhole, Activity, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type Deal } from "@/lib/api";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Overview — LockPay" }] }),
  component: Overview,
});

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

const tintFor = (s: string) => {
  if (s === "Awaiting Funding") return "bg-warn/15 text-warn";
  if (s === "Locked") return "bg-brand-primary/15 text-brand-primary";
  if (s === "Delivered") return "bg-info/15 text-info";
  if (s === "Released") return "bg-emerald-500/15 text-emerald-400";
  if (s === "Disputed") return "bg-danger/15 text-danger";
  return "bg-slate-700/40 text-slate-400";
};

function Overview() {
  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["deals"],
    queryFn: api.getDeals,
  });

  const lockedInEscrow = deals
    .filter((d: any) => ["funded", "condition_pending", "disputed"].includes(d.status))
    .reduce((sum: number, d: any) => sum + d.amount, 0);

  const released30d = deals
    .filter((d: any) => d.status === "released")
    .reduce((sum: number, d: any) => sum + d.amount, 0);

  const activeDeals = deals.filter((d: any) => ["created", "funded", "condition_pending"].includes(d.status)).length;

  return (
    <div className="p-10">
      <header className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-2">Dashboard</p>
          <h1 className="text-3xl font-bold text-white">Good evening!</h1>
          <p className="text-slate-400 mt-1">Here's what your vault looks like right now.</p>
        </div>
        <Link to="/dashboard/new" className="inline-flex items-center gap-2 px-5 py-3 bg-brand-primary text-brand-bg font-bold rounded-xl">
          <Plus className="size-4" /> New escrow
        </Link>
      </header>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Locked in escrow", value: `₦${lockedInEscrow.toLocaleString()}`, delta: "+₦0 this week", icon: LockKeyhole, tint: "text-brand-primary" },
          { label: "Released (30d)", value: `₦${released30d.toLocaleString()}`, delta: "+0%", icon: ShieldCheck, tint: "text-emerald-400" },
          { label: "Active deals", value: `${activeDeals}`, delta: `${deals.filter((d: any) => d.status === "created").length} awaiting funding`, icon: Activity, tint: "text-info" },
        ].map((s) => (
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
        {isLoading ? (
          <div className="p-10 text-center text-slate-400">Loading deals...</div>
        ) : deals.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No deals yet. Create your first one!</div>
        ) : (
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
              {deals.slice(0, 5).map((deal: any) => (
                <tr key={deal.id} className="hover:bg-brand-bg/40">
                  <td className="px-6 py-4">
                    <div className="font-mono-tight text-white">{deal.id}</div>
                    <div className="text-[10px] text-slate-500">{deal.title}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">Counterparty</td>
                  <td className="px-6 py-4 font-mono-tight">₦{deal.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded font-bold uppercase text-[10px] ${tintFor(mapStatusToDisplay(deal.status))}`}>{mapStatusToDisplay(deal.status)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to="/dashboard/deals/$id"
                      params={{ id: deal.id }}
                      className="text-xs font-bold text-brand-primary"
                    >
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
