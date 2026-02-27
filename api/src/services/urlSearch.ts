import axios from 'axios';

export async function searchCensys(keyword: string, apiId: string, apiSecret: string) {
  const results: { url: string; domain: string; }[] = [];
  const query = `services.http.response.body: ${keyword}`;
  const url = `https://search.censys.io/api/v2/hosts/search?q=${encodeURIComponent(query)}&per_page=20`;
  const auth = Buffer.from(`${apiId}:${apiSecret}`).toString('base64');
  const resp = await axios.get(url, {
    headers: { 'Authorization': `Basic ${auth}` }
  });
  if (resp.data && resp.data.result && resp.data.result.hits) {
    for (const hit of resp.data.result.hits) {
      if (hit.services && hit.services.length > 0) {
        for (const svc of hit.services) {
          if (svc.http && svc.http.response && svc.http.response.body && svc.http.response.body.includes(keyword)) {
            results.push({
              url: `http://${hit.ip}:${svc.port}`,
              domain: hit.ip
            });
          }
        }
      }
    }
  }
  return results;
}

export async function searchShodan(keyword: string, apiKey: string) {
  const results: { url: string; domain: string; }[] = [];
  const url = `https://api.shodan.io/shodan/host/search?key=${apiKey}&query=http.html:${encodeURIComponent(keyword)}`;
  const resp = await axios.get(url);
  if (resp.data && resp.data.matches) {
    for (const match of resp.data.matches) {
      if (match.ip_str && match.port) {
        results.push({
          url: `http://${match.ip_str}:${match.port}`,
          domain: match.ip_str
        });
      }
    }
  }
  return results;
}
