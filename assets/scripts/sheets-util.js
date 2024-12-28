/**
 * Gets a sheet's ID by its name from a spreadsheet
 * @param {string} spreadsheetId - The ID of the spreadsheet
 * @param {string} sheetName - The name of the sheet to find
 * @returns {Promise<number>} The sheet ID
 */
export async function getSheetId(spreadsheetId, sheetName) {
  const metadataResponse = await gapi.client.sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties",
  });

  const sheet = metadataResponse.result.sheets.find(
    (sheet) => sheet.properties.title === sheetName,
  );

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  return sheet.properties.sheetId;
}

/**
 * Auto-resizes columns in a sheet
 * @param {string} spreadsheetId - The ID of the spreadsheet
 * @param {number} sheetId - The ID of the specific sheet
 * @param {number} startColumn - Start column index (0-based)
 * @param {number} endColumn - End column index (exclusive)
 * @returns {Promise<void>}
 */
export async function autoResizeColumns(
  spreadsheetId,
  sheetId,
  startColumn,
  endColumn,
) {
  await gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: sheetId,
              dimension: "COLUMNS",
              startIndex: startColumn,
              endIndex: endColumn,
            },
          },
        },
      ],
    },
  });
}

/**
 * Convenience function to auto-resize the Lead Gen sheet columns
 * @param {string} spreadsheetId - The ID of the spreadsheet
 * @returns {Promise<void>}
 */
export async function autoResizeLeadGenColumns(spreadsheetId) {
  try {
    const sheetId = await getSheetId(spreadsheetId, "Lead Gen");
    await autoResizeColumns(spreadsheetId, sheetId, 0, 5); // Lead Gen has 5 columns
  } catch (error) {
    console.error("Failed to auto-resize Lead Gen columns:", error);
    throw error;
  }
}

/**
 * Saves keyword/query data to the Lead Gen sheet
 * @param {Object} options
 * @param {string} options.categoryName - Category name for the keywords
 * @param {Array<number>} options.selectedIndices - Array of selected indices
 * @param {Array<Object>} options.items - Array of items (keywords or queries)
 * @param {string} options.url - Source URL
 * @param {string} options.source - Source identifier (e.g., "DataForSEO", "search console", LLM model name)
 * @param {Function} options.mapItemToRow - Function to map an item to a row array
 * @param {string} options.logMessage - Message format for logging (use {count} and {category} placeholders)
 * @returns {Promise<void>}
 */
export async function saveToLeadGenSheet({
  categoryName,
  selectedIndices,
  items,
  url,
  source,
  mapItemToRow,
  logMessage,
}) {
  const sheetData = sessionStorage.getItem("greater-current-sheet-id");
  if (!sheetData) {
    throw new Error("No active sheet found");
  }

  const { id: spreadsheetId } = JSON.parse(sheetData);

  // Get existing categories
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Lead Gen!A:A",
  });

  const existingCategories = response.result.values || [];
  const existingCategoryRows = existingCategories.map((row) => row[0]);

  // Get the last row number
  const lastRow = existingCategories.length || 1;

  // Prepare data to write
  const rowData = selectedIndices.map((index) => {
    const item = items[index];
    const row = mapItemToRow(item);
    return [categoryName, ...row, source, url];
  });

  // If category exists, append after last instance of category
  // If not, append at the end
  const lastCategoryIndex = existingCategoryRows.lastIndexOf(categoryName);
  const insertRow = lastCategoryIndex > 0 ? lastCategoryIndex + 2 : lastRow + 1;

  // Write the data
  await gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Lead Gen!A${insertRow}`,
    valueInputOption: "RAW",
    resource: {
      values: rowData,
    },
  });

  // Auto-resize columns after saving
  await autoResizeLeadGenColumns(spreadsheetId);

  // Log the action
  await gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Logs!A:B",
    valueInputOption: "RAW",
    resource: {
      values: [
        [
          new Date().toLocaleString(),
          logMessage
            .replace("{count}", rowData.length)
            .replace("{category}", categoryName),
        ],
      ],
    },
  });
}

/**
 * Error checking function for sheet operations
 * @param {string} categoryName - Category name to validate
 * @param {Array} selectedItems - Array of selected items to validate
 * @returns {void}
 * @throws {Error} If validation fails
 */
export function validateSheetOperation(categoryName, selectedItems) {
  if (!categoryName) {
    throw new Error("Category name is required");
  }

  if (!selectedItems || selectedItems.length === 0) {
    throw new Error("At least one item must be selected");
  }
}
