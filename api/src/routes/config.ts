import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

const router = Router();

// Config file path (persistent JSON)
const CONFIG_DIR = path.resolve(process.cwd(), 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// ─── Default config ─────────────────────────
interface FeedConfig {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  refreshInterval?: number; // minutes
  description: string;
  category: 'threat-intel' | 'vulnerability' | 'siem' | 'ai' | 'other';
}

interface AppConfig {
  feeds: FeedConfig[];
  notifications: {
    criticalAlerts: boolean;
    newCVEs: boolean;
    darkWebMentions: boolean;
    dataLeaks: boolean;
    scanCompletion: boolean;
    emailNotifications: boolean;
    emailAddress: string;
  };
  general: {
    refreshInterval: number; // minutes
    maxReportsPerFeed: number;
    logLevel: string;
    timezone: string;
  };
  monitoredDomains: string[];
}

function getDefaultConfig(): AppConfig {
  return {
    feeds: [
      {
        id: 'otx',
        name: 'AlienVault OTX',
        enabled: true,
        apiKey: process.env.OTX_API_KEY || '',
        description: 'Open Threat Exchange — Pulses, IOCs, TTPs communautaires',
        category: 'threat-intel',
        refreshInterval: 5,
      },
      {
        id: 'misp',
        name: 'MISP',
        enabled: false,
        apiKey: process.env.MISP_API_KEY || '',
        endpoint: process.env.MISP_URL || '',
        description: 'Malware Information Sharing Platform — Événements, attributs, galaxies',
        category: 'threat-intel',
        refreshInterval: 10,
      },
      {
        id: 'abuseipdb',
        name: 'AbuseIPDB',
        enabled: true,
        apiKey: process.env.ABUSEIPDB_API_KEY || '',
        description: 'Base de données IP malveillantes — Blacklist, rapports communautaires',
        category: 'threat-intel',
        refreshInterval: 15,
      },
      {
        id: 'urlhaus',
        name: 'URLhaus',
        enabled: true,
        apiKey: '',
        description: 'URLs malveillantes (abuse.ch) — Malware, phishing, C2. Aucune clé requise.',
        category: 'threat-intel',
        refreshInterval: 10,
      },
      {
        id: 'circl-cve',
        name: 'CIRCL CVE Search',
        enabled: true,
        apiKey: '',
        description: 'Dernières vulnérabilités CVE avec scoring CVSS. Aucune clé requise.',
        category: 'vulnerability',
        refreshInterval: 30,
      },
      {
        id: 'virustotal',
        name: 'VirusTotal',
        enabled: false,
        apiKey: process.env.VIRUSTOTAL_API_KEY || '',
        description: 'Analyse de fichiers, URLs, IPs, domaines',
        category: 'threat-intel',
        refreshInterval: 5,
      },
      {
        id: 'shodan',
        name: 'Shodan',
        enabled: false,
        apiKey: process.env.SHODAN_API_KEY || '',
        description: 'Moteur de recherche IoT — Ports ouverts, services exposés',
        category: 'other',
        refreshInterval: 60,
      },
      {
        id: 'hibp',
        name: 'Have I Been Pwned',
        enabled: false,
        apiKey: process.env.HIBP_API_KEY || '',
        description: 'Vérification de fuites de données et mots de passe compromis',
        category: 'other',
        refreshInterval: 60,
      },
      {
        id: 'elasticsearch',
        name: 'Elasticsearch / SIEM',
        enabled: false,
        apiKey: '',
        endpoint: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        description: 'Intégration SIEM — Collecte et corrélation de logs',
        category: 'siem',
        refreshInterval: 1,
      },
      {
        id: 'ollama',
        name: 'Ollama (LLM local)',
        enabled: false,
        apiKey: '',
        endpoint: process.env.OLLAMA_URL || 'http://localhost:11434',
        description: 'Analyse AI locale — Résumés, corrélations, recommandations',
        category: 'ai',
        refreshInterval: 0,
      },
    ],
    notifications: {
      criticalAlerts: true,
      newCVEs: true,
      darkWebMentions: true,
      dataLeaks: true,
      scanCompletion: false,
      emailNotifications: false,
      emailAddress: '',
    },
    general: {
      refreshInterval: 5,
      maxReportsPerFeed: 20,
      logLevel: 'info',
      timezone: 'Africa/Casablanca',
    },
    monitoredDomains: [],
  };
}

// ─── Load / Save ─────────────────────────
function loadConfig(): AppConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const saved = JSON.parse(raw);
      // Merge with defaults to add any new fields
      const defaults = getDefaultConfig();
      return {
        ...defaults,
        ...saved,
        feeds: defaults.feeds.map(df => {
          const sf = (saved.feeds || []).find((f: FeedConfig) => f.id === df.id);
          return sf ? { ...df, ...sf } : df;
        }),
        notifications: { ...defaults.notifications, ...(saved.notifications || {}) },
        general: { ...defaults.general, ...(saved.general || {}) },
      };
    }
  } catch (e: any) {
    logger.error(`[Config] Error loading config: ${e.message}`);
  }
  return getDefaultConfig();
}

