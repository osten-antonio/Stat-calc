import { useState } from "react";
import type { Route } from "./+types/stats-stuff.binomial";
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
    { title: "Stats Stuff | Binomial Distribution" },
    { name: "description", content: "Calculate binomial probability P(X = k) with step-by-step workings." },
  ];
}

function formatNum(num: number, decimals = 6): string {
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function resultToExamAnswer(calc: CalculationResult<BinomialResult>): ExamAnswer {
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
  const [result, setResult] = useState<CalculationResult<BinomialResult> | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    setError(null);
    setResult(null);

    const nVal = parseInt(n, 10);
    const kVal = parseInt(k, 10);
    const pVal = parseFloat(p);

    if (isNaN(nVal) || isNaN(kVal)) {
      setError("n and k must be valid integers. Try using numbers instead of hopes and dreams.");
      return;
    }
    if (isNaN(pVal)) {
      setError("p must be a valid probability (0 to 1). Not 'maybe' or 'probably'.");
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
    <main className="retro-theme min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-3xl retro-fire">BINOMIAL DISTRIBUTION</h1>
        <p className="text-sm mt-2">
          Calculate the probability of exactly k successes in n independent trials.
        </p>
        <Link to="/stats-stuff" className="text-xs">
          ← Back to Stats Stuff
        </Link>
      </header>

      <Card className="retro-card mb-6">
        <MathBlock formula="P(X = k) = C(n, k) \cdot p^k \cdot (1-p)^{n-k}" />
        <p className="text-center text-xs opacity-70 mt-2">
          n = trials, k = successes, p = probability of success
        </p>
      </Card>

      <section className="mb-6">
        <div className="grid grid-cols-3 gap-4 max-w-lg">
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
