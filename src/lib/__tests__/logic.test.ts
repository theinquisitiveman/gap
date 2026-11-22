import { describe, expect, it } from 'vitest'
import course from '../../../content/course.json'
import { allItems, applyCorrections, meaningOf, notesOf, validateCourse } from '../content'
import { translate } from '../i18n'
import { mergeCorrections, parseCorrectionsFile } from '../corrections'
import { buildLesson, isAcceptedSentence, pickOptions } from '../exercises'
import { normalizeRoman } from '../normalize'
import { completeLesson, currentStreak, emptyProgress, HEART_REFILL_MS, heartsNow, loseHeart, recordAnswer, reviewQueue } from '../progress'
import type { Course, LiveItem } from '../types'

const C = course as Course
const items = allItems(C)
const seq = (vals: number[]) => { let i = 0; return () => vals[i++ % vals.length] }

describe('content', () => {
  it('bundled course is valid', () => expect(validateCourse(C)).toEqual([]))
})

describe('normalizeRoman', () => {
  it('treats common spelling variants as equal', () => {
    expect(normalizeRoman('Khūb astum.')).toBe(normalizeRoman('khub astum'))
    expect(normalizeRoman('aamadum')).toBe(normalizeRoman('amadum'))
    expect(normalizeRoman('chai-e sabz')).toBe(normalizeRoman('chai e sabz'))
    expect(normalizeRoman('khoob')).toBe('khub')
  })
})

describe('exercises', () => {
  const thanks: LiveItem = { id: 'a', roman: 'tashakur', dari: 'x', en: 'thank you', status: 'draft' }
  const dupe: LiveItem = { id: 'b', roman: 'mamnun', dari: 'x', en: 'Thank you', status: 'draft' }
  const pool = [thanks, dupe, ...items.slice(0, 10)]

  it('never offers a distractor with the same meaning as the answer', () => {
    for (let r = 0; r < 20; r++) {
      const opts = pickOptions(thanks, pool, 4)
      expect(opts).toContain('a')
      expect(opts).not.toContain('b')
      expect(new Set(opts).size).toBe(4)
    }
  })

  it('builds a lesson covering every item, with a match and a speak exercise', () => {
    const lesson = C.units[0].lessons[1].items
    const ex = buildLesson(lesson, C.units[0].lessons.flatMap((l) => l.items), { canListen: () => false, rng: seq([0.3, 0.7, 0.1]) })
    for (const it of lesson) expect(ex.some((e) => e.kind !== 'match' && e.itemId === it.id)).toBe(true)
    expect(ex.filter((e) => e.kind === 'match')).toHaveLength(1)
    expect(ex.at(-1)?.kind).toBe('speak')
    expect(ex.some((e) => e.kind === 'choice' && e.mode === 'listen')).toBe(false) // no audio -> no listening
    const wb = ex.find((e) => e.kind === 'wordbank')
    expect(wb?.kind).toBe('wordbank')
    if (wb?.kind === 'wordbank') {
      const answer = lesson.find((i) => i.id === wb.itemId)!.roman.replace('?', '').split(' ')
      for (const w of answer) expect(wb.tiles).toContain(w)
      expect(wb.tiles.length).toBe(answer.length + 2)
    }
  })

  it('accepts alternatives added by corrections', () => {
    const it0 = items.find((i) => i.id === 'chetor-asti')!
    expect(isAcceptedSentence('chetor asti', it0)).toBe(true)
    expect(isAcceptedSentence('chi tor asti', it0)).toBe(false)
    const fixed = applyCorrections(C, { 'chetor-asti': { itemId: 'chetor-asti', fields: {}, alts: ['chi tor asti'], updatedAt: 1 } })
    expect(isAcceptedSentence('chi tor asti', allItems(fixed).find((i) => i.id === 'chetor-asti')!)).toBe(true)
  })
})

describe('corrections', () => {
  it('override fields everywhere and mark the item corrected', () => {
    const fixed = applyCorrections(C, { ne: { itemId: 'ne', fields: { roman: 'nai' }, updatedAt: 1 } })
    const it0 = allItems(fixed).find((i) => i.id === 'ne')!
    expect(it0.roman).toBe('nai')
    expect(it0.dari).toBe('نی')
    expect(it0.corrected).toBe(true)
  })

  it('import keeps the newer edit and drops unknown items', () => {
    const local = { ne: { itemId: 'ne', fields: { roman: 'nay' }, updatedAt: 5 } }
    const merged = mergeCorrections(local, [
      { itemId: 'ne', fields: { roman: 'old' }, updatedAt: 1 },
      { itemId: 'bale', fields: { roman: 'bali' }, updatedAt: 2 },
      { itemId: 'nope', fields: {}, updatedAt: 9 },
    ], new Set(['ne', 'bale']))
    expect(merged.ne.fields.roman).toBe('nay')
    expect(merged.bale.fields.roman).toBe('bali')
    expect(merged.nope).toBeUndefined()
  })

  it('rejects malformed files', () => {
    expect(() => parseCorrectionsFile('{}')).toThrow()
    const bad = { format: 'gap-corrections', version: 1, exportedAt: '', corrections: [{ itemId: 'ne', fields: { evil: 'x' }, updatedAt: 1 }] }
    expect(() => parseCorrectionsFile(JSON.stringify(bad))).toThrow()
    const badAudio = { ...bad, corrections: [{ itemId: 'ne', fields: {}, updatedAt: 1, audioDataUrl: 'javascript:alert(1)' }] }
    expect(() => parseCorrectionsFile(JSON.stringify(badAudio))).toThrow()
  })
})

