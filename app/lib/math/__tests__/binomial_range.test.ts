import { describe, it, expect } from "vitest";
import { binomialRangeWithSteps } from "../probability";

describe("binomialRangeWithSteps", () => {
    it("calculates range [4, 6] for n=10, p=0.5 correctly", () => {
        // P(X=4) = 0.205078
        // P(X=5) = 0.246094
        // P(X=6) = 0.205078
        // Sum = 0.65625
        const result = binomialRangeWithSteps(10, 4, 6, 0.5);

        expect(result.value.probability).toBeCloseTo(0.65625, 5);
        expect(result.value.min).toBe(4);
        expect(result.value.max).toBe(6);
        expect(result.value.n).toBe(10);

        // Check steps existence
        expect(result.steps.find(s => s.id === "identify")).toBeDefined();
        expect(result.steps.find(s => s.id === "formula")).toBeDefined();
        expect(result.steps.find(s => s.id === "calculations")).toBeDefined();
        expect(result.steps.find(s => s.id === "sum")).toBeDefined();

        // Check explicit working content
        const calcStep = result.steps.find(s => s.id === "calculations" || s.id === "calculations-preview");
        expect(calcStep?.description).toContain("P(X=4)");
        expect(calcStep?.description).toContain("P(X=5)");
        expect(calcStep?.description).toContain("P(X=6)");
    });

    it("handles single value range [5, 5] correctly (P(X=5))", () => {
        const result = binomialRangeWithSteps(10, 5, 5, 0.5);
        expect(result.value.probability).toBeCloseTo(0.24609375, 5);
        expect(result.steps.find(s => s.id === "result")).toBeDefined();
    });

    it("handles full range [0, n] correctly (should be 1)", () => {
        const result = binomialRangeWithSteps(5, 0, 5, 0.3);
        expect(result.value.probability).toBeCloseTo(1, 4);
    });

    it("validates inputs", () => {
        const invalid = binomialRangeWithSteps(10, 5, 4, 0.5); // min > max
        expect(invalid.value.probability).toBe(0);
        expect(invalid.steps.find(s => s.id === "invalid")).toBeDefined();
    });
});
