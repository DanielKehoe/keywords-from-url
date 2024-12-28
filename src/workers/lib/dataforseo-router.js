import { BaseRouter } from "./base-router";

export class DataForSEORouter extends BaseRouter {
  constructor(env) {
    super(env);
    this.checkRequiredEnvVars();
    this.routes = {
      "/api/keywords": this.handleKeywords.bind(this),
      "/api/dataforseo/status": this.handleStatus.bind(this),
    };
  }

  checkRequiredEnvVars() {
    const missingVars = [];
    if (!this.env.DATAFORSEO_LOGIN) {
      missingVars.push("DATAFORSEO_LOGIN");
    }
    if (!this.env.DATAFORSEO_PASSWORD) {
      missingVars.push("DATAFORSEO_PASSWORD");
    }
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`,
      );
    }
  }

  getAuthHeader() {
    return `Basic ${btoa(`${this.env.DATAFORSEO_LOGIN}:${this.env.DATAFORSEO_PASSWORD}`)}`;
  }

  async handleStatus() {
    console.log("Checking DataForSEO Keywords API status...");
    try {
      const response = await fetch(
        "https://api.dataforseo.com/v3/appendix/status",
        {
          method: "GET",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `DataForSEO API status check failed: ${response.status}`,
        );
      }

      const result = await response.json();

      // Check main response status
      if (result.status_code !== 20000) {
        throw new Error(`DataForSEO API error: ${result.status_message}`);
      }

      // Find the dataforseo_labs API status
      const labsApi = result.tasks[0].result.find(
        (api) => api.api === "dataforseo_labs",
      );
      if (!labsApi) {
        throw new Error("DataForSEO Labs API status not found");
      }

      // Check if live endpoint is available
      const liveEndpoint = labsApi.endpoints?.find(
        (e) => e.endpoint === "live",
      );
      if (!liveEndpoint || liveEndpoint.status !== "ok") {
        throw new Error("DataForSEO Labs live endpoint is not available");
      }

      return this.handleSuccess({
        status: "operational",
        api: "dataforseo_labs",
        endpoint: "live",
        response_time: result.time,
        message: "DataForSEO Keywords API is responding normally",
      });
    } catch (error) {
      console.error("DataForSEO status check failed:", error);
      return this.handleError(error, 503);
    }
  }

  async handleKeywords(request) {
    const postData = await request.json();

    if (
      !postData.target ||
      !postData.location_code ||
      !postData.language_code
    ) {
      throw new Error("Missing required parameters");
    }

    const response = await fetch(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/keywords_for_site/live",
      {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify([postData]),
      },
    );

    if (!response.ok) {
      const errorMessage =
        response.status === 402
          ? "DataForSEO API account needs activation or has insufficient credits"
          : `DataForSEO API error: ${response.status}`;

      // Return a more specific error object
      return this.createErrorResponse(
        errorMessage,
        {
          status: response.status,
          details: response.statusText,
          timestamp: new Date().toISOString(),
        },
        response.status,
      );
    }

    const result = await response.json();

    if (result.status_code !== 20000) {
      return this.createErrorResponse(
        `DataForSEO API error: ${result.status_message}`,
        result,
        400,
      );
    }

    return this.handleSuccess(result);
  }

  createErrorResponse(message, details, status = 500) {
    return new Response(
      JSON.stringify({
        error: message,
        details: details,
        timestamp: new Date().toISOString(),
      }),
      {
        status,
        headers: {
          "Content-Type": "application/json",
          ...this.corsHeaders(),
        },
      },
    );
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
