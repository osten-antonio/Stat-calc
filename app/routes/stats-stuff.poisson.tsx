import { useState } from "react";
import type { Route } from "./+types/stats-stuff.poisson";
import { Link } from "react-router";

import { poissonWithSteps, type PoissonResult } from "~/lib/math/probability";
import { CopyExamAnswer } from "~/components/calculator/CopyExamAnswer";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import type { CalculationResult } from "~/lib/types/calculation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stats Stuff | Poisson Distribution" },
    { name: "description", content: "Calculate Poisson probability P(X = k) with step-by-step workings." },
  ];
}

function formatNum(num: number, decimals = 6): string {
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function resultToExamAnswer(calc: CalculationResult<PoissonResult>): ExamAnswer {
  return {
    title: "Poisson Probability Calculation",
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
    finalAnswer: `P(X = ${calc.value.k}) = ${formatNum(calc.value.probability)} (${formatNum(calc.value.probability * 100, 2)}%)`,
  };
}

export default function PoissonCalculator() {
  const [lambda, setLambda] = useState("");
  const [k, setK] = useState("");
  const [result, setResult] = useState<CalculationResult<PoissonResult> | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    setError(null);
    setResult(null);

    const lambdaVal = parseFloat(lambda);
    const kVal = parseInt(k, 10);

    if (isNaN(lambdaVal)) {
      setError("λ must be a valid number. Not 'lambda' spelled out, the actual number.");
      return;
    }
    if (isNaN(kVal)) {
      setError("k must be a valid integer. Whole numbers only, no fractions.");
      return;
    }
    if (lambdaVal <= 0) {
      setError("λ must be positive. Zero events per time period means nothing ever happens. Boring.");
      return;
    }
    if (kVal < 0) {
      setError("k must be non-negative. You can't have -3 meteor strikes.");
      return;
    }
    if (kVal > 170) {
      setError("k is too large (factorial overflow). Keep k ≤ 170.");
      return;
    }

    const calc = poissonWithSteps(lambdaVal, kVal);
    setResult(calc);
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 fade-in">
          <Link
            to="/stats-stuff"
            className="text-sm text-[var(--color-ink-light)] hover:text-[var(--color-ink)] transition-colors mb-4 inline-block"
          >
            ← Back to Stats Stuff
          </Link>
          <h1
            className="text-4xl font-medium tracking-tight mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Poisson Distribution
          </h1>
          <p className="text-[var(--color-ink-light)]">
            Calculate the probability of k events occurring in a fixed interval when the average rate is λ.
          </p>
        </header>

        <Card className="mb-8 bg-[var(--color-accent-pink)] fade-in" style={{ animationDelay: "50ms" }}>
          <MathBlock formula="P(X = k) = \frac{\lambda^k \cdot e^{-\lambda}}{k!}" />
          <p className="text-center text-xs text-[var(--color-ink-light)] mt-2">
            λ = average rate (mean), k = number of occurrences, e ≈ 2.71828
          </p>
        </Card>

        <section className="mb-8 fade-in" style={{ animationDelay: "100ms" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
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
              label="k (occurrences)"
              type="number"
              min={0}
              value={k}
              onChange={(e) => setK(e.target.value)}
              placeholder="e.g. 2"
            />
          </div>

          {error && (
            <p className="text-red-600 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <Button className="mt-4" onClick={calculate}>
            Calculate P(X = k)
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
              <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                Result
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--color-dot-mint)] mb-1">
                  {formatNum(result.value.probability)}
                </div>
                <div className="text-sm text-[var(--color-ink-light)]">
                  = {formatNum(result.value.probability * 100, 2)}%
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
