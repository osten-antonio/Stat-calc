import { useState } from "react";
import type { Route } from "./+types/stats-stuff.chi-square";
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
    { title: "Stats Stuff | Chi-Square Tests" },
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
    <main className="retro-theme min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-3xl retro-fire">CHI-SQUARE TESTS</h1>
        <p className="text-sm mt-2">
          Goodness-of-fit and test of independence with step-by-step workings.
        </p>
        <Link to="/stats-stuff" className="text-xs">
          ← Back to Stats Stuff
        </Link>
      </header>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Button variant={testType === "goodness" ? "primary" : "outline"} onClick={() => setTestType("goodness")}>
          Goodness-of-Fit
        </Button>
        <Button variant={testType === "independence" ? "primary" : "outline"} onClick={() => setTestType("independence")}>
          Test of Independence
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
            <option value="0.025">0.025</option>
            <option value="0.05">0.05</option>
            <option value="0.10">0.10</option>
          </select>
        </div>
      </Card>

      {testType === "goodness" && (
        <section>
          <Card className="retro-card mb-6">
            <h2 className="text-xl font-bold mb-2">Goodness-of-Fit Test</h2>
            <MathBlock formula="\chi^2 = \sum \frac{(O_i - E_i)^2}{E_i}" />
            <p className="text-sm opacity-70 mt-2">
              Tests if observed frequencies match expected frequencies.
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Observed Frequencies</label>
              <input
                type="text"
                className="w-full p-2 border rounded font-mono"
                value={observedStr}
                onChange={(e) => setObservedStr(e.target.value)}
                placeholder="e.g. 20, 30, 25, 25"
              />
              <p className="text-xs opacity-70 mt-1">Comma-separated values</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Frequencies</label>
              <input
                type="text"
                className="w-full p-2 border rounded font-mono"
                value={expectedStr}
                onChange={(e) => setExpectedStr(e.target.value)}
                placeholder="e.g. 25, 25, 25, 25"
              />
              <p className="text-xs opacity-70 mt-1">Must have same count as observed</p>
            </div>
          </div>

          {error && <p className="text-red-500 mb-4 retro-blink">{error}</p>}
          <Button onClick={runGoodnessOfFit}>Run Goodness-of-Fit Test</Button>

          {gofResult && (
            <div className="mt-6">
              <h3 className="text-xl mb-4">Results</h3>
              <Card className="retro-card mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold retro-fire">{formatNum(gofResult.value.chiSquare)}</div>
                    <div className="text-xs opacity-70">χ²</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{gofResult.value.df}</div>
                    <div className="text-xs opacity-70">df</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {gofResult.value.chiCritical ? formatNum(gofResult.value.chiCritical) : "N/A"}
                    </div>
                    <div className="text-xs opacity-70">χ²-critical</div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4 mb-6">
                {gofResult.steps.map((step) => (
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
              <CopyExamAnswer answer={resultToExamAnswer(gofResult, "Chi-Square Goodness-of-Fit")} />
            </div>
          )}
        </section>
      )}

      {testType === "independence" && (
        <section>
          <Card className="retro-card mb-6">
            <h2 className="text-xl font-bold mb-2">Test of Independence</h2>
            <MathBlock formula="\chi^2 = \sum \frac{(O - E)^2}{E}" />
            <p className="text-sm opacity-70 mt-2">
              Tests if two categorical variables are independent.
            </p>
          </Card>

          <div className="mb-4 flex gap-4 items-center">
            <div>
              <label className="text-sm font-medium">Rows:</label>
              <input
                type="number"
                min={2}
                max={10}
                value={tableRows}
                onChange={(e) => updateTableSize(Math.max(2, parseInt(e.target.value) || 2), tableCols)}
                className="w-20 ml-2 p-2 border rounded"
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
                className="w-20 ml-2 p-2 border rounded"
              />
            </div>
          </div>

          <Card className="retro-card mb-6 overflow-x-auto">
            <table className="font-mono text-sm">
              <thead>
                <tr>
                  <th className="p-2 border bg-slate-100 dark:bg-slate-800"></th>
                  {Array.from({ length: tableCols }, (_, c) => (
                    <th key={c} className="p-2 border bg-slate-100 dark:bg-slate-800">Col {c + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, r) => (
                  <tr key={r}>
                    <td className="p-2 border bg-slate-100 dark:bg-slate-800 font-bold">Row {r + 1}</td>
                    {row.map((cell, c) => (
                      <td key={c} className="p-1 border">
                        <input
                          type="number"
                          className="w-16 p-1 text-center border rounded"
                          value={cell}
                          onChange={(e) => setCell(r, c, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {error && <p className="text-red-500 mb-4 retro-blink">{error}</p>}
          <Button onClick={runIndependence}>Run Test of Independence</Button>

          {indepResult && (
            <div className="mt-6">
              <h3 className="text-xl mb-4">Results</h3>
              <Card className="retro-card mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold retro-fire">{formatNum(indepResult.value.chiSquare)}</div>
                    <div className="text-xs opacity-70">χ²</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{indepResult.value.df}</div>
                    <div className="text-xs opacity-70">df</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {indepResult.value.chiCritical ? formatNum(indepResult.value.chiCritical) : "N/A"}
                    </div>
                    <div className="text-xs opacity-70">χ²-critical</div>
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
              <CopyExamAnswer answer={resultToExamAnswer(indepResult, "Chi-Square Test of Independence")} />
            </div>
          )}
        </section>
      )}
    </main>
  );
}
