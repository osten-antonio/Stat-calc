import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("stats-stuff/chi-square", "routes/chi-square.tsx"),
] satisfies RouteConfig;
