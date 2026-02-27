import { useState } from 'react';
import { Network, Globe, Server, Shield, AlertTriangle, Search, Plus, Trash2 } from 'lucide-react';
import type { Asset } from '../types';

const mockAssets: Asset[] = [
  { id: '1', type: 'domain', value: 'example.com', status: 'active', lastSeen: '2024-02-26', technologies: ['Nginx', 'React', 'Node.js'], riskScore: 25 },
  { id: '2', type: 'subdomain', value: 'api.example.com', status: 'vulnerable', lastSeen: '2024-02-26', technologies: ['Express', 'MongoDB'], vulnerabilities: ['CVE-2024-1234'], riskScore: 75 },
  { id: '3', type: 'subdomain', value: 'admin.example.com', status: 'active', lastSeen: '2024-02-25', technologies: ['Apache', 'PHP'], riskScore: 45 },
  { id: '4', type: 'ip', value: '203.0.113.50', status: 'active', lastSeen: '2024-02-26', technologies: ['Ubuntu', 'Docker'], riskScore: 30 },
  { id: '5', type: 'subdomain', value: 'staging.example.com', status: 'vulnerable', lastSeen: '2024-02-24', vulnerabilities: ['Exposed Debug', 'Weak Auth'], riskScore: 85 },
  { id: '6', type: 'port', value: '203.0.113.50:8080', status: 'active', lastSeen: '2024-02-26', technologies: ['Jenkins'], riskScore: 60 },
  { id: '7', type: 'subdomain', value: 'dev.example.com', status: 'inactive', lastSeen: '2024-02-10', riskScore: 20 },
  { id: '8', type: 'ip', value: '203.0.113.51', status: 'active', lastSeen: '2024-02-26', technologies: ['Windows Server', 'IIS'], riskScore: 40 },
];

const discoveredSubdomains = [
  'mail.example.com',
  'vpn.example.com',
  'gitlab.example.com',
  'jira.example.com',
  'confluence.example.com',
];

export function AttackSurface() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [newDomain, setNewDomain] = useState('');

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Active</span>;
      case 'vulnerable':
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Vulnerable</span>;
      case 'inactive':
        return <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded">Inactive</span>;
      default:
        return null;
    }
  };

  const filteredAssets = mockAssets.filter(asset =>
    asset.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Network className="w-7 h-7 text-cyber-info" />
            Attack Surface Mapping
          </h1>
          <p className="text-gray-400 mt-1">Discover and monitor your external attack surface</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cyber-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Assets</p>
              <p className="text-2xl font-bold text-white">{mockAssets.length}</p>
            </div>
            <Globe className="w-8 h-8 text-cyber-info" />
          </div>
        </div>
        <div className="cyber-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Vulnerable</p>
              <p className="text-2xl font-bold text-red-400">
                {mockAssets.filter(a => a.status === 'vulnerable').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="cyber-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Subdomains</p>
              <p className="text-2xl font-bold text-white">
                {mockAssets.filter(a => a.type === 'subdomain').length}
              </p>
            </div>
            <Server className="w-8 h-8 text-cyber-accent" />
          </div>
        </div>
        <div className="cyber-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Risk Score</p>
              <p className="text-2xl font-bold text-yellow-400">
                {Math.round(mockAssets.reduce((a, b) => a + b.riskScore, 0) / mockAssets.length)}
              </p>
            </div>
            <Shield className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Add Domain */}
      <div className="cyber-card">
        <h3 className="text-lg font-semibold text-white mb-4">Add Domain to Monitor</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter root domain (e.g., example.com)"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="flex-1 px-4 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-accent"
          />
          <button className="flex items-center gap-2 px-6 py-2 bg-cyber-accent text-black rounded-lg font-medium hover:bg-cyber-accent/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Domain
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset List */}
        <div className="lg:col-span-2">
          <div className="cyber-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Discovered Assets</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-accent"
                />
              </div>
            </div>

            <div className="overflow-hidden border border-cyber-border rounded-lg">
              <table className="w-full">
                <thead className="bg-cyber-bg">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Asset</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Risk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border">
                  {filteredAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`hover:bg-cyber-bg/50 cursor-pointer transition-colors ${
                        selectedAsset?.id === asset.id ? 'bg-cyber-bg/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-white text-sm">
                        {asset.value}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400 uppercase">{asset.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(asset.status)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${getRiskColor(asset.riskScore)}`}>
                          {asset.riskScore}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Asset Details / Recent Discoveries */}
        <div className="space-y-6">
          {selectedAsset ? (
            <div className="cyber-card">
              <h3 className="text-lg font-semibold text-white mb-4">Asset Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Value</p>
                  <p className="font-mono text-white">{selectedAsset.value}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  {getStatusBadge(selectedAsset.status)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-cyber-bg rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          selectedAsset.riskScore >= 70 ? 'bg-red-500' :
                          selectedAsset.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${selectedAsset.riskScore}%` }}
                      />
                    </div>
                    <span className={`font-bold ${getRiskColor(selectedAsset.riskScore)}`}>
                      {selectedAsset.riskScore}
                    </span>
                  </div>
                </div>
                {selectedAsset.technologies && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Technologies Detected</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAsset.technologies.map(tech => (
                        <span key={tech} className="px-2 py-1 bg-cyber-bg text-xs text-cyber-info rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedAsset.vulnerabilities && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Vulnerabilities</p>
                    <div className="space-y-2">
                      {selectedAsset.vulnerabilities.map(vuln => (
                        <div key={vuln} className="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                          {vuln}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="cyber-card">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Discoveries</h3>
              <div className="space-y-2">
                {discoveredSubdomains.map(subdomain => (
                  <div key={subdomain} className="flex items-center justify-between p-2 bg-cyber-bg rounded-lg">
                    <span className="font-mono text-sm text-white">{subdomain}</span>
                    <span className="text-xs text-cyber-accent">New</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
