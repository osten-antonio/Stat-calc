import 'katex/dist/katex.min.css';
import * as ReactKatex from 'react-katex';
const { InlineMath } = ReactKatex;

interface MathInlineProps {
  formula: string;
  className?: string;
}

export function MathInline({ formula, className = '' }: MathInlineProps) {
  return (
    <span className={className}>
      <InlineMath math={formula} errorColor="#ef4444" />
    </span>
  );
}
