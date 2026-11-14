// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { canUse, spend } from '../lib/powerups'
import { initialProgress, useGameStore } from './gameStore'

beforeEach(() => {
  useGameStore.getState().resetAll()
})

describe('persistent progress', () => {
  it('awards an item once and ignores results for another stage', () => {
    const store = useGameStore.getState()
    store.recordItemResult(1, 's1-01', 1, true)
    store.recordItemResult(1, 's1-01', 1, true)
    store.recordItemResult(2, 's1-01', 1, true)
    store.recordItemResult(1, 's1-02', 2, true)
    expect(useGameStore.getState().xp).toBe(0)
    store.recordItemResult(1, 's1-02', 1, true)
    expect(useGameStore.getState().xp).toBe(0)
    store.completeStage(1, 1, 50)
    expect(useGameStore.getState().xp).toBe(70)
    store.recordItemResult(1, 's1-03', 1, true)
    store.completeStage(1, 3, 100)
    expect(useGameStore.getState().xp).toBe(70)
  })

  it('awards personal answers five XP on the first clear only', () => {
    const store = useGameStore.getState()
    store.recordItemResult(8, 's8-05', 1, true)
    store.completeStage(8, 1, 20)
    expect(useGameStore.getState().xp).toBe(55)
    store.completeStage(8, 3, 100)
    expect(useGameStore.getState().xp).toBe(55)
  })

  it('awards stage and boss XP on first clear only', () => {
    const store = useGameStore.getState()
    store.completeStage(1, 3, 100)
    store.completeStage(1, 2, 80)
    expect(useGameStore.getState().xp).toBe(75)
    expect(useGameStore.getState().stages[1]).toEqual({ stars: 3, bestScore: 100, attempts: 2, cleared: true })
    store.awardBossRubric('introduction', 2)
    store.awardBossRubric('food likes', 3)
    expect(useGameStore.getState().boss.stars).toBe(2)
    expect(useGameStore.getState().xp).toBe(275)
    store.awardBossRubric('food likes', 2)
    expect(useGameStore.getState().xp).toBe(275)
  })

  it('does not duplicate badges and exports importable progress', () => {
    const store = useGameStore.getState()
    store.setName('Sam')
    store.awardBadge('first-steps')
    store.awardBadge('first-steps')
    expect(useGameStore.getState().badges).toHaveLength(1)
    const exported = store.exportProgress()
    store.resetAll()
    expect(useGameStore.getState().learnerName).toBe('')
    expect(store.importProgress(exported)).toBe(true)
    expect(useGameStore.getState().learnerName).toBe('Sam')
    expect(store.importProgress('{"version":1,"progress":{}}')).toBe(false)
    const persisted = JSON.parse(localStorage.getItem('snack-island-v1') ?? '{}')
    expect(persisted.version).toBe(1)
    expect(persisted.state.learnerName).toBe('Sam')
    expect(persisted.state.version).toBe(1)
  })
})

describe('power-ups', () => {
  it('caps each kind at two uses per stage and spends inventory', () => {
    const inventory = initialProgress().powerUps
    expect(canUse('echo', {}, inventory)).toBe(true)
    const once = spend(inventory, 'echo')
    expect(once.echo).toBe(1)
    expect(canUse('echo', { echo: 1 }, once)).toBe(true)
    expect(canUse('echo', { echo: 2 }, once)).toBe(false)
    expect(canUse('coconut', {}, { ...inventory, coconut: 0 })).toBe(false)
    const store = useGameStore.getState()
    const useEcho = () => store.spendPowerUp({ kind: 'echo', stageId: 1 })
    expect(useEcho()).toBe(true)
    expect(useEcho()).toBe(true)
    expect(useEcho()).toBe(false)
    expect(useGameStore.getState().powerUpUses[1].echo).toBe(2)
    expect(useGameStore.getState().powerUps.echo).toBe(0)
    store.resetPowerUp({ echo: 2, coconut: 2, tide: 2 })
    expect(useEcho()).toBe(false)
    store.resetPowerUp({ kind: 'echo', stageId: 1 })
    expect(useEcho()).toBe(true)
    expect(useEcho()).toBe(true)
    expect(useEcho()).toBe(false)
    expect(useGameStore.getState().powerUps.echo).toBe(0)
  })
})
