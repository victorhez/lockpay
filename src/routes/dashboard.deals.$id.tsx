import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Deal, type DealAnalytics, ApiErrorException } from "@/lib/api";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";

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
  const { user } = useAuth();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: deal, isLoading: isLoadingDeal } = useQuery<Deal | undefined>({
    queryKey: ["deal", id],
    queryFn: () => api.getDeal(id),
  });

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<DealAnalytics | undefined>({
    queryKey: ["dealAnalytics", id],
    queryFn: () => api.getDealAnalytics(id),
    enabled: !!deal,
  });

  // Track visit on component mount
  useEffect(() => {
    if (id) {
      api.trackDealVisit(id).catch(e => console.error("Failed to track visit:", e));
    }
  }, [id]);

  const fundMutation = useMutation({
    mutationFn: api.fundDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal", id] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["dealAnalytics", id] });
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
      queryClient.invalidateQueries({ queryKey: ["dealAnalytics", id] });
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

  const confirmRenderedMutation = useMutation({
    mutationFn: api.confirmServiceRendered,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal", id] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["dealAnalytics", id] });
      toast.success("Confirmation received!");
    },
    onError: (error) => {
      if (error instanceof ApiErrorException) {
        toast.error(error.message);
      } else {
        toast.error("Failed to confirm");
      }
    },
  });

  const disputeMutation = useMutation({
    mutationFn: api.disputeDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal", id] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["dealAnalytics", id] });
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

  const createReviewMutation = useMutation({
    mutationFn: () => api.createReview(id, { rating: reviewRating, comment: reviewComment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal", id] });
      queryClient.invalidateQueries({ queryKey: ["dealAnalytics", id] });
      toast.success("Review added!");
      setReviewComment("");
    },
    onError: (error) => {
      if (error instanceof ApiErrorException) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add review");
      }
    },
  });

  if (isLoadingDeal) {
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
  const isBuyer = user?.id === deal.buyer_id;
  const isSeller = user?.id === deal.seller_id;
  const userHasConfirmed = isBuyer ? deal.buyer_confirmed_rendered : deal.seller_confirmed_rendered;
  const bothConfirmed = deal.buyer_confirmed_rendered && deal.seller_confirmed_rendered;

  return (
    <div className="p-10 max-w-5xl">
      <Link to="/dashboard/deals" className="text-xs text-slate-500 hover:text-brand-primary uppercase tracking-widest font-bold">
        ← All deals
      </Link>
      <div className="mt-6 flex items-start justify-between">
        <div>
          <p className="font-mono-tight text-slate-500 text-sm">{deal.id}</p>
          <h1 className="text-3xl font-bold text-white mt-1">{deal.title}</h1>
          <p className="text-slate-400 mt-1">{deal.vertical} · {deal.description} · {isBuyer ? "Buyer" : "Seller"} view</p>
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
              <li className="flex items-center gap-3 p-3 rounded-xl bg-brand-bg border border-border-glow">
                <span className="size-7 rounded-full grid place-items-center text-xs font-bold bg-brand-primary text-brand-bg">
                  <CheckCircle2 className="size-4" />
                </span>
                <span className="text-white">Deal created</span>
              </li>
              <li className={`flex items-center gap-3 p-3 rounded-xl bg-brand-bg border border-border-glow ${(deal.status === "funded" || deal.status === "condition_pending" || deal.status === "released") ? "" : "opacity-50"}`}>
                <span className={`size-7 rounded-full grid place-items-center text-xs font-bold ${(deal.status === "funded" || deal.status === "condition_pending" || deal.status === "released") ? "bg-brand-primary text-brand-bg" : "bg-surface border border-border-glow text-slate-400"}`}>
                  {(deal.status === "funded" || deal.status === "condition_pending" || deal.status === "released") ? <CheckCircle2 className="size-4" /> : 2}
                </span>
                <span className={(deal.status === "funded" || deal.status === "condition_pending" || deal.status === "released") ? "text-white" : "text-slate-400"}>Funds received</span>
              </li>
              <li className={`flex items-center gap-3 p-3 rounded-xl bg-brand-bg border border-border-glow ${bothConfirmed ? "" : "opacity-50"}`}>
                <span className={`size-7 rounded-full grid place-items-center text-xs font-bold ${bothConfirmed ? "bg-brand-primary text-brand-bg" : "bg-surface border border-border-glow text-slate-400"}`}>
                  {bothConfirmed ? <CheckCircle2 className="size-4" /> : 3}
                </span>
                <span className={bothConfirmed ? "text-white" : "text-slate-400"}>Both parties confirm delivery</span>
              </li>
              <li className={`flex items-center gap-3 p-3 rounded-xl bg-brand-bg border border-border-glow ${deal.status === "released" ? "" : "opacity-50"}`}>
                <span className={`size-7 rounded-full grid place-items-center text-xs font-bold ${deal.status === "released" ? "bg-brand-primary text-brand-bg" : "bg-surface border border-border-glow text-slate-400"}`}>
                  {deal.status === "released" ? <CheckCircle2 className="size-4" /> : 4}
                </span>
                <span className={deal.status === "released" ? "text-white" : "text-slate-400"}>Funds released to seller</span>
              </li>
            </ol>
          </Section>

          <Section title="Activity">
            {isLoadingAnalytics ? (
              <p className="text-slate-400">Loading activity...</p>
            ) : analytics?.activities && analytics.activities.length > 0 ? (
              <ul className="space-y-4 text-sm">
                {analytics.activities.map((activity: any) => (
                  <li key={activity.id} className="flex items-start gap-3">
                    <span className="size-2 rounded-full mt-1.5 bg-brand-primary" />
                    <div className="flex-1">
                      <p className="text-white">{activity.description}</p>
                      <p className="text-xs text-slate-500">{new Date(activity.created_at).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">No activity yet</p>
            )}
          </Section>

          {deal.status === "released" && (
            <Section title="Reviews">
              <div className="space-y-4">
                {analytics?.reviews && analytics.reviews.length > 0 ? (
                  analytics.reviews.map((review: any) => (
                    <div key={review.id} className="p-4 bg-brand-bg border border-border-glow rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-bold">Rating: {"⭐".repeat(review.rating)}</p>
                        <p className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                      {review.comment && <p className="text-slate-300">{review.comment}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No reviews yet</p>
                )}

                {/* Check if user already left a review */}
                {!analytics?.reviews?.some((r: any) => r.reviewer_id === user?.id) && (
                  <div className="p-4 bg-brand-bg border border-border-glow rounded-xl">
                    <p className="text-white font-bold mb-2">Leave a review</p>
                    <div className="flex items-center gap-2 mb-3">
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-2xl ${star <= reviewRating ? "text-yellow-400" : "text-slate-600"}`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full p-3 bg-surface border border-border-glow rounded-xl text-white placeholder-slate-500 mb-3"
                      placeholder="Leave a comment..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                    <button
                      onClick={() => createReviewMutation.mutate()}
                      disabled={createReviewMutation.isPending}
                      className="px-4 py-2 bg-brand-primary text-brand-bg font-bold rounded-lg"
                    >
                      {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                )}
              </div>
            </Section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="p-5 bg-surface border border-border-glow rounded-2xl">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Parties</p>
            <Party role={isBuyer ? "Buyer (you)" : "Buyer"} name={isBuyer ? user?.full_name : "Counterparty"} amount={`₦${deal.amount.toLocaleString()}`} />
            <div className="my-3 border-t border-border-glow" />
            <Party role={isSeller ? "Seller (you)" : "Seller"} name={isSeller ? user?.full_name : "Counterparty"} amount={`receives ₦${sellerAmount.toLocaleString()}`} />
          </div>

          <div className="p-5 bg-surface border border-border-glow rounded-2xl">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Analytics</p>
            <p className="text-sm text-slate-300">Visits: {analytics?.visits_count || 0}</p>
          </div>

          <div className="p-5 bg-surface border border-border-glow rounded-2xl">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Split on release</p>
            <SplitRow name="Seller" pct="97%" amount={`₦${sellerAmount.toLocaleString()}`} />
            <SplitRow name="LockPay fee" pct="3%" amount={`₦${platformFee.toLocaleString()}`} />
          </div>

          {deal.status === "created" && isBuyer && (
            <button
              onClick={() => fundMutation.mutate(id)}
              disabled={fundMutation.isPending}
              className="w-full py-3 bg-brand-primary text-brand-bg font-bold rounded-xl"
            >
              {fundMutation.isPending ? "Funding..." : "Mark as Funded"}
            </button>
          )}

          {(deal.status === "funded" || deal.status === "condition_pending") && !userHasConfirmed && (
            <button
              onClick={() => confirmRenderedMutation.mutate(id)}
              disabled={confirmRenderedMutation.isPending}
              className="w-full py-3 bg-brand-primary text-brand-bg font-bold rounded-xl"
            >
              {confirmRenderedMutation.isPending ? "Confirming..." : "Confirm delivery"}
            </button>
          )}

          {(deal.status === "funded" || deal.status === "condition_pending") && (
            <>
              <button
                onClick={() => releaseMutation.mutate(id)}
                disabled={releaseMutation.isPending}
                className="w-full py-3 border border-brand-primary text-brand-primary font-bold rounded-xl hover:bg-brand-primary/10"
              >
                {releaseMutation.isPending ? "Releasing..." : "Manual Release (if needed)"}
              </button>

              <button
                onClick={() => disputeMutation.mutate(id)}
                disabled={disputeMutation.isPending}
                className="w-full py-3 border border-border-glow text-slate-300 font-bold rounded-xl hover:bg-surface inline-flex items-center justify-center gap-2"
              >
                <ShieldAlert className="size-4" /> {disputeMutation.isPending ? "Raising..." : "Raise dispute"}
              </button>
            </>
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

function Party({ role, name, amount }: { role: string; name?: string; amount: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">{role}</p>
        <p className="font-bold text-white">{name || "Counterparty"}</p>
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
