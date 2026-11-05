/**
 * Parsing for bulk contact imports (paste or CSV).
 *
 * The server is authoritative: it re-validates every row, normalizes routing
 * values, and enforces quotas. This module exists so the operator sees exactly
 * what will be sent before committing, and so obvious mistakes never leave the
 * browser.
 */

export type ImportChannel = "whatsapp" | "telegram" | "instagram" | "x";
export type ImportConsent = "granted" | "revoked" | "";

export interface ImportDefaults {
  defaultChannel: ImportChannel | "";
  defaultConsent: ImportConsent;
  consentNote: string;
}

export interface ParsedImportRow {
  first_name: string;
  last_name: string;
  channel: string;
  routing_value: string;
  consent: ImportConsent;
  consent_note: string;
}

export interface ImportPreviewRow extends ParsedImportRow {
  line: number;
  error?: string;
}

export interface ImportPreview {
  rows: ImportPreviewRow[];
  hasHeader: boolean;
  delimiter: "," | "\t";
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  consent: { granted: number; revoked: number; none: number };
}

const CHANNEL_ALIASES: Record<string, ImportChannel> = {
  whatsapp: "whatsapp",
  wa: "whatsapp",
  whatsapp_business: "whatsapp",
  "whatsapp business": "whatsapp",
  telegram: "telegram",
  tg: "telegram",
  instagram: "instagram",
  ig: "instagram",
  x: "x",
  twitter: "x",
};

const CONSENT_ALIASES: Record<string, ImportConsent> = {
  "": "",
  unknown: "",
  "not recorded": "",
  unrecorded: "",
  none: "",
  granted: "granted",
  opt_in: "granted",
  optin: "granted",
  opted_in: "granted",
  optedin: "granted",
  "opt-in": "granted",
  yes: "granted",
  true: "granted",
  "1": "granted",
  subscribed: "granted",
  active: "granted",
  revoked: "revoked",
  opt_out: "revoked",
  optout: "revoked",
  opted_out: "revoked",
  optedout: "revoked",
  "opt-out": "revoked",
  no: "revoked",
  false: "revoked",
  "0": "revoked",
  unsubscribed: "revoked",
  stopped: "revoked",
};

const HEADER_ALIASES: Record<keyof ParsedImportRow | "name", string[]> = {
  first_name: ["first_name", "firstname", "first", "given_name", "givenname", "given name"],
  last_name: ["last_name", "lastname", "last", "surname", "family_name", "family name"],
  channel: ["channel", "platform", "network"],
  routing_value: [
    "routing_value",
    "routing",
    "phone",
    "phone_number",
    "phonenumber",
    "number",
    "mobile",
    "whatsapp",
    "telegram",
    "handle",
    "username",
    "contact",
    "address",
  ],
  consent: ["consent", "consent_status", "opt_in", "optin", "opt_out", "optout", "subscribed"],
  consent_note: ["note", "consent_note", "evidence", "source_note"],
  name: ["name", "full_name", "fullname", "recipient", "contact_name"],
};

function normalizeHeader(cell: string): string {
  return cell.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Parses quoted fields, escaped quotes, and embedded newlines. */
export function parseDelimited(text: string, delimiter: "," | "\t"): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);

  return rows;
}

function detectDelimiter(firstLine: string): "," | "\t" {
  // Ignore delimiters inside quotes when probing the header line.
  let inQuotes = false;
  let tabs = 0;
  let commas = 0;
  for (let i = 0; i < firstLine.length; i++) {
    const char = firstLine[i];
    if (char === '"') {
      if (inQuotes && firstLine[i + 1] === '"') {
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes) {
      if (char === "\t") tabs++;
      if (char === ",") commas++;
    }
  }
  return tabs > commas ? "\t" : ",";
}

function isHeaderRow(cells: string[]): boolean {
  const known = new Set(Object.values(HEADER_ALIASES).flat());
  return cells.some((cell) => known.has(normalizeHeader(cell)));
}

function mapHeaders(cells: string[]): Partial<Record<keyof ParsedImportRow | "name", number>> {
  const mapping: Partial<Record<keyof ParsedImportRow | "name", number>> = {};
  cells.forEach((cell, index) => {
    const header = normalizeHeader(cell);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(header) && mapping[field as keyof typeof mapping] === undefined) {
        mapping[field as keyof typeof mapping] = index;
      }
    }
  });
  return mapping;
}

export function normalizeChannel(raw: string): ImportChannel | null {
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  return CHANNEL_ALIASES[key] ?? null;
}

export function normalizeConsent(raw: string): ImportConsent | null {
  const key = raw.trim().toLowerCase();
  return CONSENT_ALIASES[key] ?? null;
}

/** Mirrors the server's routing normalization so duplicates are caught early. */
export function normalizeRouting(channel: string, raw: string): string {
  const value = raw.trim();
  if (channel === "whatsapp") {
    const digits = value.replace(/\D/g, "").replace(/^00/, "");
    return digits;
  }
  if (channel === "instagram" || channel === "x") {
    return value.replace(/^@/, "").toLowerCase();
  }
  return value.replace(/^@/, "");
}

