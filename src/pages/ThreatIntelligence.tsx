import { useState, useCallback } from 'react';
import { Shield, Search, RefreshCw, ExternalLink, Link2, Loader2, Globe, AlertTriangle, Clock, Copy, Check } from 'lucide-react';
import { ThreatLevelBadge } from '../components/ThreatLevelBadge';
import type { ThreatIntel, IOC } from '../types';
import axios from 'axios';

// URL Search result interface
interface URLSearchResult {
  id: string;
  url: string;
  domain: string;
  source: string;
  threatType: 'phishing' | 'malware' | 'c2' | 'scam' | 'suspicious';
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  tags: string[];
  description: string;
}

// Mock data
const mockThreats: ThreatIntel[] = [
  {
    id: '1',
    type: 'apt',
    severity: 'critical',
    title: 'APT29 (Cozy Bear) - New Campaign Targeting Government Sectors',
    description: 'Russian state-sponsored threat actor APT29 has been observed conducting a sophisticated spear-phishing campaign targeting government and diplomatic entities.',
    indicators: ['185.215.113.67', 'update-service.com', 'a3b4c5d6e7f8...'],
    source: 'MISP',
    timestamp: '2024-02-26T10:30:00Z',
    tags: ['APT', 'Russia', 'Spear-Phishing', 'Government'],
    ttps: ['T1566.001', 'T1059.001', 'T1027'],
  },
  {
    id: '2',
    type: 'malware',
    severity: 'high',
    title: 'LockBit 3.0 Ransomware - New Variant Detected',
    description: 'A new variant of LockBit 3.0 ransomware has been identified with improved evasion techniques and faster encryption capabilities.',
    indicators: ['bc45f23a...', 'lockbit-decryptor[.]onion'],
    source: 'VirusTotal',
    timestamp: '2024-02-26T09:15:00Z',
    tags: ['Ransomware', 'LockBit', 'Encryption'],
    ttps: ['T1486', 'T1490', 'T1489'],
  },
  {
    id: '3',
    type: 'vulnerability',
    severity: 'critical',
    title: 'CVE-2024-21762 - FortiOS Out-of-bound Write',
    description: 'Critical vulnerability in FortiOS SSL VPN allowing unauthenticated remote code execution. Actively exploited in the wild.',
    indicators: [],
    source: 'NVD',
    timestamp: '2024-02-26T08:00:00Z',
    tags: ['Fortinet', 'VPN', 'RCE', '0-day'],
  },
  {
    id: '4',
    type: 'campaign',
    severity: 'high',
    title: 'PhaaS Operation "Tycoon" - Business Email Compromise',
    description: 'Large-scale Phishing-as-a-Service operation targeting Microsoft 365 credentials across multiple industries.',
    indicators: ['login-microsoft365[.]net', 'secure-outlook[.]com'],
    source: 'URLhaus',
    timestamp: '2024-02-26T07:45:00Z',
    tags: ['Phishing', 'BEC', 'Microsoft 365', 'Credential Theft'],
  },
];

const mockIOCs: IOC[] = [
  { id: '1', type: 'ip', value: '185.215.113.67', confidence: 95, firstSeen: '2024-02-20', lastSeen: '2024-02-26', malwareFamily: 'Cobalt Strike', tags: ['C2', 'APT29'] },
  { id: '2', type: 'domain', value: 'update-service.com', confidence: 90, firstSeen: '2024-02-22', lastSeen: '2024-02-26', tags: ['Phishing', 'APT'] },
  { id: '3', type: 'hash', value: 'bc45f23a8d912c45e6789b123456789abcdef01234567890abcdef', confidence: 100, firstSeen: '2024-02-25', lastSeen: '2024-02-26', malwareFamily: 'LockBit 3.0', tags: ['Ransomware'] },
  { id: '4', type: 'url', value: 'https://login-microsoft365.net/oauth/token', confidence: 85, firstSeen: '2024-02-24', lastSeen: '2024-02-26', tags: ['Phishing', 'BEC'] },
  { id: '5', type: 'ip', value: '103.224.182.251', confidence: 80, firstSeen: '2024-02-23', lastSeen: '2024-02-25', malwareFamily: 'QakBot', tags: ['Botnet', 'Banking'] },
];

