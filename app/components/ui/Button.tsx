import type React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  tone?: 'pink' | 'peach' | 'mint' | 'blue' | 'lavender';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  tone,
  children,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950',
  };

  const toneStyles: Record<NonNullable<ButtonProps['tone']>, React.CSSProperties> = {
    pink: { backgroundColor: 'var(--color-dot-pink)', color: '#fff' },
    peach: { backgroundColor: 'var(--color-dot-peach)', color: '#fff' },
    mint: { backgroundColor: 'var(--color-dot-mint)', color: '#fff' },
    blue: { backgroundColor: 'var(--color-dot-blue)', color: '#fff' },
    lavender: { backgroundColor: 'var(--color-dot-lavender)', color: '#fff' },
  };

  const toneClass = tone ? 'hover:opacity-90 active:opacity-80' : '';
  const appliedStyle = tone ? { ...toneStyles[tone], ...style } : style;
  const appliedVariant = tone ? '' : variants[variant];

  return (
    <button
      className={`px-6 py-2 rounded-lg font-medium transition-colors ${appliedVariant} ${toneClass} ${className}`}
      style={appliedStyle}
      {...props}
    >
      {children}
    </button>
  );
}
