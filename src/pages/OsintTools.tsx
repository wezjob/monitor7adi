import { useState, useMemo } from 'react';
import {
  Search, ExternalLink, Filter, Grid, List, Globe, ChevronDown,
  Shield, Users, MessageCircle, MapPin, Image, AlertTriangle,
  AtSign, Mail, Phone, Database, EyeOff, Radio, FileText,
  Smartphone, Compass, Tag, X
} from 'lucide-react';
import { osintTools, CATEGORIES, type OsintTool } from '../data/osintTools';

const TYPE_COLORS: Record<string, string> = {
  'TOOL':              '#00e5ff',
  'PLATFORM-SAAS':     '#7c4dff',
  'CLI':               '#ff9100',
  'TELEGRAM-BOT':      '#00bfa5',
  'BROWSER-EXTENSION': '#e040fb',
  'AGGREGATOR':        '#64ffda',
  'DATA-SOURCE':       '#ffd740',
  'BETA':              '#ff6e40',
};

const PRICING_COLORS: Record<string, string> = {
  'FREE':        '#00e676',
  'FREEMIUM':    '#ffab40',
  'PAID':        '#ff5252',
  'INVITE-ONLY': '#b388ff',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'GENERAL OSINT':            <Shield size={16} />,
  'SOCMINT':                  <Users size={16} />,
  'DIGITAL COMMUNICATION':    <MessageCircle size={16} />,
  'GEOINT':                   <MapPin size={16} />,
  'IMAGEINT':                 <Image size={16} />,
  'BREACH DATA':              <AlertTriangle size={16} />,
  'DARK WEB':                 <Globe size={16} />,
  'WEB OSINT':                <Globe size={16} />,
  'DOMAININT':                <AtSign size={16} />,
  'CRAWLING - SCRAPING':      <Search size={16} />,
  'PEOPLE SEARCH':            <Users size={16} />,
  'EMAILINT':                 <Mail size={16} />,
  'PHONEINT':                 <Phone size={16} />,
  'PUBLIC DATA':              <Database size={16} />,
  'PRIVACY TOOLS':            <EyeOff size={16} />,
  'CRYPTOCURRENCIES':         <Shield size={16} />,
  'SIGINT':                   <Radio size={16} />,
  'DOCUMENTINT':              <FileText size={16} />,
  'MOBILE OSINT':             <Smartphone size={16} />,
  'FORENSIC TOOLS':           <Search size={16} />,
};

