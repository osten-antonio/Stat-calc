import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Stats Stuff" },
    {
      name: "description",
      content: "A collection of statistical calculators.",
    },
  ];
}

const CATEGORIES = [
  {
    name: "Probability",
    color: "var(--color-accent-pink)",
    dot: "var(--color-dot-pink)",
    tools: [
      { name: "Binomial", path: "/binomial" },
      { name: "Poisson", path: "/poisson" },
      { name: "Hypergeometric", path: "/hypergeometric" },
      { name: "Independent Events", path: "/independent" },
    ],
  },
  {
    name: "Counting",
    color: "var(--color-accent-peach)",
    dot: "var(--color-dot-peach)",
    tools: [
      { name: "Permutations", path: "/permutations" },
      { name: "Combinations", path: "/combinations" },
    ],
  },
  {
    name: "Inference",
    color: "var(--color-accent-mint)",
    dot: "var(--color-dot-mint)",
    tools: [
      { name: "T-Tests", path: "/t-tests" },
      { name: "Chi-Square", path: "/chi-square" },
      { name: "One-Way ANOVA", path: "/anova/one-way" },
      { name: "Two-Way ANOVA", path: "/anova/two-way" },
    ],
  },
  {
    name: "Data",
    color: "var(--color-accent-blue)",
    dot: "var(--color-dot-blue)",
    tools: [
      { name: "Descriptive Stats", path: "/descriptive/basic" },
      { name: "Special Means", path: "/descriptive/means" },
      { name: "Regression", path: "/regression" },
    ],
  },
  {
    name: "Reference",
    color: "var(--color-accent-lavender)",
    dot: "var(--color-dot-lavender)",
    tools: [{ name: "Statistical Tables", path: "/tables" }],
  },
];

import { BackgroundGraph } from "../components/background-graph";

export default function Home() {
  return (
    <div className="min-h-screen w-full px-6 py-16 sm:py-20 relative overflow-hidden">
      <BackgroundGraph />

      <div className="max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-10rem)] relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
          {CATEGORIES.map((cat, catIdx) => (
            <div
              key={cat.name}
              className="rounded-lg p-5 fade-in"
              style={{
                backgroundColor: cat.color,
                animationDelay: `${(catIdx + 1) * 50}ms`,
              }}
            >
              <h2
                className="text-sm font-medium uppercase tracking-wider mb-4 pb-2 border-b"
                style={{
                  color: "var(--color-ink-light)",
                  borderColor: cat.dot,
                }}
              >
                {cat.name}
              </h2>

              <ul className="space-y-1">
                {cat.tools.map((tool) => (
                  <li key={tool.path}>
                    <Link
                      to={tool.path}
                      className="group flex items-center justify-between py-2 transition-all duration-200"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="transition-transform duration-200 group-hover:translate-x-1"
                          style={{ color: cat.dot }}
                        >
                          &rarr;
                        </span>
                        <span className="text-base">{tool.name}</span>
                      </span>
                      <span
                        className="text-sm italic opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ color: cat.dot }}
                      >
                        Go
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h1
          className="text-4xl sm:text-5xl font-medium tracking-tight mt-16 fade-in text-center"
          style={{ fontFamily: "var(--font-serif)", animationDelay: "300ms" }}
        >
          Stats Stuff
        </h1>
      </div>
    </div>
  );
}
