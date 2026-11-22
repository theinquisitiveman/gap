export type Status = 'draft' | 'reviewed'

export interface Item {
  id: string
  roman: string
  dari: string
  en: string
  notes?: string
  /** German meaning and notes, shown when the learner explains in German (falls back to English). */
  de?: string
  notesDe?: string
  /** Other romanizations/phrasings that count as correct. */
  alts?: string[]
  /** Bundled native recording, relative to the app base (e.g. "audio/salaam.m4a"). */
  audio?: string
  status: Status
}

export interface Lesson { id: string; title: string; titleDe?: string; items: LiveItem[] }
export interface Unit { id: string; title: string; titleDe?: string; titleDari: string; color: string; lessons: Lesson[] }
export interface Course { version: number; about: string; aboutDe?: string; sources: string[]; contributors?: string[]; units: Unit[] }

/** Item fields a reviewer can correct. */
export const EDITABLE_FIELDS = ['roman', 'dari', 'en', 'notes', 'de', 'notesDe'] as const
export type EditableField = (typeof EDITABLE_FIELDS)[number]

/** A user's fix to one item. Only changed fields are stored; the recording lives separately in IndexedDB. */
export interface Correction {
  itemId: string
  fields: Partial<Pick<Item, EditableField>>
  alts?: string[]
  hasAudio?: boolean
  by?: string
  updatedAt: number
  /** Tombstone: the user reset this item. Kept so the reset syncs to their other devices. */
  deleted?: boolean
}

export type Corrections = Record<string, Correction>

/** An item after the user's correction has been merged in. */
export interface LiveItem extends Item {
  corrected?: boolean
}
