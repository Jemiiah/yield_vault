"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import dashboard_grid from "../../public/graph_main_stra.svg";
import yao_text from "../../public/YAO.svg";
import yao_text_white from "../../public/yao_text_white.svg";
import { useTheme } from "../hooks/useTheme";
import ao_logo from "../../public/ao_logo.svg";
import stEth from "../../public/stETH 2.svg";
import dai from "../../public/DAI 1.svg";
import help_circle from "../../public/help-circle.svg";
import robot from "../../public/Robot.svg";
import tokens from "../../public/token1.svg";
import user_circle from "../../public/user-circle.svg";
import verified from "../../public/verified.svg";

const tokenCards = [
  {
    symbol: "AR",
    logo: ao_logo,
    amount: "1",
    value: "$4.7",
    apy: "4.56%",
    protocol: "AO airdrop",
    aoAmount: "0.016",
    aoValue: "$0.214",
  },
  {
    symbol: "ETH",
    logo: stEth,
    amount: "1",
    value: "$3,700",
    apy: "4.56%",
    protocol: "AO pre-bridge",
    aoAmount: "0.016",
    aoValue: "$0.214",
  },
  {
    symbol: "DAI",
    logo: dai,
    amount: "1",
    value: "$1.00",
    apy: "4.56%",
    protocol: "AO pre-bridge",
    aoAmount: "0.016",
    aoValue: "$0.214",
  },
  {
    symbol: "USDS",
    logo: dai,
    amount: "1",
    value: "$1.00",
    apy: "4.56%",
    protocol: "AO pre-bridge",
    aoAmount: "0.016",
    aoValue: "$0.214",
  },
];

const strategies = [
  {
    id: "yao-ai-1",
    name: "YAO AI",
    token_icon: tokens,
    protocol: "YAO",
    apy: "-1.75%",
    apyColor: "text-red-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
  },
  {
    id: "yao-ai-2",
    name: "YAO AI",
    token_icon: tokens,
    protocol: "YAO",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: [],
    points: "1x Points",
  },
  {
    id: "yao-ai-3",
    name: "YAO AI",
    token_icon: tokens,
    protocol: "YAO",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
  },
  {
    id: "yao-ai-4",
    name: "YAO AI",
    token_icon: tokens,
    protocol: "YAO",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: [],
    points: "1x Points",
  },
];

