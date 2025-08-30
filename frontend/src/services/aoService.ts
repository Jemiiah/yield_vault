import { message, result, dryrun } from "@permaweb/aoconnect";
import { MANAGER_CONTRACT } from "../constants/yao_process";
import type {
  RiskAssessmentData,
  Pool,
} from "../components/recommendation/types";

export interface AIRecommendation {
  pool_id: string;
  dex: string;
  token_pair: string;
  apy: string;
  risk_level: string;
  reasoning: string;
  match_score: number;
}

export interface AIRecommendationsResponse {
  recommendations: AIRecommendation[];
}

export interface AgentSpawnConfig {
  dex: string;
  tokenOut: string;
  slippage: number;
  startDate: number;
  endDate: number;
  runIndefinitely: boolean;
  conversionPercentage: number;
  strategyType: string;
  baseToken: string;
  poolId?: string;
  poolIdReference?: string;
}

export interface AgentRecord {
  process_id: string;
  pool_id: string;
  status: string;
  created_at: number;
  config: AgentSpawnConfig;
}

/**
 * Get AI-powered pool recommendations from Manager Contract
 */
export async function getAIRecommendations(
  riskData: RiskAssessmentData
): Promise<Pool[]> {
  try {
    console.log(
      "Requesting AI recommendations from Manager Contract:",
      riskData
    );

    // Send message to Manager Contract
    const messageId = await message({
      process: MANAGER_CONTRACT,
      tags: [{ name: "Action", value: "Get-AI-Recommendations" }],
      data: JSON.stringify(riskData),
    });

    console.log("AI recommendations request sent, message ID:", messageId);

    // Get the result
    const response = await result({
      message: messageId,
      process: MANAGER_CONTRACT,
    });

    console.log("AI recommendations response:", response);

    // Check if we got a pending response first
    if (response.Messages && response.Messages.length > 0) {
      const lastMessage = response.Messages[response.Messages.length - 1];

      if (lastMessage.Tags?.Action === "AI-Recommendations-Pending") {
        // Wait for the actual response (this is a simplified approach)
        // In a real implementation, you might want to poll or use websockets
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Try to get the response again
        const finalResponse = await result({
          message: messageId,
          process: MANAGER_CONTRACT,
        });

        return parseAIResponse(finalResponse);
      } else if (lastMessage.Tags?.Action === "AI-Recommendations-Response") {
        return parseAIResponse(response);
      } else if (lastMessage.Tags?.Action === "AI-Recommendations-Error") {
        throw new Error(lastMessage.Tags?.Error || "AI recommendations failed");
      }
    }

    throw new Error("No valid response received from Manager Contract");
  } catch (error) {
    console.error("Error getting AI recommendations:", error);
    throw new Error("Failed to get AI recommendations from Manager Contract");
  }
}

/**
 * Parse AI recommendations response and convert to Pool format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseAIResponse(response: any): Pool[] {
  try {
    if (!response.Messages || response.Messages.length === 0) {
      throw new Error("No messages in response");
    }

    const lastMessage = response.Messages[response.Messages.length - 1];

    if (lastMessage.Tags?.Action !== "AI-Recommendations-Response") {
      throw new Error("Invalid response action");
    }

    const data = JSON.parse(lastMessage.Data) as AIRecommendationsResponse;

    if (!data.recommendations || !Array.isArray(data.recommendations)) {
      throw new Error("Invalid recommendations format");
    }

    // Convert AI recommendations to Pool format
    return data.recommendations.map(
      (rec): Pool => ({
        id: rec.pool_id,
        name: rec.token_pair,
        apy: rec.apy,
        risk: rec.risk_level,
        tokens: rec.token_pair.split("/"),
        description: rec.reasoning,
        tvl: "N/A", // TVL not provided in AI response
        verified: true, // Assume AI recommendations are for verified pools
        // Additional pool data that might be available from Manager Contract
        amm_process: rec.pool_id, // Use pool_id as amm_process
        // Note: token0, token1, etc. would need to be provided by Manager Contract
        // For now, we'll rely on the pool ID to get this information
      })
    );
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw new Error("Failed to parse AI recommendations response");
  }
}

/**
 * Spawn a new agent via Manager Contract
 */
