import * as Tone from 'tone';
import { PlaybackQueue } from './structures.js';

let synth = null;
let started = false;
let samplerReady = false;
let _stop = false;

async function ensureStarted() {
  if (started) return;
  await Tone.start();

  const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.28 }).toDestination();

  synth = new Tone.Sampler({
    urls: {
      A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
      A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
      A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
      A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
      A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
      A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
      A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
      A7: "A7.mp3", C8: "C8.mp3",
    },
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    onload: () => { samplerReady = true; },
    volume: -6,
  }).connect(reverb);

  started = true;

  // 샘플 로딩 완료 대기 (최대 8초), 실패 시 PolySynth 폴백
  try {
    await Promise.race([
      Tone.loaded(),
      new Promise(r => setTimeout(r, 8000)),
    ]);
  } catch {
    const fallbackReverb = new Tone.Reverb({ decay: 2.2, wet: 0.3 }).toDestination();
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle8" },
      envelope: { attack: 0.015, decay: 0.3, sustain: 0.4, release: 1.8 },
      volume: -8,
    }).connect(fallbackReverb);
  }
  samplerReady = true;
}

function playChord(notes, duration = "2n") {
  if (!started || !synth || !samplerReady) return;
  try {
    synth.triggerAttackRelease(notes, duration);
  } catch (e) { /* ignore */ }
}

function attackNote(note) {
  if (!started || !synth || !samplerReady) return;
  try { synth.triggerAttack(note); } catch (e) { /* ignore */ }
}

function releaseNote(note) {
  if (!started || !synth || !samplerReady) return;
  try { synth.triggerRelease(note); } catch (e) { /* ignore */ }
}

function playNote(note, duration = "8n") {
  if (!started || !synth || !samplerReady) return;
  try {
    synth.triggerAttackRelease(note, duration);
  } catch (e) { /* ignore */ }
}

async function playProgression(chords, bpm, onIndex) {
  if (!started || !synth || !samplerReady || !chords.length) return;
  _stop = false;

  const queue = new PlaybackQueue();
  queue.enqueueAll(chords.map((chord, i) => ({ chord, index: i })));

  const secondsPerBeat = 60 / bpm;
  const chordDur = secondsPerBeat * 2;

  while (!queue.isEmpty()) {
    if (_stop) { _stop = false; break; }
    const { chord, index } = queue.dequeue();
    if (onIndex) onIndex(index);
    synth.triggerAttackRelease(chord.notes, chordDur * 0.95);
    await new Promise(r => setTimeout(r, chordDur * 1000));
  }
  if (onIndex) onIndex(-1);
}

function stopPlayback() { _stop = true; }

export const AUDIO = { ensureStarted, playChord, attackNote, releaseNote, playNote, playProgression, stopPlayback };
