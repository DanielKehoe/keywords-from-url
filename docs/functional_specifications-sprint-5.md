# Functional Specifications for Sprint 5

Improving the PitchedBy app by using an AI LLM to analyze a web page for keywords.

I have a website with the domain greater.agency currently deployed on Cloudflare. I want to build a web application using HTML-standard web components (with the Lit library), HTML with Tailwind CSS (as inline Tailwind classes), and Google OAuth to access a Google API. I don't want to use a dedicated backend server but I am comfortable using Cloudflare Workers (in JavaScript) to provide server-side functionality. The app will be named PitchedBy and the UI will be implemented as a file 'pitchedby.html' in the root directory of greater.agency. A folder '/assets/scripts' will contain all web component files.

For this sprint, we will add the following features:
- Using a URL supplied by the user we will use the Jina Reader API to convert the URL to LLM-friendly input.
- We will connect to an LLM via an OpenRouter API endpoint using the Cloudflare worker and provide credentials from the Cloudflare Worker Secrets environment variables.
- We will pass the LLM-friendly input to the OpenRouter API and prompt the LLM to extract a list of keywords.

We will copy the existing 'greater-dataforseo-keywords.js' web component to a new file 'greater-llm-keywords.js' and modify it. The component will be used in the 'pitchedby.html' file.

Documentation for the Jina Reader API is found at https://jina.ai/reader/. Documentation for the OpenRouter API is found at https://openrouter.ai/docs/quick-start.

We will build on the Functional Specifications for Sprint 1-4, found in the file 'docs/functional_specifications-sprint-1and2.md',  'docs/functional_specifications-sprint-3.md', and 'docs/functional_specifications-sprint-4.md'.

## Implementation Specifications:

1. Authentication:
   - API credentials are stored as Cloudflare Worker Secrets as 'JINA_READER_API_KEY' and 'OPENROUTER_API_KEY'.

2. Jina Reader API Configuration:
   - Jina Reader API will use the r.jina.ai endpoint.
   - Implement basic retry behavior for 429 responses.
   - We don't need to handle rate limiting with caching for the Jina Reader API.
   - We will check the response and limit the content length of the document to 50000 characters.
   - We will only obtain documents that are freely available without authentication, showing an error if the URL is not accessible.

2. OpenRouter API Configuration:
   - OpenRouter API will give us a choice of LLMs from OpenAI and other providers.
   - Implement basic retry behavior for 429 responses.
   - We don't need to handle rate limiting with caching for the OpenRouter API.
   - We will create a prompt template suitable for keyword extraction
   - The prompt will limit the number of keywords returned to a variable set by the input slider, with a default of 10 and a range 10-100 in steps of 10.
   - The expected format of the keyword response will be JSON
   - The response will contain an only array of keywords without any metadata

4. UI/UX:
   - Duplicate the UI from 'greater-dataforseo-keywords.js' as 'greater-llm-keywords.js' with these changes:
   - Change the Title from "Top Searches from DataForSEO" to "AI Keyword Anaylsis"
   - Leave the the table header "Keywords" and remove "Monthly Searches".
   - We will keep the input slider with a default of 10 and a range 10-100 in steps of 10.
   - There is no data visualization for this phase, only a table of results.
   - Follow existing implementation for URL validation and error handling
   - The loading state message will change, at first "Retrieving Web Page" and then "Analyzing Keywords"

5. Google Sheet Integration:
   - Write results to "Lead Gen" tab when the user clicks the button "Save Keywords to the Lead Gen Tab"
   - Use the "Categories" column for the user-supplied category
   - Use the "Keyword" column for keywords
   - There is no data for the "Monthly Searches" column, it should it be left blank
   - Add to previous keywords when writing new ones (don't clear previous)
   - Log each API call in the "Logs" tab

6. Error Handling:
   - Implement basic retry behavior for 429 responses.
   - Use existing greater-error component for display
   - Log all API errors to Google Sheet Logs tab, including errors when chaining Jina Reader → OpenRouter calls
   - Error log format: [Timestamp] Search Console API Error: [Details]
   - Include response status and error message in logs
   - Display an error if the user is not allowed access to the Google Search Console API.

7. Worker Implementation
   - Add a new library file 'src/workers/lib/jina-reader-router.js' to handle Jina Reader API calls
  - Add a new library file 'src/workers/lib/llm-router.js' to handleOpen AI API calls
   - Add new endpoints
   - Accept POST requests with URL in request body
   - Handle CORS same as existing endpoints

## Implementation Plan:

### Phase 1: Setup & Infrastructure
1. Copy the existing 'greater-dataforseo-keywords.js' web component to a new file 'greater-llm-keywords'
2. Copy the existing 'src/workers/lib/dataforseo-router.js' worker to new files 'src/workers/lib/jina-reader-router.js' and 'src/workers/lib/llm-router.js'.

### Phase 2: API credentials
1. Show how to add necessary API credentials to Cloudflare Worker Secrets for Jina Reader API and OpenRouter API.
2. Modify worker.js to:
   - Add new endpoints
   - Implement credentials handling
   - Add basic error handling structure

### Phase 3: API Integration for Jina Reader API
1. Create a test-only endpoint to verify:
   - Credentials are working
   - Basic request/response flow
   - Error handling
2. Implement core Jina Reader API call with:
   - Basic error mapping
   - Pass a test URL to the Jina Reader API and log the response

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

### Phase 5: API Integration for OpenRouter API
1. Create a test-only endpoint to verify:
   - Credentials are working
   - Basic request/response flow
   - Error handling
2. Implement core API call with:
   - Basic error mapping
   - Pass a Jina Reader document to the API and log the response

### Phase 6: Web Component Integration
1. Update 'greater-llm-keywords.js' to:
   - Pass a URL to the Jina Reader API
   - Receive a document from the Jina Reader API
   - Pass the document to the OpenRouter API
   - Fetch response keywords from the OpenRouter API
   - Update UI for keyword results

### Phase 7: Google Sheets Integration
1. Implement sheet writing for keywords
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
