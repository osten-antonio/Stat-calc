import { factorial } from "./factorial";
import { combinations } from "./combinations";
import type { CalculationStep, CalculationResult } from "~/lib/types/calculation";

function formatNumber(num: number, decimals = 6): string {
  if (Math.abs(num) > 1e12) {
    return num.toExponential(4).replace("e+", " \\times 10^{").replace("e", " \\times 10^{") + "}";
  }
  if (Number.isInteger(num)) return String(num);
  const fixed = num.toFixed(decimals);
  return fixed.replace(/\.?0+$/, "");
}

// For use in text (not LaTeX), we want "x 10^"
function formatNumberText(num: number, decimals = 6): string {
  if (Math.abs(num) > 1e12) {
    return num.toExponential(4).replace("e+", " × 10^").replace("e", " × 10^");
  }
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

export interface BinomialRangeResult {
  probability: number;
  n: number;
  min: number;
  max: number;
  p: number;
  q: number;
  normalApproximation?: NormalApproxResult;
}

export interface NormalApproxResult {
  probability: number;
  mean: number;
  stdDev: number;
  zLow: number;
  zHigh: number;
  correction: boolean;
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

export function binomialPmf(n: number, k: number, p: number): number {
  if (k < 0 || k > n) return 0;
  return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

export function binomialRangeWithSteps(
  n: number,
  min: number,
  max: number,
  p: number,
): CalculationResult<BinomialRangeResult> {
  const steps: CalculationStep[] = [];
  const q = 1 - p;

  steps.push({
    id: "identify",
    title: "Identify Variables",
    description: [
      `n = ${n} (number of trials)`,
      `Range: ${min} ≤ X ≤ ${max}`,
      `p = ${formatNumber(p)} (probability of success)`,
      `q = 1 - p = ${formatNumber(q)} (probability of failure)`,
    ].join("\n"),
  });

  if (min < 0 || max > n || min > max) {
    steps.push({
      id: "invalid",
      title: "Invalid Input",
      description: `Range [${min}, ${max}] must be within [0, ${n}] and min ≤ max.`,
      result: "0",
    });
    return {
      value: { probability: 0, n, min, max, p, q },
      steps,
      formula: "P(min \\le X \\le max) = \\sum_{k=min}^{max} P(X=k)",
      inputs: { n, min, max, p },
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
      value: { probability: 0, n, min, max, p, q },
      steps,
      formula: "P(min \\le X \\le max) = \\sum_{k=min}^{max} P(X=k)",
      inputs: { n, min, max, p },
    };
  }

  steps.push({
    id: "formula",
    title: "State the Formula",
    formula: "P(min \\le X \\le max) = \\sum_{k=min}^{max} P(X=k) = \\sum_{k=min}^{max} \\left( C(n, k) \\cdot p^k \cdot q^{n-k} \\right)",
  });

  let totalProb = 0;
  const individualProbs: string[] = [];
  const calculationLines: string[] = [];

  // Calculate for each k
  for (let k = min; k <= max; k++) {
    const prob = binomialPmf(n, k, p);
    totalProb += prob;
    individualProbs.push(`P(X=${k})`);

    // Explicit working for each k
    const nCk = combinations(n, k);
    const pPowK = Math.pow(p, k);
    const qPowNK = Math.pow(q, n - k);

    calculationLines.push(
      `P(X=${k}) = C(${n}, ${k}) \\cdot ${formatNumber(p)}^{${k}} \\cdot ${formatNumber(q)}^{${n - k}}` +
      ` = ${formatNumber(nCk)} \\cdot ${formatProbability(pPowK)} \\cdot ${formatProbability(qPowNK)}` +
      ` = ${formatProbability(prob)}`
    );
  }

  steps.push({
    id: "summation-formula",
    title: "Sum of Individual Probabilities",
    formula: `P(${min} \\le X \\le ${max}) = ` + individualProbs.join(" + "),
  });

  if (calculationLines.length > 5) {
    steps.push({
      id: "calculations-preview",
      title: "Calculate Individual Probabilities (First 3 and Last 2)",
      description: [
        ...calculationLines.slice(0, 3),
        "...",
        ...calculationLines.slice(-2)
      ].join("\n\n"),
    });
  } else {
    steps.push({
      id: "calculations",
      title: "Calculate Individual Probabilities",
      description: calculationLines.join("\n\n"),
    });
  }

  steps.push({
    id: "sum",
    title: "Sum the Results",
    calculation: `P(${min} \\le X \\le ${max}) = ` +
      calculationLines.map(l => l.split(" = ").pop()).join(" + ") +
      ` = ${formatProbability(totalProb)}`,
  });

  const percentage = totalProb * 100;
  steps.push({
    id: "result",
    title: "Final Answer",
    result: formatProbability(totalProb),
    description: `The probability of between ${min} and ${max} successes (inclusive) is ${formatProbability(totalProb)} (${formatNumber(percentage, 2)}%)`,
  });

  return {
    value: { probability: totalProb, n, min, max, p, q },
    steps,
    formula: "P(min \\le X \\le max) = \\sum P(X=k)",
    inputs: { n, min, max, p, q },
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

// Stats Utilities
function erf(x: number): number {
  // Approximation of the error function
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

export function normalCdf(x: number, mean = 0, stdDev = 1): number {
  return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
}

export function normalApproximationWithSteps(
  n: number,
  min: number,
  max: number,
  p: number,
): CalculationResult<NormalApproxResult> {
  const steps: CalculationStep[] = [];
  const q = 1 - p;
  const mean = n * p;
  const variance = n * p * q;
  const stdDev = Math.sqrt(variance);

  // 1. Check Conditions
  const np = n * p;
  const nq = n * q;
  const conditionsMet = np > 5 && nq > 5;

  steps.push({
    id: "check-conditions",
    title: "Check Conditions",
    description: [
      `n · p = ${n} · ${p} = ${formatNumber(np)}`,
      `n · q = ${n} · ${formatNumber(q)} = ${formatNumber(nq)}`,
      conditionsMet
        ? "Both are greater than 5, so the normal approximation can be used."
        : "Warning: One or both are ≤ 5. The normal approximation may be inaccurate."
    ].join("\n"),
  });

  // 2. Parameters
  steps.push({
    id: "parameters",
    title: "Calculate Mean and Standard Deviation",
    description: [
      `Mean (μ) = n · p = ${formatNumber(mean)}`,
      `Standard Deviation (σ) = √${formatNumber(variance)} ≈ ${formatNumber(stdDev, 4)}`
    ].join("\n"),
    formula: "\\mu = np, \\sigma = \\sqrt{npq}"
  });

  // 3. Continuity Correction
  const lowerBound = min - 0.5;
  const upperBound = max + 0.5;

  steps.push({
    id: "continuity",
    title: "Apply Continuity Correction",
    description: [
      `We want to approximate the discrete range [${min}, ${max}].`,
      `Apply continuity correction to include the entire blocks for ${min} and ${max}:`,
      `• Lower Bound: Subtract 0.5 from min: ${min} - 0.5 = ${lowerBound}`,
      `• Upper Bound: Add 0.5 to max: ${max} + 0.5 = ${upperBound}`,
      `P(${min} ≤ X ≤ ${max}) ≈ P(${lowerBound} ≤ Y ≤ ${upperBound})`
    ].join("\n")
  });

  // 4. Standardize (Z-scores)
  const zLow = (lowerBound - mean) / stdDev;
  const zHigh = (upperBound - mean) / stdDev;

  steps.push({
    id: "z-scores",
    title: "Standardize (Calculate Z-Scores)",
    description: [
      `Z_low = (${lowerBound} - ${formatNumber(mean)}) / ${formatNumber(stdDev, 4)} ≈ ${formatNumber(zLow, 2)}`,
      `Z_high = (${upperBound} - ${formatNumber(mean)}) / ${formatNumber(stdDev, 4)} ≈ ${formatNumber(zHigh, 2)}`
    ].join("\n"),
    formula: "Z = \\frac{X - \\mu}{\\sigma}"
  });

  // Calculate Probabilities
  const probLow = normalCdf(zLow);
  const probHigh = normalCdf(zHigh);
  const prob = probHigh - probLow;

  steps.push({
    id: "calc-prob",
    title: "Find Probability (from Z-table)",
    description: [
      `P(Z ≤ ${formatNumber(zHigh, 2)}) ≈ ${formatNumber(probHigh, 4)}`,
      `P(Z ≤ ${formatNumber(zLow, 2)}) ≈ ${formatNumber(probLow, 4)}`,
      `P(${lowerBound} ≤ Y ≤ ${upperBound}) = ${formatNumber(probHigh, 4)} - ${formatNumber(probLow, 4)} = ${formatNumber(prob, 4)}`
    ].join("\n")
  });

  const percentage = prob * 100;
  steps.push({
    id: "result",
    title: "Final Answer",
    result: formatNumber(prob, 4),
    description: `The probability is approximately ${formatNumber(prob, 4)} (${formatNumber(percentage, 2)}%)`
  });

  return {
    value: { probability: prob, mean, stdDev, zLow, zHigh, correction: true },
    steps,
    formula: "P(X) \\approx \\Phi(Z_{high}) - \\Phi(Z_{low})",
    inputs: { n, min, max, p }
  };
}
