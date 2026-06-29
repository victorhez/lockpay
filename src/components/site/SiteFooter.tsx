import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="px-8 py-16 border-t border-border-glow">
      <div className="max-w-7xl mx-auto grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-slate-500">
            The neutral holding layer for Nigeria's P2P economy. Money locked in Nomba virtual
            accounts, released only when both sides confirm.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Product</p>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link to="/solutions" className="hover:text-brand-primary">Solutions</Link></li>
            <li><Link to="/how-it-works" className="hover:text-brand-primary">How it works</Link></li>
            <li><Link to="/pricing" className="hover:text-brand-primary">Pricing</Link></li>
            <li><Link to="/developers" className="hover:text-brand-primary">Developers</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Verticals</p>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link to="/solutions/rentals" className="hover:text-brand-primary">House Rentals</Link></li>
            <li><Link to="/solutions/land" className="hover:text-brand-primary">Land & Property</Link></li>
            <li><Link to="/solutions/marketplace" className="hover:text-brand-primary">Marketplace</Link></li>
            <li><Link to="/solutions/freelance" className="hover:text-brand-primary">Freelance</Link></li>
            <li><Link to="/solutions/crypto" className="hover:text-brand-primary">Crypto OTC</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border-glow flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500">© 2026 LockPay Technologies Ltd. Built on Nomba.</p>
        <p className="text-xs text-slate-500 font-mono-tight">Lagos · Abuja · Port Harcourt</p>
      </div>
    </footer>
  );
}
