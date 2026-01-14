import { useMemo, useState } from "react";

import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";

export type DataTableCell = string;
export type DataTableRow = DataTableCell[];

export interface DataTableValue {
  columns: string[];
  rows: DataTableRow[];
}

export interface DataTableInputProps {
  label: string;
  helpText?: string;
  value: DataTableValue;
  onChange: (next: DataTableValue) => void;
  minRows?: number;
  className?: string;
}

function ensureRectangular(rows: DataTableRow[], cols: number): DataTableRow[] {
  return rows.map((r) => {
    const next = r.slice(0, cols);
    while (next.length < cols) next.push("");
    return next;
  });
}

function toTSV(value: DataTableValue): string {
  const header = value.columns.join("\t");
  const body = value.rows.map((r) => r.join("\t")).join("\n");
  return [header, body].filter(Boolean).join("\n");
}

function parseDelimited(text: string, columns: string[]): DataTableRow[] {
  const trimmed = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
  if (!trimmed) return [];

  const lines = trimmed.split("\n").filter((l) => l.length > 0);
  const delim = lines.some((l) => l.includes("\t")) ? "\t" : ",";

  const parsed = lines.map((line) => line.split(delim));

  const cols = columns.length;
  return ensureRectangular(
    parsed.map((r) => r.map((c) => c.trim())),
    cols,
  );
}

function countNumericIssues(value: DataTableValue): number {
  let issues = 0;
  for (const row of value.rows) {
    for (const cell of row) {
      const t = cell.trim();
      if (!t) continue;
      if (!Number.isFinite(Number(t))) issues += 1;
    }
  }
  return issues;
}

