import { stages } from '../data/stages'
import type { Difficulty, Progress } from '../types'

export const BOSS_XP = 200
export const ISLAND_MAX_XP = 1555

export function itemXP(attempt: number): number {
  if (attempt === 1) return 10
  if (attempt === 2) return 6
  if (attempt === 3) return 3
  return 0
}

export function stardFromScore(pct: number, difficulty: Difficulty): 0 | 1 | 2 | 3 {
  const three = difficulty === 'medium' ? 80 : difficulty === 'hard' ? 85 : 90
  const two = difficulty === 'medium' ? 60 : difficulty === 'hard' ? 65 : 70
  const one = difficulty === 'legend' ? 50 : 40
  if (pct >= three) return 3
  if (pct >= two) return 2
  if (pct >= one) return 1
  return 0
}

export function stageXP(stars: number): number {
  return stars > 0 ? 50 + (stars === 3 ? 25 : 0) : 0
}

export function rank(progress: Progress): 'Explorer' | 'Pathfinder' | 'Island Master' {
  const scoredStages = stages.filter((stage) => !stage.isUnscored && !stage.isBoss)
  if (scoredStages.every((stage) => (progress.stages[stage.id]?.stars ?? 0) >= 2) && progress.boss.stars >= 2) {
    return 'Island Master'
  }
  if (scoredStages.filter((stage) => (progress.stages[stage.id]?.stars ?? 0) >= 2).length >= 5) return 'Pathfinder'
  return 'Explorer'
}
