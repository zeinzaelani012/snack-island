// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { stages } from '../data/stages'
import { useGameStore } from '../store/gameStore'
import { BossPage } from './BossPage'

class MockMediaRecorder {
  static instances: MockMediaRecorder[] = []
  state = 'inactive'
  mimeType = 'audio/webm'
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  constructor() { MockMediaRecorder.instances.push(this) }
  start() { this.state = 'recording' }
  stop() {
    this.state = 'inactive'
    this.ondataavailable?.({ data: new Blob(['audio']) })
    this.onstop?.()
  }
}

beforeAll(() => {
  vi.stubGlobal('MediaRecorder', MockMediaRecorder)
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop() {} }] })) },
    configurable: true,
  })
  window.URL.createObjectURL = vi.fn(() => 'blob:mock')
  window.URL.revokeObjectURL = vi.fn()
})

beforeEach(() => {
  MockMediaRecorder.instances = []
  vi.useFakeTimers()
  useGameStore.getState().resetAll()
  useGameStore.getState().setName('Sam')
  useGameStore.getState().completeStage(8, 2, 80)
})
afterEach(() => { cleanup(); vi.useRealTimers() })
afterAll(() => { vi.unstubAllGlobals() })

function renderBoss() {
  return render(<MemoryRouter><BossPage definition={stages.find((stage) => stage.id === 9)!} /></MemoryRouter>)
}

function toStep(step: 'plan' | 'rehearse' | 'record' | 'respond') {
  const labels: Record<string, string> = {
    plan: 'Climb to the summit',
    rehearse: 'Go to rehearse',
    record: 'Ready to record',
    respond: 'Save',
  }
  fireEvent.click(screen.getByRole('button', { name: labels[step] }))
}

describe('boss flow', () => {
  it('shows the intro prologue, then six plan prompts with free-text notes and no scaffolding', () => {
    renderBoss()
    expect(screen.getByText(/The summit is a flat rock/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Climb to the summit' }))
    for (const prompt of ['Introduce yourself', 'Two or more foods you enjoy', 'One or more foods you avoid', 'One reason', 'A contrast or detail', 'A question for your tutor']) {
      expect(screen.getByLabelText(prompt).tagName).toBe('TEXTAREA')
    }
    expect(screen.queryByText(/So do I|Neither do I/)).toBeNull()
    expect(screen.queryByText(/I like fruit/)).toBeNull()
  })

  it('keeps the notes in the boss record when moving to rehearse', () => {
    renderBoss()
    fireEvent.click(screen.getByRole('button', { name: 'Climb to the summit' }))
    fireEvent.change(screen.getByLabelText('Introduce yourself'), { target: { value: 'My name is Sam and I love mango' } })
    toStep('rehearse')
    expect(useGameStore.getState().boss.notes.intro).toBe('My name is Sam and I love mango')
    expect(screen.getByLabelText('Give a reason')).toBeTruthy()
  })

  it('rehearse ticks the checklist and records without scoring anything', async () => {
    renderBoss()
    fireEvent.click(screen.getByRole('button', { name: 'Climb to the summit' }))
    toStep('rehearse')
    const xpBefore = useGameStore.getState().xp
    fireEvent.click(screen.getByLabelText('Say who you are'))
    expect((screen.getByLabelText('Say who you are') as HTMLInputElement).checked).toBe(true)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Record' })) })
    expect(MockMediaRecorder.instances.at(-1)?.state).toBe('recording')
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Stop recording' })) })
    expect(screen.getByLabelText('Your recording')).toBeTruthy()
    expect(useGameStore.getState().xp).toBe(xpBefore)
  })

  it('record step shows exactly three keyword inputs and never reveals the notes', () => {
    renderBoss()
    fireEvent.click(screen.getByRole('button', { name: 'Climb to the summit' }))
    fireEvent.change(screen.getByLabelText('Two or more foods you enjoy'), { target: { value: 'Mango and sticky rice, sweet like summer' } })
    toStep('rehearse')
    toStep('record')
    expect(screen.getAllByLabelText(/Keyword \d/)).toHaveLength(3)
    expect(screen.queryByText(/Mango and sticky rice/)).toBeNull()
    expect(screen.queryByText(/Say who you are/)).toBeNull()
    expect(screen.queryByLabelText('Introduce yourself')).toBeNull()
  })

  it('saves keywords and the recording, scores the two agree items, and leaves stars to the tutor', async () => {
    renderBoss()
    fireEvent.click(screen.getByRole('button', { name: 'Climb to the summit' }))
    toStep('rehearse')
    toStep('record')
    fireEvent.change(screen.getByLabelText('Keyword 1'), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByLabelText('Keyword 2'), { target: { value: 'mango' } })
    fireEvent.change(screen.getByLabelText('Keyword 3'), { target: { value: 'why' } })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Record' })) })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Stop recording' })) })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(useGameStore.getState().boss.recorded).toBe(true)
    expect(useGameStore.getState().boss.keywords).toEqual(['Sam', 'mango', 'why'])
    // First agree item, answered correctly inside the five seconds: scored
    // in-app (recorded) but worth no XP — boss XP is the tutor's rubric alone
    expect(screen.getByText('I like fruit.')).toBeTruthy()
    const xpBefore = useGameStore.getState().xp
    fireEvent.click(screen.getByRole('button', { name: 'So do I.' }))
    expect(useGameStore.getState().itemResults[9]['s9-01'].correct).toBe(true)
    expect(useGameStore.getState().xp).toBe(xpBefore)
    act(() => { vi.advanceTimersByTime(1500) })
    // Second agree item, timeout consumes the five seconds and scores zero
    expect(screen.getByText("She doesn't like tomatoes.")).toBeTruthy()
    act(() => { vi.advanceTimersByTime(5100) })
    act(() => { vi.advanceTimersByTime(1500) })
    expect(screen.getByText('Your tutor will give your stars.')).toBeTruthy()
    expect(useGameStore.getState().xp).toBe(xpBefore)
    expect(useGameStore.getState().boss.stars).toBe(0)
    expect(useGameStore.getState().boss.rubric).toEqual({})
  })

  it('auto-stops the recording at the 90-second limit without cutting earlier', async () => {
    renderBoss()
    fireEvent.click(screen.getByRole('button', { name: 'Climb to the summit' }))
    toStep('rehearse')
    toStep('record')
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Record' })) })
    const recorder = MockMediaRecorder.instances.at(-1)!
    expect(recorder.state).toBe('recording')
    act(() => { vi.advanceTimersByTime(74000) })
    expect(recorder.state).toBe('recording')
    act(() => { vi.advanceTimersByTime(17000) })
    expect(recorder.state).toBe('inactive')
  })
})
