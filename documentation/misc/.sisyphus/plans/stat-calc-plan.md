# Stats Stuff – Implementation Plan

## Current State

**Branch:** `feature/landing-page`
**Status:** Ready for review

### What's Done
- Landing page with minimal, beautiful design
- Categorized calculator tables (Probability, Counting, Inference, Data, Reference)
- Subtle animated graph background (SVG lines that draw on load)
- "Stats Stuff" title at bottom, centered
- Arrow indicators + "go" text on hover
- Pastel color scheme (pink, peach, mint, blue, lavender)
- Fraunces (serif) + Outfit (sans) typography
- Playwright e2e tests (4 passing)
- ANOVA link added (implementation by others on separate branch)

### Files Changed
- `app/routes/home.tsx` — Landing page component
- `app/app.css` — Design system + animations
- `app/root.tsx` — Google Fonts imports
- `e2e/landing-page.spec.ts` — Playwright tests
- `playwright.config.ts` — Test configuration
- `package.json` — Added test:e2e scripts

---

## Workflow

**Each feature = separate branch + user approval before merge.**

| Branch | Description | Status |
|--------|-------------|--------|
| `feature/landing-page` | Landing page redesign | Ready for review |
| `feature/anova` | ANOVA calculator | Done by others |
| `feature/calc-*` | Individual calculators | Pending |

---

## Next Steps (for future sessions)

1. **User reviews landing page** → Approve or request changes
2. **Merge to main** when approved
3. **Next feature:** Pick from calculator list below

---

## Calculator Implementation Order

| # | Calculator | Route | Status |
|---|------------|-------|--------|
| 1 | Descriptive Stats | `/stats-stuff/descriptive` | Pending |
| 2 | Permutations | `/stats-stuff/permutations` | Pending |
| 3 | Combinations | `/stats-stuff/combinations` | Pending |
| 4 | Binomial | `/stats-stuff/binomial` | Pending |
| 5 | Poisson | `/stats-stuff/poisson` | Pending |
| 6 | Hypergeometric | `/stats-stuff/hypergeometric` | Pending |
| 7 | T-Tests | `/stats-stuff/t-tests` | Pending |
| 8 | Chi-Square | `/stats-stuff/chi-square` | Pending |
| 9 | ANOVA | `/stats-stuff/anova` | Done by others |
| 10 | Regression | `/stats-stuff/regression` | Pending |
| 11 | Statistical Tables | `/stats-stuff/tables` | Pending |

---

## Commands

```bash
npm run dev          # Dev server at localhost:5173
npm run build        # Production build
npm run test:e2e     # Playwright tests
npm run typecheck    # TypeScript check
```

---

## Design System

### Colors
| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#fdfbf7` | Page background |
| `--color-accent-pink` | `#f8e8e8` | Probability category |
| `--color-accent-peach` | `#faf0e6` | Counting category |
| `--color-accent-mint` | `#e8f4ec` | Inference category |
| `--color-accent-blue` | `#e8f0f8` | Data category |
| `--color-accent-lavender` | `#f0e8f8` | Reference category |

### Typography
- **Display:** Fraunces (variable serif)
- **Body:** Outfit (clean sans-serif)

### Animations
- `fade-in` — Simple opacity fade
- `graph-line` / `graph-line-2` — SVG line draw animation

---

## Notes for Future Sessions

- ANOVA is linked but implemented on a separate branch by others
- Math utilities exist in `app/lib/math/` (probability.ts, t-tests.ts, chi-square.ts)
- Calculator UI pattern: use `app/components/calculator/` components
- Each calculator should have Playwright tests in `e2e/`
- Pre-existing TS errors in unrelated files (vitest.config.ts, stats-stuff.tsx) — ignore
