/* eslint-disable @typescript-eslint/no-explicit-any */
// Configuration examples for the SimpleChatbot component

export const defaultChatbotConfig = {
  welcomeMessage:
    "Hello! I'm here to help you with GrantFox. How can I assist you today?",
  placeholder: "Type your message...",
  maxRetries: 3,
  retryDelay: 1000,
  maxMessageLength: 1000,
  enableTypingIndicator: true,
  enableMessageStatus: true,
};

export const customerSupportConfig = {
  welcomeMessage:
    "Hi! I'm your customer support assistant. How can I help you today?",
  placeholder: "Describe your issue...",
  maxRetries: 5,
  retryDelay: 2000,
  maxMessageLength: 2000,
  enableTypingIndicator: true,
  enableMessageStatus: true,
};

export const salesConfig = {
  welcomeMessage:
    "Welcome! I'm here to help you find the perfect solution. What are you looking for?",
  placeholder: "Tell me about your needs...",
  maxRetries: 2,
  retryDelay: 1500,
  maxMessageLength: 1500,
  enableTypingIndicator: true,
  enableMessageStatus: false,
};

// Example AI service integration
export const createAIService = (apiKey: string, model: string = "gpt-4") => {
  return {
    sendMessage: async (message: string, conversationHistory?: any[]) => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            message,
            conversationHistory,
            model,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        return {
          response: data.response,
          metadata: {
            tokens: data.usage?.total_tokens || 0,
            model: data.model || model,
            responseTime: data.responseTime || 0,
          },
        };
      } catch (error) {
        console.error("AI service error:", error);
        throw error;
      }
    },
  };
};
