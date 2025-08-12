"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "../../public/yao_logo.svg";
// import DownArrow from "../../public/down_arrow.svg";
import { ChevronDown, MoonIcon, TwitterIcon } from "lucide-react";
import ai_icon from "../../public/ai-search.svg";
import coin_icon from "../../public/coins-dollar.svg";
import multichain_icon from "../../public/multichain.svg";
import reload_icon from "../../public/reload.svg";
import security_icon from "../../public/security-check.svg";

import grid_bg from "../../public/grid.svg";
import Yao_text from "../../public/YAO.svg";
import twitter_icon from "../../public/new-twitter.svg";
import telegram_icon from "../../public/telegram.svg";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./components/Hero";

export default function YAOLandingPage() {
  const pathname = usePathname();

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
              <Image
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
          <button className="h-10 md:h-12 w-full md:w-52 text-sm md:text-base rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] text-[#F8F7F4] flex items-center font-semibold justify-center transition-all duration-200 hover:scale-103 shadow-lg cursor-pointer">
            Launch Dapp
          </button>
        </div>
      </section>

      {/* What Sets Us Apart Section */}
      <section className="relative overflow-hidden md:mx-12 mx-4 min-h-[70vh] md:min-h-[90vh]">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-40">
          <div
            className="absolute inset-0 animate-float-grid"
            style={{
              backgroundImage: `
              linear-gradient(#d9d9d9 1px, transparent 1px),
              linear-gradient(90deg, #d9d9d9 1px, transparent 1px)
            `,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <h2 className="text-[24px] md:text-[32px] relative z-10 px-4 md:px-6 font-bold text-[#1a2228] mb-6 md:mb-8 text-left">
          What Sets Us Apart
        </h2>
        <div className="relative z-10 max-w-3xl px-4 md:px-6">
          <div className="space-y-6 md:space-y-12">
            {[
              {
                icon: reload_icon,
                title: "Auto-Compounding",
                description:
                  "Your yields, on autopilot. YAO reinvests your earnings continuously to maximize returns without you lifting a finger.",
                offset: "translate-x-0",
              },
              {
                icon: ai_icon,
                title: "Strategy Optimization",
                description:
                  "We scan and route your funds through the most profitable DeFi strategies across protocols so you always earn more, faster.",
                offset: "translate-x-0 md:translate-x-36",
              },
              {
                icon: security_icon,
                title: "Security Audits",
                description:
                  "YAO is built with safety in mind. Our smart contracts are rigorously audited by top firms and constantly monitored to ensure protocol integrity.",
                offset: "translate-x-0 md:translate-x-60",
              },
              {
                icon: coin_icon,
                title: "Lowest Fees",
                description:
                  "Keep more of what you earn. With efficient contract architecture and minimal gas overhead, YAO offers one of the lowest fee structures in DeFi.",
                offset: "translate-x-0 md:translate-x-84",
              },
              {
                icon: multichain_icon,
                title: "Multichain Support",
                description:
                  "Yield without borders. Whether you're on Ethereum, Arbitrum, or Polygon, YAO brings you optimized returns across multiple chains.",
                offset: "translate-x-0 md:translate-x-108",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className={` bg-transparent border-none shadow-none max-wg transform transition-transform duration-300 hover:scale-105 ${feature.offset} p-0`}
                >
                  <CardContent className=" bg-none flex flex-col md:flex-row items-start space-y-4 md:space-x-4 p-0">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-[#EBEBEBE5] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Image
                        src={Icon}
                        alt={feature.title}
                        className="w-4 h-4 md:w-6 md:h-6 text-[#565e64]"
                      />
                    </div>
                    <div className="flex-1 bg-[#F6F5F2] rounded-lg p-3 md:p-4">
                      <h3 className="text-lg md:text-xl font-semibold text-[#1A2228] mb-2 md:mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-[#565e64] text-sm md:text-lg leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        {/* Get Started Button */}
        <div className="relative z-10 px-4 md:px-6 text-center flex justify-end mt-6 md:mt-8">
          <Button className="h-10 md:h-12 w-full md:w-68 text-sm md:text-base rounded-lg bg-gradient-to-br from-[#4C545A] to-[#060E14] text-[#F8F7F4] flex items-center font-semibold justify-center transition-all duration-200 hover:scale-103 shadow-lg cursor-pointer">
            Get Started!
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes float-grid {
              0%, 100% {
                transform: translateY(0px) translateX(0px) scale(1);
              }
              25% {
                transform: translateY(-8px) translateX(4px) scale(1.02);
              }
              50% {
                transform: translateY(-4px) translateX(-2px) scale(1.01);
              }
              75% {
                transform: translateY(-6px) translateX(3px) scale(1.015);
              }
            }
            
            .animate-float-grid {
              animation: float-grid 8s ease-in-out infinite;
            }
          `,
        }}
      />
    </div>
  );
}
