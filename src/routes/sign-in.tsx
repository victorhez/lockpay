import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/sign-in")({
  head: () => ({ meta: [{ title: "Sign in — LockPay" }] }),
  component: SignIn,
});

function SignIn() {
  return (
    <div className="min-h-screen bg-brand-bg grid lg:grid-cols-2">
      <div className="flex flex-col p-10">
        <Logo />
        <div className="flex-1 grid place-items-center">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back.</h1>
            <p className="text-slate-400 mb-10">Sign in to your LockPay vault.</p>
            <form className="space-y-4">
              <Field label="Email" type="email" placeholder="you@business.ng" />
              <Field label="Password" type="password" placeholder="••••••••" />
              <button type="button" className="w-full py-3 bg-brand-primary text-brand-bg font-bold rounded-xl">
                Sign in
              </button>
              <p className="text-xs text-slate-500 text-center">
                No account?{" "}
                <Link to="/sign-up" className="text-brand-primary font-bold">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
        <p className="text-xs text-slate-500">© 2026 LockPay · Built on Nomba.</p>
      </div>
      <div className="hidden lg:block relative bg-surface border-l border-border-glow overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-secondary/15" />
        <div className="relative h-full grid place-items-center p-16">
          <blockquote className="max-w-md text-2xl font-bold text-white leading-snug">
            "LockPay killed every fraud step in our OTC desk. We onboard buyers in minutes — and
            never worry about chargebacks."
            <footer className="mt-6 text-sm text-slate-400 font-normal">
              — Tunde A., OTC trader · Lagos
            </footer>
          </blockquote>
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
