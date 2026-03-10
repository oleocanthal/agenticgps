import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type AssessmentRun = {
  id: string;
  created_at: string;
  company_context: string | null;
  item_count: number;
};

export default async function RunsPage() {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("assessment_runs")
    .select("id, created_at, company_context, item_count")
    .order("created_at", { ascending: false });

  const runs: AssessmentRun[] = data || [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              AgenticGPS
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Past Runs
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Review previously saved assessment runs.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Back to Assessment
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Failed to load runs: {error.message}
          </div>
        )}

        {!error && runs.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/30 p-12 text-center">
            <p className="text-sm text-slate-400">No saved runs yet.</p>
          </div>
        )}

        {runs.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-slate-950/40 text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">
                      Company Context
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr
                      key={run.id}
                      className="border-t border-white/10"
                    >
                      <td className="px-4 py-3 text-slate-300">
                        {new Date(run.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {run.company_context || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {run.item_count}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/runs/${run.id}`}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                        >
                          Open Run
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}