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

## Accounts & saved progress
Learners can use the app as a guest, with progress saved on the device. They can also create a free account from **Me**
or the banner on the Learn tab. Sign-in is passwordless: they enter their email and type the 6-digit code they're sent.
It's a code rather than a link because links open Safari, not the home-screen app. Guest progress carries into the new
account. Progress, settings, fixes and recordings then sync to every device they sign in on.

Backend: [Supabase](https://supabase.com) (Postgres + Auth + Storage). Everything is in `supabase/`:
- `migrations/…_user_state.sql`: one row per learner plus a private `recordings` bucket. **Row-level security** means
  each account can only read or write its own row and its own `<user id>/` folder, and signed-out visitors see nothing.
  The migration also sets size and type limits (512 KB of state, audio files only, under 2 MB each), and
  `delete_my_account()` lets learners delete their own account.
- `config.toml` + `templates/code.html`: email-code sign-in, codes expire after 10 minutes, at most one code per
  email per minute.

Signing out or deleting the account wipes the device. Production builds ship a Content Security Policy that only
allows scripts from the site itself and network calls to the Supabase project.

```bash
npx supabase start          # local Supabase in Docker (sign-in emails appear at http://127.0.0.1:54324)
npm run dev                 # uses .env.local → local Supabase
npm run test:security       # 27 checks: users can't read or change each other's data or recordings, etc.
```

### Going live
1. Create a project at supabase.com, then: `npx supabase login && npx supabase link --project-ref <ref>`
   then `npx supabase db push && npx supabase config push`.
2. **Email:** Supabase's built-in mailer only sends to your own team's addresses, so add custom SMTP (for example
   Resend) under Authentication → SMTP before real learners sign up.
3. In the GitHub repo, add variables `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (Project Settings → API), then
   re-run the deploy workflow.

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
