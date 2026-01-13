import { useState, useMemo } from "react";
import type { Route } from "./+types/stats-hell.descriptive";
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
    { title: "Stats Hell | Descriptive Statistics" },
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
    <main className="retro-theme min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-3xl retro-fire">DESCRIPTIVE STATISTICS</h1>
        <p className="text-sm mt-2">
          Calculate mean, median, mode, variance, and standard deviation with step-by-step workings.
        </p>
        <Link to="/stats-hell" className="text-xs">
          ← Back to Stats Hell
        </Link>
      </header>

      <Card className="retro-card mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <MathBlock formula="\bar{x} = \frac{\Sigma x}{n}" />
            <p className="text-center text-xs opacity-70">Mean</p>
          </div>
          <div>
            <MathBlock formula="\sigma^2 = \frac{\Sigma(x - \bar{x})^2}{n}" />
            <p className="text-center text-xs opacity-70">Population Variance</p>
          </div>
          <div>
            <MathBlock formula="s^2 = \frac{\Sigma(x - \bar{x})^2}{n-1}" />
            <p className="text-center text-xs opacity-70">Sample Variance</p>
          </div>
        </div>
      </Card>

      <section className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={loadSampleData} className="text-xs">
            Load Sample Data
          </Button>
          <span className="text-xs opacity-70">
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

        {error && <p className="text-red-500 mt-4 text-sm retro-blink">{error}</p>}

        <Button className="mt-4" onClick={calculate}>
          Calculate Stats
        </Button>
      </section>

      {result && (
        <section>
          <h2 className="text-xl mb-4">Step-by-Step Working</h2>

          <Card className="retro-card mb-6">
            <h3 className="font-bold text-lg mb-2">Quick Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold retro-fire">{formatNum(result.value.mean)}</div>
                <div className="text-xs opacity-70">Mean (x̄)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatNum(result.value.median)}</div>
                <div className="text-xs opacity-70">Median</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {result.value.mode.length > 0 ? result.value.mode.join(", ") : "None"}
                </div>
                <div className="text-xs opacity-70">Mode</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatNum(result.value.standardDeviation.sample)}</div>
                <div className="text-xs opacity-70">Sample SD (s)</div>
              </div>
            </div>
          </Card>

          <div className="space-y-4 mb-6">
            {result.steps.map((step) => (
              <Card key={step.id} className="retro-card">
                <h3 className="font-bold text-lg">{step.title}</h3>
                {step.description && (
                  <pre className="text-sm whitespace-pre-wrap font-sans">{step.description}</pre>
                )}
                {step.formula && <MathBlock formula={step.formula} />}
                {step.calculation && <MathBlock formula={step.calculation} />}
                {step.note && <p className="text-sm opacity-80 mt-1">{step.note}</p>}
                {step.result && (
                  <p className="text-xl font-bold mt-2 retro-fire">= {step.result}</p>
                )}
              </Card>
            ))}
          </div>

          <CopyExamAnswer answer={resultToExamAnswer(result)} />
        </section>
      )}
    </main>
  );
}
