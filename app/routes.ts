import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("descriptive", "routes/descriptive.tsx"),
  route("tables", "routes/tables.tsx"),
  route("permutations", "routes/permutations.tsx"),
  route("combinations", "routes/combinations.tsx"),
  route("binomial", "routes/binomial.tsx"),
  route("poisson", "routes/poisson.tsx"),
  route("hypergeometric", "routes/hypergeometric.tsx"),
  route("t-tests", "routes/t-tests.tsx"),
  route("chi-square", "routes/chi-square.tsx"),
  route("anova", "anova/route.tsx"),
  route("regression", "routes/regression.tsx"),
  route("box-plot", "routes/box-plot.tsx"),
  route("special-means", "routes/special-means.tsx"),
] satisfies RouteConfig;
