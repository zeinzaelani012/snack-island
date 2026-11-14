import { stages } from '../data/stages'
import type { Progress } from '../types'

export function isStageUnlocked(stageId: number, progress: Progress): boolean {
  const stage = stages.find(({ id }) => id === stageId)
  if (!stage) return false
  if (stage.requires === 0) return true
  return (progress.stages[stage.requires]?.stars ?? 0) >= 1
}

export function isStagePlayable(stageId: number, progress: Progress): boolean {
  return progress.teacher.unlockAll || isStageUnlocked(stageId, progress)
}
