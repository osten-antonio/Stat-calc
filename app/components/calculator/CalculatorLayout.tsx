import { Card } from '~/components/ui/Card';
import { MathBlock } from '~/components/math/MathBlock';

interface CalculatorLayoutProps {
  title: string;
  description: string;
  formula: string;
  children: React.ReactNode;
}

export function CalculatorLayout({
  title,
  description,
  formula,
  children,
}: CalculatorLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
          <Card variant="outlined" className="bg-gray-100 dark:bg-gray-900">
            <MathBlock formula={formula} />
          </Card>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
