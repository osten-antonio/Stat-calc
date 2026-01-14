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
                            {(() => {
                                const R = result.rowMeans.length;
                                const C = result.colMeans.length;
                                const n = result.grandN / (R * C);
                                const nRow = C * n;
                                const nCol = R * n;
                                
                                return (
                                    <>
                                        <div>
                                            <h5 className="font-medium text-[var(--color-ink)] mb-3">Step 1: Compute Degrees of Freedom</h5>
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm font-mono text-[var(--color-ink-light)] space-y-3">
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-xs uppercase tracking-wide mb-1">df Factor A (Rows)</div>
                                                        <div>R - 1 = {R} - 1 = <strong className="text-[var(--color-ink)]">{result.dfRow}</strong></div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs uppercase tracking-wide mb-1">df Factor B (Columns)</div>
                                                        <div>C - 1 = {C} - 1 = <strong className="text-[var(--color-ink)]">{result.dfCol}</strong></div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs uppercase tracking-wide mb-1">df Interaction (A×B)</div>
                                                        <div>(R - 1)(C - 1) = {result.dfRow} × {result.dfCol} = <strong className="text-[var(--color-ink)]">{result.dfInter}</strong></div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs uppercase tracking-wide mb-1">df Within (Error)</div>
                                                        <div>RC(n - 1) = {R} × {C} × ({n} - 1) = <strong className="text-[var(--color-ink)]">{result.dfError}</strong></div>
                                                    </div>
                                                </div>
                                                <div className="h-px bg-gray-200" />
                                                <div>
                                                    <div className="text-xs uppercase tracking-wide mb-1">df Total</div>
                                                    <div>N - 1 = {result.grandN} - 1 = <strong className="text-[var(--color-ink)]">{result.dfTotal}</strong></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="font-medium text-[var(--color-ink)] mb-3">Step 2: Calculate Means</h5>
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm font-mono text-[var(--color-ink-light)]">
                                                    <div className="text-xs uppercase tracking-wide mb-2">Grand Mean (X̄)</div>
                                                    <MathBlock formula={`\\bar{X} = \\frac{\\sum X}{N}`} />
                                                    <div className="mt-2">= {result.grandSum.toFixed(2)} / {result.grandN} = <strong className="text-[var(--color-ink)]">{result.grandMean.toFixed(4)}</strong></div>
                                                </div>
                                                
                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm font-mono text-[var(--color-ink-light)]">
                                                    <div className="text-xs uppercase tracking-wide mb-2">Factor A Means (Rows)</div>
                                                    <div className="space-y-1">
                                                        {result.rowMeans.map((m, i) => (
                                                            <div key={i}>
                                                                Row {i + 1}: {result.rowSums[i].toFixed(2)} / {nRow} = <strong className="text-[var(--color-ink)]">{m.toFixed(4)}</strong>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm font-mono text-[var(--color-ink-light)]">
                                                    <div className="text-xs uppercase tracking-wide mb-2">Factor B Means (Columns)</div>
                                                    <div className="space-y-1">
                                                        {result.colMeans.map((m, j) => (
                                                            <div key={j}>
                                                                Col {j + 1}: {result.colSums[j].toFixed(2)} / {nCol} = <strong className="text-[var(--color-ink)]">{m.toFixed(4)}</strong>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm font-mono text-[var(--color-ink-light)]">
                                                    <div className="text-xs uppercase tracking-wide mb-2">Cell Means (Interaction)</div>
                                                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${C}, 1fr)` }}>
                                                        {result.cellMeans.flatMap((row, i) =>
                                                            row.map((cellMean, j) => (
                                                                <div key={`${i}-${j}`} className="p-2 bg-white rounded border border-gray-100">
                                                                    <div className="text-xs text-[var(--color-ink-light)]">R{i+1} × C{j+1}</div>
                                                                    <div>{result.cellSums[i][j].toFixed(2)} / {n} = <strong className="text-[var(--color-ink)]">{cellMean.toFixed(4)}</strong></div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="font-medium text-[var(--color-ink)] mb-3">Step 3: Compute Sum of Squares (Deviation Method)</h5>
                                            <div className="space-y-4">
                                                <div className="p-4 border border-gray-100 rounded-xl bg-white">
                                                    <div className="text-xs text-[var(--color-ink-light)] uppercase tracking-wide mb-2">SS Factor A (Rows)</div>
                                                    <MathBlock formula={`SS_A = \\sum n_{row} \\times (\\bar{X}_{row} - \\bar{X}_{grand})^2`} />
                                                    <div className="mt-3 text-sm font-mono text-[var(--color-ink-light)] bg-gray-50 p-3 rounded-lg">
                                                        <div className="mb-1">Constant: n_row = C × n = {C} × {n} = {nRow}</div>
                                                        <div className="space-y-1 mt-2">
                                                            {result.rowMeans.map((m, i) => {
                                                                const term = nRow * Math.pow(m - result.grandMean, 2);
                                                                return (
                                                                    <div key={i}>
                                                                        = {nRow} × ({m.toFixed(2)} - {result.grandMean.toFixed(2)})² = {term.toFixed(4)}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="h-px bg-gray-200 my-2" />
                                                        <div className="font-semibold text-[var(--color-ink)]">SS_A = <strong>{result.ssRow.toFixed(4)}</strong></div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4 border border-gray-100 rounded-xl bg-white">
                                                    <div className="text-xs text-[var(--color-ink-light)] uppercase tracking-wide mb-2">SS Factor B (Columns)</div>
                                                    <MathBlock formula={`SS_B = \\sum n_{col} \\times (\\bar{X}_{col} - \\bar{X}_{grand})^2`} />
                                                    <div className="mt-3 text-sm font-mono text-[var(--color-ink-light)] bg-gray-50 p-3 rounded-lg">
                                                        <div className="mb-1">Constant: n_col = R × n = {R} × {n} = {nCol}</div>
                                                        <div className="space-y-1 mt-2">
                                                            {result.colMeans.map((m, j) => {
                                                                const term = nCol * Math.pow(m - result.grandMean, 2);
                                                                return (
                                                                    <div key={j}>
                                                                        = {nCol} × ({m.toFixed(2)} - {result.grandMean.toFixed(2)})² = {term.toFixed(4)}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="h-px bg-gray-200 my-2" />
                                                        <div className="font-semibold text-[var(--color-ink)]">SS_B = <strong>{result.ssCol.toFixed(4)}</strong></div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4 border border-gray-100 rounded-xl bg-white">
                                                    <div className="text-xs text-[var(--color-ink-light)] uppercase tracking-wide mb-2">SS Within (Error)</div>
                                                    <MathBlock formula={`SS_E = \\sum (X - \\bar{X}_{cell})^2`} />
                                                    <div className="mt-3 text-sm font-mono text-[var(--color-ink-light)] bg-gray-50 p-3 rounded-lg">
                                                        <div className="mb-2">Individual Cell SS values:</div>
                                                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(C, 3)}, 1fr)` }}>
                                                            {result.ssPerCell.flatMap((row, i) =>
                                                                row.map((cellSS, j) => (
                                                                    <div key={`${i}-${j}`} className="p-2 bg-white rounded border border-gray-100 text-xs">
                                                                        SS(R{i+1}, C{j+1}) = {cellSS.toFixed(4)}
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                        <div className="h-px bg-gray-200 my-2" />
                                                        <div className="font-semibold text-[var(--color-ink)]">
                                                            Sum = {result.ssPerCell.flat().map(s => s.toFixed(2)).join(' + ')} = <strong>{result.ssError.toFixed(4)}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4 border border-gray-100 rounded-xl bg-white">
                                                    <div className="text-xs text-[var(--color-ink-light)] uppercase tracking-wide mb-2">SS Total</div>
                                                    <MathBlock formula={`SS_{Total} = \\sum (X - \\bar{X}_{grand})^2`} />
                                                    <div className="mt-3 text-sm font-mono text-[var(--color-ink-light)] bg-gray-50 p-3 rounded-lg">
                                                        <div>= Σ(x - {result.grandMean.toFixed(2)})² for all observations</div>
                                                        <div className="font-semibold text-[var(--color-ink)] mt-1">SS_Total = <strong>{result.ssTotal.toFixed(4)}</strong></div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4 border border-gray-100 rounded-xl bg-white">
                                                    <div className="text-xs text-[var(--color-ink-light)] uppercase tracking-wide mb-2">SS Interaction</div>
                                                    <MathBlock formula={`SS_{AB} = SS_{Total} - SS_A - SS_B - SS_E`} />
                                                    <div className="mt-3 text-sm font-mono text-[var(--color-ink-light)] bg-gray-50 p-3 rounded-lg">
                                                        <div>= {result.ssTotal.toFixed(4)} - {result.ssRow.toFixed(4)} - {result.ssCol.toFixed(4)} - {result.ssError.toFixed(4)}</div>
                                                        <div className="font-semibold text-[var(--color-ink)] mt-1">SS_AB = <strong>{result.ssInter.toFixed(4)}</strong></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="font-medium text-[var(--color-ink)] mb-3">Step 4: Compute Mean Squares</h5>
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm font-mono text-[var(--color-ink-light)] space-y-3">
                                                <div>
                                                    <div className="text-xs uppercase tracking-wide mb-1">MS Factor A (Rows)</div>
                                                    <div>SS_A / df_A = {result.ssRow.toFixed(4)} / {result.dfRow} = <strong className="text-[var(--color-ink)]">{result.msRow.toFixed(4)}</strong></div>
                                                </div>
                                                <div>
                                                    <div className="text-xs uppercase tracking-wide mb-1">MS Factor B (Columns)</div>
                                                    <div>SS_B / df_B = {result.ssCol.toFixed(4)} / {result.dfCol} = <strong className="text-[var(--color-ink)]">{result.msCol.toFixed(4)}</strong></div>
                                                </div>
                                                <div>
                                                    <div className="text-xs uppercase tracking-wide mb-1">MS Interaction</div>
                                                    <div>SS_AB / df_AB = {result.ssInter.toFixed(4)} / {result.dfInter} = <strong className="text-[var(--color-ink)]">{result.msInter.toFixed(4)}</strong></div>
                                                </div>
                                                <div>
                                                    <div className="text-xs uppercase tracking-wide mb-1">MS Error (MSE)</div>
                                                    <div>SS_E / df_E = {result.ssError.toFixed(4)} / {result.dfError} = <strong className="text-[var(--color-ink)]">{result.msError.toFixed(4)}</strong></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="font-medium text-[var(--color-ink)] mb-3">Step 5: Compute F-Statistics</h5>
                                            <div className="text-xs text-[var(--color-ink-light)] mb-3 italic">Note: All F-ratios use MSE as the denominator</div>
                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div className="p-4 bg-[var(--color-accent-mint)]/30 rounded-xl">
                                                    <div className="text-xs text-[var(--color-ink-light)] uppercase mb-2">F (Factor A)</div>
                                                    <MathBlock formula={`F_A = \\frac{MS_A}{MS_E}`} />
                                                    <div className="text-sm font-mono mt-2 text-[var(--color-ink-light)]">
                                                        = {result.msRow.toFixed(4)} / {result.msError.toFixed(4)}
                                                    </div>
                                                    <div className="text-2xl font-bold text-[var(--color-dot-mint)] mt-1">{result.fRow.toFixed(4)}</div>
                                                </div>
                                                <div className="p-4 bg-[var(--color-accent-mint)]/30 rounded-xl">
                                                    <div className="text-xs text-[var(--color-ink-light)] uppercase mb-2">F (Factor B)</div>
                                                    <MathBlock formula={`F_B = \\frac{MS_B}{MS_E}`} />
                                                    <div className="text-sm font-mono mt-2 text-[var(--color-ink-light)]">
                                                        = {result.msCol.toFixed(4)} / {result.msError.toFixed(4)}
                                                    </div>
                                                    <div className="text-2xl font-bold text-[var(--color-dot-mint)] mt-1">{result.fCol.toFixed(4)}</div>
                                                </div>
                                                <div className="p-4 bg-[var(--color-accent-mint)]/30 rounded-xl">
                                                    <div className="text-xs text-[var(--color-ink-light)] uppercase mb-2">F (Interaction)</div>
                                                    <MathBlock formula={`F_{AB} = \\frac{MS_{AB}}{MS_E}`} />
                                                    <div className="text-sm font-mono mt-2 text-[var(--color-ink-light)]">
                                                        = {result.msInter.toFixed(4)} / {result.msError.toFixed(4)}
                                                    </div>
                                                    <div className="text-2xl font-bold text-[var(--color-dot-mint)] mt-1">{result.fInter.toFixed(4)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
