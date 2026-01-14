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
    route("anova/one-way", "routes/anova-oneway.tsx"),
    route("anova/two-way", "routes/anova-twoway.tsx"),
    route("regression", "routes/stats-stuff.regression.tsx"),
    route("independent", "routes/independent.tsx"),
    route("descriptive/basic", "routes/descriptive-basic.tsx"),
    route("descriptive/means", "routes/descriptive-means.tsx"),
    route("box-plot", "routes/box-plot.tsx"),
] satisfies RouteConfig;
