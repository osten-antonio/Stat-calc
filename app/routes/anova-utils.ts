export type OneWayResult = {
    ssBetween: number;
    dfBetween: number;
    msBetween: number;
    ssWithin: number;
    dfWithin: number;
    msWithin: number;
    fStat: number;
    totalSS: number;
    totalDf: number;
    // Detailed working stats
    correctionFactor: number;
    grandSum: number;
    grandN: number;
    sumOfSquaresRaw: number; // Sum of (X^2) for all stats
    groupStats: {
        sum: number;
        mean: number;
        n: number;
        sumSq: number; // Sum of (X^2) for this group
    }[];
};

export type TwoWayResult = {
    ssRow: number;
    dfRow: number;
    msRow: number;
    fRow: number;
    ssCol: number;
    dfCol: number;
    msCol: number;
    fCol: number;
    ssInter: number;
    dfInter: number;
    msInter: number;
    fInter: number;
    ssError: number;
    dfError: number;
    msError: number;
    ssTotal: number;
    dfTotal: number;
    // Detailed working stats
    correctionFactor: number;
    grandSum: number;
    grandN: number;
    sumOfSquaresRaw: number;
    rowSums: number[];
    colSums: number[];
    cellSums: number[][]; // [row][col]
    ssCellsRaw: number;
    ssRowRaw: number;
    ssColRaw: number;
    // Deviation Method Stats
    grandMean: number;
    rowMeans: number[];
    colMeans: number[];
    cellMeans: number[][];
    // P-values
    pRow: number;
    pCol: number;
    pInter: number;
    ssPerCell: number[][];
};

// --- Statistical Utils ---

// Beta function approximation for F-distribution CDF
function logGamma(z: number): number {
    const c = [
        76.18009172947146,
        -86.50532032941677,
        24.01409824083091,
        -1.231739572450155,
        0.1208650973866179e-2,
        -0.5395239384953e-5
    ];
    let x = z;
    let y = z;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function betai(a: number, b: number, x: number): number {
    let bt;
    if (x === 0.0 || x === 1.0) bt = 0.0;
    else bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1.0 - x));

    if (x < (a + 1.0) / (a + b + 2.0)) return bt * betacf(a, b, x) / a;
    else return 1.0 - bt * betacf(b, a, 1.0 - x) / b;
}

function betacf(a: number, b: number, x: number): number {
    const MAXIT = 100;
    const EPS = 3.0e-7;
    const FPMIN = 1.0e-30;

    let qab = a + b;
    let qap = a + 1.0;
    let qam = a - 1.0;
    let c = 1.0;
    let d = 1.0 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1.0 / d;
    let h = d;

    for (let m = 1; m <= MAXIT; m++) {
        let m2 = 2 * m;
        let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
        d = 1.0 + aa * d;
        if (Math.abs(d) < FPMIN) d = FPMIN;
        c = 1.0 + aa / c;
        if (Math.abs(c) < FPMIN) c = FPMIN;
        d = 1.0 / d;
        h *= d * c;
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
        d = 1.0 + aa * d;
        if (Math.abs(d) < FPMIN) d = FPMIN;
        c = 1.0 + aa / c;
        if (Math.abs(c) < FPMIN) c = FPMIN;
        d = 1.0 / d;
        h *= d * c;
    }
    return h;
}

export const calculateFPValue = (f: number, df1: number, df2: number): number => {
    if (f <= 0) return 1.0;
    const x = df2 / (df2 + df1 * f);
    return betai(0.5 * df2, 0.5 * df1, x);
}


// --- One-Way ANOVA Utils ---

export const calculateOneWayAnova = (groups: number[][]): OneWayResult | null => {
    const k = groups.length; // Number of groups
    if (k < 2) return null;

    const flattened = groups.flat();
    const N = flattened.length; // Total number of observations
    if (N === 0) return null;

    const grandSum = flattened.reduce((a, b) => a + b, 0);
    const grandMean = grandSum / N;

    // Detailed Stats Collection
    let sumOfSquaresRaw = 0;
    const groupStats = groups.map(group => {
        const sum = group.reduce((a, b) => a + b, 0);
        const n = group.length;
        let sumSq = 0;
        group.forEach(val => {
            sumSq += val * val;
            sumOfSquaresRaw += val * val;
        });
        return {
            sum,
            mean: n > 0 ? sum / n : 0,
            n,
            sumSq
        };
    });

    const correctionFactor = (grandSum * grandSum) / N;

    // SS Total = Sum(X^2) - CF
    const totalSS = sumOfSquaresRaw - correctionFactor;

    // SS Between (Treatment) = Sum(GroupSum^2 / n) - CF
    let sumGroupSumSqDivN = 0;
    groupStats.forEach(g => {
        if (g.n > 0) {
            sumGroupSumSqDivN += (g.sum * g.sum) / g.n;
        }
    });
    const ssBetween = sumGroupSumSqDivN - correctionFactor;

    // SS Within (Error) = TotalSS - SSBetween
    const ssWithin = totalSS - ssBetween;

    const dfBetween = k - 1;
    const dfWithin = N - k;
    const totalDf = N - 1;

    const msBetween = ssBetween / dfBetween;
    const msWithin = dfWithin > 0 ? ssWithin / dfWithin : 0;

    const fStat = msWithin > 0 ? msBetween / msWithin : 0;

    return {
        ssBetween,
        dfBetween,
        msBetween,
        ssWithin,
        dfWithin,
        msWithin,
        fStat,
        totalSS,
        totalDf,
        correctionFactor,
        grandSum,
        grandN: N,
        sumOfSquaresRaw,
        groupStats
    };
};

