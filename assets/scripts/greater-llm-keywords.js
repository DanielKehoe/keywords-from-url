import {
  LitElement,
  html,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";
import { saveToLeadGenSheet, validateSheetOperation } from "./sheets-util.js";

export class GreaterLlmKeywords extends LitElement {
  static properties = {
    isLoading: { type: Boolean },
    isSaving: { type: Boolean },
    url: { type: String },
    keywords: { type: Array },
    hasResults: { type: Boolean },
    selectedKeywords: { type: Array },
    keywordLimit: { type: Number },
    selectedModel: { type: String }, // Add new property
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
    this.selectedModel = "anthropic/claude-3.5-sonnet"; // Default model
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
    this.selectedModel = e.target.modelSelect.value;

    if (!this.validateUrl(this.url)) {
      this.dispatchError(
        "Please enter a valid URL starting with http:// or https://",
        new Error("Invalid URL format"),
      );
      return;
    }

    this.isLoading = true;
    try {
      // First phase - get webpage content
      const readerResponse = await fetch("/api/jina-reader", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: this.url,
        }),
      });

      if (!readerResponse.ok) {
        const errorText = await readerResponse.text();
        throw new Error(`Jina Reader API error: ${errorText}`);
      }

      const pageContent = await readerResponse.json();

      // Second phase - analyze with LLM
      const llmResponse = await fetch("/api/llm/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: pageContent.content,
          model: this.selectedModel,
          keywordLimit: this.keywordLimit,
        }),
      });

      if (!llmResponse.ok) {
        const errorText = await llmResponse.text();
        console.error("LLM API error response:", errorText);
        try {
          const error = JSON.parse(errorText);
          throw new Error(
            error.error?.message ||
              error.error ||
              `LLM API error: ${llmResponse.status}`,
          );
        } catch (parseError) {
          throw new Error(`LLM API error: ${errorText}`);
        }
      }

      const keywordData = await llmResponse.json();

      this.keywords = keywordData.keywords;
      this.hasResults = true;
      this.selectedKeywords = [];

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
              [
                new Date().toLocaleString(),
                `Analyzed keywords using ${this.selectedModel}`,
              ],
            ],
          },
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      this.dispatchError(error.message || "Failed to analyze keywords", error);
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
        source: this.selectedModel,
        mapItemToRow: (kw) => [kw.toLowerCase(), 0],
        logMessage:
          'Added {count} AI-analyzed keywords to category "{category}"',
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

  dispatchError(message, error) {
    this.dispatchEvent(
      new CustomEvent("greater-error", {
        bubbles: true,
        composed: true,
        detail: {
          timestamp: new Date().toISOString(),
          component: "greater-llm-keywords",
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
              AI Keyword Analysis
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
            <div>
              <label
                for="modelSelect"
                class="block text-sm font-medium text-slate-700"
              >
                Select AI Model
              </label>
              <select
                id="modelSelect"
                name="modelSelect"
                class="mt-1 block w-full rounded-md border-slate-300 shadow-sm
                                       focus:border-slate-500 focus:ring-slate-500"
                ?disabled=${this.isLoading}
              >
                <option value="anthropic/claude-3.5-sonnet">
                  Claude 3.5 Sonnet
                </option>
                <option value="anthropic/claude-3.5-haiku">
                  Claude 3.5 Haiku
                </option>
                <option value="google/gemini-flash-1.5">
                  Gemini Flash 1.5
                </option>
                <option value="openai/gpt-4-turbo-preview">
                  OpenAI GPT-4 Turbo Preview
                </option>
                <option value="x-ai/grok-2-1212">Grok 2</option>
                <option value="meta-llama/llama-3.2-3b-instruct">
                  Llama 3.2
                </option>
              </select>
            </div>
            <button
              type="submit"
              ?disabled=${this.isLoading}
              class="inline-flex justify-center rounded-md border border-transparent
                       bg-slate-900 py-2 px-4 text-sm font-medium text-white shadow-sm
                       hover:bg-slate-800 focus:outline-none focus:ring-2
                       focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
            >
              ${this.isLoading
                ? this.keywords.length === 0
                  ? "Retrieving Web Page..."
                  : "Analyzing Keywords..."
                : "Analyze Keywords"}
            </button>

            ${this.hasResults ? this.renderResults() : ""}
          </form>
        </div>
      </details>
    `;
  }

  renderResults() {
    return html`
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
            </tr>
          </thead>
          <tbody>
            ${this.keywords.map(
              (kw, index) => html`
                <tr>
                  <td class="text-center">
                    <input
                      type="checkbox"
                      ?checked=${this.selectedKeywords.includes(index)}
                      @change=${() => this.toggleKeyword(index)}
                      class="rounded border-slate-300 text-slate-900
                               focus:ring-slate-500"
                    />
                  </td>
                  <td class="text-sm text-slate-600">${kw}</td>
                </tr>
              `,
            )}
          </tbody>
        </table>

        <form @submit=${this.handleSaveKeywords} class="mt-6 space-y-4">
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
            ?disabled=${this.isSaving || this.selectedKeywords.length === 0}
            class="inline-flex justify-center rounded-md border border-transparent
                     bg-slate-900 py-2 px-4 text-sm font-medium text-white shadow-sm
                     hover:bg-slate-800 focus:outline-none focus:ring-2
                     focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
          >
            ${this.isSaving ? "Saving..." : "Save Keywords to Lead Gen Tab"}
          </button>
        </form>
      </div>
    `;
  }
}

customElements.define("greater-llm-keywords", GreaterLlmKeywords);
