import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/schema")({
  head: () => ({ meta: [{ title: "Schema & SQL — ClubDesk" }, { name: "description", content: "Relational schema, normalization and SQL." }] }),
  component: Schema,
});

const tables: [string, string][] = [
  ["membership_plans", "id PK · name UNIQUE · duration_months CHECK>0 · fee CHECK>=0 · max_equipment DEFAULT 2"],
  ["members", "id PK · full_name NOT NULL · email UNIQUE CHECK(format) · phone CHECK · gender CHECK(M/F/O) · join_date DEFAULT today"],
  ["memberships", "id PK · member_id FK · plan_id FK · start_date · end_date CHECK(end>start) · status CHECK"],
  ["sports", "id PK · name UNIQUE · max_team_size CHECK>0"],
  ["coaches", "id PK · email UNIQUE · sport_id FK · experience_years CHECK>=0"],
  ["facilities", "id PK · name UNIQUE · capacity CHECK>0 · hourly_rate"],
  ["teams", "id PK · sport_id FK · coach_id FK · UNIQUE(name, sport_id)"],
  ["team_members", "PK(team_id, member_id) · jersey_no CHECK 0–99 · UNIQUE(team_id, jersey_no)"],
  ["training_sessions", "id PK · team_id FK · coach_id FK · facility_id FK · CHECK(ends>starts)"],
  ["facility_bookings", "id PK · facility_id FK · member_id FK · attendees CHECK>0"],
  ["tournaments", "id PK · name UNIQUE · sport_id FK · status CHECK"],
  ["tournament_participants", "PK(tournament_id, team_id)"],
  ["fixtures", "id PK · tournament_id FK · home/away FK · CHECK(home<>away) · facility_id FK"],
  ["results", "fixture_id PK/FK · home_score, away_score CHECK 0–500"],
  ["player_stats", "PK(fixture_id, member_id) · points CHECK>=0"],
  ["payments", "id PK · membership_id FK · amount CHECK>0 · method CHECK"],
  ["equipment", "id PK · name UNIQUE · CHECK(available_qty <= total_qty)"],
  ["equipment_issues", "id PK · equipment_id FK · member_id FK · qty CHECK>0 · CHECK(due>=issued)"],
];

const rules = [
  "No overlapping facility use across training, bookings and fixtures (trigger facility_conflict).",
  "No overlapping team schedule across training and fixtures (trigger team_conflict).",
  "Active membership required to join a team, book a facility or borrow equipment.",
  "Capacity limits: booking attendees and training squad size ≤ facility capacity; roster ≤ sport max.",
  "Valid scores 0–500; results blocked on cancelled fixtures; fixture auto-completes on result.",
  "Equipment: stock decremented atomically on issue, restored on return; open items ≤ plan allowance.",
  "Payments can never exceed the membership fee due.",
  "Fixture teams must be registered participants; participant sport must match tournament sport.",
];

const queries: [string, string][] = [
  ["Join — upcoming fixtures", `SELECT f.starts_at, h.name AS home, a.name AS away, fa.name AS venue
FROM fixtures f
JOIN teams h ON h.id = f.home_team_id
JOIN teams a ON a.id = f.away_team_id
JOIN facilities fa ON fa.id = f.facility_id
WHERE f.starts_at > now() AND f.status = 'scheduled'
ORDER BY f.starts_at;`],
  ["Aggregate — revenue by plan", `SELECT p.name, count(DISTINCT ms.id) AS memberships, sum(pay.amount) AS collected
FROM membership_plans p
JOIN memberships ms ON ms.plan_id = p.id
LEFT JOIN payments pay ON pay.membership_id = ms.id
GROUP BY p.name HAVING sum(pay.amount) > 0
ORDER BY collected DESC;`],
  ["Nested — members above average points", `SELECT full_name, total_points FROM v_player_performance
WHERE total_points > (SELECT avg(total_points) FROM v_player_performance);`],
  ["Nested — members with no team", `SELECT full_name FROM members m
WHERE NOT EXISTS (SELECT 1 FROM team_members tm WHERE tm.member_id = m.id);`],
  ["View — standings", `SELECT team, played, won, drawn, lost, diff, points
FROM v_standings WHERE tournament_id = 2
ORDER BY points DESC, diff DESC;`],
  ["Transaction — issue equipment", `BEGIN;
  INSERT INTO equipment_issues (equipment_id, member_id, qty, due_on)
  VALUES (2, 4, 1, current_date + 7);   -- trigger checks membership, limit, stock
COMMIT;  -- any RAISE EXCEPTION rolls back the stock update too`],
];

function Schema() {
  return (
    <>
      <PageHeader kicker="Database design" title="Schema & SQL" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Relational schema (18 tables)">
          <ul className="space-y-2 text-sm">
            {tables.map(([t, d]) => <li key={t}><code className="font-bold text-primary">{t}</code> <span className="text-muted-foreground">— {d}</span></li>)}
          </ul>
        </Panel>
        <div className="space-y-6">
          <Panel title="Normalization to 3NF">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li><b>1NF</b> — atomic columns; repeating groups (team rosters, participants, stats) moved to junction tables.</li>
              <li><b>2NF</b> — composite-key tables (team_members, player_stats, tournament_participants) hold only attributes of the whole key.</li>
              <li><b>3NF</b> — no transitive dependencies: plan fee lives in membership_plans, not memberships/payments; dues are derived in a view, not stored.</li>
            </ul>
          </Panel>
          <Panel title="Business rules enforced in the database">
            <ul className="list-disc space-y-1 pl-5 text-sm">{rules.map((r) => <li key={r}>{r}</li>)}</ul>
          </Panel>
          <Panel title="Indexes">
            <p className="text-sm text-muted-foreground">lower(full_name) on members; (facility_id, starts_at) on training, bookings, fixtures; (team_id, starts_at); memberships(member_id, end_date); payments(membership_id); partial index on open equipment issues.</p>
          </Panel>
        </div>
      </div>
      <h2 className="mb-3 mt-10 text-3xl">Sample SQL</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {queries.map(([t, q]) => (
          <div key={t} className="panel overflow-hidden">
            <p className="border-b border-border px-4 py-2 text-xs font-bold uppercase tracking-wider">{t}</p>
            <pre className="overflow-x-auto bg-pitch p-4 text-xs leading-relaxed text-pitch-foreground">{q}</pre>
          </div>
        ))}
      </div>
    </>
  );
}
