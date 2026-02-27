import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  Globe, 
  Bug, 
  Network, 
  Tv, 
  Database, 
  Bot, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/threat-intel', icon: Shield, label: 'Threat Intel' },
  { path: '/darkweb', icon: Globe, label: 'Dark Web' },
  { path: '/vulnerabilities', icon: Bug, label: 'Vuln Scanner' },
  { path: '/attack-surface', icon: Network, label: 'Attack Surface' },
  { path: '/news', icon: Tv, label: 'Live News' },
  { path: '/data-leaks', icon: Database, label: 'Data Leaks' },
  { path: '/ai-analyst', icon: Bot, label: 'AI Analyst' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside 
      className={clsx(
        'bg-cyber-card border-r border-cyber-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-cyber-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-cyber-accent" />
            <span className="font-bold text-lg text-white">Monitor7adi</span>
          </div>
        )}
        {collapsed && <Shield className="w-8 h-8 text-cyber-accent mx-auto" />}
        <button
          onClick={onToggle}
          className="p-1 hover:bg-cyber-border rounded transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30'
                  : 'text-gray-400 hover:text-white hover:bg-cyber-border'
              )
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-cyber-border">
        {!collapsed && (
          <div className="text-xs text-gray-500">
            <p>Monitor7adi v1.0.0</p>
            <p className="text-cyber-accent">● Connected</p>
          </div>
        )}
        {collapsed && (
          <div className="w-2 h-2 rounded-full bg-cyber-accent mx-auto" />
        )}
      </div>
    </aside>
  );
}
