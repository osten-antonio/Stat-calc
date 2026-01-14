import { useState, useMemo } from "react";
import type { Route } from "./+types/permutations";
import { BackgroundGraph } from "../components/background-graph";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Permutations Calculator" },
        { name: "description", content: "Calculate Permutations" },
    ];
}

const factorial = (n: number): number => {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
};

const permutation = (n: number, r: number): number => {
    if (r < 0 || r > n) return 0;
    return factorial(n) / factorial(n - r);
};

export default function Permutations() {
    const [pcN, setPcN] = useState<number>(8); // Total items
    const [pcR, setPcR] = useState<number>(4); // Items to arrange

    const perm = useMemo(() => permutation(pcN, pcR), [pcN, pcR]);

    return (
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans text-gray-800 dark:text-gray-100">
            <BackgroundGraph />
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-6 fade-in">
                    <h1 className="text-3xl font-bold mb-2">Permutations</h1>
                    <p className="text-gray-600 dark:text-gray-400">Calculate the number of ways to arrange <strong>r</strong> items from a set of <strong>n</strong> distinct items where order matters.</p>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 fade-in delay-100">
                    <div className="flex flex-wrap gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 capitalize">Total Items (n)</label>
                            <input type="number" value={pcN} onChange={e => setPcN(parseInt(e.target.value) || 0)} className="p-2 border rounded w-24 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 capitalize">Select/Arrange (r)</label>
                            <input type="number" value={pcR} onChange={e => setPcR(parseInt(e.target.value) || 0)} className="p-2 border rounded w-24 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>

                    <div className="bg-gray-50/50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-2">Permutation Calculation</h3>
                        <p className="text-sm text-gray-500 mb-2 font-mono">P(n, r) = n! / (n-r)!</p>
                        <div className="text-sm mb-2">
                            P({pcN}, {pcR}) = {pcN}! / ({pcN}-{pcR})!
                        </div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {perm.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
