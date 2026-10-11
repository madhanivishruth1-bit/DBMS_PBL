import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DataTable, Field, Options, PageHeader, Panel } from "@/components/kit";
import { db, fmtDT, inr, toISO, useRows, useRun } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/facilities")({
  head: () => ({ meta: [{ title: "Facilities — ClubDesk" }, { name: "description", content: "Facility booking." }] }),
  component: Facilities,
});

function Facilities() {
  const run = useRun();
  const fac = useRows("facilities", "*", { col: "name" });
  const b = useRows("facility_bookings", "*, facilities(name), members(full_name)", { col: "starts_at" });
  const members = useRows("members", "id, full_name", { col: "full_name" });

  async function book(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget; const fd = new FormData(f);
    const st = String(fd.get("starts_at")), en = String(fd.get("ends_at"));
    const att = Number(fd.get("attendees"));
    if (!fd.get("facility_id") || !fd.get("member_id") || !st || !en) return toast.error("Fill in all fields");
    if (new Date(en) <= new Date(st)) return toast.error("End time must be after start time");
    if (!Number.isInteger(att) || att < 1) return toast.error("Attendees must be at least 1");
    const ok = await run(db.from("facility_bookings").insert({
      facility_id: Number(fd.get("facility_id")), member_id: Number(fd.get("member_id")),
      starts_at: toISO(st), ends_at: toISO(en), attendees: att, purpose: String(fd.get("purpose")).slice(0, 120) || null,
    }), "Facility booked");
    if (ok) f.reset();
  }

  return (
    <>
      <PageHeader kicker="Venues" title="Facilities" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {fac.data?.map((x) => (
          <div key={x.id} className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{x.facility_type}</p>
            <h3 className="text-2xl leading-tight">{x.name}</h3>
            <p className="mt-2 text-sm">Cap <b>{x.capacity}</b> · {inr(x.hourly_rate)}/hr</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Bookings">
            <DataTable loading={b.isLoading} rows={b.data} cols={[
              { key: "a", label: "Starts", render: (r) => fmtDT(r.starts_at) },
              { key: "e", label: "Ends", render: (r) => fmtDT(r.ends_at) },
              { key: "f", label: "Facility", render: (r) => <b>{r.facilities.name}</b> },
              { key: "m", label: "Member", render: (r) => r.members.full_name },
              { key: "attendees", label: "People", align: "right" },
              { key: "purpose", label: "Purpose" },
              { key: "x", label: "", render: (r) => <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => run(db.from("facility_bookings").delete().eq("id", r.id), "Booking cancelled")}>cancel</button> },
            ]} />
          </Panel>
        </div>
        <Panel title="Book a facility">
          <form onSubmit={book} className="space-y-3">
            <Field label="Facility"><select name="facility_id" className="field"><Options rows={fac.data} label={(r) => `${r.name} (cap ${r.capacity})`} /></select></Field>
            <Field label="Member"><select name="member_id" className="field"><Options rows={members.data} label={(r) => r.full_name} /></select></Field>
            <Field label="Starts"><input name="starts_at" type="datetime-local" className="field" /></Field>
            <Field label="Ends"><input name="ends_at" type="datetime-local" className="field" /></Field>
            <Field label="Attendees"><input name="attendees" type="number" min={1} defaultValue={1} className="field" /></Field>
            <Field label="Purpose"><input name="purpose" className="field" maxLength={120} /></Field>
            <button className="h-9 w-full rounded-sm bg-primary text-sm font-semibold text-primary-foreground">Book</button>
            <p className="text-xs text-muted-foreground">Checks active membership, capacity and overlapping slots.</p>
          </form>
        </Panel>
      </div>
    </>
  );
}
