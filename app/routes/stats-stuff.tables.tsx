import { useState } from "react";
import type { Route } from "./+types/stats-stuff.tables";
import { Link } from "react-router";

import {
  T_TABLE_DF,
  T_TABLE_ALPHA_ONE_TAIL,
  T_TABLE_ALPHA_TWO_TAIL,
  T_CRITICAL_VALUES,
  lookupTValue,
  findClosestDf,
  Z_TABLE_ROWS,
  Z_TABLE_COLS,
  Z_TABLE_VALUES,
  lookupZValue,
  CHI_SQUARE_DF,
  CHI_SQUARE_ALPHA,
  CHI_SQUARE_VALUES,
  lookupChiSquare,
  findClosestChiDf,
} from "~/lib/tables/statistical-tables";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stats Stuff | Statistical Tables" },
    { name: "description", content: "t-distribution, z-distribution, and chi-square tables with auto-lookup." },
  ];
}

type TableType = "t" | "z" | "chi";

function formatNum(num: number, decimals = 4): string {
  if (!Number.isFinite(num)) return "∞";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

export default function TablesPage() {
  const [activeTable, setActiveTable] = useState<TableType>("t");

  const [tDf, setTDf] = useState("");
  const [tAlpha, setTAlpha] = useState("0.05");
  const [tResult, setTResult] = useState<{ value: number; usedDf: number } | null>(null);

  const [zValue, setZValue] = useState("");
  const [zResult, setZResult] = useState<number | null>(null);

  const [chiDf, setChiDf] = useState("");
  const [chiAlpha, setChiAlpha] = useState("0.05");
  const [chiResult, setChiResult] = useState<{ value: number; usedDf: number } | null>(null);

  function lookupT() {
    const df = parseInt(tDf, 10);
    const alpha = parseFloat(tAlpha);
    if (isNaN(df) || df < 1) return;
    const value = lookupTValue(df, alpha);
    if (value !== null) {
      setTResult({ value, usedDf: findClosestDf(df) });
    }
  }

  function lookupZ() {
    const z = parseFloat(zValue);
    if (isNaN(z)) return;
    setZResult(lookupZValue(z));
  }

  function lookupChi() {
    const df = parseInt(chiDf, 10);
    const alpha = parseFloat(chiAlpha);
    if (isNaN(df) || df < 1) return;
    const value = lookupChiSquare(df, alpha);
    if (value !== null) {
      setChiResult({ value, usedDf: findClosestChiDf(df) });
    }
  }

  return (
    <main className="retro-theme min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-3xl retro-fire">STATISTICAL TABLES</h1>
        <p className="text-sm mt-2">
          Look up critical values from t, z, and χ² distributions.
        </p>
        <Link to="/stats-stuff" className="text-xs">
          ← Back to Stats Stuff
        </Link>
      </header>

      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTable === "t" ? "primary" : "outline"}
          onClick={() => setActiveTable("t")}
        >
          t-Distribution
        </Button>
        <Button
          variant={activeTable === "z" ? "primary" : "outline"}
          onClick={() => setActiveTable("z")}
        >
          z-Distribution
        </Button>
        <Button
          variant={activeTable === "chi" ? "primary" : "outline"}
          onClick={() => setActiveTable("chi")}
        >
          χ² (Chi-Square)
        </Button>
      </div>

      {activeTable === "t" && (
        <section>
          <Card className="retro-card mb-6">
            <h2 className="text-xl font-bold mb-4">t-Distribution Lookup</h2>
            <div className="grid grid-cols-3 gap-4 max-w-lg mb-4">
              <Input
                label="Degrees of Freedom"
                type="number"
                min={1}
                value={tDf}
                onChange={(e) => setTDf(e.target.value)}
                placeholder="e.g. 25"
              />
              <div>
                <label className="block text-sm font-medium mb-1">α (one-tail)</label>
                <select
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                  value={tAlpha}
                  onChange={(e) => setTAlpha(e.target.value)}
                >
                  {T_TABLE_ALPHA_ONE_TAIL.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={lookupT}>Look Up</Button>
              </div>
            </div>

            {tResult && (
              <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded mb-4">
                <p className="text-lg">
                  <strong>t-critical</strong> (df={tResult.usedDf}, α={tAlpha}) = 
                  <span className="text-2xl font-bold ml-2 retro-fire">{formatNum(tResult.value)}</span>
                </p>
                {tResult.usedDf !== parseInt(tDf) && (
                  <p className="text-sm opacity-70">
                    Using closest available df={tResult.usedDf} for your df={tDf}
                  </p>
                )}
              </div>
            )}
          </Card>

          <Card className="retro-card overflow-x-auto">
            <h3 className="font-bold mb-2">Full t-Distribution Table</h3>
            <table className="min-w-full text-xs font-mono">
              <thead>
                <tr className="bg-slate-200 dark:bg-slate-700">
                  <th className="p-2 border">df</th>
                  {T_TABLE_ALPHA_ONE_TAIL.map((a, i) => (
                    <th key={a} className="p-2 border text-center">
                      <div>α={a}</div>
                      <div className="text-xs opacity-70">(2-tail: {T_TABLE_ALPHA_TWO_TAIL[i]})</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {T_TABLE_DF.map((df) => (
                  <tr key={df} className="hover:bg-yellow-50 dark:hover:bg-yellow-950">
                    <td className="p-2 border font-bold">{df === Infinity ? "∞" : df}</td>
                    {T_CRITICAL_VALUES[df]?.map((val, i) => (
                      <td key={i} className="p-2 border text-right">{formatNum(val, 3)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      )}

      {activeTable === "z" && (
        <section>
          <Card className="retro-card mb-6">
            <h2 className="text-xl font-bold mb-4">Standard Normal (z) Lookup</h2>
            <div className="grid grid-cols-2 gap-4 max-w-md mb-4">
              <Input
                label="z-score"
                type="number"
                step={0.01}
                value={zValue}
                onChange={(e) => setZValue(e.target.value)}
                placeholder="e.g. 1.96"
              />
              <div className="flex items-end">
                <Button onClick={lookupZ}>Look Up P(Z ≤ z)</Button>
              </div>
            </div>

            {zResult !== null && (
              <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded mb-4">
                <p className="text-lg">
                  <strong>P(Z ≤ {zValue})</strong> = 
                  <span className="text-2xl font-bold ml-2 retro-fire">{formatNum(zResult, 5)}</span>
                </p>
                <p className="text-sm opacity-70">
                  P(Z &gt; {zValue}) = {formatNum(1 - zResult, 5)}
                </p>
              </div>
            )}
          </Card>

          <Card className="retro-card overflow-x-auto">
            <h3 className="font-bold mb-2">Standard Normal Table (Cumulative from left)</h3>
            <table className="min-w-full text-xs font-mono">
              <thead>
                <tr className="bg-slate-200 dark:bg-slate-700">
                  <th className="p-1 border">z</th>
                  {Z_TABLE_COLS.map((col) => (
                    <th key={col} className="p-1 border">{col.toFixed(2)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Z_TABLE_ROWS.map((row, i) => (
                  <tr key={row} className="hover:bg-yellow-50 dark:hover:bg-yellow-950">
                    <td className="p-1 border font-bold">{row.toFixed(1)}</td>
                    {Z_TABLE_VALUES[i]?.map((val, j) => (
                      <td key={j} className="p-1 border text-right">{val.toFixed(4)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      )}

      {activeTable === "chi" && (
        <section>
          <Card className="retro-card mb-6">
            <h2 className="text-xl font-bold mb-4">Chi-Square (χ²) Lookup</h2>
            <div className="grid grid-cols-3 gap-4 max-w-lg mb-4">
              <Input
                label="Degrees of Freedom"
                type="number"
                min={1}
                value={chiDf}
                onChange={(e) => setChiDf(e.target.value)}
                placeholder="e.g. 10"
              />
              <div>
                <label className="block text-sm font-medium mb-1">α (right-tail)</label>
                <select
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                  value={chiAlpha}
                  onChange={(e) => setChiAlpha(e.target.value)}
                >
                  {CHI_SQUARE_ALPHA.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={lookupChi}>Look Up</Button>
              </div>
            </div>

            {chiResult && (
              <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded mb-4">
                <p className="text-lg">
                  <strong>χ²-critical</strong> (df={chiResult.usedDf}, α={chiAlpha}) = 
                  <span className="text-2xl font-bold ml-2 retro-fire">{formatNum(chiResult.value)}</span>
                </p>
                {chiResult.usedDf !== parseInt(chiDf) && (
                  <p className="text-sm opacity-70">
                    Using closest available df={chiResult.usedDf} for your df={chiDf}
                  </p>
                )}
              </div>
            )}
          </Card>

          <Card className="retro-card overflow-x-auto">
            <h3 className="font-bold mb-2">Chi-Square Distribution Table</h3>
            <table className="min-w-full text-xs font-mono">
              <thead>
                <tr className="bg-slate-200 dark:bg-slate-700">
                  <th className="p-1 border">df</th>
                  {CHI_SQUARE_ALPHA.map((a) => (
                    <th key={a} className="p-1 border">α={a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CHI_SQUARE_DF.map((df) => (
                  <tr key={df} className="hover:bg-yellow-50 dark:hover:bg-yellow-950">
                    <td className="p-1 border font-bold">{df}</td>
                    {CHI_SQUARE_VALUES[df]?.map((val, i) => (
                      <td key={i} className="p-1 border text-right">{formatNum(val, 3)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      )}
    </main>
  );
}
