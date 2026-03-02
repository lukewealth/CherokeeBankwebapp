// Cherokee Bank - AI Chat API Route
import { NextRequest } from 'next/server';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || message.trim().length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Message is required', 400);
    }

    // Build system prompt for banking assistant
    const systemPrompt = `You are Cherokee Bank AI Assistant. You help customers with:
- Account balances and transaction history
- Transfer and payment guidance
- Currency conversion rates
- Crypto trading information
- KYC/verification process
- Security best practices
- General banking questions

Be concise, professional, and helpful. Never share sensitive account details directly.
If a user asks about specific transactions, guide them to check their dashboard.
Current user ID: ${authResult.userId}`;

    // Use OpenAI if available, otherwise return structured response
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    let reply: string;

    if (OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-10),
            { role: 'user', content: message },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || 'I apologize, I could not process your request. Please try again.';
    } else {
      // Fallback: rule-based responses
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('balance')) {
        reply = 'You can check your current balances on the Wallets page in your dashboard. Navigate to Dashboard → Wallets to see all your fiat and crypto wallet balances.';
      } else if (lowerMsg.includes('transfer') || lowerMsg.includes('send')) {
        reply = 'To send money, go to Dashboard → Send Money. You can transfer to other Cherokee Bank users by email or wallet ID. Fees are 0.1% for standard transfers.';
      } else if (lowerMsg.includes('crypto')) {
        reply = 'Cherokee Bank supports BTC, ETH, and USDT trading. Visit the Crypto page to buy, sell, or view your crypto portfolio. Trading fees are 1.5%.';
      } else if (lowerMsg.includes('kyc') || lowerMsg.includes('verify')) {
        reply = 'To verify your identity, go to Settings → Account and upload the required documents (ID/Passport, Utility Bill). Verification typically takes 1-2 business days.';
      } else if (lowerMsg.includes('security') || lowerMsg.includes('2fa')) {
        reply = 'We recommend enabling Two-Factor Authentication (2FA) in Settings → Security. Cherokee Bank uses AES-256 encryption and all sessions are monitored for suspicious activity.';
      } else {
        reply = `Thank you for your question. I'm here to help with your Cherokee Bank account. You can ask me about balances, transfers, crypto trading, KYC verification, or security settings. How can I assist you today?`;
      }
    }

    return successResponse({
      reply,
      conversationId: `conv_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return errorResponse('INTERNAL_ERROR', 'AI assistant unavailable', 500);
  }
}
