/** "Gudi" — a gudiparan (Afghan fighter kite), the app's mascot. */
export function Mascot({ size = 96, mood = 'happy' }: { size?: number; mood?: 'happy' | 'sad' | 'cheer' }) {
  const mouth =
    mood === 'sad' ? 'M42 64 q8 -6 16 0' : mood === 'cheer' ? 'M38 58 q12 14 24 0 z' : 'M40 60 q10 9 20 0'
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 100 130" aria-hidden>
      <path d="M50 4 L92 50 L50 100 L8 50 Z" fill="#58cc02" stroke="#58a700" strokeWidth="4" strokeLinejoin="round" />
      <path d="M50 4 L50 100 M8 50 L92 50" stroke="#58a700" strokeWidth="2" opacity=".5" />
      <path d="M50 4 L92 50 L50 50 Z" fill="#ffc800" opacity=".9" />
      <circle cx="38" cy="44" r="6" fill="#fff" /><circle cx="62" cy="44" r="6" fill="#fff" />
      <circle cx="39" cy="45" r="3" fill="#4b4b4b" /><circle cx="63" cy="45" r="3" fill="#4b4b4b" />
      <path d={mouth} fill={mood === 'cheer' ? '#ea2b2b' : 'none'} stroke="#4b4b4b" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 100 q-10 8 0 14 q10 6 0 14" fill="none" stroke="#ff4b4b" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 108 l12 0 M44 120 l12 0" stroke="#1cb0f6" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
