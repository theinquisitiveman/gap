// Merge corrections exported from the app ("Share my fixes") into the course for everyone.
//   npm run apply-corrections -- path/to/gap-corrections-2026-11-20.json [more files...]
// Updates content/course.json, writes recordings to public/audio/, marks items reviewed.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { parseCorrectionsFile } from '../src/lib/corrections.ts'

const files = process.argv.slice(2)
if (!files.length) {
  console.error('usage: npm run apply-corrections -- <corrections.json> [...]')
  process.exit(1)
}

const coursePath = new URL('../content/course.json', import.meta.url)
const course = JSON.parse(readFileSync(coursePath, 'utf8'))
const byId = new Map(course.units.flatMap((u) => u.lessons.flatMap((l) => l.items)).map((i) => [i.id, i]))
const EXT = { 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac', 'audio/mpeg': 'mp3', 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/wav': 'wav' }
mkdirSync(new URL('../public/audio/', import.meta.url), { recursive: true })

// Apply oldest first so the newest edit of an item wins across files.
const all = files
  .flatMap((f) => parseCorrectionsFile(readFileSync(f, "utf8")).corrections)
  .sort((a, b) => a.updatedAt - b.updatedAt)

const contributors = new Set(course.contributors ?? [])
let applied = 0
for (const c of all) {
  const item = byId.get(c.itemId)
  if (!item) { console.warn(`skip unknown item ${c.itemId}`); continue }
  Object.assign(item, c.fields)
  if (c.alts?.length) item.alts = [...new Set([...(item.alts ?? []), ...c.alts])]
  if (c.audioDataUrl) {
    const [, mime, b64] = c.audioDataUrl.match(/^data:(audio\/[\w.+-]+)[^,]*;base64,(.*)$/s)
    const ext = EXT[mime] ?? 'm4a'
    const rel = `audio/${item.id}.${ext}`
    writeFileSync(new URL(`../public/${rel}`, import.meta.url), Buffer.from(b64, 'base64'))
    item.audio = rel
  }
  item.status = 'reviewed'
  if (c.by) contributors.add(c.by)
  applied++
  console.log(`✓ ${item.id}: ${item.roman}${c.audioDataUrl ? ' (+audio)' : ''}`)
}
if (contributors.size) course.contributors = [...contributors].sort()
writeFileSync(coursePath, JSON.stringify(course, null, 2) + '\n')
console.log(`Applied ${applied} correction(s). Run npm run check-content, then commit content/ and public/audio/.`)
