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
        <h2 className="text-2xl font-bold text-[#1A2228] dark:text-[#EAEAEA] mb-2">
          Recommended for You
        </h2>
        <p className="text-[#7e868c] dark:text-[#95A0A6]">
          Based on your preferences, here are the best strategies
        </p>
      </div>

      {/* Risk Summary */}
      <Card className="bg-[#EDF6F9] border border-[#D6EEF6] dark:bg-[#161E24] dark:border-[#192127]">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-[#25A8CF] text-white">
              Risk: {riskData.riskTolerance}
            </Badge>
            <Badge className="bg-[#30CFFF] text-white">
              Amount: {riskData.investmentAmount}
            </Badge>
            <Badge className="bg-[#25A8CF] text-white">
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
          className="bg-gradient-to-r from-[#FD3235] to-[#FF6B6B] hover:from-[#e62e31] hover:to-[#e55a5a] text-white font-medium px-8 py-3 rounded-lg shadow-lg transition-all duration-200"
        >
          {isRandomizing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
        <Card className="bg-gradient-to-r from-[#D6EEF6] to-[#E8F4F8] border-2 border-[#25A8CF] dark:from-[#052834] dark:to-[#0a3a4a] dark:border-[#30CFFF]">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <Badge className="bg-[#25A8CF] text-white mb-2">
                🎯 AI Recommended
              </Badge>
              <h3 className="text-xl font-bold text-[#1A2228] dark:text-[#EAEAEA]">
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
        <h3 className="text-lg font-semibold text-[#1A2228] dark:text-[#EAEAEA]">
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
          className="border-[#DAD9D9E5] dark:border-[#222A30] text-[#7e868c] hover:bg-[#EAEAEA] dark:hover:bg-[#1B2329]"
        >
          Back to Questions
        </Button>

        <Button
          onClick={onClose}
          variant="outline"
          className="border-[#DAD9D9E5] dark:border-[#222A30] text-[#7e868c] hover:bg-[#EAEAEA] dark:hover:bg-[#1B2329]"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
