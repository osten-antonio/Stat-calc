import { useState } from "react";
import type { Route } from "./+types/chi-square";
import { Link } from "react-router";

import {
  goodnessOfFitWithSteps,
  independenceTestWithSteps,
  type GoodnessOfFitResult,
  type IndependenceResult,
} from "~/lib/math/chi-square";
import { CopyExamAnswer } from "~/components/calculator/CopyExamAnswer";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import type { CalculationResult } from "~/lib/types/calculation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chi-Square Tests" },
    { name: "description", content: "Chi-square goodness-of-fit and independence tests with step-by-step workings." },
  ];
}

type TestType = "goodness" | "independence";

function formatNum(num: number, decimals = 4): string {
  if (!Number.isFinite(num)) return "N/A";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
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

export default function ChiSquarePage() {
  const [testType, setTestType] = useState<TestType>("goodness");
  const [alpha, setAlpha] = useState("0.05");
  const [error, setError] = useState<string | null>(null);

  const [observedStr, setObservedStr] = useState("20, 30, 25, 25");
  const [expectedStr, setExpectedStr] = useState("25, 25, 25, 25");
  const [gofResult, setGofResult] = useState<CalculationResult<GoodnessOfFitResult> | null>(null);

  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);
  const [tableData, setTableData] = useState<string[][]>([
    ["30", "10"],
    ["20", "40"],
  ]);
  const [indepResult, setIndepResult] = useState<CalculationResult<IndependenceResult> | null>(null);

  function parseArray(str: string): number[] {
    return str.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
  }

  function runGoodnessOfFit() {
    setError(null);
    setGofResult(null);
    const observed = parseArray(observedStr);
    const expected = parseArray(expectedStr);

    if (observed.length < 2) {
      setError("Enter at least 2 observed values, separated by commas.");
      return;
    }
    if (expected.length !== observed.length) {
      setError(`Expected needs ${observed.length} values to match observed. You provided ${expected.length}.`);
      return;
    }
    if (expected.some((e) => e <= 0)) {
      setError("Expected values must all be positive.");
      return;
    }

    const result = goodnessOfFitWithSteps(observed, expected, parseFloat(alpha));
    setGofResult(result);
  }

  function updateTableSize(newRows: number, newCols: number) {
    const newData: string[][] = [];
    for (let r = 0; r < newRows; r++) {
      const row: string[] = [];
      for (let c = 0; c < newCols; c++) {
        row.push(tableData[r]?.[c] ?? "0");
      }
      newData.push(row);
    }
    setTableRows(newRows);
    setTableCols(newCols);
    setTableData(newData);
  }

  function setCell(r: number, c: number, value: string) {
    const newData = tableData.map((row) => [...row]);
    newData[r][c] = value;
    setTableData(newData);
  }

  function runIndependence() {
    setError(null);
    setIndepResult(null);

    const observed: number[][] = tableData.map((row) =>
      row.map((cell) => {
        const n = parseFloat(cell);
        return isNaN(n) ? 0 : n;
      })
    );

    if (observed.some((row) => row.some((n) => n < 0))) {
      setError("All values must be non-negative.");
      return;
    }

    const result = independenceTestWithSteps(observed, parseFloat(alpha));
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
            Chi-Square Tests
          </h1>
          <p className="text-lg text-[var(--color-ink-light)] max-w-2xl">
            Goodness-of-fit and test of independence with step-by-step workings.
          </p>
        </header>

        <section className="mb-10 fade-in" style={{ animationDelay: "50ms" }}>
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button 
              tone={testType === "goodness" ? "mint" : undefined}
              variant={testType === "goodness" ? "primary" : "secondary"} 
              onClick={() => setTestType("goodness")}
            >
              Goodness-of-Fit
            </Button>
            <Button 
              tone={testType === "independence" ? "mint" : undefined}
              variant={testType === "independence" ? "primary" : "secondary"} 
              onClick={() => setTestType("independence")}
            >
              Test of Independence
            </Button>
          </div>

          <Card className="mb-6 bg-[var(--color-accent-mint)] border-none">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Significance Level (α):</label>
              <select
                className="p-2 border rounded bg-white/70 border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-mint)] cursor-pointer"
                value={alpha}
                onChange={(e) => setAlpha(e.target.value)}
              >
                <option value="0.01">0.01 (1%)</option>
                <option value="0.025">0.025 (2.5%)</option>
                <option value="0.05">0.05 (5%)</option>
                <option value="0.10">0.10 (10%)</option>
              </select>
            </div>
          </Card>
        </section>

        {testType === "goodness" && (
          <section className="fade-in" style={{ animationDelay: "100ms" }}>
            <Card className="mb-6 bg-[var(--color-accent-mint)] border-none">
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                Goodness-of-Fit Test
              </h2>
              <MathBlock formula="\chi^2 = \sum \frac{(O_i - E_i)^2}{E_i}" />
              <p className="text-sm text-[var(--color-ink-light)] mt-2">
                Tests if observed frequencies match expected frequencies.
              </p>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Observed Frequencies</label>
                <Input
                  label="Observed Frequencies"
                  type="text"
                  value={observedStr}
                  onChange={(e) => setObservedStr(e.target.value)}
                  placeholder="e.g. 20, 30, 25, 25"
                  className="font-mono"
                />
                <p className="text-xs text-[var(--color-ink-light)] mt-1">Comma-separated values</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Frequencies</label>
                <Input
                  label="Expected Frequencies"
                  type="text"
                  value={expectedStr}
                  onChange={(e) => setExpectedStr(e.target.value)}
                  placeholder="e.g. 25, 25, 25, 25"
                  className="font-mono"
                />
                <p className="text-xs text-[var(--color-ink-light)] mt-1">Must have same count as observed</p>
              </div>
            </div>

            {error && (
              <p className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                {error}
              </p>
            )}
            
            <Button tone="mint" onClick={runGoodnessOfFit}>Run Goodness-of-Fit Test</Button>

            {gofResult && (
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
                        {formatNum(gofResult.value.chiSquare)}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">χ²</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-ink)]">
                        {gofResult.value.df}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">df</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-ink)]">
                        {gofResult.value.chiCritical ? formatNum(gofResult.value.chiCritical) : "N/A"}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">χ²-critical</div>
                    </div>
                  </div>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                  <h4 className="font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                    Calculation Details
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 border-b border-r border-[var(--color-border)] text-left font-medium">Category</th>
                          <th className="p-3 border-b border-r border-[var(--color-border)] text-center font-medium">O</th>
                          <th className="p-3 border-b border-r border-[var(--color-border)] text-center font-medium">E</th>
                          <th className="p-3 border-b border-r border-[var(--color-border)] text-center font-medium">O − E</th>
                          <th className="p-3 border-b border-r border-[var(--color-border)] text-center font-medium">(O − E)²</th>
                          <th className="p-3 border-b border-[var(--color-border)] text-center font-medium text-[var(--color-dot-mint)]">(O − E)²/E</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gofResult.value.observed.map((o, i) => {
                          const e = gofResult.value.expected[i];
                          const diff = o - e;
                          const diffSq = diff * diff;
                          const contrib = diffSq / e;
                          return (
                            <tr key={i} className="hover:bg-gray-50/50">
                              <td className="p-3 border-b border-r border-[var(--color-border)] font-medium text-[var(--color-ink-light)]">
                                {i + 1}
                              </td>
                              <td className="p-3 border-b border-r border-[var(--color-border)] text-center font-mono">
                                {o}
                              </td>
                              <td className="p-3 border-b border-r border-[var(--color-border)] text-center font-mono">
                                {formatNum(e)}
                              </td>
                              <td className="p-3 border-b border-r border-[var(--color-border)] text-center font-mono">
                                {formatNum(diff)}
                              </td>
                              <td className="p-3 border-b border-r border-[var(--color-border)] text-center font-mono">
                                {formatNum(diffSq)}
                              </td>
                              <td className="p-3 border-b border-[var(--color-border)] text-center font-mono font-semibold text-[var(--color-dot-mint)]">
                                {formatNum(contrib)}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-[var(--color-accent-mint)] font-bold">
                          <td colSpan={5} className="p-3 border-r border-[var(--color-border)] text-right">
                            Σ (Sum) =
                          </td>
                          <td className="p-3 text-center font-mono text-[var(--color-dot-mint)]">
                            {formatNum(gofResult.value.chiSquare)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                  <h4 className="font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                    Step-by-Step Working
                  </h4>
                  <div className="space-y-4">
                    {gofResult.steps.map((step) => (
                      <div key={step.id} className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <h5 className="font-semibold text-base mb-2">{step.title}</h5>
                        {step.description && (
                          <pre className="text-sm whitespace-pre-wrap font-sans text-[var(--color-ink-light)] mb-2">
                            {step.description}
                          </pre>
                        )}
                        {step.formula && <MathBlock formula={step.formula} className="my-2" />}
                        {step.calculation && <MathBlock formula={step.calculation} className="my-2" />}
                        {step.note && <p className="text-sm text-[var(--color-ink-light)] mb-1">{step.note}</p>}
                        {step.result && (
                          <p className="font-bold text-[var(--color-dot-mint)] mt-1">= {step.result}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
                
                <CopyExamAnswer answer={resultToExamAnswer(gofResult, "Chi-Square Goodness-of-Fit")} />
              </div>
            )}
          </section>
        )}

        {testType === "independence" && (
          <section className="fade-in" style={{ animationDelay: "100ms" }}>
            <Card className="mb-6 bg-[var(--color-accent-mint)] border-none">
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                Test of Independence
              </h2>
              <MathBlock formula="\chi^2 = \sum \frac{(O - E)^2}{E}" />
              <p className="text-sm text-[var(--color-ink-light)] mt-2">
                Tests if two categorical variables are independent.
              </p>
            </Card>

            <div className="mb-6 flex gap-4 items-center">
              <div>
                <label className="text-sm font-medium">Rows:</label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={tableRows}
                  onChange={(e) => updateTableSize(Math.max(2, parseInt(e.target.value) || 2), tableCols)}
                  className="w-20 ml-2 p-2 border rounded border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-mint)]"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Columns:</label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={tableCols}
                  onChange={(e) => updateTableSize(tableRows, Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-20 ml-2 p-2 border rounded border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-mint)]"
                />
              </div>
            </div>

            <div className="mb-6 overflow-x-auto rounded-lg border border-[var(--color-border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="p-3 border-b border-r border-[var(--color-border)] bg-gray-50"></th>
                    {Array.from({ length: tableCols }, (_, c) => (
                      <th key={c} className="p-3 border-b border-[var(--color-border)] bg-gray-50 font-medium text-[var(--color-ink-light)]">
                        Col {c + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, r) => (
                    <tr key={r}>
                      <td className="p-3 border-r border-b border-[var(--color-border)] bg-gray-50 font-medium w-24 text-[var(--color-ink-light)]">
                        Row {r + 1}
                      </td>
                      {row.map((cell, c) => (
                        <td key={c} className="p-2 border-b border-[var(--color-border)] bg-white">
                          <input
                            type="number"
                            className="w-full p-2 text-center border rounded border-[var(--color-border)] focus:border-[var(--color-dot-mint)] focus:ring-1 focus:ring-[var(--color-dot-mint)] outline-none transition-colors"
                            value={cell}
                            onChange={(e) => setCell(r, c, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {error && (
              <p className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                {error}
              </p>
            )}
            
            <Button tone="mint" onClick={runIndependence}>Run Test of Independence</Button>

            {indepResult && (
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
                        {formatNum(indepResult.value.chiSquare)}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">χ²</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-ink)]">
                        {indepResult.value.df}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">df</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--color-ink)]">
                        {indepResult.value.chiCritical ? formatNum(indepResult.value.chiCritical) : "N/A"}
                      </div>
                      <div className="text-xs text-[var(--color-ink-light)]">χ²-critical</div>
                    </div>
                  </div>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                  <h4 className="font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                    Observed Frequencies (with Marginal Totals)
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 border-b border-r border-[var(--color-border)] font-medium"></th>
                          {indepResult.value.colTotals.map((_, c) => (
                            <th key={c} className="p-3 border-b border-r border-[var(--color-border)] text-center font-medium text-[var(--color-ink-light)]">
                              Col {c + 1}
                            </th>
                          ))}
                          <th className="p-3 border-b border-[var(--color-border)] text-center font-semibold bg-[var(--color-accent-mint)]">Row Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {indepResult.value.observedTable.map((row, r) => (
                          <tr key={r}>
                            <td className="p-3 border-b border-r border-[var(--color-border)] bg-gray-50 font-medium text-[var(--color-ink-light)]">
                              Row {r + 1}
                            </td>
                            {row.map((cell, c) => (
                              <td key={c} className="p-3 border-b border-r border-[var(--color-border)] text-center font-mono">
                                {cell}
                              </td>
                            ))}
                            <td className="p-3 border-b border-[var(--color-border)] text-center font-mono font-semibold bg-[var(--color-accent-mint)]">
                              {indepResult.value.rowTotals[r]}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-[var(--color-accent-mint)]">
                          <td className="p-3 border-r border-[var(--color-border)] font-semibold">Col Total</td>
                          {indepResult.value.colTotals.map((total, c) => (
                            <td key={c} className="p-3 border-r border-[var(--color-border)] text-center font-mono font-semibold">
                              {total}
                            </td>
                          ))}
                          <td className="p-3 text-center font-mono font-bold text-[var(--color-dot-mint)]">
                            {indepResult.value.grandTotal}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                  <h4 className="font-semibold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                    Expected Frequencies
                  </h4>
                  <p className="text-sm text-[var(--color-ink-light)] mb-4">
                    E = (Row Total × Column Total) / Grand Total
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 border-b border-r border-[var(--color-border)] font-medium"></th>
                          {indepResult.value.colTotals.map((_, c) => (
                            <th key={c} className="p-3 border-b border-[var(--color-border)] text-center font-medium text-[var(--color-ink-light)]">
                              Col {c + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {indepResult.value.expectedTable.map((row, r) => (
                          <tr key={r} className="hover:bg-gray-50/50">
                            <td className="p-3 border-b border-r border-[var(--color-border)] bg-gray-50 font-medium text-[var(--color-ink-light)]">
                              Row {r + 1}
                            </td>
                            {row.map((cell, c) => (
                              <td key={c} className="p-3 border-b border-[var(--color-border)] text-center font-mono">
                                {formatNum(cell, 2)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                  <h4 className="font-semibold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                    Chi-Square Contributions
                  </h4>
                  <p className="text-sm text-[var(--color-ink-light)] mb-4">
                    (O − E)² / E for each cell
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 border-b border-r border-[var(--color-border)] font-medium"></th>
                          {indepResult.value.colTotals.map((_, c) => (
                            <th key={c} className="p-3 border-b border-[var(--color-border)] text-center font-medium text-[var(--color-ink-light)]">
                              Col {c + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {indepResult.value.observedTable.map((row, r) => (
                          <tr key={r} className="hover:bg-gray-50/50">
                            <td className="p-3 border-b border-r border-[var(--color-border)] bg-gray-50 font-medium text-[var(--color-ink-light)]">
                              Row {r + 1}
                            </td>
                            {row.map((o, c) => {
                              const e = indepResult.value.expectedTable[r][c];
                              const contrib = Math.pow(o - e, 2) / e;
                              return (
                                <td key={c} className="p-3 border-b border-[var(--color-border)] text-center font-mono text-[var(--color-dot-mint)] font-semibold">
                                  {formatNum(contrib)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        <tr className="bg-[var(--color-accent-mint)] font-bold">
                          <td className="p-3 border-r border-[var(--color-border)] text-right" colSpan={1}>
                            Σ =
                          </td>
                          <td colSpan={indepResult.value.colTotals.length} className="p-3 text-center font-mono text-[var(--color-dot-mint)]">
                            {formatNum(indepResult.value.chiSquare)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card className="border border-gray-100 shadow-sm">
                  <h4 className="font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                    Step-by-Step Working
                  </h4>
                  <div className="space-y-4">
                    {indepResult.steps.map((step) => (
                      <div key={step.id} className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <h5 className="font-semibold text-base mb-2">{step.title}</h5>
                        {step.description && (
                          <pre className="text-sm whitespace-pre-wrap font-sans text-[var(--color-ink-light)] mb-2">
                            {step.description}
                          </pre>
                        )}
                        {step.formula && <MathBlock formula={step.formula} className="my-2" />}
                        {step.calculation && <MathBlock formula={step.calculation} className="my-2" />}
                        {step.note && <p className="text-sm text-[var(--color-ink-light)] mb-1">{step.note}</p>}
                        {step.result && (
                          <p className="font-bold text-[var(--color-dot-mint)] mt-1">= {step.result}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
                
                <CopyExamAnswer answer={resultToExamAnswer(indepResult, "Chi-Square Test of Independence")} />
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
