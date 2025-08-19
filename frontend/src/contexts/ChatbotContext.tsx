"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import { useChatbot } from "../hooks/useChatbot";
import type { ChatbotConfig } from "../types/chatbot.types";

interface ChatbotContextType {
  state: ReturnType<typeof useChatbot>["state"];
  actions: ReturnType<typeof useChatbot>["actions"];
  config: ReturnType<typeof useChatbot>["config"];
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

interface ChatbotProviderProps {
  children: ReactNode;
  config?: Partial<ChatbotConfig>;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({
  children,
  config = {},
}) => {
  const chatbot = useChatbot(config);

  return (
    <ChatbotContext.Provider value={chatbot}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error("useChatbotContext must be used within a ChatbotProvider");
  }
  return context;
};
