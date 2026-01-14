import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("stats-hell", "routes/stats-hell.tsx"),
  route("stats-hell/descriptive", "routes/stats-hell.descriptive.tsx"),
  route("stats-hell/tables", "routes/stats-hell.tables.tsx"),
  route("stats-hell/permutations", "routes/stats-hell.permutations.tsx"),
  route("stats-hell/combinations", "routes/stats-hell.combinations.tsx"),
  route("stats-hell/binomial", "routes/stats-hell.binomial.tsx"),
  route("stats-hell/poisson", "routes/stats-hell.poisson.tsx"),
  route("stats-hell/hypergeometric", "routes/stats-hell.hypergeometric.tsx"),
  route("stats-hell/t-tests", "routes/stats-hell.t-tests.tsx"),
] satisfies RouteConfig;
