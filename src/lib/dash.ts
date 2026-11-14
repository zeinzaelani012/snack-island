import type { Word } from '../data/words'

export function shuffle<T>(values: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...values]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]]
  }
  return shuffled
}

export function nextWord(pool: Word[], index: number, random?: () => number): { pool: Word[]; index: number } {
  return index >= pool.length ? { pool: shuffle(pool, random), index: 0 } : { pool, index }
}

export function dashBonus(previousBest: number, score: number): number {
  return Number.isFinite(score) && score >= 0 && score > previousBest
    ? Math.floor(score - previousBest) * 5 : 0
}
