import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Copy, RotateCcw, Lightbulb } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  "Analyze the latest APT29 campaign and provide IOCs",
  "What are the current top CVEs being actively exploited?",
  "Explain the MITRE ATT&CK technique T1566.001",
  "Generate a threat report for ransomware activity this week",
  "What are the indicators of a supply chain attack?",
  "Analyze this IP: 185.215.113.67 for threat intelligence",
];

export function AIAnalyst() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `# Welcome to Monitor7adi AI Analyst 🛡️

I'm your AI-powered cybersecurity analyst. I can help you with:

- **Threat Analysis**: Analyze IOCs, malware samples, and threat actors
- **CVE Research**: Get detailed information about vulnerabilities
- **MITRE ATT&CK**: Explain techniques, tactics, and procedures
- **Incident Response**: Guide you through IR procedures
- **Report Generation**: Create threat intelligence reports

Powered by **Ollama (llama3.1:8b)** running locally for privacy.

How can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in production, this would call Ollama API)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(input),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('apt29') || lowerQuery.includes('cozy bear')) {
      return `## APT29 (Cozy Bear) Analysis

**Attribution**: Russian Foreign Intelligence Service (SVR)

### Recent Campaign Overview
APT29 has been conducting sophisticated spear-phishing campaigns targeting:
- Government agencies
- Diplomatic entities  
- Think tanks & NGOs

### Common TTPs (MITRE ATT&CK)
| Technique | ID | Description |
|-----------|-----|-------------|
| Spear-phishing | T1566.001 | Initial access via malicious attachments |
| PowerShell | T1059.001 | Execution of malicious scripts |
| Obfuscation | T1027 | Code obfuscation to evade detection |

### Indicators of Compromise
\`\`\`
IP: 185.215.113.67
Domain: update-service[.]com
Hash: a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8
\`\`\`

### Recommendations
1. Block known IOCs at perimeter
2. Enable PowerShell logging
3. Implement email authentication (DMARC/DKIM)
4. Conduct phishing awareness training`;
    }
    
    if (lowerQuery.includes('cve') || lowerQuery.includes('vulnerabilit')) {
      return `## Current Critical CVEs Being Actively Exploited

### CVE-2024-21762 - FortiOS
- **CVSS**: 9.8 (Critical)
- **Type**: Out-of-bound Write RCE
- **Status**: ⚠️ Actively Exploited
- **Affected**: FortiOS SSL VPN

### CVE-2024-1234 - Apache Log4j
- **CVSS**: 9.0 (Critical)
- **Type**: Remote Code Execution
- **Status**: ⚠️ Actively Exploited

### Recommended Actions
1. Immediately patch affected systems
2. Monitor for exploitation attempts
3. Review logs for indicators of compromise
4. Implement network segmentation

*Data sourced from NVD, CISA KEV, and threat intelligence feeds*`;
    }

    if (lowerQuery.includes('mitre') || lowerQuery.includes('t1566')) {
      return `## MITRE ATT&CK: T1566.001 - Spear-phishing Attachment

### Description
Adversaries send spear-phishing emails with malicious attachments to gain initial access.

### Procedure Examples
- APT29 used COVID-19 themed documents
- Emotet delivered via macro-enabled Word docs
- LockBit distributed via fake invoice PDFs

### Detection
\`\`\`yaml
# Sigma Rule Example
detection:
  selection:
    EventID: 4688
    NewProcessName|endswith:
      - '\\powershell.exe'
      - '\\cmd.exe'
    ParentProcessName|endswith:
      - '\\winword.exe'
      - '\\excel.exe'
\`\`\`

### Mitigations
- M1049: Antivirus/Antimalware
- M1031: Network Intrusion Prevention
- M1017: User Training`;
    }

    return `## Analysis Complete

I've analyzed your query: "${query}"

### Summary
Based on current threat intelligence data, here's my assessment:

1. **Threat Level**: Medium-High
2. **Confidence**: 75%
3. **Recommended Actions**: 
   - Continue monitoring
   - Review related IOCs
   - Check SIEM for related alerts

### Related Intelligence
- Cross-reference with recent APT campaigns
- Check dark web forums for mentions
- Validate against known malware families

Would you like me to:
- Generate a detailed report?
- Provide specific IOCs?
- Explain related MITRE techniques?`;
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-cyber-accent" />
            AI Security Analyst
          </h1>
          <p className="text-gray-400 mt-1">Powered by Ollama (llama3.1:8b) - Running Locally</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-green-400">Connected</span>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col cyber-card overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-cyber-accent/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-cyber-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-cyber-accent text-black'
                      : 'bg-cyber-bg border border-cyber-border'
                  }`}
                >
                  <div className={`prose prose-sm ${message.role === 'assistant' ? 'prose-invert' : ''} max-w-none`}>
                    <div className="whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ 
                      __html: message.content
                        .replace(/^### (.*$)/gm, '<h3 class="text-white font-bold mt-4 mb-2">$1</h3>')
                        .replace(/^## (.*$)/gm, '<h2 class="text-lg text-white font-bold mt-4 mb-2">$1</h2>')
                        .replace(/^# (.*$)/gm, '<h1 class="text-xl text-white font-bold mb-3">$1</h1>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/`([^`]+)`/g, '<code class="bg-cyber-card px-1 rounded text-cyber-accent">$1</code>')
                        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-cyber-card p-3 rounded-lg overflow-x-auto my-2"><code>$2</code></pre>')
                    }} />
                  </div>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-cyber-border">
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="p-1 hover:bg-cyber-card rounded text-gray-500 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-cyber-accent flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-black" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-accent/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyber-accent" />
                </div>
                <div className="bg-cyber-bg border border-cyber-border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-cyber-border">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ask about threats, CVEs, IOCs, or security topics..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 px-4 py-3 bg-cyber-bg border border-cyber-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-accent"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-cyber-accent text-black rounded-lg font-medium hover:bg-cyber-accent/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="w-80 cyber-card overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Suggested Prompts
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInput(prompt)}
                className="w-full text-left p-3 bg-cyber-bg rounded-lg text-sm text-gray-300 hover:text-white hover:border-cyber-accent/30 border border-transparent transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="pt-4 border-t border-cyber-border mt-4">
            <button
              onClick={() => setMessages([messages[0]])}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
