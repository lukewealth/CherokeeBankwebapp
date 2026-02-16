// Cherokee Bank - AI Sentiment Analysis API Route
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { text, context = 'support' } = body;

    if (!text || text.trim().length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Text is required', 400);
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    let sentiment: { score: number; label: string; confidence: number; keywords: string[] };

    if (OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Analyze the sentiment of customer ${context} text. Return JSON only: {"score": float -1 to 1, "label": "positive"|"negative"|"neutral", "confidence": float 0-1, "keywords": ["keyword1","keyword2"]}`,
            },
            { role: 'user', content: text },
          ],
          max_tokens: 200,
          temperature: 0,
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      try {
        sentiment = JSON.parse(content);
      } catch {
        sentiment = { score: 0, label: 'neutral', confidence: 0.5, keywords: [] };
      }
    } else {
      // Simplified rule-based sentiment
      const lower = text.toLowerCase();
      const positiveWords = ['good', 'great', 'excellent', 'love', 'amazing', 'helpful', 'thanks', 'happy'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'angry', 'frustrated', 'scam'];

      const posCount = positiveWords.filter((w) => lower.includes(w)).length;
      const negCount = negativeWords.filter((w) => lower.includes(w)).length;

      const score = (posCount - negCount) / Math.max(1, posCount + negCount);
      const label = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral';

      sentiment = {
        score: parseFloat(score.toFixed(3)),
        label,
        confidence: 0.6,
        keywords: [...positiveWords.filter((w) => lower.includes(w)), ...negativeWords.filter((w) => lower.includes(w))],
      };
    }

    return successResponse({
      sentiment,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return errorResponse('INTERNAL_ERROR', 'Sentiment analysis failed', 500);
  }
}
