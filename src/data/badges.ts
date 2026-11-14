import type { Progress } from '../types'

/** Extra award-time context a predicate may need. withoutHint is supplied by
 * the stage-completion evaluator only — dash runs cannot earn Brave Voice. */
export interface BadgeContext {
  withoutHint?: boolean
}

export interface BadgeDef {
  id: string
  name: string
  condition: string
  earned: (progress: Progress, context?: BadgeContext) => boolean
}

const threeStars = (progress: Progress, stageId: number) => progress.stages[stageId]?.stars === 3

export const BADGES: BadgeDef[] = [
  {
    id: 'braveVoice',
    name: 'Brave Voice',
    condition: 'Three stars on any stage without using a hint',
    earned: (progress, context) => context?.withoutHint === true
      && Object.values(progress.stages).some((stage) => stage.stars === 3),
  },
  {
    id: 'wordCollector',
    name: 'Word Collector',
    condition: 'Three stars on stages 1 and 2 both',
    earned: (progress) => threeStars(progress, 1) && threeStars(progress, 2),
  },
  {
    id: 'patternKeeper',
    name: 'Pattern Keeper',
    condition: 'Three stars on Thumbs Point',
    earned: (progress) => threeStars(progress, 4),
  },
  {
    id: 'echoTwin',
    name: 'Echo Twin',
    condition: 'Three stars on Echo Shore',
    earned: (progress) => threeStars(progress, 7),
  },
  {
    id: 'clearSpeaker',
    name: 'Clear Speaker',
    condition: 'Three stars on Blend Cliffs',
    earned: (progress) => threeStars(progress, 6),
  },
  {
    id: 'tideRunner',
    name: 'Tide Runner',
    condition: 'Twelve or more in one Find-it dash',
    earned: (progress) => progress.dash.bestFind >= 12,
  },
  {
    id: 'snackProfiler',
    name: 'Snack Profiler',
    condition: 'Two or more stars on the summit',
    earned: (progress) => progress.boss.stars >= 2,
  },
]

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((badge) => badge.id === id)
}

/** Ids of badges whose predicate turns true on this progress but are not yet awarded. */
export function newlyEarnedBadges(progress: Progress, context?: BadgeContext): string[] {
  return BADGES
    .filter((badge) => !progress.badges.some((awarded) => awarded.id === badge.id) && badge.earned(progress, context))
    .map((badge) => badge.id)
}

/** Merges any newly earned badges into a progress-shaped draft and returns it. */
export function withNewBadges(progress: Progress, context?: BadgeContext): Progress {
  const newly = newlyEarnedBadges(progress, context)
  if (newly.length === 0) return progress
  const earnedAt = new Date().toISOString()
  return { ...progress, badges: [...progress.badges, ...newly.map((id) => ({ id, earnedAt }))] }
}
