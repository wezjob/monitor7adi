import axios from 'axios';

export interface UrlResult {
  url: string;
  domain: string;
  source: string;
  info?: string;
}

// ─── 1. crt.sh — Certificate Transparency (free, no key) ───
export async function searchCrtSh(keyword: string): Promise<UrlResult[]> {
  const results: UrlResult[] = [];
  try {
    const resp = await axios.get(
      `https://crt.sh/?q=%25${encodeURIComponent(keyword)}%25&output=json`,
      { timeout: 30000, headers: { Accept: 'application/json' } }
    );
    if (Array.isArray(resp.data)) {
      const seen = new Set<string>();
      for (const entry of resp.data.slice(0, 300)) {
        const names = (entry.name_value || '').split('\n');
        const commonName = entry.common_name || '';
        for (const raw of [...names, commonName]) {
          const domain = raw.toLowerCase().trim();
          if (domain && domain.includes(keyword.toLowerCase()) && !seen.has(domain) && !domain.startsWith('*')) {
            seen.add(domain);
            results.push({
              url: `https://${domain}`,
              domain,
              source: 'crt.sh',
              info: entry.issuer_name ? `Cert: ${entry.issuer_name.slice(0, 60)}` : undefined,
            });
          }
        }
      }
    }
    console.log(`[crt.sh] ${results.length} results`);
  } catch (e: any) {
    console.error(`[crt.sh] ${e.message}`);
    throw new Error(`crt.sh: ${e.message}`);
  }
  return results;
}

// ─── 2. urlscan.io — Public URL scans (free, no key) ───
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
            info: r.page?.title || r.page?.server || undefined,
          });
        }
      }
    }
    console.log(`[urlscan.io] ${results.length} results`);
  } catch (e: any) {
    console.error(`[urlscan.io] ${e.message}`);
    throw new Error(`urlscan.io: ${e.message}`);
  }
  return results;
}

