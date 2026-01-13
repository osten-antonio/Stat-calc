import { factorial } from "./factorial";
import { combinations } from "./combinations";
import type { CalculationStep, CalculationResult } from "~/lib/types/calculation";

function formatNumber(num: number, decimals = 6): string {
  if (Number.isInteger(num)) return String(num);
  const fixed = num.toFixed(decimals);
  return fixed.replace(/\.?0+$/, "");
}

function formatProbability(p: number): string {
  if (p === 0) return "0";
  if (p === 1) return "1";
  if (p < 0.0001) return p.toExponential(4);
  return formatNumber(p, 6);
}

export interface BinomialResult {
  probability: number;
  n: number;
  k: number;
  p: number;
  q: number;
}

export function binomialWithSteps(
  n: number,
  k: number,
  p: number,
): CalculationResult<BinomialResult> {
  const steps: CalculationStep[] = [];
  const q = 1 - p;

  steps.push({
    id: "identify",
    title: "Identify Variables",
    description: [
      `n = ${n} (number of trials)`,
      `k = ${k} (number of successes)`,
      `p = ${formatNumber(p)} (probability of success)`,
      `q = 1 - p = ${formatNumber(q)} (probability of failure)`,
    ].join("\n"),
  });

  if (k < 0 || k > n) {
    steps.push({
      id: "invalid",
      title: "Invalid Input",
      description: `k must be between 0 and n. Given k = ${k}, n = ${n}.`,
      result: "0",
    });
    return {
      value: { probability: 0, n, k, p, q },
      steps,
      formula: "P(X = k) = C(n, k) \\cdot p^k \\cdot q^{n-k}",
      inputs: { n, k, p },
    };
  }

  if (p < 0 || p > 1) {
    steps.push({
      id: "invalid-p",
      title: "Invalid Input",
      description: `p must be between 0 and 1. Given p = ${p}.`,
      result: "Error",
    });
    return {
      value: { probability: 0, n, k, p, q },
      steps,
      formula: "P(X = k) = C(n, k) \\cdot p^k \\cdot q^{n-k}",
      inputs: { n, k, p },
    };
  }

  steps.push({
    id: "formula",
    title: "State the Binomial Probability Formula",
    formula: "P(X = k) = C(n, k) \\cdot p^k \\cdot q^{n-k}",
    note: "Where C(n, k) is the binomial coefficient (combinations)",
  });

  steps.push({
    id: "substitution",
    title: "Substitute Values",
    formula: `P(X = ${k}) = C(${n}, ${k}) \\cdot ${formatNumber(p)}^{${k}} \\cdot ${formatNumber(q)}^{${n - k}}`,
  });

  const nCk = combinations(n, k);
  steps.push({
    id: "combinations",
    title: "Calculate C(n, k)",
    formula: `C(${n}, ${k}) = \\frac{${n}!}{${k}! \\cdot ${n - k}!}`,
    result: String(nCk),
  });

  const pPowK = Math.pow(p, k);
  steps.push({
    id: "p-power",
    title: `Calculate p^k`,
    calculation: `${formatNumber(p)}^{${k}} = ${formatProbability(pPowK)}`,
    result: formatProbability(pPowK),
  });

  const qPowNK = Math.pow(q, n - k);
  steps.push({
    id: "q-power",
    title: `Calculate q^(n-k)`,
    calculation: `${formatNumber(q)}^{${n - k}} = ${formatProbability(qPowNK)}`,
    result: formatProbability(qPowNK),
  });

  const probability = nCk * pPowK * qPowNK;
  steps.push({
    id: "multiply",
    title: "Multiply All Components",
    calculation: `P(X = ${k}) = ${nCk} \\times ${formatProbability(pPowK)} \\times ${formatProbability(qPowNK)}`,
    result: formatProbability(probability),
  });

  const percentage = probability * 100;
  steps.push({
    id: "result",
    title: "Final Answer",
    result: formatProbability(probability),
    description: `The probability of exactly ${k} successes in ${n} trials is ${formatProbability(probability)} (${formatNumber(percentage, 2)}%)`,
  });

  return {
    value: { probability, n, k, p, q },
    steps,
    formula: "P(X = k) = C(n, k) \\cdot p^k \\cdot q^{n-k}",
    inputs: { n, k, p, q },
  };
}

