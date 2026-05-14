import { useRef, useCallback } from 'react'
import * as Tone from 'tone'
import { midiToFreq } from '../lib/music/chordParser'

let synth: Tone.PolySynth | null = null

function getSynth(): Tone.PolySynth {
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 1.2 },
      volume: -8,
    }).toDestination()
  }
  return synth
}

export function usePiano() {
  const activeNotes = useRef<Set<number>>(new Set())

  const pressNote = useCallback((midi: number) => {
    if (activeNotes.current.has(midi)) return
    Tone.start()
    activeNotes.current.add(midi)
    const freq = midiToFreq(midi)
    getSynth().triggerAttack(freq, Tone.now())
  }, [])

  const releaseNote = useCallback((midi: number) => {
    if (!activeNotes.current.has(midi)) return
    activeNotes.current.delete(midi)
    const freq = midiToFreq(midi)
    getSynth().triggerRelease(freq, Tone.now())
  }, [])

  const playChord = useCallback((midiNotes: number[], duration = '2n') => {
    Tone.start()
    const freqs = midiNotes.map(midiToFreq)
    getSynth().triggerAttackRelease(freqs, duration, Tone.now())
  }, [])

  const releaseAll = useCallback(() => {
    activeNotes.current.forEach(midi => {
      getSynth().triggerRelease(midiToFreq(midi), Tone.now())
    })
    activeNotes.current.clear()
  }, [])

  const getPressedMidi = useCallback((): number[] => {
    return [...activeNotes.current]
  }, [])

  return { pressNote, releaseNote, playChord, releaseAll, getPressedMidi, activeNotes }
}
