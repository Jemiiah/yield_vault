import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Pool, RiskAssessmentData } from "./types";
import PoolCard from "./PoolCard";
import { getRandomSelection, deployStrategy } from "./integrations";

interface PoolRecommendationsProps {
  pools: Pool[];
  riskData: RiskAssessmentData;
  onBack: () => void;
  onClose: () => void;
}

export default function PoolRecommendations({
  pools,
  riskData,
  onBack,
  onClose,
}: PoolRecommendationsProps) {
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);

  const handleRandomSelection = async () => {
    setIsRandomizing(true);

    try {
      // Use Randao for random selection
      const randomPool = await getRandomSelection(pools);
      setSelectedPool(randomPool);
    } catch (error) {
      console.error("Failed to get random selection:", error);
      // Fallback to Math.random
      const randomIndex = Math.floor(Math.random() * pools.length);
      const randomPool = pools[randomIndex];
      setSelectedPool(randomPool);
    } finally {
      setIsRandomizing(false);
    }
  };

  const handleDeploy = async (pool: Pool) => {
    try {
      // TODO: Get amount from user input or use default
      const amount = "1000"; // This should come from user input

      const success = await deployStrategy(pool, amount);
      if (success) {
        console.log("Successfully deployed pool:", pool);
        onClose();
        // TODO: Navigate to deposit page or show success message
      }
    } catch (error) {
      console.error("Failed to deploy strategy:", error);
      // TODO: Show error message to user
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#1A2228] dark:text-[#F5FBFF] mb-2">
          Recommended for You
        </h2>
        <p className="text-[#565E64] dark:text-[#95A0A6]">
          Based on your preferences, here are the best strategies
        </p>
      </div>

      {/* Risk Summary */}
      <Card className="rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] border border-[#EAEAEA] dark:border-[#192127] shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] text-white dark:text-[#1A2228] font-medium">
              Risk: {riskData.riskTolerance}
            </Badge>
            <Badge className="rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] text-white dark:text-[#1A2228] font-medium">
              Amount: {riskData.investmentAmount}
            </Badge>
            <Badge className="rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] text-white dark:text-[#1A2228] font-medium">
              Horizon: {riskData.timeHorizon}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Random Selection Button */}
      <div className="text-center">
        <Button
          onClick={handleRandomSelection}
          disabled={isRandomizing}
          className="h-12 w-full md:w-72 text-base rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:bg-gradient-to-br dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] dark:text-[#1A2228] backdrop-blur-md text-white font-semibold transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
        >
          {isRandomizing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-[#1A2228]"></div>
              <span>Selecting Best Option...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Recommend Best for Me</span>
            </div>
          )}
        </Button>
      </div>

      {/* Selected Pool (if random selection was used) */}
      {selectedPool && (
        <Card className="rounded-lg bg-gradient-to-br from-[#F6F5F2] to-[#EAEAEA] dark:from-[#11191F] dark:to-[#0F1419] border-2 border-[#1A2228] dark:border-[#F5FBFF] shadow-lg">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <Badge className="rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] text-white dark:text-[#1A2228] font-medium mb-2">
                🎯 AI Recommended
              </Badge>
              <h3 className="text-xl font-bold text-[#1A2228] dark:text-[#F5FBFF]">
                Best Match for You
              </h3>
            </div>
            <PoolCard 
              pool={selectedPool} 
              riskData={riskData}
              enableAgentDeployment={true}
              showDeployButton={false}
            />
          </CardContent>
        </Card>
      )}

      {/* All Recommended Pools */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1A2228] dark:text-[#F5FBFF]">
          All Recommendations
        </h3>
        <div className="grid gap-4">
          {pools.map((pool) => (
            <PoolCard
              key={pool.id}
              pool={pool}
              onDeploy={() => handleDeploy(pool)}
              riskData={riskData}
              enableAgentDeployment={true}
              showDeployButton={false}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="h-10 px-6 rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] border border-[#EAEAEA] dark:border-[#192127] text-[#565E64] dark:text-[#95A0A6] hover:scale-105 transition-all duration-200 shadow-lg"
        >
          Back to Questions
        </Button>

        <Button
          onClick={onClose}
          variant="outline"
          className="h-10 px-6 rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] border border-[#EAEAEA] dark:border-[#192127] text-[#565E64] dark:text-[#95A0A6] hover:scale-105 transition-all duration-200 shadow-lg"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
