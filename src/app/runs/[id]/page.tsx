import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type RunPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type AssessmentRun = {
  id: string;
  created_at: string;
  company_context: string | null;
  item_count: number;
  settings_json: any;
};

type AssessmentResult = {
  id: string;
  name: string;
  type: string;
  bri_score: number;
  risk_band: string;
  strategic_value: number;
  strategic_value_label: string;
  executive_action_now: string | null;
  h1_strategy: string | null;
  h2_strategy: string | null;
  h3_strategy: string | null;
  reasoning: string | null;
  confidence: number | null;
  parameter_scores: Record<string, number>;
};

function riskBandPill(riskBand: string) {
  switch (riskBand) {
    case "Severe":
      return "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-400/30";
    case "High":
      return "bg-orange-500/10 text-orange-300 ring-1 ring-inset ring-orange-400/30";
    case "Moderate":
      return "bg-yellow-500/10 text-yellow-300 ring-1 ring-inset ring-yellow-400/30";
    case "Low":
      return "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/30";
    default:
      return "bg-slate-500/10 text-slate-300 ring-1 ring-inset ring-slate-400/30";
  }
}

export default async function RunDetailPage({ params }: RunPageProps) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data: run, error: runError } = await supabase
    .from("assessment_runs")
    .select("id, created_at, company_context, item_count, settings_json")
    .eq("id", id)
    .single();

  const { data: results, error: resultsError } = await supabase
    .from("assessment_results")
    .select(`
      id,
      name,
      type,
      bri_score,
      risk_band,
      strategic_value,
      strategic_value_label,
      executive_action_now,
      h1_strategy,
      h2_strategy,
      h3_strategy,
      reasoning,
      confidence,
      parameter_scores
    `)
    .eq("run_id", id)
    .order("bri_score", { ascending: false });

  if (runError) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Failed to load run: {runError.message}
          </div>
        </div>
      </main>
    );
  }

  const runData = run as AssessmentRun;
  const resultRows = (results || []) as AssessmentResult[];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              AgenticGPS
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Saved Run Details
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Review the saved assessment results and configuration.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/runs"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Back to Runs
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              New Assessment
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-slate-400">Created</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {new Date(runData.created_at).toLocaleString()}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-slate-400">Items</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {runData.item_count}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-slate-400">Model</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {runData.settings_json?.model || "—"}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-slate-400">Assessment Stance</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {runData.settings_json?.promptConfig?.assessmentStance || "—"}
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Company Context</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
            {runData.company_context || "No company context provided."}
          </p>
        </div>

        {resultsError && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Failed to load results: {resultsError.message}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-slate-950/40 text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">
                    BRI
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">
                    Risk
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">
                    Strategic Value
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {resultRows.map((result) => (
                  <tr key={result.id} className="border-t border-white/10 align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{result.name}</div>
                      <div className="mt-2 text-xs text-slate-500">
                        Executive Action: {result.executive_action_now || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-400">{result.type}</td>
                    <td className="px-4 py-4 font-medium text-white">{result.bri_score}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${riskBandPill(
                          result.risk_band
                        )}`}
                      >
                        {result.risk_band}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {result.strategic_value_label} ({result.strategic_value})
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {result.confidence != null
                        ? `${Math.round(Number(result.confidence) * 100)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {resultRows.length > 0 && (
          <div className="mt-8 space-y-6">
            {resultRows.map((result) => (
              <div
                key={`detail-${result.id}`}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{result.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">Type: {result.type}</p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${riskBandPill(
                      result.risk_band
                    )}`}
                  >
                    {result.risk_band}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
                    <p className="text-sm font-medium text-slate-400">Executive Action</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {result.executive_action_now || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
                    <p className="text-sm font-medium text-slate-400">H1</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {result.h1_strategy || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
                    <p className="text-sm font-medium text-slate-400">H2</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {result.h2_strategy || "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
                    <p className="text-sm font-medium text-slate-400">H3</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {result.h3_strategy || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
                    <p className="text-sm font-medium text-slate-400">Reasoning</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {result.reasoning || "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5">
                  <p className="text-sm font-medium text-slate-400">Parameter Scores</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {Object.entries(result.parameter_scores || {}).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                      >
                        <p className="text-xs capitalize text-slate-400">
                          {key.replaceAll("_", " ")}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}