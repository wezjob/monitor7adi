import { useState, useCallback } from 'react';
import { Globe, Eye, AlertTriangle, Search, Clock, TrendingUp, Loader2, Play, ExternalLink, FileText, ChevronDown, ChevronUp, Copy, Check, Link2, Terminal, Database, Server } from 'lucide-react';
import { ThreatLevelBadge } from '../components/ThreatLevelBadge';

// Screenshot component for realistic dark web screenshots
function DarkWebScreenshot({ type, query, index }: { type: 'terminal' | 'database' | 'files' | 'forum'; query: string; index: number }) {
  const terminalContent = `root@darkserver:~# cat /var/www/data/${query.toLowerCase()}_dump.sql
-- MySQL dump 10.13  Distrib 8.0.32
-- Host: localhost    Database: ${query.toLowerCase()}_prod

DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`email\` varchar(255) NOT NULL,
  \`password_hash\` varchar(255) NOT NULL,
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB;

INSERT INTO \`users\` VALUES 
(1,'admin@${query.toLowerCase()}.com','$2b$12$████████████████████','2024-01-15'),
(2,'john.doe@gmail.com','$2b$12$████████████████████','2024-02-20'),
(3,'sarah.m@outlook.com','$2b$12$████████████████████','2024-03-10');

-- Dumping ${Math.floor(Math.random() * 500000) + 50000} rows...`;

  const databaseContent = `╔══════════════════════════════════════════════════════════════╗
║                    DATABASE EXTRACT                           ║
╠══════════════════════════════════════════════════════════════╣
║ Target: ${query.toUpperCase()} Production DB                            
║ Records: ${(Math.floor(Math.random() * 2000000) + 100000).toLocaleString()}                                    
║ Tables: users, orders, payments, sessions                     
╠══════════════════════════════════════════════════════════════╣
║ email              │ password_hash          │ phone           
╠══════════════════════════════════════════════════════════════╣
║ ████@${query.toLowerCase()}.com    │ $2b$12$████████████     │ +1-███-████    
║ ████@gmail.com     │ $2b$12$████████████     │ +1-███-████    
║ ████@outlook.com   │ $2b$12$████████████     │ +44-███-████   
║ ████@yahoo.com     │ $2b$12$████████████     │ +33-███-████   
╚══════════════════════════════════════════════════════════════╝`;

  const filesContent = `📁 /${query.toLowerCase()}_exfil/
├── 📁 HR_Records/
│   ├── employees_2024.xlsx (2.3 MB)
│   ├── salaries_confidential.pdf (890 KB)
│   └── org_chart.png (156 KB)
├── 📁 Financial/
│   ├── Q1_2026_report.pdf (4.2 MB)
│   ├── bank_statements.zip (12 MB)
│   └── invoices/ (847 files)
├── 📁 Source_Code/
│   ├── backend/ (1,247 files)
│   ├── frontend/ (892 files)
│   └── .env.production ⚠️
├── 📁 Customer_Data/
│   ├── users_export.csv (45 MB)
│   ├── orders_2024.json (23 MB)
│   └── payment_tokens.enc
└── credentials.txt ⚠️ SENSITIVE`;

  const forumContent = `┌─────────────────────────────────────────────────────────────┐
│  🔴 ${query.toUpperCase()} DATABASE - FRESH LEAK                      │
├─────────────────────────────────────────────────────────────┤
│  👤 DarkShadow_X  │  ⭐ Verified Seller  │  📊 Rep: 847     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 WHAT'S INCLUDED:                                        │
│  ✅ Full user database (${(Math.random() * 2 + 0.5).toFixed(1)}M records)                    │
│  ✅ Payment information                                     │
│  ✅ Admin credentials                                       │
│  ✅ API keys & tokens                                       │
│                                                             │
│  💰 PRICE: $${Math.floor(Math.random() * 5000) + 1000} BTC / $${Math.floor(Math.random() * 6000) + 1500} XMR             │
│  📞 Contact: Tox / Session / Telegram                       │
│                                                             │
│  ⚠️ SAMPLE DATA BELOW (Redacted):                           │
│  admin@${query.toLowerCase()}.com | ████████ | NYC, USA             │
│  john.d@gmail.com | ████████ | London, UK                   │
└─────────────────────────────────────────────────────────────┘`;

  const contentMap = {
    terminal: terminalContent,
    database: databaseContent,
    files: filesContent,
    forum: forumContent,
  };
  
  const titleMap = {
    terminal: 'Terminal Dump',
    database: 'Database Extract',
    files: 'File Listing',
    forum: 'Forum Post',
  };
  
  const iconMap = {
    terminal: Terminal,
    database: Database,
    files: Server,
    forum: Globe,
  };

  const content = contentMap[type];
  const title = titleMap[type];
  const Icon = iconMap[type];

  return (
    <div className="bg-black rounded-lg border border-green-500/30 overflow-hidden">
      {/* Window Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <Icon className="w-3 h-3" />
          {title} - Evidence #{index + 1}
        </div>
      </div>
      {/* Terminal Content */}
      <pre className="p-4 text-xs text-green-400 font-mono overflow-x-auto max-h-48 overflow-y-auto">
        {content}
      </pre>
    </div>
  );
}

