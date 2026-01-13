import type { CalculationStep, CalculationResult } from "~/lib/types/calculation";

export interface DescriptiveStats {
  n: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  variance: { sample: number; population: number };
  standardDeviation: { sample: number; population: number };
}

function formatNumber(num: number, decimals = 4): string {
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function formatDataPreview(data: number[], maxShow = 8): string {
  if (data.length <= maxShow) return data.join(", ");
  return data.slice(0, maxShow).join(", ") + ", ...";
}

function computeMedian(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  if (n % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function computeMode(data: number[]): number[] {
  if (data.length === 0) return [];

  const freq = new Map<number, number>();
  for (const val of data) {
    freq.set(val, (freq.get(val) ?? 0) + 1);
  }

  const maxFreq = Math.max(...freq.values());
  if (maxFreq === 1) return []; // No mode if all unique

  const modes: number[] = [];
  for (const [val, count] of freq.entries()) {
    if (count === maxFreq) modes.push(val);
  }

  return modes.sort((a, b) => a - b);
}

export function descriptiveStatsWithSteps(data: number[]): CalculationResult<DescriptiveStats> {
  const steps: CalculationStep[] = [];
  const n = data.length;

  // Step 1: Identify the data
  steps.push({
    id: "identify",
    title: "Identify the Data Set",
    description: `Data: {${formatDataPreview(data)}}`,
    note: `n = ${n} (number of observations)`,
  });

  if (n === 0) {
    steps.push({
      id: "error",
      title: "Error",
      description: "Cannot calculate statistics for an empty data set.",
      result: "No data",
    });

    const emptyStats: DescriptiveStats = {
      n: 0,
      sum: 0,
      mean: 0,
      median: 0,
      mode: [],
      min: 0,
      max: 0,
      range: 0,
      variance: { sample: 0, population: 0 },
      standardDeviation: { sample: 0, population: 0 },
    };

    return {
      value: emptyStats,
      steps,
      formula: "Descriptive Statistics",
      inputs: { n: 0 },
    };
  }

  const sorted = [...data].sort((a, b) => a - b);
  const sum = data.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;
  const median = computeMedian(sorted);
  const mode = computeMode(data);
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;

  // Step 2: Calculate the Sum
  const sumExpansion = data.length <= 10 ? data.join(" + ") : formatDataPreview(data, 6) + " + ...";
  steps.push({
    id: "sum",
    title: "Calculate the Sum (Σx)",
    formula: "\\Sigma x = x_1 + x_2 + ... + x_n",
    calculation: `\\Sigma x = ${sumExpansion} = ${formatNumber(sum)}`,
    result: formatNumber(sum),
  });

  // Step 3: Calculate the Mean
  steps.push({
    id: "mean",
    title: "Calculate the Mean (x̄)",
    formula: "\\bar{x} = \\frac{\\Sigma x}{n}",
    calculation: `\\bar{x} = \\frac{${formatNumber(sum)}}{${n}} = ${formatNumber(mean)}`,
    result: formatNumber(mean),
  });

  // Step 4: Sort data and find Median
  const sortedPreview = formatDataPreview(sorted, 10);
  let medianExplanation: string;
  if (n % 2 === 0) {
    const mid = n / 2;
    medianExplanation = `n = ${n} (even), so median = average of positions ${mid} and ${mid + 1}: (${sorted[mid - 1]} + ${sorted[mid]}) / 2 = ${formatNumber(median)}`;
  } else {
    const mid = Math.floor(n / 2) + 1;
    medianExplanation = `n = ${n} (odd), so median = value at position ${mid} = ${formatNumber(median)}`;
  }

  steps.push({
    id: "median",
    title: "Calculate the Median",
    description: `Sorted data: {${sortedPreview}}`,
    note: medianExplanation,
    result: formatNumber(median),
  });

  // Step 5: Find Mode
  let modeDescription: string;
  if (mode.length === 0) {
    modeDescription = "No mode (all values appear once)";
  } else if (mode.length === 1) {
    modeDescription = `Mode = ${mode[0]} (appears most frequently)`;
  } else {
    modeDescription = `Multimodal: {${mode.join(", ")}} (these values appear most frequently)`;
  }

  steps.push({
    id: "mode",
    title: "Find the Mode",
    description: modeDescription,
    result: mode.length > 0 ? mode.join(", ") : "No mode",
  });

  // Step 6: Min, Max, Range
  steps.push({
    id: "range",
    title: "Calculate Range",
    description: `Min = ${formatNumber(min)}, Max = ${formatNumber(max)}`,
    formula: "Range = Max - Min",
    calculation: `Range = ${formatNumber(max)} - ${formatNumber(min)} = ${formatNumber(range)}`,
    result: formatNumber(range),
  });

  // Step 7: Calculate Variance
  const deviations = data.map((x) => x - mean);
  const squaredDeviations = deviations.map((d) => d * d);
  const sumSquaredDev = squaredDeviations.reduce((acc, v) => acc + v, 0);

  const populationVariance = sumSquaredDev / n;
  const sampleVariance = n > 1 ? sumSquaredDev / (n - 1) : 0;

  const devExamples: string[] = [];
  for (let i = 0; i < Math.min(3, data.length); i++) {
    devExamples.push(`(${formatNumber(data[i])} - ${formatNumber(mean)})² = ${formatNumber(squaredDeviations[i])}`);
  }
  if (data.length > 3) {
    devExamples.push("...");
  }

  steps.push({
    id: "variance-setup",
    title: "Calculate Squared Deviations",
    formula: "(x_i - \\bar{x})^2",
    description: devExamples.join("\n"),
    note: `Σ(xᵢ - x̄)² = ${formatNumber(sumSquaredDev)}`,
  });

  steps.push({
    id: "variance-population",
    title: "Population Variance (σ²)",
    formula: "\\sigma^2 = \\frac{\\Sigma(x_i - \\bar{x})^2}{n}",
    calculation: `\\sigma^2 = \\frac{${formatNumber(sumSquaredDev)}}{${n}} = ${formatNumber(populationVariance)}`,
    result: formatNumber(populationVariance),
    note: "Use when data represents entire population",
  });

  steps.push({
    id: "variance-sample",
    title: "Sample Variance (s²)",
    formula: "s^2 = \\frac{\\Sigma(x_i - \\bar{x})^2}{n - 1}",
    calculation: n > 1
      ? `s^2 = \\frac{${formatNumber(sumSquaredDev)}}{${n} - 1} = \\frac{${formatNumber(sumSquaredDev)}}{${n - 1}} = ${formatNumber(sampleVariance)}`
      : "Cannot calculate (n = 1)",
    result: n > 1 ? formatNumber(sampleVariance) : "N/A",
    note: "Use when data is a sample from a larger population (Bessel's correction)",
  });

  // Step 8: Calculate Standard Deviation
  const populationSD = Math.sqrt(populationVariance);
  const sampleSD = Math.sqrt(sampleVariance);

  steps.push({
    id: "sd-population",
    title: "Population Standard Deviation (σ)",
    formula: "\\sigma = \\sqrt{\\sigma^2}",
    calculation: `\\sigma = \\sqrt{${formatNumber(populationVariance)}} = ${formatNumber(populationSD)}`,
    result: formatNumber(populationSD),
  });

  steps.push({
    id: "sd-sample",
    title: "Sample Standard Deviation (s)",
    formula: "s = \\sqrt{s^2}",
    calculation: n > 1
      ? `s = \\sqrt{${formatNumber(sampleVariance)}} = ${formatNumber(sampleSD)}`
      : "Cannot calculate (n = 1)",
    result: n > 1 ? formatNumber(sampleSD) : "N/A",
  });

  // Step 9: Summary
  steps.push({
    id: "summary",
    title: "Summary of Results",
    description: [
      `n = ${n}`,
      `Σx = ${formatNumber(sum)}`,
      `Mean (x̄) = ${formatNumber(mean)}`,
      `Median = ${formatNumber(median)}`,
      `Mode = ${mode.length > 0 ? mode.join(", ") : "No mode"}`,
      `Range = ${formatNumber(range)} (Min: ${formatNumber(min)}, Max: ${formatNumber(max)})`,
      `Population Variance (σ²) = ${formatNumber(populationVariance)}`,
      `Sample Variance (s²) = ${n > 1 ? formatNumber(sampleVariance) : "N/A"}`,
      `Population SD (σ) = ${formatNumber(populationSD)}`,
      `Sample SD (s) = ${n > 1 ? formatNumber(sampleSD) : "N/A"}`,
    ].join("\n"),
  });

  const stats: DescriptiveStats = {
    n,
    sum,
    mean,
    median,
    mode,
    min,
    max,
    range,
    variance: { sample: sampleVariance, population: populationVariance },
    standardDeviation: { sample: sampleSD, population: populationSD },
  };

  return {
    value: stats,
    steps,
    formula: "Descriptive Statistics",
    inputs: { n, sum, mean, median },
  };
}
