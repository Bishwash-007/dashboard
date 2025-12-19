"use client";

import { useEffect, useState } from "react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authService } from "@/services/auth";
import type { HttpError } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { notify } from "@/lib/notify";

const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(8, { message: "Minimum 8 characters" }),
});

type LoginValues = z.infer<typeof loginSchema>;

const resetRequestSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
});

const resetConfirmSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  token: z
    .string()
    .min(16, { message: "Paste the token from your email" })
    .max(128),
  password: z.string().min(8, { message: "Minimum 8 characters" }),
});

type ResetRequestValues = z.infer<typeof resetRequestSchema>;
type ResetConfirmValues = z.infer<typeof resetConfirmSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isResetDialogOpen, setResetDialogOpen] = useState(false);
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

  const resetRequestForm = useForm<ResetRequestValues>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetConfirmForm = useForm<ResetConfirmValues>({
    resolver: zodResolver(resetConfirmSchema),
    defaultValues: {
      email: "",
      token: "",
      password: "",
    },
  });

  const handleResetDialogChange = (open: boolean) => {
    setResetDialogOpen(open);
    if (!open) {
      resetRequestForm.reset({ email: "" });
      resetConfirmForm.reset({ email: "", token: "", password: "" });
    }
  };

  const loginMutation = useMutation({
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

  const resetRequestMutation = useMutation({
    mutationFn: authService.requestAdminPasswordReset,
    onSuccess: () => {
      notify.success("Reset instructions sent to your inbox");
      resetRequestForm.reset({ email: "" });
    },
    onError: (error: HttpError) => {
      notify.error(error.message);
    },
  });

  const resetConfirmMutation = useMutation({
    mutationFn: authService.confirmAdminPasswordReset,
    onSuccess: () => {
      notify.success(
        "Password updated. Please sign in with your new credentials."
      );
      handleResetDialogChange(false);
    },
    onError: (error: HttpError) => {
      notify.error(error.message);
    },
  });

  const onSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  const onResetRequestSubmit = (values: ResetRequestValues) => {
    resetRequestMutation.mutate(values);
  };

  const onResetConfirmSubmit = (values: ResetConfirmValues) => {
    resetConfirmMutation.mutate(values);
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
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
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
      <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
        <p>
          Need an account?{" "}
          <span className="font-medium text-foreground">
            Ask your lead for access
          </span>
        </p>
        <Dialog open={isResetDialogOpen} onOpenChange={handleResetDialogChange}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="font-semibold text-foreground underline underline-offset-4"
            >
              Forgot password?
            </button>
          </DialogTrigger>
          <DialogContent className="space-y-4">
            <DialogHeader>
              <DialogTitle>Reset admin password</DialogTitle>
              <DialogDescription>
                Request a secure reset link or confirm a token that was emailed
                to you.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="request" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="request">Request link</TabsTrigger>
                <TabsTrigger value="confirm">Confirm token</TabsTrigger>
              </TabsList>
              <TabsContent value="request">
                <Form {...resetRequestForm}>
                  <form
                    className="space-y-4"
                    onSubmit={resetRequestForm.handleSubmit(
                      onResetRequestSubmit
                    )}
                  >
                    <FormField
                      control={resetRequestForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              autoComplete="email"
                              placeholder="admin@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={resetRequestMutation.isPending}
                    >
                      {resetRequestMutation.isPending ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          Sending link
                        </span>
                      ) : (
                        "Send reset email"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="confirm">
                <Form {...resetConfirmForm}>
                  <form
                    className="space-y-4"
                    onSubmit={resetConfirmForm.handleSubmit(
                      onResetConfirmSubmit
                    )}
                  >
                    <FormField
                      control={resetConfirmForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              autoComplete="email"
                              placeholder="admin@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetConfirmForm.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reset token</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Paste the 32-byte token"
                              autoComplete="off"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetConfirmForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={resetConfirmMutation.isPending}
                    >
                      {resetConfirmMutation.isPending ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          Updating password
                        </span>
                      ) : (
                        "Confirm reset"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
