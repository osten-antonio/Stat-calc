import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("stats-hell", "routes/stats-hell.tsx"),
  route("stats-hell/descriptive", "routes/stats-hell.descriptive.tsx"),
  route("stats-hell/tables", "routes/stats-hell.tables.tsx"),
] satisfies RouteConfig;
