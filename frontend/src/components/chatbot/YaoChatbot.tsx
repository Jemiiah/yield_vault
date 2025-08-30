import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Bot } from "lucide-react";
import { YaoBot } from "../dashboard/YaoBot";
import { useAPUSChat } from "./hooks/useAPUSChat";
import { MessageBubble } from "./components/MessageBubble";

// Configuration interface
interface ChatbotConfig {
  welcomeMessage?: string;
  placeholder?: string;
  maxRetries?: number;
  retryDelay?: number;
  maxMessageLength?: number;
  enableTypingIndicator?: boolean;
  enableMessageStatus?: boolean;
  // APUS-specific options
  pollInterval?: number;
  maxPollAttempts?: number;
  enableAutoPolling?: boolean;
  // Display options
  maxDisplayLength?: number;
}

const YaoChatbot: React.FC<ChatbotConfig> = ({
  welcomeMessage = "Hello! I'm here to help you with YAO. How can I assist you today?",
  placeholder = "Type your message...",
  maxRetries = 3,
  retryDelay = 1000,
  maxMessageLength = 1000,
  enableTypingIndicator = true,
  enableMessageStatus = true,
  pollInterval = 3000,
  maxPollAttempts = 20,
  enableAutoPolling = true,
  maxDisplayLength = 200,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use APUS chat hook
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    retryFailedMessage,
    clearError,
    addWelcomeMessage,
  } = useAPUSChat({
    maxRetries,
    retryDelay,
    pollInterval,
    maxPollAttempts,
    enableAutoPolling,
  });

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

  // Add welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      addWelcomeMessage(welcomeMessage);
    }
  }, [addWelcomeMessage, welcomeMessage, messages.length]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    if (inputValue.length > maxMessageLength) {
      clearError();
      return;
    }

    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
          <MessageBubble
            key={message.id}
            message={message}
            onRetry={retryFailedMessage}
            enableMessageStatus={enableMessageStatus}
            maxMessageLength={maxDisplayLength}
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && enableTypingIndicator && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2">
              {/* Bot Icon */}
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={12} className="text-white" />
              </div>

              {/* Simple Loading Message */}
              <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg">
                <span className="text-sm">Thinking...</span>
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
