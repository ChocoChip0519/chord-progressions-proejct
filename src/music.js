const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const MAJOR_INTERVALS = [0,2,4,5,7,9,11];
const MINOR_INTERVALS = [0,2,3,5,7,8,10];

function pc(note) {
  return NOTES.indexOf(note);
}
function noteFromPc(p) {
  return NOTES[((p % 12) + 12) % 12];
}
function midi(note, octave) {
  return (octave + 1) * 12 + pc(note);
}
function midiToNoteName(m) {
  const oct = Math.floor(m / 12) - 1;
  return NOTES[m % 12] + oct;
}

function parseRoman(roman) {
  let s = roman;
  const isFlat = s.startsWith("b");
  if (isFlat) s = s.slice(1);

  const isSeventh = s.endsWith("7");
  if (isSeventh) s = s.slice(0, -1);

  const isDim = s.endsWith("º") || s.endsWith("°") || s.endsWith("o");
  if (isDim) s = s.slice(0, -1);

  const lower = s === s.toLowerCase();
  const map = { i:0, ii:1, iii:2, iv:3, v:4, vi:5, vii:6 };
  const degree = map[s.toLowerCase()];
  return { degree, quality: isDim ? "dim" : (lower ? "min" : "maj"), isSeventh, isFlat };
}

function scale(key, mode) {
  const intervals = mode === "minor" ? MINOR_INTERVALS : MAJOR_INTERVALS;
  const root = pc(key);
  return intervals.map(i => noteFromPc(root + i));
}

function chordIntervals(quality, isSeventh) {
  switch (quality) {
    case "maj":  return isSeventh ? [0, 4, 7, 10] : [0, 4, 7];
    case "min":  return isSeventh ? [0, 3, 7, 10] : [0, 3, 7];
    case "dim":  return [0, 3, 6];
    default:     return [0, 4, 7];
  }
}

function romanToChord(roman, key, mode, octave = 4) {
  const { degree, quality, isSeventh, isFlat } = parseRoman(roman);
  if (degree == null) return null;

  const sc = scale(key, mode);
  let rootName = sc[degree];
  let rootPc = pc(rootName);
  if (isFlat) {
    rootPc = ((rootPc - 1) % 12 + 12) % 12;
    rootName = noteFromPc(rootPc);
  }

  const intervals = chordIntervals(quality, isSeventh);
  const baseMidi = midi(rootName, octave);
  const notes = intervals.map(iv => midiToNoteName(baseMidi + iv));

  const qLabel = quality === "min" ? "m"
               : quality === "dim" ? "dim"
               : "";
  const seventhLabel = isSeventh ? "7" : "";
  const name = rootName + qLabel + seventhLabel;

  const qFinal = isSeventh ? (quality === "min" ? "min7" : "dom7") : quality;

  return {
    romanNumeral: roman,
    name,
    rootNote: rootName,
    quality: qFinal,
    notes,
  };
}

function buildChordFromNote(noteName, octave, key, mode, genre) {
  if (!key) {
    const baseMidi = midi(noteName, octave);
    const intervals = [0, 4, 7];
    const notes = intervals.map(iv => midiToNoteName(baseMidi + iv));
    return {
      romanNumeral: "?",
      name: noteName,
      rootNote: noteName,
      quality: "maj",
      notes,
    };
  }
  const diatonic = getDiatonicRomans(genre, mode);
  const np = pc(noteName);
  let bestRoman = diatonic[0];
  let bestDist = 99;
  for (const r of diatonic) {
    const ch = romanToChord(r, key, mode, octave);
    if (!ch) continue;
    const d = Math.min(
      (pc(ch.rootNote) - np + 12) % 12,
      (np - pc(ch.rootNote) + 12) % 12
    );
    if (d < bestDist) { bestDist = d; bestRoman = r; }
  }
  return romanToChord(bestRoman, key, mode, octave);
}

function getDiatonicRomans(genre, mode) {
  if (genre === "blues") return ["I7","IV7","V7"];
  if (mode === "minor") return ["i","iiº","III","iv","v","VI","VII"];
  return ["I","ii","iii","IV","V","vi","viiº"];
}

