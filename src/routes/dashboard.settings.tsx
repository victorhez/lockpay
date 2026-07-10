import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { api, type User, ApiErrorException } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — LockPay" }] }),
  component: Settings,
});

function Settings() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPayout, setIsEditingPayout] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
  });
  const [payoutForm, setPayoutForm] = useState({
    payout_bank_name: user?.payout_bank_name || "",
    payout_account_number: user?.payout_account_number || "",
  });

  // Get current user (fresh data)
  const { data: currentUser, isLoading: isUserLoading } = useQuery<User | undefined>({
    queryKey: ["currentUser"],
    queryFn: api.getCurrentUser,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.updateCurrentUser(data),
    onSuccess: async (updatedUser) => {
      await refreshUser(); // Refresh auth user
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      if (error instanceof ApiErrorException) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    },
  });

  // Update payout mutation
  const updatePayoutMutation = useMutation({
    mutationFn: (data: any) => api.updateCurrentUser(data),
    onSuccess: async (updatedUser) => {
      await refreshUser(); // Refresh auth user
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      setIsEditingPayout(false);
      toast.success("Payout details updated successfully!");
    },
    onError: (error) => {
      if (error instanceof ApiErrorException) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update payout details. Please try again.");
      }
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    updatePayoutMutation.mutate(payoutForm);
  };

  if (isUserLoading) {
    return (
      <div className="p-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400 mb-10">Loading...</p>
      </div>
    );
  }

  const u = currentUser || user;

  return (
    <div className="p-10 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
      <p className="text-slate-400 mb-10">Manage your profile and payout details.</p>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card title="Profile">
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <label className="block">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</span>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-bg border border-border-glow rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary"
                  disabled={updateProfileMutation.isPending}
                />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone</span>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-bg border border-border-glow rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary"
                  disabled={updateProfileMutation.isPending}
                />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</span>
                <input
                  type="email"
                  value={u?.email || ""}
                  disabled
                  className="w-full px-4 py-3 bg-brand-bg border border-border-glow rounded-xl text-slate-500 cursor-not-allowed"
                />
              </label>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-primary text-brand-bg font-bold rounded-xl"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-8 py-3 border border-border-glow text-slate-300 font-bold rounded-xl hover:bg-brand-bg"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <Row k="Name" v={u?.full_name || "Not set"} />
              <Row k="Email" v={u?.email || ""} />
              <Row k="Phone" v={u?.phone || "Not set"} />
              <div className="px-6 py-4">
                <button
                  onClick={() => {
                    setProfileForm({
                      full_name: u?.full_name || "",
                      phone: u?.phone || "",
                    });
                    setIsEditingProfile(true);
                  }}
                  className="text-brand-primary text-sm font-semibold hover:underline"
                >
                  Edit Profile
                </button>
              </div>
            </>
          )}
        </Card>

        {/* Payout Account Card */}
        <Card title="Default Payout Account">
          {isEditingPayout ? (
            <form onSubmit={handleSavePayout} className="p-6 space-y-4">
              <label className="block">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bank Name</span>
                <input
                  type="text"
                  value={payoutForm.payout_bank_name}
                  onChange={(e) => setPayoutForm({ ...payoutForm, payout_bank_name: e.target.value })}
                  placeholder="e.g. GTBank"
                  className="w-full px-4 py-3 bg-brand-bg border border-border-glow rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary"
                  disabled={updatePayoutMutation.isPending}
                />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Account Number</span>
                <input
                  type="text"
                  value={payoutForm.payout_account_number}
                  onChange={(e) => setPayoutForm({ ...payoutForm, payout_account_number: e.target.value })}
                  placeholder="e.g. 0123456789"
                  className="w-full px-4 py-3 bg-brand-bg border border-border-glow rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary"
                  disabled={updatePayoutMutation.isPending}
                />
              </label>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-primary text-brand-bg font-bold rounded-xl"
                  disabled={updatePayoutMutation.isPending}
                >
                  {updatePayoutMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPayout(false)}
                  className="px-8 py-3 border border-border-glow text-slate-300 font-bold rounded-xl hover:bg-brand-bg"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <Row k="Bank" v={u?.payout_bank_name || "Not set"} />
              <Row k="Account Number" v={u?.payout_account_number || "Not set"} />
              <div className="px-6 py-4">
                <button
                  onClick={() => {
                    setPayoutForm({
                      payout_bank_name: u?.payout_bank_name || "",
                      payout_account_number: u?.payout_account_number || "",
                    });
                    setIsEditingPayout(true);
                  }}
                  className="text-brand-primary text-sm font-semibold hover:underline"
                >
                  Edit Payout Details
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border-glow rounded-2xl">
      <p className="px-6 py-4 border-b border-border-glow text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
      <div>{children}</div>
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
