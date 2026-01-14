declare module "jstat" {
  import jStat from "jstat/dist/jstat";
  export default jStat;
}

declare module "jstat/dist/jstat.js" {
  const jStat: any;
  export default jStat;
}
