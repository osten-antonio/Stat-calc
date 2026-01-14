import { useState } from "react";
import type { Route } from "./+types/binomial";
import { Link } from "react-router";

import {
  binomialRangeWithSteps,
  normalApproximationWithSteps,
  type BinomialRangeResult,
  type NormalApproxResult
} from "~/lib/math/probability";
import { CopyExamAnswer } from "~/components/calculator/CopyExamAnswer";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import type { CalculationResult } from "~/lib/types/calculation";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Binomial Distribution" },
    {
      name: "description",
      content:
        "Calculate binomial probability P(X = k) with step-by-step workings.",
    },
  ];
}

function formatNum(num: number, decimals = 6): string {
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function resultToExamAnswer(
  calc: CalculationResult<BinomialRangeResult | NormalApproxResult>,
): ExamAnswer {
  const isNormal = 'mean' in calc.value && 'stdDev' in calc.value;
  const title = isNormal ? "Binomial Probability (Normal Approximation)" : "Binomial Probability Calculation";

  // Safe access to min/max which exist in both but TS might complain if specific range logic differs
  // Both result types have min, max, probability.
  // NormalApproxResult has min/max in the interface I defined? 
  // Wait, I defined NormalApproxResult WITHOUT min/max in probability.ts?
  // Let me check my previous edit.
  // In step 127 I defined NormalApproxResult:
  // export interface NormalApproxResult { probability: number; mean: number; stdDev: number; zLow: number; zHigh: number; correction: boolean; }
  // Converting to exam answer needs min/max from inputs or value.
  // The 'inputs' field of CalculationResult has them.

  const min = calc.inputs?.min ?? 0;
  const max = calc.inputs?.max ?? 0;

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
    finalAnswer: `P(${min} ≤ X ≤ ${max}) ≈ ${formatNum(calc.value.probability)} (${formatNum(calc.value.probability * 100, 2)}%)`,
  };
}

export default function BinomialCalculator() {
  const [n, setN] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [p, setP] = useState("");
  const [useNormalApprox, setUseNormalApprox] = useState(false);

  const [result, setResult] =
    useState<CalculationResult<BinomialRangeResult | NormalApproxResult> | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    setError(null);
    setResult(null);

    const nVal = parseInt(n, 10);
    const minVal = parseInt(min, 10);
    const maxVal = parseInt(max, 10);
    const pVal = parseFloat(p);

    if (isNaN(nVal) || isNaN(minVal) || isNaN(maxVal)) {
      setError(
        "n, min, and max must be valid integers. Numbers only, please.",
      );
      return;
    }
    if (isNaN(pVal)) {
      setError(
        "p must be a valid probability (0 to 1).",
      );
      return;
    }
    if (nVal < 0 || minVal < 0 || maxVal < 0) {
      setError("Negative values? Not in this universe.");
      return;
    }
    if (pVal < 0 || pVal > 1) {
      setError("Probability must be between 0 and 1.");
      return;
    }
    if (minVal > maxVal) {
      setError("Min cannot be greater than Max. Logic still applies here.");
      return;
    }
    if (maxVal > nVal) {
      setError("Max successes cannot exceed n (trials).");
      return;
    }
    if (nVal > 10000 && !useNormalApprox) {
      setError("n is too large for exact calculation. Use Normal Approximation.");
      return;
    }
    if (!useNormalApprox && nVal > 170) {
      // Allow larger n for normal approx, but limit for exact
      setError("n is too large (factorial overflow). Use Normal Approximation for n > 170.");
      return;
    }

    if (useNormalApprox) {
      const calc = normalApproximationWithSteps(nVal, minVal, maxVal, pVal);
      setResult(calc);
    } else {
      const calc = binomialRangeWithSteps(nVal, minVal, maxVal, pVal);
      setResult(calc);
    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 font-sans text-[var(--color-ink)]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 fade-in">
          <Link
            to="/"
            className="text-sm font-medium text-[var(--color-ink-light)] hover:text-[var(--color-dot-pink)] transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>

          <h1
            className="text-5xl font-medium tracking-tight mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Binomial Distribution
          </h1>
          <p className="text-lg text-[var(--color-ink-light)] max-w-2xl">
            Range Probability P(min ≤ X ≤ max) with step-by-step workings.
          </p>
        </header>

        <Card
          className="mb-10 bg-[var(--color-accent-pink)] border-none fade-in"
          style={{ animationDelay: "50ms" }}
        >
          <MathBlock formula="P(min \le X \le max) = \sum_{k=min}^{max} C(n, k) \cdot p^k \cdot (1-p)^{n-k}" />
          <p className="text-center text-xs text-[var(--color-ink-light)] mt-2">
            Summing individual probabilities for each k in the range
          </p>
        </Card>

        <section className="mb-12 fade-in" style={{ animationDelay: "100ms" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="n (trials)"
              type="number"
              min={0}
              value={n}
              onChange={(e) => setN(e.target.value)}
              placeholder="e.g. 10"
            />
            <Input
              label="min successes (k_min)"
              type="number"
              min={0}
              value={min}
              onChange={(e) => setMin(e.target.value)}
              placeholder="e.g. 4"
            />
            <Input
              label="max successes (k_max)"
              type="number"
              min={0}
              value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder="e.g. 6"
            />
            <Input
              label="p (probability)"
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={p}
              onChange={(e) => setP(e.target.value)}
              placeholder="e.g. 0.5"
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              id="useNormalApprox"
              className="w-5 h-5 accent-[var(--color-dot-pink)] rounded border-gray-300 focus:ring-[var(--color-dot-pink)]"
              checked={useNormalApprox}
              onChange={(e) => setUseNormalApprox(e.target.checked)}
            />
            <label htmlFor="useNormalApprox" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
              Use Normal Approximation (for large n, applies continuity correction)
            </label>
          </div>

          {error && (
            <p className="text-red-600 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <Button
            className="mt-6 w-full md:w-auto"
            tone="pink"
            onClick={calculate}
          >
            {useNormalApprox ? "Calculate Approximation" : "Calculate Probability"}
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
              Step-by-Step Working
            </h2>

            <Card className="mb-2 bg-[var(--color-accent-pink)] border-none">
              <h3
                className="font-semibold mb-2 opacity-75"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Result
              </h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-[var(--color-dot-pink)] mb-2">
                  {formatNum(result.value.probability)}
                </div>
                <div className="text-sm text-[var(--color-ink-light)]">
                  = {formatNum(result.value.probability * 100, 2)}%
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              {result.steps.map((step) => (
                <div
                  key={step.id}
                  className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  <h4 className="font-semibold text-lg mb-3">{step.title}</h4>
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
                    <p className="text-xl font-bold mt-3 text-[var(--color-dot-pink)]">
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
