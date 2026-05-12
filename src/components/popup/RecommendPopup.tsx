import { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useRecommend, type RecommendCard as RecommendCardType } from '@/hooks/useRecommend';
import { HistoryBar } from '@/components/editor/HistoryBar';
import { PianoKeyboard } from '@/components/piano/PianoKeyboard';
import { RecommendCard } from './RecommendCard';
import { usePiano } from '@/hooks/usePiano';
import { detectChordFromMidi } from '@/lib/music/chordParser';
import { chordToDegree } from '@/lib/music/degreeConverter';

interface RecommendPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecommendPopup({ isOpen, onClose }: RecommendPopupProps) {
  const history = useEditorStore((s) => s.getHistory());
  const { mode, tonicMidi, confirmChord } = useEditorStore();
  const { visibleCards, next, prev, selectCard } = useRecommend();
  const { pressedMidi, recommendMidi, pressKey, releaseKey } = usePiano();

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Enter') {
        const chord = detectChordFromMidi([...pressedMidi]);
        if (chord) {
          const degree = chordToDegree(chord, tonicMidi, mode) ?? '';
          confirmChord({ chord, degree });
          onClose();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, next, prev, pressedMidi, mode, tonicMidi, confirmChord]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,10,20,0.85)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        padding: 32,
        overflowY: 'auto',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 6 }}>코드 진행 히스토리</div>
        <div style={{ color: '#fff' }}>
          <HistoryBar history={history} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: 14 }}>추천 코드</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={prev} style={navBtnStyle}>‹</button>
            <button onClick={next} style={navBtnStyle}>›</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {visibleCards.map((card: RecommendCardType) => (
            <RecommendCard key={card.degree + card.chord} card={card} onSelect={(c) => { selectCard(c); onClose(); }} />
          ))}
          {visibleCards.length === 0 && (
            <div style={{ color: '#888', fontSize: 14 }}>코드를 먼저 입력하세요</div>
          )}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 10 }}>직접 연주하기 (Enter로 확정)</div>
        <PianoKeyboard
          pressedMidi={pressedMidi}
          recommendMidi={recommendMidi}
          onPress={pressKey}
          onRelease={releaseKey}
        />
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'transparent',
  color: '#fff',
  fontSize: 18,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
