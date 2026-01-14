import { useState, useMemo } from "react";
import type { Route } from "./+types/descriptive";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Descriptive Statistics Calculator" },
        { name: "description", content: "Calculators for Descriptive Statistics and Special Means" },
    ];
}

export default function DescriptiveCalculators() {
    // --- State for Descriptive Statistics ---
    const [dataSet, setDataSet] = useState<string>("10, 15, 20, 25, 30"); // Comma separated
    const [zScoreTarget, setZScoreTarget] = useState<number>(25);

    // --- State for Special Means ---
    const [trimeanData, setTrimeanData] = useState<string>("10, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 50");
    const [geoRates, setGeoRates] = useState<string>("5, 10, -3, 6");
    const [trimmedData, setTrimmedData] = useState<string>("65, 70, 72, 75, 80, 85, 90, 92, 95, 100");
    const [trimPercent, setTrimPercent] = useState<number>(10);

    // --- Calculations ---

    // 1. Descriptive Statistics
    const statsResults = useMemo(() => {
        const numbers = dataSet.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        if (numbers.length === 0) return null;

        const n = numbers.length;
        const mean = numbers.reduce((a, b) => a + b, 0) / n;

        const sumSqDiff = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
        const variance = n > 1 ? sumSqDiff / (n - 1) : 0;
        const stdDev = Math.sqrt(variance);

        // Z-score = (x - mean) / stdDev
        const zScore = stdDev !== 0 ? (zScoreTarget - mean) / stdDev : 0;

        return { mean, variance, stdDev, zScore, n };
    }, [dataSet, zScoreTarget]);

    // 2. Special Means calculations

    // Trimean
    const trimeanResults = useMemo(() => {
        const numbers = trimeanData.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b);
        if (numbers.length < 3) return null;

        const n = numbers.length;
        // Median (Q2)
        const mid = Math.floor(n / 2);
        const median = n % 2 !== 0 ? numbers[mid] : (numbers[mid - 1] + numbers[mid]) / 2;

        // Implementation Note: User's example excludes median for quartiles if odd length.
        // Lower Half
        const lowerHalf = numbers.slice(0, mid); // Excludes mid if odd (mid is index)
        const upperHalf = n % 2 !== 0 ? numbers.slice(mid + 1) : numbers.slice(mid);

        const getMedian = (arr: number[]) => {
            if (arr.length === 0) return 0;
            const m = Math.floor(arr.length / 2);
            return arr.length % 2 !== 0 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
        };

        const q1 = getMedian(lowerHalf);
        const q3 = getMedian(upperHalf);
        const trimean = (q1 + 2 * median + q3) / 4;

        return { numbers, median, q1, q3, trimean, lowerHalf, upperHalf };
    }, [trimeanData]);

    // Geometric Mean (Growth Rates)
    const geoMeanResults = useMemo(() => {
        const rates = geoRates.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        if (rates.length === 0) return null;

        const factors = rates.map(r => 1 + (r / 100));
        const product = factors.reduce((a, b) => a * b, 1);
        const n = rates.length;

        // Geometric Mean of factors
        const geoMeanFactor = Math.pow(product, 1 / n);

        // Convert back to %
        const geoMeanPercent = (geoMeanFactor - 1) * 100;

        return { rates, factors, product, geoMeanFactor, geoMeanPercent };
    }, [geoRates]);

    // Trimmed Mean
    const trimmedMeanResults = useMemo(() => {
        const numbers = trimmedData.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b);
        if (numbers.length === 0) return null;

        const n = numbers.length;
        const trimCount = Math.floor(n * (trimPercent / 100));

        if (trimCount * 2 >= n) return { numbers, error: "Trim percentage too high, no data left." };

        const remainingData = numbers.slice(trimCount, n - trimCount);
        const remainingSum = remainingData.reduce((a, b) => a + b, 0);
        const mean = remainingData.length > 0 ? remainingSum / remainingData.length : 0;

        return { numbers, trimCount, remainingData, mean, remainingSum, error: null };
    }, [trimmedData, trimPercent]);

    return (
        <div className="p-8 max-w-5xl mx-auto font-sans text-gray-800 dark:text-gray-100 pb-20 space-y-12">
            <h1 className="text-3xl font-bold mb-6 border-b pb-4 dark:border-gray-700">Descriptive Statistics</h1>

            {/* 1. Descriptive Statistics */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">Descriptive Statistics</h2>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Data Set (comma separated)</label>
                        <input
                            type="text"
                            value={dataSet}
                            onChange={e => setDataSet(e.target.value)}
                            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                            placeholder="10, 20, 32, 12, 10"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Target Value (x) for Z-Score</label>
                        <input
                            type="number"
                            value={zScoreTarget}
                            onChange={e => setZScoreTarget(parseFloat(e.target.value) || 0)}
                            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>

                {statsResults ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-700">
                            <div className="text-sm text-gray-500 mb-1">Mean (μ)</div>
                            <div className="text-xl font-bold">{statsResults.mean.toFixed(2)}</div>
                            <div className="text-xs text-gray-400">Average of {statsResults.n} numbers</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-700">
                            <div className="text-sm text-gray-500 mb-1">Standard Deviation (σ)</div>
                            <div className="text-xl font-bold">{statsResults.stdDev.toFixed(2)}</div>
                            <div className="text-xs text-gray-400">Sample Std Dev</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-700">
                            <div className="text-sm text-gray-500 mb-1">Variance (σ²)</div>
                            <div className="text-xl font-bold">{statsResults.variance.toFixed(2)}</div>
                            <div className="text-xs text-gray-400">Sample Variance</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-700">
                            <div className="text-sm text-gray-500 mb-1">Z-Score</div>
                            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{statsResults.zScore.toFixed(2)}</div>
                            <div className="text-xs text-gray-400">(x - μ) / σ</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-red-500">Invalid data set</div>
                )}
            </section>

            {/* 2. Special Means */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">Special Means</h2>

                <div className="space-y-8">
                    {/* Trimean */}
                    <div className="border bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4">Trimean</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Data Set</label>
                            <input
                                type="text"
                                value={trimeanData}
                                onChange={e => setTrimeanData(e.target.value)}
                                className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        {trimeanResults && (
                            <div className="space-y-2">
                                <div className="text-sm font-mono text-gray-500">Sorted: {trimeanResults.numbers.join(", ")}</div>
                                <div className="grid grid-cols-3 gap-4 text-center my-4">
                                    <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-600">
                                        <div className="text-sm text-gray-400">Q1</div>
                                        <div className="text-lg font-bold">{trimeanResults.q1}</div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-600">
                                        <div className="text-sm text-gray-400">Median (Q2)</div>
                                        <div className="text-lg font-bold">{trimeanResults.median}</div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-600">
                                        <div className="text-sm text-gray-400">Q3</div>
                                        <div className="text-lg font-bold">{trimeanResults.q3}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 justify-center text-lg">
                                    <div className="flex flex-col items-center">
                                        <span className="border-b border-gray-400 dark:border-gray-500 px-2">{trimeanResults.q1} + 2({trimeanResults.median}) + {trimeanResults.q3}</span>
                                        <span>4</span>
                                    </div>
                                    <span>=</span>
                                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{trimeanResults.trimean}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Geometric Mean */}
                    <div className="border bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4">Geometric Mean (Growth Rates)</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Growth Rates % (comma separated)</label>
                            <input
                                type="text"
                                value={geoRates}
                                onChange={e => setGeoRates(e.target.value)}
                                className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        {geoMeanResults && (
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2 items-center text-sm font-mono text-gray-600 dark:text-gray-300">
                                    <span>Factors:</span>
                                    {geoMeanResults.factors.map((f, i) => (
                                        <span key={i} className="bg-white dark:bg-gray-800 px-2 rounded border dark:border-gray-600">{f.toFixed(2)}</span>
                                    ))}
                                </div>
                                <div className="text-sm">Product: {geoMeanResults.product.toFixed(6)}</div>
                                <div className="flex items-center gap-4 text-lg">
                                    <span>GM Factor = {geoMeanResults.geoMeanFactor.toFixed(4)}</span>
                                    <span>→</span>
                                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{geoMeanResults.geoMeanPercent.toFixed(2)}%</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Trimmed Mean */}
                    <div className="border bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4">Trimmed Mean</h3>
                        <div className="grid md:grid-cols-3 gap-6 mb-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Data Set</label>
                                <input
                                    type="text"
                                    value={trimmedData}
                                    onChange={e => setTrimmedData(e.target.value)}
                                    className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Trim Percentage (%)</label>
                                <input
                                    type="number"
                                    value={trimPercent}
                                    onChange={e => setTrimPercent(parseFloat(e.target.value) || 0)}
                                    className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                        </div>
                        {trimmedMeanResults && !trimmedMeanResults.error && (
                            <div className="space-y-2">
                                <div className="text-sm font-mono text-gray-500">Sorted: {trimmedMeanResults.numbers.join(", ")}</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                                    Trimming {trimmedMeanResults.trimCount} value(s) from each end.
                                </div>
                                <div className="text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-600">
                                    Remaining: {trimmedMeanResults.remainingData?.join(", ")}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span>Mean = {trimmedMeanResults.remainingSum} / {trimmedMeanResults.remainingData?.length} = </span>
                                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{trimmedMeanResults.mean?.toFixed(3)}</span>
                                </div>
                            </div>
                        )}
                        {trimmedMeanResults?.error && (
                            <div className="text-red-500 font-bold">{trimmedMeanResults.error}</div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
