import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, Field, Options, PageHeader, Panel, Status } from "@/components/kit";
import { db, fmtD, fmtDT, toISO, useRows, useRun, type Row } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/tournaments")({
  head: () => ({ meta: [{ title: "Tournaments — ClubDesk" }, { name: "description", content: "Tournaments, fixtures and results." }] }),
  component: Tournaments,
});

function ResultForm({ fx, onDone }: { fx: Row; onDone: () => void }) {
  const run = useRun();
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const h = Number(fd.get("h")), a = Number(fd.get("a"));
    if (![h, a].every((n) => Number.isInteger(n) && n >= 0 && n <= 500)) return toast.error("Scores must be whole numbers 0–500");
    if (await run(db.from("results").upsert({ fixture_id: fx.id, home_score: h, away_score: a }), "Result recorded")) onDone();
  }
  return (
    <form onSubmit={save} className="flex items-center gap-1">
      <input name="h" type="number" min={0} max={500} defaultValue={fx.results?.home_score} className="field w-16" />
      <span>–</span>
      <input name="a" type="number" min={0} max={500} defaultValue={fx.results?.away_score} className="field w-16" />
      <button className="h-9 rounded-sm bg-primary px-3 text-xs font-semibold text-primary-foreground">Save</button>
    </form>
  );
}

function Tournaments() {
  const run = useRun();
  const [editing, setEditing] = useState<number | null>(null);
  const tours = useRows("tournaments", "*, sports(name), tournament_participants(team_id, teams(name))", { col: "start_date" });
  const sports = useRows("sports", "*", { col: "name" });
  const teams = useRows("teams", "id, name, sport_id", { col: "name" });
  const fac = useRows("facilities", "*", { col: "name" });
  const fx = useRows("fixtures", "*, tournaments(name), home:teams!fixtures_home_team_id_fkey(name), away:teams!fixtures_away_team_id_fkey(name), facilities(name), results(*)", { col: "starts_at" });
  const [tid, setTid] = useState("");
  const tour = tours.data?.find((t) => String(t.id) === tid);
  const participants = tour?.tournament_participants.map((p: Row) => ({ id: p.team_id, name: p.teams.name }));

  async function createTour(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget; const fd = new FormData(f);
    const name = String(fd.get("name")).trim();
    if (name.length < 3 || !fd.get("sport_id") || !fd.get("start_date") || !fd.get("end_date")) return toast.error("All fields are required");
    if (String(fd.get("end_date")) < String(fd.get("start_date"))) return toast.error("End date must be on/after start date");
    if (await run(db.from("tournaments").insert({ name, sport_id: Number(fd.get("sport_id")), start_date: fd.get("start_date"), end_date: fd.get("end_date") }), "Tournament created")) f.reset();
  }
  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!tid || !fd.get("team_id")) return toast.error("Pick a tournament and team");
    await run(db.from("tournament_participants").insert({ tournament_id: Number(tid), team_id: Number(fd.get("team_id")) }), "Team registered");
  }
  async function createFixture(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget; const fd = new FormData(f);
    const h = fd.get("home"), a = fd.get("away"), st = String(fd.get("starts_at")), en = String(fd.get("ends_at"));
    if (!tid || !h || !a || !fd.get("facility_id") || !st || !en) return toast.error("Fill in all fixture fields");
    if (h === a) return toast.error("A team cannot play itself");
    if (new Date(en) <= new Date(st)) return toast.error("End must be after start");
    const ok = await run(db.from("fixtures").insert({ tournament_id: Number(tid), home_team_id: Number(h), away_team_id: Number(a), facility_id: Number(fd.get("facility_id")), starts_at: toISO(st), ends_at: toISO(en) }), "Fixture created");
    if (ok) f.reset();
  }

  const eligible = teams.data?.filter((t) => tour && t.sport_id === tour.sport_id);

  return (
    <>
      <PageHeader kicker="Competition" title="Tournaments" />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {tours.data?.map((t) => (
          <div key={t.id} className="panel p-4">
            <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">{t.sports.name}</span><Status s={t.status} /></div>
            <h3 className="mt-1 text-3xl leading-tight">{t.name}</h3>
            <p className="text-sm text-muted-foreground">{fmtD(t.start_date)} → {fmtD(t.end_date)}</p>
            <p className="mt-2 text-sm">{t.tournament_participants.map((p: Row) => p.teams.name).join(" · ") || "No teams yet"}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Fixtures & results">
            <DataTable loading={fx.isLoading} rows={fx.data} cols={[
              { key: "w", label: "When", render: (r) => fmtDT(r.starts_at) },
              { key: "t", label: "Tournament", render: (r) => r.tournaments.name },
              { key: "m", label: "Match", render: (r) => <b>{r.home.name} vs {r.away.name}</b> },
              { key: "v", label: "Venue", render: (r) => r.facilities.name },
              { key: "s", label: "Score", render: (r) => editing === r.id ? <ResultForm fx={r} onDone={() => setEditing(null)} /> :
                r.results ? <span className="scoreboard text-2xl text-primary">{r.results.home_score}–{r.results.away_score}</span> : <Status s={r.status} /> },
              { key: "x", label: "", render: (r) => r.status !== "cancelled" && (
                <span className="flex gap-2 text-xs">
                  <button className="underline" onClick={() => setEditing(editing === r.id ? null : r.id)}>{r.results ? "edit" : "enter result"}</button>
                  {!r.results && <button className="text-muted-foreground hover:text-destructive" onClick={() => run(db.from("fixtures").update({ status: "cancelled" }).eq("id", r.id), "Fixture cancelled")}>cancel</button>}
                </span>) },
            ]} />
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Fixture creation">
            <Field label="Tournament"><select className="field" value={tid} onChange={(e) => setTid(e.target.value)}><Options rows={tours.data} label={(r) => r.name} /></select></Field>
            {tour && (
              <>
                <form onSubmit={register} className="mt-3 flex items-end gap-2">
                  <div className="flex-1"><Field label="Register team"><select name="team_id" className="field"><Options rows={eligible} label={(r) => r.name} /></select></Field></div>
                  <button className="h-9 rounded-sm bg-foreground px-3 text-xs font-semibold text-background">Add</button>
                </form>
                <form onSubmit={createFixture} className="mt-4 space-y-3 border-t border-border pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Home"><select name="home" className="field"><Options rows={participants} label={(r) => r.name} /></select></Field>
                    <Field label="Away"><select name="away" className="field"><Options rows={participants} label={(r) => r.name} /></select></Field>
                  </div>
                  <Field label="Venue"><select name="facility_id" className="field"><Options rows={fac.data} label={(r) => r.name} /></select></Field>
                  <Field label="Starts"><input name="starts_at" type="datetime-local" className="field" /></Field>
                  <Field label="Ends"><input name="ends_at" type="datetime-local" className="field" /></Field>
                  <button className="h-9 w-full rounded-sm bg-primary text-sm font-semibold text-primary-foreground">Create fixture</button>
                </form>
              </>
            )}
          </Panel>
          <Panel title="New tournament">
            <form onSubmit={createTour} className="space-y-3">
              <Field label="Name"><input name="name" className="field" maxLength={80} /></Field>
              <Field label="Sport"><select name="sport_id" className="field"><Options rows={sports.data} label={(r) => r.name} /></select></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Start"><input name="start_date" type="date" className="field" /></Field>
                <Field label="End"><input name="end_date" type="date" className="field" /></Field>
              </div>
              <button className="h-9 w-full rounded-sm bg-foreground text-sm font-semibold text-background">Create</button>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
