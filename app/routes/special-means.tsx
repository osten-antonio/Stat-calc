import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/special-means";

import { specialMeansWithSteps, type SpecialMeansResult } from "~/lib/math/special-means";
import { CopyExamAnswer } from "~/components/calculator/CopyExamAnswer";
import {
  DataTableInput,
  type DataTableValue,
} from "~/components/calculator/DataTableInput";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Input } from "~/components/ui/Input";
import { MathBlock } from "~/components/math/MathBlock";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import type { CalculationResult } from "~/lib/types/calculation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Special Means" },
    {
      name: "description",
      content: "Trimean, geometric mean, and trimmed mean with step-by-step snark.",
    },
  ];
}

type MeanType = "all" | "trimean" | "geometric" | "trimmed";

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

function resultToExamAnswer(
  calc: CalculationResult<SpecialMeansResult>,
  trimInput: { trimPercent: string; trimCount: string },
  meanType: MeanType
): ExamAnswer {
  const showTrimean = meanType === "all" || meanType === "trimean";
  const showGeometric = meanType === "all" || meanType === "geometric";
  const showTrimmed = meanType === "all" || meanType === "trimmed";

  const lines = [];
  if (showTrimean) lines.push(`Trimean = ${formatNum(calc.value.trimean)}`);
  if (showGeometric) {
    lines.push(`Geometric Mean = ${Number.isFinite(calc.value.geometricMean) ? formatNum(calc.value.geometricMean) : "N/A (needs all > 0)"}`);
  }
  if (showTrimmed) {
    lines.push(`Trimmed Mean = ${formatNum(calc.value.trimmedMean)}`);
  }

  lines.push(`Quartiles: Q1=${formatNum(calc.value.quartiles.q1)}, Median=${formatNum(calc.value.quartiles.median)}, Q3=${formatNum(calc.value.quartiles.q3)}`);
  
  if (showTrimmed) {
    lines.push(`Trim per side = ${calc.value.trimCountPerSide} (input: ${trimInput.trimCount || "n/a"}, percent: ${trimInput.trimPercent || "n/a"})`);
    lines.push(`Used n = ${calc.value.n} of original ${calc.value.originalN}`);
  }

  return {
    title: "Special Means Analysis",
    sections: calc.steps.filter(step => {
      const t = step.title.toLowerCase();
      if (t.includes("trimean") && !showTrimean) return false;
      if (t.includes("geometric") && !showGeometric) return false;
      if (t.includes("trimmed") && !showTrimmed) return false;
      return true;
    }).map((step) => ({
      title: step.title,
      lines: [
        step.description ?? "",
        step.formula ? `Formula: ${step.formula}` : "",
        step.calculation ?? "",
        step.note ? `Note: ${step.note}` : "",
        step.result ? `= ${step.result}` : "",
      ].filter(Boolean),
    })),
    finalAnswer: lines.join("\n"),
  };
}

