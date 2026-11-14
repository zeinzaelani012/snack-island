import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { items } from '../data/items'
import { stages } from '../data/stages'
import { withNewBadges, type BadgeContext } from '../data/badges'
import { canUse, spend, type PowerUpKind, type StagePowerUpUses } from '../lib/powerups'
import { dashBonus } from '../lib/dash'
import type { PowerUpInventory } from '../lib/powerups'
import { BOSS_XP, itemXP, stageXP } from '../lib/scoring'
import type { Difficulty, Progress, StageProgress } from '../types'

export type PowerUpUse = { kind: PowerUpKind; stageId: number }
export type PowerUpReset = PowerUpKind | PowerUpInventory | number | PowerUpUse
export type SettingsPatch = Partial<Progress['settings']>
export type TeacherFlags = Partial<Omit<Progress['teacher'], 'pin' | 'perStageDifficulty'>>

interface ItemResult {
  attempt: number
  correct: boolean
  earned: boolean
  xpOverride?: number
}

export interface GameState extends Progress {
  itemResults: Record<number, Record<string, ItemResult>>
  powerUpUses: Record<number, StagePowerUpUses>
  setDifficulty: (difficulty: Difficulty) => void
  setName: (name: string) => void
  setAvatar: (avatarId: string) => void
  recordItemResult: (stageId: number, itemId: string, attempt: number, correct: boolean) => void
  completeStage: (stageId: number, stars: 0 | 1 | 2 | 3, score: number, options?: BadgeContext) => void
  awardBadge: (id: string) => void
  spendPowerUp: (kind: PowerUpUse) => boolean
  resetPowerUp: (kind: PowerUpReset) => void
  setSettings: (settings: SettingsPatch) => void
  setTeacherPin: (pin: string | null) => void
  setTeacherFlags: (flags: TeacherFlags) => void
  setStageDifficulty: (stageId: number, difficulty: Difficulty | null) => void
  awardBossRubric: (row: string, stars: 0 | 1 | 2 | 3) => void
  setBossNotes: (notes: Record<string, string>) => void
  setBossKeywords: (keywords: string[]) => void
  markBossRecorded: (recorded?: boolean) => void
  recordDashRun: (score: number, mode: 'find' | 'name') => void
  resetStage: (stageId: number) => void
  resetAll: () => void
  exportProgress: () => string
  importProgress: (json: string) => boolean
}

const emptyStage = (): StageProgress => ({ stars: 0, bestScore: 0, attempts: 0, cleared: false })
const stageRecord = () => Object.fromEntries(stages.map(({ id }) => [id, emptyStage()]))

