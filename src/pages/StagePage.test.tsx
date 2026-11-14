// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { items } from '../data/items'
import { stages } from '../data/stages'
import { useGameStore } from '../store/gameStore'
import { speak } from '../lib/speech'
import { StagePage } from './StagePage'

vi.mock('../lib/speech', () => ({ speak: vi.fn(() => true) }))

beforeEach(() => {
  localStorage.clear()
  useGameStore.getState().resetAll()
  useGameStore.getState().setName('Sam')
})
afterEach(cleanup)

const stage = async (id = '1') => {
  render(<MemoryRouter initialEntries={[`/stage/${id}`]}><Routes><Route path="/stage/:id" element={<StagePage />} /><Route path="/map" element={<p>Island map</p>} /></Routes></MemoryRouter>)
  const start = screen.queryByRole('button', { name: 'Start the trail' })
  if (start) await userEvent.click(start)
}

describe('stage host', () => {
  it.each([1, 2, 3])('shows the exact supplied narrative for stage %i', async (id) => {
    const definition = stages.find((stage) => stage.id === id)!
    useGameStore.getState().completeStage(1, 3, 100)
    if (id === 3) useGameStore.getState().completeStage(2, 3, 100)
    render(<MemoryRouter initialEntries={[`/stage/${id}`]}><Routes><Route path="/stage/:id" element={<StagePage />} /></Routes></MemoryRouter>)
    if (definition.prologue) expect(screen.getByText(definition.prologue)).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Start the trail' }))
    expect(screen.getByText(`Stage ${id} · 1/${items.filter((item) => item.stageId === id).length}`)).toBeTruthy()
  })

  it('speaks each Stage 2 missing-word list on item mount', async () => {
    useGameStore.getState().completeStage(1, 3, 100)
    const user = userEvent.setup()
    await stage('2')
    for (const entry of items.filter((item) => item.stageId === 2)) {
      if (entry.type === 'whatsMissing') expect(vi.mocked(speak)).toHaveBeenCalledWith(entry.audioText)
      await user.click(screen.getByRole('button', { name: entry.correct }))
      await user.click(screen.getByRole('button', { name: 'Check' }))
      await user.click(screen.getByRole('button', { name: 'Next' }))
    }
  }, 15000)

  it.each([1, 2, 3])('shows the exact epilogue on the stage %i result', async (id) => {
    const definition = stages.find((stage) => stage.id === id)!
    useGameStore.getState().setSettings({ reduceMotion: true })
    useGameStore.getState().completeStage(1, 3, 100)
    if (id === 3) useGameStore.getState().completeStage(2, 3, 100)
    const user = userEvent.setup()
    await stage(String(id))
    for (const entry of items.filter((item) => item.stageId === id)) {
      await user.click(screen.getByRole('button', { name: entry.type === 'wordToPicture' ? entry.correct.split('/').pop()!.replace('.png', '') : entry.correct }))
      await user.click(screen.getByRole('button', { name: 'Check' }))
      await user.click(screen.getByRole('button', { name: 'Next' }))
    }
    if (definition.epilogue) expect(screen.getByText(definition.epilogue)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Back to the map' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
  }, 15000)

  it('renders crate category names as HTML overlays', async () => {
    useGameStore.getState().completeStage(1, 3, 100)
    useGameStore.getState().completeStage(2, 3, 100)
    await stage('3')
    let vegetables = screen.getByRole('button', { name: 'vegetables' })
    expect(vegetables.querySelector('span')?.textContent).toBe('vegetables')
    expect(vegetables.querySelector('img')?.getAttribute('src')).toBe('/img/crates/vegetables.svg')
    expect(vegetables.querySelector('img')?.getAttribute('alt')).toBe('')
    await userEvent.click(vegetables)
    vegetables = screen.getByRole('button', { name: 'vegetables' })
    expect(within(vegetables).getByText('Selected')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'fruit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(within(screen.getByRole('button', { name: 'fruit' })).getAllByText('Not yet')).toHaveLength(1)
    vegetables = screen.getByRole('button', { name: 'vegetables' })
    expect(within(vegetables).getAllByText('Correct')).toHaveLength(1)
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    vegetables = screen.getByRole('button', { name: 'vegetables' })
    await userEvent.click(vegetables)
    await userEvent.click(screen.getByRole('button', { name: 'Check' }))
    vegetables = screen.getByRole('button', { name: 'vegetables' })
    expect(within(vegetables).getAllByText('Correct')).toHaveLength(1)
  })

  it('completes an ordinary stage, records first-clear XP and stars, and resets replay', async () => {
    const user = userEvent.setup()
    useGameStore.getState().setSettings({ reduceMotion: true })
    await stage()
    for (const entry of items.filter((item) => item.stageId === 1)) {
      await user.click(screen.getByRole('button', { name: entry.type === 'wordToPicture' ? entry.correct.split('/').pop()!.replace('.png', '') : entry.correct }))
      await user.click(screen.getByRole('button', { name: 'Check' }))
      await user.click(screen.getByRole('button', { name: 'Next' }))
    }
    expect(screen.getByRole('heading', { name: 'Candy Cove' })).toBeTruthy()
    expect(screen.getByLabelText('3 stars')).toBeTruthy()
    expect(useGameStore.getState().stages[1]).toEqual({ stars: 3, bestScore: 100, attempts: 1, cleared: true })
    expect(useGameStore.getState().xp).toBe(175)
    expect(useGameStore.getState().badges.map((badge) => badge.id)).toContain('braveVoice')
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    await user.click(screen.getByRole('button', { name: 'Start the trail' }))
    expect(screen.queryByText('New badge: Brave Voice!')).toBeNull()
    expect(screen.getByText('Stage 1 · 1/10')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Check' })).toBeTruthy()
    expect(useGameStore.getState().xp).toBe(175)
  }, 15000)

  it('keeps a hint out of persisted progress and reports it on the summary', async () => {
    const user = userEvent.setup()
    await stage()
    await user.click(screen.getByRole('button', { name: 'Show hint' }))
    expect(screen.getByRole('note').textContent).toContain('Brown and sweet.')
    expect(JSON.parse(localStorage.getItem('snack-island-v1')!).state).not.toHaveProperty('braveVoice')
  })

  it('redirects locked and unknown stages to the map', async () => {
    await stage('2')
    expect(screen.getByText('Island map')).toBeTruthy()
    cleanup()
    await stage('99')
    expect(screen.getByText('Island map')).toBeTruthy()
  })
})
