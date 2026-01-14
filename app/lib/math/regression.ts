import type { CalculationStep, CalculationResult } from "~/lib/types/calculation";
import { lookupTValue, findClosestDf } from "~/lib/tables/statistical-tables";

function formatNumber(num: number, decimals = 4): string {
  if (!Number.isFinite(num)) return "N/A";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

export interface DataTableRow {
  x: number;
  y: number;
  x2: number;
  y2: number;
  xy: number;
  yPred: number;
  residual: number;
  residualSquared: number;
}

export interface LinearRegressionResult {
  n: number;
  slope: number;
  intercept: number;
  r: number;
  rSquared: number;
  equation: string;
  sumX: number;
  sumY: number;
  sumXY: number;
  sumX2: number;
  sumY2: number;
  meanX: number;
  meanY: number;
  sst: number;
  ssr: number;
  sse: number;
  standardErrorEstimate: number;
  standardErrorSlope: number;
  tStatistic: number;
  df: number;
  pValue: string;
  tCritical: number | null;
  isSignificant: boolean;
  dataTable: DataTableRow[];
}

export function linearRegressionWithSteps(
  xValues: number[],
  yValues: number[],
  alpha: number = 0.05,
): CalculationResult<LinearRegressionResult> {
  const steps: CalculationStep[] = [];

  if (xValues.length !== yValues.length) {
    steps.push({
      id: "error",
      title: "Error",
      description: "X and Y must have the same number of values.",
      result: "Cannot compute",
    });
    const emptyResult = createEmptyResult();
    return { value: emptyResult, steps, formula: "y = a + bx", inputs: {} };
  }

  const n = xValues.length;

  if (n < 2) {
    steps.push({
      id: "error",
      title: "Error",
      description: "Need at least 2 data points for regression.",
      result: "Cannot compute",
    });
    const emptyResult = createEmptyResult();
    return { value: emptyResult, steps, formula: "y = a + bx", inputs: { n } };
  }

  steps.push({
    id: "data",
    title: "Step 1: Identify the Data",
    description: [
      `n = ${n} (number of data points)`,
      `X: [${xValues.slice(0, 8).map(v => formatNumber(v, 2)).join(", ")}${xValues.length > 8 ? ", ..." : ""}]`,
      `Y: [${yValues.slice(0, 8).map(v => formatNumber(v, 2)).join(", ")}${yValues.length > 8 ? ", ..." : ""}]`,
    ].join("\n"),
  });

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
  const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);
  const sumY2 = yValues.reduce((acc, y) => acc + y * y, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  const dataTable: DataTableRow[] = [];
  for (let i = 0; i < n; i++) {
    dataTable.push({
      x: xValues[i],
      y: yValues[i],
      x2: xValues[i] * xValues[i],
      y2: yValues[i] * yValues[i],
      xy: xValues[i] * yValues[i],
      yPred: 0,
      residual: 0,
      residualSquared: 0,
    });
  }

  steps.push({
    id: "table",
    title: "Step 2: Create Data Table",
    description: [
      "Calculate X², Y², and XY for each data point:",
      "",
      "| X | Y | X² | Y² | XY |",
      "|---|---|----|----|-----|",
      ...dataTable.slice(0, 8).map(row => 
        `| ${formatNumber(row.x, 2)} | ${formatNumber(row.y, 2)} | ${formatNumber(row.x2, 2)} | ${formatNumber(row.y2, 2)} | ${formatNumber(row.xy, 2)} |`
      ),
      dataTable.length > 8 ? "| ... | ... | ... | ... | ... |" : "",
      `| **Σ = ${formatNumber(sumX)}** | **${formatNumber(sumY)}** | **${formatNumber(sumX2)}** | **${formatNumber(sumY2)}** | **${formatNumber(sumXY)}** |`,
    ].filter(Boolean).join("\n"),
  });

  steps.push({
    id: "sums",
    title: "Step 3: Calculate Sums and Means",
    description: [
      `Σx = ${formatNumber(sumX)}`,
      `Σy = ${formatNumber(sumY)}`,
      `Σx² = ${formatNumber(sumX2)}`,
      `Σy² = ${formatNumber(sumY2)}`,
      `Σxy = ${formatNumber(sumXY)}`,
      ``,
      `x̄ = Σx/n = ${formatNumber(sumX)}/${n} = ${formatNumber(meanX)}`,
      `ȳ = Σy/n = ${formatNumber(sumY)}/${n} = ${formatNumber(meanY)}`,
    ].join("\n"),
  });

  steps.push({
    id: "slope-formula",
    title: "Step 4: Calculate Slope (b)",
    formula: "b = \\frac{n\\Sigma xy - \\Sigma x \\cdot \\Sigma y}{n\\Sigma x^2 - (\\Sigma x)^2}",
  });

  const slopeNumerator = n * sumXY - sumX * sumY;
  const slopeDenominator = n * sumX2 - sumX * sumX;
  const slope = slopeDenominator !== 0 ? slopeNumerator / slopeDenominator : 0;

  steps.push({
    id: "slope-calc",
    title: "Substitute Values for Slope",
    calculation: `b = \\frac{(${n})(${formatNumber(sumXY)}) - (${formatNumber(sumX)})(${formatNumber(sumY)})}{(${n})(${formatNumber(sumX2)}) - (${formatNumber(sumX)})^2}`,
    note: `b = \\frac{${formatNumber(slopeNumerator)}}{${formatNumber(slopeDenominator)}}`,
    result: formatNumber(slope),
  });

  steps.push({
    id: "intercept-formula",
    title: "Step 5: Calculate Intercept (a)",
    formula: "a = \\bar{y} - b\\bar{x}",
  });

  const intercept = meanY - slope * meanX;

  steps.push({
    id: "intercept-calc",
    title: "Substitute Values for Intercept",
    calculation: `a = ${formatNumber(meanY)} - (${formatNumber(slope)})(${formatNumber(meanX)})`,
    result: formatNumber(intercept),
  });

  const interceptSign = intercept >= 0 ? "+" : "-";
  const equation = `ŷ = ${formatNumber(slope)}x ${interceptSign} ${formatNumber(Math.abs(intercept))}`;
  
  steps.push({
    id: "equation",
    title: "Step 6: Write the Regression Equation",
    formula: `\\hat{y} = ${formatNumber(slope)}x ${interceptSign} ${formatNumber(Math.abs(intercept))}`,
    result: equation,
  });

  for (let i = 0; i < n; i++) {
    dataTable[i].yPred = intercept + slope * xValues[i];
    dataTable[i].residual = yValues[i] - dataTable[i].yPred;
    dataTable[i].residualSquared = dataTable[i].residual * dataTable[i].residual;
  }

  steps.push({
    id: "r-formula",
    title: "Step 7: Calculate Correlation Coefficient (r)",
    formula: "r = \\frac{n\\Sigma xy - \\Sigma x \\cdot \\Sigma y}{\\sqrt{[n\\Sigma x^2 - (\\Sigma x)^2][n\\Sigma y^2 - (\\Sigma y)^2]}}",
  });

  const rNumerator = n * sumXY - sumX * sumY;
  const rDenomLeft = n * sumX2 - sumX * sumX;
  const rDenomRight = n * sumY2 - sumY * sumY;
  const rDenominator = Math.sqrt(rDenomLeft * rDenomRight);
  const r = rDenominator !== 0 ? rNumerator / rDenominator : 0;
  const rSquared = r * r;

  steps.push({
    id: "r-calc",
    title: "Calculate r",
    calculation: `r = \\frac{${formatNumber(rNumerator)}}{\\sqrt{(${formatNumber(rDenomLeft)})(${formatNumber(rDenomRight)})}}`,
    note: `r = \\frac{${formatNumber(rNumerator)}}{${formatNumber(rDenominator)}}`,
    result: formatNumber(r),
  });

  steps.push({
    id: "r-squared",
    title: "Step 8: Calculate Coefficient of Determination (r²)",
    formula: "r^2 = r \\times r",
    calculation: `r^2 = (${formatNumber(r)})^2`,
    result: formatNumber(rSquared),
    note: `${formatNumber(rSquared * 100, 1)}% of the variance in Y is explained by X.`,
  });

  const sst = yValues.reduce((acc, y) => acc + Math.pow(y - meanY, 2), 0);
  const sse = dataTable.reduce((acc, row) => acc + row.residualSquared, 0);
  const ssr = sst - sse;

  steps.push({
    id: "ss-partition",
    title: "Step 9: Partition Sum of Squares",
    description: [
      "SST (Total) = Σ(y - ȳ)²",
      "SSR (Regression) = Σ(ŷ - ȳ)²",
      "SSE (Error) = Σ(y - ŷ)²",
      "",
      `SST = ${formatNumber(sst)}`,
      `SSE = ${formatNumber(sse)}`,
      `SSR = SST - SSE = ${formatNumber(sst)} - ${formatNumber(sse)} = ${formatNumber(ssr)}`,
      "",
      `Check: r² = SSR/SST = ${formatNumber(ssr)}/${formatNumber(sst)} = ${formatNumber(ssr / sst)}`,
    ].join("\n"),
  });

  const df = n - 2;
  const standardErrorEstimate = df > 0 ? Math.sqrt(sse / df) : 0;

  steps.push({
    id: "se-estimate",
    title: "Step 10: Standard Error of the Estimate (sₑ)",
    formula: "s_e = \\sqrt{\\frac{SSE}{n-2}} = \\sqrt{\\frac{\\Sigma(y - \\hat{y})^2}{n-2}}",
    calculation: `s_e = \\sqrt{\\frac{${formatNumber(sse)}}{${n} - 2}} = \\sqrt{\\frac{${formatNumber(sse)}}{${df}}}`,
    result: formatNumber(standardErrorEstimate),
  });

  const ssX = sumX2 - (sumX * sumX) / n;
  const standardErrorSlope = ssX > 0 ? standardErrorEstimate / Math.sqrt(ssX) : 0;

  steps.push({
    id: "se-slope",
    title: "Step 11: Standard Error of the Slope (sb)",
    formula: "s_b = \\frac{s_e}{\\sqrt{SS_X}} = \\frac{s_e}{\\sqrt{\\Sigma x^2 - \\frac{(\\Sigma x)^2}{n}}}",
    calculation: `s_b = \\frac{${formatNumber(standardErrorEstimate)}}{\\sqrt{${formatNumber(sumX2)} - \\frac{(${formatNumber(sumX)})^2}{${n}}}} = \\frac{${formatNumber(standardErrorEstimate)}}{\\sqrt{${formatNumber(ssX)}}}`,
    result: formatNumber(standardErrorSlope),
  });

  const tStatistic = standardErrorSlope !== 0 ? slope / standardErrorSlope : 0;
  const tCritical = lookupTValue(df, alpha / 2);
  const isSignificant = tCritical !== null && Math.abs(tStatistic) > tCritical;

  steps.push({
    id: "hypothesis",
    title: "Step 12: Hypothesis Test for Slope",
    description: [
      `H₀: β = 0 (no linear relationship)`,
      `H₁: β ≠ 0 (linear relationship exists)`,
      ``,
      `α = ${alpha} (two-tailed)`,
      `df = n - 2 = ${n} - 2 = ${df}`,
    ].join("\n"),
    formula: "t = \\frac{b - 0}{s_b} = \\frac{b}{s_b}",
    calculation: `t = \\frac{${formatNumber(slope)}}{${formatNumber(standardErrorSlope)}}`,
    result: formatNumber(tStatistic),
    note: tCritical !== null 
      ? `Critical value t_{${alpha/2}, ${df}} = ±${formatNumber(tCritical)}` 
      : `df=${df} not in table`,
  });

  const pValueStr = Math.abs(tStatistic) > 3.5 ? "< 0.01" : 
                    Math.abs(tStatistic) > 2.5 ? "< 0.05" : 
                    Math.abs(tStatistic) > 1.5 ? "< 0.20" : "> 0.20";

  steps.push({
    id: "decision",
    title: "Step 13: Decision",
    description: [
      `|t| = ${formatNumber(Math.abs(tStatistic))}`,
      tCritical !== null ? `t-critical = ${formatNumber(tCritical)}` : "",
      ``,
      isSignificant 
        ? `Since |t| = ${formatNumber(Math.abs(tStatistic))} > ${formatNumber(tCritical!)}, we REJECT H₀.`
        : tCritical !== null 
          ? `Since |t| = ${formatNumber(Math.abs(tStatistic))} ≤ ${formatNumber(tCritical)}, we FAIL TO REJECT H₀.`
          : "Cannot determine significance without critical value.",
      ``,
      isSignificant
        ? "There IS a statistically significant linear relationship between X and Y."
        : "There is NO statistically significant linear relationship between X and Y.",
    ].filter(Boolean).join("\n"),
  });

  let interpretation = "";
  if (Math.abs(r) >= 0.9) interpretation = "Very strong";
  else if (Math.abs(r) >= 0.7) interpretation = "Strong";
  else if (Math.abs(r) >= 0.5) interpretation = "Moderate";
  else if (Math.abs(r) >= 0.3) interpretation = "Weak";
  else interpretation = "Very weak or no";

  steps.push({
    id: "interpretation",
    title: "Step 14: Interpretation",
    description: [
      `Correlation (r) = ${formatNumber(r)}`,
      `Direction: ${r > 0 ? "Positive" : r < 0 ? "Negative" : "None"}`,
      `Strength: ${interpretation} correlation`,
      ``,
      `r² = ${formatNumber(rSquared)} → ${formatNumber(rSquared * 100, 1)}% of variance in Y is explained by X`,
      ``,
      `For every 1 unit increase in X, Y changes by ${formatNumber(slope)} units.`,
    ].join("\n"),
  });

  steps.push({
    id: "summary",
    title: "Summary",
    description: [
      `Regression Equation: ${equation}`,
      ``,
      `Slope (b) = ${formatNumber(slope)}`,
      `Intercept (a) = ${formatNumber(intercept)}`,
      ``,
      `Correlation (r) = ${formatNumber(r)}`,
      `R-squared (r²) = ${formatNumber(rSquared)} (${formatNumber(rSquared * 100, 1)}%)`,
      ``,
      `Standard Error of Estimate (sₑ) = ${formatNumber(standardErrorEstimate)}`,
      `Standard Error of Slope (sb) = ${formatNumber(standardErrorSlope)}`,
      `t-statistic = ${formatNumber(tStatistic)}`,
      ``,
      `Conclusion: The slope is ${isSignificant ? "" : "NOT "}statistically significant at α = ${alpha}.`,
    ].join("\n"),
  });

  const result: LinearRegressionResult = {
    n,
    slope,
    intercept,
    r,
    rSquared,
    equation,
    sumX,
    sumY,
    sumXY,
    sumX2,
    sumY2,
    meanX,
    meanY,
    sst,
    ssr,
    sse,
    standardErrorEstimate,
    standardErrorSlope,
    tStatistic,
    df,
    pValue: pValueStr,
    tCritical,
    isSignificant,
    dataTable,
  };

  return {
    value: result,
    steps,
    formula: "\\hat{y} = a + bx",
    inputs: { n, sumX, sumY, sumXY, sumX2, sumY2, alpha },
  };
}

function createEmptyResult(): LinearRegressionResult {
  return {
    n: 0,
    slope: 0,
    intercept: 0,
    r: 0,
    rSquared: 0,
    equation: "",
    sumX: 0,
    sumY: 0,
    sumXY: 0,
    sumX2: 0,
    sumY2: 0,
    meanX: 0,
    meanY: 0,
    sst: 0,
    ssr: 0,
    sse: 0,
    standardErrorEstimate: 0,
    standardErrorSlope: 0,
    tStatistic: 0,
    df: 0,
    pValue: "N/A",
    tCritical: null,
    isSignificant: false,
    dataTable: [],
  };
}

export function predictY(
  slope: number,
  intercept: number,
  x: number,
): { yPred: number; equation: string } {
  const yPred = intercept + slope * x;
  const interceptSign = intercept >= 0 ? "+" : "-";
  return {
    yPred,
    equation: `ŷ = ${formatNumber(slope)}(${formatNumber(x)}) ${interceptSign} ${formatNumber(Math.abs(intercept))} = ${formatNumber(yPred)}`,
  };
}
