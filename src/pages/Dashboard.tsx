import { Shield, AlertTriangle, Bug, Globe, Database, Activity } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ThreatLevelBadge } from '../components/ThreatLevelBadge';
import { ThreatMap } from '../components/ThreatMap';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock data for demonstration
const threatActivityData = [
  { time: '00:00', threats: 45, alerts: 12 },
  { time: '04:00', threats: 32, alerts: 8 },
  { time: '08:00', threats: 78, alerts: 23 },
  { time: '12:00', threats: 65, alerts: 18 },
  { time: '16:00', threats: 89, alerts: 34 },
  { time: '20:00', threats: 56, alerts: 15 },
  { time: 'Now', threats: 72, alerts: 21 },
];

const recentThreats = [
  { id: 1, title: 'APT29 Campaign Detected', severity: 'critical' as const, source: 'MISP', time: '2 min ago' },
  { id: 2, title: 'CVE-2024-1234 Exploitation', severity: 'high' as const, source: 'NVD', time: '15 min ago' },
  { id: 3, title: 'Phishing Domain Registered', severity: 'medium' as const, source: 'URLhaus', time: '32 min ago' },
  { id: 4, title: 'New Ransomware Variant', severity: 'high' as const, source: 'VirusTotal', time: '1 hour ago' },
  { id: 5, title: 'DDoS Attack Pattern', severity: 'medium' as const, source: 'Shodan', time: '2 hours ago' },
];

const attackVectors = [
  { name: 'Phishing', count: 234, percentage: 35 },
  { name: 'Malware', count: 156, percentage: 23 },
  { name: 'Exploitation', count: 98, percentage: 15 },
  { name: 'Brute Force', count: 87, percentage: 13 },
  { name: 'Social Eng.', count: 65, percentage: 10 },
  { name: 'Other', count: 32, percentage: 4 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Operations Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time cybersecurity intelligence overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Global Threat Level:</span>
          <ThreatLevelBadge level="high" size="md" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Threat Alerts"
          value={47}
          icon={<AlertTriangle className="w-6 h-6 text-red-400" />}
          severity="danger"
          trend={{ value: 12, direction: 'up' }}
        />
        <StatCard
          title="New CVEs (24h)"
          value={23}
          icon={<Bug className="w-6 h-6 text-yellow-400" />}
          severity="warning"
        />
        <StatCard
          title="Dark Web Mentions"
          value={156}
          icon={<Globe className="w-6 h-6 text-purple-400" />}
        />
        <StatCard
          title="Assets Monitored"
          value={1247}
          icon={<Shield className="w-6 h-6 text-cyber-accent" />}
          severity="success"
        />
      </div>

      {/* Global Threat Map */}
      <ThreatMap />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Activity Chart */}
        <div className="lg:col-span-2 cyber-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyber-accent" />
            Threat Activity (24h)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={threatActivityData}>
              <defs>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #1f2937',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="threats"
                stroke="#00ff88"
                fillOpacity={1}
                fill="url(#colorThreats)"
              />
              <Area
                type="monotone"
                dataKey="alerts"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorAlerts)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attack Vectors */}
        <div className="cyber-card">
          <h3 className="text-lg font-semibold text-white mb-4">Attack Vectors</h3>
          <div className="space-y-3">
            {attackVectors.map((vector) => (
              <div key={vector.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">{vector.name}</span>
                  <span className="text-white font-medium">{vector.count}</span>
                </div>
                <div className="h-2 bg-cyber-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyber-accent to-cyber-info rounded-full transition-all duration-500"
                    style={{ width: `${vector.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Threats & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Threats */}
        <div className="cyber-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Recent Threat Alerts
          </h3>
          <div className="space-y-3">
            {recentThreats.map((threat) => (
              <div
                key={threat.id}
                className="flex items-center justify-between p-3 bg-cyber-bg rounded-lg border border-cyber-border hover:border-cyber-accent/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <ThreatLevelBadge level={threat.severity} />
                  <div>
                    <p className="text-white text-sm font-medium">{threat.title}</p>
                    <p className="text-gray-500 text-xs">Source: {threat.source}</p>
                  </div>
                </div>
                <span className="text-gray-400 text-xs">{threat.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Live Feed */}
        <div className="cyber-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyber-info" />
            Intelligence Sources Status
          </h3>
          <div className="space-y-3">
            {[
              { name: 'MISP', status: 'online', lastSync: '2 min ago' },
              { name: 'VirusTotal', status: 'online', lastSync: '5 min ago' },
              { name: 'Shodan', status: 'online', lastSync: '10 min ago' },
              { name: 'AlienVault OTX', status: 'online', lastSync: '15 min ago' },
              { name: 'URLhaus', status: 'warning', lastSync: '1 hour ago' },
              { name: 'Have I Been Pwned', status: 'online', lastSync: '30 min ago' },
              { name: 'Elasticsearch SIEM', status: 'online', lastSync: 'Live' },
            ].map((source) => (
              <div
                key={source.name}
                className="flex items-center justify-between p-3 bg-cyber-bg rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`status-${source.status}`} />
                  <span className="text-white text-sm">{source.name}</span>
                </div>
                <span className="text-gray-400 text-xs">{source.lastSync}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
