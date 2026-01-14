import type { CalculationStep, CalculationResult } from "~/lib/types/calculation";
import { lookupTValue } from "~/lib/tables/statistical-tables";

function formatNumber(num: number, decimals = 4): string {
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function mean(data: number[]): number {
  return data.reduce((a, b) => a + b, 0) / data.length;
}

function sampleStdDev(data: number[]): number {
  const m = mean(data);
  const variance = data.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / (data.length - 1);
  return Math.sqrt(variance);
}

export interface OneSampleTTestResult {
  tStatistic: number;
  df: number;
  sampleMean: number;
  sampleSD: number;
  n: number;
  mu0: number;
  standardError: number;
  tCritical: number | null;
}

export function oneSampleTTestWithSteps(
  data: number[],
  mu0: number,
  alpha: number = 0.05,
): CalculationResult<OneSampleTTestResult> {
  const steps: CalculationStep[] = [];
  const n = data.length;

  steps.push({
    id: "identify",
    title: "Identify the Hypothesis Test",
    description: [
      `H₀: μ = ${mu0} (null hypothesis)`,
      `H₁: μ ≠ ${mu0} (alternative hypothesis - two-tailed)`,
      `α = ${alpha} (significance level)`,
      `n = ${n} (sample size)`,
    ].join("\n"),
  });

  if (n < 2) {
    steps.push({
      id: "error",
      title: "Error",
      description: "Need at least 2 data points for a t-test.",
      result: "Cannot compute",
    });
    return {
      value: { tStatistic: 0, df: 0, sampleMean: 0, sampleSD: 0, n, mu0, standardError: 0, tCritical: null },
      steps,
      formula: "t = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}",
      inputs: { n, mu0, alpha },
    };
  }

  const xBar = mean(data);
  const s = sampleStdDev(data);
  const df = n - 1;
  const se = s / Math.sqrt(n);
  const t = (xBar - mu0) / se;

  steps.push({
    id: "sample-stats",
    title: "Calculate Sample Statistics",
    description: [
      `Sample mean (x̄) = ${formatNumber(xBar)}`,
      `Sample standard deviation (s) = ${formatNumber(s)}`,
      `Degrees of freedom (df) = n - 1 = ${df}`,
    ].join("\n"),
  });

  steps.push({
    id: "formula",
    title: "State the t-Test Formula",
    formula: "t = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}",
  });

  steps.push({
    id: "standard-error",
    title: "Calculate Standard Error",
    formula: "SE = \\frac{s}{\\sqrt{n}}",
    calculation: `SE = \\frac{${formatNumber(s)}}{\\sqrt{${n}}} = \\frac{${formatNumber(s)}}{${formatNumber(Math.sqrt(n))}} = ${formatNumber(se)}`,
    result: formatNumber(se),
  });

  steps.push({
    id: "t-statistic",
    title: "Calculate t-Statistic",
    calculation: `t = \\frac{${formatNumber(xBar)} - ${mu0}}{${formatNumber(se)}} = \\frac{${formatNumber(xBar - mu0)}}{${formatNumber(se)}} = ${formatNumber(t)}`,
    result: formatNumber(t),
  });

  const tCritical = lookupTValue(df, alpha / 2);
  steps.push({
    id: "critical-value",
    title: "Find Critical Value",
    description: `For α = ${alpha} (two-tailed), α/2 = ${alpha / 2}, df = ${df}`,
    result: tCritical !== null ? `t-critical = ±${formatNumber(tCritical)}` : "Not in table",
  });

  const absT = Math.abs(t);
  const reject = tCritical !== null && absT > tCritical;
  steps.push({
    id: "decision",
    title: "Make Decision",
    description: tCritical !== null
      ? `|t| = ${formatNumber(absT)} ${reject ? ">" : "≤"} ${formatNumber(tCritical)} = t-critical`
      : "Cannot determine without critical value",
    result: reject ? "Reject H₀" : "Fail to reject H₀",
    note: reject
      ? `There is sufficient evidence at α = ${alpha} to conclude that the population mean differs from ${mu0}.`
      : `There is insufficient evidence at α = ${alpha} to conclude that the population mean differs from ${mu0}.`,
  });

  steps.push({
    id: "summary",
    title: "Conclusion",
    description: [
      `t-statistic = ${formatNumber(t)}`,
      `df = ${df}`,
      tCritical !== null ? `t-critical (α=${alpha}, two-tailed) = ±${formatNumber(tCritical)}` : "",
      `Decision: ${reject ? "Reject H₀" : "Fail to reject H₀"}`,
    ].filter(Boolean).join("\n"),
  });

  return {
    value: { tStatistic: t, df, sampleMean: xBar, sampleSD: s, n, mu0, standardError: se, tCritical },
    steps,
    formula: "t = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}",
    inputs: { n, mu0, alpha, xBar, s },
  };
}

export interface PairedTTestResult {
  tStatistic: number;
  df: number;
  meanDiff: number;
  sdDiff: number;
  n: number;
  standardError: number;
  tCritical: number | null;
}

export function pairedTTestWithSteps(
  before: number[],
  after: number[],
  alpha: number = 0.05,
): CalculationResult<PairedTTestResult> {
  const steps: CalculationStep[] = [];

  if (before.length !== after.length) {
    steps.push({
      id: "error",
      title: "Error",
      description: "Before and after samples must have the same number of observations.",
      result: "Cannot compute",
    });
    return {
      value: { tStatistic: 0, df: 0, meanDiff: 0, sdDiff: 0, n: 0, standardError: 0, tCritical: null },
      steps,
      formula: "t = \\frac{\\bar{d}}{s_d / \\sqrt{n}}",
      inputs: { alpha },
    };
  }

  const n = before.length;
  const differences = before.map((b, i) => after[i] - b);

  steps.push({
    id: "identify",
    title: "Identify the Hypothesis Test",
    description: [
      `H₀: μ_d = 0 (no difference)`,
      `H₁: μ_d ≠ 0 (there is a difference)`,
      `α = ${alpha} (significance level)`,
      `n = ${n} (number of pairs)`,
    ].join("\n"),
  });

  if (n < 2) {
    steps.push({
      id: "error",
      title: "Error",
      description: "Need at least 2 pairs for a paired t-test.",
      result: "Cannot compute",
    });
    return {
      value: { tStatistic: 0, df: 0, meanDiff: 0, sdDiff: 0, n, standardError: 0, tCritical: null },
      steps,
      formula: "t = \\frac{\\bar{d}}{s_d / \\sqrt{n}}",
      inputs: { n, alpha },
    };
  }

  steps.push({
    id: "differences",
    title: "Calculate Differences (After - Before)",
    description: `d = [${differences.slice(0, 8).map(d => formatNumber(d)).join(", ")}${differences.length > 8 ? ", ..." : ""}]`,
  });

  const dBar = mean(differences);
  const sd = sampleStdDev(differences);
  const df = n - 1;
  const se = sd / Math.sqrt(n);
  const t = dBar / se;

  steps.push({
    id: "diff-stats",
    title: "Calculate Difference Statistics",
    description: [
      `Mean of differences (d̄) = ${formatNumber(dBar)}`,
      `Standard deviation of differences (s_d) = ${formatNumber(sd)}`,
      `Degrees of freedom (df) = n - 1 = ${df}`,
    ].join("\n"),
  });

  steps.push({
    id: "formula",
    title: "State the Paired t-Test Formula",
    formula: "t = \\frac{\\bar{d}}{s_d / \\sqrt{n}}",
  });

  steps.push({
    id: "standard-error",
    title: "Calculate Standard Error",
    calculation: `SE = \\frac{${formatNumber(sd)}}{\\sqrt{${n}}} = ${formatNumber(se)}`,
    result: formatNumber(se),
  });

  steps.push({
    id: "t-statistic",
    title: "Calculate t-Statistic",
    calculation: `t = \\frac{${formatNumber(dBar)}}{${formatNumber(se)}} = ${formatNumber(t)}`,
    result: formatNumber(t),
  });

  const tCritical = lookupTValue(df, alpha / 2);
  steps.push({
    id: "critical-value",
    title: "Find Critical Value",
    description: `For α = ${alpha} (two-tailed), df = ${df}`,
    result: tCritical !== null ? `t-critical = ±${formatNumber(tCritical)}` : "Not in table",
  });

  const absT = Math.abs(t);
  const reject = tCritical !== null && absT > tCritical;
  steps.push({
    id: "decision",
    title: "Make Decision",
    description: tCritical !== null
      ? `|t| = ${formatNumber(absT)} ${reject ? ">" : "≤"} ${formatNumber(tCritical)}`
      : "Cannot determine",
    result: reject ? "Reject H₀" : "Fail to reject H₀",
    note: reject
      ? `There is a statistically significant difference between before and after at α = ${alpha}.`
      : `There is no statistically significant difference between before and after at α = ${alpha}.`,
  });

  return {
    value: { tStatistic: t, df, meanDiff: dBar, sdDiff: sd, n, standardError: se, tCritical },
    steps,
    formula: "t = \\frac{\\bar{d}}{s_d / \\sqrt{n}}",
    inputs: { n, alpha, dBar, sd },
  };
}

export interface IndependentTTestResult {
  tStatistic: number;
  df: number;
  mean1: number;
  mean2: number;
  sd1: number;
  sd2: number;
  n1: number;
  n2: number;
  pooledVariance: number;
  standardError: number;
  tCritical: number | null;
}

export function independentTTestWithSteps(
  sample1: number[],
  sample2: number[],
  alpha: number = 0.05,
): CalculationResult<IndependentTTestResult> {
  const steps: CalculationStep[] = [];
  const n1 = sample1.length;
  const n2 = sample2.length;

  steps.push({
    id: "identify",
    title: "Identify the Hypothesis Test",
    description: [
      `H₀: μ₁ = μ₂ (no difference between groups)`,
      `H₁: μ₁ ≠ μ₂ (groups are different)`,
      `α = ${alpha} (significance level)`,
      `n₁ = ${n1}, n₂ = ${n2}`,
    ].join("\n"),
  });

  if (n1 < 2 || n2 < 2) {
    steps.push({
      id: "error",
      title: "Error",
      description: "Need at least 2 observations in each sample.",
      result: "Cannot compute",
    });
    return {
      value: { tStatistic: 0, df: 0, mean1: 0, mean2: 0, sd1: 0, sd2: 0, n1, n2, pooledVariance: 0, standardError: 0, tCritical: null },
      steps,
      formula: "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{s_p^2(\\frac{1}{n_1} + \\frac{1}{n_2})}}",
      inputs: { n1, n2, alpha },
    };
  }

  const x1Bar = mean(sample1);
  const x2Bar = mean(sample2);
  const s1 = sampleStdDev(sample1);
  const s2 = sampleStdDev(sample2);

  steps.push({
    id: "sample-stats",
    title: "Calculate Sample Statistics",
    description: [
      `Sample 1: x̄₁ = ${formatNumber(x1Bar)}, s₁ = ${formatNumber(s1)}, n₁ = ${n1}`,
      `Sample 2: x̄₂ = ${formatNumber(x2Bar)}, s₂ = ${formatNumber(s2)}, n₂ = ${n2}`,
    ].join("\n"),
  });

  const df = n1 + n2 - 2;
  const ss1 = (n1 - 1) * s1 * s1;
  const ss2 = (n2 - 1) * s2 * s2;
  const pooledVar = (ss1 + ss2) / df;

  steps.push({
    id: "pooled-variance",
    title: "Calculate Pooled Variance",
    formula: "s_p^2 = \\frac{(n_1 - 1)s_1^2 + (n_2 - 1)s_2^2}{n_1 + n_2 - 2}",
    calculation: `s_p^2 = \\frac{${formatNumber(ss1)} + ${formatNumber(ss2)}}{${df}} = ${formatNumber(pooledVar)}`,
    result: formatNumber(pooledVar),
  });

  const se = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
  steps.push({
    id: "standard-error",
    title: "Calculate Standard Error",
    formula: "SE = \\sqrt{s_p^2 \\cdot (\\frac{1}{n_1} + \\frac{1}{n_2})}",
    calculation: `SE = \\sqrt{${formatNumber(pooledVar)} \\cdot (\\frac{1}{${n1}} + \\frac{1}{${n2}})} = ${formatNumber(se)}`,
    result: formatNumber(se),
  });

  const t = (x1Bar - x2Bar) / se;
  steps.push({
    id: "t-statistic",
    title: "Calculate t-Statistic",
    formula: "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{SE}",
    calculation: `t = \\frac{${formatNumber(x1Bar)} - ${formatNumber(x2Bar)}}{${formatNumber(se)}} = ${formatNumber(t)}`,
    result: formatNumber(t),
  });

  const tCritical = lookupTValue(df, alpha / 2);
  steps.push({
    id: "critical-value",
    title: "Find Critical Value",
    description: `For α = ${alpha} (two-tailed), df = ${df}`,
    result: tCritical !== null ? `t-critical = ±${formatNumber(tCritical)}` : "Not in table",
  });

  const absT = Math.abs(t);
  const reject = tCritical !== null && absT > tCritical;
  steps.push({
    id: "decision",
    title: "Make Decision",
    description: tCritical !== null
      ? `|t| = ${formatNumber(absT)} ${reject ? ">" : "≤"} ${formatNumber(tCritical)}`
      : "Cannot determine",
    result: reject ? "Reject H₀" : "Fail to reject H₀",
    note: reject
      ? `There is a statistically significant difference between the two groups at α = ${alpha}.`
      : `There is no statistically significant difference between the two groups at α = ${alpha}.`,
  });

  return {
    value: { tStatistic: t, df, mean1: x1Bar, mean2: x2Bar, sd1: s1, sd2: s2, n1, n2, pooledVariance: pooledVar, standardError: se, tCritical },
    steps,
    formula: "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{s_p^2(\\frac{1}{n_1} + \\frac{1}{n_2})}}",
    inputs: { n1, n2, alpha, x1Bar, x2Bar },
  };
}
