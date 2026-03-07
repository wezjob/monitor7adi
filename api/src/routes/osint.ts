// Unified OSINT Tools API Routes
// Provides endpoints for all integrated OSINT tools
import express from 'express';
import { unifiedOsintSearch } from '../services/osintAggregator.js';
import { searchCriminalIp } from '../services/criminalIp.js';
import { checkIsMalicious } from '../services/isMalicious.js';
import { searchShodanLeaks, searchZoomEyeLeaks } from '../services/leakScope.js';
import { analyzeTirexdel } from '../services/tirexdel.js';
import { checkHaveIBeenPwned, batchCheckRansom } from '../services/haveIBeenRansom.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// Unified OSINT Search - searches all integrated tools
// POST /api/osint/search
// Body: { query: "1.2.3.4" }
// ═══════════════════════════════════════════════════════════════
router.post('/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  const apiKeys = {
    criminalIp: process.env.CRIMINALIP_API_KEY,
    isMalicious: process.env.ISMALICIOUS_API_KEY,
    shodan: process.env.SHODAN_API_KEY,
    virusTotal: process.env.VIRUSTOTAL_API_KEY,
    abuseIPDB: process.env.ABUSEIPDB_API_KEY,
    otx: process.env.OTX_API_KEY,
    hibp: process.env.HIBP_API_KEY,
  };

  const result = await unifiedOsintSearch(query, apiKeys);
  res.json(result);
});

// ═══════════════════════════════════════════════════════════════
// Individual tool endpoints
// ═══════════════════════════════════════════════════════════════

// Criminal IP - IP threat intelligence
router.get('/criminalip/:ip', async (req, res) => {
  const apiKey = process.env.CRIMINALIP_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'CRIMINALIP_API_KEY not configured' });
  const result = await searchCriminalIp(req.params.ip, apiKey);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
});

// isMalicious - Multi-source threat check
router.get('/ismalicious/:indicator', async (req, res) => {
  const apiKey = process.env.ISMALICIOUS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ISMALICIOUS_API_KEY not configured' });
  const result = await checkIsMalicious(req.params.indicator, apiKey);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
});

// LeakScope - Shodan data leak search
router.get('/leakscope/shodan', async (req, res) => {
  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'SHODAN_API_KEY not configured' });
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: 'Query parameter q required' });
  const results = await searchShodanLeaks(query, apiKey);
  res.json({ query, results, count: results.length });
});

// LeakScope - ZoomEye data leak search
router.get('/leakscope/zoomeye', async (req, res) => {
  const apiKey = process.env.ZOOMEYE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ZOOMEYE_API_KEY not configured' });
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: 'Query parameter q required' });
  const results = await searchZoomEyeLeaks(query, apiKey);
  res.json({ query, results, count: results.length });
});

// Tirexdel - Multi-vendor IoC analysis
router.post('/tirexdel/analyze', async (req, res) => {
  const { indicator, type } = req.body;
  if (!indicator) return res.status(400).json({ error: 'Indicator required' });
  const result = await analyzeTirexdel(indicator, type || 'ip', {
    virusTotal: process.env.VIRUSTOTAL_API_KEY,
    abuseIPDB: process.env.ABUSEIPDB_API_KEY,
    otx: process.env.OTX_API_KEY,
  });
  res.json(result);
});

// HaveIBeenRansom - Email breach check
router.get('/ransom/:email', async (req, res) => {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'HIBP_API_KEY not configured' });
  const result = await checkHaveIBeenPwned(req.params.email, apiKey);
  res.json(result);
});

// HaveIBeenRansom - Batch email check
router.post('/ransom/batch', async (req, res) => {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'HIBP_API_KEY not configured' });
  const { emails } = req.body;
  if (!emails || !Array.isArray(emails)) return res.status(400).json({ error: 'Emails array required' });
  const results = await batchCheckRansom(emails, apiKey);
  res.json({ results, count: results.length });
});

// ═══════════════════════════════════════════════════════════════
// Tool status - check which tools are configured
// ═══════════════════════════════════════════════════════════════
router.get('/status', (req, res) => {
  const tools = [
    { name: 'Criminal IP', key: 'CRIMINALIP_API_KEY', configured: !!process.env.CRIMINALIP_API_KEY, category: 'Threat Intel' },
    { name: 'isMalicious', key: 'ISMALICIOUS_API_KEY', configured: !!process.env.ISMALICIOUS_API_KEY, category: 'Threat Intel' },
    { name: 'Shodan (LeakScope)', key: 'SHODAN_API_KEY', configured: !!process.env.SHODAN_API_KEY, category: 'Data Leaks' },
    { name: 'ZoomEye (LeakScope)', key: 'ZOOMEYE_API_KEY', configured: !!process.env.ZOOMEYE_API_KEY, category: 'Data Leaks' },
    { name: 'VirusTotal (Tirexdel)', key: 'VIRUSTOTAL_API_KEY', configured: !!process.env.VIRUSTOTAL_API_KEY, category: 'IoC Analysis' },
    { name: 'AbuseIPDB (Tirexdel)', key: 'ABUSEIPDB_API_KEY', configured: !!process.env.ABUSEIPDB_API_KEY, category: 'IoC Analysis' },
    { name: 'OTX AlienVault (Tirexdel)', key: 'OTX_API_KEY', configured: !!process.env.OTX_API_KEY, category: 'IoC Analysis' },
    { name: 'HaveIBeenPwned', key: 'HIBP_API_KEY', configured: !!process.env.HIBP_API_KEY, category: 'Breach Data' },
  ];
  const configured = tools.filter(t => t.configured).length;
  res.json({ 
    tools, 
    summary: { total: tools.length, configured, unconfigured: tools.length - configured }
  });
});

export const osintRouter = router;
