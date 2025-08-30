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
        <h2 className="text-2xl font-bold text-[#1A2228] dark:text-[#EAEAEA] mb-2">
          Get Personalized Recommendations
        </h2>
        <p className="text-[#7e868c] dark:text-[#95A0A6]">
          Answer a few questions to get the best yield strategies for you
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#EAEAEA] dark:bg-[#1B2329] rounded-full h-2">
        <div
          className="bg-gradient-to-r from-[#25A8CF] to-[#30CFFF] h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <Card className="bg-[#EDF6F9] border border-[#D6EEF6] dark:bg-[#161E24] dark:border-[#192127]">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-[#1A2228] dark:text-[#EAEAEA] mb-6">
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
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? "border-[#25A8CF] bg-[#D6EEF6] dark:bg-[#052834]"
                      : "border-[#DAD9D9E5] dark:border-[#222A30] hover:border-[#25A8CF] dark:hover:border-[#25A8CF]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#1A2228] dark:text-[#EAEAEA]">
                        {option.label}
                      </div>
                      {"description" in option && option.description && (
                        <div className="text-sm text-[#7e868c] dark:text-[#95A0A6] mt-1">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-[#25A8CF] rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
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
          className="border-[#DAD9D9E5] dark:border-[#222A30] text-[#7e868c] hover:bg-[#EAEAEA] dark:hover:bg-[#1B2329]"
        >
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={
            !currentAnswer ||
            (Array.isArray(currentAnswer) && currentAnswer.length === 0)
          }
          className="bg-gradient-to-r from-[#25A8CF] to-[#30CFFF] hover:from-[#1f8ba8] hover:to-[#28b8e6] text-white"
        >
          {currentQuestion === questions.length - 1
            ? "Get Recommendations"
            : "Continue"}
        </Button>
      </div>
    </div>
  );
}
