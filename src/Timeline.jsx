import React from 'react';
import Icon from './icons.jsx';

function Timeline({
  progression, currentIdx, playingIdx, isPlaying,
  canUndo, canRedo, hasKey,
  onUndo, onRedo, onPlayStop, onAutoGen, onClear, onRemove
}) {
  return (
    <section className="timeline-section">
      <div className="section-header">
        <div className="section-title">코드 진행</div>
        <div className="toolbar">
          <button className="icon-btn" onClick={onUndo} disabled={!canUndo} title="실행 취소">
            <Icon name="undo" size={16} />
          </button>
          <button className="icon-btn" onClick={onRedo} disabled={!canRedo} title="다시 실행">
            <Icon name="redo" size={16} />
          </button>
          <div className="toolbar-divider" />
          <button className="icon-btn text" onClick={onPlayStop} disabled={!progression.length}
            style={isPlaying ? { background: "var(--accent-10)", color: "var(--accent)" } : null}>
            <Icon name={isPlaying ? "stop" : "play"} size={14} />
            {isPlaying ? "정지" : "전체듣기"}
          </button>
          <button className="icon-btn text" onClick={onAutoGen} disabled={!hasKey}
            title={hasKey ? "자동 생성" : "키를 먼저 설정해주세요"}>
            <Icon name="sparkles" size={14} />
            자동생성
          </button>
          <div className="toolbar-divider" />
          <button className="icon-btn" onClick={onClear} disabled={!progression.length} title="모두 지우기">
            <Icon name="trash" size={15} />
          </button>
        </div>
      </div>

      <div className="timeline-cards">
        {progression.length === 0 && (
          <div className="tl-empty">
            피아노에서 코드를 누르거나 아래 추천 카드를 클릭해 진행을 시작하세요
          </div>
        )}
        {progression.map((c, i) => (
          <React.Fragment key={i}>
            <div className={"tl-card"
              + (i === currentIdx ? " current" : "")
              + (i === playingIdx ? " playing" : "")}>
              <div className="name">{c.name}</div>
              <div className="roman mono">{c.romanNumeral}</div>
              <div className="remove" onClick={(e) => { e.stopPropagation(); onRemove(i); }}>×</div>
            </div>
            {i < progression.length - 1 && <span className="tl-arrow">→</span>}
          </React.Fragment>
        ))}
        {progression.length > 0 && (
          <>
            <span className="tl-arrow">→</span>
            <div className="tl-add"><Icon name="plus" size={20} color="var(--text-3)" /></div>
          </>
        )}
      </div>
    </section>
  );
}

export default Timeline;
