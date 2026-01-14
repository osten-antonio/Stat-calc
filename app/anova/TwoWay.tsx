import React, { useState } from "react";
import { calculateTwoWayAnova, type TwoWayResult } from "./utils";

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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    Two-Way ANOVA (With Replication)
                </h2>

                {/* Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rows (Factor A Levels)
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="5"
                            value={rows}
                            onChange={(e) => handleConfigChange(parseInt(e.target.value) || 2, cols, reps)}
                            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Columns (Factor B Levels)
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="5"
                            value={cols}
                            onChange={(e) => handleConfigChange(rows, parseInt(e.target.value) || 2, reps)}
                            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Replications per Cell
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="10"
                            value={reps}
                            onChange={(e) => handleConfigChange(rows, cols, parseInt(e.target.value) || 2)}
                            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Data Entry Grid */}
                <div className="overflow-x-auto">
                    <div className="min-w-max">
                        <div className="grid gap-4" style={{ gridTemplateColumns: `auto repeat(${cols}, 1fr)` }}>
                            {/* Header Row */}
                            <div className="p-2"></div>
                            {Array.from({ length: cols }).map((_, j) => (
                                <div key={j} className="text-center font-bold text-gray-700 dark:text-gray-300 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                    Col {j + 1}
                                </div>
                            ))}

                            {/* Data Rows */}
                            {Array.from({ length: rows }).map((_, i) => (
                                <React.Fragment key={i}>
                                    <div className="flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded p-2">
                                        Row {i + 1}
                                    </div>
                                    {Array.from({ length: cols }).map((_, j) => (
                                        <div key={`${i}-${j}`} className="space-y-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            {Array.from({ length: reps }).map((_, k) => (
                                                <input
                                                    key={`${i}-${j}-${k}`}
                                                    type="number"
                                                    placeholder={`Rep ${k + 1}`}
                                                    value={data[i][j][k]}
                                                    onChange={(e) => handleDataChange(i, j, k, e.target.value)}
                                                    className="w-full p-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-1 focus:ring-purple-500"
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
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline decoration-dotted"
                    >
                        Autofill Sample Data
                    </button>
                    <button
                        onClick={handleCalculate}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform active:scale-95 transition-all text-sm uppercase tracking-wide"
                    >
                        Calculate F-Statistics
                    </button>
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-800 animate-pulse">
                        {error}
                    </div>
                )}
            </div>

            {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Summary Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            ANOVA Summary Table
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Source of Variation</th>
                                        <th scope="col" className="px-6 py-3">SS</th>
                                        <th scope="col" className="px-6 py-3">df</th>
                                        <th scope="col" className="px-6 py-3">MS</th>
                                        <th scope="col" className="px-6 py-3">F</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Row Factor */}
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            Rows (Factor A)
                                        </td>
                                        <td className="px-6 py-4">{result.ssRow.toFixed(4)}</td>
                                        <td className="px-6 py-4">{result.dfRow}</td>
                                        <td className="px-6 py-4">{result.msRow.toFixed(4)}</td>
                                        <td className="px-6 py-4 font-bold text-purple-600 dark:text-purple-400">{result.fRow.toFixed(4)}</td>
                                    </tr>
                                    {/* Col Factor */}
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            Columns (Factor B)
                                        </td>
                                        <td className="px-6 py-4">{result.ssCol.toFixed(4)}</td>
                                        <td className="px-6 py-4">{result.dfCol}</td>
                                        <td className="px-6 py-4">{result.msCol.toFixed(4)}</td>
                                        <td className="px-6 py-4 font-bold text-purple-600 dark:text-purple-400">{result.fCol.toFixed(4)}</td>
                                    </tr>
                                    {/* Interaction */}
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            Interaction (AxB)
                                        </td>
                                        <td className="px-6 py-4">{result.ssInter.toFixed(4)}</td>
                                        <td className="px-6 py-4">{result.dfInter}</td>
                                        <td className="px-6 py-4">{result.msInter.toFixed(4)}</td>
                                        <td className="px-6 py-4 font-bold text-purple-600 dark:text-purple-400">{result.fInter.toFixed(4)}</td>
                                    </tr>
                                    {/* Error */}
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            Error (Within)
                                        </td>
                                        <td className="px-6 py-4">{result.ssError.toFixed(4)}</td>
                                        <td className="px-6 py-4">{result.dfError}</td>
                                        <td className="px-6 py-4">{result.msError.toFixed(4)}</td>
                                        <td className="px-6 py-4">-</td>
                                    </tr>
                                    {/* Total */}
                                    <tr className="bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-600">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                            Total
                                        </td>
                                        <td className="px-6 py-4 font-bold">{result.ssTotal.toFixed(4)}</td>
                                        <td className="px-6 py-4 font-bold">{result.dfTotal}</td>
                                        <td className="px-6 py-4"></td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detailed Working */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white border-b pb-2 dark:border-gray-700 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Step-by-Step Calculation (Deviation Method)
                        </h3>

                        {/* Step 1: Calculate Means */}
                        <div className="mb-8">
                            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Step 1: Calculate Means</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                First, calculate the Grand Mean, and the means for each level of the factors.
                            </p>
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm space-y-4">
                                <div><strong>Grand Mean (X̄..):</strong> {result.grandMean.toFixed(4)}</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <strong>Row Means (Factor A):</strong>
                                        <ul className="list-disc list-inside ml-2">
                                            {result.rowMeans.map((m, i) => (
                                                <li key={i}>Row {i + 1}: {m.toFixed(4)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <strong>Column Means (Factor B):</strong>
                                        <ul className="list-disc list-inside ml-2">
                                            {result.colMeans.map((m, j) => (
                                                <li key={j}>Col {j + 1}: {m.toFixed(4)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div>
                                    <strong>Cell Means (Interaction Means):</strong>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 ml-2">
                                        {result.cellMeans.map((rowArr, i) => (
                                            rowArr.map((mean, j) => (
                                                <div key={`${i}-${j}`}>
                                                    Row {i + 1} & Col {j + 1}: {mean.toFixed(4)}
                                                </div>
                                            ))
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: SS Factor A (Rows) */}
                        <div className="mb-8">
                            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Step 2: Sum of Squares for Rows (Factor A)</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Formula: ∑ n_row * (Mean_row - GrandMean)²
                            </p>
                            <div className="p-3 border rounded bg-white dark:bg-gray-800 text-sm">
                                {result.rowMeans.map((m, i) => (
                                    <span key={i}>
                                        {cols * reps} * ({m.toFixed(3)} - {result.grandMean.toFixed(3)})²
                                        {i < result.rowMeans.length - 1 ? " + " : ""}
                                    </span>
                                ))}
                                <br />
                                = <strong>{result.ssRow.toFixed(4)}</strong>
                            </div>
                        </div>

                        {/* Step 3: SS Factor B (Cols) */}
                        <div className="mb-8">
                            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Step 3: Sum of Squares for Columns (Factor B)</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Formula: ∑ n_col * (Mean_col - GrandMean)²
                            </p>
                            <div className="p-3 border rounded bg-white dark:bg-gray-800 text-sm">
                                {result.colMeans.map((m, j) => (
                                    <span key={j}>
                                        {rows * reps} * ({m.toFixed(3)} - {result.grandMean.toFixed(3)})²
                                        {j < result.colMeans.length - 1 ? " + " : ""}
                                    </span>
                                ))}
                                <br />
                                = <strong>{result.ssCol.toFixed(4)}</strong>
                            </div>
                        </div>

                        {/* Step 4: SS Within (Error) */}
                        <div className="mb-8">
                            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Step 4: Sum of Squares Within (Error)</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Formula: ∑ (X - Mean_cell)² (Sum of squared differences between each observation and its cell mean).
                            </p>
                            <div className="p-3 border rounded bg-white dark:bg-gray-800 text-sm space-y-2">
                                {result.cellMeans.map((rowArr, i) => (
                                    rowArr.map((mean, j) => (
                                        <div key={`${i}-${j}`} className="pb-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <strong>SS Row {i + 1} & Col {j + 1}</strong> =
                                            {data[i][j].map((val, k) => (
                                                <span key={k}> ({Number(val)} - {mean.toFixed(3)})²{k < data[i][j].length - 1 ? " + " : ""}</span>
                                            ))}
                                            = <strong>{result.ssPerCell[i][j].toFixed(4)}</strong>
                                        </div>
                                    ))
                                ))}
                                <div className="mt-4 pt-2 border-t border-gray-300 dark:border-gray-600">
                                    <strong>SSE</strong> = {result.ssPerCell.flat().map(v => v.toFixed(3)).join(" + ")}
                                    <br />
                                    = <strong>{result.ssError.toFixed(4)}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Step 5: SS Total */}
                        <div className="mb-8">
                            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Step 5: Total Sum of Squares</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Formula: ∑ (X - GrandMean)² (Sum of squared differences from the grand mean).
                            </p>
                            <div className="p-3 border rounded bg-white dark:bg-gray-800 text-sm">
                                Calculated directly from individual observations:
                                <br />
                                <strong>SS Total = {result.ssTotal.toFixed(4)}</strong>
                            </div>
                        </div>

                        {/* Step 6: SS Interaction */}
                        <div className="mb-8">
                            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Step 6: Sum of Squares Interaction</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Derived by subtraction: SS_Interaction = SS_Total - SS_Row - SS_Col - SS_Within
                            </p>
                            <div className="p-3 border rounded bg-white dark:bg-gray-800 text-sm">
                                {result.ssTotal.toFixed(4)} (Total) - {result.ssRow.toFixed(4)} (Rows) - {result.ssCol.toFixed(4)} (Cols) - {result.ssError.toFixed(4)} (Within)
                                <br />
                                = <strong>{result.ssInter.toFixed(4)}</strong>
                            </div>
                        </div>

                        {/* Step 7: Final Table Reference */}
                        <div>
                            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Step 7: ANOVA Table</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Use the SS values calculated above to compute Mean Squares (SS/df) and F-ratios (MS/MS_Error). See the Summary Table at the top for final values.
                            </p>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
