import { useState } from "react";
import type { Route } from "./+types/stats-stuff.hypergeometric";
import { Link } from "react-router";

import { hypergeometricWithSteps, type HypergeometricResult } from "~/lib/math/probability";
import { CopyExamAnswer } from "~/components/calculator/CopyExamAnswer";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import type { CalculationResult } from "~/lib/types/calculation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stats Stuff | Hypergeometric Distribution" },
    { name: "description", content: "Calculate hypergeometric probability for sampling without replacement." },
  ];
}

function formatNum(num: number, decimals = 6): string {
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function resultToExamAnswer(calc: CalculationResult<HypergeometricResult>): ExamAnswer {
  return {
    title: "Hypergeometric Probability Calculation",
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

export default function HypergeometricCalculator() {
  const [N, setN] = useState("");
  const [K, setK] = useState("");
  const [n, setN2] = useState("");
  const [k, setK2] = useState("");
  const [result, setResult] = useState<CalculationResult<HypergeometricResult> | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    setError(null);
    setResult(null);

    const NVal = parseInt(N, 10);
    const KVal = parseInt(K, 10);
    const nVal = parseInt(n, 10);
    const kVal = parseInt(k, 10);

    if ([NVal, KVal, nVal, kVal].some(isNaN)) {
      setError("All values must be valid integers. This isn't a creative writing exercise.");
      return;
    }
    if (NVal < 0 || KVal < 0 || nVal < 0 || kVal < 0) {
      setError("Negative values? In probability? That's not how any of this works.");
      return;
    }
    if (KVal > NVal) {
      setError("K can't exceed N. You can't have more successes than the total population.");
      return;
    }
    if (nVal > NVal) {
      setError("n can't exceed N. You can't draw more items than exist.");
      return;
    }
    if (NVal > 170) {
      setError("N is too large (factorial overflow). Keep N ≤ 170.");
      return;
    }

    const calc = hypergeometricWithSteps(NVal, KVal, nVal, kVal);
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
            Hypergeometric Distribution
          </h1>
          <p className="text-lg text-[var(--color-ink-light)] max-w-2xl">
            Probability of k successes in n draws without replacement from a finite population.
          </p>
        </header>

        <Card
          className="mb-10 bg-[var(--color-accent-pink)] border-none fade-in"
          style={{ animationDelay: "50ms" }}
        >
          <MathBlock formula="P(X = k) = \frac{C(K, k) \cdot C(N-K, n-k)}{C(N, n)}" />
          <p className="text-center text-xs text-[var(--color-ink-light)] mt-2">
            N = population, K = success states, n = draws, k = observed successes
          </p>
        </Card>

        <section className="mb-12 fade-in" style={{ animationDelay: "100ms" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="N (population)"
              type="number"
              min={0}
              value={N}
              onChange={(e) => setN(e.target.value)}
              placeholder="e.g. 52"
            />
            <Input
              label="K (successes in pop)"
              type="number"
              min={0}
              value={K}
              onChange={(e) => setK(e.target.value)}
              placeholder="e.g. 13"
            />
            <Input
              label="n (draws)"
              type="number"
              min={0}
              value={n}
              onChange={(e) => setN2(e.target.value)}
              placeholder="e.g. 5"
            />
            <Input
              label="k (successes wanted)"
              type="number"
              min={0}
              value={k}
              onChange={(e) => setK2(e.target.value)}
              placeholder="e.g. 2"
            />
          </div>

          <p className="text-xs text-[var(--color-ink-light)] mt-4 p-3 bg-white rounded border border-gray-100 shadow-sm">
            <strong>Example:</strong> Drawing 5 cards from a 52-card deck, what's the probability of exactly 2 hearts?
            <br />
            N=52, K=13 (hearts), n=5, k=2
          </p>

          {error && (
            <p className="text-red-600 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <Button className="mt-6 w-full md:w-auto" tone="pink" onClick={calculate}>
            Calculate P(X = k)
          </Button>
        </section>

        {result && (
          <section className="fade-in space-y-8" style={{ animationDelay: "150ms" }}>
            <h2
              className="text-3xl font-medium"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Step-by-Step Working
            </h2>

            <Card className="mb-2 bg-[var(--color-accent-pink)] border-none">
              <h3 className="font-semibold mb-2 opacity-75" style={{ fontFamily: "var(--font-serif)" }}>
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
                  {step.formula && <MathBlock formula={step.formula} className="my-2" />}
                  {step.calculation && <MathBlock formula={step.calculation} className="my-2" />}
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

