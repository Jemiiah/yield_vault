import React from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import SetsUsApart from "@/components/SetsUsApart";
import logo from "/yao_logo.svg";

function App() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] relative overflow-hidden">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* WTF IS YAO Section */}
      <section className="relative z-10 md:mx-12 mx-4 px-4 md:px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-24 gap-8 md:gap-12 items-center">
          {/* Left side - Large WTF IS YAO text */}
          <div className="lg:col-span-5">
            <div
              className="text-4xl md:text-6xl font-bold text-[#1a2228] leading-tight"
              style={{
                textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div className="w-full justify-center flex md:flex-col items-center md:items-start md:w-[200px] font-black leading-tight md:leading-24 text-[48px] md:text-[88px] text-[#1A2228]">
                <p>WTF</p>
                <p className="ml-4 mr-4 md:ml-10">IS</p>
                <p>YAO!</p>
              </div>
            </div>
          </div>

          {/* Middle - Descriptive text */}
          <div className="lg:col-span-10 space-y-4 text-center md:text-left md:space-y-6">
            <p className="text-[#565E64] text-sm md:text-base leading-relaxed">
              YAO is a decentralized yield aggregator built to simplify earning
              in DeFi. We help users unlock the full potential of their crypto
              by routing funds through the most profitable, automated strategies
              across multiple protocols and chains.
            </p>
            <p className="text-[#565E64] text-sm md:text-base pt-2 leading-relaxed">
              Our mission is to make yield farming effortless, secure, and
              accessible to everyone — from DeFi degens to curious newcomers.
              With a focus on optimization, transparency, and user-first design,
              YAO is your trusted partner for growing wealth in Web3.
            </p>
          </div>

          {/* Right side - Stylized logo */}
          <div className="lg:col-span-9 flex justify-end transform translate-x-0 md:translate-x-40">
            <div className="w-full h-[150px] md:w-[676px] md:h-[400px] text-sm md:text-base rounded-lg bg-gradient-to-br from-[#F8F7F4] to-[#E6E6E6] flex flex-col md:items-start items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer p-4 md:px-8 md:py-12">
              <img
                src={logo}
                alt="YAO"
                className="w-[100px] h-[100px] md:w-[300px] md:h-[300px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative z-10 md:mx-12 mx-4 px-4 md:px-6 py-12 md:py-16 mb-12 md:mb-20">
        <h2 className="text-[#1A2228] font-bold text-xl md:text-2xl text-center mb-8 md:mb-10">
          How it Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="text-sm md:text-base rounded-lg bg-gradient-to-br from-[#FFFFFF] to-[#EAEAEA] flex flex-col items-start justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer p-4 md:p-6">
            <div className="text-2xl md:text-3xl bg-[#E6E6E6EB] rounded-lg w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold text-[#7E868C] mb-3 md:mb-4">
              1
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-[#1A2228] mb-3 md:mb-4">
              Connect Your Wallet
            </h3>
            <p className="text-[#565E64] text-sm md:text-base">
              Securely link your wallet in seconds—no sign-up needed.
            </p>
          </div>

          <div className="text-sm md:text-base rounded-lg bg-gradient-to-br from-[#FFFFFF] to-[#EAEAEA] flex flex-col items-start justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer p-4 md:p-6">
            <div className="text-2xl md:text-3xl bg-[#E6E6E6EB] rounded-lg w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold text-[#7E868C] mb-3 md:mb-4">
              2
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-[#1A2228] mb-3 md:mb-4">
              Choose a Vault or Pool
            </h3>
            <p className="text-[#565E64] text-sm md:text-base">
              Pick from a list of high-yield strategies across top DeFi
              protocols.
            </p>
          </div>

          <div className="text-sm md:text-base rounded-lg bg-gradient-to-br from-[#FFFFFF] to-[#EAEAEA] flex flex-col items-start justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer p-4 md:p-6">
            <div className="text-2xl md:text-3xl bg-[#E6E6E6EB] rounded-lg w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold text-[#7E868C] mb-3 md:mb-4">
              3
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-[#1A2228] mb-3 md:mb-4">
              Sit Back & Watch It Grow Works
            </h3>
            <p className="text-[#565E64] text-sm md:text-base">
              Your funds auto-compound and optimize in real-time. You earn, we
              handle the rest.
            </p>
          </div>
        </div>
        <div className="flex justify-center mt-8 md:mt-12">
          <button className="h-10 md:h-12 w-full md:w-52 text-sm md:text-base rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] text-[#F8F7F4] flex items-center font-semibold justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer">
            Launch Dapp
          </button>
        </div>
      </section>

      {/* What Sets Us Apart Section */}
      <SetsUsApart />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
