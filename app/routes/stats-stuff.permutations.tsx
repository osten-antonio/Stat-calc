import { useState } from "react";
import type { Route } from "./+types/stats-stuff.permutations";
import { Link } from "react-router";

import { permutationsWithSteps } from "~/lib/math/permutations";
import { CopyExamAnswer } from "~/components/calculator/CopyExamAnswer";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";
import type { ExamAnswer } from "~/lib/format/examAnswer";
import type { CalculationResult } from "~/lib/types/calculation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stats Stuff | Permutations" },
    { name: "description", content: "Calculate permutations P(n, r) with step-by-step workings." },
  ];
}

function resultToExamAnswer(calc: CalculationResult<number>): ExamAnswer {
  return {
    title: "Permutations Calculation",
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
    finalAnswer: `P(${calc.inputs.n}, ${calc.inputs.r}) = ${calc.value}`,
  };
}

export default function PermutationsCalculator() {
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

    const calc = permutationsWithSteps(nVal, rVal);
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
            Permutations
          </h1>
          <p className="text-[var(--color-ink-light)]">
            Calculate P(n, r) — the number of ways to arrange r items from n.
          </p>
        </header>

        <Card className="mb-8 bg-[var(--color-accent-peach)] fade-in" style={{ animationDelay: "50ms" }}>
          <MathBlock formula="P(n, r) = \frac{n!}{(n - r)!}" />
        </Card>

        <section className="mb-8 fade-in" style={{ animationDelay: "100ms" }}>
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <Input
              label="n (total items)"
              type="number"
              min={0}
              value={n}
              onChange={(e) => setN(e.target.value)}
              placeholder="e.g. 8"
            />
            <Input
              label="r (items to arrange)"
              type="number"
              min={0}
              value={r}
              onChange={(e) => setR(e.target.value)}
              placeholder="e.g. 4"
            />
          </div>

          {error && (
            <p className="text-red-600 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <Button className="mt-4" onClick={calculate}>
            Calculate
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

            <div className="space-y-4 mb-6">
              {result.steps.map((step) => (
                <div
                  key={step.id}
                  className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]"
                >
                  <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                  {step.description && (
                    <p className="text-xs text-[var(--color-ink-light)] mb-2">
                      {step.description}
                    </p>
                  )}
                  {step.formula && <MathBlock formula={step.formula} className="my-2" />}
                  {step.calculation && <MathBlock formula={step.calculation} className="my-2" />}
                  {step.note && (
                    <p className="text-xs text-[var(--color-ink-light)] mt-1">
                      {step.note}
                    </p>
                  )}
                  {step.result && (
                    <p className="text-lg font-bold mt-2 text-[var(--color-dot-peach)]">
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
