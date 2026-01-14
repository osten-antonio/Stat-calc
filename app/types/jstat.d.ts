declare module "jstat" {
  export interface ContinuousDist {
    cdf(x: number, ...rest: number[]): number;
    pdf(x: number, ...rest: number[]): number;
    inv(p: number, ...rest: number[]): number;
  }

  export interface DiscreteDist {
    cdf(k: number, ...rest: number[]): number;
    pdf(k: number, ...rest: number[]): number;
  }

  export interface JStat {
    normal: ContinuousDist;
    studentt: ContinuousDist;
    chisquare: ContinuousDist;
    binomial: DiscreteDist;
    poisson: DiscreteDist;
    hypgeom: DiscreteDist;
    gammaln(x: number): number;
    factorial(x: number): number;
  }

  export const jStat: JStat;
  export default jStat;
}