function saveConfig(config: AppConfig): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    logger.info('[Config] Configuration saved successfully');

    // Also update process.env for runtime use
    for (const feed of config.feeds) {
      if (feed.apiKey) {
        switch (feed.id) {
          case 'otx': process.env.OTX_API_KEY = feed.apiKey; break;
          case 'misp': process.env.MISP_API_KEY = feed.apiKey; break;
          case 'abuseipdb': process.env.ABUSEIPDB_API_KEY = feed.apiKey; break;
          case 'virustotal': process.env.VIRUSTOTAL_API_KEY = feed.apiKey; break;
          case 'shodan': process.env.SHODAN_API_KEY = feed.apiKey; break;
          case 'hibp': process.env.HIBP_API_KEY = feed.apiKey; break;
        }
      }
      if (feed.endpoint) {
        switch (feed.id) {
          case 'misp': process.env.MISP_URL = feed.endpoint; break;
          case 'elasticsearch': process.env.ELASTICSEARCH_URL = feed.endpoint; break;
          case 'ollama': process.env.OLLAMA_URL = feed.endpoint; break;
        }
      }
    }
  } catch (e: any) {
    logger.error(`[Config] Error saving config: ${e.message}`);
    throw e;
  }
}

// ─── Routes ────────────────────────────
// GET /api/config — load full config
router.get('/', (req, res) => {
  try {
    const config = loadConfig();
    // Mask API keys for security (send only last 4 chars)
    const safeConfig = {
      ...config,
      feeds: config.feeds.map(f => ({
        ...f,
        apiKey: f.apiKey ? '●'.repeat(Math.max(0, f.apiKey.length - 4)) + f.apiKey.slice(-4) : '',
        _hasKey: !!f.apiKey && f.apiKey.length > 0,
      })),
    };
    res.json(safeConfig);
  } catch (error) {
    logger.error('Error loading config', error);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
});

// PUT /api/config — save full config
router.put('/', (req, res) => {
  try {
    const current = loadConfig();
    const incoming = req.body as Partial<AppConfig>;

    // Merge feeds: only update fields that are provided
    if (incoming.feeds) {
      for (const inFeed of incoming.feeds) {
        const idx = current.feeds.findIndex(f => f.id === inFeed.id);
        if (idx >= 0) {
          // Don't overwrite apiKey if the masked version is sent back
          if (inFeed.apiKey && inFeed.apiKey.includes('●')) {
            delete inFeed.apiKey;
          }
          current.feeds[idx] = { ...current.feeds[idx], ...inFeed };
        }
      }
    }
    if (incoming.notifications) {
      current.notifications = { ...current.notifications, ...incoming.notifications };
    }
    if (incoming.general) {
      current.general = { ...current.general, ...incoming.general };
    }
    if (incoming.monitoredDomains) {
      current.monitoredDomains = incoming.monitoredDomains;
    }

    saveConfig(current);
    res.json({ success: true, message: 'Configuration saved' });
  } catch (error) {
    logger.error('Error saving config', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// PATCH /api/config/feed/:id — update a single feed
router.patch('/feed/:id', (req, res) => {
  try {
    const config = loadConfig();
    const idx = config.feeds.findIndex(f => f.id === req.params.id);
    if (idx < 0) {
      return res.status(404).json({ error: 'Feed not found' });
    }
    const update = req.body;
    if (update.apiKey && update.apiKey.includes('●')) {
      delete update.apiKey;
    }
    config.feeds[idx] = { ...config.feeds[idx], ...update };
    saveConfig(config);
    res.json({ success: true, feed: { ...config.feeds[idx], apiKey: undefined } });
  } catch (error) {
    logger.error('Error updating feed', error);
    res.status(500).json({ error: 'Failed to update feed' });
  }
});

// POST /api/config/test-feed/:id — test a feed connection
router.post('/test-feed/:id', async (req, res) => {
  try {
    const config = loadConfig();
    const feed = config.feeds.find(f => f.id === req.params.id);
    if (!feed) {
      return res.status(404).json({ error: 'Feed not found' });
    }
    if (!feed.enabled) {
      return res.json({ success: false, message: 'Feed is disabled' });
    }

    // Quick connectivity test per feed
    const axios = (await import('axios')).default;
    let testResult = { success: false, message: '', latency: 0 };
    const start = Date.now();

    switch (feed.id) {
      case 'otx': {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (feed.apiKey) headers['X-OTX-API-KEY'] = feed.apiKey;
        const r = await axios.get('https://otx.alienvault.com/api/v1/pulses/activity?limit=1', { headers, timeout: 10000 });
        testResult = { success: r.status === 200, message: `OK — ${r.data?.count || 0} pulses disponibles`, latency: Date.now() - start };
        break;
      }
      case 'misp': {
        if (!feed.endpoint) { testResult = { success: false, message: 'No MISP URL configured', latency: 0 }; break; }
        const r = await axios.get(`${feed.endpoint.replace(/\/+$/, '')}/servers/getVersion`, {
          headers: { Authorization: feed.apiKey || '', Accept: 'application/json' },
          timeout: 10000,
        });
        testResult = { success: r.status === 200, message: `OK — MISP v${r.data?.version || '?'}`, latency: Date.now() - start };
        break;
      }
      case 'abuseipdb': {
        if (!feed.apiKey) { testResult = { success: false, message: 'No API key', latency: 0 }; break; }
        const r = await axios.get('https://api.abuseipdb.com/api/v2/check?ipAddress=8.8.8.8', {
          headers: { Key: feed.apiKey, Accept: 'application/json' },
          timeout: 10000,
        });
        testResult = { success: r.status === 200, message: 'OK — Connection established', latency: Date.now() - start };
        break;
      }
      case 'urlhaus': {
        const r = await axios.get('https://urlhaus-api.abuse.ch/v1/', { timeout: 10000 });
        testResult = { success: r.status === 200, message: 'OK — URLhaus online', latency: Date.now() - start };
        break;
      }
      case 'circl-cve': {
        const r = await axios.get('https://cve.circl.lu/api/last/1', { timeout: 10000 });
        testResult = { success: r.status === 200, message: `OK — Latest: ${r.data?.[0]?.id || '?'}`, latency: Date.now() - start };
        break;
      }
      case 'virustotal': {
        if (!feed.apiKey) { testResult = { success: false, message: 'No API key', latency: 0 }; break; }
        const r = await axios.get('https://www.virustotal.com/api/v3/ip_addresses/8.8.8.8', {
          headers: { 'x-apikey': feed.apiKey },
          timeout: 10000,
        });
        testResult = { success: r.status === 200, message: 'OK — VirusTotal reachable', latency: Date.now() - start };
        break;
      }
      case 'elasticsearch': {
        if (!feed.endpoint) { testResult = { success: false, message: 'No endpoint', latency: 0 }; break; }
        const r = await axios.get(feed.endpoint, { timeout: 10000 });
        testResult = { success: r.status === 200, message: `OK — ES v${r.data?.version?.number || '?'}`, latency: Date.now() - start };
        break;
      }
      case 'ollama': {
        if (!feed.endpoint) { testResult = { success: false, message: 'No endpoint', latency: 0 }; break; }
        const r = await axios.get(`${feed.endpoint}/api/tags`, { timeout: 10000 });
        const models = r.data?.models?.length || 0;
        testResult = { success: r.status === 200, message: `OK — ${models} model(s) disponible(s)`, latency: Date.now() - start };
        break;
      }
      default:
        testResult = { success: false, message: 'Test not implemented for this feed', latency: 0 };
    }

    res.json(testResult);
  } catch (e: any) {
    res.json({ success: false, message: e.message || 'Connection failed', latency: 0 });
  }
});

export { router as configRouter };
