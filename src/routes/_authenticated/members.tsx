import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { DataTable, Field, Options, PageHeader, Panel, Status } from "@/components/kit";
import { db, fmtD, inr, useRows, useRun } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/members")({
  head: () => ({ meta: [{ title: "Members — ClubDesk" }, { name: "description", content: "Member registry and memberships." }] }),
  component: Members,
});

const memberSchema = z.object({
  full_name: z.string().trim().min(2, "Name too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().regex(/^[0-9+\- ]{7,15}$/, "Invalid phone").or(z.literal("")),
  date_of_birth: z.string().optional(),
  gender: z.enum(["M", "F", "O"]),
});

function addMonths(d: string, m: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + m);
  return x.toISOString().slice(0, 10);
}

function Members() {
  const run = useRun();
  const [q, setQ] = useState("");
  const ms = useRows("v_membership_status", "*", { col: "full_name" });
  const plans = useRows("membership_plans", "*", { col: "fee" });
  const members = useRows("members", "id, full_name", { col: "full_name" });
  const rows = ms.data?.filter((r) => (r.full_name + r.email).toLowerCase().includes(q.toLowerCase()));

  async function addMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const p = memberSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!p.success) return toast.error(p.error.issues[0].message);
    const v = { ...p.data, phone: p.data.phone || null, date_of_birth: p.data.date_of_birth || null };
    if (await run(db.from("members").insert(v), "Member registered")) form.reset();
  }

  async function addMembership(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const plan = plans.data?.find((p) => String(p.id) === fd.get("plan_id"));
    const start = String(fd.get("start_date"));
    if (!fd.get("member_id") || !plan || !start) return toast.error("Choose member, plan and start date");
    const ok = await run(
      db.from("memberships").insert({ member_id: Number(fd.get("member_id")), plan_id: plan.id, start_date: start, end_date: addMonths(start, plan.duration_months) }),
      "Membership started",
    );
    if (ok) form.reset();
  }

  return (
    <>
      <PageHeader kicker="Registry" title="Members">
        <input placeholder="Search name or email…" className="field w-64" value={q} onChange={(e) => setQ(e.target.value)} />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="All members">
            <DataTable loading={ms.isLoading} rows={rows} cols={[
              { key: "full_name", label: "Name", render: (r) => <><div className="font-semibold">{r.full_name}</div><div className="text-xs text-muted-foreground">{r.email}</div></> },
              { key: "plan", label: "Plan" },
              { key: "end_date", label: "Valid until", render: (r) => fmtD(r.end_date) },
              { key: "days_left", label: "Days left", align: "right" },
              { key: "s", label: "Status", render: (r) => <Status s={r.effective_status} /> },
            ]} />
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Register member">
            <form onSubmit={addMember} className="space-y-3">
              <Field label="Full name"><input name="full_name" className="field" required maxLength={100} /></Field>
              <Field label="Email"><input name="email" type="email" className="field" required /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Phone"><input name="phone" className="field" /></Field>
                <Field label="Gender"><select name="gender" className="field"><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option></select></Field>
              </div>
              <Field label="Date of birth"><input name="date_of_birth" type="date" className="field" /></Field>
              <button className="h-9 w-full rounded-sm bg-primary text-sm font-semibold text-primary-foreground">Register</button>
            </form>
          </Panel>
          <Panel title="New membership">
            <form onSubmit={addMembership} className="space-y-3">
              <Field label="Member"><select name="member_id" className="field"><Options rows={members.data} label={(r) => r.full_name} /></select></Field>
              <Field label="Plan"><select name="plan_id" className="field"><Options rows={plans.data} label={(r) => `${r.name} · ${inr(r.fee)}`} /></select></Field>
              <Field label="Start date"><input name="start_date" type="date" className="field" defaultValue={new Date().toISOString().slice(0, 10)} /></Field>
              <button className="h-9 w-full rounded-sm bg-foreground text-sm font-semibold text-background">Start membership</button>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
