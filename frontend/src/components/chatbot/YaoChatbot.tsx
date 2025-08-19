import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Bot, AlertCircle, RefreshCw, User } from "lucide-react";
import { YaoBot } from "../dashboard/YaoBot";

// Enhanced message types for AI integration
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status: "sending" | "sent" | "error" | "received";
  error?: string;
  metadata?: {
    tokens?: number;
    model?: string;
    responseTime?: number;
  };
}

// AI service interface for future integration
interface AIService {
  sendMessage: (
    message: string,
    conversationHistory?: Message[]
  ) => Promise<{
    response: string;
    metadata?: {
      tokens: number;
      model: string;
      responseTime: number;
    };
  }>;
}

// Configuration interface
interface ChatbotConfig {
  welcomeMessage?: string;
  placeholder?: string;
  maxRetries?: number;
  retryDelay?: number;
  maxMessageLength?: number;
  enableTypingIndicator?: boolean;
  enableMessageStatus?: boolean;
}

const YaoChatbot: React.FC<ChatbotConfig> = ({
  welcomeMessage = "Hello! I'm here to help you with GrantFox. How can I assist you today?",
  placeholder = "Type your message...",
  maxRetries = 3,
  retryDelay = 1000,
  maxMessageLength = 1000,
  enableTypingIndicator = true,
  enableMessageStatus = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: welcomeMessage,
      isUser: false,
      timestamp: new Date(),
      status: "received",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Mock AI service for now (replace with real AI integration)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mockAIService: AIService = {
    sendMessage: async (message: string) => {
      // Simulate API delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      // Simulate occasional errors
      if (Math.random() < 0.1) {
        throw new Error("AI service temporarily unavailable");
      }

      // Generate contextual response based on conversation
      const responses = [
        `I understand you said: "${message}". Let me help you with that.`,
        `That's an interesting question about "${message}". Here's what I can tell you...`,
        `Based on your message: "${message}", I think I can assist you.`,
        `I've processed your request: "${message}". Here's my response...`,
        `Regarding "${message}", here's what you should know...`,
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      return {
        response: randomResponse,
        metadata: {
          tokens: Math.floor(Math.random() * 100) + 50,
          model: "gpt-4",
          responseTime: Math.floor(Math.random() * 2000) + 500,
        },
      };
    },
  };

  // Send message with retry logic
  const sendMessage = useCallback(
    async (text: string, retryAttempt = 0) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        isUser: true,
        timestamp: new Date(),
        status: "sending",
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);
      setError(null);

      try {
        // Update user message status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id
              ? { ...msg, status: "sent" as const }
              : msg
          )
        );

        if (enableTypingIndicator) {
          setIsTyping(true);
        }

        // Call AI service
        const result = await mockAIService.sendMessage(text, messages);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.response,
          isUser: false,
          timestamp: new Date(),
          status: "received",
          metadata: result.metadata,
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
        setIsLoading(false);
      } catch (err) {
        console.error("AI service error:", err);

        // Update user message status to error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id
              ? {
                  ...msg,
                  status: "error" as const,
                  error: err instanceof Error ? err.message : "Unknown error",
                }
              : msg
          )
        );

        setIsTyping(false);
        setIsLoading(false);
        setError(err instanceof Error ? err.message : "Failed to send message");

        // Retry logic
        if (retryAttempt < maxRetries) {
          setTimeout(() => {
            sendMessage(text, retryAttempt + 1);
          }, retryDelay * (retryAttempt + 1));
        }
      }
    },
    [
      messages,
      isLoading,
      enableTypingIndicator,
      maxRetries,
      retryDelay,
      mockAIService,
    ]
  );

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    if (inputValue.length > maxMessageLength) {
      setError(
        `Message too long. Maximum ${maxMessageLength} characters allowed.`
      );
      return;
    }

    sendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const retryFailedMessage = (messageId: string) => {
    const failedMessage = messages.find((msg) => msg.id === messageId);
    if (failedMessage && failedMessage.isUser) {
      // Remove the failed message and retry
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      sendMessage(failedMessage.text);
    }
  };

  const clearError = () => {
    setError(null);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} aria-label="Open chat">
        {/* <MessageCircle size={24} /> */}
        <YaoBot />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              YAO Assistant
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isLoading ? "Processing..." : "Online"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">
                {error}
              </span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div className="relative flex items-end space-x-2">
              {/* Bot Icon */}
              {!message.isUser && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={12} className="text-white" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  message.isUser
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {enableMessageStatus && message.isUser && (
                    <div className="flex items-center space-x-1">
                      {message.status === "sending" && (
                        <RefreshCw
                          size={12}
                          className="animate-spin opacity-70"
                        />
                      )}
                      {message.status === "error" && (
                        <button
                          onClick={() => retryFailedMessage(message.id)}
                          className="text-red-300 hover:text-red-100"
                          title="Retry message"
                        >
                          <RefreshCw size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {message.metadata && (
                  <div className="text-xs opacity-50 mt-1">
                    {message.metadata.tokens} tokens •{" "}
                    {message.metadata.responseTime}ms
                  </div>
                )}
              </div>

              {/* User Icon */}
              {message.isUser && (
                <div className="w-6 h-6 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={12} className="text-white" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2">
              {/* Bot Icon */}
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={12} className="text-white" />
              </div>

              {/* Typing Indicator */}
              <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            maxLength={maxMessageLength}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        {inputValue.length > maxMessageLength * 0.8 && (
          <p className="text-xs text-gray-500 mt-1">
            {inputValue.length}/{maxMessageLength} characters
          </p>
        )}
      </div>
    </div>
  );
};

export default YaoChatbot;
