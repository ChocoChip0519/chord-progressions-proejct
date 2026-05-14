import { noteIndex, midiToName, NOTES_SHARP, parseChord } from './chordParser'
import type { ParsedChord } from './chordParser'

export type Genre = 'pop' | 'rnb' | 'ballad' | 'rock'
export type Mode = 'major' | 'minor'

const MAJOR_SCALE = [0,2,4,5,7,9,11]
const MINOR_SCALE = [0,2,3,5,7,8,10]

// degree → scale index
const DEGREE_IDX: Record<Mode, Record<string, number>> = {
  major: { I:0, ii:1, iii:2, IV:3, V:4, vi:5, 'vii°':6 },
  minor: { i:0, 'ii°':1, III:2, iv:3, v:4, VI:5, VII:6, V:4 },
}

// degree → chord quality
const DEGREE_QUALITY: Record<Mode, Record<string, string>> = {
  major: { I:'', ii:'m', iii:'m', IV:'', V:'', vi:'m', 'vii°':'dim' },
  minor: { i:'m', 'ii°':'dim', III:'', iv:'m', v:'m', VI:'', VII:'', V:'' },
}

// For R&B / complex degrees (Imaj7, iii7, etc.)
const RNB_DEGREE_MAP: Record<string, { scaleIdx: number; quality: string }> = {
  'Imaj7':  { scaleIdx: 0, quality: 'maj7' },
  'IVmaj7': { scaleIdx: 3, quality: 'maj7' },
  'iii7':   { scaleIdx: 2, quality: 'm7'   },
  'vi7':    { scaleIdx: 5, quality: 'm7'   },
  'V7':     { scaleIdx: 4, quality: '7'    },
  'V7sus4': { scaleIdx: 4, quality: '7sus4'},
  'ii7':    { scaleIdx: 1, quality: 'm7'   },
  'IV7':    { scaleIdx: 3, quality: '7'    },
  'I7':     { scaleIdx: 0, quality: '7'    },
  'i7':     { scaleIdx: 0, quality: 'm7'   },
  'iv7':    { scaleIdx: 3, quality: 'm7'   },
  'VII':    { scaleIdx: 6, quality: ''     },
  'VI':     { scaleIdx: 5, quality: ''     },
  'III':    { scaleIdx: 2, quality: ''     },
  'bVII':   { scaleIdx: -1, quality: ''   },  // flat-7: special case
}

export function degreeToChord(degree: string, tonicMidi: number, mode: Mode): string | null {
  // R&B complex degree?
  if (RNB_DEGREE_MAP[degree]) {
    const { scaleIdx, quality } = RNB_DEGREE_MAP[degree]
    const scale = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE
    let semitone: number
    if (scaleIdx === -1) {
      // bVII: 10 semitones above tonic (♭7 scale degree)
      semitone = 10
    } else {
      semitone = scale[scaleIdx] ?? scale[0]
    }
    const rootMidi = ((tonicMidi - 60 + semitone + 12) % 12) + 60
    const rootName = NOTES_SHARP[rootMidi % 12]
    return rootName + quality
  }

  const idxMap = DEGREE_IDX[mode]
  const qualMap = DEGREE_QUALITY[mode]
  const idx = idxMap[degree]
  if (idx === undefined) return null
  const scale = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE
  const semitone = scale[idx]
  const rootMidi = ((tonicMidi - 60 + semitone + 12) % 12) + 60
  const rootName = NOTES_SHARP[rootMidi % 12]
  const quality = qualMap[degree] ?? ''
  return rootName + quality
}

export function chordToDegree(chordName: string, tonicMidi: number, mode: Mode): string | null {
  const parsed: ParsedChord | null = parseChord(chordName)
  if (!parsed) return null
  const rootOffset = (noteIndex(parsed.root) - (tonicMidi % 12) + 12) % 12
  const scale = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE
  const idx = scale.indexOf(rootOffset)
  if (idx < 0) return null
  const idxMap = DEGREE_IDX[mode]
  if (mode === 'minor' && idx === 4) {
    const isMinorQuality = parsed.quality.startsWith('m') || parsed.quality === 'dim'
    return isMinorQuality ? 'v' : 'V'
  }
  return Object.keys(idxMap).find(d => idxMap[d] === idx) ?? null
}

export function detectMode(chordName: string): { mode: Mode; tonicMidi: number } {
  const parsed = parseChord(chordName)
  if (!parsed) return { mode: 'major', tonicMidi: 60 }
  const isMinor = parsed.quality.startsWith('m') || parsed.quality === 'dim'
  const mode: Mode = isMinor ? 'minor' : 'major'
  const tonicMidi = 60 + noteIndex(parsed.root)
  return { mode, tonicMidi }
}

/**
 * 코드 이름 배열을 받아 가장 잘 맞는 key(tonic + mode)를 추정한다.
 * 각 후보 key에서 코드들이 몇 개나 diatonic한지 점수를 매겨 최고점 반환.
 */
export function inferKey(chordNames: string[]): { mode: Mode; tonicMidi: number } {
  const parsed = chordNames.map(parseChord).filter(Boolean) as ParsedChord[]
  if (parsed.length === 0) return { mode: 'major', tonicMidi: 60 }

  let bestScore = -1
  let bestTonic = 0
  let bestMode: Mode = 'major'

  for (let tonic = 0; tonic < 12; tonic++) {
    for (const mode of ['major', 'minor'] as Mode[]) {
      const scale = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE
      const scaleNotes = scale.map(s => (tonic + s) % 12)
      let score = 0
      for (const p of parsed) {
        const rootOffset = noteIndex(p.root) % 12
        if (scaleNotes.includes(rootOffset)) {
          // root가 스케일에 있으면 기본 점수
          const idx = scaleNotes.indexOf(rootOffset)
          score += 2
          // quality가 해당 도수의 diatonic quality와 맞으면 추가 점수
          const expectedQuality = DEGREE_QUALITY[mode][Object.keys(DEGREE_IDX[mode])[idx]] ?? ''
          const actualIsMinor = p.quality.startsWith('m') || p.quality === 'dim'
          const expectedIsMinor = expectedQuality.startsWith('m') || expectedQuality === 'dim'
          if (actualIsMinor === expectedIsMinor) score += 1
        }
      }
      if (score > bestScore) {
        bestScore = score
        bestTonic = tonic
        bestMode = mode
      }
    }
  }

  return { mode: bestMode, tonicMidi: 60 + bestTonic }
}

/** All degree variants for a base degree (includes 7th, maj7, sus4, etc.) */
export function degreeVariants(degree: string, tonicMidi: number, mode: Mode): string[] {
  const base = degreeToChord(degree, tonicMidi, mode)
  if (!base) return []
  const parsed = parseChord(base)
  if (!parsed) return [base]
  const r = parsed.root
  const isMinorQuality = parsed.quality.startsWith('m') || parsed.quality === 'dim'

  if (!isMinorQuality) {
    const base = parsed.quality === '' ? r : r + parsed.quality
    const extras = [r+'maj7', r+'7', r+'sus4', r+'add9'].filter(v => v !== base)
    return [base, ...extras]
  } else {
    const base = r + (parsed.quality === 'm' ? 'm' : parsed.quality)
    return [base, r+'m7', r+'m9', r+'7'].filter((v, i, arr) => arr.indexOf(v) === i)
  }
}
