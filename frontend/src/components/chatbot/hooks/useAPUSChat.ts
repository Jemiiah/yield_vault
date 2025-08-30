import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apusService } from "../services/apusService";

export interface APUSMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status: "sending" | "sent" | "error" | "received" | "processing";
  error?: string;
  reference?: string;
  metadata?: {
    tokens?: number;
    model?: string;
    responseTime?: number;
    attestation?: string;
  };
}

export interface UseAPUSChatOptions {
  maxRetries?: number;
  retryDelay?: number;
  pollInterval?: number;
  maxPollAttempts?: number;
  enableAutoPolling?: boolean;
}

export const useAPUSChat = (options: UseAPUSChatOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    pollInterval = 3000,
    maxPollAttempts = 20,
    enableAutoPolling = true,
  } = options;

  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<APUSMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send message mutation
  const sendMessage = useMutation({
    mutationKey: ["APUS-SendMessage"],
    mutationFn: async (text: string) => {
      const reference = apusService.generateReference();
      const originalUserText = text.trim(); // Store original text

      // Create user message
      const userMessage: APUSMessage = {
        id: Date.now().toString(),
        text: originalUserText, // Use original text
        isUser: true,
        timestamp: new Date(),
        status: "sending",
        reference,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // Update user message status - KEEP ORIGINAL TEXT
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id
              ? { ...msg, status: "sent" as const, text: originalUserText } // Always keep original text
              : msg
          )
        );

        // Send prompt to APUS
        const result = await apusService.sendPrompt(originalUserText, {
          reference,
        });

        // Create bot message with processing status
        const botMessage: APUSMessage = {
          id: (Date.now() + 1).toString(),
          text: "Processing your request...",
          isUser: false,
          timestamp: new Date(),
          status: "processing",
          reference,
        };

        setMessages((prev) => [...prev, botMessage]);

        // If auto-polling is enabled, start polling for response
        if (enableAutoPolling) {
          setTimeout(async () => {
            try {
              const response = await apusService.pollForResponse(
                reference,
                maxPollAttempts,
                pollInterval
              );

              // Update ONLY bot message with final response
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.reference === reference && !msg.isUser // Only update bot messages
                    ? {
                        ...msg,
                        text: response.response || "No response received",
                        status:
                          response.status === "success" ? "received" : "error",
                        error: response.error_message,
                        metadata: {
                          attestation: response.attestation,
                          responseTime: response.endtime
                            ? (response.endtime - response.starttime) * 1000
                            : undefined,
                        },
                      }
                    : msg
                )
              );
            } catch (pollError) {
              console.error("Polling failed:", pollError);
              // Update ONLY bot message with error
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.reference === reference && !msg.isUser // Only update bot messages
                    ? {
                        ...msg,
                        status: "error" as const,
                        text: "Failed to get response",
                        error:
                          pollError instanceof Error
                            ? pollError.message
                            : "Unknown error",
                      }
                    : msg
                )
              );
            } finally {
              setIsLoading(false);
            }
          }, 2000); // Wait 2 seconds before starting to poll
        }

        return result;
      } catch (err) {
        console.error("Error sending message:", err);

        // For user message: ONLY update status, NEVER change the text
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id
              ? {
                  ...msg,
                  status: "error" as const,
                  text: originalUserText, // ALWAYS keep original user text
                  // Don't set error on user message - errors should only show on bot side
                }
              : msg
          )
        );

        // Create a bot error message instead of changing user message
        const errorBotMessage: APUSMessage = {
          id: (Date.now() + 2).toString(),
          text: "Failed to send your message. Please try again.",
          isUser: false,
          timestamp: new Date(),
          status: "error",
          reference,
          error: err instanceof Error ? err.message : "Unknown error",
        };

        setMessages((prev) => [...prev, errorBotMessage]);

        setIsLoading(false);
        setError(err instanceof Error ? err.message : "Failed to send message");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["APUS-Chat"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      setIsLoading(false);
    },
  });

  // Manual response fetching
  const fetchResponse = useMutation({
    mutationKey: ["APUS-FetchResponse"],
    mutationFn: async (reference: string) => {
      return await apusService.getResponse(reference);
    },
    onSuccess: (response, reference) => {
      // Update ONLY bot messages
      setMessages((prev) =>
        prev.map((msg) =>
          msg.reference === reference && !msg.isUser // Only update bot messages
            ? {
                ...msg,
                text: response.response || "No response received",
                status: response.status === "success" ? "received" : "error",
                error: response.error_message,
                metadata: {
                  attestation: response.attestation,
                  responseTime: response.endtime
                    ? (response.endtime - response.starttime) * 1000
                    : undefined,
                },
              }
            : msg
        )
      );
      setIsLoading(false);
    },
    onError: (error, reference) => {
      console.error("Fetch response error:", error);
      // Update ONLY bot messages
      setMessages((prev) =>
        prev.map((msg) =>
          msg.reference === reference && !msg.isUser // Only update bot messages
            ? {
                ...msg,
                status: "error" as const,
                text: "Failed to get response",
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : msg
        )
      );
      setIsLoading(false);
    },
  });

  // Send message with retry logic
  const sendMessageWithRetry = useCallback(
    async (text: string, retryAttempt = 0) => {
      try {
        await sendMessage.mutateAsync(text);
      } catch (err) {
        if (retryAttempt < maxRetries) {
          setTimeout(() => {
            sendMessageWithRetry(text, retryAttempt + 1);
          }, retryDelay * (retryAttempt + 1));
        } else {
          throw err;
        }
      }
    },
    [sendMessage, maxRetries, retryDelay]
  );

  // Retry failed message
  const retryFailedMessage = useCallback(
    (messageId: string) => {
      const failedMessage = messages.find((msg) => msg.id === messageId);
      if (failedMessage && failedMessage.isUser) {
        // Remove the failed message and retry - but keep the original text
        const originalText = failedMessage.text; // Get original text before removing
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        sendMessageWithRetry(originalText); // Use original text for retry
      }
    },
    [messages, sendMessageWithRetry]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Add a welcome message
  const addWelcomeMessage = useCallback((text: string) => {
    const welcomeMessage: APUSMessage = {
      id: "welcome",
      text,
      isUser: false,
      timestamp: new Date(),
      status: "received",
    };
    setMessages([welcomeMessage]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageWithRetry,
    fetchResponse: fetchResponse.mutateAsync,
    retryFailedMessage,
    clearError,
    clearMessages,
    addWelcomeMessage,
    isPending: sendMessage.isPending || fetchResponse.isPending,
  };
};
