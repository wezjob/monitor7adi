import { Router } from 'express';
import axios from 'axios';
import { logger } from '../utils/logger.js';

const router = Router();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// Chat with AI analyst
router.post('/chat', async (req, res) => {
  try {
    const { message, context = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Build system prompt for cybersecurity context
    const systemPrompt = `You are Monitor7adi AI, an expert cybersecurity analyst assistant. You specialize in:
- Threat intelligence analysis (APT groups, malware families, IOCs)
- Vulnerability assessment and CVE analysis
- MITRE ATT&CK framework knowledge
- Incident response guidance
- Dark web monitoring insights
- Security best practices

Provide detailed, actionable analysis. Use markdown formatting for better readability.
When discussing threats, include relevant IOCs, TTPs, and mitigation recommendations.`;

    try {
      // Call Ollama API
      const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
        model: 'llama3.1:8b',
        messages: [
          { role: 'system', content: systemPrompt },
          ...context,
          { role: 'user', content: message }
        ],
        stream: false
      }, {
        timeout: 120000 // 2 minute timeout for LLM response
      });
      
      res.json({
        message: response.data.message.content,
        model: 'llama3.1:8b',
        totalDuration: response.data.total_duration
      });
    } catch (ollamaError) {
      // Fallback to mock response if Ollama is not available
      logger.warn('Ollama not available, using mock response');
      
      const mockResponse = generateMockResponse(message);
      res.json({
        message: mockResponse,
        model: 'mock',
        note: 'Ollama not available - using cached response'
      });
    }
  } catch (error) {
    logger.error('Error in AI chat', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// Analyze IOC
router.post('/analyze/ioc', async (req, res) => {
  try {
    const { ioc, type } = req.body;
    
    if (!ioc) {
      return res.status(400).json({ error: 'IOC is required' });
    }
    
    const prompt = `Analyze this ${type || 'indicator'}: ${ioc}
    
Provide:
1. Assessment of whether this is malicious
2. Possible associations (malware families, threat actors)
3. Recommended actions
4. Related IOCs if known`;
    
    try {
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: 'llama3.1:8b',
        prompt,
        stream: false
      }, { timeout: 60000 });
      
      res.json({
        ioc,
        type: type || 'unknown',
        analysis: response.data.response,
        model: 'llama3.1:8b'
      });
    } catch {
      res.json({
        ioc,
        type: type || 'unknown',
        analysis: `Analysis for ${ioc}: This indicator requires further investigation. Check against threat intelligence feeds.`,
        model: 'mock'
      });
    }
  } catch (error) {
    logger.error('Error analyzing IOC', error);
    res.status(500).json({ error: 'Failed to analyze IOC' });
  }
});

// Generate threat report
router.post('/report', async (req, res) => {
  try {
    const { topic, includeIOCs = true, includeTTPs = true } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const prompt = `Generate a threat intelligence report about: ${topic}

Include the following sections:
1. Executive Summary
2. Threat Overview
3. Technical Analysis
${includeTTPs ? '4. MITRE ATT&CK TTPs' : ''}
${includeIOCs ? '5. Indicators of Compromise (IOCs)' : ''}
6. Mitigation Recommendations
7. References

Format using markdown with proper headings.`;
    
    try {
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: 'llama3.1:8b',
        prompt,
        stream: false
      }, { timeout: 120000 });
      
      res.json({
        topic,
        report: response.data.response,
        generatedAt: new Date().toISOString(),
        model: 'llama3.1:8b'
      });
    } catch {
      res.json({
        topic,
        report: `# Threat Report: ${topic}\n\nReport generation requires Ollama to be running. Please ensure the AI service is available.`,
        model: 'mock'
      });
    }
  } catch (error) {
    logger.error('Error generating report', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Check Ollama status
router.get('/status', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    
    res.json({
      status: 'connected',
      endpoint: OLLAMA_URL,
      models: response.data.models?.map((m: { name: string }) => m.name) || []
    });
  } catch {
    res.json({
      status: 'disconnected',
      endpoint: OLLAMA_URL,
      error: 'Ollama not available'
    });
  }
});

function generateMockResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('apt') || lowerQuery.includes('threat actor')) {
    return `## Threat Actor Analysis

Based on the query, here's an overview of relevant threat intelligence:

### Key Findings
- Multiple state-sponsored groups are actively targeting this sector
- Common attack vectors include spear-phishing and supply chain compromise

### Recommended Actions
1. Review email security controls
2. Implement network segmentation
3. Enable advanced logging

*For detailed IOCs, please check the Threat Intelligence module.*`;
  }
  
  return `## Analysis Complete

I've processed your query. Here are the key points:

1. **Context**: This appears to be a security-related inquiry
2. **Risk Level**: Medium
3. **Recommendation**: Continue monitoring and cross-reference with threat feeds

Would you like more specific information about any aspect?`;
}

export { router as aiRouter };
