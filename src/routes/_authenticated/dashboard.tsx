import { createFileRoute } from "@tanstack/react-router";
import { DataTable, PageHeader, Panel, Stat, Status } from "@/components/kit";
import { fmtDT, inr, useRows } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ClubDesk" }, { name: "description", content: "Club overview." }] }),
  component: Dashboard,
});

function Dashboard() {
  const ms = useRows("v_membership_status");
  const dues = useRows("v_fee_dues");
  const fx = useRows("fixtures", "*, tournaments(name), home:teams!fixtures_home_team_id_fkey(name), away:teams!fixtures_away_team_id_fkey(name), facilities(name), results(*)", { col: "starts_at" });
  const eq = useRows("v_equipment_status");
  const active = ms.data?.filter((m) => m.effective_status === "active").length ?? 0;
  const totalDue = dues.data?.reduce((a, d) => a + Number(d.due), 0) ?? 0;
  const overdue = eq.data?.reduce((a, e) => a + Number(e.overdue_issues), 0) ?? 0;
  const upcoming = fx.data?.filter((f) => new Date(f.starts_at) > new Date() && f.status === "scheduled");
  const recent = fx.data?.filter((f) => f.results).slice(-5).reverse();

  return (
    <>
      <PageHeader kicker="Matchday overview" title="Dashboard" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Active members" value={`${active}/${ms.data?.length ?? 0}`} />
        <Stat label="Upcoming fixtures" value={upcoming?.length ?? 0} />
        <Stat label="Fees outstanding" value={inr(totalDue)} />
        <Stat label="Overdue equipment" value={overdue} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Next up">
          <DataTable loading={fx.isLoading} rows={upcoming} cols={[
            { key: "when", label: "When", render: (r) => fmtDT(r.starts_at) },
            { key: "m", label: "Match", render: (r) => `${r.home.name} vs ${r.away.name}` },
            { key: "v", label: "Venue", render: (r) => r.facilities.name },
          ]} />
        </Panel>
        <Panel title="Latest results">
          <DataTable loading={fx.isLoading} rows={recent} cols={[
            { key: "t", label: "Tournament", render: (r) => r.tournaments.name },
            { key: "m", label: "Match", render: (r) => <span className="font-semibold">{r.home.name} <span className="scoreboard text-xl text-primary">{r.results.home_score}–{r.results.away_score}</span> {r.away.name}</span> },
            { key: "s", label: "", render: (r) => <Status s={r.status} /> },
          ]} />
        </Panel>
      </div>
    </>
  );
}
