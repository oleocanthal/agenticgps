"use client";

import { useState } from "react";
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

      setProgress(`Completed ${collectedResults.length} assessment(s).`);
    } catch (err: any) {
      setError(err?.message || "Network or server error.");
      setProgress("");
    } finally {
      setLoading(false);
    }
  }

  function riskBandColor(riskBand: AssessmentResult["risk_band"]) {
    switch (riskBand) {
      case "Severe":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function riskColor(riskBand: AssessmentResult["risk_band"]) {
    switch (riskBand) {
      case "Severe":
        return "#dc2626";
      case "High":
        return "#ea580c";
      case "Moderate":
        return "#ca8a04";
      case "Low":
        return "#16a34a";
      default:
        return "#6b7280";
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

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight">AgenticGPS</h1>
        <p className="mt-3 text-lg text-gray-600">
          Assess services and talent for disruption risk from Agentic AI.
        </p>

        <div className="mt-10 grid gap-8 xl:grid-cols-[420px_1fr]">
          <section className="rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Assessment Input</h2>
            <p className="mt-2 text-sm text-gray-600">
              Add company context and paste a list of services or talents, one per line.
            </p>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Company context
              </label>
              <textarea
                value={companyContext}
                onChange={(e) => setCompanyContext(e.target.value)}
                className="min-h-[140px] w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
                placeholder="Example: Mid-sized life sciences consulting company with services in informatics, quality, validation, cloud, and data science."
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Services or talents
              </label>
              <textarea
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                className="min-h-[260px] w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
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
              className="mt-6 rounded-xl bg-black px-5 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Running..." : "Run Assessment"}
            </button>

            {progress && (
              <p className="mt-4 text-sm text-blue-700">{progress}</p>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Results</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Click any row to inspect the detailed assessment.
                </p>
              </div>

              <button
                onClick={downloadExcel}
                disabled={results.length === 0}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download Excel
              </button>
            </div>

            {results.length === 0 && !loading && (
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">No assessment run yet.</p>
              </div>
            )}

            {results.length > 0 && (
              <>
                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
                  <h3 className="text-lg font-semibold">Portfolio 2x2 Matrix</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    X-axis = BRI, Y-axis = Strategic Value
                  </p>

                  <div className="mt-4 h-[360px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis
                          type="number"
                          dataKey="bri"
                          name="BRI"
                          domain={[0, 100]}
                          label={{ value: "BRI", position: "insideBottom", offset: -10 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="strategicValue"
                          name="Strategic Value"
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          label={{ value: "Strategic Value", angle: -90, position: "insideLeft" }}
                        />
                        <ReferenceLine x={60} stroke="#9ca3af" strokeDasharray="4 4" />
                        <ReferenceLine y={4} stroke="#9ca3af" strokeDasharray="4 4" />
                        <Tooltip
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
                                stroke="#111827"
                              />
                            );
                          }}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-red-600" />
                      Severe
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-orange-600" />
                      High
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" />
                      Moderate
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-green-600" />
                      Low
                    </div>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full bg-white text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Item</th>
                        <th className="px-4 py-3 text-left font-semibold">Type</th>
                        <th className="px-4 py-3 text-left font-semibold">BRI</th>
                        <th className="px-4 py-3 text-left font-semibold">Risk</th>
                        <th className="px-4 py-3 text-left font-semibold">Strategic Value</th>
                        <th className="px-4 py-3 text-left font-semibold">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr
                          key={`${result.name}-${index}`}
                          onClick={() => setSelectedResult(result)}
                          className="cursor-pointer border-t border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-medium">{result.name}</td>
                          <td className="px-4 py-3">{result.type}</td>
                          <td className="px-4 py-3">{result.bri_score}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${riskBandColor(
                                result.risk_band
                              )}`}
                            >
                              {result.risk_band}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {result.strategic_value_label} ({result.strategic_value})
                          </td>
                          <td className="px-4 py-3">
                            {Math.round(result.confidence * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedResult && (
                  <div className="mt-8 rounded-2xl bg-gray-50 p-6">
                    <div className="mb-6">
                      <h3 className="text-2xl font-semibold">{selectedResult.name}</h3>
                      <p className="text-sm text-gray-600">
                        Type: {selectedResult.type}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm text-gray-500">BRI Score</p>
                        <p className="text-2xl font-bold">{selectedResult.bri_score}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm text-gray-500">Risk Band</p>
                        <p className="text-2xl font-bold">{selectedResult.risk_band}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm text-gray-500">Strategic Value</p>
                        <p className="text-lg font-bold">
                          {selectedResult.strategic_value_label} ({selectedResult.strategic_value})
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm text-gray-500">Confidence</p>
                        <p className="text-lg font-bold">
                          {Math.round(selectedResult.confidence * 100)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <p className="text-sm font-semibold">Executive Action Now</p>
                        <p className="text-sm text-gray-700">
                          {selectedResult.executive_action_now}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold">H1</p>
                        <p className="text-sm text-gray-700">{selectedResult.h1_strategy}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold">H2</p>
                        <p className="text-sm text-gray-700">{selectedResult.h2_strategy}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold">H3</p>
                        <p className="text-sm text-gray-700">{selectedResult.h3_strategy}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold">Reasoning</p>
                        <p className="text-sm text-gray-700">{selectedResult.reasoning}</p>
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