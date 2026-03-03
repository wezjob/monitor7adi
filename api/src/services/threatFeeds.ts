import axios from 'axios';
import { logger } from '../utils/logger.js';

// ────────────────────────────────────────────
// Threat Intel Feed Aggregator
// Sources: OTX AlienVault, MISP, AbuseIPDB,
//          URLhaus, CIRCL CVE, public RSS feeds
// ────────────────────────────────────────────

export interface ThreatReport {
  id: string;
  type: 'apt' | 'malware' | 'campaign' | 'vulnerability' | 'ioc';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  indicators: string[];
  source: string;
  timestamp: string;
  tags: string[];
  ttps: string[];
  link?: string;
}

// ─── OTX AlienVault ─────────────────────────
export async function fetchOTXPulses(apiKey?: string): Promise<ThreatReport[]> {
  const reports: ThreatReport[] = [];
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) headers['X-OTX-API-KEY'] = apiKey;

    // Fetch subscribed pulses (authenticated) or modified pulses (public)
    const url = apiKey
      ? 'https://otx.alienvault.com/api/v1/pulses/subscribed?limit=20&page=1'
      : 'https://otx.alienvault.com/api/v1/pulses/activity?limit=20&page=1';

    const resp = await axios.get(url, { headers, timeout: 20000 });
    const pulses = resp.data?.results || [];

    for (const pulse of pulses.slice(0, 20)) {
      const indicators = (pulse.indicators || []).slice(0, 10).map((i: any) => i.indicator || '');
      const tags = pulse.tags || [];
      const attackIds = (pulse.attack_ids || []).map((a: any) => a.id || a);

      // Determine severity from TLP or adversary count
      let severity: ThreatReport['severity'] = 'medium';
      if (pulse.tlp === 'red' || pulse.adversary) severity = 'critical';
      else if (pulse.tlp === 'amber' || indicators.length > 5) severity = 'high';

      // Determine type
      let type: ThreatReport['type'] = 'campaign';
      const nameLower = (pulse.name || '').toLowerCase();
      if (nameLower.includes('apt') || nameLower.includes('threat actor')) type = 'apt';
      else if (nameLower.includes('malware') || nameLower.includes('ransomware') || nameLower.includes('trojan')) type = 'malware';
      else if (nameLower.includes('cve') || nameLower.includes('vuln')) type = 'vulnerability';

      reports.push({
        id: `otx-${pulse.id}`,
        type,
        severity,
        title: pulse.name || 'OTX Pulse',
        description: (pulse.description || '').slice(0, 500),
        indicators,
        source: 'OTX AlienVault',
        timestamp: pulse.created || pulse.modified || new Date().toISOString(),
        tags,
        ttps: attackIds,
        link: `https://otx.alienvault.com/pulse/${pulse.id}`,
      });
    }
    logger.info(`[OTX] Fetched ${reports.length} pulses`);
  } catch (e: any) {
    logger.error(`[OTX] Error: ${e.message}`);
  }
  return reports;
}

