import { BaseRouter } from "./base-router";

export class JinaReaderRouter extends BaseRouter {
  constructor(env) {
    super(env);
    this.checkRequiredEnvVars();
    this.routes = {
      "/api/jina-reader": this.handleReader.bind(this),
      "/api/jina-reader/status": this.handleStatus.bind(this),
      "/api/jina-reader/test": this.handleTest.bind(this),
    };
  }

  checkRequiredEnvVars() {
    const missingVars = [];

    if (!this.env.JINA_READER_API_KEY) {
      missingVars.push("JINA_READER_API_KEY");
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
    console.log("Checking Jina Reader API status...");
    try {
      const response = await fetch("https://r.jina.ai/https://example.com", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.env.JINA_READER_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Jina Reader API status check failed: ${response.status}`,
        );
      }

      return this.handleSuccess({
        status: "operational",
        api: "jina_reader",
        message: "Jina Reader API is responding normally",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Jina Reader status check failed:", error);
      return this.handleError(error, 503);
    }
  }

  async handleTest(request) {
    const testUrls = [
      "https://theminimalists.com",
      "http://www.meditativestory.com",
      "https://schoolofnewfeministthought.com/podcasts/",
    ];

    const results = [];

    for (const url of testUrls) {
      try {
        console.log(`[Test] Trying URL: ${url}`);
        const response = await this.handleReader({
          json: async () => ({ url }),
        });
        const data = await response.json();
        results.push({
          url,
          success: true,
          contentLength: data.content?.length,
          truncated: data.truncated,
        });
      } catch (error) {
        results.push({
          url,
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

  async handleReader(request) {
    try {
      console.log("[JinaReader] Starting request");
      const { url } = await request.json();

      if (!url) {
        console.error("[JinaReader] Missing URL parameter");
        throw new Error("Missing URL parameter");
      }

      console.log("[JinaReader] Processing URL:", url);

      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        console.error("[JinaReader] Invalid URL:", error);
        throw new Error("Invalid URL format");
      }

      // Construct Jina Reader URL
      const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
      console.log("[JinaReader] Making request to:", jinaUrl);

      // Make request to Jina Reader API
      const response = await fetch(jinaUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.env.JINA_READER_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          "[JinaReader] API error:",
          response.status,
          response.statusText,
        );
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        const errorText = await response.text();
        console.error("[JinaReader] Error response:", errorText);
        throw new Error(
          `Jina Reader API error: ${response.status} - ${errorText}`,
        );
      }

      const content = await response.text();
      console.log("[JinaReader] Content received, length:", content.length);

      if (!content || content.length === 0) {
        console.error("[JinaReader] Empty content received");
        throw new Error("No content received from URL");
      }

      // Check content length and truncate if necessary
      const maxLength = 50000;
      const truncatedContent =
        content.length > maxLength ? content.slice(0, maxLength) : content;

      console.log(
        "[JinaReader] Final content length:",
        truncatedContent.length,
      );

      return this.handleSuccess({
        content: truncatedContent,
        truncated: content.length > maxLength,
        originalLength: content.length,
        url: url,
      });
    } catch (error) {
      console.error("[JinaReader] Request failed:", error);
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
