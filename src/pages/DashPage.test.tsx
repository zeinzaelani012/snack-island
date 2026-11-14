// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DashPage } from './DashPage'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetAll()
  vi.useFakeTimers()
})
afterEach(() => { cleanup(); vi.useRealTimers() })

describe('Dash play', () => {
  it('records an early Find-it finish once and only awards a beaten best', async () => {
    render(<MemoryRouter><DashPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Find it' }))
    const target = screen.getByRole('heading', { level: 2 }).textContent ?? ''
    fireEvent.click(screen.getByRole('button', { name: target }))
    act(() => { vi.advanceTimersByTime(250) })
    const end = screen.getByRole('button', { name: 'End' })
    fireEvent.click(end)
    fireEvent.click(end)
    expect(screen.getByRole('heading', { name: 'New best!' })).toBeTruthy()
    expect(screen.getByText('+5 bonus XP')).toBeTruthy()
    expect(useGameStore.getState().dash).toEqual({ bestFind: 1, bestName: 0, bonusXp: 5, plays: 1 })
    expect(useGameStore.getState().xp).toBe(0)
    act(() => { vi.advanceTimersByTime(61000) })
    expect(useGameStore.getState().dash.plays).toBe(1)
  })

  it('records Name it best without changing Find-it best or bonus XP', async () => {
    useGameStore.setState((state) => ({ dash: { ...state.dash, bestFind: 4, bonusXp: 20 } }))
    render(<MemoryRouter><DashPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Name it' }))
    fireEvent.click(screen.getByRole('button', { name: 'Show me' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByLabelText('2 seconds elapsed')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'End' }))
    expect(useGameStore.getState().dash).toEqual({ bestFind: 4, bestName: 1, bonusXp: 20, plays: 1 })
    expect(screen.queryByText(/bonus XP/)).toBeNull()
    expect(screen.getByText(/Previous best/)).toBeTruthy()
  })
})
