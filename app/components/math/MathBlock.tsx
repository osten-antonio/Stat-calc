import pkg from 'react-katex';
const { BlockMath } = pkg;

interface MathBlockProps {
  formula: string;
  className?: string;
}

export function MathBlock({ formula, className = '' }: MathBlockProps) {
  return (
    <div className={`overflow-x-auto py-2 ${className}`}>
      <BlockMath math={formula} errorColor="#ef4444" />
    </div>
  );
}