function validateRouting(channel: string, routing: string): string | undefined {
  if (!routing) return "Add a phone number or handle";
  if (channel === "whatsapp" && (routing.length < 7 || routing.length > 15)) {
    return "Expected 7–15 digits";
  }
  if ((channel === "telegram" || channel === "instagram" || channel === "x") && routing.length > 255) {
    return "Handle is too long";
  }
  return undefined;
}

/**
 * Builds a preview for the import dialog. Rows are numbered the same way the
 * server numbers them, so an error message points at the line the operator saw.
 */
export function buildImportPreview(text: string, defaults: ImportDefaults): ImportPreview {
  const preview: ImportPreview = {
    rows: [],
    hasHeader: false,
    delimiter: ",",
    total: 0,
    valid: 0,
    invalid: 0,
    duplicates: 0,
    consent: { granted: 0, revoked: 0, none: 0 },
  };

  const trimmed = text.trim();
  if (!trimmed) return preview;

  const firstLine = trimmed.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = detectDelimiter(firstLine);
  preview.delimiter = delimiter;

  const parsed = parseDelimited(trimmed, delimiter);
  if (parsed.length === 0) return preview;

  const header = isHeaderRow(parsed[0]) ? mapHeaders(parsed[0]) : null;
  preview.hasHeader = header !== null;
  const dataRows = header ? parsed.slice(1) : parsed;

  const seen = new Map<string, number>();
  let lineNumber = header ? 1 : 0;

  for (const cells of dataRows) {
    lineNumber++;
    preview.total++;

    let row: ParsedImportRow;
    if (header) {
      const get = (field: keyof typeof header): string => {
        const index = header[field];
        return index === undefined ? "" : (cells[index] ?? "").trim();
      };
      const fullName = get("name");
      let firstName = get("first_name");
      let lastName = get("last_name");
      if (!firstName && fullName) {
        const [first, ...rest] = fullName.split(/\s+/);
        firstName = first ?? "";
        if (!lastName) lastName = rest.join(" ");
      }
      row = {
        first_name: firstName,
        last_name: lastName,
        channel: get("channel"),
        routing_value: get("routing_value"),
        consent: get("consent") as ImportConsent,
        consent_note: get("consent_note"),
      };
    } else if (cells.length === 1) {
      row = {
        first_name: "",
        last_name: "",
        channel: "",
        routing_value: (cells[0] ?? "").trim(),
        consent: "",
        consent_note: "",
      };
    } else {
      // Headerless multi-column files are assumed to be name, phone/handle,
      // consent, note — the order of the paste-a-list hint in the dialog.
      row = {
        first_name: (cells[0] ?? "").trim(),
        last_name: "",
        channel: "",
        routing_value: (cells[1] ?? "").trim(),
        consent: (cells[2] ?? "").trim() as ImportConsent,
        consent_note: (cells[3] ?? "").trim(),
      };
    }

    const channel = normalizeChannel(row.channel) ?? defaults.defaultChannel;
    const consent = normalizeConsent(String(row.consent)) ?? defaults.defaultConsent;
    const routing = normalizeRouting(channel || "", row.routing_value);

    let error: string | undefined;
    if (!row.channel && !defaults.defaultChannel) {
      error = "Choose a default channel or add a channel column";
    } else if (row.channel && !normalizeChannel(row.channel)) {
      error = `Unsupported channel “${row.channel}”`;
    } else if (normalizeConsent(String(row.consent)) === null) {
      error = `Unrecognized consent value “${row.consent}”`;
    } else {
      error = validateRouting(channel || "", routing);
    }

    const duplicateKey = `${channel}|${routing}`;
    if (!error) {
      const firstSeen = seen.get(duplicateKey);
      if (firstSeen !== undefined) {
        preview.duplicates++;
        error = `Duplicate of line ${firstSeen}`;
      } else {
        seen.set(duplicateKey, lineNumber);
      }
    }

    if (error) {
      preview.invalid++;
    } else {
      preview.valid++;
      if (consent === "granted") preview.consent.granted++;
      else if (consent === "revoked") preview.consent.revoked++;
      else preview.consent.none++;
    }

    preview.rows.push({
      first_name: row.first_name,
      last_name: row.last_name,
      channel,
      routing_value: routing,
      consent,
      consent_note: row.consent_note,
      line: lineNumber,
      error,
    });
  }

  return preview;
}

export function importTemplateCsv(): string {
  return [
    "first_name,last_name,channel,routing_value,consent,consent_note",
    'Ada,Okoye,whatsapp,+2348012345678,granted,"Signed up on the October landing page"',
    "Bola,Adamu,telegram,@bola_adamu,revoked,",
    "Chidi,,whatsapp,+2348098765432,,",
  ].join("\r\n");
}
