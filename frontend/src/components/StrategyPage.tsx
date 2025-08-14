import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StrategyPage = () => {
  const { id } = useParams<{ id: string }>();

  // Mock strategy data - in a real app, you'd fetch this based on the id
  const strategyData = {
    id: id,
    name: `Strategy ${id}`,
    apy: "12.5%",
    risk: "Medium",
    tvl: "$1,250,000",
    description:
      "This is a high-yield DeFi strategy that focuses on auto-compounding yields across multiple protocols.",
    tokens: ["ETH", "USDC", "DAI"],
    protocol: "YAO AI",
    status: "Active",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          to="/dashboard"
          className="text-[#565E64] dark:text-gray-300 hover:text-[#1A2228] dark:hover:text-white"
        >
          ← Back to Dashboard
        </Link>
      </nav>

      {/* Strategy Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-[#1A2228] dark:text-white">
            {strategyData.name}
          </h1>
          <Badge
            variant={strategyData.status === "Active" ? "default" : "secondary"}
          >
            {strategyData.status}
          </Badge>
        </div>
        <p className="text-[#565E64] dark:text-gray-300 text-lg">
          {strategyData.description}
        </p>
      </div>

      {/* Strategy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">APY</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {strategyData.apy}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {strategyData.risk}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Value Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#1A2228] dark:text-white">
              {strategyData.tvl}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Details</CardTitle>
            <CardDescription>
              Key information about this strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#565E64] dark:text-gray-300">
                Protocol
              </label>
              <p className="text-[#1A2228] dark:text-white">
                {strategyData.protocol}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#565E64] dark:text-gray-300">
                Supported Tokens
              </label>
              <div className="flex gap-2 mt-1">
                {strategyData.tokens.map((token) => (
                  <Badge key={token} variant="secondary">
                    {token}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#565E64] dark:text-gray-300">
                Strategy ID
              </label>
              <p className="text-[#1A2228] dark:text-white font-mono">
                {strategyData.id}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Manage your position in this strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" size="lg">
              Invest in Strategy
            </Button>
            <Button variant="outline" className="w-full" size="lg">
              View Analytics
            </Button>
            <Button variant="outline" className="w-full" size="lg">
              Withdraw Funds
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StrategyPage;
