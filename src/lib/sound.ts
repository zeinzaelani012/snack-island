import { useGameStore } from '../store/gameStore'

/** Tiny synthesized sound layer. Every cue is a short WebAudio tone behind
 * the Settings sound toggle. Nothing here plays before the learner answers —
 * sound must never give an answer away. */
let context: AudioContext | null = null

function audio(): AudioContext | null {
  if (!useGameStore.getState().settings.sound) return null
  try {
    if (!context) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      context = new Ctor()
    }
    if (context.state === 'suspended') void context.resume()
    return context
  } catch {
    return null
  }
}

function tone(at: number, frequency: number, duration: number, gainValue: number, type: OscillatorType = 'sine'): void {
  const ctx = audio()
  if (!ctx) return
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  const start = ctx.currentTime + at
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(gainValue, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

/** Soft two-note marimba, upward — 300ms maximum. */
export function playCorrect(): void {
  tone(0, 523.25, 0.14, 0.16, 'sine')
  tone(0.09, 659.25, 0.18, 0.14, 'sine')
}

/** One low wooden tick — not a buzzer. It says "not that one", kindly. */
export function playIncorrect(): void {
  tone(0, 196, 0.07, 0.12, 'triangle')
}

/** Glass chime for a star. */
export function playStar(): void {
  tone(0, 1318.5, 0.32, 0.1, 'sine')
  tone(0.04, 1975.5, 0.22, 0.05, 'sine')
}

/** Four-note island phrase — the app's audio signature. */
export function playStageClear(): void {
  const phrase = [523.25, 659.25, 783.99, 1046.5]
  phrase.forEach((frequency, index) => tone(index * 0.13, frequency, 0.2, 0.13, 'sine'))
}

/** The island phrase with a longer tail for the summit. */
export function playBossClear(): void {
  const phrase = [392, 523.25, 659.25, 783.99, 1046.5]
  phrase.forEach((frequency, index) => tone(index * 0.16, frequency, index === phrase.length - 1 ? 0.9 : 0.24, 0.13, 'sine'))
  tone(0.64, 523.25, 1.1, 0.05, 'sine')
}

/** Muted wooden click for primary actions. */
export function playTap(): void {
  tone(0, 110, 0.04, 0.08, 'sine')
}
