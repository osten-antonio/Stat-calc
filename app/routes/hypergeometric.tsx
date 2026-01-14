import { useState, useMemo } from "react";
import type { Route } from "./+types/hypergeometric";
import { BackgroundGraph } from "../components/background-graph";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Hypergeometric Calculator" },
        { name: "description", content: "Calculate Hypergeometric Probability" },
    ];
}

const factorial = (n: number): number => {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
};

const combination = (n: number, r: number): number => {
    if (r < 0 || r > n) return 0;
    return factorial(n) / (factorial(r) * factorial(n - r));
};

export default function Hypergeometric() {
    const [hypN, setHypN] = useState<number>(25); // Population Size (N)
    const [hypK, setHypK] = useState<number>(10); // Population Successes (k)
    const [hypSmallN, setHypSmallN] = useState<number>(5); // Sample Size (n)
    const [hypX, setHypX] = useState<number>(3);  // Sample Successes (x)

    const hypResults = useMemo(() => {
        // P(x) = [C(k, x) * C(N-k, n-x)] / C(N, n)
        const term1 = combination(hypK, hypX); // C(k, x)
        const term2 = combination(hypN - hypK, hypSmallN - hypX); // C(N-k, n-x)
        const denominator = combination(hypN, hypSmallN); // C(N, n)
        const prob = denominator === 0 ? 0 : (term1 * term2) / denominator;
        return { term1, term2, denominator, prob };
    }, [hypN, hypK, hypSmallN, hypX]);

    return (
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans">
            <BackgroundGraph />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8 fade-in text-center">
                    <h1 className="text-4xl font-extrabold mb-4 text-[var(--color-ink)]" style={{ fontFamily: "var(--font-serif)" }}>
                        Hypergeometric Probability
                    </h1>
                    <p className="max-w-2xl mx-auto text-[var(--color-ink-light)]">
                        Probability of <strong>x</strong> successes in a sample of size <strong>n</strong> from population <strong>N</strong> with <strong>k</strong> total successes.
                    </p>
                </div>

                <div
                    className="mb-8 p-8 rounded-2xl shadow-sm fade-in delay-100"
                    style={{ backgroundColor: "var(--color-accent-pink)" }}
                >
                    <div className="flex flex-wrap gap-6 mb-8 items-center justify-center p-4 rounded-xl border border-[var(--color-dot-pink)] bg-white/50">
                        <div className="flex flex-col items-center">
                            <label className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)] mb-1">
                                Population (N)
                            </label>
                            <input
                                type="number"
                                value={hypN}
                                onChange={e => setHypN(parseInt(e.target.value) || 0)}
                                className="w-24 p-2 text-center text-lg font-bold rounded-lg border-2 border-[var(--color-dot-pink)] focus:ring-0 transition-colors outline-none bg-white text-[var(--color-ink)]"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <label className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)] mb-1">
                                Total Successes (k)
                            </label>
                            <input
                                type="number"
                                value={hypK}
                                onChange={e => setHypK(parseInt(e.target.value) || 0)}
                                className="w-24 p-2 text-center text-lg font-bold rounded-lg border-2 border-[var(--color-dot-pink)] focus:ring-0 transition-colors outline-none bg-white text-[var(--color-ink)]"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <label className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)] mb-1">
                                Sample Size (n)
                            </label>
                            <input
                                type="number"
                                value={hypSmallN}
                                onChange={e => setHypSmallN(parseInt(e.target.value) || 0)}
                                className="w-24 p-2 text-center text-lg font-bold rounded-lg border-2 border-[var(--color-dot-pink)] focus:ring-0 transition-colors outline-none bg-white text-[var(--color-ink)]"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <label className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)] mb-1">
                                Target (x)
                            </label>
                            <input
                                type="number"
                                value={hypX}
                                onChange={e => setHypX(parseInt(e.target.value) || 0)}
                                className="w-24 p-2 text-center text-lg font-bold rounded-lg border-2 border-[var(--color-dot-pink)] focus:ring-0 transition-colors outline-none bg-white text-[var(--color-ink)]"
                            />
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border bg-white shadow-sm" style={{ borderColor: "var(--color-dot-pink)" }}>
                        <div className="mb-4 text-center">
                            <p className="font-mono text-sm mb-2 text-[var(--color-ink-light)]">P(x) = [C(k, x) × C(N-k, n-x)] / C(N, n)</p>
                            <p className="font-mono text-sm text-[var(--color-ink)]">
                                P({hypX}) = [C({hypK}, {hypX}) × C({hypN}-{hypK}, {hypSmallN}-{hypX})] / C({hypN}, {hypSmallN})
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-lg font-medium text-[var(--color-ink)]">
                            <span>Calculation:</span>
                            <div className="flex flex-col items-center">
                                <span className="border-b border-gray-400 px-2 text-sm">{hypResults.term1.toLocaleString()} × {hypResults.term2.toLocaleString()}</span>
                                <span className="text-sm">{hypResults.denominator.toLocaleString()}</span>
                            </div>
                            <span>=</span>
                            <span className="text-3xl font-extrabold text-[var(--color-dot-pink)]">{hypResults.prob.toFixed(4)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
