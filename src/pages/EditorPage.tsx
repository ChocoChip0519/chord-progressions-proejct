import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TitleGenreStep } from '@/components/editor/TitleGenreStep';
import { SettingsBar } from '@/components/editor/SettingsBar';
import { HistoryBar } from '@/components/editor/HistoryBar';
import { KeyboardHint } from '@/components/editor/KeyboardHint';
import { PianoKeyboard } from '@/components/piano/PianoKeyboard';
import { RecommendPopup } from '@/components/popup/RecommendPopup';
import { usePiano } from '@/hooks/usePiano';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useRecommend } from '@/hooks/useRecommend';
import { useEditorStore } from '@/store/useEditorStore';
import { useCardStore } from '@/store/useCardStore';
import { detectChordFromMidi } from '@/lib/music/chordParser';
import { chordToDegree } from '@/lib/music/degreeConverter';

export function EditorPage() {
  const { cardId } = useParams<{ cardId?: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<'setup' | 'editor'>(cardId ? 'editor' : 'setup');
  const [popupOpen, setPopupOpen] = useState(false);

  const { title, setTitle, mode, tonicMidi, confirmChord, undoChord, getHistory, resetSession } = useEditorStore();
  const { addCard, updateCard } = useCardStore();
  const { pressedMidi, recommendMidi, pressKey, releaseKey } = usePiano();
  const { openPopup } = useRecommend();

  const history = getHistory();

  const handleConfirm = useCallback(() => {
    const chord = detectChordFromMidi([...pressedMidi]);
    if (!chord) return;
    const degree = chordToDegree(chord, tonicMidi, mode) ?? '';
    confirmChord({ chord, degree });
  }, [pressedMidi, tonicMidi, mode, confirmChord]);

  const handleOpenPopup = useCallback(() => {
    openPopup();
    setPopupOpen(true);
  }, [openPopup]);

  const handleClosePopup = useCallback(() => setPopupOpen(false), []);

  useKeyboard({
    onConfirm: handleConfirm,
    onUndo: undoChord,
    onOpenPopup: handleOpenPopup,
    onClosePopup: handleClosePopup,
    pressKey,
    releaseKey,
    isPopupOpen: popupOpen,
    disabled: step === 'setup',
  });

  async function handleSave() {
    const { title: t, genre, bpm } = useEditorStore.getState();
    const chord_progression = history.map((e) => e.chord);
    if (cardId) {
      await updateCard(cardId, { title: t || '제목 없음', chord_progression, genre, bpm });
    } else {
      await addCard({ title: t || '제목 없음', chord_progression, genre, bpm });
    }
    resetSession();
    navigate('/');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7fb', display: 'flex', flexDirection: 'column' }}>
      {step === 'setup' && <TitleGenreStep onComplete={() => setStep('editor')} />}

      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => { navigate('/'); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#666', padding: 0 }}
          >
            ← 홈으로
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              borderRadius: 10,
              border: 'none',
              background: '#1a1a2e',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            저장
          </button>
        </div>

        {/* 제목 */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 없음"
          style={{
            fontSize: 26,
            fontWeight: 700,
            border: 'none',
            borderBottom: '2px solid #e0e0e0',
            background: 'transparent',
            outline: 'none',
            padding: '4px 0',
            color: '#1a1a2e',
          }}
        />

        {/* 설정 바 */}
        <SettingsBar />

        {/* 코드 히스토리 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, minHeight: 64, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <HistoryBar history={history} />
        </div>

        {/* 현재 눌린 음 → 코드명 */}
        <CurrentChordPreview pressedMidi={pressedMidi} />

        {/* 키보드 힌트 */}
        <KeyboardHint />

        {/* 피아노 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, overflowX: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <PianoKeyboard
            pressedMidi={pressedMidi}
            recommendMidi={recommendMidi}
            onPress={pressKey}
            onRelease={releaseKey}
          />
        </div>

        {/* → 추천 버튼 */}
        <button
          onClick={handleOpenPopup}
          style={{
            alignSelf: 'center',
            padding: '12px 32px',
            borderRadius: 30,
            border: 'none',
            background: 'linear-gradient(135deg, #1a1a2e, #3a3a6e)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(26,26,46,0.3)',
          }}
        >
          → 다음 코드 추천 받기
        </button>
      </div>

      <RecommendPopup isOpen={popupOpen} onClose={handleClosePopup} />
    </div>
  );
}

function CurrentChordPreview({ pressedMidi }: { pressedMidi: Set<number> }) {
  const chord = pressedMidi.size >= 2 ? detectChordFromMidi([...pressedMidi]) : null;
  if (!chord && pressedMidi.size === 0) return null;

  return (
    <div style={{ textAlign: 'center', fontSize: 36, fontWeight: 700, color: '#1a1a2e', letterSpacing: 1 }}>
      {chord ?? (pressedMidi.size > 0 ? '...' : '')}
    </div>
  );
}
