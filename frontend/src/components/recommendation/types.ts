export interface Pool {
  id: string;
  name: string;
  apy: string;
  risk: string;
  tokens: string[];
  description: string;
  tvl: string;
  verified: boolean;
}

export interface RiskAssessmentData {
  riskTolerance: string;
  investmentAmount: string;
  timeHorizon: string;
  experienceLevel: string;
  preferredTokens: string[];
}
