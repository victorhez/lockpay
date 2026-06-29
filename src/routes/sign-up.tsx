import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import { Check } from "lucide-react";

export const Route = createFileRoute("/sign-up")({
  head: () => ({ meta: [{ title: "Create account — LockPay" }] }),
  component: SignUp,
});

function SignUp() {
  return (
    <div className="min-h-screen bg-brand-bg grid lg:grid-cols-2">
      <div className="hidden lg:flex relative bg-surface border-r border-border-glow overflow-hidden flex-col p-16">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-secondary/15 via-transparent to-brand-primary/10" />
        <div className="relative">
          <Logo />
          <h2 className="mt-20 text-4xl font-bold text-white leading-tight">
            Trade with anyone. <br />
            Trust nobody by default.
          </h2>
          <ul className="mt-10 space-y-4">
            {[
              "Fresh Nomba virtual account per deal",
              "HMAC-verified release triggers",
              "Auto-split payouts in seconds",
              "Built-in dispute arbitration",
            ].map((b) => (
              <li key={b} className="flex gap-3 text-slate-300">
                <Check className="size-5 text-brand-primary shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col p-10">
        <div className="lg:hidden"><Logo /></div>
        <div className="flex-1 grid place-items-center">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold text-white mb-2">Create your account.</h1>
            <p className="text-slate-400 mb-10">Takes 60 seconds. No card required.</p>
            <form className="space-y-4">
              <Field label="Full name" placeholder="Chika Okafor" />
              <Field label="Email" type="email" placeholder="you@business.ng" />
              <Field label="Phone (NG)" placeholder="+234 801 234 5678" />
              <Field label="Password" type="password" placeholder="At least 8 characters" />
              <button type="button" className="w-full py-3 bg-brand-primary text-brand-bg font-bold rounded-xl">
                Create account
              </button>
              <p className="text-xs text-slate-500 text-center">
                Already have one?{" "}
                <Link to="/sign-in" className="text-brand-primary font-bold">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</span>
      <input
        {...rest}
        className="w-full px-4 py-3 bg-surface border border-border-glow rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary"
      />
    </label>
  );
}
