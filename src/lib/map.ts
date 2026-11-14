import { stages } from '../data/stages'
import type { Progress } from '../types'
import { isStagePlayable } from './unlocks'

// Square treasure map: the dotted path climbs from the wooden dock at the
// bottom to the flat summit at the top, weaving right and left. Blend Cliffs
// branches east from Orchard Bay as the optional side quest. Coordinates are
// percentages of the square map frame; the trail overlay uses the same space
// (viewBox 0 0 100 100, preserveAspectRatio="none").
export const stagePositions = [
  { x: 50, y: 92 }, { x: 30, y: 80 }, { x: 58, y: 72 }, { x: 34, y: 60 },
  { x: 62, y: 50 }, { x: 38, y: 40 }, { x: 80, y: 62 }, { x: 62, y: 30 },
  { x: 40, y: 20 }, { x: 55, y: 8 },
]

export function currentStageId(progress: Progress): number | undefined {
  return stages.find((stage) => !stage.isUnscored && !stage.sideQuest && isStagePlayable(stage.id, progress)
    && !(stage.isBoss ? progress.boss.stars > 0 : progress.stages[stage.id]?.cleared))?.id
}
