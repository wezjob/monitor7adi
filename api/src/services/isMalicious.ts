// isMalicious API integration for monitor7adi
// https://ismalicious.com - Aggregates 500+ threat intel sources
import axios from 'axios';

export interface IsMaliciousResult {
  indicator: string;
  type: 'ip' | 'domain' | 'url' | 'hash';
  verdict: 'malicious' | 'suspicious' | 'clean' | 'unknown';
  score: number;
  sources: { name: string; verdict: string; details?: string }[];
  first_seen?: string;
  last_seen?: string;
  tags: string[];
  details_url: string;
}

export async function checkIsMalicious(indicator: string, apiKey: string): Promise<IsMaliciousResult | null> {
  try {
    const resp = await axios.post('https://api.ismalicious.com/v1/check', 
      { indicator },
      {
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000,
      }
    );
    if (!resp.data) return null;
    const d = resp.data;
    return {
      indicator: d.indicator,
      type: d.type,
      verdict: d.verdict,
      score: d.score || 0,
      sources: d.sources || [],
      first_seen: d.first_seen,
      last_seen: d.last_seen,
      tags: d.tags || [],
      details_url: `https://ismalicious.com/check/${encodeURIComponent(indicator)}`,
    };
  } catch (e) {
    return null;
  }
}
