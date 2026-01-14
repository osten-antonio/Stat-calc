import type { CalculationStep, CalculationResult } from "~/lib/types/calculation";
import { lookupTValue, lookupFValue } from "~/lib/tables/statistical-tables";

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

export function independentTTestFromStats(
  stats1: { n: number; mean: number; sd: number },
  stats2: { n: number; mean: number; sd: number },
  alpha: number = 0.05,
  tails: 1 | 2 = 2,
): CalculationResult<IndependentTTestResult> {
  const steps: CalculationStep[] = [];
  const { n: n1, mean: x1Bar, sd: s1 } = stats1;
  const { n: n2, mean: x2Bar, sd: s2 } = stats2;

  // 1. Check for insufficient data
  if (n1 < 2 || n2 < 2) {
    steps.push({
      id: "error",
      title: "Error",
      description: "Need at least 2 observations in each sample.",
      result: "Cannot compute",
    });
    return {
      value: { tStatistic: 0, df: 0, mean1: x1Bar, mean2: x2Bar, sd1: s1, sd2: s2, n1, n2, pooledVariance: 0, standardError: 0, tCritical: null },
      steps,
      formula: "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{SE}",
      inputs: { n1, n2, alpha, x1Bar, x2Bar },
    };
  }

  const var1 = s1 * s1;
  const var2 = s2 * s2;

  // --- F-Test Step (Pre-requisite logic) ---
  const [largerVar, smallerVar, dfNum, dfDen] =
    var1 >= var2 ? [var1, var2, n1 - 1, n2 - 1] : [var2, var1, n2 - 1, n1 - 1];
  const F = largerVar / smallerVar;
  const fTestAlpha = 0.05;
  const fCritical = lookupFValue(dfNum, dfDen, fTestAlpha);
  const varDiffers = fCritical !== null && F > fCritical;

  // 1. State Hypotheses
  const h1Desc = tails === 2
    ? `• Alternative Hypothesis (H₁): The means of the two groups are different (μ₁ ≠ μ₂)`
    : `• Alternative Hypothesis (H₁): The means of the two groups are different (directional, μ₁ > μ₂ or μ₁ < μ₂)`;

  steps.push({
    id: "hypotheses",
    title: "1. State Hypotheses",
    description: [
      `• Null Hypothesis (H₀): The means for both groups are equal (μ₁ = μ₂)`,
      h1Desc
    ].join("\n"),
  });


  let t = 0;
  let df = 0;
  let se = 0;
  let pooledVar = 0;
  let calculationSteps: CalculationStep[] = [];

  if (!varDiffers) {
    // --- Equal Variances (Pooled) ---
    df = n1 + n2 - 2;
    const ss1 = (n1 - 1) * var1;
    const ss2 = (n2 - 1) * var2;
    pooledVar = (ss1 + ss2) / df;

    // Special VISUAL path for Equal Sample Sizes (matches screenshot style)
    // When n1 = n2, the Pooled SE formula is algebraically identical to the Unpooled SE formula.
    // We display it in the "Unpooled" style to match the user's expected step-by-step breakdown.
    if (n1 === n2) {
      const v1_n1 = var1 / n1;
      const v2_n2 = var2 / n2;
      se = Math.sqrt(v1_n1 + v2_n2); // Same as sqrt(Sp^2 * 2/n)
      t = (x1Bar - x2Bar) / se;

      // Formula Step
      calculationSteps.push({
        id: "t-formula",
        title: "Calculate the t-statistic:",
        formula: "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}}",
        description: "Equal Sample Sizes allows simplified formula",
      });

      // Substitution Step
      calculationSteps.push({
        id: "substitute",
        title: "Substitute the values:",
        formula: `t = \\frac{${formatNumber(x1Bar)} - ${formatNumber(x2Bar)}}{\\sqrt{\\frac{${formatNumber(s1)}^2}{${n1}} + \\frac{${formatNumber(s2)}^2}{${n2}}}}`
      });

      // "First, calculate..." Step (The key visual match)
      calculationSteps.push({
        id: "intermediate-terms",
        title: "First, calculate the variances divided by sample sizes:",
        calculation: `\\frac{${formatNumber(s1)}^2}{${n1}} = ${formatNumber(v1_n1)}, \\quad \\frac{${formatNumber(s2)}^2}{${n2}} = ${formatNumber(v2_n2)}`
      });

      // Sqrt Step
      calculationSteps.push({
        id: "sqrt-step",
        title: "Combine and square root:",
        calculation: `\\sqrt{${formatNumber(v1_n1)} + ${formatNumber(v2_n2)}} = \\sqrt{${formatNumber(v1_n1 + v2_n2)}} \\approx ${formatNumber(se)}`
      });

    } else {
      // Standard Pooled Display (n1 != n2)
      se = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
      t = (x1Bar - x2Bar) / se;

      calculationSteps.push({
        id: "t-formula",
        title: "Calculate the t-statistic:",
        formula: "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{s_p^2(\\frac{1}{n_1} + \\frac{1}{n_2})}}",
        description: "Using Pooled Variance (Equal Variances assumed via F-test)",
      });

      calculationSteps.push({
        id: "pooled-var-calc",
        title: "Calculate Pooled Variance:",
        calculation: `s_p^2 = \\frac{(${n1}-1)${formatNumber(s1)}^2 + (${n2}-1)${formatNumber(s2)}^2}{${n1}+${n2}-2} = ${formatNumber(pooledVar)}`
      });

      calculationSteps.push({
        id: "substitute",
        title: "Substitute the values into SE formula:",
        formula: `t = \\frac{${formatNumber(x1Bar)} - ${formatNumber(x2Bar)}}{\\sqrt{${formatNumber(pooledVar)}(\\frac{1}{${n1}} + \\frac{1}{${n2}})}}`
      });

      calculationSteps.push({
        id: "se-calc",
        title: "Calculate Standard Error:",
        calculation: `SE = \\sqrt{${formatNumber(pooledVar)} \\cdot ${formatNumber(1 / n1 + 1 / n2)}} = ${formatNumber(se)}`
      });
    }

  } else {
    // --- Unequal Variances (Welch) ---
    const v1_n1 = var1 / n1;
    const v2_n2 = var2 / n2;
    se = Math.sqrt(v1_n1 + v2_n2);

    const num = Math.pow(v1_n1 + v2_n2, 2);
    const den = (Math.pow(v1_n1, 2) / (n1 - 1)) + (Math.pow(v2_n2, 2) / (n2 - 1));
    df = num / den;
    t = (x1Bar - x2Bar) / se;

    // Step: Calculate t-statistic (Formula)
    calculationSteps.push({
      id: "t-formula",
      title: "Calculate the t-statistic:",
      formula: "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}}",
      description: "Using Welch's t-test (Unequal Variances assumed via F-test)",
    });

    // Step: Substitute values
    calculationSteps.push({
      id: "substitute",
      title: "Substitute the values:",
      formula: `t = \\frac{${formatNumber(x1Bar)} - ${formatNumber(x2Bar)}}{\\sqrt{\\frac{${formatNumber(s1)}^2}{${n1}} + \\frac{${formatNumber(s2)}^2}{${n2}}}}`
    });

    // Step: Intermediate Terms (Exact match to screenshot style)
    calculationSteps.push({
      id: "intermediate-terms",
      title: "First, calculate the variances divided by sample sizes:",
      calculation: `\\frac{${formatNumber(s1)}^2}{${n1}} = ${formatNumber(v1_n1)}, \\quad \\frac{${formatNumber(s2)}^2}{${n2}} = ${formatNumber(v2_n2)}`,
    });

    // Step: Sqrt
    calculationSteps.push({
      id: "sqrt-step",
      title: "Combine and square root:",
      calculation: `\\sqrt{${formatNumber(v1_n1)} + ${formatNumber(v2_n2)}} = \\sqrt{${formatNumber(v1_n1 + v2_n2)}} \\approx ${formatNumber(se)}`
    });
  }

  // Common steps again
  // Step: Final Calc
  calculationSteps.push({
    id: "final-t",
    title: "Now calculate t:",
    calculation: `t = \\frac{${formatNumber(x1Bar - x2Bar)}}{${formatNumber(se)}} \\approx ${formatNumber(t)}`,
    result: formatNumber(t),
  });

  steps.push(...calculationSteps);

  // 3. DF and Critical Value
  // Look up t-value: use alpha if 1-tail, alpha/2 if 2-tail
  const lookupAlpha = tails === 1 ? alpha : alpha / 2;
  const tCritical = lookupTValue(df, lookupAlpha);
  const tailText = tails === 1 ? "one-tailed" : "two-tailed";

  steps.push({
    id: "df-crit",
    title: "Degrees of Freedom and Critical t-value",
    description: [
      `Degrees of freedom: df = ${varDiffers ? "(Satterthwaite)" : (n1 === n2 ? "nA + nB - 2" : "n1 + n2 - 2")} = ${formatNumber(df, 2)}`,
      `At α = ${alpha} (${tailText}), the critical t-value for df = ${formatNumber(df, 2)} is approximately ${tCritical !== null ? `±${formatNumber(tCritical)}` : "N/A"}`
    ].join("\n"),
  });

  // 4. Conclusion
  const absT = Math.abs(t);
  const reject = tCritical !== null && absT > tCritical;
  steps.push({
    id: "decision",
    title: "Conclusion",
    description: tCritical !== null
      ? `Compare the t-statistic to the critical value: |${formatNumber(t)}| ${reject ? ">" : "≤"} ${formatNumber(tCritical)}`
      : "Cannot determine critical value",
    result: reject ? "Reject the null hypothesis." : "Fail to reject the null hypothesis.",
    note: reject
      ? "Since the calculated t-value exceeds the critical t-value, we reject the null hypothesis."
      : "Since the calculated t-value does not exceed the critical t-value, we fail to reject the null hypothesis."
  });

  return {
    value: { tStatistic: t, df, mean1: x1Bar, mean2: x2Bar, sd1: s1, sd2: s2, n1, n2, pooledVariance: pooledVar, standardError: se, tCritical },
    steps,
    formula: varDiffers
      ? "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}}"
      : "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{s_p^2(\\frac{1}{n_1} + \\frac{1}{n_2})}}",
    inputs: { n1, n2, alpha, x1Bar, x2Bar },
    notes: varDiffers ? ["Unequal Variances (Welch's t-test)"] : ["Equal Variances (Pooled t-test)"]
  };
}