describe('progress', () => {
  const day = (d: number, h = 12) => new Date(2026, 10, d, h).getTime()

  it('streak grows on consecutive days, holds same day, resets after a gap', () => {
    let p = completeLesson(emptyProgress(), 'l1', 10, day(1))
    p = completeLesson(p, 'l2', 10, day(1, 20))
    expect(p.streak.count).toBe(1)
    p = completeLesson(p, 'l3', 10, day(2, 1))
    expect(p.streak.count).toBe(2)
    expect(currentStreak(p, day(3))).toBe(2)
    expect(currentStreak(p, day(4))).toBe(0)
    p = completeLesson(p, 'l4', 10, day(5))
    expect(p.streak.count).toBe(1)
    expect(p.xp).toBe(40)
    expect(p.daily.xp).toBe(10)
  })

  it('hearts drop and refill over time', () => {
    const t = day(1)
    let p = emptyProgress(t)
    p = loseHeart(loseHeart(p, t), t)
    expect(heartsNow(p, t).count).toBe(3)
    expect(heartsNow(p, t + HEART_REFILL_MS).count).toBe(4)
    expect(heartsNow(p, t + 10 * HEART_REFILL_MS).count).toBe(5)
    for (let i = 0; i < 9; i++) p = loseHeart(p, t)
    expect(heartsNow(p, t).count).toBe(0)
  })

  it('review queue puts overdue and weak items first', () => {
    const t = day(1)
    let p = emptyProgress(t)
    p = recordAnswer(recordAnswer(recordAnswer(p, 'a', true, t), 'a', true, t), 'a', true, t) // strong, not due
    p = recordAnswer(p, 'b', false, t - 3 * 86_400_000) // weak, overdue
    p = recordAnswer(p, 'c', true, t)
    expect(reviewQueue(p, ['a', 'b', 'c', 'unseen'], t)).toEqual(['b', 'c', 'a'])
  })
})

describe('German explanations', () => {
  it('every bundled phrase, lesson and unit has a German draft', () => {
    expect(items.filter((i) => !i.de?.trim()).map((i) => i.id)).toEqual([])
    expect(items.filter((i) => i.notes && !i.notesDe).map((i) => i.id)).toEqual([])
    expect(C.units.flatMap((u) => [u, ...u.lessons]).filter((x) => !x.titleDe).map((x) => x.id)).toEqual([])
  })

  it('falls back to English where no German exists', () => {
    const it0: LiveItem = { id: 'x', roman: 'r', dari: 'd', en: 'hello', notes: 'n', status: 'draft' }
    expect(meaningOf(it0, 'de')).toBe('hello')
    expect(notesOf(it0, 'de')).toBe('n')
    expect(meaningOf({ ...it0, de: 'hallo' }, 'de')).toBe('hallo')
    expect(meaningOf({ ...it0, de: 'hallo' }, 'en')).toBe('hello')
  })

  it('distractors never share the German meaning with the answer', () => {
    const a: LiveItem = { id: 'a', roman: 'tashakur', dari: 'x', en: 'thanks', de: 'danke', status: 'draft' }
    const b: LiveItem = { id: 'b', roman: 'mamnun', dari: 'x', en: 'thank you', de: 'Danke', status: 'draft' }
    for (let s = 0; s < 20; s++) {
      const opts = pickOptions(a, [a, b, ...items.slice(0, 10)], 4, seq([s / 20, 0.3, 0.7]), (i) => meaningOf(i, 'de'))
      expect(opts).not.toContain('b')
    }
  })

  it('a German fix keeps an earlier English fix and survives export/import', () => {
    const id = items[0].id
    const file = JSON.stringify({ format: 'gap-corrections', version: 1, exportedAt: '', corrections: [
      { itemId: id, fields: { en: 'hi there', de: 'servus', notesDe: 'locker' }, updatedAt: 5 },
    ] })
    const merged = mergeCorrections({}, parseCorrectionsFile(file).corrections, new Set([id]))
    const live = allItems(applyCorrections(C, merged))[0]
    expect([live.en, live.de, live.notesDe]).toEqual(['hi there', 'servus', 'locker'])
  })

  it('UI text translates with placeholders and falls back to English', () => {
    expect(translate('de', 'Unit {n}', { n: 3 })).toBe('Einheit 3')
    expect(translate('en', 'Unit {n}', { n: 3 })).toBe('Unit 3')
    expect(translate('de', 'Not in the dictionary')).toBe('Not in the dictionary')
  })
})
