// Cherokee Bank - Savings Recommender AI
import { SpendTracker } from './spend-tracker';

export class SavingsRecommender {
  /**
   * Generate savings recommendations based on spending patterns
   */
  static async getRecommendations(userId: string): Promise<{
    monthlySavingsPotential: number;
    tips: string[];
    spendingInsights: string[];
  }> {
    const summary = await SpendTracker.getSpendingSummary(userId, 30);
    
    const tips: string[] = [];
    const insights: string[] = [];

    // Analyze spending patterns
    if (summary.averageDaily > 500) {
      tips.push('Your daily average spending is above $500. Consider setting a daily budget.');
      insights.push('High daily spending detected');
    }

    if (summary.byType['CRYPTO_BUY'] && summary.byType['CRYPTO_BUY'] > summary.totalSpent * 0.3) {
      tips.push('Over 30% of your spending is on crypto purchases. Consider diversifying investments.');
      insights.push('Heavy crypto investment activity');
    }

    if (summary.transactionCount > 100) {
      tips.push('You have a high transaction frequency. Consider consolidating payments.');
      insights.push('High transaction volume');
    }

    // Default tips
    if (tips.length === 0) {
      tips.push('Your spending patterns look healthy! Consider setting up automatic savings.');
      tips.push('Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.');
    }

    const savingsPotential = Math.round(summary.totalSpent * 0.15); // Suggest saving 15%

    return {
      monthlySavingsPotential: savingsPotential,
      tips,
      spendingInsights: insights,
    };
  }
}