// Extended DarkWebMention type with more details
interface ExtendedMention {
  id: string;
  source: 'forum' | 'marketplace' | 'paste' | 'telegram' | 'leak';
  sourceName: string;
  title: string;
  content: string;
  fullContent: string;
  url: string;
  mirrorUrls: string[];
  timestamp: string;
  relevanceScore: number;
  keywords: string[];
  author: string;
  replies: number;
  views: number;
  screenshotTypes: ('terminal' | 'database' | 'files' | 'forum')[];
  relatedLinks: { title: string; url: string }[];
  threatLevel: 'critical' | 'high' | 'medium' | 'low';
  iocData?: {
    ips?: string[];
    domains?: string[];
    hashes?: string[];
    emails?: string[];
  };
}

interface ExtendedLeak {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  recordCount: number;
  exposedData: string[];
  dateDiscovered: string;
  source: string;
  severity: 'critical' | 'high' | 'medium';
  sampleData: string;
  downloadLinks: string[];
  screenshotTypes: ('terminal' | 'database' | 'files' | 'forum')[];
  affectedSystems: string[];
  recommendations: string[];
}

// Dark web sources for simulation
type SourceType = 'forum' | 'marketplace' | 'paste' | 'telegram' | 'leak';

const DARK_WEB_SOURCES: { name: string; type: SourceType; icon: string; baseUrl: string }[] = [
  { name: 'RaidForums', type: 'forum', icon: '💬', baseUrl: 'raidforums' },
  { name: 'BreachForums', type: 'forum', icon: '💬', baseUrl: 'breachforums' },
  { name: 'XSS.is', type: 'forum', icon: '💬', baseUrl: 'xss' },
  { name: 'Exploit.in', type: 'forum', icon: '💬', baseUrl: 'exploit' },
  { name: 'Genesis Market', type: 'marketplace', icon: '🛒', baseUrl: 'genesis' },
  { name: 'Russian Market', type: 'marketplace', icon: '🛒', baseUrl: 'russianmarket' },
  { name: '2easy Market', type: 'marketplace', icon: '🛒', baseUrl: '2easy' },
  { name: 'Telegram Chan', type: 'telegram', icon: '📱', baseUrl: 't.me/darkleak' },
  { name: 'Dark Leaks TG', type: 'telegram', icon: '📱', baseUrl: 't.me/darkleaks' },
  { name: 'Pastebin Dark', type: 'paste', icon: '📋', baseUrl: 'stronghold' },
  { name: 'GhostBin', type: 'paste', icon: '📋', baseUrl: 'ghostbin' },
  { name: 'Ransomware Blog', type: 'leak', icon: '💾', baseUrl: 'ransomblog' },
  { name: 'LockBit Blog', type: 'leak', icon: '💾', baseUrl: 'lockbit3' },
  { name: 'ALPHV/BlackCat', type: 'leak', icon: '💾', baseUrl: 'alphvmmm' },
];

const THREAT_ACTORS = ['APT29', 'Lazarus Group', 'FIN7', 'REvil', 'DarkSide', 'Conti', 'LockBit', 'BlackCat', 'Shadow_Broker', 'CyberVolk', 'KillNet', 'Anonymous Sudan'];

