import { describe, expect, it } from 'vitest'
import { newlyEarnedBadges } from './badges'
import { initialProgress } from '../store/gameStore'
import type { Progress } from '../types'

function progressWith(patch: Partial<Progress>): Progress {
  return { ...initialProgress(), ...patch }
}

const stage = (stars: 0 | 1 | 2 | 3) => ({ stars, bestScore: 100, attempts: 1, cleared: true })

describe('badge predicates', () => {
  it('awards Brave Voice only for a hint-free three-star stage', () => {
    const progress = progressWith({ stages: { 1: stage(3) } })
    expect(newlyEarnedBadges(progress, { withoutHint: true })).toContain('braveVoice')
    expect(newlyEarnedBadges(progress, { withoutHint: false })).not.toContain('braveVoice')
    expect(newlyEarnedBadges(progress)).not.toContain('braveVoice')
    const twoStars = progressWith({ stages: { 1: stage(2) } })
    expect(newlyEarnedBadges(twoStars, { withoutHint: true })).not.toContain('braveVoice')
  })

  it('awards Word Collector for three stars on stages 1 and 2 both', () => {
    const both = progressWith({ stages: { 1: stage(3), 2: stage(3) } })
    expect(newlyEarnedBadges(both)).toContain('wordCollector')
    const onlyOne = progressWith({ stages: { 1: stage(3), 2: stage(2) } })
    expect(newlyEarnedBadges(onlyOne)).not.toContain('wordCollector')
  })

  it('awards the stage-named badges for three stars on their stages', () => {
    expect(newlyEarnedBadges(progressWith({ stages: { 4: stage(3) } }))).toContain('patternKeeper')
    expect(newlyEarnedBadges(progressWith({ stages: { 6: stage(3) } }))).toContain('clearSpeaker')
    expect(newlyEarnedBadges(progressWith({ stages: { 7: stage(3) } }))).toContain('echoTwin')
    expect(newlyEarnedBadges(progressWith({ stages: { 4: stage(2) } }))).not.toContain('patternKeeper')
  })

  it('awards Tide Runner at twelve or more and Snack Profiler at two summit stars', () => {
    expect(newlyEarnedBadges(progressWith({ dash: { bestFind: 12, bestName: 0, bonusXp: 0, plays: 1 } }))).toContain('tideRunner')
    expect(newlyEarnedBadges(progressWith({ dash: { bestFind: 11, bestName: 0, bonusXp: 0, plays: 1 } }))).not.toContain('tideRunner')
    expect(newlyEarnedBadges(progressWith({ boss: { notes: {}, keywords: [], recorded: true, stars: 2, rubric: {} } }))).toContain('snackProfiler')
    expect(newlyEarnedBadges(progressWith({ boss: { notes: {}, keywords: [], recorded: true, stars: 1, rubric: {} } }))).not.toContain('snackProfiler')
  })

  it('never re-awards a badge already in the list', () => {
    const progress = progressWith({ stages: { 1: stage(3) }, badges: [{ id: 'braveVoice', earnedAt: '2026-11-14T00:00:00.000Z' }] })
    const newly = newlyEarnedBadges(progress, { withoutHint: true })
    expect(newly).not.toContain('braveVoice')
  })
})
