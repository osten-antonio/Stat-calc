import { useState, useMemo } from "react";
import type { Route } from "./+types/probability";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Probability & Statistics Calculator" },
        { name: "description", content: "Calculators for Permutations, Combinations, Distributions, and Statistics" },
    ];
}

// --- Helper Functions ---
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

const permutation = (n: number, r: number): number => {
    if (r < 0 || r > n) return 0;
    return factorial(n) / factorial(n - r);
};

export default function ProbabilityCalculators() {
    // --- State for Permutations & Combinations ---
    const [pcN, setPcN] = useState<number>(8); // Total items
    const [pcR, setPcR] = useState<number>(4); // Items to arrange/choose

    // --- State for Hypergeometric ---
    const [hypN, setHypN] = useState<number>(25); // Population Size (N)
    const [hypK, setHypK] = useState<number>(10); // Population Successes (k)
    const [hypSmallN, setHypSmallN] = useState<number>(5); // Sample Size (n)
    const [hypX, setHypX] = useState<number>(3);  // Sample Successes (x)

    // --- State for Independent Events ---
    const [indProbA, setIndProbA] = useState<string>("1/13");
    const [indProbB, setIndProbB] = useState<string>("1/2");

    // --- State for Descriptive Statistics ---
    const [dataSet, setDataSet] = useState<string>("10, 15, 20, 25, 30"); // Comma separated
    const [zScoreTarget, setZScoreTarget] = useState<number>(25);

    // --- Calculations ---

    // 1. Permutations & Combinations
    const pcResults = useMemo(() => {
        const perm = permutation(pcN, pcR);
        const comb = combination(pcN, pcR);
        return { perm, comb };
    }, [pcN, pcR]);

    // 2. Hypergeometric
    const hypResults = useMemo(() => {
        // P(x) = [C(k, x) * C(N-k, n-x)] / C(N, n)
        const term1 = combination(hypK, hypX); // C(k, x)
        const term2 = combination(hypN - hypK, hypSmallN - hypX); // C(N-k, n-x)
        const denominator = combination(hypN, hypSmallN); // C(N, n)
        const prob = denominator === 0 ? 0 : (term1 * term2) / denominator;
        return { term1, term2, denominator, prob };
    }, [hypN, hypK, hypSmallN, hypX]);

    // 3. Independent Events
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

    // 4. Descriptive Statistics
    const statsResults = useMemo(() => {
        const numbers = dataSet.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        if (numbers.length === 0) return null;

        const n = numbers.length;
        const mean = numbers.reduce((a, b) => a + b, 0) / n;

        // Variance (Sample) = sum((x - mean)^2) / (n - 1)
        // Variance (Population) = sum((x - mean)^2) / n
        // Usually for loose data we assume population or sample. Let's provide Sample description usually unless specified.
        // However, stats calculators often default to Sample Deviation. Let's show both or clarify.
        // The prompt asks for "Standard deviation and Variance". I will calculate Population for simplicity unless standard implies sample.
        // Let's stick to Population Variance/SD formula for "data set" unless n-1 is typical. 
        // Actually, usually n-1 is sample. Let's do Sample Variance/SD which is statistically safer for "data".

        const sumSqDiff = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
        const variance = n > 1 ? sumSqDiff / (n - 1) : 0;
        const stdDev = Math.sqrt(variance);

        // Z-score = (x - mean) / stdDev
        const zScore = stdDev !== 0 ? (zScoreTarget - mean) / stdDev : 0;

        return { mean, variance, stdDev, zScore, n };
    }, [dataSet, zScoreTarget]);

    // --- State for Special Means ---
    const [trimeanData, setTrimeanData] = useState<string>("10, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 50");
    const [geoRates, setGeoRates] = useState<string>("5, 10, -3, 6");
    const [trimmedData, setTrimmedData] = useState<string>("65, 70, 72, 75, 80, 85, 90, 92, 95, 100");
    const [trimPercent, setTrimPercent] = useState<number>(10);

    // 5. Special Means calculations

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
            <h1 className="text-3xl font-bold mb-6 border-b pb-4 dark:border-gray-700">Probability & Statistics</h1>

            {/* 1. Permutations & Combinations */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">1. Permutations & Combinations</h2>
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

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Permutation */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-2">Permutation (Order matters)</h3>
                        <p className="text-sm text-gray-500 mb-2 font-mono">P(n, r) = n! / (n-r)!</p>
                        <div className="text-sm mb-2">
                            P({pcN}, {pcR}) = {pcN}! / ({pcN}-{pcR})!
                        </div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {pcResults.perm.toLocaleString()}
                        </div>
                    </div>

                    {/* Combination */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-2">Combination (Order doesn't matter)</h3>
                        <p className="text-sm text-gray-500 mb-2 font-mono">C(n, r) = n! / [r!(n-r)!]</p>
                        <div className="text-sm mb-2">
                            C({pcN}, {pcR}) = {pcN}! / [{pcR}!({pcN}-{pcR})!]
                        </div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {pcResults.comb.toLocaleString()}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Hypergeometric Distribution */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">2. Hypergeometric Probability</h2>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">Probability of <strong>x</strong> successes in a sample of size <strong>n</strong> from population <strong>N</strong> with <strong>k</strong> total successes.</p>

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

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-700">
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
            </section>

            {/* 3. Independent Events */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">3. Independent Events</h2>
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

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-700">
                    <p className="font-mono text-sm mb-2">P(A and B) = P(A) × P(B)</p>
                    <div className="text-lg">
                        {indResults.pA.toFixed(4)} × {indResults.pB.toFixed(4)} = <span className="text-2xl font-bold text-green-600 dark:text-green-400 ml-2">{indResults.pAnd.toFixed(4)}</span>
                    </div>
                </div>
            </section>

            {/* 4. Descriptive Statistics */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">4. Descriptive Statistics</h2>

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

            {/* 5. Special Means */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">5. Special Means</h2>

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
