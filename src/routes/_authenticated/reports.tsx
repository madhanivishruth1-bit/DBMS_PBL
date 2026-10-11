import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DataTable, PageHeader, Panel, Status, type Col } from "@/components/kit";
import { fmtD, inr, useRows, type Row } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — ClubDesk" }, { name: "description", content: "Club reports." }] }),
  component: Reports,
});

const tabs = ["Standings", "Memberships", "Fee dues", "Facility use", "Player performance", "Equipment"] as const;

function Standings() {
  const s = useRows("v_standings");
  const byT: Record<string, Row[]> = {};
  s.data?.forEach((r) => (byT[r.tournament] ??= []).push(r));
  return (
    <div className="space-y-6">
      {Object.entries(byT).map(([t, rows]) => (
        <Panel key={t} title={t}>
          <DataTable rows={[...rows].sort((a, b) => b.points - a.points || b.diff - a.diff)} cols={[
            { key: "team", label: "Team", render: (r) => <b>{r.team}</b> },
            ...["played", "won", "drawn", "lost", "scored", "conceded", "diff"].map((k) => ({ key: k, label: k.slice(0, 3).toUpperCase(), align: "right" as const })),
            { key: "points", label: "PTS", align: "right", render: (r) => <span className="scoreboard text-xl text-primary">{r.points}</span> },
          ]} />
        </Panel>
      ))}
    </div>
  );
}

function Simple({ view, cols, order }: { view: string; cols: Col[]; order?: { col: string; asc?: boolean } }) {
  const r = useRows(view, "*", order);
  return <Panel title="Report"><DataTable loading={r.isLoading} rows={r.data} cols={cols} /></Panel>;
}

function Reports() {
  const [t, setT] = useState<(typeof tabs)[number]>("Standings");
  return (
    <>
      <PageHeader kicker="Analytics" title="Reports">
        <button onClick={() => window.print()} className="rounded-sm border border-foreground px-3 py-1.5 text-sm font-semibold">Print</button>
      </PageHeader>
      <div className="mb-6 flex flex-wrap gap-1">
        {tabs.map((x) => (
          <button key={x} onClick={() => setT(x)} className={`rounded-sm px-3 py-1.5 text-sm font-semibold ${t === x ? "bg-foreground text-background" : "bg-secondary"}`}>{x}</button>
        ))}
      </div>
      {t === "Standings" && <Standings />}
      {t === "Memberships" && <Simple view="v_membership_status" order={{ col: "days_left" }} cols={[
        { key: "full_name", label: "Member" }, { key: "plan", label: "Plan" },
        { key: "start_date", label: "Start", render: (r) => fmtD(r.start_date) }, { key: "end_date", label: "End", render: (r) => fmtD(r.end_date) },
        { key: "days_left", label: "Days left", align: "right" }, { key: "s", label: "Status", render: (r) => <Status s={r.effective_status} /> },
      ]} />}
      {t === "Fee dues" && <Simple view="v_fee_dues" order={{ col: "due", asc: false }} cols={[
        { key: "full_name", label: "Member" }, { key: "plan", label: "Plan" },
        { key: "fee", label: "Fee", align: "right", render: (r) => inr(r.fee) }, { key: "paid", label: "Paid", align: "right", render: (r) => inr(r.paid) },
        { key: "due", label: "Due", align: "right", render: (r) => <b className={Number(r.due) > 0 ? "text-destructive" : "text-success"}>{inr(r.due)}</b> },
      ]} />}
      {t === "Facility use" && <Simple view="v_facility_usage" order={{ col: "hours_used", asc: false }} cols={[
        { key: "name", label: "Facility" }, { key: "facility_type", label: "Type" }, { key: "training_slots", label: "Training", align: "right" },
        { key: "booking_slots", label: "Bookings", align: "right" }, { key: "fixture_slots", label: "Fixtures", align: "right" },
        { key: "total_slots", label: "Total", align: "right" }, { key: "hours_used", label: "Hours", align: "right" },
      ]} />}
      {t === "Player performance" && <Simple view="v_player_performance" order={{ col: "total_points", asc: false }} cols={[
        { key: "full_name", label: "Player" }, { key: "matches", label: "Matches", align: "right" }, { key: "total_points", label: "Total pts", align: "right" },
        { key: "avg_points", label: "Avg", align: "right" }, { key: "best", label: "Best", align: "right" },
      ]} />}
      {t === "Equipment" && <Simple view="v_equipment_status" order={{ col: "name" }} cols={[
        { key: "name", label: "Item" }, { key: "category", label: "Category" }, { key: "total_qty", label: "Total", align: "right" },
        { key: "issued_qty", label: "Issued", align: "right" }, { key: "available_qty", label: "Available", align: "right" }, { key: "overdue_issues", label: "Overdue", align: "right" },
      ]} />}
    </>
  );
}
