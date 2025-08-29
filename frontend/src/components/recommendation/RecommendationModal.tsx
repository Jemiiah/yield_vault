import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import RiskAssessmentForm from "./RiskAssessmentForm";
import PoolRecommendations from "./PoolRecommendations";
import type { Pool } from "./types";
import { getAIRecommendations } from "./integrations";

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type RiskAssessmentData = {
  riskTolerance: string;
  investmentAmount: string;
  timeHorizon: string;
  experienceLevel: string;
  preferredTokens: string[];
};

export default function RecommendationModal({
  isOpen,
  onClose,
}: RecommendationModalProps) {
  const [currentStep, setCurrentStep] = useState<"form" | "recommendations">(
    "form"
  );
  const [riskData, setRiskData] = useState<RiskAssessmentData | null>(null);
  const [recommendedPools, setRecommendedPools] = useState<Pool[]>([]);

  const handleFormSubmit = async (data: RiskAssessmentData) => {
    setRiskData(data);

    try {
      // Get AI-powered recommendations
      const recommendations = await getAIRecommendations(data);
      setRecommendedPools(recommendations);
      setCurrentStep("recommendations");
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      // Fallback to mock data if AI fails
      const mockPools: Pool[] = [
        {
          id: "1",
          name: "AO/wAR",
          apy: "31.22%",
          risk: "Low",
          tokens: ["AO", "wAR"],
          description:
            "Automated market making strategy with high yield potential",
          tvl: "$2.5M",
          verified: true,
        },
        {
          id: "2",
          name: "ETH/USDC",
          apy: "28.45%",
          risk: "Medium",
          tokens: ["ETH", "USDC"],
          description: "Stable liquidity provision with moderate risk",
          tvl: "$1.8M",
          verified: true,
        },
        {
          id: "3",
          name: "BTC/AO",
          apy: "35.67%",
          risk: "High",
          tokens: ["BTC", "AO"],
          description: "High yield strategy with increased volatility",
          tvl: "$950K",
          verified: false,
        },
        {
          id: "4",
          name: "USDC/DAI",
          apy: "15.23%",
          risk: "Very Low",
          tokens: ["USDC", "DAI"],
          description: "Stablecoin pair with minimal risk",
          tvl: "$3.2M",
          verified: true,
        },
      ];
      setRecommendedPools(mockPools);
      setCurrentStep("recommendations");
    }
  };

  const handleClose = () => {
    setCurrentStep("form");
    setRiskData(null);
    setRecommendedPools([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#f8f7f4] dark:bg-[#0F1419] border border-[#D6EEF6] dark:border-[#192127]">
        <div className="p-6">
          {currentStep === "form" && (
            <RiskAssessmentForm onSubmit={handleFormSubmit} />
          )}

          {currentStep === "recommendations" && riskData && (
            <PoolRecommendations
              pools={recommendedPools}
              riskData={riskData}
              onBack={() => setCurrentStep("form")}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
