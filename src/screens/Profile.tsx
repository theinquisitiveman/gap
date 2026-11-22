import { useRef, useState } from 'react'
import { Account } from '../components/Account'
import { allItems } from '../lib/content'
import { currentStreak } from '../lib/progress'
import { useApp } from '../state'

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true

export function Profile() {
  const { course, progress, settings, updateSettings, corrections, exportCorrections, importCorrections, lang, t } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const items = allItems(course)
  const reviewed = items.filter((i) => i.status === 'reviewed').length
  const fixCount = Object.keys(corrections).length

  async function share() {
    setMsg('')
    try {
      const file = await exportCorrections()
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t('DariLingo corrections') })
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(file)
        a.download = file.name
        a.click()
        setTimeout(() => URL.revokeObjectURL(a.href), 10_000)
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setMsg(t('Export failed: {error}', { error: (e as Error).message }))
    }
  }

  async function onImport(f: File | undefined) {
    if (!f) return
    try {
      const n = await importCorrections(await f.text())
      setMsg(t(n === 1 ? 'Imported {n} correction.' : 'Imported {n} corrections.', { n }))
    } catch (e) {
      setMsg(t('Import failed: {error}', { error: (e as Error).message }))
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6 px-4 pb-10 pt-2">
      <h1 className="text-2xl font-black">{t('Profile')}</h1>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat icon="🔥" value={currentStreak(progress, Date.now())} label={t('day streak')} />
        <Stat icon="⚡" value={progress.xp} label={t('total XP')} />
        <Stat icon="📗" value={Object.keys(progress.completed).length} label={t('lessons')} />
      </div>

      <Account />

      {!isStandalone() && (
        <Card title={t('Install on your iPhone')}>
          {t('In Safari, tap Share → Add to Home Screen. DariLingo then opens full-screen and works offline.')}
        </Card>
      )}

      <Card title={t('Settings')}>
        <div className="py-2">
          <span className="block font-extrabold text-eel" id="lang-label">{t('Explanations in')}</span>
          <span className="text-xs">{t('Meanings, notes and the app itself. German meanings are drafts until a reviewer checks them.')}</span>
          <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-labelledby="lang-label">
            {([['en', 'English'], ['de', 'Deutsch']] as const).map(([code, name]) => (
              <button key={code} type="button" lang={code} aria-pressed={lang === code} onClick={() => updateSettings({ lang: code })} className={`chip py-2 ${lang === code ? 'tile-selected' : ''}`}>
                {name}
              </button>
            ))}
          </div>
        </div>
        <Toggle label={t('Show Dari script')} hint={t('Romanized text always shows; script appears underneath.')} checked={settings.showScript} onChange={(v) => updateSettings({ showScript: v })} />
        <Toggle label={t('Persian voice fallback')} hint={t("Uses the phone's Iranian Persian voice when a phrase has no Kabuli recording. Accent will differ.")} checked={settings.ttsFallback} onChange={(v) => updateSettings({ ttsFallback: v })} />
      </Card>

      <Card title={t('Help teach real Kabuli Dari')}>
        <p className="mb-3">
          {t('{reviewed} of {total} phrases are reviewed by native speakers. You’ve fixed {fixes}.', { reviewed, total: items.length, fixes: fixCount })}{' '}
          {t('Your fixes are used in your lessons immediately; share them with the course maintainer so every learner gets them.')}
        </p>
        <div className="space-y-2">
          <button type="button" className="btn btn-sky" disabled={!fixCount} onClick={share}>{t('Share my fixes')}</button>
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>{t('Import fixes file')}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
        </div>
        {msg && <p role="status" className="mt-2 font-bold text-sky-dark">{msg}</p>}
      </Card>

      <Card title={t('About this course')}>
        <p className="mb-2">{(lang === 'de' && course.aboutDe) || course.about}</p>
        <ul className="list-disc space-y-1 pl-5 text-xs">
          {course.sources.map((s) => <li key={s} className="break-words">{s}</li>)}
        </ul>
      </Card>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="rounded-2xl border-2 border-swan p-3">
      <div className="text-xl font-black">{icon} {value}</div>
      <div className="text-xs font-bold text-hare">{label}</div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border-2 border-swan p-4 text-sm text-wolf">
      <h2 className="mb-2 text-base font-black text-eel">{title}</h2>
      {children}
    </section>
  )
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 py-2">
      <span className="flex-1">
        <span className="block font-extrabold text-eel">{label}</span>
        <span className="text-xs">{hint}</span>
      </span>
      <input type="checkbox" className="mt-1 h-6 w-6 accent-feather" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}
