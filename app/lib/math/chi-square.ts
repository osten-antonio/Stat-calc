import type { CalculationStep, CalculationResult } from "~/lib/types/calculation";
import { lookupChiSquare } from "~/lib/tables/statistical-tables";

function formatNumber(num: number, decimals = 4): string {
  if (!Number.isFinite(num)) return "N/A";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

export interface GoodnessOfFitResult {
  chiSquare: number;
  df: number;
  observed: number[];
  expected: number[];
  chiCritical: number | null;
  reject: boolean;
}

export function goodnessOfFitWithSteps(
  observed: number[],
  expected: number[],
  alpha: number = 0.05,
): CalculationResult<GoodnessOfFitResult> {
  const steps: CalculationStep[] = [];
  const k = observed.length;

  steps.push({
    id: "identify",
    title: "Identify the Hypothesis Test",
    description: [
      `H₀: The observed frequencies match the expected frequencies`,
      `H₁: The observed frequencies do not match the expected frequencies`,
      `α = ${alpha} (significance level)`,
      `k = ${k} (number of categories)`,
    ].join("\n"),
  });

  if (observed.length !== expected.length) {
    steps.push({
      id: "error",
      title: "Error",
      description: "Observed and expected must have the same number of categories.",
      result: "Cannot compute",
    });
    return {
      value: { chiSquare: 0, df: 0, observed, expected, chiCritical: null, reject: false },
      steps,
      formula: "\\chi^2 = \\sum \\frac{(O_i - E_i)^2}{E_i}",
      inputs: { k, alpha },
    };
  }

  if (k < 2) {
    steps.push({
      id: "error",
      title: "Error",
      description: "Need at least 2 categories for chi-square test.",
      result: "Cannot compute",
    });
    return {
      value: { chiSquare: 0, df: 0, observed, expected, chiCritical: null, reject: false },
      steps,
      formula: "\\chi^2 = \\sum \\frac{(O_i - E_i)^2}{E_i}",
      inputs: { k, alpha },
    };
  }

  steps.push({
    id: "data",
    title: "State the Data",
    description: [
      `Observed: [${observed.join(", ")}]`,
      `Expected: [${expected.map((e) => formatNumber(e)).join(", ")}]`,
    ].join("\n"),
  });

  steps.push({
    id: "formula",
    title: "State the Chi-Square Formula",
    formula: "\\chi^2 = \\sum_{i=1}^{k} \\frac{(O_i - E_i)^2}{E_i}",
  });

  const contributions: number[] = [];
  const contributionDetails: string[] = [];

  for (let i = 0; i < k; i++) {
    const o = observed[i];
    const e = expected[i];
    const diff = o - e;
    const contrib = (diff * diff) / e;
    contributions.push(contrib);
    contributionDetails.push(
      `Category ${i + 1}: \\frac{(${o} - ${formatNumber(e)})^2}{${formatNumber(e)}} = \\frac{${formatNumber(diff * diff)}}{${formatNumber(e)}} = ${formatNumber(contrib)}`
    );
  }

  steps.push({
    id: "contributions",
    title: "Calculate Each Category's Contribution",
    description: contributionDetails.join("\n"),
  });

  const chiSquare = contributions.reduce((a, b) => a + b, 0);
  steps.push({
    id: "sum",
    title: "Sum All Contributions",
    calculation: `\\chi^2 = ${contributions.map((c) => formatNumber(c)).join(" + ")} = ${formatNumber(chiSquare)}`,
    result: formatNumber(chiSquare),
  });

  const df = k - 1;
  steps.push({
    id: "df",
    title: "Calculate Degrees of Freedom",
    calculation: `df = k - 1 = ${k} - 1 = ${df}`,
    result: String(df),
  });

  const chiCritical = lookupChiSquare(df, alpha);
  steps.push({
    id: "critical",
    title: "Find Critical Value",
    description: `For α = ${alpha}, df = ${df}`,
    result: chiCritical !== null ? `χ²-critical = ${formatNumber(chiCritical)}` : "Not in table",
  });

  const reject = chiCritical !== null && chiSquare > chiCritical;
  steps.push({
    id: "decision",
    title: "Make Decision",
    description: chiCritical !== null
      ? `χ² = ${formatNumber(chiSquare)} ${reject ? ">" : "≤"} ${formatNumber(chiCritical)} = χ²-critical`
      : "Cannot determine",
    result: reject ? "Reject H₀" : "Fail to reject H₀",
    note: reject
      ? `The observed frequencies significantly differ from expected at α = ${alpha}.`
      : `There is insufficient evidence that observed differs from expected at α = ${alpha}.`,
  });

  return {
    value: { chiSquare, df, observed, expected, chiCritical, reject },
    steps,
    formula: "\\chi^2 = \\sum \\frac{(O_i - E_i)^2}{E_i}",
    inputs: { k, df, alpha },
  };
}

export interface IndependenceResult {
  chiSquare: number;
  df: number;
  observedTable: number[][];
  expectedTable: number[][];
  rowTotals: number[];
  colTotals: number[];
  grandTotal: number;
  chiCritical: number | null;
  reject: boolean;
}

export function independenceTestWithSteps(
  observedTable: number[][],
  alpha: number = 0.05,
): CalculationResult<IndependenceResult> {
  const steps: CalculationStep[] = [];

  const rows = observedTable.length;
  const cols = observedTable[0]?.length ?? 0;

  steps.push({
    id: "identify",
    title: "Identify the Hypothesis Test",
    description: [
      `H₀: The variables are independent`,
      `H₁: The variables are not independent`,
      `α = ${alpha} (significance level)`,
      `Table size: ${rows} rows × ${cols} columns`,
    ].join("\n"),
  });

  if (rows < 2 || cols < 2) {
    steps.push({
      id: "error",
      title: "Error",
      description: "Need at least a 2×2 contingency table.",
      result: "Cannot compute",
    });
    return {
      value: { chiSquare: 0, df: 0, observedTable, expectedTable: [], rowTotals: [], colTotals: [], grandTotal: 0, chiCritical: null, reject: false },
      steps,
      formula: "\\chi^2 = \\sum \\frac{(O - E)^2}{E}",
      inputs: { rows, cols, alpha },
    };
  }

  const rowTotals = observedTable.map((row) => row.reduce((a, b) => a + b, 0));
  const colTotals: number[] = [];
  for (let c = 0; c < cols; c++) {
    let sum = 0;
    for (let r = 0; r < rows; r++) {
      sum += observedTable[r][c];
    }
    colTotals.push(sum);
  }
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

  steps.push({
    id: "totals",
    title: "Calculate Marginal Totals",
    description: [
      `Row totals: [${rowTotals.join(", ")}]`,
      `Column totals: [${colTotals.join(", ")}]`,
      `Grand total: ${grandTotal}`,
    ].join("\n"),
  });

  const expectedTable: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      row.push((rowTotals[r] * colTotals[c]) / grandTotal);
    }
    expectedTable.push(row);
  }

  steps.push({
    id: "expected",
    title: "Calculate Expected Frequencies",
    formula: "E_{rc} = \\frac{(Row\\ Total)(Column\\ Total)}{Grand\\ Total}",
    description: expectedTable.map((row, r) => `Row ${r + 1}: [${row.map((e) => formatNumber(e, 2)).join(", ")}]`).join("\n"),
  });

  steps.push({
    id: "formula",
    title: "State the Chi-Square Formula",
    formula: "\\chi^2 = \\sum_{all\\ cells} \\frac{(O - E)^2}{E}",
  });

  let chiSquare = 0;
  const cellCalcs: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const o = observedTable[r][c];
      const e = expectedTable[r][c];
      const contrib = Math.pow(o - e, 2) / e;
      chiSquare += contrib;
      if (cellCalcs.length < 6) {
        cellCalcs.push(`Cell(${r + 1},${c + 1}): (${o}-${formatNumber(e, 2)})²/${formatNumber(e, 2)} = ${formatNumber(contrib)}`);
      }
    }
  }
  if (rows * cols > 6) {
    cellCalcs.push("...");
  }

  steps.push({
    id: "calculations",
    title: "Calculate Chi-Square Contributions",
    description: cellCalcs.join("\n"),
    result: `χ² = ${formatNumber(chiSquare)}`,
  });

  const df = (rows - 1) * (cols - 1);
  steps.push({
    id: "df",
    title: "Calculate Degrees of Freedom",
    calculation: `df = (rows - 1)(cols - 1) = (${rows} - 1)(${cols} - 1) = ${df}`,
    result: String(df),
  });

  const chiCritical = lookupChiSquare(df, alpha);
  steps.push({
    id: "critical",
    title: "Find Critical Value",
    description: `For α = ${alpha}, df = ${df}`,
    result: chiCritical !== null ? `χ²-critical = ${formatNumber(chiCritical)}` : "Not in table",
  });

  const reject = chiCritical !== null && chiSquare > chiCritical;
  steps.push({
    id: "decision",
    title: "Make Decision",
    description: chiCritical !== null
      ? `χ² = ${formatNumber(chiSquare)} ${reject ? ">" : "≤"} ${formatNumber(chiCritical)} = χ²-critical`
      : "Cannot determine",
    result: reject ? "Reject H₀" : "Fail to reject H₀",
    note: reject
      ? `The variables are NOT independent at α = ${alpha}. There is a significant association.`
      : `There is insufficient evidence of association between variables at α = ${alpha}.`,
  });

  return {
    value: { chiSquare, df, observedTable, expectedTable, rowTotals, colTotals, grandTotal, chiCritical, reject },
    steps,
    formula: "\\chi^2 = \\sum \\frac{(O - E)^2}{E}",
    inputs: { rows, cols, df, alpha },
  };
}
