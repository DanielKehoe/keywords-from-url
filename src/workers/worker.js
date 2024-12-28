// worker.js
import { GoogleRouter } from "./lib/google-router";
import { DataForSEORouter } from "./lib/dataforseo-router";
import { SearchConsoleRouter } from "./lib/search-console-router";
import { JinaReaderRouter } from "./lib/jina-reader-router";
import { LLMRouter } from "./lib/llm-router";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new BaseRouter(env).handleOptions();
    }

    // Add debug logging
    console.log(`[Worker] Processing request for: ${url.pathname}`);

    // Initialize routers
    const routers = [
      new GoogleRouter(env),
      new DataForSEORouter(env),
      new SearchConsoleRouter(env),
      new JinaReaderRouter(env),
      new LLMRouter(env),
    ];

    // Handle API routes
    if (url.pathname.startsWith("/api/")) {
      // Try each router
      for (const router of routers) {
        console.log(`[Worker] Trying router for path: ${url.pathname}`);
        const response = await router.route(request, url.pathname);
        if (response) {
          console.log(`[Worker] Found handler for path: ${url.pathname}`);
          return response;
        }
      }

      // No router handled the request
      console.log(`[Worker] No handler found for path: ${url.pathname}`);
      console.log(
        `[Worker] Available paths: ${routers.flatMap((r) => Object.keys(r.routes)).join(", ")}`,
      );
      return new Response("API endpoint not found", {
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Handle static files
    try {
      return await env.ASSETS.fetch(request);
    } catch (error) {
      console.error("[Worker] Static file error:", error);
      return new Response("Not Found", { status: 404 });
    }
  },
};
