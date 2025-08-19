export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  unreadCount: number;
  hasNewMessage: boolean;
  streamedMessage?: ChatMessage;
}

export interface ChatActions {
  startChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  markMessagesAsRead: () => void;
  addMessage: (message: ChatMessage) => void;
  playNotificationSound: () => void;
  handleNewMessage: (message: ChatMessage) => void;
  handleError: (error: string) => void;
  handleChatbotAction: (action: string) => void;
}

export interface ChatbotConfig {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme?: "light" | "dark" | "auto";
  showNotificationBadge?: boolean;
  enableSound?: boolean;
  autoOpen?: boolean;
  maxHeight?: string;
  minWidth?: string;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  isLastMessage: boolean;
  onAnimationComplete?: () => void;
}

export interface TypingIndicatorProps {
  isVisible: boolean;
  className?: string;
}

export interface ChatWindowProps {
  isOpen: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onClearMessages: () => void;
  className?: string;
}

export interface ChatbotFloatProps {
  isOpen: boolean;
  unreadCount: number;
  hasNewMessage: boolean;
  onClick: () => void;
  className?: string;
}
