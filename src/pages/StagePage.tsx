import { useCallback, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { GameEngine } from '../components/game/GameEngine'
import type { GameResult } from '../components/game/gameUtils'
import { Button } from '../components/ui/button'
import { stageItems } from '../data/items'
import { stages } from '../data/stages'
import { isStagePlayable } from '../lib/unlocks'
import { stardFromScore } from '../lib/scoring'
import { playTap } from '../lib/sound'
import { useGameStore } from '../store/gameStore'
import { BossPage } from './BossPage'
import { StageResult } from './StageResult'

// Intro illustrations for stages whose prologue names a place worth seeing.
const introArt: Record<number, { src: string; alt: string }> = {
  4: { src: '/img/stone-faces.svg', alt: 'Two carved stone faces on a rocky headland, one smiling and one frowning' },
}

export function StagePage() {
  const { id } = useParams()
  const stageId = Number(id)
  const definition = stages.find((stage) => stage.id === stageId)
  const playable = useGameStore((state) => isStagePlayable(stageId, state))
  const difficulty = useGameStore((state) => state.teacher.perStageDifficulty[stageId] ?? state.difficulty)
  const recordItemResult = useGameStore((state) => state.recordItemResult)
  const completeStage = useGameStore((state) => state.completeStage)
  const [position, setPosition] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [run, setRun] = useState(0)
  const [braveVoice, setBraveVoice] = useState(true)
  const [stars, setStars] = useState<0 | 1 | 2 | 3>(0)
  const [earnedXP, setEarnedXP] = useState(0)
  const [newBadges, setNewBadges] = useState<string[]>([])
  const results = useRef<GameResult[]>([])
  const braveVoiceRef = useRef(true)
  const onResult = useCallback((result: GameResult) => {
    const previous = results.current.find((entry) => entry.item.id === result.item.id)
    if (!previous || result.correct) results.current = [...results.current.filter((entry) => entry.item.id !== result.item.id), result]
    recordItemResult(stageId, result.item.id, result.attempt, result.correct)
  }, [recordItemResult, stageId])
  if (!definition) return <Navigate to="/map" replace />
  if (!playable) return <Navigate to="/map" replace />
  if (definition.isBoss) return <BossPage definition={definition} />
  if (definition.isUnscored) return <main className="mx-auto min-h-dvh w-full max-w-2xl bg-parchment" />
  const items = stageItems[stageId] ?? []
  const finish = () => {
    const state = useGameStore.getState()
    const xpBefore = state.xp
    const badgesBefore = state.badges.map((badge) => badge.id)
    const correct = results.current.filter((result) => result.correct).length
    const score = Math.round(correct / items.length * 100)
    const earnedStars = stardFromScore(score, difficulty)
    setStars(earnedStars)
    completeStage(stageId, earnedStars, score, { withoutHint: braveVoiceRef.current })
    setNewBadges(useGameStore.getState().badges.filter((badge) => !badgesBefore.includes(badge.id)).map((badge) => badge.id))
    setEarnedXP(useGameStore.getState().xp - xpBefore)
    setFinished(true)
  }
  const restart = () => {
    results.current = []; braveVoiceRef.current = true; setBraveVoice(true); setPosition(0); setStarted(false); setFinished(false); setRun((value) => value + 1)
  }
  if (finished) return <StageResult title={definition.title} stars={stars} earnedXP={earnedXP} newBadges={newBadges} braveVoice={braveVoice} epilogue={definition.epilogue} onRetry={restart} />
  if (!started) return <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center gap-6 bg-parchment p-6 text-center sm:p-8">
    {introArt[stageId] && <img src={introArt[stageId].src} alt={introArt[stageId].alt} className="w-full max-w-[26.25rem]" />}
    <p className="font-display text-xl font-semibold text-ocean-700">Stage {stageId}</p>
    <h1 className="font-display text-4xl font-semibold text-ocean-900 sm:text-5xl">{definition.title}</h1>
    <p className="fs-h3 max-w-md leading-relaxed">{definition.prologue}</p>
    <Button size="large" onClick={() => { playTap(); setStarted(true) }}>Start the trail</Button>
  </main>
  const item = items[position]
  if (!item) return <Navigate to="/map" replace />
  return <GameEngine key={`${run}-${item.id}`} stageId={stageId} item={item} position={position + 1} total={items.length} difficulty={difficulty}
    onBraveVoiceChange={(eligible) => { braveVoiceRef.current = eligible; setBraveVoice(eligible) }}
    onResult={onResult}
    onComplete={() => { if (position === items.length - 1) finish(); else setPosition((value) => value + 1) }} />
}
