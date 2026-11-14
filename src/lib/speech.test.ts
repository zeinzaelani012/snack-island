import { describe, expect, it, vi } from 'vitest'
import { speak } from './speech'

describe('English speech', () => {
  it('returns false when speech is unavailable', () => {
    expect(speak('A crunchy snack.')).toBe(false)
  })

  it('uses British English, an English voice and a gentle rate', () => {
    const synthesis = {
      cancel: vi.fn(),
      getVoices: () => [{ lang: 'en-US', name: 'English voice' }],
      speak: vi.fn(),
    }
    vi.stubGlobal('window', { speechSynthesis: synthesis })
    class Utterance {
      text: string
      lang = ''
      rate = 1
      voice: unknown = null
      constructor(text: string) { this.text = text }
    }
    vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
    expect(speak('I like apples.')).toBe(true)
    expect(synthesis.cancel).toHaveBeenCalledOnce()
    expect(synthesis.speak).toHaveBeenCalledWith(expect.objectContaining({
      lang: 'en-GB', rate: 0.85, voice: { lang: 'en-US', name: 'English voice' },
    }))
    vi.unstubAllGlobals()
  })

  it('never throws if speech fails', () => {
    vi.stubGlobal('window', { speechSynthesis: { cancel: () => { throw new Error('unavailable') } } })
    expect(speak('Try again.')).toBe(false)
    vi.unstubAllGlobals()
  })
})
