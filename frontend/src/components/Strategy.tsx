"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
// import { useParams } from "react-router-dom";
import verified from "../../public/verified.svg";
import ao_token from "../../public/ao_logo.svg";
import back_btn from "../../public/back.svg";
import DashboardFooter from "./dashboard/dashboard_footer";
import {
  createDataItemSigner,
  message,
  result
} from "@permaweb/aoconnect";

import {VAULT, AO_TOKEN} from "../constants/yao_process";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function StrategyDetail() {
  const queryClient = useQueryClient();
  //   const { id } = useParams<{ id: string }>();

  // Use the id to fetch or identify the specific strategy
  //   const strategyId = id || "default";
  const [activeTab, setActiveTab] = useState("manage");
  const [depositWithdrawTab, setDepositWithdrawTab] = useState("deposit");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

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

  // integrate deposit and withdraw logic

  const deposit = useMutation({
		mutationKey: ["Transfer"],
		mutationFn: async () => {
			const messageId = await message({
				process: AO_TOKEN,
				tags: [
					{
						name: "Action",
						value: "Transfer",
					},
					{
						name: "Recipient",
						value: VAULT,
					},
					{
						name: "Quantity",
						value: depositAmount,
					}
				],
				data: "",
				signer: createDataItemSigner(window.arweaveWallet),
			});

			const messageResult = await result({
				process: AO_TOKEN,
				message: messageId,
			});

			if (messageResult.Messages[0].Data) {
				return JSON.parse(messageResult.Messages[0].Data);
			}

			return undefined;
		},
		onSuccess: () => {
			queryClient.invalidateQueries();
		},
	});


  const withdraw = useMutation({
		mutationKey: ["Withdraw"],
		mutationFn: async () => {
			const messageId = await message({
				process: VAULT,
				tags: [
					{
						name: "Action",
						value: "Withdraw",
					},
					{
						name: "Token-Id",
						value: AO_TOKEN,
					},
					{
						name: "Quantity",
						value: withdrawAmount,
					}
				],
				data: "",
				signer: createDataItemSigner(window.arweaveWallet),
			});

			const messageResult = await result({
				process: VAULT,
				message: messageId,
			});

			console.log(messageResult)
			if (messageResult.Messages[0].Data) {
				console.log(messageResult.Messages[0].Data)
				return JSON.parse(messageResult.Messages[0].Data);
			}

			return undefined;
		},
		onSuccess: () => {
			queryClient.invalidateQueries();
		},
	});


  // end integrate deposit and withdraw logic  

  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#0F1419]">
      <div className="md:mx-12 mx-4 px-4 py-8">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 text-[#7e868c] hover:text-[#1a2228] mb-6"
        >
          <img src={back_btn} alt="back btn" />
          <span className="text-sm">GO BACK</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Strategy Header */}
            <div>
              <div className="flex items-center ">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-[#1a2228] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div className="w-10 h-10 -translate-x-4 bg-[#fd3235] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">W</span>
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-[#565E64] flex items-center space-x-4">
                    <span>{strategy.name}</span>
                    <span className="gradient-card p-1 w-4 h-4 md:w-6 rounded-md md:h-6 flex items-center justify-center">
                      <img src={verified} alt="verified" className="" />
                    </span>
                  </h1>
                </div>
              </div>
              <Badge className="bg-green-100 dark:bg-[#092106] space-x-2.5 text-[#20A20F] dark:text-[#4ED93B] mt-3 py-2 px-2 border-[#9AEE8F] dark:border-[#123A0D]">
                <span>APY</span>
                <span>{strategy.apy}</span>
              </Badge>
            </div>

            {/* Next Harvest */}
            <div className="bg-none border-none">
              <h3 className="text-[#565E64] dark:text-[#EAEAEA] text-xl mb-4">
                Next Harvest Is In:
              </h3>
              <div className="py-1">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="gradient-card rounded-md p-4">
                    <div className="text-2xl font-bold text-[#1a2228] dark:text-[#F5FBFF]">
                      {strategy.nextHarvest.days}
                    </div>
                    <div className="text-[#7e868c] text-sm">Days</div>
                  </div>

                  <div className="gradient-card rounded-md p-4">
                    <div className="text-2xl font-bold text-[#1a2228] dark:text-[#F5FBFF]">
                      {strategy.nextHarvest.hours}
                    </div>
                    <div className="text-[#7e868c] text-sm">Hours</div>
                  </div>

                  <div className="gradient-card rounded-md p-4">
                    <div className="text-2xl font-bold text-[#1a2228] dark:text-[#F5FBFF]">
                      {strategy.nextHarvest.minutes}
                    </div>
                    <div className="text-[#7e868c] text-sm">Min</div>
                  </div>

                  <div className="gradient-card rounded-md p-4">
                    <div className="text-2xl font-bold text-[#1a2228] dark:text-[#F5FBFF]">
                      {strategy.nextHarvest.seconds}
                    </div>
                    <div className="text-[#7e868c] text-sm">Sec</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards Info */}
            <Card className="bg-[#EDF6F9] border border-[#D6EEF6] dark:bg-[#161E24] dark:border-[#192127]">
              <CardContent className="px-6 py-0">
                <div className="space-y-2">
                  <div className="text-[#25A8CF] text-sm">
                    Total rewards harvested:{" "}
                    <span className="font-semibold">
                      {strategy.totalRewards}
                    </span>
                  </div>
                  <div className="text-[#25A8CF] text-sm">
                    Total number of times harvested:{" "}
                    <span className="font-semibold">
                      {strategy.harvestCount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Deposit/Withdraw */}
          <div className="space-y-3">
            <div className="flex space-x-4">
              <Button
                onClick={() => setDepositWithdrawTab("deposit")}
                className={`flex-1 py-7 rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-sm ${
                  depositWithdrawTab === "deposit"
                    ? "bg-[#D6EEF6] dark:bg-[#052834] dark:text-[#30CFFF] hover:bg-[#D6EEF6]/60 text-[#25A8CF]"
                    : "bg-transparent text-[#25A8CF]"
                }`}
              >
                Deposit
              </Button>
              <Button
                onClick={() => setDepositWithdrawTab("withdraw")}
                variant="default"
                className={`flex-1 py-7 rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-sm ${
                  depositWithdrawTab === "withdraw"
                    ? "bg-[#D6EEF6] dark:bg-[#052834] dark:text-[#30CFFF] hover:bg-[#D6EEF6]/60 text-[#25A8CF]"
                    : "bg-transparent text-[#25A8CF]"
                }`}
              >
                Withdraw
              </Button>
            </div>

            <Card className="bg-[#F3F3F3] dark:bg-[#141C22] dark:border-[#083341] border-none md:dark:border-solid ">
              <CardContent className="px-6 py-3">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 border border-[#DAD9D9E5] dark:border-[#222A30] p-2 rounded-3xl cursor-pointer">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center">
                        <img src={ao_token} alt="ao token" />
                      </div>
                      <span className="font-medium dark:text-[#EAEAEA]">
                        AO
                      </span>
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
                      <div className="text-[#7E868C] dark:text-[#95A0A6] text-sm">
                        {depositWithdrawTab === "deposit"
                          ? "Wallet Balance"
                          : "Staked Balance"}
                      </div>
                      <div className="font-medium text-lg text-[#565E64] dark:text-[#EAEAEA]">
                        $ {strategy.walletBalance}
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-between space-x-4">
                    <Input
                      type="text"
                      placeholder="$ 0.00"
                      value={
                        depositWithdrawTab === "deposit"
                          ? depositAmount
                          : withdrawAmount
                      }
                      onChange={(e) => {
                        if (depositWithdrawTab === "deposit") {
                          setDepositAmount(e.target.value);
                        } else {
                          setWithdrawAmount(e.target.value);
                        }
                      }}
                      className="text-left text-2xl py-7 text-[#95A0A6] w-full border-none bg-[#EAEAEA] dark:bg-[#1B2329] focus:ring-0"
                    />
                    <div className="">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#7E868C] gradient-card px-4 py-7"
                        onClick={() => {
                          if (depositWithdrawTab === "deposit") {
                            setDepositAmount(strategy.walletBalance);
                          } else {
                            setWithdrawAmount(strategy.walletBalance);
                          }
                        }}
                      >
                        Max
                      </Button>
                    </div>
                  </div>
                  <div className=" text-[#7e868c] text-xs">≈ 0.00 AR</div>

                  <Button
                    className="w-full !mt-7 bg-[#D6EEF6] dark:bg-[#052834] hover:bg-[#97c2d1] text-[#25A8CF] dark:text-[#30CFFF] h-12"
                    disabled={!(depositAmount || withdrawAmount)}
                    onClick={() => {
                      if (depositWithdrawTab === "deposit") {
                        deposit.mutateAsync();
                      } else {
                        withdraw.mutateAsync();
                      }
                    }}
                  >
                    {depositWithdrawTab === "deposit" ? "Deposit" : "Withdraw"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 sm:mt-12">
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 mt-4 sm:mt-6 md:mt-20 border-b border-[#e6e6e6] dark:border-[#192127]">
            <div className="flex flex-wrap gap-2 sm:gap-4 flex-1">
              {["Manage", "Details", "Risks", "FAQs", "Transactions"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`pb-2 text-xs sm:text-sm font-medium p-1 px-2 sm:px-4 rounded-tr-md rounded-tl-md transition-colors ${
                      activeTab === tab.toLowerCase()
                        ? "bg-[#ECECEC] dark:bg-[#161E24] text-[#565E64] dark:text-[#F5FBFF]"
                        : "border border-[#EAEAEA] dark:border-[#192127] text-[#7e868c] hover:text-[#1a2228] dark:hover:text-[#7e868c80]"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1A2228] dark:text-[#EAEAEA] mb-3 sm:mb-4">
                How it works
              </h3>
              <p className="text-[#565E64] dark:text-[#EAEAEA] text-sm leading-relaxed mb-4 sm:mb-6">
                Deploy your AR into your AO/wAR pool, automatically rebalancing
                positions around the current price to optimize yield and reduce
                the need for manual adjustments. Trading fees and DeFi Spring
                rewards are automatically compounded back into the strategy. In
                return, you receive an ERC-20 token representing your share of
                the strategy.
              </p>

              <div className="bg-[#F3F3F3] dark:bg-[#141C22] p-3 sm:p-4 md:p-5 rounded-xl w-full sm:w-fit">
                <h4 className="font-semibold text-base sm:text-lg text-[#565E64] dark:text-[#EAEAEA] mb-2 sm:mb-3">
                  Key points to note:
                </h4>
                <ol className="list-decimal list-inside space-y-2 pl-0 sm:pl-4 text-[#565e64] dark:text-[#EAEAEA] text-sm">
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

            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <div className="flex items-center space-x-2 gradient-card p-1.5">
                <span className="text-[#565e64] dark:text-[#95A0A6] text-xs sm:text-sm">
                  Risk:
                </span>
                <span className="text-[#565e64] dark:text-[#95A0A6] text-xs sm:text-sm">
                  Very Low
                </span>
              </div>
              <div className="flex items-center space-x-2 gradient-card p-1.5 sm:p-2">
                <img
                  src={verified}
                  alt="verified icon"
                  className="w-3 h-3 sm:w-4 sm:h-4"
                />
                <span className="text-[#565e64] dark:text-[#95A0A6] text-xs sm:text-sm">
                  Audited
                </span>
              </div>
              <div className="flex items-center space-x-2 gradient-card p-1.5 sm:p-2">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-[#565e64] dark:text-[#95A0A6]"
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
                <span className="text-[#565e64] dark:text-[#95A0A6] text-xs sm:text-sm">
                  Docs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}
