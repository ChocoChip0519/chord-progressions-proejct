import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { FolderTabBar } from '@/components/home/FolderTabBar';
import { CardGrid } from '@/components/home/CardGrid';
import { SortControl } from '@/components/home/SortControl';
import { useCardStore } from '@/store/useCardStore';
import type { CardRow } from '@/lib/supabase/cardsApi';

export function HomePage() {
  const {
    cards,
    folders,
    loadAll,
    getVisibleCards,
    reorder,
    moveCardToFolder,
  } = useCardStore();

  const [activeCard, setActiveCard] = useState<CardRow | null>(null);
  const [folderSelectCard, setFolderSelectCard] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, [loadAll]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const card = cards.find((c) => c.id === event.active.id);
    if (card) setActiveCard(card);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const overData = over.data.current as { type?: string; folderId?: string } | undefined;

    if (overData?.type === 'folder') {
      const folderId = overData.folderId;
      if (folderId) await moveCardToFolder(String(active.id), folderId);
      return;
    }

    if (active.id !== over.id) {
      const visible = getVisibleCards();
      const oldIdx = visible.findIndex((c) => c.id === active.id);
      const newIdx = visible.findIndex((c) => c.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1) {
        const reordered = arrayMove(visible, oldIdx, newIdx);
        await reorder(reordered.map((c) => c.id));
      }
    }
  }

  async function handleMoveToFolder(cardId: string) {
    setFolderSelectCard(cardId);
  }

  const visible = getVisibleCards();

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7fb' }}>
      {/* 헤더 */}
      <div style={{ background: '#1a1a2e', color: '#fff', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>🎹 코드 진행 추천</span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <FolderTabBar />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SortControl />
          </div>

          <CardGrid
            cards={visible}
            folders={folders}
            onMoveToFolder={handleMoveToFolder}
          />

          <DragOverlay>
            {activeCard && (
              <div style={{
                background: '#fff',
                borderRadius: 14,
                padding: 18,
                boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
                opacity: 0.9,
                minWidth: 200,
              }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{activeCard.title || '제목 없음'}</div>
                <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                  {activeCard.chord_progression.join(' → ')}
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 폴더 선택 모달 */}
      {folderSelectCard && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setFolderSelectCard(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, padding: 28, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>폴더 선택</h3>
            {folders.length === 0 && <p style={{ color: '#888', fontSize: 14 }}>폴더가 없습니다. + 버튼으로 폴더를 만드세요.</p>}
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={async () => {
                  await moveCardToFolder(folderSelectCard, f.id);
                  setFolderSelectCard(null);
                }}
                style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #eee', background: '#fafafa', cursor: 'pointer', fontSize: 14, textAlign: 'left' }}
              >
                📁 {f.name}
              </button>
            ))}
            <button onClick={() => setFolderSelectCard(null)} style={{ padding: '8px', borderRadius: 8, border: 'none', background: '#eee', cursor: 'pointer', fontSize: 13 }}>
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
