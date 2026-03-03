import { Router } from 'express';
import axios from 'axios';
import { logger } from '../utils/logger.js';
import { searchCensys, searchShodan, searchCrtSh, searchUrlscan, searchHackerTarget, searchWaybackMachine, searchOTX, searchCommonCrawl, searchRapidDNS } from '../services/urlSearch.js';
import { aggregateAllFeeds } from '../services/threatFeeds.js';

const router = Router();

// Get all threat intelligence (live feeds)
router.get('/', async (req, res) => {
  try {
    const { reports, sources, errors } = await aggregateAllFeeds();
    res.json(reports);
  } catch (error) {
    logger.error('Error fetching threat intel', error);
    res.status(500).json({ error: 'Failed to fetch threat intelligence' });
  }
});

// Get threat reports (used by frontend Sync Feeds)
router.get('/reports', async (req, res) => {
  try {
    const { reports, sources, errors } = await aggregateAllFeeds();
    logger.info(`[/reports] Returning ${reports.length} reports from: ${sources.join(', ')}`);
    res.json({ reports, sources, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    logger.error('Error fetching threat reports', error);
    res.status(500).json({ error: 'Failed to fetch threat reports' });
  }
});

// Get IOCs (extracted from live feeds)
router.get('/iocs', async (req, res) => {
  try {
    const { reports } = await aggregateAllFeeds();
    // Extract IOCs from all reports
    const iocs: any[] = [];
    let idCounter = 1;
    for (const report of reports) {
      for (const indicator of report.indicators) {
        if (!indicator) continue;
        let type: string = 'unknown';
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(indicator)) type = 'ip';
        else if (/^https?:\/\//.test(indicator)) type = 'url';
        else if (/^[a-fA-F0-9]{32,}$/.test(indicator)) type = 'hash';
        else if (indicator.includes('.') && !indicator.includes('/')) type = 'domain';
        else type = 'other';

        iocs.push({
          id: String(idCounter++),
          type,
          value: indicator,
          confidence: report.severity === 'critical' ? 95 : report.severity === 'high' ? 85 : 70,
          malwareFamily: report.type === 'malware' ? report.title.split(' ')[0] : undefined,
          tags: report.tags.slice(0, 3),
          firstSeen: report.timestamp,
          lastSeen: report.timestamp,
          source: report.source,
        });
      }
    }
    // Deduplicate by value
    const seen = new Set<string>();
    const deduped = iocs.filter(ioc => {
      if (seen.has(ioc.value)) return false;
      seen.add(ioc.value);
      return true;
    });
    res.json(deduped.slice(0, 50));
  } catch (error) {
    logger.error('Error fetching IOCs', error);
    res.status(500).json({ error: 'Failed to fetch IOCs' });
  }
});

// Search IOC
router.get('/search/:ioc', async (req, res) => {
  try {
    const { ioc } = req.params;
    
    // In production, search across multiple threat intel sources
    const results = {
      query: ioc,
      found: true,
      sources: [
        { name: 'VirusTotal', detected: true, malicious: 45, total: 70 },
        { name: 'AbuseIPDB', detected: true, confidence: 85 },
        { name: 'Shodan', ports: [22, 80, 443] }
      ],
      relatedThreats: ['APT29', 'Cobalt Strike'],
      firstSeen: '2024-02-20',
      lastSeen: '2024-02-26'
    };
    
    res.json(results);
  } catch (error) {
    logger.error('Error searching IOC', error);
    res.status(500).json({ error: 'Failed to search IOC' });
  }
});

// VirusTotal lookup (requires API key)
router.get('/virustotal/:type/:value', async (req, res) => {
  try {
    const { type, value } = req.params;
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'VirusTotal API key not configured' });
    }
    
    let endpoint = '';
    switch (type) {
      case 'ip':
        endpoint = `https://www.virustotal.com/api/v3/ip_addresses/${value}`;
        break;
      case 'domain':
        endpoint = `https://www.virustotal.com/api/v3/domains/${value}`;
        break;
      case 'hash':
        endpoint = `https://www.virustotal.com/api/v3/files/${value}`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid type' });
    }
    
    const response = await axios.get(endpoint, {
      headers: { 'x-apikey': apiKey }
    });
    
    res.json(response.data);
  } catch (error) {
    logger.error('VirusTotal lookup error', error);
    res.status(500).json({ error: 'VirusTotal lookup failed' });
  }
});

// Real URL search — 8 sources, free ones run in parallel
router.get('/urlsearch', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({ error: 'Missing keyword' });
    }
    const censysId = process.env.CENSYS_API_ID || '';
    const censysSecret = process.env.CENSYS_API_SECRET || '';
    const shodanKey = process.env.SHODAN_API_KEY || '';
    let results: { url: string; domain: string; source: string; info?: string }[] = [];
    const errors: string[] = [];

    // Helper to wrap a search and collect errors
    const wrap = async (name: string, fn: () => Promise<{ url: string; domain: string; source: string; info?: string }[]>) => {
      try {
        logger.info(`[urlsearch] Querying ${name} for "${keyword}"...`);
        const r = await fn();
        logger.info(`[urlsearch] ${name}: ${r.length} results`);
        return r;
      } catch (e: any) {
        errors.push(`${name}: ${e.message}`);
        logger.error(`${name} search error`, e.message);
        return [];
      }
    };

    // Run all free sources in PARALLEL for speed
    const freeTasks = [
      wrap('crt.sh', () => searchCrtSh(keyword)),
      wrap('urlscan.io', () => searchUrlscan(keyword)),
      wrap('HackerTarget', () => searchHackerTarget(keyword)),
      wrap('RapidDNS', () => searchRapidDNS(keyword)),
      wrap('Wayback Machine', () => searchWaybackMachine(keyword)),
      wrap('AlienVault OTX', () => searchOTX(keyword)),
      wrap('CommonCrawl', () => searchCommonCrawl(keyword)),
    ];

    // Optionally add API-key sources
    if (shodanKey) {
      freeTasks.push(wrap('Shodan', () => searchShodan(keyword, shodanKey)));
    }
    if (censysId && censysSecret) {
      freeTasks.push(wrap('Censys', () => searchCensys(keyword, censysId, censysSecret)));
    }

    const allResults = await Promise.all(freeTasks);
    for (const batch of allResults) {
      results = results.concat(batch);
    }

    // Deduplicate by url
    const deduped = Object.values(results.reduce((acc, cur) => {
      acc[cur.url] = cur;
      return acc;
    }, {} as Record<string, typeof results[0]>));

    logger.info(`[urlsearch] Total: ${deduped.length} deduplicated results for "${keyword}"`);
    res.json({ count: deduped.length, results: deduped, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    logger.error('Error in urlsearch', error);
    res.status(500).json({ error: 'Failed to search URLs' });
  }
});

export { router as threatIntelRouter };
