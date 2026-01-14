import { useState, useMemo } from "react";
import type { Route } from "./+types/stats-stuff.descriptive";
import { Link } from "react-router";

import { descriptiveStatsWithSteps, type DescriptiveStats } from "~/lib/math/descriptive";
import { CopyExamAnswer } from "~/components/calculator/CopyExamAnswer";
import { DataTableInput, type DataTableValue } from "~/components/calculator/DataTableInput";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import type { CalculationResult } from "~/lib/types/calculation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stats Stuff | Descriptive Statistics" },
    { name: "description", content: "Calculate mean, median, mode, variance, and standard deviation with step-by-step workings." },
  ];
}

function resultToExamAnswer(calc: CalculationResult<DescriptiveStats>): ExamAnswer {
  return {
    title: "Descriptive Statistics Calculation",
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
    finalAnswer: [
      `n = ${calc.value.n}`,
      `Mean = ${formatNum(calc.value.mean)}`,
      `Median = ${formatNum(calc.value.median)}`,
      `Mode = ${calc.value.mode.length > 0 ? calc.value.mode.join(", ") : "No mode"}`,
      `Sample SD = ${formatNum(calc.value.standardDeviation.sample)}`,
      `Population SD = ${formatNum(calc.value.standardDeviation.population)}`,
    ].join("\n"),
  };
}

function formatNum(num: number, decimals = 4): string {
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function parseData(tableValue: DataTableValue): number[] {
  const values: number[] = [];
  for (const row of tableValue.rows) {
    for (const cell of row) {
      const trimmed = cell.trim();
      if (trimmed === "") continue;
      const num = Number(trimmed);
      if (Number.isFinite(num)) {
        values.push(num);
      }
    }
  }
  return values;
}

export default function DescriptiveCalculator() {
  const [tableData, setTableData] = useState<DataTableValue>({
    columns: ["Data"],
    rows: [[""], [""], [""], [""], [""]],
  });

  const [result, setResult] = useState<CalculationResult<DescriptiveStats> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsedData = useMemo(() => parseData(tableData), [tableData]);

  function calculate() {
    setError(null);
    setResult(null);

    if (parsedData.length === 0) {
      setError("Enter some numbers first, genius. The calculator can't read your mind.");
      return;
    }

    if (parsedData.length === 1) {
      setError("One data point? That's not a dataset, that's loneliness. Enter at least 2 values.");
      return;
    }

    const calc = descriptiveStatsWithSteps(parsedData);
    setResult(calc);
  }

  function loadSampleData() {
    setTableData({
      columns: ["Data"],
      rows: [["12"], ["15"], ["18"], ["22"], ["25"], ["28"], ["30"], ["35"], [""]],
    });
    setResult(null);
    setError(null);
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 fade-in">
          <Link
            to="/"
            className="text-sm text-[var(--color-ink-light)] hover:text-[var(--color-ink)] transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1
            className="text-4xl font-medium tracking-tight mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Descriptive Statistics
          </h1>
          <p className="text-[var(--color-ink-light)]">
            Calculate mean, median, mode, variance, and standard deviation with step-by-step workings.
          </p>
        </header>

        <Card className="mb-8 bg-[var(--color-accent-blue)] fade-in" style={{ animationDelay: "50ms" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <MathBlock formula="\bar{x} = \frac{\Sigma x}{n}" />
              <p className="text-center text-xs text-[var(--color-ink-light)] mt-1">Mean</p>
            </div>
            <div>
              <MathBlock formula="\sigma^2 = \frac{\Sigma(x - \bar{x})^2}{n}" />
              <p className="text-center text-xs text-[var(--color-ink-light)] mt-1">Population Variance</p>
            </div>
            <div>
              <MathBlock formula="s^2 = \frac{\Sigma(x - \bar{x})^2}{n-1}" />
              <p className="text-center text-xs text-[var(--color-ink-light)] mt-1">Sample Variance</p>
            </div>
          </div>
        </Card>

        <section className="mb-8 fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-4 mb-4">
            <Button variant="secondary" onClick={loadSampleData}>
              Load Sample Data
            </Button>
            <span className="text-sm text-[var(--color-ink-light)]">
              {parsedData.length} valid number{parsedData.length !== 1 ? "s" : ""} detected
            </span>
          </div>

          <DataTableInput
            label="Enter Your Data"
            helpText="Type values directly or paste from Excel/Google Sheets. All numeric values will be used."
            value={tableData}
            onChange={setTableData}
            minRows={5}
          />

          {error && (
            <p className="text-red-600 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <Button className="mt-4" onClick={calculate}>
            Calculate Stats
          </Button>
        </section>

        {result && (
          <section className="fade-in" style={{ animationDelay: "150ms" }}>
            <h2
              className="text-2xl font-medium mb-6"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Step-by-Step Working
            </h2>

            <Card className="mb-6 bg-[var(--color-accent-mint)]">
              <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                Quick Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-[var(--color-dot-mint)]">
                    {formatNum(result.value.mean)}
                  </div>
                  <div className="text-xs text-[var(--color-ink-light)]">Mean (x̄)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--color-ink)]">
                    {formatNum(result.value.median)}
                  </div>
                  <div className="text-xs text-[var(--color-ink-light)]">Median</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--color-ink)]">
                    {result.value.mode.length > 0 ? result.value.mode.join(", ") : "None"}
                  </div>
                  <div className="text-xs text-[var(--color-ink-light)]">Mode</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--color-ink)]">
                    {formatNum(result.value.standardDeviation.sample)}
                  </div>
                  <div className="text-xs text-[var(--color-ink-light)]">Sample SD (s)</div>
                </div>
              </div>
            </Card>

            <div className="space-y-4 mb-6">
              {result.steps.map((step) => (
                <div
                  key={step.id}
                  className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]"
                >
                  <h4 className="font-semibold text-sm mb-2">{step.title}</h4>
                  {step.description && (
                    <pre className="text-xs whitespace-pre-wrap font-sans text-[var(--color-ink-light)] mb-2">
                      {step.description}
                    </pre>
                  )}
                  {step.formula && <MathBlock formula={step.formula} className="my-2" />}
                  {step.calculation && <MathBlock formula={step.calculation} className="my-2" />}
                  {step.note && (
                    <p className="text-xs text-[var(--color-ink-light)] mt-1">
                      {step.note}
                    </p>
                  )}
                  {step.result && (
                    <p className="text-lg font-bold mt-2 text-[var(--color-dot-blue)]">
                      = {step.result}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <CopyExamAnswer answer={resultToExamAnswer(result)} />
          </section>
        )}
      </div>
    </main>
  );
}
