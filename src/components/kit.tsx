import type { ReactNode } from "react";
import type { Row } from "@/lib/db";

export function PageHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{kicker}</p>
        <h1 className="text-5xl leading-none">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="panel">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="text-xl">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export type Col = { key: string; label: string; render?: (r: Row) => ReactNode; align?: "right" };

export function DataTable({ cols, rows, loading, empty = "No records yet." }: { cols: Col[]; rows?: Row[]; loading?: boolean; empty?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            {cols.map((c) => (
              <th key={c.key} className={`px-2 py-2 font-semibold ${c.align === "right" ? "text-right" : ""}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={cols.length} className="px-2 py-6 text-center text-muted-foreground">Loading…</td></tr>
          )}
          {!loading && rows?.length === 0 && (
            <tr><td colSpan={cols.length} className="px-2 py-6 text-center text-muted-foreground">{empty}</td></tr>
          )}
          {rows?.map((r, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0 hover:bg-muted/60">
              {cols.map((c) => (
                <td key={c.key} className={`px-2 py-2 ${c.align === "right" ? "text-right tabular-nums" : ""}`}>
                  {c.render ? c.render(r) : String(r[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

const tone: Record<string, string> = {
  active: "bg-accent text-accent-foreground",
  completed: "bg-accent text-accent-foreground",
  ongoing: "bg-primary text-primary-foreground",
  scheduled: "bg-secondary text-secondary-foreground",
  upcoming: "bg-secondary text-secondary-foreground",
  expired: "bg-destructive text-destructive-foreground",
  cancelled: "bg-muted text-muted-foreground",
  overdue: "bg-destructive text-destructive-foreground",
  none: "bg-muted text-muted-foreground",
};
export function Status({ s }: { s: string }) {
  return <span className={`chip ${tone[s] ?? "bg-muted text-muted-foreground"}`}>{s}</span>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="panel p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="scoreboard mt-1 text-5xl leading-none">{value}</p>
    </div>
  );
}

export function Options({ rows, label, placeholder = "Select…" }: { rows?: Row[]; label: (r: Row) => string; placeholder?: string }) {
  return (
    <>
      <option value="">{placeholder}</option>
      {rows?.map((r) => (
        <option key={r.id} value={r.id}>{label(r)}</option>
      ))}
    </>
  );
}
