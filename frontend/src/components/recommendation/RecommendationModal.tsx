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
  const [currentStep, setCurrentStep] = useState<"form" | "recommendations" | "loading">(
    "form"
  );
  const [riskData, setRiskData] = useState<RiskAssessmentData | null>(null);
  const [recommendedPools, setRecommendedPools] = useState<Pool[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: RiskAssessmentData) => {
    setRiskData(data);
    setError(null);
    setCurrentStep("loading");

    try {
      console.log("Submitting risk assessment to Manager Contract:", data);
      
      // Get AI-powered recommendations from Manager Contract
      const recommendations = await getAIRecommendations(data);
      
      console.log("Received recommendations:", recommendations);
      
      if (recommendations.length === 0) {
        setError("No recommendations available at this time. Please try again later.");
        setCurrentStep("form");
        return;
      }
      
      setRecommendedPools(recommendations);
      setCurrentStep("recommendations");
    } catch (error) {
      console.error("Failed to get recommendations from Manager Contract:", error);
      
      // Show error and return to form
      setError(
        error instanceof Error 
          ? `Failed to get recommendations: ${error.message}` 
          : "Unable to connect to the recommendation service. Please try again later."
      );
      setCurrentStep("form");
    }
  };

  const handleClose = () => {
    setCurrentStep("form");
    setRiskData(null);
    setRecommendedPools([]);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#f8f7f4] dark:bg-[#0F1419] border border-[#D6EEF6] dark:border-[#192127]">
        <div className="p-6">
          {currentStep === "form" && (
            <>
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                        Error
                      </h3>
                      <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <RiskAssessmentForm onSubmit={handleFormSubmit} />
            </>
          )}

          {currentStep === "loading" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Getting AI Recommendations
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Analyzing your risk profile and finding the best pools...
              </p>
            </div>
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