// --- Two-Way ANOVA Utils (with Replication) ---

export const calculateTwoWayAnova = (data: number[][][]): TwoWayResult | null => {
    const R = data.length; // Number of rows (Factor A levels)
    if (R < 2) return null;
    const C = data[0].length; // Number of columns (Factor B levels)
    if (C < 2) return null;

    // Check data consistency - assuming balanced design for simplicity
    const n = data[0][0].length; // Replicates per cell
    if (n < 2) return null; // Need replicates for interaction

    let grandSum = 0;
    let N = 0;
    const rowSums = new Array(R).fill(0);
    const colSums = new Array(C).fill(0);
    const cellSums = Array.from({ length: R }, () => new Array(C).fill(0));
    let sumOfSquaresRaw = 0;

    for (let i = 0; i < R; i++) {
        for (let j = 0; j < C; j++) {
            if (data[i][j].length !== n) return null; // Unbalanced
            for (let k = 0; k < n; k++) {
                const val = data[i][j][k];
                grandSum += val;
                rowSums[i] += val;
                colSums[j] += val;
                cellSums[i][j] += val;
                sumOfSquaresRaw += val * val;
                N++;
            }
        }
    }

    const grandMean = grandSum / N;
    const correctionFactor = (grandSum * grandSum) / N; // Kept for legacy/compat if needed, but primary path will use deviation

    // Calculate Means
    const rowMeans = rowSums.map(s => s / (C * n));
    const colMeans = colSums.map(s => s / (R * n));
    const cellMeans = cellSums.map((row, i) => row.map(s => s / n));

    // --- Deviation Method Calculations ---

    // SS Total = Sum((X - GrandMean)^2)
    let ssTotal = 0;
    for (let i = 0; i < R; i++) {
        for (let j = 0; j < C; j++) {
            for (let k = 0; k < n; k++) {
                ssTotal += Math.pow(data[i][j][k] - grandMean, 2);
            }
        }
    }

    // SS Row (Factor A) = Sum(n_row * (RowMean - GrandMean)^2)
    // n_row = C * n
    let ssRow = 0;
    for (let i = 0; i < R; i++) {
        ssRow += (C * n) * Math.pow(rowMeans[i] - grandMean, 2);
    }

    // SS Col (Factor B) = Sum(n_col * (ColMean - GrandMean)^2)
    // n_col = R * n
    let ssCol = 0;
    for (let j = 0; j < C; j++) {
        ssCol += (R * n) * Math.pow(colMeans[j] - grandMean, 2);
    }

    // SS Within (Error) = Sum((X - CellMean)^2)
    let ssError = 0;
    const ssPerCell: number[][] = [];
    for (let i = 0; i < R; i++) {
        const rowSS: number[] = [];
        for (let j = 0; j < C; j++) {
            const currentCellMean = cellMeans[i][j];
            let currentCellSS = 0;
            for (let k = 0; k < n; k++) {
                const diff = data[i][j][k] - currentCellMean;
                currentCellSS += diff * diff;
            }
            ssError += currentCellSS;
            rowSS.push(currentCellSS);
        }
        ssPerCell.push(rowSS);
    }

    // SS Interaction = SS Total - SS Row - SS Col - SS Error
    const ssInter = ssTotal - ssRow - ssCol - ssError;

    // Legacy raw SS for debug/display if needed (optional)
    let ssRowRaw = 0;
    let ssColRaw = 0;
    let ssCellsRaw = 0;

    // Degrees of Freedom
    const dfRow = R - 1;
    const dfCol = C - 1;
    const dfInter = (R - 1) * (C - 1);
    const dfError = R * C * (n - 1);
    const dfTotal = N - 1;

    // Mean Squares
    const msRow = ssRow / dfRow;
    const msCol = ssCol / dfCol;
    const msInter = ssInter / dfInter;
    const msError = dfError > 0 ? ssError / dfError : 0;

    // F-statistics
    const fRow = msError > 1e-9 ? msRow / msError : 0;
    const fCol = msError > 1e-9 ? msCol / msError : 0;
    const fInter = msError > 1e-9 ? msInter / msError : 0;

    // Calculate P-values
    const pRow = calculateFPValue(fRow, dfRow, dfError);
    const pCol = calculateFPValue(fCol, dfCol, dfError);
    const pInter = calculateFPValue(fInter, dfInter, dfError);

    return {
        ssRow, dfRow, msRow, fRow,
        ssCol, dfCol, msCol, fCol,
        ssInter, dfInter, msInter, fInter,
        ssError, dfError, msError,
        ssTotal, dfTotal,
        correctionFactor,
        grandSum,
        grandN: N,
        sumOfSquaresRaw,
        rowSums,
        colSums,
        cellSums,
        ssCellsRaw,
        ssRowRaw,
        ssColRaw,
        grandMean,
        rowMeans,
        colMeans,
        cellMeans,
        ssPerCell,
        pRow,
        pCol,
        pInter
    };
};
