import { useState, useMemo } from "react";
import type { Route } from "./+types/independent";
import { BackgroundGraph } from "../components/background-graph";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Independent Events Calculator" },
        { name: "description", content: "Calculate Probability of Independent Events" },
    ];
}

export default function IndependentEvents() {
    const [indProbA, setIndProbA] = useState<string>("1/13");
    const [indProbB, setIndProbB] = useState<string>("1/2");

    const indResults = useMemo(() => {
        const parseFraction = (s: string) => {
            if (s.includes('/')) {
                const [num, den] = s.split('/').map(Number);
                return den !== 0 ? num / den : 0;
            }
            return parseFloat(s) || 0;
        };
        const pA = parseFraction(indProbA);
        const pB = parseFraction(indProbB);
        const pAnd = pA * pB;
        return { pA, pB, pAnd };
    }, [indProbA, indProbB]);

    return (
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans">
            <BackgroundGraph />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8 fade-in text-center">
                    <h1 className="text-4xl font-extrabold mb-4 text-[var(--color-ink)]" style={{ fontFamily: "var(--font-serif)" }}>
                        Independent Events
                    </h1>
                    <p className="max-w-2xl mx-auto text-[var(--color-ink-light)]">
                        Calculate the probability of two independent events occurring together.
                    </p>
                </div>

                <div
                    className="mb-8 p-8 rounded-2xl shadow-sm fade-in delay-100"
                    style={{ backgroundColor: "var(--color-accent-pink)" }}
                >
                    <div className="flex flex-wrap gap-8 mb-8 items-end justify-center p-4 rounded-xl border border-[var(--color-dot-pink)] bg-white/50">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)]">
                                Prob P(A)
                            </label>
                            <input
                                type="text"
                                value={indProbA}
                                onChange={e => setIndProbA(e.target.value)}
                                className="w-32 p-2 text-center text-lg font-bold rounded-lg border-2 border-[var(--color-dot-pink)] focus:ring-0 transition-colors outline-none bg-white text-[var(--color-ink)]"
                                placeholder="e.g. 1/13"
                            />
                        </div>
                        <div className="mb-2 text-2xl font-bold text-[var(--color-dot-pink)]">×</div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink)]">
                                Prob P(B)
                            </label>
                            <input
                                type="text"
                                value={indProbB}
                                onChange={e => setIndProbB(e.target.value)}
                                className="w-32 p-2 text-center text-lg font-bold rounded-lg border-2 border-[var(--color-dot-pink)] focus:ring-0 transition-colors outline-none bg-white text-[var(--color-ink)]"
                                placeholder="e.g. 0.5"
                            />
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border bg-white shadow-sm" style={{ borderColor: "var(--color-dot-pink)" }}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-ink)]">
                            <span className="w-2 h-8 rounded-full bg-[var(--color-dot-pink)]"></span>
                            Result
                        </h3>

                        <div className="flex flex-col items-center justify-center space-y-4">
                            <p className="font-mono text-sm text-[var(--color-ink-light)]">P(A and B) = P(A) × P(B)</p>
                            <div className="text-lg flex items-center gap-2 text-[var(--color-ink)]">
                                <span>{indResults.pA.toFixed(4)}</span>
                                <span>×</span>
                                <span>{indResults.pB.toFixed(4)}</span>
                                <span>=</span>
                                <span className="text-3xl font-extrabold text-[var(--color-dot-pink)] ml-2">{indResults.pAnd.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
