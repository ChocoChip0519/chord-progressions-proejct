import React, { useState, useEffect } from 'react';
import { CHORD_DATA } from './data.js';
import { AUDIO } from './audio.js';

function SetupModal({ initial, onStart, onCancel }) {
  const [genre, setGenre] = useState(initial?.genre || "pop");
  const [keyName, setKeyName] = useState(initial?.key ?? null);
  const [mode, setMode] = useState(initial?.mode || "major");
  const [bpm, setBpm] = useState(initial?.bpm || 120);

  const start = async () => {
    await AUDIO.ensureStarted();
    onStart({ genre, key: keyName, mode, bpm });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter") { e.preventDefault(); start(); }
      if (e.key === "Escape" && onCancel) { e.preventDefault(); onCancel(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [genre, keyName, mode, bpm]);

  const Row = ({ label, children }) => (
    <div className="cfg-row">
      <div className="cfg-label">{label}</div>
      <div className="cfg-control">{children}</div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="cfg-sheet" onClick={e => e.stopPropagation()}>
        <div className="cfg-head">
          <span className="cfg-eyebrow">configuration</span>
          <h2>코드 진행 추천</h2>
        </div>

        <div className="cfg-body">
          <Row label="Genre">
            <div className="seg">
              {CHORD_DATA.genres.map(g => (
                <button key={g.id}
                  className={"seg-btn" + (g.id === genre ? " on" : "")}
                  onClick={() => setGenre(g.id)}>
                  {g.label || g.name}
                </button>
              ))}
            </div>
          </Row>

          <Row label="Key">
            <div className="cfg-keys">
              {CHORD_DATA.keys.map(k => (
                <button key={k}
                  className={"key-cell mono" + (keyName === k ? " on" : "")}
                  onClick={() => setKeyName(k)}>{k}</button>
              ))}
              <button
                className={"key-cell none" + (keyName === null ? " on" : "")}
                onClick={() => setKeyName(null)}>—</button>
            </div>
            <div className="cfg-hint">
              {keyName === null
                ? "키 없이 시작 — 진행을 분석해 자동 추론합니다"
                : "선택된 키 기준으로 다이어토닉 추천이 적용됩니다"}
            </div>
          </Row>

          <Row label="Mode">
            <div className="seg">
              <button className={"seg-btn" + (mode === "major" ? " on" : "")}
                onClick={() => setMode("major")}>Major</button>
              <button className={"seg-btn" + (mode === "minor" ? " on" : "")}
                onClick={() => setMode("minor")}>Minor</button>
            </div>
          </Row>

          <Row label="Tempo">
            <div className="cfg-bpm-row">
              <input type="range" min={60} max={180} value={bpm}
                className="bpm-slider"
                style={{ "--p": ((bpm - 60) / 120 * 100) + "%" }}
                onChange={e => setBpm(parseInt(e.target.value))} />
              <span className="bpm-value mono">{bpm}</span>
              <span className="cfg-unit">BPM</span>
            </div>
          </Row>
        </div>

        <div className="cfg-foot">
          <span className="cfg-foot-hint">Enter to begin</span>
          <button className="cfg-begin" onClick={start}>Begin →</button>
        </div>
      </div>
    </div>
  );
}

export default SetupModal;
