export function speak(text: string): boolean {
  try {
    if (typeof window === 'undefined'
      || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      return false
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-GB'
    utterance.rate = 0.85
    const voices = window.speechSynthesis.getVoices()
    utterance.voice = voices.find(({ lang }) => lang.toLowerCase() === 'en-gb')
      ?? voices.find(({ lang }) => lang.toLowerCase().startsWith('en'))
      ?? null
    window.speechSynthesis.speak(utterance)
    return true
  } catch {
    return false
  }
}
