// Tirexdel - IoC analysis via multiple vendors
// Aggregates: VirusTotal, AbuseIPDB, OTX, IBM X-Force, etc.
import axios from 'axios';

export interface TirexdelResult {
  indicator: string;
  type: 'ip' | 'domain' | 'url' | 'hash';
  verdicts: {
    source: string;
    verdict: 'malicious' | 'suspicious' | 'clean' | 'unknown';
    score?: number;
    details?: string;
  }[];
  overall_verdict: 'malicious' | 'suspicious' | 'clean' | 'unknown';
  confidence: number;
  tags: string[];
}

// Check IP via VirusTotal
async function checkVirusTotal(indicator: string, apiKey: string): Promise<any> {
  try {
    const resp = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${indicator}`, {
      headers: { 'x-apikey': apiKey },
      timeout: 15000,
    });
    const stats = resp.data?.data?.attributes?.last_analysis_stats || {};
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    let verdict: 'malicious' | 'suspicious' | 'clean' | 'unknown' = 'clean';
    if (malicious > 0) verdict = 'malicious';
    else if (suspicious > 0) verdict = 'suspicious';
    return { source: 'VirusTotal', verdict, score: malicious + suspicious, details: `${malicious} malicious, ${suspicious} suspicious` };
  } catch { return null; }
}

// Check IP via AbuseIPDB
async function checkAbuseIPDB(ip: string, apiKey: string): Promise<any> {
  try {
    const resp = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      params: { ipAddress: ip, maxAgeInDays: 90 },
      headers: { Key: apiKey, Accept: 'application/json' },
      timeout: 15000,
    });
    const data = resp.data?.data || {};
    const score = data.abuseConfidenceScore || 0;
    let verdict: 'malicious' | 'suspicious' | 'clean' | 'unknown' = 'clean';
    if (score >= 80) verdict = 'malicious';
    else if (score >= 30) verdict = 'suspicious';
    return { source: 'AbuseIPDB', verdict, score, details: `Confidence: ${score}%, Reports: ${data.totalReports || 0}` };
  } catch { return null; }
}

// Check via OTX AlienVault
async function checkOTX(indicator: string, apiKey?: string): Promise<any> {
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) headers['X-OTX-API-KEY'] = apiKey;
    const resp = await axios.get(`https://otx.alienvault.com/api/v1/indicators/IPv4/${indicator}/general`, {
      headers, timeout: 15000,
    });
    const pulseCount = resp.data?.pulse_info?.count || 0;
    let verdict: 'malicious' | 'suspicious' | 'clean' | 'unknown' = 'clean';
    if (pulseCount >= 5) verdict = 'malicious';
    else if (pulseCount >= 1) verdict = 'suspicious';
    return { source: 'OTX AlienVault', verdict, score: pulseCount, details: `${pulseCount} pulses` };
  } catch { return null; }
}

// Aggregate IoC analysis
export async function analyzeTirexdel(
  indicator: string, 
  type: 'ip' | 'domain' | 'url' | 'hash',
  apiKeys: { virusTotal?: string; abuseIPDB?: string; otx?: string }
): Promise<TirexdelResult> {
  const verdicts: TirexdelResult['verdicts'] = [];
  
  // Run checks in parallel
  const checks = [];
  if (apiKeys.virusTotal) checks.push(checkVirusTotal(indicator, apiKeys.virusTotal));
  if (apiKeys.abuseIPDB && type === 'ip') checks.push(checkAbuseIPDB(indicator, apiKeys.abuseIPDB));
  if (apiKeys.otx || true) checks.push(checkOTX(indicator, apiKeys.otx)); // OTX has free tier
  
  const results = await Promise.all(checks);
  for (const r of results) {
    if (r) verdicts.push(r);
  }
  
  // Calculate overall verdict
  const maliciousCount = verdicts.filter(v => v.verdict === 'malicious').length;
  const suspiciousCount = verdicts.filter(v => v.verdict === 'suspicious').length;
  let overall: TirexdelResult['overall_verdict'] = 'clean';
  if (maliciousCount >= 2 || (maliciousCount >= 1 && suspiciousCount >= 1)) overall = 'malicious';
  else if (maliciousCount >= 1 || suspiciousCount >= 2) overall = 'suspicious';
  else if (verdicts.length === 0) overall = 'unknown';
  
  const confidence = verdicts.length > 0 ? Math.round((verdicts.filter(v => v.verdict !== 'unknown').length / verdicts.length) * 100) : 0;
  
  return {
    indicator,
    type,
    verdicts,
    overall_verdict: overall,
    confidence,
    tags: overall === 'malicious' ? ['THREAT', 'BLOCK'] : overall === 'suspicious' ? ['INVESTIGATE'] : [],
  };
}