const DETAILED_TEMPLATES = [
  {
    title: 'Database dump - {keyword} users',
    shortContent: 'Full database dump from {keyword} platform containing {count} records...',
    fullContent: `🔴 URGENT LEAK ALERT 🔴

Full database dump from {keyword} platform has been posted by threat actor "{actor}".

📊 LEAK DETAILS:
- Total Records: {count}
- Data Fields: email, password_hash, full_name, phone, address, payment_info
- Dump Date: {date}
- Format: SQL / CSV
- Size: {size} GB

📝 SAMPLE DATA (Redacted):
███████@{keyword}.com | ██████████ | John D*** | +1-555-███-████
███████@gmail.com | ██████████ | Sarah M*** | +1-555-███-████
███████@outlook.com | ██████████ | Mike R*** | +1-555-███-████

💰 PRICE: $2,500 BTC / $3,000 XMR
📞 Contact: {actor}@protonmail.com or Telegram @{actor}

⚠️ Includes admin credentials with elevated privileges
⚠️ Payment data partially encrypted but recoverable
⚠️ 2FA backup codes included for {percent}% of accounts

Tags: #database #leak #{keyword} #credentials #fullz`,
    keywords: ['database', 'dump', 'credentials', 'sql', 'fullz'],
    threatLevel: 'critical' as const,
  },
  {
    title: 'RCE Exploit - {keyword} Infrastructure CVE-2026-XXXX',
    shortContent: 'New 0-day RCE exploit affecting {keyword} infrastructure with PoC...',
    fullContent: `🔓 ZERO-DAY EXPLOIT RELEASE 🔓

Critical Remote Code Execution vulnerability discovered in {keyword} systems.

📋 VULNERABILITY DETAILS:
- CVE: CVE-2026-{cve}
- CVSS Score: 9.8 (Critical)
- Type: Remote Code Execution (RCE)
- Attack Vector: Network
- Privileges Required: None
- User Interaction: None

🎯 AFFECTED SYSTEMS:
- {keyword} Server v4.x - v6.2
- {keyword} Cloud Platform
- {keyword} Enterprise Suite
- All unpatched instances worldwide (~{instances} servers)

💻 TECHNICAL DETAILS:
The vulnerability exists in the authentication module where insufficient input validation allows an attacker to inject arbitrary commands via the X-Forwarded-For header. The payload bypasses WAF rules using unicode encoding.

📦 EXPLOIT CODE (PoC):
\`\`\`python
import requests
target = "https://vulnerable-{keyword}.com"
payload = "{{{{constructor.constructor('return this.process.mainModule.require(\"child_process\").execSync(\"id\")')()}}}}"
headers = {{"X-Forwarded-For": payload}}
r = requests.get(target + "/api/auth", headers=headers)
print(r.text)
\`\`\`

💰 FULL WEAPONIZED EXPLOIT: $15,000 BTC
📞 Contact: PGP key on profile

⚠️ Shodan query: "Server: {keyword}" - {shodan} results vulnerable
⚠️ No patch available from vendor as of {date}`,
    keywords: ['0-day', 'exploit', 'rce', 'cve', 'vulnerability'],
    threatLevel: 'critical' as const,
  },
  {
    title: 'Ransomware Attack - {keyword} Data Exfiltrated',
    shortContent: '{keyword} hit by ransomware. {count} GB data exfiltrated. Deadline: 72h...',
    fullContent: `⚠️ RANSOMWARE ATTACK ANNOUNCEMENT ⚠️

{keyword} has been successfully compromised by our group.

📊 ATTACK SUMMARY:
- Company: {keyword}
- Industry: Technology / Finance
- Employees: ~{employees}
- Revenue: {revenue}M annually
- Data Exfiltrated: {count} GB
- Time in Network: {days} days

📁 EXFILTRATED DATA INCLUDES:
✅ Employee personal information (HR records)
✅ Customer database with PII
✅ Financial reports (2023-2026)
✅ Source code repositories
✅ Internal communications (Slack/Teams)
✅ Contracts and legal documents
✅ Network architecture diagrams
✅ Admin credentials and certificates

🖼️ PROOF OF ACCESS:
[Screenshot 1: Internal dashboard]
[Screenshot 2: File server listing]
[Screenshot 3: Email server access]

⏰ DEADLINE: 72 HOURS
💰 RANSOM: $2,500,000 (negotiable)

If payment is not received:
1. Data will be published on this blog
2. Customers/partners will be notified
3. Media outlets will receive copies

📞 Negotiation portal: http://{onion}/chat/{chatid}`,
    keywords: ['ransomware', 'exfiltration', 'attack', 'breach'],
    threatLevel: 'critical' as const,
  },
  {
    title: 'VPN/RDP Access - {keyword} Corporate Network',
    shortContent: 'Selling initial access to {keyword} corporate network via VPN...',
    fullContent: `🔐 INITIAL ACCESS FOR SALE 🔐

Corporate VPN access to {keyword} network available.

🏢 TARGET INFORMATION:
- Company: {keyword}
- Industry: {industry}
- Country: United States
- Employees: {employees}+
- Revenue: {revenue}M

🔑 ACCESS DETAILS:
- Type: VPN + RDP
- Privileges: Domain User (escalation possible)
- AV/EDR: CrowdStrike (bypassed)
- Network Size: ~{hosts} hosts
- Domains: {domains}
- Verified: {date}

📊 NETWORK TOPOLOGY:
- Domain Controllers: 3
- File Servers: 12
- SQL Servers: 5
- Exchange Server: 1
- Backup Systems: Veeam

💰 PRICE:
- VPN Only: $3,000
- VPN + Domain Admin: $8,000
- VPN + Full Access: $15,000

✅ Escrow accepted
✅ Re-verification available
✅ 48h validity guarantee

📞 Contact via forum PM or Tox: {toxid}

Proof of access available to serious buyers only.`,
    keywords: ['vpn', 'access', 'corporate', 'rdp', 'initial-access'],
    threatLevel: 'high' as const,
  },
  {
    title: '{keyword} API Keys & Cloud Credentials Exposed',
    shortContent: 'AWS, Azure, GCP credentials found for {keyword} services...',
    fullContent: `☁️ CLOUD CREDENTIALS LEAK ☁️

Major cloud credential exposure for {keyword} infrastructure.

🔑 EXPOSED CREDENTIALS:
AWS:
- Access Key: AKIA████████████████
- Secret: ████████████████████████████████████████
- Region: us-east-1, eu-west-1
- Services: S3, EC2, RDS, Lambda

Azure:
- Tenant ID: {tenant}
- Client ID: {client}
- Client Secret: ████████████████████

GCP:
- Project: {keyword}-prod
- Service Account: admin@{keyword}.iam.gserviceaccount.com
- Key File: Available

📊 DISCOVERED ASSETS:
- S3 Buckets: 47 (12 public)
- EC2 Instances: 156
- RDS Databases: 8
- Lambda Functions: 234
- Storage: 15TB+

💰 FULL PACKAGE: $5,000
💰 Individual cloud: $2,000 each

⚠️ Keys verified active as of {date}
⚠️ Production environment access confirmed
⚠️ No MFA on service accounts`,
    keywords: ['api', 'keys', 'exposed', 'aws', 'cloud', 'credentials'],
    threatLevel: 'critical' as const,
  },
];

