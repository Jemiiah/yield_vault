import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WalletProvider } from "./components/WalletProvider.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import { ChatbotProvider } from "./contexts/ChatbotContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a React Query client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <ChatbotProvider config={{ position: "bottom-right", theme: "auto" }}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </ChatbotProvider>
      </WalletProvider>
    </ThemeProvider>
  </StrictMode>
);
