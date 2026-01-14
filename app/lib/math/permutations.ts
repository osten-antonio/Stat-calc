import { factorial } from "./factorial";
import type { CalculationStep, CalculationResult } from "~/lib/types/calculation";

export function permutations(n: number, r: number): number {
  if (r > n) return 0;
  return factorial(n) / factorial(n - r);
}

function factorialExpansion(num: number): string {
  if (num <= 1) return "1";
  const parts: string[] = [];
  for (let i = num; i >= 1; i--) parts.push(String(i));
  return parts.join(" × ");
}

export function permutationsWithSteps(
  n: number,
  r: number,
): CalculationResult<number> {
  const steps: CalculationStep[] = [];

  steps.push({
    id: "identify",
    title: "Identify Variables",
    description: `n = ${n} (total items), r = ${r} (items to arrange)`,
  });

  if (r > n) {
    steps.push({
      id: "invalid",
      title: "Invalid Input",
      description: "r cannot be greater than n. P(n, r) = 0 when r > n.",
      result: "0",
    });
    return {
      value: 0,
      steps,
      formula: "P(n, r) = \\frac{n!}{(n - r)!}",
      inputs: { n, r },
    };
  }

  steps.push({
    id: "formula",
    title: "State the Formula",
    formula: "P(n, r) = \\frac{n!}{(n - r)!}",
  });

  const nMinusR = n - r;
  const nFact = factorial(n);
  const nMinusRFact = factorial(nMinusR);
  const result = nFact / nMinusRFact;

  steps.push({
    id: "substitution",
    title: "Substitute Values",
    formula: `P(${n}, ${r}) = \\frac{${n}!}{(${n} - ${r})!} = \\frac{${n}!}{${nMinusR}!}`,
  });

  const nExpansion = factorialExpansion(n);
  const nMinusRExpansion = nMinusR > 0 ? factorialExpansion(nMinusR) : "1";

  steps.push({
    id: "expand",
    title: "Expand Factorials",
    calculation: `${n}! = ${nExpansion} = ${nFact}`,
    note: nMinusR > 0 ? `${nMinusR}! = ${nMinusRExpansion} = ${nMinusRFact}` : `0! = 1`,
  });

  if (nMinusR > 0 && nMinusR < n) {
    const cancelledParts: string[] = [];
    for (let i = n; i > nMinusR; i--) cancelledParts.push(String(i));
    steps.push({
      id: "simplify",
      title: "Simplify (Cancel Common Terms)",
      calculation: `\\frac{${n}!}{${nMinusR}!} = ${cancelledParts.join(" × ")} = ${result}`,
    });
  } else {
    steps.push({
      id: "divide",
      title: "Divide",
      calculation: `\\frac{${nFact}}{${nMinusRFact}} = ${result}`,
    });
  }

  steps.push({
    id: "result",
    title: "Final Answer",
    result: String(result),
    description: `There are ${result.toLocaleString()} ways to arrange ${r} items from ${n}.`,
  });

  return {
    value: result,
    steps,
    formula: "P(n, r) = \\frac{n!}{(n - r)!}",
    inputs: { n, r },
  };
}
