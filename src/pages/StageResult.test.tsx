// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGameStore } from '../store/gameStore'
import { StageResult } from './StageResult'

const props = {
  title: 'Candy Cove',
  stars: 3 as const,
  earnedXP: 175,
  newBadges: ['braveVoice'],
  braveVoice: true,
  epilogue: 'The cove opens. A trail of crumbs leads inland.',
  onRetry: vi.fn()
}

beforeEach(() => {
  localStorage.clear()
  useGameStore.getState().resetAll()
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function renderResult(overrides: Partial<typeof props> = {}) {
  return render(<MemoryRouter><StageResult {...props} {...overrides} /></MemoryRouter>)
}

async function advance(ms: number) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms) })
}

describe('ordered stage results', () => {
  it('shows stars first, then counts XP and reveals the badge, epilogue, and actions', async () => {
    renderResult()
    expect(screen.getByLabelText('3 stars')).toBeTruthy()
    expect(screen.getByText('+0 XP')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()
    expect(screen.getByText(props.epilogue).parentElement!.classList.contains('invisible')).toBe(true)

    await advance(750)
    expect(screen.getByText('+175 XP')).toBeTruthy()
    expect(screen.getByText('New badge: Brave Voice!').parentElement!.classList.contains('invisible')).toBe(false)
    expect(screen.getByText(props.epilogue).parentElement!.classList.contains('invisible')).toBe(true)

    await advance(350)
    expect(screen.getByText(props.epilogue).parentElement!.classList.contains('invisible')).toBe(false)
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()

    await advance(450)
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Back to the map' })).toBeTruthy()
  })

  it('skips the badge hold and hides the badge when none was newly earned', async () => {
    renderResult({ newBadges: [] })
    await advance(750)
    expect(screen.getByText(props.epilogue).parentElement!.classList.contains('invisible')).toBe(false)
    expect(screen.queryByText('New badge: Brave Voice!')).toBeNull()
    await advance(400)
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
  })

  it('shows the complete result immediately with reduced motion', () => {
    useGameStore.getState().setSettings({ reduceMotion: true })
    renderResult()
    expect(screen.getByText('+175 XP')).toBeTruthy()
    expect(screen.getByText('New badge: Brave Voice!').parentElement!.classList.contains('invisible')).toBe(false)
    expect(screen.getByText(props.epilogue).parentElement!.classList.contains('invisible')).toBe(false)
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
  })
})
