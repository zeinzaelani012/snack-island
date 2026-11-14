// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { initialProgress, useGameStore } from './store/gameStore'
import { stages } from './data/stages'
import { currentStageId } from './lib/map'

beforeEach(() => {
  window.localStorage.clear()
  useGameStore.getState().resetAll()
  window.history.replaceState({}, '', '/')
})
afterEach(cleanup)

describe('learner routes', () => {
  it('starts once, skips onboarding on return, and saves the chosen profile', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Snack Island' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.getByRole('heading', { name: "Who's exploring?" })).toBeTruthy()
    await user.type(screen.getByLabelText('Your name'), '  Sam  ')
    await user.click(screen.getByRole('button', { name: 'Choose crab' }))
    await user.click(screen.getByRole('button', { name: "Let's go" }))
    expect(screen.getByRole('button', { name: 'Candy Cove, current stage' })).toBeTruthy()
    expect(useGameStore.getState().learnerName).toBe('Sam')
    expect(useGameStore.getState().avatarId).toBe('crab')
    cleanup()
    window.history.replaceState({}, '', '/start')
    render(<App />)
    expect(screen.queryByRole('heading', { name: "Who's exploring?" })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Snack Island' })).toBeTruthy()
  })

  it('guards protected routes and the Dash until stage 2 is cleared', async () => {
    window.history.replaceState({}, '', '/map')
    render(<App />)
    expect(screen.getByRole('heading', { name: "Who's exploring?" })).toBeTruthy()
    useGameStore.getState().setName('Sam')
    cleanup()
    window.history.replaceState({}, '', '/dash')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Snack Island' })).toBeTruthy()
    useGameStore.getState().completeStage(2, 1, 40)
    cleanup()
    window.history.replaceState({}, '', '/dash')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Tidepool Dash' })).toBeTruthy()
  })
})

describe('island map', () => {
  it('shows only the open stages initially and marks locked nodes noninteractive', () => {
    useGameStore.getState().setName('Sam')
    window.history.replaceState({}, '', '/map')
    render(<App />)
    expect(screen.getByRole('button', { name: 'The Dock, available' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Candy Cove, current stage' })).toBeTruthy()
    stages.slice(2).forEach((stage) => {
      expect(screen.getByLabelText(`${stage.title}, locked`).getAttribute('aria-disabled')).toBe('true')
      expect(screen.queryByRole('button', { name: `${stage.title}, locked` })).toBeNull()
    })
    expect(screen.queryByRole('link', { name: 'Tidepool Dash' })).toBeNull()
  })

  it('opens dependencies, keeps clears replayable, and opens the side quest from stage 2', () => {
    const store = useGameStore.getState()
    store.setName('Sam')
    store.completeStage(1, 3, 100)
    store.completeStage(2, 1, 50)
    window.history.replaceState({}, '', '/map')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Candy Cove, 3 stars' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Orchard Bay, 1 stars' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Market Stones, current stage' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Blend Cliffs, available' }).className).toContain('rotate-45')
    expect(screen.getByRole('link', { name: 'Tidepool Dash' })).toBeTruthy()
  })

  it('does not revoke progress after a failed replay and ignores the Dock for current-stage selection', () => {
    const store = useGameStore.getState()
    store.completeStage(1, 2, 60)
    store.completeStage(1, 0, 20)
    expect(useGameStore.getState().stages[1]).toEqual({ stars: 2, bestScore: 60, attempts: 2, cleared: true })
    expect(currentStageId(useGameStore.getState())).toBe(2)
    const allClear = initialProgress()
    for (const id of [1, 2, 3, 4, 5, 6, 7, 8]) {
      allClear.stages[id] = { stars: 2, bestScore: 80, attempts: 1, cleared: true }
    }
    allClear.boss.stars = 2
    expect(currentStageId(allClear)).toBeUndefined()
  })

  it('lets teacher unlock-all expose every stage', () => {
    const store = useGameStore.getState()
    store.setName('Sam')
    store.setTeacherFlags({ unlockAll: true })
    window.history.replaceState({}, '', '/map')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Snack Summit, available' })).toBeTruthy()
    expect(screen.queryByLabelText('Blend Cliffs, locked')).toBeNull()
  })
})
