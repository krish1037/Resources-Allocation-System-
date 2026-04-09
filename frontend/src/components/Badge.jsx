import React from 'react';

const variants = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 border-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 border-orange-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 border-blue-200',
  resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 border-emerald-200',
  open: 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 border-orange-200',
  assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 border-blue-200',
  done: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 border-emerald-200',
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:border-zinc-700/50 border-zinc-200',
};

export default function Badge({ children, variant = 'default' }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
        variants[variant] || variants.default
      }`}
    >
      {children}
    </span>
  );
}
