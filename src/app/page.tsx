"use client";

import { useEffect, useState } from "react";
import { AppSettings, defaultSettings } from "@/lib/default-settings";
import * as XLSX from "xlsx";
import {
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

type AssessmentResult = {
  name: string;
  type: "service" | "talent" | "mixed";
  parameter_scores: {
    task_standardization: number;
    digital_executability: number;
    rules_clarity: number;
    decomposability: number;
    data_structure: number;
    verifiability: number;
    speed_volume_pressure: number;
    human_relational_intensity: number;
    contextual_judgment: number;
    regulatory_trust_friction: number;
    buyer_willingness: number;
    tooling_maturity: number;
  };
  bri_score: number;
  risk_band: "Low" | "Moderate" | "High" | "Severe";
  strategic_value: number;
  strategic_value_label: "Low" | "Medium" | "Medium-High" | "High" | "Very High";
  executive_action_now: string;
  h1_strategy: string;
  h2_strategy: string;
  h3_strategy: string;
  reasoning: string;
  confidence: number;
};

export default function Home() {
  const [companyContext, setCompanyContext] = useState("");
  const [itemsText, setItemsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem("agenticgps-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch {
        console.warn("Could not parse saved settings");
      }
    }
  }, []);

  async function runAssessment() {
    setLoading(true);
    setError("");
    setResults([]);
    setSelectedResult(null);
    setProgress("");

    const items = itemsText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    if (items.length === 0) {
      setError("Please enter at least one service or talent.");
      setLoading(false);
      return;
    }

    const collectedResults: AssessmentResult[] = [];

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setProgress(`Analyzing ${i + 1} of ${items.length}: ${item}`);

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyContext,
            item,
            settings,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.details || data.error || `Assessment failed for ${item}`);
        }

        collectedResults.push(data);
        setResults([...collectedResults]);

        if (i === 0) {
          setSelectedResult(data);
        }
      }

      setProgress(`Saving ${collectedResults.length} assessment(s)...`);

const saveRes = await fetch("/api/save-run", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    companyContext,
    settings,
    results: collectedResults,
  }),
});

const saveData = await saveRes.json();

if (!saveRes.ok) {
  throw new Error(saveData.details || saveData.error || "Failed to save run");
}

