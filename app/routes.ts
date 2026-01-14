import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("stats-stuff", "routes/stats-stuff.tsx"),
  route("stats-stuff/descriptive", "routes/stats-stuff.descriptive.tsx"),
  route("stats-stuff/tables", "routes/stats-stuff.tables.tsx"),
  route("stats-stuff/permutations", "routes/stats-stuff.permutations.tsx"),
  route("stats-stuff/combinations", "routes/stats-stuff.combinations.tsx"),
  route("stats-stuff/binomial", "routes/stats-stuff.binomial.tsx"),
  route("stats-stuff/poisson", "routes/stats-stuff.poisson.tsx"),
  route("stats-stuff/hypergeometric", "routes/stats-stuff.hypergeometric.tsx"),
  route("stats-stuff/t-tests", "routes/stats-stuff.t-tests.tsx"),
  route("stats-stuff/chi-square", "routes/stats-stuff.chi-square.tsx"),
  route("stats-stuff/anova", "anova/route.tsx"),
  route("stats-stuff/regression", "routes/stats-stuff.regression.tsx"),
] satisfies RouteConfig;
