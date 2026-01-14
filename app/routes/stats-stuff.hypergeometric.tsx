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
    <main className="retro-theme min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-3xl retro-fire">HYPERGEOMETRIC</h1>
        <p className="text-sm mt-2">
          Probability of k successes in n draws without replacement from a finite population.
        </p>
        <Link to="/stats-stuff" className="text-xs">
          ← Back to Stats Stuff
        </Link>
      </header>

      <Card className="retro-card mb-6">
        <MathBlock formula="P(X = k) = \frac{C(K, k) \cdot C(N-K, n-k)}{C(N, n)}" />
        <p className="text-center text-xs opacity-70 mt-2">
          N = population, K = success states, n = draws, k = observed successes
        </p>
      </Card>

      <section className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
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

        <p className="text-xs opacity-70 mt-2">
          Example: Drawing 5 cards from a 52-card deck, what's the probability of exactly 2 hearts?
          N=52, K=13 (hearts), n=5, k=2
        </p>

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
