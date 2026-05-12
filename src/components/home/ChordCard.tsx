import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import type { CardRow } from '@/lib/supabase/cardsApi';

interface ChordCardProps {
  card: CardRow;
  onDelete: (id: string) => void;
  onMoveToFolder: (cardId: string) => void;
  folders: Array<{ id: string; name: string }>;
}

export function ChordCard({ card, onDelete, onMoveToFolder, folders }: ChordCardProps) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card' },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: '#fff',
    borderRadius: 14,
    padding: 18,
    boxShadow: isDragging
      ? '0 12px 40px rgba(0,0,0,0.2)'
      : '0 2px 8px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    border: '1px solid #f0f0f0',
    position: 'relative',
    userSelect: 'none',
  };

  const progression = card.chord_progression.join(' → ') || '코드 없음';
  const date = new Date(card.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* 드래그 핸들 — 이 영역만 드래그 가능 */}
      <div
        {...listeners}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          cursor: isDragging ? 'grabbing' : 'grab',
          color: '#ccc',
          fontSize: 16,
          lineHeight: 1,
          padding: '2px 4px',
        }}
        title="드래그하여 이동"
      >
        ⠿
      </div>

      {/* 클릭 영역 — 에디터로 이동 */}
      <div
        onClick={() => navigate(`/editor/${card.id}`)}
        style={{ cursor: 'pointer', flex: 1 }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 4, paddingRight: 20 }}>
          {card.title || '제목 없음'}
        </div>
        <div style={{ fontSize: 13, color: '#555', fontFamily: 'monospace', marginBottom: 8 }}>
          {progression}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={tagStyle}>{card.genre.toUpperCase()}</span>
          <span style={tagStyle}>{card.bpm} BPM</span>
          <span style={{ ...tagStyle, background: '#f0f0f0', color: '#888' }}>{date}</span>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {folders.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveToFolder(card.id); }}
            style={actionBtnStyle}
            title="폴더에 추가"
          >
            📁
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`"${card.title || '제목 없음'}"을 삭제할까요?`)) onDelete(card.id);
          }}
          style={{ ...actionBtnStyle, color: '#e55' }}
          title="삭제"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

const tagStyle: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: 10,
  background: '#eef0ff',
  color: '#3a3a8e',
  fontSize: 11,
  fontWeight: 600,
};

const actionBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: 8,
  border: '1px solid #eee',
  background: '#fafafa',
  cursor: 'pointer',
  fontSize: 14,
};
