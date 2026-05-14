import { useState, useCallback } from 'react'
import { midiToName } from '../../lib/music/chordParser'
import { usePiano } from '../../hooks/usePiano'

// 1 octave: C4~B4
const MINI_WHITE = [60,62,64,65,67,69,71]
const MINI_BLACK: { midi: number; afterWhite: number }[] = [
  { midi: 61, afterWhite: 0 },
  { midi: 63, afterWhite: 1 },
  { midi: 66, afterWhite: 3 },
  { midi: 68, afterWhite: 4 },
  { midi: 70, afterWhite: 5 },
]
const TOTAL_WHITE = MINI_WHITE.length
const WHITE_W = 100 / TOTAL_WHITE

interface Props {
  highlightMidi: number[]   // notes to show blue
}

export default function MiniPiano({ highlightMidi }: Props) {
  const { pressNote, releaseNote } = usePiano()
  const [localPressed, setLocalPressed] = useState<Set<number>>(new Set())
  const hiSet = new Set(highlightMidi.map(m => m % 12))

  const press = useCallback((midi: number) => {
    setLocalPressed(p => new Set(p).add(midi))
    pressNote(midi)
  }, [pressNote])

  const release = useCallback((midi: number) => {
    setLocalPressed(p => { const n = new Set(p); n.delete(midi); return n })
    releaseNote(midi)
  }, [releaseNote])

  return (
    <div className="mini-piano-wrap">
      {MINI_WHITE.map((midi, i) => {
        const m12 = midi % 12
        const isHi = hiSet.has(m12)
        const isPressed = localPressed.has(midi)
        let cls = 'mini-white'
        if (isPressed) cls += ' pressed'
        else if (isHi) cls += ' hi'
        return (
          <div
            key={midi}
            className={cls}
            onMouseDown={e => { e.stopPropagation(); press(midi) }}
            onMouseUp={() => release(midi)}
            onMouseLeave={() => release(midi)}
          >
            <span className="mini-note">{midiToName(midi)}</span>
          </div>
        )
      })}
      {MINI_BLACK.map(bd => {
        const isHi = hiSet.has(bd.midi % 12)
        const isPressed = localPressed.has(bd.midi)
        let cls = 'mini-black'
        if (isPressed) cls += ' pressed'
        else if (isHi) cls += ' hi'
        return (
          <div
            key={bd.midi}
            className={cls}
            style={{ left: `${(bd.afterWhite + 1) * WHITE_W - 5.5}%` }}
            onMouseDown={e => { e.stopPropagation(); press(bd.midi) }}
            onMouseUp={() => release(bd.midi)}
            onMouseLeave={() => release(bd.midi)}
          />
        )
      })}
    </div>
  )
}
