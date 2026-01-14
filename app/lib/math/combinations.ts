import { factorial } from "./factorial";
import type { CalculationStep, CalculationResult } from "~/lib/types/calculation";

export function combinations(n: number, r: number): number {
  if (r > n) return 0;
  if (r === 0 || r === n) return 1;
  return factorial(n) / (factorial(n - r) * factorial(r));
}

function factorialExpansion(num: number): string {
  if (num <= 1) return "1";
  const parts: string[] = [];
  for (let i = num; i >= 1; i--) parts.push(String(i));
  return parts.join(" × ");
}

export function combinationsWithSteps(
  n: number,
  r: number,
): CalculationResult<number> {
  const steps: CalculationStep[] = [];

  steps.push({
    id: "identify",
    title: "Identify Variables",
    description: `n = ${n} (total items), r = ${r} (items to choose)`,
  });

  if (r > n) {
    steps.push({
      id: "invalid",
      title: "Invalid Input",
      description: "r cannot be greater than n. C(n, r) = 0 when r > n.",
      result: "0",
    });
    return {
      value: 0,
      steps,
      formula: "C(n, r) = \\frac{n!}{r!(n - r)!}",
      inputs: { n, r },
    };
  }

  if (r === 0 || r === n) {
    steps.push({
      id: "trivial",
      title: "Special Case",
      description: r === 0 ? "Choosing 0 items: there is exactly 1 way (choose nothing)." : "Choosing all items: there is exactly 1 way.",
      result: "1",
    });
    return {
      value: 1,
      steps,
      formula: "C(n, r) = \\frac{n!}{r!(n - r)!}",
      inputs: { n, r },
    };
  }

  steps.push({
    id: "formula",
    title: "State the Formula",
    formula: "C(n, r) = \\frac{n!}{r!(n - r)!}",
  });

  const nMinusR = n - r;
  const nFact = factorial(n);
  const rFact = factorial(r);
  const nMinusRFact = factorial(nMinusR);
  const denominator = rFact * nMinusRFact;
  const result = nFact / denominator;

  steps.push({
    id: "substitution",
    title: "Substitute Values",
    formula: `C(${n}, ${r}) = \\frac{${n}!}{${r}! \\times (${n} - ${r})!} = \\frac{${n}!}{${r}! \\times ${nMinusR}!}`,
  });

  steps.push({
    id: "expand-n",
    title: "Expand n!",
    calculation: `${n}! = ${factorialExpansion(n)} = ${nFact}`,
  });

  steps.push({
    id: "expand-r",
    title: "Expand r!",
    calculation: `${r}! = ${factorialExpansion(r)} = ${rFact}`,
  });

  steps.push({
    id: "expand-nmr",
    title: "Expand (n - r)!",
    calculation: `${nMinusR}! = ${nMinusR > 0 ? factorialExpansion(nMinusR) : "1"} = ${nMinusRFact}`,
  });

  const simplified: string[] = [];
  for (let i = n; i > Math.max(r, nMinusR); i--) simplified.push(String(i));
  const numeratorSimplified = simplified.length > 0 ? simplified.join(" × ") : String(nFact);
  const denominatorSimplified = Math.min(r, nMinusR);
  const denominatorFactVal = factorial(denominatorSimplified);

  steps.push({
    id: "simplify",
    title: "Simplify (Cancel Common Terms)",
    calculation: `\\frac{${n}!}{${r}! \\times ${nMinusR}!} = \\frac{${numeratorSimplified}}{${denominatorSimplified}!} = \\frac{${simplified.reduce((a, b) => a * Number(b), 1) || nFact}}{${denominatorFactVal}} = ${result}`,
  });

  steps.push({
    id: "result",
    title: "Final Answer",
    result: String(result),
    description: `There are ${result.toLocaleString()} ways to choose ${r} items from ${n}.`,
  });

  return {
    value: result,
    steps,
    formula: "C(n, r) = \\frac{n!}{r!(n - r)!}",
    inputs: { n, r },
  };
}
