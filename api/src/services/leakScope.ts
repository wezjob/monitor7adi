// LeakScope - Data leakage search via Shodan/ZoomEye integration
// https://github.com/GainSec/LeakScope
import axios from 'axios';

export interface LeakScopeResult {
  target: string;
  service: string;
  exposed_data: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  ip?: string;
  port?: number;
  last_seen: string;
  details_url: string;
}

// Shodan search for data leaks
export async function searchShodanLeaks(query: string, apiKey: string): Promise<LeakScopeResult[]> {
  const results: LeakScopeResult[] = [];
  try {
    const resp = await axios.get('https://api.shodan.io/shodan/host/search', {
      params: { key: apiKey, query, minify: true },
      timeout: 20000,
    });
    const matches = resp.data?.matches || [];
    for (const match of matches.slice(0, 20)) {
      const exposed: string[] = [];
      if (match.data?.includes('password')) exposed.push('PASSWORDS');
      if (match.data?.includes('email')) exposed.push('EMAILS');
      if (match.data?.includes('api_key') || match.data?.includes('apikey')) exposed.push('API_KEYS');
      if (match.data?.includes('secret')) exposed.push('SECRETS');
      if (match.data?.includes('database')) exposed.push('DATABASE');
      
      let severity: LeakScopeResult['severity'] = 'low';
      if (exposed.includes('PASSWORDS') || exposed.includes('API_KEYS')) severity = 'critical';
      else if (exposed.includes('SECRETS') || exposed.includes('DATABASE')) severity = 'high';
      else if (exposed.length > 0) severity = 'medium';

      results.push({
        target: match.ip_str,
        service: match.product || match.transport || 'unknown',
        exposed_data: exposed,
        severity,
        ip: match.ip_str,
        port: match.port,
        last_seen: match.timestamp || new Date().toISOString(),
        details_url: `https://www.shodan.io/host/${match.ip_str}`,
      });
    }
  } catch (e) {
    // silent
  }
  return results;
}

// ZoomEye search for data leaks
export async function searchZoomEyeLeaks(query: string, apiKey: string): Promise<LeakScopeResult[]> {
  const results: LeakScopeResult[] = [];
  try {
    const resp = await axios.get('https://api.zoomeye.org/host/search', {
      params: { query },
      headers: { 'API-KEY': apiKey },
      timeout: 20000,
    });
    const matches = resp.data?.matches || [];
    for (const match of matches.slice(0, 20)) {
      const portinfo = match.portinfo || {};
      results.push({
        target: match.ip,
        service: portinfo.service || 'unknown',
        exposed_data: [],
        severity: 'medium',
        ip: match.ip,
        port: portinfo.port,
        last_seen: match.timestamp || new Date().toISOString(),
        details_url: `https://www.zoomeye.org/searchResult?q=${encodeURIComponent(query)}`,
      });
    }
  } catch (e) {
    // silent
  }
  return results;
}
