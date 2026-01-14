import { useState, useMemo } from "react";
import type { Route } from "./+types/box-plot";
import { Link } from "react-router";

import { boxPlotWithSteps, type BoxPlotSummary } from "~/lib/math/box-plot";
import { CopyExamAnswer } from "~/components/calculator/CopyExamAnswer";
import {
  DataTableInput,
  type DataTableValue,
} from "~/components/calculator/DataTableInput";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import type { CalculationResult } from "~/lib/types/calculation";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Box Plot" },
    { name: "description", content: "Calculate 5-number summary, IQR, and outliers." },
  ];
}

function formatNum(num: number, decimals = 4): string {
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function resultToExamAnswer(
  calc: CalculationResult<BoxPlotSummary>
): ExamAnswer {
  return {
    title: "Box Plot Analysis",
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
      "Five-Number Summary:",
      `Min = ${formatNum(calc.value.min)}`,
      `Q1 = ${formatNum(calc.value.q1)}`,
      `Median = ${formatNum(calc.value.median)}`,
      `Q3 = ${formatNum(calc.value.q3)}`,
      `Max = ${formatNum(calc.value.max)}`,
      "",
      `IQR = ${formatNum(calc.value.iqr)}`,
      `Fences = [${formatNum(calc.value.lowerFence)}, ${formatNum(calc.value.upperFence)}]`,
      `Whiskers = [${formatNum(calc.value.lowerWhisker)}, ${formatNum(calc.value.upperWhisker)}]`,
      `Outliers = ${calc.value.outliers.length > 0 ? calc.value.outliers.join(", ") : "None"}`,
    ].join("\n"),
  };
}

function parseData(tableValue: DataTableValue): number[] {
  const values: number[] = [];
  for (const row of tableValue.rows) {
    for (const cell of row) {
      const trimmed = cell.trim();
      if (trimmed === "") continue;
      const parts = trimmed.split(/[\s,]+/);
      for (const part of parts) {
         if (part === "") continue;
         const num = Number(part);
         if (Number.isFinite(num)) values.push(num);
      }
    }
  }
  return values;
}

export default function BoxPlotCalculator() {
  const [tableData, setTableData] = useState<DataTableValue>({
    columns: ["Values"],
    rows: [[""], [""], [""], [""], [""]],
  });

  const [result, setResult] = useState<CalculationResult<BoxPlotSummary> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsedData = useMemo(() => parseData(tableData), [tableData]);

  function calculate() {
    setError(null);
    setResult(null);

    if (parsedData.length === 0) {
      setError("It's a box plot, not a ghost plot. Enter some numbers.");
      return;
    }

    if (parsedData.length < 2) {
      setError("One number? That's a dot. Give me at least two.");
      return;
    }

    try {
      const calc = boxPlotWithSteps(parsedData);
      setResult(calc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something exploded.");
    }
  }

  function loadSampleData() {
    setTableData({
      columns: ["Values"],
      rows: [
        ["12, 14, 15"],
        ["15, 16, 18"],
        ["20, 22, 24"],
        ["25, 30, 95"], 
        [""],
      ],
    });
    setResult(null);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 font-sans text-[var(--color-ink)]">
      <div className="max-w-4xl mx-auto">
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
            Box Plot
          </h1>
          <p className="text-lg text-[var(--color-ink-light)]">
            Determine the five-number summary, IQR, fences, and identify outliers.
          </p>
        </header>

        <Card
          className="mb-10 bg-[var(--color-accent-blue)] border-none fade-in"
          style={{ animationDelay: "50ms" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <MathBlock formula="IQR = Q_3 - Q_1" />
              <p className="text-center text-xs text-[var(--color-ink-light)] mt-1">
                Interquartile Range
              </p>
            </div>
            <div>
              <MathBlock formula="\text{Fences} = [Q_1 - 1.5 \cdot IQR, Q_3 + 1.5 \cdot IQR]" />
              <p className="text-center text-xs text-[var(--color-ink-light)] mt-1">
                Outlier Boundaries
              </p>
            </div>
          </div>
        </Card>

        <section className="mb-12 fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-4 mb-4">
            <Button variant="secondary" onClick={loadSampleData}>
              Load Sample Data
            </Button>
            <span className="text-sm text-[var(--color-ink-light)]">
              {parsedData.length} valid number{parsedData.length !== 1 ? "s" : ""} detected
            </span>
          </div>

          <Card className="p-4 border border-gray-100 shadow-sm">
            <DataTableInput
              label="Data Points"
              helpText="Enter values (one per line, or comma separated)."
              value={tableData}
              onChange={setTableData}
              minRows={5}
              tone="blue"
              controlsPlacement="bottom"
            />
          </Card>

          {error && (
            <p className="text-red-600 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <Button
            className="mt-6 w-full md:w-auto"
            tone="blue"
            onClick={calculate}
          >
            Calculate Box Plot
          </Button>
        </section>

        {result && (
          <section
            className="fade-in space-y-8"
            style={{ animationDelay: "150ms" }}
          >
            <h2
              className="text-3xl font-medium"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Results
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {[
                 { label: "Min", value: result.value.min },
                 { label: "Q1", value: result.value.q1 },
                 { label: "Median", value: result.value.median, highlight: true },
                 { label: "Q3", value: result.value.q3 },
                 { label: "Max", value: result.value.max },
               ].map((item, i) => (
                 <Card 
                   key={item.label} 
                   className={`text-center p-4 border shadow-sm ${item.highlight ? 'border-[var(--color-dot-blue)] bg-[var(--color-accent-blue)]' : 'border-gray-100'}`}
                 >
                   <div className="text-xs uppercase font-bold text-[var(--color-ink-light)] mb-1">
                     {item.label}
                   </div>
                   <div className={`text-xl font-bold ${item.highlight ? 'text-[var(--color-dot-blue)]' : 'text-[var(--color-ink)]'}`}>
                     {formatNum(item.value)}
                   </div>
                 </Card>
               ))}
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Card className="p-4 border border-gray-100">
                     <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">IQR</div>
                     <div className="text-2xl font-bold text-[var(--color-ink)]">{formatNum(result.value.iqr)}</div>
                 </Card>
                 <Card className="p-4 border border-gray-100">
                     <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Fences</div>
                     <div className="text-lg font-bold text-[var(--color-ink)]">
                        [{formatNum(result.value.lowerFence)}, {formatNum(result.value.upperFence)}]
                     </div>
                 </Card>
                 <Card className={`p-4 border ${result.value.outliers.length > 0 ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                     <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Outliers</div>
                     <div className={`text-lg font-bold ${result.value.outliers.length > 0 ? 'text-red-600' : 'text-[var(--color-ink)]'}`}>
                         {result.value.outliers.length > 0 ? result.value.outliers.join(", ") : "None"}
                     </div>
                 </Card>
             </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold mt-8 mb-4">Step-by-Step Working</h3>
              {result.steps.map((step) => (
                <div
                  key={step.id}
                  className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
                  {step.description && (
                    <pre className="text-sm whitespace-pre-wrap font-sans text-[var(--color-ink-light)] mb-2">
                      {step.description}
                    </pre>
                  )}
                  {step.formula && (
                    <MathBlock formula={step.formula} className="my-2" />
                  )}
                  {step.calculation && (
                    <MathBlock formula={step.calculation} className="my-2" />
                  )}
                  {step.note && (
                    <p className="text-sm text-[var(--color-ink-light)] mt-1">
                      {step.note}
                    </p>
                  )}
                  {step.result && (
                    <p className="text-xl font-bold mt-3 text-[var(--color-dot-blue)]">
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
