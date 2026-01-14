import React, { useState } from "react";
import { calculateOneWayAnova, type OneWayResult } from "./utils";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";

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
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="bg-[var(--color-accent-mint)] border-none">
                <h2
                    className="text-xl font-medium mb-2"
                    style={{ fontFamily: "var(--font-serif)" }}
                >
                    One-Way ANOVA
                </h2>
                <MathBlock formula="F = \frac{\text{MS}_{\text{between}}}{\text{MS}_{\text{within}}}" />
                <p className="text-sm text-[var(--color-ink-light)] mt-2">
                    Tests whether the means of three or more independent groups are significantly different.
                </p>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group, index) => (
                    <div key={index} className="relative group">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-[var(--color-ink)]">
                                Group {index + 1} Data
                            </label>
                            {groups.length > 2 && (
                                <button
                                    onClick={() => removeGroup(index)}
                                    className="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <textarea
                            value={group}
                            onChange={(e) => handleGroupChange(index, e.target.value)}
                            placeholder="10, 12, 15..."
                            className="w-full h-32 p-3 rounded-xl border border-gray-200 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-mint)] transition-all resize-none shadow-sm"
                        />
                    </div>
                ))}

                <div
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-[var(--color-dot-mint)] transition-colors cursor-pointer group bg-gray-50/50"
                    onClick={addGroup}
                >
                    <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <span className="text-xl text-[var(--color-dot-mint)]">+</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--color-ink-light)] group-hover:text-[var(--color-dot-mint)] transition-colors">Add Group</span>
                </div>
            </div>

            {error && (
                <p className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-sm">
                    {error}
                </p>
            )}

            <div className="flex justify-end">
                <Button tone="mint" onClick={handleCalculate} className="w-full md:w-auto">
                    Calculate F-Statistic
                </Button>
            </div>

            {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8">
                    <h3
                        className="text-2xl font-medium"
                        style={{ fontFamily: "var(--font-serif)" }}
                    >
                        Results
                    </h3>

                    {/* Summary Table */}
                    <Card className="bg-[var(--color-accent-mint)] border-none">
                        <h4 className="font-semibold mb-4 flex items-center gap-2 text-[var(--color-ink)]">
                            ANOVA Summary Table
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="text-xs uppercase text-[var(--color-ink-light)] border-b border-[var(--color-ink-light)]/10">
                                    <tr>
                                        <th className="px-4 py-2">Source</th>
                                        <th className="px-4 py-2">SS</th>
                                        <th className="px-4 py-2">df</th>
                                        <th className="px-4 py-2">MS</th>
                                        <th className="px-4 py-2">F</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[var(--color-ink)]">
                                    <tr className="border-b border-[var(--color-ink-light)]/10">
                                        <td className="px-4 py-3 font-medium">Between Groups</td>
                                        <td className="px-4 py-3">{result.ssBetween.toFixed(4)}</td>
                                        <td className="px-4 py-3">{result.dfBetween}</td>
                                        <td className="px-4 py-3">{result.msBetween.toFixed(4)}</td>
                                        <td className="px-4 py-3 font-bold text-[var(--color-dot-mint)]">{result.fStat.toFixed(4)}</td>
                                    </tr>
                                    <tr className="border-b border-[var(--color-ink-light)]/10">
                                        <td className="px-4 py-3 font-medium">Within Groups</td>
                                        <td className="px-4 py-3">{result.ssWithin.toFixed(4)}</td>
                                        <td className="px-4 py-3">{result.dfWithin}</td>
                                        <td className="px-4 py-3">{result.msWithin.toFixed(4)}</td>
                                        <td className="px-4 py-3">-</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-bold">Total</td>
                                        <td className="px-4 py-3 font-bold">{result.totalSS.toFixed(4)}</td>
                                        <td className="px-4 py-3 font-bold">{result.totalDf}</td>
                                        <td className="px-4 py-3"></td>
                                        <td className="px-4 py-3"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Detailed Working */}
                    <Card className="border border-gray-100 shadow-sm">
                        <h4
                            className="font-semibold mb-6 text-lg"
                            style={{ fontFamily: "var(--font-serif)" }}
                        >
                            Step-by-Step Calculation
                        </h4>

                        <div className="space-y-8">
                            {/* Step 1: Means */}
                            <div>
                                <h5 className="font-medium text-[var(--color-ink)] mb-3">Step 1: Group Means and Overall Mean</h5>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm font-mono text-[var(--color-ink-light)] space-y-2">
                                    <div>
                                        <strong>Grand Mean (X̄):</strong> {result.grandSum.toFixed(2)} / {result.grandN} = <strong>{(result.grandSum / result.grandN).toFixed(4)}</strong>
                                    </div>
                                    <div className="h-px bg-gray-200 my-2" />
                                    {result.groupStats.map((g, i) => (
                                        <div key={i}>
                                            Group {i + 1} Mean: {g.sum.toFixed(2)} / {g.n} = <strong>{g.mean.toFixed(4)}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Step 2: Sum of Squares */}
                            <div>
                                <h5 className="font-medium text-[var(--color-ink)] mb-3">Step 2: Sum of Squares</h5>
                                <div className="space-y-4">
                                    {/* SS Total */}
                                    <div className="p-4 border border-gray-100 rounded-xl bg-white">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase tracking-wide mb-2">SS Total</div>
                                        <MathBlock formula={`\\sum (X - \\bar{X}_{grand})^2`} />
                                        <div className="mt-3 text-sm font-mono text-[var(--color-ink-light)] bg-gray-50 p-3 rounded-lg">
                                            <div className="mb-2">
                                                = {result.groupStats.flatMap((g, groupIdx) => {
                                                    const grandMean = result.grandSum / result.grandN;
                                                    // We need raw data - reconstruct from groupStats
                                                    return `Group ${groupIdx + 1} terms`;
                                                }).join(' + ')}
                                            </div>
                                            <div className="text-xs text-[var(--color-ink-light)] mb-2">
                                                Each term: (observation - {(result.grandSum / result.grandN).toFixed(2)})²
                                            </div>
                                            <div className="font-semibold text-[var(--color-ink)]">= <strong>{result.totalSS.toFixed(4)}</strong></div>
                                        </div>
                                    </div>
                                    
                                    {/* SS Between */}
                                    <div className="p-4 border border-gray-100 rounded-xl bg-white">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase tracking-wide mb-2">SS Between (Treatment)</div>
                                        <MathBlock formula={`\\sum n_i (\\bar{X}_i - \\bar{X}_{grand})^2`} />
                                        <div className="mt-3 text-sm font-mono text-[var(--color-ink-light)] bg-gray-50 p-3 rounded-lg">
                                            <div className="space-y-1">
                                                {result.groupStats.map((g, i) => {
                                                    const grandMean = result.grandSum / result.grandN;
                                                    const term = g.n * Math.pow(g.mean - grandMean, 2);
                                                    return (
                                                        <div key={i}>
                                                            Group {i + 1}: {g.n} × ({g.mean.toFixed(2)} - {grandMean.toFixed(2)})² = {g.n} × {Math.pow(g.mean - grandMean, 2).toFixed(4)} = {term.toFixed(4)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="h-px bg-gray-200 my-2" />
                                            <div className="font-semibold text-[var(--color-ink)]">
                                                = {result.groupStats.map((g, i) => {
                                                    const grandMean = result.grandSum / result.grandN;
                                                    return (g.n * Math.pow(g.mean - grandMean, 2)).toFixed(4);
                                                }).join(' + ')} = <strong>{result.ssBetween.toFixed(4)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* SS Within */}
                                    <div className="p-4 border border-gray-100 rounded-xl bg-white">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase tracking-wide mb-2">SS Within (Error)</div>
                                        <MathBlock formula={`SS_{total} - SS_{between}`} />
                                        <div className="mt-3 text-sm font-mono text-[var(--color-ink-light)] bg-gray-50 p-3 rounded-lg">
                                            <div>= {result.totalSS.toFixed(4)} - {result.ssBetween.toFixed(4)}</div>
                                            <div className="font-semibold text-[var(--color-ink)]">= <strong>{result.ssWithin.toFixed(4)}</strong></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: MS and F */}
                            <div>
                                <h5 className="font-medium text-[var(--color-ink)] mb-3">Step 3: Mean Squares & F-Statistic</h5>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-gray-100 bg-white">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase tracking-wide mb-1">Degrees of Freedom</div>
                                        <div className="space-y-1 text-sm">
                                            <div>df_between = {result.groupStats.length} - 1 = <strong>{result.dfBetween}</strong></div>
                                            <div>df_within = {result.grandN} - {result.groupStats.length} = <strong>{result.dfWithin}</strong></div>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100 bg-white">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase tracking-wide mb-1">Mean Squares</div>
                                        <div className="space-y-1 text-sm">
                                            <div>MS_between = {result.ssBetween.toFixed(2)} / {result.dfBetween} = <strong>{result.msBetween.toFixed(4)}</strong></div>
                                            <div>MS_within = {result.ssWithin.toFixed(2)} / {result.dfWithin} = <strong>{result.msWithin.toFixed(4)}</strong></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-[var(--color-accent-mint)]/30 rounded-xl text-center">
                                    <div className="text-sm text-[var(--color-ink-light)]">F = MS_between / MS_within</div>
                                    <div className="text-2xl font-bold text-[var(--color-dot-mint)] mt-1">
                                        {result.fStat.toFixed(4)}
                                    </div>
                                </div>
                            </div>

                            {/* Step 4: Decision */}
                            <div>
                                <h5 className="font-medium text-[var(--color-ink)] mb-3">Step 4: Decision Rule</h5>
                                <div className="p-4 rounded-xl border border-l-4 border-l-[var(--color-dot-mint)] border-gray-100 bg-white text-sm">
                                    <p className="mb-2">
                                        Compare F = <strong>{result.fStat.toFixed(4)}</strong> with F_critical (df1={result.dfBetween}, df2={result.dfWithin}) at your chosen α level.
                                    </p>
                                    <p className="text-[var(--color-ink-light)]">
                                        If F {'>'} F_critical, reject the null hypothesis (at least one group mean is different).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
