import { describe, expect, it } from 'vitest'
import { items, itemsByStage, stageItems } from '../data/items'
import { sortableWords, words } from '../data/words'
import { initialProgress } from '../store/gameStore'
import { isStagePlayable, isStageUnlocked } from './unlocks'
import { itemXP, rank, stardFromScore, stageXP } from './scoring'

describe('scoring', () => {
  it('awards XP by attempt only', () => {
    expect([1, 2, 3, 4, 8].map(itemXP)).toEqual([10, 6, 3, 0, 0])
  })

  it('uses exact difficulty thresholds', () => {
    expect([79.9, 80, 59.9, 60, 39.9, 40].map((pct) => stardFromScore(pct, 'medium'))).toEqual([2, 3, 1, 2, 0, 1])
    expect([84.9, 85, 64.9, 65, 39.9, 40].map((pct) => stardFromScore(pct, 'hard'))).toEqual([2, 3, 1, 2, 0, 1])
    expect([89.9, 90, 69.9, 70, 49.9, 50].map((pct) => stardFromScore(pct, 'legend'))).toEqual([2, 3, 1, 2, 0, 1])
  })

  it('awards stage XP for a clear', () => {
    expect([0, 1, 2, 3].map(stageXP)).toEqual([0, 50, 50, 75])
  })

  it('gates ranks on all scored stages and the boss, not XP', () => {
    const progress = initialProgress()
    progress.xp = 999999
    expect(rank(progress)).toBe('Explorer')
    for (let id = 1; id <= 5; id++) progress.stages[id].stars = 2
    expect(rank(progress)).toBe('Pathfinder')
    for (let id = 6; id <= 8; id++) progress.stages[id].stars = 2
    expect(rank(progress)).toBe('Pathfinder')
    progress.boss.stars = 2
    expect(rank(progress)).toBe('Island Master')
  })
})

describe('unlock chain', () => {
  it('opens the early side quest from stage 2', () => {
    const progress = initialProgress()
    expect(isStageUnlocked(6, progress)).toBe(false)
    progress.stages[2].stars = 1
    expect(isStageUnlocked(6, progress)).toBe(true)
    expect(isStageUnlocked(3, progress)).toBe(true)
    expect(isStageUnlocked(9, progress)).toBe(false)
  })

  it('honours teacher unlock without changing stars', () => {
    const progress = initialProgress()
    expect(isStagePlayable(9, progress)).toBe(false)
    progress.teacher.unlockAll = true
    expect(isStagePlayable(9, progress)).toBe(true)
  })
})

describe('supplied data', () => {
  it('keeps correct answers by value and preserves item flags', () => {
    for (const item of items) expect(item.options).toContain(item.correct)
    expect(items.find((item) => item.id === 's8-01')?.multiSelect).toBe(true)
    expect(items.find((item) => item.id === 's8-05')?.alwaysCorrect).toBe(true)
    expect(stageItems[6]).toEqual(itemsByStage(6))
    expect(itemsByStage(9)).toHaveLength(2)
  })

  it('has sortable words with English reason clauses', () => {
    expect(words).toHaveLength(16)
    expect(sortableWords.every((word) => word.sortable && word.reason.length > 0)).toBe(true)
  })
})
