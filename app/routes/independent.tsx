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
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans text-gray-800 dark:text-gray-100">
            <BackgroundGraph />
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-6 fade-in">
                    <h1 className="text-3xl font-bold mb-2">Independent Events</h1>
                    <p className="text-gray-600 dark:text-gray-400">Calculate the probability of two independent events occurring together.</p>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 fade-in delay-100">
                    <div className="flex flex-wrap gap-4 mb-6 items-end">
                        <div>
                            <label className="block text-sm font-medium mb-1">Prob P(A)</label>
                            <input type="text" value={indProbA} onChange={e => setIndProbA(e.target.value)} className="p-2 border rounded w-32 dark:bg-gray-700 dark:border-gray-600" placeholder="e.g. 1/13" />
                        </div>
                        <span className="mb-3 font-bold">×</span>
                        <div>
                            <label className="block text-sm font-medium mb-1">Prob P(B)</label>
                            <input type="text" value={indProbB} onChange={e => setIndProbB(e.target.value)} className="p-2 border rounded w-32 dark:bg-gray-700 dark:border-gray-600" placeholder="e.g. 0.5" />
                        </div>
                    </div>

                    <div className="bg-gray-50/50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-700">
                        <p className="font-mono text-sm mb-2">P(A and B) = P(A) × P(B)</p>
                        <div className="text-lg">
                            {indResults.pA.toFixed(4)} × {indResults.pB.toFixed(4)} = <span className="text-2xl font-bold text-green-600 dark:text-green-400 ml-2">{indResults.pAnd.toFixed(4)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
