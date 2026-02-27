import { useState, useCallback, useEffect } from 'react';
import { Database, Search, AlertTriangle, Shield, Download, Mail, Key, CreditCard, FileText, Clock, CheckCircle, RefreshCw, Globe, Phone, User, MapPin, Hash } from 'lucide-react';
import { ThreatLevelBadge } from '../components/ThreatLevelBadge';
import type { DataLeak } from '../types';

// Breach databases for simulation
const BREACH_DATABASES = [
  { name: 'LinkedIn 2024', recordCount: 700000000, year: 2024, exposedData: ['Email', 'Name', 'Job Title', 'Company'] },
  { name: 'Facebook 2024', recordCount: 533000000, year: 2024, exposedData: ['Email', 'Phone', 'Name', 'Location'] },
  { name: 'Twitter / X Data', recordCount: 200000000, year: 2023, exposedData: ['Email', 'Username', 'Phone'] },
  { name: 'Adobe 2023', recordCount: 153000000, year: 2023, exposedData: ['Email', 'Password Hash', 'Username'] },
  { name: 'Canva Breach', recordCount: 137000000, year: 2023, exposedData: ['Email', 'Name', 'Password Hash'] },
  { name: 'Dropbox 2024', recordCount: 68000000, year: 2024, exposedData: ['Email', 'Password Hash'] },
  { name: 'Collection #1', recordCount: 773000000, year: 2019, exposedData: ['Email', 'Password'] },
  { name: 'Deezer', recordCount: 229000000, year: 2023, exposedData: ['Email', 'Name', 'IP Address'] },
  { name: 'Zynga', recordCount: 173000000, year: 2022, exposedData: ['Email', 'Password Hash', 'Username'] },
  { name: 'MGM Hotels 2024', recordCount: 142000000, year: 2024, exposedData: ['Email', 'Name', 'Address', 'Phone', 'DOB'] },
  { name: 'AT&T Customer Data', recordCount: 73000000, year: 2024, exposedData: ['SSN', 'Phone', 'Account PIN'] },
  { name: 'Ticketmaster 2024', recordCount: 560000000, year: 2024, exposedData: ['Email', 'Name', 'Credit Card', 'Address'] },
];

interface SearchResult {
  id: string;
  query: string;
  type: 'email' | 'domain' | 'phone';
  status: 'searching' | 'completed' | 'safe' | 'exposed';
  progress: number;
  breachCount: number;
  breaches: Array<{
    name: string;
    date: string;
    exposedData: string[];
    recordCount: number;
  }>;
  searchTime: string;
}

const mockLeaks: DataLeak[] = [
  {
    id: '1',
    name: 'Ticketmaster Global Breach 2024',
    description: 'Massive breach affecting global ticketing platform with payment data exposed',
    recordCount: 560000000,
    exposedData: ['Email', 'Name', 'Credit Card', 'Address', 'Phone'],
    dateDiscovered: '2024-02-25',
    source: 'ShinyHunters Telegram',
    severity: 'critical',
  },
  {
    id: '2',
    name: 'AT&T Customer Database',
    description: 'Leaked SSNs and account PINs from major telecom provider',
    recordCount: 73000000,
    exposedData: ['SSN', 'Phone', 'Account PIN', 'Name', 'Address'],
    dateDiscovered: '2024-02-24',
    source: 'Dark Web Forum',
    severity: 'critical',
  },
  {
    id: '3',
    name: 'MGM Hotels Guest Records',
    description: 'Hotel guest data including reservation and personal information',
    recordCount: 142000000,
    exposedData: ['Email', 'Name', 'Address', 'Phone', 'DOB', 'Loyalty Points'],
    dateDiscovered: '2024-02-23',
    source: 'Breach Forums',
    severity: 'high',
  },
  {
    id: '4',
    name: 'GitHub Enterprise Tokens',
    description: 'Exposed GitHub tokens and API keys from enterprise accounts',
    recordCount: 120000,
    exposedData: ['API Keys', 'Tokens', 'Repository Access'],
    dateDiscovered: '2024-02-22',
    source: 'Security Researcher',
    severity: 'high',
  },
  {
    id: '5',
    name: 'Healthcare Provider Network',
    description: 'Patient medical records from healthcare consortium breach',
    recordCount: 12500000,
    exposedData: ['Email', 'Name', 'SSN', 'Medical Records', 'Insurance Info'],
    dateDiscovered: '2024-02-21',
    source: 'CISA Alert',
    severity: 'critical',
  },
];

