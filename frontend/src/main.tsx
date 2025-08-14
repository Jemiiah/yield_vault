import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WalletProvider } from "./components/WalletProvider.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </ThemeProvider>
  </StrictMode>
);
