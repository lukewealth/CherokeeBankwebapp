// Cherokee Bank - AI Fraud Predictor (OpenAI-powered risk analysis)
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dev-placeholder',
});

interface TransactionContext {
  amount: number;
  currency: string;
  type: string;
  senderHistory: {
    avgAmount: number;
    txCountLast24h: number;
    accountAgeDays: number;
    kycVerified: boolean;
  };
  ruleBasedScore: number;
  ruleBasedFlags: string[];
}

interface FraudPrediction {
  aiRiskScore: number;
  aiClassification: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
  suggestedAction: string;
}

export class FraudPredictor {
  /**
   * Use AI to analyze transaction for potential fraud
   * Combines rule-based scoring with AI analysis
   */
  static async analyzeTransaction(context: TransactionContext): Promise<FraudPrediction> {
    try {
      const prompt = `Analyze this banking transaction for potential fraud risk:

Transaction Details:
- Amount: ${context.amount} ${context.currency}
- Type: ${context.type}

Sender Profile:
- Average transaction amount: ${context.senderHistory.avgAmount}
- Transactions in last 24h: ${context.senderHistory.txCountLast24h}
- Account age: ${context.senderHistory.accountAgeDays} days
- KYC verified: ${context.senderHistory.kycVerified}

Rule-based risk score: ${context.ruleBasedScore}/100
Flags: ${context.ruleBasedFlags.join(', ') || 'None'}

Respond with a JSON object with these fields:
- aiRiskScore: number (0-100)
- aiClassification: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
- explanation: string (brief analysis)
- suggestedAction: string (what should the bank do)`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a banking fraud analysis AI. Analyze transactions and return risk assessments as JSON. Be precise and conservative—err on the side of caution for high-risk patterns.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const parsed = JSON.parse(response) as FraudPrediction;
        return {
          aiRiskScore: Math.min(100, Math.max(0, parsed.aiRiskScore || context.ruleBasedScore)),
          aiClassification: parsed.aiClassification || 'LOW',
          explanation: parsed.explanation || 'AI analysis unavailable',
          suggestedAction: parsed.suggestedAction || 'Allow with monitoring',
        };
      }
    } catch (error) {
      console.error('[AI] Fraud prediction error:', error);
    }

    // Fallback to rule-based scoring
    return {
      aiRiskScore: context.ruleBasedScore,
      aiClassification: context.ruleBasedScore >= 70 ? 'HIGH' : context.ruleBasedScore >= 40 ? 'MEDIUM' : 'LOW',
      explanation: 'AI analysis unavailable—using rule-based scoring',
      suggestedAction: context.ruleBasedScore >= 70 ? 'Hold for review' : 'Allow',
    };
  }
}
