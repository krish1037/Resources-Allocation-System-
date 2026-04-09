import React from 'react';

const variantStyles = {
  primary:
    'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200',
  secondary:
    'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800 dark:hover:bg-zinc-800',
  ghost:
    'bg-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-sm dark:bg-red-500 dark:hover:bg-red-600',
};

export default function Button({
  children,
  variant = 'primary',
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2 opacity-70" />}
      {children}
    </button>
  );
}
