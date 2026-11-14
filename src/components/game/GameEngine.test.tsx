// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { items } from '../../data/items'
import { useGameStore } from '../../store/gameStore'
import { GameEngine } from './GameEngine'
import { TimerArc } from './TimerArc'

const { speakMock } = vi.hoisted(() => ({ speakMock: vi.fn(() => true) }))
vi.mock('../../lib/speech', () => ({ speak: speakMock }))
const item = (id: string) => items.find((entry) => entry.id === id)!
const renderItem = (id: string, props: Partial<React.ComponentProps<typeof GameEngine>> = {}) => render(<MemoryRouter><GameEngine stageId={1} item={item(id)} position={1} total={1} difficulty="medium" {...props} /></MemoryRouter>)

beforeEach(() => {
  localStorage.clear()
  useGameStore.getState().resetAll()
  speakMock.mockClear()
})
afterEach(cleanup)

describe('all item renderers', () => {
  it.each(Array.from(new Set(items.map((entry) => entry.type))))('%s renders the shared controls and answer area', (type) => {
    renderItem(items.find((entry) => entry.type === type)!.id)
    expect(screen.getByText('Stage 1 · 1/1')).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Answer options' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Check' })).toBeTruthy()
    expect(document.querySelector('[data-response-zone]')).toBeTruthy()
  })
})

