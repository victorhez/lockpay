import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — LockPay" }] }),
  component: Settings,
});

function Settings() {
  return (
    <div className="p-10 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
      <p className="text-slate-400 mb-10">Manage your profile, KYC, payouts and webhook secrets.</p>

      <div className="space-y-6">
        <Card title="Profile">
          <Row k="Name" v="Chika Okafor" />
          <Row k="Email" v="chika@lockpay.ng" />
          <Row k="Phone" v="+234 801 234 5678" />
        </Card>
        <Card title="KYC status">
          <Row k="BVN" v="Verified · ●●●● 1234" />
          <Row k="NIN" v="Verified" />
          <Row k="Business name" v="Not submitted" />
        </Card>
        <Card title="Default payout account">
          <Row k="Bank" v="GTBank · ●●●● 8821" />
          <Row k="Auto-withdraw" v="Disabled" />
        </Card>
        <Card title="Webhook secret (Developers)">
          <Row k="Endpoint" v="https://api.lockpay.ng/v1/webhook" />
          <Row k="Secret" v="whsec_●●●●●●●●●●●●●●" />
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border-glow rounded-2xl">
      <p className="px-6 py-4 border-b border-border-glow text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
      <div className="divide-y divide-border-glow">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-sm text-slate-400">{k}</span>
      <span className="text-sm text-white font-medium">{v}</span>
    </div>
  );
}
