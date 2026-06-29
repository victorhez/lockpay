import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="size-8 bg-brand-primary rounded-lg flex items-center justify-center glow-primary">
        <div className="size-3.5 bg-brand-bg rounded-sm rotate-45" />
      </div>
      <span className="text-xl font-bold tracking-tight text-white">LockPay</span>
    </Link>
  );
}
