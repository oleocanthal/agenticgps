"use client";

import { useEffect, useState } from "react";
import { AppSettings, defaultSettings } from "@/lib/default-settings";

function mergeSettings(saved: Partial<AppSettings>): AppSettings {
  return {
    ...defaultSettings,
    ...saved,
    thresholds: {
      ...defaultSettings.thresholds,
      ...(saved.thresholds || {}),
    },
    weights: {
      ...defaultSettings.weights,
      ...(saved.weights || {}),
    },
    exportOptions: {
      ...defaultSettings.exportOptions,
      ...(saved.exportOptions || {}),
    },
    promptConfig: {
      ...defaultSettings.promptConfig,
      ...(saved.promptConfig || {}),
    },
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("agenticgps-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(mergeSettings(parsed));
      } catch {
        console.warn("Could not parse saved settings");
      }
    }
  }, []);

  function updateWeight(key: keyof AppSettings["weights"], value: number) {
    setSettings((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: value,
      },
    }));
  }

  function updateThreshold(
    key: keyof AppSettings["thresholds"],
    value: number
  ) {
    setSettings((prev) => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [key]: value,
      },
    }));
  }

  function saveSettings() {
    localStorage.setItem("agenticgps-settings", JSON.stringify(settings));
    setSavedMessage("Settings saved.");

    setTimeout(() => {
      setSavedMessage("");
    }, 2000);
  }

  function resetDefaults() {
    setSettings(defaultSettings);
    localStorage.setItem("agenticgps-settings", JSON.stringify(defaultSettings));
    setSavedMessage("Defaults restored.");

    setTimeout(() => {
      setSavedMessage("");
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            AgenticGPS
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Settings
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Configure the BRI scoring framework, thresholds, model, and prompt behavior.
          </p>
        </div>

        <div className="space-y-8">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Model Settings</h2>
            <p className="mt-1 text-sm text-slate-400">
              Select the AI provider and model used for assessment.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Provider
                </label>
                <select
                  value={settings.provider}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      provider: e.target.value as "openai",
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="openai">OpenAI</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Model
                </label>
                <select
                  value={settings.model}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      model: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="gpt-5.4">gpt-5.4</option>
                  <option value="gpt-5-mini">gpt-5-mini</option>
                  <option value="gpt-4.1">gpt-4.1</option>
                  <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Prompt Configuration</h2>
            <p className="mt-1 text-sm text-slate-400">
              Adjust how the model approaches the assessment without editing the raw prompt.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Assessment Stance
                </label>
                <select
                  value={settings.promptConfig.assessmentStance}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      promptConfig: {
                        ...prev.promptConfig,
                        assessmentStance:
                          e.target.value as AppSettings["promptConfig"]["assessmentStance"],
                      },
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="conservative">Conservative</option>
                  <option value="balanced">Balanced</option>
                  <option value="disruption-forward">Disruption-forward</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Primary Lens
                </label>
                <select
                  value={settings.promptConfig.primaryLens}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      promptConfig: {
                        ...prev.promptConfig,
                        primaryLens:
                          e.target.value as AppSettings["promptConfig"]["primaryLens"],
                      },
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="mixed">Mixed</option>
                  <option value="hr">HR</option>
                  <option value="offerings">Offerings</option>
                  <option value="technology">Technology</option>
                  <option value="operating-model">Operating model</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Custom Guidance
              </label>
              <textarea
                value={settings.promptConfig.customGuidance}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    promptConfig: {
                      ...prev.promptConfig,
                      customGuidance: e.target.value,
                    },
                  }))
                }
                className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none"
                placeholder="Example: Place extra emphasis on regulated accountability, client trust, and service reconfiguration rather than total replacement."
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Threshold Settings</h2>
            <p className="mt-1 text-sm text-slate-400">
              Control the cutoffs used in the portfolio matrix and classification logic.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  High BRI Threshold
                </label>
                <input
                  type="number"
                  value={settings.thresholds.highBri}
                  onChange={(e) =>
                    updateThreshold("highBri", Number(e.target.value))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Severe BRI Threshold
                </label>
                <input
                  type="number"
                  value={settings.thresholds.severeBri}
                  onChange={(e) =>
                    updateThreshold("severeBri", Number(e.target.value))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  High Strategic Value
                </label>
                <input
                  type="number"
                  value={settings.thresholds.highStrategicValue}
                  onChange={(e) =>
                    updateThreshold("highStrategicValue", Number(e.target.value))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">BRI Weights</h2>
            <p className="mt-1 text-sm text-slate-400">
              Adjust the parameter weights used in the Business Risk Index framework.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Object.entries(settings.weights).map(([key, value]) => (
                <div key={key}>
                  <label className="mb-2 block text-sm font-medium capitalize text-slate-300">
                    {key.replaceAll("_", " ")}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      updateWeight(
                        key as keyof AppSettings["weights"],
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Actions</h2>
            <p className="mt-1 text-sm text-slate-400">
              Save these settings in your browser for use across the app.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={saveSettings}
                className="rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-95"
              >
                Save Settings
              </button>

              <button
                onClick={resetDefaults}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                Reset to Defaults
              </button>

              <a
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                Back to Assessment
              </a>
            </div>

            {savedMessage && (
              <p className="mt-4 text-sm text-emerald-300">{savedMessage}</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}