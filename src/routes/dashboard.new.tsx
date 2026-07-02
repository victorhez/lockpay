import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Home, Map, ShoppingBag, Code2, Bitcoin } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { ApiErrorException } from "@/lib/api";

const VERTS = [
  { slug: "rentals", title: "House Rentals", icon: Home },
  { slug: "land", title: "Land & Property", icon: Map },
  { slug: "marketplace", title: "Marketplace", icon: ShoppingBag },
  { slug: "freelance", title: "Freelance Gig", icon: Code2 },
  { slug: "crypto", title: "Crypto OTC", icon: Bitcoin },
];

export const Route = createFileRoute("/dashboard/new")({
  head: () => ({ meta: [{ title: "New escrow — LockPay" }] }),
  component: NewDeal,
});

function NewDeal() {
  const [vertical, setVertical] = useState("land");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [counterpartyEmail, setCounterpartyEmail] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createDeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal created successfully!");
      navigate({ to: "/dashboard/deals" });
    },
    onError: (error) => {
      if (error instanceof ApiErrorException) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create deal. Please try again.");
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/,/g, ""));
    if (!title || !amount || isNaN(parsedAmount)) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      title,
      description: notes,
      vertical,
      amount: parsedAmount,
      currency: "NGN",
      buyer_id: user?.id || "1",
      seller_id: "2",
    });
  };

  return (
    <div className="p-10 max-w-4xl">
      <Link to="/dashboard" className="text-xs text-slate-500 hover:text-brand-primary uppercase tracking-widest font-bold">
        ← Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-white mt-2 mb-8">New escrow</h1>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="bg-surface border border-border-glow rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">What's this for?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {VERTS.map((v) => (
              <button
                key={v.slug}
                type="button"
                onClick={() => setVertical(v.slug)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  vertical === v.slug ? "bg-brand-primary/10 border-brand-primary" : "bg-brand-bg border-border-glow hover:border-slate-600"
                }`}
              >
                <v.icon className="size-5" style={{ color: vertical === v.slug ? "#a3ff6b" : "#94a3b8" }} />
                <span className="font-semibold text-sm">{v.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Deal title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3-bed flat deposit"
                className="w-full px-4 py-3 bg-surface border border-border-glow rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary"
                disabled={createMutation.isPending}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Counterparty email</span>
              <input
                type="email"
                value={counterpartyEmail}
                onChange={(e) => setCounterpartyEmail(e.target.value)}
                placeholder="seller@domain.com"
                className="w-full px-4 py-3 bg-surface border border-border-glow rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary"
                disabled={createMutation.isPending}
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Amount</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono-tight text-sm">₦</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500,000"
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border-glow rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary font-mono-tight"
                  disabled={createMutation.isPending}
                />
              </div>
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Deadline</span>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border-glow rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary"
                disabled={createMutation.isPending}
              />
            </label>
          </div>
        </div>

        <div className="bg-surface border border-border-glow rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Terms</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what needs to happen for the funds to release..."
            rows={6}
            className="w-full px-4 py-3 bg-brand-bg border border-border-glow rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary"
            disabled={createMutation.isPending}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 py-3 bg-brand-primary text-brand-bg font-bold rounded-xl"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating escrow..." : "Create escrow"}
          </button>
          <Link to="/dashboard" className="px-8 py-3 border border-border-glow text-slate-300 font-bold rounded-xl hover:bg-surface">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
