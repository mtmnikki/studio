
import { Logo } from "@/components/icons";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex w-full max-w-md flex-col items-center justify-center">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-sky-400/40">
            <Logo className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Welcome Back
          </h1>
          <p className="mt-2 text-slate-600">
            Sign in to access Jenn's Dream Billing platform.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
