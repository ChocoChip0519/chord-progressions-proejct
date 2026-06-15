import React from 'react';
import Icon from './icons.jsx';

function Timeline({
  progression, currentIdx, playingIdx, isPlaying,
  canUndo, canRedo, hasKey,
  onUndo, onRedo, onPlayStop, onAutoGen, onClear, onRemove,
  onSave, isDirty, songMatches,
}) {
  return (
    <section className="timeline-section">
      <div className="section-header">
        <div className="section-title-group">
          <div className="section-title">코드 진행</div>
          {songMatches?.length > 0 && (
            <div className="song-match-badges">
              {songMatches.map(m => (
                <span key={m.pattern} className="song-match-badge">
                  <span className="song-match-pattern mono">{m.pattern}</span>
                  <span className="song-match-sep">·</span>
                  <span className="song-match-titles">
                    {m.songs.map(s => `${s.artist}:${s.title}`).join(', ')}
                    {m.total > m.songs.length ? ` 외 ${m.total - m.songs.length}곡` : ''}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
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
          <div className="toolbar-divider" />
          <button className="icon-btn text" onClick={onSave}
            title="저장 (Ctrl+S)"
            style={isDirty ? { color: "var(--accent)" } : { color: "var(--text-3)" }}>
            <Icon name="save" size={14} />
            {isDirty ? '저장•' : '저장됨'}
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
