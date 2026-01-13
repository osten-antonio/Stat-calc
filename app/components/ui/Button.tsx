interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950',
  };

  return (
    <button
      className={`px-6 py-2 rounded-lg font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
