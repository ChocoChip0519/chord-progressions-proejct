import * as Tone from 'tone';

let synth = null;
let started = false;

async function ensureStarted() {
  if (started) return;
  await Tone.start();
  const reverb = new Tone.Reverb({ decay: 1.6, wet: 0.18 }).toDestination();
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.02, decay: 0.18, sustain: 0.55, release: 0.6 },
    volume: -10,
  }).connect(reverb);
  started = true;
}

function playChord(notes, duration = "2n") {
  if (!started || !synth) return;
  try {
    synth.triggerAttackRelease(notes, duration);
  } catch (e) { /* ignore */ }
}

function playNote(note, duration = "8n") {
  if (!started || !synth) return;
  try {
    synth.triggerAttackRelease(note, duration);
  } catch (e) { /* ignore */ }
}

async function playProgression(chords, bpm, onIndex) {
  if (!started || !synth || !chords.length) return;
  const secondsPerBeat = 60 / bpm;
  const chordDur = secondsPerBeat * 2;
  for (let i = 0; i < chords.length; i++) {
    if (onIndex) onIndex(i);
    synth.triggerAttackRelease(chords[i].notes, chordDur * 0.95);
    await new Promise(r => setTimeout(r, chordDur * 1000));
    if (window.__STOP_PLAYBACK) { window.__STOP_PLAYBACK = false; break; }
  }
  if (onIndex) onIndex(-1);
}

export const AUDIO = { ensureStarted, playChord, playNote, playProgression };
