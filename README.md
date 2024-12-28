# keywords-from-url

A web application that uses LLMs to analyze a URL for keywords. Built with web components and Google APIs, deployed on Cloudflare.

## Features

- Google OAuth authentication
- Automated Google Sheets creation for lead tracking
- URL content analysis and processing
- Error tracking and display

## Technical Stack

- HTML-standard Web Components using Lit 3.0
- Tailwind CSS for styling
- Google Sheets API
- Cloudflare Workers for authentication and API access

## Prerequisites

1. Google Cloud Project with:
   - OAuth 2.0 Client ID
   - API Key
   - Enabled APIs:
     * Google Sheets API

2. Cloudflare Account with:
   - Workers enabled
   - Domain configured

3. DataForSEO Account

4. Jina Reader Account

5. OpenRouter Account

## Setup

1. Run the Cloudflare `wrangler` utility from the worker folder:
```bash
   cd src/workers/
```

It should pick up the TOML configuration file without errors.

2. Configure Cloudflare Worker Secrets:
   ```bash
   wrangler secret put DATAFORSEO_LOGIN
   wrangler secret put DATAFORSEO_PASSWORD
   wrangler secret put GOOGLE_API_KEY
   wrangler secret put GOOGLE_CLIENT_ID
   wrangler secret put GOOGLE_CLIENT_SECRET
   wrangler secret put JINA_READER_API_KEY
   wrangler secret put OPENROUTER_API_KEY
   ```

3. Deploy Worker:
   ```bash
   wrangler deploy
   ```

4. Test API access
```bash
   curl https://greater.agency/api/config -H "Origin: https://greater.agency"
```

## Development

The application consists of web components in `/assets/scripts/`:

- greater-create-sheet - Google Sheet creation
- greater-dataforseo-keywords - DataForSEO API integration
- greater-errors - Error display and management
- greater-nlp-analyze - URL content analysis (not used)
- greater-pitchedby - Main component handling OAuth
- greater-search-console - Google Search Console API integration
- sheets-api-manager - Google Sheets API management

A Cloudflare worker script manages API calls and OAuth authentication in `/src/workers/`:

1. `worker.js`

This file is referenced in `src/workers/greater-pitchedby/pitchedby/wrangler.toml`.

## Documentation

There's a CHANGELOG as well as documentation in the `docs` directory.

```
.
├── CHANGELOG.md
├── README.md
├── docs
│   ├── apidocs-dataforseo-authentication.md
│   ├── apidocs-dataforseo-keywords-for-site.md
│   ├── apidocs-jina-reader.md
│   ├── apidocs-openrouter.md
│   ├── apidocs-search-console.md
│   ├── deployment.md
│   ├── development-setup.md
│   ├── directory_structure.md
│   ├── engineering-decisions.md
│   ├── functional_specifications-sprint-1and2.md
│   ├── functional_specifications-sprint-3.md
│   ├── functional_specifications-sprint-4.md
│   └── functional_specifications-sprint-5.md
```

## Tests

There is one test file in `/tests/`:
- search-console-test.js

#### CLI tests

You can test the Search Console API endpoints with `curl`.Here's how to test both endpoints:

First, test the status endpoint:

```
$ curl -v https://greater.agency/api/search-console/status
```
The next test requires an OAuth access token:

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Type: `gapi.client.getToken().access_token`
4. Copy the token output and replace `YOUR_ACCESS_TOKEN` below.

Test the queries endpoint (needs OAuth token):

```
# Replace YOUR_ACCESS_TOKEN with the actual token from your browser
$ curl -v -X POST https://greater.agency/api/search-console \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "url": "https://mac.install.guide/",
    "startDate": "2024-02-22",
    "endDate": "2024-03-22",
    "dimensions": ["query"],
    "rowLimit": 10
  }'
```

#### JavaScript console tests

You can run a full suite of tests in the browser JavaScript console.

Make sure the file `pitchedby.html` includes the test script:

```html
.
.
.
  <script type="module" src="/tests/search-console-test.js"></script>
</head>
```

To run the tests:

1. First, ensure the server is running and you can access pitchedby.html
2. Open pitchedby.html in your browser
3. Sign in using the Google OAuth button if you haven't already
4. Open Chrome DevTools (F12 or right-click -> Inspect)
5. Go to the Console tab
6. Type `runTests()` and press Enter

You should see test output.

## Security

- All API calls routed through Cloudflare Worker
- OAuth tokens stored in memory only
- CORS restricted to greater.agency
- HTTPS required
- Content Security Policy implemented

## License

Proprietary software. All rights reserved.
No license granted for use, modification, or distribution.
