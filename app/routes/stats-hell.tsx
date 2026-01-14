import type { Route } from "./+types/stats-hell";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stats Hell" },
    { name: "description", content: "A retro exam-style statistics calculator." },
  ];
}

const calculators = [
  { to: "/stats-hell/descriptive", label: "Descriptive Stats" },
  { to: "/stats-hell/tables", label: "Tables (t / z / χ²)" },
];

export default function StatsHellHome() {
  return (
    <main className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">STATS HELL</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Retro calculators with copyable step-by-step workings.
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Warning: contain(s) fake pop-up ads and mild sarcasm.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Calculators</h2>
        <ul className="list-disc pl-5">
          {calculators.map((c) => (
            <li key={c.to}>
              <Link className="text-blue-700 dark:text-blue-400 underline" to={c.to}>
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-10 text-xs text-gray-500">
        <Link className="underline" to="/">
          Back to boring home
        </Link>
      </footer>
    </main>
  );
}
