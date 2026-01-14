import { useState, useMemo } from "react";
import type { Route } from "./+types/regression";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Regression Analysis Calculator" },
        { name: "description", content: "Linear Regression Calculator (Y' = bX + A)" },
    ];
}

function BackgroundGraph() {
    return (
        <svg
            className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path
                className="graph-line"
                d="M0,300 Q100,280 150,200 T250,180 T350,220 T450,100 T550,150 T650,80 T750,120 T850,60 T950,100 T1050,40 T1150,80 T1250,30 T1350,60 T1450,20 T1550,50 T1650,15 T1750,40 T1850,10 T1950,30"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                className="graph-line-2"
                d="M0,350 Q80,340 120,320 T200,350 T280,300 T360,330 T440,280 T520,310 T600,250 T680,290 T760,230 T840,270 T920,200 T1000,250 T1080,180 T1160,220 T1240,160 T1320,200 T1400,140 T1480,180 T1560,120 T1640,160 T1720,100 T1800,140 T1880,80 T1960,120"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 4"
            />
        </svg>
    );
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
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans">
            <BackgroundGraph />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-6 fade-in text-center">
                    <h1 className="text-3xl font-extrabold mb-6 text-[var(--color-ink)]" style={{ fontFamily: "var(--font-serif)" }}>Regression Analysis Calculator</h1>
                </div>

                {/* Input Section */}
                <div
                    className="mb-8 p-6 rounded-lg shadow-sm fade-in delay-100"
                    style={{ backgroundColor: "var(--color-accent-blue)" }}
                >
                    <h2 className="text-xl font-semibold mb-4 text-[var(--color-ink)]">Input Data</h2>
                    <div className="overflow-x-auto rounded-xl border bg-white/50" style={{ borderColor: "var(--color-dot-blue)" }}>
                        <table className="w-full mb-4 text-sm">
                            <thead>
                                <tr className="bg-[var(--color-accent-blue)]">
                                    <th className="p-2 border-b text-left text-[var(--color-ink)]" style={{ borderColor: "var(--color-dot-blue)" }}>X</th>
                                    <th className="p-2 border-b text-left text-[var(--color-ink)]" style={{ borderColor: "var(--color-dot-blue)" }}>Y</th>
                                    <th className="p-2 border-b w-16 text-[var(--color-ink)]" style={{ borderColor: "var(--color-dot-blue)" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row) => (
                                    <tr key={row.id}>
                                        <td className="p-2 border-b" style={{ borderColor: "var(--color-dot-blue)" }}>
                                            <input
                                                type="number"
                                                value={row.x || ""}
                                                onChange={(e) => updateRow(row.id, "x", e.target.value)}
                                                className="w-full p-1 bg-white border rounded outline-none focus:ring-2"
                                                style={{ borderColor: "var(--color-dot-blue)" }}
                                            />
                                        </td>
                                        <td className="p-2 border-b" style={{ borderColor: "var(--color-dot-blue)" }}>
                                            <input
                                                type="number"
                                                value={row.y || ""}
                                                onChange={(e) => updateRow(row.id, "y", e.target.value)}
                                                className="w-full p-1 bg-white border rounded outline-none focus:ring-2"
                                                style={{ borderColor: "var(--color-dot-blue)" }}
                                            />
                                        </td>
                                        <td className="p-2 border-b text-center" style={{ borderColor: "var(--color-dot-blue)" }}>
                                            <button
                                                onClick={() => removeRow(row.id)}
                                                className="text-red-500 hover:text-red-700 px-2 font-bold"
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
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={addRow}
                            className="text-[var(--color-ink)] font-semibold py-2 px-4 rounded transition-colors text-sm bg-white border hover:bg-gray-50"
                            style={{ borderColor: "var(--color-dot-blue)" }}
                        >
                            + Add Row
                        </button>
                        <button
                            onClick={handleCalculate}
                            className="text-white font-bold py-2 px-6 rounded shadow transition-colors"
                            style={{ backgroundColor: "var(--color-dot-blue)" }}
                        >
                            Calculate
                        </button>
                    </div>
                </div>

                {stats && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Step 1 */}
                        <section
                            className="p-6 rounded-lg shadow-sm border"
                            style={{ backgroundColor: "var(--color-accent-blue)", borderColor: "var(--color-dot-blue)" }}
                        >
                            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-ink)]">Step 1: Write down the data</h2>
                            <div className="overflow-x-auto rounded-xl border bg-white" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <table className="w-full border-collapse text-sm text-center">
                                    <thead>
                                        <tr style={{ backgroundColor: "var(--color-accent-blue)" }}>
                                            <th className="p-2 border-b border-r text-[var(--color-ink)]" style={{ borderColor: "var(--color-dot-blue)" }}>X</th>
                                            <th className="p-2 border-b border-r text-[var(--color-ink)]" style={{ borderColor: "var(--color-dot-blue)" }}>Y</th>
                                            <th className="p-2 border-b border-r text-[var(--color-ink)]" style={{ borderColor: "var(--color-dot-blue)" }}>X²</th>
                                            <th className="p-2 border-b text-[var(--color-ink)]" style={{ borderColor: "var(--color-dot-blue)" }}>XY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.detailedData.map((row) => (
                                            <tr key={row.id}>
                                                <td className="p-2 border-b border-r text-[var(--color-ink)]" style={{ borderColor: "var(--color-dot-blue)" }}>{row.x}</td>
                                                <td className="p-2 border-b border-r text-[var(--color-ink)]" style={{ borderColor: "var(--color-dot-blue)" }}>{row.y}</td>
                                                <td className="p-2 border-b border-r font-mono text-[var(--color-ink-light)]" style={{ borderColor: "var(--color-dot-blue)" }}>{row.x2}</td>
                                                <td className="p-2 border-b font-mono text-[var(--color-ink-light)]" style={{ borderColor: "var(--color-dot-blue)" }}>{row.xy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Step 2 */}
                        <section
                            className="p-6 rounded-lg shadow-sm border"
                            style={{ backgroundColor: "var(--color-accent-blue)", borderColor: "var(--color-dot-blue)" }}
                        >
                            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-ink)]">Step 2: Compute totals</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-lg bg-white/50 p-6 rounded-lg border" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <div className="text-[var(--color-ink)]">∑X = <span className="font-bold" style={{ color: "var(--color-dot-blue)" }}>{stats.sumX}</span></div>
                                <div className="text-[var(--color-ink)]">∑Y = <span className="font-bold" style={{ color: "var(--color-dot-blue)" }}>{stats.sumY}</span></div>
                                <div className="text-[var(--color-ink)]">∑X² = <span className="font-bold" style={{ color: "var(--color-dot-blue)" }}>{stats.sumX2}</span></div>
                                <div className="text-[var(--color-ink)]">∑XY = <span className="font-bold" style={{ color: "var(--color-dot-blue)" }}>{stats.sumXY}</span></div>
                                <div className="text-[var(--color-ink)]">n = <span className="font-bold" style={{ color: "var(--color-dot-blue)" }}>{stats.n}</span></div>
                            </div>
                        </section>

                        {/* Step 3 */}
                        <section
                            className="p-6 rounded-lg shadow-sm border"
                            style={{ backgroundColor: "var(--color-accent-blue)", borderColor: "var(--color-dot-blue)" }}
                        >
                            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-ink)]">Step 3: Calculate slope (b)</h2>
                            <div className="mb-4 p-4 bg-white/50 rounded border" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <div className="flex items-center gap-4 text-lg font-serif mb-4 flex-wrap text-[var(--color-ink)]">
                                    <span>b =</span>
                                    <div className="flex flex-col items-center">
                                        <span className="border-b border-gray-400 px-2 text-center">n(∑XY) - (∑X)(∑Y)</span>
                                        <span className="text-center">n(∑X²) - (∑X)²</span>
                                    </div>
                                </div>

                                <div className="space-y-2 font-mono text-[var(--color-ink)]">
                                    <div>b = ({stats.n})({stats.sumXY}) - ({stats.sumX})({stats.sumY}) / ({stats.n})({stats.sumX2}) - ({stats.sumX})²</div>
                                    <div>b = {stats.numeratorB} / {stats.denominatorB}</div>
                                    <div className="text-xl font-bold" style={{ color: "var(--color-dot-blue)" }}>b = {stats.b.toFixed(2)}</div>
                                </div>
                            </div>
                        </section>

                        {/* Step 4 */}
                        <section
                            className="p-6 rounded-lg shadow-sm border"
                            style={{ backgroundColor: "var(--color-accent-blue)", borderColor: "var(--color-dot-blue)" }}
                        >
                            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-ink)]">Step 4: Calculate intercept (A)</h2>
                            <div className="mb-4 p-4 bg-white/50 rounded border" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <div className="flex items-center gap-4 text-lg font-serif mb-4 text-[var(--color-ink)]">
                                    <span>A =</span>
                                    <div className="flex flex-col items-center">
                                        <span className="border-b border-gray-400 px-2">∑Y - b(∑X)</span>
                                        <span>n</span>
                                    </div>
                                </div>
                                <div className="space-y-2 font-mono text-[var(--color-ink)]">
                                    <div>A = {stats.sumY} - ({stats.b.toFixed(2)})({stats.sumX}) / {stats.n}</div>
                                    <div>A = {stats.numeratorA.toFixed(2)} / {stats.n}</div>
                                    <div className="text-xl font-bold" style={{ color: "var(--color-dot-blue)" }}>A = {stats.A.toFixed(2)}</div>
                                </div>
                            </div>
                        </section>

                        {/* Step 5 */}
                        <section
                            className="p-6 rounded-lg shadow-sm border"
                            style={{ backgroundColor: "var(--color-accent-blue)", borderColor: "var(--color-dot-blue)" }}
                        >
                            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-ink)]">Step 5: Regression equation</h2>
                            <div className="p-6 bg-white rounded-lg border text-center" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <div className="text-3xl font-bold font-serif" style={{ color: "var(--color-dot-blue)" }}>
                                    Y' = {stats.b.toFixed(2)}X {stats.A >= 0 ? "+" : "-"} {Math.abs(stats.A).toFixed(2)}
                                </div>
                            </div>
                        </section>

                        {/* Step 6 */}
                        <section
                            className="p-6 rounded-lg shadow-sm border"
                            style={{ backgroundColor: "var(--color-accent-blue)", borderColor: "var(--color-dot-blue)" }}
                        >
                            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-ink)]">Step 6: Predict Y for X</h2>
                            <div className="flex flex-col sm:flex-row gap-6 p-6 bg-white rounded-lg shadow-sm border items-start sm:items-center" style={{ borderColor: "var(--color-dot-blue)" }}>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--color-ink)]">Enter X:</label>
                                    <input
                                        type="number"
                                        value={predictX}
                                        onChange={(e) => setPredictX(parseFloat(e.target.value) || 0)}
                                        className="p-2 border rounded text-lg w-32 outline-none focus:ring-2"
                                        style={{ borderColor: "var(--color-dot-blue)" }}
                                    />
                                </div>

                                <div className="flex items-center gap-4 text-[var(--color-ink)]">
                                    <span className="text-2xl">→</span>
                                </div>

                                <div>
                                    <div className="text-sm font-medium mb-1 text-[var(--color-ink)]">Predicted Y':</div>
                                    <div className="text-lg font-mono mb-1 text-[var(--color-ink)]">
                                        {stats.b.toFixed(2)}({predictX}) {stats.A >= 0 ? "+" : "-"} {Math.abs(stats.A).toFixed(2)}
                                    </div>
                                    <div className="text-3xl font-bold text-green-600">
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
