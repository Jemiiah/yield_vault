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

  // Pool liquidity and volume data
  liquidity_usd?: string;
  volume_usd?: string;
  pool_fee_bps?: string;
  transactions?: string;
  amm_status?: string;
  fixed_supply?: boolean;
  amm_discovered_at_ts?: string;

  // Token 0 detailed data
  token0_current_price?: string | undefined;
  token0_market_cap?: string | undefined;
  token0_price_24h_ago?: string;
  token0_supply?: string;

  // Token 1 detailed data
  token1_current_price?: string | undefined;
  token1_market_cap?: string | undefined;
  token1_price_24h_ago?: string;
  token1_supply?: string;

  // Additional pool metadata
  nextHarvest?: {
    minutes: string;
    seconds: string;
  };
  totalRewards?: string;
  harvestCount?: string;
}

export interface RiskAssessmentData {
  riskTolerance: string;
  investmentAmount: string;
  timeHorizon: string;
  experienceLevel: string;
  preferredTokens: string[];
}
