import 'katex/dist/katex.min.css';
import pkg from 'react-katex';
const { InlineMath } = pkg;

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
