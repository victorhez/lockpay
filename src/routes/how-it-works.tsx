import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Wallet, LockKeyhole, ShieldCheck, Split } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How LockPay escrow works" },
      { name: "description", content: "Four steps from handshake to released funds, powered by Nomba virtual accounts and HMAC-verified webhooks." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  {
    icon: Wallet,
    title: "1. Create the deal",
    body: "Buyer and seller agree on amount, deadline and release conditions inside LockPay. Roles, evidence requirements and split percentages are locked in upfront.",
  },
  {
    icon: LockKeyhole,
    title: "2. Buyer funds the vault",
    body: "LockPay spins up a fresh Nomba virtual account, scoped to that deal's accountRef and expectedAmount. The account auto-expires if nobody pays in time.",
  },
  {
    icon: ShieldCheck,
    title: "3. Seller delivers, webhook verifies",
    body: "Seller marks delivered with evidence. Nomba fires a webhook → LockPay verifies the HMAC signature → deal moves to LOCKED. No spoofed releases possible.",
  },
  {
    icon: Split,
    title: "4. Auto-split release",
    body: "Buyer confirms → LockPay calls Nomba's checkout split. 97% lands with the seller, 3% with the platform — in seconds, with no manual transfers.",
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen bg-brand-bg text-slate-200">
      <SiteHeader />
      <section className="px-8 py-24 max-w-5xl mx-auto">
        <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-3">How it works</p>
        <h1 className="text-5xl font-bold text-white mb-6">From handshake to released funds, in four moves.</h1>
        <p className="text-slate-400 max-w-2xl mb-16">
          LockPay is a thin trust layer on top of Nomba's regulated rails. We never hold fiat
          ourselves — we orchestrate when it moves.
        </p>

        <ol className="space-y-6">
          {steps.map((s) => (
            <li key={s.title} className="p-8 bg-surface border border-border-glow rounded-2xl flex gap-6">
              <div className="size-12 bg-brand-primary/10 rounded-xl grid place-items-center shrink-0">
                <s.icon className="size-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xl mb-2">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 p-8 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border border-border-glow rounded-2xl">
          <h3 className="font-bold text-white mb-3">If things go wrong</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Funds stay locked. Either side can file a dispute with photo, video or chat evidence.
            LockPay's arbitration panel reviews within 48 hours and force-releases or refunds — no
            outsider can pull money from the virtual account in the meantime.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
