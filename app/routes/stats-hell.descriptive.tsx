import type { Route } from "./+types/stats-hell.descriptive";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stats Hell | Descriptive" },
    { name: "description", content: "Descriptive statistics with step-by-step workings." },
  ];
}

export default function DescriptiveCalculator() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-2">Descriptive Stats</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Coming soon. Next: data table input + exam-format copy output.
      </p>
    </main>
  );
}
