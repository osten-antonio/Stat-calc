import { useState, useMemo } from "react";
import type { Route } from "./+types/descriptive-means";
import { BackgroundGraph } from "../components/background-graph";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Special Means Calculator" },
        { name: "description", content: "Calculate Trimean, Geometric Mean, and Trimmed Mean" },
    ];
}

export default function DescriptiveMeans() {
    // --- State for Special Means ---
    const [trimeanData, setTrimeanData] = useState<string>("10, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 50");
    const [geoRates, setGeoRates] = useState<string>("5, 10, -3, 6");
    const [trimmedData, setTrimmedData] = useState<string>("65, 70, 72, 75, 80, 85, 90, 92, 95, 100");
    const [trimPercent, setTrimPercent] = useState<number>(10);

    // --- Calculations ---

    // Trimean
    const trimeanResults = useMemo(() => {
        const numbers = trimeanData.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b);
        if (numbers.length < 3) return null;

        const n = numbers.length;
        // Median (Q2)
        const mid = Math.floor(n / 2);
        const median = n % 2 !== 0 ? numbers[mid] : (numbers[mid - 1] + numbers[mid]) / 2;

        const lowerHalf = numbers.slice(0, mid);
        const upperHalf = n % 2 !== 0 ? numbers.slice(mid + 1) : numbers.slice(mid);

        const getMedian = (arr: number[]) => {
            if (arr.length === 0) return 0;
            const m = Math.floor(arr.length / 2);
            return arr.length % 2 !== 0 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
        };

        const q1 = getMedian(lowerHalf);
        const q3 = getMedian(upperHalf);
        const trimean = (q1 + 2 * median + q3) / 4;

        return { numbers, median, q1, q3, trimean };
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

        return { factors, product, geoMeanFactor, geoMeanPercent };
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
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans">
            <BackgroundGraph />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8 fade-in text-center">
                    <h1 className="text-4xl font-extrabold mb-4 text-[var(--color-ink)]" style={{ fontFamily: "var(--font-serif)" }}>
                        Special Means
                    </h1>
                    <p className="max-w-2xl mx-auto text-[var(--color-ink-light)]">
                        Advanced mean calculations including Trimean, Geometric Mean, and Trimmed Mean.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Trimean */}
                    <div
                        className="p-8 rounded-2xl shadow-sm fade-in delay-100"
                        style={{ backgroundColor: "var(--color-accent-blue)" }}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-[var(--color-ink)] flex items-center gap-2">
                            <span className="w-2 h-6 rounded-full" style={{ backgroundColor: "var(--color-dot-blue)" }}></span>
                            Trimean
                        </h2>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)] mb-2">
                                Data Set (comma separated)
                            </label>
                            <input
                                type="text"
                                value={trimeanData}
                                onChange={e => setTrimeanData(e.target.value)}
                                className="w-full p-3 rounded-lg border-2 bg-white focus:ring-0 outline-none text-[var(--color-ink)] font-medium"
                                style={{ borderColor: "var(--color-dot-blue)" }}
                            />
                        </div>
                        {trimeanResults && (
                            <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <div className="flex justify-between text-sm text-[var(--color-ink-light)] mb-4 font-mono overflow-x-auto">
                                    Sorted: {trimeanResults.numbers.join(", ")}
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-[var(--color-ink-light)]">Q1</div>
                                        <div className="font-bold text-lg">{trimeanResults.q1}</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-[var(--color-ink-light)]">Median (Q2)</div>
                                        <div className="font-bold text-lg">{trimeanResults.median}</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-[var(--color-ink-light)]">Q3</div>
                                        <div className="font-bold text-lg">{trimeanResults.q3}</div>
                                    </div>
                                </div>
                                <div className="text-center mb-4">
                                    <p className="text-sm font-mono text-[var(--color-ink-light)]">TRI = (Q1 + 2Q2 + Q3) / 4</p>
                                </div>
                                <div className="flex items-center justify-center gap-3 text-xl font-bold">
                                    <span className="text-[var(--color-ink-light)]">Result:</span>
                                    <span style={{ color: "var(--color-dot-blue)" }}>{trimeanResults.trimean.toFixed(4)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Geometric Mean */}
                    <div
                        className="p-8 rounded-2xl shadow-sm fade-in delay-200"
                        style={{ backgroundColor: "var(--color-accent-blue)" }}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-[var(--color-ink)] flex items-center gap-2">
                            <span className="w-2 h-6 rounded-full" style={{ backgroundColor: "var(--color-dot-blue)" }}></span>
                            Geometric Mean (Growth Rates)
                        </h2>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)] mb-2">
                                Growth Rates % (comma separated)
                            </label>
                            <input
                                type="text"
                                value={geoRates}
                                onChange={e => setGeoRates(e.target.value)}
                                className="w-full p-3 rounded-lg border-2 bg-white focus:ring-0 outline-none text-[var(--color-ink)] font-medium"
                                style={{ borderColor: "var(--color-dot-blue)" }}
                            />
                        </div>
                        {geoMeanResults && (
                            <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-[var(--color-ink-light)] mb-1">Growth Factor</p>
                                        <p className="text-xs text-[var(--color-ink-light)] font-mono mb-2">GF = [Π(1+r)]^(1/n)</p>
                                        <p className="text-lg font-bold text-[var(--color-ink)]">{geoMeanResults.geoMeanFactor.toFixed(4)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-[var(--color-ink-light)] mb-1">Mean Growth Rate</p>
                                        <p className="text-xs text-[var(--color-ink-light)] font-mono mb-2">Rate = (GF - 1) * 100</p>
                                        <p className="text-3xl font-extrabold" style={{ color: "var(--color-dot-blue)" }}>
                                            {geoMeanResults.geoMeanPercent.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Trimmed Mean */}
                    <div
                        className="p-8 rounded-2xl shadow-sm fade-in delay-300"
                        style={{ backgroundColor: "var(--color-accent-blue)" }}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-[var(--color-ink)] flex items-center gap-2">
                            <span className="w-2 h-6 rounded-full" style={{ backgroundColor: "var(--color-dot-blue)" }}></span>
                            Trimmed Mean
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)] mb-2">
                                    Data Set
                                </label>
                                <input
                                    type="text"
                                    value={trimmedData}
                                    onChange={e => setTrimmedData(e.target.value)}
                                    className="w-full p-3 rounded-lg border-2 bg-white focus:ring-0 outline-none text-[var(--color-ink)] font-medium"
                                    style={{ borderColor: "var(--color-dot-blue)" }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)] mb-2">
                                    Trim %
                                </label>
                                <input
                                    type="number"
                                    value={trimPercent}
                                    onChange={e => setTrimPercent(parseFloat(e.target.value) || 0)}
                                    className="w-full p-3 rounded-lg border-2 bg-white focus:ring-0 outline-none text-[var(--color-ink)] font-medium"
                                    style={{ borderColor: "var(--color-dot-blue)" }}
                                />
                            </div>
                        </div>

                        {trimmedMeanResults && !trimmedMeanResults.error && (
                            <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <div className="mb-4">
                                    <p className="text-sm text-[var(--color-ink-light)] font-mono mb-2">
                                        Sorted: {trimmedMeanResults.numbers.join(", ")}
                                    </p>
                                    <p className="text-sm font-medium text-[var(--color-ink)]">
                                        Removed {trimmedMeanResults.trimCount} value(s) from each end.
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="text-sm text-[var(--color-ink-light)]">
                                        Remaining Sum: {trimmedMeanResults.remainingSum?.toFixed(2)}
                                    </div>
                                    <div className="text-3xl font-extrabold" style={{ color: "var(--color-dot-blue)" }}>
                                        {trimmedMeanResults.mean?.toFixed(3)}
                                    </div>
                                </div>
                            </div>
                        )}
                        {trimmedMeanResults?.error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg font-medium border border-red-100">
                                {trimmedMeanResults.error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
