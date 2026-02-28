import { Router } from 'express';
import axios from 'axios';
import { logger } from '../utils/logger.js';
import { searchCensys, searchShodan, searchCrtSh, searchUrlscan, searchHackerTarget, searchWaybackMachine, searchOTX, searchCommonCrawl, searchRapidDNS } from '../services/urlSearch.js';

const router = Router();

// Get all threat intelligence
router.get('/', async (req, res) => {
  try {
    // Mock data - in production, aggregate from MISP, OTX, etc.
    const threats = [
      {
        id: '1',
        type: 'apt',
        severity: 'critical',
        title: 'APT29 (Cozy Bear) - New Campaign Targeting Government Sectors',
        description: 'Russian state-sponsored threat actor conducting sophisticated spear-phishing campaigns.',
        indicators: ['185.215.113.67', 'update-service.com'],
        source: 'MISP',
        timestamp: new Date().toISOString(),
        tags: ['APT', 'Russia', 'Spear-Phishing'],
        ttps: ['T1566.001', 'T1059.001']
      },
      {
        id: '2',
        type: 'malware',
        severity: 'high',
        title: 'LockBit 3.0 Ransomware - New Variant',
        description: 'New variant with improved evasion techniques.',
        indicators: ['bc45f23a...'],
        source: 'VirusTotal',
        timestamp: new Date().toISOString(),
        tags: ['Ransomware', 'LockBit'],
        ttps: ['T1486', 'T1490']
      }
    ];
    
    res.json(threats);
  } catch (error) {
    logger.error('Error fetching threat intel', error);
    res.status(500).json({ error: 'Failed to fetch threat intelligence' });
  }
});

// Get IOCs
router.get('/iocs', async (req, res) => {
  try {
    const iocs = [
      { id: '1', type: 'ip', value: '185.215.113.67', confidence: 95, malwareFamily: 'Cobalt Strike', tags: ['C2', 'APT29'] },
      { id: '2', type: 'domain', value: 'update-service.com', confidence: 90, tags: ['Phishing', 'APT'] },
      { id: '3', type: 'hash', value: 'bc45f23a8d912c45e6789b123456789abcdef', confidence: 100, malwareFamily: 'LockBit 3.0', tags: ['Ransomware'] }
    ];
    
    res.json(iocs);
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
