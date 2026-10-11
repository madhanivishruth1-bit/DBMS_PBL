import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Shell,
});

const nav = [
  ["/dashboard", "Dashboard"],
  ["/members", "Members"],
  ["/teams", "Teams"],
  ["/training", "Training"],
  ["/facilities", "Facilities"],
  ["/tournaments", "Tournaments"],
  ["/payments", "Fees"],
  ["/equipment", "Equipment"],
  ["/reports", "Reports"],
  ["/schema", "Schema & SQL"],
] as const;

function Shell() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <Link to="/" className="px-5 py-5 font-display text-3xl tracking-wider">CLUB<span className="text-sidebar-primary">DESK</span></Link>
        <nav className="flex-1 space-y-0.5 px-2">
          {nav.map(([to, label]) => (
            <Link key={to} to={to} className="block rounded-sm px-3 py-2 text-sm font-medium hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary" }}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4 text-xs">
          <p className="truncate opacity-70">{user.email}</p>
          <button className="mt-2 underline" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}>Sign out</button>
        </div>
      </aside>
      <div className="flex-1">
        <nav className="flex gap-1 overflow-x-auto bg-sidebar p-2 md:hidden">
          {nav.map(([to, label]) => (
            <Link key={to} to={to} className="whitespace-nowrap rounded-sm px-3 py-1.5 text-xs text-sidebar-foreground"
              activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground" }}>{label}</Link>
          ))}
        </nav>
        <main className="mx-auto max-w-7xl p-6 md:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
