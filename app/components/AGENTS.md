# AGENT NOTES: app/components

**Role**: Shared UI building blocks (layout, calculator helpers, math rendering, UI primitives).

## WHERE TO LOOK
- calculator/CalculatorLayout.tsx — Standard page shell for calculators.
- calculator/CopyExamAnswer.tsx — Clipboard export of formatted results.
- calculator/DataTableInput.tsx — TSV/CSV-friendly grid for numeric inputs.
- math/MathBlock.tsx, MathInline.tsx — KaTeX wrappers for TeX rendering.
- ui/Button.tsx, Input.tsx, Label.tsx — Basic form primitives.
- layout/RetroToggle.tsx — Theme toggle normal vs retro.

## PATTERNS
- Calculator pages compose CalculatorLayout + MathBlock + CopyExamAnswer + DataTableInput as needed.
- Math components expect TeX strings built in math engine.
- DataTableInput normalizes pasted rows to rectangular arrays.

## NOTES
- Avoid styling drift; follow existing retro theme hooks and layout spacing.
