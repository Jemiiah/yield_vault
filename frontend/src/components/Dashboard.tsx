"use client";

import { getTokenInfo } from "../helpers/token";
import dashboard_grid from "../../public/graph_main_stra.svg";
import dashboard_grid_dark from "../../public/background_grid_dark.svg";
import yao_text from "../../public/YAO.svg";
import yao_text_white from "../../public/yao_text_white.svg";
import { useTheme } from "../hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import ao_logo from "../../public/ao_logo.svg";
// import stEth from "../../public/stETH 2.svg";
// import dai from "../../public/DAI 1.svg";
import help_circle from "../../public/help-circle.svg";
import filter from "../../public/filter.svg";
import user_circle from "../../public/user-circle.svg";
import verified from "../../public/verified.svg";
import DashboardFooter from "./dashboard/dashboard_footer";
import { useState, useEffect, useMemo, useCallback } from "react";
import { RecommendButton } from "./recommendation";

// Minimal pool type used by the UI
interface Pool {
  amm_name?: string;
  amm_process?: string;
  token0?: string;
  token1?: string;
  token0_ticker?: string;
  token1_ticker?: string;
  token0_name?: string;
  token1_name?: string;
  pool_fee_bps?: number;
  volume_usd?: number;
  liquidity_usd?: number;
  market_cap?: number;
  token0_current_price?: number;
  token1_current_price?: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("strategies");
  // const [currentPage, setCurrentPage] = useState(1);
  const theme = useTheme();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loadingPools, setLoadingPools] = useState(false);
  const [poolsError, setPoolsError] = useState<string | null>(null);

  // State for token logos
  const [tokenLogos, setTokenLogos] = useState<Record<string, string>>({});
  const [logoLoading, setLogoLoading] = useState<Set<string>>(new Set());

  // Function to fetch token logo
  const fetchTokenLogo = useCallback(
    async (tokenId: string) => {
      if (!tokenId || tokenLogos[tokenId] || logoLoading.has(tokenId)) return;

      setLogoLoading((prev) => new Set(prev).add(tokenId));

      try {
        const tokenInfo = await getTokenInfo(tokenId);
        setTokenLogos((prev) => ({
          ...prev,
          [tokenId]: tokenInfo.logo,
        }));
      } catch (error) {
        console.error(`Failed to fetch logo for token ${tokenId}:`, error);
        // Use fallback logo on error
        setTokenLogos((prev) => ({
          ...prev,
          [tokenId]: ao_logo,
        }));
      } finally {
        setLogoLoading((prev) => {
          const newSet = new Set(prev);
          newSet.delete(tokenId);
          return newSet;
        });
      }
    },
    [tokenLogos, logoLoading]
  );

  // Fetch logos for all tokens when pools data is available
  useEffect(() => {
    if (pools.length > 0) {
      const tokenIds = new Set<string>();

      pools.forEach((pool) => {
        if (pool.token0) tokenIds.add(pool.token0);
        if (pool.token1) tokenIds.add(pool.token1);
      });

      tokenIds.forEach((tokenId) => {
        fetchTokenLogo(tokenId);
      });
    }
  }, [pools, fetchTokenLogo]);

  // Helper function to get token logo with fallback
  const getTokenLogo = useCallback(
    (tokenId?: string): string => {
      if (!tokenId) return ao_logo;
      return tokenLogos[tokenId] || ao_logo;
    },
    [tokenLogos]
  );

  const isStableToken = useMemo(
    () =>
      (ticker?: string, name?: string): boolean => {
        if (!ticker && !name) return false;
        const tokenStr = `${ticker || ""} ${name || ""}`.toLowerCase();
        return (
          tokenStr.includes("usd") ||
          tokenStr.includes("dai") ||
          tokenStr.includes("usdt") ||
          tokenStr.includes("usdc")
        );
      },
    []
  );

  const isAOToken = useMemo(
    () =>
      (ticker?: string, name?: string): boolean => {
        if (!ticker && !name) return false;
        const tokenStr = `${ticker || ""} ${name || ""}`.toLowerCase();
        return tokenStr.includes("ao") || tokenStr.includes("war");
      },
    []
  );

  const isGameToken = useMemo(
    () =>
      (ticker?: string, name?: string): boolean => {
        if (!ticker && !name) return false;
        const tokenStr = `${ticker || ""} ${name || ""}`.toLowerCase();
        return tokenStr.includes("game") || Boolean(name?.includes("Game"));
      },
    []
  );

  const calculateRisk = useMemo(
    () =>
      (pool: Pool): { risk: "low" | "medium" | "high"; score: number } => {
        const token0Stable = isStableToken(
          pool.token0_ticker,
          pool.token0_name
        );
        const token1Stable = isStableToken(
          pool.token1_ticker,
          pool.token1_name
        );
        const token0AO = isAOToken(pool.token0_ticker, pool.token0_name);
        const token1AO = isAOToken(pool.token1_ticker, pool.token1_name);
        const token0Game = isGameToken(pool.token0_ticker, pool.token0_name);
        const token1Game = isGameToken(pool.token1_ticker, pool.token1_name);

        if (
          (token0Stable && token1AO) ||
          (token1Stable && token0AO) ||
          token0Game ||
          token1Game ||
          (token0Stable && token1Stable)
        ) {
          return { risk: "low", score: 80 };
        }

        if ((token0Stable || token1Stable) && (token0AO || token1AO)) {
          return { risk: "low", score: 60 };
        }

        if (token0Stable || token1Stable) {
          return { risk: "medium", score: 40 };
        }

        // Default high risk
        return { risk: "high", score: 20 };
      },
    [isStableToken, isAOToken, isGameToken]
  );

  const fetchPools = useCallback(async (signal: AbortSignal) => {
    const API_BASE = "http://localhost:3000";
    const url = `${API_BASE}/pools`;

    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json().catch(() => null);
    if (data == null) {
      const txt = await response.text();
      try {
        const parsed = JSON.parse(txt);
        return parsed;
      } catch {
        throw new Error("Bad payload");
      }
    }
    return data;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingPools(true);
    setPoolsError(null);

    fetchPools(controller.signal)
      .then((data: unknown) => {
        type WithItems = { items?: unknown };
        let arr: Pool[] = [];
        if (Array.isArray(data)) {
          arr = data as Pool[];
        } else if (
          data &&
          typeof data === "object" &&
          Array.isArray((data as WithItems).items)
        ) {
          arr = (data as { items: Pool[] }).items;
        }
        setPools(arr);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setPoolsError("Failed to load pools");
      })
      .finally(() => {
        setLoadingPools(false);
      });

    return () => {
      controller.abort();
    };
  }, [fetchPools]);

  const deriveApyPct = useMemo(
    () =>
      (pool: Pool): number => {
        const vol = Number(pool?.volume_usd) || 0;
        const liq = Number(pool?.liquidity_usd) || 0;
        const feeBps = Number(pool?.pool_fee_bps) || 0;
        if (!liq || !feeBps) return 0;
        const feeRate = feeBps / 10000; // e.g., 25 bps => 0.0025
        const daily = (vol / liq) * feeRate; // daily yield estimate
        const annual = daily * 365;
        return Math.max(0, annual) * 100; // percent
      },
    []
  );

  const fmtPct = useMemo(
    () =>
      (v: number): string =>
        `${v.toFixed(2)}%`,
    []
  );

  const fmtUSD = useMemo(
    () =>
      (v: number): string =>
        v >= 1_000_000
          ? `$${(v / 1_000_000).toFixed(2)}m`
          : v >= 1_000
          ? `$${(v / 1_000).toFixed(2)}k`
          : `$${v.toFixed(2)}`,
    []
  );

  // Function to generate risk bars based on risk score
  const generateRiskBars = useMemo(
    () => (riskScore: number) => {
      const totalBars = 5;
      const filledBars = Math.round((riskScore / 100) * totalBars);
      const bars = [];

      // Determine color based on number of filled bars
      const getBarColor = (isFilled: boolean) => {
        if (!isFilled) return "bg-gray-200";

        if (filledBars === 1) return "bg-red-500";
        if (filledBars === 2) return "bg-yellow-500";
        if (filledBars >= 3) return "bg-green-500";

        return "bg-gray-200";
      };

      for (let i = 0; i < totalBars; i++) {
        const isFilled = i < filledBars;
        bars.push(
          <div
            key={i}
            className={`w-1 h-7 rounded-sm ${getBarColor(isFilled)}`}
          />
        );
      }

      return bars;
    },
    []
  );

  const fetchedStrategies = useMemo(
    () =>
      pools
        .map((p) => {
          const apyPct = deriveApyPct(p);
          const risk = calculateRisk(p);
          console.log("p strategy xxxxxxxxxxxxxxxx", p);
          return {
            id:
              p.amm_process ||
              `${p.token0_ticker || ""}-${p.token1_ticker || ""}`,
            name:
              p.amm_name ||
              `${p.token0_ticker || p.token0_name}/${
                p.token1_ticker || p.token1_name
              }`,
            token_icon: getTokenLogo(p.token0),
            token_icon2: getTokenLogo(p.token1),
            verified: verified,
            protocol:
              (p.amm_name && String(p.amm_name).split(" ")[0]) || "Botega",
            protocol_icon: user_circle,
            apy: fmtPct(apyPct),
            apyColor: apyPct >= 0 ? "text-blue-500" : "text-red-500",
            risk: risk.risk,
            riskScore: risk.score,
            tvl: fmtUSD(Number(p.liquidity_usd) || 0),
            badges: [],
            points: "",
            isStrategy: false,
          };
        })
        .filter((strategy) => {
          const apyNum = Number(strategy.apy.replace("%", ""));
          return apyNum > 0;
        })
        .sort((a, b) => {
          // Sort by risk score first (higher = safer), then by APY
          if (a.riskScore !== b.riskScore) return b.riskScore - a.riskScore;
          return (
            Number(b.apy.replace("%", "")) - Number(a.apy.replace("%", ""))
          );
        }),
    [pools, deriveApyPct, fmtPct, fmtUSD, calculateRisk, getTokenLogo]
  );

  const dynamicTokenCards = useMemo(() => {
    return pools
      .map((pool) => {
        const apyPct = deriveApyPct(pool);
        const risk = calculateRisk(pool);
        const isGame =
          isGameToken(pool.token0_ticker, pool.token0_name) ||
          isGameToken(pool.token1_ticker, pool.token1_name);

        if (apyPct <= 0) return null;

        return {
          symbol: pool.amm_name?.split(" ")[2],
          logo: getTokenLogo(pool.token0),
          logo2: getTokenLogo(pool.token1),
          value: fmtUSD(Number(pool.token1_current_price || 0)),
          apy: fmtPct(apyPct),
          protocol: pool.amm_name?.split(" ")[0],
          volume: fmtUSD(Number(pool.volume_usd) || 0),
          market_cap: fmtUSD(Number(pool.market_cap) || 0),
          tvl: fmtUSD(Number(pool.liquidity_usd) || 0),
          risk: risk.risk,
          riskScore: risk.score,
          isGame: isGame,
          pool: pool,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Prioritize by risk score first (higher = safer), then game tokens, then APY
        if (a!.riskScore !== b!.riskScore) return b!.riskScore - a!.riskScore;
        if (a!.isGame && !b!.isGame) return -1;
        if (!a!.isGame && b!.isGame) return 1;
        return (
          Number(b!.apy.replace("%", "")) - Number(a!.apy.replace("%", ""))
        );
      })
      .slice(0, 4);
  }, [
    pools,
    deriveApyPct,
    fmtPct,
    fmtUSD,
    calculateRisk,
    isGameToken,
    getTokenLogo,
  ]);

  const displayTokenCards = useMemo(() => {
    return dynamicTokenCards;
  }, [dynamicTokenCards]);

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

      <div className="mx-4 sm:mx-6 md:mx-12 px-2 sm:px-4 md:px-6 pb-8">
        <div className="flex justify-between space-x-4 sm:space-x-6 md:space-x-8 mb-4 sm:mb-6 border-b dark:border-[#20282E] border-[#EAEAEA]">
          <div>
            <button
              onClick={() => setActiveTab("strategies")}
              className={`pb-2 px-1 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === "strategies"
                  ? "border-[#1fadd8] text-[#1A2228] dark:text-[#F5FBFF]"
                  : "border-transparent text-[#7e868c] hover:text-[#a4a8ab]"
              }`}
            >
              Strategies
            </button>
            <button
              onClick={() => setActiveTab("find-yields")}
              className={`pb-2 px-1 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === "find-yields"
                  ? "border-[#1fadd8] text-[#1A2228] dark:text-[#F5FBFF]"
                  : "border-transparent text-[#7e868c] hover:text-[#a4a8ab]"
              }`}
            >
              Find Yields
            </button>
          </div>

          <div className="flex items-center mb-1">
            <RecommendButton />
          </div>
        </div>

        {/* Token Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {displayTokenCards.map((token, index) => (
            <Card
              key={index}
              className="bg-white/80 gradient-card w-full border-none"
            >
              <CardContent className="p-3 sm:p-4 md:p-5 flex flex-col items-center py-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-[#1a2228] rounded-full flex items-center justify-center">
                      <div className="flex">
                        <img
                          src={token?.logo}
                          alt={token?.symbol}
                          className="w-5 h-5 rounded-full"
                        />
                        <img
                          src={token?.logo2}
                          alt={token?.symbol}
                          className="w-5 h-5 rounded-full -translate-x-2"
                        />
                      </div>
                    </div>

                    <div className="text-[#1a2228] dark:text-[#FEFEFD] flex flex-col items-center font-semibold">
                      <span className="text-base">
                        {/* {token?.amount} */} {token?.symbol}
                      </span>
                      <span className="text-[#7e868c] text-sm">
                        {token?.value}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-end font-semibold">
                    <div className="text-[#1a2228] dark:text-[#FEFEFD] text-base">
                      {token?.tvl}
                    </div>
                    <div className="text-[#7e868c] text-sm">
                      {token?.market_cap}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full mt-3 sm:mt-4">
                  <div className="text-[#7e868c] text-xs font-semibold">
                    {token?.protocol}
                  </div>
                  <div className="text-[#7e868c] text-xs font-semibold">
                    <span className="text-[#5CAB28]">{token?.apy}</span> APY
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Tabs for Find Yields */}
        {activeTab === "find-yields" && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Button
                variant="default"
                size="sm"
                className="bg-[#ECECEC] dark:bg-[#161E24] text-[#565E64] hover:bg-[#ececec95] dark:hover:bg-[#161e2484] text-xs sm:text-sm"
              >
                All
              </Button>
              <Button
                variant="default"
                size="sm"
                className="border border-[#EAEAEA] dark:border-[#192127] text-[#565E64] hover:bg-[#ececec95] dark:hover:bg-[#161e2484] text-xs sm:text-sm"
              >
                Dexi
              </Button>
              <Button
                variant="default"
                size="sm"
                className="border border-[#EAEAEA] dark:border-[#192127] text-[#565E64] hover:bg-[#ececec95] dark:hover:bg-[#161e2484] text-xs sm:text-sm"
              >
                Botega
              </Button>
              <Button
                variant="default"
                size="sm"
                className="border border-[#EAEAEA] dark:border-[#192127] text-[#565E64] hover:bg-[#ececec95] dark:hover:bg-[#161e2484] text-xs sm:text-sm"
              >
                Permaswap
              </Button>
              <Button
                variant="default"
                size="sm"
                className="border border-[#EAEAEA] dark:border-[#192127] text-[#565E64] hover:bg-[#ececec95] dark:hover:bg-[#161e2484] text-xs sm:text-sm"
              >
                Liquid Ops
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-[#565E64] dark:text-[#95A0A6] hover:bg-none border border-[#EAEAEA] dark:border-[#192127] text-xs sm:text-sm"
            >
              <img
                src={filter}
                alt="filter"
                className="w-3 h-3 sm:w-4 sm:h-4"
              />
              <span className="ml-1">Filter</span>
            </Button>
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Card className="bg-none border-none px-0">
            <CardContent className="p-0">
              <div className="px-4 py-2 text-sm">
                {loadingPools && (
                  <span className="text-[#7e868c]">Loading pools…</span>
                )}
                {!loadingPools && poolsError && (
                  <span className="text-red-500">{poolsError}</span>
                )}
              </div>
              {/* Table Header */}
              <div className="grid grid-cols-7 bg-[#F0F0F0] dark:bg-[#182026] rounded-tr-xl rounded-tl-xl gap-4 p-4 text-[#7e868c] text-sm font-medium">
                <div className="col-span-3">STRATEGY NAME</div>
                <div className="text-center">APY</div>
                <div className="text-center">RISK</div>
                <div className="text-center">TVL</div>
                <div className="text-center">INFO</div>
              </div>

              {/* Strategy Rows */}
              {loadingPools
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-7 gap-4 p-4 mb-2 rounded-br-lg rounded-bl-lg bg-[#F3F3F3] dark:bg-[#141C22]"
                    >
                      {/* Strategy Name Column */}
                      <div className="flex space-x-3 col-span-3">
                        <div className="flex">
                          <div className="w-5 h-5 md:w-8 md:h-8 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 animate-pulse"></div>
                          <div className="w-5 h-5 md:w-8 md:h-8 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 animate-pulse -translate-x-2"></div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                        </div>
                      </div>

                      {/* APY Column */}
                      <div className="text-center flex items-center justify-center">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
                      </div>

                      {/* Risk Column */}
                      <div className="text-center flex justify-center">
                        <div className="flex space-x-1.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="w-1 h-7 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse"
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* TVL Column */}
                      <div className="text-center flex items-center justify-center">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                      </div>

                      {/* Info Column */}
                      <div className="text-center flex justify-center">
                        <div className="w-4 h-4 md:w-10 md:h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))
                : fetchedStrategies.map((strategy, index) => (
                    <Link key={index} to={`/strategy/${strategy.id}`}>
                      <div
                        className={`grid grid-cols-7 gap-4 p-4 mb-2 rounded-br-lg rounded-bl-lg bg-[#F3F3F3] hover:bg-[#f7f7f6] dark:hover:bg-[#20282E] dark:bg-[#141C22] transition-colors cursor-pointer relative`}
                      >
                        {/* {strategy.isStrategy && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-[#141c2298] backdrop-blur-[0.5px] opacity-90 z-10 pointer-events-none"></div>
                  )} */}

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
                                src={strategy.token_icon2}
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
                          {strategy.isStrategy ? (
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
                            {strategy.isStrategy ? (
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
                          {strategy.isStrategy ? (
                            <div className="flex justify-center space-x-2">
                              <button className="p-1.5 font-bold hover:bg-[#e9e9e9] w-4 h-4 md:w-10 md:h-10 text-center rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#20282E] dark:to-[#121a21] backdrop-blur-md dark:text-white transition-all duration-200 hover:scale-105 shadow-lg">
                                —
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="flex space-x-1.5">
                                {generateRiskBars(strategy.riskScore || 60)}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="">
                          {strategy.isStrategy ? (
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
                          <button className="p-1.5 hover:bg-[#e9e9e9] w-10 h-10 text-center rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#10181D] dark:to-[#121A21] backdrop-blur-md dark:text-white transition-all duration-200 hover:scale-105 shadow-lg">
                            <img src={help_circle} alt={strategy.name} />
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
            </CardContent>
          </Card>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-3 sm:space-y-4 relative">
          {fetchedStrategies.map((strategy, index) => (
            <Link key={index} to={`/strategy/${strategy.id}`}>
              <div className="relative">
                {strategy.isStrategy && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-[#141c2298] backdrop-blur-[0.5px] opacity-90 z-10 pointer-events-none rounded-lg"></div>
                )}
                <Card className="bg-white dark:bg-[#141C22] mb-2 p-2 sm:p-3 border border-gray-200 dark:border-[#20282E] shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="px-3 sm:px-4 py-2 sm:py-3">
                    <div className="relative z-20">
                      {/* Header - Title and Token */}
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <img
                            src={strategy.token_icon}
                            alt={strategy.name}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                          />
                          <div>
                            <h3 className="font-semibold text-[#1a2228] dark:text-[#FEFEFD] text-xs sm:text-sm">
                              {strategy.name}
                            </h3>
                            <p className="text-[#7e868c] text-xs flex items-center space-x-1">
                              <span>{strategy.protocol}</span>
                            </p>
                          </div>
                        </div>

                        {/* Verification and Badges */}
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <img
                            src={strategy.verified}
                            alt="verified"
                            className="w-3 h-3 sm:w-4 sm:h-4"
                          />
                          {strategy.badges.map((badge, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#10181D] dark:to-[#121A21] backdrop-blur-md dark:text-white shadow-sm text-[#10181D] text-xs px-1 sm:px-2 py-1"
                            >
                              {badge === "Hot & New" ? "Hot & New" : badge}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Metrics Row */}
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        {/* APY */}
                        <div className="text-center">
                          <p className="text-[#7e868c] text-xs mb-1">APY</p>
                          <p
                            className={`font-semibold text-xs sm:text-sm ${strategy.apyColor}`}
                          >
                            {strategy.apy}
                          </p>
                        </div>

                        {/* Risk */}
                        <div className="text-center">
                          <p className="text-[#7e868c] text-xs mb-1">RISK</p>
                          <div className="flex space-x-1">
                            <div className="text-center">
                              {strategy.isStrategy ? (
                                <div className="flex justify-center space-x-2">
                                  <button className="p-1.5 font-bold hover:bg-[#e9e9e9] w-4 h-4 md:w-10 md:h-10 text-center rounded-lg bg-gradient-to-br from-white to-[#EAEAEA] dark:bg-gradient-to-br dark:from-[#20282E] dark:to-[#121a21] backdrop-blur-md dark:text-white transition-all duration-200 hover:scale-105 shadow-lg">
                                    —
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <div className="flex space-x-1.5">
                                    {generateRiskBars(strategy.riskScore || 60)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* TVL */}
                        <div className="text-center">
                          <p className="text-[#7e868c] text-xs mb-1">TVL</p>
                          <p className="font-semibold text-[#565E64] text-xs sm:text-sm">
                            {strategy.tvl}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-4 sm:mt-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#7E868C] dark:text-[#565E64] text-xs sm:text-sm"
            disabled
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
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
            <span className="hidden sm:inline">Prev</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-[#EFEFEFE5] dark:bg-[#161E24] text-[#565E64] dark:text-[#95A0A6] text-xs sm:text-sm px-2 sm:px-3"
          >
            1
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-[#EFEFEFE5] dark:bg-[#161E24] text-[#565E64] dark:text-[#95A0A6] text-xs sm:text-sm px-2 sm:px-3"
          >
            2
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-[#EFEFEFE5] dark:bg-[#161E24] text-[#565E64] dark:text-[#95A0A6] text-xs sm:text-sm px-2 sm:px-3"
          >
            3
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-[#EFEFEFE5] dark:bg-[#161E24] text-[#565E64] dark:text-[#95A0A6] text-xs sm:text-sm px-2 sm:px-3"
          >
            4
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-[#EFEFEFE5] dark:bg-[#161E24] text-[#565E64] dark:text-[#95A0A6] text-xs sm:text-sm px-2 sm:px-3"
          >
            5
          </Button>

          <span className="text-[#7e868c] text-xs sm:text-sm">...</span>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#EFEFEFE5] dark:bg-[#161E24] text-[#565E64] dark:text-[#95A0A6] text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Next</span>
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 ml-1"
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
