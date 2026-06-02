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
import ProjectDashboard from './ProjectDashboard.jsx';
import LandingPage from './LandingPage.jsx';
import { useProjectStore } from './useProjectStore.js';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const [session, setSession] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [pianoMode, setPianoMode] = useState("free");
  const [progression, setProgression] = useState([]);
  const [pendingChord, setPendingChord] = useState(null);
  const [playingIdx, setPlayingIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const graphRef = useRef(null);
  const stackRef = useRef(null);

  if (!graphRef.current) {
    graphRef.current = new ChordGraph();
    stackRef.current = new ProgressionStack();
  }

  const store = useProjectStore();

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
          name: ch ? ch.name : r,
          quality: ch ? ch.quality : "maj",
          weight: i === 0 ? 0.6 : 0.4,
          source: "genre",
          mood: moods[r] || "",
          chord: ch,
        };
      });
    }

    const last = progression[progression.length - 1];

    // 끝에서부터 동일 코드가 몇 번 연속인지 카운트 (romanNumeral 기준)
    let lastRun = 1;
    for (let i = progression.length - 2; i >= 0; i--) {
      if (progression[i].romanNumeral === last.romanNumeral) lastRun++;
      else break;
    }
    const allowSelf = lastRun < (CHORD_DATA.maxRepeat[genre] ?? 1);

    const keyConfirmed = hasKey || (inferredKey && inferredKey.confidence >= 0.7);

    if (!keyConfirmed) {
      const songs = CHORD_DATA.songs[genre] || [];
      const patternRecs = MUSIC.getAbsolutePatternRecs(progression, songs);

      if (patternRecs.length) {
        return patternRecs
          .filter(r => allowSelf || r.rootNote !== last.rootNote)
          .slice(0, 4)
          .map(r => ({
            romanNumeral: "?",
            name: r.name,
            weight: r.weight,
            source: "genre",
            mood: "",
            chord: MUSIC.romanToChord("I", r.rootNote, "major"),
          }));
      }
      const implied = MUSIC.impliedTonicFromProgression(progression);
      const usedKey2 = implied ? implied.key : "C";
      const usedMode2 = implied ? implied.mode : "major";
      let lastRoman2 = last.romanNumeral;
      if (!lastRoman2 || lastRoman2 === "?") {
        lastRoman2 = MUSIC.getRelativeRoman(last, usedKey2, usedMode2);
      }
      if (!lastRoman2 || lastRoman2 === "?") return [];
      if (genre === "blues" && !lastRoman2.endsWith("7")) lastRoman2 = lastRoman2 + "7";
      const fallbackRecs = graph.getRecommendations(lastRoman2, null, 5);
      return fallbackRecs
        .filter(r => allowSelf || r.romanNumeral !== lastRoman2)
        .slice(0, 4)
        .map(r => {
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

    const usedKey = hasKey ? session.key : inferredKey.key;
    const usedMode = hasKey ? session.mode : inferredKey.mode;
    const diatonic = MUSIC.getDiatonicRomans(genre, usedMode);

    let lastRoman = last.romanNumeral;
    if ((!lastRoman || lastRoman === "?") && usedKey) {
      lastRoman = MUSIC.getRelativeRoman(last, usedKey, usedMode);
    }
    if (!lastRoman || lastRoman === "?") return [];

    if (genre === "blues" && !lastRoman.endsWith("7")) lastRoman = lastRoman + "7";

    const baseRecs = graph.getRecommendations(lastRoman, diatonic, 5, genre);

    return baseRecs
      .filter(r => allowSelf || r.romanNumeral !== lastRoman)
      .slice(0, 4)
      .map(r => {
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

  const songMatches = useMemo(() => {
    if (!session || !progression.length) return [];
    return MUSIC.findMatchingSongs(progression, CHORD_DATA.songs[session.genre] || []);
  }, [progression, session?.genre]);

  // isDirty 추적 — workspace 진입 후 progression/session 변경 시
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (currentView !== 'workspace' || isFirstRender.current) return;
    setIsDirty(true);
  }, [progression]);

  useEffect(() => {
    if (currentView !== 'workspace' || isFirstRender.current) return;
    setIsDirty(true);
  }, [session]);

  // Ctrl+S 저장
  useEffect(() => {
    if (currentView !== 'workspace') return;
    const onKey = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentView, activeProjectId, progression, session]);

  const pushChord = (ch) => {
    stackRef.current.push(ch);
    setProgression(stackRef.current.getAll());
  };

  const retroactivelyUpdateRomans = (chords, key, mode) => {
    return chords.map(ch => {
      if (!key) return ch;
      const roman = MUSIC.getRelativeRoman(ch, key, mode);
      return roman && roman !== "?" ? { ...ch, romanNumeral: roman } : ch;
    });
  };

  // 새 프로젝트: SetupModal Begin → 이 함수
  const handleStart = (sess) => {
    const project = store.createProject(sess);
    setActiveProjectId(project.id);
    setSession(sess);
    stackRef.current.clear();
    setProgression([]);
    setPendingChord(null);
    setShowSetup(false);
    isFirstRender.current = true;
    setIsDirty(false);
    // 마운트 후 다음 렌더부터 dirty 추적
    setTimeout(() => { isFirstRender.current = false; }, 0);
  };

  const handleSetupOpen = () => setShowSetup(true);

  const handleUpdateSession = (sess) => {
    if (isPlaying) {
      AUDIO.stopPlayback();
      setIsPlaying(false);
      setPlayingIdx(-1);
    }
    if (sess.key && progression.length > 0) {
      const updated = retroactivelyUpdateRomans(progression, sess.key, sess.mode);
      stackRef.current.set(updated);
      setProgression(updated);
    }
    setSession(sess);
    setShowSetup(false);
  };

  // 저장
  const handleSave = () => {
    if (!activeProjectId) return;
    store.saveProject(activeProjectId, { progression, session });
    setIsDirty(false);
  };

  // 대시보드 → 작업창 열기
  const handleOpenProject = (id) => {
    const proj = store.getProject(id);
    if (!proj) return;
    AUDIO.ensureStarted();
    setSession(proj.session);
    stackRef.current.load(proj.progression);
    setProgression(proj.progression);
    setActiveProjectId(id);
    setPendingChord(null);
    setShowSetup(false);
    isFirstRender.current = true;
    setIsDirty(false);
    setTimeout(() => { isFirstRender.current = false; }, 0);
    setCurrentView('workspace');
  };

  // 대시보드 → 새 프로젝트 버튼
  const handleNewProject = () => {
    setSession(null);
    setActiveProjectId(null);
    stackRef.current.clear();
    setProgression([]);
    setPendingChord(null);
    setShowSetup(true);
    setCurrentView('workspace');
  };

  // 작업창 → 대시보드로 돌아가기
  const handleBackToDashboard = () => {
    if (isDirty) {
      if (!window.confirm('저장하지 않은 변경사항이 있습니다. 대시보드로 이동하시겠습니까?')) return;
    }
    if (isPlaying) {
      AUDIO.stopPlayback();
      setIsPlaying(false);
      setPlayingIdx(-1);
    }
    setCurrentView('dashboard');
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

    const isSamePending = pendingChord && (
      ch.romanNumeral !== "?"
        ? pendingChord.romanNumeral === ch.romanNumeral
        : pendingChord.rootNote === ch.rootNote && pendingChord.name === ch.name
    );
    if (isSamePending) {
      pushChord(ch);
      setPendingChord(null);
      return;
    }
    AUDIO.playChord(ch.notes, "4n");
    setPendingChord(ch);
  };

  const handleAddChord = (ch) => { pushChord(ch); };

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
      AUDIO.stopPlayback();
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
    const path = graph.randomWalk(start, 5, diatonic, session.genre);
    const chords = path.map(r => MUSIC.romanToChord(r, session.key, session.mode)).filter(Boolean);
    stackRef.current.set(chords);
    setProgression(chords);
  };

  const handleConfirmInferredKey = () => {
    if (!inferredKey) return;
    const { key, mode } = inferredKey;
    if (progression.length > 0) {
      const updated = retroactivelyUpdateRomans(progression, key, mode);
      stackRef.current.set(updated);
      setProgression(updated);
    }
    setSession({ ...session, key, mode });
  };

  // 키보드 단축키 (추천 카드 탐색)
  useEffect(() => {
    if (currentView !== 'workspace' || showSetup || !session) return;
    const onKey = (e) => {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Escape") return;

      if (e.key === "Escape") {
        e.preventDefault();
        if (pendingChord) {
          setPendingChord(null);
        } else {
          const all = stackRef.current.getAll();
          if (all.length) {
            stackRef.current.set(all.slice(0, -1));
            setProgression(stackRef.current.getAll());
          }
        }
        return;
      }

      if (!recs.length) return;
      e.preventDefault();
      const currIdx = pendingChord
        ? recs.findIndex(r =>
            r.romanNumeral !== "?"
              ? r.romanNumeral === pendingChord.romanNumeral
              : r.chord?.rootNote === pendingChord.rootNote && r.chord?.name === pendingChord.name
          )
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
  }, [recs, pendingChord, showSetup, session, currentView]);

  // ── 화면 분기 ──

  if (currentView === 'landing') {
    return (
      <LandingPage onEnter={() => setCurrentView('dashboard')} />
    );
  }

  if (currentView === 'dashboard') {
    return (
      <ProjectDashboard
        projects={store.projects}
        folders={store.folders}
        onOpenProject={handleOpenProject}
        onNewProject={handleNewProject}
        onDeleteProject={store.deleteProject}
        onRenameProject={store.renameProject}
        onMoveProject={store.moveProject}
        onCreateFolder={store.createFolder}
        onDeleteFolder={store.deleteFolder}
        onRenameFolder={store.renameFolder}
      />
    );
  }

  // workspace
  const activeProject = activeProjectId ? store.getProject(activeProjectId) : null;

  if (!session || showSetup) {
    return (
      <>
        {session && (
          <div className="app">
            <Header
              session={session}
              onOpenSetup={() => {}}
              onBackToDashboard={handleBackToDashboard}
              projectName={activeProject?.name}
            />
            <Timeline progression={progression} currentIdx={progression.length - 1}
              playingIdx={-1} isPlaying={false}
              canUndo={false} canRedo={false} hasKey={!!session.key}
              onUndo={() => {}} onRedo={() => {}} onPlayStop={() => {}}
              onAutoGen={() => {}} onClear={() => {}} onRemove={() => {}}
              onSave={handleSave} isDirty={isDirty}
              songMatches={songMatches}
            />
          </div>
        )}
        <SetupModal
          initial={session}
          onStart={session ? handleUpdateSession : handleStart}
          onCancel={session ? () => setShowSetup(false) : (activeProjectId ? null : handleBackToDashboard)}
        />
      </>
    );
  }

  return (
    <div className="app">
      <Header
        session={session}
        onOpenSetup={handleSetupOpen}
        onBackToDashboard={handleBackToDashboard}
        projectName={activeProject?.name}
      />
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
        onSave={handleSave}
        isDirty={isDirty}
        songMatches={songMatches}
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
