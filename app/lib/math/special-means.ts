import type { CalculationResult, CalculationStep } from "../types/calculation";

export interface SpecialMeansResult {
  n: number;
  originalN: number;
  trimCountPerSide: number;
  trimProportion: number;
  trimmedData: number[];
  trimean: number;
  geometricMean: number;
  trimmedMean: number;
  quartiles: { q1: number; median: number; q3: number };
}

function formatNumber(num: number, decimals = 4): string {
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const mid = Math.floor(values.length / 2);
  if (values.length % 2 === 0) return (values[mid - 1] + values[mid]) / 2;
  return values[mid];
}

function quartiles(sorted: number[]): { q1: number; median: number; q3: number } {
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  const med = median(sorted);
  const lowerHalf = sorted.slice(0, mid);
  const upperHalf = n % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);
  return { q1: median(lowerHalf), median: med, q3: median(upperHalf) };
}

function computeTrimean(q1: number, medianValue: number, q3: number): number {
  return (q1 + 2 * medianValue + q3) / 4;
}

function computeGeometricMean(data: number[]): number {
  if (data.some((v) => v <= 0)) {
    throw new Error("Geometric mean needs all values > 0. No zeros, no negatives.");
  }
  const logSum = data.reduce((sum, v) => sum + Math.log(v), 0);
  return Math.exp(logSum / data.length);
}

function computeTrimmedMean(sorted: number[], trimCountPerSide: number): { mean: number; trimmed: number[] } {
  if (trimCountPerSide === 0) {
    const avg = sorted.reduce((s, v) => s + v, 0) / sorted.length;
    return { mean: avg, trimmed: sorted };
  }
  const start = trimCountPerSide;
  const end = sorted.length - trimCountPerSide;
  if (start >= end) {
    throw new Error("Trimmed mean would remove everything. Trim less or provide more data.");
  }
  const trimmed = sorted.slice(start, end);
  const avg = trimmed.reduce((s, v) => s + v, 0) / trimmed.length;
  return { mean: avg, trimmed };
}

export function specialMeansWithSteps(
  data: number[],
  options: { trimPercent?: number; trimCount?: number } = {},
): CalculationResult<SpecialMeansResult> {
  const steps: CalculationStep[] = [];

  if (!Array.isArray(data)) {
    throw new Error("Data must be an array of numbers");
  }

  const cleaned = data.filter((v) => Number.isFinite(v));
  if (cleaned.length < 2) {
    throw new Error("At least two numeric values are required. A single number is just a dot.");
  }

  const sorted = [...cleaned].sort((a, b) => a - b);
  const { q1, median: med, q3 } = quartiles(sorted);
  const trimean = computeTrimean(q1, med, q3);

  steps.push({
    id: "identify",
    title: "Identify the Data",
    description: `Received ${data.length} value(s); using ${cleaned.length} valid number(s). Sorted: {${sorted.join(", ")}}`,
  });

  steps.push({
    id: "quartiles",
    title: "Quartiles",
    description: `Q1 = ${formatNumber(q1)}, Median = ${formatNumber(med)}, Q3 = ${formatNumber(q3)}`,
    note: "Quartiles via Tukey's method (median of each half).",
  });

  steps.push({
    id: "trimean",
    title: "Trimean",
    formula: "T = (Q1 + 2\cdot M + Q3) / 4",
    calculation: `T = (${formatNumber(q1)} + 2·${formatNumber(med)} + ${formatNumber(q3)}) / 4 = ${formatNumber(trimean)}`,
    result: formatNumber(trimean),
  });

  let geometricMean: number;
  try {
    geometricMean = computeGeometricMean(sorted);
    steps.push({
      id: "geometric",
      title: "Geometric Mean",
      formula: "GM = (\prod x_i)^{1/n}",
      note: "All values must be > 0.",
      result: formatNumber(geometricMean),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Geometric mean failed";
    steps.push({
      id: "geometric-error",
      title: "Geometric Mean",
      description: message,
      result: "N/A",
    });
    geometricMean = NaN;
  }

  const trimPercent = options.trimPercent ?? null;
  const trimCount = options.trimCount ?? null;
  let trimPerSide = 0;

  if (trimCount !== null && trimCount !== undefined) {
    trimPerSide = Math.max(0, Math.floor(trimCount));
  } else if (trimPercent !== null && trimPercent !== undefined) {
    const clamped = Math.min(Math.max(trimPercent, 0), 50);
    trimPerSide = Math.floor((clamped / 100) * sorted.length);
  }

  const { mean: trimmedMean, trimmed } = computeTrimmedMean(sorted, trimPerSide);
  const trimProp = sorted.length > 0 ? trimPerSide / sorted.length : 0;

  steps.push({
    id: "trimmed",
    title: "Trimmed Mean",
    description: trimPerSide > 0
      ? `Trimmed ${trimPerSide} value(s) from each tail (${formatNumber(trimProp * 100)}%). Remaining n = ${trimmed.length}.`
      : "No trimming applied (0 trimmed per side).",
    formula: "\bar{x}_{trim} = \frac{\Sigma x_{trim}}{n_{trim}}",
    result: formatNumber(trimmedMean),
  });

  const result: SpecialMeansResult = {
    n: trimmed.length,
    originalN: cleaned.length,
    trimCountPerSide: trimPerSide,
    trimProportion: trimProp,
    trimmedData: trimmed,
    trimean,
    geometricMean,
    trimmedMean,
    quartiles: { q1, median: med, q3 },
  };

  return {
    value: result,
    steps,
    formula: "Trimean, Geometric Mean, Trimmed Mean",
    inputs: {
      originalN: cleaned.length,
      trimPerSide: trimPerSide,
      trimPercent: trimPercent ?? (trimCount ?? 0),
    },
  };
}
