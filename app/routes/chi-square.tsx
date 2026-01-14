import { useState, useMemo } from "react";
import type { Route } from "./+types/chi-square";
import { BackgroundGraph } from "../components/background-graph";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Chi-Square Calculator" },
        { name: "description", content: "Chi-Square Test of Independence Calculator" },
    ];
}

// Critical Value Lookup for alpha = 0.05
const CRITICAL_VALUES_0_05: Record<number, number> = {
    1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488, 5: 11.070,
    6: 12.592, 7: 14.067, 8: 15.507, 9: 16.919, 10: 18.307,
    11: 19.675, 12: 21.026, 13: 22.362, 14: 23.685, 15: 24.996,
    16: 26.296, 17: 27.587, 18: 28.869, 19: 30.144, 20: 31.410
};

export default function ChiSquareCalculator() {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [data, setData] = useState<number[][]>(
        Array(3).fill(0).map(() => Array(3).fill(0))
    );
    const [submittedData, setSubmittedData] = useState<number[][] | null>(null);

    const handleDataChange = (r: number, c: number, val: string) => {
        const newData = [...data];
        newData[r] = [...newData[r]];
        newData[r][c] = val === "" ? 0 : parseFloat(val);
        setData(newData);
    };

    const updateDimensions = (newRows: number, newCols: number) => {
        const newData = Array(newRows).fill(0).map((_, r) =>
            Array(newCols).fill(0).map((_, c) => (data[r] && data[r][c] !== undefined ? data[r][c] : 0))
        );
        setRows(newRows);
        setCols(newCols);
        setData(newData);
        setSubmittedData(null); // Reset results when dimensions change
    };

    const handleCalculate = () => {
        setSubmittedData(data);
    };

    const results = useMemo(() => {
        if (!submittedData) return null;

        const rowTotals = submittedData.map(row => row.reduce((a, b) => a + b, 0));
        const colTotals = Array(cols).fill(0).map((_, c) => submittedData.reduce((sum, row) => sum + row[c], 0));
        const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

        const expected = submittedData.map((row, r) =>
            row.map((_, c) => (rowTotals[r] * colTotals[c]) / (grandTotal || 1))
        );

        const chiSquareCells = submittedData.map((row, r) =>
            row.map((obs, c) => {
                const exp = expected[r][c];
                if (exp === 0) return 0;
                return Math.pow(obs - exp, 2) / exp;
            })
        );

        const chiSquareStat = chiSquareCells.reduce((sum, row) => sum + row.reduce((rSum, val) => rSum + val, 0), 0);
        const df = (rows - 1) * (cols - 1);

        // Get critical value (approximate or lookup)
        let criticalValue = CRITICAL_VALUES_0_05[df];
        if (!criticalValue) {
            criticalValue = 0;
        }

        // Decision
        const rejectNull = chiSquareStat > criticalValue;

        return { rowTotals, colTotals, grandTotal, expected, chiSquareCells, chiSquareStat, df, criticalValue, rejectNull };
    }, [submittedData, rows, cols]);

    const liveRowTotals = data.map(row => row.reduce((a, b) => a + b, 0));
    const liveColTotals = Array(cols).fill(0).map((_, c) => data.reduce((sum, row) => sum + row[c], 0));
    const liveGrandTotal = liveRowTotals.reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-screen w-full px-6 py-16 sm:py-20 relative overflow-hidden">
            <BackgroundGraph />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="mb-8 fade-in text-center">
                    <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600 dark:from-teal-400 dark:to-blue-500">
                        Chi-Square Test Calculator
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Determine if there is a significant association between two categorical variables.
                    </p>
                </div>

                <div className="mb-8 p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 fade-in delay-100">
                    <div className="flex flex-wrap gap-8 mb-8 items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                Rows
                            </label>
                            <input
                                type="number"
                                min="2"
                                max="10"
                                value={rows}
                                onChange={(e) => updateDimensions(parseInt(e.target.value) || 2, cols)}
                                className="w-20 p-2 text-center text-lg font-bold rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-500 focus:ring-0 transition-colors"
                            />
                        </div>
                        <div className="text-gray-300 dark:text-gray-600 text-xl font-light">×</div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                Columns
                            </label>
                            <input
                                type="number"
                                min="2"
                                max="10"
                                value={cols}
                                onChange={(e) => updateDimensions(rows, parseInt(e.target.value) || 2)}
                                className="w-20 p-2 text-center text-lg font-bold rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-teal-500 focus:ring-0 transition-colors"
                            />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <span className="w-2 h-8 bg-teal-500 rounded-full"></span>
                        Observed Frequencies
                    </h3>
                    <div className="overflow-x-auto mb-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr>
                                    <th className="p-3 bg-gray-50 dark:bg-gray-800/50 border-b border-r dark:border-gray-700"></th>
                                    {Array(cols).fill(0).map((_, c) => (
                                        <th key={c} className="p-3 bg-gray-50 dark:bg-gray-800/50 border-b border-r dark:border-gray-700 min-w-[100px] text-gray-600 dark:text-gray-400 font-bold">
                                            {String.fromCharCode(65 + c)}
                                        </th>
                                    ))}
                                    <th className="p-3 bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200 font-bold">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, r) => (
                                    <tr key={r} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-3 bg-gray-50 dark:bg-gray-800/50 border-r border-b dark:border-gray-700 font-bold text-center text-gray-600 dark:text-gray-400">
                                            {String.fromCharCode(88 + r) || `Row ${r + 1}`}
                                        </td>
                                        {row.map((val, c) => (
                                            <td key={c} className="p-0 border-r border-b dark:border-gray-700">
                                                <input
                                                    type="number"
                                                    value={val}
                                                    onChange={(e) => handleDataChange(r, c, e.target.value)}
                                                    className="w-full h-full text-center p-3 bg-transparent focus:outline-none focus:bg-teal-50 dark:focus:bg-teal-900/20 font-medium text-lg text-gray-800 dark:text-gray-200 transition-colors"
                                                />
                                            </td>
                                        ))}
                                        <td className="p-3 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 text-center font-bold text-gray-500 dark:text-gray-400">
                                            {liveRowTotals[r].toFixed(0)}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="p-3 bg-gray-100 dark:bg-gray-800 font-bold text-center text-gray-800 dark:text-gray-200 border-r dark:border-gray-700">Total</td>
                                    {liveColTotals.map((tot, c) => (
                                        <td key={c} className="p-3 bg-gray-50/50 dark:bg-gray-800/30 text-center font-bold text-gray-500 dark:text-gray-400 border-r dark:border-gray-700">
                                            {tot.toFixed(0)}
                                        </td>
                                    ))}
                                    <td className="p-3 bg-teal-50 dark:bg-teal-900/20 text-center font-bold text-teal-700 dark:text-teal-300 text-lg">
                                        {liveGrandTotal.toFixed(0)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleCalculate}
                            className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-3 px-12 rounded-full shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all transform hover:-translate-y-0.5 active:scale-95 text-lg"
                        >
                            Calculate Chi-Square
                        </button>
                    </div>
                </div>

                {results && submittedData && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">1. Expected Frequencies</h2>
                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wider">Formula</p>
                                <div className="flex items-center gap-4 text-lg text-gray-800 dark:text-gray-200 font-serif flex-wrap">
                                    <span>E<sub>ij</sub> = </span>
                                    <div className="flex flex-col items-center">
                                        <span className="border-b border-gray-400 dark:border-gray-500 px-2 text-center">Row Total × Column Total</span>
                                        <span className="text-center">Grand Total</span>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr>
                                            <th className="p-2 border dark:border-gray-600"></th>
                                            {Array(cols).fill(0).map((_, c) => <th key={c} className="p-2 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700">{String.fromCharCode(65 + c)} (E)</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.expected.map((row, r) => (
                                            <tr key={r}>
                                                <td className="p-2 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-medium text-center">{String.fromCharCode(88 + r)}</td>
                                                {row.map((val, c) => (
                                                    <td key={c} className="p-2 border dark:border-gray-600 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-semibold text-blue-600 dark:text-blue-400">{val.toFixed(2)}</span>
                                                            <span className="text-xs text-gray-400">
                                                                {results.rowTotals[r]} × {results.colTotals[c]} / {results.grandTotal}
                                                            </span>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">2. Compute Chi-Square Statistic</h2>
                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wider">Formula</p>
                                <div className="flex items-center gap-2 text-xl text-gray-800 dark:text-gray-200 font-serif flex-wrap">
                                    <span>χ² = ∑</span>
                                    <div className="flex flex-col items-center mx-2">
                                        <span className="border-b border-gray-400 dark:border-gray-500 px-1 text-center">(O<sub>ij</sub> - E<sub>ij</sub>)<sup>2</sup></span>
                                        <span className="text-center">E<sub>ij</sub></span>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr>
                                            <th className="p-2 border dark:border-gray-600"></th>
                                            {Array(cols).fill(0).map((_, c) => <th key={c} className="p-2 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700">{String.fromCharCode(65 + c)} (χ²)</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.chiSquareCells.map((row, r) => (
                                            <tr key={r}>
                                                <td className="p-2 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-medium text-center">{String.fromCharCode(88 + r)}</td>
                                                {row.map((val, c) => (
                                                    <td key={c} className="p-2 border dark:border-gray-600 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-semibold text-green-600 dark:text-green-400">{val.toFixed(2)}</span>
                                                            <span className="text-xs text-gray-400">
                                                                ({submittedData[r][c]} - {results.expected[r][c].toFixed(2)})² / {results.expected[r][c].toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800/30">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">3. Results & Decision</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b pb-2 dark:border-blue-800/30">
                                        <span className="text-gray-600 dark:text-gray-300">Chi-Square Statistic (χ²):</span>
                                        <span className="font-bold text-xl text-blue-700 dark:text-blue-300">{results.chiSquareStat.toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col border-b pb-2 dark:border-blue-800/30 gap-1">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Degrees of Freedom (df):</span>
                                            <span className="font-mono text-lg dark:text-gray-200">{results.df}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 text-right font-serif">
                                            df = (Rows - 1) × (Cols - 1) = ({rows} - 1) × ({cols} - 1)
                                        </div>
                                    </div>
                                    <div className="flex justify-between border-b pb-2 dark:border-blue-800/30">
                                        <span className="text-gray-600 dark:text-gray-300">Critical Value (α = 0.05):</span>
                                        <span className="font-mono text-lg dark:text-gray-200">{results.criticalValue > 0 ? results.criticalValue : "N/A"}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center items-center p-4 bg-white dark:bg-gray-800 rounded shadow-sm">
                                    <div className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Decision</div>
                                    <div className={`text-4xl font-bold mb-2 ${results.rejectNull ? 'text-red-500' : 'text-green-500'}`}>
                                        {results.rejectNull ? "Reject H₀" : "Fail to Reject H₀"}
                                    </div>
                                    <p className="text-center text-gray-600 dark:text-gray-300">
                                        Since {results.chiSquareStat.toFixed(2)} {results.rejectNull ? ">" : "≤"} {results.criticalValue},
                                        we {results.rejectNull ? "reject" : "fail to reject"} the null hypothesis.
                                    </p>
                                    {results.rejectNull && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
                                            There is a significant association between the variables.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
