import OpenAI from "openai";
import { NextResponse } from "next/server";
import { AppSettings, defaultSettings } from "@/lib/default-settings";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildSystemPrompt() {
  return `
You are a senior strategy analyst specializing in:
- business model disruption
- operating model redesign
- workforce transformation
- service portfolio strategy
- Agentic AI impact assessment

You assess services and talent roles using a Business Risk Index (BRI) framework.

Your job is to:
1. score the work rationally against the provided BRI parameters
2. estimate disruption risk from Agentic AI
3. classify the item into an appropriate risk band
4. assess strategic value
5. generate practical H1, H2, and H3 recommendations

You must be analytical, internally consistent, and commercially realistic.

Important rules:
- Do not be sensationalist.
- Do not assume all work is replaced.
- Distinguish between substitution, compression, and reconfiguration.
- Technical implementation work is often more exposed than human-trust-heavy work, but do not force this conclusion if the item does not justify it.
- Use the company context when helpful.
- Keep reasoning concise but meaningful.
- Return valid JSON only.
`.trim();
}

function buildStanceGuidance(stance: AppSettings["promptConfig"]["assessmentStance"]) {
  switch (stance) {
    case "conservative":
      return `
Assessment stance: conservative.
- Be cautious about overstating near-term disruption.
- Give greater weight to adoption friction, governance, trust, and implementation reality.
- Prefer "compression" or "reconfiguration" over full replacement unless the case is very strong.
`.trim();

    case "disruption-forward":
      return `
Assessment stance: disruption-forward.
- Be more willing to recognize rapid disruption from Agentic AI where tasks are structured, digital, modular, and testable.
- Give greater weight to execution compression, ACC-style orchestration, and scaling effects.
- Still remain commercially realistic and avoid hype.
`.trim();

    case "balanced":
    default:
      return `
Assessment stance: balanced.
- Assess disruption realistically without exaggeration or undue caution.
- Weigh technical exposure and human protection factors evenly.
- Distinguish clearly between substitution, compression, and reconfiguration.
`.trim();
  }
}

function buildLensGuidance(lens: AppSettings["promptConfig"]["primaryLens"]) {
  switch (lens) {
    case "hr":
      return `
Primary lens: HR.
When generating recommendations, place extra emphasis on:
- hiring decisions
- workforce redesign
- redundancy risk
- upskilling
- role evolution
`.trim();

    case "offerings":
      return `
Primary lens: Offerings.
When generating recommendations, place extra emphasis on:
- service portfolio redesign
- offer repackaging
- new offerings
- pricing and delivery model transition
`.trim();

    case "technology":
      return `
Primary lens: Technology.
When generating recommendations, place extra emphasis on:
- tooling maturity
- automation pathways
- platformization
- technical accelerators
- AI-enabled delivery infrastructure
`.trim();

    case "operating-model":
      return `
Primary lens: Operating model.
When generating recommendations, place extra emphasis on:
- ACC-style delivery
- orchestration models
- organizational redesign
- governance structure
- delivery leverage and scaling
`.trim();

    case "mixed":
    default:
      return `
Primary lens: mixed.
Balance the recommendations across:
- HR
- offerings
- technology
- operating model
`.trim();
  }
}

