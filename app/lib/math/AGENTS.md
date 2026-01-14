# AGENT NOTES: app/lib/math

**Role**: Statistical math engine (pure functions + WithSteps variants).

## WHERE TO LOOK
- probability.ts — PMF/CDF for Binomial, Poisson, Hypergeometric, Normal; asserts probability bounds; largest file.
- t-tests.ts — One-sample, paired, independent; pooled variance/SE math.
- chi-square.ts — GOF + contingency with df logic; uses statistical tables.
- regression.ts — Simple linear regression; requires paired arrays equal length.
- descriptive.ts — Means/variance/summary helpers.
- factorial.ts — Caps n at 170 to avoid overflow.

## PATTERNS
- WithSteps pattern: return { value, steps } using CalculationStep[].
- Input guards: assertProbability, assertNonNegativeInteger, length matches for paired data.
- Formatting: formatNumber/TeX strings for steps.
- Uses jStat for distributions; tables fallback for critical values.

## ANTI-PATTERNS
- Reject probabilities outside [0,1]; negative/non-integer counts; factorial n>170; mismatched array lengths; sd<=0, lambda<=0.

## NOTES
- Keep pure: no UI concerns here. Add tests in app/lib/math/__tests__.