describe('answer flow', () => {
  it('checks by value, gives complete feedback, and advances', async () => {
    const user = userEvent.setup()
    const result = vi.fn()
    const complete = vi.fn()
    renderItem('s4-10', { onResult: result, onComplete: complete })
    await user.click(screen.getByRole('button', { name: 'likes' }))
    await user.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByRole('region', { name: 'Answer feedback' }).textContent).toContain('She likes rice.')
    expect(screen.getByText('+10 XP')).toBeTruthy()
    expect(speakMock).toHaveBeenCalledWith('She likes rice.')
    expect(result).toHaveBeenCalledWith(expect.objectContaining({ answer: ['likes'], correct: true, xp: 10 }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(complete).toHaveBeenCalledOnce()
  })

  it('preserves options on retry and advances after three attempts', async () => {
    const user = userEvent.setup()
    const complete = vi.fn()
    renderItem('s1-01', { onComplete: complete })
    const before = screen.getAllByRole('button', { name: /chocolate|candy|cereal/ }).map((button) => button.getAttribute('aria-label'))
    for (const xp of ['+0 XP', '+0 XP']) {
      await user.click(screen.getByRole('button', { name: 'candy' }))
      await user.click(screen.getByRole('button', { name: 'Check' }))
      expect(screen.getByText(xp)).toBeTruthy()
      expect(screen.getByText('Try again')).toBeTruthy()
      await user.click(screen.getByRole('button', { name: 'Try again' }))
      expect(screen.getAllByRole('button', { name: /chocolate|candy|cereal/ }).map((button) => button.getAttribute('aria-label'))).toEqual(before)
    }
    await user.click(screen.getByRole('button', { name: 'candy' }))
    await user.click(screen.getByRole('button', { name: 'Check' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(complete).toHaveBeenCalledOnce()
  })

  it('reduces XP on a correct retry', async () => {
    const user = userEvent.setup()
    renderItem('s1-01')
    await user.click(screen.getByRole('button', { name: 'candy' }))
    await user.keyboard('{Enter}')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await user.click(screen.getByRole('button', { name: 'chocolate' }))
    await user.keyboard('{Enter}')
    expect(screen.getByText('+6 XP')).toBeTruthy()
  })

  it('accepts either personal answer, speaks and displays it, and gives five XP', async () => {
    const user = userEvent.setup()
    renderItem('s8-05')
    await user.click(screen.getByRole('button', { name: "I don't like fruit." }))
    await user.click(screen.getByRole('button', { name: 'Check' }))
    const feedback = screen.getByRole('region', { name: 'Answer feedback' })
    expect(feedback.textContent).toContain('Thanks for sharing!')
    expect(feedback.textContent).toContain("I don't like fruit.")
    expect(feedback.textContent).toContain('+5 XP')
    expect(screen.queryByText('Not yet.')).toBeNull()
    expect(speakMock).toHaveBeenCalledWith("I don't like fruit.")
  })

  it('accepts any three recognised reading answers', async () => {
    const user = userEvent.setup()
    renderItem('s8-01')
    for (const answer of ['snack', 'breakfast', 'fruit']) await user.click(screen.getByRole('button', { name: answer }))
    await user.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByText('Correct!')).toBeTruthy()
  })

  it('follow-up taps are unscored', async () => {
    const user = userEvent.setup()
    const result = vi.fn()
    renderItem('s4-07', { onResult: result })
    await user.click(screen.getByRole('button', { name: 'I like cereal.' }))
    await user.click(screen.getByRole('button', { name: 'Check' }))
    await user.click(screen.getByRole('button', { name: 'likes → like' }))
    expect(screen.getByRole('button', { name: 'likes → like' }).getAttribute('aria-pressed')).toBe('true')
    expect(result).toHaveBeenCalledOnce()
    expect(result.mock.calls[0][0].xp).toBe(10)
  })
})

describe('audio and controls', () => {
  it('shows missing-word placeholders without revealing the answer', () => {
    renderItem('s2-09')
    expect(screen.getByLabelText('One word is missing')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Question' }).textContent).not.toContain('vegetables')
  })

  it('speaks listening prompts once on mount and replays on demand', async () => {
    const user = userEvent.setup()
    renderItem('s6-06')
    expect(speakMock).toHaveBeenCalledWith(item('s6-06').audioText)
    expect(speakMock).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: 'Replay audio' }))
    expect(speakMock).toHaveBeenCalledTimes(2)
    await user.click(screen.getByRole('button', { name: item('s6-06').correct }))
    await user.click(screen.getByRole('button', { name: 'Check' }))
    expect(speakMock).toHaveBeenCalledTimes(2)
  })

  it('supports keyboard selection, confirmation, and hints without persisting eligibility', async () => {
    const user = userEvent.setup()
    const brave = vi.fn()
    const complete = vi.fn()
    renderItem('s1-01', { onBraveVoiceChange: brave, onComplete: complete })
    const chocolate = screen.getByRole('button', { name: 'chocolate' })
    const index = Array.from(chocolate.parentElement!.children).indexOf(chocolate)
    await user.keyboard(String(index + 1))
    expect(screen.getByRole('button', { name: 'chocolate' }).getAttribute('aria-pressed')).toBe('true')
    await user.keyboard('{Enter}')
    expect(screen.getByText('Correct!')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(complete).toHaveBeenCalledOnce()
    cleanup()
    renderItem('s1-01', { onBraveVoiceChange: brave })
    await user.click(screen.getByRole('button', { name: 'Show hint' }))
    expect(screen.getByRole('note').textContent).toBe(item('s1-01').hint)
    expect(brave).toHaveBeenCalledWith(false)
    expect(JSON.stringify(useGameStore.getState())).not.toContain('braveVoice')
  })

  it('replaces feedback with the same shuffled choices on retry', async () => {
    const user = userEvent.setup()
    renderItem('s1-01')
    await user.click(screen.getByRole('button', { name: 'candy' }))
    await user.click(screen.getByRole('button', { name: 'Check' }))
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.queryByText('Not yet.')).toBeNull()
  })

  it('spends a capped Coconut and removes only wrong options', async () => {
    const user = userEvent.setup()
    renderItem('s1-01')
    await user.click(screen.getByRole('button', { name: /Coconut power-up/ }))
    expect((screen.getByRole('button', { name: 'candy' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'cereal' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'chocolate' }) as HTMLButtonElement).disabled).toBe(false)
    expect(useGameStore.getState().powerUpUses[1].coconut).toBe(1)
  })
})

describe('timer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('times out into retryable feedback', async () => {
    const complete = vi.fn()
    renderItem('s1-01', { difficulty: 'legend', onComplete: complete })
    expect(screen.queryByText(/\d+ seconds/)).toBeNull()
    await vi.advanceTimersByTimeAsync(10_100)
    expect(screen.getByText('Not yet.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.queryByText('Not yet.')).toBeNull()
    expect(complete).not.toHaveBeenCalled()
  })

  it('extends the existing deadline by five seconds', async () => {
    const timeout = vi.fn()
    const { rerender } = render(<TimerArc difficulty="legend" extraTime={0} running onTimeout={timeout} />)
    await vi.advanceTimersByTimeAsync(6_000)
    rerender(<TimerArc difficulty="legend" extraTime={5} running onTimeout={timeout} />)
    await vi.advanceTimersByTimeAsync(4_000)
    expect(timeout).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(5_100)
    expect(timeout).toHaveBeenCalledOnce()
  })
})