// ─── MISP ───────────────────────────────────
export async function fetchMISPEvents(mispUrl?: string, apiKey?: string): Promise<ThreatReport[]> {
  const reports: ThreatReport[] = [];
  if (!mispUrl || !apiKey) {
    logger.info('[MISP] Skipped: no URL or API key configured');
    return reports;
  }
  try {
    const baseUrl = mispUrl.replace(/\/+$/, '');
    const resp = await axios.post(
      `${baseUrl}/events/restSearch`,
      {
        limit: 20,
        page: 1,
        published: true,
        order: 'date desc',
      },
      {
        headers: {
          Authorization: apiKey,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const events = resp.data?.response || [];
    for (const item of events) {
      const event = item.Event || item;
      const attrs = (event.Attribute || []).slice(0, 10);
      const indicators = attrs.map((a: any) => a.value || '');
      const eventTags = (event.Tag || []).map((t: any) => t.name || '');

      // MISP threat_level_id: 1=High, 2=Medium, 3=Low, 4=Undefined
      let severity: ThreatReport['severity'] = 'medium';
      if (event.threat_level_id === '1' || event.threat_level_id === 1) severity = 'critical';
      else if (event.threat_level_id === '2' || event.threat_level_id === 2) severity = 'high';
      else if (event.threat_level_id === '3' || event.threat_level_id === 3) severity = 'medium';
      else severity = 'low';

      let type: ThreatReport['type'] = 'campaign';
      const infoLower = (event.info || '').toLowerCase();
      if (infoLower.includes('apt')) type = 'apt';
      else if (infoLower.includes('malware') || infoLower.includes('ransomware')) type = 'malware';
      else if (infoLower.includes('cve') || infoLower.includes('vuln')) type = 'vulnerability';

      reports.push({
        id: `misp-${event.id}`,
        type,
        severity,
        title: event.info || 'MISP Event',
        description: event.info || '',
        indicators,
        source: 'MISP',
        timestamp: event.date || event.timestamp || new Date().toISOString(),
        tags: eventTags,
        ttps: [],
        link: `${baseUrl}/events/view/${event.id}`,
      });
    }
    logger.info(`[MISP] Fetched ${reports.length} events`);
  } catch (e: any) {
    logger.error(`[MISP] Error: ${e.message}`);
  }
  return reports;
}

// ─── AbuseIPDB Recent Reports ───────────────
export async function fetchAbuseIPDBRecent(apiKey?: string): Promise<ThreatReport[]> {
  const reports: ThreatReport[] = [];
  if (!apiKey) return reports;
  try {
    const resp = await axios.get('https://api.abuseipdb.com/api/v2/blacklist', {
      headers: { Key: apiKey, Accept: 'application/json' },
      params: { confidenceMinimum: 90, limit: 10 },
      timeout: 15000,
    });
    const data = resp.data?.data || [];
    for (const entry of data.slice(0, 10)) {
      reports.push({
        id: `abuseipdb-${entry.ipAddress}`,
        type: 'ioc',
        severity: entry.abuseConfidenceScore >= 95 ? 'critical' : 'high',
        title: `Malicious IP: ${entry.ipAddress}`,
        description: `IP ${entry.ipAddress} flagged with ${entry.abuseConfidenceScore}% confidence. ${entry.totalReports || 0} reports from ${entry.numDistinctUsers || 0} users.`,
        indicators: [entry.ipAddress],
        source: 'AbuseIPDB',
        timestamp: entry.lastReportedAt || new Date().toISOString(),
        tags: ['Malicious IP', 'Blacklisted'],
        ttps: [],
        link: `https://www.abuseipdb.com/check/${entry.ipAddress}`,
      });
    }
    logger.info(`[AbuseIPDB] Fetched ${reports.length} entries`);
  } catch (e: any) {
    logger.error(`[AbuseIPDB] Error: ${e.message}`);
  }
  return reports;
}

// ─── URLhaus Recent Threats ─────────────────
export async function fetchURLhausRecent(): Promise<ThreatReport[]> {
  const reports: ThreatReport[] = [];
  try {
    const resp = await axios.post(
      'https://urlhaus-api.abuse.ch/v1/urls/recent/',
      'limit=15',
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
      }
    );
    const urls = resp.data?.urls || [];
    for (const entry of urls.slice(0, 15)) {
      reports.push({
        id: `urlhaus-${entry.id}`,
        type: 'ioc',
        severity: entry.threat === 'malware_download' ? 'critical' : 'high',
        title: `Malicious URL: ${entry.url_status} - ${entry.threat || 'unknown'}`,
        description: `URL: ${entry.url}\nThreat: ${entry.threat || 'N/A'}\nHost: ${entry.host || 'N/A'}`,
        indicators: [entry.url, entry.host].filter(Boolean),
        source: 'URLhaus',
        timestamp: entry.date_added || new Date().toISOString(),
        tags: (entry.tags || []).concat(entry.threat ? [entry.threat] : []),
        ttps: [],
        link: entry.urlhaus_reference || '',
      });
    }
    logger.info(`[URLhaus] Fetched ${reports.length} entries`);
  } catch (e: any) {
    logger.error(`[URLhaus] Error: ${e.message}`);
  }
  return reports;
}

// ─── CIRCL CVE Search ───────────────────────
export async function fetchRecentCVEs(): Promise<ThreatReport[]> {
  const reports: ThreatReport[] = [];
  try {
    const resp = await axios.get('https://cve.circl.lu/api/last/10', { timeout: 15000 });
    if (Array.isArray(resp.data)) {
      for (const cve of resp.data.slice(0, 10)) {
        const cvss = cve.cvss || 0;
        let severity: ThreatReport['severity'] = 'info';
        if (cvss >= 9.0) severity = 'critical';
        else if (cvss >= 7.0) severity = 'high';
        else if (cvss >= 4.0) severity = 'medium';
        else if (cvss > 0) severity = 'low';

        reports.push({
          id: `cve-${cve.id}`,
          type: 'vulnerability',
          severity,
          title: `${cve.id} — ${(cve.summary || '').slice(0, 120)}`,
          description: (cve.summary || '').slice(0, 500),
          indicators: [],
          source: 'CIRCL CVE',
          timestamp: cve.Published || cve.Modified || new Date().toISOString(),
          tags: (cve.references || []).length > 0 ? ['CVE', 'Vulnerability'] : ['CVE'],
          ttps: [],
          link: `https://cve.circl.lu/cve/${cve.id}`,
        });
      }
    }
    logger.info(`[CIRCL CVE] Fetched ${reports.length} CVEs`);
  } catch (e: any) {
    logger.error(`[CIRCL CVE] Error: ${e.message}`);
  }
  return reports;
}

// ─── AGGREGATE ALL FEEDS ────────────────────
export async function aggregateAllFeeds(): Promise<{ reports: ThreatReport[]; sources: string[]; errors: string[] }> {
  const otxKey = process.env.OTX_API_KEY || '';
  const mispUrl = process.env.MISP_URL || '';
  const mispKey = process.env.MISP_API_KEY || '';
  const abuseKey = process.env.ABUSEIPDB_API_KEY || '';

  const errors: string[] = [];
  const sourcesUsed: string[] = [];

  // Run all feeds in parallel
  const [otx, misp, abuseipdb, urlhaus, cves] = await Promise.all([
    fetchOTXPulses(otxKey).catch(e => { errors.push(`OTX: ${e.message}`); return []; }),
    fetchMISPEvents(mispUrl, mispKey).catch(e => { errors.push(`MISP: ${e.message}`); return []; }),
    fetchAbuseIPDBRecent(abuseKey).catch(e => { errors.push(`AbuseIPDB: ${e.message}`); return []; }),
    fetchURLhausRecent().catch(e => { errors.push(`URLhaus: ${e.message}`); return []; }),
    fetchRecentCVEs().catch(e => { errors.push(`CIRCL CVE: ${e.message}`); return []; }),
  ]);

  if (otx.length) sourcesUsed.push('OTX AlienVault');
  if (misp.length) sourcesUsed.push('MISP');
  if (abuseipdb.length) sourcesUsed.push('AbuseIPDB');
  if (urlhaus.length) sourcesUsed.push('URLhaus');
  if (cves.length) sourcesUsed.push('CIRCL CVE');

  const allReports = [...otx, ...misp, ...abuseipdb, ...urlhaus, ...cves];

  // Sort by timestamp (most recent first)
  allReports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  logger.info(`[Aggregator] Total: ${allReports.length} reports from ${sourcesUsed.length} sources`);

  return { reports: allReports, sources: sourcesUsed, errors };
}
