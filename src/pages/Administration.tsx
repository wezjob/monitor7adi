import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon, Key, Rss, Bell, Sliders, Check, Loader2,
  Shield, Globe, Database, Server, Bot, Bug, Eye, EyeOff, Zap,
  TestTube, Clock, Plus, Trash2, Save, RefreshCw, AlertTriangle, CheckCircle2
} from 'lucide-react';
import axios from 'axios';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3101'
  : '';

// ─── Types ──────────────────────────────
interface FeedConfig {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  refreshInterval?: number;
  description: string;
  category: string;
  _hasKey?: boolean;
}

interface AppConfig {
  feeds: FeedConfig[];
  notifications: {
    criticalAlerts: boolean;
    newCVEs: boolean;
    darkWebMentions: boolean;
    dataLeaks: boolean;
    scanCompletion: boolean;
    emailNotifications: boolean;
    emailAddress: string;
  };
  general: {
    refreshInterval: number;
    maxReportsPerFeed: number;
    logLevel: string;
    timezone: string;
  };
  monitoredDomains: string[];
}

interface TestResult {
  feedId: string;
  success: boolean;
  message: string;
  latency: number;
  loading: boolean;
}

// ─── Feed icon mapping ──────────────────
const feedIcons: Record<string, typeof Shield> = {
  otx: Shield,
  misp: Shield,
  abuseipdb: Globe,
  urlhaus: Globe,
  'circl-cve': Bug,
  virustotal: Database,
  shodan: Globe,
  hibp: Key,
  elasticsearch: Server,
  ollama: Bot,
};

// ─── Category labels ────────────────────
const categoryLabels: Record<string, string> = {
  'threat-intel': 'Threat Intelligence',
  vulnerability: 'Vulnérabilités',
  siem: 'SIEM / Logs',
  ai: 'Intelligence Artificielle',
  other: 'Autres',
};

type Tab = 'api-keys' | 'feeds' | 'notifications' | 'general';

