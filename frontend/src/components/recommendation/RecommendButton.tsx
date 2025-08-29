import { Button } from "@/components/ui/button";
import { useState } from "react";
import RecommendationModal from "./RecommendationModal";

interface RecommendButtonProps {
  className?: string;
}

export default function RecommendButton({ className }: RecommendButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className={`bg-gradient-to-r from-[#25A8CF] to-[#30CFFF] hover:from-[#1f8ba8] hover:to-[#28b8e6] text-white font-medium !px-10 py-6 rounded-lg animate-bounce shadow-lg transition-all duration-200 ${className}`}
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Recommend Yields
      </Button>

      <RecommendationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
