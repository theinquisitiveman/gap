import { useState } from 'react'
import { playItem } from '../lib/audio'
import type { LiveItem } from '../lib/types'
import { useApp } from '../state'

export function SpeakerButton({ item, big, onMissing }: { item: LiveItem; big?: boolean; onMissing?: () => void }) {
  const { settings, canListen } = useApp()
  const [busy, setBusy] = useState(false)
  const available = canListen(item)
  return (
    <button
      type="button"
      aria-label={available ? `Play ${item.roman}` : `No Kabuli recording for ${item.roman} yet — record one`}
      onClick={async () => {
        if (!available) return onMissing?.()
        setBusy(true)
        try { await playItem(item, settings.ttsFallback) } catch (e) { console.error(e) } finally { setBusy(false) }
      }}
      className={`grid shrink-0 place-items-center rounded-2xl border-2 border-b-4 ${
        available ? 'border-sky-dark bg-sky text-white' : 'border-swan bg-polar text-hare'
      } ${big ? 'h-24 w-24 text-4xl' : 'h-11 w-11 text-xl'} ${busy ? 'opacity-70' : ''}`}
    >
      {available ? '🔊' : '🎙️'}
    </button>
  )
}

/** Romanized Dari (primary for heritage learners) with optional script underneath. */
export function DariText({ item, className = '' }: { item: LiveItem; className?: string }) {
  const { settings } = useApp()
  return (
    <span className={`inline-flex flex-col ${className}`}>
      <span>{item.roman}</span>
      {settings.showScript && <span className="dari text-[0.85em] font-semibold text-wolf">{item.dari}</span>}
    </span>
  )
}
