import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DataTable, Field, Options, PageHeader, Panel } from "@/components/kit";
import { db, fmtDT, toISO, useRows, useRun } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/training")({
  head: () => ({ meta: [{ title: "Training — ClubDesk" }, { name: "description", content: "Training session schedule." }] }),
  component: Training,
});

function Training() {
  const run = useRun();
  const s = useRows("training_sessions", "*, teams(name), coaches(full_name), facilities(name)", { col: "starts_at" });
  const teams = useRows("teams", "id, name, coach_id", { col: "name" });
  const fac = useRows("facilities", "*", { col: "name" });

  async function schedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget; const fd = new FormData(f);
    const team = teams.data?.find((t) => String(t.id) === fd.get("team_id"));
    const st = String(fd.get("starts_at")), en = String(fd.get("ends_at"));
    if (!team || !fd.get("facility_id") || !st || !en) return toast.error("Fill in team, facility and times");
    if (new Date(en) <= new Date(st)) return toast.error("End time must be after start time");
    const ok = await run(db.from("training_sessions").insert({
      team_id: team.id, coach_id: team.coach_id, facility_id: Number(fd.get("facility_id")),
      starts_at: toISO(st), ends_at: toISO(en), focus: String(fd.get("focus")).slice(0, 120) || null,
    }), "Session scheduled");
    if (ok) f.reset();
  }

  return (
    <>
      <PageHeader kicker="Scheduling" title="Training" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Sessions">
            <DataTable loading={s.isLoading} rows={s.data} cols={[
              { key: "a", label: "Starts", render: (r) => fmtDT(r.starts_at) },
              { key: "b", label: "Ends", render: (r) => fmtDT(r.ends_at) },
              { key: "t", label: "Team", render: (r) => <b>{r.teams.name}</b> },
              { key: "c", label: "Coach", render: (r) => r.coaches?.full_name ?? "—" },
              { key: "f", label: "Facility", render: (r) => r.facilities.name },
              { key: "focus", label: "Focus" },
              { key: "x", label: "", render: (r) => <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => run(db.from("training_sessions").delete().eq("id", r.id), "Session cancelled")}>cancel</button> },
            ]} />
          </Panel>
        </div>
        <Panel title="Schedule session">
          <form onSubmit={schedule} className="space-y-3">
            <Field label="Team"><select name="team_id" className="field"><Options rows={teams.data} label={(r) => r.name} /></select></Field>
            <Field label="Facility"><select name="facility_id" className="field"><Options rows={fac.data} label={(r) => `${r.name} (cap ${r.capacity})`} /></select></Field>
            <Field label="Starts"><input name="starts_at" type="datetime-local" className="field" /></Field>
            <Field label="Ends"><input name="ends_at" type="datetime-local" className="field" /></Field>
            <Field label="Focus"><input name="focus" className="field" maxLength={120} /></Field>
            <button className="h-9 w-full rounded-sm bg-primary text-sm font-semibold text-primary-foreground">Schedule</button>
            <p className="text-xs text-muted-foreground">Blocked if the facility or team is already busy in that slot.</p>
          </form>
        </Panel>
      </div>
    </>
  );
}
