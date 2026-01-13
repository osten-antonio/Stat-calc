import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("anova", "anova/route.tsx"),
] satisfies RouteConfig;
