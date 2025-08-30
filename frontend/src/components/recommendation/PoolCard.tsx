import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Pool, RiskAssessmentData } from "./types";
import verified from "../../../public/verified.svg";
import { getRiskColor } from "./utils";
import { spawnAgent } from "../../services/aoService";
import type { AgentSpawnConfig } from "../../services/aoService";
import { AO_TOKEN } from "../../constants/yao_process";

interface PoolCardProps {
  pool: Pool;
  onDeploy?: () => void;
  showDeployButton?: boolean;
  riskData?: RiskAssessmentData;
  enableAgentDeployment?: boolean;
}

export default function PoolCard({
  pool,
  onDeploy,
  showDeployButton = true,
  riskData,
  enableAgentDeployment = false,
}: PoolCardProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<{
    success: boolean;
    message: string;
    agentId?: string;
  } | null>(null);
  const determineBaseToken = (pool: Pool): string => {
    // Always use token1 as base token as suggested
    return pool.token1 || AO_TOKEN;
  };

  const determineTokenOut = (pool: Pool): string => {
    // Always use token0 as out token as suggested
    return pool.token0 || AO_TOKEN;
  };

  const handleAgentDeploy = async () => {
    if (!riskData) {
      setDeploymentResult({
        success: false,
        message: "Risk assessment data is required for agent deployment"
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentResult(null);

    try {
      // Determine base token and token out from pool data
      const baseToken = determineBaseToken(pool);
      const tokenOut = determineTokenOut(pool);
      const poolId = pool.amm_process || pool.id;

      // Create agent configuration with pool-specific parameters
      const agentConfig: AgentSpawnConfig = {
        dex: "Botega", // Default to Botega DEX (correct case)
        tokenOut: tokenOut,
        slippage: 2, // Default 2% slippage
        startDate: Math.floor(Date.now() / 1000), // Start immediately
        endDate: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // End in 30 days
        runIndefinitely: false,
        conversionPercentage: 50, // Default 50% conversion
        strategyType: "Swap50LP50",
        baseToken: baseToken,
        poolId: poolId, // Use the actual AMM process ID
        poolIdReference: pool.id // For tracking purposes
      };

      console.log("Deploying agent with pool-specific config:", {
        poolName: pool.name,
        poolId: poolId,
        baseToken: baseToken, // Always token1
        tokenOut: tokenOut,   // Always token0
        baseTokenTicker: pool.token1_ticker,
        tokenOutTicker: pool.token0_ticker,
        config: agentConfig
      });

      const agentId = await spawnAgent(agentConfig);

      setDeploymentResult({
        success: true,
        message: `Agent deployment initiated successfully for ${pool.name}! The agent is being created and will be ready shortly.`,
        agentId: agentId
      });

      console.log("Agent deployed successfully:", agentId);
    } catch (error) {
      console.error("Failed to deploy agent:", error);
      setDeploymentResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to deploy agent"
      });
    } finally {
      setIsDeploying(false);
    }
  };
  return (
    <Card className="bg-[#F3F3F3] dark:bg-[#141C22] border border-[#DAD9D9E5] dark:border-[#222A30] hover:border-[#25A8CF] dark:hover:border-[#25A8CF] transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Token Icons */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#1a2228] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {pool.tokens[0]?.charAt(0)}
                </span>
              </div>
              <div className="w-8 h-8 -translate-x-2 bg-[#fd3235] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {pool.tokens[1]?.charAt(0)}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-[#1A2228] dark:text-[#EAEAEA]">
                  {pool.name}
                </h3>
                {pool.verified && (
                  <div className="gradient-card p-1 w-4 h-4 rounded-md flex items-center justify-center">
                    <img src={verified} alt="verified" className="w-3 h-3" />
                  </div>
                )}
              </div>
              <p className="text-sm text-[#7e868c] dark:text-[#95A0A6]">
                {pool.description}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-[#25A8CF] dark:text-[#30CFFF]">
              {pool.apy}
            </div>
            <div className="text-xs text-[#7e868c] dark:text-[#95A0A6]">
              APY
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={`${getRiskColor(pool.risk)} border`}>
              Risk: {pool.risk}
            </Badge>
            <Badge className="bg-[#25A8CF] text-white">TVL: {pool.tvl}</Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#7e868c] dark:text-[#95A0A6]">
              Tokens:
            </span>
            <div className="flex space-x-1">
              {pool.tokens.map((token, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs border-[#DAD9D9E5] dark:border-[#222A30] text-[#7e868c] dark:text-[#95A0A6]"
                >
                  {token}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            {enableAgentDeployment && riskData && (
              <Button
                onClick={handleAgentDeploy}
                disabled={isDeploying}
                className="bg-gradient-to-r from-[#FD3235] to-[#FF6B6B] hover:from-[#e62e31] hover:to-[#e55a5a] text-white font-medium px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isDeploying ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deploying...</span>
                  </div>
                ) : (
                  "Deploy Agent"
                )}
              </Button>
            )}

            {showDeployButton && onDeploy && !enableAgentDeployment && (
              <Button
                onClick={onDeploy}
                className="bg-gradient-to-r from-[#25A8CF] to-[#30CFFF] hover:from-[#1f8ba8] hover:to-[#28b8e6] text-white font-medium px-4 py-2 rounded-lg"
              >
                Deploy
              </Button>
            )}
          </div>
        </div>

        {/* Deployment Result */}
        {deploymentResult && (
          <div className={`mt-4 p-3 rounded-lg ${deploymentResult.success
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {deploymentResult.success ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${deploymentResult.success
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
                  }`}>
                  {deploymentResult.success ? "Success!" : "Error"}
                </h3>
                <p className={`mt-1 text-sm ${deploymentResult.success
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
                  }`}>
                  {deploymentResult.message}
                </p>
                {deploymentResult.success && deploymentResult.agentId && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-mono">
                    Session ID: {deploymentResult.agentId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
