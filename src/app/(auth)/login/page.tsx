"use client";

import React from "react";
import { LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const redirectPath = React.useMemo(() => {
    const requested = searchParams.get("redirect");
    if (requested && requested.startsWith("/")) {
      return requested;
    }
    return "/dashboard";
  }, [searchParams]);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isUserLoading && user) {
      router.replace(redirectPath);
    }
  }, [isUserLoading, user, redirectPath, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast({
        title: "Welcome back",
        description: "You're now signed in and ready to work.",
      });
      router.replace(redirectPath);
    } catch (error) {
      console.error("Failed to sign in", error);
      let message = "We couldn't sign you in. Double-check your credentials.";
      if (error instanceof Error) {
        message = error.message;
      }
      setFormError(message);
      toast({
        title: "Sign-in failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-indigo-400/40 via-sky-400/40 to-teal-300/40 blur-3xl" />
        <Card className="border-white/40 bg-white/80 shadow-2xl backdrop-blur-2xl">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-teal-400 text-white shadow-lg">
              <LogIn className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-semibold text-slate-900">Sign in to Jenn's Studio</CardTitle>
            <CardDescription className="text-slate-600">
              Enter your organization email and password to access billing tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jenn@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="border-white/60 bg-white/70"
                  disabled={isSubmitting || isUserLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="border-white/60 bg-white/70"
                  disabled={isSubmitting || isUserLoading}
                />
              </div>
              {formError && (
                <p className="text-sm font-medium text-rose-600">{formError}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-teal-400 text-white shadow-lg hover:shadow-xl"
                disabled={isSubmitting || isUserLoading}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <p className="mt-6 text-center text-xs text-slate-500">
              Need help? Contact your administrator to update access.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
