import { getRecording } from './db'
import type { LiveItem } from './types'

let current: HTMLAudioElement | null = null

export function playUrl(url: string) {
  current?.pause()
  current = new Audio(url)
  return current.play()
}

/**
 * Play the best available pronunciation: the user's own correction recording,
 * then a bundled native recording, then (only if enabled) the device's Persian voice.
 * Returns false if nothing could be played.
 */
export async function playItem(item: LiveItem, ttsFallback: boolean): Promise<boolean> {
  const rec = await getRecording(item.id).catch(() => undefined)
  if (rec) {
    const url = URL.createObjectURL(rec)
    await playUrl(url).finally(() => setTimeout(() => URL.revokeObjectURL(url), 30_000))
    return true
  }
  if (item.audio) {
    await playUrl(import.meta.env.BASE_URL + item.audio)
    return true
  }
  if (ttsFallback && 'speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(item.dari)
    u.lang = 'fa-IR'
    u.rate = 0.85
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
    return true
  }
  return false
}

function pickMime(): string | undefined {
  // iOS Safari records AAC in MP4; Chrome/Firefox record Opus in WebM.
  return ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(
    (m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m),
  )
}

export interface Recorder { stop: () => Promise<Blob>; cancel: () => void }

export async function startRecording(): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
  const mimeType = pickMime()
  const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
  const chunks: Blob[] = []
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  rec.start()
  const release = () => stream.getTracks().forEach((t) => t.stop())
  return {
    stop: () =>
      new Promise<Blob>((resolve) => {
        rec.onstop = () => {
          release()
          resolve(new Blob(chunks, { type: rec.mimeType || mimeType || 'audio/webm' }))
        }
        rec.stop()
      }),
    cancel: () => {
      rec.onstop = release
      rec.stop()
    },
  }
}
