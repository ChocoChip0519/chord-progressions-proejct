import React from 'react';
import ChordPiano from './ChordPiano.jsx';

function Recommendations({ recs, progression, inferredKey, hasKey, pendingChord, onPick, onConfirmKey }) {
  const isStart = progression.length === 0;
  const isPending = (r) => pendingChord
    && pendingChord.romanNumeral === r.romanNumeral;
  return (
    <section className="recs-section">
      <div className="rec-title">
        {isStart
          ? <>시작 코드</>
          : <>다음 코드 추천</>}
        {inferredKey && !hasKey && (
          <span className="hint">
            · 진행 분석 결과
            <button className="key-badge" style={{ marginLeft: 8 }} onClick={onConfirmKey}>
              예상 키 {inferredKey.key} {inferredKey.mode} — 확정
            </button>
          </span>
        )}
        <span className="rec-keyhint mono">← → 탐색 · space 확정</span>
      </div>
      <div className="rec-grid">
        {recs.length === 0 && (
          <div className="rec-empty">추천을 만들 수 없어요. 다른 코드로 시도해보세요.</div>
        )}
        {recs.map((r, i) => {
          const pct = Math.round(r.weight * 100);
          const pending = isPending(r);
          return (
            <div key={i}
              className={"rec-card"
                + (i === 0 ? " top" : "")
                + (pending ? " pending" : "")}
              onClick={() => onPick(r)}>
              <div className="rec-card-top">
                <div className="rec-name">{r.name}</div>
                {pending
                  ? <span className="rec-top-tag mono pending">space ↵</span>
                  : (i === 0 && <span className="rec-top-tag mono">top</span>)}
              </div>
              {r.chord && (
                <div className="rec-piano-wrap">
                  <ChordPiano notes={r.chord.notes} />
                </div>
              )}
              <div className="rec-bar-row">
                <div className="rec-bar">
                  <div className="rec-bar-fill" style={{ width: pct + "%" }} />
                </div>
                <span className="rec-pct mono">{pct}%</span>
              </div>
              <div className="rec-mood">
                <span className="roman mono">{r.romanNumeral}</span>
                {r.mood}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Recommendations;