export const initialProgress = (): Progress => ({
  version: 1,
  learnerName: '',
  avatarId: 'pippa',
  difficulty: 'medium',
  stages: stageRecord(),
  xp: 0,
  badges: [],
  powerUps: { echo: 2, coconut: 2, tide: 2 },
  boss: { notes: {}, keywords: [], recorded: false, stars: 0, rubric: {} },
  dash: { bestFind: 0, bestName: 0, bonusXp: 0, plays: 0 },
  settings: { sound: true, reduceMotion: false, dyslexia: false, textScale: 1 },
  teacher: { pin: null, unlockAll: false, perStageDifficulty: {} },
})

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialProgress(),
      itemResults: {},
      powerUpUses: {},
      setDifficulty: (difficulty) => set({ difficulty }),
      setName: (learnerName) => set({ learnerName }),
      setAvatar: (avatarId) => set({ avatarId }),
      recordItemResult: (stageId, itemId, attempt, correct) => {
        if (!items.some((item) => item.stageId === stageId && item.id === itemId)
          || !Number.isInteger(attempt) || attempt < 1) return
        set((state) => {
          const previous = state.itemResults[stageId]?.[itemId]
          if (previous && (!correct || (previous.correct && previous.attempt <= attempt))) return state
          return {
            itemResults: {
              ...state.itemResults,
              [stageId]: {
                ...state.itemResults[stageId],
                [itemId]: { attempt, correct, earned: false, ...(items.find((item) => item.id === itemId)?.alwaysCorrect ? { xpOverride: 5 } : {}) },
              },
            },
          }
        })
      },
      completeStage: (stageId, stars, score, options) => {
        const definition = stages.find(({ id }) => id === stageId)
        if (!definition || definition.isUnscored || definition.isBoss) return
        set((state) => {
          const previous = state.stages[stageId] ?? emptyStage()
          const firstClear = stars > 0 && !previous.cleared
          const earnedItems = Object.fromEntries(Object.entries(state.itemResults[stageId] ?? {})
            .map(([itemId, result]) => [itemId, { ...result, earned: firstClear && result.correct }]))
          const earnedItemXP = firstClear ? Object.values(earnedItems)
            .reduce((sum, result) => sum + (result.earned ? result.xpOverride ?? itemXP(result.attempt) : 0), 0) : 0
          const nextXp = state.xp + (firstClear ? stageXP(stars) + earnedItemXP : 0)
          const nextStages = {
            ...state.stages,
            [stageId]: {
              stars: Math.max(previous.stars, stars) as StageProgress['stars'],
              bestScore: Math.max(previous.bestScore, score),
              attempts: previous.attempts + 1,
              cleared: previous.cleared || stars > 0,
            },
          }
          const progress = withNewBadges({ ...state, xp: nextXp, stages: nextStages }, options)
          return { xp: progress.xp, stages: progress.stages, badges: progress.badges, itemResults: { ...state.itemResults, [stageId]: earnedItems } }
        })
      },
      awardBadge: (id) => set((state) => state.badges.some((badge) => badge.id === id) ? state : {
        badges: [...state.badges, { id, earnedAt: new Date().toISOString() }],
      }),
      spendPowerUp: ({ kind, stageId }) => {
        const state = get()
        const uses = state.powerUpUses[stageId] ?? {}
        if (!canUse(kind, uses, state.powerUps)) return false
        set((current) => ({
          powerUps: spend(current.powerUps, kind),
          powerUpUses: {
            ...current.powerUpUses,
            [stageId]: { ...uses, [kind]: (uses[kind] ?? 0) + 1 },
          },
        }))
        return true
      },
      resetPowerUp: (kind) => set((state) => ({
        ...(typeof kind === 'object' && !('kind' in kind) ? { powerUps: kind } : {}),
        powerUpUses: typeof kind === 'object' && 'kind' in kind
          ? { ...state.powerUpUses, [kind.stageId]: { ...state.powerUpUses[kind.stageId], [kind.kind]: 0 } }
          : typeof kind === 'number' ? { ...state.powerUpUses, [kind]: {} }
            : typeof kind === 'string' ? Object.fromEntries(Object.entries(state.powerUpUses)
              .map(([id, uses]) => [id, { ...uses, [kind]: 0 }])) : state.powerUpUses,
      })),
      setSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
      setTeacherPin: (pin) => set((state) => ({ teacher: { ...state.teacher, pin } })),
      setTeacherFlags: (flags) => set((state) => ({ teacher: { ...state.teacher, ...flags } })),
      setStageDifficulty: (stageId, difficulty) => set((state) => {
        const perStageDifficulty = { ...state.teacher.perStageDifficulty }
        if (difficulty === null) delete perStageDifficulty[stageId]
        else perStageDifficulty[stageId] = difficulty
        return { teacher: { ...state.teacher, perStageDifficulty } }
      }),
      awardBossRubric: (row, stars) => set((state) => {
        const previous = state.boss
        const rubric = { ...previous.rubric, [row]: stars }
        const bossStars = Object.values(rubric).length > 0
          ? Math.min(...Object.values(rubric)) as StageProgress['stars'] : 0
        const nextBoss = { ...previous, rubric, stars: Math.max(previous.stars, bossStars) as StageProgress['stars'] }
        const nextXp = state.xp + (previous.stars === 0 && bossStars > 0 ? BOSS_XP : 0)
        const progress = withNewBadges({ ...state, boss: nextBoss, xp: nextXp })
        return { boss: nextBoss, xp: nextXp, badges: progress.badges }
      }),
      setBossNotes: (notes) => set((state) => ({ boss: { ...state.boss, notes } })),
      setBossKeywords: (keywords) => set((state) => ({ boss: { ...state.boss, keywords } })),
      markBossRecorded: (recorded = true) => set((state) => ({ boss: { ...state.boss, recorded } })),
      recordDashRun: (score, mode) => set((state) => {
        const safeScore = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0
        const nextDash = {
          ...state.dash,
          bestFind: mode === 'find' ? Math.max(state.dash.bestFind, safeScore) : state.dash.bestFind,
          bestName: mode === 'name' ? Math.max(state.dash.bestName, safeScore) : state.dash.bestName,
          bonusXp: state.dash.bonusXp + (mode === 'find' ? dashBonus(state.dash.bestFind, safeScore) : 0),
          plays: state.dash.plays + 1,
        }
        const progress = withNewBadges({ ...state, dash: nextDash })
        return { dash: nextDash, badges: progress.badges }
      }),
      resetStage: (stageId) => set((state) => ({
        stages: { ...state.stages, [stageId]: emptyStage() },
        itemResults: { ...state.itemResults, [stageId]: {} },
        powerUpUses: { ...state.powerUpUses, [stageId]: {} },
        ...(stageId === 9 ? { boss: initialProgress().boss } : {}),
      })),
      resetAll: () => set({ ...initialProgress(), itemResults: {}, powerUpUses: {} }),
      exportProgress: () => JSON.stringify({ version: 1, progress: get() }),
      importProgress: (json) => {
        try {
          const parsed: unknown = JSON.parse(json)
          if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.progress)
            || !isValidProgress(parsed.progress)) return false
          set({ ...parsed.progress, version: 1 })
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'snack-island-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidProgress(value: Record<string, unknown>): boolean {
  const powerUps = value.powerUps
  const dash = value.dash
  return value.version === 1
    && typeof value.learnerName === 'string'
    && typeof value.avatarId === 'string'
    && ['medium', 'hard', 'legend'].includes(String(value.difficulty))
    && isRecord(value.stages)
    && Object.values(value.stages).every((stage) => isRecord(stage)
      && [0, 1, 2, 3].includes(Number(stage.stars))
      && typeof stage.bestScore === 'number' && Number.isFinite(stage.bestScore)
      && typeof stage.attempts === 'number' && Number.isInteger(stage.attempts) && stage.attempts >= 0
      && typeof stage.cleared === 'boolean')
    && typeof value.xp === 'number' && Number.isFinite(value.xp) && value.xp >= 0
    && Array.isArray(value.badges)
    && value.badges.every((badge) => isRecord(badge) && typeof badge.id === 'string' && typeof badge.earnedAt === 'string')
    && isRecord(powerUps)
    && ['echo', 'coconut', 'tide'].every((key) => typeof powerUps[key] === 'number'
      && Number.isInteger(powerUps[key]) && Number(powerUps[key]) >= 0)
    && isRecord(value.boss)
    && isRecord(value.boss.notes)
    && Object.values(value.boss.notes).every((note) => typeof note === 'string')
    && Array.isArray(value.boss.keywords)
    && value.boss.keywords.every((word) => typeof word === 'string')
    && typeof value.boss.recorded === 'boolean'
    && [0, 1, 2, 3].includes(Number(value.boss.stars))
    && isRecord(value.boss.rubric)
    && Object.values(value.boss.rubric).every((stars) => [0, 1, 2, 3].includes(Number(stars)))
    && isRecord(dash)
    && ['bestFind', 'bestName', 'bonusXp', 'plays'].every((key) => typeof dash[key] === 'number'
      && Number.isFinite(dash[key]) && Number(dash[key]) >= 0)
    && isRecord(value.settings)
    && typeof value.settings.sound === 'boolean'
    && typeof value.settings.reduceMotion === 'boolean'
    && typeof value.settings.dyslexia === 'boolean'
    && [1, 1.15, 1.3].includes(Number(value.settings.textScale))
    && isRecord(value.teacher)
    && (value.teacher.pin === null || typeof value.teacher.pin === 'string')
    && typeof value.teacher.unlockAll === 'boolean'
    && isRecord(value.teacher.perStageDifficulty)
    && Object.values(value.teacher.perStageDifficulty).every((difficulty) => ['medium', 'hard', 'legend'].includes(String(difficulty)))
}
