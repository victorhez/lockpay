import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiErrorException } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/deals/$id")({
  head: ({ params }) => ({ meta: [{ title: `Deal ${params.id} — LockPay` }] }),
  component: DealDetail,
});

const mapStatusToDisplay = (status: string) => {
  switch (status) {
    case "created": return "Awaiting Funding";
    case "funded": return "Locked";
    case "condition_pending": return "Delivered";
    case "released": return "Released";
    case "disputed": return "Disputed";
    case "refunded": return "Refunded";
    case "expired": return "Expired";
    default: return status;
  }
};

const tintFor = (s: string) => {
  if (s === "Awaiting Funding") return "bg-warn/15 text-warn";
  if (s === "Locked") return "bg-brand-primary/15 text-brand-primary";
  if (s === "Delivered") return "bg-info/15 text-info";
  if (s === "Released") return "bg-emerald-500/15 text-emerald-400";
  if (s === "Disputed") return "bg-danger/15 text-danger";
  return "bg-slate-700/40 text-slate-400";
};

function DealDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: deal, isLoading } = useQuery({
    queryKey: ["deal", id],
    queryFn: () => api.getDeal(id),
  });

  const fundMutation = useMutation({
    mutationFn: api.fundDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal", id] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal funded successfully!");
    },
    onError: (error) => {
      if (error instanceof ApiErrorException) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fund deal");
      }
    },
  });

  const releaseMutation = useMutation({
    mutationFn: api.releaseDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal", id] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Funds released successfully!");
    },
    onError: (error) => {
      if (error instanceof ApiErrorException) {
        toast.error(error.message);
      } else {
        toast.error("Failed to release funds");
      }
    },
  });

  const disputeMutation = useMutation({
    mutationFn: api.disputeDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal", id] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Dispute raised successfully!");
    },
    onError: (error) => {
      if (error instanceof ApiErrorException) {
        toast.error(error.message);
      } else {
        toast.error("Failed to raise dispute");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="p-10">
        <Link to="/dashboard/deals" className="text-xs text-slate-500 hover:text-brand-primary uppercase tracking-widest font-bold">
          ← All deals
        </Link>
        <div className="mt-10 text-center text-slate-400">Loading deal...</div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-10">
        <Link to="/dashboard/deals" className="text-xs text-slate-500 hover:text-brand-primary uppercase tracking-widest font-bold">
          ← All deals
        </Link>
        <div className="mt-10 text-center text-slate-400">Deal not found</div>
      </div>
    );
  }

  const sellerAmount = deal.amount * 0.97;
  const platformFee = deal.amount * 0.03;

  return (
    <div className="p-10 max-w-5xl">
      <Link to="/dashboard/deals" className="text-xs text-slate-500 hover:text-brand-primary uppercase tracking-widest font-bold">
        ← All deals
      </Link>
      <div className="mt-6 flex items-start justify-between">
        <div>
          <p className="font-mono-tight text-slate-500 text-sm">{deal.id}</p>
          <h1 className="text-3xl font-bold text-white mt-1">{deal.title}</h1>
          <p className="text-slate-400 mt-1">{deal.vertical} · {deal.description} · Buyer view</p>
        </div>
        <span className={`px-3 py-1 rounded-md font-bold uppercase text-xs ${tintFor(mapStatusToDisplay(deal.status))}`}>
          {mapStatusToDisplay(deal.status)}
        </span>
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Funding details">
            <div className="p-5 bg-brand-bg border border-border-glow rounded-xl">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Nomba Virtual Account</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-mono-tight font-bold text-white">{deal.virtual_account_number || "9920 3844 11"}</p>
                <button
                  onClick={() => {
                    if (deal.virtual_account_number) {
                      navigator.clipboard.writeText(deal.virtual_account_number);
                      toast.success("Account number copied!");
                    }
                  }}
                  className="p-2 rounded-lg bg-surface border border-border-glow text-slate-400 hover:text-brand-primary"
                >
                  <Copy className="size-4" />
                </button>
              </div>
              <div className="mt-4 flex justify-between text-[11px] font-mono-tight text-slate-500 uppercase">
                <span>Bank: {deal.virtual_account_bank || "Nomba / Titan"}</span>
                <span className="flex items-center gap-1"><Clock className="size-3" /> Expires soon</span>
              </div>
            </div>
          </Section>

          <Section title="Release gates">
            <ol className="space-y-3">
              {[
                { t: "Counterparty KYC verified", on: true },
                { t: "Evidence uploaded (photo / doc / TxHash)", on: deal.status === "funded" || deal.status === "condition_pending" || deal.status === "released" },
                { t: "Buyer manual confirmation", on: deal.status === "released" },
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
              <li className="flex items-start gap-3">
                <span className="size-2 rounded-full mt-1.5 bg-brand-primary" />
                <div className="flex-1">
                  <p className="text-white">Deal opened</p>
                  <p className="text-xs text-slate-500">{new Date(deal.created_at).toLocaleDateString()}</p>
                </div>
              </li>
            </ul>
          </Section>
        </div>

        <aside className="space-y-4">
          <div className="p-5 bg-surface border border-border-glow rounded-2xl">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Parties</p>
            <Party role="Buyer (you)" name="You" amount={`₦${deal.amount.toLocaleString()}`} />
            <div className="my-3 border-t border-border-glow" />
            <Party role="Seller" name="Counterparty" amount={`receives ₦${sellerAmount.toLocaleString()}`} />
          </div>
          <div className="p-5 bg-surface border border-border-glow rounded-2xl">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Split on release</p>
            <SplitRow name="Seller" pct="97%" amount={`₦${sellerAmount.toLocaleString()}`} />
            <SplitRow name="LockPay fee" pct="3%" amount={`₦${platformFee.toLocaleString()}`} />
          </div>
          {deal.status === "created" && (
            <button
              onClick={() => fundMutation.mutate(id)}
              disabled={fundMutation.isPending}
              className="w-full py-3 bg-brand-primary text-brand-bg font-bold rounded-xl"
            >
              {fundMutation.isPending ? "Funding..." : "Mark as Funded"}
            </button>
          )}
          {(deal.status === "funded" || deal.status === "condition_pending") && (
            <button
              onClick={() => releaseMutation.mutate(id)}
              disabled={releaseMutation.isPending}
              className="w-full py-3 bg-brand-primary text-brand-bg font-bold rounded-xl"
            >
              {releaseMutation.isPending ? "Releasing..." : "Confirm delivery & release"}
            </button>
          )}
          {(deal.status === "funded" || deal.status === "condition_pending") && (
            <button
              onClick={() => disputeMutation.mutate(id)}
              disabled={disputeMutation.isPending}
              className="w-full py-3 border border-border-glow text-slate-300 font-bold rounded-xl hover:bg-surface inline-flex items-center justify-center gap-2"
            >
              <ShieldAlert className="size-4" /> {disputeMutation.isPending ? "Raising..." : "Raise dispute"}
            </button>
          )}
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
