"use client";

import type {
  ChatActions,
  ChatMessage,
  ChatState,
  ChatbotConfig,
} from "../types/chatbot.types";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_CONFIG: ChatbotConfig = {
  position: "bottom-right",
  theme: "auto",
  showNotificationBadge: true,
  enableSound: true,
  autoOpen: false,
  maxHeight: "500px",
  minWidth: "350px",
};

export const useChatbot = (config: Partial<ChatbotConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<ChatState>({
    isOpen: finalConfig.autoOpen || false,
    isMinimized: false,
    messages: [],
    isLoading: false,
    unreadCount: 0,
    hasNewMessage: false,
    streamedMessage: undefined,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for sound effects
  useEffect(() => {
    if (finalConfig.enableSound && typeof window !== "undefined") {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.3;
    }
  }, [finalConfig.enableSound]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (finalConfig.enableSound && audioRef.current) {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  }, [finalConfig.enableSound]);

  // Load initial greeting
  const loadGreeting = useCallback(async () => {
    // Fallback greeting - no API call for now
    const fallbackMessage: ChatMessage = {
      id: `greeting_${Date.now()}`,
      content:
        "Hello! I'm here to help you with GrantFox. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    };
    setState((prev) => ({
      ...prev,
      messages: [fallbackMessage],
    }));
  }, []);

  // Send message to API
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || state.isLoading) return;

      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        content: content.trim(),
        sender: "user",
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
      }));

      // Simulate API response for now
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: `bot_${Date.now()}`,
          content: `Thanks for your message: "${content.trim()}". This is a demo response.`,
          sender: "bot",
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, botMessage],
          isLoading: false,
          unreadCount: prev.isOpen ? 0 : prev.unreadCount + 1,
          hasNewMessage: !prev.isOpen,
        }));

        // Play notification sound for bot messages
        if (!state.isOpen) {
          playNotificationSound();
        }
      }, 1000);
    },
    [state.isLoading, state.isOpen, playNotificationSound]
  );

  // Chat actions
  const startChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      isMinimized: false,
      unreadCount: 0,
      hasNewMessage: false,
    }));
  }, []);

  const closeChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      isMinimized: false,
    }));
  }, []);

  const toggleChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
      isMinimized: false,
      unreadCount: 0,
      hasNewMessage: false,
    }));
  }, []);

  const minimizeChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isMinimized: true,
    }));
  }, []);

  const maximizeChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isMinimized: false,
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      unreadCount: 0,
      hasNewMessage: false,
    }));
  }, []);

  const markMessagesAsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      unreadCount: 0,
      hasNewMessage: false,
    }));
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
      unreadCount: prev.unreadCount + 1,
      hasNewMessage: true,
    }));
  }, []);

  const handleNewMessage = useCallback(
    (message: ChatMessage) => {
      addMessage(message);
      playNotificationSound();
    },
    [addMessage, playNotificationSound]
  );

  const handleError = useCallback(
    (error: string) => {
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: error,
        sender: "bot",
        timestamp: new Date(),
      };
      addMessage(errorMessage);
      playNotificationSound();
    },
    [addMessage, playNotificationSound]
  );

  const handleChatbotAction = useCallback(
    (action: string) => {
      switch (action) {
        case "closeChat":
          closeChat();
          break;
        case "toggleChat":
          toggleChat();
          break;
        case "minimizeChat":
          minimizeChat();
          break;
        case "maximizeChat":
          maximizeChat();
          break;
        case "clearMessages":
          clearMessages();
          break;
        default:
          console.warn(`Unknown chatbot action: ${action}`);
      }
    },
    [closeChat, toggleChat, minimizeChat, maximizeChat, clearMessages]
  );

  // Load greeting when chat opens for the first time
  useEffect(() => {
    if (state.isOpen && state.messages.length === 0) {
      loadGreeting();
    }
  }, [state.isOpen, state.messages.length, loadGreeting]);

  const actions: ChatActions = {
    startChat,
    closeChat,
    toggleChat,
    minimizeChat,
    maximizeChat,
    sendMessage,
    clearMessages,
    markMessagesAsRead,
    addMessage,
    playNotificationSound,
    handleNewMessage,
    handleError,
    handleChatbotAction,
  };

  return {
    state,
    actions,
    config: finalConfig,
  };
};