export function OsintTools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPricing, setSelectedPricing] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Get unique values
  const categories = useMemo(() => Object.keys(CATEGORIES), []);
  const types = useMemo(() => [...new Set(osintTools.map(t => t.type))].sort(), []);
  const pricings = useMemo(() => [...new Set(osintTools.map(t => t.pricing))].sort(), []);

  // Filter tools
  const filteredTools = useMemo(() => {
    return osintTools.filter(tool => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some(tag => tag.toLowerCase().includes(q)) ||
        tool.category.toLowerCase().includes(q);
      const matchCategory = selectedCategory === 'ALL' || tool.category === selectedCategory;
      const matchType = selectedType === 'ALL' || tool.type === selectedType;
      const matchPricing = selectedPricing === 'ALL' || tool.pricing === selectedPricing;
      return matchSearch && matchCategory && matchType && matchPricing;
    });
  }, [searchQuery, selectedCategory, selectedType, selectedPricing]);

  // Group by category
  const groupedTools = useMemo(() => {
    const groups: Record<string, OsintTool[]> = {};
    filteredTools.forEach(tool => {
      if (!groups[tool.category]) groups[tool.category] = [];
      groups[tool.category].push(tool);
    });
    return groups;
  }, [filteredTools]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedType('ALL');
    setSelectedPricing('ALL');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'ALL' || selectedType !== 'ALL' || selectedPricing !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Compass className="text-cyan-400" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">OSINT Tools Directory</h1>
            <p className="text-sm text-gray-400">
              {osintTools.length} outils & ressources OSINT — {Object.keys(CATEGORIES).length} catégories
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-2">Vue:</span>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher un outil, une catégorie, un tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}
          >
            <Filter size={16} />
            Filtres
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2.5 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <X size={14} />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Category Filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Catégorie</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer pr-8"
                >
                  <option value="ALL">Toutes les catégories ({osintTools.length})</option>
                  {categories.map(cat => {
                    const count = osintTools.filter(t => t.category === cat).length;
                    return <option key={cat} value={cat}>{CATEGORIES[cat]?.label || cat} ({count})</option>;
                  })}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Type</label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full appearance-none bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer pr-8"
                >
                  <option value="ALL">Tous les types</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Pricing Filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Tarification</label>
              <div className="relative">
                <select
                  value={selectedPricing}
                  onChange={(e) => setSelectedPricing(e.target.value)}
                  className="w-full appearance-none bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer pr-8"
                >
                  <option value="ALL">Toutes les tarifications</option>
                  {pricings.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            {filteredTools.length} outils trouvés
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            {filteredTools.filter(t => t.pricing === 'FREE').length} gratuits
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            {Object.keys(groupedTools).length} catégories
          </span>
        </div>
      </div>

      {/* Category Quick Nav */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === 'ALL' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'}`}
        >
          Tous ({osintTools.length})
        </button>
        {categories.map(cat => {
          const count = osintTools.filter(t => t.category === cat).length;
          const catInfo = CATEGORIES[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? 'ALL' : cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat ? 'text-black' : 'text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600'}`}
              style={selectedCategory === cat ? { backgroundColor: catInfo?.color || '#00e5ff' } : { backgroundColor: 'rgba(31,41,55,0.5)' }}
            >
              {CATEGORY_ICONS[cat]}
              {catInfo?.label || cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Tools Display */}
      {Object.keys(groupedTools).length === 0 ? (
        <div className="text-center py-16">
          <Search className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400 text-lg">Aucun outil trouvé</p>
          <p className="text-gray-600 text-sm mt-1">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTools).map(([category, tools]) => {
            const catInfo = CATEGORIES[category];
            const isExpanded = expandedCategory === null || expandedCategory === category;
            return (
              <div key={category} className="space-y-3">
                {/* Category Header */}
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                  className="flex items-center gap-3 w-full text-left group"
                >
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: `${catInfo?.color || '#00e5ff'}15`, color: catInfo?.color || '#00e5ff' }}
                  >
                    {CATEGORY_ICONS[category]}
                    {catInfo?.label || category}
                  </div>
                  <span className="text-xs text-gray-500">({tools.length} outils)</span>
                  <div className="flex-1 h-px bg-gray-800"></div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                  />
                </button>

                {/* Tools Grid/List */}
                {isExpanded && (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tools.map(tool => (
                        <ToolRow key={tool.id} tool={tool} />
                      ))}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tool Card (Grid View) ───────────────────────────────────────
function ToolCard({ tool }: { tool: OsintTool }) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/30 hover:bg-gray-900/80 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 flex-1 mr-2">
          {tool.name}
        </h3>
        <ExternalLink size={14} className="text-gray-600 group-hover:text-cyan-400 flex-shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${TYPE_COLORS[tool.type] || '#888'}20`, color: TYPE_COLORS[tool.type] || '#888' }}
        >
          {tool.type}
        </span>
        <span
          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${PRICING_COLORS[tool.pricing] || '#888'}20`, color: PRICING_COLORS[tool.pricing] || '#888' }}
        >
          {tool.pricing}
        </span>
      </div>

      <p className="text-xs text-gray-400 line-clamp-3 mb-3 leading-relaxed">
        {tool.description}
      </p>

      {tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tool.tags.slice(0, 3).map(tag => (
            <span key={tag} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-800 text-[10px] text-gray-500">
              <Tag size={8} />
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}

// ─── Tool Row (List View) ────────────────────────────────────────
function ToolRow({ tool }: { tool: OsintTool }) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-3 hover:border-cyan-500/30 hover:bg-gray-900/80 transition-all duration-200"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
            {tool.name}
          </h3>
          <span
            className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${TYPE_COLORS[tool.type] || '#888'}20`, color: TYPE_COLORS[tool.type] || '#888' }}
          >
            {tool.type}
          </span>
          <span
            className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${PRICING_COLORS[tool.pricing] || '#888'}20`, color: PRICING_COLORS[tool.pricing] || '#888' }}
          >
            {tool.pricing}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate mt-1">{tool.description}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {tool.tags.slice(0, 2).map(tag => (
          <span key={tag} className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-800 text-[10px] text-gray-500">
            <Tag size={8} />
            {tag}
          </span>
        ))}
        <ExternalLink size={14} className="text-gray-600 group-hover:text-cyan-400" />
      </div>
    </a>
  );
}
