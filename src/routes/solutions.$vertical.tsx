import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Home, Map, ShoppingBag, Code2, Bitcoin, Check, ArrowRight } from "lucide-react";

type Vertical = {
  slug: string;
  title: string;
  tagline: string;
  icon: typeof Home;
  hero: string;
  fraudExamples: string[];
  releaseGates: string[];
  evidenceTypes: string[];
  feeNote: string;
};

const VERTICALS: Record<string, Vertical> = {
  rentals: {
    slug: "rentals",
    title: "House Rentals",
    tagline: "Pay the agent, but only after the keys turn.",
    icon: Home,
    hero: "Nigeria's biggest rental scam: pay the agent the inspection fee, then the rent — and the landlord never shows up. LockPay holds your deposit and first-month rent until you physically receive the keys and confirm the property matches.",
    fraudExamples: [
      "Agent collects deposit then ghosts",
      "Same flat rented to 3 different tenants",
      "Property doesn't match listing photos",
    ],
    releaseGates: [
      "Landlord KYC verified",
      "C-of-O / tenancy doc uploaded",
      "Tenant inspection confirmation",
      "Auto-split: 90% landlord · 7% agent · 3% LockPay",
    ],
    evidenceTypes: ["Property photos", "Signed tenancy agreement", "Key-handover selfie"],
    feeNote: "Flat 3% platform fee per deal. No subscriptions.",
  },
  land: {
    slug: "land",
    title: "Land & Property",
    tagline: "Multi-step release tied to surveyor, lawyer and registry.",
    icon: Map,
    hero: "Buying land in Nigeria means buying risk: omo-onile disputes, fake C-of-O, double sales. LockPay breaks the payment into stages, each unlocked only when the next document checks out.",
    fraudExamples: [
      "Fake or duplicated Certificate of Occupancy",
      "Family land sold without all heirs consenting",
      "Buyer pays full, vendor disappears before survey",
    ],
    releaseGates: [
      "Initial 20% on title-deed verification",
      "40% on independent surveyor sign-off",
      "40% on lawyer-confirmed deed transfer",
      "Up to ₦100M per deal",
    ],
    evidenceTypes: ["Survey plan", "Lawyer's confirmation letter", "Registry-stamped deed"],
    feeNote: "1.5% on deals above ₦20M.",
  },
  marketplace: {
    slug: "marketplace",
    title: "Marketplace Goods",
    tagline: "For Jiji, Instagram, WhatsApp and every 'send first' vendor.",
    icon: ShoppingBag,
    tagline_alt: "",
    hero: "Buying a phone, laptop, sneakers or hair from a vendor you've never met? Fund a LockPay virtual account, get it delivered, then confirm. The vendor sees the funds locked — they ship; you inspect; we release.",
    fraudExamples: [
      "Vendor ships an empty box",
      "Counterfeit item swapped for the real listing",
      "Vendor blocks you after delivery to dodge refunds",
    ],
    releaseGates: [
      "Vendor uploads dispatch evidence",
      "Buyer 48-hour inspection window",
      "Auto-release if no dispute filed",
    ],
    evidenceTypes: ["Dispatch waybill", "Unboxing video", "Delivery confirmation"],
    feeNote: "2.5% flat, capped at ₦5,000 per deal.",
  } as Vertical,
  freelance: {
    slug: "freelance",
    title: "Freelance Gigs",
    tagline: "Milestone escrow for devs, designers, writers and creators.",
    icon: Code2,
    hero: "Freelancers get burned by clients who vanish at delivery. Clients get burned by freelancers who vanish at the deposit. LockPay locks money per milestone and auto-splits payouts across collaborators.",
    fraudExamples: [
      "Client disappears once final files are delivered",
      "Freelancer takes 50% deposit and ghosts",
      "Endless scope creep that never gets paid",
    ],
    releaseGates: [
      "Per-milestone release with client approval",
      "Auto-split payouts to team members",
      "7-day silent-approval clause",
    ],
    evidenceTypes: ["Git commits / Figma links", "Loom walkthrough", "Client approval form"],
    feeNote: "2% per milestone. Volume discounts above ₦10M / month.",
  },
  crypto: {
    slug: "crypto",
    title: "Crypto / Forex OTC",
    tagline: "Atomic fiat-leg lock for P2P USDT, USDC and FX trades.",
    icon: Bitcoin,
    hero: "OTC traders lose millions to fake payment receipts and reversed transfers. With LockPay the fiat leg lands in a Nomba virtual account; the seller sees the lock; releases crypto; webhook fires → fiat releases. Zero chargebacks.",
    fraudExamples: [
      "Buyer sends fake bank-alert screenshot",
      "Buyer reverses transfer after receiving USDT",
      "Seller takes fiat then never sends coin",
    ],
    releaseGates: [
      "Fiat funding webhook (HMAC verified)",
      "On-chain confirmation trigger (TxHash)",
      "Sub-2 minute total settlement window",
    ],
    evidenceTypes: ["TxHash + block confirmations", "Wallet screenshot", "Trade chat log"],
    feeNote: "0.4% per side, capped at ₦8,000 per trade.",
  },
};

export const Route = createFileRoute("/solutions/$vertical")({
  loader: ({ params }) => {
    const v = VERTICALS[params.vertical];
    if (!v) throw notFound();
    return { vertical: v };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.vertical.title} escrow — LockPay` },
      { name: "description", content: loaderData?.vertical.tagline },
    ],
  }),
  component: VerticalPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-brand-bg grid place-items-center text-slate-400">
      Vertical not found.
    </div>
  ),
});

function VerticalPage() {
  const { vertical: v } = Route.useLoaderData();
  const Icon = v.icon;
  return (
    <div className="min-h-screen bg-brand-bg text-slate-200">
      <SiteHeader />
      <section className="px-8 py-24 max-w-6xl mx-auto">
        <Link to="/solutions" className="text-xs text-slate-500 hover:text-brand-primary uppercase tracking-widest font-bold">
          ← All solutions
        </Link>
        <div className="mt-8 flex items-start gap-6">
          <div className="size-16 bg-brand-primary/10 rounded-2xl grid place-items-center shrink-0">
            <Icon className="size-8 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-3">{v.title}</h1>
            <p className="text-xl text-slate-400">{v.tagline}</p>
          </div>
        </div>

        <p className="mt-12 max-w-3xl text-lg text-slate-300 leading-relaxed">{v.hero}</p>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Panel title="The fraud we kill" items={v.fraudExamples} tone="danger" />
          <Panel title="Release gates" items={v.releaseGates} tone="primary" />
          <Panel title="Evidence accepted" items={v.evidenceTypes} tone="neutral" />
        </div>

        <div className="mt-12 p-8 bg-surface border border-border-glow rounded-2xl flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Pricing</p>
            <p className="text-white font-bold">{v.feeNote}</p>
          </div>
          <Link to="/sign-up" className="px-6 py-3 bg-brand-primary text-brand-bg font-bold rounded-xl inline-flex items-center gap-2">
            Start a {v.title} escrow <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Panel({ title, items, tone }: { title: string; items: string[]; tone: "danger" | "primary" | "neutral" }) {
  const dot =
    tone === "danger" ? "bg-danger" : tone === "primary" ? "bg-brand-primary" : "bg-slate-500";
  return (
    <div className="p-6 bg-surface border border-border-glow rounded-2xl">
      <h3 className="font-bold text-white mb-5">{title}</h3>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i} className="text-sm text-slate-400 flex gap-3">
            <span className={`size-1.5 ${dot} rounded-full mt-2 shrink-0`} />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
