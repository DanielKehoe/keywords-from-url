import { BaseRouter } from "./base-router";

export class LLMRouter extends BaseRouter {
  constructor(env) {
    super(env);
    this.checkRequiredEnvVars();
    this.routes = {
      "/api/llm/analyze": this.handleAnalyze.bind(this),
      "/api/llm/status": this.handleStatus.bind(this),
      "/api/llm/test": this.handleTest.bind(this),
      "/api/llm/models": this.handleModels.bind(this),
    };
    this.baseURL = "https://openrouter.ai/api/v1";
  }

  async handleTest(request) {
    const testContents = [
      "This is a test content piece one",
      "This is another test content piece two",
      "This is a third test content piece three",
    ];

    const results = [];

    for (const content of testContents) {
      try {
        console.log(`[Test] Analyzing content length: ${content.length}`);
        const response = await this.handleAnalyze({
          json: async () => ({
            content: content,
            maxKeywords: 10,
          }),
          headers: {
            get: () => "https://greater.agency",
          },
        });
        const data = await response.json();
        results.push({
          contentLength: content.length,
          success: true,
          keywords: data.keywords,
        });
      } catch (error) {
        results.push({
          contentLength: content.length,
          success: false,
          error: error.message,
        });
      }
    }

    return this.handleSuccess({
      results: results,
      timestamp: new Date().toISOString(),
    });
  }

  checkRequiredEnvVars() {
    const missingVars = [];

    if (!this.env.OPENROUTER_API_KEY) {
      missingVars.push("OPENROUTER_API_KEY");
    }

    if (missingVars.length > 0) {
      console.error(
        `Missing required environment variables: ${missingVars.join(", ")}`,
      );
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`,
      );
    }
  }

  async handleStatus() {
    console.log("Checking OpenRouter API status...");
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `OpenRouter API status check failed: ${response.status}`,
        );
      }

      const result = await response.json();

      // Check if we got a list of models back
      if (!Array.isArray(result.data)) {
        throw new Error("Invalid API response format");
      }

      return this.handleSuccess({
        status: "operational",
        api: "openrouter",
        models: result.data.length,
        response_time: new Date().toISOString(),
        message: "OpenRouter API is responding normally",
      });
    } catch (error) {
      console.error("OpenRouter status check failed:", error);
      return this.handleError(error, 503);
    }
  }

  async handleModels(request) {
    try {
      console.log("[LLMRouter] Fetching available models");
      const response = await fetch(`${this.baseURL}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[LLMRouter] Models API error response:", errorText);
        throw new Error(`Failed to fetch models: ${errorText}`);
      }

      const result = await response.json();
      console.log("[LLMRouter] Available models:", result);

      return this.handleSuccess({
        models: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[LLMRouter] Models check failed:", error);
      return this.handleError(error);
    }
  }

  async handleAnalyze(request) {
    try {
      console.log("[LLMRouter] Starting analysis");
      const { content, model, keywordLimit = 10 } = await request.json();
      console.log(
        `[LLMRouter] Received content length: ${content?.length || 0}, keywordLimit: ${keywordLimit}, model: ${model}`,
      );

      if (!content) {
        console.error("[LLMRouter] Missing content parameter");
        throw new Error("Missing content parameter");
      }

      if (!model) {
        console.error("[LLMRouter] Missing model parameter");
        throw new Error("Missing model parameter");
      }

      // Create a system message to instruct the LLM
      const systemMessage = `You are a keyword analysis expert. Analyze the provided content and extract the most relevant keywords.
            Format your response as a JSON array of strings containing exactly ${keywordLimit} keywords. Do not include explanations or other text.
            Keywords should be relevant for SEO and content marketing purposes. Include both broad and specific terms.`;

      console.log("[LLMRouter] Making request to OpenRouter API");

      // Adjust request based on model type
      const requestBody = {
        model: model,
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: content,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
        stream: false,
      };

      // Only add response_format for non-OpenAI models
      if (!model.startsWith("openai/")) {
        requestBody.response_format = { type: "json_object" };
      }

      console.log(
        "[LLMRouter] Request body:",
        JSON.stringify(requestBody, null, 2),
      );

      // Make request to OpenRouter API
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            request.headers.get("origin") || "https://greater.agency",
          "X-Title": "PitchedBy",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[LLMRouter] OpenRouter API error response:", errorText);
        try {
          const error = JSON.parse(errorText);
          const errorMessage =
            error.error?.message ||
            error.error ||
            `OpenRouter API error: ${response.status}`;
          console.error("[LLMRouter] Parsed error:", error);
          throw new Error(errorMessage);
        } catch (parseError) {
          console.error(
            "[LLMRouter] Error parsing error response:",
            parseError,
          );
          throw new Error(
            `OpenRouter API error: ${response.status} - ${errorText}`,
          );
        }
      }

      const result = await response.json();
      console.log(
        "[LLMRouter] Received response from OpenRouter:",
        JSON.stringify(result, null, 2),
      );

      // Extract keywords from the response
      try {
        console.log(
          "[LLMRouter] Parsing LLM response content:",
          result.choices[0].message.content,
        );
        let keywords;
        try {
          keywords = JSON.parse(result.choices[0].message.content);
        } catch (jsonError) {
          // If JSON parsing fails, try to extract array-like content
          console.log(
            "[LLMRouter] JSON parse failed, attempting to parse array-like content",
          );
          const content = result.choices[0].message.content;
          if (content.includes("[") && content.includes("]")) {
            const arrayContent = content.substring(
              content.indexOf("["),
              content.lastIndexOf("]") + 1,
            );
            keywords = JSON.parse(arrayContent);
          } else {
            throw jsonError;
          }
        }

        console.log("[LLMRouter] Parsed keywords:", keywords);

        if (!Array.isArray(keywords)) {
          console.error(
            "[LLMRouter] Invalid response format - not an array:",
            keywords,
          );
          throw new Error("Invalid response format from LLM - not an array");
        }

        // Validate each keyword is a string
        keywords.forEach((keyword, index) => {
          if (typeof keyword !== "string") {
            throw new Error(
              `Invalid keyword at position ${index}: not a string`,
            );
          }
        });

        return this.handleSuccess({
          keywords: keywords,
          model: result.model,
          usage: result.usage,
        });
      } catch (parseError) {
        console.error("[LLMRouter] LLM response parsing error:", parseError);
        console.error(
          "[LLMRouter] Raw LLM response:",
          result.choices[0].message.content,
        );
        throw new Error(`Failed to parse LLM response: ${parseError.message}`);
      }
    } catch (error) {
      console.error("[LLMRouter] Analysis failed:", error);
      return this.handleError(error);
    }
  }

  async route(request, pathname) {
    const handler = this.routes[pathname];
    if (!handler) return null;

    try {
      return await handler(request);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
