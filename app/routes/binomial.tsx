import { useState } from "react";
import type { Route } from "./+types/binomial";
import { Link } from "react-router";

import { binomialWithSteps, type BinomialResult } from "~/lib/math/probability";
import { CopyExamAnswer } from "~/components/calculator/CopyExamAnswer";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import type { CalculationResult } from "~/lib/types/calculation";

export function meta({}: Route.MetaArgs) {
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
  calc: CalculationResult<BinomialResult>,
): ExamAnswer {
  return {
    title: "Binomial Probability Calculation",
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

export default function BinomialCalculator() {
  const [n, setN] = useState("");
  const [k, setK] = useState("");
  const [p, setP] = useState("");
  const [result, setResult] =
    useState<CalculationResult<BinomialResult> | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    setError(null);
    setResult(null);

    const nVal = parseInt(n, 10);
    const kVal = parseInt(k, 10);
    const pVal = parseFloat(p);

    if (isNaN(nVal) || isNaN(kVal)) {
      setError(
        "n and k must be valid integers. Try using numbers instead of hopes and dreams.",
      );
      return;
    }
    if (isNaN(pVal)) {
      setError(
        "p must be a valid probability (0 to 1). Not 'maybe' or 'probably'.",
      );
      return;
    }
    if (nVal < 0 || kVal < 0) {
      setError("Negative trials? That's not how probability works.");
      return;
    }
    if (pVal < 0 || pVal > 1) {
      setError("Probability must be between 0 and 1. This isn't Calvinball.");
      return;
    }
    if (nVal > 170) {
      setError("n is too large (factorial overflow). Keep n ≤ 170.");
      return;
    }

    const calc = binomialWithSteps(nVal, kVal, pVal);
    setResult(calc);
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
            Calculate the probability of exactly k successes in n independent
            trials.
          </p>
        </header>

        <Card
          className="mb-10 bg-[var(--color-accent-pink)] border-none fade-in"
          style={{ animationDelay: "50ms" }}
        >
          <MathBlock formula="P(X = k) = C(n, k) \cdot p^k \cdot (1-p)^{n-k}" />
          <p className="text-center text-xs text-[var(--color-ink-light)] mt-2">
            n = trials, k = successes, p = probability of success
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
              label="k (successes)"
              type="number"
              min={0}
              value={k}
              onChange={(e) => setK(e.target.value)}
              placeholder="e.g. 3"
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
            Calculate P(X = k)
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
