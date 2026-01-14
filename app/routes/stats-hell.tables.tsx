import type { Route } from "./+types/stats-hell.tables";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stats Hell | Tables" },
    { name: "description", content: "t / z / χ² tables with lookup and highlights." },
  ];
}

export default function Tables() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-2">Tables</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Coming soon. This will include t, z, and chi-square critical value lookups.
      </p>
    </main>
  );
}
