import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, ShieldAlert, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard/deals/$id")({
  head: ({ params }) => ({ meta: [{ title: `Deal ${params.id} — LockPay` }] }),
  component: DealDetail,
});

function DealDetail() {
  const { id } = Route.useParams();
  return (
    <div className="p-10 max-w-5xl">
      <Link to="/dashboard/deals" className="text-xs text-slate-500 hover:text-brand-primary uppercase tracking-widest font-bold">
        ← All deals
      </Link>
      <div className="mt-6 flex items-start justify-between">
        <div>
          <p className="font-mono-tight text-slate-500 text-sm">{id}</p>
          <h1 className="text-3xl font-bold text-white mt-1">Landed Property Purchase</h1>
          <p className="text-slate-400 mt-1">Land · Epe 1-Acre Settlement · Buyer view</p>
        </div>
        <span className="px-3 py-1 rounded-md bg-brand-primary/15 text-brand-primary font-bold uppercase text-xs">
          Locked
        </span>
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Funding details">
            <div className="p-5 bg-brand-bg border border-border-glow rounded-xl">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Nomba Virtual Account</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-mono-tight font-bold text-white">9920 3844 11</p>
                <button className="p-2 rounded-lg bg-surface border border-border-glow text-slate-400 hover:text-brand-primary">
                  <Copy className="size-4" />
                </button>
              </div>
              <div className="mt-4 flex justify-between text-[11px] font-mono-tight text-slate-500 uppercase">
                <span>Bank: Nomba / Titan</span>
                <span className="flex items-center gap-1"><Clock className="size-3" /> Expires 23:14:02</span>
              </div>
            </div>
          </Section>

          <Section title="Release gates">
            <ol className="space-y-3">
              {[
                { t: "Title-deed verification", on: true },
                { t: "Independent surveyor sign-off", on: true },
                { t: "Lawyer-confirmed deed transfer", on: false },
              ].map((g, i) => (
                <li key={g.t} className="flex items-center gap-3 p-3 rounded-xl bg-brand-bg border border-border-glow">
                  <span className={`size-7 rounded-full grid place-items-center text-xs font-bold ${g.on ? "bg-brand-primary text-brand-bg" : "bg-surface border border-border-glow text-slate-400"}`}>
                    {g.on ? <CheckCircle2 className="size-4" /> : i + 1}
                  </span>
                  <span className={`text-sm ${g.on ? "text-white" : "text-slate-400"}`}>{g.t}</span>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Activity">
            <ul className="space-y-4 text-sm">
              {[
                { t: "Buyer funded virtual account · ₦4,500,000", at: "2h ago", tint: "text-brand-primary" },
                { t: "Surveyor uploaded sign-off PDF", at: "Yesterday", tint: "text-info" },
                { t: "Deal opened by Akin Ola-Lekan", at: "3d ago", tint: "text-slate-400" },
              ].map((a) => (
                <li key={a.t} className="flex items-start gap-3">
                  <span className={`size-2 rounded-full mt-1.5 ${a.tint.replace("text", "bg")}`} />
                  <div className="flex-1">
                    <p className="text-white">{a.t}</p>
                    <p className="text-xs text-slate-500">{a.at}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <aside className="space-y-4">
          <div className="p-5 bg-surface border border-border-glow rounded-2xl">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Parties</p>
            <Party role="Buyer (you)" name="Chika Okafor" amount="₦4,500,000" />
            <div className="my-3 border-t border-border-glow" />
            <Party role="Seller" name="Akin Ola-Lekan" amount="receives ₦4,365,000" />
          </div>
          <div className="p-5 bg-surface border border-border-glow rounded-2xl">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Split on release</p>
            <SplitRow name="Seller" pct="97%" amount="₦4,365,000" />
            <SplitRow name="LockPay fee" pct="3%" amount="₦135,000" />
          </div>
          <button className="w-full py-3 bg-brand-primary text-brand-bg font-bold rounded-xl">
            Confirm delivery & release
          </button>
          <button className="w-full py-3 border border-border-glow text-slate-300 font-bold rounded-xl hover:bg-surface inline-flex items-center justify-center gap-2">
            <ShieldAlert className="size-4" /> Raise dispute
          </button>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 bg-surface border border-border-glow rounded-2xl">
      <h3 className="font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Party({ role, name, amount }: { role: string; name: string; amount: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">{role}</p>
        <p className="font-bold text-white">{name}</p>
      </div>
      <p className="text-sm text-slate-300 font-mono-tight">{amount}</p>
    </div>
  );
}

function SplitRow({ name, pct, amount }: { name: string; pct: string; amount: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-slate-400">{name}</span>
      <span className="text-slate-300">{pct}</span>
      <span className="font-mono-tight text-white">{amount}</span>
    </div>
  );
}
