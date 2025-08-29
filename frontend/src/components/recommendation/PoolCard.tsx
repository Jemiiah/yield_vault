// import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Pool } from "./types";
import verified from "../../../public/verified.svg";
import { getRiskColor } from "./utils";
import { Link } from "react-router-dom";

interface PoolCardProps {
  pool: Pool;
  onDeploy?: () => void;
  showDeployButton?: boolean;
}

export default function PoolCard({
  pool,
  onDeploy,
  showDeployButton = true,
}: PoolCardProps) {
  return (
    <Card className="bg-[#F3F3F3] dark:bg-[#141C22] border border-[#DAD9D9E5] dark:border-[#222A30] hover:border-[#25A8CF] dark:hover:border-[#25A8CF] transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Token Icons */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#1a2228] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {pool.tokens[0]?.charAt(0)}
                </span>
              </div>
              <div className="w-8 h-8 -translate-x-2 bg-[#fd3235] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {pool.tokens[1]?.charAt(0)}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-[#1A2228] dark:text-[#EAEAEA]">
                  {pool.name}
                </h3>
                {pool.verified && (
                  <div className="gradient-card p-1 w-4 h-4 rounded-md flex items-center justify-center">
                    <img src={verified} alt="verified" className="w-3 h-3" />
                  </div>
                )}
              </div>
              <p className="text-sm text-[#7e868c] dark:text-[#95A0A6]">
                {pool.description}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-[#25A8CF] dark:text-[#30CFFF]">
              {pool.apy}
            </div>
            <div className="text-xs text-[#7e868c] dark:text-[#95A0A6]">
              APY
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={`${getRiskColor(pool.risk)} border`}>
              Risk: {pool.risk}
            </Badge>
            <Badge className="bg-[#25A8CF] text-white">TVL: {pool.tvl}</Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#7e868c] dark:text-[#95A0A6]">
              Tokens:
            </span>
            <div className="flex space-x-1">
              {pool.tokens.map((token, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs border-[#DAD9D9E5] dark:border-[#222A30] text-[#7e868c] dark:text-[#95A0A6]"
                >
                  {token}
                </Badge>
              ))}
            </div>
          </div>

          {showDeployButton && onDeploy && (
            <Link
              to={`/strategy/${pool.id}`}
              onClick={onDeploy}
              className="bg-gradient-to-r from-[#25A8CF] to-[#30CFFF] hover:from-[#1f8ba8] hover:to-[#28b8e6] text-white font-medium px-4 py-2 rounded-lg"
            >
              Deploy
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
