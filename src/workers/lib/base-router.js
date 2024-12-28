export class BaseRouter {
  constructor(env) {
    this.env = env;
  }

  // Common CORS headers
  corsHeaders() {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Origin",
      "Access-Control-Max-Age": "86400",
    };
  }

  // Handle CORS preflight
  handleOptions() {
    return new Response(null, {
      headers: this.corsHeaders(),
    });
  }

  // Common error response handler
  handleError(error, status = 500) {
    console.error("API error:", error);

    let errorMessage = error.message || "Internal server error";
    let errorDetails = error.stack || null;

    // If we have a response from an API
    if (error.response) {
      try {
        const errorBody = JSON.parse(error.response);
        errorMessage = errorBody.error?.message || errorMessage;
        errorDetails = errorBody.error?.details || errorDetails;
      } catch (parseError) {
        // If we can't parse the response, use it as is
        errorMessage = error.response;
      }
    }

    return new Response(
      JSON.stringify({
        error: {
          message: errorMessage,
          details: errorDetails,
          timestamp: new Date().toISOString(),
        },
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

  // Common success response handler
  handleSuccess(data) {
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        ...this.corsHeaders(),
      },
    });
  }
}
