import {
  LitElement,
  html,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";
import { sheetsManager } from "./sheets-api-manager.js";
import "./greater-dataforseo-keywords.js";
import "./greater-llm-keywords.js";
import "./greater-search-console.js";

export class GreaterCreateSheet extends LitElement {
  static properties = {
    isLoading: { type: Boolean },
    sheetCreated: { type: Boolean },
    apiReady: { type: Boolean },
    pendingKeywordsMount: { type: Boolean },
    guestName: { type: String },
  };

  constructor() {
    super();
    this.isLoading = false;
    this.sheetCreated = false;
    this.apiReady = false;
    this.pendingKeywordsMount = false;
    this.guestName = "";
    this.initializeSheetsAPI();
  }

  // Override to use light DOM instead of shadow DOM
  createRenderRoot() {
    return this;
  }

  dispatchError(message, error) {
    this.dispatchEvent(
      new CustomEvent("greater-error", {
        bubbles: true,
        composed: true,
        detail: {
          timestamp: new Date().toISOString(),
          component: "greater-create-sheet",
          type: "ERROR",
          message,
          technical: error.message,
          stack: error.stack,
          critical: false,
        },
      }),
    );
  }

  async firstUpdated() {
    console.log("Create Sheet first render complete");
    if (this.pendingKeywordsMount) {
      console.log("Processing pending keywords component mount");
      await this.mountKeywordsComponent();
      this.pendingKeywordsMount = false;
    }
  }

  updated(changedProperties) {
    if (
      changedProperties.has("pendingKeywordsMount") &&
      this.pendingKeywordsMount
    ) {
      console.log("PendingKeywordsMount changed, attempting mount");
      this.mountKeywordsComponent();
    }
  }

  async mountKeywordsComponent() {
    console.log("Attempting to mount greater-dataforseo-keywords component");

    try {
      await this.updateComplete;

      const contentDiv = this.querySelector(".content");
      if (!contentDiv) {
        throw new Error("Content container not found in DOM");
      }

      let fetchKeywords;
      try {
        fetchKeywords = document.createElement("greater-dataforseo-keywords");
        if (!fetchKeywords) {
          throw new Error(
            "Failed to create greater-dataforseo-keywords element",
          );
        }
      } catch (error) {
        throw new Error(`Component creation failed: ${error.message}`);
      }

      if (!customElements.get("greater-dataforseo-keywords")) {
        throw new Error(
          "greater-dataforseo-keywords component is not registered",
        );
      }

      try {
        // Mount DataForSEO keywords component
        contentDiv.appendChild(fetchKeywords);
        console.log(
          "greater-dataforseo-keywords component mounted successfully",
        );

        // Mount LLM Keywords component
        let llmKeywords;
        try {
          llmKeywords = document.createElement("greater-llm-keywords");
          if (!llmKeywords) {
            throw new Error("Failed to create greater-llm-keywords element");
          }
        } catch (error) {
          throw new Error(
            `LLM Keywords component creation failed: ${error.message}`,
          );
        }

        if (!customElements.get("greater-llm-keywords")) {
          throw new Error("greater-llm-keywords component is not registered");
        }

        try {
          contentDiv.appendChild(llmKeywords);
          console.log("greater-llm-keywords component mounted successfully");
        } catch (error) {
          throw new Error(
            `LLM Keywords component mounting failed: ${error.message}`,
          );
        }

        if (!contentDiv.contains(llmKeywords)) {
          throw new Error("LLM Keywords component mount verification failed");
        }

        // Create and mount Search Console component
        let searchConsole;
        try {
          searchConsole = document.createElement("greater-search-console");
          if (!searchConsole) {
            throw new Error("Failed to create greater-search-console element");
          }
        } catch (error) {
          throw new Error(
            `Search Console component creation failed: ${error.message}`,
          );
        }

        if (!customElements.get("greater-search-console")) {
          throw new Error("greater-search-console component is not registered");
        }

        try {
          contentDiv.appendChild(searchConsole);
          console.log("greater-search-console component mounted successfully");
        } catch (error) {
          throw new Error(
            `Search Console component mounting failed: ${error.message}`,
          );
        }

        if (!contentDiv.contains(searchConsole)) {
          throw new Error("Search Console component mount verification failed");
        }
      } catch (error) {
        throw new Error(`Component mounting failed: ${error.message}`);
      }

      if (!contentDiv.contains(fetchKeywords)) {
        throw new Error("DataForSEO component mount verification failed");
      }
    } catch (error) {
      console.error("Keywords component mounting error:", error);
      this.dispatchError(
        "Failed to initialize keywords analysis interface",
        error,
      );
      throw error;
    }
  }

  async initializeSheetsAPI() {
    try {
      this.apiReady = await sheetsManager.waitForReady();
      if (!this.apiReady) {
        console.error("Sheets API initialization failed: API not ready");
        this.dispatchError(
          "Google Sheets API initialization failed",
          new Error("API not ready"),
        );
        return;
      }
      console.log("Sheets API ready");
    } catch (error) {
      console.error("Sheets API initialization failed:", error);
      this.dispatchError("Failed to initialize Sheets API", error);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (!this.apiReady) {
      this.dispatchError(
        "Please wait for API initialization",
        new Error("API not ready"),
      );
      return;
    }

    const guestName = e.target.guestName.value.trim();
    if (!this.validateGuestName(guestName)) {
      return;
    }

    this.isLoading = true;
    try {
      const sheet = await this.createSheet(guestName);
      if (!sheet) {
        throw new Error("Failed to create sheet - no response data");
      }

      this.sheetCreated = true;
      this.sheetId = sheet.spreadsheetId;
      this.sheetUrl = sheet.spreadsheetUrl;
      this.guestName = guestName;

      const sheetData = {
        id: sheet.spreadsheetId,
        name: guestName,
        created: new Date().toISOString(),
      };
      sessionStorage.setItem(
        "greater-current-sheet-id",
        JSON.stringify(sheetData),
      );
      this.dispatchEvent(
        new CustomEvent("greater-sheet-created", {
          bubbles: true,
          composed: true,
          detail: sheetData,
        }),
      );

      this.pendingKeywordsMount = true;
      this.requestUpdate();
    } catch (error) {
      console.error("Sheet creation failed:", error);
      this.dispatchError("Failed to create sheet", error);
    } finally {
      this.isLoading = false;
    }
  }

  validateGuestName(name) {
    if (name.length < 2 || name.length > 50) {
      this.dispatchError(
        "Guest name must be between 2 and 50 characters",
        new Error("Invalid name length"),
      );
      return false;
    }
    if (!/^[a-zA-Z0-9 '-]+$/.test(name)) {
      this.dispatchError(
        "Guest name contains invalid characters",
        new Error("Invalid characters"),
      );
      return false;
    }
    return true;
  }

  async createSheet(guestName) {
    if (!sheetsManager.isInitialized()) {
      throw new Error("Sheets API not initialized");
    }

    const sheetTitle = `${guestName} Lead List & Bookings`;

    try {
      // First, create the base spreadsheet
      const createResponse = await gapi.client.sheets.spreadsheets.create({
        properties: {
          title: sheetTitle,
        },
        sheets: [
          {
            properties: {
              title: "Bookings",
              gridProperties: {
                frozenRowCount: 1,
                rowCount: 1000,
                columnCount: 13,
              },
            },
          },
          {
            properties: {
              title: "Lead Gen",
              gridProperties: {
                frozenRowCount: 1,
                rowCount: 1000,
                columnCount: 5, // Increased from 4 to 5 for the URL column
              },
            },
          },
          {
            properties: {
              title: "Logs",
              gridProperties: {
                frozenRowCount: 1,
                rowCount: 1000,
                columnCount: 2,
              },
            },
          },
        ],
      });

      if (!createResponse.result || !createResponse.result.spreadsheetId) {
        throw new Error("Invalid response from sheet creation");
      }

      const spreadsheetId = createResponse.result.spreadsheetId;
      const sheets = createResponse.result.sheets;

      // Format headers using the actual sheet IDs
      const formatRequests = sheets
        .map((sheet, index) => {
          const columnCount = index === 0 ? 13 : index === 1 ? 5 : 2;

          return [
            // Format header row
            {
              repeatCell: {
                range: {
                  sheetId: sheet.properties.sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: columnCount,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true,
                    },
                    backgroundColor: {
                      red: 0.95,
                      green: 0.95,
                      blue: 0.95,
                    },
                  },
                },
                fields: "userEnteredFormat(textFormat,backgroundColor)",
              },
            },
            // Auto-resize columns
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: sheet.properties.sheetId,
                  dimension: "COLUMNS",
                  startIndex: 0,
                  endIndex: columnCount,
                },
              },
            },
          ];
        })
        .flat(); // Flatten the array since we now have multiple requests per sheet

      // Apply formatting and column resizing
      await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: formatRequests,
        },
      });

      // Update headers with column names
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Bookings!A1:M1",
        valueInputOption: "RAW",
        resource: {
          values: [
            [
              "Confirmation Notes",
              "Name of Podcast",
              "Link to Podcast",
              "Name of Host",
              "Avg Listeners per Episode",
              "Monthly Listeners",
              "Followers Count",
              "Email",
              "Phone Number",
              "Date Booked",
              "Time Booked (CST)",
              "Link to Login to Interview",
              "Notes",
            ],
          ],
        },
      });

      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Lead Gen!A1:E1",
        valueInputOption: "RAW",
        resource: {
          values: [
            ["Categories", "Keywords", "Monthly Searches", "Source", "URL"],
          ],
        },
      });

      await Promise.all([
        gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "Logs!A1:B1",
          valueInputOption: "RAW",
          resource: {
            values: [["Date/Time", "Event"]],
          },
        }),
        gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "Logs!A2:B2",
          valueInputOption: "RAW",
          resource: {
            values: [[new Date().toLocaleString(), "Sheet created"]],
          },
        }),
      ]);

      return createResponse.result;
    } catch (error) {
      console.error("Sheet creation error:", error);
      throw error;
    }
  }

  render() {
    if (!this.apiReady) {
      return html`
        <div class="mt-8 text-slate-600">Initializing Google Sheets API...</div>
      `;
    }

    if (this.sheetCreated) {
      return html`
        <div class="mt-8">
          <a
            href="${this.sheetUrl}"
            target="_blank"
            class="text-blue-600 hover:text-blue-800"
          >
            Open sheet for ${this.guestName}
          </a>
          <div class="content"></div>
        </div>
      `;
    }

    return html`
      <form @submit=${this.handleSubmit} class="mt-8 space-y-6">
        <div>
          <label
            for="guestName"
            class="block text-sm font-medium text-slate-700"
          >
            Please enter a guest name
          </label>
          <input
            type="text"
            id="guestName"
            name="guestName"
            required
            ?disabled=${!this.apiReady}
            class="mt-1 block w-full rounded-md border-slate-300
                                 shadow-sm focus:border-slate-500
                                 focus:ring-slate-500"
          />
        </div>
        <button
          type="submit"
          ?disabled=${this.isLoading || !this.apiReady}
          class="inline-flex justify-center rounded-md border
                             border-transparent bg-slate-900 py-2 px-4 text-sm
                             font-medium text-white shadow-sm hover:bg-slate-800
                             focus:outline-none focus:ring-2 focus:ring-slate-500
                             focus:ring-offset-2 disabled:opacity-50"
        >
          ${this.isLoading ? "Creating sheet..." : "Create Sheet"}
        </button>
      </form>
    `;
  }
}

customElements.define("greater-create-sheet", GreaterCreateSheet);
