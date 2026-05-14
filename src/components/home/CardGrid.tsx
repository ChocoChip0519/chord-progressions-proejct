import { useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCardStore, type CardData } from '../../store/useCardStore'
import ChordCard from './ChordCard'
import SortControl from './SortControl'

type SortKey = 'updatedAt' | 'title' | 'custom'

function SortableCard({ card, dragMode }: { card: CardData; dragMode: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ChordCard card={card} dragMode={dragMode || isDragging} />
    </div>
  )
}

interface Props {
  onNewCard: () => void
  onOpenCard: (id: string) => void
}

export default function CardGrid({ onNewCard, onOpenCard: _onOpenCard }: Props) {
  const { activeFolderId, getCardsForFolder, reorderCards } = useCardStore()
  const [sort, setSort] = useState<SortKey>('updatedAt')
  const [dragMode, setDragMode] = useState(false)

  const rawCards = getCardsForFolder(activeFolderId)

  const cards = useMemo(() => {
    if (sort === 'title') return [...rawCards].sort((a, b) => a.title.localeCompare(b.title, 'ko'))
    if (sort === 'updatedAt') return [...rawCards].sort((a, b) => b.updatedAt - a.updatedAt)
    return [...rawCards].sort((a, b) => a.order - b.order)
  }, [rawCards, sort])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = cards.findIndex(c => c.id === active.id)
    const newIdx = cards.findIndex(c => c.id === over.id)
    const reordered = arrayMove(cards, oldIdx, newIdx)
    reorderCards(activeFolderId, reordered.map(c => c.id))
    setSort('custom')
  }

  return (
    <div className="card-grid-wrapper">
      <div className="card-grid-header">
        <SortControl sort={sort} onSort={setSort} />
        <button
          className={`edit-mode-btn${dragMode ? ' active' : ''}`}
          onClick={() => setDragMode(m => !m)}
        >
          {dragMode ? '완료' : '편집'}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cards.map(c => c.id)} strategy={rectSortingStrategy}>
          <div className="card-grid">
            {/* New card button — always first in grid */}
            <div className="card-grid__new" onClick={onNewCard}>
              <span className="card-grid__new-icon">+</span>
              <span>새 코드 진행</span>
            </div>

            {cards.map(card => (
              dragMode
                ? <SortableCard key={card.id} card={card} dragMode={dragMode} />
                : (
                  <div key={card.id} onClick={() => _onOpenCard(card.id)}>
                    <ChordCard card={card} dragMode={false} />
                  </div>
                )
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
