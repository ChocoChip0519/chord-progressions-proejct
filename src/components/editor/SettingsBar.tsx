import { useEditorStore } from '../../store/useEditorStore'
import { NOTES_SHARP } from '../../lib/music/chordParser'
import type { Genre, Mode } from '../../lib/music/degreeConverter'

const GENRES: { key: Genre; label: string }[] = [
  { key: 'pop',    label: 'Pop' },
  { key: 'rnb',   label: 'R&B' },
  { key: 'ballad',label: '발라드' },
  { key: 'rock',  label: 'Rock' },
]

export default function SettingsBar() {
  const { genre, setGenre, bpm, setBpm, modeLabel, modeOverride, setModeOverride, rootNote, setRootNote, currentMode } = useEditorStore()

  return (
    <div className="settings-bar">
      {/* Genre */}
      <span className="settings-bar__label">장르</span>
      {GENRES.map(g => (
        <button
          key={g.key}
          className={`chip${genre === g.key ? ' chip--active' : ''}`}
          onClick={() => setGenre(g.key)}
        >
          {g.label}
        </button>
      ))}

      <div className="sep" />

      {/* Key (root note) */}
      <span className="settings-bar__label">키</span>
      <select
        className="settings-bar__select"
        value={rootNote}
        onChange={e => setRootNote(e.target.value)}
      >
        <option value="">자동감지</option>
        {NOTES_SHARP.map(n => <option key={n} value={n}>{n}</option>)}
      </select>

      {/* Major/Minor override */}
      <select
        className="settings-bar__select"
        value={modeOverride ?? ''}
        onChange={e => setModeOverride(e.target.value === '' ? null : e.target.value as Mode)}
      >
        <option value="">자동감지</option>
        <option value="major">장조 (Major)</option>
        <option value="minor">단조 (Minor)</option>
      </select>

      <div className="sep" />

      {/* BPM */}
      <span className="settings-bar__label">BPM</span>
      <input
        className="settings-bar__bpm"
        type="number"
        min={40}
        max={300}
        value={bpm}
        onChange={e => setBpm(Number(e.target.value))}
      />

      <div className="mode-badge">{modeLabel}</div>
    </div>
  )
}
