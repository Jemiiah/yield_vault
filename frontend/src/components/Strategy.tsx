"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link, useParams } from "react-router-dom";

export default function StrategyDetail() {
  const { id } = useParams<{ id: string }>();

  // Use the id to fetch or identify the specific strategy
  //   const strategyId = id || "default";
  const [activeTab, setActiveTab] = useState("manage");
  const [depositAmount, setDepositAmount] = useState("");

  // Mock strategy data - in real app this would come from API/blockchain
  const strategy = {
    name: "AO/wAR",
    apy: "31.22%",
    status: "active",
    nextHarvest: {
      days: 3,
      hours: 4,
      minutes: 33,
      seconds: 44,
    },
    totalRewards: "26,684.16 AO",
    harvestCount: 17,
    walletBalance: "3,450.609",
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-[#1a2228]">
            A
          </Link>
          <nav className="flex space-x-6">
            <Link
              to="/"
              className="text-[#565e64] hover:text-[#1a2228] text-sm"
            >
              Home
            </Link>
            <Link
              to="#"
              className="text-[#565e64] hover:text-[#1a2228] text-sm"
            >
              Docs
            </Link>
            <Link
              to="#"
              className="text-[#565e64] hover:text-[#1a2228] text-sm"
            >
              FAQs
            </Link>
            <Link
              to="#"
              className="text-[#565e64] hover:text-[#1a2228] text-sm"
            >
              Bridge
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-[#e9e9e9]">
            <svg
              className="w-5 h-5 text-[#565e64]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>
          <div className="text-[#565e64] text-sm">
            $ {strategy.walletBalance}
          </div>
          <div className="flex items-center space-x-2 text-[#565e64] text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>0x3F...482B</span>
          </div>
          <button className="p-2">
            <svg
              className="w-5 h-5 text-[#565e64]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 text-[#7e868c] hover:text-[#1a2228] mb-6"
        >
          <svg
            className="w-4 h-4"
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
          <span className="text-sm">GO BACK</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Strategy Header */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#1a2228] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <div className="w-8 h-8 bg-[#fd3235] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">W</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a2228] flex items-center space-x-2">
                  <span>{strategy.name}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </h1>
                <Badge className="bg-green-100 text-green-800 mt-1">
                  APY {strategy.apy}
                </Badge>
              </div>
            </div>

            {/* Next Harvest */}
            <Card className="bg-white border-none">
              <CardContent className="p-6">
                <h3 className="text-[#7e868c] text-sm mb-4">
                  Next Harvest Is In:
                </h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#1a2228]">
                      {strategy.nextHarvest.days}
                    </div>
                    <div className="text-[#7e868c] text-sm">Days</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#1a2228]">
                      {strategy.nextHarvest.hours}
                    </div>
                    <div className="text-[#7e868c] text-sm">Hours</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#1a2228]">
                      {strategy.nextHarvest.minutes}
                    </div>
                    <div className="text-[#7e868c] text-sm">Min</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#1a2228]">
                      {strategy.nextHarvest.seconds}
                    </div>
                    <div className="text-[#7e868c] text-sm">Sec</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Info */}
            <Card className="bg-[#e6f3ff] border-none">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="text-[#1fadd8] text-sm">
                    Total rewards harvested: {strategy.totalRewards}
                  </div>
                  <div className="text-[#1fadd8] text-sm">
                    Total number of times harvested: {strategy.harvestCount}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Deposit/Withdraw */}
          <div className="space-y-6">
            <div className="flex space-x-4">
              <Button className="flex-1 bg-[#1fadd8] hover:bg-[#1fadd8]/90 text-white">
                Deposit
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Withdraw
              </Button>
            </div>

            <Card className="bg-white border-none">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-[#1a2228] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <span className="font-medium">AO</span>
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
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-[#7e868c] text-sm">
                        Wallet Balance
                      </div>
                      <div className="font-medium">
                        $ {strategy.walletBalance}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="$ 0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="text-right text-2xl h-16 border-none bg-[#f8f7f4] focus:ring-0"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#1fadd8]"
                      >
                        Max
                      </Button>
                    </div>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7e868c] text-sm">
                      ≈ 0.00 AR
                    </div>
                  </div>

                  <Button
                    className="w-full bg-[#7e868c] hover:bg-[#565e64] text-white h-12"
                    disabled
                  >
                    Deposit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <div className="flex space-x-8 mb-6 border-b border-[#e6e6e6]">
            {["Manage", "Details", "Risks", "FAQs", "Transactions"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? "border-[#1a2228] text-[#1a2228]"
                      : "border-transparent text-[#7e868c] hover:text-[#1a2228]"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-[#1a2228] mb-4">
                How it works
              </h3>
              <p className="text-[#565e64] leading-relaxed mb-6">
                Deploy your AR into your AO/wAR pool, automatically rebalancing
                positions around the current price to optimize yield and reduce
                the need for manual adjustments. Trading fees and DeFi Spring
                rewards are automatically compounded back into the strategy. In
                return, you receive an ERC-20 token representing your share of
                the strategy.
              </p>

              <div>
                <h4 className="font-semibold text-[#1a2228] mb-3">
                  Key points to note:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-[#565e64]">
                  <li>
                    During withdrawal, you may receive either or both tokens
                    depending on market conditions and prevailing prices.
                  </li>
                  <li>
                    Sometimes you might see a negative APY - this is usually a
                    big deal. It happens when
                  </li>
                </ol>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-[#565e64] text-sm">Risk:</span>
                <span className="text-[#565e64] text-sm">Very Low</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-[#565e64] text-sm">Audited</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-[#565e64]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-[#565e64] text-sm">Docs</span>
              </div>
            </div>
          </div>
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

      {/* Footer */}
      <footer className="mt-16 border-t border-[#e6e6e6] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-[#1a2228]">A</div>
              <p className="text-[#7e868c] text-sm">
                © 2025 YAO. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-[#7e868c] hover:text-[#1a2228] text-sm"
              >
                Terms & Conditions
              </a>
              <a
                href="#"
                className="text-[#7e868c] hover:text-[#1a2228] text-sm"
              >
                Privacy Policy
              </a>
              <div className="flex space-x-3">
                <a href="#" className="text-[#7e868c] hover:text-[#1a2228]">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="text-[#7e868c] hover:text-[#1a2228]">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
                  </svg>
                </a>
                <a href="#" className="text-[#7e868c] hover:text-[#1a2228]">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
