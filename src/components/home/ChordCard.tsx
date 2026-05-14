import { useState } from 'react'
import { useCardStore, type CardData } from '../../store/useCardStore'

interface Props {
  card: CardData
  dragMode: boolean
}

export default function ChordCard({ card, dragMode }: Props) {
  const { folders, deleteCard, addCardToFolder, removeCardFromFolder } = useCardStore()
  const [showFolderMenu, setShowFolderMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const summary = card.chords.slice(0, 6).join(' → ') + (card.chords.length > 6 ? ' …' : '')

  return (
    <div className={`chord-card-home${dragMode ? ' chord-card-home--float' : ''}`}>
      {/* Title */}
      <div className="chord-card-home__title">{card.title || '(제목 없음)'}</div>

      {/* Chord summary */}
      <div className="chord-card-home__summary">{summary || '—'}</div>

      {/* Tags */}
      <div className="chord-card-home__tags">
        <span className="tag tag--genre">{card.genre}</span>
        <span className="tag tag--key">{card.key || '?'} {card.mode === 'major' ? 'Maj' : 'min'}</span>
        <span className="tag tag--bpm">{card.bpm} BPM</span>
      </div>

      <div className="chord-card-home__date">
        {new Date(card.updatedAt).toLocaleDateString('ko-KR')}
      </div>

      {/* Actions */}
      <div className="chord-card-home__actions">
        {/* Folder assign */}
        <div className="folder-assign">
          <button
            className="card-btn"
            title="폴더에 추가"
            onClick={() => setShowFolderMenu(m => !m)}
          >📁</button>
          {showFolderMenu && (
            <div className="folder-menu">
              {folders.length === 0 && <div className="folder-menu__empty">폴더 없음</div>}
              {folders.map(f => {
                const inFolder = f.cardIds.includes(card.id)
                return (
                  <button
                    key={f.id}
                    className={`folder-menu__item${inFolder ? ' active' : ''}`}
                    onClick={() => {
                      if (inFolder) removeCardFromFolder(card.id, f.id)
                      else addCardToFolder(card.id, f.id)
                    }}
                  >
                    {inFolder ? '✓ ' : ''}{f.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Delete */}
        {confirmDelete ? (
          <span className="confirm-delete">
            <button className="card-btn card-btn--danger" onClick={() => deleteCard(card.id)}>삭제</button>
            <button className="card-btn" onClick={() => setConfirmDelete(false)}>취소</button>
          </span>
        ) : (
          <button className="card-btn card-btn--danger" title="삭제" onClick={() => setConfirmDelete(true)}>🗑</button>
        )}
      </div>
    </div>
  )
}
