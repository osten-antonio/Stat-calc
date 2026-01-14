import { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/stats-stuff.t-tests";
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
    { title: "Stats Stuff | T-Tests" },
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
    if (!row[colIndex]) continue;
    const trimmed = row[colIndex]!.trim();
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
  const [selectedGroups, setSelectedGroups] = useState<[number, number]>([0, 1]);
  const [indepResult, setIndepResult] = useState<CalculationResult<IndependentTTestResult> | null>(null);

  const [error, setError] = useState<string | null>(null);

  const oneSampleParsed = useMemo(() => parseData(oneSampleData, 0), [oneSampleData]);
  const pairedBefore = useMemo(() => parseData(pairedData, 0), [pairedData]);
  const pairedAfter = useMemo(() => parseData(pairedData, 1), [pairedData]);
  const indepParsedColumns = useMemo(() => indepData.columns.map((_, idx) => parseData(indepData, idx)), [indepData]);
  const indepGroup1 = indepParsedColumns[selectedGroups[0]] ?? [];
  const indepGroup2 = indepParsedColumns[selectedGroups[1]] ?? [];
  const extraGroupsCount = Math.max(0, indepData.columns.length - 2);

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

  useEffect(() => {
    setSelectedGroups((prev) => {
      const maxIndex = Math.max(0, indepData.columns.length - 1);
      const first = Math.min(prev[0], maxIndex);
      const second = Math.min(prev[1], maxIndex);
      if (first === second && maxIndex >= 1) {
        return [0, 1];
      }
      if (first === second && maxIndex === 0) {
        return [0, 0];
      }
      return [first, second];
    });
  }, [indepData.columns.length]);

  function runIndependent() {
    setError(null);
    setIndepResult(null);

    if (indepData.columns.length < 2) {
      setError("Add at least two columns to compare independent groups.");
      return;
    }
    if (selectedGroups[0] === selectedGroups[1]) {
      setError("Select two different columns to compare.");
      return;
    }
    if (indepGroup1.length < 2 || indepGroup2.length < 2) {
      setError("Need at least 2 values in each selected group.");
      return;
    }

    const result = independentTTestWithSteps(indepGroup1, indepGroup2, parseFloat(alpha));
    setIndepResult(result);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 font-sans text-[var(--color-ink)]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 fade-in">
          <Link
            to="/"
            className="text-sm font-medium text-[var(--color-ink-light)] hover:text-[var(--color-dot-mint)] transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1
            className="text-5xl font-medium tracking-tight mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            T-Tests
          </h1>
          <p className="text-lg text-[var(--color-ink-light)] max-w-2xl">
            One-sample, paired, and independent samples t-tests with full step-by-step workings.
          </p>
        </header>

        <section className="mb-10 fade-in" style={{ animationDelay: "50ms" }}>
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              tone={testType === "one-sample" ? "mint" : undefined}
              variant={testType === "one-sample" ? "primary" : "secondary"}
              onClick={() => setTestType("one-sample")}
            >
              One-Sample
            </Button>
            <Button
              tone={testType === "paired" ? "mint" : undefined}
              variant={testType === "paired" ? "primary" : "secondary"}
              onClick={() => setTestType("paired")}
            >
              Paired
            </Button>
            <Button
              tone={testType === "independent" ? "mint" : undefined}
              variant={testType === "independent" ? "primary" : "secondary"}
              onClick={() => setTestType("independent")}
            >
              Independent
            </Button>
          </div>

          <Card className="mb-6 bg-[var(--color-accent-mint)] border-none">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Significance Level (α):</label>
              <select
                className="p-2 border rounded bg-white/70 border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-mint)]"
                value={alpha}
                onChange={(e) => setAlpha(e.target.value)}
              >
                <option value="0.01">0.01 (1%)</option>
                <option value="0.05">0.05 (5%)</option>
                <option value="0.10">0.10 (10%)</option>
              </select>
            </div>
          </Card>
        </section>

        {testType === "one-sample" && (
          <section className="fade-in" style={{ animationDelay: "100ms" }}>
            <Card className="mb-6 bg-[var(--color-accent-mint)] border-none">
              <h2
                className="text-xl font-medium mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                One-Sample t-Test
              </h2>
               <MathBlock formula="t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}}" />

              <p className="text-sm text-[var(--color-ink-light)] mt-2">
                Tests if the sample mean differs from a hypothesized population mean.
              </p>
            </Card>

            <div className="space-y-4 mb-6">
              <div>
                <Input
                  label="Hypothesized Mean (μ₀)"
                  type="number"
                  value={mu0}
                  onChange={(e) => setMu0(e.target.value)}
                  placeholder="e.g. 100"
                />
               <p className="text-xs text-[var(--color-ink-light)] mt-2">
                 {oneSampleParsed.length} values detected
               </p>
               <p className="text-xs text-[var(--color-ink-light)]">
                 Formula: t = (x̄ − μ₀) / (s / √n)
               </p>

              </div>

              <Card className="p-4 border border-gray-100 shadow-sm">
              <DataTableInput
                label="Sample Data"
                helpText="Enter your sample values"
                value={oneSampleData}
                onChange={setOneSampleData}
                minRows={5}
                tone="mint"
                controlsPlacement="bottom"
              />

              </Card>
            </div>

            {error && (
              <p className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                {error}
              </p>
            )}
            <Button tone="mint" className="w-full md:w-auto" onClick={runOneSample}>
              Calculate One-Sample t-Test
            </Button>

            {oneSampleResult && (
              <div className="mt-8 fade-in space-y-6" style={{ animationDelay: "150ms" }}>
                <h3
                  className="text-2xl font-medium"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Results
                </h3>
                <Card className="bg-[var(--color-accent-mint)] border-none">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-dot-mint)]">
                        {formatNum(oneSampleResult.value.tStatistic)}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">t-statistic</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-ink)]">
                        {oneSampleResult.value.df}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">df</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-ink)]">
                        {oneSampleResult.value.tCritical
                          ? `±${formatNum(oneSampleResult.value.tCritical)}`
                          : "N/A"}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">t-critical</div>
                    </div>
                  </div>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                  <h4
                    className="font-semibold mb-4"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Step-by-Step Working
                  </h4>
                  <div className="space-y-4">
                    {oneSampleResult.steps.map((step) => (
                      <div
                        key={step.id}
                        className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm"
                      >
                        <h5 className="font-semibold text-base mb-2">{step.title}</h5>
                        {step.description && (
                          <pre className="text-sm whitespace-pre-wrap font-sans text-[var(--color-ink-light)] mb-2">
                            {step.description}
                          </pre>
                        )}
                        {step.formula && <MathBlock formula={step.formula} className="my-2" />}
                        {step.calculation && <MathBlock formula={step.calculation} className="my-2" />}
                        {step.note && (
                          <p className="text-sm text-[var(--color-ink-light)] mb-1">
                            {step.note}
                          </p>
                        )}
                        {step.result && (
                          <p className="font-bold text-[var(--color-dot-mint)]">
                            = {step.result}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
                <CopyExamAnswer answer={resultToExamAnswer(oneSampleResult, "One-Sample t-Test")} />
              </div>
            )}
          </section>
        )}

        {testType === "paired" && (
          <section className="fade-in" style={{ animationDelay: "100ms" }}>
            <Card className="mb-6 bg-[var(--color-accent-mint)] border-none">
              <h2
                className="text-xl font-medium mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Paired t-Test
              </h2>
               <MathBlock formula="t = \frac{\bar{d}}{s_d / \sqrt{n}}" />

              <p className="text-sm text-[var(--color-ink-light)] mt-2">
                Tests if there's a significant difference between paired observations (before/after).
              </p>
            </Card>

            <div className="mb-6">
              <DataTableInput
                label="Paired Data"
                helpText="Enter Before values in column 1, After values in column 2"
                value={pairedData}
                onChange={setPairedData}
                minRows={5}
                tone="mint"
                controlsPlacement="bottom"
                maxColumns={2}
              />
              <p className="text-xs text-[var(--color-ink-light)] mt-2">
                Before: {pairedBefore.length} values, After: {pairedAfter.length} values
              </p>
            </div>

            {error && (
              <p className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                {error}
              </p>
            )}
            <Button tone="mint" className="w-full md:w-auto" onClick={runPaired}>
              Calculate Paired t-Test
            </Button>

            {pairedResult && (
              <div className="mt-8 fade-in space-y-6" style={{ animationDelay: "150ms" }}>
                <h3
                  className="text-2xl font-medium"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Results
                </h3>
                <Card className="bg-[var(--color-accent-mint)] border-none">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-dot-mint)]">
                        {formatNum(pairedResult.value.tStatistic)}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">t-statistic</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-ink)]">
                        {pairedResult.value.df}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">df</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-ink)]">
                        {formatNum(pairedResult.value.meanDiff)}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">Mean Diff</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-ink)]">
                        {pairedResult.value.tCritical
                          ? `±${formatNum(pairedResult.value.tCritical)}`
                          : "N/A"}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">t-critical</div>
                    </div>
                  </div>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                  <h4
                    className="font-semibold mb-4"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Step-by-Step Working
                  </h4>
                  <div className="space-y-4">
                    {pairedResult.steps.map((step) => (
                      <div
                        key={step.id}
                        className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm"
                      >
                        <h5 className="font-semibold text-base mb-2">{step.title}</h5>
                        {step.description && (
                          <pre className="text-sm whitespace-pre-wrap font-sans text-[var(--color-ink-light)] mb-2">
                            {step.description}
                          </pre>
                        )}
                        {step.formula && <MathBlock formula={step.formula} className="my-2" />}
                        {step.calculation && <MathBlock formula={step.calculation} className="my-2" />}
                        {step.note && (
                          <p className="text-sm text-[var(--color-ink-light)] mb-1">
                            {step.note}
                          </p>
                        )}
                        {step.result && (
                          <p className="font-bold text-[var(--color-dot-mint)]">
                            = {step.result}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
                <CopyExamAnswer answer={resultToExamAnswer(pairedResult, "Paired t-Test")} />
              </div>
            )}
          </section>
        )}

        {testType === "independent" && (
          <section className="fade-in" style={{ animationDelay: "100ms" }}>
            <Card className="mb-6 bg-[var(--color-accent-mint)] border-none">
              <h2
                className="text-xl font-medium mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Independent Samples t-Test
              </h2>
               <MathBlock formula="t = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{s_p^2\left(\tfrac{1}{n_1} + \tfrac{1}{n_2}\right)}}" />

              <p className="text-sm text-[var(--color-ink-light)] mt-2">
                Tests if two independent groups have different means.
              </p>
            </Card>

            <div className="mb-6 space-y-3">
              <DataTableInput
                label="Groups"
                helpText="Enter each group in its own column; add columns for more groups"
                value={indepData}
                onChange={setIndepData}
                minRows={5}
                tone="mint"
                controlsPlacement="bottom"
              />

              <Card className="p-4 border border-gray-100 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1 text-sm text-[var(--color-ink-light)]">
                    <div>Group 1: {indepGroup1.length} values</div>
                    <div>Group 2: {indepGroup2.length} values</div>
                    {extraGroupsCount > 0 ? (
                      <div className="text-[var(--color-ink-light)]">
                        {extraGroupsCount} additional column{extraGroupsCount === 1 ? "" : "s"} captured; select which two to compare below.
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-sm font-medium">Compare:</label>
                    <select
                      className="p-2 border rounded bg-white border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-mint)]"
                      value={selectedGroups[0]}
                      onChange={(e) => setSelectedGroups([Number(e.target.value), selectedGroups[1]])}
                    >
                      {indepData.columns.map((col, idx) => (
                        <option key={col || idx} value={idx}>
                          {col || `Col ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm text-[var(--color-ink-light)]">vs</span>
                    <select
                      className="p-2 border rounded bg-white border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-mint)]"
                      value={selectedGroups[1]}
                      onChange={(e) => setSelectedGroups([selectedGroups[0], Number(e.target.value)])}
                    >
                      {indepData.columns.map((col, idx) => (
                        <option key={col || idx} value={idx} disabled={idx === selectedGroups[0]}>
                          {col || `Col ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            </div>

            {error && (
              <p className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                {error}
              </p>
            )}
            <Button tone="mint" className="w-full md:w-auto" onClick={runIndependent}>
              Calculate Independent t-Test
            </Button>

            {indepResult && (
              <div className="mt-8 fade-in space-y-6" style={{ animationDelay: "150ms" }}>
                <h3
                  className="text-2xl font-medium"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Results
                </h3>
                <Card className="bg-[var(--color-accent-mint)] border-none">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-dot-mint)]">
                        {formatNum(indepResult.value.tStatistic)}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">t-statistic</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-ink)]">
                        {indepResult.value.df}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">df</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-ink)]">
                        {formatNum(indepResult.value.pooledVariance)}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">Pooled Var</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-ink)]">
                        {indepResult.value.tCritical
                          ? `±${formatNum(indepResult.value.tCritical)}`
                          : "N/A"}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">t-critical</div>
                    </div>
                  </div>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                  <h4
                    className="font-semibold mb-4"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Step-by-Step Working
                  </h4>
                  <div className="space-y-4">
                    {indepResult.steps.map((step) => (
                      <div
                        key={step.id}
                        className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm"
                      >
                        <h5 className="font-semibold text-base mb-2">{step.title}</h5>
                        {step.description && (
                          <pre className="text-sm whitespace-pre-wrap font-sans text-[var(--color-ink-light)] mb-2">
                            {step.description}
                          </pre>
                        )}
                        {step.formula && <MathBlock formula={step.formula} className="my-2" />}
                        {step.calculation && <MathBlock formula={step.calculation} className="my-2" />}
                        {step.note && (
                          <p className="text-sm text-[var(--color-ink-light)] mb-1">
                            {step.note}
                          </p>
                        )}
                        {step.result && (
                          <p className="font-bold text-[var(--color-dot-mint)]">
                            = {step.result}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
                <CopyExamAnswer answer={resultToExamAnswer(indepResult, "Independent Samples t-Test")} />
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
