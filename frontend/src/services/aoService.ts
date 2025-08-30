import { message, result, dryrun, createDataItemSigner } from "@permaweb/aoconnect";
import { MANAGER_CONTRACT } from "../constants/yao_process";
import type { RiskAssessmentData, Pool } from "../components/recommendation/types";

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
  created_at: number; // This is in milliseconds from the Manager Contract
  config: {
    Slippage: number;
    StartDate: number;
    PoolIdOverride?: string;
    EndDate: number;
    Dex: string;
    StrategyType: string;
    ConversionPercentage: number;
    BaseToken: string;
    AgentOwner: string;
    TokenOut: string;
    RunIndefinitely: boolean;
  };
}

/**
 * Get AI-powered pool recommendations from Manager Contract
 */
export async function getAIRecommendations(
  riskData: RiskAssessmentData
): Promise<Pool[]> {
  try {
    console.log("Requesting AI recommendations from Manager Contract:", riskData);

    // Send dryrun to Manager Contract
    const response = await dryrun({
      process: MANAGER_CONTRACT,
      tags: [
        { name: "Action", value: "Get-AI-Recommendations" }
      ],
      data: JSON.stringify(riskData)
    });

    console.log("AI recommendations response:", response);

    // Check if we got messages in the dryrun response
    if (response.Messages && response.Messages.length > 0) {
      const lastMessage = response.Messages[response.Messages.length - 1];
      
      if (lastMessage.Tags) {
        const actionTag = lastMessage.Tags.find((tag: any) => tag.name === "Action");
        const errorTag = lastMessage.Tags.find((tag: any) => tag.name === "Error");
        
        if (actionTag?.value === "AI-Recommendations-Response") {
          return parseAIResponse(response);
        } else if (actionTag?.value === "AI-Recommendations-Error") {
          throw new Error(errorTag?.value || "AI recommendations failed");
        }
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
function parseAIResponse(response: any): Pool[] {
  try {
    if (!response.Messages || response.Messages.length === 0) {
      throw new Error("No messages in response");
    }

    const lastMessage = response.Messages[response.Messages.length - 1];
    const actionTag = lastMessage.Tags?.find((tag: { name: string; value: string; }) => tag.name === "Action");

    if (actionTag?.value !== "AI-Recommendations-Response") {
      throw new Error("Invalid response action");
    }

    const data = JSON.parse(lastMessage.Data) as AIRecommendationsResponse;
    
    if (!data.recommendations || !Array.isArray(data.recommendations)) {
      throw new Error("Invalid recommendations format");
    }

    // Convert AI recommendations to Pool format
    return data.recommendations.map((rec): Pool => ({
      id: rec.pool_id,
      name: rec.token_pair,
      apy: rec.apy,
      risk: rec.risk_level,
      tokens: rec.token_pair.includes("/") ? rec.token_pair.split("/") : [rec.token_pair],
      description: rec.reasoning,
      tvl: "N/A", // TVL not provided in AI response
      verified: true, // Assume AI recommendations are for verified pools
      // Additional pool data that might be available from Manager Contract
      amm_process: rec.pool_id, // Use pool_id as amm_process
      // Note: token0, token1, etc. would need to be provided by Manager Contract
      // For now, we'll rely on the pool ID to get this information
    }));
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
        { name: "Conversion-Percentage", value: config.conversionPercentage.toString() },
        { name: "Strategy-Type", value: config.strategyType },
        { name: "Base-Token", value: config.baseToken },
        ...(config.poolId ? [{ name: "Pool-Id", value: config.poolId }] : []),
        ...(config.poolIdReference ? [{ name: "Pool-Id-Reference", value: config.poolIdReference }] : [])
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    });

    console.log("Agent spawn request sent, message ID:", messageId);

    // Get the result
    const response = await result({
      message: messageId,
      process: MANAGER_CONTRACT
    });

    console.log("Agent spawn response:", response);

    // Check for successful spawn in Messages
    if (response.Messages && response.Messages.length > 0) {
      const lastMessage = response.Messages[response.Messages.length - 1];
      const actionTag = lastMessage.Tags?.find((tag: { name: string; value: string; }) => tag.name === "Action");

      if (actionTag?.value === "Spawn-Agent-Pending") {
        const sessionIdTag = lastMessage.Tags?.find((tag: { name: string; }) => tag.name === "Session-Id");

        // Wait for agent to be spawned (simplified approach)
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // In a real implementation, you would poll for the spawned agent
        // For now, return the session ID as a placeholder
        return sessionIdTag?.value || "pending";
      } else if (actionTag?.value === "Spawn-Agent-Error") {
        const errorTag = lastMessage.Tags?.find((tag: { name: string; }) => tag.name === "Error");
        throw new Error(errorTag?.value || "Agent spawn failed");
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
export async function getUserAgents(userAddress?: string): Promise<AgentRecord[]> {
  try {
    console.log("Getting user agents from Manager Contract", userAddress ? `for user: ${userAddress}` : "");

    const response = await dryrun({
      process: MANAGER_CONTRACT,
      tags: [
        { name: "Action", value: "Get-User-Agents" },
        ...(userAddress ? [{ name: "User-Address", value: userAddress }] : [])
      ]
    });

    console.log("User agents response:", response);
    console.log("Response Messages length:", response.Messages?.length);

    if (response.Messages && response.Messages.length > 0) {
      const lastMessage = response.Messages[response.Messages.length - 1];
      console.log("Last message:", lastMessage);
      console.log("Last message Tags:", lastMessage.Tags);
      console.log("Last message Action:", lastMessage.Tags?.Action);

      // Find the message with User-Agents-Response action
      const responseMessage = response.Messages.find(msg =>
        msg.Tags?.some((tag: { name: string; value: string; }) => tag.name === "Action" && tag.value === "User-Agents-Response")
      );

      if (responseMessage) {
        console.log("Found User-Agents-Response message:", responseMessage);
        try {
          const data = JSON.parse(responseMessage.Data) as AgentRecord[];
          console.log("Parsed agent data:", data);
          return data;
        } catch (parseError) {
          console.error("Failed to parse agent data:", parseError);
          console.log("Raw data:", responseMessage.Data);
          throw new Error("Failed to parse agent data from Manager Contract");
        }
      } else if (lastMessage.Tags?.some((tag: { name: string; value: string; }) => tag.name === "Action" && tag.value === "User-Agents-Error")) {
        const errorTag = lastMessage.Tags?.find((tag: { name: string; }) => tag.name === "Error");
        throw new Error(errorTag?.value || "Failed to get user agents");
      } else {
        console.log("No User-Agents-Response message found");
        console.log("All messages:", response.Messages);
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
      tags: [
        { name: "Action", value: "Get-Available-Pools" }
      ]
    });

    if (response.Messages && response.Messages.length > 0) {
      const responseMessage = response.Messages.find(msg =>
        msg.Tags?.some((tag: { name: string; value: string; }) => tag.name === "Action" && tag.value === "Available-Pools-Response")
      );

      if (responseMessage) {
        const poolsData = JSON.parse(responseMessage.Data);

        // Convert Manager Contract pool format to frontend Pool format
        return poolsData.map((pool: any): Pool => ({
          id: pool.id,
          name: pool.name,
          apy: pool.apy,
          risk: pool.risk_level,
          tokens: [pool.token_a, pool.token_b], // Simplified - you might want to resolve token symbols
          description: pool.description,
          tvl: pool.tvl,
          verified: pool.verified
        }));
      }
    }

    return [];
  } catch (error) {
    console.error("Error getting available pools:", error);
    throw new Error("Failed to get available pools from Manager Contract");
  }
}

export interface AgentInfo {
  "Start-Date": string;
  "End-Date": string;
  Dex: string;
  "Token-Out": string;
  "Base-Token": string;
  "Pool-Id": string;
  Slippage: string;
  Status: string;
  "Run-Indefinitely": string;
  "Conversion-Percentage": string;
  "Strategy-Type": string;
  "Agent-Version": string;
  "Total-Transactions": string;
  "Total-AO-Sold": string;
  "Total-Swaps": string;
  "Total-Swap-Value": string;
  "Total-LPs": string;
  "Total-LP-Value": string;
  "Total-LP-Transactions": string;
  "Total-LP-Tokens": string;
  "Total-Bought": string;
  "Swap-In-Progress": string;
  "Processed-Up-To-Date": string;
  "Swapped-Up-To-Date": string;
  "LP-Flow-Active": string;
  "LP-Flow-State": string;
}

/**
 * Get agent info by calling Info action on the agent process
 */
export async function getAgentInfo(agentProcessId: string): Promise<AgentInfo | undefined> {
  console.log("Getting agent info for process:", agentProcessId);

  const response = await dryrun({
    process: agentProcessId,
    tags: [{ name: "Action", value: "Info" }],
  });

  console.log("Agent info response:", response);

  if (response.Messages && response.Messages.length > 0) {
    const lastMessage = response.Messages[response.Messages.length - 1];
    console.log("Last message tags:", lastMessage.Tags);

    // Find the message with Info-Response action
    const responseMessage = response.Messages.find(msg =>
      msg.Tags?.some((tag: { name: string; value: string; }) => tag.name === "Action" && tag.value === "Info-Response")
    );

    if (responseMessage) {
      console.log("Found Info-Response message:", responseMessage);

      // Convert tags array to AgentInfo object
      const agentInfo: Partial<AgentInfo> = {};

      responseMessage.Tags?.forEach((tag: { name: string; value: string; }) => {
        // Map tag names to AgentInfo properties
        switch (tag.name) {
          case "Start-Date":
            agentInfo["Start-Date"] = tag.value;
            break;
          case "End-Date":
            agentInfo["End-Date"] = tag.value;
            break;
          case "Dex":
            agentInfo.Dex = tag.value;
            break;
          case "Token-Out":
            agentInfo["Token-Out"] = tag.value;
            break;
          case "Base-Token":
            agentInfo["Base-Token"] = tag.value;
            break;
          case "Pool-Id":
            agentInfo["Pool-Id"] = tag.value;
            break;
          case "Slippage":
            agentInfo.Slippage = tag.value;
            break;
          case "Status":
            agentInfo.Status = tag.value;
            break;
          case "Run-Indefinitely":
            agentInfo["Run-Indefinitely"] = tag.value;
            break;
          case "Conversion-Percentage":
            agentInfo["Conversion-Percentage"] = tag.value;
            break;
          case "Strategy-Type":
            agentInfo["Strategy-Type"] = tag.value;
            break;
          case "Agent-Version":
            agentInfo["Agent-Version"] = tag.value;
            break;
          case "Total-Transactions":
            agentInfo["Total-Transactions"] = tag.value;
            break;
          case "Total-AO-Sold":
            agentInfo["Total-AO-Sold"] = tag.value;
            break;
          case "Total-Swaps":
            agentInfo["Total-Swaps"] = tag.value;
            break;
          case "Total-Swap-Value":
            agentInfo["Total-Swap-Value"] = tag.value;
            break;
          case "Total-LPs":
            agentInfo["Total-LPs"] = tag.value;
            break;
          case "Total-LP-Value":
            agentInfo["Total-LP-Value"] = tag.value;
            break;
          case "Total-LP-Transactions":
            agentInfo["Total-LP-Transactions"] = tag.value;
            break;
          case "Total-LP-Tokens":
            agentInfo["Total-LP-Tokens"] = tag.value;
            break;
          case "Total-Bought":
            agentInfo["Total-Bought"] = tag.value;
            break;
          case "Swap-In-Progress":
            agentInfo["Swap-In-Progress"] = tag.value;
            break;
          case "Processed-Up-To-Date":
            agentInfo["Processed-Up-To-Date"] = tag.value;
            break;
          case "Swapped-Up-To-Date":
            agentInfo["Swapped-Up-To-Date"] = tag.value;
            break;
          case "LP-Flow-Active":
            agentInfo["LP-Flow-Active"] = tag.value;
            break;
          case "LP-Flow-State":
            agentInfo["LP-Flow-State"] = tag.value;
            break;
        }
      });

      console.log("Parsed agent info:", agentInfo);
      return agentInfo as AgentInfo;
    }
  }
}

/**
 * Withdraw tokens from agent
 */
export async function withdrawFromAgent(
  agentProcessId: string,
  tokenId: string,
  quantity?: string,
  transferAll?: boolean
): Promise<void> {
  try {
    console.log("Withdrawing from agent:", { agentProcessId, tokenId, quantity, transferAll });

    if (!window.arweaveWallet) {
      throw new Error("Wallet not connected");
    }

    const tags = [
      { name: "Action", value: "Withdraw" },
      { name: "Token-Id", value: tokenId },
    ];

    if (transferAll) {
      tags.push({ name: "Transfer-All", value: "true" });
    } else if (quantity) {
      tags.push({ name: "Quantity", value: quantity });
    }

    const messageId = await message({
      process: agentProcessId,
      tags,
      signer: createDataItemSigner(window.arweaveWallet),
    });

    const response = await result({
      message: messageId,
      process: agentProcessId,
    });

    if (response.Messages && response.Messages.length > 0) {
      const lastMessage = response.Messages[response.Messages.length - 1];

      // Check for success or error in tags
      const actionTag = lastMessage.Tags?.find((tag: { name: string; value: string; }) => tag.name === "Action");

      if (actionTag?.value === "Withdraw-Success") {
        console.log("Withdrawal successful");
        return;
      } else if (actionTag?.value === "Withdraw-Error") {
        const errorTag = lastMessage.Tags?.find((tag: { name: string; }) => tag.name === "Error");
        throw new Error(errorTag?.value || "Withdrawal failed");
      }
    }

    throw new Error("No valid response received from agent");
  } catch (error) {
    console.error("Error withdrawing from agent:", error);
    throw new Error("Failed to withdraw from agent");
  }
}

/**
 * Execute strategy on agent
 */
export async function executeAgentStrategy(agentProcessId: string): Promise<void> {
  try {
    console.log("Executing strategy on agent:", agentProcessId);

    if (!window.arweaveWallet) {
      throw new Error("Wallet not connected");
    }

    const messageId = await message({
      process: agentProcessId,
      tags: [{ name: "Action", value: "Execute-Strategy" }],
      signer: createDataItemSigner(window.arweaveWallet),
    });

    const response = await result({
      message: messageId,
      process: agentProcessId,
    });

    if (response.Messages && response.Messages.length > 0) {
      const lastMessage = response.Messages[response.Messages.length - 1];

      // Check for success or error in tags
      const actionTag = lastMessage.Tags?.find((tag: { name: string; value: string; }) => tag.name === "Action");

      if (actionTag?.value?.includes("Success") || actionTag?.value?.includes("Queued")) {
        console.log("Strategy execution successful");
        return;
      } else if (actionTag?.value?.includes("Error")) {
        const errorTag = lastMessage.Tags?.find((tag: { name: string; }) => tag.name === "Error");
        throw new Error(errorTag?.value || "Strategy execution failed");
      }
    }

    throw new Error("No valid response received from agent");
  } catch (error) {
    console.error("Error executing agent strategy:", error);
    throw new Error("Failed to execute agent strategy");
  }
}
