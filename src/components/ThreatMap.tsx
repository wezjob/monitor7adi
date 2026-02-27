import { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from 'react-simple-maps';
import { Shield, Zap, Target, TrendingUp, Filter } from 'lucide-react';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Country coordinates for attack simulation
const COUNTRY_COORDS: Record<string, { coords: [number, number]; name: string }> = {
  RU: { coords: [37.6173, 55.7558], name: 'Russia' },
  CN: { coords: [116.4074, 39.9042], name: 'China' },
  US: { coords: [-95.7129, 37.0902], name: 'United States' },
  KP: { coords: [125.7625, 39.0392], name: 'North Korea' },
  IR: { coords: [51.3890, 35.6892], name: 'Iran' },
  BR: { coords: [-47.8825, -15.7942], name: 'Brazil' },
  IN: { coords: [77.2090, 28.6139], name: 'India' },
  UA: { coords: [30.5234, 50.4501], name: 'Ukraine' },
  DE: { coords: [10.4515, 51.1657], name: 'Germany' },
  FR: { coords: [2.3522, 48.8566], name: 'France' },
  GB: { coords: [-0.1276, 51.5074], name: 'United Kingdom' },
  JP: { coords: [139.6917, 35.6895], name: 'Japan' },
  KR: { coords: [126.978, 37.5665], name: 'South Korea' },
  AU: { coords: [133.7751, -25.2744], name: 'Australia' },
  CA: { coords: [-106.3468, 56.1304], name: 'Canada' },
  NL: { coords: [5.2913, 52.1326], name: 'Netherlands' },
  PL: { coords: [19.1451, 51.9194], name: 'Poland' },
  TR: { coords: [32.8597, 39.9334], name: 'Turkey' },
  SA: { coords: [45.0792, 23.8859], name: 'Saudi Arabia' },
  AE: { coords: [53.8478, 23.4241], name: 'UAE' },
  SG: { coords: [103.8198, 1.3521], name: 'Singapore' },
  MA: { coords: [-7.0926, 31.7917], name: 'Morocco' },
  EG: { coords: [30.8025, 26.8206], name: 'Egypt' },
  ZA: { coords: [22.9375, -30.5595], name: 'South Africa' },
  MX: { coords: [-102.5528, 23.6345], name: 'Mexico' },
  AR: { coords: [-63.6167, -38.4161], name: 'Argentina' },
  IT: { coords: [12.5674, 41.8719], name: 'Italy' },
  ES: { coords: [-3.7038, 40.4168], name: 'Spain' },
  SE: { coords: [18.6435, 60.1282], name: 'Sweden' },
  NO: { coords: [8.4689, 60.4720], name: 'Norway' },
  FI: { coords: [25.7482, 61.9241], name: 'Finland' },
};

const ATTACK_TYPES = [
  { name: 'Malware', color: '#ef4444', icon: '🦠' },
  { name: 'Phishing', color: '#3b82f6', icon: '🎣' },
  { name: 'DDoS', color: '#eab308', icon: '⚡' },
  { name: 'Ransomware', color: '#a855f7', icon: '🔒' },
  { name: 'Exploit', color: '#f97316', icon: '💥' },
  { name: 'Botnet', color: '#06b6d4', icon: '🤖' },
  { name: 'SQLi', color: '#ec4899', icon: '💉' },
  { name: 'XSS', color: '#84cc16', icon: '📜' },
];

interface Attack {
  id: string;
  from: string;
  to: string;
  type: typeof ATTACK_TYPES[number];
  timestamp: Date;
  progress: number;
}

interface AttackStats {
  country: string;
  count: number;
}

type CountryFilter = 'all' | 'MA';

const ThreatMapComponent = memo(function ThreatMap() {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [recentAttacks, setRecentAttacks] = useState<Attack[]>([]);
  const [totalAttacks, setTotalAttacks] = useState(847293);
  const [filteredTotalAttacks, setFilteredTotalAttacks] = useState(12847);
  const [attacksPerSecond, setAttacksPerSecond] = useState(0);
  const [filteredAttacksPerSecond, setFilteredAttacksPerSecond] = useState(0);
  const [topAttackers, setTopAttackers] = useState<AttackStats[]>([]);
  const [topTargets, setTopTargets] = useState<AttackStats[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('all');
  const attackCountRef = useRef(0);
  const filteredAttackCountRef = useRef(0);
  const lastSecondRef = useRef(Date.now());

  // Filter attacks based on country filter
  const filterAttacks = useCallback((attackList: Attack[]) => {
    if (countryFilter === 'all') return attackList;
    return attackList.filter(a => a.from === countryFilter || a.to === countryFilter);
  }, [countryFilter]);

  const filteredAttacks = filterAttacks(attacks);
  const filteredRecentAttacks = filterAttacks(recentAttacks);

  // Generate random attack
  const generateAttack = useCallback((): Attack => {
    const countries = Object.keys(COUNTRY_COORDS);
    let from = countries[Math.floor(Math.random() * countries.length)];
    let to = countries[Math.floor(Math.random() * countries.length)];
    while (to === from) {
      to = countries[Math.floor(Math.random() * countries.length)];
    }
    
    return {
      id: `${Date.now()}-${Math.random()}`,
      from,
      to,
      type: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
      timestamp: new Date(),
      progress: 0,
    };
  }, []);

  // Main animation loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // Generate new attacks (1-3 per tick)
      const newAttackCount = Math.floor(Math.random() * 3) + 1;
      const newAttacks: Attack[] = [];
      for (let i = 0; i < newAttackCount; i++) {
        newAttacks.push(generateAttack());
      }

      // Update attacks progress and remove completed
      setAttacks(prev => {
        const updated = prev
          .map(a => ({ ...a, progress: a.progress + 0.05 }))
          .filter(a => a.progress < 1);
        return [...updated, ...newAttacks].slice(-30); // Keep max 30 active
      });

      // Update recent attacks feed
      setRecentAttacks(prev => [...newAttacks, ...prev].slice(0, 15));

      // Update total counter
      setTotalAttacks(prev => prev + newAttackCount);
      attackCountRef.current += newAttackCount;
      
      // Count filtered attacks (Morocco related)
      const moroccoAttacks = newAttacks.filter(a => a.from === 'MA' || a.to === 'MA');
      if (moroccoAttacks.length > 0) {
        setFilteredTotalAttacks(prev => prev + moroccoAttacks.length);
        filteredAttackCountRef.current += moroccoAttacks.length;
      }

      // Calculate attacks per second
      const now = Date.now();
      if (now - lastSecondRef.current >= 1000) {
        setAttacksPerSecond(attackCountRef.current);
        setFilteredAttacksPerSecond(filteredAttackCountRef.current);
        filteredAttackCountRef.current = 0;
        attackCountRef.current = 0;
        lastSecondRef.current = now;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, generateAttack]);

  // Update statistics
  useEffect(() => {
    const interval = setInterval(() => {
      // Calculate top attackers and targets from recent attacks (filtered)
      const attackerCounts: Record<string, number> = {};
      const targetCounts: Record<string, number> = {};
      
      const attacksToAnalyze = countryFilter === 'all' 
        ? recentAttacks 
        : recentAttacks.filter(a => a.from === countryFilter || a.to === countryFilter);

      attacksToAnalyze.forEach(attack => {
        attackerCounts[attack.from] = (attackerCounts[attack.from] || 0) + 1;
        targetCounts[attack.to] = (targetCounts[attack.to] || 0) + 1;
      });

      setTopAttackers(
        Object.entries(attackerCounts)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );

      setTopTargets(
        Object.entries(targetCounts)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [recentAttacks, countryFilter]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="cyber-card p-0 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
        {/* Main Map Area */}
        <div className="lg:col-span-3 relative" style={{ minHeight: '500px' }}>
          {/* Header overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/80 rounded-lg border border-red-500/30">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-bold text-sm">LIVE THREAT MAP</span>
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isPaused 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
            </button>
            <button
              onClick={() => setCountryFilter(countryFilter === 'all' ? 'MA' : 'all')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                countryFilter === 'MA'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}
            >
              <Filter className="w-3 h-3" />
              {countryFilter === 'MA' ? '🇲🇦 Morocco' : 'All Countries'}
            </button>
          </div>

          {/* Stats overlay */}
          <div className="absolute top-4 right-4 z-10 flex gap-3">
            <div className="px-4 py-2 bg-black/80 rounded-lg border border-cyber-border">
              <p className="text-gray-400 text-xs">
                {countryFilter === 'MA' ? '🇲🇦 Attacks Today' : 'Attacks Today'}
              </p>
              <p className="text-2xl font-bold text-white font-mono">
                {formatNumber(countryFilter === 'MA' ? filteredTotalAttacks : totalAttacks)}
              </p>
            </div>
            <div className="px-4 py-2 bg-black/80 rounded-lg border border-cyber-border">
              <p className="text-gray-400 text-xs">Per Second</p>
              <p className="text-2xl font-bold text-cyber-accent font-mono">
                {countryFilter === 'MA' ? filteredAttacksPerSecond : attacksPerSecond}
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="w-full h-full bg-[#0a0e17]">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 140, center: [10, 30] }}
              style={{ width: '100%', height: '500px' }}
            >
              {/* Countries */}
              <Geographies geography={GEO_URL}>
                {({ geographies }: { geographies: Array<{ rsmKey: string; properties: Record<string, unknown>; geometry: unknown }> }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#1a1f2e"
                      stroke="#2a3441"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', fill: '#252d3d' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Morocco Highlight when filtered */}
              {countryFilter === 'MA' && (
                <Marker coordinates={COUNTRY_COORDS['MA'].coords}>
                  <circle
                    r={20}
                    fill="#22c55e"
                    fillOpacity={0.2}
                    stroke="#22c55e"
                    strokeWidth={2}
                    className="animate-pulse"
                  />
                  <circle
                    r={30}
                    fill="transparent"
                    stroke="#22c55e"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                  />
                </Marker>
              )}

              {/* Attack Lines */}
              {filteredAttacks.map((attack) => {
                const fromCoords = COUNTRY_COORDS[attack.from]?.coords;
                const toCoords = COUNTRY_COORDS[attack.to]?.coords;
                if (!fromCoords || !toCoords) return null;

                // Dashed line for attacks FROM Morocco, solid for attacks TO Morocco
                const isFromMorocco = attack.from === 'MA';
                const isToMorocco = attack.to === 'MA';
                const strokeDasharray = isFromMorocco ? '6,4' : isToMorocco ? undefined : undefined;

                return (
                  <Line
                    key={attack.id}
                    from={fromCoords}
                    to={toCoords}
                    stroke={attack.type.color}
                    strokeWidth={isFromMorocco || isToMorocco ? 3 : 2}
                    strokeLinecap="round"
                    style={{
                      opacity: 1 - attack.progress,
                      strokeDasharray: strokeDasharray,
                    }}
                  />
                );
              })}

              {/* Attack endpoints - Origins (red) */}
              {filteredAttacks.map((attack) => {
                const coords = COUNTRY_COORDS[attack.from]?.coords;
                if (!coords) return null;
                return (
                  <Marker key={`from-${attack.id}`} coordinates={coords}>
                    <circle
                      r={3}
                      fill={attack.type.color}
                      opacity={1 - attack.progress}
                    />
                    <circle
                      r={6}
                      fill="transparent"
                      stroke={attack.type.color}
                      strokeWidth={1}
                      opacity={(1 - attack.progress) * 0.5}
                      className="animate-ping"
                    />
                  </Marker>
                );
              })}

              {/* Attack endpoints - Targets (impact) */}
              {filteredAttacks.filter(a => a.progress > 0.8).map((attack) => {
                const coords = COUNTRY_COORDS[attack.to]?.coords;
                if (!coords) return null;
                return (
                  <Marker key={`to-${attack.id}`} coordinates={coords}>
                    <circle
                      r={8}
                      fill={attack.type.color}
                      opacity={(1 - attack.progress) * 2}
                      className="animate-ping"
                    />
                  </Marker>
                );
              })}
            </ComposableMap>
          </div>

          {/* Attack Types Legend */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {ATTACK_TYPES.map(type => (
                <div
                  key={type.name}
                  className="flex items-center gap-1 px-2 py-1 bg-black/80 rounded text-xs"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-gray-300">{type.name}</span>
                </div>
              ))}
            </div>
            {/* Morocco line styles legend */}
            <div className="flex gap-3 px-2 py-1 bg-black/80 rounded text-xs">
              <div className="flex items-center gap-2">
                <svg width="24" height="8">
                  <line x1="0" y1="4" x2="24" y2="4" stroke="#22c55e" strokeWidth="2" strokeDasharray="4,2" />
                </svg>
                <span className="text-gray-300">From 🇲🇦</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="24" height="8">
                  <line x1="0" y1="4" x2="24" y2="4" stroke="#22c55e" strokeWidth="2" />
                </svg>
                <span className="text-gray-300">To 🇲🇦</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Stats & Feed */}
        <div className="bg-[#0d1117] border-l border-cyber-border flex flex-col">
          {/* Top Attackers */}
          <div className="p-4 border-b border-cyber-border">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-red-400" />
              Top Attack Origins
            </h4>
            <div className="space-y-2">
              {topAttackers.length > 0 ? topAttackers.map((stat, idx) => (
                <div key={stat.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-4">{idx + 1}.</span>
                    <span className="text-white text-sm">{COUNTRY_COORDS[stat.country]?.name || stat.country}</span>
                  </div>
                  <span className="text-red-400 text-sm font-mono">{stat.count}</span>
                </div>
              )) : (
                <p className="text-gray-500 text-xs">Loading...</p>
              )}
            </div>
          </div>

          {/* Top Targets */}
          <div className="p-4 border-b border-cyber-border">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Top Targets
            </h4>
            <div className="space-y-2">
              {topTargets.length > 0 ? topTargets.map((stat, idx) => (
                <div key={stat.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-4">{idx + 1}.</span>
                    <span className="text-white text-sm">{COUNTRY_COORDS[stat.country]?.name || stat.country}</span>
                  </div>
                  <span className="text-blue-400 text-sm font-mono">{stat.count}</span>
                </div>
              )) : (
                <p className="text-gray-500 text-xs">Loading...</p>
              )}
            </div>
          </div>

          {/* Live Attack Feed */}
          <div className="p-4 flex-1 overflow-hidden">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Live Attack Feed
            </h4>
            <div className="space-y-2 overflow-y-auto max-h-64">
              {filteredRecentAttacks.slice(0, 10).map((attack) => (
                <div
                  key={attack.id}
                  className="p-2 bg-black/40 rounded border-l-2 text-xs"
                  style={{ borderColor: attack.type.color }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ color: attack.type.color }}>{attack.type.icon} {attack.type.name}</span>
                    <span className="text-gray-500">
                      {attack.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    <span className="text-red-400">{COUNTRY_COORDS[attack.from]?.name}</span>
                    {' → '}
                    <span className="text-blue-400">{COUNTRY_COORDS[attack.to]?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attack Rate Graph */}
          <div className="p-4 border-t border-cyber-border">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyber-accent" />
              Threat Level
            </h4>
            <div className="flex items-end gap-1 h-12">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-red-500 to-yellow-400 rounded-t transition-all duration-300"
                  style={{
                    height: `${Math.random() * 80 + 20}%`,
                    opacity: 0.5 + (i / 20) * 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export { ThreatMapComponent as ThreatMap };
