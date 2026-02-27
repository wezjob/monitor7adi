import { useState, useEffect } from 'react';
import { Bell, Search, User, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-cyber-card border-b border-cyber-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search IOCs, CVEs, domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-accent transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Threat Level Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-medium text-yellow-500">ELEVATED</span>
        </div>

        {/* Time Display */}
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-mono">
            {format(currentTime, 'HH:mm:ss')}
          </span>
          <span className="text-xs text-gray-500">
            {format(currentTime, 'yyyy-MM-dd')}
          </span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-cyber-border rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cyber-danger rounded-full" />
        </button>

        {/* User Menu */}
        <button className="flex items-center gap-2 p-2 hover:bg-cyber-border rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-cyber-accent/20 flex items-center justify-center">
            <User className="w-4 h-4 text-cyber-accent" />
          </div>
        </button>
      </div>
    </header>
  );
}
