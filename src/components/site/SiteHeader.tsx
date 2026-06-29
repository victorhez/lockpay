import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const nav = [
  { to: "/solutions", label: "Solutions" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/developers", label: "Developers" },
];

export function SiteHeader() {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between px-8 py-5 border-b border-border-glow bg-brand-bg/80 backdrop-blur-xl">
      <Logo />
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeProps={{ className: "text-brand-primary" }}
            className="hover:text-brand-primary transition-colors"
          >
            {n.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link to="/sign-in" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
          Login
        </Link>
        <Link
          to="/sign-up"
          className="px-5 py-2.5 bg-brand-primary text-brand-bg font-bold rounded-full text-sm hover:scale-105 transition-transform"
        >
          Start Trading
        </Link>
      </div>
    </nav>
  );
}
