import { Router } from 'express';
import Parser from 'rss-parser';
import { logger } from '../utils/logger.js';

const router = Router();
const parser = new Parser();

// RSS feed sources
const RSS_FEEDS = [
  { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', category: 'blog' },
  { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', category: 'news' },
  { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/', category: 'news' },
  { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', category: 'news' },
  { name: 'CISA Alerts', url: 'https://www.cisa.gov/uscert/ncas/alerts.xml', category: 'gov' },
  { name: 'SecurityWeek', url: 'https://feeds.feedburner.com/securityweek', category: 'news' },
  { name: 'Threatpost', url: 'https://threatpost.com/feed/', category: 'news' },
  { name: 'SANS ISC', url: 'https://isc.sans.edu/rssfeed.xml', category: 'research' }
];

// Get all news
router.get('/', async (req, res) => {
  try {
    const { limit = 20, category } = req.query;
    
    // Fetch live RSS feeds
    const results = await Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        try {
          const data = await parser.parseURL(feed.url);
          return data.items.slice(0, 5).map(item => ({
            id: Buffer.from(item.link || item.title || '').toString('base64').slice(0, 16),
            title: item.title || 'No title',
            description: item.contentSnippet?.substring(0, 300) || item.content?.substring(0, 300) || '',
            url: item.link || '',
            source: feed.name,
            publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
            category: feed.category
          }));
        } catch {
          return [];
        }
      })
    );
    
    // Flatten and sort by date
    let news = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    // Filter by category if specified
    if (category) {
      news = news.filter(n => n.category === category);
    }
    
    res.json(news.slice(0, Number(limit)));
  } catch (error) {
    logger.error('Error fetching news', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Fetch live RSS feeds
router.get('/feeds', async (req, res) => {
  try {
    const { source } = req.query;
    
    const feeds = source 
      ? RSS_FEEDS.filter(f => f.name.toLowerCase().includes(String(source).toLowerCase()))
      : RSS_FEEDS;
    
    const results = await Promise.allSettled(
      feeds.slice(0, 3).map(async (feed) => {
        try {
          const data = await parser.parseURL(feed.url);
          return {
            source: feed.name,
            category: feed.category,
            items: data.items.slice(0, 5).map(item => ({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              contentSnippet: item.contentSnippet?.substring(0, 200)
            }))
          };
        } catch {
          return {
            source: feed.name,
            category: feed.category,
            error: 'Failed to fetch feed',
            items: []
          };
        }
      })
    );
    
    const successfulFeeds = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);
    
    res.json(successfulFeeds);
  } catch (error) {
    logger.error('Error fetching RSS feeds', error);
    res.status(500).json({ error: 'Failed to fetch RSS feeds' });
  }
});

// Get live TV channels
router.get('/live-channels', async (req, res) => {
  try {
    const channels = [
      { id: '1', name: 'Al Jazeera English', category: 'news', youtubeId: 'pV1fYVbLgwc', region: 'Qatar' },
      { id: '2', name: 'France 24', category: 'news', youtubeId: 'tkDUSYHoKxE', region: 'France' },
      { id: '3', name: 'Sky News', category: 'news', youtubeId: '9Auq9mYxFEE', region: 'UK' },
      { id: '4', name: 'Medi1 TV', category: 'regional', youtubeId: 'medi1tv', region: 'Morocco' },
      { id: '5', name: '2M Maroc', category: 'regional', youtubeId: '2MMaroc', region: 'Morocco' },
      { id: '6', name: 'Bloomberg Technology', category: 'tech', youtubeId: 'dp8PhLsUcFE', region: 'USA' }
    ];
    
    res.json(channels);
  } catch (error) {
    logger.error('Error fetching live channels', error);
    res.status(500).json({ error: 'Failed to fetch live channels' });
  }
});

// Get feed sources
router.get('/sources', (req, res) => {
  res.json(RSS_FEEDS);
});

export { router as newsRouter };
