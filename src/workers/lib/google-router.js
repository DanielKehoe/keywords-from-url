import { BaseRouter } from './base-router';

export class GoogleRouter extends BaseRouter {
  constructor(env) {
    super(env);
    this.routes = {
      '/api/config': this.handleConfig.bind(this),
      '/api/sheets/create': this.handleSheetsCreate.bind(this),
      '/api/sheets/update': this.handleSheetsUpdate.bind(this),
    };
  }

  async handleConfig() {
    console.log("Config request received:", {
      clientId: this.env.GOOGLE_CLIENT_ID ? "present" : "missing",
      apiKey: this.env.GOOGLE_API_KEY ? "present" : "missing",
    });

    return this.handleSuccess({
      clientId: this.env.GOOGLE_CLIENT_ID,
    });
  }

  async handleSheetsCreate(request) {
    const { title, headers } = await request.json();

    const response = await fetch(
      "https://sheets.googleapis.com/v4/spreadsheets",
      {
        method: "POST",
        headers: {
          Authorization: request.headers.get("Authorization"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: { title },
          sheets: headers,
        }),
      }
    );

    const result = await response.text();
    return this.handleSuccess(JSON.parse(result));
  }

  async handleSheetsUpdate(request) {
    const { spreadsheetId, range, values } = await request.json();

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: request.headers.get("Authorization"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values }),
      }
    );

    const result = await response.text();
    return this.handleSuccess(JSON.parse(result));
  }

  async route(request, pathname) {
    const handler = this.routes[pathname];
    if (!handler) return null;

    try {
      return await handler(request);
    } catch (error) {
      return this.handleError(error);
    }
  }
}