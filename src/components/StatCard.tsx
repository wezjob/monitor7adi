import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  severity?: 'default' | 'danger' | 'warning' | 'success';
}

export function StatCard({ title, value, icon, trend, severity = 'default' }: StatCardProps) {
  const severityColors = {
    default: 'border-cyber-border',
    danger: 'border-red-500/50 glow-red',
    warning: 'border-yellow-500/50 glow-yellow',
    success: 'border-green-500/50 glow-green',
  };

  return (
    <div className={clsx('cyber-card', severityColors[severity])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={clsx(
              'text-xs mt-1',
              trend.direction === 'up' ? 'text-red-400' : 'text-green-400'
            )}>
              {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}% vs last hour
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-cyber-bg">
          {icon}
        </div>
      </div>
    </div>
  );
}
