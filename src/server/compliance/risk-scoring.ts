// Cherokee Bank - Risk Scoring Model
import { AMLService } from './aml';
import { FraudEngine } from './fraud-engine';

export class RiskScoring {
  /**
   * Comprehensive risk assessment for a transaction
   * Combines AML rules + fraud scoring
   */
  static async assessTransaction(
    userId: string,
    amount: number,
    currency: string,
    type: string,
    metadata?: Record<string, unknown>
  ): Promise<{
    riskScore: number;
    riskLevel: string;
    flags: string[];
    recommendation: 'ALLOW' | 'FLAG' | 'HOLD' | 'BLOCK';
    shouldCreateReport: boolean;
  }> {
    // Run AML check and fraud scoring in parallel
    const [amlResult, fraudResult] = await Promise.all([
      AMLService.checkTransaction(userId, amount, currency, type),
      FraudEngine.calculateRiskScore(userId, amount, type, metadata),
    ]);

    // Combine scores (weighted average)
    const amlWeight = 0.4;
    const fraudWeight = 0.6;
    const amlScore = this.riskLevelToScore(amlResult.riskLevel);
    const combinedScore = Math.round(amlScore * amlWeight + fraudResult.score * fraudWeight);

    // All flags
    const allFlags = [...amlResult.flags, ...fraudResult.factors];

    // Determine risk level from combined score
    let riskLevel: string;
    let recommendation: 'ALLOW' | 'FLAG' | 'HOLD' | 'BLOCK';

    if (combinedScore >= 90) {
      riskLevel = 'CRITICAL';
      recommendation = 'BLOCK';
    } else if (combinedScore >= 70) {
      riskLevel = 'HIGH';
      recommendation = 'HOLD';
    } else if (combinedScore >= 40) {
      riskLevel = 'MEDIUM';
      recommendation = 'FLAG';
    } else {
      riskLevel = 'LOW';
      recommendation = 'ALLOW';
    }

    return {
      riskScore: combinedScore,
      riskLevel,
      flags: allFlags,
      recommendation,
      shouldCreateReport: combinedScore >= 40,
    };
  }

  private static riskLevelToScore(level: string): number {
    switch (level) {
      case 'CRITICAL': return 100;
      case 'HIGH': return 75;
      case 'MEDIUM': return 50;
      case 'LOW': return 10;
      default: return 0;
    }
  }
}
