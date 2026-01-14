import { useState, useMemo } from "react";
import type { Route } from "./+types/regression";
import { BackgroundGraph } from "../components/background-graph";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Regression Analysis Calculator" },
        { name: "description", content: "Linear Regression Calculator (Y' = bX + A)" },
    ];
}

type DataPoint = {
    id: string;
    x: number;
    y: number;
};

export default function RegressionCalculator() {
    // Default data initialized to 0s
    const [data, setData] = useState<DataPoint[]>([
        { id: "1", x: 0, y: 0 },
        { id: "2", x: 0, y: 0 },
        { id: "3", x: 0, y: 0 },
        { id: "4", x: 0, y: 0 },
        { id: "5", x: 0, y: 0 },
    ]);
    const [predictX, setPredictX] = useState<number>(0);
    const [submittedData, setSubmittedData] = useState<DataPoint[] | null>(null);

    const addRow = () => {
        const newData = [...data, { id: crypto.randomUUID(), x: 0, y: 0 }];
        setData(newData);
        setSubmittedData(null);
    };

    const removeRow = (id: string) => {
        if (data.length > 2) {
            setData(data.filter((Row) => Row.id !== id));
            setSubmittedData(null);
        }
    };

    const updateRow = (id: string, field: "x" | "y", value: string) => {
        const numValue = value === "" ? 0 : parseFloat(value);
        setData(
            data.map((row) => (row.id === id ? { ...row, [field]: numValue } : row))
        );
        setSubmittedData(null);
    };

    const handleCalculate = () => {
        setSubmittedData(data);
    };

    const stats = useMemo(() => {
        if (!submittedData) return null;

        let sumX = 0;
        let sumY = 0;
        let sumX2 = 0;
        let sumXY = 0;
        const n = submittedData.length;

        const detailedData = submittedData.map((row) => {
            const x2 = row.x * row.x;
            const xy = row.x * row.y;
            sumX += row.x;
            sumY += row.y;
            sumX2 += x2;
            sumXY += xy;
            return { ...row, x2, xy };
        });

        // Slope b
        // b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX^2)
        const numeratorB = n * sumXY - sumX * sumY;
        const denominatorB = n * sumX2 - sumX * sumX;

        // Avoid division by zero
        const b = denominatorB !== 0 ? numeratorB / denominatorB : 0;

        // Intercept A
        // A = (sumY - b * sumX) / n
        const numeratorA = sumY - b * sumX;
        const A = n !== 0 ? numeratorA / n : 0;

        // Prediction
        const predictedY = b * predictX + A;

        return {
            n,
            sumX,
            sumY,
            sumX2,
            sumXY,
            detailedData,
            numeratorB,
            denominatorB,
            b,
            numeratorA,
            A,
            predictedY,
        };
    }, [submittedData, predictX]);

    return (
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans text-gray-800 dark:text-gray-100">
            <BackgroundGraph />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-6 fade-in">
                    <h1 className="text-3xl font-bold mb-6">Regression Analysis Calculator</h1>
                </div>

                {/* Input Section */}
                <div className="mb-8 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 fade-in delay-100">
                    <h2 className="text-xl font-semibold mb-4">Input Data</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full max-w-lg mb-4 text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700">
                                    <th className="p-2 border dark:border-gray-600 text-left">X</th>
                                    <th className="p-2 border dark:border-gray-600 text-left">Y</th>
                                    <th className="p-2 border dark:border-gray-600 w-16">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row) => (
                                    <tr key={row.id}>
                                        <td className="p-2 border dark:border-gray-600">
                                            <input
                                                type="number"
                                                value={row.x || ""}
                                                onChange={(e) => updateRow(row.id, "x", e.target.value)}
                                                className="w-full p-1 bg-transparent border rounded dark:border-gray-600"
                                            />
                                        </td>
                                        <td className="p-2 border dark:border-gray-600">
                                            <input
                                                type="number"
                                                value={row.y || ""}
                                                onChange={(e) => updateRow(row.id, "y", e.target.value)}
                                                className="w-full p-1 bg-transparent border rounded dark:border-gray-600"
                                            />
                                        </td>
                                        <td className="p-2 border dark:border-gray-600 text-center">
                                            <button
                                                onClick={() => removeRow(row.id)}
                                                className="text-red-500 hover:text-red-700 px-2"
                                                disabled={data.length <= 2}
                                            >
                                                ×
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center">
                        <button
                            onClick={addRow}
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded transition-colors text-sm"
                        >
                            + Add Row
                        </button>
                        <button
                            onClick={handleCalculate}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors"
                        >
                            Calculate
                        </button>
                    </div>
                </div>

                {stats && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Step 1 */}
                        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-semibold mb-4">Step 1: Write down the data</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm text-center">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700">
                                            <th className="p-2 border dark:border-gray-600">X</th>
                                            <th className="p-2 border dark:border-gray-600">Y</th>
                                            <th className="p-2 border dark:border-gray-600">X²</th>
                                            <th className="p-2 border dark:border-gray-600">XY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.detailedData.map((row) => (
                                            <tr key={row.id}>
                                                <td className="p-2 border dark:border-gray-600">{row.x}</td>
                                                <td className="p-2 border dark:border-gray-600">{row.y}</td>
                                                <td className="p-2 border dark:border-gray-600 font-mono text-gray-600 dark:text-gray-400">{row.x2}</td>
                                                <td className="p-2 border dark:border-gray-600 font-mono text-gray-600 dark:text-gray-400">{row.xy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Step 2 */}
                        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-semibold mb-4">Step 2: Compute totals</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-lg bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
                                <div>∑X = <span className="font-bold text-blue-600 dark:text-blue-400">{stats.sumX}</span></div>
                                <div>∑Y = <span className="font-bold text-blue-600 dark:text-blue-400">{stats.sumY}</span></div>
                                <div>∑X² = <span className="font-bold text-blue-600 dark:text-blue-400">{stats.sumX2}</span></div>
                                <div>∑XY = <span className="font-bold text-blue-600 dark:text-blue-400">{stats.sumXY}</span></div>
                                <div>n = <span className="font-bold text-blue-600 dark:text-blue-400">{stats.n}</span></div>
                            </div>
                        </section>

                        {/* Step 3 */}
                        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-semibold mb-4">Step 3: Calculate slope (b)</h2>
                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700">
                                <div className="flex items-center gap-4 text-lg font-serif mb-4 flex-wrap">
                                    <span>b =</span>
                                    <div className="flex flex-col items-center">
                                        <span className="border-b border-gray-400 dark:border-gray-500 px-2 text-center">n(∑XY) - (∑X)(∑Y)</span>
                                        <span className="text-center">n(∑X²) - (∑X)²</span>
                                    </div>
                                </div>

                                <div className="space-y-2 font-mono text-gray-700 dark:text-gray-300">
                                    <div>b = ({stats.n})({stats.sumXY}) - ({stats.sumX})({stats.sumY}) / ({stats.n})({stats.sumX2}) - ({stats.sumX})²</div>
                                    <div>b = {stats.numeratorB} / {stats.denominatorB}</div>
                                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300">b = {stats.b.toFixed(2)}</div>
                                </div>
                            </div>
                        </section>

                        {/* Step 4 */}
                        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-semibold mb-4">Step 4: Calculate intercept (A)</h2>
                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700">
                                <div className="flex items-center gap-4 text-lg font-serif mb-4">
                                    <span>A =</span>
                                    <div className="flex flex-col items-center">
                                        <span className="border-b border-gray-400 dark:border-gray-500 px-2">∑Y - b(∑X)</span>
                                        <span>n</span>
                                    </div>
                                </div>
                                <div className="space-y-2 font-mono text-gray-700 dark:text-gray-300">
                                    <div>A = {stats.sumY} - ({stats.b.toFixed(2)})({stats.sumX}) / {stats.n}</div>
                                    <div>A = {stats.numeratorA.toFixed(2)} / {stats.n}</div>
                                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300">A = {stats.A.toFixed(2)}</div>
                                </div>
                            </div>
                        </section>

                        {/* Step 5 */}
                        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-semibold mb-4">Step 5: Regression equation</h2>
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30 text-center">
                                <div className="text-3xl font-bold text-blue-800 dark:text-blue-300 font-serif">
                                    Y' = {stats.b.toFixed(2)}X {stats.A >= 0 ? "+" : "-"} {Math.abs(stats.A).toFixed(2)}
                                </div>
                            </div>
                        </section>

                        {/* Step 6 */}
                        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-semibold mb-4">Step 6: Predict Y for X</h2>
                            <div className="flex flex-col sm:flex-row gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 items-start sm:items-center">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Enter X:</label>
                                    <input
                                        type="number"
                                        value={predictX}
                                        onChange={(e) => setPredictX(parseFloat(e.target.value) || 0)}
                                        className="p-2 border rounded text-lg w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                                    <span className="text-2xl">→</span>
                                </div>

                                <div>
                                    <div className="text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Predicted Y':</div>
                                    <div className="text-lg font-mono mb-1">
                                        {stats.b.toFixed(2)}({predictX}) {stats.A >= 0 ? "+" : "-"} {Math.abs(stats.A).toFixed(2)}
                                    </div>
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        = {stats.predictedY.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
