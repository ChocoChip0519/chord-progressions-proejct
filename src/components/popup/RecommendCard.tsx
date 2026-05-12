import { parseChord } from '@/lib/music/chordParser';
import { MiniPiano } from '@/components/piano/MiniPiano';
import type { RecommendCard as RecommendCardType } from '@/hooks/useRecommend';
import { usePiano } from '@/hooks/usePiano';

interface RecommendCardProps {
  card: RecommendCardType;
  onSelect: (card: RecommendCardType) => void;
}

export function RecommendCard({ card, onSelect }: RecommendCardProps) {
  const { pressedMidi, pressKey, releaseKey, playChord } = usePiano();

  const parsed = parseChord(card.chord);
  const highlightMidi = new Set(parsed?.notes ?? []);

  function handleAutoPlay() {
    if (parsed) playChord(parsed.notes);
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 20,
        minWidth: 200,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        border: '2px solid transparent',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.18)';
        (e.currentTarget as HTMLElement).style.borderColor = '#1a1a2e';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
        (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>{card.chord}</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleAutoPlay(); }}
          style={{
            padding: '4px 12px',
            borderRadius: 20,
            border: '1px solid #ddd',
            background: '#f5f5f5',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          ▶ 재생
        </button>
      </div>

      <MiniPiano
        highlightMidi={highlightMidi}
        pressedMidi={pressedMidi}
        onPress={pressKey}
        onRelease={releaseKey}
      />

      <button
        onClick={() => onSelect(card)}
        style={{
          padding: '8px',
          borderRadius: 8,
          border: 'none',
          background: '#1a1a2e',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        선택
      </button>
    </div>
  );
}
