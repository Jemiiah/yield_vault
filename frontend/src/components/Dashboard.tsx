"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import dashboard_grid from "../../public/graph_main_stra.svg";
import dashboard_grid_dark from "../../public/background_grid_dark.svg";
import yao_text from "../../public/YAO.svg";
import yao_text_white from "../../public/yao_text_white.svg";
import { useTheme } from "../hooks/useTheme";
import ao_logo from "../../public/ao_logo.svg";
import stEth from "../../public/stETH 2.svg";
import dai from "../../public/DAI 1.svg";
import help_circle from "../../public/help-circle.svg";
import filter from "../../public/filter.svg";
import user_circle from "../../public/user-circle.svg";
import verified from "../../public/verified.svg";
import DashboardFooter from "./dashboard/dashboard_footer";
import { useState } from "react";

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
    token_icon: user_circle,
    verified: verified,
    protocol: "YAO",
    protocol_icon: user_circle,
    apy: "-1.75%",
    apyColor: "text-red-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
    isEkubo: false,
  },
  {
    id: "yao-ai-2",
    name: "YAO AI",
    token_icon: user_circle,
    verified: verified,
    protocol: "YAO",
    protocol_icon: user_circle,
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: [],
    points: "1x Points",
    isEkubo: false,
  },
  {
    id: "yao-ai-3",
    name: "YAO AI",
    token_icon: user_circle,
    verified: verified,
    protocol: "YAO",
    protocol_icon: user_circle,
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
    isEkubo: false,
  },
  {
    id: "yao-ai-4",
    name: "YAO AI",
    token_icon: user_circle,
    verified: verified,
    protocol: "YAO",
    protocol_icon: user_circle,
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: [],
    points: "1x Points",
    isEkubo: false,
  },
  // Ekubo strategies
  {
    id: "ekubo-1",
    name: "Ekubo xYAO/YAO",
    token_icon: user_circle,
    verified: verified,
    protocol: "YAO",
    protocol_icon: user_circle,
    apy: "—",
    apyColor: "text-gray-400",
    risk: "—",
    tvl: "—",
    badges: [],
    points: "",
    isEkubo: true,
  },
  {
    id: "ekubo-2",
    name: "Ekubo xYAO/YAO",
    token_icon: user_circle,
    verified: verified,
    protocol: "YAO",
    protocol_icon: user_circle,
    apy: "—",
    apyColor: "text-gray-400",
    risk: "—",
    tvl: "—",
    badges: [],
    points: "",
    isEkubo: true,
  },
  {
    id: "ekubo-3",
    name: "Ekubo xYAO/YAO",
    token_icon: user_circle,
    verified: verified,
    protocol: "YAO",
    protocol_icon: user_circle,
    apy: "—",
    apyColor: "text-gray-400",
    risk: "—",
    tvl: "—",
    badges: [],
    points: "",
    isEkubo: true,
  },
  {
    id: "ekubo-4",
    name: "Ekubo xYAO/YAO",
    token_icon: user_circle,
    verified: verified,
    protocol: "YAO",
    protocol_icon: user_circle,
    apy: "—",
    apyColor: "text-gray-400",
    risk: "—",
    tvl: "—",
    badges: [],
    points: "",
    isEkubo: true,
  },
];

