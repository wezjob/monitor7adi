import axios from 'axios';

export interface UrlResult {
  url: string;
  domain: string;
  source: string;
  info?: string;
}

// crt.sh - Free Certificate Transparency search (no API key needed)
export async function searchCrtSh(keyword: string): Promise<UrlResult[]> {
  const results: UrlResult[] = [];
  try {
    const resp = await axios.get(
      `https://crt.sh/?q=%25${encodeURIComponent(keyword)}%25&output=json`,
      { timeout: 30000, headers: { Accept: 'application/json' } }
    );
    if (Array.isArray(resp.data)) {
      const seen = new Set<string>();
      for (const entry of resp.data.slice(0, 200)) {
        const names = (entry.name_value || '').split('\n');
        const commonName = entry.common_name || '';
        const allNames = [...names, commonName];
        for (const raw of allNames) {
          const domain = raw.toLowerCase().trim();
          if (domain && domain.includes(keyword.toLowerCase()) && !seen.has(domain) && !domain.startsWith('*')) {
            seen.add(domain);
            results.push({
              url: `https://${domain}`,
              domain,
              source: 'crt.sh',
              info: entry.issuer_name ? `Issuer: ${entry.issuer_name}` : undefined,
            });
          }
        }
      }
    }
    console.log(`[crt.sh] Found ${results.length} results for "${keyword}"`);
  } catch (e: any) {
    console.error(`[crt.sh] Error: ${e.message}`);
    throw new Error(`crt.sh: ${e.message}`);
  }
  return results;
}

// urlscan.io - Free public search (no API key needed for search)
export async function searchUrlscan(keyword: string): Promise<UrlResult[]> {
  const results: UrlResult[] = [];
  try {
    const resp = await axios.get(
      `https://urlscan.io/api/v1/search/?q=${encodeURIComponent(keyword)}&size=100`,
      { timeout: 15000, headers: { Accept: 'application/json' } }
    );
    if (resp.data && Array.isArray(resp.data.results)) {
      const seen = new Set<string>();
      for (const r of resp.data.results) {
        const pageUrl = r.page?.url || r.task?.url || '';
        const domain = r.page?.domain || '';
        if (pageUrl && !seen.has(pageUrl)) {
          seen.add(pageUrl);
          results.push({
            url: pageUrl,
            domain,
            source: 'urlscan.io',
            info: r.page?.server || r.page?.title || undefined,
          });
        }
      }
    }
    console.log(`[urlscan.io] Found ${results.length} results for "${keyword}"`);
  } catch (e: any) {
    console.error(`[urlscan.io] Error: ${e.message}`);
    throw new Error(`urlscan.io: ${e.message}`);
  }
  return results;
}

// HackerTarget - Free subdomain search (no API key)
export async function searchHackerTarget(keyword: string): Promise<UrlResult[]> {
  const results: UrlResult[] = [];
  try {
    const resp = await axios.get(`https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(keyword)}`, {
      timeout: 15000,
    });
    if (typeof resp.data === 'string' && !resp.data.includes('error')) {
      const lines = resp.data.trim().split('\n');
      const seen = new Set<string>();
      for (const line of lines.slice(0, 100)) {
        const [host, ip] = line.split(',');
        if (host && host.includes(keyword.toLowerCase()) && !seen.has(host.trim())) {
          seen.add(host.trim());
          results.push({
            url: `https://${host.trim()}`,
            domain: host.trim(),
            source: 'HackerTarget',
            info: ip ? `IP: ${ip.trim()}` : undefined,
          });
        }
      }
    }
    console.log(`[HackerTarget] Found ${results.length} results for "${keyword}"`);
  } catch (e: any) {
    console.error(`[HackerTarget] Error: ${e.message}`);
    throw new Error(`HackerTarget: ${e.message}`);
  }
  return results;
}

// Shodan search - uses /dns/domain which works on free tier
export async function searchShodan(keyword: string, apiKey: string): Promise<UrlResult[]> {
  const results: UrlResult[] = [];
  try {
    // Try DNS domain lookup (free tier compatible)
    const resp = await axios.get(`https://api.shodan.io/dns/domain/${encodeURIComponent(keyword)}`, {
      params: { key: apiKey },
      timeout: 15000,
    });
    if (resp.data) {
      const domain = resp.data.domain || keyword;
      const seen = new Set<string>();
      if (Array.isArray(resp.data.subdomains)) {
        for (const sub of resp.data.subdomains.slice(0, 50)) {
          const fullDomain = `${sub}.${domain}`;
          if (!seen.has(fullDomain)) {
            seen.add(fullDomain);
            results.push({
              url: `https://${fullDomain}`,
              domain: fullDomain,
              source: 'Shodan',
              info: `Subdomain of ${domain}`,
            });
          }
        }
      }
    }
    console.log(`[Shodan] Found ${results.length} results for "${keyword}"`);
  } catch (e: any) {
    const msg = e.response?.data?.error || e.message;
    console.error(`[Shodan] Error: ${msg}`);
    throw new Error(`Shodan: ${msg}`);
  }
  return results;
}

// Censys search (API key required)
export async function searchCensys(keyword: string, apiId: string, apiSecret: string): Promise<UrlResult[]> {
  const results: UrlResult[] = [];
  try {
    const auth = Buffer.from(`${apiId}:${apiSecret}`).toString('base64');
    const resp = await axios.get('https://search.censys.io/api/v2/hosts/search', {
      params: { q: `services.http.response.html_title:"${keyword}"`, per_page: 25 },
      headers: { Authorization: `Basic ${auth}` },
      timeout: 15000,
    });
    if (resp.data?.result?.hits) {
      const seen = new Set<string>();
      for (const hit of resp.data.result.hits) {
        const ip = hit.ip;
        if (hit.services) {
          for (const svc of hit.services) {
            const port = svc.port || 80;
            const key = `${ip}:${port}`;
            if (!seen.has(key)) {
              seen.add(key);
              const scheme = port === 443 ? 'https' : 'http';
              results.push({
                url: `${scheme}://${ip}${port !== 80 && port !== 443 ? ':' + port : ''}`,
                domain: ip,
                source: 'Censys',
                info: `Port ${port} | ${svc.service_name || 'HTTP'}`,
              });
            }
          }
        }
      }
    }
    console.log(`[Censys] Found ${results.length} results for "${keyword}"`);
  } catch (e: any) {
    const msg = e.response?.data?.error || e.response?.status || e.message;
    console.error(`[Censys] Error: ${msg}`);
    throw new Error(`Censys: ${msg}`);
  }
  return results;
}
