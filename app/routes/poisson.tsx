import { useState } from "react";
import type { Route } from "./+types/poisson";
import { Link } from "react-router";

import {
  poissonRangeWithSteps,
  poissonNormalApproxWithSteps,
  type PoissonRangeResult,
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
    { title: "Poisson Distribution" },
    {
      name: "description",
      content:
        "Calculate Poisson probability P(min ≤ X ≤ max) with step-by-step workings.",
    },
  ];
}

function formatNum(num: number, decimals = 6): string {
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function resultToExamAnswer(
  calc: CalculationResult<PoissonRangeResult | NormalApproxResult>,
): ExamAnswer {
  const isNormal = 'mean' in calc.value && 'stdDev' in calc.value;
  const title = isNormal ? "Poisson Probability (Normal Approximation)" : "Poisson Probability Calculation";

  // Safe access to min/max from inputs
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

export default function PoissonCalculator() {
  const [lambda, setLambda] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [useNormalApprox, setUseNormalApprox] = useState(false);

  const [result, setResult] =
    useState<CalculationResult<PoissonRangeResult | NormalApproxResult> | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    setError(null);
    setResult(null);

    const lambdaVal = parseFloat(lambda);
    const minVal = parseInt(min, 10);
    const maxVal = parseInt(max, 10);

    if (isNaN(lambdaVal)) {
      setError(
        "λ must be a valid number.",
      );
      return;
    }
    if (isNaN(minVal) || isNaN(maxVal)) {
      setError("min and max must be valid integers.");
      return;
    }
    if (lambdaVal <= 0) {
      setError(
        "λ must be positive.",
      );
      return;
    }
    if (minVal < 0 || maxVal < 0) {
      setError("Counts must be non-negative.");
      return;
    }
    if (minVal > maxVal) {
      setError("Min cannot be greater than Max.");
      return;
    }

    // Limits
    if (!useNormalApprox && maxVal > 170) {
      setError("Max count is too large for exact calculation (factorial overflow). Use Normal Approximation.");
      return;
    }

    // Suggest Normal Approx
    if (lambdaVal > 15 && !useNormalApprox) {
      // Just a warning or we could auto-switch, but let's stick to user choice with maybe a hint in UI.
      // For now, allow exact calculation if maxVal isn't huge.
    }

    if (useNormalApprox) {
      const calc = poissonNormalApproxWithSteps(lambdaVal, minVal, maxVal);
      setResult(calc);
    } else {
      const calc = poissonRangeWithSteps(lambdaVal, minVal, maxVal);
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
            Poisson Distribution
          </h1>
          <p className="text-lg text-[var(--color-ink-light)] max-w-2xl">
            Calculate Poisson probability P(min ≤ X ≤ max) when the average rate is λ.
          </p>
        </header>

        <Card
          className="mb-10 bg-[var(--color-accent-pink)] border-none fade-in"
          style={{ animationDelay: "50ms" }}
        >
          <MathBlock formula="P(X = k) = \frac{\lambda^k \cdot e^{-\lambda}}{k!}" />
          <p className="text-center text-xs text-[var(--color-ink-light)] mt-2">
            λ = average rate (mean), k = number of occurrences, e ≈ 2.71828
          </p>
        </Card>

        <section className="mb-12 fade-in" style={{ animationDelay: "100ms" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="λ (lambda/mean)"
              type="number"
              min={0}
              step={0.1}
              value={lambda}
              onChange={(e) => setLambda(e.target.value)}
              placeholder="e.g. 3.5"
            />
            <Input
              label="min occurrences"
              type="number"
              min={0}
              value={min}
              onChange={(e) => setMin(e.target.value)}
              placeholder="e.g. 2"
            />
            <Input
              label="max occurrences"
              type="number"
              min={0}
              value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder="e.g. 4"
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
              Use Normal Approximation (for λ {'>'} 15, applies continuity correction)
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
