/* eslint-disable @typescript-eslint/no-explicit-any */
// 1. OpenAI Integration
export const createOpenAIService = (
  apiKey: string,
  model: string = "gpt-4"
) => {
  return {
    sendMessage: async (message: string, conversationHistory?: any[]) => {
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content: "You are a helpful assistant for GrantFox.",
                },
                ...(conversationHistory?.map((msg) => ({
                  role: msg.isUser ? "user" : "assistant",
                  content: msg.text,
                })) || []),
                { role: "user", content: message },
              ],
              max_tokens: 1000,
              temperature: 0.7,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();

        return {
          response: data.choices[0].message.content,
          metadata: {
            tokens: data.usage.total_tokens,
            model: data.model,
            responseTime: Date.now(),
          },
        };
      } catch (error) {
        console.error("OpenAI service error:", error);
        throw error;
      }
    },
  };
};

// 2. Anthropic Claude Integration
export const createClaudeService = (
  apiKey: string,
  model: string = "claude-3-sonnet-20240229"
) => {
  return {
    sendMessage: async (message: string) => {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model,
            max_tokens: 1000,
            messages: [{ role: "user", content: message }],
            system: "You are a helpful assistant for GrantFox.",
          }),
        });

        if (!response.ok) {
          throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();

        return {
          response: data.content[0].text,
          metadata: {
            tokens: data.usage.input_tokens + data.usage.output_tokens,
            model: data.model,
            responseTime: Date.now(),
          },
        };
      } catch (error) {
        console.error("Claude service error:", error);
        throw error;
      }
    },
  };
};

// 3. Custom API Integration
export const createCustomAIService = (apiUrl: string, apiKey?: string) => {
  return {
    sendMessage: async (message: string, conversationHistory?: any[]) => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (apiKey) {
          headers["Authorization"] = `Bearer ${apiKey}`;
        }

        const response = await fetch(apiUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message,
            conversationHistory,
            timestamp: Date.now(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Custom API error: ${response.status}`);
        }

        const data = await response.json();

        return {
          response: data.response,
          metadata: {
            tokens: data.metadata?.tokens || 0,
            model: data.metadata?.model || "custom",
            responseTime: data.metadata?.responseTime || 0,
          },
        };
      } catch (error) {
        console.error("Custom AI service error:", error);
        throw error;
      }
    },
  };
};

// 4. Usage Examples

// Example 1: Using OpenAI
/*
import { createOpenAIService } from './SimpleChatbot.example';

const openAIService = createOpenAIService('your-openai-api-key', 'gpt-4');

// Replace the mockAIService in SimpleChatbot with:
const mockAIService = openAIService;
*/

// Example 2: Using Claude
/*
import { createClaudeService } from './SimpleChatbot.example';

const claudeService = createClaudeService('your-anthropic-api-key', 'claude-3-sonnet-20240229');

// Replace the mockAIService in SimpleChatbot with:
const mockAIService = claudeService;
*/

// Example 3: Using Custom API
/*
import { createCustomAIService } from './SimpleChatbot.example';

const customService = createCustomAIService('https://your-api.com/chat', 'your-api-key');

// Replace the mockAIService in SimpleChatbot with:
const mockAIService = customService;
*/

// Example 4: Environment-based configuration
/*
const getAIService = () => {
  const apiProvider = process.env.REACT_APP_AI_PROVIDER;
  const apiKey = process.env.REACT_APP_AI_API_KEY;
  
  switch (apiProvider) {
    case 'openai':
      return createOpenAIService(apiKey!, 'gpt-4');
    case 'claude':
      return createClaudeService(apiKey!, 'claude-3-sonnet-20240229');
    case 'custom':
      return createCustomAIService(process.env.REACT_APP_AI_API_URL!, apiKey);
    default:
      throw new Error(`Unknown AI provider: ${apiProvider}`);
  }
};

const aiService = getAIService();
*/
