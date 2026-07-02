import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import { Check } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/useAuth";
import { ApiErrorException } from "@/lib/api";

const schema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/sign-up")({
  head: () => ({ meta: [{ title: "Create account — LockPay" }] }),
  component: SignUp,
});

function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", email: "", phone: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await register({
        ...data,
        role: "buyer",
      });
      toast.success("Account created successfully!");
      navigate({ to: "/dashboard" });
    } catch (error) {
      if (error instanceof ApiErrorException) {
        toast.error(error.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

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
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <Field 
                    label="Full name" 
                    placeholder="Chika Okafor"
                    error={errors.full_name?.message}
                    disabled={isSubmitting}
                    {...field}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Field 
                    label="Email" 
                    type="email" 
                    placeholder="you@business.ng"
                    error={errors.email?.message}
                    disabled={isSubmitting}
                    {...field}
                  />
                )}
              />
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Field 
                    label="Phone (NG)" 
                    placeholder="+234 801 234 5678"
                    error={errors.phone?.message}
                    disabled={isSubmitting}
                    {...field}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Field 
                    label="Password" 
                    type="password" 
                    placeholder="At least 8 characters"
                    error={errors.password?.message}
                    disabled={isSubmitting}
                    {...field}
                  />
                )}
              />
              <button 
                type="submit" 
                className="w-full py-3 bg-brand-primary text-brand-bg font-bold rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
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

function Field({ 
  label, 
  error, 
  ...rest 
}: { 
  label: string; 
  error?: string; 
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</span>
      <input
        {...rest}
        className={`w-full px-4 py-3 bg-surface border rounded-xl text-white placeholder:text-slate-600 focus:outline-none disabled:opacity-50 ${
          error ? "border-danger" : "border-border-glow focus:border-brand-primary"
        }`}
      />
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </label>
  );
}
