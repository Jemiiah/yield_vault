import {
  createDataItemSigner,
  message,
  dryrun,
  result,
} from "@permaweb/aoconnect";
import { config } from "../../../config/index";

export interface ChatResponse {
  prompt: string;
  status: "processing" | "success" | "failed";
  reference: string;
  starttime: number;
  endtime?: number;
  response?: string;
  attestation?: string;
  error_code?: string;
  error_message?: string;
}

export interface APUSOptions {
  reference: string;
  max_tokens: number;
}

export class APUSService {
  private static instance: APUSService;

  private constructor() {}

  public static getInstance(): APUSService {
    if (!APUSService.instance) {
      APUSService.instance = new APUSService();
    }
    return APUSService.instance;
  }

  // Generate unique reference for each request
  public generateReference(): string {
    return `${config.aoProcessId}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  // Send prompt to APUS
  public async sendPrompt(
    promptText: string,
    options?: Partial<APUSOptions>
  ): Promise<{ messageId: string; reference: string; messageResult: unknown }> {
    // Check if wallet is available
    if (!window.arweaveWallet) {
      throw new Error(
        "Arweave wallet not connected. Please connect your wallet first."
      );
    }

    const reference = options?.reference || this.generateReference();

    const defaultOptions: APUSOptions = {
      reference: reference,
      max_tokens: 512,
    };

    const finalOptions = { ...defaultOptions, ...options };

    console.log("Sending prompt:", promptText);
    console.log("Using reference:", reference);
    console.log("Options:", finalOptions);

    try {
      // Send the message to the AO process using "Infer" action
      const messageId = await message({
        process: config.aoProcessId,
        tags: [
          {
            name: "Action",
            value: "Infer",
          },
          {
            name: "X-Reference",
            value: reference,
          },
          { name: "X-Options", value: JSON.stringify(finalOptions) },
        ],
        data: promptText, // Send the actual prompt in data field
        signer: createDataItemSigner(window.arweaveWallet),
      });

      console.log("Reference sent:", reference);
      console.log("Message ID:", messageId);

      // Use result() instead of dryrun() for the initial message
      const messageResult = await result({
        process: config.aoProcessId,
        message: messageId,
      });

      console.log("Message Result:", messageResult);

      return { messageId, reference, messageResult };
    } catch (error) {
      console.error("Error in sendPrompt:", error);
      throw error;
    }
  }

  // Get response using dryrun with GetInferResponse action
  public async getResponse(reference: string): Promise<ChatResponse> {
    if (!reference) {
      throw new Error("No request reference available");
    }

    console.log("Fetching result for reference:", reference);

    try {
      // Use dryrun to fetch the result from the AO process
      const result = await dryrun({
        process: config.aoProcessId,
        data: "",
        tags: [
          { name: "Action", value: "GetInferResponse" },
          { name: "X-Reference", value: reference },
        ],
      });

      console.log("Dryrun result:", result);

      if (result.Messages && result.Messages.length > 0) {
        const message = result.Messages[0];
        console.log("Message structure:", message);

        // Handle different possible data structures
        let responseData;
        if (
          message.Data &&
          typeof message.Data === "object" &&
          message.Data.result
        ) {
          responseData = message.Data.result;
        } else if (message.Data && typeof message.Data === "string") {
          responseData = message.Data;
        } else if (message.Data && typeof message.Data === "object") {
          responseData = JSON.stringify(message.Data);
        } else {
          responseData = message.Data;
        }

        console.log("Response data:", responseData);

        if (responseData === "Task not found" || responseData === undefined) {
          // Task is still processing
          return {
            prompt: "",
            status: "processing",
            reference: reference,
            starttime: Math.floor(Date.now() / 1000),
          };
        }

        try {
          // If responseData is already an object, extract just the result
          if (typeof responseData === "object") {
            console.log("Response is already an object:", responseData);
            return {
              prompt: responseData.prompt || "",
              status: responseData.status || "success",
              reference: reference,
              starttime: Math.floor(Date.now() / 1000),
              endtime: Math.floor(Date.now() / 1000),
              response:
                // Extract just the text content, not the full object
                typeof responseData.result === "string"
                  ? responseData.result
                  : typeof responseData.response === "string"
                  ? responseData.response
                  : typeof responseData.error_message === "string"
                  ? responseData.error_message
                  : typeof responseData.result === "object" &&
                    responseData.result.text
                  ? responseData.result.text
                  : typeof responseData.response === "object" &&
                    responseData.response.text
                  ? responseData.response.text
                  : typeof responseData.result === "object" &&
                    responseData.result.content
                  ? responseData.result.content
                  : typeof responseData.response === "object" &&
                    responseData.response.content
                  ? responseData.response.content
                  : "No AI response found",
              attestation: responseData.attestation
                ? JSON.stringify(responseData.attestation)
                : undefined,
            };
          }

          // If it's a string, try to parse it and extract just the result
          if (typeof responseData === "string") {
            const parsedResult = JSON.parse(responseData);
            console.log("Parsed result:", parsedResult);
            return {
              prompt: parsedResult.prompt || "",
              status: parsedResult.status || "success",
              reference: reference,
              starttime: Math.floor(Date.now() / 1000),
              endtime: Math.floor(Date.now() / 1000),
              response:
                // Extract just the text content, not the full object
                (() => {
                  // First check if response is a JSON string that needs parsing
                  if (typeof parsedResult.response === "string") {
                    try {
                      const responseObj = JSON.parse(parsedResult.response);
                      if (
                        responseObj.result &&
                        typeof responseObj.result === "string"
                      ) {
                        return responseObj.result;
                      }
                    } catch {
                      // If parsing fails, treat as plain string
                      return parsedResult.response;
                    }
                  }

                  // Fallback to other fields
                  return typeof parsedResult.result === "string"
                    ? parsedResult.result
                    : typeof parsedResult.response === "string"
                    ? parsedResult.response
                    : typeof parsedResult.error_message === "string"
                    ? parsedResult.error_message
                    : typeof parsedResult.result === "object" &&
                      parsedResult.result.text
                    ? parsedResult.result.text
                    : typeof parsedResult.response === "object" &&
                      parsedResult.response.text
                    ? parsedResult.response.text
                    : typeof parsedResult.result === "object" &&
                      parsedResult.result.content
                    ? parsedResult.result.content
                    : typeof parsedResult.response === "object" &&
                      parsedResult.response.content
                    ? parsedResult.response.content
                    : "No AI response found";
                })(),
              attestation: parsedResult.attestation
                ? JSON.stringify(parsedResult.attestation)
                : undefined,
            };
          }

          // Fallback
          return {
            prompt: "",
            status: "failed",
            reference: reference,
            starttime: Math.floor(Date.now() / 1000),
            error_message: "Unexpected response format",
          };
        } catch (parseError) {
          console.error("Failed to parse JSON result:", parseError);
          return {
            prompt: "",
            status: "failed",
            reference: reference,
            starttime: Math.floor(Date.now() / 1000),
            error_message: "Failed to parse response",
          };
        }
      } else {
        return {
          prompt: "",
          status: "failed",
          reference: reference,
          starttime: Math.floor(Date.now() / 1000),
          error_message: "No response found",
        };
      }
    } catch (error) {
      console.error("Failed to fetch result:", error);
      throw error;
    }
  }

  // Poll for response with timeout and exponential backoff
  public async pollForResponse(
    reference: string,
    maxAttempts: number = 20,
    interval: number = 3000
  ): Promise<ChatResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.getResponse(reference);

        if (response.status === "success" || response.status === "failed") {
          return response;
        }

        // Wait before next attempt
        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, interval));
        }
      } catch (error) {
        console.error(`Poll attempt ${attempt + 1} failed:`, error);

        // If it's a network error, wait longer before retrying
        if (
          error instanceof Error &&
          error.message.includes("Failed to fetch")
        ) {
          console.log(`Network error detected, waiting longer before retry...`);
          if (attempt < maxAttempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, interval * 2));
          }
        }

        if (attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }

    throw new Error(
      "Polling timeout - response not received within expected time"
    );
  }
}

export const apusService = APUSService.getInstance();
