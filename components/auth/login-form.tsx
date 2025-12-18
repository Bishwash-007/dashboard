"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth";
import type { HttpError } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { notify } from "@/lib/notify";

const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(8, { message: "Minimum 8 characters" }),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isHydrated, isAuthenticated, router]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user, tokens }) => {
      setCredentials({ user, tokens });
      notify.success("Welcome back");
      router.replace("/dashboard");
    },
    onError: (error: HttpError) => {
      notify.error(error.message);
    },
  });

  const onSubmit = (values: LoginValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 border border-border/60 bg-card/80 p-10 backdrop-blur">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground">
          Khushika Mobile Shop
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Sign in</h1>
          <p className="text-base text-muted-foreground">
            Use your admin credentials to access the electronics workspace.
          </p>
        </div>
      </div>
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute left-4 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                      type="email"
                      autoComplete="email"
                      className="h-12 border-border/70 pl-11 text-base"
                      placeholder="admin@electronics.dev"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="text-muted-foreground absolute left-4 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                      type="password"
                      autoComplete="current-password"
                      className="h-12 border-border/70 pl-11 text-base"
                      placeholder="••••••••"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full text-base font-semibold"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                Signing in
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <span className="font-medium text-foreground">
          Ask your lead for access
        </span>
      </p>
    </div>
  );
}
