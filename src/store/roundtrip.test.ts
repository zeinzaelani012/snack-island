// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'

function snapshot() {
  const state = useGameStore.getState()
  const { version, learnerName, avatarId, difficulty, stages, xp, badges, powerUps, boss, dash, settings, teacher, itemResults, powerUpUses } = state
  return { version, learnerName, avatarId, difficulty, stages, xp, badges, powerUps, boss, dash, settings, teacher, itemResults, powerUpUses }
}

beforeEach(() => {
  useGameStore.getState().resetAll()
})

describe('export/import round-trip', () => {
  it('restores an identical state', () => {
    const store = useGameStore.getState()
    store.setName('Sam')
    store.setAvatar('crab')
    store.setDifficulty('hard')
    store.completeStage(1, 3, 100)
    store.completeStage(2, 1, 40)
    store.awardBadge('braveVoice')
    store.recordDashRun(14, 'find')
    store.setSettings({ textScale: 1.3, dyslexia: true })
    store.setTeacherPin('2468')
    store.setStageDifficulty(3, 'legend')
    store.awardBossRubric('clarity', 2)
    store.recordItemResult(4, 's4-01', 2, true)

    const before = snapshot()
    const json = store.exportProgress()
    store.resetAll()
    expect(useGameStore.getState().xp).toBe(0)
    expect(store.importProgress(json)).toBe(true)
    expect(snapshot()).toEqual(before)
  })

  it('rejects malformed imports without touching state', () => {
    const before = snapshot()
    expect(useGameStore.getState().importProgress('not json')).toBe(false)
    expect(useGameStore.getState().importProgress('{"version":2}')).toBe(false)
    expect(snapshot()).toEqual(before)
  })
})
