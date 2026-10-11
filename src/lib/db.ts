import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Loose-typed accessor so generic helpers can address any table/view by name.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

export function useRows(table: string, select = "*", order?: { col: string; asc?: boolean }) {
  return useQuery({
    queryKey: [table, select, order?.col, order?.asc],
    queryFn: async () => {
      let q = db.from(table).select(select);
      if (order) q = q.order(order.col, { ascending: order.asc ?? true });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
}

export function useRun() {
  const qc = useQueryClient();
  return async (p: PromiseLike<{ error: { message: string } | null }>, ok: string) => {
    const { error } = await p;
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success(ok);
    await qc.invalidateQueries();
    return true;
  };
}

export const fmtDT = (s?: string) =>
  s ? new Date(s).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
export const fmtD = (s?: string) => (s ? new Date(s).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—");
export const inr = (n: number | string) => "₹" + Number(n ?? 0).toLocaleString("en-IN");
export const toISO = (local: string) => new Date(local).toISOString();
