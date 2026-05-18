import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MUSIC } from './music.js';
import { AUDIO } from './audio.js';

const WHITE_KEYS = [
  { note: "C", octave: 4, kb: "Z" },
  { note: "D", octave: 4, kb: "X" },
  { note: "E", octave: 4, kb: "C" },
  { note: "F", octave: 4, kb: "V" },
  { note: "G", octave: 4, kb: "B" },
  { note: "A", octave: 4, kb: "N" },
  { note: "B", octave: 4, kb: "M" },
  { note: "C", octave: 5, kb: "Q" },
  { note: "D", octave: 5, kb: "W" },
  { note: "E", octave: 5, kb: "E" },
  { note: "F", octave: 5, kb: "R" },
  { note: "G", octave: 5, kb: "T" },
  { note: "A", octave: 5, kb: "Y" },
  { note: "B", octave: 5, kb: "U" },
];

const BLACK_KEYS = [
  { note: "C#", octave: 4, afterWhiteIdx: 0,  kb: "S" },
  { note: "D#", octave: 4, afterWhiteIdx: 1,  kb: "D" },
  { note: "F#", octave: 4, afterWhiteIdx: 3,  kb: "G" },
  { note: "G#", octave: 4, afterWhiteIdx: 4,  kb: "H" },
  { note: "A#", octave: 4, afterWhiteIdx: 5,  kb: "J" },
  { note: "C#", octave: 5, afterWhiteIdx: 7,  kb: "2" },
  { note: "D#", octave: 5, afterWhiteIdx: 8,  kb: "3" },
  { note: "F#", octave: 5, afterWhiteIdx: 10, kb: "5" },
  { note: "G#", octave: 5, afterWhiteIdx: 11, kb: "6" },
  { note: "A#", octave: 5, afterWhiteIdx: 12, kb: "7" },
];

const WHITE_W = 46;
const BLACK_W = 28;