export function independentTTestWithSteps(
  sample1: number[],
  sample2: number[],
  alpha: number = 0.05,
  tails: 1 | 2 = 2,
): CalculationResult<IndependentTTestResult> {
  const n1 = sample1.length;
  const n2 = sample2.length;

  // Calculate basic stats first
  const x1Bar = mean(sample1);
  const x2Bar = mean(sample2);
  const s1 = sampleStdDev(sample1);
  const s2 = sampleStdDev(sample2);

  // Prepare detailed steps for data calculation
  const dataCalcSteps: CalculationStep[] = [];

  // 1. Data processing steps (Mean/SD calc)
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

  dataCalcSteps.push({
    id: "sample-stats",
    title: "Calculate Sample Statistics",
    formula: "\\bar{x} = \\frac{\\sum x_i}{n}, \\quad s = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n-1}}",
  });

  dataCalcSteps.push({
    id: "group1-mean",
    title: "Step 1a: Group 1 - Sample Mean",
    formula: "\\bar{x}_1 = \\frac{\\sum x_{1i}}{n_1}",
    calculation: `\\bar{x}_1 = \\frac{${sumDisplay1}}{${n1}} = \\frac{${formatNumber(sum1)}}{${n1}} = ${formatNumber(x1Bar)}`,
    result: formatNumber(x1Bar),
  });

  dataCalcSteps.push({
    id: "group1-sd",
    title: "Step 1b: Group 1 - Sample Standard Deviation",
    formula: "s_1 = \\sqrt{\\frac{\\sum(x_{1i} - \\bar{x}_1)^2}{n_1-1}}",
    calculation: `s_1 = \\sqrt{\\frac{${formatNumber(sumSqDev1)}}{${n1 - 1}}} = \\sqrt{${formatNumber(var1)}} = ${formatNumber(s1)}`,
    result: formatNumber(s1),
  });

  dataCalcSteps.push({
    id: "group2-mean",
    title: "Step 1c: Group 2 - Sample Mean",
    formula: "\\bar{x}_2 = \\frac{\\sum x_{2i}}{n_2}",
    calculation: `\\bar{x}_2 = \\frac{${sumDisplay2}}{${n2}} = \\frac{${formatNumber(sum2)}}{${n2}} = ${formatNumber(x2Bar)}`,
    result: formatNumber(x2Bar),
  });

  dataCalcSteps.push({
    id: "group2-sd",
    title: "Step 1d: Group 2 - Sample Standard Deviation",
    formula: "s_2 = \\sqrt{\\frac{\\sum(x_{2i} - \\bar{x}_2)^2}{n_2-1}}",
    calculation: `s_2 = \\sqrt{\\frac{${formatNumber(sumSqDev2)}}{${n2 - 1}}} = \\sqrt{${formatNumber(var2)}} = ${formatNumber(s2)}`,
    result: formatNumber(s2),
  });

  // Now call the core logic
  const result = independentTTestFromStats(
    { n: n1, mean: x1Bar, sd: s1 },
    { n: n2, mean: x2Bar, sd: s2 },
    alpha,
    tails // Pass the tails parameter
  );

  // Merge steps.

  const identifyStep = result.steps.find(s => s.id === "hypotheses"); // ID changed to 'hypotheses'
  const errorStep = result.steps.find(s => s.id === "error");

  if (errorStep) {
    return result;
  }

  const coreSteps = result.steps.filter(s => s.id !== "hypotheses" && s.id !== "error").map(step => {
    // Re-number core steps to follow data calculation steps
    const newTitle = step.title.replace(/^(\d+)\./, (match, p1) => {
      const newNum = parseInt(p1) + 1; // Increment by 1 because our data calc steps are "Step 1"
      return `${newNum}.`;
    });
    return { ...step, title: newTitle };
  });

  return {
    ...result,
    steps: [
      ...(identifyStep ? [identifyStep] : []),
      ...dataCalcSteps,
      ...coreSteps
    ]
  };
}
