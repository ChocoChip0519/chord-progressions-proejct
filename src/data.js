import SONGS from './data/songs.json';

export const CHORD_DATA = {
  songs: SONGS,
  transitions: {
    pop: {
      I:   { IV: 0.28, V: 0.25, vi: 0.23, ii: 0.13, iii: 0.07 },
      IV:  { V: 0.38, I: 0.28, ii: 0.18, vi: 0.09, IV: 0.07 },
      V:   { I: 0.52, vi: 0.28, IV: 0.15, ii: 0.05 },
      vi:  { IV: 0.38, V: 0.27, ii: 0.19, I: 0.11, iii: 0.05 },
      ii:  { V: 0.62, IV: 0.22, I: 0.11, vi: 0.05 },
      iii: { vi: 0.52, IV: 0.28, I: 0.20 },
    },
    jazz: {
      "Imaj7":  { "vi7": 0.25, "ii7": 0.25, "IVmaj7": 0.20, "V7": 0.15, "VI7": 0.10, "bII7": 0.05 },
      "ii7":    { "V7": 0.55, "bII7": 0.20, "IVmaj7": 0.12, "Imaj7": 0.08, "vi7": 0.05 },
      "V7":     { "Imaj7": 0.60, "vi7": 0.20, "IVmaj7": 0.10, "ii7": 0.05, "bII7": 0.05 },
      "vi7":    { "ii7": 0.50, "V7": 0.25, "IVmaj7": 0.15, "VI7": 0.10 },
      "IVmaj7": { "ii7": 0.35, "V7": 0.30, "Imaj7": 0.20, "vi7": 0.10, "bII7": 0.05 },
      "iii7":   { "vi7": 0.55, "IVmaj7": 0.25, "Imaj7": 0.20 },
      "bII7":   { "Imaj7": 0.80, "vi7": 0.20 },
      "VI7":    { "ii7": 0.70, "V7": 0.20, "IVmaj7": 0.10 },
      "II7":    { "V7": 0.75, "ii7": 0.25 },
    },
    rock: {
      I:    { IV: 0.34, V: 0.32, vi: 0.19, bVII: 0.09, ii: 0.06 },
      IV:   { I: 0.34, V: 0.32, vi: 0.18, bVII: 0.11, ii: 0.05 },
      V:    { I: 0.58, IV: 0.24, vi: 0.14, bVII: 0.04 },
      vi:   { IV: 0.40, I: 0.30, V: 0.26, ii: 0.04 },
      bVII: { IV: 0.42, I: 0.34, V: 0.24 },
      ii:   { V: 0.55, IV: 0.30, I: 0.15 },
      iii:  { vi: 0.5, IV: 0.3, I: 0.2 },
    },
    blues: {
      I7:  { IV7: 0.50, V7: 0.30, I7: 0.20 },
      IV7: { I7: 0.60, V7: 0.30, IV7: 0.10 },
      V7:  { IV7: 0.50, I7: 0.40, V7: 0.10 },
    },
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

  genres: [
    { id: "pop",   name: "Pop",   label: "Pop",   example: "I–V–vi–IV", accent: "#6c63ff" },
    { id: "jazz",  name: "Jazz",  label: "Jazz",  example: "ii7–V7–Imaj7", accent: "#e07b39" },
    { id: "rock",  name: "Rock",  label: "Rock",  example: "I–IV–V–I", accent: "#d63031" },
    { id: "blues", name: "Blues", label: "Blues", example: "12-bar",   accent: "#2980b9" },
  ],

  keys: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
};
