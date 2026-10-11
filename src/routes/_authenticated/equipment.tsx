import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DataTable, Field, Options, PageHeader, Panel, Status } from "@/components/kit";
import { db, fmtD, useRows, useRun } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/equipment")({
  head: () => ({ meta: [{ title: "Equipment — ClubDesk" }, { name: "description", content: "Equipment issue and return." }] }),
  component: Equipment,
});

const today = () => new Date().toISOString().slice(0, 10);

function Equipment() {
  const run = useRun();
  const st = useRows("v_equipment_status", "*", { col: "name" });
  const eq = useRows("equipment", "*", { col: "name" });
  const iss = useRows("equipment_issues", "*, equipment(name), members(full_name)", { col: "issued_on", asc: false });
  const members = useRows("members", "id, full_name", { col: "full_name" });

  async function issue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget; const fd = new FormData(f);
    const qty = Number(fd.get("qty"));
    if (!fd.get("equipment_id") || !fd.get("member_id") || !fd.get("due_on")) return toast.error("Fill in all fields");
    if (!Number.isInteger(qty) || qty < 1) return toast.error("Quantity must be at least 1");
    if (String(fd.get("due_on")) < today()) return toast.error("Due date cannot be in the past");
    const ok = await run(db.from("equipment_issues").insert({ equipment_id: Number(fd.get("equipment_id")), member_id: Number(fd.get("member_id")), qty, due_on: fd.get("due_on") }), "Equipment issued");
    if (ok) f.reset();
  }

  return (
    <>
      <PageHeader kicker="Store room" title="Equipment" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Stock">
            <DataTable loading={st.isLoading} rows={st.data} cols={[
              { key: "name", label: "Item", render: (r) => <b>{r.name}</b> },
              { key: "category", label: "Category" },
              { key: "total_qty", label: "Total", align: "right" },
              { key: "issued_qty", label: "Out", align: "right" },
              { key: "available_qty", label: "Available", align: "right" },
              { key: "overdue_issues", label: "Overdue", align: "right", render: (r) => Number(r.overdue_issues) > 0 ? <b className="text-destructive">{r.overdue_issues}</b> : "0" },
            ]} />
          </Panel>
          <Panel title="Issue log">
            <DataTable loading={iss.isLoading} rows={iss.data} cols={[
              { key: "i", label: "Item", render: (r) => r.equipment.name },
              { key: "m", label: "Member", render: (r) => r.members.full_name },
              { key: "qty", label: "Qty", align: "right" },
              { key: "issued_on", label: "Issued", render: (r) => fmtD(r.issued_on) },
              { key: "due_on", label: "Due", render: (r) => fmtD(r.due_on) },
              { key: "s", label: "Status", render: (r) => r.returned_on ? <Status s="completed" /> : r.due_on < today() ? <Status s="overdue" /> : <Status s="scheduled" /> },
              { key: "x", label: "", render: (r) => !r.returned_on && <button className="text-xs underline" onClick={() => run(db.from("equipment_issues").update({ returned_on: today() }).eq("id", r.id), "Marked returned")}>return</button> },
            ]} />
          </Panel>
        </div>
        <Panel title="Issue equipment">
          <form onSubmit={issue} className="space-y-3">
            <Field label="Item"><select name="equipment_id" className="field"><Options rows={eq.data} label={(r) => `${r.name} (${r.available_qty} left)`} /></select></Field>
            <Field label="Member"><select name="member_id" className="field"><Options rows={members.data} label={(r) => r.full_name} /></select></Field>
            <Field label="Quantity"><input name="qty" type="number" min={1} defaultValue={1} className="field" /></Field>
            <Field label="Return by"><input name="due_on" type="date" min={today()} className="field" /></Field>
            <button className="h-9 w-full rounded-sm bg-primary text-sm font-semibold text-primary-foreground">Issue</button>
            <p className="text-xs text-muted-foreground">Limited by stock and the member's plan allowance.</p>
          </form>
        </Panel>
      </div>
    </>
  );
}
