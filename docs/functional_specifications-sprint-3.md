# Functional Specifications for Sprint 3

I have a website with the domain greater.agency currently deployed on Cloudflare. I want to build a web application using HTML-standard web components (with the Lit library), HTML with Tailwind CSS (as inline Tailwind classes), and Google OAuth to access a Google API. I don't want to use a dedicated backend server but I am comfortable using Cloudflare Workers (in JavaScript) to provide server-side functionality. The app will be named Greater PitchedBy and the UI will be implemented as a file 'pitchedby.html' in the root directory of greater.agency. A folder '/assets/scripts' will contain all web component files.

We will build on the Functional Specifications for Sprint 1 and Sprint 2, found in the file 'docs/functional_specifications-sprint-1and2.md'.

For this sprint, we will add the following features:
- Using a URL supplied by the user we will obtain a list of keywords from the DataForSEO Keywords For Site endpoint. Documentation for this endpoint can be found in the file 'docs/dataforseo-api-keywords-for-site.md'
- We will connect to the API endpoint using the Cloudflare worker and provide credentials from the Cloudflare Worker Secrets environment variables.

## Implementation Specifications:

1. DataForSEO Authentication:
   - Store API credentials as separate Cloudflare Worker Secrets:
     * DATAFORSEO_LOGIN
     * DATAFORSEO_PASSWORD
   - Worker will handle Base64 encoding of credentials
   - Use Basic Authentication header format

2. API Configuration:
   - Hardcode location_code as 2840 (United States)
   - Hardcode language_code as "en" (English)
   - Limit results to 10 keywords per request
   - Extract only keyword values from response

3. Google Sheet Integration:
   - Write keywords to "Keywords" tab
   - Use only the "Keyword" column, leaving "Type" and "Relevance" empty
   - Add to previous keywords when writing new ones (don't clear previous)
   - Log each API call in the "Logs" tab

4. Error Handling:
   - Use existing greater-error component for display
   - Log all API errors to Google Sheet Logs tab
   - Error log format: [Timestamp] DataForSEO API Error: [Details]
   - Include response status and error message in logs

5. Worker Implementation:
   - New endpoint: /api/keywords-for-site
   - Accept POST requests with URL in request body
   - Handle CORS same as existing endpoints
   - Return only keywords array to client

6. UI/UX:
   - Add input field for target URL
   - Show loading state during API call
   - Display success message with keyword count

This is a proof-of-concept implementation focused on basic functionality rather than scalability. Rate limiting and advanced error handling are not required for this phase.

## Implementation Plan:

### Phase 1: Setup & Infrastructure
1. Add DataForSEO credentials to Cloudflare Worker Secrets
   - DATAFORSEO_LOGIN
   - DATAFORSEO_PASSWORD
2. Modify worker.js to:
   - Add new /api/keywords-for-site endpoint
   - Implement credentials handling with Base64 encoding
   - Add basic error handling structure

### Phase 2: Basic API Integration
1. Create a test-only endpoint to verify:
   - Credentials are working
   - Basic request/response flow
   - Error handling
2. Implement core API call with:
   - Hardcoded US/English parameters
   - Simple URL validation
   - Response parsing for keywords only
   - Basic error mapping

### Phase 3: Google Sheets Integration
1. Add web component 'greater-dataforseo-keywords.js'
   - Method for keyword fetching
   - Update UI for keyword results
   - Implement sheet writing for keywords
2. Update sheet logging to:
   - Track DataForSEO API calls
   - Record keyword count
   - Log any errors

### Phase 4: Error Handling & UI Polish
1. Enhance error handling:
   - Map DataForSEO error codes to user-friendly messages
   - Add detailed logging
   - Implement retry logic if needed
2. Improve UI feedback:
   - Add loading states
   - Show keyword count
   - Display appropriate success/error messages

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