const findYieldsStrategies = [
  {
    id: "ao-war",
    name: "AO/wAR",
    token_icon: ao_logo,
    verified: verified,
    protocol_icon: user_circle,
    protocol: "Botega",
    apy: "-1.75%",
    apyColor: "text-red-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
    isEkubo: false,
  },
  {
    id: "ao-wusdc-1",
    name: "AO/wUSDC",
    token_icon: ao_logo,
    verified: verified,
    protocol_icon: user_circle,
    protocol: "Permaswap",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: [],
    points: "1x Points",
    isEkubo: false,
  },
  {
    id: "ao-wusdc-2",
    name: "AO/wUSDC",
    token_icon: ao_logo,
    verified: verified,
    protocol_icon: user_circle,
    protocol: "Botega",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
    isEkubo: false,
  },
  {
    id: "war",
    name: "wAR",
    token_icon: ao_logo,
    verified: verified,
    protocol_icon: user_circle,
    protocol: "LiquidOps",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: [],
    points: "1x Points",
    isEkubo: false,
  },
  {
    id: "wusdc",
    name: "wUSDC",
    token_icon: ao_logo,
    verified: verified,
    protocol_icon: user_circle,
    protocol: "LiquidOps",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
    isEkubo: false,
  },
  {
    id: "wusdt",
    name: "wUSDT",
    token_icon: ao_logo,
    verified: verified,
    protocol_icon: user_circle,
    protocol: "LiquidOps",
    apy: "-1.75%",
    apyColor: "text-red-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
    isEkubo: false,
  },
  {
    id: "weth",
    name: "wETH",
    token_icon: ao_logo,
    verified: verified,
    protocol_icon: user_circle,
    protocol: "LiquidOps",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
    isEkubo: false,
  },
  {
    id: "war-ao",
    name: "wAR/AO",
    token_icon: ao_logo,
    verified: verified,
    protocol_icon: user_circle,
    protocol: "Botega",
    apy: "9.91%",
    apyColor: "text-blue-500",
    risk: "low",
    tvl: "$29,286",
    badges: ["Hot & New"],
    points: "1x Points",
    isEkubo: false,
  },
];
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("strategies");
  // const [currentPage, setCurrentPage] = useState(1);
  const theme = useTheme();
  const currentStrategies =
    activeTab === "strategies" ? strategies : findYieldsStrategies;

  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#0F1419]">
      {/* Hero Section with Grid Background */}
      <section className="relative overflow-hidden mt-5 min-h-[250px]">
        {/* Grid Background */}
        <div className="absolute inset-0 overflow-y-hidden -left-1 -top-[128px]">
          {theme.theme == "light" ? (
            <img
              src={dashboard_grid}
              alt="dashboard_grid"
              className="absolute inset-0 opacity-40 md:opacity-45 dark:md:opacity-10 "
            />
          ) : (
            <img
              src={dashboard_grid_dark}
              alt="dashboard_grid"
              className="absolute inset-0 opacity-40 md:opacity-45 dark:md:opacity-50 "
            />
          )}
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
        <div className="flex space-x-8 mb-6 border-b dark:border-[#20282E] border-[#EAEAEA]">
          <button
            onClick={() => setActiveTab("strategies")}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "strategies"
                ? "border-[#1fadd8] text-[#1A2228] dark:text-[#F5FBFF]"
                : "border-transparent text-[#7e868c] hover:text-[#a4a8ab]"
            }`}
          >
            Strategies
          </button>
          <button
            onClick={() => setActiveTab("find-yields")}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "find-yields"
                ? "border-[#1fadd8] text-[#1A2228] dark:text-[#F5FBFF]"
                : "border-transparent text-[#7e868c] hover:text-[#a4a8ab]"
            }`}
          >
            Find Yields
          </button>
        </div>

        {/* Token Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {tokenCards.map((token, index) => (
            <Card
              key={index}
              className="bg-white/80 gradient-card w-full border-none"
            >
              <CardContent className="p-5 flex flex-col items-center py-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-[#1a2228] rounded-full flex items-center justify-center">
                      <img src={token.logo} alt={token.symbol} className=" " />
                    </div>

                    <div className="text-[#1a2228] dark:text-[#FEFEFD] flex flex-col items-center font-semibold">
                      <span className="text-base">
                        {token.amount} {token.symbol}
                      </span>
                      <span className="text-[#7e868c] text-sm">
                        {token.value}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-end font-semibold">
                    <div className="text-[#1a2228] dark:text-[#FEFEFD] text-base">
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
              <Button
                variant="default"
                size="sm"
                className="bg-[#ECECEC] dark:bg-[#161E24] text-[#565E64] hover:bg-[#ececec95] dark:hover:bg-[#161e2484]"
              >
                All
              </Button>
              <Button
                variant="default"
                size="sm"
                className="border border-[#EAEAEA] dark:border-[#192127] text-[#565E64] hover:bg-[#ececec95] dark:hover:bg-[#161e2484]"
              >
                Dexi
              </Button>
              <Button
                variant="default"
                size="sm"
                className="border border-[#EAEAEA] dark:border-[#192127] text-[#565E64] hover:bg-[#ececec95] dark:hover:bg-[#161e2484]"
              >
                Botega
              </Button>
              <Button
                variant="default"
                size="sm"
                className="border border-[#EAEAEA] dark:border-[#192127] text-[#565E64] hover:bg-[#ececec95] dark:hover:bg-[#161e2484]"
              >
                Permaswap
              </Button>
              <Button
                variant="default"
                size="sm"
                className="border border-[#EAEAEA] dark:border-[#192127] text-[#565E64] hover:bg-[#ececec95] dark:hover:bg-[#161e2484]"
              >
                Liquid Ops
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className=" text-[#565E64] dark:text-[#95A0A6] hover:bg-none border border-[#EAEAEA] dark:border-[#192127]"
            >
              <img src={filter} alt="filter" />
              Filter
            </Button>
          </div>
        )}

        {/* Find Yields Table */}
        <Card className="bg-none border-none px-0">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-7 bg-[#F0F0F0] dark:bg-[#182026] rounded-tr-xl rounded-tl-xl gap-4 p-4 text-[#7e868c] text-sm font-medium">
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
                <div
                  className={`grid grid-cols-7 gap-4 p-4 mb-2 rounded-br-lg rounded-bl-lg bg-[#F3F3F3] hover:bg-[#f7f7f6] dark:hover:bg-[#20282E] dark:bg-[#141C22] transition-colors cursor-pointer relative`}
                >
                  {strategy.isEkubo && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-[#141c2298] backdrop-blur-[0.5px] opacity-90 z-10 pointer-events-none"></div>
                  )}

                  <div className="flex space-x-3 col-span-3">
                    <div className=" flex">
                      <span className="w-5 h-5 md:w-8 md:h-8 rounded-2xl bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#10181D] dark:to-[#141C22] backdrop-blur-md dark:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg">
                        <img
                          src={strategy.token_icon}
                          alt={strategy.name}
                          className=""
                        />
                      </span>
                      <span className="w-5 h-5 md:w-8 md:h-8 rounded-2xl bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#10181D] dark:to-[#121A21] backdrop-blur-md dark:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg -translate-x-2">
                        <img
                          src={strategy.token_icon}
                          alt={strategy.name}
                          className=" "
                        />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-[#1a2228] dark:text-[#FEFEFD] flex items-center space-x-2">
                        <span>{strategy.name}</span>
                        {strategy.badges.map((badge, i) => (
                          <div className="flex items-center space-x-2">
                            <span className="w-4 h-4 md:w-8 md:h-6 rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#10181D] dark:to-[#121A21] backdrop-blur-md dark:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg">
                              <img
                                src={strategy.verified}
                                alt={strategy.name}
                                className=""
                              />
                            </span>

                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#10181D] dark:to-[#121A21] backdrop-blur-md dark:text-white py-1 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg text-[#10181D] text-xs"
                            >
                              {badge}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      <div className=" flex items-center space-x-1">
                        <img
                          src={strategy.protocol_icon}
                          alt={strategy.name}
                          className="w-4 h-4"
                        />
                        <span className="text-[#808c7e] text-sm">
                          {strategy.protocol}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    {strategy.isEkubo ? (
                      <div
                        className={`p-1.5 mx-auto hover:bg-[#e9e9e9] w-4 h-4 md:w-10 md:h-10 text-center rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#20282E] dark:to-[#121A21] backdrop-blur-md font-bold dark:text-white transition-all duration-200 hover:scale-105 shadow-lg`}
                      >
                        {strategy.apy}
                      </div>
                    ) : (
                      <div className={`font-medium ${strategy.apyColor}`}>
                        {strategy.apy}
                      </div>
                    )}

                    <div className="">
                      {strategy.isEkubo ? (
                        <div></div>
                      ) : (
                        <div className="text-[#7e868c] text-sm text-center flex items-center justify-center space-x-1">
                          <span>{strategy.points}</span>

                          <span>
                            <img src={user_circle} alt={strategy.name} />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    {strategy.isEkubo ? (
                      <div className="flex justify-center space-x-2">
                        <button className="p-1.5 font-bold hover:bg-[#e9e9e9] w-4 h-4 md:w-10 md:h-10 text-center rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#20282E] dark:to-[#121a21] backdrop-blur-md dark:text-white transition-all duration-200 hover:scale-105 shadow-lg">
                          —
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="flex space-x-1.5">
                          <div className="w-1 h-7 bg-[#69C02F] rounded-sm"></div>
                          <div className="w-1 h-7 bg-[#69C02F] rounded-sm"></div>
                          <div className="w-1 h-7 bg-gray-200 rounded-sm"></div>
                          <div className="w-1 h-7 bg-gray-200 rounded-sm"></div>
                          <div className="w-1 h-7 bg-gray-200 rounded-sm"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="">
                    {strategy.isEkubo ? (
                      <div className="p-1.5 font-bold mx-auto hover:bg-[#e9e9e9] w-4 h-4 md:w-10 md:h-10 text-center rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#20282E] dark:to-[#121A21] backdrop-blur-md dark:text-white transition-all duration-200 hover:scale-105 shadow-lg">
                        {strategy.tvl}
                      </div>
                    ) : (
                      <div className="text-center font-medium text-[#565E64] ">
                        {strategy.tvl}
                      </div>
                    )}
                  </div>

                  <div className="text-center ">
                    <button className="p-1.5 hover:bg-[#e9e9e9] w-4 h-4 md:w-10 md:h-10 text-center rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#10181D] dark:to-[#121A21] backdrop-blur-md dark:text-white transition-all duration-200 hover:scale-105 shadow-lg">
                      <img src={help_circle} alt={strategy.name} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#7E868C] dark:text-[#565E64]"
            disabled
          >
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
            variant="default"
            size="sm"
            className="bg-[#EFEFEFE5] dark:bg-[#161E24] text-[#565E64] dark:text-[#95A0A6] "
          >
            1
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-[#EFEFEFE5] dark:bg-[#161E24] text-[#565E64] dark:text-[#95A0A6] "
          >
            2
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-[#EFEFEFE5] dark:bg-[#161E24] text-[#565E64] dark:text-[#95A0A6] "
          >
            3
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-[#EFEFEFE5] dark:bg-[#161E24] text-[#565E64] dark:text-[#95A0A6]"
          >
            4
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-[#EFEFEFE5] dark:bg-[#161E24] text-[#565E64] dark:text-[#95A0A6]"
          >
            5
          </Button>

          <span className="text-[#7e868c]">...</span>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#EFEFEFE5] dark:bg-[#161E24] text-[#565E64] dark:text-[#95A0A6]"
          >
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

      <DashboardFooter />
    </div>
  );
}
