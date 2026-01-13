import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b flex gap-4 justify-center">
        <a href="/" className="text-blue-600 hover:underline">Home</a>
        <a href="/chi-square" className="text-blue-600 hover:underline font-bold">Chi-Square Calculator</a>
        <a href="/regression" className="text-blue-600 hover:underline font-bold">Regression Analysis</a>
      </div>
      <Welcome />
    </>
  );
}