const dataTypeIcons: Record<string, typeof Mail> = {
  'Email': Mail,
  'Password Hash': Key,
  'Password': Key,
  'SSN': FileText,
  'Credit Card': CreditCard,
  'Name': User,
  'Phone': Phone,
  'Address': MapPin,
  'Location': Globe,
  'Username': User,
  'API Keys': Hash,
  'Tokens': Key,
};

export function DataLeaks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'domain' | 'phone'>('email');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [searchLogs, setSearchLogs] = useState<string[]>([]);

  // Generate simulated breach results
  const generateBreaches = useCallback((query: string, _type: string): SearchResult['breaches'] => {
    // Simulate different hit rates based on input
    const hitChance = query.includes('@gmail.com') || query.includes('@yahoo.com') ? 0.8 :
                      query.includes('.com') ? 0.6 : 0.4;
    
    if (Math.random() > hitChance) return [];

    const numBreaches = Math.floor(Math.random() * 5) + 1;
    const shuffled = [...BREACH_DATABASES].sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, numBreaches).map(db => ({
      name: db.name,
      date: `${db.year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      exposedData: db.exposedData.slice(0, Math.floor(Math.random() * db.exposedData.length) + 2),
      recordCount: db.recordCount,
    }));
  }, []);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    const newSearch: SearchResult = {
      id: `search-${Date.now()}`,
      query: searchQuery.trim(),
      type: searchType,
      status: 'searching',
      progress: 0,
      breachCount: 0,
      breaches: [],
      searchTime: new Date().toISOString(),
    };

    setSearchResults(prev => [newSearch, ...prev]);
    setSelectedResult(newSearch);
    setSearchQuery('');
    setSearchLogs([`[${new Date().toLocaleTimeString()}] Starting search for ${searchType}: ${searchQuery}...`]);
  }, [searchQuery, searchType]);

  // Update searching results
  useEffect(() => {
    const interval = setInterval(() => {
      setSearchResults(prevResults => {
        return prevResults.map(result => {
          if (result.status !== 'searching') return result;

          const newProgress = Math.min(result.progress + Math.floor(Math.random() * 25) + 10, 100);

          // Add log messages
          const logMessages = [
            `[${new Date().toLocaleTimeString()}] Checking breach database: ${BREACH_DATABASES[Math.floor(Math.random() * BREACH_DATABASES.length)].name}...`,
            `[${new Date().toLocaleTimeString()}] Scanning dark web sources...`,
            `[${new Date().toLocaleTimeString()}] Querying Have I Been Pwned API...`,
            `[${new Date().toLocaleTimeString()}] Checking paste sites...`,
            `[${new Date().toLocaleTimeString()}] Analyzing credential dumps...`,
            `[${new Date().toLocaleTimeString()}] Cross-referencing leaked databases...`,
          ];
          setSearchLogs(prev => [...prev.slice(-15), logMessages[Math.floor(Math.random() * logMessages.length)]]);

          if (newProgress >= 100) {
            const breaches = generateBreaches(result.query, result.type);
            const completedResult: SearchResult = {
              ...result,
              status: breaches.length > 0 ? 'exposed' : 'safe',
              progress: 100,
              breachCount: breaches.length,
              breaches,
            };

            setSearchLogs(prev => [
              ...prev,
              breaches.length > 0 
                ? `[${new Date().toLocaleTimeString()}] ⚠️ Found ${breaches.length} breaches containing this ${result.type}!`
                : `[${new Date().toLocaleTimeString()}] ✓ No breaches found! ${result.type} appears safe.`
            ]);

            setSelectedResult(current => current?.id === result.id ? completedResult : current);
            return completedResult;
          }

          const updatedResult = { ...result, progress: newProgress };
          setSelectedResult(current => current?.id === result.id ? updatedResult : current);
          return updatedResult;
        });
      });
    }, 600);

    return () => clearInterval(interval);
  }, [generateBreaches]);

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-7 h-7 text-red-400" />
            Data Leak Checker
          </h1>
          <p className="text-gray-400 mt-1">Check if your data has been exposed in known breaches</p>
        </div>
      </div>

      {/* Search */}
      <div className="cyber-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-cyber-accent" />
          Check Your Exposure
        </h3>
        <div className="flex gap-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'email' | 'domain' | 'phone')}
            className="px-4 py-3 bg-cyber-bg border border-cyber-border rounded-lg text-white focus:outline-none focus:border-cyber-accent"
          >
            <option value="email">Email Address</option>
            <option value="domain">Domain</option>
            <option value="phone">Phone Number</option>
          </select>
          <input
            type="text"
            placeholder={
              searchType === 'email' ? 'Enter email address...' :
              searchType === 'domain' ? 'Enter domain (e.g., company.com)...' :
              'Enter phone number...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-cyber-bg border border-cyber-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-accent"
          />
          <button
            onClick={handleSearch}
            disabled={searchResults.some(r => r.status === 'searching')}
            className="flex items-center gap-2 px-6 py-3 bg-cyber-accent text-black rounded-lg font-medium hover:bg-cyber-accent/90 transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            Check
          </button>
        </div>
      </div>

      {/* Search Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search History */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Search History
          </h3>
          {searchResults.length === 0 ? (
            <div className="cyber-card text-center py-8">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No searches yet</p>
              <p className="text-gray-600 text-sm">Enter an email, domain, or phone above</p>
            </div>
          ) : (
            searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => setSelectedResult(result)}
                className={`cyber-card cursor-pointer transition-all ${
                  selectedResult?.id === result.id ? 'border-red-500/50' : 'hover:border-cyber-accent/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-white text-sm truncate max-w-[180px]">{result.query}</span>
                  {result.status === 'searching' ? (
                    <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                  ) : result.status === 'exposed' ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Shield className="w-4 h-4 text-green-400" />
                  )}
                </div>

                {result.status === 'searching' && (
                  <div className="h-1.5 bg-cyber-bg rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${result.progress}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="capitalize">{result.type}</span>
                  <span>•</span>
                  <span>{new Date(result.searchTime).toLocaleTimeString()}</span>
                </div>

                {result.status !== 'searching' && (
                  <div className="mt-2">
                    <span className={`text-sm font-bold ${result.breachCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {result.breachCount > 0 ? `${result.breachCount} breaches found` : 'No exposures!'}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Result Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedResult ? (
            <>
              <div className="cyber-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono">{selectedResult.query}</h3>
                    <p className="text-gray-400 text-sm capitalize">{selectedResult.type} search</p>
                  </div>
                  {selectedResult.status === 'exposed' && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-white hover:border-red-500/50 transition-colors">
                      <Download className="w-4 h-4" />
                      Export Report
                    </button>
                  )}
                </div>

                {/* Live Search Logs */}
                {selectedResult.status === 'searching' && searchLogs.length > 0 && (
                  <div className="mb-4 p-4 bg-black/50 rounded-lg border border-cyber-border max-h-48 overflow-y-auto">
                    <h4 className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Searching Breach Databases
                    </h4>
                    <div className="font-mono text-xs space-y-1">
                      {searchLogs.slice(-8).map((log, i) => (
                        <div key={i} className={
                          log.includes('✓') ? 'text-green-400' : 
                          log.includes('⚠️') ? 'text-red-400' : 
                          'text-gray-400'
                        }>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Banner */}
                {selectedResult.status !== 'searching' && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    selectedResult.status === 'exposed' 
                      ? 'bg-red-500/10 border border-red-500/30' 
                      : 'bg-green-500/10 border border-green-500/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      {selectedResult.status === 'exposed' ? (
                        <>
                          <AlertTriangle className="w-8 h-8 text-red-400" />
                          <div>
                            <p className="text-red-400 font-bold">⚠️ Data Exposed!</p>
                            <p className="text-red-300 text-sm">This {selectedResult.type} was found in {selectedResult.breachCount} data breach(es)</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-8 h-8 text-green-400" />
                          <div>
                            <p className="text-green-400 font-bold">✓ No Exposures Found</p>
                            <p className="text-green-300 text-sm">This {selectedResult.type} was not found in any known breach databases</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Breach Details */}
                {selectedResult.breaches.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-400">Breaches Containing This Data:</h4>
                    {selectedResult.breaches.map((breach, idx) => (
                      <div key={idx} className="p-4 bg-cyber-bg rounded-lg border border-red-500/20">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold text-white">{breach.name}</h5>
                            <p className="text-xs text-gray-500">Breach Date: {breach.date}</p>
                          </div>
                          <span className="text-sm text-red-400 font-bold">
                            {formatNumber(breach.recordCount)} records
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Exposed Data Types:</p>
                          <div className="flex flex-wrap gap-2">
                            {breach.exposedData.map((dataType) => {
                              const Icon = dataTypeIcons[dataType] || FileText;
                              return (
                                <span key={dataType} className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">
                                  <Icon className="w-3 h-3" />
                                  {dataType}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="cyber-card flex items-center justify-center h-64">
              <div className="text-center">
                <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Select a search to view details</p>
                <p className="text-gray-600 text-sm">or start a new search above</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cyber-card">
          <p className="text-gray-400 text-sm mb-1">Total Breaches Tracked</p>
          <p className="text-2xl font-bold text-white">847</p>
        </div>
        <div className="cyber-card">
          <p className="text-gray-400 text-sm mb-1">Total Records Exposed</p>
          <p className="text-2xl font-bold text-red-400">12.4B</p>
        </div>
        <div className="cyber-card">
          <p className="text-gray-400 text-sm mb-1">Breaches This Month</p>
          <p className="text-2xl font-bold text-yellow-400">23</p>
        </div>
        <div className="cyber-card">
          <p className="text-gray-400 text-sm mb-1">Your Searches</p>
          <p className="text-2xl font-bold text-cyber-accent">{searchResults.length}</p>
        </div>
      </div>

      {/* Recent Leaks */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Data Breaches</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockLeaks.map((leak) => (
            <div key={leak.id} className="cyber-card hover:border-red-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <ThreatLevelBadge level={leak.severity} />
                <span className="text-xs text-gray-500">{leak.dateDiscovered}</span>
              </div>

              <h4 className="text-lg font-semibold text-white mb-2">{leak.name}</h4>
              <p className="text-gray-400 text-sm mb-4">{leak.description}</p>

              <div className="flex items-center gap-3 mb-4">
                <div className="text-center px-4 py-2 bg-red-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-red-400">{formatNumber(leak.recordCount)}</p>
                  <p className="text-xs text-gray-500">Records</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Exposed Data Types:</p>
                <div className="flex flex-wrap gap-2">
                  {leak.exposedData.map((dataType) => {
                    const Icon = dataTypeIcons[dataType] || FileText;
                    return (
                      <span key={dataType} className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">
                        <Icon className="w-3 h-3" />
                        {dataType}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-cyber-border">
                <span className="text-xs text-gray-500">Source: {leak.source}</span>
                <button className="flex items-center gap-1 text-xs text-cyber-accent hover:text-cyber-accent/80 transition-colors">
                  <Download className="w-3 h-3" />
                  Export IOCs
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
