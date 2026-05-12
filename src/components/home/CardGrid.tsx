import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import { ChordCard } from './ChordCard';
import type { CardRow } from '@/lib/supabase/cardsApi';
import type { FolderRow } from '@/lib/supabase/foldersApi';
import { useCardStore } from '@/store/useCardStore';

interface CardGridProps {
  cards: CardRow[];
  folders: FolderRow[];
  onMoveToFolder: (cardId: string) => void;
}

export function CardGrid({ cards, folders, onMoveToFolder }: CardGridProps) {
  const navigate = useNavigate();
  const { removeCard } = useCardStore();

  return (
    <SortableContext items={cards.map((c) => c.id)} strategy={rectSortingStrategy}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}
      >
        {/* 새 코드 진행 만들기 버튼 (첫 번째 셀) */}
        <div
          onClick={() => navigate('/editor')}
          style={{
            background: 'rgba(26,26,46,0.04)',
            border: '2px dashed #c0c0d0',
            borderRadius: 14,
            minHeight: 160,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            color: '#888',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(26,26,46,0.08)';
            (e.currentTarget as HTMLElement).style.borderColor = '#8080c0';
            (e.currentTarget as HTMLElement).style.color = '#3a3a8e';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(26,26,46,0.04)';
            (e.currentTarget as HTMLElement).style.borderColor = '#c0c0d0';
            (e.currentTarget as HTMLElement).style.color = '#888';
          }}
        >
          <span style={{ fontSize: 32 }}>+</span>
          <span style={{ fontSize: 13 }}>새 코드 진행</span>
        </div>

        {cards.map((card) => (
          <ChordCard
            key={card.id}
            card={card}
            folders={folders}
            onDelete={removeCard}
            onMoveToFolder={onMoveToFolder}
          />
        ))}
      </div>
    </SortableContext>
  );
}
