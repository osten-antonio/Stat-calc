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
    <main className="retro-theme min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-3xl retro-fire">POISSON DISTRIBUTION</h1>
        <p className="text-sm mt-2">
          Calculate the probability of k events occurring in a fixed interval when the average rate is λ.
        </p>
        <Link to="/stats-stuff" className="text-xs">
          ← Back to Stats Stuff
        </Link>
      </header>

      <Card className="retro-card mb-6">
        <MathBlock formula="P(X = k) = \frac{\lambda^k \cdot e^{-\lambda}}{k!}" />
        <p className="text-center text-xs opacity-70 mt-2">
          λ = average rate (mean), k = number of occurrences, e ≈ 2.71828
        </p>
      </Card>

      <section className="mb-6">
        <div className="grid grid-cols-2 gap-4 max-w-md">
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

        {error && <p className="text-red-500 mt-2 text-sm retro-blink">{error}</p>}

        <Button className="mt-4" onClick={calculate}>
          Calculate P(X = k)
        </Button>
      </section>

      {result && (
        <section>
          <h2 className="text-xl mb-4">Step-by-Step Working</h2>

          <Card className="retro-card mb-6">
            <h3 className="font-bold text-lg mb-2">Result</h3>
            <div className="text-center">
              <div className="text-3xl font-bold retro-fire">
                {formatNum(result.value.probability)}
              </div>
              <div className="text-sm opacity-70">
                = {formatNum(result.value.probability * 100, 2)}%
              </div>
            </div>
          </Card>

          <div className="space-y-4 mb-6">
            {result.steps.map((step) => (
              <Card key={step.id} className="retro-card">
                <h3 className="font-bold text-lg">{step.title}</h3>
                {step.description && (
                  <pre className="text-sm whitespace-pre-wrap font-sans">{step.description}</pre>
                )}
                {step.formula && <MathBlock formula={step.formula} />}
                {step.calculation && <MathBlock formula={step.calculation} />}
                {step.note && <p className="text-sm opacity-80 mt-1">{step.note}</p>}
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
