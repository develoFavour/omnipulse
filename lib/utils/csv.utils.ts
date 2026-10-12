/**
 * Reusable utility for client-side streaming CSV export.
 * Formats data with proper RFC 4180 escaping and UTF-8 BOM encoding for Excel compatibility.
 */

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const escapeCell = (cell: string | number | boolean | null | undefined): string => {
    if (cell === null || cell === undefined) return '""';
    const stringValue = String(cell);
    // If the string contains quotes, commas, or newlines, escape quotes by doubling them and enclose in quotes
    if (/[",\n\r]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return `"${stringValue}"`;
  };

  const headerLine = headers.map(escapeCell).join(",");
  const rowLines = rows.map((row) => row.map(escapeCell).join(","));
  const csvContent = [headerLine, ...rowLines].join("\r\n");

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) to ensure Excel displays UTF-8 correctly
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
