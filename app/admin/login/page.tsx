"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { loginAction } from "../actions";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { UiButton } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await loginAction(password);
      if (!result.ok) {
        setError(result.message ?? "Invalid credentials");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="hero-gradient flex min-h-full items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Card>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-center text-xl font-bold text-slate-800 dark:text-slate-100">Admin Sign In</h1>
          <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
            Enter the admin key to manage site content.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <div>
              <Label htmlFor="password">Admin key</Label>
              <Input
                id="password"
                type="password"
                required
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••••"
              />
            </div>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <UiButton type="submit" isLoading={isSubmitting} className="w-full">
              Sign in
            </UiButton>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
