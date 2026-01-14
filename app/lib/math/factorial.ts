const cache: Map<number, number> = new Map();

export function factorial(n: number): number {
  if (n < 0) throw new Error('Factorial is not defined for negative numbers');
  if (n === 0 || n === 1) return 1;

  if (cache.has(n)) {
    return cache.get(n)!;
  }

  const result = n * factorial(n - 1);
  cache.set(n, result);
  return result;
}