function detectChord(noteNames, key, mode) {
  if (noteNames.length < 3) return null;
  const pcs = [...new Set(noteNames.map(n => {
    const m = n.match(/^([A-G]#?)/);
    return m ? pc(m[1]) : -1;
  }).filter(x => x >= 0))];
  if (pcs.length < 3) return null;

  const tries = [
    { quality: "maj", intervals: [0, 4, 7] },
    { quality: "min", intervals: [0, 3, 7] },
    { quality: "dim", intervals: [0, 3, 6] },
    { quality: "maj7", intervals: [0, 4, 7, 11] },
    { quality: "dom7", intervals: [0, 4, 7, 10] },
    { quality: "min7", intervals: [0, 3, 7, 10] },
  ];
  for (const rootPc of pcs) {
    for (const t of tries) {
      const needed = t.intervals.map(iv => (rootPc + iv) % 12);
      const matches = needed.every(p => pcs.includes(p));
      if (matches && pcs.length === needed.length) {
        const rootName = noteFromPc(rootPc);
        const qLabel = t.quality === "min" ? "m"
                     : t.quality === "dim" ? "dim"
                     : t.quality === "maj7" ? "maj7"
                     : t.quality === "dom7" ? "7"
                     : t.quality === "min7" ? "m7"
                     : "";
        const sorted = [...noteNames].sort((a, b) => {
          const am = midi(a.match(/^([A-G]#?)/)[1], parseInt(a.slice(-1)));
          const bm = midi(b.match(/^([A-G]#?)/)[1], parseInt(b.slice(-1)));
          return am - bm;
        });
        let roman = "?";
        if (key) {
          const diatonic = getDiatonicRomans("pop", mode);
          for (const r of diatonic) {
            const ch = romanToChord(r, key, mode);
            if (ch && ch.rootNote === rootName) {
              if ((ch.quality === t.quality) ||
                  (ch.quality === "maj" && t.quality === "maj") ||
                  (ch.quality === "min" && t.quality === "min")) {
                roman = r;
                break;
              }
            }
          }
        }
        return {
          romanNumeral: roman,
          name: rootName + qLabel,
          rootNote: rootName,
          quality: t.quality,
          notes: sorted,
        };
      }
    }
  }
  return null;
}

function inferKey(playedChords) {
  if (playedChords.length < 3) return [];
  const rootPcs = playedChords.map(c => pc(c.rootNote));
  const qualities = playedChords.map(c => c.quality);

  const results = [];
  for (const keyName of NOTES) {
    for (const mode of ["major", "minor"]) {
      const sc = scale(keyName, mode);
      const scPcs = sc.map(pc);
      let score = 0;
      for (let i = 0; i < playedChords.length; i++) {
        if (scPcs.includes(rootPcs[i])) score += 1;
        if (rootPcs[i] === pc(keyName)) {
          if (mode === "major" && (qualities[i] === "maj" || qualities[i] === "dom7" || qualities[i] === "maj7")) score += 0.5;
          if (mode === "minor" && (qualities[i] === "min" || qualities[i] === "min7")) score += 0.5;
        }
      }
      results.push({ key: keyName, mode, confidence: score / playedChords.length });
    }
  }
  results.sort((a, b) => b.confidence - a.confidence);
  const top = results[0];
  if (top.confidence < 0.7) return [];
  return [top];
}

function getRelativeRoman(chord, key, mode) {
  if (!chord || !key) return "?";
  const tonicPc = pc(key);
  const chordPc = pc(chord.rootNote);
  const interval = (chordPc - tonicPc + 12) % 12;

  const majorMap = { 0: "I", 2: "ii", 4: "iii", 5: "IV", 7: "V", 9: "vi", 10: "bVII", 11: "vii" };
  const minorMap = { 0: "i", 2: "ii", 3: "III", 5: "iv", 7: "V",  8: "VI", 10: "VII" };
  const map = mode === "minor" ? minorMap : majorMap;
  let base = map[interval];
  if (!base) return "?";

  const isSeventh = chord.quality && chord.quality.endsWith("7");

  if (chord.quality === "min" || chord.quality === "min7") {
    base = base.toLowerCase();
  } else if (chord.quality === "maj" || chord.quality === "maj7" || chord.quality === "dom7") {
    if (base === base.toLowerCase()) base = base.charAt(0).toUpperCase() + base.slice(1);
  } else if (chord.quality === "dim") {
    base = base.toLowerCase() + "º";
  }
  return isSeventh ? base + "7" : base;
}

function impliedTonicFromProgression(progression) {
  if (!progression || !progression.length) return null;
  const first = progression[0];
  const mode = (first.quality === "min" || first.quality === "min7") ? "minor" : "major";
  return { key: first.rootNote, mode };
}

export const MUSIC = {
  NOTES,
  pc, noteFromPc, midi, midiToNoteName,
  scale,
  romanToChord,
  buildChordFromNote,
  getDiatonicRomans,
  detectChord,
  inferKey,
  parseRoman,
  getRelativeRoman,
  impliedTonicFromProgression,
};
