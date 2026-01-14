import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/regression";

import { linearRegressionWithSteps, predictY, type LinearRegressionResult } from "~/lib/math/regression";
import { CopyExamAnswer } from "~/components/calculator/CopyExamAnswer";
import { DataTableInput, type DataTableValue } from "~/components/calculator/DataTableInput";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";
import { MathInline } from "~/components/math/MathInline";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import type { CalculationResult } from "~/lib/types/calculation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Linear Regression" },
    { name: "description", content: "Simple linear regression calculator with step-by-step solutions." },
  ];
}

function formatNum(num: number, decimals = 4): string {
  if (!Number.isFinite(num)) return "N/A";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function parseColumn(tableValue: DataTableValue, colIndex: number): number[] {
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

function resultToExamAnswer(calc: CalculationResult<LinearRegressionResult>): ExamAnswer {
  return {
    title: "Linear Regression Analysis",
    sections: calc.steps.map((step) => ({
      title: step.title,
      lines: [
        step.description ?? "",
        step.formula ? `Formula: ${step.formula}` : "",
        step.calculation ?? "",
        step.note ? `${step.note}` : "",
        step.result ? `Result: ${step.result}` : "",
      ].filter(Boolean),
    })),
    finalAnswer: [
      `Regression Equation: ${calc.value.equation}`,
      ``,
      `Slope (b) = ${formatNum(calc.value.slope)}`,
      `Intercept (a) = ${formatNum(calc.value.intercept)}`,
      ``,
      `Correlation (r) = ${formatNum(calc.value.r)}`,
      `R-squared (r²) = ${formatNum(calc.value.rSquared)} (${formatNum(calc.value.rSquared * 100, 1)}%)`,
      ``,
      `Standard Error of Estimate = ${formatNum(calc.value.standardErrorEstimate)}`,
      `Standard Error of Slope = ${formatNum(calc.value.standardErrorSlope)}`,
      `t-statistic = ${formatNum(calc.value.tStatistic)}`,
      ``,
      `The slope is ${calc.value.isSignificant ? "" : "NOT "}statistically significant at α = 0.05.`,
    ].join("\n"),
  };
}

export default function RegressionPage() {
  const [tableData, setTableData] = useState<DataTableValue>({
    columns: ["X", "Y"],
    rows: [["", ""], ["", ""], ["", ""], ["", ""], ["", ""]],
  });

  const [result, setResult] = useState<CalculationResult<LinearRegressionResult> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [predictX, setPredictX] = useState("");
  const [predictedY, setPredictedY] = useState<{ yPred: number; equation: string } | null>(null);
  const [alpha] = useState(0.05);

  const xValues = useMemo(() => parseColumn(tableData, 0), [tableData]);
  const yValues = useMemo(() => parseColumn(tableData, 1), [tableData]);

  function runRegression() {
    setError(null);
    setResult(null);
    setPredictedY(null);

    if (xValues.length < 2) {
      setError("Need at least 2 X values.");
      return;
    }
    if (yValues.length < 2) {
      setError("Need at least 2 Y values.");
      return;
    }
    if (xValues.length !== yValues.length) {
      setError(`X has ${xValues.length} values, Y has ${yValues.length}. They must match.`);
      return;
    }

    const calc = linearRegressionWithSteps(xValues, yValues, alpha);
    setResult(calc);
  }

  function predict() {
    if (!result) return;
    const x = parseFloat(predictX);
    if (isNaN(x)) {
      setPredictedY(null);
      return;
    }
    const prediction = predictY(result.value.slope, result.value.intercept, x);
    setPredictedY(prediction);
  }

  function loadSampleData() {
    setTableData({
      columns: ["X (Hours)", "Y (Score)"],
      rows: [
        ["1", "52"],
        ["2", "59"],
        ["3", "62"],
        ["4", "64"],
        ["5", "72"],
        ["6", "80"],
        ["7", "74"],
        ["8", "83"],
        ["9", "91"],
        ["10", "89"],
        ["", ""],
      ],
    });
    setResult(null);
    setError(null);
    setPredictedY(null);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 font-sans text-[var(--color-ink)]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 fade-in">
          <Link
            to="/"
            className="text-sm font-medium text-[var(--color-ink-light)] hover:text-[var(--color-dot-blue)] transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>

          <h1
            className="text-5xl font-medium tracking-tight mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Linear Regression
          </h1>
          <p className="text-lg text-[var(--color-ink-light)] max-w-2xl">
            Calculate slope, intercept, correlation (<MathInline formula="r" />), <MathInline formula="R^2" />, and test for significance.
          </p>
        </header>

        <Card
          className="mb-10 bg-[var(--color-accent-blue)] border-none fade-in"
          style={{ animationDelay: "50ms" }}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <MathBlock formula="\hat{y} = a + bx" />
              <p className="text-center text-xs text-[var(--color-ink-light)]">Regression Equation</p>
            </div>
            <div>
              <MathBlock formula="r = \frac{n\Sigma xy - \Sigma x \Sigma y}{\sqrt{[n\Sigma x^2 - (\Sigma x)^2][n\Sigma y^2 - (\Sigma y)^2]}}" />
              <p className="text-center text-xs text-[var(--color-ink-light)]">Correlation Coefficient</p>
            </div>
          </div>
        </Card>

        <section className="mb-12 fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-4 mb-4">
            <Button variant="secondary" onClick={loadSampleData}>
              Load Sample Data
            </Button>
            <span className="text-sm text-[var(--color-ink-light)]">
              X: {xValues.length} values, Y: {yValues.length} values
            </span>
          </div>

          <Card className="p-4 border border-gray-100 shadow-sm">
            <DataTableInput
              label="Enter X and Y Data"
              helpText="X in first column, Y in second column. Paste from Excel/Sheets."
              value={tableData}
              onChange={setTableData}
              minRows={5}
              tone="blue"
              controlsPlacement="bottom"
              maxColumns={2}
            />
          </Card>

          {error && (
            <p className="text-red-600 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <Button className="mt-6 w-full md:w-auto" tone="blue" onClick={runRegression}>
            Calculate Regression
          </Button>
        </section>

        {result && (
          <section className="fade-in space-y-10" style={{ animationDelay: "150ms" }}>
            <h2
              className="text-3xl font-medium"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Results
            </h2>

            <Card className="bg-[var(--color-accent-blue)] border-none">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-[var(--color-dot-blue)]">
                    {formatNum(result.value.slope)}
                  </div>
                  <div className="text-xs text-[var(--color-ink-light)]">Slope (<MathInline formula="b" />)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--color-ink)]">
                    {formatNum(result.value.intercept)}
                  </div>
                  <div className="text-xs text-[var(--color-ink-light)]">Intercept (<MathInline formula="a" />)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--color-ink)]">
                    {formatNum(result.value.r)}
                  </div>
                  <div className="text-xs text-[var(--color-ink-light)]">Correlation (<MathInline formula="r" />)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--color-ink)]">
                    {formatNum(result.value.rSquared)}
                  </div>
                   <div className="text-xs text-[var(--color-ink-light)]">
                     <MathInline formula="R^2" /> ({formatNum(result.value.rSquared * 100, 1)}%)
                   </div>

                </div>
              </div>
              <div className="mt-6 text-center">
                <MathBlock
                  formula={`\\hat{y} = ${formatNum(result.value.slope)}x ${result.value.intercept >= 0 ? "+" : "-"} ${formatNum(Math.abs(result.value.intercept))}`}
                />
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border border-gray-100 shadow-sm">
                <h3 className="font-semibold mb-3" style={{ fontFamily: "var(--font-serif)" }}>
                  Statistical Significance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-sm text-[var(--color-ink-light)]"><MathInline formula="t_{stat}" /></span>
                    <span className="font-mono font-bold">{formatNum(result.value.tStatistic)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-sm text-[var(--color-ink-light)]"><MathInline formula="df" /></span>
                    <span className="font-mono">{result.value.df}</span>
                  </div>
                  {result.value.tCritical && (
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                       <span className="text-sm text-[var(--color-ink-light)]"><MathInline formula="t_{crit}" /> (<MathInline formula="\alpha=0.05" />)</span>
                       <span className="font-mono">±{formatNum(result.value.tCritical)}</span>
                    </div>
                  )}
                   <div className={`mt-4 p-3 rounded text-center font-bold border-2 ${result.value.isSignificant ? "border-green-200 bg-green-50 text-green-700" : "border-orange-200 bg-orange-50 text-orange-700"}`}>
                     {result.value.isSignificant
                       ? "Significant Relationship"
                       : "Not Significant"}
                   </div>
                </div>
              </Card>

              <Card className="bg-white border border-gray-100 shadow-sm">
                <h3 className="font-semibold mb-3" style={{ fontFamily: "var(--font-serif)" }}>
                  Predict Y for X
                </h3>
                <div className="flex items-end gap-3">
                  <Input
                    label="X value"
                    type="number"
                    value={predictX}
                    onChange={(e) => {
                      setPredictX(e.target.value);
                      setPredictedY(null);
                    }}
                    placeholder="Enter X"
                  />
                  <Button tone="blue" onClick={predict}>
                    Predict
                  </Button>
                </div>
                {predictedY !== null && (
                  <div className="mt-4 p-4 bg-[var(--color-accent-blue)] rounded-lg border-none">
                     <MathBlock 
                       formula={`\\hat{y} = ${formatNum(result.value.slope)}(${formatNum(parseFloat(predictX))}) ${result.value.intercept >= 0 ? "+" : "-"} ${formatNum(Math.abs(result.value.intercept))} = ${formatNum(predictedY.yPred)}`}
                     />
                  </div>
                )}
              </Card>
            </div>

            <Card className="border border-gray-100 shadow-sm">
              <h3
                className="font-semibold mb-4"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Sum of Squares Breakdown
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-[var(--color-accent-blue)] rounded-lg">
                  <div className="text-xl font-bold">{formatNum(result.value.sst)}</div>
                  <div className="text-xs text-[var(--color-ink-light)]"><MathInline formula="SST" /> (Total)</div>
                </div>
                <div className="p-4 bg-[var(--color-accent-blue)] rounded-lg">
                  <div className="text-xl font-bold">{formatNum(result.value.ssr)}</div>
                  <div className="text-xs text-[var(--color-ink-light)]"><MathInline formula="SSR" /> (Reg)</div>
                </div>
                <div className="p-4 bg-[var(--color-accent-blue)] rounded-lg">
                  <div className="text-xl font-bold">{formatNum(result.value.sse)}</div>
                  <div className="text-xs text-[var(--color-ink-light)]"><MathInline formula="SSE" /> (Error)</div>
                </div>
              </div>
                   <div className="mt-4 text-center">
                     <MathBlock formula={`SST = SSR + SSE \\Rightarrow ${formatNum(result.value.sst)} = ${formatNum(result.value.ssr)} + ${formatNum(result.value.sse)}`} />
                   </div>
            </Card>

            <Card className="border border-gray-100 shadow-sm">
              <h3
                className="font-semibold mb-4"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Step-by-Step Working
              </h3>
              <div className="space-y-4">
                {result.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm"
                  >
                    <h4 className="font-semibold text-base mb-2">
                      {step.title}
                    </h4>
                    {step.description && (
                      <div className="text-sm whitespace-pre-wrap font-sans text-[var(--color-ink-light)] mb-2 overflow-x-auto">
                        {step.description}
                      </div>
                    )}
                    {step.formula && <MathBlock formula={step.formula} className="my-2" />}
                    {step.calculation && <MathBlock formula={step.calculation} className="my-2" />}
                    {step.note && (
                      <p className="text-sm text-[var(--color-ink-light)] mb-1">
                        {step.note.includes("\\") ? <MathBlock formula={step.note} /> : step.note}
                      </p>
                    )}
                    {step.result && (
                      <p className="font-bold text-[var(--color-dot-blue)] text-right mt-2 border-t border-gray-100 pt-2">
                        Result: {step.result}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <CopyExamAnswer answer={resultToExamAnswer(result)} />
          </section>
        )}
      </div>
    </main>
  );
}

