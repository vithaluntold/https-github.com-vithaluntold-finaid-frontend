import * as XLSX from "xlsx";
import Papa from "papaparse";

export function parseCSVtoJSON(csvText) {
  // Step 1: Split the CSV into rows
  const rows = csvText.trim().split("\n");

  // Step 2: Extract headers
  const headers = rows[0].split(",");

  // Step 3: Parse each row, handling quoted values with commas
  const data = rows.slice(1).map((row) => {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let char of row) {
      if (char === '"') {
        inQuotes = !inQuotes; // Toggle inQuotes status
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Push the last value

    // Create an object for the row using headers
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || "";
      return obj;
    }, {});
  });

  return data;
}

export function extractAccountList(responseText) {
  const accounts = [];

  // Check if the response contains a JSON-like array of strings
  const jsonArrayMatch = responseText.match(/\[\s*(".*?")\s*\]/s);

  if (jsonArrayMatch) {
    // Parse the JSON-like array
    try {
      const jsonArray = JSON.parse(jsonArrayMatch[0]);
      jsonArray.forEach((item) => {
        accounts.push(cleanText(item));
      });
    } catch (e) {
      console.error("Error parsing JSON array:", e);
    }
  } else {
    // Process as a structured/nested list format
    const categoryRegex = /^[0-9]+\.\s+\*\*(.*?)\*\*/gm;
    const accountItemRegex = /^- (.+)$/gm;

    let categoryMatch;
    while ((categoryMatch = categoryRegex.exec(responseText)) !== null) {
      const category = cleanText(categoryMatch[1]);
      accounts.push(category);

      // Extract items within the category
      const categoryText = responseText.slice(categoryMatch.index);
      let itemMatch;
      while ((itemMatch = accountItemRegex.exec(categoryText)) !== null) {
        const accountName = cleanText(itemMatch[1]);
        accounts.push(accountName);
      }
    }
  }

  return accounts;
}

export function extractArrayFromResponse(response) {
  const tableRegex = /\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g;
  const jsonRegex =
    /\{\s*"Account Code":\s*"([^"]+)",\s*"Account Name":\s*"([^"]+)",\s*"Account Category":\s*"([^"]+)",\s*"Account Class":\s*"([^"]+)",\s*"Statement":\s*"([^"]+)"\s*\}/g;
  const customArrayRegex =
    /\[\s*"Account Code":\s*"([^"]+)",\s*"Account Name":\s*"([^"]+)",\s*"Account Category":\s*"([^"]+)",\s*"Account Class":\s*"([^"]+)",\s*"Statement":\s*"([^"]+)"\s*\]/g;

  let accounts = [];

  if (tableRegex.test(response)) {
    // Extract from markdown table format
    const tableMatches = response.match(tableRegex);
    tableMatches.forEach((row) => {
      const columns = row
        .split("|")
        .map((col) => col.trim())
        .filter((col) => col);
      if (columns.length === 5) {
        accounts.push({
          accountCode: columns[0],
          accountName: columns[1],
          accountCategory: columns[2],
          accountClass: columns[3],
          statement: columns[4],
        });
      }
    });
  } else if (jsonRegex.test(response)) {
    // Extract from JSON-like plain text
    let match;
    while ((match = jsonRegex.exec(response)) !== null) {
      accounts.push({
        accountCode: match[1],
        accountName: match[2],
        accountCategory: match[3],
        accountClass: match[4],
        statement: match[5],
      });
    }
  } else if (customArrayRegex.test(response)) {
    // Extract from custom array format
    let match;
    while ((match = customArrayRegex.exec(response)) !== null) {
      accounts.push({
        accountCode: match[1],
        accountName: match[2],
        accountCategory: match[3],
        accountClass: match[4],
        statement: match[5],
      });
    }
  }

  return cleanChartOfAccounts(accounts);
}

export function extractAccountNames(dataArray) {
  return dataArray?.length > 0
    ? dataArray.map((item) => {
        // Look for keys that contain the word 'name' (case-insensitive)
        const accountNameKey = Object.keys(item).find((key) =>
          key.toLowerCase().includes("name")
        );
        // Return the value of the found key, or an empty string if not found
        return accountNameKey ? item[accountNameKey] : "";
      })
    : [];
}

export function convertToCSV(data) {
  // Check if data is valid and non-empty
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error("Data is either invalid or empty");
  }

  // Get headers from the keys of the first object
  const headers = Object.keys(data[0]).join(",");

  // Map each object to a CSV row, joining values with commas
  const rows = data.map((row) => Object.values(row).join(","));

  // Combine headers and rows, and separate with new lines
  const csv = [headers, ...rows].join("\n");

  // Create a Blob from CSV string and give it a name
  const blob = new Blob([csv], { type: "text/csv" });
  const file = new File([blob], "chart_of_accounts.csv", { type: "text/csv" });

  return file;
}

