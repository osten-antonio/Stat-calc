import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("chi-square", "routes/chi-square.tsx"),
] satisfies RouteConfig;
