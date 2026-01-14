import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

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
