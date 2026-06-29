import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import {
  LayoutDashboard,
  ListChecks,
  Plus,
  ShieldAlert,
  Settings,
  Wallet,
  LogOut,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/deals", label: "Deals", icon: ListChecks },
  { to: "/dashboard/new", label: "New escrow", icon: Plus },
  { to: "/dashboard/disputes", label: "Disputes", icon: ShieldAlert },
  { to: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function DashboardLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-brand-bg text-slate-200 grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-border-glow p-6 hidden lg:flex flex-col">
        <Logo />
        <nav className="mt-10 flex-1 space-y-1">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-brand-primary/10 text-brand-primary" : "text-slate-400 hover:bg-surface hover:text-white"}`}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-500 hover:text-white">
          <LogOut className="size-4" /> Sign out
        </Link>
      </aside>
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
