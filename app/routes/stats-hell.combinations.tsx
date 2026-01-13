import { useState } from "react";
import type { Route } from "./+types/stats-hell.combinations";
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
    { title: "Stats Hell | Combinations" },
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
    <main className="retro-theme min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-3xl retro-fire">COMBINATIONS</h1>
        <p className="text-sm mt-2">
          Calculate C(n, r) — the number of ways to choose r items from n (order doesn't matter).
        </p>
        <Link to="/stats-hell" className="text-xs">
          ← Back to Stats Hell
        </Link>
      </header>

      <Card className="retro-card mb-6">
        <MathBlock formula="C(n, r) = \frac{n!}{r!(n - r)!}" />
      </Card>

      <section className="mb-6">
        <div className="grid grid-cols-2 gap-4 max-w-md">
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

        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}

        <Button className="mt-4" onClick={calculate}>
          Calculate
        </Button>
      </section>

      {result && (
        <section>
          <h2 className="text-xl mb-4">Step-by-Step Working</h2>

          <div className="space-y-4 mb-6">
            {result.steps.map((step) => (
              <Card key={step.id} className="retro-card">
                <h3 className="font-bold text-lg">{step.title}</h3>
                {step.description && <p>{step.description}</p>}
                {step.formula && <MathBlock formula={step.formula} />}
                {step.calculation && <MathBlock formula={step.calculation} />}
                {step.note && <p className="text-sm opacity-80">{step.note}</p>}
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