function buildAnalysisPrompt(
  companyContext: string,
  item: string,
  settings: AppSettings
) {
  const stanceGuidance = buildStanceGuidance(settings.promptConfig.assessmentStance);
  const lensGuidance = buildLensGuidance(settings.promptConfig.primaryLens);
  const customGuidance =
    settings.promptConfig.customGuidance?.trim()
      ? `
Custom guidance:
${settings.promptConfig.customGuidance.trim()}
`.trim()
      : "Custom guidance: none.";

  return `
## Assessment Context

### Company context
${companyContext || "No additional context provided."}

### Item to assess
${item}

## Prompt Configuration

${stanceGuidance}

${lensGuidance}

${customGuidance}

## BRI Framework

Score the item using these 12 parameters, each from 1 to 5.

### Positive-risk factors
These increase disruption risk when scored higher:
1. task_standardization
2. digital_executability
3. rules_clarity
4. decomposability
5. data_structure
6. verifiability
7. speed_volume_pressure
11. buyer_willingness
12. tooling_maturity

### Reverse-scored protective factors
These reduce disruption risk when scored higher:
8. human_relational_intensity
9. contextual_judgment
10. regulatory_trust_friction

## Weighting Configuration

Use these weights exactly:

- task_standardization = ${settings.weights.task_standardization}
- digital_executability = ${settings.weights.digital_executability}
- rules_clarity = ${settings.weights.rules_clarity}
- decomposability = ${settings.weights.decomposability}
- data_structure = ${settings.weights.data_structure}
- verifiability = ${settings.weights.verifiability}
- speed_volume_pressure = ${settings.weights.speed_volume_pressure}
- human_relational_intensity = ${settings.weights.human_relational_intensity} (reverse scored)
- contextual_judgment = ${settings.weights.contextual_judgment} (reverse scored)
- regulatory_trust_friction = ${settings.weights.regulatory_trust_friction} (reverse scored)
- buyer_willingness = ${settings.weights.buyer_willingness}
- tooling_maturity = ${settings.weights.tooling_maturity}

## Threshold Configuration

Use these thresholds exactly:

- High BRI threshold = ${settings.thresholds.highBri}
- Severe BRI threshold = ${settings.thresholds.severeBri}
- High Strategic Value threshold = ${settings.thresholds.highStrategicValue}

## Scoring Guidance

When assigning parameter scores:

- A score of 1 means very low relevance or contribution.
- A score of 3 means moderate relevance or mixed characteristics.
- A score of 5 means very strong relevance or contribution.

### Interpretive guidance
- Repetitive, screen-based, modular, testable work tends to score higher on disruption exposure.
- Work requiring trust, persuasion, accountability, contextual judgment, or regulatory responsibility tends to score higher on protective factors.
- Some work will not disappear but may compress from team-based delivery to SME + agent orchestration.
- Consider disruption over a 0–36 month horizon, not just immediate automation.

## Required Assessment Logic

Perform the assessment in this order:

1. Identify whether the item is primarily a:
   - service
   - talent
   - mixed

2. Score all 12 parameters from 1 to 5.

3. Estimate a rational whole-number BRI score from 0 to 100 using the weighting logic above.

4. Assign a risk band:
   - Low
   - Moderate
   - High
   - Severe

5. Assign strategic value:
   - 1 = Low
   - 2 = Medium
   - 3 = Medium-High
   - 4 = High
   - 5 = Very High

6. Recommend:
   - executive_action_now
   - h1_strategy
   - h2_strategy
   - h3_strategy

## Strategy Guidance

Your strategy recommendations should be practical and business-oriented.

### H1 (0–3 months)
Focus on:
- hiring caution
- pilot activity
- immediate upskilling
- workflow identification
- risk containment

### H2 (4–12 months)
Focus on:
- service redesign
- role redesign
- AI-enabled delivery
- tooling deployment
- offer repackaging

### H3 (13–36 months)
Focus on:
- operating model transition
- portfolio restructuring
- ACC-style delivery
- organizational redesign
- new revenue models

## Output Requirements

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

## Output constraints

- Return valid JSON only.
- Do not include markdown.
- Do not include explanation outside the JSON.
- bri_score must be a whole number from 0 to 100.
- confidence must be between 0 and 1.
- reasoning should be concise, specific, and commercially useful.
- executive_action_now should be action-oriented.
`.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyContext,
      item,
      settings,
    }: {
      companyContext?: string;
      item?: string;
      settings?: AppSettings;
    } = body;

    if (!item || typeof item !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid item" },
        { status: 400 }
      );
    }

    const activeSettings = settings || defaultSettings;
    const model = activeSettings.model || process.env.OPENAI_MODEL || "gpt-5.4";

    const systemPrompt = buildSystemPrompt();
    const analysisPrompt = buildAnalysisPrompt(
      companyContext || "",
      item,
      activeSettings
    );

    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
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
  } catch (error: any) {
    console.error("Analyze route error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong in /api/analyze",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}