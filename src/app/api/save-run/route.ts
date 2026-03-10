import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { AppSettings } from "@/lib/default-settings";

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyContext,
      settings,
      results,
    }: {
      companyContext?: string;
      settings?: AppSettings;
      results?: AssessmentResult[];
    } = body;

    if (!settings) {
      return NextResponse.json(
        { error: "Missing settings" },
        { status: 400 }
      );
    }

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid results" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: runData, error: runError } = await supabase
      .from("assessment_runs")
      .insert({
        company_context: companyContext || null,
        settings_json: settings,
        item_count: results.length,
      })
      .select("id")
      .single();

    if (runError) {
      console.error("Error creating assessment run:", runError);
      return NextResponse.json(
        { error: "Failed to create assessment run", details: runError.message },
        { status: 500 }
      );
    }

    const runId = runData.id;

    const rows = results.map((result) => ({
      run_id: runId,
      name: result.name,
      type: result.type,
      bri_score: result.bri_score,
      risk_band: result.risk_band,
      strategic_value: result.strategic_value,
      strategic_value_label: result.strategic_value_label,
      executive_action_now: result.executive_action_now,
      h1_strategy: result.h1_strategy,
      h2_strategy: result.h2_strategy,
      h3_strategy: result.h3_strategy,
      reasoning: result.reasoning,
      confidence: result.confidence,
      parameter_scores: result.parameter_scores,
      raw_result_json: result,
    }));

    const { error: resultsError } = await supabase
      .from("assessment_results")
      .insert(rows);

    if (resultsError) {
      console.error("Error saving assessment results:", resultsError);
      return NextResponse.json(
        { error: "Failed to save assessment results", details: resultsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      runId,
      savedCount: results.length,
    });
  } catch (error: any) {
    console.error("Save-run route error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong in /api/save-run",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}