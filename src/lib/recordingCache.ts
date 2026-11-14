/** Session cache for the learner's boss recording. Blobs cannot live in
 * localStorage, so the recording survives navigation within the session but
 * not a page reload — Teacher Mode says so when it is gone. */
let current: string | null = null

export function setRecordingUrl(url: string | null): void {
  current = url
}

export function getRecordingUrl(): string | null {
  return current
}