// ─── 3. HackerTarget — Subdomain enumeration (free, no key) ───
export async function searchHackerTarget(keyword: string): Promise<UrlResult[]> {
  const results: UrlResult[] = [];
  try {
    const resp = await axios.get(
      `https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(keyword)}`,
      { timeout: 15000 }
    );
    if (typeof resp.data === 'string' && !resp.data.includes('error') && !resp.data.includes('API count')) {
      const lines = resp.data.trim().split('\n');
      const seen = new Set<string>();
      for (const line of lines.slice(0, 200)) {
        const [host, ip] = line.split(',');
        if (host && !seen.has(host.trim())) {
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
    console.log(`[HackerTarget] ${results.length} results`);
  } catch (e: any) {
    console.error(`[HackerTarget] ${e.message}`);
    throw new Error(`HackerTarget: ${e.message}`);
  }
  return results;
}

// ─── 4. Wayback Machine CDX — All archived URLs ever (free, no key) ───
export async function searchWaybackMachine(keyword: string): Promise<UrlResult[]> {
  const results: UrlResult[] = [];
  try {
    // CDX API: use matchType=domain to find all pages from domains matching keyword
    // Also try keyword as prefix for broader results
    const queries = [
      { url: keyword, matchType: 'domain' },
      { url: `${keyword}.`, matchType: 'prefix' },
    ];
    let allData: any[] = [];
    for (const q of queries) {
      try {
        const r = await axios.get('https://web.archive.org/cdx/search/cdx', {
          params: { ...q, output: 'json', limit: 150, fl: 'original,timestamp', collapse: 'urlkey' },
          timeout: 20000,
        });
        if (Array.isArray(r.data) && r.data.length > 1) {
          allData = allData.concat(r.data.slice(1));
        }
      } catch {}
    }
    const resp = { data: [['original','timestamp'], ...allData] };
    if (Array.isArray(resp.data) && resp.data.length > 1) {
      const seen = new Set<string>();
      // First row is headers: ["original","timestamp","statuscode"]
      for (const row of resp.data.slice(1)) {
        const originalUrl = row[0];
        const timestamp = row[1];
        if (originalUrl && !seen.has(originalUrl)) {
          seen.add(originalUrl);
          let domain = '';
          try { domain = new URL(originalUrl).hostname; } catch { domain = originalUrl; }
          const year = timestamp ? timestamp.substring(0, 4) : '';
          results.push({
            url: originalUrl,
            domain,
            source: 'Wayback Machine',
            info: year ? `Archived: ${year}` : undefined,
          });
        }
      }
    }
    console.log(`[Wayback] ${results.length} results`);
  } catch (e: any) {
    console.error(`[Wayback] ${e.message}`);
    throw new Error(`Wayback Machine: ${e.message}`);
  }
  return results;
}

// ─── 5. RapidDNS — Subdomain enumeration (free, no key) ───
export async function searchRapidDNS(keyword: string): Promise<UrlResult[]> {
  const results: UrlResult[] = [];
  try {
    const resp = await axios.get(`https://rapiddns.io/subdomain/${encodeURIComponent(keyword)}?full=1`, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
    });
    if (typeof resp.data === 'string') {
      // Parse HTML table rows for subdomains
      const regex = /td>([a-zA-Z0-9][a-zA-Z0-9._-]+\.[a-zA-Z]{2,})<\/td/g;
      const seen = new Set<string>();
      let match;
      while ((match = regex.exec(resp.data)) !== null) {
        const domain = match[1].toLowerCase().trim();
        if (domain.includes(keyword.toLowerCase()) && !seen.has(domain)) {
          seen.add(domain);
          results.push({
            url: `https://${domain}`,
            domain,
            source: 'RapidDNS',
          });
        }
      }
    }
    console.log(`[RapidDNS] ${results.length} results`);
  } catch (e: any) {
    console.error(`[RapidDNS] ${e.message}`);
    throw new Error(`RapidDNS: ${e.message}`);
  }
  return results;
}

// ─── 6. AlienVault OTX — Threat intel (free, public indicator search) ───
export async function searchOTX(keyword: string): Promise<UrlResult[]> {
  const results: UrlResult[] = [];
  try {
    // Use the public indicator URL list for a domain (works without API key)
    const resp = await axios.get(
      `https://otx.alienvault.com/api/v1/indicators/domain/${encodeURIComponent(keyword)}/url_list`,
      { timeout: 15000, headers: { Accept: 'application/json' } }
    );
    if (resp.data && Array.isArray(resp.data.url_list)) {
      const seen = new Set<string>();
      for (const entry of resp.data.url_list.slice(0, 200)) {
        const url = entry.url;
        if (url && !seen.has(url)) {
          seen.add(url);
          let domain = keyword;
          try { domain = new URL(url).hostname; } catch {}
          results.push({
            url,
            domain,
            source: 'AlienVault OTX',
            info: entry.httpcode ? `HTTP ${entry.httpcode}` : undefined,
          });
        }
      }
    }
    console.log(`[OTX] ${results.length} results`);
  } catch (e: any) {
    console.error(`[OTX] ${e.message}`);
    throw new Error(`AlienVault OTX: ${e.message}`);
  }
  return results;
}

// ─── 7. CommonCrawl Index — URLs from latest web crawl (free, no key) ───
export async function searchCommonCrawl(keyword: string): Promise<UrlResult[]> {
  const results: UrlResult[] = [];
  try {
    // Use the latest Common Crawl index
    const indexResp = await axios.get('https://index.commoncrawl.org/collinfo.json', { timeout: 10000 });
    const latestIndex = Array.isArray(indexResp.data) && indexResp.data.length > 0
      ? indexResp.data[0]['cdx-api']
      : null;
    if (!latestIndex) return results;

    // CommonCrawl needs domain-style queries: *.keyword.tld
    // Try common TLDs and the keyword as a domain
    const tlds = ['com', 'net', 'org', 'ma', 'fr', 'io', 'co'];
    const seen = new Set<string>();

    const queries = [
      `*.${keyword}.com`,
      `*.${keyword}.net`,
      `*.${keyword}.org`,
      `*.${keyword}.ma`,
      `*.${keyword}.fr`,
    ];

    for (const q of queries) {
      try {
        const resp = await axios.get(latestIndex, {
          params: { url: q, output: 'json', limit: 30 },
          timeout: 15000,
          validateStatus: (s: number) => s < 500,
        });
        if (resp.status !== 404 && typeof resp.data === 'string') {
          const lines = resp.data.trim().split('\n');
          for (const line of lines) {
            try {
              const obj = JSON.parse(line);
              const url = obj.url;
              if (url && !seen.has(url)) {
                seen.add(url);
                let domain = '';
                try { domain = new URL(url).hostname; } catch { domain = url; }
                results.push({
                  url,
                  domain,
                  source: 'CommonCrawl',
                  info: obj.mime ? `Type: ${obj.mime}` : undefined,
                });
              }
            } catch {}
          }
        }
      } catch {}
      if (results.length >= 100) break;
    }
    console.log(`[CommonCrawl] ${results.length} results`);
  } catch (e: any) {
    console.error(`[CommonCrawl] ${e.message}`);
    throw new Error(`CommonCrawl: ${e.message}`);
  }
  return results;
}

// ─── 8. Shodan DNS (free tier compatible) ───
export async function searchShodan(keyword: string, apiKey: string): Promise<UrlResult[]> {
  const results: UrlResult[] = [];
  try {
    const resp = await axios.get(`https://api.shodan.io/dns/domain/${encodeURIComponent(keyword)}`, {
      params: { key: apiKey },
      timeout: 15000,
    });
    if (resp.data) {
      const domain = resp.data.domain || keyword;
      const seen = new Set<string>();
      if (Array.isArray(resp.data.subdomains)) {
        for (const sub of resp.data.subdomains.slice(0, 100)) {
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
    console.log(`[Shodan] ${results.length} results`);
  } catch (e: any) {
    const msg = e.response?.data?.error || e.message;
    console.error(`[Shodan] ${msg}`);
    throw new Error(`Shodan: ${msg}`);
  }
  return results;
}

// ─── 8. Censys (API key required) ───
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
    console.log(`[Censys] ${results.length} results`);
  } catch (e: any) {
    const msg = e.response?.data?.error || e.response?.status || e.message;
    console.error(`[Censys] ${msg}`);
    throw new Error(`Censys: ${msg}`);
  }
  return results;
}
