import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("probability", "routes/probability.tsx"),
    route("descriptive", "routes/descriptive.tsx"),
] satisfies RouteConfig;
