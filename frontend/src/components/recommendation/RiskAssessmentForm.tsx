import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import type { RiskAssessmentData } from "./RecommendationModal";

interface RiskAssessmentFormProps {
  onSubmit: (data: RiskAssessmentData) => void;
}

export default function RiskAssessmentForm({
  onSubmit,
}: RiskAssessmentFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<RiskAssessmentData>>({});

  const questions = [
    {
      id: "riskTolerance",
      question: "What's your risk tolerance?",
      options: [
        {
          value: "Very Low",
          label: "Very Low",
          description: "I prefer stable, low-risk investments",
        },
        {
          value: "Low",
          label: "Low",
          description: "I'm comfortable with some volatility",
        },
        {
          value: "Medium",
          label: "Medium",
          description: "I can handle moderate ups and downs",
        },
        {
          value: "High",
          label: "High",
          description:
            "I'm willing to take significant risks for higher returns",
        },
      ],
    },
    {
      id: "investmentAmount",
      question: "How much are you planning to invest?",
      options: [
        { value: "Under $1K", label: "Under $1K" },
        { value: "$1K - $10K", label: "$1K - $10K" },
        { value: "$10K - $100K", label: "$10K - $100K" },
        { value: "Over $100K", label: "Over $100K" },
      ],
    },
    {
      id: "timeHorizon",
      question: "What's your investment time horizon?",
      options: [
        {
          value: "Short-term",
          label: "Short-term",
          description: "Less than 6 months",
        },
        {
          value: "Medium-term",
          label: "Medium-term",
          description: "6 months to 2 years",
        },
        { value: "Long-term", label: "Long-term", description: "2+ years" },
      ],
    },
    {
      id: "experienceLevel",
      question: "What's your DeFi experience level?",
      options: [
        { value: "Beginner", label: "Beginner", description: "New to DeFi" },
        {
          value: "Intermediate",
          label: "Intermediate",
          description: "Some experience with DeFi",
        },
        {
          value: "Advanced",
          label: "Advanced",
          description: "Experienced DeFi user",
        },
      ],
    },
    {
      id: "preferredTokens",
      question:
        "Which tokens are you most interested in? (Select all that apply)",
      options: [
        { value: "AO", label: "AO" },
        { value: "wUSDC", label: "wUSDC" },
        { value: "wAR", label: "wAR" },
      ],
      multiSelect: true,
    },
  ];

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Submit the form
      onSubmit(answers as RiskAssessmentData);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id as keyof RiskAssessmentData];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#1A2228] dark:text-[#F5FBFF] mb-2">
          Get Personalized Recommendations
        </h2>
        <p className="text-[#565E64] dark:text-[#95A0A6]">
          Answer a few questions to get the best yield strategies for you
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#EAEAEA] dark:bg-[#192127] rounded-full h-2">
        <div
          className="bg-gradient-to-r from-[#4C545A] to-[#060E14] dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <Card className="rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] border border-[#EAEAEA] dark:border-[#192127] shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-[#1A2228] dark:text-[#F5FBFF] mb-6">
            {currentQ.question}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((option) => {
              const isSelected = currentQ.multiSelect
                ? Array.isArray(currentAnswer) &&
                  currentAnswer.includes(option.value)
                : currentAnswer === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    if (currentQ.multiSelect) {
                      const currentArray = Array.isArray(currentAnswer)
                        ? currentAnswer
                        : [];
                      const newArray = isSelected
                        ? currentArray.filter((item) => item !== option.value)
                        : [...currentArray, option.value];
                      handleAnswer(currentQ.id, newArray);
                    } else {
                      handleAnswer(currentQ.id, option.value);
                    }
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 text-left shadow-lg ${
                    isSelected
                      ? "border-[#1A2228] dark:border-[#F5FBFF] bg-gradient-to-br from-[#F6F5F2] to-[#EAEAEA] dark:from-[#11191F] dark:to-[#0F1419]"
                      : "border-[#EAEAEA] dark:border-[#192127] bg-gradient-to-br from-white to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] hover:border-[#1A2228] dark:hover:border-[#F5FBFF]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#1A2228] dark:text-[#F5FBFF]">
                        {option.label}
                      </div>
                      {"description" in option && option.description && (
                        <div className="text-sm text-[#565E64] dark:text-[#95A0A6] mt-1">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white dark:text-[#1A2228]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          variant="outline"
          className="h-10 px-6 rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] border border-[#EAEAEA] dark:border-[#192127] text-[#565E64] dark:text-[#95A0A6] hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
        >
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={
            !currentAnswer ||
            (Array.isArray(currentAnswer) && currentAnswer.length === 0)
          }
          className="h-10 px-6 rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:bg-gradient-to-br dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] dark:text-[#1A2228] text-white font-semibold hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
        >
          {currentQuestion === questions.length - 1
            ? "Get Recommendations"
            : "Continue"}
        </Button>
      </div>
    </div>
  );
}
