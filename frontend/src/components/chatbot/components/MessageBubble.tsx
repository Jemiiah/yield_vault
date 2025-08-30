import React from "react";
import { Bot, User, RefreshCw, AlertCircle } from "lucide-react";
import type { APUSMessage } from "../hooks/useAPUSChat";

interface MessageBubbleProps {
  message: APUSMessage;
  onRetry?: (messageId: string) => void;
  enableMessageStatus?: boolean;
  maxMessageLength?: number;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRetry,
  enableMessageStatus = true,
  maxMessageLength = 200,
}) => {
  const isProcessing = message.status === "processing";
  const isError = message.status === "error";
  const isUser = message.isUser;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="relative flex items-end space-x-2">
        {/* Bot Icon */}
        {!isUser && (
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot size={12} className="text-white" />
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`max-w-xs px-3 py-2 rounded-lg ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          }`}
        >
          {/* For bot messages, show truncated result */}
          {!isUser ? (
            <div>
              <p className="text-sm whitespace-pre-wrap">
                {message.text.length > maxMessageLength
                  ? message.text.substring(0, maxMessageLength) + "..."
                  : message.text}
              </p>

              {/* Show full text in expandable section if truncated */}
              {message.text.length > maxMessageLength && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs opacity-70 hover:opacity-100">
                    Show full response
                  </summary>
                  <div className="mt-2 p-2 bg-black bg-opacity-10 rounded text-xs whitespace-pre-wrap max-h-32 overflow-auto">
                    {message.text}
                  </div>
                </details>
              )}
            </div>
          ) : (
            /* For user messages, ALWAYS show original text, never error text */
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          )}

          {/* Message Footer - Simplified */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs opacity-70">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {enableMessageStatus && (
              <div className="flex items-center space-x-1">
                {/* Processing indicator */}
                {isProcessing && (
                  <RefreshCw size={12} className="animate-spin opacity-70" />
                )}

                {/* Error indicator with retry button */}
                {isError && onRetry && (
                  <button
                    onClick={() => onRetry(message.id)}
                    className="text-red-300 hover:text-red-100 transition-colors"
                    title="Retry message"
                  >
                    <RefreshCw size={12} />
                  </button>
                )}

                {/* Error indicator without retry */}
                {isError && !onRetry && (
                  <AlertCircle size={12} className="text-red-300" />
                )}
              </div>
            )}
          </div>

          {/* Simplified Metadata - Only show essential info */}
          {message.metadata && !isUser && (
            <div className="text-xs opacity-50 mt-1">
              {message.metadata.responseTime && (
                <div>⏱️ {message.metadata.responseTime}ms</div>
              )}

              {/* Show attestation data if available */}
              {message.metadata.attestation && (
                <details className="mt-1">
                  <summary className="cursor-pointer hover:opacity-75">
                    🔐 View Attestation
                  </summary>
                  <div className="mt-1 p-2 bg-black bg-opacity-10 rounded text-xs font-mono overflow-auto max-h-20">
                    {message.metadata.attestation}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Error message */}
          {isError && message.error && (
            <div className="text-xs text-red-300 mt-1">
              Error: {message.error}
            </div>
          )}
        </div>

        {/* User Icon */}
        {isUser && (
          <div className="w-6 h-6 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={12} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
};
