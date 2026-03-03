import axios from 'axios';
import type { ThreatIntel, IOC } from '../types';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3101'
  : '';

// Fetch aggregated threat reports from MISP, OTX, URLhaus, AbuseIPDB, CIRCL CVE
export async function fetchThreatReports(): Promise<ThreatIntel[]> {
  const resp = await axios.get(`${API_BASE}/api/threat-intel/reports`, { timeout: 60000 });
  return resp.data && Array.isArray(resp.data.reports) ? resp.data.reports : [];
}

// Fetch live IOCs extracted from all feeds
export async function fetchIOCs(): Promise<IOC[]> {
  const resp = await axios.get(`${API_BASE}/api/threat-intel/iocs`, { timeout: 60000 });
  return Array.isArray(resp.data) ? resp.data : [];
}

// Auto-refresh interval (5 minutes)
export const FEED_REFRESH_INTERVAL = 5 * 60 * 1000;
