// Threat Intelligence Types
export interface ThreatIntel {
  id: string;
  type: 'ioc' | 'malware' | 'apt' | 'campaign' | 'vulnerability';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  indicators: string[];
  source: string;
  timestamp: string;
  tags: string[];
  ttps?: string[];
}

export interface CVE {
  id: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore: number;
  publishedDate: string;
  modifiedDate: string;
  affectedProducts: string[];
  references: string[];
  exploitAvailable: boolean;
}

export interface IOC {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  value: string;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  malwareFamily?: string;
  tags: string[];
}

// Dark Web Types
export interface DarkWebMention {
  id: string;
  source: 'forum' | 'marketplace' | 'paste' | 'telegram' | 'leak';
  title: string;
  content: string;
  url?: string;
  timestamp: string;
  relevanceScore: number;
  keywords: string[];
}

export interface DataLeak {
  id: string;
  name: string;
  description: string;
  recordCount: number;
  exposedData: string[];
  dateDiscovered: string;
  source: string;
  severity: 'critical' | 'high' | 'medium';
}

// Attack Surface Types
export interface Asset {
  id: string;
  type: 'domain' | 'ip' | 'subdomain' | 'port' | 'service';
  value: string;
  status: 'active' | 'inactive' | 'vulnerable';
  lastSeen: string;
  technologies?: string[];
  vulnerabilities?: string[];
  riskScore: number;
}

export interface VulnerabilityScan {
  id: string;
  target: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  findings: VulnerabilityFinding[];
}

export interface VulnerabilityFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cve?: string;
  description: string;
  solution?: string;
  evidence?: string;
  port?: number;
  service?: string;
}

// News & Social Types
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: 'breach' | 'vulnerability' | 'malware' | 'apt' | 'policy' | 'general';
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface SocialPost {
  id: string;
  platform: 'twitter' | 'reddit' | 'linkedin' | 'mastodon';
  author: string;
  content: string;
  url: string;
  timestamp: string;
  engagement: number;
  tags: string[];
}

// Live TV Types
export interface LiveChannel {
  id: string;
  name: string;
  category: 'news' | 'tech' | 'security' | 'regional';
  youtubeId?: string;
  streamUrl?: string;
  logo?: string;
  region: string;
}

// Dashboard Types
export interface DashboardStats {
  activeThreatAlerts: number;
  newCVEs24h: number;
  activeScans: number;
  assetsMonitored: number;
  darkWebMentions: number;
  dataLeaksDetected: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

// AI Analysis Types
export interface AIAnalysis {
  id: string;
  query: string;
  response: string;
  sources: string[];
  confidence: number;
  timestamp: string;
  model: string;
}
