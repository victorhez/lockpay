import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/developers")({
  head: () => ({
    meta: [
      { title: "Developers — LockPay" },
      { name: "description", content: "Embed LockPay escrow into your marketplace with a single API call." },
    ],
  }),
  component: Developers,
});

const snippet = `// Create a LockPay escrow deal
const deal = await lockpay.deals.create({
  amount: 4_500_000,           // ₦ in kobo-free units
  currency: "NGN",
  buyer:  { email: "buyer@example.com" },
  seller: { email: "seller@example.com" },
  vertical: "land",
  releaseGates: ["title_verified", "lawyer_signoff"],
  split: [
    { accountId: "seller_acc_01", percentage: 97 },
    { accountId: "lockpay_fee",   percentage:  3 },
  ],
  expiresIn: "24h",
});

console.log(deal.virtualAccount.number); // e.g. 9920384411`;

function Developers() {
  return (
    <div className="min-h-screen bg-brand-bg text-slate-200">
      <SiteHeader />
      <section className="px-8 py-24 max-w-6xl mx-auto">
        <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-3">Developers</p>
        <h1 className="text-5xl font-bold text-white mb-6">Escrow as a single API call.</h1>
        <p className="text-slate-400 max-w-2xl mb-12">
          LockPay wraps Nomba's virtual-account, checkout-split and webhook APIs into one neutral
          escrow primitive. Drop it into your marketplace, OTC desk or rentals platform in an
          afternoon.
        </p>
        <div className="bg-surface border border-border-glow rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border-glow flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-danger" />
            <span className="size-2.5 rounded-full bg-warn" />
            <span className="size-2.5 rounded-full bg-brand-primary" />
            <span className="ml-3 text-xs font-mono-tight text-slate-500">node · @lockpay/sdk</span>
          </div>
          <pre className="p-6 text-xs font-mono-tight text-slate-200 overflow-x-auto whitespace-pre">
{snippet}
          </pre>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            { t: "HMAC webhooks", d: "Every state transition is signed. Replay-safe with built-in idempotency keys." },
            { t: "Sandbox mode", d: "Mint virtual accounts and simulate funding without touching real fiat." },
            { t: "Embeddable widget", d: "Drop our React widget into a checkout flow — buyers fund without leaving your site." },
          ].map((f) => (
            <div key={f.t} className="p-6 bg-surface border border-border-glow rounded-2xl">
              <h4 className="font-bold text-white mb-2">{f.t}</h4>
              <p className="text-sm text-slate-400">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
