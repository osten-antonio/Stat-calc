import { useState, useMemo } from "react";
import type { Route } from "./+types/combinations";
import { BackgroundGraph } from "../components/background-graph";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Combinations Calculator" },
        { name: "description", content: "Calculate Combinations" },
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

export default function Combinations() {
    const [pcN, setPcN] = useState<number>(8); // Total items
    const [pcR, setPcR] = useState<number>(4); // Items to choose

    const comb = useMemo(() => combination(pcN, pcR), [pcN, pcR]);

    return (
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans">
            <BackgroundGraph />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8 fade-in text-center">
                    <h1 className="text-4xl font-extrabold mb-4 text-[var(--color-ink)]" style={{ fontFamily: "var(--font-serif)" }}>
                        Combinations Calculator
                    </h1>
                    <p className="max-w-2xl mx-auto text-[var(--color-ink-light)]">
                        Calculate the number of ways to choose <strong>r</strong> items from a set of <strong>n</strong> distinct items where order <strong>does not</strong> matter.
                    </p>
                </div>

                <div
                    className="mb-8 p-8 rounded-2xl shadow-sm fade-in delay-100"
                    style={{ backgroundColor: "var(--color-accent-peach)" }}
                >
                    <div className="flex flex-wrap gap-8 mb-8 items-center justify-center p-4 rounded-xl border border-[var(--color-dot-peach)] bg-white/50">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)]">
                                Total Items (n)
                            </label>
                            <input
                                type="number"
                                value={pcN}
                                onChange={e => setPcN(parseInt(e.target.value) || 0)}
                                className="w-24 p-2 text-center text-lg font-bold rounded-lg border-2 border-[var(--color-dot-peach)] focus:ring-0 transition-colors outline-none bg-white text-[var(--color-ink)]"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)]">
                                Select (r)
                            </label>
                            <input
                                type="number"
                                value={pcR}
                                onChange={e => setPcR(parseInt(e.target.value) || 0)}
                                className="w-24 p-2 text-center text-lg font-bold rounded-lg border-2 border-[var(--color-dot-peach)] focus:ring-0 transition-colors outline-none bg-white text-[var(--color-ink)]"
                            />
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border bg-white shadow-sm" style={{ borderColor: "var(--color-dot-peach)" }}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-ink)]">
                            <span className="w-2 h-8 rounded-full bg-[var(--color-dot-peach)]"></span>
                            Result
                        </h3>

                        <div className="flex flex-col items-center justify-center space-y-4">
                            <p className="font-mono text-sm text-[var(--color-ink-light)]">C(n, r) = n! / [r!(n-r)!]</p>
                            <div className="text-lg text-[var(--color-ink)]">
                                C({pcN}, {pcR}) = {pcN}! / [{pcR}!({pcN}-{pcR})!]
                            </div>
                            <div className="text-5xl font-extrabold text-[var(--color-dot-peach)]">
                                {comb.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
