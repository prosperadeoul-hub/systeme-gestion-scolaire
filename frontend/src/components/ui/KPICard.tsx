import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  color?: 'sky' | 'emerald' | 'amber' | 'rose';
  delay?: number;
}

const colorMap = {
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    icon: 'bg-sky-100 dark:bg-sky-800/40 text-sky-600 dark:text-sky-400',
    trend: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-100 dark:border-sky-800/40',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-400',
    trend: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-800/40',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-400',
    trend: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-800/40',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    icon: 'bg-rose-100 dark:bg-rose-800/40 text-rose-600 dark:text-rose-400',
    trend: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-800/40',
  },
};

export default function KPICard({ title, value, subtitle, icon, trend, color = 'sky', delay = 0 }: KPICardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-xl border ${colors.border} ${colors.bg} p-5`}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <div className={`p-2 rounded-lg ${colors.icon}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>}
      {trend && (
        <p className={`mt-2 text-xs font-medium ${trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </motion.div>
  );
}
