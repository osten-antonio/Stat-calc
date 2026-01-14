import { describe, expect, it } from "vitest";

import { linearRegressionWithSteps, predictY } from "../regression";

describe("linearRegressionWithSteps", () => {
  it("computes slope, intercept, r, r^2, and t-statistic for a small dataset", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 5, 4, 5];

    const result = linearRegressionWithSteps(x, y, 0.05);
    const value = result.value;

    expect(value.n).toBe(5);
    expect(value.slope).toBeCloseTo(0.6, 6);
    expect(value.intercept).toBeCloseTo(2.2, 6);
    expect(value.r).toBeCloseTo(0.7745966692, 6);
    expect(value.rSquared).toBeCloseTo(0.6, 6);
    expect(value.tStatistic).toBeCloseTo(2.1213203436, 6);
    expect(value.isSignificant).toBe(false);
    expect(value.pValue).toBe("< 0.20");

    expect(value.sst).toBeCloseTo(value.ssr + value.sse, 6);

    const prediction = predictY(value.slope, value.intercept, 6);
    expect(prediction.yPred).toBeCloseTo(5.8, 6);
  });

  it("handles zero-variance X without NaN/Infinity", () => {
    const x = [3, 3, 3];
    const y = [1, 2, 3];

    const result = linearRegressionWithSteps(x, y, 0.05);
    const value = result.value;

    expect(value.n).toBe(3);
    expect(value.slope).toBe(0);
    expect(value.r).toBe(0);
    expect(value.tStatistic).toBe(0);
    expect(value.isSignificant).toBe(false);
    expect(Number.isFinite(value.standardErrorEstimate)).toBe(true);
    expect(Number.isFinite(value.standardErrorSlope)).toBe(true);
  });
});
