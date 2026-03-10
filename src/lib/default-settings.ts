export type AppSettings = {
  provider: "openai";
  model: string;
  thresholds: {
    highBri: number;
    severeBri: number;
    highStrategicValue: number;
  };
  weights: {
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
  exportOptions: {
    includeParameterScores: boolean;
    includeReasoning: boolean;
    format: "xlsx" | "csv";
  };
  promptConfig: {
    assessmentStance: "conservative" | "balanced" | "disruption-forward";
    primaryLens: "hr" | "offerings" | "technology" | "operating-model" | "mixed";
    customGuidance: string;
  };
};

export const defaultSettings: AppSettings = {
  provider: "openai",
  model: "gpt-5.4",
  thresholds: {
    highBri: 60,
    severeBri: 75,
    highStrategicValue: 4,
  },
  weights: {
    task_standardization: 12,
    digital_executability: 10,
    rules_clarity: 8,
    decomposability: 8,
    data_structure: 8,
    verifiability: 8,
    speed_volume_pressure: 6,
    human_relational_intensity: 10,
    contextual_judgment: 8,
    regulatory_trust_friction: 7,
    buyer_willingness: 8,
    tooling_maturity: 7,
  },
  exportOptions: {
    includeParameterScores: true,
    includeReasoning: true,
    format: "xlsx",
  },
  promptConfig: {
    assessmentStance: "balanced",
    primaryLens: "mixed",
    customGuidance: "",
  },
};