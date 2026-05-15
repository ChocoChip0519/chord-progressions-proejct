import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CHORD_DATA } from './data.js';
import { MUSIC } from './music.js';
import { AUDIO } from './audio.js';
import { ChordGraph, ProgressionStack } from './structures.js';
import Header from './Header.jsx';
import Timeline from './Timeline.jsx';
import Recommendations from './Recommendations.jsx';
import Piano from './Piano.jsx';
import SetupModal from './SetupModal.jsx';

function App() {
  const [session, setSession] = useState(null);
  const [showSetup, setShowSetup] = useState(true);
  const [pianoMode, setPianoMode] = useState("chord");
  const [progression, setProgression] = useState([]);
  const [pendingChord, setPendingChord] = useState(null);
  const [playingIdx, setPlayingIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [confirmedFromInferred, setConfirmedFromInferred] = useState(false);

  const graphRef = useRef(null);
  const stackRef = useRef(null);

  if (!graphRef.current) {
    graphRef.current = new ChordGraph();
    stackRef.current = new ProgressionStack();
  }

  useEffect(() => {
    if (!session) return;
    graphRef.current.loadFromData(CHORD_DATA.transitions[session.genre]);
  }, [session?.genre]);

  const accent = useMemo(() => {
    if (!session) return "#6c63ff";
    return CHORD_DATA.genres.find(g => g.id === session.genre).accent;
  }, [session?.genre]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    const hex = accent.replace("#", "");
    const r = parseInt(hex.slice(0,2), 16);
    const g = parseInt(hex.slice(2,4), 16);
    const b = parseInt(hex.slice(4,6), 16);
    document.documentElement.style.setProperty("--accent-15", `rgba(${r},${g},${b},0.15)`);
    document.documentElement.style.setProperty("--accent-10", `rgba(${r},${g},${b},0.10)`);
    document.documentElement.style.setProperty("--accent-40", `rgba(${r},${g},${b},0.40)`);
  }, [accent]);

  const inferredKey = useMemo(() => {
    if (!session || session.key) return null;
    const results = MUSIC.inferKey(progression);
    return results[0] || null;
  }, [progression, session?.key]);

  const recs = useMemo(() => {
    if (!session) return [];
    const graph = graphRef.current;
    const moods = CHORD_DATA.chordMoods;
    const genre = session.genre;
    const hasKey = !!session.key;

    if (progression.length === 0) {
      const starts = CHORD_DATA.startingChords[genre];
      const dispKey = hasKey ? session.key : "C";
      const dispMode = hasKey ? session.mode : "major";
      return starts.map((r, i) => {
        const ch = MUSIC.romanToChord(r, dispKey, dispMode);
        return {
          romanNumeral: r,
          name: hasKey && ch ? ch.name : r,
          quality: ch ? ch.quality : "maj",
          weight: i === 0 ? 0.6 : 0.4,
          source: "genre",
          mood: moods[r] || "",
          chord: ch,
        };
      });
    }

    const last = progression[progression.length - 1];

    const keyConfirmed = hasKey || (inferredKey && inferredKey.confidence >= 0.7);

    // 키 미확정 → 절대음명 패턴 매칭
    if (!keyConfirmed) {
      const songs = CHORD_DATA.songs[genre] || [];
      const patternRecs = MUSIC.getAbsolutePatternRecs(progression, songs);

      // 패턴 매칭 결과 있으면 사용, 없으면 장르 전이 가중치 폴백
      if (patternRecs.length) {
        return patternRecs.map(r => ({
          romanNumeral: "?",
          name: r.name,
          weight: r.weight,
          source: "genre",
          mood: "",
          chord: MUSIC.romanToChord("I", r.rootNote, "major"),
        }));
      }
      // 폴백: 첫 코드 근음 기준으로 장르 전이 가중치
      const implied = MUSIC.impliedTonicFromProgression(progression);
      const usedKey2 = implied ? implied.key : "C";
      const usedMode2 = implied ? implied.mode : "major";
      let lastRoman2 = last.romanNumeral;
      if (!lastRoman2 || lastRoman2 === "?") {
        lastRoman2 = MUSIC.getRelativeRoman(last, usedKey2, usedMode2);
      }
      if (!lastRoman2 || lastRoman2 === "?") return [];
      if (genre === "blues" && !lastRoman2.endsWith("7")) lastRoman2 = lastRoman2 + "7";
      const fallbackRecs = graph.getRecommendations(lastRoman2, null, 4);
      return fallbackRecs.map(r => {
        const ch = MUSIC.romanToChord(r.romanNumeral, usedKey2, usedMode2);
        return {
          romanNumeral: r.romanNumeral,
          name: ch ? ch.name : r.romanNumeral,
          weight: r.weight,
          source: "genre",
          mood: CHORD_DATA.chordMoods[r.romanNumeral] || "",
          chord: ch,
        };
      });
    }

    // 키 확정 → 도수 기반 전이 가중치
    const usedKey = hasKey ? session.key : inferredKey.key;
    const usedMode = hasKey ? session.mode : inferredKey.mode;
    const diatonic = MUSIC.getDiatonicRomans(genre, usedMode);

    let lastRoman = last.romanNumeral;
    if ((!lastRoman || lastRoman === "?") && usedKey) {
      lastRoman = MUSIC.getRelativeRoman(last, usedKey, usedMode);
    }
    if (!lastRoman || lastRoman === "?") return [];

    if (genre === "blues" && !lastRoman.endsWith("7")) lastRoman = lastRoman + "7";

    const baseRecs = graph.getRecommendations(lastRoman, diatonic, 4);

    return baseRecs.map(r => {
      const ch = MUSIC.romanToChord(r.romanNumeral, usedKey, usedMode);
      return {
        romanNumeral: r.romanNumeral,
        name: ch ? ch.name : r.romanNumeral,
        weight: r.weight,
        source: "key",
        mood: CHORD_DATA.chordMoods[r.romanNumeral] || "",
        chord: ch,
      };
    });
  }, [progression, session, inferredKey]);

  const pushChord = (ch) => {
    stackRef.current.push(ch);
    setProgression(stackRef.current.getAll());
  };

  const handleStart = (sess) => {
    setSession(sess);
    setShowSetup(false);
    setConfirmedFromInferred(false);
  };

  const handleSetupOpen = () => setShowSetup(true);

  const handleUpdateSession = (sess) => {
    setSession(sess);
    setShowSetup(false);
  };

  const handlePick = (rec) => {
    let ch = rec.chord;
    if (!ch) {
      const implied = MUSIC.impliedTonicFromProgression(progression);
      const tonicKey = implied ? implied.key : "C";
      const tonicMode = implied ? implied.mode : session.mode;
      ch = MUSIC.romanToChord(rec.romanNumeral, tonicKey, tonicMode);
      if (ch) ch.romanNumeral = rec.romanNumeral;
    }
    if (!ch) return;

    if (pendingChord && pendingChord.romanNumeral === ch.romanNumeral) {
      pushChord(ch);
      setPendingChord(null);
      return;
    }
    AUDIO.playChord(ch.notes, "4n");
    setPendingChord(ch);
  };

  const handleAddChord = (ch) => {
    pushChord(ch);
  };

  const handleUndo = () => {
    stackRef.current.undo();
    setProgression(stackRef.current.getAll());
  };
  const handleRedo = () => {
    stackRef.current.redo();
    setProgression(stackRef.current.getAll());
  };
  const handleClear = () => {
    stackRef.current.clear();
    setProgression([]);
    setPlayingIdx(-1);
    setPendingChord(null);
  };
  const handleRemove = (idx) => {
    const next = progression.filter((_, i) => i !== idx);
    stackRef.current.set(next);
    setProgression(next);
  };

  const handlePlayStop = async () => {
    if (isPlaying) {
      window.__STOP_PLAYBACK = true;
      setIsPlaying(false);
      setPlayingIdx(-1);
      return;
    }
    setIsPlaying(true);
    await AUDIO.playProgression(progression, session.bpm, (i) => {
      setPlayingIdx(i);
    });
    setIsPlaying(false);
    setPlayingIdx(-1);
  };

  const handleAutoGen = () => {
    if (!session.key) return;
    const graph = graphRef.current;
    const diatonic = MUSIC.getDiatonicRomans(session.genre, session.mode);
    const starts = CHORD_DATA.startingChords[session.genre];
    const start = starts[Math.floor(Math.random() * starts.length)];
    const path = graph.randomWalk(start, 5, diatonic);
    const chords = path.map(r => MUSIC.romanToChord(r, session.key, session.mode)).filter(Boolean);
    stackRef.current.set(chords);
    setProgression(chords);
  };

  const handleConfirmInferredKey = () => {
    if (!inferredKey) return;
    setSession({ ...session, key: inferredKey.key, mode: inferredKey.mode });
    setConfirmedFromInferred(true);
  };

  useEffect(() => {
    if (showSetup || !session) return;
    const onKey = (e) => {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Escape") return;

      if (e.key === "Escape") {
        if (pendingChord) { e.preventDefault(); setPendingChord(null); }
        return;
      }

      if (!recs.length) return;
      e.preventDefault();
      const currIdx = pendingChord
        ? recs.findIndex(r => r.romanNumeral === pendingChord.romanNumeral)
        : -1;
      let nextIdx;
      if (currIdx < 0) {
        nextIdx = 0;
      } else {
        const delta = e.key === "ArrowRight" ? 1 : -1;
        nextIdx = Math.max(0, Math.min(recs.length - 1, currIdx + delta));
      }
      const rec = recs[nextIdx];
      if (!rec || !rec.chord) return;
      AUDIO.playChord(rec.chord.notes, "4n");
      setPendingChord(rec.chord);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [recs, pendingChord, showSetup, session]);

  if (!session || showSetup) {
    return (
      <>
        {session && (
          <div className="app">
            <Header session={session} onOpenSetup={() => {}} />
            <Timeline progression={progression} currentIdx={progression.length - 1}
              playingIdx={-1} isPlaying={false}
              canUndo={false} canRedo={false} hasKey={!!session.key}
              onUndo={() => {}} onRedo={() => {}} onPlayStop={() => {}}
              onAutoGen={() => {}} onClear={() => {}} onRemove={() => {}}
            />
          </div>
        )}
        <SetupModal initial={session} onStart={session ? handleUpdateSession : handleStart}
          onCancel={session ? () => setShowSetup(false) : null} />
      </>
    );
  }

  return (
    <div className="app">
      <Header session={session} onOpenSetup={handleSetupOpen} />
      <Timeline
        progression={progression}
        currentIdx={progression.length - 1}
        playingIdx={playingIdx}
        isPlaying={isPlaying}
        canUndo={stackRef.current.canUndo()}
        canRedo={stackRef.current.canRedo()}
        hasKey={!!session.key}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPlayStop={handlePlayStop}
        onAutoGen={handleAutoGen}
        onClear={handleClear}
        onRemove={handleRemove}
      />
      <Recommendations
        recs={recs}
        progression={progression}
        inferredKey={inferredKey}
        hasKey={!!session.key}
        pendingChord={pendingChord}
        onPick={handlePick}
        onConfirmKey={handleConfirmInferredKey}
      />
      <Piano
        pianoMode={pianoMode}
        onModeChange={setPianoMode}
        session={session}
        accent={accent}
        inferredKey={inferredKey}
        hasKey={!!session.key}
        onConfirmKey={handleConfirmInferredKey}
        pendingChord={pendingChord}
        setPendingChord={setPendingChord}
        onAddChord={handleAddChord}
      />
    </div>
  );
}

export default App;
