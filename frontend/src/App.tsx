import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/components/Dashboard";
import HomePage from "@/components/landing/HomePage";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#0F1419] relative overflow-hidden transition-colors duration-300">
          {/* Static Header */}
          <Header />

          {/* Main Content */}
          <main className="pt-20 md:pt-24">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>

          {/* Static Footer */}
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
