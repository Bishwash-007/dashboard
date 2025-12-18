import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),rgba(15,23,42,0.95))]" />
        <div className="relative z-10 flex flex-col gap-10">
          <span className="text-2xl font-semibold tracking-tight">
            Khushika Mobile Shop
          </span>
          <div className="space-y-6">
            <p className="text-emerald-300 text-sm uppercase tracking-[0.5em]">
              Admin Control
            </p>
            <h1 className="text-4xl font-semibold leading-tight">
              Operational clarity for every launch cycle.
            </h1>
            <p className="text-lg text-slate-200">
              Track orders in real time, ship inventory updates, and keep
              revenue teams aligned from a single command center.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center bg-background px-6 py-12 sm:px-10">
        <LoginForm />
      </div>
    </main>
  );
}
