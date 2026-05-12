import { create } from 'zustand';
import { Stack } from '@/lib/datastructures/Stack';
import type { Mode } from '@/lib/music/degreeConverter';
import { detectMode } from '@/lib/music/degreeConverter';
import type { CardRow } from '@/lib/supabase/cardsApi';

export interface ChordEntry {
  chord: string;
  degree: string;
}

interface EditorState {
  title: string;
  genre: string;
  bpm: number;
  mode: Mode;
  tonicMidi: number;
  historyStack: Stack<ChordEntry>;
  historyVersion: number;

  setTitle: (t: string) => void;
  setGenre: (g: string) => void;
  setBpm: (n: number) => void;
  confirmChord: (entry: ChordEntry) => void;
  undoChord: () => void;
  resetSession: () => void;
  loadFromCard: (card: CardRow) => void;
  getHistory: () => ChordEntry[];
  getDegrees: () => string[];
}

export const useEditorStore = create<EditorState>((set, get) => ({
  title: '',
  genre: 'pop',
  bpm: 120,
  mode: 'major',
  tonicMidi: 60,
  historyStack: new Stack<ChordEntry>(),
  historyVersion: 0,

  setTitle: (t) => set({ title: t }),
  setGenre: (g) => set({ genre: g }),
  setBpm: (n) => set({ bpm: Math.min(300, Math.max(40, n)) }),

  confirmChord: (entry) => {
    const { historyStack, historyVersion } = get();
    if (historyStack.isEmpty()) {
      const { mode, tonicMidi } = detectMode(entry.chord);
      set({ mode, tonicMidi });
    }
    historyStack.push(entry);
    set({ historyVersion: historyVersion + 1 });
  },

  undoChord: () => {
    const { historyStack, historyVersion } = get();
    historyStack.pop();
    set({ historyVersion: historyVersion + 1 });
  },

  resetSession: () => {
    const fresh = new Stack<ChordEntry>();
    set({
      title: '',
      genre: 'pop',
      bpm: 120,
      mode: 'major',
      tonicMidi: 60,
      historyStack: fresh,
      historyVersion: 0,
    });
  },

  loadFromCard: (card) => {
    const stack = new Stack<ChordEntry>();
    const chords = card.chord_progression;
    if (chords.length > 0) {
      const { mode, tonicMidi } = detectMode(chords[0]);
      chords.forEach((chord) => stack.push({ chord, degree: '' }));
      set({
        title: card.title,
        genre: card.genre,
        bpm: card.bpm,
        mode,
        tonicMidi,
        historyStack: stack,
        historyVersion: 1,
      });
    } else {
      set({ title: card.title, genre: card.genre, bpm: card.bpm });
    }
  },

  getHistory: () => get().historyStack.toArray(),
  getDegrees: () => get().historyStack.toArray().map((e) => e.degree),
}));
