/**
 * Loose comparison for romanized Dari: learners (and sources) spell the same
 * word many ways — khub/khoob/khūb, aamadum/amadum, chai-e sabz/chai sabz.
 */
export function normalizeRoman(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip macrons/accents
    .replace(/[-_'’`]/g, ' ')
    .replace(/[?!.,،؟;:"]/g, '')
    .replace(/oo/g, 'u')
    .replace(/ee/g, 'i')
    .replace(/aa/g, 'a')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokenize(s: string): string[] {
  return s.replace(/[?!.,،؟;:"]/g, '').split(/\s+/).filter(Boolean)
}
