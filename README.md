# Gap (گپ) — learn Kabuli Dari

A Duolingo-style, installable web app (PWA) for learning **conversational Dari as spoken in Kabul**.
Built for heritage/diaspora learners: speaking and listening first, romanized text with optional Dari script.

## Run it
```bash
npm install
npm run dev        # http://localhost:5173, also on your LAN (--host) for testing on an iPhone
npm test           # unit tests (answer checking, streaks, hearts, review queue, corrections)
npm run build      # validates content, type-checks, builds dist/ with the service worker
```
Deploy `dist/` to any static HTTPS host (Vercel, Netlify, Cloudflare Pages). On iPhone: open in Safari →
Share → **Add to Home Screen**. It runs full-screen and works offline.

## Content
All lessons live in `content/course.json`. Exercises are generated from each lesson's phrases, so editing a phrase
updates every exercise that uses it. `npm run check-content` validates the file.

Every phrase starts as `"status": "draft"`. Drafts were written from general knowledge of colloquial Kabuli
Dari and checked against the sources listed in the file. **They have not been verified by a native speaker yet.**

Romanization (plain ASCII, so people can type it): `aa` = long ā (*khaala*), `u` = ū/o (*khub*), `e` = ē/i
(*mera*), `kh gh sh ch zh q` as in English transliteration. Answer checking ignores accents, `aa`/`a`, `oo`/`u`,
hyphens and punctuation.

## The correction loop ("fix it and learn from it")
1. **In the app**, anyone can tap **🚩 Fix this phrase** after any exercise, or ✎ in the **Phrases** tab, to correct the
   romanization, script, meaning or notes, add accepted alternatives, and **record the real Kabuli pronunciation**.
   Fixes apply immediately in that person's lessons, and recordings replace the missing audio.
2. When a word-bank answer is marked wrong but is really fine, **✓ My answer is also correct** adds it as an
   accepted alternative.
3. **Me → Share my fixes** exports a `gap-corrections-*.json` file (with recordings) through the iOS share sheet.
4. The maintainer merges it for everyone:
   ```bash
   npm run apply-corrections -- ~/Downloads/gap-corrections-2026-11-20.json
   npm run check-content && git add content public/audio && git commit
   ```
   That updates `course.json`, writes audio to `public/audio/`, marks the items `reviewed` and credits the reviewer.
   Reviewers can also **import** each other's files in the app.

## Layout
```
content/course.json        units → lessons → phrases
src/lib/                   pure logic: content, exercises, progress (XP/streak/hearts/SRS), corrections, audio, db
src/screens/               Path, Lesson, Practice, Phrasebook, Profile
src/exercises/             Choice (meaning/listen/dari), WordBank, Match, Speak
src/components/            CorrectionSheet, Phrase, Mascot (Gudi the kite)
scripts/                   check-content, apply-corrections, make-icons
```
