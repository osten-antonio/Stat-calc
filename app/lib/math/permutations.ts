import { factorial } from './factorial';

export function permutations(n: number, r: number): number {
  if (r > n) return 0;
  return factorial(n) / factorial(n - r);
}
