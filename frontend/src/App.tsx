import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import SetsUsApart from "@/components/SetsUsApart";
import WtfIsYaoSection from "@/components/WtfIsYaoSection";
import { ThemeProvider } from "@/contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#0F1419] relative overflow-hidden transition-colors duration-300">
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <Hero />

        {/* WTF IS YAO Section */}
        <WtfIsYaoSection />

        {/* How it Works Section */}
        <section className="relative z-10 md:mx-12 mx-4 px-4 md:px-6 py-12 md:py-16 mb-12 md:mb-20">
          <h2 className="text-[#1A2228] dark:text-white font-bold text-xl md:text-2xl text-center mb-8 md:mb-10">
            How it Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-sm md:text-base rounded-lg bg-gradient-to-br from-[#FFFFFF] to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] dark:text-[#1A2228] backdrop-blur-md dark:backdrop-blur-lg flex flex-col items-start justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer p-4 md:p-6">
              <div className="text-2xl md:text-3xl bg-[#E6E6E6EB] dark:bg-[#161E24] rounded-lg w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold text-[#7E868C] dark:text-gray-300 mb-3 md:mb-4">
                1
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-[#1A2228] dark:text-white mb-3 md:mb-4">
                Connect Your Wallet
              </h3>
              <p className="text-[#565E64] dark:text-gray-300 text-sm md:text-base">
                Securely link your wallet in seconds—no sign-up needed.
              </p>
            </div>

            <div className="text-sm md:text-base rounded-lg bg-gradient-to-br from-[#FFFFFF] to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] dark:text-[#1A2228] backdrop-blur-md dark:backdrop-blur-lg flex flex-col items-start justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer p-4 md:p-6">
              <div className="text-2xl md:text-3xl bg-[#E6E6E6EB] dark:bg-[#161E24] rounded-lg w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold text-[#7E868C] dark:text-gray-300 mb-3 md:mb-4">
                2
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-[#1A2228] dark:text-white mb-3 md:mb-4">
                Choose a Vault or Pool
              </h3>
              <p className="text-[#565E64] dark:text-gray-300 text-sm md:text-base">
                Pick from a list of high-yield strategies across top DeFi
                protocols.
              </p>
            </div>

            <div className="text-sm md:text-base rounded-lg bg-gradient-to-br from-[#FFFFFF] to-[#EAEAEA] dark:from-[#10181D] dark:to-[#121A21] dark:text-[#1A2228] backdrop-blur-md dark:backdrop-blur-lg flex flex-col items-start justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer p-4 md:p-6">
              <div className="text-2xl md:text-3xl bg-[#E6E6E6EB] dark:bg-[#161E24] rounded-lg w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold text-[#7E868C] dark:text-gray-300 mb-3 md:mb-4">
                3
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-[#1A2228] dark:text-white mb-3 md:mb-4">
                Sit Back & Watch It Grow Works
              </h3>
              <p className="text-[#565E64] dark:text-gray-300 text-sm md:text-base">
                Your funds auto-compound and optimize in real-time. You earn, we
                handle the rest.
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-8 md:mt-12">
            <button className="h-10 md:h-12 w-full md:w-52 text-sm md:text-base rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] dark:bg-gradient-to-br dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] dark:text-[#1A2228] backdrop-blur-md text-[#F8F7F4] flex items-center font-semibold justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer">
              Launch Dapp
            </button>
          </div>
        </section>

        {/* What Sets Us Apart Section */}
        <SetsUsApart />

        {/* Footer */}
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
