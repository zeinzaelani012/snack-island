export type Difficulty = 'medium' | 'hard' | 'legend'

export interface StageDef {
  id: number
  slug: string
  title: string
  objective: string
  sideQuest: boolean
  requires: number
  prologue: string
  epilogue: string
  isBoss: boolean
  isUnscored: boolean
}

export interface StageProgress {
  stars: 0 | 1 | 2 | 3
  bestScore: number
  attempts: number
  cleared: boolean
}

export interface Progress {
  version: 1
  learnerName: string
  avatarId: string
  difficulty: Difficulty
  stages: Record<number, StageProgress>
  xp: number
  badges: { id: string; earnedAt: string }[]
  powerUps: { echo: number; coconut: number; tide: number }
  boss: {
    notes: Record<string, string>
    keywords: string[]
    recorded: boolean
    stars: 0 | 1 | 2 | 3
    rubric: Record<string, 0 | 1 | 2 | 3>
  }
  dash: { bestFind: number; bestName: number; bonusXp: number; plays: number }
  settings: {
    sound: boolean
    reduceMotion: boolean
    dyslexia: boolean
    textScale: 1 | 1.15 | 1.3
  }
  teacher: {
    pin: string | null
    unlockAll: boolean
    perStageDifficulty: Record<number, Difficulty>
  }
}
