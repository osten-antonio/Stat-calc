import React, { useState } from "react";
import { calculateTwoWayAnova, type TwoWayResult } from "./utils";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { MathBlock } from "~/components/math/MathBlock";

export default function TwoWay() {
    const [rows, setRows] = useState<number>(2);
    const [cols, setCols] = useState<number>(2);
    const [reps, setReps] = useState<number>(2);
    const [data, setData] = useState<string[][][]>(
        Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => Array(2).fill("")))
    );
    const [result, setResult] = useState<TwoWayResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleConfigChange = (r: number, c: number, n: number) => {
        // Resize data structure while preserving existing data where possible
        const newData = Array.from({ length: r }, (_, i) =>
            Array.from({ length: c }, (_, j) => {
                const newCell = Array(n).fill("");
                if (i < data.length && j < data[0].length) {
                    const prevCell = data[i][j];
                    for (let k = 0; k < Math.min(n, prevCell.length); k++) {
                        newCell[k] = prevCell[k];
                    }
                }
                return newCell;
            })
        );
        setRows(r);
        setCols(c);
        setReps(n);
        setData(newData);
        setResult(null); // Clear previous results on config change
    };

    const handleDataChange = (rIndex: number, cIndex: number, repIndex: number, value: string) => {
        const newData = [...data]; // Shallow copy of rows
        newData[rIndex] = [...newData[rIndex]]; // Shallow copy of cols
        newData[rIndex][cIndex] = [...newData[rIndex][cIndex]]; // Shallow copy of reps
        newData[rIndex][cIndex][repIndex] = value;
        setData(newData);
    };

    const autoFillSample = () => {
        // Just for demo/testing purposes
        if (rows !== 2 || cols !== 2 || reps !== 2) {
            handleConfigChange(2, 2, 2);
            setTimeout(() => {
                setData([
                    [["10", "12"], ["15", "18"]],
                    [["20", "22"], ["25", "28"]]
                ]);
            }, 50);
        } else {
            setData([
                [["10", "12"], ["15", "18"]],
                [["20", "22"], ["25", "28"]]
            ]);
        }
    };

    const handleCalculate = () => {
        setError(null);
        setResult(null);
        try {
            const parsedData: number[][][] = data.map((row, i) =>
                row.map((cell, j) => {
                    const parsedCell = cell.map((val, k) => {
                        const num = parseFloat(val);
                        if (isNaN(num)) {
                            throw new Error(`Invalid number at Row ${i + 1}, Col ${j + 1}, Rep ${k + 1}`);
                        }
                        return num;
                    });
                    return parsedCell;
                })
            );

            const res = calculateTwoWayAnova(parsedData);
            if (!res) {
                throw new Error("Calculation failed. Ensure sufficient data and valid dimensions.");
            }
            setResult(res);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="bg-[var(--color-accent-mint)] border-none">
                <h2
                    className="text-xl font-medium mb-2"
                    style={{ fontFamily: "var(--font-serif)" }}
                >
                    Two-Way ANOVA (With Replication)
                </h2>
                <MathBlock formula="F = \frac{\text{MS}_{\text{factor}}}{\text{MS}_{\text{error}}}" />
                <p className="text-sm text-[var(--color-ink-light)] mt-2">
                    Tests the effect of two independent independent variables on a dependent variable, including interaction effects.
                </p>
            </Card>

            <Card className="border border-gray-100 shadow-sm bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
                            Rows (Factor A)
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="5"
                            value={rows}
                            onChange={(e) => handleConfigChange(parseInt(e.target.value) || 2, cols, reps)}
                            className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-mint)] transition-shadow"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
                            Columns (Factor B)
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="5"
                            value={cols}
                            onChange={(e) => handleConfigChange(rows, parseInt(e.target.value) || 2, reps)}
                            className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-mint)] transition-shadow"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
                            Replications per Cell
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="10"
                            value={reps}
                            onChange={(e) => handleConfigChange(rows, cols, parseInt(e.target.value) || 2)}
                            className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-dot-mint)] transition-shadow"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-max">
                        <div className="grid gap-4" style={{ gridTemplateColumns: `auto repeat(${cols}, 1fr)` }}>
                            <div className="p-2"></div>
                            {Array.from({ length: cols }).map((_, j) => (
                                <div key={j} className="text-center font-bold text-xs uppercase tracking-wide text-[var(--color-ink-light)] p-2 bg-white rounded border border-gray-100">
                                    Col {j + 1}
                                </div>
                            ))}

                            {Array.from({ length: rows }).map((_, i) => (
                                <React.Fragment key={i}>
                                    <div className="flex items-center justify-center font-bold text-xs uppercase tracking-wide text-[var(--color-ink-light)] bg-white rounded p-2 border border-gray-100">
                                        Row {i + 1}
                                    </div>
                                    {Array.from({ length: cols }).map((_, j) => (
                                        <div key={`${i}-${j}`} className="space-y-2 p-3 border border-gray-200 bg-white rounded-xl shadow-sm hover:border-[var(--color-dot-mint)] transition-colors">
                                            {Array.from({ length: reps }).map((_, k) => (
                                                <input
                                                    key={`${i}-${j}-${k}`}
                                                    type="number"
                                                    placeholder={`Rep ${k + 1}`}
                                                    value={data[i][j][k]}
                                                    onChange={(e) => handleDataChange(i, j, k, e.target.value)}
                                                    className="w-full p-1.5 text-sm rounded border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-dot-mint)] transition-all"
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <button
                        onClick={autoFillSample}
                        className="text-sm text-[var(--color-ink-light)] hover:text-[var(--color-dot-mint)] transition-colors underline decoration-dotted"
                    >
                        Autofill Sample Data
                    </button>
                    <Button tone="mint" onClick={handleCalculate}>
                        Calculate F-Statistics
                    </Button>
                </div>
            </Card>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                    {error}
                </div>
            )}

            {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8">

                    <h3
                        className="text-2xl font-medium"
                        style={{ fontFamily: "var(--font-serif)" }}
                    >
                        Results
                    </h3>

                    <Card className="bg-[var(--color-accent-mint)] border-none">
                        <h4 className="font-semibold mb-4 text-[var(--color-ink)]">
                            ANOVA Summary Table
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-[var(--color-ink)]">
                                <thead className="text-xs uppercase text-[var(--color-ink-light)] border-b border-[var(--color-ink-light)]/10">
                                    <tr>
                                        <th className="px-4 py-2">Source</th>
                                        <th className="px-4 py-2">SS</th>
                                        <th className="px-4 py-2">df</th>
                                        <th className="px-4 py-2">MS</th>
                                        <th className="px-4 py-2">F</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-[var(--color-ink-light)]/10 bg-white/50">
                                        <td className="px-4 py-3 font-medium">Rows (Factor A)</td>
                                        <td className="px-4 py-3">{result.ssRow.toFixed(4)}</td>
                                        <td className="px-4 py-3">{result.dfRow}</td>
                                        <td className="px-4 py-3">{result.msRow.toFixed(4)}</td>
                                        <td className="px-4 py-3 font-bold text-[var(--color-dot-mint)]">{result.fRow.toFixed(4)}</td>
                                    </tr>
                                    <tr className="border-b border-[var(--color-ink-light)]/10 bg-white/50">
                                        <td className="px-4 py-3 font-medium">Cols (Factor B)</td>
                                        <td className="px-4 py-3">{result.ssCol.toFixed(4)}</td>
                                        <td className="px-4 py-3">{result.dfCol}</td>
                                        <td className="px-4 py-3">{result.msCol.toFixed(4)}</td>
                                        <td className="px-4 py-3 font-bold text-[var(--color-dot-mint)]">{result.fCol.toFixed(4)}</td>
                                    </tr>
                                    <tr className="border-b border-[var(--color-ink-light)]/10 bg-white/50">
                                        <td className="px-4 py-3 font-medium">Interaction (AxB)</td>
                                        <td className="px-4 py-3">{result.ssInter.toFixed(4)}</td>
                                        <td className="px-4 py-3">{result.dfInter}</td>
                                        <td className="px-4 py-3">{result.msInter.toFixed(4)}</td>
                                        <td className="px-4 py-3 font-bold text-[var(--color-dot-mint)]">{result.fInter.toFixed(4)}</td>
                                    </tr>
                                    <tr className="border-b border-[var(--color-ink-light)]/10">
                                        <td className="px-4 py-3 font-medium">Error (Within)</td>
                                        <td className="px-4 py-3">{result.ssError.toFixed(4)}</td>
                                        <td className="px-4 py-3">{result.dfError}</td>
                                        <td className="px-4 py-3">{result.msError.toFixed(4)}</td>
                                        <td className="px-4 py-3">-</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-bold">Total</td>
                                        <td className="px-4 py-3 font-bold">{result.ssTotal.toFixed(4)}</td>
                                        <td className="px-4 py-3 font-bold">{result.dfTotal}</td>
                                        <td className="px-4 py-3"></td>
                                        <td className="px-4 py-3"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card className="border border-gray-100 shadow-sm">
                        <h4
                            className="font-semibold mb-6 text-lg"
                            style={{ fontFamily: "var(--font-serif)" }}
                        >
                            Step-by-Step Calculation
                        </h4>

                        <div className="space-y-8">
                            <div>
                                <h5 className="font-medium text-[var(--color-ink)] mb-3">Step 1: Calculate Means</h5>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm font-mono text-[var(--color-ink-light)] space-y-4">
                                    <div><strong>Grand Mean:</strong> {result.grandMean.toFixed(4)}</div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <strong>Row Means:</strong>
                                            <ul className="list-disc list-inside ml-2 mt-1">
                                                {result.rowMeans.map((m, i) => (
                                                    <li key={i}>Row {i + 1}: {m.toFixed(4)}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <strong>Column Means:</strong>
                                            <ul className="list-disc list-inside ml-2 mt-1">
                                                {result.colMeans.map((m, j) => (
                                                    <li key={j}>Col {j + 1}: {m.toFixed(4)}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h5 className="font-medium text-[var(--color-ink)] mb-3">Step 2: Sum of Squares</h5>
                                <div className="space-y-3">
                                    <div className="p-3 border border-gray-100 rounded-lg">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase">SS Rows (Main Effect A)</div>
                                        <div className="font-mono text-sm mt-1">{result.ssRow.toFixed(4)}</div>
                                    </div>
                                    <div className="p-3 border border-gray-100 rounded-lg">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase">SS Columns (Main Effect B)</div>
                                        <div className="font-mono text-sm mt-1">{result.ssCol.toFixed(4)}</div>
                                    </div>
                                    <div className="p-3 border border-gray-100 rounded-lg">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase">SS Interaction</div>
                                        <div className="font-mono text-sm mt-1">{result.ssInter.toFixed(4)}</div>
                                    </div>
                                    <div className="p-3 border border-gray-100 rounded-lg">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase">SS Error (Within)</div>
                                        <div className="font-mono text-sm mt-1">{result.ssError.toFixed(4)}</div>
                                    </div>
                                    <div className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase">SS Total</div>
                                        <div className="font-mono text-sm mt-1">{result.ssTotal.toFixed(4)}</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h5 className="font-medium text-[var(--color-ink)] mb-3">Step 3: F-Statistics</h5>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="p-4 bg-[var(--color-accent-mint)]/30 rounded-xl text-center">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase mb-1">Row Effect</div>
                                        <div className="text-xl font-bold text-[var(--color-dot-mint)]">{result.fRow.toFixed(4)}</div>
                                    </div>
                                    <div className="p-4 bg-[var(--color-accent-mint)]/30 rounded-xl text-center">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase mb-1">Col Effect</div>
                                        <div className="text-xl font-bold text-[var(--color-dot-mint)]">{result.fCol.toFixed(4)}</div>
                                    </div>
                                    <div className="p-4 bg-[var(--color-accent-mint)]/30 rounded-xl text-center">
                                        <div className="text-xs text-[var(--color-ink-light)] uppercase mb-1">Interaction</div>
                                        <div className="text-xl font-bold text-[var(--color-dot-mint)]">{result.fInter.toFixed(4)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
