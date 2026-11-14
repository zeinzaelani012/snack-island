import { useCallback, useEffect, useRef, useState } from 'react'

/** MediaRecorder hook for the boss speaking steps. Records microphone audio,
 * exposes elapsed seconds and a playback URL. There is a hard limit — the
 * recording stops itself at `limitSeconds` — but nothing stops it earlier:
 * the learner finishes the thought, then presses Stop. */
export function useRecorder(limitSeconds = 90) {
  const supported = typeof navigator !== 'undefined' && typeof MediaRecorder !== 'undefined'
    && Boolean(navigator.mediaDevices?.getUserMedia)
  const [phase, setPhase] = useState<'idle' | 'recording' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const tickRef = useRef<number | null>(null)
  const limitRef = useRef<number | null>(null)

  const clearTimers = useCallback(() => {
    if (tickRef.current !== null) { window.clearInterval(tickRef.current); tickRef.current = null }
    if (limitRef.current !== null) { window.clearTimeout(limitRef.current); limitRef.current = null }
  }, [])

  const dropUrl = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url)
  }, [])

  const start = useCallback(async () => {
    if (!supported || recorderRef.current?.state === 'recording') return
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        clearTimers()
        setPhase('done')
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        setAudioUrl((previous) => { dropUrl(previous); return URL.createObjectURL(blob) })
      }
      recorderRef.current = recorder
      recorder.start()
      setElapsed(0)
      setAudioUrl((previous) => { dropUrl(previous); return null })
      setPhase('recording')
      const started = performance.now()
      tickRef.current = window.setInterval(() => setElapsed((performance.now() - started) / 1000), 200)
      limitRef.current = window.setTimeout(() => {
        if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      }, limitSeconds * 1000)
    } catch {
      setError('Microphone unavailable. Allow microphone access, then try again.')
    }
  }, [clearTimers, dropUrl, limitSeconds, supported])

  const stop = useCallback(() => {
    if (limitRef.current !== null) { window.clearTimeout(limitRef.current); limitRef.current = null }
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    setPhase('idle')
    setElapsed(0)
    setAudioUrl((previous) => { dropUrl(previous); return null })
  }, [clearTimers, dropUrl])

  useEffect(() => () => {
    clearTimers()
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }, [clearTimers])

  return { supported, phase, error, elapsed, audioUrl, start, stop, reset, limitSeconds }
}
