import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Home, Map, ShoppingBag, Code2, Bitcoin, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Solutions — LockPay" },
      { name: "description", content: "Escrow flows tailored for rentals, land, marketplace goods, freelance gigs and OTC crypto." },
    ],
  }),
  component: SolutionsPage,
});

const items = [
  { slug: "rentals", title: "House Rentals", icon: Home, copy: "Stop paying agents upfront. Money releases only after the keys turn." },
  { slug: "land", title: "Land & Property", icon: Map, copy: "Multi-step release tied to surveyor, lawyer and registry milestones." },
  { slug: "marketplace", title: "Marketplace Goods", icon: ShoppingBag, copy: "For every Jiji, Instagram and WhatsApp seller you don't fully trust." },
  { slug: "freelance", title: "Freelance Gigs", icon: Code2, copy: "Milestone escrow for devs, designers, writers and creators." },
  { slug: "crypto", title: "Crypto / Forex OTC", icon: Bitcoin, copy: "Fiat-leg lock for P2P USDT, USDC and FX trades." },
];

function SolutionsPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <SiteHeader />
      <section className="px-8 py-24 max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-4">Built for the trades Nigeria can't currently trust.</h1>
        <p className="text-slate-400 max-w-2xl mb-16">
          Each vertical ships with its own release gates, evidence rules and dispute panel — not a
          generic checkout pretending to be escrow.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((v) => (
            <Link
              key={v.slug}
              to="/solutions/$vertical"
              params={{ vertical: v.slug }}
              className="p-8 bg-surface border border-border-glow rounded-2xl hover:border-brand-primary/50 transition-colors group"
            >
              <v.icon className="size-8 text-brand-primary mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">{v.title}</h3>
              <p className="text-sm text-slate-400 mb-6">{v.copy}</p>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore <ArrowRight className="size-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
