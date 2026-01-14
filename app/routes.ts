import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("descriptive", "routes/stats-stuff.descriptive.tsx"),
  route("tables", "routes/stats-stuff.tables.tsx"),
  route("permutations", "routes/stats-stuff.permutations.tsx"),
  route("combinations", "routes/stats-stuff.combinations.tsx"),
  route("binomial", "routes/stats-stuff.binomial.tsx"),
  route("poisson", "routes/stats-stuff.poisson.tsx"),
  route("hypergeometric", "routes/stats-stuff.hypergeometric.tsx"),
  route("t-tests", "routes/stats-stuff.t-tests.tsx"),
  route("chi-square", "routes/stats-stuff.chi-square.tsx"),
  route("anova", "anova/route.tsx"),
  route("regression", "routes/stats-stuff.regression.tsx"),
] satisfies RouteConfig;
