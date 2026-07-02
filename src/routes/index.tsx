import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Home,
  Map,
  ShoppingBag,
  Code2,
  Bitcoin,
  ShieldCheck,
  Wallet,
  Split,
  LockKeyhole,
  ArrowRight,
  Check,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LockPay — Escrow without the trust issues" },
      { name: "description", content: "Hold money safely in Nomba virtual accounts until both sides confirm. For rentals, land, marketplace, freelance and OTC crypto in Nigeria." },
      { property: "og:title", content: "LockPay — Escrow without the trust issues" },
      { property: "og:description", content: "Nigeria's neutral holding layer for P2P trade. Powered by Nomba." },
    ],
  }),
  component: LandingPage,
});

const verticals = [
  {
    slug: "rentals",
    title: "House Rentals",
    tagline: "Never pay an agent until the keys are in your hand.",
    icon: Home,
    tint: "text-orange-400 bg-orange-500/10",
    bullets: ["Verified landlord & agent KYC", "Inspection-confirmed release", "Deposit + first-month split"],
  },
  {
    slug: "land",
    title: "Land & Property",
    tagline: "Multi-step release after surveyor and lawyer verification.",
    icon: Map,
    tint: "text-emerald-400 bg-emerald-500/10",
    bullets: ["Title-deed verification milestone", "Survey + lawyer sign-off gate", "Up to ₦100M deal ceiling"],
  },
  {
    slug: "marketplace",
    title: "Marketplace Goods",
    tagline: "Buying on Jiji or Instagram? We hold the money until you inspect.",
    icon: ShoppingBag,
    tint: "text-fuchsia-400 bg-fuchsia-500/10",
    bullets: ["Delivery-confirmed release", "Photo evidence uploads", "48hr inspection window"],
  },
  {
    slug: "freelance",
    title: "Freelance Gigs",
    tagline: "Milestone-based payouts for devs, designers, and creators.",
    icon: Code2,
    tint: "text-indigo-400 bg-indigo-500/10",
    bullets: ["Per-milestone release", "Auto-split team payouts", "Built-in dispute panel"],
  },
  {
    slug: "crypto",
    title: "Crypto / Forex OTC",
    tagline: "P2P USDT and FX trades with zero chargeback risk.",
    icon: Bitcoin,
    tint: "text-brand-primary bg-brand-primary/10",
    bullets: ["Atomic fiat-leg lock", "On-chain confirmation trigger", "Sub-2 minute funding"],
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-bg text-slate-200">
      <SiteHeader />

      {/* Hero */}
      <section className="px-8 pt-20 pb-32 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6">
              <span className="size-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">
                Powered by Nomba Infrastructure
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.05] mb-8">
              Trade without the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                Trust Issues.
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
              LockPay holds your money in a fresh virtual account for every deal. It releases —
              instantly and split — only when both sides confirm. Built for rentals, land, gigs,
              marketplace and OTC crypto.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/sign-up"
                className="px-8 py-4 bg-white text-brand-bg font-bold rounded-xl text-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all inline-flex items-center gap-2"
              >
                Create Escrow <ArrowRight className="size-5" />
              </Link>
              <Link
                to="/how-it-works"
                className="px-8 py-4 border border-border-glow text-white font-bold rounded-xl text-lg hover:bg-surface transition-colors"
              >
                See how it works
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand-primary" /> HMAC-verified webhooks</span>
              <span className="flex items-center gap-2"><LockKeyhole className="size-4 text-brand-primary" /> Funds locked till release</span>
            </div>
          </div>

          {/* Hero Process Steps */}
          <div className="relative">
            <div className="absolute -inset-20 bg-brand-secondary/10 blur-[100px] rounded-full" />
            <div className="relative bg-surface border border-border-glow rounded-3xl p-8 shadow-2xl space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">How LockPay Works</h3>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Create Deal", desc: "Set amount, conditions and invite counterparty.", icon: Wallet },
                  { step: "02", title: "Fund Vault", desc: "Send money to a dedicated Nomba virtual account.", icon: LockKeyhole },
                  { step: "03", title: "Confirm Delivery", desc: "Both parties verify terms are met.", icon: ShieldCheck },
                  { step: "04", title: "Get Paid", desc: "Instant split: 97% to seller, 3% platform fee.", icon: Split },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 p-4 rounded-xl border border-border-glow bg-brand-bg/30">
                    <div className="size-12 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                      <span className="font-mono-tight font-bold text-brand-primary">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verticals */}
      <section className="px-8 py-24 bg-surface/30 border-y border-border-glow">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">One platform. Every trade.</h2>
            <p className="text-slate-400">
              Tailored escrow flows for Nigeria's most fraud-prone niches. Each vertical has its own
              release gates, evidence types and dispute rules.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verticals.map((v) => (
              <Link
                key={v.slug}
                to="/solutions/$vertical"
                params={{ vertical: v.slug }}
                className="p-8 bg-surface border border-border-glow rounded-2xl hover:border-brand-primary/50 transition-colors group"
              >
                <div className={`size-12 rounded-xl flex items-center justify-center mb-6 ${v.tint}`}>
                  <v.icon className="size-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{v.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">{v.tagline}</p>
                <ul className="space-y-2">
                  {v.bullets.map((b) => (
                    <li key={b} className="text-xs text-slate-500 flex gap-2">
                      <Check className="size-3.5 text-brand-primary shrink-0 mt-0.5" /> {b}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-xs font-bold text-brand-primary uppercase tracking-widest inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="size-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 py-24 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl font-bold text-white max-w-2xl">Four steps from handshake to released funds.</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { n: "01", t: "Create the deal", d: "Buyer & seller agree amount, deadline and release conditions.", icon: Wallet },
            { n: "02", t: "Buyer funds the vault", d: "We spin up a fresh Nomba virtual account scoped to that deal.", icon: LockKeyhole },
            { n: "03", t: "Seller delivers", d: "Evidence uploaded. Buyer inspects. Webhook HMAC-verified.", icon: ShieldCheck },
            { n: "04", t: "Auto-split release", d: "97% to seller, 3% platform fee — instantly via Nomba split.", icon: Split },
          ].map((s) => (
            <div key={s.n} className="p-6 bg-surface border border-border-glow rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <s.icon className="size-6 text-brand-primary" />
                <span className="font-mono-tight text-xs text-slate-500">{s.n}</span>
              </div>
              <h4 className="font-bold text-white mb-2">{s.t}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="px-8 py-24">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-surface to-brand-bg border border-border-glow rounded-[40px] overflow-hidden">
          <div className="grid lg:grid-cols-12">
            <div className="lg:col-span-4 p-12 border-r border-border-glow">
              <h3 className="text-3xl font-bold text-white mb-6">The dashboard of trust.</h3>
              <ul className="space-y-6">
                {[
                  { n: 1, t: "Instant split payouts", d: "Vendor + platform fees split via Nomba checkout.", on: true },
                  { n: 2, t: "Dispute resolution", d: "Neutral arbitration panel for stuck transactions.", on: false },
                  { n: 3, t: "Multi-party deals", d: "Agent + landlord + tenant on one escrow.", on: false },
                ].map((it) => (
                  <li key={it.n} className="flex items-start gap-4">
                    <div className={`size-6 rounded-full flex items-center justify-center text-[10px] mt-1 ${it.on ? "bg-brand-primary/20 border border-brand-primary/40 text-brand-primary" : "bg-slate-800 border border-slate-700 text-slate-400"}`}>
                      {it.n}
                    </div>
                    <div>
                      <h5 className={`font-bold ${it.on ? "text-white" : "text-slate-300"}`}>{it.t}</h5>
                      <p className="text-sm text-slate-400">{it.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/dashboard" className="mt-10 inline-flex items-center gap-2 text-brand-primary font-bold text-sm">
                Open dashboard <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="lg:col-span-8 bg-black/40 p-8">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-8 py-24 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-12">Questions, answered.</h2>
        <div className="space-y-3">
          {[
            { q: "Who holds my money?", a: "Funds sit in a Nomba-issued virtual account scoped to your deal — never on a LockPay balance. We can only trigger release, not move funds arbitrarily." },
            { q: "What happens if the seller never delivers?", a: "The virtual account auto-expires. If funded already, you raise a dispute and our panel reviews evidence within 48 hours." },
            { q: "How fast are payouts?", a: "Once you confirm, Nomba's checkout split fires instantly. Sellers receive 97% in seconds; LockPay keeps a 3% platform fee." },
            { q: "Is this regulated?", a: "Nomba is CBN-licensed. LockPay operates as a software layer on top — we never custody fiat outside the regulated rails." },
          ].map((f) => (
            <details key={f.q} className="group p-6 bg-surface border border-border-glow rounded-2xl">
              <summary className="cursor-pointer font-bold text-white flex items-center justify-between">
                {f.q}
                <span className="text-brand-primary group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-sm text-slate-400 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 pb-24">
        <div className="max-w-5xl mx-auto p-16 bg-gradient-to-br from-brand-primary/10 via-surface to-brand-secondary/10 border border-border-glow rounded-[40px] text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Trade like Lagos has rules.</h2>
          <p className="text-slate-400 mb-10 max-w-2xl mx-auto">
            Join the buyers, sellers, freelancers and OTC traders who've stopped wondering whether
            the other side will actually deliver.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/sign-up" className="px-8 py-4 bg-brand-primary text-brand-bg font-bold rounded-xl">
              Create your first escrow
            </Link>
            <Link to="/pricing" className="px-8 py-4 border border-border-glow text-white font-bold rounded-xl hover:bg-surface">
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function DashboardPreview() {
  const rows = [
    { ref: "LP-9981-L", type: "Land Settlement", party: "Adekunle C.", amt: "₦5,000,000", status: "Awaiting Funding", tint: "bg-warn/15 text-warn" },
    { ref: "LP-9982-H", type: "House Deposit", party: "Prime Assets", amt: "₦450,000", status: "Locked", tint: "bg-brand-primary/15 text-brand-primary" },
    { ref: "LP-9983-C", type: "USDT OTC", party: "@crypto_king", amt: "₦1,200,000", status: "Delivered", tint: "bg-info/15 text-info" },
    { ref: "LP-9984-F", type: "Web App Milestone", party: "ada.codes", amt: "₦620,000", status: "Released", tint: "bg-emerald-500/15 text-emerald-400" },
  ];
  return (
    <div className="rounded-2xl border border-border-glow overflow-hidden bg-brand-bg">
      <div className="px-5 py-3 border-b border-border-glow flex items-center justify-between text-xs">
        <span className="font-mono-tight text-slate-500">/dashboard/deals</span>
        <span className="text-brand-primary">● live</span>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3 font-semibold">Ref</th>
            <th className="px-5 py-3 font-semibold">Counterparty</th>
            <th className="px-5 py-3 font-semibold">Amount</th>
            <th className="px-5 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-glow">
          {rows.map((r) => (
            <tr key={r.ref} className="hover:bg-surface/50">
              <td className="px-5 py-4">
                <div className="font-mono-tight text-white">{r.ref}</div>
                <div className="text-[10px] text-slate-500">{r.type}</div>
              </td>
              <td className="px-5 py-4 text-slate-300">{r.party}</td>
              <td className="px-5 py-4 font-mono-tight">{r.amt}</td>
              <td className="px-5 py-4">
                <span className={`px-2 py-1 rounded font-bold uppercase text-[9px] ${r.tint}`}>{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
