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
    title: "1. State Null and Alternative Hypotheses",
    description: [
      `Null Hypothesis (H₀): The mean is ${mu0} (μ = ${mu0})`,
      `Alternative Hypothesis (H₁): The mean is not ${mu0} (μ ≠ ${mu0})`,
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

  const sum = data.reduce((a, b) => a + b, 0);
  const sumDisplay = data.length <= 8
    ? data.map(x => formatNumber(x)).join(" + ")
    : data.slice(0, 5).map(x => formatNumber(x)).join(" + ") + " + ... + " + formatNumber(data[data.length - 1]);

  const squaredDeviations = data.map(x => Math.pow(x - xBar, 2));
  const sumSquaredDev = squaredDeviations.reduce((a, b) => a + b, 0);
  const variance = sumSquaredDev / (n - 1);

  steps.push({
    id: "sample-stats",
    title: "Calculate Sample Statistics",
    formula: "\\bar{x} = \\frac{\\sum x_i}{n}, \\quad s = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n-1}}",
  });

  steps.push({
    id: "sample-mean",
    title: "2. Calculate Sample Mean",
    formula: "\\bar{x} = \\frac{\\sum x_i}{n}",
    calculation: `\\text{Sample Mean} = \\frac{${sumDisplay}}{${n}} = ${formatNumber(xBar)}`,
    result: formatNumber(xBar),
  });

  steps.push({
    id: "sample-sd",
    title: "3. Calculate Sample Standard Deviation",
    formula: "s = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n-1}}",
    description: `Sum of squared deviations: Σ(xᵢ - ${formatNumber(xBar)})² = ${formatNumber(sumSquaredDev)}`,
    calculation: `s \\approx ${formatNumber(s, 2)}`,
    result: formatNumber(s, 2),
  });

  steps.push({
    id: "df",
    title: "Step 2c: Degrees of Freedom",
    formula: "df = n - 1",
    calculation: `df = ${n} - 1 = ${df}`,
    result: String(df),
  });

  steps.push({
    id: "t-statistic",
    title: "4. Calculate t-statistic",
    formula: "t = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}",
    calculation: `t = \\frac{${formatNumber(xBar)} - ${mu0}}{${formatNumber(s, 2)}/\\sqrt{${n}}} \\approx \\frac{${formatNumber(xBar - mu0)}}{${formatNumber(se, 2)}} \\approx ${formatNumber(t, 2)}`,
    result: formatNumber(t, 2),
  });

  const tCritical = lookupTValue(df, alpha / 2);
  const absTCrit = tCritical ? Math.abs(tCritical) : null;

  steps.push({
    id: "critical-value",
    title: "5. Compare t-statistic with Critical Value",
    description: [
      `Degrees of freedom: n - 1 = ${n} - 1 = ${df}.`,
      tCritical !== null
        ? `At α = ${alpha} (two-tailed), the critical t-value is approximately ±${formatNumber(absTCrit!, 3)} (from the t-distribution table).`
        : "Critical value not found in table."
    ].join("\n"),
  });

  const absT = Math.abs(t);
  const reject = tCritical !== null && absT > absTCrit!;

  steps.push({
    id: "conclusion",
    title: "6. Conclusion",
    description: tCritical !== null
      ? `Since t = ${formatNumber(t, 2)} ${reject ? "falls outside" : "falls within"} the range [-${formatNumber(absTCrit!, 3)}, ${formatNumber(absTCrit!, 3)}], we ${reject ? "reject" : "fail to reject"} the null hypothesis.`
      : "Cannot determine conclusion without critical value.",
    result: reject ? "Reject H₀" : "Fail to reject H₀",
    note: reject
      ? "There is significant evidence to suggest the mean differs."
      : "There is not enough evidence to suggest the mean differs."
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

  const sumDiff = differences.reduce((a, b) => a + b, 0);
  const sumDiffDisplay = differences.length <= 8
    ? differences.map(d => formatNumber(d)).join(" + ")
    : differences.slice(0, 5).map(d => formatNumber(d)).join(" + ") + " + ... + " + formatNumber(differences[differences.length - 1]);

  const squaredDevDiff = differences.map(d => Math.pow(d - dBar, 2));
  const sumSquaredDevDiff = squaredDevDiff.reduce((a, b) => a + b, 0);
  const varianceDiff = sumSquaredDevDiff / (n - 1);

  steps.push({
    id: "diff-stats",
    title: "Calculate Difference Statistics",
    formula: "\\bar{d} = \\frac{\\sum d_i}{n}, \\quad s_d = \\sqrt{\\frac{\\sum(d_i - \\bar{d})^2}{n-1}}",
  });

  steps.push({
    id: "diff-mean",
    title: "Step 3a: Calculate Mean of Differences",
    formula: "\\bar{d} = \\frac{\\sum d_i}{n}",
    calculation: `\\bar{d} = \\frac{${sumDiffDisplay}}{${n}} = \\frac{${formatNumber(sumDiff)}}{${n}} = ${formatNumber(dBar)}`,
    result: formatNumber(dBar),
  });

  steps.push({
    id: "diff-sd",
    title: "Step 3b: Calculate Standard Deviation of Differences",
    formula: "s_d = \\sqrt{\\frac{\\sum(d_i - \\bar{d})^2}{n-1}}",
    description: `Sum of squared deviations: Σ(dᵢ - ${formatNumber(dBar)})² = ${formatNumber(sumSquaredDevDiff)}`,
    calculation: `s_d = \\sqrt{\\frac{${formatNumber(sumSquaredDevDiff)}}{${n - 1}}} = \\sqrt{${formatNumber(varianceDiff)}} = ${formatNumber(sd)}`,
    result: formatNumber(sd),
  });

  steps.push({
    id: "df",
    title: "Step 3c: Degrees of Freedom",
    formula: "df = n - 1",
    calculation: `df = ${n} - 1 = ${df}`,
    result: String(df),
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

  const sum1 = sample1.reduce((a, b) => a + b, 0);
  const sum2 = sample2.reduce((a, b) => a + b, 0);
  const sumDisplay1 = sample1.length <= 6
    ? sample1.map(x => formatNumber(x)).join(" + ")
    : sample1.slice(0, 4).map(x => formatNumber(x)).join(" + ") + " + ...";
  const sumDisplay2 = sample2.length <= 6
    ? sample2.map(x => formatNumber(x)).join(" + ")
    : sample2.slice(0, 4).map(x => formatNumber(x)).join(" + ") + " + ...";

  const squaredDev1 = sample1.map(x => Math.pow(x - x1Bar, 2));
  const squaredDev2 = sample2.map(x => Math.pow(x - x2Bar, 2));
  const sumSqDev1 = squaredDev1.reduce((a, b) => a + b, 0);
  const sumSqDev2 = squaredDev2.reduce((a, b) => a + b, 0);
  const var1 = sumSqDev1 / (n1 - 1);
  const var2 = sumSqDev2 / (n2 - 1);

  steps.push({
    id: "sample-stats",
    title: "Calculate Sample Statistics",
    formula: "\\bar{x} = \\frac{\\sum x_i}{n}, \\quad s = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n-1}}",
  });

  steps.push({
    id: "group1-mean",
    title: "Step 2a: Group 1 - Sample Mean",
    formula: "\\bar{x}_1 = \\frac{\\sum x_{1i}}{n_1}",
    calculation: `\\bar{x}_1 = \\frac{${sumDisplay1}}{${n1}} = \\frac{${formatNumber(sum1)}}{${n1}} = ${formatNumber(x1Bar)}`,
    result: formatNumber(x1Bar),
  });

  steps.push({
    id: "group1-sd",
    title: "Step 2b: Group 1 - Sample Standard Deviation",
    formula: "s_1 = \\sqrt{\\frac{\\sum(x_{1i} - \\bar{x}_1)^2}{n_1-1}}",
    calculation: `s_1 = \\sqrt{\\frac{${formatNumber(sumSqDev1)}}{${n1 - 1}}} = \\sqrt{${formatNumber(var1)}} = ${formatNumber(s1)}`,
    result: formatNumber(s1),
  });

  steps.push({
    id: "group2-mean",
    title: "Step 2c: Group 2 - Sample Mean",
    formula: "\\bar{x}_2 = \\frac{\\sum x_{2i}}{n_2}",
    calculation: `\\bar{x}_2 = \\frac{${sumDisplay2}}{${n2}} = \\frac{${formatNumber(sum2)}}{${n2}} = ${formatNumber(x2Bar)}`,
    result: formatNumber(x2Bar),
  });

  steps.push({
    id: "group2-sd",
    title: "Step 2d: Group 2 - Sample Standard Deviation",
    formula: "s_2 = \\sqrt{\\frac{\\sum(x_{2i} - \\bar{x}_2)^2}{n_2-1}}",
    calculation: `s_2 = \\sqrt{\\frac{${formatNumber(sumSqDev2)}}{${n2 - 1}}} = \\sqrt{${formatNumber(var2)}} = ${formatNumber(s2)}`,
    result: formatNumber(s2),
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
