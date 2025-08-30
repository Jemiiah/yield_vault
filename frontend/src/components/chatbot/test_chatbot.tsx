import {
  createDataItemSigner,
  message,
  dryrun,
  result,
} from "@permaweb/aoconnect";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { config } from "../../config/index";

interface ChatResponse {
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

export default function TestChat() {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [currentResponse, setCurrentResponse] = useState<ChatResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [requestReference, setRequestReference] = useState("");

  // Generate unique reference for each request
  const generateReference = () => {
    return `${config.aoProcessId}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  };

  // Send prompt to APUS using the correct handlers from ao_agent.lua
  const sendPrompt = useMutation({
    mutationKey: ["SendInfer"],
    mutationFn: async (promptText: string) => {
      const reference = generateReference();
      setRequestReference(reference);
      setIsLoading(true);
      setCurrentResponse(null);

      console.log("Sending prompt:", promptText);
      console.log("Using reference:", reference);

      const Options = {
        reference: reference,
        max_tokens: 512,
      };

      try {
        console.log("Options: xxxxxxxxxxxxxx", Options);
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
            { name: "X-Options", value: JSON.stringify(Options) },
          ],
          data: promptText, // Send the actual prompt in data field
          signer: createDataItemSigner(window.arweaveWallet),
        });

        console.log("reference sent: xxxxxxxxxxxxxx", reference);
        console.log("Message ID xxxxxxxxxxxxxxxxxxxxx:", messageId);

        const messageResult = await result({
          process: config.aoProcessId,
          message: messageId,
        });

        console.log("Message Result: xxxxxxxxxxxxxx", messageResult);
        console.log(
          "Message Result Messages: xxxxxxxxxxxxxx",
          messageResult.Messages
        );

        // Extract taskRef from the response
        if (messageResult.Messages && messageResult.Messages.length > 0) {
          const responseMessage = messageResult.Messages.find(
            (msg) =>
              msg.Tags &&
              msg.Tags.find(
                (tag: { name: string; value: string }) => tag.name === "Data"
              )
          );

          if (responseMessage) {
            const dataTag = responseMessage.Tags.find(
              (tag: { name: string; value: string }) => tag.name === "Data"
            );
            if (dataTag && dataTag.value) {
              console.log("Response data:", dataTag.value);
              // Extract taskRef from the response
              const taskRefMatch = dataTag.value.match(/taskRef: (.+)/);
              if (taskRefMatch) {
                console.log("TaskRef extracted:", taskRefMatch[1]);
              }
            }
          }
        }

        return { messageId, reference, messageResult };
      } catch (error) {
        console.error("Error in sendPrompt:", error);
        setIsLoading(false);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatResponse"] });

      // Automatically fetch the result after a short delay
      setTimeout(async () => {
        try {
          await getResponse.mutateAsync();
        } catch (error) {
          console.error("Auto-fetch failed:", error);
        }
      }, 4000); // Wait 2 seconds for APUS to process

      // Set up polling to check for result every 3 seconds
      const pollInterval = setInterval(async () => {
        try {
          const result = await getResponse.mutateAsync();
          // If we get a successful result, stop polling
          if (
            result &&
            (result.status === "success" || result.status === "failed")
          ) {
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error("Polling failed:", error);
          clearInterval(pollInterval);
        }
      }, 3000); // Poll every 3 seconds

      // Stop polling after 60 seconds to avoid infinite polling
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 60000);
    },
    onError: (error) => {
      console.error("Error in sendPrompt:", error);
      setIsLoading(false);
    },
  });

  // Get response using dryrun with GetInferResponse action
  const getResponse = useMutation({
    mutationKey: ["GetInferResponse"],
    mutationFn: async () => {
      if (!requestReference) {
        throw new Error("No request reference available");
      }

      console.log("Fetching result for reference:", requestReference);

      try {
        // Use dryrun to fetch the result from the AO process
        const result = await dryrun({
          process: config.aoProcessId,
          data: "",
          tags: [
            { name: "Action", value: "GetInferResponse" },
            { name: "X-Reference", value: requestReference },
          ],
        });

        console.log("Dryrun result: xxxxxxxxxxxxxx", result);

        console.log("", result.Messages[0].Data.result);

        if (result.Messages && result.Messages.length > 0) {
          const responseData = result.Messages[0].Data;
          console.log("result.Messages xxxxxxxxxxxxxx", result.Messages);
          console.log("Response data:", responseData);

          if (responseData === "Task not found") {
            // Task is still processing
            return {
              status: "processing",
              message: "Task is still processing...",
            };
          }

          try {
            const parsedResult = JSON.parse(responseData);
            console.log("Parsed result:", parsedResult);
            return parsedResult;
          } catch (parseError) {
            console.error("Failed to parse JSON result:", parseError);
            return { status: "error", message: "Failed to parse response" };
          }
        } else {
          return { status: "error", message: "No response found" };
        }
      } catch (error) {
        console.error("Failed to fetch result:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.status === "processing") {
        // Task is still processing, we can retry later
        setCurrentResponse({
          prompt: prompt,
          status: "processing",
          reference: requestReference,
          starttime: Math.floor(Date.now() / 1000),
        });
      } else if (data.status === "success" || data.status === "failed") {
        // Task completed
        let aiResult = "";
        let attestation = "";

        // Parse the nested response JSON
        if (data.response) {
          try {
            const responseData = JSON.parse(data.response);
            console.log("Parsed response data:", responseData);

            // Extract AI result
            if (responseData.result) {
              aiResult = responseData.result;
            }

            // Extract attestation
            if (responseData.attestation) {
              attestation = JSON.stringify(responseData.attestation, null, 2);
            }
          } catch (parseError) {
            console.error("Failed to parse response JSON:", parseError);
            aiResult = data.response; // Fallback to raw response
          }
        }

        setCurrentResponse({
          prompt: data.prompt || prompt,
          status: data.status,
          reference: data.reference || requestReference,
          starttime: data.starttime || Math.floor(Date.now() / 1000),
          endtime: data.endtime,
          response: aiResult, // Use parsed AI result
          attestation: attestation, // Add attestation data
          error_code: data.error_code,
          error_message: data.error_message,
        });
        setIsLoading(false);
      }
    },
    onError: (error: unknown) => {
      console.error("Error in getResponse:", error);
      setCurrentResponse({
        prompt: prompt,
        status: "failed",
        reference: requestReference,
        starttime: Math.floor(Date.now() / 1000),
        endtime: Math.floor(Date.now() / 1000),
        error_message: error instanceof Error ? error.message : "Unknown error",
      });
      setIsLoading(false);
    },
  });

  const handleSendPrompt = async () => {
    if (!prompt.trim()) return;

    try {
      await sendPrompt.mutateAsync(prompt);
      setPrompt(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending prompt:", error);
    }
  };

  const handleGetResponse = async () => {
    if (!requestReference) return;

    try {
      await getResponse.mutateAsync();
    } catch (error) {
      console.error("Error getting response:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "1rem",
      }}
    >
      <h2>APUS Chat Attestation Test</h2>

      {/* Input Section */}
      <div style={{ width: "100%", display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendPrompt();
            }
          }}
        />
        <button
          type="button"
          disabled={isLoading || !prompt.trim()}
          onClick={handleSendPrompt}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Reference Display */}
      {requestReference && (
        <div style={{ fontSize: "0.8rem", color: "#666" }}>
          Reference: {requestReference}
        </div>
      )}

      {/* Response Section */}
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <button
            type="button"
            disabled={getResponse.isPending || !requestReference}
            onClick={handleGetResponse}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#28a745",
              color: "white",
              cursor: "pointer",
            }}
          >
            {getResponse.isPending ? "Fetching..." : "Fetch Result"}
          </button>

          {isLoading && (
            <span style={{ color: "#007bff" }}>
              Processing... (Click "Fetch Result" to check status)
            </span>
          )}
        </div>

        {/* Response Display */}
        {currentResponse && (
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "1rem",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h4>Response Status: {currentResponse.status}</h4>

            {currentResponse.prompt && (
              <div style={{ marginBottom: "1rem" }}>
                <strong>Prompt:</strong> {currentResponse.prompt}
              </div>
            )}

            {currentResponse.status === "success" &&
              currentResponse.response && (
                <div style={{ marginBottom: "1rem" }}>
                  <strong>AI Response:</strong>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "1rem",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                      whiteSpace: "pre-wrap",
                      fontFamily: "Arial, sans-serif",
                      lineHeight: "1.5",
                      maxHeight: "400px",
                      overflow: "auto",
                    }}
                  >
                    {currentResponse.response}
                  </div>
                </div>
              )}

            {currentResponse.status === "success" &&
              currentResponse.attestation && (
                <div style={{ marginBottom: "1rem" }}>
                  <strong>Attestation Data:</strong>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "1rem",
                      backgroundColor: "#e8f4fd",
                      borderRadius: "4px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      whiteSpace: "pre-wrap",
                      maxHeight: "300px",
                      overflow: "auto",
                    }}
                  >
                    {currentResponse.attestation}
                  </div>
                </div>
              )}

            {currentResponse.status === "failed" && (
              <div style={{ color: "red", marginBottom: "1rem" }}>
                <strong>Error:</strong>{" "}
                {currentResponse.error_message || "Unknown error"}
                {currentResponse.error_code &&
                  ` (Code: ${currentResponse.error_code})`}
              </div>
            )}

            {currentResponse.starttime && (
              <div style={{ fontSize: "0.8rem", color: "#666" }}>
                Started:{" "}
                {new Date(currentResponse.starttime * 1000).toLocaleString()}
              </div>
            )}

            {currentResponse.endtime && (
              <div style={{ fontSize: "0.8rem", color: "#666" }}>
                Completed:{" "}
                {new Date(currentResponse.endtime * 1000).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