export function ThreatIntelligence() {
  const [activeTab, setActiveTab] = useState<'threats' | 'iocs' | 'urlsearch'>('threats');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  
  // URL Search state
  const [urlKeyword, setUrlKeyword] = useState('');
  const [urlResults, setUrlResults] = useState<URLSearchResult[]>([]);
  const [isSearchingUrls, setIsSearchingUrls] = useState(false);
  const [urlSearchLogs, setUrlSearchLogs] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  }, []);

  // API base URL for backend
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3201'
    : '';

  // Perform URL search via real APIs
  const performUrlSearch = useCallback(async () => {
    if (!urlKeyword.trim()) return;
    setIsSearchingUrls(true);
    setUrlResults([]);
    setUrlSearchLogs([]);
    const addLog = (log: string) => setUrlSearchLogs(prev => [...prev, log]);
    addLog(`Recherche mondiale URLs contenant : "${urlKeyword}"`);
    addLog('Interrogation de 8 sources : crt.sh, urlscan.io, HackerTarget, Wayback Machine, AlienVault OTX, CommonCrawl, Shodan, Censys...');
    try {
      const resp = await axios.get(`${API_BASE}/api/threat-intel/urlsearch?keyword=${encodeURIComponent(urlKeyword)}`, { timeout: 90000 });
      if (resp.data && Array.isArray(resp.data.results) && resp.data.results.length > 0) {
        const bySource: Record<string, number> = {};
        resp.data.results.forEach((r: any) => { bySource[r.source] = (bySource[r.source] || 0) + 1; });
        for (const [src, count] of Object.entries(bySource)) {
          addLog(`  ${src}: ${count} URLs`);
        }
        setUrlResults(resp.data.results.map((r: any, i: number) => ({
          id: `url-${i}`,
          url: r.url,
          domain: r.domain,
          source: r.source,
          threatType: 'suspicious' as const,
          confidence: 80,
          firstSeen: '',
          lastSeen: '',
          tags: r.info ? [r.info] : [],
          description: `URL contenant "${urlKeyword}" via ${r.source}`,
        })));
        addLog(`Recherche terminee : ${resp.data.count} URLs au total`);
      } else {
        addLog('Aucun resultat trouve pour ce mot-cle.');
      }
      if (resp.data?.errors) {
        for (const err of resp.data.errors) { addLog(`Warning: ${err}`); }
      }
    } catch (e: any) {
      const msg = e.response?.data?.error || e.message || 'Erreur inconnue';
      addLog(`Erreur: ${msg}`);
      addLog('Verifiez que API backend est demarree (port 3201).');
    }
    setIsSearchingUrls(false);
  }, [urlKeyword, API_BASE]);

  const filteredThreats = mockThreats.filter(threat => {
    const matchesSearch = threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         threat.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || threat.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-cyber-accent" />
            Threat Intelligence
          </h1>
          <p className="text-gray-400 mt-1">Real-time threat feeds from multiple sources</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyber-accent text-black rounded-lg font-medium hover:bg-cyber-accent/90 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Sync Feeds
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-cyber-border">
        <button
          onClick={() => setActiveTab('threats')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'threats'
              ? 'text-cyber-accent border-b-2 border-cyber-accent'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Threat Reports ({mockThreats.length})
        </button>
        <button
          onClick={() => setActiveTab('iocs')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'iocs'
              ? 'text-cyber-accent border-b-2 border-cyber-accent'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          IOCs ({mockIOCs.length})
        </button>
        <button
          onClick={() => setActiveTab('urlsearch')}
          className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'urlsearch'
              ? 'text-cyber-accent border-b-2 border-cyber-accent'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Link2 className="w-4 h-4" />
          URL Search
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search threats, IOCs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-accent"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-sm text-white focus:outline-none focus:border-cyber-accent"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Content */}
      {activeTab === 'threats' && (
        <div className="space-y-4">
          {filteredThreats.map((threat) => (
            <div key={threat.id} className="cyber-card hover:border-cyber-accent/30 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ThreatLevelBadge level={threat.severity} />
                  <span className="text-xs text-gray-500 uppercase px-2 py-0.5 bg-cyber-bg rounded">
                    {threat.type}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(threat.timestamp).toLocaleString()}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{threat.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{threat.description}</p>
              
              {threat.indicators.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Indicators:</p>
                  <div className="flex flex-wrap gap-2">
                    {threat.indicators.slice(0, 3).map((ioc, idx) => (
                      <span key={idx} className="px-2 py-1 bg-cyber-bg text-xs text-cyber-info font-mono rounded">
                        {ioc}
                      </span>
                    ))}
                    {threat.indicators.length > 3 && (
                      <span className="px-2 py-1 bg-cyber-bg text-xs text-gray-500 rounded">
                        +{threat.indicators.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {threat.ttps && threat.ttps.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">MITRE ATT&CK TTPs:</p>
                  <div className="flex flex-wrap gap-2">
                    {threat.ttps.map((ttp) => (
                      <span key={ttp} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                        {ttp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-cyber-border">
                <div className="flex flex-wrap gap-2">
                  {threat.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-cyber-bg text-xs text-gray-400 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-cyber-accent flex items-center gap-1">
                  Source: {threat.source}
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'iocs' && (
        <div className="cyber-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-cyber-bg">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Malware</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Seen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              {mockIOCs.map((ioc) => (
                <tr key={ioc.id} className="hover:bg-cyber-bg/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded uppercase font-medium ${
                      ioc.type === 'ip' ? 'bg-blue-500/20 text-blue-400' :
                      ioc.type === 'domain' ? 'bg-green-500/20 text-green-400' :
                      ioc.type === 'hash' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {ioc.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-white truncate max-w-xs">
                    {ioc.value}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-cyber-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            ioc.confidence >= 90 ? 'bg-green-500' :
                            ioc.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${ioc.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{ioc.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {ioc.malwareFamily || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {ioc.lastSeen}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {ioc.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-cyber-bg text-xs text-gray-400 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* URL Search Tab Content */}
      {activeTab === 'urlsearch' && (
        <div className="space-y-6">
          {/* Search Input */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-cyber-accent" />
              Search Malicious URLs by Keyword
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Search across threat intelligence feeds to find URLs containing your keyword. 
              Useful for brand monitoring, phishing detection, and threat hunting.
            </p>
            
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter keyword (e.g., microsoft, paypal, amazon...)"
                  value={urlKeyword}
                  onChange={(e) => setUrlKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && performUrlSearch()}
                  className="w-full pl-10 pr-4 py-3 bg-cyber-bg border border-cyber-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-accent"
                />
              </div>
              <button
                onClick={performUrlSearch}
                disabled={isSearchingUrls || !urlKeyword.trim()}
                className="px-6 py-3 bg-cyber-accent text-black rounded-lg font-medium hover:bg-cyber-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearchingUrls ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search URLs
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Logs */}
          {urlSearchLogs.length > 0 && (
            <div className="cyber-card">
              <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Search Progress
              </h4>
              <div className="bg-black/50 rounded-lg p-4 max-h-40 overflow-y-auto font-mono text-xs space-y-1">
                {urlSearchLogs.map((log, idx) => (
                  <div key={idx} className="text-gray-300">{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {urlResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Found {urlResults.length} Malicious URLs
                </h3>
                <span className="text-xs text-gray-500">
                  Matching keyword: "{urlKeyword}"
                </span>
              </div>

              <div className="space-y-3">
                {urlResults.map((result) => (
                  <div key={result.id} className="cyber-card hover:border-cyber-accent/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded uppercase font-medium ${
                          result.threatType === 'phishing' ? 'bg-orange-500/20 text-orange-400' :
                          result.threatType === 'malware' ? 'bg-red-500/20 text-red-400' :
                          result.threatType === 'c2' ? 'bg-purple-500/20 text-purple-400' :
                          result.threatType === 'scam' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {result.threatType}
                        </span>
                        <span className="text-xs text-gray-500">
                          {result.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-1.5 bg-cyber-bg rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                result.confidence >= 90 ? 'bg-red-500' :
                                result.confidence >= 80 ? 'bg-orange-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${result.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{result.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <code className="flex-1 text-sm text-red-400 font-mono bg-black/50 px-3 py-2 rounded border border-red-500/20 break-all">
                        {result.url}
                      </code>
                      <button
                        onClick={() => copyToClipboard(result.url, result.id)}
                        className="p-2 hover:bg-cyber-bg rounded transition-colors"
                        title="Copy URL"
                      >
                        {copiedUrl === result.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <p className="text-sm text-gray-400 mb-3">{result.description}</p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">
                          Domain: <span className="text-white font-mono">{result.domain}</span>
                        </span>
                        <span className="text-gray-500">
                          First seen: <span className="text-gray-300">{result.firstSeen}</span>
                        </span>
                        <span className="text-gray-500">
                          Last seen: <span className="text-gray-300">{result.lastSeen}</span>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {result.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-cyber-bg text-gray-400 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isSearchingUrls && urlResults.length === 0 && urlSearchLogs.length === 0 && (
            <div className="cyber-card text-center py-12">
              <Link2 className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Search for Malicious URLs</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Enter a keyword to search across URLhaus, PhishTank, OpenPhish, and other threat intelligence feeds.
                Find phishing sites, malware delivery URLs, and brand impersonation attempts.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
