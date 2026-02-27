import { useState } from 'react';
import { Tv, Newspaper, Radio, Globe, Play, ExternalLink } from 'lucide-react';
import type { NewsItem } from '../types';

interface LiveChannel {
  id: string;
  name: string;
  category: 'security' | 'news' | 'tech' | 'regional';
  youtubeChannelId?: string;  // YouTube channel ID for live stream
  youtubeVideoId?: string;    // Specific live video ID
  region: string;
  logo?: string;
}

const liveChannels: LiveChannel[] = [
  // International News - Using known live video IDs
  { id: '1', name: 'Al Jazeera English', category: 'news', youtubeVideoId: 'gCNeDWCI0vo', region: 'Qatar' },
  { id: '2', name: 'France 24 English', category: 'news', youtubeVideoId: 'h3MuIUNCCzI', region: 'France' },
  { id: '3', name: 'France 24 Français', category: 'news', youtubeVideoId: 'l8PMl7tUDIE', region: 'France' },
  { id: '4', name: 'Sky News', category: 'news', youtubeVideoId: '9Auq9mYxFEE', region: 'UK' },
  { id: '5', name: 'DW News', category: 'news', youtubeVideoId: 'GE_SfNVNyqk', region: 'Germany' },
  { id: '6', name: 'Euronews', category: 'news', youtubeVideoId: 'pykpO5kQJ98', region: 'Europe' },
  { id: '7', name: 'WION', category: 'news', youtubeVideoId: 'UNsSjJPuxRo', region: 'India' },
  
  // Moroccan Channels
  { id: '8', name: 'Medi1 TV', category: 'regional', youtubeChannelId: 'UCH4YSSY0MBrCaIkSGkCCHkA', region: 'Morocco' },
  { id: '9', name: '2M Maroc', category: 'regional', youtubeChannelId: 'UCnEfAv1MXPV7jPyPLHbBK3w', region: 'Morocco' },
  { id: '10', name: 'Al Aoula', category: 'regional', youtubeChannelId: 'UCohqLCj8jHgmTLGi36y3DWw', region: 'Morocco' },
  { id: '11', name: 'Chada TV', category: 'regional', youtubeChannelId: 'UCNm_Y9X10sCl-CsW9QzPTqw', region: 'Morocco' },
  
  // Arabic News
  { id: '12', name: 'Al Jazeera Arabic', category: 'news', youtubeVideoId: 'bNyUyrR0PHo', region: 'Qatar' },
  { id: '13', name: 'BBC Arabic', category: 'news', youtubeVideoId: 'bBC-nXj3Ng4', region: 'UK' },
  
  // Tech & Security
  { id: '14', name: 'Bloomberg Technology', category: 'tech', youtubeVideoId: 'dp8PhLsUcFE', region: 'USA' },
  { id: '15', name: 'CNBC', category: 'tech', youtubeVideoId: '9NyxcX3rhQs', region: 'USA' },
  
  // Security Channels (recorded/occasional lives)
  { id: '16', name: 'Black Hat', category: 'security', youtubeChannelId: 'UCJ6q9Ie29ajGqKApbLqfBOg', region: 'Global' },
  { id: '17', name: 'DEF CON', category: 'security', youtubeChannelId: 'UC6Om9kAkl32dWlDSNlDS9Iw', region: 'Global' },
  { id: '18', name: 'Hak5', category: 'security', youtubeChannelId: 'UC3s0BtrBJpwNDaflRSoiieQ', region: 'USA' },
];

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Critical Zero-Day in Popular VPN Software Actively Exploited',
    description: 'Security researchers have discovered a critical vulnerability being actively exploited in the wild affecting millions of corporate VPN users.',
    url: 'https://example.com/news/1',
    source: 'Krebs on Security',
    publishedAt: '2024-02-26T10:30:00Z',
    category: 'vulnerability',
  },
  {
    id: '2',
    title: 'Major Healthcare Provider Suffers Ransomware Attack',
    description: 'A leading healthcare organization has been hit by a sophisticated ransomware attack, affecting patient data across multiple facilities.',
    url: 'https://example.com/news/2',
    source: 'BleepingComputer',
    publishedAt: '2024-02-26T09:15:00Z',
    category: 'breach',
  },
  {
    id: '3',
    title: 'New APT Group Targets Financial Sector in Europe',
    description: 'Researchers identify a new advanced persistent threat group conducting targeted attacks against European financial institutions.',
    url: 'https://example.com/news/3',
    source: 'The Hacker News',
    publishedAt: '2024-02-26T08:00:00Z',
    category: 'apt',
  },
  {
    id: '4',
    title: 'CISA Adds 3 New CVEs to Known Exploited Vulnerabilities Catalog',
    description: 'The agency has updated its catalog with three new actively exploited vulnerabilities that federal agencies must patch.',
    url: 'https://example.com/news/4',
    source: 'CISA.gov',
    publishedAt: '2024-02-26T07:30:00Z',
    category: 'vulnerability',
  },
  {
    id: '5',
    title: 'Malware Campaign Targets macOS Users with Stealer',
    description: 'A new malware campaign delivers information-stealing malware to macOS users through malicious search ads.',
    url: 'https://example.com/news/5',
    source: 'Malwarebytes',
    publishedAt: '2024-02-26T06:45:00Z',
    category: 'malware',
  },
  {
    id: '6',
    title: 'EU Releases New Cybersecurity Regulations for Critical Infrastructure',
    description: 'The European Union has published comprehensive new regulations governing cybersecurity requirements for critical infrastructure operators.',
    url: 'https://example.com/news/6',
    source: 'Dark Reading',
    publishedAt: '2024-02-26T05:00:00Z',
    category: 'policy',
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'breach': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'vulnerability': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'malware': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'apt': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    case 'policy': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export function LiveNews() {
  const [activeTab, setActiveTab] = useState<'live' | 'news' | 'feeds'>('news');
  const [selectedChannel, setSelectedChannel] = useState<LiveChannel | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredChannels = (category: string) => 
    liveChannels.filter(c => c.category === category);

  const filteredNews = categoryFilter === 'all' 
    ? mockNews 
    : mockNews.filter(n => n.category === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tv className="w-7 h-7 text-cyber-accent" />
            Live News & Feeds
          </h1>
          <p className="text-gray-400 mt-1">Real-time security news, live TV, and RSS feeds</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-cyber-border">
        <button
          onClick={() => setActiveTab('news')}
          className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'news'
              ? 'text-cyber-accent border-b-2 border-cyber-accent'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          Security News
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'live'
              ? 'text-cyber-accent border-b-2 border-cyber-accent'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          Live TV
        </button>
        <button
          onClick={() => setActiveTab('feeds')}
          className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'feeds'
              ? 'text-cyber-accent border-b-2 border-cyber-accent'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          RSS Feeds
        </button>
      </div>

      {/* Content */}
      {activeTab === 'news' && (
        <div>
          {/* Category Filter */}
          <div className="flex gap-2 mb-6">
            {['all', 'breach', 'vulnerability', 'malware', 'apt', 'policy'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-cyber-accent text-black'
                    : 'bg-cyber-card border border-cyber-border text-gray-400 hover:text-white'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* News List */}
          <div className="space-y-4">
            {filteredNews.map(news => (
              <div key={news.id} className="cyber-card hover:border-cyber-accent/30 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-0.5 text-xs rounded border ${getCategoryColor(news.category)}`}>
                    {news.category.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(news.publishedAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{news.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{news.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-cyber-border">
                  <span className="text-xs text-cyber-info">{news.source}</span>
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyber-accent transition-colors"
                  >
                    Read more <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Channel Categories */}
          <div className="space-y-6">
            {['security', 'news', 'tech', 'regional'].map(category => (
              <div key={category} className="cyber-card">
                <h3 className="text-lg font-semibold text-white mb-4 capitalize">{category} Channels</h3>
                <div className="space-y-2">
                  {filteredChannels(category).map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedChannel?.id === channel.id
                          ? 'bg-cyber-accent/20 border border-cyber-accent/50'
                          : 'bg-cyber-bg hover:bg-cyber-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Play className="w-4 h-4 text-cyber-accent" />
                        <span className="text-white text-sm">{channel.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{channel.region}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Video Player */}
          <div className="lg:col-span-2">
            {selectedChannel ? (
              <div className="cyber-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{selectedChannel.name}</h3>
                  <span className="flex items-center gap-2 text-xs text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="aspect-video bg-cyber-bg rounded-lg overflow-hidden">
                  {selectedChannel.youtubeVideoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedChannel.youtubeVideoId}?autoplay=1&mute=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : selectedChannel.youtubeChannelId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/live_stream?channel=${selectedChannel.youtubeChannelId}&autoplay=1&mute=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Tv className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Stream unavailable</p>
                        <p className="text-sm">Check external source</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">{selectedChannel.region}</span>
                  <a 
                    href={selectedChannel.youtubeVideoId 
                      ? `https://www.youtube.com/watch?v=${selectedChannel.youtubeVideoId}`
                      : `https://www.youtube.com/channel/${selectedChannel.youtubeChannelId}/live`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-cyber-accent hover:text-cyber-accent/80"
                  >
                    Open on YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="cyber-card flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <Tv className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a channel to watch</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'feeds' && (
        <div className="cyber-card">
          <h3 className="text-lg font-semibold text-white mb-4">RSS Feed Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Krebs on Security', url: 'krebsonsecurity.com', category: 'Blog' },
              { name: 'The Hacker News', url: 'thehackernews.com', category: 'News' },
              { name: 'BleepingComputer', url: 'bleepingcomputer.com', category: 'News' },
              { name: 'Dark Reading', url: 'darkreading.com', category: 'News' },
              { name: 'CISA Alerts', url: 'cisa.gov/uscert', category: 'Gov' },
              { name: 'Threatpost', url: 'threatpost.com', category: 'News' },
              { name: 'Schneier on Security', url: 'schneier.com', category: 'Blog' },
              { name: 'SANS ISC', url: 'isc.sans.edu', category: 'Research' },
              { name: 'NVD CVE Feed', url: 'nvd.nist.gov', category: 'CVE' },
            ].map(feed => (
              <div key={feed.name} className="p-4 bg-cyber-bg rounded-lg border border-cyber-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{feed.name}</span>
                  <span className="px-2 py-0.5 bg-cyber-card text-xs text-gray-400 rounded">{feed.category}</span>
                </div>
                <p className="text-xs text-gray-500">{feed.url}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
