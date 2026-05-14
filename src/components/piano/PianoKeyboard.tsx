import { useCallback } from 'react'
import { WHITE_MIDI, WHITE_KEYS, BLACK_KEYS } from '../../hooks/useKeyboard'
import { midiToName } from '../../lib/music/chordParser'

// Black key definitions: afterWhite = index of the white key to the LEFT
const BLACK_DEFS: { midi: number; afterWhite: number; kbKey: string }[] = [
  { midi: 61, afterWhite: 0,  kbKey: 'W' },
  { midi: 63, afterWhite: 1,  kbKey: 'E' },
  { midi: 66, afterWhite: 3,  kbKey: 'T' },
  { midi: 68, afterWhite: 4,  kbKey: 'Y' },
  { midi: 70, afterWhite: 5,  kbKey: 'U' },
  { midi: 73, afterWhite: 7,  kbKey: 'I' },
  { midi: 75, afterWhite: 8,  kbKey: 'O' },
  { midi: 78, afterWhite: 10, kbKey: 'P' },
  { midi: 80, afterWhite: 11, kbKey: '[' },
  { midi: 82, afterWhite: 12, kbKey: ']' },
]

interface Props {
  pressedMidi: Set<number>
  recommendMidi?: Set<number>
  onPress: (midi: number) => void
  onRelease: (midi: number) => void
  mini?: boolean
}

export default function PianoKeyboard({ pressedMidi, recommendMidi, onPress, onRelease, mini = false }: Props) {
  const total = WHITE_MIDI.length
  const whiteW = 100 / total

  const handleMouseDown = useCallback((e: React.MouseEvent, midi: number) => {
    e.preventDefault()
    onPress(midi)
  }, [onPress])

  const handleMouseUp = useCallback((_: React.MouseEvent, midi: number) => {
    onRelease(midi)
  }, [onRelease])

  const handleMouseLeave = useCallback((_: React.MouseEvent, midi: number) => {
    onRelease(midi)
  }, [onRelease])

  return (
    <div className={`piano-wrap${mini ? ' piano-wrap--mini' : ''}`}>
      {WHITE_MIDI.map((midi, i) => {
        const isPressed = pressedMidi.has(midi)
        const isRec = recommendMidi?.has(midi)
        let cls = 'white-key'
        if (isPressed) cls += ' pressed'
        else if (isRec) cls += ' rec'
        return (
          <div
            key={midi}
            className={cls}
            onMouseDown={e => handleMouseDown(e, midi)}
            onMouseUp={e => handleMouseUp(e, midi)}
            onMouseLeave={e => handleMouseLeave(e, midi)}
          >
            {!mini && <span className="key-hint">{WHITE_KEYS[i]?.toUpperCase()}</span>}
            <span className="note-name">{midiToName(midi)}</span>
          </div>
        )
      })}
      {BLACK_DEFS.map((bd) => {
        const isPressed = pressedMidi.has(bd.midi)
        const isRec = recommendMidi?.has(bd.midi)
        let cls = 'black-key'
        if (isPressed) cls += ' pressed'
        else if (isRec) cls += ' rec'
        return (
          <div
            key={bd.midi}
            className={cls}
            style={{ left: `${(bd.afterWhite + 1) * whiteW - (mini ? 5.5 : 3.6)}%` }}
            onMouseDown={e => handleMouseDown(e, bd.midi)}
            onMouseUp={e => handleMouseUp(e, bd.midi)}
            onMouseLeave={e => handleMouseLeave(e, bd.midi)}
          >
            {!mini && <span className="key-hint">{bd.kbKey}</span>}
          </div>
        )
      })}
    </div>
  )
}
