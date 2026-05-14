import { useState, useCallback } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { useCardStore } from '../store/useCardStore'
import { usePiano } from '../hooks/usePiano'
import { useKeyboard } from '../hooks/useKeyboard'
import { inferChordName } from '../lib/music/chordParser'
import SettingsBar from '../components/editor/SettingsBar'
import HistoryBar from '../components/editor/HistoryBar'
import KeyboardHint from '../components/editor/KeyboardHint'
import PianoKeyboard from '../components/piano/PianoKeyboard'
import RecommendPopup from '../components/popup/RecommendPopup'
import TitleGenreStep from '../components/editor/TitleGenreStep'

interface Props {
  cardId?: string  // undefined = new card
  onBack: () => void
}

export default function EditorPage({ cardId: _cardId, onBack }: Props) {
  const [setup, setSetup] = useState(true)
  const {
    title, setTitle,
    confirmChord, undoChord,
    openRecommend, closeRecommend,
    showRecommend, historyArr,
    genre, currentMode, currentTonicMidi, bpm,
    reset,
  } = useEditorStore()

  const { addCard } = useCardStore()
  const { pressNote, releaseNote, getPressedMidi, activeNotes } = usePiano()

  const [pressedMidi, setPressedMidi] = useState<Set<number>>(new Set())

  const handlePress = useCallback((midi: number) => {
    pressNote(midi)
    setPressedMidi(prev => new Set(prev).add(midi))
  }, [pressNote])

  const handleRelease = useCallback((midi: number) => {
    releaseNote(midi)
    setPressedMidi(prev => { const n = new Set(prev); n.delete(midi); return n })
  }, [releaseNote])

  const handleEnter = useCallback(() => {
    const midi = getPressedMidi()
    if (midi.length === 0) return
    const chordName = inferChordName(midi)
    confirmChord(chordName, midi)
    // release all
    midi.forEach(m => releaseNote(m))
    setPressedMidi(new Set())
  }, [getPressedMidi, confirmChord, releaseNote])

  const handleSave = () => {
    addCard({
      title: title || '제목 없음',
      chords: historyArr.map(h => h.name),
      genre,
      mode: currentMode,
      key: currentTonicMidi
        ? ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][currentTonicMidi % 12]
        : '',
      bpm,
    })
    reset()
    onBack()
  }

  useKeyboard({
    onPressNote: handlePress,
    onReleaseNote: handleRelease,
    onEnter: handleEnter,
    onBackspace: undoChord,
    onArrowRight: openRecommend,
    onEscape: closeRecommend,
  }, !setup)

  if (setup) {
    return (
      <TitleGenreStep onDone={() => setSetup(false)} />
    )
  }

  // Compute recommend highlight
  const recPopupVisible = showRecommend

  return (
    <div className="page page--editor">
      {/* Title bar */}
      <div className="title-bar">
        <button className="back-btn" onClick={onBack}>← 홈</button>
        <input
          className="session-title"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <button className="save-btn" onClick={handleSave} disabled={historyArr.length === 0}>
          저장
        </button>
      </div>

      {/* Settings */}
      <SettingsBar />

      {/* History */}
      <HistoryBar />

      {/* Keyboard hint */}
      <KeyboardHint />

      {/* Current chord display */}
      <div className="current-chord-display">
        {pressedMidi.size > 0 && (
          <span>♩ {inferChordName([...pressedMidi].sort((a,b)=>a-b))}</span>
        )}
      </div>

      {/* Piano area */}
      <div className="piano-area">
        {/* Recommend popup sits between history and piano */}
        {recPopupVisible && <RecommendPopup />}

        {/* Main piano */}
        <PianoKeyboard
          pressedMidi={pressedMidi}
          onPress={handlePress}
          onRelease={handleRelease}
        />
      </div>
    </div>
  )
}
