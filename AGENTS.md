# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-13
**Commit:** 9ed5abc
**Branch:** feat/regression

## OVERVIEW
React Router v7 + Vite + TypeScript strict. Stats calculator (“Stats Hell”) with math engine in `app/lib/math` and retro/normal themes via `app/app.css`.

## STRUCTURE
```
./
├── app/           # Source (routes, math engine, components)
├── build/         # Generated client/server output
├── public/        # Static assets (should hold PDFs/images)
├── documentation/ # Docs (non-standard; usually /docs)
└── standardnormaltable.pdf  # Stray asset (should move to /public)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| App entry & routing | app/root.tsx, app/routes.ts | Manual route map (RRv7 flat routes) |
| Calculators UI | app/routes/*.tsx | Each stats tool page (binomial, t-tests, chi-square, etc.) |
| Math logic | app/lib/math/* | Pure calc + WithSteps pattern; assertions enforce valid inputs |
| Shared types/format | app/lib/types, app/lib/format | CalculationResult/Step, ExamAnswer formatting |
| Shared UI | app/components/** | CalculatorLayout, MathBlock, CopyExamAnswer, DataTableInput |
| Config/build | vite.config.ts, tsconfig.json, vitest.config.ts | Vite + RRv7 + Tailwind 4; Vitest node env |
| Non-code plans | .sisyphus/plans/, .opencode/skills/ | AI-agent plans/skills; bun.lock in .opencode |

## CODE MAP
(High-level, per exploration)
- Routes: app/routes.ts maps flat files (stats-hell.*). app/root.tsx wraps app.
- Math engine: app/lib/math/probability.ts (534 LOC), t-tests.ts (397), chi-square.ts; uses CalculationStep[] tracing.
- Shared UI: app/components/calculator (Layout, CopyExamAnswer, DataTableInput); app/components/math (MathBlock/Inline for KaTeX).
- Tables: app/lib/tables/statistical-tables.ts (critical values lookup).
- Tests: app/lib/math/__tests__/probability.test.ts (Vitest, node env, closeTo helper).

## CONVENTIONS
- Path alias `~/` → `app/` (tsconfig).
- Strict TS; no eslint/prettier configs present.
- Routes defined explicitly in app/routes.ts (not file-auto), but filenames still `stats-hell.*` for organization.
- Calculation functions return `{ value, steps, ... }` via CalculationResult; UI converts to ExamAnswer and renders MathBlock.
- Tailwind 4 via `@tailwindcss/vite`; themes toggled by `.retro-theme` class.

## ANTI-PATTERNS (PROJECT)
- Inputs rejected if probabilities outside [0,1], counts negative/non-integer, factorial n > 170, mismatched paired arrays.
- Legacy route file stats-hell-legacy.tsx is unused (not in routes.ts).
- Asset misplaced: standardnormaltable.pdf at root instead of /public.
- Template leftover: app/welcome/ unused.

## UNIQUE STYLES
- Retro “Stats Hell” theme (Comic Sans, neon colors, marquee, fire/blink animations) activated via body.retro-theme.
- Sarcastic UX copy in stats-hell.tsx errors.

## COMMANDS
```bash
npm run dev          # React Router dev (Vite)
npm run build        # react-router build
npm run typecheck    # react-router typegen && tsc
npm run test         # vitest run (node env)
```

## NOTES
- No CI workflows; Dockerfile present (multi-stage).
- documentation/ used instead of docs/; consider standardizing.
- Move standardnormaltable.pdf to /public for proper serving.