function Piano({
  pianoMode, onModeChange,
  session, accent, inferredKey, hasKey, onConfirmKey,
  pendingChord, setPendingChord,
  onAddChord,
}) {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [previewKey, setPreviewKey] = useState(null);
  const containerRef = useRef(null);
  const pendingChordRef = useRef(pendingChord);
  const pianoModeRef = useRef(pianoMode);

  pendingChordRef.current = pendingChord;
  pianoModeRef.current = pianoMode;
  const noteArr = [...activeNotes];
  const detected = pianoMode === "free"
    ? MUSIC.detectChord(noteArr, session.key, session.mode, session.genre)
    : null;

  const sessionRef = useRef(session);
  sessionRef.current = session;

  const pressKey = useCallback((note, octave) => {
    const fullNote = note + octave;

    if (pianoModeRef.current === "free") {
      AUDIO.attackNote(fullNote);
      setActiveNotes(prev => { const n = new Set(prev); n.add(fullNote); return n; });
    } else {
      const s = sessionRef.current;
      const ch = MUSIC.buildChordFromNote(note, octave, s.key, s.mode, s.genre);
      const pc = pendingChordRef.current;
      if (pc) pc.notes.forEach(n => AUDIO.releaseNote(n));
      setPendingChord(ch);
      setPreviewKey({ note, octave });
      ch.notes.forEach(n => AUDIO.attackNote(n));
    }
  }, [setPendingChord]);

  const releaseKey = useCallback((note, octave) => {
    const fullNote = note + octave;

    if (pianoModeRef.current === "free") {
      AUDIO.releaseNote(fullNote);
      setActiveNotes(prev => { const n = new Set(prev); n.delete(fullNote); return n; });
    } else {
      const pc = pendingChordRef.current;
      if (pc) pc.notes.forEach(n => AUDIO.releaseNote(n));
    }
  }, []);

  const detectedRef = useRef(detected);
  detectedRef.current = detected;
  const onAddChordRef = useRef(onAddChord);
  onAddChordRef.current = onAddChord;
  const setPendingChordRef = useRef(setPendingChord);
  setPendingChordRef.current = setPendingChord;

  const pressedKeys = useRef(new Set());

  useEffect(() => {
    const isTypingInField = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
    };

    const downHandler = (e) => {
      if (isTypingInField()) return;
      if (e.repeat) return;

      if (e.code === "Space") {
        e.preventDefault();
        const pc = pendingChordRef.current;
        const det = detectedRef.current;
        if (pc) {
          onAddChordRef.current(pc);
          setPendingChordRef.current(null);
          setPreviewKey(null);
          setActiveNotes(new Set());
        } else if (pianoModeRef.current === "free" && det) {
          onAddChordRef.current(det);
          setActiveNotes(new Set());
        }
        return;
      }

      const k = e.key.toUpperCase();
      const w = WHITE_KEYS.find(x => x.kb.toUpperCase() === k);
      const b = BLACK_KEYS.find(x => x.kb.toUpperCase() === k);
      if (w && !pressedKeys.current.has(k)) { pressedKeys.current.add(k); pressKey(w.note, w.octave); }
      if (b && !pressedKeys.current.has(k)) { pressedKeys.current.add(k); pressKey(b.note, b.octave); }
    };

    const upHandler = (e) => {
      if (isTypingInField()) return;
      const k = e.key.toUpperCase();
      if (!pressedKeys.current.has(k)) return;
      pressedKeys.current.delete(k);
      const w = WHITE_KEYS.find(x => x.kb.toUpperCase() === k);
      const b = BLACK_KEYS.find(x => x.kb.toUpperCase() === k);
      if (w) releaseKey(w.note, w.octave);
      if (b) releaseKey(b.note, b.octave);
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [pressKey, releaseKey]);

  useEffect(() => {
    setActiveNotes(new Set());
    setPreviewKey(null);
    setPendingChord(null);
  }, [pianoMode, session.key, session.mode]);

  const isInChord = (note, octave) => {
    if (!pendingChord) return false;
    return pendingChord.notes.includes(note + octave);
  };
  const isFreeActive = (note, octave) => activeNotes.has(note + octave);

  const chordLabel = (note, octave) => {
    if (pianoMode !== "chord") return null;
    if (!session.key) return note;
    const ch = MUSIC.buildChordFromNote(note, octave, session.key, session.mode, session.genre);
    if (!ch) return note;
    return `${ch.name}`;
  };
  const chordLabelRoman = (note, octave) => {
    if (pianoMode !== "chord" || !session.key) return null;
    const ch = MUSIC.buildChordFromNote(note, octave, session.key, session.mode, session.genre);
    return ch?.romanNumeral;
  };

  let status;
  if (pendingChord) {
    status = (
      <>
        <span className="name">{pendingChord.name}</span>
        {pendingChord.romanNumeral !== "?" && <span className="roman">{pendingChord.romanNumeral}</span>}
        <span>— Space로 추가</span>
      </>
    );
  } else if (pianoMode === "free") {
    if (!noteArr.length) status = <span>건반을 누르고 코드를 만든 뒤 Space</span>;
    else if (noteArr.length < 3) status = <span>음을 더 눌러보세요 ({noteArr.length}/3)</span>;
    else if (detected) status = (
      <>
        <span className="name">{detected.name}</span>
        {detected.romanNumeral !== "?" && <span className="roman">{detected.romanNumeral}</span>}
        <span>— Space로 추가</span>
      </>
    );
    else status = <span>감지된 코드가 없어요</span>;
  } else {
    status = <span>{session.key ? "건반을 누른 뒤 Space로 추가" : "건반을 누른 뒤 Space로 추가 (키 미설정 시 장조로 고정)"}</span>;
  }

  return (
    <section className="piano-section">
      <div className="piano-header">
        <div className="piano-title">
          Piano
        </div>
        {inferredKey && !hasKey && (
          <button className="key-badge" onClick={onConfirmKey}>
            예상 키 {inferredKey.key} {inferredKey.mode} — 확정
          </button>
        )}
        {hasKey && (
          <span className="key-badge confirmed">
            key {session.key} {session.mode}
          </span>
        )}
        <div className="mode-toggle">
          <button className={pianoMode === "free" ? "active" : ""} onClick={() => onModeChange("free")}>
            자유
          </button>
          <button className={pianoMode === "chord" ? "active" : ""} onClick={() => onModeChange("chord")}>
            코드
          </button>
        </div>
      </div>

      <div className="piano-wrap">
        <div className="piano-keys" ref={containerRef} tabIndex={0}>
          {WHITE_KEYS.map((w, i) => {
            const active = isFreeActive(w.note, w.octave);
            const isPrev = previewKey && previewKey.note === w.note && previewKey.octave === w.octave;
            const inCh = isInChord(w.note, w.octave);
            const cls = "white-key"
              + (active ? " active" : "")
              + (isPrev ? " preview" : "")
              + (inCh && !isPrev ? " in-chord" : "");
            return (
              <div key={i} className={cls}
                onMouseDown={() => pressKey(w.note, w.octave)}
                onMouseUp={() => releaseKey(w.note, w.octave)}
                onMouseLeave={() => releaseKey(w.note, w.octave)}>
                {pianoMode === "chord" ? (
                  <>
                    <span className="key-label chord">{chordLabel(w.note, w.octave)}</span>
                    {chordLabelRoman(w.note, w.octave) && (
                      <span className="key-label mono" style={{ opacity: 0.55, fontSize: 9 }}>
                        {chordLabelRoman(w.note, w.octave)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="key-label mono">{w.kb}</span>
                )}
              </div>
            );
          })}
          {BLACK_KEYS.map((b, i) => {
            const left = (b.afterWhiteIdx + 1) * (WHITE_W - 1) - BLACK_W / 2;
            const active = isFreeActive(b.note, b.octave);
            const isPrev = previewKey && previewKey.note === b.note && previewKey.octave === b.octave;
            const inCh = isInChord(b.note, b.octave);
            const cls = "black-key"
              + (active ? " active" : "")
              + (isPrev ? " preview" : "")
              + (inCh && !isPrev ? " active" : "");
            return (
              <div key={i} className={cls}
                style={{ left }}
                onMouseDown={(e) => { e.stopPropagation(); pressKey(b.note, b.octave); }}
                onMouseUp={(e) => { e.stopPropagation(); releaseKey(b.note, b.octave); }}
                onMouseLeave={(e) => { e.stopPropagation(); releaseKey(b.note, b.octave); }}>
                {pianoMode === "chord" ? (
                  <span className="key-label chord" style={{ fontSize: 9 }}>
                    {session.key ? chordLabel(b.note, b.octave) : b.note}
                  </span>
                ) : (
                  <span className="key-label mono">{b.kb}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="piano-status">{status}</div>
      </div>
    </section>
  );
}

export default Piano;
