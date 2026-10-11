import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff sign in — ClubDesk" },
      { name: "description", content: "Sign in to manage your sports club." },
      { property: "og:title", content: "Staff sign in — ClubDesk" },
      { property: "og:description", content: "Sign in to manage your sports club." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = schema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!p.success) return toast.error(p.error.issues[0].message);
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword(p.data);
      setBusy(false);
      if (error) return toast.error(error.message);
      nav({ to: "/dashboard" });
    } else {
      const { data, error } = await supabase.auth.signUp({ ...p.data, options: { emailRedirectTo: window.location.origin + "/dashboard" } });
      setBusy(false);
      if (error) return toast.error(error.message);
      if (data.session) nav({ to: "/dashboard" });
      else toast.success("Check your email to confirm your account.");
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return toast.error(String(r.error.message ?? r.error));
    if (r.redirected) return;
    nav({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pitch px-4">
      <div className="w-full max-w-sm rounded-sm bg-card p-8">
        <h1 className="text-5xl leading-none">CLUB<span className="text-primary">DESK</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">{mode === "in" ? "Staff sign in" : "Create a staff account"}</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input name="email" type="email" placeholder="Email" className="field" required />
          <input name="password" type="password" placeholder="Password" className="field" required />
          <button disabled={busy} className="h-10 w-full rounded-sm bg-primary font-semibold text-primary-foreground disabled:opacity-50">
            {mode === "in" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <button onClick={google} className="mt-3 h-10 w-full rounded-sm border border-border font-semibold">Continue with Google</button>
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-sm text-muted-foreground underline">
          {mode === "in" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
