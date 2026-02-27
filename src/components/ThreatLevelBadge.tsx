import clsx from 'clsx';

interface ThreatLevelBadgeProps {
  level: 'critical' | 'high' | 'medium' | 'low' | 'info';
  size?: 'sm' | 'md';
}

const levelConfig = {
  critical: { label: 'CRITICAL', class: 'threat-critical' },
  high: { label: 'HIGH', class: 'threat-high' },
  medium: { label: 'MEDIUM', class: 'threat-medium' },
  low: { label: 'LOW', class: 'threat-low' },
  info: { label: 'INFO', class: 'threat-info' },
};

export function ThreatLevelBadge({ level, size = 'sm' }: ThreatLevelBadgeProps) {
  const config = levelConfig[level];
  
  return (
    <span className={clsx(
      'inline-flex items-center rounded-md font-semibold',
      config.class,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      {config.label}
    </span>
  );
}
