import React, { useState } from "react";
import { calculateOneWayAnova, type OneWayResult } from "./anova-utils";
import type { Route } from "./+types/anova-oneway";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "One-Way ANOVA Calculator" },
        { name: "description", content: "Perform One-Way Analysis of Variance" },
    ];
}

function BackgroundGraph() {
    return (
        <svg
            className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path
                className="graph-line"
                d="M0,300 Q100,280 150,200 T250,180 T350,220 T450,100 T550,150 T650,80 T750,120 T850,60 T950,100 T1050,40 T1150,80 T1250,30 T1350,60 T1450,20 T1550,50 T1650,15 T1750,40 T1850,10 T1950,30"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                className="graph-line-2"
                d="M0,350 Q80,340 120,320 T200,350 T280,300 T360,330 T440,280 T520,310 T600,250 T680,290 T760,230 T840,270 T920,200 T1000,250 T1080,180 T1160,220 T1240,160 T1320,200 T1400,140 T1480,180 T1560,120 T1640,160 T1720,100 T1800,140 T1880,80 T1960,120"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 4"
            />
        </svg>
    );
}

export default function OneWay() {
    const [groups, setGroups] = useState<string[]>(["", ""]); // Start with 2 groups
    const [result, setResult] = useState<OneWayResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGroupChange = (index: number, value: string) => {
        const newGroups = [...groups];
        newGroups[index] = value;
        setGroups(newGroups);
    };

    const addGroup = () => {
        setGroups([...groups, ""]);
    };

    const removeGroup = (index: number) => {
        if (groups.length <= 2) return;
        const newGroups = groups.filter((_, i) => i !== index);
        setGroups(newGroups);
    };

    const handleCalculate = () => {
        setError(null);
        setResult(null);
        try {
            const parsedGroups: number[][] = groups.map((g, i) => {
                const numbers = g.split(/[\s,]+/).filter((s) => s.trim() !== "").map(Number);
                if (numbers.some(isNaN)) {
                    throw new Error(`Group ${i + 1} contains invalid numbers.`);
                }
                return numbers;
            }).filter(g => g.length > 0);

            if (parsedGroups.length < 2) {
                throw new Error("At least 2 groups with data are required.");
            }

            const res = calculateOneWayAnova(parsedGroups);
            if (!res) {
                throw new Error("Calculation failed. Ensure sufficient data.");
            }
            setResult(res);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans">
            <BackgroundGraph />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-6 fade-in text-center">
                    <h1 className="text-3xl font-extrabold mb-6 text-[var(--color-ink)]" style={{ fontFamily: "var(--font-serif)" }}>One-Way ANOVA</h1>
                </div>

                <div
                    className="p-6 rounded-lg shadow-sm border mb-8 fade-in delay-100"
                    style={{ backgroundColor: "var(--color-accent-mint)", borderColor: "var(--color-dot-mint)" }}
                >
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {groups.map((group, index) => (
                            <div key={index} className="relative group">
                                <label className="block text-sm font-medium mb-2 text-[var(--color-ink)]">
                                    Group {index + 1} Data
                                </label>
                                <textarea
                                    value={group}
                                    onChange={(e) => handleGroupChange(index, e.target.value)}
                                    placeholder="10, 12, 15..."
                                    className="w-full h-32 p-3 rounded-lg border bg-white outline-none focus:ring-2 transition-all resize-none font-mono text-sm"
                                    style={{ borderColor: "var(--color-dot-mint)" }}
                                />
                                {groups.length > 2 && (
                                    <button
                                        onClick={() => removeGroup(index)}
                                        className="absolute top-0 right-0 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove Group"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}

                        <div
                            className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer group bg-white/50 hover:bg-white/80"
                            style={{ borderColor: "var(--color-dot-mint)" }}
                            onClick={addGroup}
                        >
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full transition-colors" style={{ backgroundColor: "var(--color-accent-mint)" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: "var(--color-dot-mint)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="mt-2 block text-sm font-medium text-[var(--color-ink)]">Add Group</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleCalculate}
                            className="px-6 py-2.5 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform active:scale-95 transition-all text-sm uppercase tracking-wide"
                            style={{ backgroundColor: "var(--color-dot-mint)" }}
                        >
                            Calculate F-Statistic
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 animate-pulse">
                            {error}
                        </div>
                    )}
                </div>

                {result && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Summary Table */}
                        <div
                            className="rounded-xl shadow-lg p-6 border overflow-hidden"
                            style={{ backgroundColor: "var(--color-accent-mint)", borderColor: "var(--color-dot-mint)" }}
                        >
                            <h3 className="text-xl font-semibold mb-4 text-[var(--color-ink)] border-b pb-2 flex items-center gap-2" style={{ borderColor: "var(--color-dot-mint)" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: "var(--color-dot-mint)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                ANOVA Summary Table
                            </h3>
                            <div className="overflow-x-auto rounded-xl bg-white border" style={{ borderColor: "var(--color-dot-mint)" }}>
                                <table className="min-w-full text-sm text-left text-[var(--color-ink)]">
                                    <thead className="text-xs uppercase" style={{ backgroundColor: "var(--color-accent-mint)" }}>
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Source of Variation</th>
                                            <th scope="col" className="px-6 py-3">SS</th>
                                            <th scope="col" className="px-6 py-3">df</th>
                                            <th scope="col" className="px-6 py-3">MS</th>
                                            <th scope="col" className="px-6 py-3">F</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-white border-b hover:bg-gray-50" style={{ borderColor: "var(--color-dot-mint)" }}>
                                            <td className="px-6 py-4 font-medium text-[var(--color-ink)] whitespace-nowrap">
                                                Between Groups
                                            </td>
                                            <td className="px-6 py-4">{result.ssBetween.toFixed(4)}</td>
                                            <td className="px-6 py-4">{result.dfBetween}</td>
                                            <td className="px-6 py-4">{result.msBetween.toFixed(4)}</td>
                                            <td className="px-6 py-4 font-bold" style={{ color: "var(--color-dot-mint)" }}>{result.fStat.toFixed(4)}</td>
                                        </tr>
                                        <tr className="bg-white border-b hover:bg-gray-50" style={{ borderColor: "var(--color-dot-mint)" }}>
                                            <td className="px-6 py-4 font-medium text-[var(--color-ink)] whitespace-nowrap">
                                                Within Groups (Error)
                                            </td>
                                            <td className="px-6 py-4">{result.ssWithin.toFixed(4)}</td>
                                            <td className="px-6 py-4">{result.dfWithin}</td>
                                            <td className="px-6 py-4">{result.msWithin.toFixed(4)}</td>
                                            <td className="px-6 py-4">-</td>
                                        </tr>
                                        <tr className="bg-gray-50 border-b" style={{ borderColor: "var(--color-dot-mint)" }}>
                                            <td className="px-6 py-4 font-bold text-[var(--color-ink)] whitespace-nowrap">
                                                Total
                                            </td>
                                            <td className="px-6 py-4 font-bold">{result.totalSS.toFixed(4)}</td>
                                            <td className="px-6 py-4 font-bold">{result.totalDf}</td>
                                            <td className="px-6 py-4"></td>
                                            <td className="px-6 py-4"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Detailed Working (Deviation Method) */}
                        <div
                            className="rounded-xl shadow-lg p-6 border overflow-hidden"
                            style={{ backgroundColor: "var(--color-accent-mint)", borderColor: "var(--color-dot-mint)" }}
                        >
                            <h3 className="text-xl font-semibold mb-6 text-[var(--color-ink)] border-b pb-2 flex items-center gap-2" style={{ borderColor: "var(--color-dot-mint)" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: "var(--color-dot-mint)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Step-by-Step Calculation (Deviation Method)
                            </h3>

                            {/* Step 1: Means */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium text-[var(--color-ink)] mb-3">Step 1: Group Means and Overall Mean</h4>

                                <div className="space-y-4 text-sm font-mono bg-white p-4 rounded-lg border" style={{ borderColor: "var(--color-dot-mint)" }}>
                                    <div>
                                        <div className="font-bold text-[var(--color-ink)] mb-1">Calculate the grand mean (X̄):</div>
                                        <div>Sum = {result.grandSum.toFixed(2)}</div>
                                        <div>N = {result.grandN}</div>
                                        <div className="mt-1">
                                            X̄ = {result.grandSum.toFixed(2)} / {result.grandN} = <strong>{(result.grandSum / result.grandN).toFixed(4)}</strong>
                                        </div>
                                    </div>

                                    <div className="border-t pt-3" style={{ borderColor: "var(--color-dot-mint)" }}>
                                        <div className="font-bold text-[var(--color-ink)] mb-1">Calculate the group means:</div>
                                        {result.groupStats.map((g, i) => (
                                            <div key={i} className="mb-2">
                                                Mean_Group{i + 1} = {g.sum.toFixed(2)} / {g.n} = <strong>{g.mean.toFixed(4)}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Sum of Squares */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium text-[var(--color-ink)] mb-3">Step 2: Sum of Squares</h4>

                                {/* SS Total */}
                                <div className="mb-4">
                                    <h5 className="font-semibold text-[var(--color-ink)]">Total Sum of Squares (SStotal)</h5>
                                    <p className="text-sm text-[var(--color-ink-light)] mb-1">Formula: ∑(X - GrandMean)²</p>
                                    <div className="p-3 bg-white border rounded font-mono text-sm overflow-x-auto" style={{ borderColor: "var(--color-dot-mint)" }}>
                                        {/* Show first 3 deviations for illustration */}
                                        {groups.flat().filter(g => g.trim() !== "").slice(0, 3).map((val, idx) => (
                                            <span key={idx}>({val} - {(result.grandSum / result.grandN).toFixed(2)})² + </span>
                                        ))}
                                        <span>...</span>
                                        <div className="mt-2 font-bold" style={{ color: "var(--color-dot-mint)" }}>
                                            = {result.totalSS.toFixed(4)}
                                        </div>
                                    </div>
                                </div>

                                {/* SS Between */}
                                <div className="mb-4">
                                    <h5 className="font-semibold text-[var(--color-ink)]">Between-Groups Sum of Squares (SSbetween)</h5>
                                    <p className="text-sm text-[var(--color-ink-light)] mb-1">Formula: ∑ n_group * (Mean_group - GrandMean)²</p>
                                    <div className="p-3 bg-white border rounded font-mono text-sm overflow-x-auto" style={{ borderColor: "var(--color-dot-mint)" }}>
                                        {result.groupStats.map((g, i) => (
                                            <span key={i}>
                                                {g.n} * ({g.mean.toFixed(2)} - {(result.grandSum / result.grandN).toFixed(2)})²
                                                {i < result.groupStats.length - 1 ? " + " : ""}
                                            </span>
                                        ))}
                                        <div className="mt-2 font-bold" style={{ color: "var(--color-dot-mint)" }}>
                                            = {result.ssBetween.toFixed(4)}
                                        </div>
                                    </div>
                                </div>

                                {/* SS Within */}
                                <div className="mb-4">
                                    <h5 className="font-semibold text-[var(--color-ink)]">Within-Groups Sum of Squares (SSwithin)</h5>
                                    <p className="text-sm text-[var(--color-ink-light)] mb-1">Formula: SStotal - SSbetween</p>
                                    <div className="p-3 bg-white border rounded font-mono text-sm" style={{ borderColor: "var(--color-dot-mint)" }}>
                                        {result.totalSS.toFixed(4)} - {result.ssBetween.toFixed(4)}
                                        <div className="mt-2 font-bold" style={{ color: "var(--color-dot-mint)" }}>
                                            = {result.ssWithin.toFixed(4)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: MS and F */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium text-[var(--color-ink)] mb-3">Step 3: Calculate Mean Squares and F-Statistic</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 border rounded bg-white" style={{ borderColor: "var(--color-dot-mint)" }}>
                                        <strong>Degrees of Freedom (df)</strong>
                                        <ul className="list-disc list-inside mt-2 text-sm text-[var(--color-ink-light)]">
                                            <li>df_between = k - 1 = {result.groupStats.length} - 1 = {result.dfBetween}</li>
                                            <li>df_within = N - k = {result.grandN} - {result.groupStats.length} = {result.dfWithin}</li>
                                        </ul>
                                    </div>
                                    <div className="p-3 border rounded bg-white" style={{ borderColor: "var(--color-dot-mint)" }}>
                                        <strong>Mean Squares (MS)</strong>
                                        <ul className="list-disc list-inside mt-2 text-sm text-[var(--color-ink-light)]">
                                            <li>MS_between = {result.ssBetween.toFixed(2)} / {result.dfBetween} = {result.msBetween.toFixed(4)}</li>
                                            <li>MS_within = {result.ssWithin.toFixed(2)} / {result.dfWithin} = {result.msWithin.toFixed(4)}</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 border rounded-lg bg-white bg-opacity-50 text-center" style={{ borderColor: "var(--color-dot-mint)" }}>
                                    <span className="font-semibold text-[var(--color-ink)]">F-Statistic = MS_between / MS_within</span>
                                    <div className="text-2xl font-bold mt-2" style={{ color: "var(--color-dot-mint)" }}>
                                        {result.msBetween.toFixed(2)} / {result.msWithin.toFixed(2)} ≈ {result.fStat.toFixed(4)}
                                    </div>
                                </div>
                            </div>

                            {/* Step 4: Decision */}
                            <div>
                                <h4 className="text-lg font-medium text-[var(--color-ink)] mb-3">Step 4: Decision</h4>
                                <div className="text-sm text-[var(--color-ink)] border-l-4 pl-4 bg-white p-3 rounded-r border" style={{ borderColor: "var(--color-dot-mint)" }}>
                                    <p className="mb-2"><strong>Critical F-Value:</strong></p>
                                    <p className="mb-2">
                                        Look up the critical value in an F-distribution table with:
                                        <br />
                                        • df_between (numerator) = <strong>{result.dfBetween}</strong>
                                        <br />
                                        • df_within (denominator) = <strong>{result.dfWithin}</strong>
                                        <br />
                                        • α (significance level) usually = <strong>0.05</strong>
                                    </p>
                                    <p>
                                        <strong>Compare F:</strong>
                                        <br />
                                        If F ({result.fStat.toFixed(4)}) &gt; F_critical, reject the null hypothesis (means are different).
                                        <br />
                                        If F ({result.fStat.toFixed(4)}) &le; F_critical, fail to reject (no significant difference).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
