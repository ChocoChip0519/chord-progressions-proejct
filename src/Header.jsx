import React from 'react';
import Icon from './icons.jsx';
import { CHORD_DATA } from './data.js';

function Header({ session, onOpenSetup }) {
  const genre = CHORD_DATA.genres.find(g => g.id === session.genre);
  return (
    <header className="header">
      <div className="logo">
        <span>Chord Progression Recommender</span>
      </div>
      <div className="session-bar">
        <span className="session-badge" onClick={onOpenSetup}
          style={{ background: `${genre.accent}26`, color: genre.accent }}>
          {genre.name}
        </span>
        <span className={"session-badge " + (session.key ? "" : "muted")} onClick={onOpenSetup}>
          {session.key ? `key ${session.key}` : "no key"}
        </span>
        <span className="session-badge muted" onClick={onOpenSetup}>
          {session.mode}
        </span>
        <span className="session-badge muted mono" onClick={onOpenSetup}>
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
