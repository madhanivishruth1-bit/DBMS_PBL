import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DataTable, Field, PageHeader, Panel } from "@/components/kit";
import { db, fmtD, inr, useRows, useRun } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({ meta: [{ title: "Fees — ClubDesk" }, { name: "description", content: "Fee collection and dues." }] }),
  component: Payments,
});

function Payments() {
  const run = useRun();
  const dues = useRows("v_fee_dues", "*", { col: "due", asc: false });
  const pays = useRows("payments", "*, memberships(members(full_name), membership_plans(name))", { col: "paid_on", asc: false });
  const open = dues.data?.filter((d) => Number(d.due) > 0);

  async function collect(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget; const fd = new FormData(f);
    const amt = Number(fd.get("amount"));
    const ms = open?.find((d) => String(d.membership_id) === fd.get("membership_id"));
    if (!ms) return toast.error("Choose a membership with dues");
    if (!(amt > 0)) return toast.error("Amount must be positive");
    if (amt > Number(ms.due)) return toast.error(`Amount exceeds due of ${inr(ms.due)}`);
    const ok = await run(db.from("payments").insert({ membership_id: ms.membership_id, amount: amt, method: fd.get("method"), reference: String(fd.get("reference")).slice(0, 40) || null }), "Payment collected");
    if (ok) f.reset();
  }

  return (
    <>
      <PageHeader kicker="Fee collection" title="Fees" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Outstanding dues">
            <DataTable loading={dues.isLoading} rows={open} empty="All fees are paid up." cols={[
              { key: "full_name", label: "Member", render: (r) => <b>{r.full_name}</b> },
              { key: "plan", label: "Plan" },
              { key: "fee", label: "Fee", align: "right", render: (r) => inr(r.fee) },
              { key: "paid", label: "Paid", align: "right", render: (r) => inr(r.paid) },
              { key: "due", label: "Due", align: "right", render: (r) => <b className="text-destructive">{inr(r.due)}</b> },
            ]} />
          </Panel>
          <Panel title="Payment ledger">
            <DataTable loading={pays.isLoading} rows={pays.data} cols={[
              { key: "paid_on", label: "Date", render: (r) => fmtD(r.paid_on) },
              { key: "m", label: "Member", render: (r) => r.memberships.members.full_name },
              { key: "p", label: "Plan", render: (r) => r.memberships.membership_plans.name },
              { key: "method", label: "Method", render: (r) => r.method.toUpperCase() },
              { key: "reference", label: "Ref" },
              { key: "amount", label: "Amount", align: "right", render: (r) => inr(r.amount) },
            ]} />
          </Panel>
        </div>
        <Panel title="Collect fee">
          <form onSubmit={collect} className="space-y-3">
            <Field label="Membership"><select name="membership_id" className="field"><option value="">Select…</option>{open?.map((d) => <option key={d.membership_id} value={d.membership_id}>{d.full_name} — due {inr(d.due)}</option>)}</select></Field>
            <Field label="Amount (₹)"><input name="amount" type="number" min={1} step="0.01" className="field" /></Field>
            <Field label="Method"><select name="method" className="field"><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option><option value="bank">Bank transfer</option></select></Field>
            <Field label="Reference"><input name="reference" className="field" maxLength={40} /></Field>
            <button className="h-9 w-full rounded-sm bg-primary text-sm font-semibold text-primary-foreground">Record payment</button>
          </form>
        </Panel>
      </div>
    </>
  );
}
