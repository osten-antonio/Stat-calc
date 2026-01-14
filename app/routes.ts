import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("stats-stuff/regression", "routes/regression.tsx"),
] satisfies RouteConfig;
