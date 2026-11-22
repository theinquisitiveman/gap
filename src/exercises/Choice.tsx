import { useEffect } from 'react'
import { DariText, SpeakerButton } from '../components/Phrase'
import { playItem } from '../lib/audio'
import type { Exercise } from '../lib/exercises'
import { useApp } from '../state'
import type { ExerciseProps } from './types'

export function Choice({ ex, value, setValue, locked }: ExerciseProps<Extract<Exercise, { kind: 'choice' }>>) {
  const { item, settings, t, meaning } = useApp()
  const target = item(ex.itemId)

  useEffect(() => {
    if (ex.mode === 'listen') playItem(target, settings.ttsFallback).catch(() => {})
  }, [ex, target, settings.ttsFallback])

  const title =
    ex.mode === 'listen' ? t('What did you hear?') : ex.mode === 'meaning' ? t('What does this mean?') : t('How do you say “{meaning}”?', { meaning: meaning(target) })

  return (
    <div className="flex flex-1 flex-col">
      {ex.isNew && <div className="mb-1 text-sm font-black uppercase text-beetle">{t('New phrase')}</div>}
      <h1 className="mb-6 text-2xl font-black">{title}</h1>
      {ex.mode !== 'dari' && (
        <div className="mb-8 flex items-center gap-4">
          <SpeakerButton item={target} big={ex.mode === 'listen'} />
          {ex.mode === 'meaning' && (
            <div className="rounded-2xl border-2 border-swan px-4 py-3 text-2xl font-extrabold">
              <DariText item={target} />
            </div>
          )}
        </div>
      )}
      <div className="grid gap-3">
        {ex.options.map((id) => {
          const opt = item(id)
          const selected = value === id
          return (
            <button
              key={id}
              type="button"
              disabled={locked}
              onClick={() => setValue(id)}
              className={`tile text-lg ${selected ? 'tile-selected' : ''}`}
            >
              {ex.mode === 'dari' ? <DariText item={opt} /> : meaning(opt)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
