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
  F_TABLE_DF1,
  F_TABLE_DF2,
  F_CRITICAL_005,
  F_CRITICAL_001,
  lookupFValue,
  findClosestFDf1,
  findClosestFDf2,
} from "~/lib/tables/statistical-tables";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stats Stuff | Statistical Tables" },
    { name: "description", content: "t-distribution, z-distribution, chi-square, and F-distribution tables with auto-lookup." },
  ];
}

type TableType = "t" | "z" | "chi" | "f";

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

  const [fDf1, setFDf1] = useState("");
  const [fDf2, setFDf2] = useState("");
  const [fAlpha, setFAlpha] = useState("0.05");
  const [fResult, setFResult] = useState<{ value: number; usedDf1: number; usedDf2: number } | null>(null);

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

  function lookupF() {
    const df1 = parseInt(fDf1, 10);
    const df2 = parseInt(fDf2, 10);
    const alpha = parseFloat(fAlpha);
    if (isNaN(df1) || df1 < 1 || isNaN(df2) || df2 < 1) return;
    const value = lookupFValue(df1, df2, alpha);
    if (value !== null) {
      setFResult({ value, usedDf1: findClosestFDf1(df1), usedDf2: findClosestFDf2(df2) });
    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 font-sans text-[var(--color-ink)]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 fade-in">
          <Link
            to="/"
            className="text-sm font-medium text-[var(--color-ink-light)] hover:text-[var(--color-dot-lavender)] transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1
            className="text-5xl font-medium tracking-tight mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Statistical Tables
          </h1>
          <p className="text-lg text-[var(--color-ink-light)] max-w-2xl">
            Look up critical values from t, z, χ², and F distributions.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-8 fade-in" style={{ animationDelay: "50ms" }}>
          <Button
            tone={activeTable === "t" ? "lavender" : undefined}
            variant={activeTable === "t" ? "primary" : "secondary"}
            onClick={() => setActiveTable("t")}
          >
            t-Distribution
          </Button>
          <Button
            tone={activeTable === "z" ? "lavender" : undefined}
            variant={activeTable === "z" ? "primary" : "secondary"}
            onClick={() => setActiveTable("z")}
          >
            z-Distribution
          </Button>
          <Button
            tone={activeTable === "chi" ? "lavender" : undefined}
            variant={activeTable === "chi" ? "primary" : "secondary"}
            onClick={() => setActiveTable("chi")}
          >
            χ² (Chi-Square)
          </Button>
          <Button
            tone={activeTable === "f" ? "lavender" : undefined}
            variant={activeTable === "f" ? "primary" : "secondary"}
            onClick={() => setActiveTable("f")}
          >
            F-Distribution
          </Button>
        </div>

        {activeTable === "t" && (
          <section className="fade-in" style={{ animationDelay: "100ms" }}>
            <Card className="mb-6 bg-[var(--color-accent-lavender)] border-none">
              <h2 className="text-xl font-medium mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                t-Distribution Lookup
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mb-4">
                <Input
                  label="Degrees of Freedom"
                  type="number"
                  min={1}
                  value={tDf}
                  onChange={(e) => setTDf(e.target.value)}
                  placeholder="e.g. 25"
                />
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--color-ink-light)]">α (one-tail)</label>
                  <select
                    className="w-full p-2 border border-[var(--color-border)] rounded-lg bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-lavender)]"
                    value={tAlpha}
                    onChange={(e) => setTAlpha(e.target.value)}
                  >
                    {T_TABLE_ALPHA_ONE_TAIL.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button tone="lavender" onClick={lookupT}>Look Up</Button>
                </div>
              </div>

              {tResult && (
                <div className="bg-white/70 p-4 rounded-lg border border-[var(--color-ink)]/5">
                  <p className="text-lg">
                    <strong>t-critical</strong> (df={tResult.usedDf}, α={tAlpha}) = 
                    <span className="text-2xl font-bold ml-2 text-[var(--color-dot-lavender)]">{formatNum(tResult.value)}</span>
                  </p>
                  {tResult.usedDf !== parseInt(tDf) && (
                    <p className="text-sm text-[var(--color-ink-light)]">
                      Using closest available df={tResult.usedDf} for your df={tDf}
                    </p>
                  )}
                </div>
              )}
            </Card>

            <Card className="overflow-x-auto border border-gray-100 shadow-sm">
              <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>Full t-Distribution Table</h3>
              <table className="min-w-full text-xs font-mono">
                <thead>
                  <tr className="bg-[var(--color-accent-lavender)]/30">
                    <th className="p-2 border border-gray-100">df</th>
                    {T_TABLE_ALPHA_ONE_TAIL.map((a, i) => (
                      <th key={a} className="p-2 border border-gray-100 text-center">
                        <div>α={a}</div>
                        <div className="text-xs text-[var(--color-ink-light)]">(2-tail: {T_TABLE_ALPHA_TWO_TAIL[i]})</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {T_TABLE_DF.map((df) => (
                    <tr key={df} className="hover:bg-[var(--color-accent-lavender)]/10 transition-colors">
                      <td className="p-2 border border-gray-100 font-bold">{df === Infinity ? "∞" : df}</td>
                      {T_CRITICAL_VALUES[df]?.map((val, i) => (
                        <td key={i} className="p-2 border border-gray-100 text-right">{formatNum(val, 3)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        )}

        {activeTable === "z" && (
          <section className="fade-in" style={{ animationDelay: "100ms" }}>
            <Card className="mb-6 bg-[var(--color-accent-lavender)] border-none">
              <h2 className="text-xl font-medium mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                Standard Normal (z) Lookup
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mb-4">
                <Input
                  label="z-score"
                  type="number"
                  step={0.01}
                  value={zValue}
                  onChange={(e) => setZValue(e.target.value)}
                  placeholder="e.g. 1.96"
                />
                <div className="flex items-end">
                  <Button tone="lavender" onClick={lookupZ}>Look Up P(Z ≤ z)</Button>
                </div>
              </div>

              {zResult !== null && (
                <div className="bg-white/70 p-4 rounded-lg border border-[var(--color-ink)]/5">
                  <p className="text-lg">
                    <strong>P(Z ≤ {zValue})</strong> = 
                    <span className="text-2xl font-bold ml-2 text-[var(--color-dot-lavender)]">{formatNum(zResult, 5)}</span>
                  </p>
                  <p className="text-sm text-[var(--color-ink-light)]">
                    P(Z &gt; {zValue}) = {formatNum(1 - zResult, 5)}
                  </p>
                </div>
              )}
            </Card>

            <Card className="overflow-x-auto border border-gray-100 shadow-sm">
              <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>Standard Normal Table (Cumulative from left)</h3>
              <table className="min-w-full text-xs font-mono">
                <thead>
                  <tr className="bg-[var(--color-accent-lavender)]/30">
                    <th className="p-1 border border-gray-100">z</th>
                    {Z_TABLE_COLS.map((col) => (
                      <th key={col} className="p-1 border border-gray-100">{col.toFixed(2)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Z_TABLE_ROWS.map((row, i) => (
                    <tr key={row} className="hover:bg-[var(--color-accent-lavender)]/10 transition-colors">
                      <td className="p-1 border border-gray-100 font-bold">{row.toFixed(1)}</td>
                      {Z_TABLE_VALUES[i]?.map((val, j) => (
                        <td key={j} className="p-1 border border-gray-100 text-right">{val.toFixed(4)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        )}

        {activeTable === "chi" && (
          <section className="fade-in" style={{ animationDelay: "100ms" }}>
            <Card className="mb-6 bg-[var(--color-accent-lavender)] border-none">
              <h2 className="text-xl font-medium mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                Chi-Square (χ²) Lookup
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mb-4">
                <Input
                  label="Degrees of Freedom"
                  type="number"
                  min={1}
                  value={chiDf}
                  onChange={(e) => setChiDf(e.target.value)}
                  placeholder="e.g. 10"
                />
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--color-ink-light)]">α (right-tail)</label>
                  <select
                    className="w-full p-2 border border-[var(--color-border)] rounded-lg bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-lavender)]"
                    value={chiAlpha}
                    onChange={(e) => setChiAlpha(e.target.value)}
                  >
                    {CHI_SQUARE_ALPHA.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button tone="lavender" onClick={lookupChi}>Look Up</Button>
                </div>
              </div>

              {chiResult && (
                <div className="bg-white/70 p-4 rounded-lg border border-[var(--color-ink)]/5">
                  <p className="text-lg">
                    <strong>χ²-critical</strong> (df={chiResult.usedDf}, α={chiAlpha}) = 
                    <span className="text-2xl font-bold ml-2 text-[var(--color-dot-lavender)]">{formatNum(chiResult.value)}</span>
                  </p>
                  {chiResult.usedDf !== parseInt(chiDf) && (
                    <p className="text-sm text-[var(--color-ink-light)]">
                      Using closest available df={chiResult.usedDf} for your df={chiDf}
                    </p>
                  )}
                </div>
              )}
            </Card>

            <Card className="overflow-x-auto border border-gray-100 shadow-sm">
              <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>Chi-Square Distribution Table</h3>
              <table className="min-w-full text-xs font-mono">
                <thead>
                  <tr className="bg-[var(--color-accent-lavender)]/30">
                    <th className="p-1 border border-gray-100">df</th>
                    {CHI_SQUARE_ALPHA.map((a) => (
                      <th key={a} className="p-1 border border-gray-100">α={a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CHI_SQUARE_DF.map((df) => (
                    <tr key={df} className="hover:bg-[var(--color-accent-lavender)]/10 transition-colors">
                      <td className="p-1 border border-gray-100 font-bold">{df}</td>
                      {CHI_SQUARE_VALUES[df]?.map((val, i) => (
                        <td key={i} className="p-1 border border-gray-100 text-right">{formatNum(val, 3)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        )}

        {activeTable === "f" && (
          <section className="fade-in" style={{ animationDelay: "100ms" }}>
            <Card className="mb-6 bg-[var(--color-accent-lavender)] border-none">
              <h2 className="text-xl font-medium mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                F-Distribution Lookup
              </h2>
              <p className="text-sm text-[var(--color-ink-light)] mb-4">
                Used in ANOVA and F-tests for comparing variances. df₁ = numerator (between groups), df₂ = denominator (within groups).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-2xl mb-4">
                <Input
                  label="df₁ (numerator)"
                  type="number"
                  min={1}
                  value={fDf1}
                  onChange={(e) => setFDf1(e.target.value)}
                  placeholder="e.g. 3"
                />
                <Input
                  label="df₂ (denominator)"
                  type="number"
                  min={1}
                  value={fDf2}
                  onChange={(e) => setFDf2(e.target.value)}
                  placeholder="e.g. 20"
                />
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--color-ink-light)]">α (right-tail)</label>
                  <select
                    className="w-full p-2 border border-[var(--color-border)] rounded-lg bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-lavender)]"
                    value={fAlpha}
                    onChange={(e) => setFAlpha(e.target.value)}
                  >
                    <option value="0.05">0.05</option>
                    <option value="0.01">0.01</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button tone="lavender" onClick={lookupF}>Look Up</Button>
                </div>
              </div>

              {fResult && (
                <div className="bg-white/70 p-4 rounded-lg border border-[var(--color-ink)]/5">
                  <p className="text-lg">
                    <strong>F-critical</strong> (df₁={fResult.usedDf1}, df₂={fResult.usedDf2 === Infinity ? "∞" : fResult.usedDf2}, α={fAlpha}) = 
                    <span className="text-2xl font-bold ml-2 text-[var(--color-dot-lavender)]">{formatNum(fResult.value)}</span>
                  </p>
                  {(fResult.usedDf1 !== parseInt(fDf1) || fResult.usedDf2 !== parseInt(fDf2)) && (
                    <p className="text-sm text-[var(--color-ink-light)]">
                      Using closest available df₁={fResult.usedDf1}, df₂={fResult.usedDf2 === Infinity ? "∞" : fResult.usedDf2}
                    </p>
                  )}
                </div>
              )}
            </Card>

            <Card className="overflow-x-auto mb-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                F-Distribution Table (α = 0.05)
              </h3>
              <p className="text-xs text-[var(--color-ink-light)] mb-2">
                Rows = df₂ (denominator), Columns = df₁ (numerator)
              </p>
              <table className="min-w-full text-xs font-mono">
                <thead>
                  <tr className="bg-[var(--color-accent-lavender)]/30">
                    <th className="p-1 border border-gray-100">df₂\df₁</th>
                    {F_TABLE_DF1.map((df1) => (
                      <th key={df1} className="p-1 border border-gray-100">{df1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {F_TABLE_DF2.slice(0, 20).map((df2) => (
                    <tr key={df2.toString()} className="hover:bg-[var(--color-accent-lavender)]/10 transition-colors">
                      <td className="p-1 border border-gray-100 font-bold">{df2 === Infinity ? "∞" : df2}</td>
                      {F_TABLE_DF1.map((df1) => (
                        <td key={df1} className="p-1 border border-gray-100 text-right">
                          {F_CRITICAL_005[df1]?.[df2] !== undefined ? formatNum(F_CRITICAL_005[df1][df2], 2) : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-[var(--color-ink-light)] mt-2">
                Showing df₂ = 1-20. Use the lookup above for other values.
              </p>
            </Card>

            <Card className="overflow-x-auto border border-gray-100 shadow-sm">
              <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                F-Distribution Table (α = 0.01)
              </h3>
              <p className="text-xs text-[var(--color-ink-light)] mb-2">
                Rows = df₂ (denominator), Columns = df₁ (numerator)
              </p>
              <table className="min-w-full text-xs font-mono">
                <thead>
                  <tr className="bg-[var(--color-accent-lavender)]/30">
                    <th className="p-1 border border-gray-100">df₂\df₁</th>
                    {F_TABLE_DF1.map((df1) => (
                      <th key={df1} className="p-1 border border-gray-100">{df1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {F_TABLE_DF2.slice(0, 20).map((df2) => (
                    <tr key={df2.toString()} className="hover:bg-[var(--color-accent-lavender)]/10 transition-colors">
                      <td className="p-1 border border-gray-100 font-bold">{df2 === Infinity ? "∞" : df2}</td>
                      {F_TABLE_DF1.map((df1) => (
                        <td key={df1} className="p-1 border border-gray-100 text-right">
                          {F_CRITICAL_001[df1]?.[df2] !== undefined ? formatNum(F_CRITICAL_001[df1][df2], 2) : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-[var(--color-ink-light)] mt-2">
                Showing df₂ = 1-20. Use the lookup above for other values.
              </p>
            </Card>
          </section>
        )}
      </div>
    </main>
  );
}
