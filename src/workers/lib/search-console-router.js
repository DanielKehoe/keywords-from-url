// src/workers/lib/search-console-router.js
import { BaseRouter } from "./base-router";

export class SearchConsoleRouter extends BaseRouter {
  constructor(env) {
    super(env);
    this.routes = {
      "/api/search-console": this.handleQueries.bind(this),
      "/api/search-console/status": this.handleStatus.bind(this),
    };
  }

  createErrorResponse(message, details, status = 500) {
    return new Response(
      JSON.stringify({
        error: message,
        details: details || null,
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

  async handleStatus(request) {
    console.log("[SearchConsoleRouter] Handling status request");
    try {
      if (!this.env.GOOGLE_CLIENT_ID || !this.env.GOOGLE_CLIENT_SECRET) {
        return this.createErrorResponse(
          "Search Console API credentials not configured",
          null,
          503,
        );
      }

      return this.handleSuccess({
        status: "operational",
        api: "search_console",
        message: "Google Search Console API endpoint is configured",
      });
    } catch (error) {
      console.error("[SearchConsoleRouter] Status check failed:", error);
      return this.createErrorResponse(error.message, null, 503);
    }
  }

  async handleQueries(request) {
    console.log("[SearchConsoleRouter] Handling query request");
    try {
      const {
        url,
        startDate,
        endDate,
        dimensions = ["query"],
        rowLimit = 10,
      } = await request.json();

      // URL validation
      if (!url) {
        return this.createErrorResponse("Missing URL parameter", null, 400);
      }

      try {
        new URL(url);
      } catch (e) {
        return this.createErrorResponse("Invalid URL string.", null, 400);
      }

      // Date validation
      if (!startDate || !endDate) {
        return this.createErrorResponse("Missing date parameters", null, 400);
      }

      // Authorization validation
      const authHeader = request.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return this.createErrorResponse(
          "Missing or invalid authorization token",
          null,
          401,
        );
      }
      const token = authHeader.split(" ")[1];

      // Extract base domain for sc-domain format
      const hostname = new URL(url).host;
      const parts = hostname.split(".");
      const baseDomain = parts.slice(-2).join(".");
      const siteUrl = `sc-domain:${baseDomain}`;

      console.log(
        "Fetching from:",
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      );

      const searchAnalyticsResponse = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate,
            endDate,
            dimensions,
            rowLimit,
            dimensionFilterGroups: [
              {
                filters: [
                  {
                    dimension: "page",
                    operator: "equals",
                    expression: url,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!searchAnalyticsResponse.ok) {
        const error = await searchAnalyticsResponse.json();
        const errorMessage = error.error?.message || "Unknown error occurred";
        console.log(
          "Search Console API error:",
          error,
          searchAnalyticsResponse.status,
        );

        // If we got a 403 from Google's API, always return 403
        if (searchAnalyticsResponse.status === 403) {
          return this.createErrorResponse(
            `Search Console API error: ${errorMessage}`,
            "Please verify you have access to this property in Search Console",
            403,
          );
        }

        // Map specific Google API errors to appropriate HTTP status codes
        if (
          errorMessage
            .toLowerCase()
            .includes("user does not have sufficient permissions")
        ) {
          return this.createErrorResponse(
            `Search Console API error: ${errorMessage}`,
            "Please verify you have access to this property in Search Console",
            403,
          );
        }

        if (errorMessage.toLowerCase().includes("not found")) {
          return this.createErrorResponse(
            `Search Console API error: ${errorMessage}`,
            "The requested URL was not found in Search Console",
            404,
          );
        }

        return this.createErrorResponse(
          `Search Console API error: ${errorMessage}`,
          "Error accessing Search Console API",
          400,
        );
      }

      const data = await searchAnalyticsResponse.json();
      return this.handleSuccess({
        rows: data.rows || [],
        totalRows: data.rows?.length || 0,
        requestDetails: {
          url,
          startDate,
          endDate,
          dimensions,
        },
      });
    } catch (error) {
      console.error("[SearchConsoleRouter] Query failed:", error);
      return this.createErrorResponse(
        error.message,
        "Error accessing Search Console API",
        500,
      );
    }
  }

  async route(request, pathname) {
    console.log("[SearchConsoleRouter] Routing request:", pathname);
    const handler = this.routes[pathname];

    if (!handler) {
      console.log("[SearchConsoleRouter] No handler found for:", pathname);
      return null;
    }

    try {
      return await handler(request);
    } catch (error) {
      console.error("[SearchConsoleRouter] Route handling failed:", error);
      return this.createErrorResponse(
        "Internal server error",
        error.message,
        500,
      );
    }
  }
}
