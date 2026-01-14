import { useState, useMemo } from "react";
import type { Route } from "./+types/descriptive-basic";
import { BackgroundGraph } from "../components/background-graph";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Descriptive Statistics" },
        { name: "description", content: "Calculate Mean, Variance, Standard Deviation, and Z-Score" },
    ];
}

export default function DescriptiveBasic() {
    const [dataSet, setDataSet] = useState<string>("10, 15, 20, 25, 30"); // Comma separated
    const [zScoreTarget, setZScoreTarget] = useState<number>(25);

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

    return (
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans">
            <BackgroundGraph />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8 fade-in text-center">
                    <h1 className="text-4xl font-extrabold mb-4 text-[var(--color-ink)]" style={{ fontFamily: "var(--font-serif)" }}>
                        Descriptive Statistics
                    </h1>
                    <p className="max-w-2xl mx-auto text-[var(--color-ink-light)]">
                        Calculate basic statistical measures including Mean, Variance, Standard Deviation, and Z-Scores.
                    </p>
                </div>

                <div
                    className="mb-8 p-8 rounded-2xl shadow-sm fade-in delay-100"
                    style={{ backgroundColor: "var(--color-accent-blue)" }}
                >
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="md:col-span-2">
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
                        <div>
                            <label className="block text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)] mb-2">
                                Target Value (x)
                            </label>
                            <input
                                type="number"
                                value={zScoreTarget}
                                onChange={e => setZScoreTarget(parseFloat(e.target.value) || 0)}
                                className="w-full p-3 rounded-lg border-2 bg-white focus:ring-0 outline-none text-[var(--color-ink)] font-medium"
                                style={{ borderColor: "var(--color-dot-blue)" }}
                            />
                        </div>
                    </div>

                    {statsResults ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Mean (μ)</div>
                                <div className="text-xs text-[var(--color-ink-light)] font-mono mb-2">μ = Σx / N</div>
                                <div className="text-2xl font-bold text-[var(--color-ink)]">{statsResults.mean.toFixed(2)}</div>
                                <div className="text-xs text-[var(--color-ink-light)] mt-1">N = {statsResults.n}</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Standard Dev (σ)</div>
                                <div className="text-xs text-[var(--color-ink-light)] font-mono mb-2">σ = √[Σ(x-μ)²/(N-1)]</div>
                                <div className="text-2xl font-bold text-[var(--color-ink)]">{statsResults.stdDev.toFixed(2)}</div>
                                <div className="text-xs text-[var(--color-ink-light)] mt-1">Sample</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Variance (σ²)</div>
                                <div className="text-xs text-[var(--color-ink-light)] font-mono mb-2">σ² = Σ(x-μ)²/(N-1)</div>
                                <div className="text-2xl font-bold text-[var(--color-ink)]">{statsResults.variance.toFixed(2)}</div>
                                <div className="text-xs text-[var(--color-ink-light)] mt-1">Sample</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <div className="text-sm font-semibold text-[var(--color-ink-light)] mb-1">Z-Score</div>
                                <div className="text-xs text-[var(--color-ink-light)] font-mono mb-2">z = (x - μ) / σ</div>
                                <div className="text-2xl font-bold" style={{ color: "var(--color-dot-blue)" }}>{statsResults.zScore.toFixed(2)}</div>
                                <div className="text-xs text-[var(--color-ink-light)] mt-1">Target x = {zScoreTarget}</div>
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
