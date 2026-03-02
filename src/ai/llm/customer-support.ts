// Cherokee Bank - AI Customer Support
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dev-placeholder',
});

export class CustomerSupportAI {
  /**
   * Analyze customer support message sentiment
   */
  static async analyzeSentiment(message: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
    confidence: number;
    shouldEscalate: boolean;
    suggestedResponse?: string;
  }> {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment of this banking customer support message. Return JSON with: sentiment (positive/neutral/negative/urgent), confidence (0-1), shouldEscalate (boolean), suggestedResponse (brief helpful response).',
          },
          { role: 'user', content: message },
        ],
        max_tokens: 200,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        return JSON.parse(response);
      }
    } catch (error) {
      console.error('[AI] Sentiment analysis error:', error);
    }

    return { sentiment: 'neutral', confidence: 0, shouldEscalate: false };
  }
}
