# AGENT NOTES: app/routes

**Role**: UI routes for calculators; wired via manual map in app/routes.ts.

## WHERE TO LOOK
- stats-hell.tsx — Main “Stats Hell” hub/layout; retro UX and sarcasm.
- stats-hell.binomial.tsx — Binomial calculator; uses binomialWithSteps.
- stats-hell.poisson.tsx — Poisson calculator; lambda>0 guard.
- stats-hell.hypergeometric.tsx — Hypergeometric calculator; validates population/sample counts.
- stats-hell.chi-square.tsx — GOF/contingency; dynamic tables.
- stats-hell.t-tests.tsx — One-sample/paired/independent UI; complex state.
- stats-hell.regression.tsx — Simple linear regression UI; paired arrays.
- stats-hell.descriptive.tsx — Summary stats UI.
- stats-hell.combinations.tsx / permutations.tsx — Combinatorics helpers.
- stats-hell.tables.tsx — Critical value lookups UI.
- home.tsx — Landing page.
- stats-hell-legacy.tsx — Unused/orphaned legacy route.

## PATTERNS
- Each route pulls math from app/lib/math and converts CalculationResult to ExamAnswer for CopyExamAnswer.
- Shared layout via CalculatorLayout; MathBlock for LaTeX.
- DataTableInput for tabular inputs (t-tests, chi-square, regression).
- Route filenames prefixed stats-hell.*; manually registered in app/routes.ts.

## ANTI-PATTERNS
- Legacy file stats-hell-legacy.tsx is not in routes.ts (dead code).
- Ensure numeric parsing/validation before invoking math; guard empty inputs.

## NOTES
- Keep routes thin; push math to app/lib/math. Maintain WithSteps/ExamAnswer pattern.
