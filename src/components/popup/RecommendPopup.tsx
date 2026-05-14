import RecommendCard from './RecommendCard'
import { useEditorStore, PAGE_SIZE } from '../../store/useEditorStore'
import type { RecommendCandidate } from '../../lib/music/recommendEngine'

export default function RecommendPopup() {
  const {
    showRecommend, recommendQueue, recommendPage,
    recommendPagePrev, recommendPageNext,
    closeRecommend, confirmFromRecommend,
  } = useEditorStore()

  if (!showRecommend) return null

  const all = recommendQueue.toArray()
  const page = all.slice(recommendPage * PAGE_SIZE, (recommendPage + 1) * PAGE_SIZE)
  const canPrev = recommendPage > 0
  const canNext = (recommendPage + 1) * PAGE_SIZE < all.length

  const handleConfirm = (candidate: RecommendCandidate, variantChord: string) => {
    confirmFromRecommend(candidate, variantChord)
  }

  return (
    <div className="rec-popup">
      <div className="rec-popup__label">
        다음 코드 추천 <span className="rec-popup__count">({all.length}개)</span>
      </div>
      <div className="rec-popup__row">
        <button
          className="rec-popup__nav"
          disabled={!canPrev}
          onClick={recommendPagePrev}
        >‹</button>
        <div className="rec-popup__cards">
          {page.map(c => (
            <RecommendCard
              key={c.degree + c.mainChord}
              candidate={c}
              selected={false}
              onConfirm={handleConfirm}
            />
          ))}
        </div>
        <button
          className="rec-popup__nav"
          disabled={!canNext}
          onClick={recommendPageNext}
        >›</button>
      </div>
      <div className="rec-popup__hint">카드 클릭으로 확정 · Esc로 닫기</div>
    </div>
  )
}
