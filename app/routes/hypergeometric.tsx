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
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans text-gray-800 dark:text-gray-100">
            <BackgroundGraph />
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-6 fade-in">
                    <h1 className="text-3xl font-bold mb-2">Hypergeometric Probability</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Probability of <strong>x</strong> successes in a sample of size <strong>n</strong> from population <strong>N</strong> with <strong>k</strong> total successes.
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 fade-in delay-100">
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Population (N)</label>
                            <input type="number" value={hypN} onChange={e => setHypN(parseInt(e.target.value) || 0)} className="p-2 border rounded w-24 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Total Successes (k)</label>
                            <input type="number" value={hypK} onChange={e => setHypK(parseInt(e.target.value) || 0)} className="p-2 border rounded w-24 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sample Size (n)</label>
                            <input type="number" value={hypSmallN} onChange={e => setHypSmallN(parseInt(e.target.value) || 0)} className="p-2 border rounded w-24 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Target Successes (x)</label>
                            <input type="number" value={hypX} onChange={e => setHypX(parseInt(e.target.value) || 0)} className="p-2 border rounded w-24 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>

                    <div className="bg-gray-50/50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-700">
                        <div className="mb-4">
                            <p className="font-mono text-sm mb-2">P(x) = [C(k, x) × C(N-k, n-x)] / C(N, n)</p>
                            <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                P({hypX}) = [C({hypK}, {hypX}) × C({hypN}-{hypK}, {hypSmallN}-{hypX})] / C({hypN}, {hypSmallN})
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-lg font-medium">
                            <span>Calculation:</span>
                            <div className="flex flex-col items-center">
                                <span className="border-b border-gray-400 dark:border-gray-500 px-2">{hypResults.term1.toLocaleString()} × {hypResults.term2.toLocaleString()}</span>
                                <span>{hypResults.denominator.toLocaleString()}</span>
                            </div>
                            <span>=</span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{hypResults.prob.toFixed(4)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
