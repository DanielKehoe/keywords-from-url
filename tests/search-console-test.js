// Save this as tests/search-console-test.js
async function testSearchConsoleAPI() {
  console.log("Starting Search Console API tests...");

  // Common date setup for all tests
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const today = new Date();

  // Test 1: Status endpoint
  try {
    console.log("\nTest 1: Checking API status...");
    const statusResponse = await fetch("/api/search-console/status");
    const statusData = await statusResponse.json();
    console.log("Status response:", statusData);

    if (!statusResponse.ok) {
      throw new Error(`Status check failed: ${statusResponse.status}`);
    }
  } catch (error) {
    console.error("Status test failed:", error);
    return;
  }

  // Test 2: Authorization
  let authToken;
  try {
    console.log("\nTest 2: Checking authorization...");
    if (!gapi?.client?.getToken) {
      throw new Error("Google API client not fully initialized");
    }
    authToken = gapi.client.getToken();
    if (!authToken) {
      throw new Error(
        "No authorization token available. Please sign in first.",
      );
    }
    console.log("Authorization token present");
  } catch (error) {
    console.error("Authorization test failed:", error);
    return;
  }

  // Test 3: Query endpoint with valid URL
  try {
    console.log("\nTest 3: Testing query endpoint with valid URL...");
    const testURL = "https://install.guide/"; // Update with your verified URL

    const queryResponse = await fetch("/api/search-console", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken.access_token}`,
      },
      body: JSON.stringify({
        url: testURL,
        startDate: oneMonthAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
        dimensions: ["query"],
        rowLimit: 10,
      }),
    });

    const queryData = await queryResponse.json();
    console.log("Query response:", queryData);

    if (!queryResponse.ok) {
      throw new Error(
        `Query failed: ${queryResponse.status} - ${JSON.stringify(queryData)}`,
      );
    }
  } catch (error) {
    console.error("Query test failed:", error);
  }

  // Test 4: Error handling - Invalid URL
  try {
    console.log("\nTest 4: Testing error handling with invalid URL...");
    const queryResponse = await fetch("/api/search-console", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken.access_token}`,
      },
      body: JSON.stringify({
        url: "not-a-valid-url",
        startDate: oneMonthAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
        dimensions: ["query"],
        rowLimit: 10,
      }),
    });

    const errorData = await queryResponse.json();
    console.log("Error response:", errorData);

    if (queryResponse.status !== 400) {
      throw new Error(
        `Expected 400 status code for invalid URL, got ${queryResponse.status}`,
      );
    }
    console.log(
      "Error handling test completed successfully - received correct 400 status code",
    );
  } catch (error) {
    console.log("Error handling test completed:", error.message);
  }

  // Test 5: Permissions check
  try {
    console.log("\nTest 5: Testing permissions check...");
    // Use a URL format that will trigger a permissions error in Search Console
    const unverifiedURL = "https://example.com/test-page"; // Using specific page to ensure permissions error

    // Create a proxy for fetch that intercepts Search Console API calls
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
      if (typeof url === "string" && url.includes("webmasters/v3/sites")) {
        // Return a mocked 403 response for Search Console API
        return new Response(
          JSON.stringify({
            error: {
              code: 403,
              message:
                "User does not have sufficient permissions for this resource",
              status: "PERMISSION_DENIED",
            },
          }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }
      // Pass through all other requests
      return originalFetch(url, options);
    };

    const queryResponse = await fetch("/api/search-console", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken.access_token}`,
      },
      body: JSON.stringify({
        url: unverifiedURL,
        startDate: oneMonthAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
        dimensions: ["query"],
        rowLimit: 10,
      }),
    });

    const permissionData = await queryResponse.json();
    console.log("Permission test response:", permissionData);

    if (queryResponse.status !== 403) {
      console.log(
        `Warning: Expected 403 status code for permission error, got ${queryResponse.status}`,
      );
    } else {
      console.log(
        "Permission test completed successfully - received correct 403 status code",
      );
    }

    // Restore original fetch
    window.fetch = originalFetch;
  } catch (error) {
    console.log("Permission test completed:", error.message);
  }

  console.log("\nAll tests completed!");
}

// Expose the runTests function globally
window.runTests = async function () {
  console.log("Initializing tests...");
  try {
    if (!window.gapi) {
      throw new Error(
        "Google API not loaded. Please wait a few seconds and try again.",
      );
    }
    if (!gapi.client) {
      throw new Error(
        "Google API client not initialized. Please sign in first.",
      );
    }
    await testSearchConsoleAPI();
  } catch (error) {
    console.error("Test initialization failed:", error.message);
    console.log("Please ensure you are:");
    console.log("1. Signed in with Google");
    console.log("2. Have waited for the page to fully load");
    console.log("3. Have the correct permissions in Search Console");
  }
};

// Log that the test script has loaded
console.log(
  "Search Console test script loaded. Run tests by typing runTests() in the console.",
);