export interface PoissonResult {
  probability: number;
  lambda: number;
  k: number;
}

export function poissonWithSteps(
  lambda: number,
  k: number,
): CalculationResult<PoissonResult> {
  const steps: CalculationStep[] = [];

  steps.push({
    id: "identify",
    title: "Identify Variables",
    description: [
      `λ (lambda) = ${formatNumber(lambda)} (average rate/mean)`,
      `k = ${k} (number of occurrences)`,
    ].join("\n"),
  });

  if (lambda <= 0) {
    steps.push({
      id: "invalid-lambda",
      title: "Invalid Input",
      description: `λ must be positive. Given λ = ${lambda}.`,
      result: "Error",
    });
    return {
      value: { probability: 0, lambda, k },
      steps,
      formula: "P(X = k) = \\frac{\\lambda^k \\cdot e^{-\\lambda}}{k!}",
      inputs: { lambda, k },
    };
  }

  if (k < 0 || !Number.isInteger(k)) {
    steps.push({
      id: "invalid-k",
      title: "Invalid Input",
      description: `k must be a non-negative integer. Given k = ${k}.`,
      result: "Error",
    });
    return {
      value: { probability: 0, lambda, k },
      steps,
      formula: "P(X = k) = \\frac{\\lambda^k \\cdot e^{-\\lambda}}{k!}",
      inputs: { lambda, k },
    };
  }

  steps.push({
    id: "formula",
    title: "State the Poisson Probability Formula",
    formula: "P(X = k) = \\frac{\\lambda^k \\cdot e^{-\\lambda}}{k!}",
    note: "Where e ≈ 2.71828 (Euler's number)",
  });

  steps.push({
    id: "substitution",
    title: "Substitute Values",
    formula: `P(X = ${k}) = \\frac{${formatNumber(lambda)}^{${k}} \\cdot e^{-${formatNumber(lambda)}}}{${k}!}`,
  });

  const lambdaPowK = Math.pow(lambda, k);
  steps.push({
    id: "lambda-power",
    title: `Calculate λ^k`,
    calculation: `${formatNumber(lambda)}^{${k}} = ${formatProbability(lambdaPowK)}`,
    result: formatProbability(lambdaPowK),
  });

  const eNegLambda = Math.exp(-lambda);
  steps.push({
    id: "e-neg-lambda",
    title: `Calculate e^(-λ)`,
    calculation: `e^{-${formatNumber(lambda)}} = ${formatProbability(eNegLambda)}`,
    result: formatProbability(eNegLambda),
  });

  const kFactorial = factorial(k);
  steps.push({
    id: "k-factorial",
    title: `Calculate k!`,
    calculation: `${k}! = ${kFactorial}`,
    result: String(kFactorial),
  });

  const probability = (lambdaPowK * eNegLambda) / kFactorial;
  steps.push({
    id: "calculate",
    title: "Calculate Probability",
    calculation: `P(X = ${k}) = \\frac{${formatProbability(lambdaPowK)} \\times ${formatProbability(eNegLambda)}}{${kFactorial}}`,
    result: formatProbability(probability),
  });

  const percentage = probability * 100;
  steps.push({
    id: "result",
    title: "Final Answer",
    result: formatProbability(probability),
    description: `The probability of exactly ${k} occurrences when λ = ${formatNumber(lambda)} is ${formatProbability(probability)} (${formatNumber(percentage, 2)}%)`,
  });

  return {
    value: { probability, lambda, k },
    steps,
    formula: "P(X = k) = \\frac{\\lambda^k \\cdot e^{-\\lambda}}{k!}",
    inputs: { lambda, k },
  };
}

export interface HypergeometricResult {
  probability: number;
  N: number;
  K: number;
  n: number;
  k: number;
}