export async function spawnAgent(config: AgentSpawnConfig): Promise<string> {
  try {
    console.log("Spawning agent via Manager Contract:", config);

    const messageId = await message({
      process: MANAGER_CONTRACT,
      tags: [
        { name: "Action", value: "Spawn-Agent" },
        { name: "Dex", value: config.dex },
        { name: "Token-Out", value: config.tokenOut },
        { name: "Slippage", value: config.slippage.toString() },
        { name: "Start-Date", value: config.startDate.toString() },
        { name: "End-Date", value: config.endDate.toString() },
        { name: "Run-Indefinitely", value: config.runIndefinitely.toString() },
        {
          name: "Conversion-Percentage",
          value: config.conversionPercentage.toString(),
        },
        { name: "Strategy-Type", value: config.strategyType },
        { name: "Base-Token", value: config.baseToken },
        ...(config.poolId ? [{ name: "Pool-Id", value: config.poolId }] : []),
        ...(config.poolIdReference
          ? [{ name: "Pool-Id-Reference", value: config.poolIdReference }]
          : []),
      ],
    });

    console.log("Agent spawn request sent, message ID:", messageId);

    // Get the result
    const response = await result({
      message: messageId,
      process: MANAGER_CONTRACT,
    });

    console.log("Agent spawn response:", response);

    if (response.Messages && response.Messages.length > 0) {
      const lastMessage = response.Messages[response.Messages.length - 1];

      if (lastMessage.Tags?.Action === "Spawn-Agent-Pending") {
        const sessionId = lastMessage.Tags?.["Session-Id"];

        // Wait for agent to be spawned (simplified approach)
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // In a real implementation, you would poll for the spawned agent
        // For now, return the session ID as a placeholder
        return sessionId || "pending";
      } else if (lastMessage.Tags?.Action === "Spawn-Agent-Error") {
        throw new Error(lastMessage.Tags?.Error || "Agent spawn failed");
      }
    }

    throw new Error("No valid response received from Manager Contract");
  } catch (error) {
    console.error("Error spawning agent:", error);
    throw new Error("Failed to spawn agent via Manager Contract");
  }
}

/**
 * Get user's agents from Manager Contract
 */
export async function getUserAgents(
  userAddress?: string
): Promise<AgentRecord[]> {
  try {
    console.log("Getting user agents from Manager Contract");

    const messageId = await message({
      process: MANAGER_CONTRACT,
      tags: [
        { name: "Action", value: "Get-User-Agents" },
        ...(userAddress ? [{ name: "User-Address", value: userAddress }] : []),
      ],
    });

    const response = await result({
      message: messageId,
      process: MANAGER_CONTRACT,
    });

    if (response.Messages && response.Messages.length > 0) {
      const lastMessage = response.Messages[response.Messages.length - 1];

      if (lastMessage.Tags?.Action === "User-Agents-Response") {
        const data = JSON.parse(lastMessage.Data) as AgentRecord[];
        return data;
      } else if (lastMessage.Tags?.Action === "User-Agents-Error") {
        throw new Error(lastMessage.Tags?.Error || "Failed to get user agents");
      }
    }

    return [];
  } catch (error) {
    console.error("Error getting user agents:", error);
    throw new Error("Failed to get user agents from Manager Contract");
  }
}

/**
 * Get available pools from Manager Contract
 */
export async function getAvailablePools(): Promise<Pool[]> {
  try {
    console.log("Getting available pools from Manager Contract");

    const response = await dryrun({
      process: MANAGER_CONTRACT,
      tags: [{ name: "Action", value: "Get-Available-Pools" }],
    });

    if (response.Messages && response.Messages.length > 0) {
      const lastMessage = response.Messages[response.Messages.length - 1];

      if (lastMessage.Tags?.Action === "Available-Pools-Response") {
        const poolsData = JSON.parse(lastMessage.Data);

        // Convert Manager Contract pool format to frontend Pool format
        return poolsData.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (pool: any): Pool => ({
            id: pool.id,
            name: pool.name,
            apy: pool.apy,
            risk: pool.risk_level,
            tokens: [pool.token_a, pool.token_b], // Simplified - you might want to resolve token symbols
            description: pool.description,
            tvl: pool.tvl,
            verified: pool.verified,
          })
        );
      }
    }

    return [];
  } catch (error) {
    console.error("Error getting available pools:", error);
    throw new Error("Failed to get available pools from Manager Contract");
  }
}