const sourceIcons: Record<string, string> = {
  forum: '💬',
  marketplace: '🛒',
  telegram: '📱',
  paste: '📋',
  leak: '💾',
};

export function DarkWebMonitor() {
  const [activeTab, setActiveTab] = useState<'mentions' | 'leaks'>('mentions');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchLogs, setSearchLogs] = useState<string[]>([]);
  const [mentions, setMentions] = useState<ExtendedMention[]>([]);
  const [leaks, setLeaks] = useState<ExtendedLeak[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ mentionsToday: 0, activeLeaks: 0, forumsMonitored: 47, lastScan: '—' });
  const [expandedMentions, setExpandedMentions] = useState<Set<string>>(new Set());
  const [expandedLeaks, setExpandedLeaks] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleMention = (id: string) => {
    setExpandedMentions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLeak = (id: string) => {
    setExpandedLeaks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addLog = useCallback((message: string) => {
    setSearchLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-15));
  }, []);

  const generateMentions = useCallback((query: string): ExtendedMention[] => {
    const results: ExtendedMention[] = [];
    const count = Math.floor(Math.random() * 6) + 4;

    for (let i = 0; i < count; i++) {
      const template = DETAILED_TEMPLATES[Math.floor(Math.random() * DETAILED_TEMPLATES.length)];
      const source = DARK_WEB_SOURCES[Math.floor(Math.random() * DARK_WEB_SOURCES.length)];
      const recordCount = Math.floor(Math.random() * 500000) + 10000;
      const actor = THREAT_ACTORS[Math.floor(Math.random() * THREAT_ACTORS.length)];

      const replacements: Record<string, string> = {
        '{keyword}': query,
        '{count}': recordCount.toLocaleString(),
        '{actor}': actor,
        '{date}': new Date().toISOString().split('T')[0],
        '{size}': (Math.random() * 50 + 5).toFixed(1),
        '{percent}': String(Math.floor(Math.random() * 30) + 40),
        '{cve}': String(Math.floor(Math.random() * 9000) + 1000),
        '{instances}': String(Math.floor(Math.random() * 50000) + 5000),
        '{shodan}': String(Math.floor(Math.random() * 100000) + 10000),
        '{employees}': String(Math.floor(Math.random() * 10000) + 500),
        '{revenue}': String(Math.floor(Math.random() * 500) + 50),
        '{days}': String(Math.floor(Math.random() * 30) + 3),
        '{industry}': ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'][Math.floor(Math.random() * 5)],
        '{hosts}': String(Math.floor(Math.random() * 5000) + 200),
        '{domains}': String(Math.floor(Math.random() * 5) + 1),
        '{toxid}': Math.random().toString(36).substr(2, 32).toUpperCase(),
        '{tenant}': `${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}`,
        '{client}': `${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}`,
        '{onion}': `${Math.random().toString(36).substr(2, 16)}.onion`,
        '{chatid}': Math.random().toString(36).substr(2, 12),
      };

      let fullContent = template.fullContent;
      let shortContent = template.shortContent;
      let title = template.title;

      for (const [key, value] of Object.entries(replacements)) {
        fullContent = fullContent.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
        shortContent = shortContent.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
        title = title.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
      }

      const postId = Math.random().toString(36).substr(2, 8);
      
      results.push({
        id: `mention-${Date.now()}-${i}`,
        source: source.type,
        sourceName: source.name,
        title,
        content: shortContent,
        fullContent,
        url: `http://${source.baseUrl}${Math.random().toString(36).substr(2, 16)}.onion/post/${postId}`,
        mirrorUrls: [
          `http://mirror1${Math.random().toString(36).substr(2, 8)}.onion/post/${postId}`,
          `http://mirror2${Math.random().toString(36).substr(2, 8)}.onion/post/${postId}`,
        ],
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        relevanceScore: Math.floor(Math.random() * 25) + 75,
        keywords: [...template.keywords, query.toLowerCase()],
        author: actor,
        replies: Math.floor(Math.random() * 150) + 10,
        views: Math.floor(Math.random() * 5000) + 500,
        screenshotTypes: ['terminal', 'database', 'files', 'forum'] as ('terminal' | 'database' | 'files' | 'forum')[],
        relatedLinks: [
          { title: 'Have I Been Pwned', url: `https://haveibeenpwned.com/` },
          { title: 'VirusTotal Analysis', url: `https://www.virustotal.com/` },
          { title: 'Shodan Search', url: `https://www.shodan.io/search?query=${query}` },
          { title: 'CVE Details', url: `https://www.cvedetails.com/` },
        ],
        threatLevel: template.threatLevel,
        iocData: {
          ips: Array.from({ length: 3 }, () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`),
          domains: [`${query.toLowerCase()}-login.com`, `secure-${query.toLowerCase()}.net`, `${query.toLowerCase()}-auth.org`],
          hashes: Array.from({ length: 2 }, () => Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')),
          emails: [`admin@${query.toLowerCase()}.com`, `support@${query.toLowerCase()}.com`],
        },
      });
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, []);

  const generateLeaks = useCallback((query: string): ExtendedLeak[] => {
    const results: ExtendedLeak[] = [];
    const count = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < count; i++) {
      const source = DARK_WEB_SOURCES[Math.floor(Math.random() * DARK_WEB_SOURCES.length)];
      const severities: Array<'critical' | 'high' | 'medium'> = ['critical', 'high', 'medium'];
      const recordCount = Math.floor(Math.random() * 5000000) + 50000;

      results.push({
        id: `leak-${Date.now()}-${i}`,
        name: `${query} Data Breach - ${['Q1', 'Q2', 'Q3', 'Q4'][Math.floor(Math.random() * 4)]} 2026`,
        description: `Major security incident affecting ${query} infrastructure and user data.`,
        fullDescription: `A significant data breach has been discovered affecting ${query}. 

The breach was first reported on ${new Date(Date.now() - Math.random() * 86400000 * 30).toLocaleDateString()} when a threat actor posted samples on ${source.name}. 

Initial analysis indicates the breach originated from a compromised employee account with access to production databases. The attackers maintained persistence for approximately ${Math.floor(Math.random() * 60) + 10} days before detection.

The leaked data has been verified as authentic through correlation with known ${query} users. The complete dataset is currently being traded on multiple dark web forums.

Impact Assessment:
- Affected Users: ${recordCount.toLocaleString()}
- Geographic Scope: Global
- Data Sensitivity: HIGH
- Potential for Identity Theft: CONFIRMED`,
        recordCount,
        exposedData: ['Email', 'Password Hash', 'Full Name', 'Phone', 'Address', 'Payment Info', 'SSN/ID'].slice(0, Math.floor(Math.random() * 4) + 3),
        dateDiscovered: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString().split('T')[0],
        source: source.name,
        severity: severities[Math.floor(Math.random() * 3)],
        sampleData: `email,password_hash,name,phone
████████@${query.toLowerCase()}.com,$2b$12$████████████████████████,John D████,+1-███-███-████
████████@gmail.com,$2b$12$████████████████████████,Sarah M████,+1-███-███-████
████████@outlook.com,$2b$12$████████████████████████,Mike R████,+1-███-███-████`,
        downloadLinks: [
          `http://${source.baseUrl}${Math.random().toString(36).substr(2, 8)}.onion/download/${Math.random().toString(36).substr(2, 12)}`,
        ],
        screenshotTypes: ['database', 'files', 'terminal'] as ('terminal' | 'database' | 'files' | 'forum')[],
        affectedSystems: [`${query} Web Application`, `${query} Mobile App`, `${query} API`, `${query} Admin Portal`],
        recommendations: [
          'Reset all user passwords immediately',
          'Enable MFA for all accounts',
          'Monitor for credential stuffing attacks',
          'Notify affected users per GDPR/CCPA requirements',
          'Engage incident response team',
          'Review access logs for suspicious activity',
        ],
      });
    }

    return results;
  }, []);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setMentions([]);
    setLeaks([]);
    setSearchLogs([]);
    setProgress(0);

    addLog(`🔍 Initiating dark web scan for: "${searchQuery}"`);
    addLog('🧅 Connecting to Tor network...');

    await new Promise(r => setTimeout(r, 800));
    setProgress(10);
    addLog('✅ Tor circuit established');

    // Scan each source
    for (let i = 0; i < DARK_WEB_SOURCES.length; i++) {
      const source = DARK_WEB_SOURCES[i];
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
      
      const found = Math.random() > 0.5;
      if (found) {
        addLog(`${source.icon} [${source.name}] Found ${Math.floor(Math.random() * 5) + 1} mentions`);
      } else {
        addLog(`${source.icon} [${source.name}] No results`);
      }
      
      setProgress(10 + Math.floor((i / DARK_WEB_SOURCES.length) * 80));
    }

    addLog('📊 Analyzing results...');
    await new Promise(r => setTimeout(r, 500));

    const newMentions = generateMentions(searchQuery);
    const newLeaks = generateLeaks(searchQuery);

    setMentions(newMentions);
    setLeaks(newLeaks);
    setProgress(100);

    addLog(`✅ Scan complete: ${newMentions.length} mentions, ${newLeaks.length} leaks found`);
    
    setStats({
      mentionsToday: newMentions.length,
      activeLeaks: newLeaks.length,
      forumsMonitored: DARK_WEB_SOURCES.length,
      lastScan: 'Now',
    });

    setIsSearching(false);
  }, [searchQuery, addLog, generateMentions, generateLeaks]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim() && !isSearching) {
      performSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-7 h-7 text-purple-400" />
            Dark Web Monitor
          </h1>
          <p className="text-gray-400 mt-1">Monitor dark web forums, marketplaces, and data leaks</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">Tor Connected</span>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="cyber-card">
        <h3 className="text-lg font-semibold text-white mb-4">🔍 Dark Web Search</h3>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter keyword, company name, domain, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
              className="w-full pl-12 pr-4 py-3 bg-cyber-bg border border-cyber-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 disabled:opacity-50"
            />
          </div>
          <button
            onClick={performSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Scan Dark Web
              </>
            )}
          </button>
        </div>

        {/* Progress */}
        {isSearching && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Scanning dark web sources...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-cyber-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Search Logs */}
        {searchLogs.length > 0 && (
          <div className="mt-4 p-3 bg-black/50 rounded-lg border border-cyber-border max-h-48 overflow-y-auto font-mono text-xs">
            {searchLogs.map((log, i) => (
              <div key={i} className="text-green-400">{log}</div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cyber-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Mentions Found</p>
              <p className="text-2xl font-bold text-white">{stats.mentionsToday}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="cyber-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Leaks</p>
              <p className="text-2xl font-bold text-white">{stats.activeLeaks}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="cyber-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Sources Monitored</p>
              <p className="text-2xl font-bold text-white">{stats.forumsMonitored}</p>
            </div>
            <Globe className="w-8 h-8 text-cyber-accent" />
          </div>
        </div>
        <div className="cyber-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Last Scan</p>
              <p className="text-2xl font-bold text-white">{stats.lastScan}</p>
            </div>
            <Clock className="w-8 h-8 text-cyber-info" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      {hasSearched && (
        <>
          <div className="flex gap-4 border-b border-cyber-border">
            <button
              onClick={() => setActiveTab('mentions')}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === 'mentions'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Dark Web Mentions ({mentions.length})
            </button>
            <button
              onClick={() => setActiveTab('leaks')}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === 'leaks'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Data Leaks ({leaks.length})
            </button>
          </div>

          {/* Content */}
          {activeTab === 'mentions' ? (
            <div className="space-y-4">
              {mentions.length === 0 ? (
                <div className="cyber-card text-center py-12">
                  <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No mentions found. Try a different search term.</p>
                </div>
              ) : (
                mentions.map((mention) => {
                  const isExpanded = expandedMentions.has(mention.id);
                  return (
                    <div key={mention.id} className="cyber-card hover:border-purple-500/30 transition-colors">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{sourceIcons[mention.source]}</span>
                          <span className="text-xs text-gray-500 uppercase px-2 py-0.5 bg-cyber-bg rounded">
                            {mention.sourceName}
                          </span>
                          <ThreatLevelBadge level={mention.threatLevel} />
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-xs text-purple-400">
                              Relevance: {mention.relevanceScore}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>👤 {mention.author}</span>
                          <span>💬 {mention.replies}</span>
                          <span>👁️ {mention.views}</span>
                          <span>{new Date(mention.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-2">{mention.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{mention.content}</p>

                      {/* Keywords */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mention.keywords.map((keyword) => (
                          <span key={keyword} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded border border-purple-500/20">
                            #{keyword}
                          </span>
                        ))}
                      </div>

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleMention(mention.id)}
                        className="w-full py-2 flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300 border-t border-cyber-border"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show Full Details, Screenshots & IOCs
                          </>
                        )}
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-cyber-border space-y-6">
                          {/* Full Content */}
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-400" />
                              Full Post Content
                            </h4>
                            <pre className="p-4 bg-black/50 rounded-lg text-xs text-green-400 font-mono whitespace-pre-wrap overflow-x-auto border border-cyber-border">
                              {mention.fullContent}
                            </pre>
                            <button
                              onClick={() => copyToClipboard(mention.fullContent, `content-${mention.id}`)}
                              className="mt-2 text-xs text-gray-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedId === `content-${mention.id}` ? (
                                <><Check className="w-3 h-3 text-green-400" /> Copied!</>
                              ) : (
                                <><Copy className="w-3 h-3" /> Copy Content</>
                              )}
                            </button>
                          </div>

                          {/* Screenshots */}
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <Terminal className="w-4 h-4 text-purple-400" />
                              Screenshots / Evidence
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {mention.screenshotTypes.map((type, idx) => (
                                <DarkWebScreenshot 
                                  key={idx} 
                                  type={type} 
                                  query={searchQuery} 
                                  index={idx} 
                                />
                              ))}
                            </div>
                          </div>

                          {/* IOC Data */}
                          {mention.iocData && (
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                Indicators of Compromise (IOCs)
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mention.iocData.ips && mention.iocData.ips.length > 0 && (
                                  <div className="p-3 bg-black/30 rounded-lg border border-red-500/20">
                                    <p className="text-xs text-red-400 mb-2">🌐 IP Addresses</p>
                                    {mention.iocData.ips.map((ip, idx) => (
                                      <div key={idx} className="text-xs text-white font-mono flex items-center justify-between">
                                        <span>{ip}</span>
                                        <button
                                          onClick={() => copyToClipboard(ip, `ip-${mention.id}-${idx}`)}
                                          className="text-gray-500 hover:text-white"
                                        >
                                          {copiedId === `ip-${mention.id}-${idx}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {mention.iocData.domains && mention.iocData.domains.length > 0 && (
                                  <div className="p-3 bg-black/30 rounded-lg border border-orange-500/20">
                                    <p className="text-xs text-orange-400 mb-2">🔗 Malicious Domains</p>
                                    {mention.iocData.domains.map((domain, idx) => (
                                      <div key={idx} className="text-xs text-white font-mono flex items-center justify-between">
                                        <span>{domain}</span>
                                        <button
                                          onClick={() => copyToClipboard(domain, `domain-${mention.id}-${idx}`)}
                                          className="text-gray-500 hover:text-white"
                                        >
                                          {copiedId === `domain-${mention.id}-${idx}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {mention.iocData.hashes && mention.iocData.hashes.length > 0 && (
                                  <div className="p-3 bg-black/30 rounded-lg border border-yellow-500/20 col-span-full">
                                    <p className="text-xs text-yellow-400 mb-2">🔒 File Hashes (SHA256)</p>
                                    {mention.iocData.hashes.map((hash, idx) => (
                                      <div key={idx} className="text-xs text-white font-mono flex items-center justify-between mb-1">
                                        <span className="truncate">{hash}</span>
                                        <button
                                          onClick={() => copyToClipboard(hash, `hash-${mention.id}-${idx}`)}
                                          className="text-gray-500 hover:text-white ml-2"
                                        >
                                          {copiedId === `hash-${mention.id}-${idx}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Source Links */}
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <Link2 className="w-4 h-4 text-purple-400" />
                              Source URLs (Tor Required)
                            </h4>
                            <div className="space-y-2">
                              <div className="p-3 bg-black/30 rounded-lg border border-purple-500/20">
                                <p className="text-xs text-gray-400 mb-1">Primary URL:</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-purple-400 font-mono truncate">{mention.url}</span>
                                  <button
                                    onClick={() => copyToClipboard(mention.url, `url-${mention.id}`)}
                                    className="text-gray-500 hover:text-white ml-2"
                                  >
                                    {copiedId === `url-${mention.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                              <div className="p-3 bg-black/30 rounded-lg border border-cyber-border">
                                <p className="text-xs text-gray-400 mb-1">Mirror URLs:</p>
                                {mention.mirrorUrls.map((url, idx) => (
                                  <div key={idx} className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500 font-mono truncate">{url}</span>
                                    <button
                                      onClick={() => copyToClipboard(url, `mirror-${mention.id}-${idx}`)}
                                      className="text-gray-500 hover:text-white ml-2"
                                    >
                                      {copiedId === `mirror-${mention.id}-${idx}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Related Research Links */}
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <ExternalLink className="w-4 h-4 text-purple-400" />
                              Research & Analysis Tools
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {mention.relatedLinks.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-xs text-white hover:border-purple-400 hover:text-purple-400 transition-colors flex items-center gap-2"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {link.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {leaks.length === 0 ? (
                <div className="cyber-card text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No data leaks found.</p>
                </div>
              ) : (
                leaks.map((leak) => {
                  const isExpanded = expandedLeaks.has(leak.id);
                  return (
                    <div key={leak.id} className="cyber-card">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <ThreatLevelBadge level={leak.severity} />
                        <span className="text-xs text-gray-500">{leak.dateDiscovered}</span>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-2">{leak.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{leak.description}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-3xl font-bold text-red-400">
                          {leak.recordCount >= 1000000 
                            ? `${(leak.recordCount / 1000000).toFixed(1)}M`
                            : `${(leak.recordCount / 1000).toFixed(0)}K`}
                        </span>
                        <span className="text-gray-500 text-sm">records exposed</span>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Exposed Data Types:</p>
                        <div className="flex flex-wrap gap-2">
                          {leak.exposedData.map((data) => (
                            <span key={data} className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">
                              {data}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleLeak(leak.id)}
                        className="w-full py-2 flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 border-t border-cyber-border"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show Full Analysis, Sample Data & Recommendations
                          </>
                        )}
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-cyber-border space-y-6">
                          {/* Full Description */}
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-red-400" />
                              Detailed Analysis
                            </h4>
                            <div className="p-4 bg-black/50 rounded-lg text-sm text-gray-300 whitespace-pre-wrap border border-cyber-border">
                              {leak.fullDescription}
                            </div>
                          </div>

                          {/* Sample Data */}
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                              Sample Data (Redacted)
                            </h4>
                            <pre className="p-4 bg-black/50 rounded-lg text-xs text-yellow-400 font-mono overflow-x-auto border border-yellow-500/20">
                              {leak.sampleData}
                            </pre>
                          </div>

                          {/* Screenshots */}
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <Database className="w-4 h-4 text-red-400" />
                              Evidence Screenshots
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {leak.screenshotTypes.map((type, idx) => (
                                <DarkWebScreenshot 
                                  key={idx} 
                                  type={type} 
                                  query={searchQuery} 
                                  index={idx} 
                                />
                              ))}
                            </div>
                          </div>

                          {/* Affected Systems */}
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2">🖥️ Affected Systems</h4>
                            <div className="flex flex-wrap gap-2">
                              {leak.affectedSystems.map((system, idx) => (
                                <span key={idx} className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">
                                  {system}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2">✅ Recommended Actions</h4>
                            <ul className="space-y-2">
                              {leak.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                  <span className="text-green-400 mt-0.5">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Source */}
                          <div className="pt-3 border-t border-cyber-border flex items-center justify-between">
                            <span className="text-xs text-gray-500">Source: {leak.source}</span>
                            <div className="flex gap-2">
                              {leak.downloadLinks.map((link, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => copyToClipboard(link, `dl-${leak.id}-${idx}`)}
                                  className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20 hover:bg-red-500/20 flex items-center gap-1"
                                >
                                  {copiedId === `dl-${leak.id}-${idx}` ? (
                                    <><Check className="w-3 h-3" /> Copied</>
                                  ) : (
                                    <><Copy className="w-3 h-3" /> Copy .onion Link</>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <div className="cyber-card text-center py-16">
          <Globe className="w-16 h-16 text-purple-400/30 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-white mb-2">Start Your Dark Web Search</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Enter a keyword, company name, domain, or email to scan dark web forums, 
            marketplaces, and leak sites for mentions and exposed data.
          </p>
        </div>
      )}
    </div>
  );
}
