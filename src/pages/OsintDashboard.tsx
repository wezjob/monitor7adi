import { useState, useCallback } from 'react';
import {
  Search, Shield, AlertTriangle, Globe, Mail, Database,
  ExternalLink, Loader2, CheckCircle, XCircle, AlertCircle,
  Settings, Copy, Check
} from 'lucide-react';
import axios from 'axios';

interface OsintResult {
  query: string;
  type: 'ip' | 'domain' | 'email' | 'hash' | 'username';
  timestamp: string;
  results: {
    source: string;
    category: string;
    data: any;
    severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
    link?: string;
  }[];
  summary: {
    total_sources: number;
    threats_found: number;
    overall_risk: 'critical' | 'high' | 'medium' | 'low' | 'clean';
  };
}

interface ToolStatus {
  name: string;
  key: string;
  configured: boolean;
  category: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff1744',
  high: '#ff9100',
  medium: '#ffc400',
  low: '#64ffda',
  info: '#40c4ff',
  clean: '#00e676',
};

const RISK_LABELS: Record<string, string> = {
  critical: 'CRITIQUE',
  high: 'ÉLEVÉ',
  medium: 'MOYEN',
  low: 'FAIBLE',
  clean: 'PROPRE',
};

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3101'
  : '';

export function OsintDashboard() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OsintResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toolStatus, setToolStatus] = useState<{ tools: ToolStatus[]; summary: any } | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Fetch tool configuration status
  const fetchToolStatus = useCallback(async () => {
    try {
      const resp = await axios.get(`${API_BASE}/api/osint/status`);
      setToolStatus(resp.data);
    } catch {
      setToolStatus(null);
    }
  }, []);

  // Run unified OSINT search
  const runSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await axios.post(`${API_BASE}/api/osint/search`, { query: query.trim() });
      setResult(resp.data);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur lors de la recherche');
    }
    setIsLoading(false);
  }, [query]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-cyan-400" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">OSINT Intelligence</h1>
            <p className="text-sm text-gray-400">
              Recherche unifiée sur 10 outils OSINT intégrés
            </p>
          </div>
        </div>
        <button
          onClick={() => { setShowConfig(!showConfig); if (!toolStatus) fetchToolStatus(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${showConfig ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
        >
          <Settings size={16} />
          Configuration
        </button>
      </div>

      {/* Tool Status Panel */}
      {showConfig && toolStatus && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">État des outils OSINT</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-400">{toolStatus.summary.configured} configurés</span>
              <span className="text-gray-500">|</span>
              <span className="text-red-400">{toolStatus.summary.unconfigured} manquants</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {toolStatus.tools.map(tool => (
              <div
                key={tool.name}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${tool.configured ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}
              >
                {tool.configured ? (
                  <CheckCircle size={14} className="text-green-400" />
                ) : (
                  <XCircle size={14} className="text-red-400" />
                )}
                <div>
                  <div className={tool.configured ? 'text-green-400' : 'text-red-400'}>{tool.name}</div>
                  <div className="text-gray-500">{tool.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher une IP, domaine, email, hash..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-base"
            />
          </div>
          <button
            onClick={runSearch}
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-semibold rounded-xl transition-colors"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Analyser
          </button>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Globe size={12} /> IP/Domaine</span>
          <span className="flex items-center gap-1"><Mail size={12} /> Email</span>
          <span className="flex items-center gap-1"><Database size={12} /> Hash</span>
          <span className="flex items-center gap-1"><AlertTriangle size={12} /> Détection automatique du type</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider"
                  style={{
                    backgroundColor: `${SEVERITY_COLORS[result.summary.overall_risk]}20`,
                    color: SEVERITY_COLORS[result.summary.overall_risk],
                    border: `1px solid ${SEVERITY_COLORS[result.summary.overall_risk]}40`,
                  }}
                >
                  Risque {RISK_LABELS[result.summary.overall_risk]}
                </div>
                <div className="text-sm text-gray-400">
                  Type détecté: <span className="text-white font-medium uppercase">{result.type}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-mono text-white">{result.query}</span>
              <button
                onClick={() => copyToClipboard(result.query, 'query')}
                className="p-1 text-gray-500 hover:text-white transition-colors"
              >
                {copiedItem === 'query' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">{result.summary.total_sources}</div>
                <div className="text-xs text-gray-500">Sources analysées</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{result.summary.threats_found}</div>
                <div className="text-xs text-gray-500">Menaces détectées</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{result.results.length}</div>
                <div className="text-xs text-gray-500">Rapports</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          {result.results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Résultats détaillés</h3>
              {result.results.map((r, idx) => (
                <div key={idx} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">{r.source}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-400">{r.category}</span>
                      {r.severity && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{
                            backgroundColor: `${SEVERITY_COLORS[r.severity]}20`,
                            color: SEVERITY_COLORS[r.severity],
                          }}
                        >
                          {r.severity}
                        </span>
                      )}
                    </div>
                    {r.link && (
                      <a
                        href={r.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        Voir détails <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <pre className="text-xs text-gray-400 bg-gray-800/50 rounded-lg p-3 overflow-x-auto">
                    {JSON.stringify(r.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !isLoading && !error && (
        <div className="text-center py-16">
          <Shield className="mx-auto text-gray-700 mb-4" size={64} />
          <p className="text-gray-400 text-lg">Recherche OSINT unifiée</p>
          <p className="text-gray-600 text-sm mt-2">
            Entrez une IP, un domaine, un email ou un hash pour lancer l'analyse
          </p>
        </div>
      )}
    </div>
  );
}
