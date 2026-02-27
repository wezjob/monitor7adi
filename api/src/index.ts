import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from 'redis';
import { threatIntelRouter } from './routes/threatIntel.js';
import { vulnerabilityRouter } from './routes/vulnerability.js';
import { darkwebRouter } from './routes/darkweb.js';
import { aiRouter } from './routes/ai.js';
import { newsRouter } from './routes/news.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3101;

// Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Connected to Redis'));

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3100', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/threat-intel', threatIntelRouter);
app.use('/api/vulnerabilities', vulnerabilityRouter);
app.use('/api/darkweb', darkwebRouter);
app.use('/api/ai', aiRouter);
app.use('/api/news', newsRouter);

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // In production, these would come from real data sources
    const stats = {
      activeThreatAlerts: 47,
      newCVEs24h: 23,
      activeScans: 3,
      assetsMonitored: 1247,
      darkWebMentions: 156,
      dataLeaksDetected: 5,
      threatLevel: 'high'
    };
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching dashboard stats', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
  try {
    await redisClient.connect();
    
    app.listen(PORT, () => {
      logger.info(`Monitor7adi API running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

start();

export { redisClient };
