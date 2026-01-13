interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
    outlined: 'border-2 border-gray-300 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-900 shadow-lg',
  };

  return (
    <div className={`rounded-xl p-6 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
