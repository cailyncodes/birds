/**
 * Parse CSV text into an array of rows (each row is an array of strings).
 * Handles RFC 4180-style quoting, commas, newlines, escaped quotes, etc.
 *
 * Options:
 *   delimiter       - field separator (default: ',')
 *   quote           - quote character (default: '"')
 *   trimFields      - trim whitespace around fields (default: false)
 *   skipEmptyLines  - skip rows where all fields are empty (default: true)
 *   errorOnUnclosedQuote - throw if file ends while inside a quoted field (default: false)
 */
interface ParseOptions {
    delimiter: string;
    quote: string;
    trimFields: boolean;
    skipEmptyLines: boolean;
    errorOnUnclosedQuote: boolean;
}

function parseCSV(text: string, options: Partial<ParseOptions> = {}) {
  const {
    delimiter = ",",
    quote = '"',
    trimFields = false,
    skipEmptyLines = true,
    errorOnUnclosedQuote = false,
  } = options;

  if (typeof text !== "string") {
    throw new TypeError("parseCSV: first argument must be a string");
  }

  // Strip BOM if present
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const rows: unknown[][] = [];
  let row: unknown[] = [];
  let field = "";
  let inQuotes = false;

  const len = text.length;

  const pushField = () => {
    let output = field;
    if (trimFields) {
      output = output.trim();
    }
    row.push(output);
    field = "";
  };

  const pushRowIfNeeded = () => {
    if (!row.length) {
      return;
    }
    if (skipEmptyLines) {
      const allEmpty = row.every(v => v === "");
      if (allEmpty) {
        row = [];
        return;
      }
    }
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < len; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === quote) {
        const next = text[i + 1];
        // Escaped quote -> ""
        if (next === quote) {
          field += quote;
          i++; // skip second quote
        } else {
          inQuotes = false; // closing quote
        }
      } else {
        field += c;
      }
    } else {
      if (c === quote) {
        inQuotes = true;
      } else if (c === delimiter) {
        pushField();
      } else if (c === "\r" || c === "\n") {
        // End of line (handle CRLF as one newline)
        pushField();
        // If CRLF, skip the LF part
        if (c === "\r" && text[i + 1] === "\n") {
          i++;
        }
        pushRowIfNeeded();
      } else {
        field += c;
      }
    }
  }

  // End of text
  if (inQuotes && errorOnUnclosedQuote) {
    throw new Error("Unclosed quoted field at end of CSV input");
  }

  // Push last field / row if there's something left
  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRowIfNeeded();
  }

  return rows;
}

/**
 * Convert CSV text into an array of objects using the first row as headers
 * (unless headers are explicitly provided).
 *
 * Options:
 *   All parseCSV options, plus:
 *   headers       - array of header names to use instead of first row (optional)
 *   useFirstRowAsHeaders - whether to use the first row as headers (default: true if headers not given)
 *   trimHeaders   - trim header names (default: true)
 */
interface ConvertOptions extends ParseOptions {
    headers?: string[];
    useFirstRowAsHeaders: boolean;
    trimHeaders: boolean;
}

export function csvToJson<T>(text: string, options: Partial<ConvertOptions> = {}): T[] {
  const {
    headers: userHeaders,
    useFirstRowAsHeaders,
    trimHeaders = true,
    ...parseOptions
  } = options;

  const rows = parseCSV(text, parseOptions);
  if (!rows.length) return [];

  let headers;
  let dataRows;

  if (Array.isArray(userHeaders) && userHeaders.length > 0) {
    headers = [...userHeaders];
    dataRows = rows;
  } else {
    const shouldUseFirst =
      typeof useFirstRowAsHeaders === "boolean"
        ? useFirstRowAsHeaders
        : true; // default

    if (!shouldUseFirst) {
      // synthesize headers: col1, col2, ...
      const maxLen = Math.max(...rows.map(r => r.length));
      headers = Array.from({ length: maxLen }, (_, i) => `col${i + 1}`);
      dataRows = rows;
    } else {
      headers = rows[0];
      dataRows = rows.slice(1);
    }
  }

  if (trimHeaders) {
    headers = headers.map(h => (typeof h === "string" ? h.trim() : String(h)));
  }

  // Handle duplicate / empty header names by making them unique
  headers = makeUniqueHeaders(headers as string[]);

  return dataRows.map(row => {
    const obj: Record<string, unknown> = {};
    const maxLen = Math.max(headers.length, row.length);
    for (let i = 0; i < maxLen; i++) {
      const key = headers[i] ?? `col${i + 1}`;
      const value = row[i] ?? "";
      obj[key] = value;
    }
    return obj;
  }) as T[];
}

/**
 * Ensure header names are non-empty and unique.
 * Empty headers become "column", then "column_2", "column_3", etc.
 * Duplicate headers get suffixes: "name", "name_2", "name_3", ...
 */
function makeUniqueHeaders(headers: string[]) {
  const counts = new Map();
  return headers.map(h => {
    let base = h || "column";
    if (!counts.has(base)) {
      counts.set(base, 1);
      return base;
    } else {
      const count = counts.get(base) + 1;
      counts.set(base, count);
      return `${base}_${count}`;
    }
  });
}
