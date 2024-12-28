import {
  LitElement,
  html,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";
import { saveToLeadGenSheet, validateSheetOperation } from "./sheets-util.js";

export class GreaterSearchConsole extends LitElement {
  static properties = {
    isLoading: { type: Boolean },
    isSaving: { type: Boolean },
    url: { type: String },
    queries: { type: Array },
    hasResults: { type: Boolean },
    selectedQueries: { type: Array },
    queryLimit: { type: Number },
  };

  constructor() {
    super();
    this.isLoading = false;
    this.isSaving = false;
    this.url = "";
    this.queries = [];
    this.hasResults = false;
    this.selectedQueries = [];
    this.queryLimit = 10;
  }

  // Override to use light DOM instead of shadow DOM
  createRenderRoot() {
    return this;
  }

  validateSave(categoryName) {
    if (!categoryName) {
      this.dispatchError(
        "Please enter a category name",
        new Error("Missing category name"),
      );
      return false;
    }

    if (this.selectedQueries?.length === 0) {
      this.dispatchError(
        "Please select at least one item",
        new Error("No items selected"),
      );
      return false;
    }
    return true;
  }

  resetForm(form) {
    form.reset();
    this.selectedQueries = [];
    this.hasResults = false;
    this.url = "";
    this.queries = [];
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.url = e.target.url.value.trim();
    this.queryLimit = parseInt(e.target.queryLimit.value, 10);

    if (!this.validateUrl(this.url)) {
      this.dispatchError(
        "Please enter a valid URL starting with http:// or https://",
        new Error("Invalid URL format"),
      );
      return;
    }

    this.isLoading = true;
    try {
      const queryData = await this.fetchQueries(this.url);
      const domain = new URL(this.url).hostname;

      // Sort by impressions and get top N queries
      const topQueries = queryData
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, this.queryLimit);

      console.log(`Top ${this.queryLimit} queries for ${domain}:`, topQueries);

      this.queries = queryData;
      this.hasResults = true;
      this.selectedQueries = []; // Reset selections

      // Log the query search to the Logs tab
      const sheetData = sessionStorage.getItem("greater-current-sheet-id");
      if (sheetData) {
        const { id } = JSON.parse(sheetData);
        await gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: id,
          range: "Logs!A:B",
          valueInputOption: "RAW",
          resource: {
            values: [
              [
                new Date().toLocaleString(),
                `Searched Google Search Console for queries`,
              ],
            ],
          },
        });
      }
    } catch (error) {
      this.dispatchError(error.message, error);
      this.hasResults = false;
    } finally {
      this.isLoading = false;
    }
  }

  async handleSaveQueries(e) {
    e.preventDefault();
    const categoryName = e.target.categoryName.value.trim();

    if (!this.validateSave(categoryName)) return;

    this.isSaving = true;
    try {
      await saveToLeadGenSheet({
        categoryName,
        selectedIndices: this.selectedQueries,
        items: this.queries,
        url: this.url,
        source: "search console",
        mapItemToRow: (query) => [query.query, query.impressions],
        logMessage: 'Added {count} queries to category "{category}"',
      });

      // Clear form and reset state
      this.resetForm(e.target);
    } catch (error) {
      this.dispatchError("Failed to save queries", error);
    } finally {
      this.isSaving = false;
    }
  }

  toggleQuery(index) {
    const idx = this.selectedQueries.indexOf(index);
    if (idx === -1) {
      this.selectedQueries = [...this.selectedQueries, index];
    } else {
      this.selectedQueries = this.selectedQueries.filter((i) => i !== index);
    }
  }

  validateUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  async fetchQueries(url) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const response = await fetch("/api/search-console", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${gapi.client.getToken().access_token}`,
      },
      body: JSON.stringify({
        url: url,
        startDate: oneMonthAgo.toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        dimensions: ["query"],
        rowLimit: this.queryLimit,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      // Check various error message formats
      const errorMessage =
        error.error?.message || error.error || error.details || "";

      // Check if it's a permissions error
      if (
        errorMessage
          .toLowerCase()
          .includes("user does not have sufficient permissions") ||
        response.status === 403
      ) {
        throw new Error(
          "You don't have permission to access this website's data. " +
            "Please ask the website owner to add your email address to their Google Search Console. " +
            "They can do this by going to their Search Console, selecting the website, " +
            "clicking 'Settings' then 'Users and permissions' and adding your email as a user.",
        );
      }
      throw new Error(errorMessage || `API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.rows) {
      throw new Error("No query data available for this URL");
    }

    return data.rows.map((row) => ({
      query: row.keys[0],
      impressions: row.impressions || 0,
    }));
  }
  dispatchError(message, error) {
    this.dispatchEvent(
      new CustomEvent("greater-error", {
        bubbles: true,
        composed: true,
        detail: {
          timestamp: new Date().toISOString(),
          component: "greater-search-console",
          type: "ERROR",
          message,
          technical: error.message,
          stack: error.stack,
          critical: false,
        },
      }),
    );
  }

  render() {
    return html`
      <br />
      <details class="group" ?open=${this.hasResults}>
        <summary class="marker:content-[''] cursor-pointer">
          <div class="flex items-center gap-2">
            <svg
              class="w-4 h-4 transition-transform group-open:rotate-90"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
            <h3 class="inline-block text-lg font-medium text-slate-900">
              Top Queries from Google Search Console
            </h3>
          </div>
        </summary>

        <p class="mt-1 text-sm italic text-slate-600">
          To use this feature, the website owner must add your email to the
          Google Search Console to grant permission to access private data.
        </p>

        <div class="pl-6 mt-4">
          <form @submit=${this.handleSubmit} class="space-y-6">
            <div>
              <label for="url" class="block text-sm font-medium text-slate-700">
                Enter website URL to analyze
              </label>
              <input
                type="url"
                id="url"
                name="url"
                required
                ?disabled=${this.isLoading}
                class="mt-1 block w-full rounded-md border-slate-300 shadow-sm
                       focus:border-slate-500 focus:ring-slate-500"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label
                for="queryLimit"
                class="block text-sm font-medium text-slate-700"
              >
                Number of queries to retrieve: ${this.queryLimit}
              </label>
              <input
                type="range"
                id="queryLimit"
                name="queryLimit"
                min="10"
                max="100"
                step="10"
                .value=${this.queryLimit}
                @input=${(e) =>
                  (this.queryLimit = parseInt(e.target.value, 10))}
                class="mt-1 block w-full"
              />
              <div class="flex justify-between text-xs text-slate-500">
                <span>10</span>
                <span>100</span>
              </div>
            </div>
            <button
              type="submit"
              ?disabled=${this.isLoading}
              class="inline-flex justify-center rounded-md border border-transparent
                     bg-slate-900 py-2 px-4 text-sm font-medium text-white shadow-sm
                     hover:bg-slate-800 focus:outline-none focus:ring-2
                     focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
            >
              ${this.isLoading ? "Analyzing..." : "Retrieve Queries"}
            </button>

            ${this.hasResults
              ? html`
                  <div class="mt-4">
                    <div class="flex items-center gap-3">
                      <a
                        href="${this.url}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-sm text-blue-600 hover:text-blue-800"
                        >${this.url}</a
                      >
                    </div>
                    <table class="mt-2 space-y-2 w-full">
                      <thead>
                        <tr>
                          <th class="w-8"></th>
                          <th class="text-left text-slate-600">Queries</th>
                          <th class="text-left text-slate-400">
                            Monthly Impressions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        ${this.queries.map(
                          (q, index) => html`
                            <tr>
                              <td class="text-center">
                                <input
                                  type="checkbox"
                                  ?checked=${this.selectedQueries.includes(
                                    index,
                                  )}
                                  @change=${() => this.toggleQuery(index)}
                                  class="rounded border-slate-300 text-slate-900
                                         focus:ring-slate-500"
                                />
                              </td>
                              <td class="text-sm text-slate-600">${q.query}</td>
                              <td class="text-sm text-slate-400">
                                ${q.impressions.toLocaleString()}
                              </td>
                            </tr>
                          `,
                        )}
                      </tbody>
                    </table>

                    <form
                      @submit=${this.handleSaveQueries}
                      class="mt-6 space-y-4"
                    >
                      <div>
                        <label
                          for="categoryName"
                          class="block text-sm font-medium text-slate-700"
                        >
                          Category Name for Queries
                        </label>
                        <input
                          type="text"
                          id="categoryName"
                          name="categoryName"
                          required
                          class="mt-1 block w-full rounded-md border-slate-300 shadow-sm
                                 focus:border-slate-500 focus:ring-slate-500"
                          placeholder="Enter category name"
                        />
                      </div>
                      <button
                        type="submit"
                        ?disabled=${this.isSaving ||
                        this.selectedQueries.length === 0}
                        class="inline-flex justify-center rounded-md border border-transparent
                               bg-slate-900 py-2 px-4 text-sm font-medium text-white shadow-sm
                               hover:bg-slate-800 focus:outline-none focus:ring-2
                               focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        ${this.isSaving
                          ? "Saving..."
                          : "Save Queries to Lead Gen Tab"}
                      </button>
                    </form>
                  </div>
                `
              : ""}
          </form>
        </div>
      </details>
    `;
  }
}

customElements.define("greater-search-console", GreaterSearchConsole);
