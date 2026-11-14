import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft as BackIcon } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { stageItems } from '../data/items'
import { stages } from '../data/stages'
import { getRecordingUrl } from '../lib/recordingCache'
import { useGameStore } from '../store/gameStore'
import type { Difficulty } from '../types'

const RUBRIC_ROWS = [
  { key: 'courage', label: 'Courage and participation' },
  { key: 'vocabulary', label: 'Vocabulary' },
  { key: 'pattern', label: 'Pattern (like / don\u2019t like)' },
  { key: 'agreeing', label: 'Agreeing (So do I / Neither do I)' },
  { key: 'clarity', label: 'Clarity (including r-blends)' },
] as const

const TEACHER_NOTE = 'Pronunciation is assessed by you, not the app. The app can record and replay; it does not judge speech.'

function Panel({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[var(--radius-sm)] border border-parchment/25 bg-ocean-700/30 p-[var(--sp-4)] ${className}`}>
    {title && <h2 className="fs-body mb-[var(--sp-3)] font-semibold text-parchment">{title}</h2>}
    {children}
  </section>
}

export function TeacherPage() {
  const pin = useGameStore((state) => state.teacher.pin)
  const setTeacherPin = useGameStore((state) => state.setTeacherPin)
  const [unlocked, setUnlocked] = useState(false)
  const [draftPin, setDraftPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)

  if (!unlocked) {
    const settingUp = pin === null
    return <main className="flex min-h-dvh flex-col bg-ocean-900 text-parchment">
      <FocuslessHeader />
      <div className="mx-auto flex w-[var(--w-focus)] flex-1 flex-col justify-center px-[var(--pad-page)] py-[var(--gap-section)]">
        <h1 className="fs-h2 font-display font-semibold">{settingUp ? 'Set a teacher PIN' : 'Teacher Mode'}</h1>
        <p className="fs-body mt-2 text-parchment/70">{settingUp ? 'Four digits. You will need it every time.' : 'Enter your four-digit PIN.'}</p>
        <input type="password" inputMode="numeric" maxLength={4} autoFocus aria-label={settingUp ? 'New four-digit PIN' : 'Teacher PIN'}
          className="fs-h2 score-display mt-[var(--sp-4)] h-[var(--h-control)] w-full max-w-[12rem] rounded-[var(--radius-sm)] border-2 border-parchment/40 bg-ocean-900 px-[var(--sp-4)] tracking-[0.4em] text-parchment outline-none focus:ring-4 focus:ring-gold-500/50"
          value={draftPin} onChange={(event) => { setDraftPin(event.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(null) }} />
        {pinError && <p role="alert" className="fs-body mt-2 text-gold-500">{pinError}</p>}
        <button type="button" disabled={draftPin.length !== 4}
          onClick={() => {
            if (settingUp) { setTeacherPin(draftPin); setUnlocked(true) }
            else if (draftPin === pin) { setUnlocked(true); setPinError(null) }
            else setPinError('Wrong PIN.')
          }}
          className="fs-body mt-[var(--sp-4)] inline-flex min-h-12 max-w-[12rem] cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border-2 border-parchment/40 bg-ocean-700/40 px-[var(--sp-4)] font-semibold text-parchment focus-visible:ring-4 focus-visible:ring-gold-500/60 disabled:opacity-40">
          {settingUp ? 'Save PIN' : 'Unlock'}
        </button>
        <Link to="/map" className="fs-sm mt-[var(--gap-section)] inline-flex min-h-12 items-center text-parchment/60 underline focus-visible:ring-4 focus-visible:ring-gold-500/60">Back to the island</Link>
      </div>
    </main>
  }

  return <TeacherDashboard />
}

function FocuslessHeader() {
  return <header className="flex min-h-16 items-center gap-3 border-b border-parchment/25 px-[var(--pad-page)]">
    <Link to="/map" aria-label="Back to map" className="flex size-12 items-center justify-center rounded-full text-parchment/70 hover:bg-ocean-700/40 focus-visible:ring-4 focus-visible:ring-gold-500/60"><BackIcon /></Link>
    <span className="fs-body font-semibold">Teacher Mode</span>
  </header>
}

function TeacherDashboard() {
  const unlockAll = useGameStore((state) => state.teacher.unlockAll)
  const setTeacherFlags = useGameStore((state) => state.setTeacherFlags)
  const setStageDifficulty = useGameStore((state) => state.setStageDifficulty)
  const teacherDifficulty = useGameStore((state) => state.teacher.perStageDifficulty)
  const progress = useGameStore()
  const resetStage = useGameStore((state) => state.resetStage)
  const resetAll = useGameStore((state) => state.resetAll)
  const awardBossRubric = useGameStore((state) => state.awardBossRubric)
  const setBossNotes = useGameStore((state) => state.setBossNotes)
  const exportProgress = useGameStore((state) => state.exportProgress)
  const importProgress = useGameStore((state) => state.importProgress)

  const [selected, setSelected] = useState(1)
  const [confirm, setConfirm] = useState<'stage' | 'all' | null>(null)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [target, setTarget] = useState(progress.boss.notes.target ?? '')
  const fileRef = useRef<HTMLInputElement>(null)
  const definition = stages.find((stage) => stage.id === selected)
  const recordingUrl = getRecordingUrl()
  const rubricTotal = RUBRIC_ROWS.reduce((sum, row) => sum + (progress.boss.rubric[row.key] ?? 0), 0)

  function exportFile() {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'snack-island-progress.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function importFile(file: File) {
    const ok = importProgress(await file.text())
    setImportStatus(ok ? 'Progress imported.' : 'That file is not a valid progress export.')
  }

  return <main className="min-h-dvh bg-ocean-900 text-parchment">
    <header className="flex min-h-16 items-center gap-3 border-b border-parchment/25 px-[var(--pad-page)]">
      <Link to="/map" aria-label="Back to map" className="flex size-12 items-center justify-center rounded-full text-parchment/70 hover:bg-ocean-700/40 focus-visible:ring-4 focus-visible:ring-gold-500/60"><BackIcon /></Link>
      <h1 className="fs-h3 font-display font-semibold">Teacher Mode — {progress.learnerName || 'no learner yet'}</h1>
      <span className="fs-sm ml-auto rounded-full border border-gold-500/60 px-2.5 py-1 text-gold-500">Assessment tools</span>
    </header>
    <div className="mx-auto grid max-w-[75rem] grid-cols-1 gap-[var(--sp-4)] p-[var(--pad-page)] lg:grid-cols-[230px_minmax(0,1fr)_320px] lg:items-start">

      <div className="flex flex-col gap-[var(--sp-4)]">
        <Panel title="Stages">
          <ul className="flex flex-col gap-[var(--sp-1)]">
            {stages.map((stage) => {
              const stageProgress = progress.stages[stage.id]
              const stars = stage.isBoss ? progress.boss.stars : stageProgress?.stars ?? 0
              return <li key={stage.id}>
                <button type="button" onClick={() => setSelected(stage.id)} aria-pressed={selected === stage.id}
                  className={`fs-sm flex min-h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-sm)] border px-[var(--sp-3)] text-left focus-visible:ring-4 focus-visible:ring-gold-500/60 ${selected === stage.id ? 'border-gold-500/70 bg-ocean-700/50 text-parchment' : 'border-transparent text-parchment/70 hover:bg-ocean-700/30'}`}>
                  <span className="font-semibold">{stage.id}. {stage.title}{stage.sideQuest ? ' ★' : ''}</span>
                  <span className="score-display">{stage.isBoss ? `${progress.boss.stars}/3` : `${stars}/3`}</span>
                </button>
              </li>
            })}
          </ul>
        </Panel>
        <Panel title="Session controls">
          <button type="button" role="switch" aria-checked={unlockAll} onClick={() => setTeacherFlags({ unlockAll: !unlockAll })}
            className="fs-sm flex min-h-12 w-full cursor-pointer items-center justify-between rounded-[var(--radius-sm)] border border-parchment/30 px-[var(--sp-3)] font-semibold focus-visible:ring-4 focus-visible:ring-gold-500/60">
            Unlock all stages
            <span className={`rounded-full px-2 py-0.5 ${unlockAll ? 'bg-gold-500 text-ocean-900' : 'bg-ocean-900 text-parchment/70'}`}>{unlockAll ? 'ON' : 'OFF'}</span>
          </button>
          <div className="mt-[var(--sp-3)] flex flex-col gap-[var(--sp-2)]">
            <button type="button" onClick={exportFile} className="fs-sm min-h-12 cursor-pointer rounded-[var(--radius-sm)] border border-parchment/30 px-[var(--sp-3)] text-left font-semibold focus-visible:ring-4 focus-visible:ring-gold-500/60">Export progress (JSON)</button>
            <button type="button" onClick={() => fileRef.current?.click()} className="fs-sm min-h-12 cursor-pointer rounded-[var(--radius-sm)] border border-parchment/30 px-[var(--sp-3)] text-left font-semibold focus-visible:ring-4 focus-visible:ring-gold-500/60">Import progress</button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Import progress file"
              onChange={(event) => { const file = event.target.files?.[0]; if (file) importFile(file); event.target.value = '' }} />
            {importStatus && <p role="status" className="fs-sm text-gold-500">{importStatus}</p>}
            <button type="button" onClick={() => setConfirm('all')} className="fs-sm min-h-12 cursor-pointer rounded-[var(--radius-sm)] border border-coral-600/60 px-[var(--sp-3)] text-left font-semibold text-gold-500 focus-visible:ring-4 focus-visible:ring-gold-500/60">Reset everything</button>
          </div>
        </Panel>
        <p className="fs-sm rounded-[var(--radius-sm)] border border-parchment/25 bg-ocean-700/30 p-[var(--sp-3)] text-parchment/70">{TEACHER_NOTE}</p>
      </div>

      <div className="flex flex-col gap-[var(--sp-4)]">
        <Panel title={`Stage ${definition?.id} — ${definition?.title}${definition?.sideQuest ? ' (side quest)' : ''}`}>
          <p className="fs-sm text-parchment/70">{definition?.objective}</p>
          <div className="mt-[var(--sp-3)] flex flex-wrap items-center gap-[var(--sp-2)]">
            <span className="fs-sm text-parchment/70">Difficulty:</span>
            {(['medium', 'hard', 'legend'] as Difficulty[]).map((level) => (
              <button key={level} type="button" aria-pressed={(teacherDifficulty[definition?.id ?? 0] ?? null) === level}
                onClick={() => setStageDifficulty(definition?.id ?? 0, level)}
                className={`fs-sm min-h-12 cursor-pointer rounded-[var(--radius-sm)] border px-[var(--sp-3)] font-semibold capitalize focus-visible:ring-4 focus-visible:ring-gold-500/60 ${(teacherDifficulty[definition?.id ?? 0] ?? null) === level ? 'border-gold-500 bg-gold-500 text-ocean-900' : 'border-parchment/30 text-parchment/80'}`}>
                {level}
              </button>
            ))}
            <button type="button" onClick={() => setStageDifficulty(definition?.id ?? 0, null)}
              className="fs-sm min-h-12 cursor-pointer rounded-[var(--radius-sm)] border border-parchment/30 px-[var(--sp-3)] text-parchment/70 underline focus-visible:ring-4 focus-visible:ring-gold-500/60">use learner setting</button>
            <Link to={`/stage/${definition?.id}`} className="fs-sm inline-flex min-h-12 items-center rounded-[var(--radius-sm)] border border-parchment/30 px-[var(--sp-3)] font-semibold text-parchment underline focus-visible:ring-4 focus-visible:ring-gold-500/60">Jump to stage</Link>
          </div>
          <button type="button" onClick={() => setConfirm('stage')} className="fs-sm mt-[var(--sp-3)] min-h-12 w-full cursor-pointer rounded-[var(--radius-sm)] border border-coral-600/60 px-[var(--sp-3)] font-semibold text-gold-500 focus-visible:ring-4 focus-visible:ring-gold-500/60">Reset this stage's stars</button>
        </Panel>
        <Panel title="Item list — correct answers">
          <ul className="flex flex-col gap-[var(--sp-2)]">
            {(stageItems[selected] ?? []).map((item) => <li key={item.id} className="fs-sm rounded-[var(--radius-sm)] border border-parchment/25 p-[var(--sp-3)]">
              <span className="block font-semibold text-parchment">{item.prompt}</span>
              {item.stimulus && <span className="block text-parchment/70">“{item.stimulus}”</span>}
              <span className="block text-parchment/70">Options: {item.options.join(' · ')}</span>
              <span className="block font-semibold text-gold-500">Correct: {item.correct}{item.alwaysCorrect ? ' (any answer accepted)' : ''}</span>
            </li>)}
            {(stageItems[selected] ?? []).length === 0 && <li className="fs-sm text-parchment/70">No items for this stage.</li>}
          </ul>
        </Panel>
      </div>

      <div className="flex flex-col gap-[var(--sp-4)]">
        <Panel title="Boss rubric — out of 15">
          <div className="flex flex-col gap-[var(--sp-3)]">
            {RUBRIC_ROWS.map((row) => {
              const current = progress.boss.rubric[row.key] ?? 0
              return <div key={row.key}>
                <span className="fs-sm block font-semibold text-parchment">{row.label}</span>
                <div className="mt-1 flex gap-[var(--sp-2)]">
                  {[1, 2, 3].map((value) => <button key={value} type="button" aria-label={`${row.label}: ${value} of 3 stars`} aria-pressed={current === value}
                    onClick={() => awardBossRubric(row.key, value as 1 | 2 | 3)}
                    className={`size-12 cursor-pointer rounded-full border-2 focus-visible:ring-4 focus-visible:ring-gold-500/60 ${value <= current ? 'border-gold-500 bg-gold-500' : 'border-parchment/30 bg-ocean-900'}`}>
                    <span className={`score-display fs-body font-semibold ${value <= current ? 'text-ocean-900' : 'text-parchment/50'}`}>{value}</span>
                  </button>
                )}
                <span className="score-display fs-body ml-auto self-center text-parchment/70">{current}/3</span>
                </div>
              </div>
            })}
          </div>
          <p className="fs-body score-display mt-[var(--sp-3)] font-semibold text-gold-500" data-score>Total: {rubricTotal} / 15</p>
          <div className="mt-[var(--sp-3)]">
            <span className="fs-sm block font-semibold text-parchment">Learner's recording</span>
            {recordingUrl
              ? <audio controls src={recordingUrl} className="mt-1 w-full max-w-full" aria-label="Learner's summit recording" />
              : <p className="fs-sm mt-1 text-parchment/70">No recording in this session. Play a boss run on this device first — recordings do not survive a page reload.</p>}
          </div>
          <div className="mt-[var(--sp-3)]">
            <label className="fs-sm block font-semibold text-parchment" htmlFor="next-step">Next-step target</label>
            <textarea id="next-step" rows={2} maxLength={140} value={target}
              onChange={(event) => setTarget(event.target.value)}
              className="fs-sm mt-1 w-full rounded-[var(--radius-sm)] border border-parchment/40 bg-ocean-900 p-[var(--sp-3)] text-parchment outline-none focus:ring-4 focus:ring-gold-500/50" />
            <button type="button" onClick={() => setBossNotes({ ...progress.boss.notes, target })}
              className="fs-sm mt-2 min-h-12 w-full cursor-pointer rounded-[var(--radius-sm)] border border-parchment/30 font-semibold focus-visible:ring-4 focus-visible:ring-gold-500/60">Save next-step target</button>
          </div>
        </Panel>
      </div>
    </div>

    <ConfirmDialog open={confirm === 'stage'} title={`Reset stage ${definition?.id}?`}
      body={`Stars, best score and item records for ${definition?.title} will be erased.`}
      confirmLabel="Reset stage" onConfirm={() => { if (definition) resetStage(definition.id); setConfirm(null) }}
      onCancel={() => setConfirm(null)} />
    <ConfirmDialog open={confirm === 'all'} title="Reset everything?"
      body="All stars, XP, badges, notes and recordings on this device will be erased. This cannot be undone."
      confirmLabel="Reset all" onConfirm={() => { resetAll(); setConfirm(null) }}
      onCancel={() => setConfirm(null)} />
  </main>
}
