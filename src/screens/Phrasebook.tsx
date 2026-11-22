import { useState } from 'react'
import { CorrectionSheet } from '../components/CorrectionSheet'
import { SpeakerButton } from '../components/Phrase'
import { normalizeRoman } from '../lib/normalize'
import { useApp } from '../state'

/** Every phrase in the course — the native speaker's review workspace. */
export function Phrasebook() {
  const { course, corrections, recordings, canListen, t, meaning, notes, title } = useApp()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'todo' | 'mine'>('all')
  const [fixing, setFixing] = useState<string | null>(null)
  const nq = normalizeRoman(q)

  return (
    <div className="px-4 pb-8 pt-2">
      <h1 className="text-2xl font-black">{t('Phrasebook')}</h1>
      <p className="mb-3 text-sm text-wolf">{t('Tap 🔊 to listen. Tap Fix to correct a phrase, or Record to add how it’s really said in Kabul.')}</p>
      <input className="field mb-2" placeholder={t('Search Dari or English')} value={q} onChange={(e) => setQ(e.target.value)} autoCapitalize="off" />
      <div className="mb-4 flex gap-2 text-sm">
        {(['all', 'todo', 'mine'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`chip py-1 ${filter === f ? 'tile-selected' : ''}`}>
            {t(f === 'all' ? 'All' : f === 'todo' ? 'Needs review' : 'My fixes')}
          </button>
        ))}
      </div>
      {course.units.map((u) => {
        const items = u.lessons.flatMap((l) => l.items).filter((i) => {
          if (filter === 'todo' && (i.status === 'reviewed' || i.corrected)) return false
          if (filter === 'mine' && !corrections[i.id]) return false
          if (!nq) return true
          return [i.roman, i.en, meaning(i), ...(i.alts ?? [])].some((s) => normalizeRoman(s).includes(nq)) || i.dari.includes(q.trim())
        })
        if (!items.length) return null
        return (
          <section key={u.id} className="mb-5">
            <h2 className="mb-2 text-sm font-black uppercase text-hare">{title(u)}</h2>
            <ul className="space-y-2">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 rounded-2xl border-2 border-swan p-3">
                  <SpeakerButton item={i} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-extrabold">{i.roman}</span>
                      <span className="dari font-semibold text-wolf">{i.dari}</span>
                    </div>
                    <div className="text-sm text-wolf">{meaning(i)}</div>
                    {notes(i) && <div className="text-xs text-hare">{notes(i)}</div>}
                    <div className="mt-1 flex gap-1 text-[10px] font-black uppercase">
                      {corrections[i.id] ? (
                        <span className="rounded bg-fox/15 px-1.5 py-0.5 text-fox">{t('Your fix')}</span>
                      ) : i.status === 'reviewed' ? (
                        <span className="rounded bg-feather/15 px-1.5 py-0.5 text-feather-dark">{t('Reviewed')}</span>
                      ) : (
                        <span className="rounded bg-swan px-1.5 py-0.5 text-wolf">{t('Draft')}</span>
                      )}
                      {(recordings.has(i.id) || i.audio) && <span className="rounded bg-sky/15 px-1.5 py-0.5 text-sky-dark">{t('Audio')}</span>}
                    </div>
                  </div>
                  <button type="button" aria-label={t('Fix or record {roman}', { roman: i.roman })} className="chip shrink-0 px-2.5 py-1.5 text-xs uppercase text-sky-dark" onClick={() => setFixing(i.id)}>
                    {t(canListen(i) ? '✏️ Fix' : '🎙️ Record')}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
      {fixing && <CorrectionSheet itemId={fixing} onClose={() => setFixing(null)} />}
    </div>
  )
}
