import { useEditorStore } from '../../store/useEditorStore'

export default function HistoryBar() {
  const { historyArr } = useEditorStore()

  return (
    <div className="history-bar">
      {historyArr.length === 0 ? (
        <span className="history-bar__empty">
          확정된 코드가 여기에 표시됩니다 — Enter로 확정, Backspace로 삭제
        </span>
      ) : (
        historyArr.map((item, i) => (
          <span key={i} className="history-bar__item">
            {i > 0 && <span className="history-bar__arrow">→</span>}
            <span className={`chord-chip${i === historyArr.length - 1 ? ' chord-chip--last' : ''}`}>
              <span className="chord-chip__idx">{i + 1}</span>
              {item.name}
            </span>
          </span>
        ))
      )}
      <span className="history-bar__hint">← → 로 코드 탐색</span>
    </div>
  )
}
