// Route: /api/criminalip/ip/:ip
import express from 'express';
import { searchCriminalIp } from '../services/criminalIp.js';

const router = express.Router();

// GET /api/criminalip/ip/:ip
router.get('/ip/:ip', async (req, res) => {
  const apiKey = process.env.CRIMINALIP_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });
  const ip = req.params.ip;
  const result = await searchCriminalIp(ip, apiKey);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
});

export default router;
