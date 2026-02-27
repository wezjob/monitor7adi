import { useState } from 'react';
import { Settings as SettingsIcon, Database, Bell, Shield, Key, Globe, Server, Check } from 'lucide-react';

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  icon: typeof Database;
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
}

const defaultIntegrations: IntegrationConfig[] = [
  { id: 'misp', name: 'MISP', description: 'Malware Information Sharing Platform', icon: Shield, enabled: true },
  { id: 'virustotal', name: 'VirusTotal', description: 'File and URL analysis', icon: Database, enabled: true },
  { id: 'shodan', name: 'Shodan', description: 'Internet-wide scanning', icon: Globe, enabled: true },
  { id: 'otx', name: 'AlienVault OTX', description: 'Open Threat Exchange', icon: Shield, enabled: false },
  { id: 'hibp', name: 'Have I Been Pwned', description: 'Data breach checking', icon: Key, enabled: true },
  { id: 'elasticsearch', name: 'Elasticsearch', description: 'SIEM integration', icon: Server, enabled: true, endpoint: 'http://localhost:9200' },
  { id: 'ollama', name: 'Ollama', description: 'Local LLM for AI analysis', icon: Server, enabled: true, endpoint: 'http://localhost:11434' },
];

export function Settings() {
  const [integrations, setIntegrations] = useState(defaultIntegrations);
  const [saved, setSaved] = useState(false);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i)
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-7 h-7 text-gray-400" />
            Settings
          </h1>
          <p className="text-gray-400 mt-1">Configure integrations and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-cyber-accent text-black rounded-lg font-medium hover:bg-cyber-accent/90 transition-colors"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Integrations */}
      <div className="cyber-card">
        <h3 className="text-lg font-semibold text-white mb-4">Threat Intelligence Integrations</h3>
        <div className="space-y-4">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div key={integration.id} className="p-4 bg-cyber-bg rounded-lg border border-cyber-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${integration.enabled ? 'text-cyber-accent' : 'text-gray-500'}`} />
                    <div>
                      <p className="text-white font-medium">{integration.name}</p>
                      <p className="text-xs text-gray-500">{integration.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integration.enabled}
                      onChange={() => toggleIntegration(integration.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-cyber-border rounded-full peer peer-checked:bg-cyber-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                {integration.enabled && (
                  <div className="mt-4 space-y-3">
                    {integration.endpoint && (
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Endpoint URL</label>
                        <input
                          type="text"
                          defaultValue={integration.endpoint}
                          className="w-full px-3 py-2 bg-cyber-card border border-cyber-border rounded-lg text-white text-sm focus:outline-none focus:border-cyber-accent"
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">API Key</label>
                      <input
                        type="password"
                        placeholder="Enter API key..."
                        className="w-full px-3 py-2 bg-cyber-card border border-cyber-border rounded-lg text-white text-sm focus:outline-none focus:border-cyber-accent"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="cyber-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyber-accent" />
          Notification Settings
        </h3>
        <div className="space-y-4">
          {[
            { id: 'critical', label: 'Critical Threat Alerts', description: 'Immediate notification for critical threats', enabled: true },
            { id: 'cve', label: 'New CVE Notifications', description: 'Alert when new CVEs are published', enabled: true },
            { id: 'darkweb', label: 'Dark Web Mentions', description: 'Alert when your assets are mentioned', enabled: true },
            { id: 'leak', label: 'Data Leak Detection', description: 'Alert when data leaks are detected', enabled: true },
            { id: 'scan', label: 'Scan Completion', description: 'Notify when vulnerability scans complete', enabled: false },
          ].map(setting => (
            <div key={setting.id} className="flex items-center justify-between p-3 bg-cyber-bg rounded-lg">
              <div>
                <p className="text-white text-sm">{setting.label}</p>
                <p className="text-xs text-gray-500">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={setting.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-cyber-border rounded-full peer peer-checked:bg-cyber-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Monitored Assets */}
      <div className="cyber-card">
        <h3 className="text-lg font-semibold text-white mb-4">Monitored Domains</h3>
        <div className="space-y-2 mb-4">
          {['example.com', 'api.company.org', 'internal.corp.local'].map(domain => (
            <div key={domain} className="flex items-center justify-between p-3 bg-cyber-bg rounded-lg">
              <span className="font-mono text-white text-sm">{domain}</span>
              <button className="text-xs text-red-400 hover:text-red-300">Remove</button>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Add domain to monitor..."
            className="flex-1 px-3 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-white text-sm focus:outline-none focus:border-cyber-accent"
          />
          <button className="px-4 py-2 bg-cyber-accent text-black rounded-lg text-sm font-medium hover:bg-cyber-accent/90 transition-colors">
            Add
          </button>
        </div>
      </div>

      {/* About */}
      <div className="cyber-card">
        <h3 className="text-lg font-semibold text-white mb-4">About Monitor7adi</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <p><span className="text-white">Version:</span> 1.0.0</p>
          <p><span className="text-white">Build:</span> 2024.02.26</p>
          <p><span className="text-white">License:</span> MIT</p>
          <p className="pt-3 border-t border-cyber-border mt-3">
            Monitor7adi is an open-source cybersecurity OSINT dashboard for threat intelligence, 
            vulnerability scanning, and security monitoring.
          </p>
        </div>
      </div>
    </div>
  );
}
