import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/dashboard/disputes")({
  head: () => ({ meta: [{ title: "Disputes — LockPay" }] }),
  component: Disputes,
});

const disputes = [
  { ref: "LP-9985-M", subject: "Item not as described — MacBook Pro M3", opened: "2h ago", state: "Awaiting evidence" },
  { ref: "LP-9971-L", subject: "Title-deed verification failed — Lekki plot", opened: "Yesterday", state: "Panel review" },
];

function Disputes() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-white mb-2">Disputes</h1>
      <p className="text-slate-400 mb-8">Funds stay locked while our arbitration panel reviews — 48h SLA.</p>

      <div className="space-y-3">
        {disputes.map((d) => (
          <div key={d.ref} className="p-6 bg-surface border border-border-glow rounded-2xl flex items-center gap-4">
            <div className="size-10 rounded-xl bg-danger/15 text-danger grid place-items-center">
              <ShieldAlert className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{d.subject}</p>
              <p className="text-xs text-slate-500 font-mono-tight">{d.ref} · opened {d.opened}</p>
            </div>
            <span className="px-3 py-1 rounded-md bg-warn/15 text-warn font-bold uppercase text-xs">{d.state}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
