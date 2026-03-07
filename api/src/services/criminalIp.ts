// Criminal IP API integration for monitor7adi
// https://www.criminalip.io/en/developer
import axios from 'axios';

export interface CriminalIpResult {
  ip: string;
  country: string;
  asn: string;
  threat: string;
  tags: string[];
  first_seen: string;
  last_seen: string;
  sources: string[];
  details_url: string;
}

export async function searchCriminalIp(ip: string, apiKey: string): Promise<CriminalIpResult | null> {
  try {
    const resp = await axios.get('https://api.criminalip.io/v1/asset/ip/report', {
      params: { ip },
      headers: { 'x-api-key': apiKey },
      timeout: 15000,
    });
    if (!resp.data || !resp.data.data) return null;
    const d = resp.data.data;
    return {
      ip: d.ip,
      country: d.country,
      asn: d.asn,
      threat: d.threat_level,
      tags: d.tags || [],
      first_seen: d.first_seen,
      last_seen: d.last_seen,
      sources: d.sources || [],
      details_url: `https://www.criminalip.io/en/asset/ip/${d.ip}`,
    };
  } catch (e) {
    return null;
  }
}
