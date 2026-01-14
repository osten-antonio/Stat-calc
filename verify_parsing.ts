function parseData(cellContent: string): number[] {
    const values: number[] = [];
    const parts = cellContent.split(/[\s,]+/).filter(Boolean);
    for (const part of parts) {
        const num = Number(part);
        if (Number.isFinite(num)) values.push(num);
    }
    return values;
}

console.log("--- Parsing Check ---");
const inputv1 = "950, 960, 970, 980";
const res1 = parseData(inputv1);
console.log(`Input: "${inputv1}"`);
console.log(`Parsed:`, res1);
if (res1.length === 4 && res1[0] === 950) console.log("✅ Passed simple comma");

const inputv2 = "1020 1030  990";
const res2 = parseData(inputv2);
console.log(`Input: "${inputv2}"`);
console.log(`Parsed:`, res2);
if (res2.length === 3 && res2[1] === 1030) console.log("✅ Passed space separation");

const inputv3 = "1010,1000, 995";
const res3 = parseData(inputv3);
console.log(`Input: "${inputv3}"`);
console.log(`Parsed:`, res3);
if (res3.length === 3 && res3[2] === 995) console.log("✅ Passed mixed/tight comma");
