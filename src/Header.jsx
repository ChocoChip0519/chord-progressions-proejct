import React from 'react';
import Icon from './icons.jsx';
import { CHORD_DATA } from './data.js';

function Header({ session, onOpenSetup, onBackToDashboard, projectName }) {
  const genre = CHORD_DATA.genres.find(g => g.id === session.genre);
  return (
    <header className="header">
      <div className="logo">
        {onBackToDashboard && (
          <button className="icon-btn text" onClick={onBackToDashboard} style={{ marginRight: 8 }}>
            ← 대시보드
          </button>
        )}
        <span>{projectName || 'ChordFlow'}</span>
      </div>
      <div className="session-bar">
        <span className="session-badge" onClick={onOpenSetup}
          data-tooltip="코드 추천에 사용할 장르"
          style={{ background: `${genre.accent}26`, color: genre.accent }}>
          {genre.name}
        </span>
        <span className={"session-badge " + (session.key ? "" : "muted")} onClick={onOpenSetup}
          data-tooltip={session.key ? "현재 조성" : "키 미설정 · 자동 추론 중"}>
          {session.key ? `key ${session.key}` : "no key"}
        </span>
        <span className="session-badge muted" onClick={onOpenSetup}
          data-tooltip={session.mode === 'major' ? "장조 (밝은 느낌)" : "단조 (어두운 느낌)"}>
          {session.mode}
        </span>
        <span className="session-badge muted mono" onClick={onOpenSetup}
          data-tooltip="재생 속도 (Beats Per Minute)">
          {session.bpm} bpm
        </span>
      </div>
      <div className="header-right">
        <button className="icon-btn text" onClick={onOpenSetup}>
          <Icon name="settings" size={15} />
          설정
        </button>
      </div>
    </header>
  );
}

export default Header;
