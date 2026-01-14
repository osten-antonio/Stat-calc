import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
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
      { name: "ANOVA", path: "/anova" },
    ],
  },
  {
    name: "Data",
    color: "var(--color-accent-blue)",
    dot: "var(--color-dot-blue)",
    tools: [
      { name: "Descriptive Stats", path: "/descriptive" },
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
