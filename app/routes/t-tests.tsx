import { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/t-tests";
import { Link } from "react-router";

import {
  oneSampleTTestWithSteps,
  pairedTTestWithSteps,
  independentTTestWithSteps,
  independentTTestFromStats,
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

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "T-Tests" },
    { name: "description", content: "One-sample, paired, and independent t-tests with step-by-step workings." },
  ];
}

type TestType = "one-sample" | "paired" | "independent";
type InputMode = "data" | "stats";

function formatNum(num: number, decimals = 4): string {
  if (!Number.isFinite(num)) return "N/A";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function parseData(tableValue: DataTableValue, colIndex: number = 0): number[] {
  const values: number[] = [];
  for (const row of tableValue.rows) {
    if (!row[colIndex]) continue;

    // Support comma or space separated values in a single cell
    const cellContent = row[colIndex]!;
    const parts = cellContent.split(/[\s,]+/).filter(Boolean);

    for (const part of parts) {
      const num = Number(part);
      if (Number.isFinite(num)) values.push(num);
    }
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
    finalAnswer: calc.steps.find((s) => s.id === "decision" || s.id === "conclusion")?.result ?? "See above",
  };
}

export default function TTestsPage() {
  const [testType, setTestType] = useState<TestType>("one-sample");
  const [alpha, setAlpha] = useState("0.05");

  // One Sample State
  const [oneSampleData, setOneSampleData] = useState<DataTableValue>({
    columns: ["Sample"],
    rows: [[""], [""], [""], [""], [""]],
  });
  const [mu0, setMu0] = useState("");
  const [oneSampleResult, setOneSampleResult] = useState<CalculationResult<OneSampleTTestResult> | null>(null);

  // Paired State
  const [pairedData, setPairedData] = useState<DataTableValue>({
    columns: ["Before", "After"],
    rows: [["", ""], ["", ""], ["", ""], ["", ""], ["", ""]],
  });
  const [pairedResult, setPairedResult] = useState<CalculationResult<PairedTTestResult> | null>(null);

  // Independent State
  const [indepMode, setIndepMode] = useState<InputMode>("data");
  const [indepAlpha, setIndepAlpha] = useState(0.05);
  const [indepTails, setIndepTails] = useState<1 | 2>(2);

  // Data Mode State
  const [indepData, setIndepData] = useState<DataTableValue>({
    columns: ["Group 1", "Group 2"],
    rows: [["", ""], ["", ""], ["", ""], ["", ""], ["", ""]],
  });
  const [selectedGroups, setSelectedGroups] = useState<[number, number]>([0, 1]);

  // Stats Mode State
  const [stats1, setStats1] = useState({ n: "", mean: "", sd: "" });
  const [stats2, setStats2] = useState({ n: "", mean: "", sd: "" });

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

    if (indepMode === "data") {
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

      const result = independentTTestWithSteps(indepGroup1, indepGroup2, indepAlpha, indepTails);
      setIndepResult(result);
    } else {
      // Stats Mode Validation
      const n1 = parseFloat(stats1.n);
      const m1 = parseFloat(stats1.mean);
      const s1 = parseFloat(stats1.sd);
      const n2 = parseFloat(stats2.n);
      const m2 = parseFloat(stats2.mean);
      const s2 = parseFloat(stats2.sd);

      if ([n1, m1, s1, n2, m2, s2].some(isNaN)) {
        setError("Please enter all statistical values (n, Mean, SD) for both groups.");
        return;
      }
      if (n1 < 2 || n2 < 2) {
        setError("Sample sizes must be at least 2.");
        return;
      }
      if (s1 < 0 || s2 < 0) {
        setError("Standard deviations cannot be negative.");
        return;
      }

      const result = independentTTestFromStats(
        { n: n1, mean: m1, sd: s1 },
        { n: n2, mean: m2, sd: s2 },
        indepAlpha,
        indepTails
      );
      setIndepResult(result);
    }
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

            <div className="mb-6">
              <div className="flex gap-4 border-b border-gray-200 mb-6">
                <button
                  className={`pb-2 text-sm font-medium transition-colors border-b-2 ${indepMode === 'data' ? 'border-[var(--color-dot-mint)] text-[var(--color-dot-mint)]' : 'border-transparent text-[var(--color-ink-light)] hover:text-[var(--color-ink)]'}`}
                  onClick={() => setIndepMode('data')}
                >
                  Enter Raw Data
                </button>
                <button
                  className={`pb-2 text-sm font-medium transition-colors border-b-2 ${indepMode === 'stats' ? 'border-[var(--color-dot-mint)] text-[var(--color-dot-mint)]' : 'border-transparent text-[var(--color-ink-light)] hover:text-[var(--color-ink)]'}`}
                  onClick={() => setIndepMode('stats')}
                >
                  Enter Statistics
                </button>
              </div>

              {indepMode === "data" ? (
                <div className="space-y-3">
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
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 border border-gray-100 shadow-sm space-y-4">
                    <h3 className="font-medium text-lg border-b pb-2 mb-4">Group 1 Statistics</h3>
                    <Input
                      label="Sample Size (n₁)"
                      type="number"
                      value={stats1.n}
                      onChange={(e) => setStats1({ ...stats1, n: e.target.value })}
                      placeholder="e.g. 25"
                    />
                    <Input
                      label="Sample Mean (x̄₁)"
                      type="number"
                      value={stats1.mean}
                      onChange={(e) => setStats1({ ...stats1, mean: e.target.value })}
                      placeholder="e.g. 8"
                    />
                    <Input
                      label="Sample Std Dev (s₁)"
                      type="number"
                      value={stats1.sd}
                      onChange={(e) => setStats1({ ...stats1, sd: e.target.value })}
                      placeholder="e.g. 2"
                    />
                  </Card>

                  <Card className="p-6 border border-gray-100 shadow-sm space-y-4">
                    <h3 className="font-medium text-lg border-b pb-2 mb-4">Group 2 Statistics</h3>
                    <Input
                      label="Sample Size (n₂)"
                      type="number"
                      value={stats2.n}
                      onChange={(e) => setStats2({ ...stats2, n: e.target.value })}
                      placeholder="e.g. 25"
                    />
                    <Input
                      label="Sample Mean (x̄₂)"
                      type="number"
                      value={stats2.mean}
                      onChange={(e) => setStats2({ ...stats2, mean: e.target.value })}
                      placeholder="e.g. 6"
                    />
                    <Input
                      label="Sample Std Dev (s₂)"
                      type="number"
                      value={stats2.sd}
                      onChange={(e) => setStats2({ ...stats2, sd: e.target.value })}
                      placeholder="e.g. 2.5"
                    />
                  </Card>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-6 items-end mb-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-light)] mb-1">
                  Significance Level (α)
                </label>
                <select
                  value={indepAlpha}
                  onChange={(e) => setIndepAlpha(Number(e.target.value))}
                  className="p-2 rounded border border-[var(--color-border)] bg-white text-sm"
                >
                  <option value={0.1}>0.10</option>
                  <option value={0.05}>0.05</option>
                  <option value={0.01}>0.01</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-light)] mb-1">
                  Tail Type
                </label>
                <div className="flex bg-white rounded border border-[var(--color-border)] overflow-hidden">
                  <button
                    onClick={() => setIndepTails(1)}
                    className={`px-3 py-2 text-sm transition-colors ${indepTails === 1 ? 'bg-[var(--color-accent-mint)] text-[var(--color-dot-mint)] font-medium' : 'hover:bg-gray-50'}`}
                  >
                    One-tailed
                  </button>
                  <div className="w-px bg-gray-200"></div>
                  <button
                    onClick={() => setIndepTails(2)}
                    className={`px-3 py-2 text-sm transition-colors ${indepTails === 2 ? 'bg-[var(--color-accent-mint)] text-[var(--color-dot-mint)] font-medium' : 'hover:bg-gray-50'}`}
                  >
                    Two-tailed
                  </button>
                </div>
              </div>
              <Button tone="mint" className="w-full md:w-auto ml-auto" onClick={runIndependent}>
                Calculate Independent t-Test
              </Button>
            </div>

            <p className="text-xs text-[var(--color-ink-light)] mt-2 mb-4 italic">
              <strong>Two-Tailed Test:</strong> Use when you want to know if there's any difference between two group means (e.g., "Is Group A different from Group B?").<br />
              <strong>One-Tailed Test:</strong> Use only when you predict a specific direction (e.g., "Is the mean of Group A greater than Group B?").
            </p>

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
                        {indepResult.value.pooledVariance > 0
                          ? formatNum(indepResult.value.pooledVariance)
                          : "N/A"}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">
                        {indepResult.value.pooledVariance > 0 ? "Pooled Var" : "Pooled Var (N/A)"}
                      </div>
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
