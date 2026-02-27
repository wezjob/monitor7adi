import { Router } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();

// Get dark web mentions
router.get('/mentions', async (req, res) => {
  try {
    const { limit = 20, source } = req.query;
    
    const mentions = [
      {
        id: '1',
        source: 'forum',
        title: 'New 0-day exploit for Cisco ASA being sold',
        content: 'Threat actor selling new RCE exploit for Cisco ASA firewalls...',
        timestamp: new Date().toISOString(),
        relevanceScore: 95,
        keywords: ['cisco', '0-day', 'exploit']
      },
      {
        id: '2',
        source: 'marketplace',
        title: 'Corporate VPN credentials - Fortune 500',
        content: 'Selling access to corporate VPN for multiple Fortune 500 companies...',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        relevanceScore: 88,
        keywords: ['vpn', 'access', 'corporate']
      },
      {
        id: '3',
        source: 'telegram',
        title: 'New ransomware affiliate program',
        content: 'BlackSun ransomware group recruiting affiliates...',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        relevanceScore: 82,
        keywords: ['ransomware', 'affiliate']
      }
    ];
    
    let filtered = mentions;
    if (source) {
      filtered = mentions.filter(m => m.source === source);
    }
    
    res.json(filtered.slice(0, Number(limit)));
  } catch (error) {
    logger.error('Error fetching dark web mentions', error);
    res.status(500).json({ error: 'Failed to fetch dark web mentions' });
  }
});

// Get data leaks
router.get('/leaks', async (req, res) => {
  try {
    const leaks = [
      {
        id: '1',
        name: 'MegaCorp Healthcare 2024',
        description: 'Healthcare provider breach affecting patient records',
        recordCount: 12500000,
        exposedData: ['Email', 'Name', 'SSN', 'Medical Records'],
        dateDiscovered: '2024-02-25',
        source: 'Dark Web Forum',
        severity: 'critical'
      },
      {
        id: '2',
        name: 'TechGiant Employee Database',
        description: 'Leaked internal employee database',
        recordCount: 245000,
        exposedData: ['Email', 'Password Hash', 'Employee ID'],
        dateDiscovered: '2024-02-24',
        source: 'Telegram Channel',
        severity: 'high'
      }
    ];
    
    res.json(leaks);
  } catch (error) {
    logger.error('Error fetching data leaks', error);
    res.status(500).json({ error: 'Failed to fetch data leaks' });
  }
});

// Check email/domain in breaches
router.get('/check/:type/:value', async (req, res) => {
  try {
    const { type, value } = req.params;
    
    // In production, check against Have I Been Pwned API etc.
    const result = {
      query: value,
      type,
      breachCount: type === 'email' ? 3 : 12,
      breaches: [
        { name: 'Breach A', date: '2024-01-15', dataTypes: ['Email', 'Password'] },
        { name: 'Breach B', date: '2023-11-20', dataTypes: ['Email', 'Name'] }
      ],
      lastBreach: '2024-01-15',
      passwordExposed: true
    };
    
    res.json(result);
  } catch (error) {
    logger.error('Error checking breach status', error);
    res.status(500).json({ error: 'Failed to check breach status' });
  }
});

// Get monitored keywords
router.get('/keywords', async (req, res) => {
  try {
    const keywords = [
      { id: '1', keyword: 'company.com', type: 'domain', alertCount: 5 },
      { id: '2', keyword: 'MyBrand', type: 'brand', alertCount: 2 },
      { id: '3', keyword: 'CEO Name', type: 'executive', alertCount: 0 }
    ];
    
    res.json(keywords);
  } catch (error) {
    logger.error('Error fetching keywords', error);
    res.status(500).json({ error: 'Failed to fetch keywords' });
  }
});

// Add keyword to monitor
router.post('/keywords', async (req, res) => {
  try {
    const { keyword, type } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }
    
    const newKeyword = {
      id: `kw-${Date.now()}`,
      keyword,
      type: type || 'general',
      alertCount: 0,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json(newKeyword);
  } catch (error) {
    logger.error('Error adding keyword', error);
    res.status(500).json({ error: 'Failed to add keyword' });
  }
});

export { router as darkwebRouter };
