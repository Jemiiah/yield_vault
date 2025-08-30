export interface Pool {
  id: string;
  name: string;
  apy: string;
  risk: string;
  tokens: string[];
  description: string;
  tvl: string;
  verified: boolean;
  // Additional pool data for agent deployment
  amm_process?: string;
  token0?: string;
  token1?: string;
  token0_ticker?: string;
  token1_ticker?: string;
  token0_name?: string;
  token1_name?: string;
}

export interface RiskAssessmentData {
  riskTolerance: string;
  investmentAmount: string;
  timeHorizon: string;
  experienceLevel: string;
  preferredTokens: string[];
}
