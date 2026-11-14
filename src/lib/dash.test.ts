// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { words } from '../data/words'
import { dashBonus, nextWord, shuffle } from './dash'
import { useDashClock } from './useDashClock'
import { initialProgress, useGameStore } from '../store/gameStore'
import { rank } from './scoring'

beforeEach(() => {
  useGameStore.getState().resetAll()
  vi.useFakeTimers()
})
afterEach(() => { vi.useRealTimers() })

describe('Tidepool Dash', () => {
  it('uses every word before repeating and reshuffles an exhausted pool', () => {
    let pool = shuffle(words)
    const seen: string[] = []
    for (let index = 0; index < words.length; index += 1) {
      seen.push(pool[index].id)
      expect(nextWord(pool, index).pool).toBe(pool)
    }
    expect(new Set(seen)).toEqual(new Set(words.map(({ id }) => id)))
    const next = nextWord(pool, pool.length, () => .5)
    expect(next.index).toBe(0)
    expect(next.pool).not.toBe(pool)
    expect(next.pool).toHaveLength(16)
    expect(new Set(next.pool.map(({ id }) => id))).toEqual(new Set(seen))
  })

  it('counts Find it down and Name it up, then ends once', () => {
    const onEnd = vi.fn()
    const find = renderHook(() => useDashClock('find', onEnd))
    expect(find.result.current).toEqual({ seconds: 60, progress: 1 })
    act(() => { vi.advanceTimersByTime(30000) })
    expect(find.result.current.seconds).toBe(30)
    expect(find.result.current.progress).toBe(.5)
    act(() => { vi.advanceTimersByTime(31000) })
    expect(find.result.current).toEqual({ seconds: 0, progress: 0 })
    expect(onEnd).toHaveBeenCalledTimes(1)
    const name = renderHook(() => useDashClock('name', onEnd))
    act(() => { vi.advanceTimersByTime(5000) })
    expect(name.result.current.seconds).toBe(5)
    expect(name.result.current.progress).toBeCloseTo(5 / 60)
  })

  it('keeps Find-it bonus XP outside island XP and rank', () => {
    const before = initialProgress()
    useGameStore.getState().recordDashRun(10, 'find')
    useGameStore.getState().recordDashRun(9, 'find')
    useGameStore.getState().recordDashRun(100, 'name')
    expect(useGameStore.getState().dash).toEqual({ bestFind: 10, bestName: 100, bonusXp: 50, plays: 3 })
    expect(useGameStore.getState().xp).toBe(before.xp)
    expect(rank(useGameStore.getState())).toBe(rank(before))
    expect(dashBonus(0, 0)).toBe(0)
    expect(dashBonus(10, 10)).toBe(0)
    expect(dashBonus(10, 11)).toBe(5)
  })
})
