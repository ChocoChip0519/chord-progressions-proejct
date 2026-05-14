export const NOTES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const
export const NOTES_FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'] as const

export interface IntervalDef {
  intervals: number[]
  quality: string
}

export const CHORD_INTERVALS: Record<string, number[]> = {
  '':      [0,4,7],
  'm':     [0,3,7],
  '7':     [0,4,7,10],
  'maj7':  [0,4,7,11],
  'm7':    [0,3,7,10],
  'dim':   [0,3,6],
  'dim7':  [0,3,6,9],
  'aug':   [0,4,8],
  'sus2':  [0,2,7],
  'sus4':  [0,5,7],
  '7sus4': [0,5,7,10],
  '9':     [0,4,7,10,14],
  'maj9':  [0,4,7,11,14],
  'm9':    [0,3,7,10,14],
  'add9':  [0,4,7,14],
  '6':     [0,4,7,9],
  'm6':    [0,3,7,9],
}

export interface ParsedChord {
  root: string
  quality: string
  name: string
  notes: number[]  // MIDI numbers (C4=60 based, kept within range)
}

export function noteIndex(name: string): number {
  let i = NOTES_SHARP.indexOf(name as typeof NOTES_SHARP[number])
  if (i < 0) i = NOTES_FLAT.indexOf(name as typeof NOTES_FLAT[number])
  return i
}

export function midiToName(midi: number): string {
  return NOTES_SHARP[midi % 12]
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function parseChord(chordName: string): ParsedChord | null {
  const m = chordName.match(/^([A-G][b#]?)(.*)/)
  if (!m) return null
  const root = m[1]
  const quality = m[2] ?? ''
  const rootIdx = noteIndex(root)
  if (rootIdx < 0) return null
  const intervals = CHORD_INTERVALS[quality] ?? CHORD_INTERVALS['']
  const rootMidi = 60 + rootIdx
  const notes = intervals.map(iv => {
    let n = rootMidi + iv
    while (n > 84) n -= 12
    return n
  })
  return { root, quality, name: chordName, notes }
}

/** Infer chord name from a set of MIDI notes */
export function inferChordName(midiNotes: number[]): string {
  if (midiNotes.length === 0) return ''
  const sorted = [...midiNotes].sort((a, b) => a - b)
  const rootMidi = sorted[0]
  const rootName = midiToName(rootMidi)
  const intervals = sorted.map(n => n - rootMidi).sort((a, b) => a - b)
  const ivStr = JSON.stringify(intervals)

  for (const [quality, ivs] of Object.entries(CHORD_INTERVALS)) {
    if (JSON.stringify(ivs) === ivStr) return rootName + quality
  }

  // partial match: just root + closest quality
  if (intervals.includes(3) && intervals.includes(7)) return rootName + 'm'
  if (intervals.includes(4) && intervals.includes(7)) return rootName
  if (intervals.length === 1) return rootName
  return rootName + '?'
}
