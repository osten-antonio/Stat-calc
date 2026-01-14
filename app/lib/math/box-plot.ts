import type { CalculationResult, CalculationStep } from "../types/calculation";

export interface BoxPlotSummary {
  n: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  lowerFence: number;
  upperFence: number;
  lowerWhisker: number;
  upperWhisker: number;
  outliers: number[];
}

function formatNumber(num: number, decimals = 4): string {
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const mid = Math.floor(values.length / 2);
  if (values.length % 2 === 0) {
    return (values[mid - 1] + values[mid]) / 2;
  }
  return values[mid];
}

function quartiles(sorted: number[]): { q1: number; median: number; q3: number } {
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  const med = median(sorted);

  const lowerHalf = n % 2 === 0 ? sorted.slice(0, mid) : sorted.slice(0, mid);
  const upperHalf = n % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);

  const q1 = median(lowerHalf);
  const q3 = median(upperHalf);

  return { q1, median: med, q3 };
}

export function boxPlotWithSteps(data: number[]): CalculationResult<BoxPlotSummary> {
  const steps: CalculationStep[] = [];

  if (!Array.isArray(data)) {
    throw new Error("Data must be an array of numbers");
  }

  const cleaned = data.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  const n = cleaned.length;

  steps.push({
    id: "identify",
    title: "Identify the Data",
    description: `Data provided (${data.length} values). Using ${n} numeric value(s).`,
    result: n === data.length ? "All values valid" : `${n} valid number(s) found`,
  });

  if (n < 2) {
    throw new Error("At least two numeric values are required to form a box plot");
  }

  steps.push({
    id: "sort",
    title: "Sort the Data",
    description: `Sorted values: {${cleaned.join(", ")}}`,
  });

  const { q1, median: med, q3 } = quartiles(cleaned);
  const min = cleaned[0];
  const max = cleaned[n - 1];
  const iqr = q3 - q1;

  steps.push({
    id: "quartiles",
    title: "Compute Quartiles",
    description: `Q1 = ${formatNumber(q1)}, Median = ${formatNumber(med)}, Q3 = ${formatNumber(q3)}`,
    note: "Quartiles use Tukey's method (median of each half).",
  });

  steps.push({
    id: "iqr",
    title: "Interquartile Range (IQR)",
    formula: "IQR = Q3 - Q1",
    calculation: `IQR = ${formatNumber(q3)} - ${formatNumber(q1)} = ${formatNumber(iqr)}`,
    result: formatNumber(iqr),
  });

  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  steps.push({
    id: "fences",
    title: "Calculate Fences",
    formula: "Lower = Q1 - 1.5·IQR, Upper = Q3 + 1.5·IQR",
    calculation: `Lower fence = ${formatNumber(q1)} - 1.5·${formatNumber(iqr)} = ${formatNumber(lowerFence)}\nUpper fence = ${formatNumber(q3)} + 1.5·${formatNumber(iqr)} = ${formatNumber(upperFence)}`,
    result: `Lower = ${formatNumber(lowerFence)}, Upper = ${formatNumber(upperFence)}`,
  });

  const nonOutliers = cleaned.filter((v) => v >= lowerFence && v <= upperFence);
  const outliers = cleaned.filter((v) => v < lowerFence || v > upperFence);
  const lowerWhisker = nonOutliers[0];
  const upperWhisker = nonOutliers[nonOutliers.length - 1];

  steps.push({
    id: "whiskers",
    title: "Determine Whiskers",
    description: `Whiskers span from the first non-outlier (${formatNumber(lowerWhisker)}) to the last non-outlier (${formatNumber(upperWhisker)}).`,
    note: outliers.length > 0 ? `Outliers exist beyond fences: ${outliers.join(", ")}` : "No outliers detected.",
    result: `Whiskers: [${formatNumber(lowerWhisker)}, ${formatNumber(upperWhisker)}]`,
  });

  if (outliers.length > 0) {
    steps.push({
      id: "outliers",
      title: "Identify Outliers",
      description: `Values beyond fences: {${outliers.join(", ")}}`,
      result: outliers.join(", "),
    });
  }

  steps.push({
    id: "summary",
    title: "Five-Number Summary",
    description: `Min = ${formatNumber(min)}, Q1 = ${formatNumber(q1)}, Median = ${formatNumber(med)}, Q3 = ${formatNumber(q3)}, Max = ${formatNumber(max)}`,
    result: `IQR = ${formatNumber(iqr)}`,
  });

  const summary: BoxPlotSummary = {
    n,
    min,
    q1,
    median: med,
    q3,
    max,
    iqr,
    lowerFence,
    upperFence,
    lowerWhisker,
    upperWhisker,
    outliers,
  };

  return {
    value: summary,
    steps,
    formula: "Five-number summary with Tukey fences",
    inputs: { n },
  };
}
