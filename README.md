# Monitor7adi - Cybersecurity OSINT Dashboard

<p align="center">
  <img src="public/shield.svg" alt="Monitor7adi Logo" width="100" height="100">
</p>

<p align="center">
  <strong>Real-time cybersecurity intelligence, threat monitoring, and OSINT aggregation dashboard</strong>
</p>

## 🛡️ Features

### Threat Intelligence
- **Multi-source aggregation**: MISP, VirusTotal, AlienVault OTX, Shodan
- **IOC Management**: Track IPs, domains, hashes, and URLs
- **MITRE ATT&CK Integration**: TTP mapping and analysis
- **Real-time threat feeds**: Automated updates from 10+ sources

### Dark Web Monitoring
- **Forum & marketplace monitoring**: Track mentions of your brand/assets
- **Data leak detection**: Identify exposed credentials and sensitive data
- **Telegram channel monitoring**: Track threat actor communications
- **Keyword alerts**: Custom notifications for monitored terms

### Vulnerability Scanner
- **Automated scanning**: Quick and full vulnerability assessments
- **CVE Tracking**: Real-time updates from NVD
- **CISA KEV Integration**: Track actively exploited vulnerabilities
- **Nuclei integration**: Template-based vulnerability detection

### Attack Surface Mapping
- **Asset discovery**: Subdomains, IPs, and services
- **Technology detection**: Identify tech stacks
- **Risk scoring**: Prioritize remediation efforts
- **Continuous monitoring**: Track changes over time

### AI Security Analyst
- **Powered by Ollama**: Local LLM for privacy
- **Threat analysis**: Analyze IOCs and malware
- **Report generation**: Automated threat reports
- **MITRE ATT&CK guidance**: TTP explanations

### Live News & Feeds
- **Security news aggregation**: 10+ RSS sources
- **Live TV channels**: Al Jazeera, France 24, Medi1 TV, 2M Maroc
- **Social media monitoring**: Twitter, Reddit, Mastodon

### SIEM Integration
- **Elasticsearch**: Query and visualize security logs
- **Kibana dashboards**: Pre-built security analytics
- **Alert correlation**: Connect threats to events

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- Ollama (optional, for AI features)

### Docker Deployment

```bash
# Clone the repository
git clone https://github.com/yourusername/monitor7adi.git
cd monitor7adi

# Copy environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env

# Start services
docker-compose up -d

# Access the dashboard
open http://localhost:3100
```

### Local Development

```bash
# Install frontend dependencies
npm install

# Start frontend dev server
npm run dev

# In another terminal, start API
cd api
npm install
npm run dev
```

## 🔧 Configuration

### API Keys

Configure the following API keys in `.env`:

| Service | Purpose | Get Key |
|---------|---------|---------|
| VirusTotal | File/URL analysis | [virustotal.com](https://virustotal.com) |
| Shodan | Internet scanning | [shodan.io](https://shodan.io) |
| OTX | Threat intelligence | [otx.alienvault.com](https://otx.alienvault.com) |
| HIBP | Breach checking | [haveibeenpwned.com](https://haveibeenpwned.com/API/Key) |

### Ollama Setup

For AI features, install and run Ollama:

```bash
# Install Ollama
brew install ollama

# Pull the model
ollama pull llama3.1:8b

# Run Ollama
ollama serve
```

### Elasticsearch Integration

To connect to your existing SIEM:

```env
ELASTICSEARCH_URL=http://your-elasticsearch:9200
ELASTICSEARCH_USER=your-user
ELASTICSEARCH_PASSWORD=your-password
```

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Monitor7adi Dashboard                      │
│               (React + TypeScript + Vite)                    │
├─────────────────────────────────────────────────────────────┤
│                    Monitor7adi API                           │
│              (Node.js + Express + Redis)                     │
├────────────┬────────────┬────────────┬─────────────────────┤
│  MISP      │ VirusTotal │   Shodan   │    Elasticsearch    │
│  OTX       │   HIBP     │   NVD      │      Ollama         │
└────────────┴────────────┴────────────┴─────────────────────┘
```

## 🔐 Security

- All API keys stored securely in environment variables
- Ollama runs locally - your data never leaves your network
- CORS configured for specific origins only
- Rate limiting on all API endpoints
- Helmet.js security headers

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/monitor7adi/issues)

---

<p align="center">
  Made with ❤️ for the cybersecurity community
</p>
