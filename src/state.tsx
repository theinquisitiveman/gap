import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import baseCourse from '../content/course.json'
import { allItems, applyCorrections } from './lib/content'
import { blobToDataUrl, dataUrlToBlob, mergeCorrections, parseCorrectionsFile, type CorrectionsFile } from './lib/corrections'
import * as db from './lib/db'
import { emptyProgress, type Progress } from './lib/progress'
import type { Correction, Corrections, Course, Item, LiveItem } from './lib/types'

const BASE = baseCourse as Course
const KNOWN_IDS = new Set(allItems(BASE).map((i) => i.id))
const ORIGINALS = new Map(allItems(BASE).map((i) => [i.id, i]))

type Fields = Correction['fields']

interface AppState {
  ready: boolean
  course: Course
  item: (id: string) => LiveItem
  original: (id: string) => Item | undefined
  progress: Progress
  setProgress: (fn: (p: Progress) => Progress) => void
  settings: db.Settings
  updateSettings: (s: Partial<db.Settings>) => void
  corrections: Corrections
  recordings: Set<string>
  canListen: (item: LiveItem) => boolean
  /** audio: Blob = new recording, null = remove recording, undefined = leave as is. */
  saveCorrection: (itemId: string, fields: Fields, alts: string[], audio?: Blob | null) => Promise<void>
  acceptAnswer: (itemId: string, answer: string) => void
  resetCorrection: (itemId: string) => Promise<void>
  exportCorrections: () => Promise<File>
  importCorrections: (text: string) => Promise<number>
}

const Ctx = createContext<AppState | null>(null)

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside provider')
  return v
}

/** Keep only fields that actually differ from the bundled content. */
function diffFields(itemId: string, fields: Fields): Fields {
  const orig = ORIGINALS.get(itemId)!
  const out: Fields = {}
  for (const k of ['roman', 'dari', 'en', 'notes'] as const) {
    const v = fields[k]?.trim()
    if (v !== undefined && v !== (orig[k] ?? '')) out[k] = v
  }
  return out
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [progress, setProgressState] = useState<Progress>(emptyProgress())
  const [settings, setSettings] = useState(db.defaultSettings)
  const [corrections, setCorrections] = useState<Corrections>({})
  const [recordings, setRecordings] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([db.loadProgress(), db.loadSettings(), db.loadCorrections(), db.recordingIds().catch(() => new Set<string>())])
      .then(([p, s, c, r]) => {
        setProgressState(p)
        setSettings(s)
        setCorrections(c)
        setRecordings(r)
      })
      .finally(() => setReady(true))
  }, [])

  useEffect(() => { if (ready) db.saveProgress(progress).catch(console.error) }, [ready, progress])
  useEffect(() => { if (ready) db.saveSettings(settings).catch(console.error) }, [ready, settings])
  useEffect(() => { if (ready) db.saveCorrections(corrections).catch(console.error) }, [ready, corrections])

  const course = useMemo(() => applyCorrections(BASE, corrections), [corrections])
  const byId = useMemo(() => new Map(allItems(course).map((i) => [i.id, i])), [course])

  const setProgress = useCallback((fn: (p: Progress) => Progress) => setProgressState(fn), [])

  const saveCorrection = useCallback<AppState['saveCorrection']>(async (itemId, fields, alts, audio) => {
    if (audio) await db.putRecording(itemId, audio)
    if (audio === null) await db.deleteRecording(itemId)
    const hasAudio = audio === undefined ? recordings.has(itemId) : !!audio
    setRecordings((prev) => {
      const next = new Set(prev)
      if (hasAudio) next.add(itemId)
      else next.delete(itemId)
      return next
    })
    const changed = diffFields(itemId, fields)
    const cleanAlts = [...new Set(alts.map((a) => a.trim()).filter(Boolean))]
    setCorrections((prev) => {
      const next = { ...prev }
      if (!Object.keys(changed).length && !cleanAlts.length && !hasAudio) delete next[itemId]
      else next[itemId] = { itemId, fields: changed, alts: cleanAlts, hasAudio, by: settings.reviewerName || undefined, updatedAt: Date.now() }
      return next
    })
  }, [recordings, settings.reviewerName])

  const acceptAnswer = useCallback((itemId: string, answer: string) => {
    setCorrections((prev) => {
      const c = prev[itemId] ?? { itemId, fields: {}, updatedAt: 0 }
      return { ...prev, [itemId]: { ...c, alts: [...new Set([...(c.alts ?? []), answer])], by: settings.reviewerName || c.by, updatedAt: Date.now() } }
    })
  }, [settings.reviewerName])

  const resetCorrection = useCallback(async (itemId: string) => {
    await db.deleteRecording(itemId)
    setRecordings((prev) => { const n = new Set(prev); n.delete(itemId); return n })
    setCorrections((prev) => { const n = { ...prev }; delete n[itemId]; return n })
  }, [])

  const exportCorrections = useCallback(async () => {
    const list = await Promise.all(
      Object.values(corrections).map(async (c) => {
        const blob = c.hasAudio ? await db.getRecording(c.itemId) : undefined
        return { ...c, audioDataUrl: blob ? await blobToDataUrl(blob) : undefined }
      }),
    )
    const file: CorrectionsFile = {
      format: 'gap-corrections', version: 1, exportedAt: new Date().toISOString(),
      by: settings.reviewerName || undefined, corrections: list,
    }
    const stamp = new Date().toISOString().slice(0, 10)
    return new File([JSON.stringify(file, null, 2)], `gap-corrections-${stamp}.json`, { type: 'application/json' })
  }, [corrections, settings.reviewerName])

  const importCorrections = useCallback(async (text: string) => {
    const file = parseCorrectionsFile(text)
    const merged = mergeCorrections(corrections, file.corrections, KNOWN_IDS)
    const applied = file.corrections.filter((c) => merged[c.itemId]?.updatedAt === c.updatedAt)
    for (const c of applied) {
      if (c.audioDataUrl) await db.putRecording(c.itemId, await dataUrlToBlob(c.audioDataUrl))
    }
    setRecordings(await db.recordingIds())
    setCorrections(merged)
    return applied.length
  }, [corrections])

  const value: AppState = {
    ready, course,
    item: (id) => byId.get(id)!,
    original: (id) => ORIGINALS.get(id),
    progress, setProgress,
    settings, updateSettings: (s) => setSettings((prev) => ({ ...prev, ...s })),
    corrections, recordings,
    canListen: (it) => recordings.has(it.id) || !!it.audio || settings.ttsFallback,
    saveCorrection, acceptAnswer, resetCorrection, exportCorrections, importCorrections,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
