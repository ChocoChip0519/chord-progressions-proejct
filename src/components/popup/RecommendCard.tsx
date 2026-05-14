import { useState } from 'react'
import MiniPiano from '../piano/MiniPiano'
import { parseChord } from '../../lib/music/chordParser'
import { usePiano } from '../../hooks/usePiano'
import type { RecommendCandidate } from '../../lib/music/recommendEngine'

interface Props {
  candidate: RecommendCandidate
  selected: boolean
  onConfirm: (candidate: RecommendCandidate, variantChord: string) => void
}

export default function RecommendCard({ candidate, selected, onConfirm }: Props) {
  const { playChord } = usePiano()
  const [activeVariant, setActiveVariant] = useState(0)
  const variantChord = candidate.variants[activeVariant] ?? candidate.mainChord
  const parsed = parseChord(variantChord)
  const notes = parsed?.notes ?? candidate.notes

  const handlePlayInstant = (e: React.MouseEvent) => {
    e.stopPropagation()
    playChord(notes)
  }

  const selectVariant = (e: React.MouseEvent, idx: number, chord: string) => {
    e.stopPropagation()
    setActiveVariant(idx)
    const p = parseChord(chord)
    if (p) playChord(p.notes)
  }

  return (
    <div
      className={`rec-card${selected ? ' rec-card--selected' : ''}`}
      onClick={() => onConfirm(candidate, variantChord)}
      onMouseEnter={() => playChord(notes)}
    >
      <div className="rec-card__name">{variantChord}</div>
      <div className="rec-card__score">빈도점수 {candidate.score}</div>

      {/* Method A: instant play */}
      <button className="rec-card__play" onClick={handlePlayInstant}>▶ 즉시 재생</button>

      {/* Method B: mini piano */}
      <MiniPiano highlightMidi={notes} />

      {/* Variant chips */}
      {candidate.variants.length > 1 && (
        <div className="rec-card__variants">
          {candidate.variants.map((v, i) => (
            <button
              key={v}
              className={`rec-card__variant${i === activeVariant ? ' active' : ''}`}
              onClick={e => selectVariant(e, i, v)}
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
