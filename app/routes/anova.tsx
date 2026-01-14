import { useState } from "react";
import OneWay from "./anova-oneway";
import TwoWay from "./anova-twoway";
import type { Route } from "./+types/anova";
import { BackgroundGraph } from "../components/background-graph";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ANOVA Calculator" },
        { name: "description", content: "Perform One-Way and Two-Way Analysis of Variance" },
    ];
}

export default function AnovaRoute() {
    const [mode, setMode] = useState<"one-way" | "two-way">("one-way");

    return (
        <div className="min-h-screen w-full px-6 py-12 relative overflow-hidden font-sans text-gray-800 dark:text-gray-100">
            <BackgroundGraph />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-8 fade-in">
                    <h1 className="text-4xl font-extrabold mb-3">
                        ANOVA Calculator
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Statistical analysis made simple. Switch between methods below.
                    </p>
                </div>

                <div className="flex justify-center mb-8 fade-in delay-100">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm inline-flex">
                        <button
                            onClick={() => setMode("one-way")}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${mode === "one-way"
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            One-Way ANOVA
                        </button>
                        <button
                            onClick={() => setMode("two-way")}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ml-1 ${mode === "two-way"
                                ? "bg-purple-600 text-white shadow-md"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            Two-Way ANOVA
                        </button>
                    </div>
                </div>

                <div className="transition-all duration-500 ease-in-out fade-in delay-200">
                    {mode === "one-way" ? <OneWay /> : <TwoWay />}
                </div>
            </div>
        </div>
    );
}
