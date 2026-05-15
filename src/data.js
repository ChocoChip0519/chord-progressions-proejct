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
      I:  { vi: 0.30, ii: 0.28, IV: 0.22, V: 0.20 },
      ii: { V: 0.68, IV: 0.18, I: 0.09, vi: 0.05 },
      V:  { I: 0.58, vi: 0.24, IV: 0.13, ii: 0.05 },
      vi: { ii: 0.52, V: 0.28, IV: 0.20 },
      IV: { ii: 0.38, V: 0.34, I: 0.23, vi: 0.05 },
      iii:{ vi: 0.60, IV: 0.25, I: 0.15 },
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
    jazz:  ["I", "ii"],
    rock:  ["I"],
    blues: ["I7"],
  },

  progressions: {
    pop:   [["I","V","vi","IV"], ["I","IV","V","I"], ["vi","IV","I","V"]],
    jazz:  [["ii","V","I"], ["I","vi","ii","V"], ["iii","vi","ii","V"]],
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
    I7:   "블루지하고 풍성한 느낌",
    IV7:  "부드럽고 느긋한 블루스",
    V7:   "강하게 해결을 원하는 긴장감",
  },

  genres: [
    { id: "pop",   name: "Pop",   label: "Pop",   example: "I–V–vi–IV", accent: "#6c63ff" },
    { id: "jazz",  name: "Jazz",  label: "Jazz",  example: "ii–V–I",   accent: "#e07b39" },
    { id: "rock",  name: "Rock",  label: "Rock",  example: "I–IV–V–I", accent: "#d63031" },
    { id: "blues", name: "Blues", label: "Blues", example: "12-bar",   accent: "#2980b9" },
  ],

  keys: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
};