export function DataTableInput({
  label,
  helpText,
  value,
  onChange,
  minRows = 1,
  className = "",
}: DataTableInputProps) {
  const [mode, setMode] = useState<"grid" | "raw">("grid");

  const normalizedValue = useMemo(() => {
    const cols = Math.max(1, value.columns.length);
    const min = Math.max(0, minRows);
    const rows = ensureRectangular(value.rows, cols);

    while (rows.length < min) rows.push(new Array(cols).fill(""));

    return {
      columns: value.columns.length ? value.columns : new Array(cols).fill("").map((_, i) => `Col ${i + 1}`),
      rows,
    } satisfies DataTableValue;
  }, [minRows, value.columns, value.rows]);

  const numericIssues = useMemo(() => countNumericIssues(normalizedValue), [normalizedValue]);

  function setCell(r: number, c: number, next: string) {
    const cols = normalizedValue.columns.length;
    const rows = normalizedValue.rows.map((row) => row.slice());

    if (!rows[r]) rows[r] = new Array(cols).fill("");
    rows[r][c] = next;

    if (r === rows.length - 1 && next.trim() !== "") {
      rows.push(new Array(cols).fill(""));
    }

    onChange({ ...normalizedValue, rows });
  }

  function setColumnName(c: number, name: string) {
    const nextCols = normalizedValue.columns.slice();
    nextCols[c] = name;
    onChange({ ...normalizedValue, columns: nextCols });
  }

  function addColumn() {
    const nextCols = [...normalizedValue.columns, `Col ${normalizedValue.columns.length + 1}`];
    const nextRows = normalizedValue.rows.map((r) => [...r, ""]);
    onChange({ columns: nextCols, rows: nextRows });
  }

  function removeColumn() {
    if (normalizedValue.columns.length <= 1) return;
    const nextCols = normalizedValue.columns.slice(0, -1);
    const nextRows = normalizedValue.rows.map((r) => r.slice(0, -1));
    onChange({ columns: nextCols, rows: nextRows });
  }

  function deleteRow(idx: number) {
    const next = normalizedValue.rows.filter((_, i) => i !== idx);
    while (next.length < Math.max(1, minRows)) next.push(new Array(normalizedValue.columns.length).fill(""));
    onChange({ ...normalizedValue, rows: next });
  }

  function handlePasteIntoGrid(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();

    const text = e.clipboardData.getData("text");
    const pastedRows = parseDelimited(text, normalizedValue.columns);
    if (pastedRows.length === 0) return;

    const nextRows = [...normalizedValue.rows, ...pastedRows, new Array(normalizedValue.columns.length).fill("")];
    onChange({ ...normalizedValue, rows: nextRows });
  }

  function importFromRaw(text: string) {
    const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    const header = lines[0] ?? "";
    const delim = header.includes("\t") ? "\t" : ",";
    const cols = header
      .split(delim)
      .map((c) => c.trim())
      .filter(Boolean);

    const columns = cols.length ? cols : normalizedValue.columns;
    const rowsText = lines.slice(1).join("\n");
    const rows = parseDelimited(rowsText, columns);

    const min = Math.max(1, minRows);
    const padded = ensureRectangular(rows, columns.length);
    while (padded.length < min) padded.push(new Array(columns.length).fill(""));
    padded.push(new Array(columns.length).fill(""));

    onChange({ columns, rows: padded });
  }

  return (
    <div className={className}>
      <div className="mb-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
        {helpText ? (
          <div className="text-xs text-gray-500 dark:text-gray-400">{helpText}</div>
        ) : null}
        {numericIssues > 0 ? (
          <div className="text-xs text-red-600 mt-1">
            {numericIssues} non-numeric cell(s) found (they will break most calculators).
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button type="button" variant={mode === "grid" ? "primary" : "outline"} onClick={() => setMode("grid")}
            className="px-3 py-1 text-xs">
            Grid
          </Button>
          <Button type="button" variant={mode === "raw" ? "primary" : "outline"} onClick={() => setMode("raw")}
            className="px-3 py-1 text-xs">
            Raw (TSV/CSV)
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={addColumn} className="px-3 py-1 text-xs">
            + Col
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={removeColumn}
            className="px-3 py-1 text-xs"
            disabled={normalizedValue.columns.length <= 1}
          >
            - Col
          </Button>
        </div>
      </div>

      {mode === "raw" ? (
        <Card variant="outlined" className="p-0">
          <textarea
            className="w-full h-80 text-xs font-mono bg-slate-900 text-green-200 p-3 rounded-xl"
            value={toTSV(normalizedValue)}
            onChange={(e) => importFromRaw(e.target.value)}
          />
        </Card>
      ) : (
        <div
          className="border-2 border-slate-900 bg-white dark:bg-gray-900"
          onPaste={handlePasteIntoGrid}
        >
          <div className="flex border-b-2 border-slate-900 bg-slate-100 dark:bg-gray-800 font-mono text-xs font-bold uppercase">
            <div className="w-10 border-r border-slate-300 dark:border-gray-700 p-2 text-center text-slate-400">
              #
            </div>
            {normalizedValue.columns.map((col, c) => (
              <div key={c} className="flex-1 min-w-0 border-r border-slate-300 dark:border-gray-700 last:border-r-0">
                <input
                  className="w-full bg-transparent p-2 text-center outline-none"
                  value={col}
                  onChange={(e) => setColumnName(c, e.target.value)}
                />
              </div>
            ))}
            <div className="w-10 p-2" />
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {normalizedValue.rows.map((row, r) => (
              <div
                key={r}
                className="group flex border-b border-slate-200 dark:border-gray-800 last:border-b-0 hover:bg-yellow-50 dark:hover:bg-yellow-950"
              >
                <div className="w-10 select-none border-r border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 p-2 text-center font-mono text-xs text-slate-400">
                  {r + 1}
                </div>

                {row.map((cell, c) => {
                  const t = cell.trim();
                  const isBad = t.length > 0 && !Number.isFinite(Number(t));

                  return (
                    <input
                      key={`${r}-${c}`}
                      className={
                        "flex-1 min-w-0 bg-transparent p-2 text-right font-mono text-sm outline-none border-r border-slate-200 dark:border-gray-800 last:border-r-0 " +
                        (isBad ? "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950 " : "") +
                        "focus:bg-blue-50 dark:focus:bg-blue-950 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                      }
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      placeholder="-"
                    />
                  );
                })}

                <div className="flex w-10 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    title="Remove Row"
                    className="text-slate-400 hover:text-red-600"
                    tabIndex={-1}
                    onClick={() => deleteRow(r)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 flex justify-between font-mono text-xs text-slate-500">
        <span>{normalizedValue.rows.length} rows</span>
        <span>Tip: paste directly from Excel/Sheets</span>
      </div>
    </div>
  );
}