export default function SpecialMeansCalculator() {
  const [tableData, setTableData] = useState<DataTableValue>({
    columns: ["Values"],
    rows: [[""], [""], [""], [""], [""]],
  });
  const [trimPercent, setTrimPercent] = useState<string>("10");
  const [trimCount, setTrimCount] = useState<string>("0");
  const [meanType, setMeanType] = useState<MeanType>("all");
  const [result, setResult] = useState<CalculationResult<SpecialMeansResult> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsedData = useMemo(() => parseData(tableData), [tableData]);

  function loadSampleData() {
    setTableData({
      columns: ["Values"],
      rows: [
        ["2, 3, 5"],
        ["7, 11, 13"],
        ["17, 19, 23"],
        ["29, 31, 37"],
        [""],
      ],
    });
    setResult(null);
    setError(null);
  }

  function calculate() {
    setError(null);
    setResult(null);

    if (parsedData.length === 0) {
      setError("Need numbers to compute means. Telepathy not supported.");
      return;
    }

    if (parsedData.length < 2) {
      setError("One number isn't a dataset. Add more.");
      return;
    }

    const percentVal = trimPercent.trim() === "" ? undefined : Number(trimPercent);
    const countVal = trimCount.trim() === "" ? undefined : Number(trimCount);

    const checkTrim = meanType === "all" || meanType === "trimmed";

    if (checkTrim) {
      if (percentVal !== undefined && (!Number.isFinite(percentVal) || percentVal < 0 || percentVal > 50)) {
        setError("Trim percent must be between 0 and 50. Math, remember?");
        return;
      }

      if (countVal !== undefined && (!Number.isFinite(countVal) || countVal < 0)) {
        setError("Trim count must be a non-negative number.");
        return;
      }
    }

    try {
      const calc = specialMeansWithSteps(parsedData, {
        trimPercent: checkTrim ? percentVal : undefined,
        trimCount: checkTrim ? countVal : undefined,
      });
      setResult(calc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Special means imploded. Try different inputs.");
    }
  }

  const currentTrimInfo = {
    percent: trimPercent.trim() === "" ? "0" : trimPercent,
    count: trimCount.trim() === "" ? "0" : trimCount,
  };

  const showTrimean = meanType === "all" || meanType === "trimean";
  const showGeometric = meanType === "all" || meanType === "geometric";
  const showTrimmed = meanType === "all" || meanType === "trimmed";

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
            Special Means
          </h1>
          <p className="text-lg text-[var(--color-ink-light)]">
            Trimean, geometric mean, and trimmed mean — because averaging once was too easy.
          </p>
        </header>

        <Card
          className="mb-10 bg-[var(--color-accent-blue)] border-none fade-in"
          style={{ animationDelay: "50ms" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <MathBlock formula={"T = \\frac{Q_1 + 2Q_2 + Q_3}{4}"} />
              <p className="text-center text-xs text-[var(--color-ink-light)] mt-1">
                Trimean (weighted quartile blend)
              </p>
            </div>
            <div>
              <MathBlock formula={"GM = \\left(\\prod_{i=1}^{n} x_i\\right)^{1/n}"} />
              <p className="text-center text-xs text-[var(--color-ink-light)] mt-1">
                Geometric Mean (needs all values &gt; 0)
              </p>
            </div>
            <div>
              <MathBlock formula={"\\bar{x}_{\\text{trim}} = \\frac{\\sum x_{\\text{trim}}}{n_{\\text{trim}}}"} />
              <p className="text-center text-xs text-[var(--color-ink-light)] mt-1">
                Trimmed Mean (bye-bye tails)
              </p>
            </div>
          </div>
        </Card>

        <section className="mb-12 fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-4 mb-6">
            <Button variant="secondary" onClick={loadSampleData}>
              Load Sample Data
            </Button>
            <span className="text-sm text-[var(--color-ink-light)]">
              {parsedData.length} valid number{parsedData.length !== 1 ? "s" : ""} detected
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant="outline"
              tone={meanType === "all" ? "blue" : undefined}
              className={meanType === "all"
                ? "bg-transparent"
                : "bg-transparent text-gray-500 border-gray-300"}
              onClick={() => setMeanType("all")}
            >
              All Means
            </Button>
            <Button
              variant="outline"
              tone={meanType === "trimean" ? "blue" : undefined}
              className={meanType === "trimean"
                ? "bg-transparent"
                : "bg-transparent text-gray-500 border-gray-300"}
              onClick={() => setMeanType("trimean")}
            >
              Trimean Only
            </Button>
            <Button
              variant="outline"
              tone={meanType === "geometric" ? "blue" : undefined}
              className={meanType === "geometric"
                ? "bg-transparent"
                : "bg-transparent text-gray-500 border-gray-300"}
              onClick={() => setMeanType("geometric")}
            >
              Geometric Only
            </Button>
            <Button
              variant="outline"
              tone={meanType === "trimmed" ? "blue" : undefined}
              className={meanType === "trimmed"
                ? "bg-transparent"
                : "bg-transparent text-gray-500 border-gray-300"}
              onClick={() => setMeanType("trimmed")}
            >
              Trimmed Only
            </Button>
          </div>

          <Card className="p-4 border border-gray-100 shadow-sm">
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 ${!showTrimmed ? 'opacity-50 pointer-events-none' : ''}`}>
              <Input
                label="Trim Percent (0-50)"
                type="number"
                min={0}
                max={50}
                value={trimPercent}
                onChange={(e) => setTrimPercent(e.target.value)}
                placeholder="10"
              />
              <Input
                label="Trim Count per Side"
                type="number"
                min={0}
                value={trimCount}
                onChange={(e) => setTrimCount(e.target.value)}
                placeholder="0"
              />
              <div className="flex items-end">
                <p className="text-sm text-[var(--color-ink-light)]">
                  If both are set, count wins. {showTrimmed ? "Keep it sane so you don't trim away everything." : "(Ignored unless Trimmed Mean is selected)"}
                </p>
              </div>
            </div>

            <DataTableInput
              label="Data Points"
              helpText="Enter values (one per line, or comma/space separated)."
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
            Calculate Selected Means
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {showTrimean && (
                <Card className="p-4 border border-gray-100">
                  <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Trimean</div>
                  <div className="text-2xl font-bold text-[var(--color-ink)]">{formatNum(result.value.trimean)}</div>
                </Card>
              )}
              {showGeometric && (
                <Card className={`p-4 border ${Number.isFinite(result.value.geometricMean) ? "border-gray-100" : "border-red-200 bg-red-50"}`}>
                  <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Geometric Mean</div>
                  <div className={`text-2xl font-bold ${Number.isFinite(result.value.geometricMean) ? "text-[var(--color-ink)]" : "text-red-600"}`}>
                    {Number.isFinite(result.value.geometricMean)
                      ? formatNum(result.value.geometricMean)
                      : "N/A (needs all > 0)"}
                  </div>
                </Card>
              )}
              {showTrimmed && (
                <Card className="p-4 border border-gray-100">
                  <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Trimmed Mean</div>
                  <div className="text-2xl font-bold text-[var(--color-ink)]">{formatNum(result.value.trimmedMean)}</div>
                </Card>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {showTrimmed && (
                <Card className="p-4 border border-gray-100">
                  <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Trim Settings</div>
                  <div className="text-base text-[var(--color-ink)]">
                    Trim per side: {result.value.trimCountPerSide}
                    <br />
                    From inputs — count: {currentTrimInfo.count}, percent: {currentTrimInfo.percent}
                  </div>
                </Card>
              )}
              <Card className="p-4 border border-gray-100">
                <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Sample Sizes</div>
                <div className="text-base text-[var(--color-ink)]">
                  Used n: {result.value.n}
                  <br />
                  Original n: {result.value.originalN}
                </div>
              </Card>
              <Card className="p-4 border border-gray-100">
                <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Quartiles</div>
                <div className="text-base text-[var(--color-ink)]">
                  Q1: {formatNum(result.value.quartiles.q1)}
                  <br />
                  Median: {formatNum(result.value.quartiles.median)}
                  <br />
                  Q3: {formatNum(result.value.quartiles.q3)}
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold mt-8 mb-4">Step-by-Step Working</h3>
              {result.steps.filter(step => {
                const t = step.title.toLowerCase();
                if (t.includes("trimean") && !showTrimean) return false;
                if (t.includes("geometric") && !showGeometric) return false;
                if (t.includes("trimmed") && !showTrimmed) return false;
                return true;
              }).map((step) => (
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
                  {step.formula && <MathBlock formula={step.formula} className="my-2" />}
                  {step.calculation && <MathBlock formula={step.calculation} className="my-2" />}
                  {step.note && (
                    <p className="text-sm text-[var(--color-ink-light)] mt-1">{step.note}</p>
                  )}
                  {step.result && (
                    <p className="text-xl font-bold mt-3 text-[var(--color-dot-blue)]">= {step.result}</p>
                  )}
                </div>
              ))}
            </div>

            <CopyExamAnswer
              answer={resultToExamAnswer(result, { trimPercent, trimCount }, meanType)}
            />
          </section>
        )}
      </div>
    </main>
  );
}
