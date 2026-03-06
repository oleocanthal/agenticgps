"use client";

import { useState } from "react";

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

  function downloadCSV() {
    if (results.length === 0) return;

    const headers = [
  "name",
  "type",
  "bri_score",
  "risk_band",
  "strategic_value",
  "strategic_value_label",
  "confidence",
  "task_standardization",
  "digital_executability",
  "rules_clarity",
  "decomposability",
  "data_structure",
  "verifiability",
  "speed_volume_pressure",
  "human_relational_intensity",
  "contextual_judgment",
  "regulatory_trust_friction",
  "buyer_willingness",
  "tooling_maturity",
  "executive_action_now",
  "h1_strategy",
  "h2_strategy",
  "h3_strategy",
  "reasoning",
];

    const escapeCSV = (value: string | number) => {
      const str = String(value ?? "");
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = results.map((result) => [
  result.name,
  result.type,
  result.bri_score,
  result.risk_band,
  result.strategic_value,
  result.strategic_value_label,
  `${Math.round(result.confidence * 100)}%`,
  result.parameter_scores.task_standardization,
  result.parameter_scores.digital_executability,
  result.parameter_scores.rules_clarity,
  result.parameter_scores.decomposability,
  result.parameter_scores.data_structure,
  result.parameter_scores.verifiability,
  result.parameter_scores.speed_volume_pressure,
  result.parameter_scores.human_relational_intensity,
  result.parameter_scores.contextual_judgment,
  result.parameter_scores.regulatory_trust_friction,
  result.parameter_scores.buyer_willingness,
  result.parameter_scores.tooling_maturity,
  result.executive_action_now,
  result.h1_strategy,
  result.h2_strategy,
  result.h3_strategy,
  result.reasoning,
]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "agenticgps-results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

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
                onClick={downloadCSV}
                disabled={results.length === 0}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download CSV
              </button>
            </div>

            {results.length === 0 && !loading && (
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">No assessment run yet.</p>
              </div>
            )}

            {results.length > 0 && (
              <>
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