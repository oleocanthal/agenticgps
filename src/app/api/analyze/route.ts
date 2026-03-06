import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyContext, item } = body;

    if (!item || typeof item !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid item" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert strategy analyst.

Your task is to assess a service or talent role for disruption risk from Agentic AI using the Business Risk Index (BRI) framework.

Company context:
${companyContext || "No additional context provided."}

Item to assess:
${item}

Use this 12-parameter scoring framework. Score each parameter from 1 to 5.

Positive-risk factors:
1. task_standardization
2. digital_executability
3. rules_clarity
4. decomposability
5. data_structure
6. verifiability
7. speed_volume_pressure
11. buyer_willingness
12. tooling_maturity

Reverse-scored protective factors:
8. human_relational_intensity
9. contextual_judgment
10. regulatory_trust_friction

Weights:
1=12
2=10
3=8
4=8
5=8
6=8
7=6
8=10 (reverse scored)
9=8 (reverse scored)
10=7 (reverse scored)
11=8
12=7

Risk bands:
0-24 Low
25-49 Moderate
50-74 High
75-100 Severe

Strategic value:
1 = Low
2 = Medium
3 = Medium-High
4 = High
5 = Very High

Return JSON only with this exact structure:
{
  "name": "string",
  "type": "service" | "talent" | "mixed",
  "parameter_scores": {
    "task_standardization": number,
    "digital_executability": number,
    "rules_clarity": number,
    "decomposability": number,
    "data_structure": number,
    "verifiability": number,
    "speed_volume_pressure": number,
    "human_relational_intensity": number,
    "contextual_judgment": number,
    "regulatory_trust_friction": number,
    "buyer_willingness": number,
    "tooling_maturity": number
  },
  "bri_score": number,
  "risk_band": "Low" | "Moderate" | "High" | "Severe",
  "strategic_value": number,
  "strategic_value_label": "Low" | "Medium" | "Medium-High" | "High" | "Very High",
  "executive_action_now": "string",
  "h1_strategy": "string",
  "h2_strategy": "string",
  "h3_strategy": "string",
  "reasoning": "string",
  "confidence": number
}

Important:
- Return valid JSON only
- bri_score must be a whole number from 0 to 100
- confidence must be between 0 and 1
- Keep reasoning concise
`;

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: prompt,
    });

    const text = response.output_text;

    if (!text) {
      return NextResponse.json(
        { error: "No output returned from model" },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON", raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Analyze route error:", error);
    return NextResponse.json(
      { error: "Something went wrong in /api/analyze" },
      { status: 500 }
    );
  }
}