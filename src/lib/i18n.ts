import type { Lang } from './content'

/**
 * The app's own text in German, keyed by the English source. A string missing here shows in English,
 * so adding UI never breaks the German build. `{name}` placeholders are filled from `vars`.
 */
const DE: Record<string, string> = {
  // Navigation & header
  Learn: 'Lernen',
  Practice: 'Üben',
  Phrases: 'Sätze',
  Me: 'Ich',
  Main: 'Hauptmenü',
  'day streak': 'Tage in Folge',
  hearts: 'Herzen',
  'Create a free account to save your progress →': 'Erstelle ein kostenloses Konto, um deinen Fortschritt zu sichern →',

  // Path
  'Unit {n}': 'Einheit {n}',
  Start: 'Start',
  ', completed': ', abgeschlossen',
  ', locked': ', gesperrt',
  'More units coming — help by fixing phrases in the Phrasebook!': 'Weitere Einheiten folgen – hilf mit, indem du Sätze im Sprachführer korrigierst!',

  // Lesson
  "You're out of hearts": 'Keine Herzen mehr',
  "Hearts refill over time — one every 30 minutes. Practice doesn't cost hearts.":
    'Herzen füllen sich mit der Zeit wieder auf – eins alle 30 Minuten. Üben kostet keine Herzen.',
  Back: 'Zurück',
  'Practice complete!': 'Übung geschafft!',
  'Lesson complete!': 'Lektion geschafft!',
  Mistakes: 'Fehler',
  'well done!': 'gut gemacht!',
  Continue: 'Weiter',
  Check: 'Prüfen',
  'Quit lesson': 'Lektion beenden',
  'Quit this lesson? Progress in it will be lost.': 'Lektion beenden? Der Fortschritt in dieser Lektion geht verloren.',
  'Thanks — accepted from now on!': 'Danke – ab jetzt wird das akzeptiert!',
  'Correct answer:': 'Richtige Antwort:',
  '✏️ Fix or record this phrase': '✏️ Satz korrigieren oder aufnehmen',
  '✓ My answer is also correct': '✓ Meine Antwort ist auch richtig',

  // Exercises
  'What did you hear?': 'Was hast du gehört?',
  'What does this mean?': 'Was bedeutet das?',
  'How do you say “{meaning}”?': 'Wie sagt man „{meaning}“?',
  'New phrase': 'Neuer Satz',
  'Tap the matching pairs': 'Tippe die passenden Paare an',
  'Say this in Dari': 'Sag das auf Dari',
  'Your answer': 'Deine Antwort',
  'Word bank': 'Wortauswahl',
  'Say it out loud': 'Sag es laut',
  '■ Tap to stop': '■ Zum Stoppen tippen',
  '🎙️ Try again': '🎙️ Noch einmal',
  '🎙️ Tap to speak': '🎙️ Zum Sprechen tippen',
  '▶︎ Hear yourself': '▶︎ Dich selbst anhören',
  "Can't speak now": 'Kann gerade nicht sprechen',
  'Microphone unavailable — you can skip this one.': 'Mikrofon nicht verfügbar – du kannst diese Übung überspringen.',

  // Phrase / audio
  'Play {roman}': '{roman} abspielen',
  'No audio for {roman} yet': 'Noch keine Aufnahme für {roman}',
  Listen: 'Anhören',
  'No audio yet': 'Noch keine Aufnahme',

  // Practice
  '{n} phrase ready for review.': '{n} Satz ist bereit zur Wiederholung.',
  '{n} phrases ready for review.': '{n} Sätze sind bereit zur Wiederholung.',
  'Keep your phrases fresh.': 'Halte deine Sätze frisch.',
  'Practice never costs hearts.': 'Üben kostet nie Herzen.',
  'Start practice': 'Übung starten',
  "Finish a lesson or two first — phrases you've learned show up here for review.":
    'Schließe zuerst ein, zwei Lektionen ab – gelernte Sätze erscheinen hier zur Wiederholung.',

  // Phrasebook
  Phrasebook: 'Sprachführer',
  'Tap 🔊 to listen. Tap Fix to correct a phrase, or Record to add how it’s really said in Kabul.':
    'Tippe auf 🔊 zum Anhören. Tippe auf Korrigieren, um einen Satz zu verbessern, oder auf Aufnehmen, um zu zeigen, wie man ihn in Kabul wirklich sagt.',
  'Search Dari or English': 'Dari oder Deutsch suchen',
  All: 'Alle',
  'Needs review': 'Ungeprüft',
  'My fixes': 'Meine Korrekturen',
  'Your fix': 'Deine Korrektur',
  Reviewed: 'Geprüft',
  Draft: 'Entwurf',
  Audio: 'Audio',
  'Fix or record {roman}': '{roman} korrigieren oder aufnehmen',
  '✏️ Fix': '✏️ Korrigieren',
  '🎙️ Record': '🎙️ Aufnehmen',

  // Profile
  Profile: 'Profil',
  'total XP': 'XP gesamt',
  lessons: 'Lektionen',
  'Install on your iPhone': 'Auf dem iPhone installieren',
  'In Safari, tap Share → Add to Home Screen. DariLingo then opens full-screen and works offline.':
    'Tippe in Safari auf Teilen → Zum Home-Bildschirm. DariLingo öffnet sich dann im Vollbild und funktioniert offline.',
  Settings: 'Einstellungen',
  'Explanations in': 'Erklärungen auf',
  'Meanings, notes and the app itself. German meanings are drafts until a reviewer checks them.':
    'Bedeutungen, Hinweise und die App selbst. Die deutschen Bedeutungen sind Entwürfe, bis sie geprüft wurden.',
  'Show Dari script': 'Dari-Schrift anzeigen',
  'Romanized text always shows; script appears underneath.': 'Die Umschrift wird immer angezeigt; die Schrift erscheint darunter.',
  'Persian voice fallback': 'Persische Ersatzstimme',
  "Uses the phone's Iranian Persian voice when a phrase has no Kabuli recording. Accent will differ.":
    'Nutzt die iranisch-persische Stimme des Handys, wenn es keine Kabuler Aufnahme gibt. Der Akzent ist anders.',
  'Help teach real Kabuli Dari': 'Hilf mit, echtes Kabuler Dari zu lehren',
  '{reviewed} of {total} phrases are reviewed by native speakers. You’ve fixed {fixes}.':
    '{reviewed} von {total} Sätzen wurden von Muttersprachlern geprüft. Du hast {fixes} korrigiert.',
  'Your fixes are used in your lessons immediately; share them with the course maintainer so every learner gets them.':
    'Deine Korrekturen gelten sofort in deinen Lektionen; teile sie mit der Kursbetreuung, damit alle Lernenden sie bekommen.',
  'Share my fixes': 'Meine Korrekturen teilen',
  'Import fixes file': 'Korrekturdatei importieren',
  'DariLingo corrections': 'DariLingo-Korrekturen',
  'Export failed: {error}': 'Export fehlgeschlagen: {error}',
  'Imported {n} correction.': '{n} Korrektur importiert.',
  'Imported {n} corrections.': '{n} Korrekturen importiert.',
  'Import failed: {error}': 'Import fehlgeschlagen: {error}',
  'About this course': 'Über diesen Kurs',

  // Account
  'Saving…': 'Wird gespeichert…',
  '✓ Progress saved to your account': '✓ Fortschritt in deinem Konto gespeichert',
  'Offline — will save when you reconnect': 'Offline – wird gespeichert, sobald du wieder online bist',
  "Couldn't save right now — will retry": 'Speichern gerade nicht möglich – wird erneut versucht',
  'Something went wrong': 'Etwas ist schiefgelaufen',
  'Your account': 'Dein Konto',
  'Sign out': 'Abmelden',
  'Delete your account and all saved progress and recordings? This cannot be undone.':
    'Dein Konto mit allem gespeicherten Fortschritt und allen Aufnahmen löschen? Das kann nicht rückgängig gemacht werden.',
  'Delete account': 'Konto löschen',
  'Save your progress': 'Fortschritt sichern',
  'Create a free account to keep your streak, XP and recordings safe and use them on any device. No password needed.':
    'Erstelle ein kostenloses Konto, um Serie, XP und Aufnahmen zu sichern und auf jedem Gerät zu nutzen. Kein Passwort nötig.',
  Email: 'E-Mail',
  'Sending…': 'Wird gesendet…',
  'Email me a code': 'Code per E-Mail senden',
  '6-digit code sent to {email}': '6-stelliger Code gesendet an {email}',
  'Checking…': 'Wird geprüft…',
  'Sign in': 'Anmelden',
  'Use a different email': 'Andere E-Mail verwenden',

  // Correction sheet
  'Fix this phrase': 'Satz korrigieren',
  'Speak Kabuli Dari? Correct anything that sounds wrong. Your fix is used in every lesson right away.':
    'Du sprichst Kabuler Dari? Korrigiere alles, was falsch klingt. Deine Korrektur gilt sofort in jeder Lektion.',
  'Microphone unavailable. Allow microphone access for this site in Settings › Safari.':
    'Mikrofon nicht verfügbar. Erlaube den Mikrofonzugriff für diese Seite unter Einstellungen › Safari.',
  "Couldn't save: {error}": 'Speichern fehlgeschlagen: {error}',
  'was: {value}': 'vorher: {value}',
  Romanized: 'Umschrift',
  'Dari script': 'Dari-Schrift',
  'English meaning': 'Englische Bedeutung',
  'German meaning': 'Deutsche Bedeutung',
  'Notes (Kabuli vs formal, usage)': 'Hinweise (Kabul vs. Hochsprache, Gebrauch)',
  'Also accept (one per line)': 'Ebenfalls akzeptieren (eine pro Zeile)',
  'Kabuli pronunciation': 'Kabuler Aussprache',
  '■ Stop': '■ Stopp',
  '🎙️ Re-record': '🎙️ Neu aufnehmen',
  'Delete recording': 'Aufnahme löschen',
  '● Recording… say the phrase once, clearly.': '● Aufnahme läuft… sag den Satz einmal deutlich.',
  'Your name (optional, credited in the course)': 'Dein Name (optional, wird im Kurs genannt)',
  'Save fix': 'Korrektur speichern',
  'Reset to original': 'Auf Original zurücksetzen',
  Cancel: 'Abbrechen',
  'e.g. {example}': 'z. B. {example}',
}

export function translate(lang: Lang, text: string, vars: Record<string, string | number> = {}): string {
  const s = (lang === 'de' && DE[text]) || text
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m))
}

export type T = (text: string, vars?: Record<string, string | number>) => string
