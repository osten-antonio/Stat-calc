import { useState, useMemo } from "react";
import type { Route } from "./+types/stats-hell.t-tests";
import { Link } from "react-router";

import {
  oneSampleTTestWithSteps,
  pairedTTestWithSteps,
  independentTTestWithSteps,
  type OneSampleTTestResult,
  type PairedTTestResult,
  type IndependentTTestResult,
} from "~/lib/math/t-tests";
import { CopyExamAnswer } from "~/components/calculator/CopyExamAnswer";
import { DataTableInput, type DataTableValue } from "~/components/calculator/DataTableInput";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import type { CalculationResult } from "~/lib/types/calculation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stats Hell | T-Tests" },
    { name: "description", content: "One-sample, paired, and independent t-tests with step-by-step workings." },
  ];
}

type TestType = "one-sample" | "paired" | "independent";

function formatNum(num: number, decimals = 4): string {
  if (!Number.isFinite(num)) return "N/A";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function parseData(tableValue: DataTableValue, colIndex: number = 0): number[] {
  const values: number[] = [];
  for (const row of tableValue.rows) {
    const cell = row[colIndex];
    if (!cell) continue;
    const trimmed = cell.trim();
    if (trimmed === "") continue;
    const num = Number(trimmed);
    if (Number.isFinite(num)) values.push(num);
  }
  return values;
}

function resultToExamAnswer<T>(calc: CalculationResult<T>, title: string): ExamAnswer {
  return {
    title,
    sections: calc.steps.map((step) => ({
      title: step.title,
      lines: [
        step.description ?? "",
        step.formula ? `Formula: ${step.formula}` : "",
        step.calculation ?? "",
        step.note ? `Note: ${step.note}` : "",
        step.result ? `= ${step.result}` : "",
      ].filter(Boolean),
    })),
    finalAnswer: calc.steps.find((s) => s.id === "decision")?.result ?? "See above",
  };
}

export default function TTestsPage() {
  const [testType, setTestType] = useState<TestType>("one-sample");
  const [alpha, setAlpha] = useState("0.05");

  const [oneSampleData, setOneSampleData] = useState<DataTableValue>({
    columns: ["Sample"],
    rows: [[""], [""], [""], [""], [""]],
  });
  const [mu0, setMu0] = useState("");
  const [oneSampleResult, setOneSampleResult] = useState<CalculationResult<OneSampleTTestResult> | null>(null);

  const [pairedData, setPairedData] = useState<DataTableValue>({
    columns: ["Before", "After"],
    rows: [["", ""], ["", ""], ["", ""], ["", ""], ["", ""]],
  });
  const [pairedResult, setPairedResult] = useState<CalculationResult<PairedTTestResult> | null>(null);

  const [indepData, setIndepData] = useState<DataTableValue>({
    columns: ["Group 1", "Group 2"],
    rows: [["", ""], ["", ""], ["", ""], ["", ""], ["", ""]],
  });
  const [indepResult, setIndepResult] = useState<CalculationResult<IndependentTTestResult> | null>(null);

  const [error, setError] = useState<string | null>(null);

  const oneSampleParsed = useMemo(() => parseData(oneSampleData, 0), [oneSampleData]);
  const pairedBefore = useMemo(() => parseData(pairedData, 0), [pairedData]);
  const pairedAfter = useMemo(() => parseData(pairedData, 1), [pairedData]);
  const indepGroup1 = useMemo(() => parseData(indepData, 0), [indepData]);
  const indepGroup2 = useMemo(() => parseData(indepData, 1), [indepData]);

  function runOneSample() {
    setError(null);
    setOneSampleResult(null);
    const mu = parseFloat(mu0);
    if (isNaN(mu)) {
      setError("Enter a valid hypothesized mean (μ₀).");
      return;
    }
    if (oneSampleParsed.length < 2) {
      setError("Need at least 2 data points. Statistics requires data, not imagination.");
      return;
    }
    const result = oneSampleTTestWithSteps(oneSampleParsed, mu, parseFloat(alpha));
    setOneSampleResult(result);
  }

  function runPaired() {
    setError(null);
    setPairedResult(null);
    if (pairedBefore.length < 2 || pairedAfter.length < 2) {
      setError("Need at least 2 pairs. A single before/after is just called 'change'.");
      return;
    }
    if (pairedBefore.length !== pairedAfter.length) {
      setError("Before and After must have the same number of values. It's called 'paired' for a reason.");
      return;
    }
    const result = pairedTTestWithSteps(pairedBefore, pairedAfter, parseFloat(alpha));
    setPairedResult(result);
  }

  function runIndependent() {
    setError(null);
    setIndepResult(null);
    if (indepGroup1.length < 2 || indepGroup2.length < 2) {
      setError("Need at least 2 values in each group.");
      return;
    }
    const result = independentTTestWithSteps(indepGroup1, indepGroup2, parseFloat(alpha));
    setIndepResult(result);
  }

  return (
    <main className="retro-theme min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-3xl retro-fire">T-TESTS</h1>
        <p className="text-sm mt-2">
          One-sample, paired, and independent samples t-tests with full step-by-step workings.
        </p>
        <Link to="/stats-hell" className="text-xs">
          ← Back to Stats Hell
        </Link>
      </header>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Button variant={testType === "one-sample" ? "primary" : "outline"} onClick={() => setTestType("one-sample")}>
          One-Sample
        </Button>
        <Button variant={testType === "paired" ? "primary" : "outline"} onClick={() => setTestType("paired")}>
          Paired
        </Button>
        <Button variant={testType === "independent" ? "primary" : "outline"} onClick={() => setTestType("independent")}>
          Independent
        </Button>
      </div>

      <Card className="retro-card mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Significance Level (α):</label>
          <select
            className="p-2 border rounded bg-white dark:bg-gray-800"
            value={alpha}
            onChange={(e) => setAlpha(e.target.value)}
          >
            <option value="0.01">0.01</option>
            <option value="0.05">0.05</option>
            <option value="0.10">0.10</option>
          </select>
        </div>
      </Card>

      {testType === "one-sample" && (
        <section>
          <Card className="retro-card mb-6">
            <h2 className="text-xl font-bold mb-2">One-Sample t-Test</h2>
            <MathBlock formula="t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}}" />
            <p className="text-sm opacity-70 mt-2">
              Tests if the sample mean differs from a hypothesized population mean.
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <DataTableInput
              label="Sample Data"
              helpText="Enter your sample values"
              value={oneSampleData}
              onChange={setOneSampleData}
              minRows={5}
            />
            <div>
              <Input
                label="Hypothesized Mean (μ₀)"
                type="number"
                value={mu0}
                onChange={(e) => setMu0(e.target.value)}
                placeholder="e.g. 100"
              />
              <p className="text-xs opacity-70 mt-2">
                {oneSampleParsed.length} values detected
              </p>
            </div>
          </div>

          {error && <p className="text-red-500 mb-4 retro-blink">{error}</p>}
          <Button onClick={runOneSample}>Run One-Sample t-Test</Button>

          {oneSampleResult && (
            <div className="mt-6">
              <h3 className="text-xl mb-4">Results</h3>
              <Card className="retro-card mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold retro-fire">{formatNum(oneSampleResult.value.tStatistic)}</div>
                    <div className="text-xs opacity-70">t-statistic</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{oneSampleResult.value.df}</div>
                    <div className="text-xs opacity-70">df</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {oneSampleResult.value.tCritical ? `±${formatNum(oneSampleResult.value.tCritical)}` : "N/A"}
                    </div>
                    <div className="text-xs opacity-70">t-critical</div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4 mb-6">
                {oneSampleResult.steps.map((step) => (
                  <Card key={step.id} className="retro-card">
                    <h4 className="font-bold">{step.title}</h4>
                    {step.description && <pre className="text-sm whitespace-pre-wrap font-sans">{step.description}</pre>}
                    {step.formula && <MathBlock formula={step.formula} />}
                    {step.calculation && <MathBlock formula={step.calculation} />}
                    {step.note && <p className="text-sm opacity-80">{step.note}</p>}
                    {step.result && <p className="font-bold mt-1 retro-fire">= {step.result}</p>}
                  </Card>
                ))}
              </div>
              <CopyExamAnswer answer={resultToExamAnswer(oneSampleResult, "One-Sample t-Test")} />
            </div>
          )}
        </section>
      )}

      {testType === "paired" && (
        <section>
          <Card className="retro-card mb-6">
            <h2 className="text-xl font-bold mb-2">Paired t-Test</h2>
            <MathBlock formula="t = \frac{\bar{d}}{s_d / \sqrt{n}}" />
            <p className="text-sm opacity-70 mt-2">
              Tests if there's a significant difference between paired observations (before/after).
            </p>
          </Card>

          <DataTableInput
            label="Paired Data"
            helpText="Enter Before values in column 1, After values in column 2"
            value={pairedData}
            onChange={setPairedData}
            minRows={5}
            className="mb-6"
          />
          <p className="text-xs opacity-70 mb-4">
            Before: {pairedBefore.length} values, After: {pairedAfter.length} values
          </p>

          {error && <p className="text-red-500 mb-4 retro-blink">{error}</p>}
          <Button onClick={runPaired}>Run Paired t-Test</Button>

          {pairedResult && (
            <div className="mt-6">
              <h3 className="text-xl mb-4">Results</h3>
              <Card className="retro-card mb-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold retro-fire">{formatNum(pairedResult.value.tStatistic)}</div>
                    <div className="text-xs opacity-70">t-statistic</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{pairedResult.value.df}</div>
                    <div className="text-xs opacity-70">df</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatNum(pairedResult.value.meanDiff)}</div>
                    <div className="text-xs opacity-70">Mean Diff</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {pairedResult.value.tCritical ? `±${formatNum(pairedResult.value.tCritical)}` : "N/A"}
                    </div>
                    <div className="text-xs opacity-70">t-critical</div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4 mb-6">
                {pairedResult.steps.map((step) => (
                  <Card key={step.id} className="retro-card">
                    <h4 className="font-bold">{step.title}</h4>
                    {step.description && <pre className="text-sm whitespace-pre-wrap font-sans">{step.description}</pre>}
                    {step.formula && <MathBlock formula={step.formula} />}
                    {step.calculation && <MathBlock formula={step.calculation} />}
                    {step.note && <p className="text-sm opacity-80">{step.note}</p>}
                    {step.result && <p className="font-bold mt-1 retro-fire">= {step.result}</p>}
                  </Card>
                ))}
              </div>
              <CopyExamAnswer answer={resultToExamAnswer(pairedResult, "Paired t-Test")} />
            </div>
          )}
        </section>
      )}

      {testType === "independent" && (
        <section>
          <Card className="retro-card mb-6">
            <h2 className="text-xl font-bold mb-2">Independent Samples t-Test</h2>
            <MathBlock formula="t = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{s_p^2(\frac{1}{n_1} + \frac{1}{n_2})}}" />
            <p className="text-sm opacity-70 mt-2">
              Tests if two independent groups have different means.
            </p>
          </Card>

          <DataTableInput
            label="Two Groups"
            helpText="Enter Group 1 in column 1, Group 2 in column 2 (can have different n)"
            value={indepData}
            onChange={setIndepData}
            minRows={5}
            className="mb-6"
          />
          <p className="text-xs opacity-70 mb-4">
            Group 1: {indepGroup1.length} values, Group 2: {indepGroup2.length} values
          </p>

          {error && <p className="text-red-500 mb-4 retro-blink">{error}</p>}
          <Button onClick={runIndependent}>Run Independent t-Test</Button>

          {indepResult && (
            <div className="mt-6">
              <h3 className="text-xl mb-4">Results</h3>
              <Card className="retro-card mb-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold retro-fire">{formatNum(indepResult.value.tStatistic)}</div>
                    <div className="text-xs opacity-70">t-statistic</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{indepResult.value.df}</div>
                    <div className="text-xs opacity-70">df</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatNum(indepResult.value.pooledVariance)}</div>
                    <div className="text-xs opacity-70">Pooled Var</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {indepResult.value.tCritical ? `±${formatNum(indepResult.value.tCritical)}` : "N/A"}
                    </div>
                    <div className="text-xs opacity-70">t-critical</div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4 mb-6">
                {indepResult.steps.map((step) => (
                  <Card key={step.id} className="retro-card">
                    <h4 className="font-bold">{step.title}</h4>
                    {step.description && <pre className="text-sm whitespace-pre-wrap font-sans">{step.description}</pre>}
                    {step.formula && <MathBlock formula={step.formula} />}
                    {step.calculation && <MathBlock formula={step.calculation} />}
                    {step.note && <p className="text-sm opacity-80">{step.note}</p>}
                    {step.result && <p className="font-bold mt-1 retro-fire">= {step.result}</p>}
                  </Card>
                ))}
              </div>
              <CopyExamAnswer answer={resultToExamAnswer(indepResult, "Independent Samples t-Test")} />
            </div>
          )}
        </section>
      )}
    </main>
  );
}
