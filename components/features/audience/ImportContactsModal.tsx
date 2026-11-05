"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPaste,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  buildImportPreview,
  importTemplateCsv,
  type ImportConsent,
} from "@/lib/utils/contact-import.utils";
import {
  contactService,
  type ContactImportSummary,
} from "@/lib/services/contact.service";
import { cn } from "@/lib/utils";

interface ImportContactsModalProps {
  onClose: () => void;
  onImported: (summary: ContactImportSummary) => void;
}

type Mode = "paste" | "upload";
type DefaultChannel = "" | "whatsapp" | "telegram";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

const CONSENT_LABELS: Record<ImportConsent, string> = {
  "": "No consent recorded",
  granted: "Opted in",
  revoked: "Opted out",
};

export function ImportContactsModal({ onClose, onImported }: ImportContactsModalProps) {
  const [mode, setMode] = useState<Mode>("paste");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [defaultChannel, setDefaultChannel] = useState<DefaultChannel>("whatsapp");
  const [defaultConsent, setDefaultConsent] = useState<ImportConsent>("");
  const [consentNote, setConsentNote] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContactImportSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const preview = useMemo(
    () => buildImportPreview(text, { defaultChannel, defaultConsent, consentNote }),
    [text, defaultChannel, defaultConsent, consentNote]
  );

  const visibleRows = preview.rows.slice(0, 8);
  const invalidRows = preview.rows.filter((row) => row.error).slice(0, 5);

  const readFile = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      setError("That file is larger than 2 MB. Split the list and import it in batches.");
      return;
    }
    try {
      const content = await file.text();
      setText(content);
      setFileName(file.name);
      setMode("upload");
      setError(null);
    } catch {
      setError("We could not read that file. Try exporting it as CSV and uploading again.");
    }
  };

  const handleSubmit = async () => {
    if (preview.valid === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const rows = preview.rows
      .filter((row) => !row.error)
      .map((row) => ({
        first_name: row.first_name,
        last_name: row.last_name,
        channel: row.channel,
        routing_value: row.routing_value,
        consent: row.consent,
        consent_note: row.consent_note,
      }));

    try {
      const summary = await contactService.importContacts({
        default_channel: defaultChannel || undefined,
        default_consent: defaultConsent,
        consent_note: consentNote.trim() || undefined,
        rows,
      });
      setResult(summary);
      onImported(summary);
      toast.success(
        summary.created > 0
          ? `Imported ${summary.created} new recipient${summary.created === 1 ? "" : "s"}`
          : "Import completed",
        {
          description:
            summary.existing > 0
              ? `${summary.existing} recipient${summary.existing === 1 ? " was" : "s were"} already in this workspace.`
              : undefined,
        }
      );
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } }; message?: string };
      const message =
        apiError.response?.data?.error ||
        apiError.message ||
        "The import could not be completed. Try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob(["\uFEFF" + importTemplateCsv()], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "messagerail-contact-import-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-contacts-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <h2 id="import-contacts-title" className="text-lg font-extrabold text-gray-900">
              {result ? "Import complete" : "Import contacts"}
            </h2>
            <p className="mt-0.5 text-xs font-medium text-gray-500">
              {result
                ? "Reconcile what was stored against the file you imported."
                : "Paste a list or upload a CSV. Consent is recorded per recipient — only mark people who agreed to hear from this workspace."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100"
            aria-label="Close import dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {result ? (
            <ImportResult summary={result} skippedLocally={preview.invalid} />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode("paste")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors",
                    mode === "paste"
                      ? "bg-[#163300] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <ClipboardPaste className="h-4 w-4" />
                  Paste list
                </button>
                <button
                  type="button"
                  onClick={() => setMode("upload")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors",
                    mode === "upload"
                      ? "bg-[#163300] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Upload CSV
                </button>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="ml-auto flex items-center gap-1.5 text-xs font-bold text-[#163300] hover:underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  Template
                </button>
              </div>

              {mode === "paste" ? (
                <div>
                  <textarea
                    value={text}
                    onChange={(event) => {
                      setText(event.target.value);
                      setFileName(null);
                    }}
                    rows={7}
                    spellCheck={false}
                    placeholder={"Ada Okoye, +234 801 234 5678, granted\nBola Adamu, @bola_adamu, revoked\nChidi, 2348098765432"}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-xs text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#9fe870] focus:bg-white focus:ring-2 focus:ring-[#9fe870]/30"
                  />
                  <p className="mt-1.5 text-[11px] font-medium text-gray-500">
                    One recipient per line: name, phone or handle, consent. Paste directly from a
                    spreadsheet or use a header row with{" "}
                    <span className="font-mono text-[10px]">first_name, last_name, channel,
                    routing_value, consent, consent_note</span>.
                  </p>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void readFile(file);
                      event.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDragging(false);
                      const file = event.dataTransfer.files?.[0];
                      if (file) void readFile(file);
                    }}
                    className={cn(
                      "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
                      isDragging
                        ? "border-[#9fe870] bg-[#e2f6d5]/40"
                        : "border-gray-200 bg-gray-50 hover:border-[#9fe870]/70 hover:bg-[#f8faf7]"
                    )}
                  >
                    <Upload className="h-5 w-5 text-[#163300]" />
                    <span className="text-xs font-bold text-gray-700">
                      {fileName ? fileName : "Choose a CSV file or drop it here"}
                    </span>
                    <span className="text-[11px] font-medium text-gray-500">
                      Comma or tab separated, up to 2 MB and 1,000 rows.
                    </span>
                  </button>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Default channel
                  </span>
                  <select
                    value={defaultChannel}
                    onChange={(event) => setDefaultChannel(event.target.value as DefaultChannel)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-[#9fe870] focus:ring-2 focus:ring-[#9fe870]/30"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                    <option value="">Only use the channel column</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Default consent
                  </span>
                  <select
                    value={defaultConsent}
                    onChange={(event) => setDefaultConsent(event.target.value as ImportConsent)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-[#9fe870] focus:ring-2 focus:ring-[#9fe870]/30"
                  >
                    <option value="">No consent recorded</option>
                    <option value="granted">Opted in</option>
                    <option value="revoked">Opted out</option>
                  </select>
                </label>
              </div>

              {defaultConsent !== "" && (
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Consent evidence (optional)
                  </span>
                  <input
                    value={consentNote}
                    onChange={(event) => setConsentNote(event.target.value)}
                    maxLength={280}
                    placeholder="e.g. Signed up through the October landing page"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 outline-none focus:border-[#9fe870] focus:ring-2 focus:ring-[#9fe870]/30"
                  />
                  <span className="mt-1 block text-[11px] font-medium text-gray-500">
                    Stored with every consent event so the decision has a recorded basis.
                  </span>
                </label>
              )}

              <p className="rounded-xl border border-[#9fe870]/40 bg-[#f8faf7] px-3 py-2.5 text-[11px] font-medium leading-relaxed text-[#454745]">
                Leaving consent blank records no evidence. Preflight will flag those recipients
                instead of assuming they agreed, and an existing opt-out is never overridden by an
                import.
              </p>

              {preview.total > 0 && (
                <div className="rounded-2xl border border-gray-100">
                  <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
                    <span className="rounded-full bg-[#e2f6d5] px-2.5 py-1 text-[11px] font-bold text-[#163300]">
                      {preview.valid} ready
                    </span>
                    {preview.invalid > 0 && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                        {preview.invalid} skipped
                      </span>
                    )}
                    {preview.duplicates > 0 && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
                        {preview.duplicates} duplicate{preview.duplicates === 1 ? "" : "s"}
                      </span>
                    )}
                    <span className="ml-auto text-[11px] font-semibold text-gray-500">
                      {preview.hasHeader ? "Header detected" : "No header row"} ·{" "}
                      {preview.delimiter === "\t" ? "tab separated" : "comma separated"}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wider text-gray-400">
                          <th className="px-4 py-2 font-bold">Name</th>
                          <th className="px-3 py-2 font-bold">Channel</th>
                          <th className="px-3 py-2 font-bold">Recipient</th>
                          <th className="px-3 py-2 font-bold">Consent</th>
                          <th className="px-4 py-2 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleRows.map((row) => (
                          <tr key={row.line} className="border-t border-gray-50">
                            <td className="max-w-[140px] truncate px-4 py-2 font-semibold text-gray-800">
                              {[row.first_name, row.last_name].filter(Boolean).join(" ") || "—"}
                            </td>
                            <td className="px-3 py-2 font-medium capitalize text-gray-600">
                              {row.channel || "—"}
                            </td>
                            <td className="max-w-[150px] truncate px-3 py-2 font-mono text-gray-600">
                              {row.routing_value || "—"}
                            </td>
                            <td className="px-3 py-2 font-medium text-gray-600">
                              {CONSENT_LABELS[row.consent]}
                            </td>
                            <td className="px-4 py-2">
                              {row.error ? (
                                <span className="font-semibold text-amber-700">{row.error}</span>
                              ) : (
                                <span className="font-semibold text-emerald-700">Ready</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {preview.rows.length > visibleRows.length && (
                    <p className="border-t border-gray-50 px-4 py-2 text-[11px] font-medium text-gray-500">
                      Showing {visibleRows.length} of {preview.rows.length} rows.
                    </p>
                  )}
                  {invalidRows.length > 0 && (
                    <div className="border-t border-gray-50 px-4 py-2.5">
                      <p className="mb-1 text-[11px] font-bold text-amber-800">
                        Rows that will be skipped
                      </p>
                      <ul className="space-y-0.5">
                        {invalidRows.map((row) => (
                          <li key={row.line} className="text-[11px] font-medium text-amber-700">
                            Line {row.line}: {row.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-xs font-semibold text-red-700">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          {result ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#163300] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#0e2100]"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={preview.valid === 0 || isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-[#163300] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#0e2100] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isSubmitting
                  ? "Importing..."
                  : `Import ${preview.valid} recipient${preview.valid === 1 ? "" : "s"}`}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ImportResult({
  summary,
  skippedLocally,
}: {
  summary: ContactImportSummary;
  skippedLocally: number;
}) {
  const skipped = summary.invalid + skippedLocally;
  const stats = [
    { label: "New recipients", value: summary.created, tone: "text-[#163300]" },
    { label: "Already in audience", value: summary.existing, tone: "text-gray-700" },
    { label: "Opted in", value: summary.consent_granted, tone: "text-emerald-700" },
    { label: "Opted out", value: summary.consent_revoked, tone: "text-amber-700" },
    { label: "No consent recorded", value: summary.no_consent, tone: "text-gray-600" },
    { label: "Rows skipped", value: skipped, tone: "text-red-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-[#9fe870]/40 bg-[#f8faf7] px-4 py-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#163300]" />
        <div>
          <p className="text-sm font-bold text-[#163300]">
            {summary.created > 0
              ? `${summary.created} recipient${summary.created === 1 ? "" : "s"} added to this workspace`
              : "No new recipients were added"}
          </p>
          <p className="mt-0.5 text-xs font-medium text-[#454745]">
            Consent decisions were written to the workspace ledger with the import as their
            evidence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
            <p className={cn("text-lg font-extrabold leading-none", stat.tone)}>{stat.value}</p>
            <p className="mt-1 text-[11px] font-semibold text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {summary.duplicates > 0 && (
        <p className="text-[11px] font-medium text-gray-500">
          {summary.duplicates} duplicate line{summary.duplicates === 1 ? " was" : "s were"} skipped.
        </p>
      )}

      {summary.errors.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <p className="mb-1 text-[11px] font-bold text-amber-800">Rows the server skipped</p>
          <ul className="space-y-0.5">
            {summary.errors.slice(0, 10).map((row) => (
              <li key={`${row.row}-${row.message}`} className="text-[11px] font-medium text-amber-700">
                Line {row.row}: {row.message}
              </li>
            ))}
          </ul>
          {summary.truncated_errors && (
            <p className="mt-1 text-[11px] font-medium text-amber-700">
              More rows were skipped than shown here.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
