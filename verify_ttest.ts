import { oneSampleTTestWithSteps } from "./app/lib/math/t-tests";

console.log("--- T-Test Verification ---");
const data = [950, 960, 970, 980, 1020, 1030, 990, 1010, 1000, 995];
const mu0 = 1000;
const alpha = 0.05;

const result = oneSampleTTestWithSteps(data, mu0, alpha);

console.log(`Mean: ${result.value.sampleMean} (Expected 990.5)`);
console.log(`StdDev: ${result.value.sampleSD} (Expected approx 25.87)`);
console.log(`t-Stat: ${result.value.tStatistic} (Expected approx -1.16)`);
console.log(`df: ${result.value.df} (Expected 9)`);
console.log(`Critical: ${result.value.tCritical} (Expected approx 2.262)`);

console.log("\n--- Generated Steps ---");
result.steps.forEach(s => {
    console.log(`[${s.title}]`);
    console.log(s.description || s.calculation);
    console.log("---");
});
