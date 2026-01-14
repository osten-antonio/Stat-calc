import React, { useState } from "react";
import { calculateOneWayAnova, type OneWayResult } from "./anova-utils";

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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    One-Way ANOVA
                </h2>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group, index) => (
                        <div key={index} className="relative group">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Group {index + 1} Data
                            </label>
                            <textarea
                                value={group}
                                onChange={(e) => handleGroupChange(index, e.target.value)}
                                placeholder="10, 12, 15..."
                                className="w-full h-32 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all resize-none font-mono text-sm"
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

                    <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer group" onClick={addGroup}>
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">Add Group</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleCalculate}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform active:scale-95 transition-all text-sm uppercase tracking-wide"
                    >
                        Calculate F-Statistic
                    </button>
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-800 animate-pulse">
                        {error}
                    </div>
                )}
            </div>

            {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Summary Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            ANOVA Summary Table
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Source of Variation</th>
                                        <th scope="col" className="px-6 py-3">SS</th>
                                        <th scope="col" className="px-6 py-3">df</th>
                                        <th scope="col" className="px-6 py-3">MS</th>
                                        <th scope="col" className="px-6 py-3">F</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            Between Groups
                                        </td>
                                        <td className="px-6 py-4">{result.ssBetween.toFixed(4)}</td>
                                        <td className="px-6 py-4">{result.dfBetween}</td>
                                        <td className="px-6 py-4">{result.msBetween.toFixed(4)}</td>
                                        <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{result.fStat.toFixed(4)}</td>
                                    </tr>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            Within Groups (Error)
                                        </td>
                                        <td className="px-6 py-4">{result.ssWithin.toFixed(4)}</td>
                                        <td className="px-6 py-4">{result.dfWithin}</td>
                                        <td className="px-6 py-4">{result.msWithin.toFixed(4)}</td>
                                        <td className="px-6 py-4">-</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-600">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Step-by-Step Calculation (Deviation Method)
                        </h3>

                        {/* Step 1: Means */}
                        <div className="mb-8">
                            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Step 1: Group Means and Overall Mean</h4>

                            <div className="space-y-4 text-sm font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                <div>
                                    <div className="font-bold text-gray-800 dark:text-gray-200 mb-1">Calculate the grand mean (X̄):</div>
                                    <div>Sum = {result.grandSum.toFixed(2)}</div>
                                    <div>N = {result.grandN}</div>
                                    <div className="mt-1">
                                        X̄ = {result.grandSum.toFixed(2)} / {result.grandN} = <strong>{(result.grandSum / result.grandN).toFixed(4)}</strong>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <div className="font-bold text-gray-800 dark:text-gray-200 mb-1">Calculate the group means:</div>
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
                            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Step 2: Sum of Squares</h4>

                            {/* SS Total */}
                            <div className="mb-4">
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">Total Sum of Squares (SStotal)</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Formula: ∑(X - GrandMean)²</p>
                                <div className="p-3 bg-white dark:bg-gray-800 border rounded font-mono text-sm overflow-x-auto">
                                    {/* Show first 3 deviations for illustration */}
                                    {groups.flat().slice(0, 3).map((val, idx) => (
                                        <span key={idx}>({val} - {(result.grandSum / result.grandN).toFixed(2)})² + </span>
                                    ))}
                                    <span>...</span>
                                    <div className="mt-2 font-bold text-gray-800 dark:text-blue-400">
                                        = {result.totalSS.toFixed(4)}
                                    </div>
                                </div>
                            </div>

                            {/* SS Between */}
                            <div className="mb-4">
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">Between-Groups Sum of Squares (SSbetween)</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Formula: ∑ n_group * (Mean_group - GrandMean)²</p>
                                <div className="p-3 bg-white dark:bg-gray-800 border rounded font-mono text-sm overflow-x-auto">
                                    {result.groupStats.map((g, i) => (
                                        <span key={i}>
                                            {g.n} * ({g.mean.toFixed(2)} - {(result.grandSum / result.grandN).toFixed(2)})²
                                            {i < result.groupStats.length - 1 ? " + " : ""}
                                        </span>
                                    ))}
                                    <div className="mt-2 font-bold text-gray-800 dark:text-blue-400">
                                        = {result.ssBetween.toFixed(4)}
                                    </div>
                                </div>
                            </div>

                            {/* SS Within */}
                            <div className="mb-4">
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">Within-Groups Sum of Squares (SSwithin)</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Formula: SStotal - SSbetween</p>
                                <div className="p-3 bg-white dark:bg-gray-800 border rounded font-mono text-sm">
                                    {result.totalSS.toFixed(4)} - {result.ssBetween.toFixed(4)}
                                    <div className="mt-2 font-bold text-gray-800 dark:text-blue-400">
                                        = {result.ssWithin.toFixed(4)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: MS and F */}
                        <div className="mb-8">
                            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Step 3: Calculate Mean Squares and F-Statistic</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 border rounded bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                    <strong>Degrees of Freedom (df)</strong>
                                    <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        <li>df_between = k - 1 = {result.groupStats.length} - 1 = {result.dfBetween}</li>
                                        <li>df_within = N - k = {result.grandN} - {result.groupStats.length} = {result.dfWithin}</li>
                                    </ul>
                                </div>
                                <div className="p-3 border rounded bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                    <strong>Mean Squares (MS)</strong>
                                    <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        <li>MS_between = {result.ssBetween.toFixed(2)} / {result.dfBetween} = {result.msBetween.toFixed(4)}</li>
                                        <li>MS_within = {result.ssWithin.toFixed(2)} / {result.dfWithin} = {result.msWithin.toFixed(4)}</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/50">
                                <div className="text-center">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">F-Statistic = MS_between / MS_within</span>
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                                        {result.msBetween.toFixed(2)} / {result.msWithin.toFixed(2)} ≈ {result.fStat.toFixed(4)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4: Decision */}
                        <div>
                            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Step 4: Decision</h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400 border-l-4 border-purple-500 pl-4 bg-gray-50 dark:bg-gray-900 p-3 rounded-r">
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
    );
}
