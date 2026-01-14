import { describe, it, expect } from "vitest";
import {
  binomialPmf,
  binomialCdf,
  binomialUpperTail,
  poissonPmf,
  poissonCdf,
  poissonUpperTail,
  hypergeometricPmf,
  hypergeometricCdf,
  hypergeometricUpperTail,
  normalCdf,
  normalUpperTail,
} from "../probability";

const closeTo = (actual: number, expected: number, tol = 1e-6) => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol);
};

describe("binomial", () => {
  it("pmf basic", () => {
    closeTo(binomialPmf(10, 3, 0.5), 0.1171875);
  });

  it("cdf and tails", () => {
    closeTo(binomialCdf(10, 3, 0.5), 0.171875);
    closeTo(binomialUpperTail(10, 3, 0.5), 1 - binomialCdf(10, 2, 0.5));
    closeTo(binomialUpperTail(10, 0, 0.5), 1);
  });
});

describe("poisson", () => {
  it("pmf basic", () => {
    closeTo(poissonPmf(2, 3), 0.180447044);
  });

  it("cdf and tails", () => {
    closeTo(poissonCdf(2, 3), 0.85712346);
    closeTo(poissonUpperTail(2, 3), 1 - poissonCdf(2, 3));
    closeTo(poissonUpperTail(2, -1), 1);
  });
});

describe("hypergeometric", () => {
  it("pmf basic", () => {
    closeTo(hypergeometricPmf(10, 3, 4, 1), 0.5, 1e-9);
  });

  it("cdf and tails", () => {
    closeTo(hypergeometricCdf(10, 3, 4, 1), 0.6666666667, 1e-9);
    closeTo(hypergeometricUpperTail(10, 3, 4, 1), 1 - hypergeometricCdf(10, 3, 4, 0));
  });
});

describe("normal", () => {
  it("cdf symmetry", () => {
    closeTo(normalCdf(0), 0.5);
    closeTo(normalUpperTail(0), 0.5);
  });

  it("quantile sanity", () => {
    closeTo(normalCdf(1.96), 0.975002, 1e-3);
    closeTo(normalUpperTail(1.96), 0.024998, 1e-3);
  });
});
