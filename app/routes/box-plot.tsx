import { useState, useMemo } from "react";
import type { Route } from "./+types/box-plot";
import { BackgroundGraph } from "../components/background-graph";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Box Plot Calculator" },
        { name: "description", content: "Calculate Box Plot 5-Number Summary and Outliers" },
    ];
}

export default function BoxPlot() {
    const [dataSet, setDataSet] = useState<string>("10, 15, 20, 25, 30"); // Comma separated

    const statsResults = useMemo(() => {
        const numbers = dataSet.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        if (numbers.length === 0) return null;

        const sorted = [...numbers].sort((a, b) => a - b);
        const n = sorted.length;

        const median = (arr: number[]) => {
            const m = arr.length;
            if (m === 0) return 0;
            return m % 2 === 0
                ? (arr[m / 2 - 1] + arr[m / 2]) / 2
                : arr[Math.floor(m / 2)];
        };

        const mid = Math.floor(n / 2);
        const lowerHalf = sorted.slice(0, mid);
        const upperHalf = n % 2 === 0
            ? sorted.slice(mid)
            : sorted.slice(mid + 1);

        const min = sorted[0];
        const q1 = median(lowerHalf);
        const q2 = median(sorted); // median
        const q3 = median(upperHalf);
        const max = sorted[n - 1];

        const iqr = q3 - q1;
        const lowerFence = q1 - 1.5 * iqr;
        const upperFence = q3 + 1.5 * iqr;

        return {
            n,
            min,
            q1,
            median: q2,
            q3,
            max,
            iqr,
            lowerFence,
            upperFence,
        };
    }, [dataSet]);

    return (
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans">
            <BackgroundGraph />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8 fade-in text-center">
                    <h1 className="text-4xl font-extrabold mb-4 text-[var(--color-ink)]" style={{ fontFamily: "var(--font-serif)" }}>
                        Box Plot Calculator
                    </h1>
                    <p className="max-w-2xl mx-auto text-[var(--color-ink-light)]">
                        Calculate the 5-number summary and identify potential outliers using the IQR method.
                    </p>
                </div>

                <div
                    className="mb-8 p-8 rounded-2xl shadow-sm fade-in delay-100"
                    style={{ backgroundColor: "var(--color-accent-blue)" }}
                >
                    <div className="mb-8">
                        <label className="block text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)] mb-2">
                            Data Set (comma separated)
                        </label>
                        <input
                            type="text"
                            value={dataSet}
                            onChange={e => setDataSet(e.target.value)}
                            className="w-full p-3 rounded-lg border-2 bg-white focus:ring-0 outline-none text-[var(--color-ink)] font-medium"
                            style={{ borderColor: "var(--color-dot-blue)" }}
                            placeholder="10, 20, 32, 12, 10"
                        />
                    </div>

                    {statsResults ? (
                        <div className="space-y-6">
                            {/* 5-Number Summary */}
                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-ink)] mb-3 flex items-center gap-2">
                                    <span className="w-2 h-6 rounded-full" style={{ backgroundColor: "var(--color-dot-blue)" }}></span>
                                    5-Number Summary
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="bg-white p-3 rounded-xl border shadow-sm text-center" style={{ borderColor: "var(--color-dot-blue)" }}>
                                        <div className="text-xs uppercase font-bold text-[var(--color-ink-light)] mb-1">Min</div>
                                        <div className="text-xl font-bold text-[var(--color-ink)]">{statsResults.min}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border shadow-sm text-center" style={{ borderColor: "var(--color-dot-blue)" }}>
                                        <div className="text-xs uppercase font-bold text-[var(--color-ink-light)] mb-1">Q1</div>
                                        <div className="text-xl font-bold text-[var(--color-ink)]">{statsResults.q1}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border shadow-sm text-center transform scale-105 shadow-md" style={{ borderColor: "var(--color-dot-blue)" }}>
                                        <div className="text-xs uppercase font-bold text-[var(--color-ink-light)] mb-1">Median</div>
                                        <div className="text-2xl font-extrabold" style={{ color: "var(--color-dot-blue)" }}>{statsResults.median}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border shadow-sm text-center" style={{ borderColor: "var(--color-dot-blue)" }}>
                                        <div className="text-xs uppercase font-bold text-[var(--color-ink-light)] mb-1">Q3</div>
                                        <div className="text-xl font-bold text-[var(--color-ink)]">{statsResults.q3}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border shadow-sm text-center" style={{ borderColor: "var(--color-dot-blue)" }}>
                                        <div className="text-xs uppercase font-bold text-[var(--color-ink-light)] mb-1">Max</div>
                                        <div className="text-xl font-bold text-[var(--color-ink)]">{statsResults.max}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Outlier Analysis */}
                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-ink)] mb-3 flex items-center gap-2">
                                    <span className="w-2 h-6 rounded-full" style={{ backgroundColor: "var(--color-dot-blue)" }}></span>
                                    Outlier Analysis (IQR Method)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-blue)" }}>
                                        <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">IQR</div>
                                        <div className="text-xs text-[var(--color-ink-light)] font-mono mb-2">Q3 - Q1</div>
                                        <div className="text-2xl font-bold text-[var(--color-ink)]">{statsResults.iqr.toFixed(2)}</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-blue)" }}>
                                        <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Lower Fence</div>
                                        <div className="text-xs text-[var(--color-ink-light)] font-mono mb-2">Q1 - 1.5 * IQR</div>
                                        <div className="text-2xl font-bold text-[var(--color-ink)]">{statsResults.lowerFence.toFixed(2)}</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-blue)" }}>
                                        <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Upper Fence</div>
                                        <div className="text-xs text-[var(--color-ink-light)] font-mono mb-2">Q3 + 1.5 * IQR</div>
                                        <div className="text-2xl font-bold text-[var(--color-ink)]">{statsResults.upperFence.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-4 text-red-500 font-medium bg-red-50 rounded-lg">
                            Please enter valid numerical data.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
