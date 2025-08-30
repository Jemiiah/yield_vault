import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Pool, RiskAssessmentData } from "./types";
import verified from "../../../public/verified.svg";
import ao_logo from "../../../public/ao_logo.svg";
// import { getRiskColor } from "./utils";
import { spawnAgent } from "../../services/aoService";
import type { AgentSpawnConfig } from "../../services/aoService";
import { AO_TOKEN } from "../../constants/yao_process";
import { getTokenInfo } from "../../helpers/token";

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

  // State for token logos
  const [tokenLogos, setTokenLogos] = useState<Record<string, string>>({});
  const [logoLoading, setLogoLoading] = useState<Set<string>>(new Set());

  // Function to fetch token logo
  const fetchTokenLogo = useCallback(
    async (tokenId: string) => {
      if (!tokenId || tokenLogos[tokenId] || logoLoading.has(tokenId)) return;

      setLogoLoading((prev) => new Set(prev).add(tokenId));

      try {
        const tokenInfo = await getTokenInfo(tokenId);
        setTokenLogos((prev) => ({
          ...prev,
          [tokenId]: tokenInfo.logo,
        }));
      } catch (error) {
        console.error(`Failed to fetch logo for token ${tokenId}:`, error);
        // Use fallback logo on error
        setTokenLogos((prev) => ({
          ...prev,
          [tokenId]: ao_logo,
        }));
      } finally {
        setLogoLoading((prev) => {
          const newSet = new Set(prev);
          newSet.delete(tokenId);
          return newSet;
        });
      }
    },
    [tokenLogos, logoLoading]
  );

  // Helper function to get token logo with fallback
  const getTokenLogo = useCallback(
    (tokenId?: string): string => {
      if (!tokenId) return ao_logo;
      return tokenLogos[tokenId] || ao_logo;
    },
    [tokenLogos]
  );

  // Fetch logos for pool tokens
  useEffect(() => {
    if (pool.token0) fetchTokenLogo(pool.token0);
    if (pool.token1) fetchTokenLogo(pool.token1);
  }, [pool.token0, pool.token1, fetchTokenLogo]);
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
        message: "Risk assessment data is required for agent deployment",
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
        endDate: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // End in 30 days
        runIndefinitely: false,
        conversionPercentage: 50, // Default 50% conversion
        strategyType: "Swap50LP50",
        baseToken: baseToken,
        poolId: poolId, // Use the actual AMM process ID
        poolIdReference: pool.id, // For tracking purposes
      };

      console.log("Deploying agent with pool-specific config:", {
        poolName: pool.name,
        poolId: poolId,
        baseToken: baseToken, // Always token1
        tokenOut: tokenOut, // Always token0
        baseTokenTicker: pool.token1_ticker,
        tokenOutTicker: pool.token0_ticker,
        config: agentConfig,
      });

      const agentId = await spawnAgent(agentConfig);

      setDeploymentResult({
        success: true,
        message: `Agent deployment initiated successfully for ${pool.name}! The agent is being created and will be ready shortly.`,
        agentId: agentId,
      });

      console.log("Agent deployed successfully:", agentId);
    } catch (error) {
      console.error("Failed to deploy agent:", error);
      setDeploymentResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to deploy agent",
      });
    } finally {
      setIsDeploying(false);
    }
  };
  return (
    <Card className="rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] border border-[#EAEAEA] dark:border-[#192127] hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Token Icons */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] shadow-lg flex items-center justify-center">
                <img
                  src={getTokenLogo(pool.token0)}
                  alt={pool.token0_ticker || pool.tokens?.[0] || "Token"}
                  className="w-6 h-6 rounded-full"
                />
              </div>
              <div className="w-8 h-8 -translate-x-2 rounded-full bg-gradient-to-br from-white to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] shadow-lg flex items-center justify-center">
                <img
                  src={getTokenLogo(pool.token1)}
                  alt={pool.token1_ticker || pool.tokens?.[1] || "Token"}
                  className="w-6 h-6 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-[#1A2228] dark:text-[#F5FBFF]">
                  {pool.name}
                </h3>
                {pool.verified && (
                  <div className="rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] p-1 w-6 h-6 flex items-center justify-center shadow-lg">
                    <img src={verified} alt="verified" className="w-4 h-4" />
                  </div>
                )}
              </div>
              <p className="text-sm text-[#565E64] dark:text-[#95A0A6]">
                {pool.description}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-[#1A2228] dark:text-[#F5FBFF]">
              {pool.apy}
            </div>
            <div className="text-xs text-[#565E64] dark:text-[#95A0A6]">
              APY
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] text-white dark:text-[#1A2228] font-medium border-none">
              Risk: {pool.risk}
            </Badge>
            <Badge className="rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] text-white dark:text-[#1A2228] font-medium border-none">
              TVL: {pool.tvl}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#565E64] dark:text-[#95A0A6]">
              Tokens:
            </span>
            <div className="flex space-x-1">
              {pool.tokens?.map((token, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] border border-[#EAEAEA] dark:border-[#192127] text-[#565E64] dark:text-[#95A0A6]"
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
                className="h-10 px-6 rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:bg-gradient-to-br dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] dark:text-[#1A2228] text-white font-semibold hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
              >
                {isDeploying ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-[#1A2228]"></div>
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
                className="h-10 px-6 rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:bg-gradient-to-br dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] dark:text-[#1A2228] text-white font-semibold hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Deploy
              </Button>
            )}
          </div>
        </div>

        {/* Deployment Result */}
        {deploymentResult && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              deploymentResult.success
                ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800"
                : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800"
            } shadow-lg`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {deploymentResult.success ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3
                  className={`text-sm font-medium ${
                    deploymentResult.success
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {deploymentResult.success ? "Success!" : "Error"}
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    deploymentResult.success
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
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