const findYieldsStrategies = [
  {
    id: "ao-war",
    name: "AO/wAR",
    protocol: "Botega",
    apy: "-1.75%",
    apyColor: "text-red-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
  },
  {
    id: "ao-wusdc-1",
    name: "AO/wUSDC",
    protocol: "Permaswap",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: [],
    points: "1x Points",
  },
  {
    id: "ao-wusdc-2",
    name: "AO/wUSDC",
    protocol: "Botega",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
  },
  {
    id: "war",
    name: "wAR",
    protocol: "LiquidOps",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: [],
    points: "1x Points",
  },
  {
    id: "wusdc",
    name: "wUSDC",
    protocol: "LiquidOps",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
  },
  {
    id: "wusdt",
    name: "wUSDT",
    protocol: "LiquidOps",
    apy: "-1.75%",
    apyColor: "text-red-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
  },
  {
    id: "weth",
    name: "wETH",
    protocol: "LiquidOps",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
  },
  {
    id: "war-ao",
    name: "wAR/AO",
    protocol: "Botega",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("strategies");
  const [currentPage, setCurrentPage] = useState(1);
  const theme = useTheme();
  const currentStrategies =
    activeTab === "strategies" ? strategies : findYieldsStrategies;

  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#0F1419]">
      {/* Hero Section with Grid Background */}
      <section className="relative overflow-hidden mt-5 min-h-[250px]">
        {/* Grid Background */}
        <div className="absolute inset-0 overflow-y-hidden -left-1 -top-[128px]">
          <img
            src={dashboard_grid}
            alt="dashboard_grid"
            className="absolute inset-0 opacity-40 md:opacity-45 dark:md:opacity-10 "
          />
        </div>

        <div className="relative z-10 md:mx-12 mx-4 px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-0 items-">
            {/* Left Side - Logo and Tagline */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {/* YAO Logo */}
                <img
                  src={theme.theme === "light" ? yao_text : yao_text_white}
                  alt="yao_text"
                  className="w-[127px] h-[48px] mt-1"
                />

                {/* Tagline */}
                <div className="text-[#95A0A6] text-sm leading-relaxed">
                  Auto-Compound. Auto-Earn. No Stress
                </div>
              </div>
            </div>

            {/* Right Side - Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Value Locked Card */}
              <div className="rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#10181D] dark:to-[#121A21] dark:text-[#EAEAEA] backdrop-blur-md text-[#1A2228] dark:backdrop-blur-lg flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg p-4 min-h-[120px]">
                <p className="text-[#565E64] dark:text-[#95A0A6] text-xs mb-2 text-center font-medium">
                  Total Value Locked (TVL)
                </p>
                <p className="text-[#1A2228] dark:text-[#EAEAEA] text-2xl md:text-3xl font-bold">
                  $77.40k+
                </p>
              </div>

              {/* Your Holdings / Total Rewards Card */}
              <div className="rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#10181D] dark:to-[#121A21] dark:text-[#EAEAEA] backdrop-blur-md text-[#1A2228] dark:backdrop-blur-lg flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg p-4 min-h-[120px]">
                <p className="text-[#565E64] dark:text-[#95A0A6] text-xs mb-2 text-center font-medium">
                  Your Holdings
                </p>
                <p className="text-[#1A2228] dark:text-[#EAEAEA] text-2xl md:text-3xl font-bold">
                  $0
                </p>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#10181D] dark:to-[#121A21] dark:text-[#EAEAEA] backdrop-blur-md text-[#1A2228] dark:backdrop-blur-lg flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg p-4 min-h-[120px]">
                <p className="text-[#565E64] dark:text-[#95A0A6] text-xs mb-2 text-center font-medium">
                  Your Referral Link (i)
                </p>
                <p className="text-[#1A2228] dark:text-[#EAEAEA]  text-2xl md:text-3xl font-bold">
                  –
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="md:mx-12 mx-4 px-4 md:px-6 pb-8">
        <div className="flex space-x-8 mb-6 border-b border-[#e6e6e6]">
          <button
            onClick={() => setActiveTab("strategies")}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "strategies"
                ? "border-[#1fadd8] text-[#1a2228]"
                : "border-transparent text-[#7e868c] hover:text-[#1a2228]"
            }`}
          >
            Strategies
          </button>
          <button
            onClick={() => setActiveTab("find-yields")}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "find-yields"
                ? "border-[#1fadd8] text-[#1a2228]"
                : "border-transparent text-[#7e868c] hover:text-[#1a2228]"
            }`}
          >
            Find Yields
          </button>
        </div>

        {/* Token Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {tokenCards.map((token, index) => (
            <Card key={index} className="bg-white/80 w-full border-none">
              <CardContent className="p-5 flex flex-col items-center py-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-[#1a2228] rounded-full flex items-center justify-center">
                      <img src={token.logo} alt={token.symbol} className=" " />
                    </div>

                    <div className="text-[#1a2228] flex flex-col items-center font-semibold">
                      <span className="text-base">
                        {token.amount} {token.symbol}
                      </span>
                      <span className="text-[#7e868c] text-sm">
                        {token.value}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-end font-semibold">
                    <div className="text-[#1a2228] text-base">
                      {token.aoAmount} APY
                    </div>
                    <div className="text-[#7e868c] text-sm">
                      {token.aoValue}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full mt-4">
                  <div className="text-[#7e868c] text-xs font-semibold">
                    {token.protocol}
                  </div>
                  <div className="text-[#7e868c] text-xs font-semibold">
                    <span className="text-[#5CAB28]">{token.apy}</span> APY
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Tabs for Find Yields */}
        {activeTab === "find-yields" && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" className="bg-white">
                All
              </Button>
              <Button variant="ghost" size="sm">
                Dexi
              </Button>
              <Button variant="ghost" size="sm">
                Botega
              </Button>
              <Button variant="ghost" size="sm">
                Permaswap
              </Button>
              <Button variant="ghost" size="sm">
                Liquid Ops
              </Button>
            </div>
            <Button variant="outline" size="sm" className="bg-white">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                />
              </svg>
              Filter
            </Button>
          </div>
        )}

        {/* Strategy Table */}
        <Card className="bg-white border-none">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 p-4 pt-0 pb-4 border-b border-[#e6e6e6] text-[#7e868c] text-sm font-medium">
              <div className="col-span-3">STRATEGY NAME</div>
              {/* <div className="text-center"></div> */}
              <div className="text-center">APY</div>
              <div className="text-center">RISK</div>
              <div className="text-center">TVL</div>
              <div className="text-center">INFO</div>
            </div>

            {/* Strategy Rows */}
            {currentStrategies.map((strategy, index) => (
              <Link key={index} to={`/strategy/${strategy.id}`}>
                <div className="grid grid-cols-7 gap-4 p-4 border-b border-[#e6e6e6] hover:bg-[#f8f7f4] transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3 col-span-3">
                    <div className=" flex items-center justify-center">
                      <img
                        src={strategy.token_icon}
                        alt={strategy.name}
                        className=""
                      />
                    </div>
                    <div className="">
                      <div className="font-medium text-[#1a2228] flex items-center space-x-2">
                        <span>{strategy.name}</span>
                        {strategy.badges.map((badge, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-green-100 text-green-800 text-xs"
                          >
                            {badge}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-[#7e868c] text-sm">
                        {strategy.protocol}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${strategy.apyColor}`}>
                      {strategy.apy}
                    </div>
                    <div className="text-[#7e868c] text-sm">
                      {strategy.points}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-6 bg-green-400 rounded-sm"></div>
                        <div className="w-1.5 h-6 bg-green-400 rounded-sm"></div>
                        <div className="w-1.5 h-6 bg-gray-200 rounded-sm"></div>
                        <div className="w-1.5 h-6 bg-gray-200 rounded-sm"></div>
                        <div className="w-1.5 h-6 bg-gray-200 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center font-medium text-[#1a2228]">
                    {strategy.tvl}
                  </div>

                  <div className="text-center">
                    <button className="p-1 rounded-full hover:bg-[#e9e9e9]">
                      <svg
                        className="w-4 h-4 text-[#7e868c]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          <Button variant="ghost" size="sm" disabled>
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#1a2228] text-white"
          >
            1
          </Button>
          <Button variant="ghost" size="sm">
            2
          </Button>
          <Button variant="ghost" size="sm">
            3
          </Button>
          <Button variant="ghost" size="sm">
            4
          </Button>
          <Button variant="ghost" size="sm">
            5
          </Button>
          <span className="text-[#7e868c]">...</span>
          <Button variant="ghost" size="sm">
            Next
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* YOA Bot */}
      <div className="fixed bottom-6 right-6">
        <Card className="bg-white border-none shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-[#1a2228] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <span className="text-[#1a2228] text-sm font-medium">
                YOA Bot
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
