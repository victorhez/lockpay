import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Map, ShoppingBag, Code2, Bitcoin } from "lucide-react";

export const Route = createFileRoute("/dashboard/new")({
  head: () => ({ meta: [{ title: "New escrow — LockPay" }] }),
  component: NewDeal,
});

const VERTS = [
  { slug: "rentals", title: "House Rentals", icon: Home },
  { slug: "land", title: "Land & Property", icon: Map },
  { slug: "marketplace", title: "Marketplace", icon: ShoppingBag },
  { slug: "freelance", title: "Freelance Gig", icon: Code2 },
  { slug: "crypto", title: "Crypto OTC", icon: Bitcoin },
];

function NewDeal() {
  const [vertical, setVertical] = useState("land");
  return (
    <div className="p-10 max-w-4xl">
      <Link to="/dashboard" className="text-xs text-slate-500 hover:text-brand-primary uppercase tracking-widest font-bold">
        ← Back
      </Link>
      <h1 className="text-3xl font-bold text-white mt-6">Create a new escrow</h1>
      <p className="text-slate-400 mt-1 mb-10">
        We'll spin up a fresh Nomba virtual account once both sides sign off.
      </p>

      <div className="space-y-8">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            1. What kind of deal?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {VERTS.map((v) => (
              <button
                key={v.slug}
                onClick={() => setVertical(v.slug)}
                className={`p-4 rounded-xl border text-left transition-colors ${vertical === v.slug ? "border-brand-primary bg-brand-primary/10" : "border-border-glow bg-surface hover:border-slate-500"}`}
              >
                <v.icon className={`size-5 mb-3 ${vertical === v.slug ? "text-brand-primary" : "text-slate-400"}`} />
                <p className="text-sm font-bold text-white">{v.title}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            2. Deal details
          </p>
          <div className="grid md:grid-cols-2 gap-4 p-6 bg-surface border border-border-glow rounded-2xl">
            <Field label="Deal title" placeholder="e.g. Epe 1-acre land settlement" />
            <Field label="Amount (₦)" placeholder="4,500,000" />
            <Field label="Counterparty email" placeholder="seller@example.com" />
            <Field label="Deadline" type="date" />
            <div className="md:col-span-2">
              <Field label="Notes for counterparty" placeholder="What's being delivered, where, when" />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            3. Release gates
          </p>
          <div className="p-6 bg-surface border border-border-glow rounded-2xl space-y-3">
            {[
              "Counterparty KYC verified",
              "Evidence uploaded (photo / doc / TxHash)",
              "Buyer manual confirmation",
            ].map((g) => (
              <label key={g} className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" defaultChecked className="accent-brand-primary size-4" />
                {g}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/dashboard" className="px-5 py-3 border border-border-glow text-slate-300 font-bold rounded-xl">
            Cancel
          </Link>
          <button className="px-5 py-3 bg-brand-primary text-brand-bg font-bold rounded-xl">
            Create escrow
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</span>
      <input
        {...rest}
        className="w-full px-4 py-3 bg-brand-bg border border-border-glow rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary"
      />
    </label>
  );
}
