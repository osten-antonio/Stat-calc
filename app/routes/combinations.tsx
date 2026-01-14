import { useState } from "react";
import type { Route } from "./+types/combinations";
import { Link } from "react-router";

import { combinationsWithSteps } from "~/lib/math/combinations";
import { CopyExamAnswer } from "~/components/calculator/CopyExamAnswer";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import type { CalculationResult } from "~/lib/types/calculation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Combinations" },
    { name: "description", content: "Calculate combinations C(n, r) with step-by-step workings." },
  ];
}

function resultToExamAnswer(calc: CalculationResult<number>): ExamAnswer {
  return {
    title: "Combinations Calculation",
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
    finalAnswer: `C(${calc.inputs.n}, ${calc.inputs.r}) = ${calc.value}`,
  };
}

export default function CombinationsCalculator() {
  const [n, setN] = useState("");
  const [r, setR] = useState("");
  const [result, setResult] = useState<CalculationResult<number> | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    setError(null);
    setResult(null);

    const nVal = parseInt(n, 10);
    const rVal = parseInt(r, 10);

    if (isNaN(nVal) || isNaN(rVal)) {
      setError("Please enter valid integers for n and r.");
      return;
    }
    if (nVal < 0 || rVal < 0) {
      setError("n and r must be non-negative integers.");
      return;
    }
    if (nVal > 170) {
      setError("n is too large (factorial overflow). Max is 170.");
      return;
    }

    const calc = combinationsWithSteps(nVal, rVal);
    setResult(calc);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 font-sans text-[var(--color-ink)]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 fade-in">
          <Link
            to="/"
            className="text-sm font-medium text-[var(--color-ink-light)] hover:text-[var(--color-dot-peach)] transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>

          <h1
            className="text-5xl font-medium tracking-tight mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Combinations
          </h1>
          <p className="text-lg text-[var(--color-ink-light)] max-w-2xl">
            Calculate C(n, r)  the number of ways to choose r items from n (order doesn't matter).
          </p>
        </header>

        <Card
          className="mb-10 bg-[var(--color-accent-peach)] border-none fade-in"
          style={{ animationDelay: "50ms" }}
        >
          <MathBlock formula="C(n, r) = \frac{n!}{r!(n - r)!}" />
        </Card>

        <section className="mb-12 fade-in" style={{ animationDelay: "100ms" }}>
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <Input
              label="n (total items)"
              type="number"
              min={0}
              value={n}
              onChange={(e) => setN(e.target.value)}
              placeholder="e.g. 10"
            />
            <Input
              label="r (items to choose)"
              type="number"
              min={0}
              value={r}
              onChange={(e) => setR(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>

          {error && (
            <p className="text-red-600 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <Button className="mt-6 w-full md:w-auto" tone="peach" onClick={calculate}>
            Calculate
          </Button>
        </section>

        {result && (
          <section className="fade-in space-y-6" style={{ animationDelay: "150ms" }}>
            <h2
              className="text-3xl font-medium"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Step-by-Step Working
            </h2>

            <div className="space-y-4">
              {result.steps.map((step) => (
                <div
                  key={step.id}
                  className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
                  {step.description && (
                    <p className="text-sm text-[var(--color-ink-light)] mb-2">
                      {step.description}
                    </p>
                  )}
                  {step.formula && <MathBlock formula={step.formula} className="my-2" />}
                  {step.calculation && <MathBlock formula={step.calculation} className="my-2" />}
                  {step.note && (
                    <p className="text-sm text-[var(--color-ink-light)] mt-1">
                      {step.note}
                    </p>
                  )}
                  {step.result && (
                    <p className="text-xl font-bold mt-3 text-[var(--color-dot-peach)]">
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

