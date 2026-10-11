import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Field, Options, PageHeader, Panel } from "@/components/kit";
import { db, useRows, useRun } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/teams")({
  head: () => ({ meta: [{ title: "Teams — ClubDesk" }, { name: "description", content: "Team formation and rosters." }] }),
  component: Teams,
});

function Teams() {
  const run = useRun();
  const teams = useRows("teams", "*, sports(name, max_team_size), coaches(full_name), team_members(jersey_no, is_captain, members(id, full_name))", { col: "name" });
  const sports = useRows("sports", "*", { col: "name" });
  const coaches = useRows("coaches", "*", { col: "full_name" });
  const members = useRows("members", "id, full_name", { col: "full_name" });

  async function createTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget; const fd = new FormData(f);
    const name = String(fd.get("name")).trim();
    if (name.length < 2 || !fd.get("sport_id")) return toast.error("Team name and sport are required");
    if (await run(db.from("teams").insert({ name, sport_id: Number(fd.get("sport_id")), coach_id: fd.get("coach_id") ? Number(fd.get("coach_id")) : null }), "Team created")) f.reset();
  }

  async function addPlayer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget; const fd = new FormData(f);
    if (!fd.get("team_id") || !fd.get("member_id")) return toast.error("Choose a team and a member");
    const jersey = fd.get("jersey_no") ? Number(fd.get("jersey_no")) : null;
    if (jersey !== null && (jersey < 0 || jersey > 99)) return toast.error("Jersey number must be 0–99");
    if (await run(db.from("team_members").insert({ team_id: Number(fd.get("team_id")), member_id: Number(fd.get("member_id")), jersey_no: jersey, is_captain: fd.get("is_captain") === "on" }), "Player added")) f.reset();
  }

  return (
    <>
      <PageHeader kicker="Team formation" title="Teams" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {teams.data?.map((t) => (
            <div key={t.id} className="panel overflow-hidden">
              <div className="flex items-baseline justify-between bg-pitch px-4 py-3 text-pitch-foreground">
                <h3 className="text-2xl">{t.name}</h3>
                <span className="text-xs uppercase tracking-wider opacity-70">{t.sports.name} · {t.team_members.length}/{t.sports.max_team_size}</span>
              </div>
              <div className="p-4 text-sm">
                <p className="mb-2 text-xs text-muted-foreground">Coach: {t.coaches?.full_name ?? "Unassigned"}</p>
                <ul className="space-y-1">
                  {t.team_members.map((tm: { jersey_no: number; is_captain: boolean; members: { id: number; full_name: string } }) => (
                    <li key={tm.members.id} className="flex items-center justify-between">
                      <span><span className="scoreboard mr-2 inline-block w-6 text-lg text-primary">{tm.jersey_no ?? "–"}</span>{tm.members.full_name}</span>
                      <span className="flex items-center gap-2">
                        {tm.is_captain && <span className="chip bg-primary text-primary-foreground">C</span>}
                        <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => run(db.from("team_members").delete().eq("team_id", t.id).eq("member_id", tm.members.id), "Player removed")}>remove</button>
                      </span>
                    </li>
                  ))}
                  {t.team_members.length === 0 && <li className="text-muted-foreground">No players yet</li>}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <Panel title="Create team">
            <form onSubmit={createTeam} className="space-y-3">
              <Field label="Team name"><input name="name" className="field" maxLength={60} /></Field>
              <Field label="Sport"><select name="sport_id" className="field"><Options rows={sports.data} label={(r) => r.name} /></select></Field>
              <Field label="Coach"><select name="coach_id" className="field"><Options rows={coaches.data} label={(r) => r.full_name} placeholder="None" /></select></Field>
              <button className="h-9 w-full rounded-sm bg-primary text-sm font-semibold text-primary-foreground">Create</button>
            </form>
          </Panel>
          <Panel title="Add player">
            <form onSubmit={addPlayer} className="space-y-3">
              <Field label="Team"><select name="team_id" className="field"><Options rows={teams.data} label={(r) => r.name} /></select></Field>
              <Field label="Member"><select name="member_id" className="field"><Options rows={members.data} label={(r) => r.full_name} /></select></Field>
              <Field label="Jersey #"><input name="jersey_no" type="number" min={0} max={99} className="field" /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_captain" /> Captain</label>
              <button className="h-9 w-full rounded-sm bg-foreground text-sm font-semibold text-background">Add to roster</button>
              <p className="text-xs text-muted-foreground">Requires an active membership; squad size is capped per sport.</p>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
