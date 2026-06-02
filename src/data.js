import SONGS from './data/songs.json';

// songs.json의 roman 배열에서 전이 빈도를 집계해 가중치 테이블을 생성한다.
// getUpgradeMap: song => {원래도수: 변환도수} — jazz처럼 표기 정규화가 필요한 장르에 사용
function buildTransitionsFromSongs(songList, getUpgradeMap) {
  const counts = {};
  for (const song of songList) {
    const map = getUpgradeMap ? getUpgradeMap(song) : null;
    const romans = map ? song.roman.map(r => map[r] ?? r) : song.roman;
    for (let i = 0; i < romans.length - 1; i++) {
      const from = romans[i];
      const to   = romans[i + 1];
      if (!counts[from]) counts[from] = {};
      counts[from][to] = (counts[from][to] || 0) + 1;
    }
  }
  const result = {};
  for (const from in counts) {
    const row   = counts[from];
    const total = Object.values(row).reduce((s, v) => s + v, 0);
    result[from] = {};
    for (const to in row) {
      result[from][to] = Math.round((row[to] / total) * 100) / 100;
    }
  }
  return result;
}

// jazz songs.json은 7th 생략 표기(ii, V, I…)를 사용하므로
// ChordGraph 노드 키(ii7, V7, Imaj7…)에 맞게 모드별로 업그레이드한다.
const JAZZ_MAJOR_UP = {
  I: "Imaj7", ii: "ii7", iii: "iii7", IV: "IVmaj7",
  V: "V7", vi: "vi7", bII: "bII7", II: "II7",
};
const JAZZ_MINOR_UP = {
  i: "im7", ii: "iiº", III: "IIImaj7", iv: "iv7",
  V: "V7", VI: "VImaj7", VII: "VII7", bII: "bII7",
};

export const CHORD_DATA = {
  songs: SONGS,
  transitions: {
    pop:   buildTransitionsFromSongs(SONGS.pop),
    jazz:  buildTransitionsFromSongs(SONGS.jazz, s => s.mode === "minor" ? JAZZ_MINOR_UP : JAZZ_MAJOR_UP),
    rock:  buildTransitionsFromSongs(SONGS.rock),
    blues: buildTransitionsFromSongs(SONGS.blues),
  },

  startingChords: {
    pop:   ["I", "vi"],
    jazz:  ["Imaj7", "ii7"],
    rock:  ["I"],
    blues: ["I7"],
  },

  progressions: {
    pop:   [["I","V","vi","IV"], ["I","IV","V","I"], ["vi","IV","I","V"]],
    jazz:  [["ii7","V7","Imaj7"], ["Imaj7","vi7","ii7","V7"], ["iii7","vi7","ii7","V7"]],
    rock:  [["I","IV","V","I"], ["I","V","IV","I"], ["I","bVII","IV","I"]],
    blues: [["I7","I7","I7","I7","IV7","IV7","I7","I7","V7","IV7","I7","V7"]],
  },

  chordMoods: {
    I:    "밝고 안정적 — 집에 돌아온 느낌",
    ii:   "부드럽게 흘러가는 느낌",
    iii:  "약간 신비롭고 따뜻한 느낌",
    IV:   "풍성하고 따뜻하게 열리는 느낌",
    V:    "긴장감 — 뭔가 일어날 것 같은 느낌",
    vi:   "감성적이고 슬픈 느낌",
    "viiº": "불안하고 긴박한 느낌",
    bVII: "강렬하고 록적인 에너지",
    I7:      "블루지하고 풍성한 느낌",
    IV7:     "부드럽고 느긋한 블루스",
    V7:      "강하게 해결을 원하는 긴장감",
    Imaj7:   "따뜻하고 풍성한 재즈 토닉",
    ii7:     "자연스럽게 흘러가는 느낌",
    iii7:    "감성적이고 색채감 있는 느낌",
    IVmaj7:  "깊고 따뜻하게 열리는 느낌",
    vi7:     "달콤하고 감성적인 느낌",
    im7:     "어둡고 깊은 재즈 마이너 토닉",
    IIImaj7: "밝게 전환되는 느낌",
    iv7:     "어둡고 감성적인 느낌",
    VImaj7:  "온화하고 넓은 느낌",
    VII7:    "강렬하게 해결을 원하는 느낌",
    bII7:    "삼전음 대리코드 — V7 대신 반음 위 도미넌트로 해결",
    VI7:     "부속 도미넌트 — ii7을 향해 강하게 당기는 느낌",
    II7:     "부속 도미넌트 — V7을 향해 강하게 당기는 느낌",
  },

  // 동일 코드를 연속으로 몇 번까지 추천에 포함할지 (이 횟수부터는 자기 전이 제외)
  maxRepeat: { pop: 1, jazz: 1, rock: 2, blues: 3 },

  genres: [
    { id: "pop",   name: "Pop",   label: "Pop",   example: "I–V–vi–IV", accent: "#6c63ff" },
    { id: "jazz",  name: "Jazz",  label: "Jazz",  example: "ii7–V7–Imaj7", accent: "#e07b39" },
    { id: "rock",  name: "Rock",  label: "Rock",  example: "I–IV–V–I", accent: "#d63031" },
    { id: "blues", name: "Blues", label: "Blues", example: "12-bar",   accent: "#2980b9" },
  ],

  keys: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
};