export function hypergeometricWithSteps(
  N: number,
  K: number,
  n: number,
  k: number,
): CalculationResult<HypergeometricResult> {
  const steps: CalculationStep[] = [];

  steps.push({
    id: "identify",
    title: "Identify Variables",
    description: [
      `N = ${N} (population size)`,
      `K = ${K} (success states in population)`,
      `n = ${n} (number of draws)`,
      `k = ${k} (observed successes in sample)`,
    ].join("\n"),
  });

  if (K > N) {
    steps.push({
      id: "invalid-K",
      title: "Invalid Input",
      description: `K cannot be greater than N. Given K = ${K}, N = ${N}.`,
      result: "Error",
    });
    return {
      value: { probability: 0, N, K, n, k },
      steps,
      formula: "P(X = k) = \\frac{C(K, k) \\cdot C(N-K, n-k)}{C(N, n)}",
      inputs: { N, K, n, k },
    };
  }

  if (n > N) {
    steps.push({
      id: "invalid-n",
      title: "Invalid Input",
      description: `n cannot be greater than N. Given n = ${n}, N = ${N}.`,
      result: "Error",
    });
    return {
      value: { probability: 0, N, K, n, k },
      steps,
      formula: "P(X = k) = \\frac{C(K, k) \\cdot C(N-K, n-k)}{C(N, n)}",
      inputs: { N, K, n, k },
    };
  }

  const minK = Math.max(0, n - (N - K));
  const maxK = Math.min(n, K);
  if (k < minK || k > maxK) {
    steps.push({
      id: "invalid-k",
      title: "Invalid Input",
      description: `k must be between ${minK} and ${maxK} for these parameters. Given k = ${k}.`,
      result: "0",
    });
    return {
      value: { probability: 0, N, K, n, k },
      steps,
      formula: "P(X = k) = \\frac{C(K, k) \\cdot C(N-K, n-k)}{C(N, n)}",
      inputs: { N, K, n, k },
    };
  }

  steps.push({
    id: "formula",
    title: "State the Hypergeometric Probability Formula",
    formula: "P(X = k) = \\frac{C(K, k) \\cdot C(N-K, n-k)}{C(N, n)}",
    note: "Probability of k successes in n draws without replacement",
  });

  steps.push({
    id: "substitution",
    title: "Substitute Values",
    formula: `P(X = ${k}) = \\frac{C(${K}, ${k}) \\cdot C(${N - K}, ${n - k})}{C(${N}, ${n})}`,
  });

  const cKk = combinations(K, k);
  steps.push({
    id: "c-K-k",
    title: `Calculate C(K, k) = C(${K}, ${k})`,
    calculation: `C(${K}, ${k}) = \\frac{${K}!}{${k}! \\cdot ${K - k}!}`,
    result: String(cKk),
  });

  const nMinusK = N - K;
  const nMinusKDraws = n - k;
  const cNKnk = combinations(nMinusK, nMinusKDraws);
  steps.push({
    id: "c-NK-nk",
    title: `Calculate C(N-K, n-k) = C(${nMinusK}, ${nMinusKDraws})`,
    calculation: `C(${nMinusK}, ${nMinusKDraws}) = \\frac{${nMinusK}!}{${nMinusKDraws}! \\cdot ${nMinusK - nMinusKDraws}!}`,
    result: String(cNKnk),
  });

  const cNn = combinations(N, n);
  steps.push({
    id: "c-N-n",
    title: `Calculate C(N, n) = C(${N}, ${n})`,
    calculation: `C(${N}, ${n}) = \\frac{${N}!}{${n}! \\cdot ${N - n}!}`,
    result: String(cNn),
  });

  const numerator = cKk * cNKnk;
  steps.push({
    id: "numerator",
    title: "Calculate Numerator",
    calculation: `C(${K}, ${k}) \\times C(${nMinusK}, ${nMinusKDraws}) = ${cKk} \\times ${cNKnk} = ${numerator}`,
    result: String(numerator),
  });

  const probability = numerator / cNn;
  steps.push({
    id: "divide",
    title: "Calculate Probability",
    calculation: `P(X = ${k}) = \\frac{${numerator}}{${cNn}}`,
    result: formatProbability(probability),
  });

  const percentage = probability * 100;
  steps.push({
    id: "result",
    title: "Final Answer",
    result: formatProbability(probability),
    description: `The probability of exactly ${k} successes in ${n} draws from a population of ${N} with ${K} successes is ${formatProbability(probability)} (${formatNumber(percentage, 2)}%)`,
  });

  return {
    value: { probability, N, K, n, k },
    steps,
    formula: "P(X = k) = \\frac{C(K, k) \\cdot C(N-K, n-k)}{C(N, n)}",
    inputs: { N, K, n, k },
  };
}
