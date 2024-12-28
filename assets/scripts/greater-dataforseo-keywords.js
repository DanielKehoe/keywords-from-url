import {
  LitElement,
  html,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";
import { saveToLeadGenSheet, validateSheetOperation } from "./sheets-util.js";

export class GreaterDataforseoKeywords extends LitElement {
  static properties = {
    isLoading: { type: Boolean },
    isSaving: { type: Boolean },
    url: { type: String },
    keywords: { type: Array },
    hasResults: { type: Boolean },
    selectedKeywords: { type: Array },
    keywordLimit: { type: Number },
  };

  constructor() {
    super();
    this.isLoading = false;
    this.isSaving = false;
    this.url = "";
    this.keywords = [];
    this.hasResults = false;
    this.selectedKeywords = [];
    this.keywordLimit = 10;
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

    if (this.selectedKeywords?.length === 0) {
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
    this.selectedKeywords = [];
    this.hasResults = false;
    this.url = "";
    this.keywords = [];
  }

  dispatchError(message, error) {
    this.dispatchEvent(
      new CustomEvent("greater-error", {
        bubbles: true,
        composed: true,
        detail: {
          timestamp: new Date().toISOString(),
          component: "greater-dataforseo-keywords",
          type: "ERROR",
          message,
          technical: error.message,
          stack: error.stack,
          critical: false,
        },
      }),
    );
  }

  toggleKeyword(index) {
    const idx = this.selectedKeywords.indexOf(index);
    if (idx === -1) {
      this.selectedKeywords = [...this.selectedKeywords, index];
    } else {
      this.selectedKeywords = this.selectedKeywords.filter((i) => i !== index);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.url = e.target.url.value.trim();
    this.keywordLimit = parseInt(e.target.keywordLimit.value, 10);

    if (!this.validateUrl(this.url)) {
      this.dispatchError(
        "Please enter a valid URL starting with http:// or https://",
        new Error("Invalid URL format"),
      );
      return;
    }

    // Extract domain name without protocol
    try {
      const urlObject = new URL(this.url);
      this.targetDomain = urlObject.hostname;
    } catch (error) {
      this.dispatchError("Failed to parse URL", error);
      return;
    }

    this.isLoading = true;
    try {
      const keywordData = await this.fetchKeywords(this.url);
      const domain = new URL(this.url).hostname;

      // Sort by search volume and get top N keywords
      const topKeywords = keywordData
        .sort((a, b) => b.searchVolume - a.searchVolume)
        .slice(0, this.keywordLimit);

      console.log(
        `Top ${this.keywordLimit} keywords for ${domain}:`,
        topKeywords,
      );

      this.keywords = keywordData;
      this.hasResults = true;
      this.selectedKeywords = []; // Reset selections

      // Log the keyword search to the Logs tab
      const sheetData = sessionStorage.getItem("greater-current-sheet-id");
      if (sheetData) {
        const { id } = JSON.parse(sheetData);
        await gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: id,
          range: "Logs!A:B",
          valueInputOption: "RAW",
          resource: {
            values: [
              [new Date().toLocaleString(), `Searched DataForSEO for keywords`],
            ],
          },
        });
      }
    } catch (error) {
      this.dispatchError("Failed to fetch keywords", error);
      this.hasResults = false;
    } finally {
      this.isLoading = false;
    }
  }

  async handleSaveKeywords(e) {
    e.preventDefault();
    const categoryName = e.target.categoryName.value.trim();

    if (!this.validateSave(categoryName)) return;

    this.isSaving = true;
    try {
      await saveToLeadGenSheet({
        categoryName,
        selectedIndices: this.selectedKeywords,
        items: this.keywords,
        url: this.url,
        source: "DataForSEO",
        mapItemToRow: (kw) => [kw.keyword, kw.searchVolume],
        logMessage: 'Added {count} keywords to category "{category}"',
      });

      // Clear form and reset state
      this.resetForm(e.target);
    } catch (error) {
      this.dispatchError("Failed to save keywords", error);
    } finally {
      this.isSaving = false;
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

  async fetchKeywords(url) {
    const response = await fetch("/api/keywords", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: url,
        location_code: 2840, // US
        language_code: "en", // English
        include_serp_info: false,
        include_subdomains: true,
        ignore_synonyms: true,
        include_clickstream_data: false,
        filters: null,
        order_by: null,
        limit: this.keywordLimit,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();

    // Validate response structure step by step
    if (!data.tasks || !Array.isArray(data.tasks) || data.tasks.length === 0) {
      console.log("No tasks in response:", data);
      return [];
    }

    const task = data.tasks[0];

    // Check for API-level errors
    if (task.status_code !== 20000) {
      throw new Error(task.status_message || "API task error");
    }

    // Check for result structure
    if (
      !task.result ||
      !Array.isArray(task.result) ||
      task.result.length === 0
    ) {
      return [];
    }

    const result = task.result[0];

    // If no items, return empty array
    if (!result.items || !Array.isArray(result.items)) {
      return [];
    }

    // Map the items with safer property access
    return result.items.map((item) => ({
      keyword: item.keyword || "",
      searchVolume: item.keyword_info?.search_volume || 0,
    }));
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
              Top Searches from DataForSEO
            </h3>
          </div>
        </summary>

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
                for="keywordLimit"
                class="block text-sm font-medium text-slate-700"
              >
                Number of keywords to retrieve: ${this.keywordLimit}
              </label>
              <input
                type="range"
                id="keywordLimit"
                name="keywordLimit"
                min="10"
                max="100"
                step="10"
                .value=${this.keywordLimit}
                @input=${(e) =>
                  (this.keywordLimit = parseInt(e.target.value, 10))}
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
              ${this.isLoading ? "Analyzing..." : "Retrieve Keywords"}
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
                          <th class="text-left text-slate-600">Keywords</th>
                          <th class="text-left text-slate-400">
                            Monthly Searches
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        ${this.keywords.length > 0
                          ? this.keywords.map(
                              (kw, index) => html`
                                <tr>
                                  <td class="text-center">
                                    <input
                                      type="checkbox"
                                      ?checked=${this.selectedKeywords.includes(
                                        index,
                                      )}
                                      @change=${() => this.toggleKeyword(index)}
                                      class="rounded border-slate-300 text-slate-900
                                                               focus:ring-slate-500"
                                    />
                                  </td>
                                  <td class="text-sm text-slate-600">
                                    ${kw.keyword}
                                  </td>
                                  <td class="text-sm text-slate-400">
                                    ${kw.searchVolume.toLocaleString()}
                                  </td>
                                </tr>
                              `,
                            )
                          : html`
                              <tr>
                                <td
                                  colspan="3"
                                  class="text-center py-4 text-sm text-slate-500"
                                >
                                  No keywords found
                                </td>
                              </tr>
                            `}
                      </tbody>
                    </table>

                    <form
                      @submit=${this.handleSaveKeywords}
                      class="mt-6 space-y-4"
                    >
                      <div>
                        <label
                          for="categoryName"
                          class="block text-sm font-medium text-slate-700"
                        >
                          Category Name for Keywords
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
                        this.selectedKeywords.length === 0}
                        class="inline-flex justify-center rounded-md border border-transparent
                               bg-slate-900 py-2 px-4 text-sm font-medium text-white shadow-sm
                               hover:bg-slate-800 focus:outline-none focus:ring-2
                               focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        ${this.isSaving
                          ? "Saving..."
                          : "Save Keywords to Lead Gen Tab"}
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

customElements.define("greater-dataforseo-keywords", GreaterDataforseoKeywords);
