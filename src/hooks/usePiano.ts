import { useState, useRef, useCallback } from 'react';
import { midiToFreq } from '@/lib/music/chordParser';

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playNote(midi: number, duration = 0.8): void {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();

  const freq = midiToFreq(midi);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export interface UsePianoReturn {
  pressedMidi: Set<number>;
  recommendMidi: Set<number>;
  pressKey: (midi: number) => void;
  releaseKey: (midi: number) => void;
  playChord: (notes: number[], duration?: number) => void;
  setRecommendMidi: (midiSet: Set<number>) => void;
  clearRecommendMidi: () => void;
}

export function usePiano(): UsePianoReturn {
  const [pressedMidi, setPressedMidi] = useState<Set<number>>(new Set());
  const [recommendMidi, setRecommendMidiState] = useState<Set<number>>(new Set());
  const heldRef = useRef<Set<number>>(new Set());

  const pressKey = useCallback((midi: number) => {
    if (heldRef.current.has(midi)) return;
    heldRef.current.add(midi);
    playNote(midi);
    setPressedMidi(new Set(heldRef.current));
  }, []);

  const releaseKey = useCallback((midi: number) => {
    heldRef.current.delete(midi);
    setPressedMidi(new Set(heldRef.current));
  }, []);

  const playChord = useCallback((notes: number[], duration = 0.8) => {
    notes.forEach((n) => playNote(n, duration));
  }, []);

  const setRecommendMidi = useCallback((midiSet: Set<number>) => {
    setRecommendMidiState(new Set(midiSet));
  }, []);

  const clearRecommendMidi = useCallback(() => {
    setRecommendMidiState(new Set());
  }, []);

  return { pressedMidi, recommendMidi, pressKey, releaseKey, playChord, setRecommendMidi, clearRecommendMidi };
}
