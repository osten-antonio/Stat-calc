import type { Route } from "./+types/stats-stuff";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stats Stuff" },
    { name: "description", content: "A collection of statistical calculators." },
  ];
}

const CATEGORIES = [
  {
    name: "Probability",
    color: "var(--color-accent-pink)",
    dot: "var(--color-dot-pink)",
    tools: [
      { name: "Binomial", path: "/stats-stuff/binomial" },
      { name: "Poisson", path: "/stats-stuff/poisson" },
      { name: "Hypergeometric", path: "/stats-stuff/hypergeometric" },
    ],
  },
  {
    name: "Counting",
    color: "var(--color-accent-peach)",
    dot: "var(--color-dot-peach)",
    tools: [
      { name: "Permutations", path: "/stats-stuff/permutations" },
      { name: "Combinations", path: "/stats-stuff/combinations" },
    ],
  },
  {
    name: "Inference",
    color: "var(--color-accent-mint)",
    dot: "var(--color-dot-mint)",
    tools: [
      { name: "T-Tests", path: "/stats-stuff/t-tests" },
      { name: "Chi-Square", path: "/stats-stuff/chi-square" },
      { name: "ANOVA", path: "/stats-stuff/anova" },
    ],
  },
  {
    name: "Data",
    color: "var(--color-accent-blue)",
    dot: "var(--color-dot-blue)",
    tools: [
      { name: "Descriptive Stats", path: "/stats-stuff/descriptive" },
      { name: "Regression", path: "/stats-stuff/regression" },
    ],
  },
  {
    name: "Reference",
    color: "var(--color-accent-lavender)",
    dot: "var(--color-dot-lavender)",
    tools: [{ name: "Statistical Tables", path: "/stats-stuff/tables" }],
  },
];

export default function StatsStuffHub() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 fade-in">
          <Link
            to="/"
            className="text-sm text-[var(--color-ink-light)] hover:text-[var(--color-ink)] transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1
            className="text-4xl font-medium tracking-tight mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Stats Stuff
          </h1>
          <p className="text-[var(--color-ink-light)]">
            A collection of statistical calculators with step-by-step solutions.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
      </div>
    </main>
  );
}