const csvToArray = (csv) => {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim(); // Trim headers and values to avoid whitespace issues
    });
    return obj;
  });
};

// Handle file upload and convert CSV to JSON
export const convertCSVToJson = (event) => {
  return new Promise((resolve, reject) => {
    const file = event.target.files[0];
    if (!file) {
      reject("No file selected");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csv = e.target.result;
      const data = await csvToArray(csv);
      resolve(data); // Return the data array
    };
    reader.onerror = (error) => reject(error); // Handle any file read error
    reader.readAsText(file);
  });
};

export const convertCSVToJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file selected");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csv = e.target.result;
      const data = await csvToArray(csv);
      resolve(data); // Return the data array
    };
    reader.onerror = (error) => reject(error); // Handle any file read error
    reader.readAsText(file);
  });
};

function cleanText(text) {
  return text
    .replace(/\(.*?\)/g, "") // Remove text within parentheses
    .replace(/[";:]/g, "") // Remove specific special characters
    .trim(); // Trim whitespace
}

export function cleanChartOfAccounts(dataArray) {
  // Function to check if the value is considered unwanted (empty, placeholder, or hyphens)
  const isUnwantedValue = (value) => {
    return (
      value === "**Account Code**" ||
      value === "**Account Name**" ||
      value === "**Account Category**" ||
      value === "**Account Class**" ||
      value === "**Statement**" ||
      value === "------------------" ||
      value === "-------------------" ||
      value === "" // you can add more unwanted values here if needed
    );
  };

  // Filter out the unwanted objects
  return dataArray.filter(
    (item) => !Object.values(item).every(isUnwantedValue) // Check if all values are unwanted
  );
}

export async function convertFileToJson(file) {
  const fileExt = file.name.split(".").pop().toLowerCase();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;

      if (fileExt === "csv") {
        Papa.parse(data, {
          header: true,
          complete: (result) => resolve(result.data),
          error: (error) => reject(error),
        });
      } else if (fileExt === "xlsx" || fileExt === "xls") {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        resolve(json);
      } else {
        reject(new Error("Unsupported file type"));
      }
    };

    // Read file as text or binary based on type
    if (fileExt === "csv") {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
}

export function extractJsonData(text) {
  // Step 1: Use a regular expression to find the JSON array in the text
  const jsonArrayMatch = text?.match(/\[.*\]/s);

  // Step 2: Check if the match is found
  if (jsonArrayMatch) {
    try {
      // Step 3: Parse the matched JSON string to an array of objects
      const jsonData = JSON.parse(jsonArrayMatch[0]);
      return jsonData;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  } else {
    console.warn("No JSON array found in the text.");
    return null;
  }
}

export function readFileData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Convert the first sheet of the workbook to JSON
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        resolve(jsonData); // Returns JSON data as an array of objects
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
}

export const sendTransactionsInBatches = async (
  transactions,
  func,
  setLoadingOutput
) => {
  const batchSize = 5;
  let allBatches = [];

  setLoadingOutput((prev) => {
    return { ...prev, current: 0, total: transactions.length };
  });

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const message = {
      role: "user",
      content: JSON.stringify(batch),
    };

    // Ensure that func is awaited properly to get the resolved value
    let output = await func(message, "withoutTrainingData");

    console.log(message, `batch ${i}`, output); // Check resolved output

    // If the output is an array, add it to allBatches
    if (Array.isArray(output)) {
      allBatches.push(...output);
      setLoadingOutput((prev) => {
        return { ...prev, current: allBatches.length };
      });
    } else {
      console.warn("Output is not an array:", output);
    }
  }

  return allBatches;
};

export function parseTransactionsFromResponse(response) {
  try {
    // Find the CSV content by splitting on newlines and cleaning
    const lines = response
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Try to find the header line by looking for common banking terms
    // This makes the function more resilient to different response formats
    const commonBankingTerms = [
      "date",
      "amount",
      "balance",
      "transaction",
      "credit",
      "debit",
      "cr",
      "dr",
    ];
    const headerIndex = lines.findIndex(
      (line) =>
        commonBankingTerms.some((term) => line.toLowerCase().includes(term)) &&
        line.includes(",") // Ensure it's actually CSV format
    );

    if (headerIndex === -1) {
      throw new Error("Could not identify CSV header in response");
    }

    // Find where the CSV data ends (look for narrative text markers or empty lines)
    const endMarkers = ["note:", "summary:", "*", "disclaimer:"];
    let endIndex = lines.findIndex(
      (line, idx) =>
        idx > headerIndex &&
        (endMarkers.some((marker) => line.toLowerCase().startsWith(marker)) ||
          !line.includes(","))
    );
    endIndex = endIndex === -1 ? lines.length : endIndex;

    // Extract CSV lines
    const csvLines = lines.slice(headerIndex, endIndex);

    // Parse headers
    const headers = csvLines[0].split(",").map((header) => header.trim());

    // Function to clean and parse numeric values
    const parseNumeric = (value) => {
      if (!value) return 0;
      // Remove any currency symbols, commas and spaces
      const cleanValue = value.replace(/[₹$,\s]/g, "");
      return parseFloat(cleanValue) || 0;
    };

    // Function to detect if a column might contain numeric values
    const isLikelyNumericColumn = (header, values) => {
      const headerHints = [
        "amount",
        "balance",
        "qty",
        "quantity",
        "price",
        "rate",
      ];
      const isNumericHint = headerHints.some((hint) =>
        header.toLowerCase().includes(hint)
      );

      // Check if most values in this column are numeric-like
      const numericPattern = /^[₹$]?\s*-?\d+[.,]?\d*\s*$/;
      const numericCount = values.filter((v) => numericPattern.test(v)).length;

      return isNumericHint || numericCount / values.length > 0.5;
    };

    // Get all values for each column to analyze patterns
    const columnValues = headers.map((_, colIndex) =>
      csvLines.slice(1).map((line) => line.split(",")[colIndex]?.trim() || "")
    );

    // Parse transactions
    const transactions = csvLines.slice(1).map((line) => {
      const values = line.split(",").map((value) => value.trim());

      return headers.reduce((obj, header, index) => {
        const value = values[index] || "";
        const columnIsNumeric = isLikelyNumericColumn(
          header,
          columnValues[index]
        );

        // Handle value based on detected column type
        if (columnIsNumeric) {
          obj[header] = parseNumeric(value);
        } else if (header.toLowerCase().includes("date")) {
          // Preserve original date format but ensure it's clean
          obj[header] = value.replace(/["']/g, "").trim();
        } else {
          obj[header] = value;
        }

        // Add computed amount if we detect credit/debit indicators
        if (value.toLowerCase() === "cr" || value.toLowerCase() === "dr") {
          // Look for an amount column
          const amountHeader = headers.find((h) =>
            h.toLowerCase().includes("amount")
          );
          if (amountHeader) {
            const amount = parseNumeric(values[headers.indexOf(amountHeader)]);
            obj["computedAmount"] =
              value.toLowerCase() === "cr" ? amount : -amount;
          }
        }

        return obj;
      }, {});
    });

    return transactions;
  } catch (error) {
    console.error("Error parsing transactions:", error);
    return [];
  }
}

// Helper function to test the parser
export function testTransactionParser(response) {
  try {
    const transactions = parseTransactionsFromResponse(response);
    console.log("Parsed Transaction Count:", transactions.length);
    if (transactions.length > 0) {
      console.log("Sample Transaction:", transactions[0]);
      console.log("Available Fields:", Object.keys(transactions[0]));
    }
    return transactions;
  } catch (error) {
    console.error("Parser Test Failed:", error);
    return [];
  }
}

export function extractBalanceSheetData(response) {
  // Find the index where the JSON data starts
  const jsonStartIndex = response.indexOf("[");

  // Extract the JSON data
  const jsonData = response.slice(jsonStartIndex);

  // Parse the JSON data
  const balanceSheetData = JSON.parse(jsonData);

  return balanceSheetData;
}

//latest

export function convertDataToCSVBuffer(data, name) {
  // Create a Blob from CSV string and give it a name
  const blob = new Blob([data], { type: "text/csv" });
  const file = new File([blob], `${name}.csv`, { type: "text/csv" });

  return file;
}

export const csvDataToJson = (csv) => {
  const parsedData = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });
  return parsedData.data;
};

export const csvDataToJsonWithFile = async (file) => {
  const fileExtension = file?.name?.split(".").pop().toLowerCase();

  if (fileExtension === "csv") {
    let convertedData = await parseCsvToCustomFormat(file);
    console.log(convertedData, "converted data csv");
    // Parse CSV file
    const parsedData = Papa.parse(convertedData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });
    return parsedData.data;
  } else if (fileExtension === "xlsx") {
    // Parse XLSX file
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const sheetName = workbook.SheetNames[0]; // Use the first sheet
        let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          defval: "", // Ensure empty cells are returned as empty strings
          raw: true, // Avoid automatic type conversion
        });

        // Trim keys (headers)
        jsonData = jsonData.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key.trim(), value])
          )
        );

        resolve(jsonData);
      };

      reader.onerror = (error) => reject(error);

      // Use readAsArrayBuffer instead of readAsBinaryString
      reader.readAsArrayBuffer(file);
    });
  } else {
    throw new Error("Unsupported file type. Please upload a CSV or XLSX file.");
  }
};

export const parseCsvToCustomFormat = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      resolve(text);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
};
