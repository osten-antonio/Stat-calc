import { factorial } from './factorial';

export function combinations(n: number, r: number): number {
  if (r > n) return 0;
  if (r === 0 || r === n) return 1;
  return factorial(n) / (factorial(n - r) * factorial(r));
}
