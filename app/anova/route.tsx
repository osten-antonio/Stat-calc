import { useState } from "react";
import OneWay from "./OneWay";
import TwoWay from "./TwoWay";
import type { Route } from "./+types/route";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ANOVA Calculator" },
        { name: "description", content: "Perform One-Way and Two-Way Analysis of Variance" },
    ];
}

export default function AnovaRoute() {
    const [mode, setMode] = useState<"one-way" | "two-way">("one-way");

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        ANOVA Calculator
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Statistical analysis made simple. Switch between methods below.
                    </p>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm inline-flex">
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

                <div className="transition-all duration-500 ease-in-out">
                    {mode === "one-way" ? <OneWay /> : <TwoWay />}
                </div>
            </div>
        </div>
    );
}