export function Administration() {
  const [activeTab, setActiveTab] = useState<Tab>('api-keys');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [editedKeys, setEditedKeys] = useState<Record<string, string>>({});
  const [editedEndpoints, setEditedEndpoints] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [newDomain, setNewDomain] = useState('');

  // ─── Load config ──────────────────────
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_BASE}/api/config`, { timeout: 10000 });
      setConfig(resp.data);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Impossible de charger la configuration');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // ─── Save config ──────────────────────
  const saveChanges = async () => {
    if (!config) return;
    setSaving(true);
    try {
      // Merge edited keys into config
      const updatedFeeds = config.feeds.map(f => {
        const updated = { ...f };
        if (editedKeys[f.id] !== undefined) {
          updated.apiKey = editedKeys[f.id];
        }
        if (editedEndpoints[f.id] !== undefined) {
          updated.endpoint = editedEndpoints[f.id];
        }
        return updated;
      });

      await axios.put(`${API_BASE}/api/config`, {
        ...config,
        feeds: updatedFeeds,
      }, { timeout: 10000 });

      setSaved(true);
      setEditedKeys({});
      setEditedEndpoints({});
      setTimeout(() => setSaved(false), 3000);
      loadConfig(); // Reload to get masked keys
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  // ─── Toggle feed ──────────────────────
  const toggleFeed = (id: string) => {
    if (!config) return;
    setConfig({
      ...config,
      feeds: config.feeds.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f),
    });
  };

  // ─── Toggle key visibility ───────────
  const toggleKeyVisibility = (id: string) => {
    const next = new Set(visibleKeys);
    if (next.has(id)) next.delete(id); else next.add(id);
    setVisibleKeys(next);
  };

  // ─── Test feed connection ─────────────
  const testFeed = async (feedId: string) => {
    setTestResults(prev => ({
      ...prev,
      [feedId]: { feedId, success: false, message: 'Testing...', latency: 0, loading: true },
    }));
    try {
      const resp = await axios.post(`${API_BASE}/api/config/test-feed/${feedId}`, {}, { timeout: 15000 });
      setTestResults(prev => ({
        ...prev,
        [feedId]: { ...resp.data, feedId, loading: false },
      }));
    } catch (e: any) {
      setTestResults(prev => ({
        ...prev,
        [feedId]: { feedId, success: false, message: e.message, latency: 0, loading: false },
      }));
    }
  };

  // ─── Update notification ──────────────
  const updateNotification = (key: string, value: boolean | string) => {
    if (!config) return;
    setConfig({
      ...config,
      notifications: { ...config.notifications, [key]: value },
    });
  };

  // ─── Update general ──────────────────
  const updateGeneral = (key: string, value: string | number) => {
    if (!config) return;
    setConfig({
      ...config,
      general: { ...config.general, [key]: value },
    });
  };

  // ─── Add domain ──────────────────────
  const addDomain = () => {
    if (!config || !newDomain.trim()) return;
    if (config.monitoredDomains.includes(newDomain.trim())) return;
    setConfig({
      ...config,
      monitoredDomains: [...config.monitoredDomains, newDomain.trim()],
    });
    setNewDomain('');
  };

  const removeDomain = (domain: string) => {
    if (!config) return;
    setConfig({
      ...config,
      monitoredDomains: config.monitoredDomains.filter(d => d !== domain),
    });
  };

  // ─── Tabs config ──────────────────────
  const tabs: { id: Tab; label: string; icon: typeof Key }[] = [
    { id: 'api-keys', label: 'Clés API', icon: Key },
    { id: 'feeds', label: 'Feeds & Sources', icon: Rss },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'general', label: 'Général', icon: Sliders },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyber-accent animate-spin" />
        <span className="ml-3 text-gray-400">Chargement de la configuration...</span>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="cyber-card text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Configuration non disponible</h3>
        <p className="text-sm text-gray-500 mb-4">{error || 'Le backend API ne répond pas.'}</p>
        <button onClick={loadConfig} className="px-4 py-2 bg-cyber-accent text-black rounded-lg font-medium">
          <RefreshCw className="w-4 h-4 inline mr-2" />Réessayer
        </button>
      </div>
    );
  }

  // Group feeds by category
  const feedsByCategory: Record<string, FeedConfig[]> = {};
  for (const feed of config.feeds) {
    const cat = feed.category || 'other';
    if (!feedsByCategory[cat]) feedsByCategory[cat] = [];
    feedsByCategory[cat].push(feed);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-7 h-7 text-cyber-accent" />
            Administration
          </h1>
          <p className="text-gray-400 mt-1">Configuration des clés API, feeds et paramètres système</p>
        </div>
        <button
          onClick={saveChanges}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-cyber-accent text-black rounded-lg font-medium hover:bg-cyber-accent/90 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Sauvegarder'}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Configuration sauvegardée avec succès. Les feeds actifs utiliseront les nouvelles clés.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-cyber-card border border-cyber-border rounded-lg p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-cyber-accent text-black'
                  : 'text-gray-400 hover:text-white hover:bg-cyber-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════ TAB: API KEYS ═══════ */}
      {activeTab === 'api-keys' && (
        <div className="space-y-6">
          <div className="cyber-card">
            <h3 className="text-lg font-semibold text-white mb-2">Clés API & Endpoints</h3>
            <p className="text-sm text-gray-500 mb-6">
              Configurez vos clés API pour activer les différentes sources de threat intelligence. 
              Les clés sont chiffrées et stockées localement.
            </p>

            {Object.entries(feedsByCategory).map(([category, feeds]) => (
              <div key={category} className="mb-8">
                <h4 className="text-sm font-semibold text-cyber-accent uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {categoryLabels[category] || category}
                </h4>
                <div className="space-y-4">
                  {feeds.map(feed => {
                    const Icon = feedIcons[feed.id] || Shield;
                    const showKey = visibleKeys.has(feed.id);
                    const currentKey = editedKeys[feed.id] !== undefined ? editedKeys[feed.id] : (feed.apiKey || '');
                    const currentEndpoint = editedEndpoints[feed.id] !== undefined ? editedEndpoints[feed.id] : (feed.endpoint || '');
                    const test = testResults[feed.id];
                    const needsKey = !['urlhaus', 'circl-cve'].includes(feed.id);
                    const needsEndpoint = ['misp', 'elasticsearch', 'ollama'].includes(feed.id);

                    return (
                      <div key={feed.id} className="p-4 bg-cyber-bg rounded-lg border border-cyber-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${feed.enabled ? 'bg-cyber-accent/10' : 'bg-gray-700/30'}`}>
                              <Icon className={`w-5 h-5 ${feed.enabled ? 'text-cyber-accent' : 'text-gray-500'}`} />
                            </div>
                            <div>
                              <p className="text-white font-medium">{feed.name}</p>
                              <p className="text-xs text-gray-500">{feed.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* Status badge */}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              feed.enabled
                                ? (feed._hasKey || !needsKey ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30')
                                : 'bg-gray-500/10 text-gray-500 border border-gray-500/30'
                            }`}>
                              {feed.enabled
                                ? (feed._hasKey || !needsKey ? 'Actif' : 'Clé manquante')
                                : 'Désactivé'}
                            </span>
                            {/* Toggle */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={feed.enabled}
                                onChange={() => toggleFeed(feed.id)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-cyber-border rounded-full peer peer-checked:bg-cyber-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                            </label>
                          </div>
                        </div>

                        {feed.enabled && (
                          <div className="mt-4 space-y-3 pl-12">
                            {/* Endpoint */}
                            {needsEndpoint && (
                              <div>
                                <label className="text-xs text-gray-400 mb-1 block font-medium">URL / Endpoint</label>
                                <input
                                  type="text"
                                  value={currentEndpoint}
                                  onChange={e => setEditedEndpoints(prev => ({ ...prev, [feed.id]: e.target.value }))}
                                  placeholder={`https://${feed.id}-instance.example.com`}
                                  className="w-full px-3 py-2 bg-cyber-card border border-cyber-border rounded-lg text-white text-sm focus:outline-none focus:border-cyber-accent font-mono"
                                />
                              </div>
                            )}

                            {/* API Key */}
                            {needsKey && (
                              <div>
                                <label className="text-xs text-gray-400 mb-1 block font-medium">Clé API</label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type={showKey ? 'text' : 'password'}
                                      value={currentKey}
                                      onChange={e => setEditedKeys(prev => ({ ...prev, [feed.id]: e.target.value }))}
                                      placeholder="Entrez votre clé API..."
                                      className="w-full px-3 py-2 pr-10 bg-cyber-card border border-cyber-border rounded-lg text-white text-sm focus:outline-none focus:border-cyber-accent font-mono"
                                    />
                                    <button
                                      onClick={() => toggleKeyVisibility(feed.id)}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-cyber-border rounded"
                                    >
                                      {showKey ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => testFeed(feed.id)}
                                    disabled={test?.loading}
                                    className="px-3 py-2 bg-cyber-card border border-cyber-border rounded-lg text-sm text-gray-300 hover:text-white hover:border-cyber-accent transition-colors flex items-center gap-1"
                                  >
                                    {test?.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                                    Test
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* No key needed indicator */}
                            {!needsKey && (
                              <div className="flex items-center gap-2 text-xs text-green-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Aucune clé API requise — accès public
                                <button
                                  onClick={() => testFeed(feed.id)}
                                  disabled={test?.loading}
                                  className="ml-auto px-3 py-1.5 bg-cyber-card border border-cyber-border rounded text-sm text-gray-300 hover:text-white hover:border-cyber-accent transition-colors flex items-center gap-1"
                                >
                                  {test?.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube className="w-3.5 h-3.5" />}
                                  Test
                                </button>
                              </div>
                            )}

                            {/* Test result */}
                            {test && !test.loading && (
                              <div className={`flex items-center gap-2 text-xs p-2 rounded ${
                                test.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {test.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                {test.message}
                                {test.latency > 0 && <span className="ml-auto text-gray-500">{test.latency}ms</span>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ TAB: FEEDS ═══════ */}
      {activeTab === 'feeds' && (
        <div className="space-y-6">
          <div className="cyber-card">
            <h3 className="text-lg font-semibold text-white mb-2">Activation & Fréquence des Feeds</h3>
            <p className="text-sm text-gray-500 mb-6">
              Activez ou désactivez chaque source et définissez l'intervalle de rafraîchissement.
            </p>

            <div className="overflow-hidden rounded-lg border border-cyber-border">
              <table className="w-full">
                <thead className="bg-cyber-bg">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Catégorie</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Statut</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Rafraîchissement</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Activer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border">
                  {config.feeds.map(feed => {
                    const Icon = feedIcons[feed.id] || Shield;
                    const needsKey = !['urlhaus', 'circl-cve'].includes(feed.id);
                    return (
                      <tr key={feed.id} className="hover:bg-cyber-bg/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${feed.enabled ? 'text-cyber-accent' : 'text-gray-500'}`} />
                            <div>
                              <p className="text-white text-sm font-medium">{feed.name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-xs">{feed.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-400">{categoryLabels[feed.category] || feed.category}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                            !feed.enabled
                              ? 'bg-gray-500/10 text-gray-500'
                              : (feed._hasKey || !needsKey)
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {!feed.enabled ? 'Off' : (feed._hasKey || !needsKey) ? 'Ready' : 'No Key'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            <select
                              value={feed.refreshInterval || 5}
                              onChange={e => {
                                setConfig({
                                  ...config,
                                  feeds: config.feeds.map(f =>
                                    f.id === feed.id ? { ...f, refreshInterval: parseInt(e.target.value) } : f
                                  ),
                                });
                              }}
                              className="bg-cyber-bg border border-cyber-border rounded px-2 py-1 text-xs text-white"
                            >
                              <option value="1">1 min</option>
                              <option value="5">5 min</option>
                              <option value="10">10 min</option>
                              <option value="15">15 min</option>
                              <option value="30">30 min</option>
                              <option value="60">1h</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={feed.enabled}
                              onChange={() => toggleFeed(feed.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-cyber-border rounded-full peer peer-checked:bg-cyber-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ TAB: NOTIFICATIONS ═══════ */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="cyber-card">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyber-accent" />
              Alertes & Notifications
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Choisissez quels types d'alertes doivent déclencher des notifications.
            </p>

            <div className="space-y-3">
              {[
                { key: 'criticalAlerts', label: 'Alertes critiques', desc: 'Notification immédiate pour les menaces critiques (APT, zero-day)', icon: AlertTriangle },
                { key: 'newCVEs', label: 'Nouvelles CVE', desc: 'Alerte à la publication de nouvelles vulnérabilités CVE', icon: Bug },
                { key: 'darkWebMentions', label: 'Mentions Dark Web', desc: 'Alerte quand vos assets sont mentionnés sur le dark web', icon: Globe },
                { key: 'dataLeaks', label: 'Fuites de données', desc: 'Alerte à la détection de fuites de données', icon: Database },
                { key: 'scanCompletion', label: 'Fin de scan', desc: 'Notification à la fin des scans de vulnérabilités', icon: CheckCircle2 },
              ].map(item => {
                const Icon = item.icon;
                const checked = config.notifications[item.key as keyof typeof config.notifications] as boolean;
                return (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-cyber-bg rounded-lg border border-cyber-border">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${checked ? 'text-cyber-accent' : 'text-gray-500'}`} />
                      <div>
                        <p className="text-white text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => updateNotification(item.key, !checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-cyber-border rounded-full peer peer-checked:bg-cyber-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Email notifications */}
            <div className="mt-6 p-4 bg-cyber-bg rounded-lg border border-cyber-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white text-sm font-medium">Notifications par email</p>
                  <p className="text-xs text-gray-500">Recevoir les alertes par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notifications.emailNotifications}
                    onChange={() => updateNotification('emailNotifications', !config.notifications.emailNotifications)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-cyber-border rounded-full peer peer-checked:bg-cyber-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>
              {config.notifications.emailNotifications && (
                <input
                  type="email"
                  value={config.notifications.emailAddress}
                  onChange={e => updateNotification('emailAddress', e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 bg-cyber-card border border-cyber-border rounded-lg text-white text-sm focus:outline-none focus:border-cyber-accent"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ TAB: GENERAL ═══════ */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Refresh & Limits */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyber-accent" />
              Paramètres Généraux
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Configurez les paramètres globaux de l'application.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Intervalle de rafraîchissement global</label>
                <select
                  value={config.general.refreshInterval}
                  onChange={e => updateGeneral('refreshInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-white text-sm"
                >
                  <option value="1">1 minute</option>
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 heure</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Max rapports par source</label>
                <select
                  value={config.general.maxReportsPerFeed}
                  onChange={e => updateGeneral('maxReportsPerFeed', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-white text-sm"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Niveau de log</label>
                <select
                  value={config.general.logLevel}
                  onChange={e => updateGeneral('logLevel', e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-white text-sm"
                >
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Fuseau horaire</label>
                <select
                  value={config.general.timezone}
                  onChange={e => updateGeneral('timezone', e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-white text-sm"
                >
                  <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
                  <option value="Europe/Paris">Europe/Paris (CET)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>

          {/* Monitored Domains */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold text-white mb-4">Domaines surveillés</h3>
            <div className="space-y-2 mb-4">
              {config.monitoredDomains.length === 0 && (
                <p className="text-sm text-gray-500 py-4 text-center">Aucun domaine surveillé. Ajoutez-en un ci-dessous.</p>
              )}
              {config.monitoredDomains.map(domain => (
                <div key={domain} className="flex items-center justify-between p-3 bg-cyber-bg rounded-lg border border-cyber-border">
                  <span className="font-mono text-white text-sm">{domain}</span>
                  <button
                    onClick={() => removeDomain(domain)}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addDomain()}
                placeholder="Ajouter un domaine (ex: example.com)..."
                className="flex-1 px-3 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-white text-sm focus:outline-none focus:border-cyber-accent"
              />
              <button
                onClick={addDomain}
                disabled={!newDomain.trim()}
                className="px-4 py-2 bg-cyber-accent text-black rounded-lg text-sm font-medium hover:bg-cyber-accent/90 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>
          </div>

          {/* About */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold text-white mb-4">À propos de Monitor7adi</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p><span className="text-white">Version:</span> 1.0.0</p>
              <p><span className="text-white">Build:</span> 2026.03.03</p>
              <p><span className="text-white">License:</span> MIT</p>
              <p className="pt-3 border-t border-cyber-border mt-3">
                Monitor7adi est un dashboard OSINT de cybersécurité pour la threat intelligence,
                le scan de vulnérabilités et la surveillance de sécurité.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
