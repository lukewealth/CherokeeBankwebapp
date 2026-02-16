// Cherokee Bank - AI Banking Assistant (OpenAI GPT-4)
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dev-placeholder',
});

const SYSTEM_PROMPT = `You are Cherokee Bank's AI Banking Assistant. You help customers with:
- Account balance inquiries
- Transaction history questions
- Currency conversion information
- Crypto trading guidance
- General banking FAQ
- Fraud alert awareness
- KYC/verification guidance
- Spending insights and budgeting tips

Rules:
- Never reveal sensitive account details like full account numbers or passwords
- Always recommend contacting support for complex issues
- Be professional, concise, and helpful
- If unsure, say "I'd recommend contacting our support team for detailed assistance"
- Never execute transactions directly—guide users to the appropriate feature
- Respond in a friendly, professional tone`;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class BankAssistant {
  /**
   * Get a chat completion from the AI assistant
   */
  static async chat(
    messages: ChatMessage[],
    userContext?: {
      firstName?: string;
      totalBalance?: number;
      walletCount?: number;
      kycStatus?: string;
    }
  ): Promise<string> {
    // Build context-aware system prompt
    let systemMessage = SYSTEM_PROMPT;
    if (userContext) {
      systemMessage += `\n\nCurrent user context:`;
      if (userContext.firstName) systemMessage += `\n- Name: ${userContext.firstName}`;
      if (userContext.totalBalance !== undefined) systemMessage += `\n- Total balance: $${userContext.totalBalance.toFixed(2)}`;
      if (userContext.walletCount) systemMessage += `\n- Wallets: ${userContext.walletCount}`;
      if (userContext.kycStatus) systemMessage += `\n- KYC Status: ${userContext.kycStatus}`;
    }

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemMessage },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'I apologize, I was unable to generate a response. Please try again.';
    } catch (error) {
      console.error('[AI] Bank assistant error:', error);
      return 'I apologize, our AI assistant is temporarily unavailable. Please try again later or contact our support team.';
    }
  }

  /**
   * Stream a chat response (for real-time display)
   */
  static async *chatStream(
    messages: ChatMessage[],
    userContext?: Record<string, unknown>
  ): AsyncGenerator<string> {
    let systemMessage = SYSTEM_PROMPT;
    if (userContext) {
      systemMessage += `\n\nUser context: ${JSON.stringify(userContext)}`;
    }

    try {
      const stream = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemMessage },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) yield content;
      }
    } catch (error) {
      console.error('[AI] Stream error:', error);
      yield 'I apologize, our AI assistant is temporarily unavailable.';
    }
  }
}
