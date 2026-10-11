import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClubDesk — Run your sports club from one desk" },
      { name: "description", content: "Membership, team formation, training, facility booking, fixtures, results, fees and equipment for sports clubs." },
      { property: "og:title", content: "ClubDesk — Sports Club & Tournament Manager" },
      { property: "og:description", content: "One database for members, teams, fixtures, standings, fees and equipment." },
    ],
  }),
  component: Landing,
});

const features = [
  ["Members", "Plans, renewals, active-membership checks"],
  ["Teams", "Rosters with squad-size limits"],
  ["Training", "Clash-free coach & facility schedules"],
  ["Facilities", "Bookings with capacity control"],
  ["Tournaments", "Fixtures, results, live standings"],
  ["Fees", "Collection with dues tracking"],
  ["Equipment", "Issue & return with plan limits"],
  ["Reports", "Performance, usage and dues"],
];

function Landing() {
  return (
    <div className="min-h-screen bg-pitch text-pitch-foreground">
      <header className="relative overflow-hidden">
        <img src={hero} alt="Floodlit stadium at night" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-pitch via-pitch/60 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-8">
          <nav className="flex items-center justify-between">
            <span className="font-display text-3xl tracking-wider">CLUB<span className="text-primary">DESK</span></span>
            <Link to="/auth" className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Staff sign in</Link>
          </nav>
          <div className="mt-40 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Sports club &amp; tournament management</p>
            <h1 className="mt-3 text-7xl leading-[0.9] md:text-9xl">Every fixture.<br />Every member.<br />One desk.</h1>
            <Link to="/dashboard" className="mt-8 inline-block rounded-sm bg-primary px-6 py-3 font-semibold text-primary-foreground">Open the club desk →</Link>
          </div>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-pitch-foreground/15 px-0 md:grid-cols-4">
        {features.map(([t, d]) => (
          <div key={t} className="bg-pitch p-6">
            <h3 className="text-3xl text-primary">{t}</h3>
            <p className="mt-1 text-sm opacity-75">{d}</p>
          </div>
        ))}
      </section>
      <footer className="py-10 text-center text-xs uppercase tracking-widest opacity-50">ClubDesk · relational DB in 3NF</footer>
    </div>
  );
}
