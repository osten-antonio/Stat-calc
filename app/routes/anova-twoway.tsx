import React, { useState } from "react";
import { calculateTwoWayAnova, type TwoWayResult } from "./anova-utils";
import type { Route } from "./+types/anova-twoway";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Two-Way ANOVA Calculator" },
        { name: "description", content: "Perform Two-Way Analysis of Variance with Replication" },
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

export default function TwoWay() {
    const [rows, setRows] = useState<number>(3);
    const [cols, setCols] = useState<number>(2);
    const [reps, setReps] = useState<number>(3);
    const [rowFactorName, setRowFactorName] = useState<string>("");
    const [colFactorName, setColFactorName] = useState<string>("");
    const [rowLevelNames, setRowLevelNames] = useState<string[]>(["", "", ""]);
    const [colLevelNames, setColLevelNames] = useState<string[]>(["", ""]);

    // Initial Data based on the user's example if possible, or generic 3x2x3 structure
    const [data, setData] = useState<string[][][]>(
        Array.from({ length: 3 }, () => Array.from({ length: 2 }, () => Array(3).fill("")))
    );
    const [result, setResult] = useState<TwoWayResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleConfigChange = (r: number, c: number, n: number) => {
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

        // Update level names array size
        const newRowNames = [...rowLevelNames];
        while (newRowNames.length < r) newRowNames.push("");
        while (newRowNames.length > r) newRowNames.pop();

        const newColNames = [...colLevelNames];
        while (newColNames.length < c) newColNames.push("");
        while (newColNames.length > c) newColNames.pop();

        setRows(r);
        setCols(c);
        setReps(n);
        setData(newData);
        setRowLevelNames(newRowNames);
        setColLevelNames(newColNames);
        setResult(null);
    };

    const handleDataChange = (rIndex: number, cIndex: number, repIndex: number, value: string) => {
        const newData = [...data];
        newData[rIndex] = [...newData[rIndex]];
        newData[rIndex][cIndex] = [...newData[rIndex][cIndex]];
        newData[rIndex][cIndex][repIndex] = value;
        setData(newData);
    };

    const handleLevelNameChange = (type: 'row' | 'col', index: number, value: string) => {
        if (type === 'row') {
            const newNames = [...rowLevelNames];
            newNames[index] = value;
            setRowLevelNames(newNames);
        } else {
            const newNames = [...colLevelNames];
            newNames[index] = value;
            setColLevelNames(newNames);
        }
        setResult(null);
    };

    const autoFillSample = () => {
        // Sample from User Prompt (approximate reconstruction since only Means were provided mostly)
        // Python+Self: 81.67, Python+Instr: 90.0
        // Java+Self: 73.67, Java+Instr: 83.0
        // C++ +Self: 67.67, C++ +Instr: 77.67
        // Reps = 3 based on dfTotal=17 (18 obs) / 6 cells = 3 reps

        handleConfigChange(3, 2, 3);
        setRowFactorName("Programming Language");
        setColFactorName("Study Method");
        setRowLevelNames(["Python", "Java", "C++"]);
        setColLevelNames(["Self-Study", "Instructor-Led"]);

        setTimeout(() => {
            // Approximating data points to report cell means
            setData([
                // Python (Self, Instr)
                [["78", "82", "85"], ["90", "90", "90"]],
                // Java (Self, Instr)
                [["70", "74", "77"], ["80", "83", "86"]],
                // C++ (Self, Instr)
                [["64", "68", "71"], ["75", "78", "80"]]
            ]);
        }, 50);
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
                            throw new Error(`Invalid number at ${rowLevelNames[i]}, ${colLevelNames[j]}, Rep ${k + 1}`);
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
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans">
            <BackgroundGraph />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="mb-6 fade-in text-center">
                    <h1 className="text-3xl font-extrabold mb-2 text-[var(--color-ink)]" style={{ fontFamily: "var(--font-serif)" }}>Two-Way ANOVA Calculator</h1>
                    <p className="text-[var(--color-ink-light)]">With Replication & Interaction</p>
                </div>

                {/* Configuration */}
                <div
                    className="rounded-lg shadow-sm border p-6 mb-8 fade-in delay-100"
                    style={{ backgroundColor: "var(--color-accent-mint)", borderColor: "var(--color-dot-mint)" }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--color-ink)]">
                                # Rows (Factor A Levels)
                            </label>
                            <input
                                type="number"
                                min="2"
                                max="5"
                                value={rows}
                                onChange={(e) => handleConfigChange(parseInt(e.target.value) || 2, cols, reps)}
                                className="w-full p-2 rounded-md border bg-white focus:ring-2 outline-none"
                                style={{ borderColor: "var(--color-dot-mint)" }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--color-ink)]">
                                # Cols (Factor B Levels)
                            </label>
                            <input
                                type="number"
                                min="2"
                                max="5"
                                value={cols}
                                onChange={(e) => handleConfigChange(rows, parseInt(e.target.value) || 2, reps)}
                                className="w-full p-2 rounded-md border bg-white focus:ring-2 outline-none"
                                style={{ borderColor: "var(--color-dot-mint)" }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--color-ink)]">
                                Replications per Cell
                            </label>
                            <input
                                type="number"
                                min="2"
                                max="10"
                                value={reps}
                                onChange={(e) => handleConfigChange(rows, cols, parseInt(e.target.value) || 2)}
                                className="w-full p-2 rounded-md border bg-white focus:ring-2 outline-none"
                                style={{ borderColor: "var(--color-dot-mint)" }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--color-ink)]">Factor A Name (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Row Factor"
                                value={rowFactorName}
                                onChange={(e) => setRowFactorName(e.target.value)}
                                className="w-full p-2 mb-2 rounded-md border bg-white focus:ring-1 outline-none font-bold"
                                style={{ borderColor: "var(--color-dot-mint)" }}
                            />
                            {rowLevelNames.map((name, i) => (
                                <div key={`row-name-${i}`} className="flex items-center gap-2 mb-1">
                                    <span className="text-xs w-16 text-[var(--color-ink-light)]">Level {i + 1}</span>
                                    <input
                                        value={name}
                                        placeholder={`Row ${i + 1}`}
                                        onChange={(e) => handleLevelNameChange('row', i, e.target.value)}
                                        className="w-full p-1 text-sm rounded border bg-white/80 focus:ring-1 outline-none"
                                        style={{ borderColor: "var(--color-dot-mint)" }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--color-ink)]">Factor B Name (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Column Factor"
                                value={colFactorName}
                                onChange={(e) => setColFactorName(e.target.value)}
                                className="w-full p-2 mb-2 rounded-md border bg-white focus:ring-1 outline-none font-bold"
                                style={{ borderColor: "var(--color-dot-mint)" }}
                            />
                            {colLevelNames.map((name, i) => (
                                <div key={`col-name-${i}`} className="flex items-center gap-2 mb-1">
                                    <span className="text-xs w-16 text-[var(--color-ink-light)]">Level {i + 1}</span>
                                    <input
                                        value={name}
                                        placeholder={`Col ${i + 1}`}
                                        onChange={(e) => handleLevelNameChange('col', i, e.target.value)}
                                        className="w-full p-1 text-sm rounded border bg-white/80 focus:ring-1 outline-none"
                                        style={{ borderColor: "var(--color-dot-mint)" }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data Entry Grid */}
                    <div className="overflow-x-auto">
                        <div className="min-w-max">
                            <div className="grid gap-4" style={{ gridTemplateColumns: `auto repeat(${cols}, 1fr)` }}>
                                {/* Header Row */}
                                <div className="p-2"></div>
                                {colLevelNames.map((name, j) => (
                                    <div key={j} className="text-center font-bold p-2 rounded bg-white" style={{ color: "var(--color-ink)" }}>
                                        {name || `Col ${j + 1}`}
                                    </div>
                                ))}

                                {/* Data Rows */}
                                {rowLevelNames.map((rowName, i) => (
                                    <React.Fragment key={i}>
                                        <div className="flex items-center justify-center font-bold rounded p-2 bg-white" style={{ color: "var(--color-ink)" }}>
                                            {rowName || `Row ${i + 1}`}
                                        </div>
                                        {Array.from({ length: cols }).map((_, j) => (
                                            <div key={`${i}-${j}`} className="space-y-2 p-2 border rounded-lg bg-white/50" style={{ borderColor: "var(--color-dot-mint)" }}>
                                                {Array.from({ length: reps }).map((_, k) => (
                                                    <input
                                                        key={`${i}-${j}-${k}`}
                                                        type="number"
                                                        placeholder={`Rep ${k + 1}`}
                                                        value={data[i][j][k]}
                                                        onChange={(e) => handleDataChange(i, j, k, e.target.value)}
                                                        className="w-full p-1 text-sm rounded border bg-white focus:ring-1 outline-none"
                                                        style={{ borderColor: "var(--color-dot-mint)" }}
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
                            className="text-sm underline decoration-dotted hover:opacity-80 transition-opacity"
                            style={{ color: "var(--color-ink-light)" }}
                        >
                            Autofill with Prompt Example
                        </button>
                        <button
                            onClick={handleCalculate}
                            className="px-6 py-2.5 text-white rounded-lg font-medium shadow-md transition-all hover:shadow-lg transform active:scale-95 uppercase tracking-wide text-sm"
                            style={{ backgroundColor: "var(--color-dot-mint)" }}
                        >
                            Calculate
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 animate-pulse">
                            {error}
                        </div>
                    )}
                </div>

                {result && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* DETAILED REPORT CARDS */}
                        <div className="space-y-6">

                            {/* 1. Hypotheses */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-mint)" }}>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-ink)]">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "var(--color-dot-mint)" }}>1</span>
                                    State Hypotheses
                                </h3>
                                <div className="pl-10 space-y-2 text-[var(--color-ink)]">
                                    <p><strong>Main Effect of {rowFactorName || "Rows"} (H₀):</strong> Mean test scores are the same across all {rowLevelNames.filter(n => n).join(", ") || "rows"}.</p>
                                    <p><strong>Main Effect of {colFactorName || "Cols"} (H₀):</strong> Mean test scores are the same for all {colLevelNames.filter(n => n).join(", ") || "columns"}.</p>
                                    <p><strong>Interaction Effect (H₀):</strong> There is no interaction between {rowFactorName || "Rows"} and {colFactorName || "Cols"}.</p>
                                </div>
                            </div>

                            {/* 2. Degrees of Freedom Working */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-mint)" }}>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-ink)]">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "var(--color-dot-mint)" }}>2</span>
                                    Compute Degrees of Freedom
                                </h3>
                                <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 font-mono text-sm">
                                    <div className="py-1 border-b border-dashed border-gray-200">
                                        <span className="font-semibold text-[var(--color-ink-light)]">df {rowFactorName || "Row"} (A):</span>
                                        <br />R - 1 = {rows} - 1 = <strong>{result.dfRow}</strong>
                                    </div>
                                    <div className="py-1 border-b border-dashed border-gray-200">
                                        <span className="font-semibold text-[var(--color-ink-light)]">df {colFactorName || "Col"} (B):</span>
                                        <br />C - 1 = {cols} - 1 = <strong>{result.dfCol}</strong>
                                    </div>
                                    <div className="py-1 border-b border-dashed border-gray-200">
                                        <span className="font-semibold text-[var(--color-ink-light)]">df Interaction (A×B):</span>
                                        <br />(R - 1)(C - 1) = {result.dfRow} * {result.dfCol} = <strong>{result.dfInter}</strong>
                                    </div>
                                    <div className="py-1 border-b border-dashed border-gray-200">
                                        <span className="font-semibold text-[var(--color-ink-light)]">df Within (Error):</span>
                                        <br />RC(n - 1) = {rows}*{cols}*({reps}-1) = <strong>{result.dfError}</strong>
                                    </div>
                                    <div className="py-1 col-span-1 md:col-span-2">
                                        <span className="font-semibold text-[var(--color-ink-light)]">df Total:</span>
                                        <br />N - 1 = {result.grandN} - 1 = <strong>{result.dfTotal}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Means Calculation */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-mint)" }}>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-ink)]">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "var(--color-dot-mint)" }}>3</span>
                                    Calculate Means
                                </h3>
                                <div className="pl-10">
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-[var(--color-ink)] mb-1">Grand Mean (X̄):</h4>
                                        <p className="font-mono text-sm text-[var(--color-ink-light)]">
                                            ∑X / N = {result.grandSum.toFixed(2)} / {result.grandN} = <strong>{result.grandMean.toFixed(4)}</strong>
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-[var(--color-ink)] mb-2 border-b pb-1">Factor A Means ({rowFactorName || "Rows"}):</h4>
                                            <ul className="space-y-2 font-mono text-sm">
                                                {rowLevelNames.map((name, i) => (
                                                    <li key={`row-mean-calc-${i}`}>
                                                        <span className="text-[var(--color-ink-light)]">{name || `Row ${i + 1}`}:</span>{" "}
                                                        {result.rowSums[i].toFixed(2)} / {cols * reps} = <strong>{result.rowMeans[i].toFixed(4)}</strong>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[var(--color-ink)] mb-2 border-b pb-1">Factor B Means ({colFactorName || "Cols"}):</h4>
                                            <ul className="space-y-2 font-mono text-sm">
                                                {colLevelNames.map((name, i) => (
                                                    <li key={`col-mean-calc-${i}`}>
                                                        <span className="text-[var(--color-ink-light)]">{name || `Col ${i + 1}`}:</span>{" "}
                                                        {result.colSums[i].toFixed(2)} / {rows * reps} = <strong>{result.colMeans[i].toFixed(4)}</strong>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h4 className="font-semibold text-[var(--color-ink)] mb-2 border-b pb-1">Cell Means (Interaction):</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 font-mono text-sm">
                                            {result.cellMeans.map((row, i) => (
                                                row.map((val, j) => (
                                                    <div key={`cell-mean-calc-${i}-${j}`}>
                                                        <span className="text-[var(--color-ink-light)]">
                                                            {rowLevelNames[i] || `R${i + 1}`} & {colLevelNames[j] || `C${j + 1}`}:
                                                        </span>{" "}
                                                        {result.cellSums[i][j].toFixed(2)} / {reps} = <strong>{val.toFixed(4)}</strong>
                                                    </div>
                                                ))
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Sum of Squares Working */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-mint)" }}>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-ink)]">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "var(--color-dot-mint)" }}>4</span>
                                    Compute Sum of Squares (Deviation Method)
                                </h3>
                                <div className="pl-10 space-y-6">

                                    {/* SSA */}
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-ink)] text-sm uppercase tracking-wide mb-2">
                                            SS {rowFactorName || "Row"} (Factor A)
                                        </h4>
                                        <div className="bg-gray-50 p-3 rounded border font-mono text-xs overflow-x-auto">
                                            <div className="mb-1 text-[var(--color-ink-light)]">Formula: ∑ n_row * (RowMean - GrandMean)²</div>
                                            <div className="mb-2 text-[var(--color-ink-light)]">n_row = {cols} * {reps} = {cols * reps}</div>
                                            <div className="whitespace-nowrap">
                                                = {rowLevelNames.map((name, i) => (
                                                    `${cols * reps}*(${result.rowMeans[i].toFixed(2)} - ${result.grandMean.toFixed(2)})²`
                                                )).join(" + ")}
                                                <br />
                                                = <strong>{result.ssRow.toFixed(4)}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SSB */}
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-ink)] text-sm uppercase tracking-wide mb-2">
                                            SS {colFactorName || "Col"} (Factor B)
                                        </h4>
                                        <div className="bg-gray-50 p-3 rounded border font-mono text-xs overflow-x-auto">
                                            <div className="mb-1 text-[var(--color-ink-light)]">Formula: ∑ n_col * (ColMean - GrandMean)²</div>
                                            <div className="mb-2 text-[var(--color-ink-light)]">n_col = {rows} * {reps} = {rows * reps}</div>
                                            <div className="whitespace-nowrap">
                                                = {colLevelNames.map((name, i) => (
                                                    `${rows * reps}*(${result.colMeans[i].toFixed(2)} - ${result.grandMean.toFixed(2)})²`
                                                )).join(" + ")}
                                                <br />
                                                = <strong>{result.ssCol.toFixed(4)}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SSE */}
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-ink)] text-sm uppercase tracking-wide mb-2">
                                            SS Within (Error)
                                        </h4>
                                        <div className="bg-gray-50 p-3 rounded border font-mono text-xs overflow-x-auto">
                                            <div className="mb-2 text-[var(--color-ink-light)]">Formula: ∑ (x - CellMean)²  [Summed for each cell]</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                                {result.ssPerCell.map((rowArr, i) => (
                                                    rowArr.map((val, j) => (
                                                        <div key={`ss-cell-show-${i}-${j}`}>
                                                            SS({rowLevelNames[i] || `R${i + 1}`}, {colLevelNames[j] || `C${j + 1}`}) = {val.toFixed(4)}
                                                        </div>
                                                    ))
                                                ))}
                                            </div>
                                            <div>
                                                Sum = {result.ssPerCell.flat().map(v => v.toFixed(1)).join(" + ")}...
                                                <br />
                                                = <strong>{result.ssError.toFixed(4)}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SS Total */}
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-ink)] text-sm uppercase tracking-wide mb-2">
                                            SS Total
                                        </h4>
                                        <div className="bg-gray-50 p-3 rounded border font-mono text-xs">
                                            <div className="mb-1 text-[var(--color-ink-light)]">Formula: ∑ (x - GrandMean)²</div>
                                            <div>
                                                = (x₁ - {result.grandMean.toFixed(2)})² + ... + (xₙ - {result.grandMean.toFixed(2)})²
                                                <br />
                                                = <strong>{result.ssTotal.toFixed(4)}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SS Interaction */}
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-ink)] text-sm uppercase tracking-wide mb-2">
                                            SS Interaction
                                        </h4>
                                        <div className="bg-gray-50 p-3 rounded border font-mono text-xs">
                                            <div className="mb-1 text-[var(--color-ink-light)]">Formula: SS Total - SSA - SSB - SSE</div>
                                            <div>
                                                = {result.ssTotal.toFixed(4)} - {result.ssRow.toFixed(4)} - {result.ssCol.toFixed(4)} - {result.ssError.toFixed(4)}
                                                <br />
                                                = <strong>{result.ssInter.toFixed(4)}</strong>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* 5. Mean Squares Working */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-mint)" }}>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-ink)]">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "var(--color-dot-mint)" }}>5</span>
                                    Compute Mean Squares
                                </h3>
                                <div className="pl-10 space-y-4 font-mono text-sm">
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-ink)] mb-1">MSA ({rowFactorName || "Row"}):</h4>
                                        <p className="text-[var(--color-ink-light)] mb-1">Formula: SSA / dfA</p>
                                        <p>{result.ssRow.toFixed(4)} / {result.dfRow} = <strong>{result.msRow.toFixed(4)}</strong></p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-ink)] mb-1">MSB ({colFactorName || "Col"}):</h4>
                                        <p className="text-[var(--color-ink-light)] mb-1">Formula: SSB / dfB</p>
                                        <p>{result.ssCol.toFixed(4)} / {result.dfCol} = <strong>{result.msCol.toFixed(4)}</strong></p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-ink)] mb-1">MS Interaction:</h4>
                                        <p className="text-[var(--color-ink-light)] mb-1">Formula: SSInter / dfInter</p>
                                        <p>{result.ssInter.toFixed(4)} / {result.dfInter} = <strong>{result.msInter.toFixed(4)}</strong></p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-ink)] mb-1">MSE (Error):</h4>
                                        <p className="text-[var(--color-ink-light)] mb-1">Formula: SSE / dfError</p>
                                        <p>{result.ssError.toFixed(4)} / {result.dfError} = <strong>{result.msError.toFixed(4)}</strong></p>
                                    </div>
                                </div>
                            </div>

                            {/* 6. F-Statistics Working */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: "var(--color-dot-mint)" }}>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-ink)]">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "var(--color-dot-mint)" }}>6</span>
                                    Compute F-Statistics
                                </h3>
                                <div className="pl-10 space-y-4 font-mono text-sm">
                                    <p className="text-xs text-[var(--color-ink-light)] italic mb-2">Note: All F-ratios use MSE as the denominator.</p>
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-ink)] mb-1">F ({rowFactorName || "Row"}):</h4>
                                        <p className="text-[var(--color-ink-light)] mb-1">Formula: MSA / MSE</p>
                                        <p>{result.msRow.toFixed(4)} / {result.msError.toFixed(4)} = <strong>{result.fRow.toFixed(4)}</strong></p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-ink)] mb-1">F ({colFactorName || "Col"}):</h4>
                                        <p className="text-[var(--color-ink-light)] mb-1">Formula: MSB / MSE</p>
                                        <p>{result.msCol.toFixed(4)} / {result.msError.toFixed(4)} = <strong>{result.fCol.toFixed(4)}</strong></p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[var(--color-ink)] mb-1">F (Interaction):</h4>
                                        <p className="text-[var(--color-ink-light)] mb-1">Formula: MSInter / MSE</p>
                                        <p>{result.msInter.toFixed(4)} / {result.msError.toFixed(4)} = <strong>{result.fInter.toFixed(4)}</strong></p>
                                    </div>
                                </div>
                            </div>

                            {/* 7. P-Values & Conclusion */}
                            <div className="bg-[var(--color-accent-mint)]/30 p-6 rounded-xl border border-[var(--color-dot-mint)]">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--color-ink)]">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "var(--color-dot-mint)" }}>7</span>
                                    P-Values & Conclusion (α = 0.05)
                                </h3>

                                <div className="space-y-6">
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">

                                            {/* Row Decision */}
                                            <div className="p-3 border rounded-lg bg-gray-50">
                                                <h4 className="font-bold border-b pb-1 mb-2">{rowFactorName || "Row Factor"}</h4>
                                                <div className="space-y-1">
                                                    <p><strong>F-Stat:</strong> {result.fRow.toFixed(4)}</p>
                                                    <p><strong>df:</strong> ({result.dfRow}, {result.dfError})</p>
                                                    <div className="my-2 pt-2 border-t border-dashed border-gray-300">
                                                        <p className="text-[var(--color-ink-light)] text-xs mb-1">P(F &gt; {result.fRow.toFixed(3)}) =</p>
                                                        <p className={`font-bold text-lg ${result.pRow < 0.05 ? "text-red-600" : "text-green-600"}`}>
                                                            {result.pRow < 0.0001 ? "< 0.0001" : result.pRow.toFixed(5)}
                                                        </p>
                                                        <p className="text-xs italic mt-1">
                                                            {result.pRow < 0.05 ? "Reject H₀ (Significant)" : "Fail to Reject H₀"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Col Decision */}
                                            <div className="p-3 border rounded-lg bg-gray-50">
                                                <h4 className="font-bold border-b pb-1 mb-2">{colFactorName || "Col Factor"}</h4>
                                                <div className="space-y-1">
                                                    <p><strong>F-Stat:</strong> {result.fCol.toFixed(4)}</p>
                                                    <p><strong>df:</strong> ({result.dfCol}, {result.dfError})</p>
                                                    <div className="my-2 pt-2 border-t border-dashed border-gray-300">
                                                        <p className="text-[var(--color-ink-light)] text-xs mb-1">P(F &gt; {result.fCol.toFixed(3)}) =</p>
                                                        <p className={`font-bold text-lg ${result.pCol < 0.05 ? "text-red-600" : "text-green-600"}`}>
                                                            {result.pCol < 0.0001 ? "< 0.0001" : result.pCol.toFixed(5)}
                                                        </p>
                                                        <p className="text-xs italic mt-1">
                                                            {result.pCol < 0.05 ? "Reject H₀ (Significant)" : "Fail to Reject H₀"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Interaction Decision */}
                                            <div className="p-3 border rounded-lg bg-gray-50">
                                                <h4 className="font-bold border-b pb-1 mb-2">Interaction</h4>
                                                <div className="space-y-1">
                                                    <p><strong>F-Stat:</strong> {result.fInter.toFixed(4)}</p>
                                                    <p><strong>df:</strong> ({result.dfInter}, {result.dfError})</p>
                                                    <div className="my-2 pt-2 border-t border-dashed border-gray-300">
                                                        <p className="text-[var(--color-ink-light)] text-xs mb-1">P(F &gt; {result.fInter.toFixed(3)}) =</p>
                                                        <p className={`font-bold text-lg ${result.pInter < 0.05 ? "text-red-600" : "text-green-600"}`}>
                                                            {result.pInter < 0.0001 ? "< 0.0001" : result.pInter.toFixed(5)}
                                                        </p>
                                                        <p className="text-xs italic mt-1">
                                                            {result.pInter < 0.05 ? "Reject H₀ (Significant)" : "Fail to Reject H₀"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
