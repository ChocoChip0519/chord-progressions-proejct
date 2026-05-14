import { useState } from 'react'
import { useEditorStore } from '../../store/useEditorStore'
import type { Genre } from '../../lib/music/degreeConverter'
import { NOTES_SHARP } from '../../lib/music/chordParser'

const GENRES: { key: Genre; label: string; emoji: string }[] = [
  { key: 'pop',    label: 'Pop',    emoji: '🎵' },
  { key: 'rnb',   label: 'R&B',   emoji: '🎷' },
  { key: 'ballad',label: '발라드', emoji: '🎹' },
  { key: 'rock',  label: 'Rock',   emoji: '🎸' },
]

interface Props {
  onDone: () => void
}

export default function TitleGenreStep({ onDone }: Props) {
  const { title, setTitle, genre, setGenre, setRootNote, setModeOverride } = useEditorStore()
  const [localTitle, setLocalTitle] = useState(title)
  const [localGenre, setLocalGenre] = useState<Genre>(genre)
  const [localRoot, setLocalRoot] = useState('')
  const [localMode, setLocalMode] = useState<'major' | 'minor' | ''>('')

  const handleStart = () => {
    setTitle(localTitle)
    setGenre(localGenre)
    setRootNote(localRoot)
    setModeOverride(localMode === '' ? null : localMode)
    onDone()
  }

  return (
    <div className="setup-overlay">
      <div className="setup-card">
        <h2 className="setup-card__title">새 코드 진행</h2>

        <label className="setup-label">제목 (선택)</label>
        <input
          className="setup-input"
          placeholder="제목을 입력하세요"
          value={localTitle}
          onChange={e => setLocalTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleStart()}
          autoFocus
        />

        <label className="setup-label">장르</label>
        <div className="setup-genres">
          {GENRES.map(g => (
            <button
              key={g.key}
              className={`setup-genre-btn${localGenre === g.key ? ' active' : ''}`}
              onClick={() => setLocalGenre(g.key)}
            >
              {g.emoji} {g.label}
            </button>
          ))}
        </div>

        <label className="setup-label">키 (선택 – 미선택 시 자동감지)</label>
        <div className="setup-row">
          <select
            className="setup-select"
            value={localRoot}
            onChange={e => setLocalRoot(e.target.value)}
          >
            <option value="">자동감지</option>
            {NOTES_SHARP.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select
            className="setup-select"
            value={localMode}
            onChange={e => setLocalMode(e.target.value as '' | 'major' | 'minor')}
          >
            <option value="">자동감지</option>
            <option value="major">장조 (Major)</option>
            <option value="minor">단조 (Minor)</option>
          </select>
        </div>

        <button className="setup-start-btn" onClick={handleStart}>
          작업 시작 →
        </button>
      </div>
    </div>
  )
}
