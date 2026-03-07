// BOSINT - All-in-one OSINT aggregator service
// Combines multiple OSINT tools for unified searches
import axios from 'axios';
import { searchCriminalIp } from './criminalIp.js';
import { checkIsMalicious } from './isMalicious.js';
import { searchShodanLeaks } from './leakScope.js';
import { analyzeTirexdel } from './tirexdel.js';
import { checkHaveIBeenPwned } from './haveIBeenRansom.js';

export interface OsintSearchResult {
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

// Detect indicator type
function detectType(query: string): OsintSearchResult['type'] {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hashRegex = /^[a-fA-F0-9]{32,64}$/;
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;

  if (ipv4Regex.test(query) || ipv6Regex.test(query)) return 'ip';
  if (emailRegex.test(query)) return 'email';
  if (hashRegex.test(query)) return 'hash';
  if (domainRegex.test(query)) return 'domain';
  return 'username';
}

// Run unified OSINT search across all integrated tools
export async function unifiedOsintSearch(
  query: string,
  apiKeys: {
    criminalIp?: string;
    isMalicious?: string;
    shodan?: string;
    virusTotal?: string;
    abuseIPDB?: string;
    otx?: string;
    hibp?: string;
  }
): Promise<OsintSearchResult> {
  const type = detectType(query);
  const results: OsintSearchResult['results'] = [];
  let threatCount = 0;

  // IP-based searches
  if (type === 'ip') {
    // Criminal IP
    if (apiKeys.criminalIp) {
      try {
        const data = await searchCriminalIp(query, apiKeys.criminalIp);
        if (data) {
          const severity = data.threat === 'critical' ? 'critical' : data.threat === 'high' ? 'high' : 'medium';
          if (severity === 'critical' || severity === 'high') threatCount++;
          results.push({ source: 'Criminal IP', category: 'Threat Intel', data, severity, link: data.details_url });
        }
      } catch {}
    }

    // isMalicious
    if (apiKeys.isMalicious) {
      try {
        const data = await checkIsMalicious(query, apiKeys.isMalicious);
        if (data) {
          const severity = data.verdict === 'malicious' ? 'critical' : data.verdict === 'suspicious' ? 'high' : 'low';
          if (data.verdict === 'malicious') threatCount++;
          results.push({ source: 'isMalicious', category: 'Threat Intel', data, severity, link: data.details_url });
        }
      } catch {}
    }

    // Tirexdel (multi-vendor IoC check)
    try {
      const data = await analyzeTirexdel(query, 'ip', {
        virusTotal: apiKeys.virusTotal,
        abuseIPDB: apiKeys.abuseIPDB,
        otx: apiKeys.otx,
      });
      const severity = data.overall_verdict === 'malicious' ? 'critical' : data.overall_verdict === 'suspicious' ? 'high' : 'low';
      if (data.overall_verdict === 'malicious') threatCount++;
      results.push({ source: 'Tirexdel (Multi-vendor)', category: 'IoC Analysis', data, severity });
    } catch {}

    // Shodan leak search
    if (apiKeys.shodan) {
      try {
        const data = await searchShodanLeaks(`ip:${query}`, apiKeys.shodan);
        if (data.length > 0) {
          const maxSeverity = data.some(d => d.severity === 'critical') ? 'critical' : 
                              data.some(d => d.severity === 'high') ? 'high' : 'medium';
          if (maxSeverity === 'critical') threatCount++;
          results.push({ source: 'LeakScope (Shodan)', category: 'Data Leaks', data, severity: maxSeverity });
        }
      } catch {}
    }
  }

  // Email-based searches
  if (type === 'email') {
    // HaveIBeenPwned / HaveIBeenRansom
    if (apiKeys.hibp) {
      try {
        const data = await checkHaveIBeenPwned(query, apiKeys.hibp);
        const severity = data.leak_sources.some(s => s.severity === 'critical') ? 'critical' :
                        data.leak_sources.some(s => s.severity === 'high') ? 'high' : 
                        data.found ? 'medium' : 'low';
        if (data.found) threatCount++;
        results.push({ source: 'HaveIBeenRansom', category: 'Breach Data', data, severity, link: data.details_url });
      } catch {}
    }
  }

  // Domain-based searches
  if (type === 'domain') {
    // isMalicious
    if (apiKeys.isMalicious) {
      try {
        const data = await checkIsMalicious(query, apiKeys.isMalicious);
        if (data) {
          const severity = data.verdict === 'malicious' ? 'critical' : data.verdict === 'suspicious' ? 'high' : 'low';
          if (data.verdict === 'malicious') threatCount++;
          results.push({ source: 'isMalicious', category: 'Threat Intel', data, severity, link: data.details_url });
        }
      } catch {}
    }

    // Tirexdel for domain
    try {
      const data = await analyzeTirexdel(query, 'domain', {
        virusTotal: apiKeys.virusTotal,
        otx: apiKeys.otx,
      });
      const severity = data.overall_verdict === 'malicious' ? 'critical' : data.overall_verdict === 'suspicious' ? 'high' : 'low';
      if (data.overall_verdict === 'malicious') threatCount++;
      results.push({ source: 'Tirexdel (Multi-vendor)', category: 'IoC Analysis', data, severity });
    } catch {}
  }

  // Calculate overall risk
  let overallRisk: OsintSearchResult['summary']['overall_risk'] = 'clean';
  if (threatCount >= 3 || results.some(r => r.severity === 'critical')) overallRisk = 'critical';
  else if (threatCount >= 2 || results.some(r => r.severity === 'high')) overallRisk = 'high';
  else if (threatCount >= 1) overallRisk = 'medium';
  else if (results.length > 0) overallRisk = 'low';

  return {
    query,
    type,
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total_sources: results.length,
      threats_found: threatCount,
      overall_risk: overallRisk,
    },
  };
}
