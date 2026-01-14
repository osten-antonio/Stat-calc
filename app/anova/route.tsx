import { useState } from "react";
import OneWay from "./OneWay";
import TwoWay from "./TwoWay";
import type { Route } from "./+types/route";
import { Link } from "react-router";
import { Button } from "~/components/ui/Button";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "ANOVA Calculator" },
        { name: "description", content: "Perform One-Way and Two-Way Analysis of Variance" },
    ];
}

export default function AnovaRoute() {
    const [mode, setMode] = useState<"one-way" | "two-way">("one-way");

    return (
        <main className="min-h-screen bg-white px-6 py-12 font-sans text-[var(--color-ink)]">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 fade-in">
                    <Link
                        to="/"
                        className="text-sm font-medium text-[var(--color-ink-light)] hover:text-[var(--color-dot-mint)] transition-colors mb-4 inline-block"
                    >
                        ← Back to Home
                    </Link>
                    <h1
                        className="text-5xl font-medium tracking-tight mb-4"
                        style={{ fontFamily: "var(--font-serif)" }}
                    >
                        ANOVA Calculator
                    </h1>
                    <p className="text-lg text-[var(--color-ink-light)] max-w-2xl">
                        Statistical analysis made simple. Switch between One-Way and Two-Way Analysis of Variance below.
                    </p>
                </header>

                <section className="mb-10 fade-in" style={{ animationDelay: "50ms" }}>
                    <div className="flex gap-2 mb-6">
                        <Button
                            tone={mode === "one-way" ? "mint" : undefined}
                            variant={mode === "one-way" ? "primary" : "secondary"}
                            onClick={() => setMode("one-way")}
                        >
                            One-Way ANOVA
                        </Button>
                        <Button
                            tone={mode === "two-way" ? "mint" : undefined}
                            variant={mode === "two-way" ? "primary" : "secondary"}
                            onClick={() => setMode("two-way")}
                        >
                            Two-Way ANOVA
                        </Button>
                    </div>

                    <div className="transition-all duration-500 ease-in-out">
                        {mode === "one-way" ? <OneWay /> : <TwoWay />}
                    </div>
                </section>
            </div>
        </main>
    );
}
