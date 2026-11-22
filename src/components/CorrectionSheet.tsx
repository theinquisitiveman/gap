import { useEffect, useRef, useState } from 'react'
import { playUrl, startRecording, type Recorder } from '../lib/audio'
import { getRecording } from '../lib/db'
import { useApp } from '../state'

/**
 * "Fix this phrase": lets a native speaker correct the romanization, script, meaning or notes,
 * add accepted alternatives, and record the real Kabuli pronunciation. Saved corrections apply
 * immediately everywhere in the app and can be exported to merge into the course for everyone.
 */
export function CorrectionSheet({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const { item, original, corrections, recordings, saveCorrection, resetCorrection, settings, updateSettings, lang, t } = useApp()
  const live = item(itemId)
  const orig = original(itemId)!
  const [roman, setRoman] = useState(live.roman)
  const [dari, setDari] = useState(live.dari)
  // Reviewers fix the meaning and notes in the language they're reading; the other language is kept as is.
  const meaningKey = lang === 'de' ? 'de' : 'en'
  const notesKey = lang === 'de' ? 'notesDe' : 'notes'
  const [meaning, setMeaning] = useState(live[meaningKey] ?? '')
  const [notes, setNotes] = useState(live[notesKey] ?? '')
  const [alts, setAlts] = useState((corrections[itemId]?.alts ?? []).join('\n'))
  const [audio, setAudio] = useState<Blob | null | undefined>(undefined) // undefined = unchanged
  const [recorder, setRecorder] = useState<Recorder | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const recorderRef = useRef<Recorder | null>(null)
  recorderRef.current = recorder

  useEffect(() => () => recorderRef.current?.cancel(), [])
  const sheetRef = useSwipeDown(onClose)

  const hasRecording = audio === undefined ? recordings.has(itemId) : !!audio

  async function toggleRecord() {
    setError('')
    if (recorder) {
      setAudio(await recorder.stop())
      setRecorder(null)
      return
    }
    try {
      setRecorder(await startRecording())
    } catch {
      setError(t('Microphone unavailable. Allow microphone access for this site in Settings › Safari.'))
    }
  }

  async function playRecording() {
    const blob = audio ?? (await getRecording(itemId))
    if (!blob) return
    const url = URL.createObjectURL(blob)
    playUrl(url).catch(console.error).finally(() => setTimeout(() => URL.revokeObjectURL(url), 30_000))
  }

  async function save() {
    setSaving(true)
    try {
      const kept = { en: live.en, notes: live.notes ?? '', de: live.de ?? '', notesDe: live.notesDe ?? '' }
      await saveCorrection(itemId, { roman, dari, ...kept, [meaningKey]: meaning, [notesKey]: notes }, alts.split('\n'), audio)
      onClose()
    } catch (e) {
      setError(t("Couldn't save: {error}", { error: (e as Error).message }))
      setSaving(false)
    }
  }

  const changedHint = (now: string, was: string | undefined) =>
    now.trim() !== (was ?? '') ? <span className="text-xs font-semibold text-fox">{t('was: {value}', { value: was || '—' })}</span> : null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fix-title"
        className="anim-up safe-bottom max-h-[92%] w-full overflow-y-auto rounded-t-3xl bg-white px-4 pt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="-mx-4 -mt-4 mb-1 flex justify-center py-3" aria-hidden>
          <div className="h-1.5 w-12 rounded-full bg-swan" />
        </div>
        <h2 id="fix-title" className="text-xl font-black">{t('Fix this phrase')}</h2>
        <p className="mb-4 text-sm text-wolf">
          {t('Speak Kabuli Dari? Correct anything that sounds wrong. Your fix is used in every lesson right away.')}
        </p>

        <div className="space-y-3">
          <label className="block">
            <span className="flex justify-between text-sm font-bold">{t('Romanized')} {changedHint(roman, orig.roman)}</span>
            <input className="field" value={roman} onChange={(e) => setRoman(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
          </label>
          <label className="block">
            <span className="flex justify-between text-sm font-bold">{t('Dari script')} {changedHint(dari, orig.dari)}</span>
            <input className="field dari text-lg" dir="rtl" lang="prs" value={dari} onChange={(e) => setDari(e.target.value)} />
          </label>
          <label className="block">
            <span className="flex justify-between text-sm font-bold">{t(lang === 'de' ? 'German meaning' : 'English meaning')} {changedHint(meaning, orig[meaningKey])}</span>
            <input className="field" value={meaning} placeholder={live.en} onChange={(e) => setMeaning(e.target.value)} />
          </label>
          <label className="block">
            <span className="flex justify-between text-sm font-bold">{t('Notes (Kabuli vs formal, usage)')} {changedHint(notes, orig[notesKey])}</span>
            <textarea className="field" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-bold">{t('Also accept (one per line)')}</span>
            <textarea className="field" rows={2} placeholder={t('e.g. {example}', { example: 'chetor hasti?' })} value={alts} onChange={(e) => setAlts(e.target.value)} autoCapitalize="off" spellCheck={false} />
          </label>

          <div className="rounded-2xl border-2 border-swan p-3">
            <div className="mb-2 text-sm font-bold">{t('Kabuli pronunciation')}</div>
            <div className="flex gap-2">
              <button type="button" onClick={toggleRecord} className={`btn ${recorder ? 'btn-red' : 'btn-sky'} normal-case`}>
                {t(recorder ? '■ Stop' : hasRecording ? '🎙️ Re-record' : '🎙️ Record')}
              </button>
              {hasRecording && !recorder && (
                <>
                  <button type="button" onClick={playRecording} className="btn btn-ghost w-auto normal-case">▶︎</button>
                  <button type="button" onClick={() => setAudio(null)} className="btn btn-ghost w-auto normal-case text-cardinal" aria-label={t('Delete recording')}>✕</button>
                </>
              )}
            </div>
            {recorder && <p className="mt-2 text-sm font-bold text-cardinal">{t('● Recording… say the phrase once, clearly.')}</p>}
          </div>

          <label className="block">
            <span className="text-sm font-bold">{t('Your name (optional, credited in the course)')}</span>
            <input className="field" value={settings.reviewerName} onChange={(e) => updateSettings({ reviewerName: e.target.value })} />
          </label>

          {error && <p role="alert" className="text-sm font-bold text-cardinal">{error}</p>}

          <div className="space-y-2 pb-2 pt-1">
            <button type="button" className="btn btn-green" disabled={saving || !!recorder} onClick={save}>{t('Save fix')}</button>
            {corrections[itemId] && (
              <button type="button" className="btn btn-ghost text-cardinal" onClick={async () => { await resetCorrection(itemId); onClose() }}>
                {t('Reset to original')}
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>{t('Cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Swipe the sheet down to close it, like native iOS sheets. Works from anywhere on the sheet while it's
 * scrolled to the top; otherwise the gesture scrolls the content as usual.
 */
function useSwipeDown(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let startY = 0, startT = 0, dy = 0, fromTop = false, dragging = false
    const reset = (animate: boolean) => {
      el.style.transition = animate ? 'transform .2s ease-out' : ''
      el.style.transform = ''
    }
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
      startT = e.timeStamp
      dy = 0
      fromTop = el.scrollTop <= 0
      dragging = false
    }
    const onMove = (e: TouchEvent) => {
      dy = e.touches[0].clientY - startY
      if (!fromTop || (dy <= 0 && !dragging)) return
      dragging = true
      e.preventDefault() // stop the page from scrolling/bouncing while the sheet follows the finger
      el.style.transition = 'none'
      el.style.transform = `translateY(${Math.max(0, dy)}px)`
    }
    const onEnd = (e: TouchEvent) => {
      if (!dragging) return
      dragging = false
      const fast = dy / Math.max(1, e.timeStamp - startT) > 0.5
      if (dy > 120 || (fast && dy > 40)) {
        el.style.transition = 'transform .2s ease-in'
        el.style.transform = 'translateY(100%)'
        setTimeout(() => close.current(), 180)
      } else reset(true)
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    const onCancel = () => { dragging = false; reset(true) }
    el.addEventListener('touchcancel', onCancel)
    return () => {
      el.removeEventListener('touchcancel', onCancel)
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
    }
  }, [])
  return ref
}
