import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("stats-stuff/hypergeometric", "routes/hypergeometric.tsx"),
    route("stats-stuff/independent", "routes/independent.tsx"),
    route("stats-stuff/permutations", "routes/permutations.tsx"),
    route("stats-stuff/combinations", "routes/combinations.tsx"),
    route("stats-stuff/descriptive", "routes/descriptive.tsx"),
    route("stats-stuff/regression", "routes/regression.tsx"),
] satisfies RouteConfig;
