import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — LockPay" },
      { name: "description", content: "Pay-per-deal escrow pricing. No subscriptions. Volume discounts for businesses." },
    ],
  }),
  component: Pricing,
});

const tiers = [
  {
    name: "Personal",
    fee: "2.5%",
    cap: "Capped at ₦5,000 per deal",
    bullets: ["Unlimited deals", "All 5 verticals", "Standard dispute panel", "48hr arbitration SLA"],
  },
  {
    name: "Business",
    fee: "1.5%",
    cap: "Capped at ₦15,000 per deal",
    featured: true,
    bullets: ["Everything in Personal", "Auto-split to team wallets", "Bulk virtual-account API", "Priority dispute SLA (12hr)"],
  },
  {
    name: "OTC Desk",
    fee: "0.4%",
    cap: "Per side · capped ₦8,000",
    bullets: ["Sub-2 minute settlement", "TxHash trigger webhook", "Higher per-deal ceilings", "Dedicated account manager"],
  },
];

function Pricing() {
  return (
    <div className="min-h-screen bg-brand-bg text-slate-200">
      <SiteHeader />
      <section className="px-8 py-24 max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-4">Pay only when a deal settles.</h1>
        <p className="text-slate-400 max-w-xl mb-16">
          No monthly fees. No setup. You only pay when LockPay successfully releases your money.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`p-8 rounded-2xl border ${t.featured ? "bg-gradient-to-b from-brand-primary/15 to-surface border-brand-primary/40 glow-primary" : "bg-surface border-border-glow"}`}
            >
              {t.featured && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Most popular</span>
              )}
              <h3 className="text-xl font-bold text-white mt-2">{t.name}</h3>
              <div className="my-6">
                <span className="text-5xl font-bold text-white">{t.fee}</span>
                <span className="text-slate-400"> / deal</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">{t.cap}</p>
              <ul className="space-y-3 mb-8">
                {t.bullets.map((b) => (
                  <li key={b} className="text-sm text-slate-300 flex gap-2">
                    <Check className="size-4 text-brand-primary shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
              <Link
                to="/sign-up"
                className={`block text-center py-3 rounded-xl font-bold ${t.featured ? "bg-brand-primary text-brand-bg" : "border border-border-glow text-white hover:bg-surface"}`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
