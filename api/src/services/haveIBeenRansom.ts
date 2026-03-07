// HaveIBeenRansom - Check if email appears in infostealer/ransomware leaks
// https://haveibeenransom.com
import axios from 'axios';

export interface RansomCheckResult {
  email: string;
  found: boolean;
  leak_sources: {
    name: string;
    date: string;
    type: 'ransomware' | 'infostealer' | 'breach';
    severity: 'critical' | 'high' | 'medium';
  }[];
  recommendations: string[];
  details_url: string;
}

// Check email against HaveIBeenPwned (most comprehensive breach database)
export async function checkHaveIBeenPwned(email: string, apiKey: string): Promise<RansomCheckResult> {
  const result: RansomCheckResult = {
    email,
    found: false,
    leak_sources: [],
    recommendations: [],
    details_url: `https://haveibeenpwned.com/account/${encodeURIComponent(email)}`,
  };
  
  try {
    const resp = await axios.get(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
      headers: { 
        'hibp-api-key': apiKey,
        'user-agent': 'monitor7adi'
      },
      params: { truncateResponse: false },
      timeout: 15000,
    });
    
    const breaches = resp.data || [];
    result.found = breaches.length > 0;
    
    for (const breach of breaches.slice(0, 10)) {
      let type: 'ransomware' | 'infostealer' | 'breach' = 'breach';
      let severity: 'critical' | 'high' | 'medium' = 'medium';
      
      const name = (breach.Name || '').toLowerCase();
      if (name.includes('stealer') || name.includes('redline') || name.includes('raccoon') || name.includes('vidar')) {
        type = 'infostealer';
        severity = 'critical';
      } else if (name.includes('ransom') || name.includes('lockbit') || name.includes('alphv') || name.includes('clop')) {
        type = 'ransomware';
        severity = 'critical';
      } else if (breach.IsVerified && breach.IsSensitive) {
        severity = 'high';
      }
      
      result.leak_sources.push({
        name: breach.Name,
        date: breach.BreachDate,
        type,
        severity,
      });
    }
    
    // Add recommendations based on findings
    if (result.leak_sources.some(s => s.type === 'infostealer')) {
      result.recommendations.push('URGENT: Change all passwords immediately');
      result.recommendations.push('Enable MFA on all accounts');
      result.recommendations.push('Scan devices for malware');
      result.recommendations.push('Revoke all active sessions');
    } else if (result.leak_sources.some(s => s.type === 'ransomware')) {
      result.recommendations.push('URGENT: Monitor for identity theft');
      result.recommendations.push('Change passwords for affected services');
      result.recommendations.push('Enable credit monitoring');
    } else if (result.found) {
      result.recommendations.push('Change password for breached service');
      result.recommendations.push('Enable MFA where available');
    }
    
  } catch (e: any) {
    if (e.response?.status === 404) {
      // Not found = good news
      result.found = false;
    }
  }
  
  return result;
}

// Check multiple emails in batch
export async function batchCheckRansom(
  emails: string[], 
  apiKey: string
): Promise<RansomCheckResult[]> {
  const results: RansomCheckResult[] = [];
  for (const email of emails.slice(0, 10)) { // Limit to 10 for rate limiting
    const result = await checkHaveIBeenPwned(email, apiKey);
    results.push(result);
    // Rate limiting: HIBP requires 1.5s between requests
    await new Promise(resolve => setTimeout(resolve, 1600));
  }
  return results;
}