setProgress(
  `Completed ${collectedResults.length} assessment(s). Run saved successfully.`
);
    } catch (err: any) {
      setError(err?.message || "Network or server error.");
      setProgress("");
    } finally {
      setLoading(false);
    }
  }

  function riskBandPill(riskBand: AssessmentResult["risk_band"]) {
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

  function riskColor(riskBand: AssessmentResult["risk_band"]) {
    switch (riskBand) {
      case "Severe":
        return "#ef4444";
      case "High":
        return "#f97316";
      case "Moderate":
        return "#eab308";
      case "Low":
        return "#10b981";
      default:
        return "#94a3b8";
    }
  }

  function downloadExcel() {
    if (results.length === 0) return;

    const workbook = XLSX.utils.book_new();

    const summaryRows = results.map((result) => ({
      Name: result.name,
      Type: result.type,
      "BRI Score": result.bri_score,
      "Risk Band": result.risk_band,
      "Strategic Value": result.strategic_value,
      "Strategic Value Label": result.strategic_value_label,
      Confidence: `${Math.round(result.confidence * 100)}%`,
      "Task Standardization": result.parameter_scores.task_standardization,
      "Digital Executability": result.parameter_scores.digital_executability,
      "Rules Clarity": result.parameter_scores.rules_clarity,
      Decomposability: result.parameter_scores.decomposability,
      "Data Structure": result.parameter_scores.data_structure,
      Verifiability: result.parameter_scores.verifiability,
      "Speed / Volume Pressure": result.parameter_scores.speed_volume_pressure,
      "Human Relational Intensity": result.parameter_scores.human_relational_intensity,
      "Contextual Judgment": result.parameter_scores.contextual_judgment,
      "Regulatory / Trust Friction": result.parameter_scores.regulatory_trust_friction,
      "Buyer Willingness": result.parameter_scores.buyer_willingness,
      "Tooling Maturity": result.parameter_scores.tooling_maturity,
      "Executive Action Now": result.executive_action_now,
      H1: result.h1_strategy,
      H2: result.h2_strategy,
      H3: result.h3_strategy,
      Reasoning: result.reasoning,
    }));

    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    summarySheet["!cols"] = [
      { wch: 32 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 14 },
      { wch: 20 },
      { wch: 12 },
      { wch: 18 },
      { wch: 22 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 20 },
      { wch: 24 },
      { wch: 20 },
      { wch: 24 },
      { wch: 18 },
      { wch: 16 },
      { wch: 28 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
      { wch: 50 },
    ];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Assessment Summary");

    const matrixRows = results.map((result) => ({
      Name: result.name,
      BRI: result.bri_score,
      "Strategic Value": result.strategic_value,
      "Risk Band": result.risk_band,
      "Strategic Value Label": result.strategic_value_label,
    }));

    const matrixSheet = XLSX.utils.json_to_sheet(matrixRows);
    matrixSheet["!cols"] = [
      { wch: 32 },
      { wch: 10 },
      { wch: 16 },
      { wch: 12 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(workbook, matrixSheet, "2x2 Matrix Data");

    XLSX.writeFileXLSX(workbook, "agenticgps-results.xlsx");
  }

  const chartData = results.map((result) => ({
    name: result.name,
    bri: result.bri_score,
    strategicValue: result.strategic_value,
    riskBand: result.risk_band,
  }));

  const severeCount = results.filter((r) => r.risk_band === "Severe").length;
  const highCount = results.filter((r) => r.risk_band === "High").length;
  const avgBri =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.bri_score, 0) / results.length)
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.10),_transparent_24%),linear-gradient(to_bottom,_#020617,_#0f172a)]" />

      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-500/20">
              <span className="text-sm font-bold text-white">AG</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                AgenticGPS
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                Business Risk Index Studio
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Strategic assessment of services and talent under Agentic AI disruption.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
  <a
    href="/runs"
    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
  >
    Past Runs
  </a>

  <a
    href="/settings"
    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
  >
    Settings
  </a>

  <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 md:block">
    <p className="text-xs font-medium text-slate-400">Workspace</p>
    <p className="text-sm font-semibold text-white">Executive Portfolio View</p>
  </div>
</div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <p className="text-sm font-medium text-slate-400">Items assessed</p>
            <p className="mt-3 text-3xl font-semibold text-white">{results.length}</p>
            <p className="mt-1 text-sm text-slate-500">Portfolio entries in current run</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <p className="text-sm font-medium text-slate-400">Average BRI</p>
            <p className="mt-3 text-3xl font-semibold text-white">{avgBri}</p>
            <p className="mt-1 text-sm text-slate-500">Average disruption exposure</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <p className="text-sm font-medium text-slate-400">High risk items</p>
            <p className="mt-3 text-3xl font-semibold text-white">{highCount}</p>
            <p className="mt-1 text-sm text-slate-500">Scored as High risk</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <p className="text-sm font-medium text-slate-400">Severe risk items</p>
            <p className="mt-3 text-3xl font-semibold text-white">{severeCount}</p>
            <p className="mt-1 text-sm text-slate-500">Strong near-term exposure</p>
          </div>
        </section>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
          <span className="font-semibold text-white">Active settings:</span>{" "}
          Model <span className="text-blue-300">{settings.model}</span>, High BRI{" "}
          <span className="text-blue-300">{settings.thresholds.highBri}</span>, Severe BRI{" "}
          <span className="text-blue-300">{settings.thresholds.severeBri}</span>, High Strategic Value{" "}
          <span className="text-blue-300">{settings.thresholds.highStrategicValue}</span>
        </div>

        <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Assessment Input</h2>
              <p className="mt-1 text-sm text-slate-400">
                Define context and submit services or talent roles for analysis.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Company context
                </label>
                <textarea
                  value={companyContext}
                  onChange={(e) => setCompanyContext(e.target.value)}
                  className="min-h-[150px] w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                  placeholder="Example: Mid-sized life sciences consulting company with services in informatics, quality, validation, cloud, and data science."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Services or talents
                </label>
                <textarea
                  value={itemsText}
                  onChange={(e) => setItemsText(e.target.value)}
                  className="min-h-[300px] w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                  placeholder={`Scientific Application Managed Services
Lab Compute Services
Bioinformatics Services
Validation Consultant
Data Engineer`}
                />
              </div>

              <button
                onClick={runAssessment}
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Running Assessment..." : "Run Assessment"}
              </button>

              {progress && (
                <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
                  {progress}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Workflow
                </p>
                <div className="mt-3 space-y-3 text-sm text-slate-400">
                  <p>1. Describe the organization and its context</p>
                  <p>2. Paste services or talent roles line by line</p>
                  <p>3. Review the matrix, table, and detailed strategies</p>
                  <p>4. Export to Excel for leadership discussion</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Assessment Results</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Review the portfolio view and inspect strategic recommendations in detail.
                </p>
              </div>

              <button
                onClick={downloadExcel}
                disabled={results.length === 0}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download Excel
              </button>
            </div>

            {results.length === 0 && !loading && (
              <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-slate-900/30 p-12 text-center">
                <p className="text-sm text-slate-500">No assessment run yet.</p>
              </div>
            )}

            {results.length > 0 && (
              <>
                <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/40 p-5">
                  <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">Portfolio 2x2 Matrix</h3>
                      <p className="text-sm text-slate-400">
                        X-axis = BRI, Y-axis = Strategic Value
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      Thresholds at BRI {settings.thresholds.highBri} and Strategic Value {settings.thresholds.highStrategicValue}
                    </p>
                  </div>

                  <div className="h-[380px] w-full rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid stroke="#334155" />
                        <XAxis
                          type="number"
                          dataKey="bri"
                          name="BRI"
                          domain={[0, 100]}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          label={{ value: "BRI", position: "insideBottom", offset: -10, fill: "#94a3b8" }}
                        />
                        <YAxis
                          type="number"
                          dataKey="strategicValue"
                          name="Strategic Value"
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          label={{
                            value: "Strategic Value",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#94a3b8",
                          }}
                        />
                        <ReferenceLine x={settings.thresholds.highBri} stroke="#64748b" strokeDasharray="4 4" />
                        <ReferenceLine y={settings.thresholds.highStrategicValue} stroke="#64748b" strokeDasharray="4 4" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "16px",
                            color: "#fff",
                          }}
                          cursor={{ strokeDasharray: "3 3" }}
                          formatter={(value, name) => [value, name]}
                          labelFormatter={(_, payload) => {
                            if (payload && payload.length > 0) {
                              return payload[0].payload.name;
                            }
                            return "";
                          }}
                        />
                        <Scatter
                          data={chartData}
                          shape={(props: any) => {
                            const { cx, cy, payload } = props;
                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={8}
                                fill={riskColor(payload.riskBand)}
                                stroke="#e2e8f0"
                                strokeWidth={1}
                              />
                            );
                          }}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                      Severe
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-orange-500" />
                      High
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" />
                      Moderate
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                      Low
                    </div>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-slate-950/40 text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-300">Item</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-300">Type</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-300">BRI</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-300">Risk</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-300">Strategic Value</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-300">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result, index) => (
                          <tr
                            key={`${result.name}-${index}`}
                            onClick={() => setSelectedResult(result)}
                            className="cursor-pointer border-t border-white/10 transition hover:bg-white/5"
                          >
                            <td className="px-4 py-3 font-medium text-white">{result.name}</td>
                            <td className="px-4 py-3 text-slate-400">{result.type}</td>
                            <td className="px-4 py-3 font-medium text-white">{result.bri_score}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${riskBandPill(
                                  result.risk_band
                                )}`}
                              >
                                {result.risk_band}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {result.strategic_value_label} ({result.strategic_value})
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {Math.round(result.confidence * 100)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedResult && (
                  <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/50 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold text-white">
                          {selectedResult.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Type: {selectedResult.type}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${riskBandPill(
                          selectedResult.risk_band
                        )}`}
                      >
                        {selectedResult.risk_band}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-medium text-slate-400">BRI Score</p>
                        <p className="mt-2 text-3xl font-semibold text-white">
                          {selectedResult.bri_score}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-medium text-slate-400">Risk Band</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {selectedResult.risk_band}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-medium text-slate-400">Strategic Value</p>
                        <p className="mt-2 text-xl font-semibold text-white">
                          {selectedResult.strategic_value_label} ({selectedResult.strategic_value})
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-medium text-slate-400">Confidence</p>
                        <p className="mt-2 text-xl font-semibold text-white">
                          {Math.round(selectedResult.confidence * 100)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-semibold text-white">Executive Action Now</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {selectedResult.executive_action_now}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-semibold text-white">Reasoning</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {selectedResult.reasoning}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-semibold text-white">H1</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {selectedResult.h1_strategy}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-semibold text-white">H2</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {selectedResult.h2_strategy}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:col-span-2">
                        <p className="text-sm font-semibold text-white">H3</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {selectedResult.h3_strategy}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}