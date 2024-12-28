# Functional Specifications for Sprint 4

Improving the PitchedBy app with additional keyword data sources.

I have a website with the domain greater.agency currently deployed on Cloudflare. I want to build a web application using HTML-standard web components (with the Lit library), HTML with Tailwind CSS (as inline Tailwind classes), and Google OAuth to access a Google API. I don't want to use a dedicated backend server but I am comfortable using Cloudflare Workers (in JavaScript) to provide server-side functionality. The app will be named PitchedBy and the UI will be implemented as a file 'pitchedby.html' in the root directory of greater.agency. A folder '/assets/scripts' will contain all web component files.

For this sprint, we will add the following features:
- Using a URL supplied by the user we will obtain a list of search queries from the Google Search Console API.
- We will connect to the API endpoint using the Cloudflare worker and provide credentials from the Cloudflare Worker Secrets environment variables.

We will copy the existing 'greater-dataforseo-keywords.js' web component to a new file 'greater-search-console.js' and modify it to fetch queries from the Google Search Console API. The component will be used in the 'pitchedby.html' file.

Documentation for the Google Search Console API is found at https://developers.google.com/webmaster-tools.

We will build on the Functional Specifications for Sprint 1-3, found in the file 'docs/functional_specifications-sprint-1and2.md' and 'docs/functional_specifications-sprint-3.md'.

## Implementation Specifications:

1. Google Search Console Authentication:
   - API credentials are stored as Cloudflare Worker Secrets.
   - Only verified owners and users who have been granted access to a site in Google Search Console can query its data via the API.
   - Access is controlled through the Google Search Console UI, where site owners can add or remove users.
   - The app must request the appropriate OAuth scope: https://www.googleapis.com/auth/webmasters.readonly (read-only access).
   - The API is private to the site’s owners and authorized users. Unauthorized users cannot access site data, ensuring confidentiality.
   - The API enforces rate limits to prevent abuse. This is a proof-of-concept implementation focused on basic functionality rather than scalability. Rate limiting and advanced error handling are not required for this phase.

2. API Configuration:
   - set start date and end date for one month prior to the current date
   - set "dimensions" to "query"
   - set "filters" for "dimension: page" and pass the URL supplied by the user
   - Limit number of results ("rowLimit") based on the input value of the slider
   - The API will return the top queries along with their clicks, impressions, CTR, and position. Extract only queries with impressions from the response.
   - We won't persist any results and each query will be fetched on demand without any caching of results.
   - There is no need to specify a minimum impression threshold for queries.
   - Impelment basic retry behavior for 429 responses.

3. UI/UX:
   - Duplicate the UI from 'greater-dataforseo-keywords.js' as 'greater-search-console.js' with these changes:
   - Change the Title from "Top Searches from DataForSEO" to "Top Queries from Google Search Console"
   - Change the table headers from "Keywords" to "Queries" and "Monthly Searches" to "Monthly Impressions"
   - There is no data visualization for this phase, only a table of results.
   - Follow existing implementation for URL validation and error handling.

4. Google Sheet Integration:
   - Write results to "Lead Gen" tab when the user clicks the button "Save Keywords to the Lead Gen Tab"
   - Sort by impressions in descending order.
   - Use the "Categories" column for the user-supplied category
   - Use the "Keyword" column for queries
   - Use the "Monthly Searches" column for "Impressions"
   - Add to previous keywords when writing new ones (don't clear previous)
   - Log each API call in the "Logs" tab

5. Error Handling:
   - Use existing greater-error component for display
   - Log all API errors to Google Sheet Logs tab
   - Error log format: [Timestamp] Search Console API Error: [Details]
   - Include response status and error message in logs
   - Display an error if the user is not allowed access to the Google Search Console API.
   - Need specific handling for common scenarios:
    - URL not found in Search Console
    - No data available for specified date range
    - User doesn't have sufficient permissions
    - Zero queries returned

6. Worker Implementation
   - Add a new library file 'src/workers/lib/search-console-router.js' to handle Google Search Console API calls
   - New endpoint: /api/search-console
   - Accept POST requests with URL in request body
   - Handle CORS same as existing endpoints
   - Implement Google Search Console API call

## Implementation Plan:

### Phase 1: Setup & Infrastructure
1. Copy the existing 'greater-dataforseo-keywords.js' web component to a new file 'greater-search-console.js'
2. Copy the existing 'src/workers/lib/dataforseo-router.js' worker to a new file 'src/workers/lib/search-console-router.js'

### Phase 2: Setup & Infrastructure
1. Check if we have necessary API credentials in existing Cloudflare Worker Secrets
2. Modify worker.js to:
   - Add new /api/search-console endpoint
   - Implement credentials handling
   - Add basic error handling structure

### Phase 3: Basic API Integration
1. Create a test-only endpoint to verify:
   - Credentials are working
   - Basic request/response flow
   - Error handling
2. Implement core API call with:
   - Basic error mapping

### Phase 4: Error Handling & UI Changes
1. Enhance error handling:
   - Map API error codes to user-friendly messages
   - Add detailed logging
   - Implement retry logic if needed
2. Change UI elements:
   - Update component title
   - Modify table headers
3. Improve UI feedback:
   - Add loading states
   - Show result count
   - Display appropriate success/error messages

### Phase 5: Google Sheets Integration
1. Add web component 'greater-search-console.js'
   - Method for keyword fetching
   - Update UI for keyword results
   - Implement sheet writing for keywords
2. Update sheet logging to:
   - Track API calls
   - Record keyword count
   - Log any errors

## Testing Requirements:
1. Phase 1:
   - Verify secrets are accessible
   - Test CORS handling
   - Check auth header formation

2. Phase 2:
   - Test with known good URLs
   - Test with invalid URLs
   - Verify response parsing
   - Check error scenarios

3. Phase 3:
   - Test sheet writing
   - Verify append behavior
   - Check log entries
   - Test with various URL scenarios

4. Phase 4:
   - Test all error scenarios
   - Verify user feedback
   - Check mobile responsiveness
   - Test end-to-end flow
